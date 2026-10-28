// ==============================================================================
// 25_Doc_AscensosDescensos.gs
// Documento 'Ascensos y descensos' (hoy «Cambio de rango»): ayudas para escribir en él las listas por clan de los
// cambios aplicados, las tablas de requisitos por rango y las reglas (las llama actualizarDocCambioRango() de 29_Docs_NoCalificados.gs).
// 28-oct-2026 (PF286 punto 23): se quitaron actualizarDocAscensosDescensos(), actualizarTablasRangosDoc() y sus ayudas (nadie las llamaba y escribían en el mismo documento con otro diseño); también el constructor viejo de reconstrucción (_construirContenidoDocAscensosDescensos y ayudas) y las constantes NOMBRE_DOC_ASCENSOS_DESCENSOS / DOC_ID_ASCENSOS_DESCENSOS (el documento es el de NOMBRE_DOC_CAMBIO_RANGO / DOC_ID_CAMBIO_RANGO, 29_Docs_NoCalificados.gs).
// ==============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: reconstruirDocAscensosDescensosSiFalta()
//  Parte 2 — Funciones que no se corren a mano
//    - Listas por clan, tablas de requisitos y reglas del documento «Cambio de rango» (al final del archivo)
//    - Tablas de requisitos por rango (_formatearQtyCelda)
//    - Semanas de la temporada (ayuda que usan otros archivos)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// ----- Variables y constantes -----

// 25_Doc_AscensosDescensos.gs [→ Contexto_Base_Web.md §25B001]

// 1) T_REQ_CATEGORIAS — HISTÓRICO, ya no aplica [→ Contexto_Base_Web.md §25B002]

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
  var archivo = _buscarArchivoEnPlantillas(NOMBRE_DOC_CAMBIO_RANGO, DOC_ID_CAMBIO_RANGO);
  if (archivo) {
    Logger.log('[ReconstruirDocs] "' + NOMBRE_DOC_CAMBIO_RANGO + '" OK (existe, ID: ' + archivo.getId() + ').');
  } else {
    Logger.log('[ReconstruirDocs] "' + NOMBRE_DOC_CAMBIO_RANGO + '" NO se pudo encontrar NI recrear. Revisar permisos de Drive / DRIVE_FOLDER_ID_PLANTILLAS_OTRAS.');
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
