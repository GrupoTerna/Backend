// ==============================================================================
// 25_Doc_AscensosDescensos.gs
// Documento 'Ascensos y descensos' (hoy «Cambio de rango»): ayudas para escribir en él las listas por clan de los
// cambios aplicados, las tablas de requisitos por rango y las reglas (las llama actualizarDocCambioRango() de 29_Docs_NoCalificados.gs).
// 28-oct-2026 (PF286 punto 23): se quitaron actualizarDocAscensosDescensos(), actualizarTablasRangosDoc() y sus ayudas (nadie las llamaba y escribían en el mismo documento con otro diseño).
// ==============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: reconstruirDocAscensosDescensosSiFalta()
//  Parte 2 — Funciones que no se corren a mano
//    - Listas por clan, tablas de requisitos y reglas del documento «Cambio de rango» (al final del archivo)
//    - Tablas de requisitos por rango (_formatearQtyCelda)
//    - Contenido del documento al reconstruirlo desde cero (_construirContenidoDocAscensosDescensos y sus ayudas)
//    - Semanas de la temporada (ayuda que usan otros archivos)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// ----- Variables y constantes -----

// 25_Doc_AscensosDescensos.gs [→ Contexto_Base_Web.md §25B001]

// 1) T_REQ_CATEGORIAS — HISTÓRICO, ya no aplica [→ Contexto_Base_Web.md §25B002]

// 2) IDs/nombres del documento (confirmados por el usuario, 10/08/2026) [→ Contexto_Base_Web.md §25B003]
var NOMBRE_DOC_ASCENSOS_DESCENSOS = 'Ascensos y descensos - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

var DOC_ID_ASCENSOS_DESCENSOS     = '1jkUntN6esvkNvHosYesDQwlU33BfPr1I_wyyYueMxWo';

// 25_Doc_AscensosDescensos.gs [→ Contexto_Base_Web.md §25B004]

var RT_ENCABEZADO_ASCENDER   = 'Requisito para ascender a este rango';

var RT_ENCABEZADO_PERMANECER = 'Condición para permanecer en el clan';

var RT_ENCABEZADO_CONSERVAR  = 'Condición para conservar el rango';

// NUEVO (28-oct-2026, PF286 punto 11): secciones de las listas por clan del documento «Cambio de rango». `tipo` es el valor de Historial_A/D!Tipo que va en cada una (ver MAPA_TIPO_RANGO2 en 24_Historial_Ascensos.gs); el orden de esta lista es el orden en que salen en el documento. [→ Contexto_Base_Web.md §PF286]
var CR_SECCIONES_APLICADOS_ = [
  { clave: 'ascensos',     titulo: 'Ascensos',                       tipo: 'Ascenso' },
  { clave: 'ascensosClan', titulo: 'Ascensos de clan',               tipo: 'Ascenso de clan' },
  { clave: 'descensos',    titulo: 'Descensos',                      tipo: 'Degradación' },
  { clave: 'expulsiones',  titulo: 'Expulsiones',                    tipo: 'Expulsión' },
  { clave: 'admin',        titulo: 'Elegibles para administración',  tipo: 'Elegible Admin' }
];

/**
 * _getSemanasDeTemporada(temporada) [→ Contexto_Base_Web.md §25B017]
 */
// 17-oct-2026 (PF091): memo por ejecución. CFG.REF_DEFAULT lee Propiedades del script en cada acceso y _esPeriodoDeColiseo_() llama a esta función en cada fila de guerra. [→ Contexto_Base_Web.md §PF091]
var _SEMANAS_TEMPORADA_MEMO = {};

// ----- Parte 1: funciones que se corren a mano -----

/**
 * FASE 8 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): desde [→ Contexto_Base_Web.md §25B006]
 */
// SECCIÓN 1: FUNCIONES MANUALES (entry points de mantenimiento, ejecutar a mano [→ Contexto_Base_Web.md §25B007]

// 9) Reconstrucción desde cero si el documento se borra de Drive. [→ Contexto_Base_Web.md §25B035]

/**
 * reconstruirDocAscensosDescensosSiFalta() [→ Contexto_Base_Web.md §25B008]
 */
function reconstruirDocAscensosDescensosSiFalta() {
  var archivo = _buscarArchivoEnPlantillas(NOMBRE_DOC_ASCENSOS_DESCENSOS, DOC_ID_ASCENSOS_DESCENSOS);
  if (archivo) {
    Logger.log('[ReconstruirDocs] "' + NOMBRE_DOC_ASCENSOS_DESCENSOS + '" OK (existe, ID: ' + archivo.getId() + ').');
  } else {
    Logger.log('[ReconstruirDocs] "' + NOMBRE_DOC_ASCENSOS_DESCENSOS + '" NO se pudo encontrar NI recrear. Revisar permisos de Drive / DRIVE_FOLDER_ID_PLANTILLAS_OTRAS.');
  }
}

// ----- Parte 2: funciones que no se corren a mano -----

// SECCIÓN 2: RESTO DE FUNCIONES (ascensos/descensos, doc automatizado, helpers [→ Contexto_Base_Web.md §25B016]

// --- Tema: tablas de requisitos por rango (las usa _filasTablaRequisitosRango_ vía _formatearQtyCelda) ---

/**
 * _formatearQtyCelda(requisito, esTrofeos) [→ Contexto_Base_Web.md §25B045]
 */
function _formatearQtyCelda(requisito, esTrofeos) {
  if (!requisito || !requisito.activo) return '-';
  var texto = String(requisito.qty);
  if (esTrofeos) texto = texto.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return texto;
}

// --- Tema: contenido del documento al reconstruirlo desde cero ---

/**
 * _construirContenidoDocAscensosDescensos(body) [→ Contexto_Base_Web.md §25B040]
 */
function _construirContenidoDocAscensosDescensos(body) {
  // --- Título + Temporada -------------------------------------------
  _rdocParrafoTexto(body, 'Ascensos y descensos', true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, 'Temporada', true);

  var temporadaTexto;
  try {
    var ctxReal = _getCtx();
    var temporadaMostrar = _getExtraMostrarTemporada(_getSs(), ctxReal);
    var primerLunes = primerLunesTemporada(CFG.REF_DEFAULT, temporadaMostrar);
    temporadaTexto = 'Mes de ' + _MESES_ES[primerLunes.getMonth()] + ' del ' + primerLunes.getFullYear() + '.';
  } catch (e) {
    // Si algo falla (hoja Extra sin datos, etc.) no se corta la [→ Contexto_Base_Web.md §25B041]
    temporadaTexto = 'Mes de [mes] del [año].';
  }
  _rdocParrafoTexto(body, temporadaTexto, false);

  // --- Rangos ----------------------------------------------------------
  _rdocParrafoTexto(body, 'Rangos', true);

  // 1. Miembro
  _rdocParrafoTexto(body, '1.     Miembro', true);
  _rdocParrafoTexto(body, 'Condición para permanecer en el clan', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de medallas de guerra y ataques durante la temporada actual, según el clan al que pertenece.', false);
  _rdocADTablaRango(body, 2000, 16);
  _rdocADBloqueFuncion(body, ['Donar y participar en guerras.']);

  // 2. Veterano
  _rdocParrafoTexto(body, '2.     Veterano', true);
  _rdocParrafoTexto(body, 'Requisito para ascender a este rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de medallas de guerra y ataques durante la temporada actual, según el clan al que pertenece, para poder ascender.', false);
  _rdocADTablaRango(body, 2500, 16);
  _rdocParrafoTexto(body, 'Condición para conservar el rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de medallas de guerra y ataques durante la temporada actual, según el clan al que pertenece.', false);
  _rdocADTablaRango(body, 2000, 16);
  _rdocADBloqueFuncion(body, [
    'Donar y participar en guerras.',
    'Incentivar en las guerras',
    'Puede aceptar solicitudes de miembros nuevos.'
  ]);

  // 3. Colíder
  _rdocParrafoTexto(body, '3.     Colíder', true);

  // 3.1. Tipo A: Colíder de juego
  _rdocParrafoTexto(body, '3.1.   Tipo A: Colíder de juego', true);
  _rdocParrafoTexto(body, 'Requisito para ascender a este rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de medallas de guerra y ataques durante la temporada actual, según el clan al que pertenece, para poder ascender.', false);
  _rdocADTablaRango(body, 3000, 16);
  _rdocParrafoTexto(body, 'Condición para conservar el rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de medallas de guerra y ataques durante la temporada actual, según el clan al que pertenece.', false);
  _rdocADTablaRango(body, 2600, 16);
  _rdocADBloqueFuncion(body, [
    'Donar y participar en guerras.',
    'Incentivar en las guerras',
    'Puede aceptar solicitudes de miembros nuevos.',
    'Ayudar en el juego.'
  ]);

  // 3.2. Tipo B: Colíder colaborador
  _rdocParrafoTexto(body, '3.2.   Tipo B: Colíder colaborador', true);
  _rdocParrafoTexto(body, 'Los Colíderes colaboradores son elegidos por el líder por su compromiso con el clan.', false);
  _rdocParrafoTexto(body, 'Requisito para ascender a este rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el mínimo promedio de medallas de guerra requerido durante la temporada actual, según el clan al que pertenece, para poder ascender.', false);
  _rdocADTablaRango(body, 3000, 16);
  _rdocParrafoTexto(body, 'Condición para conservar el rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de medallas de guerra y ataques durante la temporada actual, según el clan al que pertenece. Sin embargo, tiene prioridad de no descender por medallas.', false);
  _rdocADTablaRango(body, 2600, 16);
  _rdocADBloqueFuncion(body, [
    'Donar y participar en guerras.',
    'Incentivar en las guerras',
    'Puede aceptar solicitudes de miembros nuevos.',
    'Apoyar en la administración del clan, organización, reclutamiento, eventos y decisiones importantes.'
  ]);

  // 4. Líder
  _rdocParrafoTexto(body, '4.     Líder', true);
  body.appendListItem('Toma de decisiones finales del clan.').setGlyphType(DocumentApp.GlyphType.BULLET);

  // --- Reglas ------------------------------------------------------------
  _rdocParrafoTexto(body, 'Reglas', true);
  [
    'Las listas de ascensos y descensos se publicarán al terminar cada coliseo (aproximadamente a fin de mes).',
    'Se hace solo un cambio de rango por temporada para cada persona, entonces; si ya fuiste ascendido o degradado esta temporada, debes esperar hasta el siguiente fin de coliseo para volver a cambiar de rango.',
    'Para ser elegible para un ascenso, el integrante debe haber participado en guerra como mínimo una temporada completa.',
    'La participación en guerras continúa siendo obligatoria para todos los integrantes de los clanes terna, independientemente del rango que tengan.',
    'El respeto hacia los demás jugadores es obligatorio y será un factor determinante al momento de evaluar los ascensos. Se podrá perder el derecho a ser ascendido si se detectan abusos de poder, abuso de autoridad o conductas inapropiadas relacionadas con el rango.',
    'Cualquier jugador que cometa una falta podrá ser sancionado, según la gravedad de la misma, con degradación de rango, suspensión o prohibición permanente de recibir ascensos o participar en los clanes TERNA.',
    'Los jugadores expulsados o sancionados NO serán ascendidos.'
  ].forEach(function (texto) {
    body.appendListItem(texto).setGlyphType(DocumentApp.GlyphType.BULLET);
  });

  // --- Aviso sobre reclamos ----------------------------------------------
  _rdocParrafoTexto(body, 'Aviso sobre reclamos', true);
  _rdocParrafoTexto(body, 'Si consideras que existe un error en las listas publicadas, ya sea porque deberías figurar en la lista de ascensos y no apareces, o porque figuras en la lista de descensos y consideras que no corresponde, deberás presentar tu reclamo ante la administración, etiquetando a los líderes o colíderes de tu respectivo clan, dentro de las 24 horas posteriores a la publicación de estas listas.', false);
  _rdocParrafoTexto(body, 'Una vez transcurrido dicho plazo, se perderá el derecho a presentar reclamos o solicitar modificaciones. Por ello, es responsabilidad de cada participante revisar las listas con atención y presentar cualquier reclamo dentro del plazo establecido.', false);

  // --- Ascensos / Descensos ----------------------------------------------- [→ Contexto_Base_Web.md §25B042]
  _rdocParrafoTexto(body, 'Ascensos:', true);
  _rdocADBloqueClanAscensoDescenso(body, 'Veterano', 'Colíder', 'Ascenso de clan');

  _rdocParrafoTexto(body, 'Descensos:', true);
  _rdocADBloqueClanAscensoDescenso(body, 'Miembro', 'Veterano');

  // --- Redes sociales oficiales + pie -------------------------------------- [→ Contexto_Base_Web.md §25B043]
  _rdocBloqueRedesSocialesYPie(body);
}

// 3) Temporada a mostrar (Extra!Mostrar, buscada por NOMBRE de columna, [→ Contexto_Base_Web.md §25B005]

function _getExtraMostrarTemporada(ss, ctxReal) {
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!shExtra || shExtra.getLastRow() < 2) return temporadaMostrar;

  var headers = shExtra.getRange(1, 1, 1, shExtra.getLastColumn()).getValues()[0];
  var colMostrar = -1;
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === 'Mostrar_T') { colMostrar = i + 1; break; }
  }
  if (colMostrar === -1) {
    Logger.log('[AscensosDescensos] No se encontró la columna "Mostrar_T" en Extra; se usa la temporada real (' + ctxReal.temporada + ').');
    return temporadaMostrar;
  }

  var mostrarVal = shExtra.getRange(2, colMostrar).getValue();
  var temporadaExtra = Number(mostrarVal);
  if (temporadaExtra) temporadaMostrar = temporadaExtra;
  return temporadaMostrar;
}

/**
 * _rdocADTablaRango(body, trofeos, ataques) [→ Contexto_Base_Web.md §25B037]
 */
function _rdocADTablaRango(body, trofeos, ataques) {
  var filas = [
    [''].concat(_CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION),
    ['Medallas', _rdocADMiles(trofeos), _rdocADMiles(trofeos), _rdocADMiles(trofeos), _rdocADMiles(trofeos)],
    ['Ataques', String(ataques), String(ataques), String(ataques), String(ataques)]
  ];
  return _rdocTablaConEncabezadoNegrita(body, filas);
}

/**
 * _rdocADMiles(n) [→ Contexto_Base_Web.md §25B036]
 */
function _rdocADMiles(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * _rdocADBloqueFuncion(body, items) [→ Contexto_Base_Web.md §25B038]
 */
function _rdocADBloqueFuncion(body, items) {
  _rdocParrafoTexto(body, 'Función', true);
  for (var i = 0; i < items.length; i++) {
    body.appendListItem(items[i]).setGlyphType(DocumentApp.GlyphType.BULLET);
  }
}

/**
 * _rdocADBloqueClanAscensoDescenso(body, etiquetaSubA, etiquetaSubB) [→ Contexto_Base_Web.md §25B039]
 */
function _rdocADBloqueClanAscensoDescenso(body, etiquetaSubA, etiquetaSubB, etiquetaSubClan) {
  for (var i = 0; i < _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION.length; i++) {
    _rdocParrafoTexto(body, _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION[i] + ':', true);
    _rdocParrafoTexto(body, etiquetaSubA, false);
    body.appendListItem('').setGlyphType(DocumentApp.GlyphType.BULLET);
    _rdocParrafoTexto(body, etiquetaSubB, false);
    body.appendListItem('').setGlyphType(DocumentApp.GlyphType.BULLET);
    // 4-oct-2026: 'Ascenso de clan' (opcional, solo en 'Ascensos:'). Se omite en el primer clan
    // de la lista (el principal): ahi el Colider nunca sube de clan.
    if (etiquetaSubClan && i > 0) {
      _rdocParrafoTexto(body, etiquetaSubClan, false);
      body.appendListItem('').setGlyphType(DocumentApp.GlyphType.BULLET);
    }
  }
}

// --- Tema: documento «Cambio de rango» (PF286, 28-oct-2026): listas por clan, tablas de requisitos por rango y reglas; las usa actualizarDocCambioRango() (29_Docs_NoCalificados.gs) [→ Contexto_Base_Web.md §PF286] ---

/**
 * _agruparCambiosAplicadosPorClan_(aplicados, ordenClanes) — función pura (se prueba en Node, sin hojas).
 * Reparte los cambios realmente aplicados de una corrida (los «Realizado» que devuelve _corridaCambioRangoDesdeRegistros_(), 24) por clan y por sección (CR_SECCIONES_APLICADOS_).
 * Devuelve un arreglo { clan, secciones: { ascensos, ascensosClan, descensos, expulsiones, admin } } con TODOS los clanes de `ordenClanes` (aunque no tengan cambios) y, al final, los clanes que aparezcan en los datos y no estén en esa lista.
 * Cada elemento de una sección es { nombre, de, a }; se ordenan por nombre. Un cambio con un tipo que no es de ninguna sección se ignora.
 */
function _agruparCambiosAplicadosPorClan_(aplicados, ordenClanes) {
  var porClan = {};
  var orden = (ordenClanes || []).slice();
  function bloqueDe(clan) {
    if (!porClan[clan]) {
      porClan[clan] = { clan: clan, secciones: {} };
      CR_SECCIONES_APLICADOS_.forEach(function (s) { porClan[clan].secciones[s.clave] = []; });
      if (orden.indexOf(clan) === -1) orden.push(clan);
    }
    return porClan[clan];
  }
  orden.slice().forEach(bloqueDe);

  (aplicados || []).forEach(function (r) {
    var seccion = null;
    CR_SECCIONES_APLICADOS_.forEach(function (s) { if (s.tipo === r.tipo) seccion = s; });
    if (!seccion) return;
    bloqueDe(r.clan || 'Sin clan').secciones[seccion.clave].push({ nombre: r.nombre, de: r.rango, a: r.rango2 });
  });

  var porNombre = function (a, b) { return String(a.nombre).localeCompare(String(b.nombre), 'es', { sensitivity: 'base' }); };
  return orden.map(function (c) {
    CR_SECCIONES_APLICADOS_.forEach(function (s) { porClan[c].secciones[s.clave].sort(porNombre); });
    return porClan[c];
  });
}

/**
 * _textoCambioAplicado_(c) — función pura. Línea de una lista: «Nombre (Miembro → Veterano)»; si no hay rango nuevo (Expulsión, Ascenso de clan, Elegible Admin), «Nombre (Colíder)»; si tampoco hay rango anterior, solo el nombre.
 */
function _textoCambioAplicado_(c) {
  var nombre = String(c.nombre || '').trim() || '(sin nombre)';
  var de = String(c.de || '').trim();
  var a = String(c.a || '').trim();
  if (de && a) return nombre + ' (' + de + ' → ' + a + ')';
  if (de) return nombre + ' (' + de + ')';
  return nombre;
}

/**
 * _agregarListasCambiosAplicadosADoc_(body, grupos)
 * Escribe al final del documento las listas por clan de los cambios realmente aplicados (los `grupos` de _agruparCambiosAplicadosPorClan_()). Un clan sin cambios dice «Sin cambios aplicados.».
 */
function _agregarListasCambiosAplicadosADoc_(body, grupos) {
  _rdocParrafoTexto(body, 'Cambios aplicados por clan', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  grupos.forEach(function (g) {
    _rdocParrafoTexto(body, g.clan + ':', true);
    var hayAlgo = false;
    CR_SECCIONES_APLICADOS_.forEach(function (s) {
      var lista = g.secciones[s.clave];
      if (!lista.length) return;
      hayAlgo = true;
      _rdocParrafoTexto(body, s.titulo, false);
      lista.forEach(function (c) {
        body.appendListItem(_textoCambioAplicado_(c)).setGlyphType(DocumentApp.GlyphType.BULLET);
      });
    });
    if (!hayAlgo) _rdocParrafoTexto(body, 'Sin cambios aplicados.', false);
  });
}

/**
 * _filasTablaRequisitosRango_(filaCR, rol) — función pura. Filas de la tabla de requisitos de un rol (miembro, veterano o colider) leídas de una fila de CR_Lista (la que devuelve _getFilaCRListaPorId(), 26): encabezado con los clanes y una fila «Medallas» y otra «Ataques»; una fila se omite si ningún clan la exige. Devuelve null si no se exige nada.
 */
function _filasTablaRequisitosRango_(filaCR, rol) {
  var clanes = (filaCR && filaCR.porClan) || [];
  var encabezado = [''].concat(clanes.map(function (b) { return b.clan; }));
  var filaMedallas = ['Medallas'];
  var filaAtaques = ['Ataques'];
  var hayMedallas = false;
  var hayAtaques = false;
  clanes.forEach(function (b) {
    var m = b.minCR[rol];
    var a = b.ataques[rol];
    if (m && m.activo) hayMedallas = true;
    if (a && a.activo) hayAtaques = true;
    filaMedallas.push(_formatearQtyCelda(m, true));
    filaAtaques.push(_formatearQtyCelda(a, false));
  });
  var filas = [encabezado];
  if (hayMedallas) filas.push(filaMedallas);
  if (hayAtaques) filas.push(filaAtaques);
  return filas.length > 1 ? filas : null;
}

/**
 * _agregarTablasRequisitosRangoADoc_(body, filaAscenso, filaDescenso)
 * Escribe al final del documento las tablas de requisitos por rango (antes las llenaba actualizarTablasRangosDoc() sobre un documento armado a mano): para ascender se usa la fila de Ascenso de CR_Lista y para conservar el rango o permanecer, la de Descenso, con el mismo mapeo de roles que usaba esa función. Los dos tipos de Colíder (A y B) del documento viejo comparten requisitos en CR_Lista, así que ahora hay una sola sección de Colíder.
 */
function _agregarTablasRequisitosRangoADoc_(body, filaAscenso, filaDescenso) {
  var secciones = [
    { titulo: '1.     Miembro', bloques: [
      { encabezado: RT_ENCABEZADO_PERMANECER, fila: filaDescenso, rol: 'miembro' }
    ] },
    { titulo: '2.     Veterano', bloques: [
      { encabezado: RT_ENCABEZADO_ASCENDER,  fila: filaAscenso,  rol: 'miembro' },
      { encabezado: RT_ENCABEZADO_CONSERVAR, fila: filaDescenso, rol: 'veterano' }
    ] },
    { titulo: '3.     Colíder', bloques: [
      { encabezado: RT_ENCABEZADO_ASCENDER,  fila: filaAscenso,  rol: 'veterano' },
      { encabezado: RT_ENCABEZADO_CONSERVAR, fila: filaDescenso, rol: 'colider' }
    ] }
  ];

  _rdocParrafoTexto(body, 'Requisitos por rango', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Promedio semanal de medallas de guerra y ataques que se pide en las semanas evaluadas, según el clan al que pertenece el jugador.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  secciones.forEach(function (s) {
    _rdocParrafoTexto(body, s.titulo, true);
    s.bloques.forEach(function (b) {
      _rdocParrafoTexto(body, b.encabezado, true);
      var filas = _filasTablaRequisitosRango_(b.fila, b.rol);
      if (filas) _rdocTablaConEncabezadoNegrita(body, filas);
      else _rdocParrafoTexto(body, 'Sin requisitos exigidos para este rango.', false);
    });
  });
}

/**
 * _agregarReglasCambioRangoADoc_(body)
 * Escribe las reglas y el aviso sobre reclamos que tenía el documento «Ascensos y descensos» armado a mano (textos de _construirContenidoDocAscensosDescensos(), sin cambios), para que no se pierdan cuando el documento se reescribe entero.
 */
function _agregarReglasCambioRangoADoc_(body) {
  _rdocParrafoTexto(body, 'Reglas', true);
  [
    'Las listas de ascensos y descensos se publicarán al terminar cada coliseo (aproximadamente a fin de mes).',
    'Se hace solo un cambio de rango por temporada para cada persona, entonces; si ya fuiste ascendido o degradado esta temporada, debes esperar hasta el siguiente fin de coliseo para volver a cambiar de rango.',
    'Para ser elegible para un ascenso, el integrante debe haber participado en guerra como mínimo una temporada completa.',
    'La participación en guerras continúa siendo obligatoria para todos los integrantes de los clanes terna, independientemente del rango que tengan.',
    'El respeto hacia los demás jugadores es obligatorio y será un factor determinante al momento de evaluar los ascensos. Se podrá perder el derecho a ser ascendido si se detectan abusos de poder, abuso de autoridad o conductas inapropiadas relacionadas con el rango.',
    'Cualquier jugador que cometa una falta podrá ser sancionado, según la gravedad de la misma, con degradación de rango, suspensión o prohibición permanente de recibir ascensos o participar en los clanes TERNA.',
    'Los jugadores expulsados o sancionados NO serán ascendidos.'
  ].forEach(function (texto) {
    body.appendListItem(texto).setGlyphType(DocumentApp.GlyphType.BULLET);
  });

  _rdocParrafoTexto(body, 'Aviso sobre reclamos', true);
  _rdocParrafoTexto(body, 'Si consideras que existe un error en las listas publicadas, ya sea porque deberías figurar en la lista de ascensos y no apareces, o porque figuras en la lista de descensos y consideras que no corresponde, deberás presentar tu reclamo ante la administración, etiquetando a los líderes o colíderes de tu respectivo clan, dentro de las 24 horas posteriores a la publicación de estas listas.', false);
  _rdocParrafoTexto(body, 'Una vez transcurrido dicho plazo, se perderá el derecho a presentar reclamos o solicitar modificaciones. Por ello, es responsabilidad de cada participante revisar las listas con atención y presentar cualquier reclamo dentro del plazo establecido.', false);
}

// --- Tema: semanas de la temporada (las usan otros archivos) ---

function _limpiarMemoSemanasTemporada_() { _SEMANAS_TEMPORADA_MEMO = {}; }

function _getSemanasDeTemporada(temporada) {
  var clave = String(temporada);
  if (Object.prototype.hasOwnProperty.call(_SEMANAS_TEMPORADA_MEMO, clave)) return _SEMANAS_TEMPORADA_MEMO[clave];
  var pl = primerLunesTemporada(CFG.REF_DEFAULT, temporada);
  var n = lunesEnMes(pl.getFullYear(), pl.getMonth());
  _SEMANAS_TEMPORADA_MEMO[clave] = n;
  return n;
}
