// ==============================================================================
// 44_BotWhatsApp.gs
// Bot conversacional de WhatsApp (maquina de estados). El router web (doPost)
// vive en 38_Web_Endpoints.gs; aqui solo la logica de conversacion del bot.
// ==============================================================================

// ----- Variables y constantes -----

// =============================================================================
// Bot de WhatsApp "Sweetyuri_jj", router de intenciones: autorizado → admin → bienvenida → menú de categorías; comandos "0" y "9"; avance Fases 9-15. Estado: estuvo conectado a Meta un tiempo; hoy inactivo (sin chip). Código conservado; simularMensajeBot() prueba el flujo sin WhatsApp. [→ Contexto_Base_Web.md §44B001]
// =============================================================================

var BOT_NOMBRE = 'Sweetyuri_jj';

// -----------------------------------------------------------------------
// FASE 10 — NAVEGACIÓN UNIVERSAL ("menú anterior" / "menú principal")
// -----------------------------------------------------------------------
// Pie de texto de los pasos intermedios (informativo): el reconocimiento de "9"/"0" lo hace el interceptor de _procesarMensajeEntrante(), no _matchOpcion(). [→ Contexto_Base_Web.md §44B002]
var PIE_NAVEGACION = '\n\n9️⃣ Volver al menú anterior\n0️⃣ Volver al menú principal';

// Docblock de _categoriasDisponibles(): lee Categoría de la hoja Extra con tres filtros (público/admin, guerra/entrenamiento, Cat_disp); FIX 30-ago-2026: columna Categoría corrida a N..S. [→ Contexto_Base_Web.md §44B003]
var COL_EXTRA_CATEGORIA = 14; // N (antes 12/L — desplazada por Mostrar_S/Mostrar_D)


var CATEGORIAS_PUBLICAS = ['Información sobre mí', 'Información sobre el clan'];

// FASE 9: categorías cuya respuesta depende de estado.tag; si falta y hay más de una cuenta, se pregunta la cuenta en ese momento (ELEGIR_CUENTA_PARA). [→ Contexto_Base_Web.md §44B004]
var CATEGORIAS_QUE_NECESITAN_CUENTA = ['Información sobre mí', 'Información sobre el clan'];

// Nom_Multi y Préstamo son los únicos campos opcionales del registro: se ofrece la opción numerada "No aplica / dejar vacío"; _esRespuestaVacia() la reconoce. [→ Contexto_Base_Web.md §44B005]
var OPCION_VACIA_REGISTRO = 'No aplica / dejar vacío';

// -----------------------------------------------------------------------
// FASE 13/14 — "TORNEOS" (registrar / modificar / consultas) — solo admin
// -----------------------------------------------------------------------
// NOTA DE DEPENDENCIA: el flujo de Torneos usa funciones y constantes de 26_Torneos_Core.gs y 28_Torneos_Docs.gs (_registrarTorneoDesdeBot, _listarTorneosDeHoy, _modificarFechaHoraTorneo, actualizarDocGanadoresTorneo). [→ Contexto_Base_Web.md §44B006]
var TORNEOS_OPCIONES_MENU = [
  'Ingresar link de torneo',
  'Modificar datos de torneo existente',
  'Obtener lista de participantes calificados',
  'Obtener lista de ganadores'
];

// FUENTES_CONTENIDO: hoy solo Mensajes, leída en vivo con csv de respaldo (24-sep-2026); prioridad de búsqueda: índice de contenido → Mensajes. [→ Contexto_Base_Web.md §44B007]
var FUENTES_CONTENIDO = [
  { sheet: CFG.SHEETS.MENSAJES,   colCategoria: 8, colSubcategoria: 10, colClan: 12, colContenido: 15, totalCols: 15, csv: 'Backup_Mensajes.csv' },
];

// ----- Funciones manuales / punto de entrada -----

// =============================================================================
// NOTA DE REORDEN 23-ago-2026: simularMensajeBot() se movió arriba, junto a doPost() (funciones manuales juntas). [→ Contexto_Base_Web.md §44B008]
// =============================================================================
// -----------------------------------------------------------------------
// SIMULADOR (úsalo ahora, sin WhatsApp)
// -----------------------------------------------------------------------
// simularMensajeBot(): ejecutar desde el editor cambiando TELEFONO_PRUEBA y TEXTO_PRUEBA; el resultado sale en el Logger. [→ Contexto_Base_Web.md §44B009]
function simularMensajeBot() {
  var TELEFONO_PRUEBA = '51XXXXXXXXX';
  var TEXTO_PRUEBA = 'hola';
  var resultado = _procesarMensajeEntrante(TELEFONO_PRUEBA, TEXTO_PRUEBA);
  var esObjeto  = resultado && typeof resultado === 'object' && typeof resultado.texto !== 'undefined';
  var texto     = esObjeto ? resultado.texto : resultado;
  var opciones  = esObjeto ? resultado.opciones : null;
  Logger.log('--- Respuesta del bot ---\n' + texto);
  if (opciones) Logger.log('--- Opciones (' + opciones.length + ') ---\n' + JSON.stringify(opciones));
}

// ----- Funciones internas / helpers -----

// _extraerMensajeMeta(body): saca {telefono, texto} del payload de Cloud API (tipos text e interactive). [→ Contexto_Base_Web.md §44B010]
function _extraerMensajeMeta(body) {
  try {
    var value = body.entry[0].changes[0].value;
    var m = value.messages && value.messages[0];
    if (!m) return null;

    if (m.type === 'text') {
      return { telefono: m.from, texto: m.text.body };
    }
    if (m.type === 'interactive' && m.interactive) {
      if (m.interactive.type === 'button_reply') {
        return { telefono: m.from, texto: m.interactive.button_reply.id };
      }
      if (m.interactive.type === 'list_reply') {
        return { telefono: m.from, texto: m.interactive.list_reply.id };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// _evitarAutoLinkWsp(texto): FASE 01/08/2026; evita que WhatsApp autoenlace textos que parecen dominios (ej. "drax_tv.sv"). [→ Contexto_Base_Web.md §44B011]
function _evitarAutoLinkWsp(texto) {
  if (texto === null || texto === undefined) return texto;
  return String(texto).replace(/\b([A-Za-z0-9_-]+)\.([A-Za-z]{2,24})\b/g, function (match, base, tld, offset, full) {
    var antes = full.substring(Math.max(0, offset - 8), offset);
    if (/(https?:\/\/|www\.)$/i.test(antes)) return match; // no tocar enlaces reales
    return base + '\u200B.' + tld;
  });
}

// _sanitizarPayloadWsp(payload): aplica _evitarAutoLinkWsp() a los campos de texto visibles; se llama una vez desde _postWhatsApp(). [→ Contexto_Base_Web.md §44B012]
function _sanitizarPayloadWsp(payload) {
  if (payload.text && payload.text.body) {
    payload.text.body = _evitarAutoLinkWsp(payload.text.body);
  }
  if (payload.interactive) {
    if (payload.interactive.body && payload.interactive.body.text) {
      payload.interactive.body.text = _evitarAutoLinkWsp(payload.interactive.body.text);
    }
    if (payload.interactive.action && payload.interactive.action.buttons) {
      payload.interactive.action.buttons.forEach(function (b) {
        if (b.reply && b.reply.title) b.reply.title = _evitarAutoLinkWsp(b.reply.title);
      });
    }
    if (payload.interactive.action && payload.interactive.action.sections) {
      payload.interactive.action.sections.forEach(function (sec) {
        (sec.rows || []).forEach(function (r) {
          if (r.title) r.title = _evitarAutoLinkWsp(r.title);
        });
      });
    }
  }
  return payload;
}

// _postWhatsApp(payload, descripcionLog): POST real a la Cloud API, compartido por texto, botones y lista. [→ Contexto_Base_Web.md §44B013]
function _postWhatsApp(payload, descripcionLog) {
  payload = _sanitizarPayloadWsp(payload);

  var props    = PropertiesService.getScriptProperties();
  var token    = props.getProperty('WHATSAPP_TOKEN');
  var phoneId  = props.getProperty('WHATSAPP_PHONE_ID');

  if (!token || !phoneId) {
    Logger.log('[Bot] Falta WHATSAPP_TOKEN o WHATSAPP_PHONE_ID en Script Properties. ' +
      'No se envió nada (' + descripcionLog + ').');
    return;
  }

  var url = 'https://graph.facebook.com/v20.0/' + phoneId + '/messages';
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // para poder loguear el error de Meta en vez de que Apps Script tire una excepción genérica
  };

  var resp = UrlFetchApp.fetch(url, options);
  var codigo = resp.getResponseCode();
  if (codigo >= 200 && codigo < 300) {
    Logger.log('[Bot:salida -> ' + payload.to + '] ' + descripcionLog);
  } else {
    Logger.log('[Bot] Error enviando WhatsApp (HTTP ' + codigo + '): ' + resp.getContentText());
  }
}

/** Mensaje de texto plano, sin botones ni lista. */
function _enviarMensajeWhatsApp(telefono, texto) {
  _postWhatsApp({
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'text',
    text: { body: texto }
  }, texto);
}

/** Mensaje con hasta 3 botones. WhatsApp exige título de botón <= 20 caracteres. */
function _enviarMensajeBotones(telefono, texto, opciones) {
  var botones = opciones.slice(0, 3).map(function(o) {
    return { type: 'reply', reply: { id: String(o.id), title: _truncarTitulo(o.titulo, 20) } };
  });
  _postWhatsApp({
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: texto },
      action: { buttons: botones }
    }
  }, texto + ' [botones: ' + botones.length + ']');
}

/** Mensaje con lista desplegable, hasta 10 filas. Título de fila <= 24 caracteres. */
function _enviarMensajeLista(telefono, texto, opciones) {
  var filas = opciones.slice(0, 10).map(function(o) {
    return { id: String(o.id), title: _truncarTitulo(o.titulo, 24) };
  });
  _postWhatsApp({
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: texto },
      action: {
        button: 'Ver opciones',
        sections: [ { title: 'Opciones', rows: filas } ]
      }
    }
  }, texto + ' [lista: ' + filas.length + ']');
}

function _truncarTitulo(str, max) {
  str = String(str || '');
  if (str.length <= max) return str;
  return str.substring(0, max - 1) + '…';
}

// _enviarRespuestaBot(telefono, resultado): despachador único de doPost(); string → texto; {texto, opciones}: ≤3 botones, 4-10 lista, 11+ texto numerado. [→ Contexto_Base_Web.md §44B014]
function _enviarRespuestaBot(telefono, resultado) {
  var esObjeto = resultado && typeof resultado === 'object' && typeof resultado.texto !== 'undefined';
  var texto    = esObjeto ? resultado.texto : resultado;
  var opciones = esObjeto ? resultado.opciones : null;

  if (!opciones || opciones.length === 0) {
    _enviarMensajeWhatsApp(telefono, texto);
  } else if (opciones.length <= 3) {
    _enviarMensajeBotones(telefono, texto, opciones);
  } else if (opciones.length <= 10) {
    _enviarMensajeLista(telefono, texto, opciones);
  } else {
    _enviarMensajeWhatsApp(telefono, texto); // 11+: solo entrada manual, como antes
  }
}

// -----------------------------------------------------------------------
// Opciones interactivas: puente entre las listas de datos y el formato {id, titulo}; el id es el número de orden, igual que lo interpreta _matchOpcion. [→ Contexto_Base_Web.md §44B015]
// -----------------------------------------------------------------------
function _opcionesDesdeCuentas(cuentas) {
  return cuentas.map(function(c, i) {
    return { id: String(i + 1), titulo: c.tag + ' (' + c.nombre + ')' };
  });
}

function _opcionesDesdeCategorias(categorias) {
  return categorias.map(function(c, i) {
    return { id: String(i + 1), titulo: c };
  });
}

function _opcionesDesdeClanContenido(opciones) {
  return opciones.map(function(o, i) {
    return { id: String(i + 1), titulo: o.etiqueta };
  });
}

function _opcionesDesdeClanInfo(opciones) {
  return opciones.map(function(o, i) {
    return { id: String(i + 1), titulo: o.nombre };
  });
}

/** Envuelve un texto de pregunta junto con sus opciones seleccionables. */
function _conOpciones(texto, opciones) {
  return { texto: texto, opciones: opciones };
}

// _avanzarEstado(): como _setEstadoUsuario() pero guarda `previo` para que el comando "9" (volver) reconstruya el paso anterior. [→ Contexto_Base_Web.md §44B016]
function _avanzarEstado(telefono, estadoNuevo, estadoActualParaVolver) {
  estadoNuevo.previo = estadoActualParaVolver || null;
  _setEstadoUsuario(telefono, estadoNuevo);
  return estadoNuevo;
}

// _reconstruirMensajeDePaso(): devuelve el mensaje mostrado al llegar a un paso; lo usa el comando "9". [→ Contexto_Base_Web.md §44B017]
function _reconstruirMensajeDePaso(telefono, estadoDestino) {
  switch (estadoDestino.paso) {
    case 'ELEGIR_CATEGORIA':
      return _conOpciones(_msgElegirCategoria(estadoDestino.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estadoDestino.esAdmin, telefono)));
    case 'ELEGIR_CUENTA_PARA':
      var cuentasR = _getCuentasPorTelefono(telefono, estadoDestino.esAdmin);
      return _conOpciones(_msgElegirCuenta(cuentasR), _opcionesDesdeCuentas(cuentasR));
    case 'ELEGIR_CLAN_CONTENIDO':
      return _conOpciones(_msgElegirOpcionClan(estadoDestino.opciones), _opcionesDesdeClanContenido(estadoDestino.opciones));
    case 'ELEGIR_CLAN_INFO':
      return _conOpciones(_msgElegirClanInfo(estadoDestino.opcionesClan), _opcionesDesdeClanInfo(estadoDestino.opcionesClan));
    case 'GESTION_ACCION':
      return _conOpciones(_msgGestionAccion(), _opcionesDesdeGestionAccion());
    case 'GESTION_CLAN':
      return _conOpciones(_msgElegirClanInfo(estadoDestino.opcionesClan), _opcionesDesdeClanInfo(estadoDestino.opcionesClan));
    case 'GESTION_MIEMBRO':
      return _msgGestionElegirMiembro(estadoDestino.miembros);
    case 'GESTION_PREFIJO':
      return _msgRegistrarPedirPrefijo();
    case 'GESTION_CELULAR':
      return _msgRegistrarPedirCelular();
    case 'GESTION_NOMMULTI':
      return _msgGestionPedirNomMulti();
    case 'GESTION_PRESTAMO':
      return _msgRegistrarPedirPrestamo();
    case 'TORNEOS_MENU':
      return _conOpciones(_msgTorneosMenu(), _opcionesDesdeTorneosMenu());
    case 'TORNEOS_LINK_LINK':
      return _msgTorneosPedirLink();
    case 'TORNEOS_LINK_FECHA':
      return _msgTorneosPedirFecha();
    case 'TORNEOS_LINK_HORA':
      return _msgTorneosPedirHora();
    case 'TORNEOS_MOD_LISTA':
      return _conOpciones(_msgTorneosListaHoy(estadoDestino.torneosHoy), _opcionesDesdeTorneosHoy(estadoDestino.torneosHoy));
    case 'TORNEOS_MOD_FECHA':
      return _msgTorneosPedirFecha();
    case 'TORNEOS_MOD_HORA':
      return _msgTorneosPedirHora();
    default:
      return _conOpciones(_msgElegirCategoria(estadoDestino.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estadoDestino.esAdmin, telefono)));
  }
}

// -----------------------------------------------------------------------
// ROUTER PRINCIPAL (la lógica del diagrama, 100% independiente de WhatsApp)
// -----------------------------------------------------------------------
// _procesarMensajeEntrante(telefono, texto): router (autorizado → admin → bienvenida → menú → respuesta); estado de varios turnos en PropertiesService; no envía nada por sí mismo. [→ Contexto_Base_Web.md §44B018]
function _procesarMensajeEntrante(telefono, texto) {
  var autorizado = _esUsuarioAutorizado(telefono);
  if (!autorizado) {
    return _msgRestriccion(); // Mensaje 3
  }

  var esAdmin = _esAdministrador(telefono);
  var estado = _getEstadoUsuario(telefono);

  // --- FASE 10: comandos reservados de navegación (antes que cualquier
  // otra lógica de paso, incluidos los guards de "cancelar"). ---
  if (estado) {
    var comando = String(texto || '').trim().toLowerCase();
    if (comando === '0' || comando === 'menu' || comando === 'inicio') {
      var estadoMenu = { paso: 'ELEGIR_CATEGORIA', esAdmin: esAdmin, tag: estado.tag };
      _setEstadoUsuario(telefono, estadoMenu);
      return _conOpciones(_msgElegirCategoria(esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(esAdmin, telefono)));
    }
    if (comando === '9' || comando === 'atras' || comando === 'volver') {
      var destino = estado.previo || { paso: 'ELEGIR_CATEGORIA', esAdmin: esAdmin, tag: estado.tag };
      _setEstadoUsuario(telefono, destino);
      return _reconstruirMensajeDePaso(telefono, destino);
    }
  }

  // --- FASE 9: primer mensaje ("hola" o sin conversación en curso) va
  // SIEMPRE directo al menú de categorías, sin preguntar la cuenta. ---
  if (!estado || texto.toLowerCase() === 'hola') {
    var cuentas = _getCuentasPorTelefono(telefono, esAdmin);
    // Si solo hay 1 cuenta, se preselecciona; si hay varias, queda sin
    // definir y se pedirá más adelante solo si la categoría lo necesita
    // (ver _iniciarRespuestaCategoria / paso ELEGIR_CUENTA_PARA).
    var tagUnico = cuentas.length === 1 ? cuentas[0].tag : null;
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: esAdmin, tag: tagUnico });
    return _conOpciones(_msgBienvenida(esAdmin, telefono) + '\n\n' + _msgElegirCategoria(esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(esAdmin, telefono)));
  }

  // --- FASE 9: paso nuevo, se pregunta la cuenta solo cuando la categoría
  // elegida la necesita y todavía no se sabe cuál es. ---
  if (estado.paso === 'ELEGIR_CUENTA_PARA') {
    var cuentasDisp2 = _getCuentasPorTelefono(telefono, estado.esAdmin);
    var elegida2 = _matchOpcion(texto, cuentasDisp2.map(function(c){ return c.tag; }));
    if (!elegida2) return _conOpciones(_msgElegirCuenta(cuentasDisp2), _opcionesDesdeCuentas(cuentasDisp2));
    var estadoConTag = { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: elegida2 };
    _setEstadoUsuario(telefono, estadoConTag);
    return _iniciarRespuestaCategoria(telefono, estado.categoriaObjetivo, estadoConTag);
  }

  if (estado.paso === 'ELEGIR_CATEGORIA') {
    var categorias = _categoriasDisponibles(estado.esAdmin, telefono);
    var catElegida = _matchOpcion(texto, categorias);
    if (!catElegida) return _conOpciones(_msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(categorias)); // no entendió, repite opciones
    return _iniciarRespuestaCategoria(telefono, catElegida, estado);
  }

  if (estado.paso === 'ELEGIR_CLAN_CONTENIDO') {
    var etiquetas = estado.opciones.map(function(o) { return o.etiqueta; });
    var etiquetaElegida = _matchOpcion(texto, etiquetas);
    if (!etiquetaElegida) return _conOpciones(_msgElegirOpcionClan(estado.opciones), _opcionesDesdeClanContenido(estado.opciones));
    var opcionElegida = estado.opciones.filter(function(o) { return o.etiqueta === etiquetaElegida; })[0];
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    return opcionElegida.contenido;
  }

  if (estado.paso === 'ELEGIR_CLAN_INFO') {
    // Solo admin llega aquí (ver _iniciarRespuestaCategoria).
    // opcionesClan = [{tag, nombre}]; el usuario responde con número o nombre.
    var nombresOpciones = estado.opcionesClan.map(function(o) { return o.nombre; });
    var nombreElegido = _matchOpcion(texto, nombresOpciones);
    if (!nombreElegido) return _conOpciones(_msgElegirClanInfo(estado.opcionesClan), _opcionesDesdeClanInfo(estado.opcionesClan));
    var clanElegido = estado.opcionesClan.filter(function(o) { return o.nombre === nombreElegido; })[0];
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    return _respuestaInfoClanPorTag(clanElegido.tag);
  }

  // FASE 12 — "Gestionar información de miembros": flujo de varios turnos,
  // exclusivo de admin. En cualquier paso GESTION_*, el admin puede escribir
  // "cancelar" para abortar y volver al menú de categorías.
  if (String(estado.paso || '').indexOf('GESTION_') === 0) {
    if (String(texto || '').trim().toLowerCase() === 'cancelar') {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _conOpciones('❌ Gestión cancelada.\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
    }
    return _procesarPasoGestion(telefono, estado, texto);
  }

  // FASE 13/14 — "Torneos": flujo de varios turnos, exclusivo de admin.
  if (String(estado.paso || '').indexOf('TORNEOS_') === 0) {
    if (String(texto || '').trim().toLowerCase() === 'cancelar') {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _conOpciones('❌ Cancelado.\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
    }
    return _procesarPasoTorneos(telefono, estado, texto);
  }

  // Estado desconocido/corrupto: reinicia.
  _clearEstadoUsuario(telefono);
  return _conOpciones(_msgBienvenida(esAdmin, telefono) + '\n\n' + _msgElegirCategoria(esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(esAdmin, telefono)));
}

// -----------------------------------------------------------------------
// ESTADO DE CONVERSACIÓN (multi-turno, por teléfono)
// -----------------------------------------------------------------------
function _getEstadoUsuario(telefono) {
  var raw = PropertiesService.getScriptProperties().getProperty('bot_estado_' + telefono);
  return raw ? JSON.parse(raw) : null;
}

function _setEstadoUsuario(telefono, estado) {
  PropertiesService.getScriptProperties().setProperty('bot_estado_' + telefono, JSON.stringify(estado));
}

function _clearEstadoUsuario(telefono) {
  PropertiesService.getScriptProperties().deleteProperty('bot_estado_' + telefono);
}

// -----------------------------------------------------------------------
// AUTORIZACIÓN
// -----------------------------------------------------------------------
// _getFilasDirectorioPorTelefono(): lee Directorio una vez y devuelve las cuentas cuyo Celular coincide (solo dígitos); base de autorización, admin y lista de cuentas. [→ Contexto_Base_Web.md §44B019]
function _getFilasDirectorioPorTelefono(telefono) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return [];

  var telLimpio = soloDigitos(telefono);
  var lastRow = sh.getLastRow();
  var data = sh.getRange(2, 1, lastRow - 1, DIR_SHEET_COLS).getValues();
  var filas = [];
  for (var i = 0; i < data.length; i++) {
    // El teléfono se guarda en Prefijo + Celular; el mensaje entrante trae el número completo, por eso se compara contra Prefijo+Celular y también solo contra Celular. [→ Contexto_Base_Web.md §44B020]
    var prefijoCelda  = soloDigitos(data[i][IC.PREFIJO - 1]);
    var celCelda      = soloDigitos(data[i][IC.CELULAR - 1]);
    var completoCelda = prefijoCelda + celCelda;
    var coincide = (celCelda && celCelda === telLimpio) ||
                   (completoCelda && completoCelda === telLimpio);
    if (coincide) {
      filas.push({
        tag:       String(data[i][IC.TAG - 1]       || ''),
        nombre:    String(data[i][IC.NOMBRE - 1]    || ''),
        estado:    String(data[i][IC.ESTADO - 1]    || '').trim(),
        admin:     String(data[i][IC.ADMIN - 1]     || '').trim(),
        nom_multi: String(data[i][IC.NOM_MULTI - 1] || '').trim()
      });
    }
  }
  return filas;
}

// _esUsuarioAutorizado(): autorizado si hay una cuenta Activa o una con Admin="Sí" (aunque esté Inactiva) con ese Celular. [→ Contexto_Base_Web.md §44B021]
function _esUsuarioAutorizado(telefono) {
  var filas = _getFilasDirectorioPorTelefono(telefono);
  for (var i = 0; i < filas.length; i++) {
    if (filas[i].estado === 'Activo' || filas[i].admin === 'Sí') return true;
  }
  return false;
}

// _esAdministrador(): admin si alguna fila con ese Celular tiene Admin="Sí", sin importar su Estado. [→ Contexto_Base_Web.md §44B022]
function _esAdministrador(telefono) {
  var filas = _getFilasDirectorioPorTelefono(telefono);
  for (var i = 0; i < filas.length; i++) {
    if (filas[i].admin === 'Sí') return true;
  }
  return false;
}

// _getCuentasPorTelefono(): cuentas de ese celular; si no es admin, solo las Activas. [→ Contexto_Base_Web.md §44B023]
function _getCuentasPorTelefono(telefono, esAdmin) {
  var filas = _getFilasDirectorioPorTelefono(telefono);
  if (esAdmin) return filas;
  return filas.filter(function(f) { return f.estado === 'Activo'; });
}

// -----------------------------------------------------------------------
// TEXTOS / MENSAJES (Mensaje 1, 2, 3 del diagrama)
// -----------------------------------------------------------------------
function _msgRestriccion() { // Mensaje 3
  return '🚫 No tienes acceso a ' + BOT_NOMBRE + '. 😶\nSi crees que es un error, contacta a un administrador del clan.';
}

// _msgBienvenida(esAdmin, telefono): no-admin mensaje simple; admin plantilla completa (clanes a cargo, cuentas fuera de la comunidad, estado del día). [→ Contexto_Base_Web.md §44B024]
function _msgBienvenida(esAdmin, telefono) {
  if (!esAdmin) {
    var ctx = _getCtx();
    var estadoDia = ctx.esDiaGuerra ? 'Guerra' : 'Entrenamiento';
    // Obtener nombre del jugador para el saludo
    var filas = _getFilasDirectorioPorTelefono(telefono);
    var nombre = '';
    for (var i = 0; i < filas.length; i++) {
      var nm = String(filas[i].nom_multi || '').trim();
      if (nm) { nombre = nm; break; }
    }
    if (!nombre && filas.length > 0) nombre = String(filas[0].nombre || '').trim();
    if (!nombre) nombre = 'Jugador';

    return '👋 ¡Hola! Soy ' + BOT_NOMBRE + ', tu asistente del clan.\n\n' +
      '✨ Bienvenid@, ' + nombre + ' 🦙\n' +
      'al Sistema de Gestión de Clanes de la ᴳ乂ᵀ 🌟 Familia Terna\n\n' +
      '📋 Estado del día:\n' +
      'Hoy corresponde ' + estadoDia + '.\n\n' +
      'Tu esfuerzo marca la diferencia. 💜⚔️';
  }
  return _msgBienvenidaAdmin(telefono);
}

// _getFilasCompletasDirectorioPorTelefono(): como la anterior pero devuelve la fila COMPLETA de Directorio (para la bienvenida de admin). [→ Contexto_Base_Web.md §44B025]
function _getFilasCompletasDirectorioPorTelefono(telefono) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return [];

  var telLimpio = soloDigitos(telefono);
  var lastRow = sh.getLastRow();
  var data = sh.getRange(2, 1, lastRow - 1, DIR_SHEET_COLS).getValues();
  var filas = [];
  for (var i = 0; i < data.length; i++) {
    // Fase C3 (16/07/2026): Prefijo/Celular siguen físicamente en Directorio
    // (29 cols, orden IC) — se indexa con IC.
    var prefijoCelda  = soloDigitos(data[i][IC.PREFIJO - 1]);
    var celCelda      = soloDigitos(data[i][IC.CELULAR - 1]);
    var completoCelda = prefijoCelda + celCelda;
    var coincide = (celCelda && celCelda === telLimpio) ||
                   (completoCelda && completoCelda === telLimpio);
    if (coincide) filas.push(data[i]);
  }
  return filas;
}

// _msgBienvenidaAdmin(telefono): arma el mensaje 1 de admin según la plantilla y la regla de "dentro de la comunidad". [→ Contexto_Base_Web.md §44B026]
function _msgBienvenidaAdmin(telefono) {
  var filas = _getFilasCompletasDirectorioPorTelefono(telefono);

  // [Nombre del Administrador]: Nom_Multi de cualquiera de sus cuentas, o el Nombre de la primera; Fase C3 (16/07/2026): columnas indexadas con IC. [→ Contexto_Base_Web.md §44B027]
  var nombreAdmin = '';
  for (var n = 0; n < filas.length; n++) {
    var nomMultiFila = String(filas[n][IC.NOM_MULTI - 1] || '').trim();
    if (nomMultiFila) { nombreAdmin = nomMultiFila; break; }
  }
  if (!nombreAdmin && filas.length > 0) nombreAdmin = String(filas[0][IC.NOMBRE - 1] || '').trim();
  if (!nombreAdmin) nombreAdmin = 'Administrador';

  // Agrupar por Clan todas las cuentas no vetadas del admin (ver criterio
  // "dentroComunidad" más abajo).
  var clanesPorTag = {}; // clanTag (o 'SIN_CLAN') -> { nombre, cuentas: [{nombre, rango}] }
  var fueraComunidad = []; // [{nombre, estado}]

  for (var i = 0; i < filas.length; i++) {
    var fila = filas[i];
    var clanTagFila = String(fila[IC.CLAN_TAG - 1] || '').trim();
    var nombreCuenta = String(fila[IC.NOMBRE - 1] || '').trim();
    var vetadoFila = String(fila[IC.VETADO - 1] || '').trim().toLowerCase();
    var esVetado = (vetadoFila === 'sí' || vetadoFila === 'si') || (clanTagFila === CFG.VETADO_TAG);

    // Todas las filas de este teléfono ya son admin (ver nota arriba): solo
    // se excluye de "dentro de la comunidad" si está vetada o en el clan
    // vetado.
    var dentroComunidad = !esVetado;

    if (dentroComunidad) {
      var claveClan = clanTagFila || 'SIN_CLAN';
      if (!clanesPorTag[claveClan]) {
        var nombreClanFila = String(fila[IC.CLAN - 1] || '').trim();
        clanesPorTag[claveClan] = { nombre: nombreClanFila || 'Sin clan', cuentas: [] };
      }
      clanesPorTag[claveClan].cuentas.push({
        nombre: nombreCuenta,
        rango: String(fila[IC.RANGO - 1] || 'Miembro')
      });
    } else {
      // dentroComunidad es siempre !esVetado en este punto, así que llegar
      // aquí significa que la cuenta está vetada.
      fueraComunidad.push({ nombre: nombreCuenta, estado: 'Vetado' });
    }
  }

  // Orden de clanes: primero los oficiales en el orden de CFG.TERNA_TAGS,
  // luego cualquier otro clan/"Sin clan" que haya quedado (cuentas inactivas
  // sin clan vigente o en clanes fuera de la comunidad oficial), en el orden
  // en que aparecieron.
  var clavesYaUsadas = {};
  var clanesOrdenados = [];
  for (var t = 0; t < CFG.TERNA_TAGS.length; t++) {
    var ctTag = CFG.TERNA_TAGS[t];
    if (clanesPorTag[ctTag]) { clanesOrdenados.push(clanesPorTag[ctTag]); clavesYaUsadas[ctTag] = true; }
  }
  for (var claveResto in clanesPorTag) {
    if (!clavesYaUsadas[claveResto]) clanesOrdenados.push(clanesPorTag[claveResto]);
  }

  var bloques = [];
  for (var c = 0; c < clanesOrdenados.length; c++) {
    var clanInfo = clanesOrdenados[c];
    clanInfo.cuentas.sort(function(a, b) {
      var rA = CFG.RANGO_ORDEN[a.rango.toLowerCase().replace('í', 'i')] || 4;
      var rB = CFG.RANGO_ORDEN[b.rango.toLowerCase().replace('í', 'i')] || 4;
      if (rA !== rB) return rA - rB;
      return a.nombre.localeCompare(b.nombre, 'es');
    });
    var lineasCuentas = clanInfo.cuentas.map(function(cu) { return '• ' + cu.nombre + ' — ' + cu.rango; }).join('\n');
    bloques.push('🍀 ' + clanInfo.nombre + '\n\n' + lineasCuentas);
  }

  if (fueraComunidad.length > 0) {
    var lineasFuera = fueraComunidad.map(function(f) { return '• ' + f.nombre + ' — ' + f.estado; }).join('\n');
    bloques.push('📌 Cuentas fuera de la comunidad (si aplica)\n\n' + lineasFuera);
  }

  var ctx = _getCtx();
  var estadoDia = ctx.esDiaGuerra ? 'Guerra' : 'Entrenamiento';

  var texto = '👋 ¡Hola! Soy ' + BOT_NOMBRE + ', tu asistente del clan.\n\n' +
    '✨ Bienvenid@, ' + nombreAdmin + ' 🦙\n' +
    'al Sistema de Gestión de Clanes de la ᴳ乂ᵀ 🌟 Familia Terna\n\n' +
    'Actualmente tienes a tu cargo:\n\n' +
    bloques.join('\n\n') +
    (bloques.length > 0 ? '\n\n' : '') +
    '📋 Estado del día:\n' +
    'Hoy corresponde ' + estadoDia + '.\n' +
    'Tu liderazgo marca la diferencia. 💜⚔️';

  return texto;
}

// _digitosAEmojis(numero): 1-10 emojis estándar; 11+ un emoji por cada dígito. [→ Contexto_Base_Web.md §44B028]
function _digitosAEmojis(numero) {
  var emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  var emojisEspeciales = ['🔟', '1️⃣1️⃣', '1️⃣2️⃣', '1️⃣3️⃣', '1️⃣4️⃣', '1️⃣5️⃣', '1️⃣6️⃣', '1️⃣7️⃣', '1️⃣8️⃣', '1️⃣9️⃣'];

  if (numero >= 1 && numero <= 10) {
    return emojis[numero];
  }
  if (numero >= 11 && numero <= 19) {
    return emojisEspeciales[numero - 9];
  }

  // Para 20+: construir dígito por dígito
  var str = String(numero);
  return str.split('').map(function(d) { return emojis[parseInt(d, 10)]; }).join('');
}

function _msgElegirCuenta(cuentas) {
  var lineas = cuentas.map(function(c, i) {
    var emoji = _digitosAEmojis(i + 1);
    return emoji + ' ' + c.tag + ' (' + c.nombre + ')';
  });
  return 'He detectado que tienes ' + cuentas.length + ' cuentas en la ᴳ乂ᵀ 🌟 Familia Terna.\nSelecciona respondiendo con el número de la cuenta:\n' + lineas.join('\n') + PIE_NAVEGACION;
}

function _leerCategoriasDeExtra() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!sh || sh.getLastRow() < 2) return [];

  var numFilas = sh.getLastRow() - 1;
  var valores = sh.getRange(2, COL_EXTRA_CATEGORIA, numFilas, 1).getValues();
  var categorias = [];
  for (var i = 0; i < valores.length; i++) {
    var v = String(valores[i][0] || '').trim();
    if (v) categorias.push(v);
  }
  return categorias;
}

// _catDispDeTelefono(telefono): NUEVO 19-sep-2026; Cat_disp del admin dueño del Celular (hoja Administradores) como lista, parseada con _webPermisosParsearLista(). [→ Contexto_Base_Web.md §44B029]
var _catDispCacheTelefono = {};
function _catDispDeTelefono(telefono) {
  var celularNorm = soloDigitos(telefono);
  if (Object.prototype.hasOwnProperty.call(_catDispCacheTelefono, celularNorm)) {
    return _catDispCacheTelefono[celularNorm];
  }
  var resultado = [];
  try {
    var ss = _getSs();
    var shAdm = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);
    if (shAdm && shAdm.getLastRow() >= 2) {
      var lastRow = shAdm.getLastRow();
      var data = shAdm.getRange(2, 1, lastRow - 1, ADMINISTRADORES_TOTAL_COLS).getValues();
      for (var i = 0; i < data.length; i++) {
        if (soloDigitos(data[i][AC.CELULAR - 1]) === celularNorm) {
          var texto = String(data[i][AC.CAT_DISP - 1] || '').trim();
          resultado = (texto === WEB_PERMISOS_SIN_NADA) ? [WEB_PERMISOS_SIN_NADA] : _webPermisosParsearLista(texto);
          break;
        }
      }
    }
  } catch (e) {
    // Si algo falla leyendo Administradores, no vale la pena tumbar el
    // menú del bot por esto: se cae a "sin restricción" (comportamiento
    // de siempre).
    Logger.log('[Bot] No se pudo leer Cat_disp para filtrar categorías (' + e.message + '), se muestran todas.');
    resultado = [];
  }
  _catDispCacheTelefono[celularNorm] = resultado;
  return resultado;
}

// _categoriasDisponibles(esAdmin, telefono): ACTUALIZACIÓN 19-sep-2026; filtra por Cat_disp del admin; las categorías públicas nunca se ocultan; sin teléfono o sin Cat_disp no filtra. [→ Contexto_Base_Web.md §44B030]
function _categoriasDisponibles(esAdmin, telefono) {
  var todas = _leerCategoriasDeExtra();
  var ctx = _getCtx();

  var filtradasPorPeriodo = todas.filter(function(c) {
    if (ctx.esDiaGuerra && c === 'Defensas de barcos') return false;
    if (!ctx.esDiaGuerra && (c === 'Día de guerra' || c === 'Mensaje de Guerra')) return false;
    return true;
  });

  if (!esAdmin) {
    return filtradasPorPeriodo.filter(function(c) { return CATEGORIAS_PUBLICAS.indexOf(c) >= 0; });
  }

  var catDisp = telefono ? _catDispDeTelefono(telefono) : [];
  if (catDisp.length === 0) return filtradasPorPeriodo; // sin Cat_disp guardada: sin restricción, como siempre.

  // FIX 19-sep-2026: Cat_disp es solo de accesos a contenido de Menú; no gobierna Torneos, Sorteos ni Gestionar información de miembros (se eximen como las públicas); reusa WEB_CATEGORIAS_SIN_CONTENIDO_PLANO. [→ Contexto_Base_Web.md §44B031]
  return filtradasPorPeriodo.filter(function(c) {
    return CATEGORIAS_PUBLICAS.indexOf(c) >= 0 ||
           WEB_CATEGORIAS_SIN_CONTENIDO_PLANO.indexOf(c) >= 0 ||
           catDisp.indexOf(c) >= 0;
  });
}

function _msgElegirCategoria(esAdmin, telefono) {
  var categorias = _categoriasDisponibles(esAdmin, telefono);
  var lineas = categorias.map(function(c, i) {
    var emoji = _digitosAEmojis(i + 1);
    return emoji + ' ' + c;
  });
  return '¿Qué información necesitas? Responde con el número de tu opción:\n' + lineas.join('\n');
}

// _matchOpcion(texto, opciones): matching en 3 intentos: número, inicio de opción, substring. [→ Contexto_Base_Web.md §44B032]
function _matchOpcion(texto, opciones) {
  var t = String(texto || '').trim();

  // INTENTO 1: ¿Es un número válido (1, 2, 3, ...)?
  var idx = parseInt(t, 10);
  if (!isNaN(idx) && idx >= 1 && idx <= opciones.length) {
    return opciones[idx - 1];
  }

  var tLower = t.toLowerCase();

  // INTENTO 2: ¿Coincide con el inicio de alguna opción?
  for (var i = 0; i < opciones.length; i++) {
    if (String(opciones[i]).toLowerCase().indexOf(tLower) === 0) {
      return opciones[i];
    }
  }

  // INTENTO 3: ¿La opción contiene el texto como substring?
  for (var i = 0; i < opciones.length; i++) {
    if (String(opciones[i]).toLowerCase().indexOf(tLower) >= 0) {
      return opciones[i];
    }
  }

  return null;
}

// -----------------------------------------------------------------------
// RESPUESTAS POR CATEGORÍA
// -----------------------------------------------------------------------
// Helper para leer un Google Doc de Plantillas como texto; FASE 01/08/2026: busca primero por ID y luego por nombre en la raíz y las 5 subcarpetas (reutilizable en Torneos y Sorteos). [→ Contexto_Base_Web.md §44B033]
function _leerSeccionDocDrive(nombreDoc, encabezado, idDoc) {
  try {
    var archivo = _buscarArchivoEnPlantillas(nombreDoc, idDoc);
    if (!archivo) return '⚠️ No encontré el documento "' + nombreDoc + '".';
    var doc = DocumentApp.openById(archivo.getId());
    return doc.getBody().getText(); // o recortar desde `encabezado` en adelante si el doc trae más secciones
  } catch (e) {
    return '⚠️ No pude leer el documento: ' + e.message;
  }
}

// _iniciarRespuestaCategoria(): lógica propia para Información sobre mí/el clan; flujos propios para Gestionar, Torneos y Sorteos; el resto usa índice de contenido + Mensajes. [→ Contexto_Base_Web.md §44B034]
function _iniciarRespuestaCategoria(telefono, categoria, estado) {
  // FASE 9: si la categoría necesita la cuenta y todavía no se sabe cuál
  // es, se pregunta recién ahora (no desde el primer mensaje).
  if (!estado.tag && CATEGORIAS_QUE_NECESITAN_CUENTA.indexOf(categoria) >= 0) {
    var cuentasNecesarias = _getCuentasPorTelefono(telefono, estado.esAdmin);
    if (cuentasNecesarias.length > 1) {
      _avanzarEstado(telefono, { paso: 'ELEGIR_CUENTA_PARA', esAdmin: estado.esAdmin, categoriaObjetivo: categoria }, estado);
      return _conOpciones(_msgElegirCuenta(cuentasNecesarias), _opcionesDesdeCuentas(cuentasNecesarias));
    }
    // 0 o 1 cuenta: no hace falta preguntar. Con 1 cuenta se preselecciona;
    // con 0 cuentas, los handlers de "mí"/"clan" ya manejan tag vacío.
    if (cuentasNecesarias.length === 1) estado = Object.assign({}, estado, { tag: cuentasNecesarias[0].tag });
  }

  if (categoria === 'Gestionar información de miembros') {
    // Exclusiva de administradores (ver _categoriasDisponibles, que ya la
    // excluye de la lista para no-admin) — se valida de nuevo acá por si
    // se llegara a este punto con un estado manipulado.
    if (!estado.esAdmin) {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _conOpciones(_msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
    }
    _avanzarEstado(telefono, { paso: 'GESTION_ACCION', esAdmin: estado.esAdmin, tag: estado.tag }, estado);
    return _conOpciones(_msgGestionAccion(), _opcionesDesdeGestionAccion());
  }

  if (categoria === 'Torneos') {
    if (!estado.esAdmin) {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _conOpciones(_msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
    }
    _avanzarEstado(telefono, { paso: 'TORNEOS_MENU', esAdmin: estado.esAdmin, tag: estado.tag }, estado);
    return _conOpciones(_msgTorneosMenu(), _opcionesDesdeTorneosMenu());
  }

  if (categoria === 'Sorteos') {
    if (!estado.esAdmin) {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _conOpciones(_msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
    }
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    return _leerSeccionDocDrive(NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_SORTEO, 'Participantes calificados:', DOC_ID_PARTICIPANTES_CALIFICADOS_SORTEO);
  }

  if (categoria === 'Información sobre mí') {
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    return _respuestaInfoMi(estado.tag);
  }
  if (categoria === 'Información sobre el clan') {
    if (estado.esAdmin) {
      // Admin puede consultar cualquiera de los 4 clanes Terna,
      // independientemente de en qué clan esté su cuenta activa.
      var opcionesClan = _clanTernaOpciones();
      _avanzarEstado(telefono, {
        paso: 'ELEGIR_CLAN_INFO',
        esAdmin: estado.esAdmin,
        tag: estado.tag,
        opcionesClan: opcionesClan
      }, estado);
      return _conOpciones(_msgElegirClanInfo(opcionesClan), _opcionesDesdeClanInfo(opcionesClan));
    }
    // No-admin: muestra info del clan de su cuenta seleccionada.
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    return _respuestaInfoClan(estado.tag);
  }

  var opciones = _obtenerOpcionesClanCategoria(categoria);
  if (opciones.length === 0) {
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    return 'Todavía no hay contenido configurado para "' + categoria + '" en los documentos de Drive ni en Mensajes.';
  }
  if (opciones.length === 1) {
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    return opciones[0].contenido;
  }

  _avanzarEstado(telefono, {
    paso: 'ELEGIR_CLAN_CONTENIDO', esAdmin: estado.esAdmin, tag: estado.tag,
    categoria: categoria, opciones: opciones
  }, estado);
  return _conOpciones(_msgElegirOpcionClan(opciones), _opcionesDesdeClanContenido(opciones));
}

// -----------------------------------------------------------------------
// FASE 12 — "GESTIONAR INFORMACIÓN DE MIEMBROS" (solo administradores)
// -----------------------------------------------------------------------
// Flujo Gestionar información de miembros: acción → clan → miembro → Prefijo → Celular → Nom_Multi → Préstamo; guarda con _guardarRegistroNuevoMiembro() usando el tag de la lista real del clan. [→ Contexto_Base_Web.md §44B035]
function _msgGestionAccion() {
  return '👥 Gestionar información de miembros\n\n¿Qué necesitas hacer?\n1️⃣ Ingresar celular\n2️⃣ Actualizar celular' + PIE_NAVEGACION;
}

function _opcionesDesdeGestionAccion() {
  return [{ id: '1', titulo: 'Ingresar celular' }, { id: '2', titulo: 'Actualizar celular' }];
}

// _getCelularesActualesPorTag(): mapa Tag → Celular (solo tags con celular) desde Directorio. [→ Contexto_Base_Web.md §44B036]
function _getCelularesActualesPorTag() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var mapa = {};
  if (!sh || sh.getLastRow() < 2) return mapa;
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  for (var i = 0; i < data.length; i++) {
    var tagFila = String(data[i][IC.TAG - 1] || '').trim();
    var celFila = String(data[i][IC.CELULAR - 1] || '').trim();
    if (tagFila && celFila) mapa[tagFila] = celFila;
  }
  return mapa;
}

// _listarMiembrosClanParaGestion(clanTag, accion): miembros del clan (API) cruzados con Directorio y filtrados según la acción. [→ Contexto_Base_Web.md §44B037]
function _listarMiembrosClanParaGestion(clanTag, accion) {
  _fetchClanesBasico();
  var clanData = _getClanCache(clanTag);
  if (!clanData) return [];
  var celularesPorTag = _getCelularesActualesPorTag();
  return (clanData.members || [])
    .filter(function(m) {
      var tieneCelular = !!celularesPorTag[m.tag];
      return accion === 'ingresar' ? !tieneCelular : tieneCelular;
    })
    .map(function(m) { return { tag: m.tag, nombre: m.name }; });
}

// _msgGestionElegirMiembro(miembros): muestra los primeros 9 numerados (límite de 10 de WhatsApp) y permite escribir nombre o Tag. [→ Contexto_Base_Web.md §44B038]
function _msgGestionElegirMiembro(miembros) {
  var primeros = miembros.slice(0, 9);
  var lineas = primeros.map(function(m, i) { return _digitosAEmojis(i + 1) + ' ' + m.nombre + ' (' + m.tag + ')'; });
  var extra = miembros.length > 9 ? '\n\n...y ' + (miembros.length - 9) + ' más. Si no está en la lista, escribe su nombre o Tag para buscarlo.' : '';
  return 'Selecciona el miembro (responde con el número, el nombre o el Tag):\n' + lineas.join('\n') + extra + PIE_NAVEGACION;
}

// _matchMiembroGestion(texto, miembros): como _matchOpcion pero con índice solo sobre los 9 mostrados y también por Tag, sobre la lista completa. [→ Contexto_Base_Web.md §44B039]
function _matchMiembroGestion(texto, miembros) {
  var t = String(texto || '').trim();
  var idx = parseInt(t, 10);
  if (!isNaN(idx) && idx >= 1 && idx <= Math.min(9, miembros.length)) {
    return miembros[idx - 1];
  }
  var porNombre = _matchOpcion(t, miembros.map(function(m) { return m.nombre; }));
  if (porNombre) return miembros.filter(function(m) { return m.nombre === porNombre; })[0];
  var porTag = _matchOpcion(t, miembros.map(function(m) { return m.tag; }));
  if (porTag) return miembros.filter(function(m) { return m.tag === porTag; })[0];
  return null;
}

function _msgGestionPedirNomMulti() {
  return 'Ingresa el nombre del jugador (dueño de la cuenta) — solo si es multicuenta o si el nombre del juego no es legible. Se guardará en la columna Nom_Multi:\n\n' +
    '1️⃣ ' + OPCION_VACIA_REGISTRO + ' (si no aplica)' + PIE_NAVEGACION;
}

function _procesarPasoGestion(telefono, estado, texto) {
  if (estado.paso === 'GESTION_ACCION') {
    var accionElegida = _matchOpcion(texto, ['Ingresar celular', 'Actualizar celular']);
    if (!accionElegida) return _conOpciones(_msgGestionAccion(), _opcionesDesdeGestionAccion());
    var accion = accionElegida === 'Ingresar celular' ? 'ingresar' : 'actualizar';
    var opcionesClanG = _clanTernaOpciones();
    _avanzarEstado(telefono, { paso: 'GESTION_CLAN', esAdmin: estado.esAdmin, tag: estado.tag, accion: accion, opcionesClan: opcionesClanG }, estado);
    return _conOpciones(_msgElegirClanInfo(opcionesClanG), _opcionesDesdeClanInfo(opcionesClanG));
  }

  if (estado.paso === 'GESTION_CLAN') {
    var nombresClanG = estado.opcionesClan.map(function(o) { return o.nombre; });
    var nombreClanElegido = _matchOpcion(texto, nombresClanG);
    if (!nombreClanElegido) return _conOpciones(_msgElegirClanInfo(estado.opcionesClan), _opcionesDesdeClanInfo(estado.opcionesClan));
    var clanElegidoG = estado.opcionesClan.filter(function(o) { return o.nombre === nombreClanElegido; })[0];
    var miembrosFiltrados = _listarMiembrosClanParaGestion(clanElegidoG.tag, estado.accion);
    if (miembrosFiltrados.length === 0) {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _conOpciones('No hay miembros disponibles para esa acción en ' + clanElegidoG.nombre + '.\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
    }
    _avanzarEstado(telefono, { paso: 'GESTION_MIEMBRO', esAdmin: estado.esAdmin, tag: estado.tag, accion: estado.accion, clanTag: clanElegidoG.tag, miembros: miembrosFiltrados }, estado);
    return _msgGestionElegirMiembro(miembrosFiltrados);
  }

  if (estado.paso === 'GESTION_MIEMBRO') {
    var miembroElegido = _matchMiembroGestion(texto, estado.miembros);
    if (!miembroElegido) return _msgGestionElegirMiembro(estado.miembros);
    _avanzarEstado(telefono, { paso: 'GESTION_PREFIJO', esAdmin: estado.esAdmin, tag: estado.tag, tagElegido: miembroElegido.tag, nombreElegido: miembroElegido.nombre, nuevo: {} }, estado);
    return _msgRegistrarPedirPrefijo();
  }

  if (estado.paso === 'GESTION_PREFIJO') {
    var prefijoDigitosG = soloDigitos(texto);
    if (!prefijoDigitosG || prefijoDigitosG.length > 4) {
      return '⚠️ El Prefijo debe ser solo números (código de país, ej. 51), de hasta 4 dígitos.\n\nEscribe el Prefijo nuevamente:';
    }
    var nuevoG = estado.nuevo || {};
    nuevoG.prefijo = prefijoDigitosG;
    _avanzarEstado(telefono, { paso: 'GESTION_CELULAR', esAdmin: estado.esAdmin, tag: estado.tag, tagElegido: estado.tagElegido, nombreElegido: estado.nombreElegido, nuevo: nuevoG }, estado);
    return _msgRegistrarPedirCelular();
  }

  if (estado.paso === 'GESTION_CELULAR') {
    var celularDigitosG = soloDigitos(texto);
    if (!celularDigitosG || celularDigitosG.length < 6 || celularDigitosG.length > 12) {
      return '⚠️ El Celular debe ser solo números, entre 6 y 12 dígitos (sin el prefijo de país).\n\nEscribe el Celular nuevamente:';
    }
    var nuevoG2 = estado.nuevo || {};
    nuevoG2.celular = celularDigitosG;
    _avanzarEstado(telefono, { paso: 'GESTION_NOMMULTI', esAdmin: estado.esAdmin, tag: estado.tag, tagElegido: estado.tagElegido, nombreElegido: estado.nombreElegido, nuevo: nuevoG2 }, estado);
    return _msgGestionPedirNomMulti();
  }

  if (estado.paso === 'GESTION_NOMMULTI') {
    var nuevoG3 = estado.nuevo || {};
    if (_esRespuestaVacia(texto)) {
      nuevoG3.nomMulti = '';
    } else {
      var nomMultiTextoG = String(texto || '').trim();
      if (!nomMultiTextoG) return '⚠️ Escribe el Nom_Multi, o responde 1️⃣ si no aplica.';
      nuevoG3.nomMulti = nomMultiTextoG;
    }
    _avanzarEstado(telefono, { paso: 'GESTION_PRESTAMO', esAdmin: estado.esAdmin, tag: estado.tag, tagElegido: estado.tagElegido, nombreElegido: estado.nombreElegido, nuevo: nuevoG3 }, estado);
    return _msgRegistrarPedirPrestamo();
  }

  if (estado.paso === 'GESTION_PRESTAMO') {
    var nuevoG4 = estado.nuevo || {};
    nuevoG4.prestamo = _esRespuestaVacia(texto) ? '' : String(texto || '').trim();
    nuevoG4.tag = estado.tagElegido;

    var resultadoG = _guardarRegistroNuevoMiembro(nuevoG4);
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    var categoriasFinG = _categoriasDisponibles(estado.esAdmin, telefono);

    if (!resultadoG.ok) {
      return _conOpciones('❌ No se pudo guardar: ' + resultadoG.error + '\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(categoriasFinG));
    }
    return _conOpciones('✅ Datos actualizados para ' + estado.nombreElegido + ' (' + estado.tagElegido + '):\n\n' +
      'Prefijo: ' + nuevoG4.prefijo + '\n' +
      'Celular: ' + nuevoG4.celular + '\n' +
      'Nom_Multi: ' + (nuevoG4.nomMulti || '(vacío)') + '\n' +
      'Préstamo: ' + (nuevoG4.prestamo || '(vacío)') + '\n\n' +
      _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(categoriasFinG));
  }

  // Paso GESTION_* desconocido (no debería pasar): reinicia el flujo.
  _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
  return _conOpciones(_msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
}

function _esRespuestaVacia(texto) {
  var t = String(texto || '').trim();
  if (t === '-') return true;
  return !!_matchOpcion(t, [OPCION_VACIA_REGISTRO]);
}

function _msgRegistrarPedirPrefijo() {
  return 'Ahora escribe el Prefijo (código de país, ej. 51):' + PIE_NAVEGACION;
}

function _msgRegistrarPedirCelular() {
  return 'Ahora escribe el Celular (sin el prefijo, sin espacios):' + PIE_NAVEGACION;
}

function _msgRegistrarPedirPrestamo() {
  return 'Por último, escribe el Préstamo (a quién se le prestó esta cuenta):\n\n' +
    '1️⃣ ' + OPCION_VACIA_REGISTRO + ' (si no aplica)' + PIE_NAVEGACION;
}

function _msgElegirOpcionClan(opciones) {
  var emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  var lineas = opciones.map(function(o, i) {
    var emoji = i < emojis.length ? emojis[i] : (i + 1) + '.';
    return emoji + ' ' + o.etiqueta;
  });
  return 'Elige el clan que deseas consultar. Responde con el número:\n' + lineas.join('\n') + PIE_NAVEGACION;
}

// _msgElegirClanInfo(opciones): lista los clanes Terna para consultar o gestionar; opciones = [{tag, nombre}]. [→ Contexto_Base_Web.md §44B040]
function _msgElegirClanInfo(opciones) {
  var emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  var lineas = opciones.map(function(o, i) {
    var emoji = i < emojis.length ? emojis[i] : (i + 1) + '.';
    return emoji + ' ' + o.nombre;
  });
  return 'Selecciona el clan que deseas consultar. Responde con el número:\n' + lineas.join('\n') + PIE_NAVEGACION;
}

function _msgTorneosMenu() {
  var lineas = TORNEOS_OPCIONES_MENU.map(function(o, i) { return _digitosAEmojis(i + 1) + ' ' + o; });
  return '🏆 Torneos\n\n¿Qué necesitas hacer?\n' + lineas.join('\n') + PIE_NAVEGACION;
}

function _opcionesDesdeTorneosMenu() {
  return TORNEOS_OPCIONES_MENU.map(function(o, i) { return { id: String(i + 1), titulo: o }; });
}

function _msgTorneosPedirLink() {
  return '🏆 Ingresar link de torneo\n\nEnvía el link de la app del torneo:' + PIE_NAVEGACION;
}

function _msgTorneosPedirFecha() {
  return 'Ahora escribe la fecha del torneo (dd/mm/aaaa, ej. 29/07/2026):' + PIE_NAVEGACION;
}

function _msgTorneosPedirHora() {
  return 'Ahora escribe la hora del torneo (HH:mm, ej. 20:00):' + PIE_NAVEGACION;
}

function _msgTorneosListaHoy(torneosHoy) {
  var tz = Session.getScriptTimeZone();
  var lineas = torneosHoy.map(function(t, i) {
    var fechaTxt = (t.fecha instanceof Date) ? Utilities.formatDate(t.fecha, tz, 'dd/MM/yyyy') : String(t.fecha || '');
    return _digitosAEmojis(i + 1) + ' ' + t.id + ' - ' + fechaTxt;
  });
  return 'Selecciona el torneo a modificar (responde con el número o el ID):\n' + lineas.join('\n') + PIE_NAVEGACION;
}

function _opcionesDesdeTorneosHoy(torneosHoy) {
  return torneosHoy.map(function(t, i) { return { id: String(i + 1), titulo: String(t.id) }; });
}

/** Valida "dd/mm/aaaa" (holgado: no chequea días/meses reales, solo el formato). */
function _esFechaValida(texto) {
  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(String(texto || '').trim());
}

/** Valida "HH:mm" en formato 24 horas. */
function _esHoraValida(texto) {
  return /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(texto || '').trim());
}

// Fase 14: los documentos de participantes calificados y ganadores se mantienen desde procesarTorneos(); aquí solo se leen y reenvían. [→ Contexto_Base_Web.md §44B041]
function _respuestaTorneosParticipantesCalificados() {
  return _leerSeccionDocDrive(NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO, 'Participantes calificados:', DOC_ID_PARTICIPANTES_CALIFICADOS_TORNEO);
}

function _respuestaTorneosGanadores() {
  return _leerSeccionDocDrive(NOMBRE_DOC_GANADORES_TORNEO, 'Ganadores:', DOC_ID_GANADORES_TORNEO);
}

function _procesarPasoTorneos(telefono, estado, texto) {
  if (estado.paso === 'TORNEOS_MENU') {
    var opcionTorneo = _matchOpcion(texto, TORNEOS_OPCIONES_MENU);
    if (!opcionTorneo) return _conOpciones(_msgTorneosMenu(), _opcionesDesdeTorneosMenu());

    if (opcionTorneo === 'Ingresar link de torneo') {
      _avanzarEstado(telefono, { paso: 'TORNEOS_LINK_LINK', esAdmin: estado.esAdmin, tag: estado.tag, nuevo: {} }, estado);
      return _msgTorneosPedirLink();
    }
    if (opcionTorneo === 'Modificar datos de torneo existente') {
      var torneosHoy = _listarTorneosDeHoy();
      if (torneosHoy.length === 0) {
        _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
        return _conOpciones('No hay torneos registrados hoy.\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
      }
      _avanzarEstado(telefono, { paso: 'TORNEOS_MOD_LISTA', esAdmin: estado.esAdmin, tag: estado.tag, torneosHoy: torneosHoy }, estado);
      return _conOpciones(_msgTorneosListaHoy(torneosHoy), _opcionesDesdeTorneosHoy(torneosHoy));
    }
    if (opcionTorneo === 'Obtener lista de participantes calificados') {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _respuestaTorneosParticipantesCalificados();
    }
    if (opcionTorneo === 'Obtener lista de ganadores') {
      _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
      return _respuestaTorneosGanadores();
    }
  }

  if (estado.paso === 'TORNEOS_LINK_LINK') {
    var linkTexto = String(texto || '').trim();
    if (!linkTexto) return '⚠️ Escribe el link de la app del torneo:';
    var nuevoT = estado.nuevo || {};
    nuevoT.link = linkTexto;
    _avanzarEstado(telefono, { paso: 'TORNEOS_LINK_FECHA', esAdmin: estado.esAdmin, tag: estado.tag, nuevo: nuevoT }, estado);
    return _msgTorneosPedirFecha();
  }

  if (estado.paso === 'TORNEOS_LINK_FECHA') {
    if (!_esFechaValida(texto)) return '⚠️ Formato de fecha inválido. Usa dd/mm/aaaa (ej. 29/07/2026):';
    var nuevoT2 = estado.nuevo || {};
    nuevoT2.fecha = String(texto).trim();
    _avanzarEstado(telefono, { paso: 'TORNEOS_LINK_HORA', esAdmin: estado.esAdmin, tag: estado.tag, nuevo: nuevoT2 }, estado);
    return _msgTorneosPedirHora();
  }

  if (estado.paso === 'TORNEOS_LINK_HORA') {
    if (!_esHoraValida(texto)) return '⚠️ Formato de hora inválido. Usa HH:mm (ej. 20:00):';
    var nuevoT3 = estado.nuevo || {};
    nuevoT3.hora = String(texto).trim();

    var resultadoT = _registrarTorneoDesdeBot(nuevoT3.link, nuevoT3.fecha, nuevoT3.hora);
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    var categoriasFinT = _categoriasDisponibles(estado.esAdmin, telefono);
    if (!resultadoT.ok) {
      return _conOpciones('❌ No se pudo registrar el torneo: ' + resultadoT.error + '\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(categoriasFinT));
    }
    // 02-oct-2026: corregido:true = el link corrigió una fila ya registrada con esa fecha/hora (no se creó otra); ver docblock de _registrarTorneoDesdeBot() (26_Torneos_Core.gs).
    var textoExitoT = resultadoT.corregido === true
      ? '✅ Link corregido en el torneo con ID '
      : '✅ Torneo registrado con ID ';
    return _conOpciones(textoExitoT + resultadoT.id + '.\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(categoriasFinT));
  }

  if (estado.paso === 'TORNEOS_MOD_LISTA') {
    var idsHoy = estado.torneosHoy.map(function(t) { return String(t.id); });
    var idElegidoTxt = _matchOpcion(texto, idsHoy);
    if (!idElegidoTxt) return _conOpciones(_msgTorneosListaHoy(estado.torneosHoy), _opcionesDesdeTorneosHoy(estado.torneosHoy));
    _avanzarEstado(telefono, { paso: 'TORNEOS_MOD_FECHA', esAdmin: estado.esAdmin, tag: estado.tag, idElegido: idElegidoTxt }, estado);
    return _msgTorneosPedirFecha();
  }

  if (estado.paso === 'TORNEOS_MOD_FECHA') {
    if (!_esFechaValida(texto)) return '⚠️ Formato de fecha inválido. Usa dd/mm/aaaa (ej. 29/07/2026):';
    _avanzarEstado(telefono, { paso: 'TORNEOS_MOD_HORA', esAdmin: estado.esAdmin, tag: estado.tag, idElegido: estado.idElegido, fechaNueva: String(texto).trim() }, estado);
    return _msgTorneosPedirHora();
  }

  if (estado.paso === 'TORNEOS_MOD_HORA') {
    if (!_esHoraValida(texto)) return '⚠️ Formato de hora inválido. Usa HH:mm (ej. 20:00):';
    var resultadoMod = _modificarFechaHoraTorneo(estado.idElegido, estado.fechaNueva, String(texto).trim());
    _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
    var categoriasFinM = _categoriasDisponibles(estado.esAdmin, telefono);
    if (!resultadoMod.ok) {
      return _conOpciones('❌ No se pudo modificar: ' + resultadoMod.error + '\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(categoriasFinM));
    }
    return _conOpciones('✅ Torneo ' + estado.idElegido + ' actualizado.\n\n' + _msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(categoriasFinM));
  }

  // Paso TORNEOS_* desconocido (no debería pasar): reinicia el flujo.
  _setEstadoUsuario(telefono, { paso: 'ELEGIR_CATEGORIA', esAdmin: estado.esAdmin, tag: estado.tag });
  return _conOpciones(_msgElegirCategoria(estado.esAdmin, telefono), _opcionesDesdeCategorias(_categoriasDisponibles(estado.esAdmin, telefono)));
}

// _obtenerOpcionesClanCategoria(categoria): una opción por Clan/Subcategoría distinto; fuentes: índice de contenido y luego las hojas de FUENTES_CONTENIDO. [→ Contexto_Base_Web.md §44B042]
function _obtenerOpcionesClanCategoria(categoria) {
  var vistos = {};
  var opciones = [];

  function agregar(cat, sub, clan, contenido, docId) {
    if (cat !== categoria) return;
    contenido = String(contenido || '').trim();
    if (!contenido) return;
    sub  = String(sub  || '').trim();
    clan = String(clan || '').trim();
    var clave = sub === 'Particular' ? ('clan:' + clan) : ('sub:' + sub);
    if (vistos[clave]) return;
    vistos[clave] = true;

    var opcion = {
      etiqueta:     sub === 'Particular' ? clan : (sub || clan),
      clan:         clan,
      subcategoria: sub,
      contenido:    contenido
    };
    docId = String(docId || '').trim();
    if (docId) opcion.docId = docId;
    opciones.push(opcion);
  }

  // 1) Índice de contenido (caché -> Drive -> reconstrucción).
  var indice = _getIndiceContenido();
  for (var k = 0; k < indice.length; k++) {
    var e = indice[k];
    agregar(String(e.categoria || '').trim(), e.subcategoria, e.clan, e.contenido, e.docId);
  }

  // 2) Hojas en vivo (Mensajes), con fallback a Backup_Mensajes.csv (24-sep-2026,
  // pedido del usuario) si Sheets no está disponible o la hoja está vacía --
  // mismo helper y mismo criterio que usa el resto del proyecto (Directorio,
  // Guerra, Pendientes...), ver _obtenerFilasConFallbackCSV() (01_Config_Global.gs).
  var ss = _getSs();
  for (var f = 0; f < FUENTES_CONTENIDO.length; f++) {
    var fuente = FUENTES_CONTENIDO[f];
    var lecturaFuente = _obtenerFilasConFallbackCSV(ss, fuente.sheet, fuente.csv, fuente.totalCols);
    var data = lecturaFuente.filas;
    if (!data.length) continue;

    for (var i = 0; i < data.length; i++) {
      agregar(
        String(data[i][fuente.colCategoria - 1] || '').trim(),
        data[i][fuente.colSubcategoria - 1],
        data[i][fuente.colClan - 1],
        data[i][fuente.colContenido - 1],
        fuente.colDocId ? data[i][fuente.colDocId - 1] : ''
      );
    }
  }
  return opciones;
}

// _formatearCaminoLeyendas(liga, trofeos, rango): Liga=0 no muestra nada; Liga sin Trofeos solo Liga; Liga y Trofeos sin Rango, ambos. [→ Contexto_Base_Web.md §44B043]
function _formatearCaminoLeyendas(liga, trofeos, rango) {
  var ligaNum    = Number(liga)    || 0;
  var trofeosNum = Number(trofeos) || 0;
  var rangoNum   = Number(rango)   || 0;

  if (ligaNum === 0) return '';

  var texto = 'Liga de Camino de leyendas: ' + liga;
  if (trofeosNum === 0) return texto;

  texto += '\nTrofeos de Camino de leyendas: ' + trofeos;
  if (rangoNum === 0) return texto;

  texto += '\nRango de Camino de leyendas: ' + rango;
  return texto;
}

// _respuestaInfoMi(tag): lee la fila de Directorio de la cuenta y arma la información completa, con Camino de leyendas. [→ Contexto_Base_Web.md §44B044]
function _respuestaInfoMi(tag) {
  if (!tag) return 'No encontré una cuenta asociada a tu número. (TODO: manejar este caso)';

  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return 'No encontré la hoja Directorio.';

  // Fase C3 (16/07/2026): usa _leerFilaHojaPorTag() (1 Tag) y combina Directorio + Players + Links con _reconstruirFilaDCDesdeFisico(). [→ Contexto_Base_Web.md §44B045]
  var filaDirectorio = _leerFilaHojaPorTag(ss, CFG.SHEETS.DIRECTORIO, IC.TAG - 1, DIR_SHEET_COLS, tag);
  if (!filaDirectorio) return 'No encontré información para esa cuenta en Directorio.';

  var playersRow = _leerFilaHojaPorTag(ss, CFG.SHEETS.PLAYERS, PC.TAG - 1, PLAYERS_TOTAL_COLS, tag);
  var linksRow   = _leerFilaHojaPorTag(ss, CFG.SHEETS.LINKS,   LC.TAG - 1, LINKS_TOTAL_COLS,   tag);
  var fila = _reconstruirFilaDCDesdeFisico(filaDirectorio, playersRow, linksRow);

  var lineas = [];

  // Información básica
  lineas.push('Nombre: ' + (fila[DC.NOMBRE - 1] || ''));
  lineas.push('Tag: ' + (fila[DC.TAG - 1] || ''));
  lineas.push('Rango: ' + (fila[DC.RANGO - 1] || ''));
  lineas.push('Clan: ' + (fila[DC.CLAN - 1] || ''));
  lineas.push('Antigüedad: ' + (fila[DC.ANTIGUEDAD - 1] || ''));

  // Niveles
  lineas.push('Nivel (XP): ' + (fila[DC.NIVEL - 1] || ''));
  lineas.push('Nivel (Cartas): ' + (fila[DC.NIVEL2 - 1] || ''));

  // Trofeos
  lineas.push('Copas: ' + (fila[DC.COPAS - 1] || ''));
  lineas.push('Copas (máximo): ' + (fila[DC.COPAS_MAX - 1] || ''));
  // FIX 27-sep-2026: el nombre de arena se resuelve con _resolverArenaDesdeCatalogo() (Backup_Arena.csv) en vez de enviar el rawName crudo. [→ Contexto_Base_Web.md §44B046]
  lineas.push('Arena: ' + _resolverArenaDesdeCatalogo(fila[DC.ARENA - 1]));

  // Batallas
  lineas.push('Victorias de guerra: ' + (fila[DC.V_GUERRA - 1] || ''));
  lineas.push('Victorias en batallas: ' + (fila[DC.VICTORIAS - 1] || ''));
  lineas.push('Derrotas en batallas: ' + (fila[DC.DERROTAS - 1] || ''));
  lineas.push('Total de batallas: ' + (fila[DC.BATALLAS - 1] || ''));
  lineas.push('Racha actual: ' + (fila[DC.RACHA - 1] || ''));

  // Camino de leyendas
  var cl = _formatearCaminoLeyendas(fila[DC.CL_LIGA - 1], fila[DC.CL_TROFEOS - 1], fila[DC.CL_RANGO - 1]);
  if (cl) lineas.push(cl);

  // Logros adicionales
  if (fila[DC.VICTORIAS_3C - 1]) lineas.push('Victorias de tres coronas: ' + fila[DC.VICTORIAS_3C - 1]);
  if (fila[DC.MAX_VIC_DESAFIOS - 1]) lineas.push('Máximo de victorias en desafíos: ' + fila[DC.MAX_VIC_DESAFIOS - 1]);
  if (fila[DC.TORNEOS - 1]) lineas.push('Torneos: ' + fila[DC.TORNEOS - 1]);

  // Coleccionables
  if (fila[DC.EMOTES - 1]) lineas.push('Emotes: ' + fila[DC.EMOTES - 1]);
  if (fila[DC.BANNERS - 1]) lineas.push('Banners: ' + fila[DC.BANNERS - 1]);

  // Cartas en eventos
  if (fila[DC.CARTAS_DESAFIOS - 1]) lineas.push('Cartas ganadas en desafíos: ' + fila[DC.CARTAS_DESAFIOS - 1]);
  if (fila[DC.CARTAS_TORNEOS - 1]) lineas.push('Cartas ganadas en torneos: ' + fila[DC.CARTAS_TORNEOS - 1]);

  // Donaciones
  if (fila[DC.DON_R - 1]) lineas.push('Donaciones recibidas esta semana: ' + fila[DC.DON_R - 1]);
  if (fila[DC.DON_D - 1]) lineas.push('Donaciones realizadas esta semana: ' + fila[DC.DON_D - 1]);

  // Ranking
  if (fila[DC.RANKING - 1]) lineas.push('Ranking en el clan: ' + fila[DC.RANKING - 1]);

  // Enlaces a perfiles externos
  var royaleApi = String(fila[DC.ROYALE_API - 1] || '').trim();
  if (royaleApi && royaleApi !== '') {
    if (royaleApi.startsWith('http')) {
      lineas.push('Perfil en RoyaleAPI:\n' + royaleApi);
    } else {
      lineas.push('Perfil en RoyaleAPI:\nhttps://royaleapi.com/player/' + cleanTag(royaleApi));
    }
  }

  // Mazos sugeridos
  if (fila[DC.DECK - 1]) lineas.push('Mazos sugeridos en royaleAPI:\n' + fila[DC.DECK - 1]);
  if (fila[DC.DECK_2 - 1]) lineas.push('Mazos sugeridos en royaleAPI (2):\n' + fila[DC.DECK_2 - 1]);

  var cwStats = String(fila[DC.CW_STATS - 1] || '').trim();
  if (cwStats && cwStats !== '') {
    if (cwStats.startsWith('http')) {
      lineas.push('Perfil en CWStats:\n' + cwStats);
    } else {
      lineas.push('Perfil en CWStats:\nhttps://cwstats.com/player/' + cleanTag(cwStats));
    }
  }

  return lineas.join('\n');
}

// _respuestaInfoClan(tag): para no-admin, muestra la info del clan de la cuenta seleccionada. [→ Contexto_Base_Web.md §44B047]
function _respuestaInfoClan(tag) {
  if (!tag) return 'No encontré tu cuenta para saber a qué clan perteneces.';

  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return 'No encontré la hoja Directorio.';

  // Fase C3 (16/07/2026): ClanTag sigue físicamente en Directorio (29 cols,
  // orden IC). Solo se necesita 1 Tag puntual, así que se usa
  // _leerFilaHojaPorTag() (02_Setup_Hojas.gs) en vez de recorrer toda la
  // hoja e indexar con DC.
  var filaDirectorio = _leerFilaHojaPorTag(ss, CFG.SHEETS.DIRECTORIO, IC.TAG - 1, DIR_SHEET_COLS, tag);
  if (!filaDirectorio) return 'No encontré el clan asociado a tu cuenta.';

  var clanTag = String(filaDirectorio[IC.CLAN_TAG - 1] || '');
  if (!clanTag) return 'No encontré el clan asociado a tu cuenta.';
  return _respuestaInfoClanPorTag(clanTag);
}

// _respuestaInfoClanPorTag(clanTag): lee la fila de la hoja Clan y arma un solo mensaje; la usan no-admin y admin tras elegir clan. [→ Contexto_Base_Web.md §44B048]
function _respuestaInfoClanPorTag(clanTag) {
  if (!clanTag) return 'No se especificó un clan.';
  var ss = _getSs();
  var shClan = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (!shClan || shClan.getLastRow() < 2) return 'No encontré la hoja Clan.';

  var dataClan = shClan.getRange(2, 1, shClan.getLastRow() - 1, CC.CONDICION).getValues();
  for (var j = 0; j < dataClan.length; j++) {
    if (String(dataClan[j][CC.CLAN_TAG - 1]) === clanTag) {
      var filaClan = dataClan[j];
      var minG = _getMinGClanMaps().byTag[clanTag];
      if (minG === undefined) minG = CFG.MIN_G_DEFAULT;
      var lineas = [];

      // Información básica
      lineas.push('Nombre: ' + (filaClan[CC.NOMBRE - 1] || ''));
      lineas.push('Etiqueta del clan: ' + (filaClan[CC.CLAN_TAG - 1] || ''));
      lineas.push('Líder: ' + (filaClan[CC.LIDER - 1] || ''));
      lineas.push('Miembros: ' + (filaClan[CC.MIEMBROS - 1] || ''));

      // Guerra
      // Min_G ya no vive en la hoja Clan (FASE 27, 11/08/2026) — se lee de
      // CR_Lista (par de Descenso vigente) vía _getMinGClanMaps()
      // (10_ClanSheet.gs).
      lineas.push('Mínimo de trofeos de guerra semanales: ' + minG);
      lineas.push('Trofeos de guerra: ' + (filaClan[CC.TROFEOS - 1] || ''));

      // Liga y trofeos
      lineas.push('Liga: ' + (filaClan[CC.LIGA - 1] || ''));
      lineas.push('Trofeos necesarios: ' + (filaClan[CC.REQUERIMIENTO - 1] || ''));
      lineas.push('Puntos del clan: ' + (filaClan[CC.COPAS - 1] || ''));

      // Donaciones
      lineas.push('Donaciones semanales: ' + (filaClan[CC.DONACIONES - 1] || ''));

      // Información general
      lineas.push('Tipo: ' + (filaClan[CC.TIPO - 1] || ''));
      lineas.push('País: ' + (filaClan[CC.PAIS - 1] || ''));

      // Descripción
      if (filaClan[CC.DESCRIPCION - 1]) {
        lineas.push('Descripción: ' + filaClan[CC.DESCRIPCION - 1]);
      }

      // Enlaces
      var royaleApi = String(filaClan[CC.ROYALE_API - 1] || '').trim();
      var cwStats = String(filaClan[CC.CW_STATS - 1] || '').trim();

      if (royaleApi && royaleApi !== '') {
        // Si es un URL completo, usarlo; si es solo el tag, construir el URL
        if (royaleApi.startsWith('http')) {
          lineas.push('Perfil en RoyaleAPI:\n' + royaleApi);
        } else {
          lineas.push('Perfil en RoyaleAPI:\nhttps://royaleapi.com/clan/' + cleanTag(royaleApi));
        }
      }

      if (cwStats && cwStats !== '') {
        // Si es un URL completo, usarlo; si es solo el tag, construir el URL
        if (cwStats.startsWith('http')) {
          lineas.push('Perfil en CWStats:\n' + cwStats);
        } else {
          lineas.push('Perfil en CWStats:\nhttps://cwstats.com/clan/' + cleanTag(cwStats));
        }
      }

      return lineas.join('\n');
    }
  }
  return 'No encontré datos para ese clan en la hoja Clan.';
}

// _clanTernaOpciones(): devuelve [{tag, nombre}] de los clanes Terna en orden de CFG.TERNA_TAGS, resolviendo el nombre con _resolverNombreClan(). [→ Contexto_Base_Web.md §44B049]
function _clanTernaOpciones() {
  return CFG.TERNA_TAGS.map(function(tag) {
    return { tag: tag, nombre: _resolverNombreClan(tag) };
  });
}