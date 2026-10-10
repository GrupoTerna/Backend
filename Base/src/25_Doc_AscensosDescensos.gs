// ==============================================================================
// 25_Doc_AscensosDescensos.gs
// Documento 'Ascensos y descensos': listas de ascenso/descenso por clan/rango
// y las tablas de requisitos (seccion Rangos del mismo documento).
// ==============================================================================

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

// ----- Funciones manuales / punto de entrada -----

// 3) Temporada a mostrar (Extra!Mostrar, buscada por NOMBRE de columna, [→ Contexto_Base_Web.md §25B005]

/**
 * FASE 8 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): desde [→ Contexto_Base_Web.md §25B006]
 */
// SECCIÓN 1: FUNCIONES MANUALES (entry points de mantenimiento, ejecutar a mano [→ Contexto_Base_Web.md §25B007]

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

// 8) Función principal [→ Contexto_Base_Web.md §25B009]

/**
 * actualizarDocAscensosDescensos(idAscenso, idDescenso) [→ Contexto_Base_Web.md §25B010]
 */
function actualizarDocAscensosDescensos(idAscenso, idDescenso) {
  if (!idAscenso || !idDescenso) {
    Logger.log('[AscensosDescensos] ABORT: faltan idAscenso/idDescenso -- FASE 8, ya no hay automatismo de "la más reciente" (ver _getFilaCRListaPorId(), 26_Torneos_Core.gs).');
    return;
  }

  var resultado = _calcularPropuestasCambioRango(idAscenso, idDescenso);
  if (!resultado.ok) {
    Logger.log('[AscensosDescensos] ABORT: ' + resultado.error);
    return;
  }

  var ss = _getSs();
  var filaAscensoCR = _getFilaCRListaPorId(idAscenso);
  // Solo para el dato fechaIng de cada tag -- ver el filtro de elegibilidad [→ Contexto_Base_Web.md §25B011]
  var rangoActualPorTag = _getRangoClanActualPorTag(ss);

  var fechaInicioTemporada = null;
  if (filaAscensoCR && filaAscensoCR.semanas && filaAscensoCR.semanas.length) {
    var temporadaMinima = filaAscensoCR.semanas.reduce(function (min, s) {
      return (min === null || s.temporada < min) ? s.temporada : min;
    }, null);
    if (temporadaMinima !== null) fechaInicioTemporada = primerLunesTemporada(CFG.REF_DEFAULT, temporadaMinima);
  }

  var propuestasAscensoFiltradas = resultado.propuestas.filter(function (p) {
    if (p.tipoPropuesta !== 'Ascenso') return true; // este filtro solo aplica a Ascensos
    if (!fechaInicioTemporada) return true; // sin semanas parseables: no se puede evaluar, no se bloquea a nadie
    var jugador = rangoActualPorTag[p.tag];
    if (!jugador || !jugador.fechaIng) return true; // sin fecha de ingreso registrada: no se bloquea
    var fechaIngDate = (jugador.fechaIng instanceof Date) ? jugador.fechaIng : new Date(jugador.fechaIng);
    if (isNaN(fechaIngDate.getTime())) return true;
    return fechaIngDate <= fechaInicioTemporada;
  });

  var listasAscensos  = _armarListasDesdeCRLista(propuestasAscensoFiltradas, 'ascenso');
  var listasDescensos = _armarListasDesdeCRLista(resultado.propuestas, 'descenso'); // sin filtro de elegibilidad -- no aplica a descensos

  var archivo = _buscarArchivoEnPlantillas(NOMBRE_DOC_ASCENSOS_DESCENSOS, DOC_ID_ASCENSOS_DESCENSOS);
  if (!archivo) {
    Logger.log('[AscensosDescensos] ABORT: no se pudo encontrar el documento "' + NOMBRE_DOC_ASCENSOS_DESCENSOS + '" (ni por ID ni por nombre).');
    return;
  }

  var doc = DocumentApp.openById(archivo.getId());
  var body = doc.getBody();

  // FASE (10/08/2026): "Ascensos:" conserva las etiquetas originales [→ Contexto_Base_Web.md §25B012]
  _reemplazarListasPorClanYRango(body, 'Ascensos:', 'Descensos:', listasAscensos, 'Veterano', 'Colíder', 'Ascenso de clan');
  _reemplazarListasPorClanYRango(body, 'Descensos:', 'Redes sociales oficiales:', listasDescensos, 'Miembro', 'Veterano');

  doc.saveAndClose();
  Logger.log('[AscensosDescensos] Documento actualizado desde CR_Lista (' + idAscenso + ' / ' + idDescenso + '), ' +
    resultado.propuestas.length + ' propuesta(s) evaluada(s) en total.');
}

// NOTA DE REORDEN (23-ago-2026, pedido usuario): actualizarTablasRangosDoc() -- [→ Contexto_Base_Web.md §25B013]
/**
 * _bloqueCRParaContexto(filaCRLista, rolOrigen, campoQty) [→ Contexto_Base_Web.md §25B014]
 */
function _bloqueCRParaContexto(filaCRLista, rolOrigen, campoQty) {
  return filaCRLista.porClan.map(function (b) {
    var obj = { clan: b.clan, ataques: b.ataques[rolOrigen] };
    obj[campoQty] = b.minCR[rolOrigen];
    return obj;
  });
}

/**
 * actualizarTablasRangosDoc(idAscenso, idDescenso) [→ Contexto_Base_Web.md §25B015]
 */
function actualizarTablasRangosDoc(idAscenso, idDescenso) {
  if (!idAscenso || !idDescenso) {
    Logger.log('[RangosTablas] ABORT: faltan idAscenso/idDescenso -- FASE 8, ver docblock de actualizarDocAscensosDescensos().');
    return;
  }

  var filaAscensoCR  = _getFilaCRListaPorId(idAscenso);
  var filaDescensoCR = _getFilaCRListaPorId(idDescenso);
  if (!filaAscensoCR || !filaDescensoCR) {
    Logger.log('[RangosTablas] ABORT: no encontré una o ambas filas de CR_Lista (' + idAscenso + ' / ' + idDescenso + ').');
    return;
  }

  var archivo = _buscarArchivoEnPlantillas(NOMBRE_DOC_ASCENSOS_DESCENSOS, DOC_ID_ASCENSOS_DESCENSOS);
  if (!archivo) {
    Logger.log('[RangosTablas] ABORT: no se pudo encontrar el documento "' + NOMBRE_DOC_ASCENSOS_DESCENSOS + '" (ni por ID ni por nombre).');
    return;
  }

  var doc = DocumentApp.openById(archivo.getId());
  var body = doc.getBody();
  var numChildren = body.getNumChildren();

  var contextoActual = null;
  var tablasActualizadas = 0;

  for (var i = 0; i < numChildren; i++) {
    var hijo = body.getChild(i);
    if (hijo.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var texto = hijo.asParagraph().getText().trim();

    var nuevoContexto = _detectarContextoRango(texto);
    if (nuevoContexto) { contextoActual = nuevoContexto; continue; }

    if (!contextoActual) continue; // todavía no llegamos a la sección "Rangos"

    var esAscender   = (texto === RT_ENCABEZADO_ASCENDER);
    var esPermanecer = (texto === RT_ENCABEZADO_PERMANECER);
    var esConservar  = (texto === RT_ENCABEZADO_CONSERVAR);
    if (!esAscender && !esPermanecer && !esConservar) continue;

    var tabla = _buscarSiguienteTabla(body, i + 1, numChildren);
    if (!tabla) {
      Logger.log('[RangosTablas] No se encontró tabla después de "' + texto + '" (contexto ' + contextoActual + '). Se omite.');
      continue;
    }

    // FASE 8: ver el mapeo completo rol<->contexto en el docblock de arriba.
    var rolOrigen, campoQty, filaCROrigen;
    if (contextoActual === 'Miembro') {
      // Bajo "1. Miembro" solo existe "Condición para permanecer" (esPermanecer) --
      // no hay ningún "esAscender" posible en este contexto.
      rolOrigen = 'miembro';
      campoQty = 'minTMiembro';
      filaCROrigen = filaDescensoCR;
    } else if (contextoActual === 'Veterano') {
      rolOrigen = esAscender ? 'miembro' : 'veterano';
      campoQty = 'minT'; // alias histórico de la columna "Veterano" -- sin cambios de nombre
      filaCROrigen = esAscender ? filaAscensoCR : filaDescensoCR;
    } else { // 'ColiderA' | 'ColiderB'
      rolOrigen = esAscender ? 'veterano' : 'colider';
      campoQty = 'minTColider';
      filaCROrigen = esAscender ? filaAscensoCR : filaDescensoCR;
    }

    _llenarTablaRequisitos(tabla, _bloqueCRParaContexto(filaCROrigen, rolOrigen, campoQty), campoQty);
    tablasActualizadas++;
  }

  doc.saveAndClose();
  Logger.log('[RangosTablas] Documento actualizado desde CR_Lista (' + idAscenso + ' / ' + idDescenso + '). ' +
    tablasActualizadas + ' tabla(s) de la sección "Rangos" completadas.');
}

// ----- Funciones internas / helpers -----

// SECCIÓN 2: RESTO DE FUNCIONES (ascensos/descensos, doc automatizado, helpers [→ Contexto_Base_Web.md §25B016]

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
 * _getSemanasDeTemporada(temporada) [→ Contexto_Base_Web.md §25B017]
 */
function _getSemanasDeTemporada(temporada) {
  var pl = primerLunesTemporada(CFG.REF_DEFAULT, temporada);
  return lunesEnMes(pl.getFullYear(), pl.getMonth());
}

// 5) Rango/clan ACTUAL de cada jugador (hoja Directorio, mapeo dinámico de [→ Contexto_Base_Web.md §25B018]

/**
 * _getRangoClanActualPorTag(ss) [→ Contexto_Base_Web.md §25B019]
 */
function _getRangoClanActualPorTag(ss) {
  var resultado = {};
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return resultado;

  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  function buscarColumna(nombreCabecera) {
    for (var i = 0; i < headers.length; i++) {
      if (String(headers[i]).trim().toLowerCase() === nombreCabecera.toLowerCase()) return i;
    }
    return -1;
  }
  var C = {
    TAG:       buscarColumna('Tag'),
    NOMBRE:    buscarColumna('Nombre'),
    RANGO:     buscarColumna('Rango'),
    CLAN:      buscarColumna('Clan'),
    ESTADO:    buscarColumna('Estado'),
    FECHA_ING: buscarColumna('Fecha_ing')
  };
  if (C.TAG === -1 || C.RANGO === -1 || C.CLAN === -1) {
    Logger.log('[AscensosDescensos] ABORT: faltan columnas críticas (Tag/Rango/Clan) en Directorio.');
    return resultado;
  }

  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, headers.length).getValues();
  for (var i = 0; i < datos.length; i++) {
    var f = datos[i];
    var tag = String(f[C.TAG] || '').trim();
    if (!tag) continue;

    // FASE (10/08/2026, pedido del usuario): "Miembro activo" se refiere a [→ Contexto_Base_Web.md §25B020]
    if (C.ESTADO !== -1 && String(f[C.ESTADO] || '').trim() !== 'Activo') continue;

    resultado[tag] = {
      nombre: String(f[C.NOMBRE] || '').trim(),
      rango: String(f[C.RANGO] || 'Miembro').trim(),
      clanTag: String(f[C.CLAN] || '').trim(), // en realidad es el NOMBRE del clan (ej. "Grupo乂Terna™"), mismo valor que usa CR_Lista en su columna Clan
      // FASE (10/08/2026): fecha de ingreso al clan, para la regla "debe [→ Contexto_Base_Web.md §25B021]
      fechaIng: (C.FECHA_ING !== -1) ? f[C.FECHA_ING] : null
    };
  }
  return resultado;
}

// 6) Armado de las listas (Ascensos y Descensos), a partir de [→ Contexto_Base_Web.md §25B022]

// FASE 9 (17-sep-2026, limpieza de T_Requisitos -- hoja ya dada de baja): [→ Contexto_Base_Web.md §25B023]

/**
 * _barcosParaDocAD_(p) [→ Contexto_Base_Web.md §25B024]
 */
function _barcosParaDocAD_(p) {
  var v = (p.barcosSuma !== undefined && p.barcosSuma !== null) ? p.barcosSuma : p.barcosProm;
  return Math.round((Number(v) || 0) * 10) / 10;
}

/**
 * _armarListasDesdeCRLista(propuestas, modo) [→ Contexto_Base_Web.md §25B025]
 */
function _armarListasDesdeCRLista(propuestas, modo) {
  var resultado = {};

  // OJO: se siembran los 4 clanes de entrada (aunque nadie califique [→ Contexto_Base_Web.md §25B026]
  CFG.TERNA_TAGS.forEach(function (tagClan) {
    resultado[_getNombreClanDump(tagClan)] = { Veterano: [], Colíder: [], AscensoClan: [] };
  });

  var tipoBuscado      = (modo === 'ascenso') ? 'Ascenso' : 'Descenso';
  var rangoOrigenVeterano = (modo === 'ascenso') ? 'Miembro'  : 'Veterano';
  var rangoOrigenColider  = (modo === 'ascenso') ? 'Veterano' : 'Colíder';

  propuestas.forEach(function (p) {
    // 4-oct-2026 (decision del usuario, aviso (c) de la Fase 14): el Colider de una cantera que [→ Contexto_Base_Web.md §25B027]
    if (modo === 'ascenso' && p.tipoPropuesta === 'AscensoClan') {
      if (!resultado[p.clan]) return;
      resultado[p.clan].AscensoClan.push({
        nombre: p.nombre,
        ataques: Math.round((p.ataquesProm || 0) * 10) / 10,
        fame: Math.round(p.fameProm || 0),
        barcos: _barcosParaDocAD_(p),
        clanDestino: p.clanDestino || ''
      });
      return;
    }
    if (p.tipoPropuesta !== tipoBuscado) return;

    var claveInterna = null;
    if (p.rangoActual === rangoOrigenVeterano) claveInterna = 'Veterano';
    else if (p.rangoActual === rangoOrigenColider) claveInterna = 'Colíder';
    if (!claveInterna) return; // Miembro+Descenso (Expulsión): fuera de este documento

    if (!resultado[p.clan]) return; // clan no reconocido -- no debería pasar, ver siembra de arriba

    resultado[p.clan][claveInterna].push({
      nombre: p.nombre,
      // Mismo redondeo visual que ya usaba _leerPromediosGuerraCSV() (justo [→ Contexto_Base_Web.md §25B028]
      ataques: Math.round((p.ataquesProm || 0) * 10) / 10,
      fame: Math.round(p.fameProm || 0),
      // FIX (16-sep-2026, pedido del usuario): se agrega barcos a partir [→ Contexto_Base_Web.md §25B029]
      barcos: _barcosParaDocAD_(p)
    });
  });

  var porNombre = function (a, b) { return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }); };
  Object.keys(resultado).forEach(function (clan) {
    resultado[clan].Veterano.sort(porNombre);
    resultado[clan].Colíder.sort(porNombre);
    resultado[clan].AscensoClan.sort(porNombre);
  });

  return resultado;
}

// 7) Escritura en el Google Doc — reusa el mismo patrón visual que [→ Contexto_Base_Web.md §25B030]

/**
 * _insertarBulletAscDesc(body, insertAt, nombre, ataques, fame, barcos) [→ Contexto_Base_Web.md §25B031]
 */
function _insertarBulletAscDesc(body, insertAt, nombre, ataques, fame, barcos, clanDestino) {
  var texto = nombre + ' (' + ataques + ' - ' + fame + ' - ' + barcos + ')';
  // 4-oct-2026: solo para 'Ascenso de clan' -- agrega a que clan sube.
  if (clanDestino) texto += ' \u2192 ' + clanDestino;
  var li = body.insertListItem(insertAt, texto);
  li.setGlyphType(DocumentApp.GlyphType.BULLET);
  li.setIndentStart(36);
  li.setIndentFirstLine(18);

  var t = li.editAsText();
  var fin = texto.length - 1;
  t.setFontFamily(0, fin, 'Arial');
  t.setFontSize(0, fin, 12);
  t.setBold(0, fin, false);
  t.setUnderline(0, fin, false);
  t.setForegroundColor(0, fin, '#000000');
  t.setLinkUrl(0, fin, null);

  return insertAt + 1;
}

/**
 * _reemplazarListasPorClanYRango(body, tituloSeccion, tituloSeccionSiguiente, listasPorClanYRango) [→ Contexto_Base_Web.md §25B032]
 */
function _reemplazarListasPorClanYRango(body, tituloSeccion, tituloSeccionSiguiente, listasPorClanYRango, etiquetaSubVeterano, etiquetaSubColider, etiquetaSubClan) {
  // 4-oct-2026 (aviso (c) de la Fase 14): etiquetaSubClan es OPCIONAL (solo se pasa en 'Ascensos:'). [→ Contexto_Base_Web.md §25B033]
  etiquetaSubVeterano = etiquetaSubVeterano || 'Veterano';
  etiquetaSubColider  = etiquetaSubColider  || 'Colíder';

  var encontrado = body.findText(tituloSeccion);
  if (!encontrado) {
    Logger.log('[AscensosDescensos] No se encontró el encabezado "' + tituloSeccion + '" en el documento. Se omite.');
    return;
  }
  var elHeading = encontrado.getElement();
  while (elHeading.getParent() && elHeading.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    elHeading = elHeading.getParent();
  }
  var idxHeading = body.getChildIndex(elHeading);

  var numChildren = body.getNumChildren();
  var idxFinSeccion = numChildren;
  for (var i = idxHeading + 1; i < numChildren; i++) {
    var hijo = body.getChild(i);
    if (hijo.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    if (hijo.asParagraph().getText().trim() === tituloSeccionSiguiente) { idxFinSeccion = i; break; }
  }

  // --- Pasada 1: localizar cada subencabezado Veterano/Colíder, SIN mutar nada ---
  var clanesConocidos = Object.keys(listasPorClanYRango);
  var subBloques = []; // { idxSub, clan, rango, crear? }
  var encabezadosClan = []; // { idx, clan } -- posicion de cada '{Clan}:' dentro de la seccion
  var clanActual = null;
  for (var j = idxHeading + 1; j < idxFinSeccion; j++) {
    var hijoJ = body.getChild(j);
    if (hijoJ.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var textoJ = hijoJ.asParagraph().getText().trim();
    var textoSinDosPuntos = textoJ.replace(/:$/, '');
    if (clanesConocidos.indexOf(textoSinDosPuntos) !== -1) {
      clanActual = textoSinDosPuntos;
      encabezadosClan.push({ idx: j, clan: clanActual });
      continue;
    }
    if ((textoJ === etiquetaSubVeterano || textoJ === etiquetaSubColider) && clanActual) {
      // rango interno SIEMPRE 'Veterano'/'Colíder' (rango de origen),
      // independientemente de qué texto tenga el subencabezado en el doc.
      var rangoInterno = (textoJ === etiquetaSubVeterano) ? 'Veterano' : 'Colíder';
      subBloques.push({ idxSub: j, clan: clanActual, rango: rangoInterno });
    } else if (etiquetaSubClan && textoJ === etiquetaSubClan && clanActual) {
      subBloques.push({ idxSub: j, clan: clanActual, rango: 'AscensoClan' });
    }
  }

  // Fin del bloque de cada clan = el siguiente '{Clan}:' o el fin de la seccion.
  var finDeClan = function (idxDesde) {
    for (var e = 0; e < encabezadosClan.length; e++) {
      if (encabezadosClan[e].idx > idxDesde) return encabezadosClan[e].idx;
    }
    return idxFinSeccion;
  };

  // 4-oct-2026: crear 'Ascenso de clan' donde falte, solo si hay alguien que listar.
  if (etiquetaSubClan) {
    encabezadosClan.forEach(function (ec) {
      var lista = (listasPorClanYRango[ec.clan] && listasPorClanYRango[ec.clan].AscensoClan) || [];
      if (!lista.length) return;
      var yaExiste = subBloques.some(function (sb) { return sb.clan === ec.clan && sb.rango === 'AscensoClan'; });
      if (yaExiste) return;
      var ultimoRef = null;
      subBloques.forEach(function (sb) { if (sb.clan === ec.clan && (!ultimoRef || sb.idxSub > ultimoRef.idxSub)) ultimoRef = sb; });
      if (!ultimoRef) return; // clan sin subencabezados: no hay formato que copiar, se omite
      subBloques.push({ idxSub: finDeClan(ec.idx), clan: ec.clan, rango: 'AscensoClan', crear: true, idxRef: ultimoRef.idxSub });
    });
    subBloques.sort(function (a, b) { return a.idxSub - b.idxSub; });
  }

  // FIX (4-oct-2026): antes idxFin era SIEMPRE el siguiente subencabezado, y para el ultimo [→ Contexto_Base_Web.md §25B034]
  for (var k = 0; k < subBloques.length; k++) {
    var finSig = (k + 1 < subBloques.length) ? subBloques[k + 1].idxSub : idxFinSeccion;
    var finClanK = subBloques[k].crear ? subBloques[k].idxSub : finDeClan(subBloques[k].idxSub);
    subBloques[k].idxFin = Math.min(finSig, finClanK);
  }

  // --- Pasada 2: de ABAJO hacia ARRIBA, borrar bullets viejos e insertar los nuevos ---
  for (var m = subBloques.length - 1; m >= 0; m--) {
    var b = subBloques[m];
    if (b.crear) {
      // Subencabezado nuevo ('Ascenso de clan'), con el formato del ultimo subencabezado del clan.
      var refPar = body.getChild(b.idxRef).asParagraph();
      var nuevoPar = body.insertParagraph(b.idxSub, etiquetaSubClan);
      nuevoPar.setAttributes(refPar.getAttributes());
    } else {
      for (var d = b.idxFin - 1; d > b.idxSub; d--) {
        body.removeChild(body.getChild(d));
      }
    }

    var nombres = (listasPorClanYRango[b.clan] && listasPorClanYRango[b.clan][b.rango]) || [];
    var insertAt = b.idxSub + 1;
    if (nombres.length === 0) {
      // conserva un bullet vacío, igual que la plantilla original cuando no hay nadie que calificar.
      var vacio = body.insertListItem(insertAt, '');
      vacio.setGlyphType(DocumentApp.GlyphType.BULLET);
    } else {
      for (var p = 0; p < nombres.length; p++) {
        insertAt = _insertarBulletAscDesc(body, insertAt, nombres[p].nombre, nombres[p].ataques, nombres[p].fame, nombres[p].barcos, nombres[p].clanDestino);
      }
    }
  }
}

// 9) Reconstrucción desde cero si el documento se borra de Drive. [→ Contexto_Base_Web.md §25B035]

/**
 * _rdocADMiles(n) [→ Contexto_Base_Web.md §25B036]
 */
function _rdocADMiles(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * _rdocADTablaRango(body, trofeos, ataques) [→ Contexto_Base_Web.md §25B037]
 */
function _rdocADTablaRango(body, trofeos, ataques) {
  var filas = [
    [''].concat(_CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION),
    ['Trofeos', _rdocADMiles(trofeos), _rdocADMiles(trofeos), _rdocADMiles(trofeos), _rdocADMiles(trofeos)],
    ['Ataques', String(ataques), String(ataques), String(ataques), String(ataques)]
  ];
  return _rdocTablaConEncabezadoNegrita(body, filas);
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
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de trofeos de guerra y ataques durante la temporada actual, según el clan al que pertenece.', false);
  _rdocADTablaRango(body, 2000, 16);
  _rdocADBloqueFuncion(body, ['Donar y participar en guerras.']);

  // 2. Veterano
  _rdocParrafoTexto(body, '2.     Veterano', true);
  _rdocParrafoTexto(body, 'Requisito para ascender a este rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de trofeos de guerra y ataques durante la temporada actual, según el clan al que pertenece, para poder ascender.', false);
  _rdocADTablaRango(body, 2500, 16);
  _rdocParrafoTexto(body, 'Condición para conservar el rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de trofeos de guerra y ataques durante la temporada actual, según el clan al que pertenece.', false);
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
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de trofeos de guerra y ataques durante la temporada actual, según el clan al que pertenece, para poder ascender.', false);
  _rdocADTablaRango(body, 3000, 16);
  _rdocParrafoTexto(body, 'Condición para conservar el rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de trofeos de guerra y ataques durante la temporada actual, según el clan al que pertenece.', false);
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
  _rdocParrafoTexto(body, 'Alcanzar el mínimo promedio de trofeos de guerra requerido durante la temporada actual, según el clan al que pertenece, para poder ascender.', false);
  _rdocADTablaRango(body, 3000, 16);
  _rdocParrafoTexto(body, 'Condición para conservar el rango', true);
  _rdocParrafoTexto(body, 'Alcanzar el promedio mínimo requerido de trofeos de guerra y ataques durante la temporada actual, según el clan al que pertenece. Sin embargo, tiene prioridad de no descender por medallas.', false);
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

/**
 * _detectarContextoRango(textoParrafo) [→ Contexto_Base_Web.md §25B044]
 */
function _detectarContextoRango(textoParrafo) {
  var t = String(textoParrafo || '').trim();
  if (/^1[.\s]+Miembro\s*$/.test(t)) return 'Miembro';
  if (/^2[.\s]+Veterano\s*$/.test(t)) return 'Veterano';
  if (t.indexOf('Tipo A: Colíder de juego') !== -1) return 'ColiderA';
  if (t.indexOf('Tipo B: Colíder colaborador') !== -1) return 'ColiderB';
  return null;
}

/**
 * _formatearQtyCelda(requisito, esTrofeos) [→ Contexto_Base_Web.md §25B045]
 */
function _formatearQtyCelda(requisito, esTrofeos) {
  if (!requisito || !requisito.activo) return '-';
  var texto = String(requisito.qty);
  if (esTrofeos) texto = texto.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return texto;
}

/**
 * _llenarTablaRequisitos(tabla, reqPorClan, campoQty) [→ Contexto_Base_Web.md §25B046]
 */
function _llenarTablaRequisitos(tabla, reqPorClan, campoQty) {
  if (!tabla || tabla.getNumRows() < 2) return;

  for (var f = tabla.getNumRows() - 1; f >= 1; f--) {
    var fila = tabla.getRow(f);
    var etiqueta = fila.getCell(0).getText().trim().toLowerCase();
    var esTrofeos = (etiqueta.indexOf('trofeo') !== -1);
    var esAtaques = (etiqueta.indexOf('ataque') !== -1);
    if (!esTrofeos && !esAtaques) continue; // fila que no reconocemos: se deja intacta

    var algunoActivo = false;
    for (var col = 1; col < fila.getNumCells(); col++) {
      var req = reqPorClan[col - 1];
      var campo = esTrofeos ? (req && req[campoQty]) : (req && req.ataques);
      if (campo && campo.activo) algunoActivo = true;
      fila.getCell(col).setText(_formatearQtyCelda(campo, esTrofeos));
    }

    if (!algunoActivo) tabla.removeRow(f); // los 4 clanes en "No" para este requisito: la fila desaparece
  }
}

/**
 * _buscarSiguienteTabla(body, idxDesde, idxLimite) [→ Contexto_Base_Web.md §25B047]
 */
function _buscarSiguienteTabla(body, idxDesde, idxLimite) {
  for (var i = idxDesde; i < idxLimite; i++) {
    var hijo = body.getChild(i);
    if (hijo.getType() === DocumentApp.ElementType.TABLE) return hijo.asTable();
  }
  return null;
}