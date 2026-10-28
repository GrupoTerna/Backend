// ==============================================================================
// 27_Torneos_Sorteos_Requisitos.gs
// Torneo/Sorteo: sincronizacion de los textos de "Requisitos:" y premios
// hacia los documentos correspondientes, y utilidades relacionadas
// (_getMinTPorNombreClan(), _reescribirRequisitosTexto(), etc.). 
// ==============================================================================

// Ya NO depende de la hoja T_Requisitos (dada de baja el 14-sep-2026) — la [→ Contexto_Base_Web.md §27B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: ninguna (sincronizarRequisitosYPremiosTorneo() y sincronizarRequisitosSorteo() las llaman 26_Torneos_Core.gs y 00_Main.gs)
//  Parte 2 — Funciones que no se corren a mano
//    - Puntos de entrada: sincronización de requisitos y premios del torneo y del sorteo
//    - Funciones internas: requisitos (resumen, texto del documento y sus ayudas, en el orden en que se llaman)
//    - Premios en el documento
//    - Copia de los premios de la fecha a Ganadores (torneo)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// ----- Variables y constantes -----

// BAJA DEFINITIVA (14-sep-2026, pedido del usuario -- Fase 9 completa): se [→ Contexto_Base_Web.md §27B002]

// --- Textos de las líneas automatizadas (editar aquí si hace falta otra redacción) --- [→ Contexto_Base_Web.md §27B003]
var REQ_DOC_TEXTO_ATAQUES_HEADER = 'Solo participan miembros del clan que jueguen sus guerras completas (ataques semanales mínimos por clan):';

var REQ_DOC_TEXTO_MIEMBRO_ACTIVO = 'Jugadores expulsados o sancionados NO participan';

var REQ_DOC_TEXTO_REACCION = 'Reaccionar a la publicación de este comunicado en redes sociales.';

// FIX (11-sep-2026, pedido del usuario -- consolidado sección 1, cierre de [→ Contexto_Base_Web.md §27B004]
var REQ_DOC_TEXTO_WHATSAPP = 'Formar parte del grupo de WhatsApp del clan.';

var REQ_DOC_TEXTO_TORNEOS_HEADER = 'Haber participado, al menos, en la siguiente cantidad de torneos de la temporada (por clan):';

// FIX (12-sep-2026, pedido del usuario -- requisito "Barcos", tercera [→ Contexto_Base_Web.md §27B005]

// Ordinales usados para las líneas de puesto -- en la práctica, hasta hoy, [→ Contexto_Base_Web.md §27B020]
var _ORDINALES_PUESTO_PREMIO = [
  'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto',
  'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'
];

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Puntos de entrada: sincronización de requisitos y premios -----

/**
 * sincronizarRequisitosYPremiosTorneo() [→ Contexto_Base_Web.md §27B006]
 */
function sincronizarRequisitosYPremiosTorneo() {
  var bloque = _getConfigMasRecienteCategoria('Torneo');
  if (bloque.length === 0) {
    Logger.log('[Requisitos-Torneo] T_Lista no tiene ninguna fila con Clan asignado todavía. Se omite.');
    return;
  }
  var resumen = _resumirRequisitosBloque(bloque);

  var mesEfectivo = _calcularMesEfectivoRealDeHoy();
  var nombreMes = _MESES_ES[mesEfectivo.mes];

  var finPredicadosTorneo = [
    function (t) { return t.indexOf('Si se detecta trampa') !== -1; }
  ];

  var targets = [
    { nombre: NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO, id: DOC_ID_PARTICIPANTES_CALIFICADOS_TORNEO },
    { nombre: NOMBRE_DOC_GANADORES_TORNEO, id: DOC_ID_GANADORES_TORNEO }
  ];

  for (var t = 0; t < targets.length; t++) {
    var target = targets[t];
    var archivo;
    try {
      archivo = _buscarArchivoEnPlantillas(target.nombre, target.id);
    } catch (e) {
      Logger.log('[Requisitos-Torneo] Error al buscar "' + target.nombre + '": ' + e.message);
      continue;
    }
    if (!archivo) {
      Logger.log('[Requisitos-Torneo] No se encontró "' + target.nombre + '". Se omite.');
      continue;
    }

    var doc;
    try {
      doc = DocumentApp.openById(archivo.getId());
    } catch (e) {
      Logger.log('[Requisitos-Torneo] Error al abrir "' + target.nombre + '": ' + e.message);
      continue;
    }

    _escribirPremiosEnDoc(doc.getBody(), bloque[0].premios, '[Premios-Torneo]');
    _reescribirRequisitosTexto(doc.getBody(), resumen, nombreMes, finPredicadosTorneo, '[Requisitos-Torneo]');
    doc.saveAndClose();
  }

  _copiarPremiosFechaAGanadoresTorneo();

  Logger.log('[Requisitos-Torneo] Texto de Requisitos actualizado (categoría "Torneo", vía T_Lista) — ' +
    'Min_T: ' + (resumen.ordenClanesMinT.join(', ') || '(ninguno)') +
    ' | Ataques: ' + (resumen.ordenClanesAtaques.length ? resumen.ordenClanesAtaques.map(function (c) { return c + '=' + resumen.ataquesPorClan[c]; }).join(', ') : '(ninguno)') +
    ' | Torneos: ' + (resumen.ordenClanesTorneos.length ? resumen.ordenClanesTorneos.map(function (c) { return c + '=' + resumen.torneosPorClan[c]; }).join(', ') : '(ninguno)') +
    ' | Barcos:' + (resumen.barcosActivo ? ('máximo ' + resumen.barcosQty) : 'No') +
    ' | Miembro activo:' + (resumen.miembroActivoActivo ? 'Sí' : 'No') +
    ' | Reacción:' + (resumen.reaccionActivo ? 'Sí' : 'No') +
    ' | WhatsApp:' + (resumen.whatsappActivo ? 'Sí' : 'No') + '.');
}

/**
 * sincronizarRequisitosSorteo() [→ Contexto_Base_Web.md §27B007]
 */
function sincronizarRequisitosSorteo() {
  var bloque = _getConfigMasRecienteCategoria('Sorteo');
  if (bloque.length === 0) {
    Logger.log('[Requisitos-Sorteo] S_Lista no tiene ninguna fila con Clan asignado todavía. Se omite.');
    return;
  }
  var resumen = _resumirRequisitosBloque(bloque);

  var mesEfectivo = _calcularMesEfectivoRealDeHoy();
  var nombreMes = _MESES_ES[mesEfectivo.mes];

  // ACTUALIZACIÓN (08/08/2026 — verificado contra los 4 .docx reales [→ Contexto_Base_Web.md §27B008]
  var finPredicadosSorteo = [
    function (t) { return t.indexOf('Si se detecta trampa') !== -1; },
    function (t) { return t.trim() === 'Participantes calificados:'; },
    function (t) { return t.trim() === 'Ganadores:'; },
    function (t) { return t.trim() === 'Ganadores del sorteo:'; }
  ];

  var targets = [
    { nombre: NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_SORTEO, id: DOC_ID_PARTICIPANTES_CALIFICADOS_SORTEO },
    { nombre: NOMBRE_DOC_GANADORES_SORTEO, id: DOC_ID_GANADORES_SORTEO }
  ];

  for (var t = 0; t < targets.length; t++) {
    var target = targets[t];
    var archivo;
    try {
      archivo = _buscarArchivoEnPlantillas(target.nombre, target.id);
    } catch (e) {
      Logger.log('[Requisitos-Sorteo] Error al buscar "' + target.nombre + '": ' + e.message);
      continue;
    }
    if (!archivo) {
      Logger.log('[Requisitos-Sorteo] No se encontró "' + target.nombre + '". Se omite.');
      continue;
    }

    var doc;
    try {
      doc = DocumentApp.openById(archivo.getId());
    } catch (e) {
      Logger.log('[Requisitos-Sorteo] Error al abrir "' + target.nombre + '": ' + e.message);
      continue;
    }

    _escribirPremiosEnDoc(doc.getBody(), bloque[0].premios, '[Premios-Sorteo]');
    _reescribirRequisitosTexto(doc.getBody(), resumen, nombreMes, finPredicadosSorteo, '[Requisitos-Sorteo]', { sorteo: true });
    doc.saveAndClose();
  }

  Logger.log('[Requisitos-Sorteo] Texto de Requisitos actualizado (categoría "Sorteo", vía S_Lista) — ' +
    'Min_T: ' + (resumen.ordenClanesMinT.join(', ') || '(ninguno)') +
    ' | Ataques: ' + (resumen.ordenClanesAtaques.length ? resumen.ordenClanesAtaques.map(function (c) { return c + '=' + resumen.ataquesPorClan[c]; }).join(', ') : '(ninguno)') +
    ' | Torneos: ' + (resumen.ordenClanesTorneos.length ? resumen.ordenClanesTorneos.map(function (c) { return c + '=' + resumen.torneosPorClan[c]; }).join(', ') : '(ninguno)') +
    ' | Barcos:' + (resumen.barcosActivo ? ('máximo ' + resumen.barcosQty) : 'No') +
    ' | Miembro activo:' + (resumen.miembroActivoActivo ? 'Sí' : 'No') +
    ' | Reacción:' + (resumen.reaccionActivo ? 'Sí' : 'No') +
    ' | WhatsApp:' + (resumen.whatsappActivo ? 'Sí' : 'No') + '.');
}

// ----- Funciones internas / helpers -----

// BAJA DEFINITIVA (17-sep-2026, pedido del usuario -- "borra todo el [→ Contexto_Base_Web.md §27B010]

/**
 * _resumirRequisitosBloque(bloqueClanes) [→ Contexto_Base_Web.md §27B011]
 */
function _resumirRequisitosBloque(bloqueClanes) {
  var out = {
    minTPorClan: {},
    ordenClanesMinT: [],
    ataquesPorClan: {},
    ordenClanesAtaques: [],
    torneosPorClan: {},
    ordenClanesTorneos: [],
    miembroActivoActivo: false,
    reaccionActivo: false,
    whatsappActivo: false,
    barcosActivo: false,
    barcosQty: 0,
    semanas: (bloqueClanes[0] && bloqueClanes[0].semanas) ? bloqueClanes[0].semanas : [] // PF205: semanas evaluadas (columna Semanas de S_Lista)
  };

  bloqueClanes.forEach(function (b) {
    if (b.minT.activo) {
      out.minTPorClan[b.clan] = b.minT.qty;
      out.ordenClanesMinT.push(b.clan);
    }
    if (b.ataques.activo) {
      out.ataquesPorClan[b.clan] = b.ataques.qty;
      out.ordenClanesAtaques.push(b.clan);
    }
    if (b.torneos.activo) {
      out.torneosPorClan[b.clan] = b.torneos.qty;
      out.ordenClanesTorneos.push(b.clan);
    }
    if (b.miembroActivo.activo) out.miembroActivoActivo = true;
    if (b.reaccion.activo) out.reaccionActivo = true;
    if (b.whatsapp && b.whatsapp.activo) out.whatsappActivo = true;
    if (b.barcos && b.barcos.activo) {
      out.barcosActivo = true;
      out.barcosQty = b.barcos.qty;
    }
  });

  return out;
}

/**
 * _getMinTPorNombreClan(nombreCategoria) [→ Contexto_Base_Web.md §27B012]
 */
function _getMinTPorNombreClan(nombreCategoria) {
  var bloque = _getConfigMasRecienteCategoria(nombreCategoria);
  var minTPorNombreClan = {};
  var clanesOrden = [];
  bloque.forEach(function (b) {
    if (!b.minT.activo) return;
    minTPorNombreClan[b.clan] = b.minT.qty > 0 ? b.minT.qty : CFG.MIN_T_DEFAULT;
    clanesOrden.push(b.clan);
  });
  return { clanesOrden: clanesOrden, minTPorNombreClan: minTPorNombreClan };
}

/**
 * _reescribirRequisitosTexto(body, resumen, nombreMes, finPredicados, logTag) [→ Contexto_Base_Web.md §27B014]
 */
function _reescribirRequisitosTexto(body, resumen, nombreMes, finPredicados, logTag, opciones) {
  var sorteo = !!(opciones && opciones.sorteo); // PF205: texto del sorteo (semanas evaluadas, barcos acumulados, «expulsados» siempre)
  var semanasSorteo = sorteo ? (resumen.semanas || []) : [];
  var idxReq = _buscarIndiceHijo(body, function (t) { return t.trim() === 'Requisitos:'; });
  if (idxReq === -1) {
    Logger.log((logTag || '[Requisitos]') + ' No se encontró el marcador "Requisitos:" en el documento. Se omite.');
    return;
  }

  var n = body.getNumChildren();
  var idxFin = -1;
  for (var i = idxReq + 1; i < n; i++) {
    var texto = body.getChild(i).getText();
    var coincide = false;
    for (var p = 0; p < finPredicados.length; p++) {
      if (finPredicados[p](texto)) { coincide = true; break; }
    }
    if (coincide) { idxFin = i; break; }
  }
  if (idxFin === -1) {
    Logger.log((logTag || '[Requisitos]') + ' No se encontró ningún marcador de cierre después de "Requisitos:" en el documento. Se omite (no se toca nada para no borrar de más).');
    return;
  }

  for (var r = idxFin - 1; r > idxReq; r--) {
    body.removeChild(body.getChild(r));
  }

  var insertAt = idxReq + 1;

  // PF206 (24-oct-2026, pedido de la usuaria): en el sorteo, una viñeta propia «Semanas a evaluar» y debajo una fila por semana
  // («Temporada 6, semana 2 (12 oct - 18 oct)»), en vez de los códigos T6_S2 dentro de la línea de medallas.
  if (sorteo && semanasSorteo.length) {
    insertAt = _insertarBulletRequisito(body, insertAt, 'Semanas a evaluar:');
    _ordenarSemanasSorteoDoc(semanasSorteo).forEach(function (sem) {
      insertAt = _insertarFilaRequisito(body, insertAt, _etiquetaSemanaSorteoDoc(sem));
    });
  }

  if (resumen.ordenClanesMinT.length > 0) {
    var textoMedallas = (sorteo && semanasSorteo.length)
      ? 'Alcanzar el promedio semanal mínimo de medallas en guerra en las semanas evaluadas:'
      : 'Alcanzar el mínimo de medallas en guerra durante la semana actual (' + nombreMes + '):';
    insertAt = _insertarBloquePorClan(body, insertAt,
      textoMedallas,
      resumen.ordenClanesMinT, resumen.minTPorClan,
      sorteo ? _fmtMilesComa : function (qty) { return String(qty); }); // PF206: en el sorteo, separador de miles con coma
  }

  if (resumen.ordenClanesAtaques.length > 0) {
    insertAt = _insertarBloquePorClan(body, insertAt,
      REQ_DOC_TEXTO_ATAQUES_HEADER,
      resumen.ordenClanesAtaques, resumen.ataquesPorClan,
      _REQ_DOC_TEXTO_ATAQUES_VALOR);
  }

  if (resumen.ordenClanesTorneos.length > 0) {
    insertAt = _insertarBloquePorClan(body, insertAt,
      REQ_DOC_TEXTO_TORNEOS_HEADER,
      resumen.ordenClanesTorneos, resumen.torneosPorClan,
      _REQ_DOC_TEXTO_TORNEOS_VALOR);
  }

  // FIX (12-sep-2026, pedido del usuario -- requisito "Barcos", tercera [→ Contexto_Base_Web.md §27B015]
  if (resumen.barcosActivo) {
    insertAt = _insertarBulletRequisito(body, insertAt, _REQ_DOC_TEXTO_BARCOS(resumen.barcosQty, sorteo ? semanasSorteo.length : 0));
  }

  if (resumen.miembroActivoActivo || sorteo) { // PF205: en el sorteo «expulsados o sancionados NO participan» va siempre
    insertAt = _insertarBulletRequisito(body, insertAt, REQ_DOC_TEXTO_MIEMBRO_ACTIVO);
  }

  if (resumen.reaccionActivo) {
    insertAt = _insertarBulletRequisito(body, insertAt, REQ_DOC_TEXTO_REACCION);
  }

  // FIX (11-sep-2026, ver docblock de REQ_DOC_TEXTO_WHATSAPP): rama nueva,
  // mismo patrón que Reacción.
  if (resumen.whatsappActivo) {
    insertAt = _insertarBulletRequisito(body, insertAt, REQ_DOC_TEXTO_WHATSAPP);
  }
}

/**
 * _buscarIndiceHijo(body, predicado) [→ Contexto_Base_Web.md §27B013]
 */
function _buscarIndiceHijo(body, predicado) {
  var n = body.getNumChildren();
  for (var i = 0; i < n; i++) {
    if (predicado(body.getChild(i).getText())) return i;
  }
  return -1;
}

/**
 * _insertarBulletRequisito(body, insertAt, texto) [→ Contexto_Base_Web.md §27B017]
 */
function _insertarBulletRequisito(body, insertAt, texto) {
  var BULLET = '\u25CF';
  var TAB_FINGIDO = '      '; // 6 espacios, igual que el resto del documento
  var lineaCompleta = BULLET + TAB_FINGIDO + texto;

  var p = body.insertParagraph(insertAt, '');
  p.setIndentStart(54);       // equivalente a left="1080" (twips) del .docx
  p.setIndentFirstLine(36);   // hanging de 18pt, igual que los demás bullets
  p.setBold(false);

  var t = p.editAsText();
  t.appendText(lineaCompleta);
  var fin = lineaCompleta.length - 1;

  t.setFontFamily(0, fin, 'Arial');
  t.setFontSize(0, fin, 12);
  t.setBold(0, fin, false);
  t.setUnderline(0, fin, false);
  t.setForegroundColor(0, fin, '#000000');
  t.setLinkUrl(0, fin, null);

  var tabInicio = BULLET.length;
  var tabFin = tabInicio + TAB_FINGIDO.length - 1;
  t.setFontFamily(tabInicio, tabFin, 'Times New Roman');
  t.setFontSize(tabInicio, tabFin, 7);

  return insertAt + 1;
}

/**
 * PF206. _ordenarSemanasSorteoDoc(semanas): copia ordenada de menor a mayor (temporada y luego semana); no toca el orden de S_Lista.
 */
function _ordenarSemanasSorteoDoc(semanas) {
  return (semanas || []).slice().sort(function (a, b) {
    return (a.temporada - b.temporada) || (a.semana - b.semana);
  });
}

/**
 * PF206. _insertarFilaRequisito(body, insertAt, texto): fila sin viñeta, con la misma sangría y fuente que las filas por clan.
 */
function _insertarFilaRequisito(body, insertAt, texto) {
  var p = body.insertParagraph(insertAt, '');
  p.setIndentStart(72);
  p.setIndentFirstLine(72);
  var t = p.editAsText();
  t.appendText(texto);
  var fin = texto.length - 1;
  t.setBold(0, fin, false);
  t.setItalic(0, fin, false);
  t.setFontFamily(0, fin, 'Arial Unicode MS');
  t.setFontSize(0, fin, 12);
  t.setUnderline(0, fin, false);
  t.setForegroundColor(0, fin, '#000000');
  t.setLinkUrl(0, fin, null);
  return insertAt + 1;
}

/**
 * PF206. _etiquetaSemanaSorteoDoc({temporada, semana}): «Temporada 6, semana 2 (12 oct - 18 oct)». Las fechas son el lunes y el domingo
 * reales de esa semana (_getRangoFechasSemana); si no se pueden calcular, se omite el paréntesis.
 */
function _etiquetaSemanaSorteoDoc(sem) {
  var txt = 'Temporada ' + sem.temporada + ', semana ' + sem.semana;
  try {
    var r = _getRangoFechasSemana(sem.temporada, Number(sem.semana) - 1);
    if (r && r.inicio && r.fin) {
      var f = function (d) { return d.getDate() + ' ' + _MESES_ES[d.getMonth()].substring(0, 3); };
      txt += ' (' + f(r.inicio) + ' - ' + f(r.fin) + ')';
    }
  } catch (e) { /* sin fechas, la etiqueta igual sirve */ }
  return txt;
}

/**
 * _insertarBloquePorClan(body, insertAt, textoHeader, ordenClanes, valoresPorClan, formatearValor) [→ Contexto_Base_Web.md §27B016]
 */
function _insertarBloquePorClan(body, insertAt, textoHeader, ordenClanes, valoresPorClan, formatearValor) {
  insertAt = _insertarBulletRequisito(body, insertAt, textoHeader);

  for (var c = 0; c < ordenClanes.length; c++) {
    var nombreClan = ordenClanes[c];
    var etiqueta = nombreClan + ': ';
    var p = body.insertParagraph(insertAt++, '');
    p.setIndentStart(72);
    p.setIndentFirstLine(72);
    var texto = p.editAsText();
    texto.appendText(etiqueta);
    texto.appendText('\t' + formatearValor(valoresPorClan[nombreClan]));
    var fin = texto.getText().length - 1;
    texto.setBold(0, etiqueta.length - 1, true);
    texto.setBold(etiqueta.length, fin, false);
    texto.setFontFamily(0, fin, 'Arial Unicode MS');
    texto.setFontSize(0, fin, 12);
    texto.setUnderline(0, fin, false);
    texto.setForegroundColor(0, fin, '#000000');
    texto.setLinkUrl(0, fin, null);
  }

  return insertAt;
}

/**
 * PF206 (24-oct-2026). _fmtMilesComa(n): número con separador de miles con coma (12345 -> «12,345»), sin depender del idioma del
 * proyecto de Apps Script. Conserva hasta un decimal si lo trae.
 */
function _fmtMilesComa(n) {
  var v = Number(n);
  if (isNaN(v)) return String(n);
  var r = Math.round(v * 10) / 10;
  var partes = String(Math.abs(r)).split('.');
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (r < 0 ? '-' : '') + partes.join('.');
}

function _REQ_DOC_TEXTO_ATAQUES_VALOR(qty) {
  return qty + ' ataques semanales';
}

function _REQ_DOC_TEXTO_TORNEOS_VALOR(qty) {
  return 'al menos ' + qty + ' torneos';
}

/**
 * _REQ_DOC_TEXTO_BARCOS(qty) [→ Contexto_Base_Web.md §27B009]
 */
function _REQ_DOC_TEXTO_BARCOS(qty, nSemanas) {
  if (qty <= 0) return 'No se permite ningún ataque a barcos.';
  // PF205 (24-oct-2026, sorteo): con las semanas evaluadas conocidas, la línea dice el ACUMULADO permitido (tope semanal x semanas),
  // que es lo mismo que pedir que el promedio semanal no pase del tope (así se evalúa en _evaluarCalificacionSorteo_()).
  var n = Number(nSemanas) || 0;
  if (n > 0) {
    var total = qty * n;
    return 'Máximo ' + total + ' ' + (total === 1 ? 'ataque' : 'ataques') + ' a barcos permitidos en total durante ' +
      (n === 1 ? 'la semana evaluada' : 'las ' + n + ' semanas evaluadas') + ' (' + qty + ' por semana, en promedio).';
  }
  return 'Máximo ' + qty + ' ataques a barcos permitidos, en promedio semanal.';
}

// ----- Premios en el documento -----

/**
 * _escribirPremiosEnDoc(body, premiosStr, logTag) [→ Contexto_Base_Web.md §27B022]
 */
function _escribirPremiosEnDoc(body, premiosStr, logTag) {
  var tag = logTag || '[Premios]';
  var items = String(premiosStr || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (items.length === 0) {
    Logger.log(tag + ' Columna Premios vacía. Se omite (no se sobrescribe el documento).');
    return;
  }

  var idxPremios = _buscarIndiceHijo(body, function (t) { return t.trim() === 'Premios:'; });
  if (idxPremios === -1) {
    Logger.log(tag + ' No se encontró el marcador "Premios:" en el documento. Se omite.');
    return;
  }

  // Cierre del tramo: "ADICIONAL" (Torneo) o "Fecha:" exacto (Sorteo, y
  // red de seguridad para Torneo) -- lo que aparezca primero.
  var finPredicadosPremios = [
    function (t) { return t.indexOf('ADICIONAL') !== -1; },
    function (t) { return t.trim() === 'Fecha:'; }
  ];

  var n = body.getNumChildren();
  var idxGanadores = -1;
  var idxFin = -1;
  for (var i = idxPremios + 1; i < n; i++) {
    var texto = body.getChild(i).getText();
    if (idxGanadores === -1 && texto.indexOf('🏆') !== -1) {
      idxGanadores = i;
      continue;
    }
    if (idxGanadores !== -1) {
      var coincide = false;
      for (var p = 0; p < finPredicadosPremios.length; p++) {
        if (finPredicadosPremios[p](texto)) { coincide = true; break; }
      }
      if (coincide) { idxFin = i; break; }
    }
  }
  if (idxGanadores === -1 || idxFin === -1) {
    Logger.log(tag + ' No se encontraron los marcadores "🏆"/cierre ("ADICIONAL" o "Fecha:") después de "Premios:" en el documento. Se omite (no se toca nada para no borrar de más).');
    return;
  }

  for (var r = idxFin - 1; r >= idxGanadores; r--) {
    body.removeChild(body.getChild(r));
  }

  var insertAt = _insertarBulletPremiosGanadores(body, idxGanadores, items.length);

  for (var k = 0; k < items.length; k++) {
    var ordinal = _ORDINALES_PUESTO_PREMIO[k] || ((k + 1) + '°');
    insertAt = _insertarLineaPuestoPremio(body, insertAt, ordinal + ' puesto:', items[k]);
  }

  Logger.log(tag + ' Premios actualizados (' + items.length + ' puesto(s)).');
}

/**
 * _insertarLineaPuestoPremio(body, insertAt, etiqueta, valorCrudo) [→ Contexto_Base_Web.md §27B019]
 */
function _insertarLineaPuestoPremio(body, insertAt, etiqueta, valorCrudo) {
  var etiquetaConEspacio = etiqueta + ' ';
  var valor = _formatearValorPremioParaDoc(valorCrudo);

  var p = body.insertParagraph(insertAt, '');
  p.setIndentStart(72);
  p.setIndentFirstLine(72);
  var texto = p.editAsText();
  texto.appendText(etiquetaConEspacio);
  texto.appendText('\t' + valor);
  var fin = texto.getText().length - 1;
  texto.setBold(0, etiquetaConEspacio.length - 1, true);
  texto.setBold(etiquetaConEspacio.length, fin, false);
  texto.setFontFamily(0, fin, 'Arial Unicode MS');
  texto.setFontSize(0, fin, 12);
  texto.setUnderline(0, fin, false);
  texto.setForegroundColor(0, fin, '#000000');
  texto.setLinkUrl(0, fin, null);

  return insertAt + 1;
}

/**
 * _formatearValorPremioParaDoc(item) [→ Contexto_Base_Web.md §27B018]
 */
function _formatearValorPremioParaDoc(item) {
  var texto = String(item || '').trim();
  var dinero = texto.match(/^S\/\s*([\d.,]+)$/i);
  if (dinero) return 'S/.' + dinero[1] + '.';
  return texto + '.';
}

/**
 * _insertarBulletPremiosGanadores(body, insertAt, cantidadGanadores) [→ Contexto_Base_Web.md §27B021]
 */
function _insertarBulletPremiosGanadores(body, insertAt, cantidadGanadores) {
  return _insertarBulletRequisito(body, insertAt, '🏆 ' + cantidadGanadores + ' ganadores');
}

// ----- Copia de premios de la fecha a Ganadores (torneo) -----

/**
 * _copiarPremiosFechaAGanadoresTorneo() [→ Contexto_Base_Web.md §27B027]
 */
function _copiarPremiosFechaAGanadoresTorneo() {
  var archivoOrigen, archivoDestino;
  try {
    archivoOrigen = _buscarArchivoEnPlantillas(NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO, DOC_ID_PARTICIPANTES_CALIFICADOS_TORNEO);
    archivoDestino = _buscarArchivoEnPlantillas(NOMBRE_DOC_GANADORES_TORNEO, DOC_ID_GANADORES_TORNEO);
  } catch (e) {
    Logger.log('[Premios-Torneo] Error al buscar los documentos: ' + e.message);
    return;
  }
  if (!archivoOrigen || !archivoDestino) {
    Logger.log('[Premios-Torneo] No se encontró alguno de los 2 documentos. Se omite la copia de Premios/Fecha.');
    return;
  }

  var docOrigen = DocumentApp.openById(archivoOrigen.getId());
  var bodyOrigen = docOrigen.getBody();
  var idxInicioOrigen = _buscarIndiceHijo(bodyOrigen, function (t) { return t.trim() === 'Premios:'; });
  var idxFinOrigen = _buscarIndiceHijo(bodyOrigen, function (t) { return t.trim() === 'Requisitos:'; });
  if (idxInicioOrigen === -1 || idxFinOrigen === -1) {
    Logger.log('[Premios-Torneo] No se encontraron los marcadores "Premios:" / "Requisitos:" en el documento origen. Se omite.');
    return;
  }

  var lineas = [];
  for (var i = idxInicioOrigen + 1; i < idxFinOrigen; i++) {
    var hijo = bodyOrigen.getChild(i);
    var texto = hijo.getText();
    if (texto.trim() === '') continue;
    var esListItem = (hijo.getType() === DocumentApp.ElementType.LIST_ITEM);
    var nesting = 0;
    if (esListItem) {
      try { nesting = hijo.asListItem().getNestingLevel(); } catch (e) { nesting = 0; }
    }
    // FIX: se conserva el elemento ORIGINAL (hijo), no solo su texto plano [→ Contexto_Base_Web.md §27B028]
    lineas.push({ hijo: hijo, esListItem: esListItem, nesting: nesting });
  }

  var docDestino = DocumentApp.openById(archivoDestino.getId());
  var bodyDestino = docDestino.getBody();
  var idxInicioDestino = _buscarIndiceHijo(bodyDestino, function (t) { return t.trim() === 'Premios:'; });
  var idxFinDestino = _buscarIndiceHijo(bodyDestino, function (t) { return t.trim() === 'Requisitos:'; });
  if (idxInicioDestino === -1 || idxFinDestino === -1) {
    Logger.log('[Premios-Torneo] No se encontraron los marcadores "Premios:" / "Requisitos:" en el documento destino. Se omite.');
    docDestino.saveAndClose();
    return;
  }

  for (var j = idxFinDestino - 1; j > idxInicioDestino; j--) {
    bodyDestino.removeChild(bodyDestino.getChild(j));
  }

  var insertAt = idxInicioDestino + 1;
  for (var k = 0; k < lineas.length; k++) {
    var linea = lineas[k];
    insertAt = _copiarLineaConFormato(bodyDestino, insertAt, linea.hijo, linea.esListItem, linea.nesting);
  }

  docDestino.saveAndClose();
  Logger.log('[Premios-Torneo] Premios/Fecha/ADICIONAL copiados a "Ganadores (torneo)" (' + lineas.length + ' línea(s)).');
}

/**
 * _copiarLineaConFormato(bodyDestino, insertAt, hijoOrigen, esListItem, nesting) [→ Contexto_Base_Web.md §27B023]
 */
function _copiarLineaConFormato(bodyDestino, insertAt, hijoOrigen, esListItem, nesting) {
  var textoOrigen = hijoOrigen.editAsText();
  var contenido = textoOrigen.getText();

  var elemento;
  if (esListItem) {
    elemento = bodyDestino.insertListItem(insertAt, contenido).setGlyphType(DocumentApp.GlyphType.BULLET);
    try { elemento.setNestingLevel(nesting); } catch (e) { /* ignora si falla */ }
  } else {
    elemento = bodyDestino.insertParagraph(insertAt, contenido);
  }

  // 2) Sangría — clave para que una línea larga que envuelve (ej. el [→ Contexto_Base_Web.md §27B024]
  try {
    if (typeof hijoOrigen.getIndentStart === 'function') {
      var indentStart = hijoOrigen.getIndentStart();
      if (indentStart !== null && indentStart !== undefined) elemento.setIndentStart(indentStart);
    }
    if (typeof hijoOrigen.getIndentFirstLine === 'function') {
      var indentFirst = hijoOrigen.getIndentFirstLine();
      if (indentFirst !== null && indentFirst !== undefined) elemento.setIndentFirstLine(indentFirst);
    }
  } catch (e) { /* ignora si este elemento no soporta sangría */ }

  // 3) Espaciado — esto es lo que da el "aire" entre bloques (ej. antes de [→ Contexto_Base_Web.md §27B025]
  try {
    if (typeof hijoOrigen.getSpacingBefore === 'function') {
      elemento.setSpacingBefore(hijoOrigen.getSpacingBefore());
    }
    if (typeof hijoOrigen.getSpacingAfter === 'function') {
      elemento.setSpacingAfter(hijoOrigen.getSpacingAfter());
    }
    if (typeof hijoOrigen.getLineSpacing === 'function') {
      elemento.setLineSpacing(hijoOrigen.getLineSpacing());
    }
  } catch (e) { /* ignora si este elemento no soporta espaciado */ }

  // 1) Negrita tramo por tramo — reaplica el mismo patrón de negrita que [→ Contexto_Base_Web.md §27B026]
  if (contenido.length > 0) {
    var indices = textoOrigen.getTextAttributeIndices();
    var textoDestino = elemento.editAsText();
    var finTexto = contenido.length - 1;
    for (var idx = 0; idx < indices.length; idx++) {
      var desde = indices[idx];
      var hasta = (idx + 1 < indices.length) ? indices[idx + 1] - 1 : finTexto;
      if (hasta < desde) continue;
      var negrita = !!textoOrigen.isBold(desde);
      try { textoDestino.setBold(desde, hasta, negrita); } catch (e) { /* tramo puntual, se omite */ }
    }
  }

  return insertAt + 1;
}
