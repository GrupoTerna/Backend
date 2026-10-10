// ==============================================================================
// 30_Mensajes.gs
// Hoja Mensajes: generacion de contenido para difundir por categoria/clan.
// ==============================================================================

// ----- Variables y constantes -----

// 30_Mensajes.gs [→ Contexto_Base_Web.md §30B001]

// Columnas de la hoja Mensajes (1-based)
var MC = {
  NUM:1, FECHA:2, TEMPORADA:3, SEMANA:4, DIA:5, PERIOD:6,
  N1:7, CATEGORIA:8, N2:9, SUBCATEGORIA:10, N3:11, CLAN:12, RANGO:13, TIPO:14, CONTENIDO:15
};

var MENSAJES_TOTAL_COLS = 15;

// Nombre del clan "Chat General" para mensajes generales (todas las subcategorías generales)
var CLAN_CHAT_GENERAL = 'ᴳ乂ᵀ ⚜️ Familia Terna';

// Categorías que no deben verse al copiar/enviar el chat (se ocultan [→ Contexto_Base_Web.md §30B002]
var CATEGORIAS_OCULTAS_MENSAJES = [];

// Categorías Estáticas (sincronizadas desde Google Docs directo a la hoja [→ Contexto_Base_Web.md §30B003]
var CATEGORIAS_ESTATICO_SOLO_MENU = [
  'bienvenida',
  'participantes calificados (torneo)', 'participantes calificados (sorteo)',
  'ganadores (torneo)', 'ganadores (sorteo)',
  'ascensos y descensos'
];

// Anclas de posición para _agregarCategoriaAExtra(): en vez de agregar [→ Contexto_Base_Web.md §30B004]
var CATEGORIAS_ANCLA_EXTRA = {
  'ascensos y descensos': [
    'ganadores (sorteo)', 'ganadores (torneo)',
    'participantes calificados (sorteo)', 'participantes calificados (torneo)',
    'sorteos', 'torneos'
  ]
};

// ----- Funciones manuales / punto de entrada -----

/**
 * META_GUERRA_PROGRESO [→ Contexto_Base_Web.md §30B005]
 */
var META_GUERRA_PROGRESO = 10000;

/**
 * _clanCruzoMetaPorNombre(nombreClan) [→ Contexto_Base_Web.md §30B006]
 */
function _clanCruzoMetaPorNombre(nombreClan) {
  try {
    var buscado = String(nombreClan || '').trim();
    if (!buscado) return false;
    for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
      var clanData = _getClanCache(CFG.TERNA_TAGS[i]);
      if (!clanData || !clanData.info) continue;
      if (String(clanData.info.name || '').trim() !== buscado) continue;
      var rr = clanData.riverrace;
      if (!rr || !rr.clan) return false;
      // TANDA 9 (21-sep-2026): en la semana de COLISEO los barcos no avanzan y [→ Contexto_Base_Web.md §30B007]
      if (String(rr.periodType || '') === 'colosseum') return false;
      var progreso = Number(rr.clan.fame);
      return isFinite(progreso) && progreso >= META_GUERRA_PROGRESO;
    }
  } catch (e) {
    Logger.log('[Mensajes] No se pudo evaluar si el clan cruzó la meta (' + nombreClan + '): ' + e.message);
  }
  return false;
}

/**
 * _ordenRango(rango) [→ Contexto_Base_Web.md §30B008]
 */
function _ordenRango(rango) {
  var key = String(rango || '').toLowerCase().replace('í', 'i').replace('é', 'e');
  return CFG.RANGO_ORDEN[key] || 4;
}

function generarTodosMensajes() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.MENSAJES);
  if (!sh) { Logger.log('[Mensajes] Hoja no encontrada'); return; }

  var ctx = _getCtx();
  var now = new Date();

  // FASE 8, punto 2 (07-sep-2026, pedido usuario): fecha y hora de [→ Contexto_Base_Web.md §30B009]
  var horaGeneracionMsj = _horaLimaMensaje12h(now);

  // Leer orden de clanes desde hoja Clan (para respetar orden de filas)
  var clanOrden = _getOrdenClanHoja(ss);
  // NOTA: ya no se lee acá "nombresClanTerna" (_getNombresClanesOrdenados) — [→ Contexto_Base_Web.md §30B010]

  var pendientes  = _obtenerDatosPendientes(ss);
  var sinCelular  = _obtenerDatosSinCelular(ss);
  var sinEtiqueta = _obtenerDatosSinEtiqueta(ss);
  var celularPorTag   = _obtenerCelularPorTag(ss);
  var prestamoPorTag  = _obtenerPrestamoPorTag(ss);

  // Construir bloques de mensajes en orden de Categorías (hoja Extra) [→ Contexto_Base_Web.md §30B011]
  var bloques = []; // cada bloque: { categoria, subcategoria, clan, contenido }

  // "INFORMACIÓN SOBRE EL CLAN" YA NO se genera acá (19/08/2026, pedido del [→ Contexto_Base_Web.md §30B012]

  // 1. DEFENSAS DE BARCOS: ELIMINADA (11/08/2026, pedido del usuario). [→ Contexto_Base_Web.md §30B013]

  // 2. MENSAJE DE GUERRA (solo días de guerra)
  if (ctx.esDiaGuerra && pendientes.length > 0) {
    var clanesPend = _agruparPorClanOrdenado(pendientes, clanOrden);
    var nombresDia = { L:'LUNES', M:'MARTES', X:'MIÉRCOLES', J:'JUEVES', V:'VIERNES', S:'SÁBADO', D:'DOMINGO' };
    var nombreDia  = nombresDia[ctx.diaLetra] || '';
    var semNum = ctx.sectionIndex + 1;

    // --- Fila por clan (Subcategoría = Particular) ---
    for (var ci2 = 0; ci2 < clanesPend.length; ci2++) {
      var clanName = clanesPend[ci2].clan;
      var miembros = clanesPend[ci2].lista;
      // NUEVO (pedido usuario): orden dentro de cada clan ahora es Faltantes [→ Contexto_Base_Web.md §30B014]
      miembros.sort(function(a, b) {
        if (b.faltantes !== a.faltantes) return b.faltantes - a.faltantes;
        var rA = _ordenRango(a.rango), rB = _ordenRango(b.rango);
        if (rA !== rB) return rA - rB;
        return a.nombre.localeCompare(b.nombre);
      });
      var msjClan = '⚔ GUERRA ' + nombreDia + ' — SEMANA ' + semNum + ' ⚔\n';
      msjClan += '==============================\n';
      msjClan += '🔥 ' + clanName + ' (' + miembros.length + ' pendientes)\n';
      msjClan += '==============================\n';
      miembros.forEach(function(p) {
        var icono = p.faltantes === 4 ? '🛑' : (p.faltantes >= 2 ? '⚠' : '🔹');
        var wsp   = celularPorTag[p.tag] ? ' (ω)' : '';
        var prest = _sufijoPrestamo(prestamoPorTag[p.tag]);
        msjClan += icono + ' ' + p.nombre + ' (' + p.faltantes + ')' + wsp + prest + '\n';
      });
      // NUEVO (19-sep-2026, punto 7): si el clan ya cruzó la meta de la [→ Contexto_Base_Web.md §30B015]
      if (_clanCruzoMetaPorNombre(clanName)) {
        msjClan += '🏆 ¡Este clan ya cruzó la meta de la semana! Atacar hoy es opcional.\n';
      } else {
        msjClan += '⏳ Tienen hasta las 12:00 AM para completar sus ataques.\n';
      }
      msjClan += '🕒 Generado: ' + horaGeneracionMsj;
      bloques.push({ categoria: 'Mensaje de Guerra', subcategoria: 'Particular', clan: clanName, contenido: msjClan });
    }

    // --- Fila general (Subcategoría = Chat General) ---
    var msjGral = '⚔ GUERRA ' + nombreDia + ' — SEMANA ' + semNum + ' ⚔\n';
    msjGral += '⚠ ' + pendientes.length + ' jugadores aún no completan sus ataques.\n';
    // NUEVO (19-sep-2026, punto 7): cuenta cuántos de los clanes listados ya
    // cruzaron la meta, para decidir la línea final (ver más abajo).
    var clanesCruzaronMeta = 0;
    for (var ci3 = 0; ci3 < clanesPend.length; ci3++) {
      var cn = clanesPend[ci3].clan;
      var ml = clanesPend[ci3].lista;
      // NUEVO (pedido usuario): mismo criterio de orden que el bloque por
      // clan de arriba -- Faltantes desc. -> Rango -> Nombre alfabético.
      ml.sort(function(a, b) {
        if (b.faltantes !== a.faltantes) return b.faltantes - a.faltantes;
        var rA = _ordenRango(a.rango), rB = _ordenRango(b.rango);
        if (rA !== rB) return rA - rB;
        return a.nombre.localeCompare(b.nombre);
      });
      var cnCruzoMeta = _clanCruzoMetaPorNombre(cn);
      if (cnCruzoMeta) clanesCruzaronMeta++;
      msjGral += '==============================\n';
      msjGral += '🔥 ' + cn + ' (' + ml.length + ' pendientes)\n';
      msjGral += '==============================\n';
      if (cnCruzoMeta) {
        msjGral += '🏆 ¡Ya cruzó la meta de la semana! Atacar hoy es opcional.\n';
      }
      ml.forEach(function(p) {
        var icono = p.faltantes === 4 ? '🛑' : (p.faltantes >= 2 ? '⚠' : '🔹');
        var wsp   = celularPorTag[p.tag] ? ' (ω)' : '';
        var prest = _sufijoPrestamo(prestamoPorTag[p.tag]);
        msjGral += icono + ' ' + p.nombre + ' (' + p.faltantes + ')' + wsp + prest + '\n';
      });
    }
    // Línea final: si NINGÚN clan listado cruzó la meta, queda exactamente [→ Contexto_Base_Web.md §30B016]
    if (clanesCruzaronMeta === 0) {
      msjGral += '⏳ Tienen hasta las 12:00 AM para completar sus ataques.\nDespués del cierre, se aplicarán expulsiones sin excepción.\n';
    } else if (clanesCruzaronMeta === clanesPend.length) {
      msjGral += '🏆 Todos los clanes de este mensaje ya cruzaron la meta: atacar hoy es opcional.\n';
    } else {
      msjGral += '⏳ Los clanes sin 🏆 tienen hasta las 12:00 AM para completar sus ataques.\nDespués del cierre, se aplicarán expulsiones sin excepción (salvo en los clanes que ya cruzaron la meta).\n';
    }
    msjGral += '🕒 Generado: ' + horaGeneracionMsj;
    bloques.push({ categoria: 'Mensaje de Guerra', subcategoria: 'Chat General', clan: CLAN_CHAT_GENERAL, contenido: msjGral });
  }

  // 3. CELULAR (activos sin celular)
  if (sinCelular.length > 0) {
    var clanesCel = _agruparPorClanOrdenado(sinCelular, clanOrden);
    var msjCelBase  = '⚠ AVISO IMPORTANTE ⚠\n' +
                      'Es obligatorio estar en el grupo oficial de la familia.\n' +
                      'Los siguientes miembros por favor dejen su contacto por este chat:\n';

    // Por clan (Subcategoría = Particular)
    for (var ci4 = 0; ci4 < clanesCel.length; ci4++) {
      var clanName4 = clanesCel[ci4].clan;
      var miembros4 = clanesCel[ci4].lista.slice().sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
      var msjClan4 = msjCelBase + '=== ' + clanName4 + ' ===\n';
      miembros4.forEach(function(p) { msjClan4 += '- ' + p.nombre + '\n'; });
      bloques.push({ categoria: 'Celular', subcategoria: 'Particular', clan: clanName4, contenido: msjClan4.trim() });
    }

    // General (Subcategoría = Chat General)
    var msjCelGral = msjCelBase;
    for (var ci5 = 0; ci5 < clanesCel.length; ci5++) {
      msjCelGral += '=== ' + clanesCel[ci5].clan + ' ===\n';
      clanesCel[ci5].lista.slice().sort(function(a, b) { return a.nombre.localeCompare(b.nombre); })
        .forEach(function(p) { msjCelGral += '- ' + p.nombre + '\n'; });
    }
    bloques.push({ categoria: 'Celular', subcategoria: 'Chat General', clan: CLAN_CHAT_GENERAL, contenido: msjCelGral.trim() });
  }

  // 4. ETIQUETA DE MIEMBRO (activos con iniciales que no han puesto etiqueta)
  if (sinEtiqueta.length > 0) {
    var clanesEtiq = _agruparPorClanOrdenado(sinEtiqueta, clanOrden);
    var msjEtiqBase =
      '📢 COMUNICADO OFICIAL – FAMILIA DE CLANES TERNA\n\n' +
      'Con el fin de mantener el orden y la correcta identificación de los\n' +
      'miembros en guerra, donaciones y actividades del clan, se informa:\n\n' +
      '🔹 Es OBLIGATORIO colocar en la ETIQUETA de miembro del grupo de\n' +
      'WhatsApp el nombre con el que apareces en Clash Royale.\n' +
      '🔹 Esta medida aplica para todos los clanes, sin excepción.\n' +
      '🔹 El incumplimiento dificulta la organización interna del clan.\n\n' +
      '📌 ¿Cómo colocar tu etiqueta? (ver imagen de referencia)\n' +
      '1️⃣ Abre el grupo de WhatsApp\n' +
      '2️⃣ Toca ⋮ (3 puntos) → Info. del grupo\n' +
      '3️⃣ Toca tu nombre → Edita la etiqueta del miembro\n' +
      '4️⃣ Escribe tu nombre de Clash Royale y guarda ✅\n\n' +
      'Agradecemos tu colaboración y compromiso.\n' +
      'Atentamente, Líderes de los clanes Terna\n\n' +
      'Los siguientes miembros aún NO han colocado su etiqueta:\n';

    // Por clan (Subcategoría = Particular)
    for (var ci6 = 0; ci6 < clanesEtiq.length; ci6++) {
      var clanName6 = clanesEtiq[ci6].clan;
      var miembros6 = clanesEtiq[ci6].lista.slice().sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
      var msjClan6 = msjEtiqBase + '=== ' + clanName6 + ' ===\n';
      miembros6.forEach(function(p) { msjClan6 += '- ' + p.nombre + '\n'; });
      bloques.push({ categoria: 'Etiqueta de miembro', subcategoria: 'Particular', clan: clanName6, contenido: msjClan6.trim() });
    }

    // General (Subcategoría = Chat General)
    var msjEtiqGral = msjEtiqBase;
    for (var ci7 = 0; ci7 < clanesEtiq.length; ci7++) {
      msjEtiqGral += '=== ' + clanesEtiq[ci7].clan + ' ===\n';
      clanesEtiq[ci7].lista.slice().sort(function(a, b) { return a.nombre.localeCompare(b.nombre); })
        .forEach(function(p) { msjEtiqGral += '- ' + p.nombre + '\n'; });
    }
    bloques.push({ categoria: 'Etiqueta de miembro', subcategoria: 'Chat General', clan: CLAN_CHAT_GENERAL, contenido: msjEtiqGral.trim() });
  }

  // 5. PLANTILLAS ESTÁTICAS (contenido desde los Google Docs de la carpeta [→ Contexto_Base_Web.md §30B017]
  var categoriaOrdenPlant    = _getOrdenMensajesCategoria();
  var subcategoriaOrdenPlant = _getOrdenExtra(ss, 'subcategoria');
  var plantillasBloques = _getPlantillasParaMensajes(ss).filter(function(p) {
    if (p.categoria === 'Descripción') return false;
    // FIX (19/08/2026, pedido del usuario): Bienvenida/Participantes [→ Contexto_Base_Web.md §30B018]
    if (CATEGORIAS_ESTATICO_SOLO_MENU.indexOf(String(p.categoria || '').toLowerCase()) >= 0) return false;
    if (p.categoria === 'Día de guerra') return ctx.esDiaGuerra;
    if (p.categoria === 'Defensas de barcos') return !ctx.esDiaGuerra;
    return true;
  });
  plantillasBloques.sort(function(a, b) {
    var oCatA = categoriaOrdenPlant[a.categoria.toLowerCase()]; if (oCatA === undefined) oCatA = 9999;
    var oCatB = categoriaOrdenPlant[b.categoria.toLowerCase()]; if (oCatB === undefined) oCatB = 9999;
    if (oCatA !== oCatB) return oCatA - oCatB;
    var oSubA = subcategoriaOrdenPlant[a.subcategoria.toLowerCase()]; if (oSubA === undefined) oSubA = 9999;
    var oSubB = subcategoriaOrdenPlant[b.subcategoria.toLowerCase()]; if (oSubB === undefined) oSubB = 9999;
    if (oSubA !== oSubB) return oSubA - oSubB;
    var oClanA = clanOrden[a.clan.toLowerCase()]; if (oClanA === undefined) oClanA = 9999;
    var oClanB = clanOrden[b.clan.toLowerCase()]; if (oClanB === undefined) oClanB = 9999;
    return oClanA - oClanB;
  });
  for (var pj = 0; pj < plantillasBloques.length; pj++) {
    var pb = plantillasBloques[pj];
    bloques.push({
      categoria: pb.categoria, subcategoria: pb.subcategoria,
      clan: pb.clan, contenido: pb.contenido, tipo: 'Estático'
    });
  }

  // Categorías dinámicas (Fase 9): categoriaOrdenPlant refleja el orden FIJO [→ Contexto_Base_Web.md §30B019]
  var categoriasNuevasVistas = {};
  for (var cbi = 0; cbi < bloques.length; cbi++) {
    var catBloque = String(bloques[cbi].categoria || '').trim();
    if (!catBloque) continue;
    var catBloqueLower = catBloque.toLowerCase();
    if (categoriaOrdenPlant[catBloqueLower] === undefined && !categoriasNuevasVistas[catBloqueLower]) {
      categoriasNuevasVistas[catBloqueLower] = true;
      categoriaOrdenPlant[catBloqueLower] = _agregarCategoriaAExtra(ss, catBloque);
    }
  }

  // Orden final: TODAS las categorías (Dinámicas + Estáticas de Plantillas) [→ Contexto_Base_Web.md §30B020]
  bloques.sort(function(a, b) {
    var oCatA = categoriaOrdenPlant[String(a.categoria).toLowerCase()]; if (oCatA === undefined) oCatA = 9999;
    var oCatB = categoriaOrdenPlant[String(b.categoria).toLowerCase()]; if (oCatB === undefined) oCatB = 9999;
    if (oCatA !== oCatB) return oCatA - oCatB;

    var oSubA = subcategoriaOrdenPlant[String(a.subcategoria).toLowerCase()]; if (oSubA === undefined) oSubA = 9999;
    var oSubB = subcategoriaOrdenPlant[String(b.subcategoria).toLowerCase()]; if (oSubB === undefined) oSubB = 9999;
    if (oSubA !== oSubB) return oSubA - oSubB;

    var oClanA = clanOrden[String(a.clan).toLowerCase()]; if (oClanA === undefined) oClanA = 9999;
    var oClanB = clanOrden[String(b.clan).toLowerCase()]; if (oClanB === undefined) oClanB = 9999;
    return oClanA - oClanB;
  });

  // FIX (pedido usuario): las categorías de CATEGORIAS_OCULTAS_MENSAJES se [→ Contexto_Base_Web.md §30B021]
  var bloquesVisibles = [];
  var bloquesOcultos  = [];
  for (var pbi = 0; pbi < bloques.length; pbi++) {
    if (CATEGORIAS_OCULTAS_MENSAJES.indexOf(bloques[pbi].categoria) >= 0) bloquesOcultos.push(bloques[pbi]);
    else bloquesVisibles.push(bloques[pbi]);
  }
  bloques = bloquesVisibles.concat(bloquesOcultos);

  // Calcular N1°, N2°, N3° y armar filas [→ Contexto_Base_Web.md §30B022]
  var nuevosMensajes = [];
  var n1 = 0, n2 = 0, n3 = 0;
  var lastCat = null, lastSub = null;

  for (var bi = 0; bi < bloques.length; bi++) {
    var b = bloques[bi];
    if (b.categoria !== lastCat) { n1++; n2 = 1; n3 = 1; }
    else if (b.subcategoria !== lastSub) { n2++; n3 = 1; }
    else { n3++; }
    lastCat = b.categoria;
    lastSub = b.subcategoria;

    // Fila: N° | Fecha | Temporada | Semana | Dia | PeriodIndex | N1° | Categoría | N2° | Subcategoría | N3° | Clan |… [→ Contexto_Base_Web.md §30B023]
    nuevosMensajes.push([
      bi + 1, now, ctx.temporada, ctx.sectionIndex + 1, ctx.diaLetra, ctx.periodIndex,
      n1, b.categoria, n2, b.subcategoria, n3, b.clan, (b.rango || ''), (b.tipo || 'Dinámico'), b.contenido
    ]);
  }

  // Escribir en la hoja [→ Contexto_Base_Web.md §30B024]
  var lastRow = sh.getLastRow();
  if (lastRow >= 2) sh.getRange(2, 1, lastRow - 1, MENSAJES_TOTAL_COLS).clearContent();

  if (nuevosMensajes.length > 0) {
    sh.getRange(2, 1, nuevosMensajes.length, MENSAJES_TOTAL_COLS).setValues(nuevosMensajes);

    // Formatear columna Fecha
    for (var i = 0; i < nuevosMensajes.length; i++) {
      _setDateCell(sh, i + 2, MC.FECHA, nuevosMensajes[i][1], 'dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
    }

    // FIX (18-ago-2026, pedido usuario: "Mensajes!Contenido siempre vuelve a [→ Contexto_Base_Web.md §30B025]
    sh.getRange(2, 1, nuevosMensajes.length, MENSAJES_TOTAL_COLS - 1)
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    sh.getRange(2, MC.CONTENIDO, nuevosMensajes.length, 1)
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    for (var r = 2; r <= nuevosMensajes.length + 1; r++) sh.setRowHeight(r, 200);
    applyBorderCenter(sh.getRange(2, 1, nuevosMensajes.length, MENSAJES_TOTAL_COLS));
    _aplicarFormatoCondicionalMensajes(sh, nuevosMensajes.length);

    // Ocultar categorías que no deben verse al copiar/enviar el chat (ver [→ Contexto_Base_Web.md §30B026]
    var maxRowsMsj = sh.getMaxRows();
    if (maxRowsMsj > 1) sh.showRows(2, maxRowsMsj - 1);

    var primeraFilaOculta = -1;
    for (var hr = 0; hr < nuevosMensajes.length; hr++) {
      var catFila = String(nuevosMensajes[hr][MC.CATEGORIA - 1] || '');
      if (CATEGORIAS_OCULTAS_MENSAJES.indexOf(catFila) >= 0) { primeraFilaOculta = hr; break; }
    }
    if (primeraFilaOculta !== -1) {
      sh.hideRows(primeraFilaOculta + 2, nuevosMensajes.length - primeraFilaOculta);
    }

    // Limpiar bordes en filas vacías residuales
    var maxRows = sh.getMaxRows();
    if (maxRows > nuevosMensajes.length + 1) {
      try {
        sh.getRange(nuevosMensajes.length + 2, 1, maxRows - nuevosMensajes.length - 1, MENSAJES_TOTAL_COLS)
          .setBorder(false, false, false, false, false, false);
      } catch(e) {}
    }
  }

  Logger.log('[Mensajes] Generados ' + nuevosMensajes.length + ' mensajes.');

  // NUEVO (05-oct-2026, pedido usuario: "en el caso de los mensajes de guerra, tambien mostraria la hora de [→ Contexto_Base_Web.md §30B027]
  try { _registrarGeneracionMensajes_(now.getTime(), nuevosMensajes.length); }
  catch (eRegMsj) { Logger.log('[Mensajes] No se pudo registrar la hora de elaboracion: ' + eRegMsj.message); }
}

// ----- Funciones internas / helpers -----

// SECCIÓN 2: RESTO DE FUNCIONES (mensajes, helpers internos) — sin cambios de [→ Contexto_Base_Web.md §30B028]

function _getOrdenMensajesCategoria() {
  var mapa = {};
  var lista = CFG.MENSAJES_ORDEN_CATEGORIAS || [];
  for (var i = 0; i < lista.length; i++) {
    mapa[String(lista[i]).trim().toLowerCase()] = i;
  }
  return mapa;
}

/**
 * _aplicarFormatoCondicionalMensajes(sh, numFilas)
 * Aplica color de fondo por Categoría (columna 8 = Categoría).
 */
function _aplicarFormatoCondicionalMensajes(sh, numFilas) {
  if (numFilas === 0) return;
  var dataRange = sh.getRange(2, 1, numFilas, MENSAJES_TOTAL_COLS);
  var colCat = colLetter(MC.CATEGORIA); // columna Categoría

  var rules = [];
  for (var cat in CFG.MENSAJES_TIPO_BG) {
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$' + colCat + '2="' + cat + '"')
        .setBackground(CFG.MENSAJES_TIPO_BG[cat])
        .setRanges([dataRange])
        .build()
    );
  }
  _tryCondFmt(sh, rules);
}

/**
 * _agregarCategoriaAExtra(ss, categoria) [→ Contexto_Base_Web.md §30B029]
 */
function _agregarCategoriaAExtra(ss, categoria) {
  var sh = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!sh) return 9999;

  var COL_CATEGORIA = 12; // columna L
  var categoriaLower = String(categoria).toLowerCase();

  var lastRowSheet = sh.getLastRow();
  var valoresActuales = [];
  if (lastRowSheet >= 2) {
    var colVals = sh.getRange(2, COL_CATEGORIA, lastRowSheet - 1, 1).getValues();
    for (var k = 0; k < colVals.length; k++) {
      var vv = String(colVals[k][0] || '').trim();
      if (vv !== '') valoresActuales.push(vv);
    }
  }

  // Por defecto: al final. Si hay anclas para esta categoría, se busca la
  // última ancla presente y se inserta justo después de ella.
  var posInsercion = valoresActuales.length;
  var anclas = CATEGORIAS_ANCLA_EXTRA[categoriaLower];
  if (anclas) {
    for (var ai = 0; ai < valoresActuales.length; ai++) {
      if (anclas.indexOf(valoresActuales[ai].toLowerCase()) >= 0) posInsercion = ai + 1;
    }
  }

  valoresActuales.splice(posInsercion, 0, categoria);

  try {
    var nuevaColumna = valoresActuales.map(function (v) { return [v]; });
    sh.getRange(2, COL_CATEGORIA, nuevaColumna.length, 1).setValues(nuevaColumna);
    Logger.log('[Mensajes] Categoría nueva "' + categoria + '" agregada a Extra (columna L, posición ' + (posInsercion + 1) + ' de ' + nuevaColumna.length + ').');
  } catch(e) {
    Logger.log('[Mensajes] Error agregando categoría "' + categoria + '" a Extra: ' + e.message);
  }

  return posInsercion;
}

// Helpers de datos [→ Contexto_Base_Web.md §30B030]

/**
 * _getDatosClanHoja(ss) [→ Contexto_Base_Web.md §30B031]
 */
function _getDatosClanHoja(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  var mapa = {};
  if (!sh || sh.getLastRow() < 2) return mapa;
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, CC.CONDICION).getValues();
  var headers = sh.getRange(1, 1, 1, CC.CONDICION).getValues()[0];
  var minGByNombre = _getMinGClanMaps().byNombre;

  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var nombre = String(r[CC.NOMBRE - 1] || '').trim();
    if (!nombre) continue;
    var condicion = String(r[CC.CONDICION - 1] || '').trim();
    var subcategoria = (condicion.toLowerCase() === 'vetado') ? 'Vetado' : 'Terna';
    mapa[nombre.toLowerCase()] = {
      nombre:         nombre,
      subcategoria:   subcategoria,
      clanTag:        r[CC.CLAN_TAG     - 1],
      lider:          r[CC.LIDER        - 1],
      miembros:       r[CC.MIEMBROS     - 1],
      minG:           (minGByNombre[nombre] !== undefined) ? minGByNombre[nombre] : CFG.MIN_G_DEFAULT,
      trofeos:        r[CC.TROFEOS      - 1],
      liga:           r[CC.LIGA         - 1],
      requerimiento:  r[CC.REQUERIMIENTO- 1],
      copas:          r[CC.COPAS        - 1],
      donaciones:     r[CC.DONACIONES   - 1],
      tipo:           r[CC.TIPO         - 1],
      pais:           r[CC.PAIS         - 1],
      descripcion:    r[CC.DESCRIPCION  - 1],
      royaleApi:      r[CC.ROYALE_API   - 1],
      cwStats:        r[CC.CW_STATS     - 1],
      app:            r[CC.APP          - 1],
      renderClans:    r[CC.RENDER_CLANS    - 1],
      renderMembers:  r[CC.RENDER_MEMBERS  - 1],
      renderRiverrace:r[CC.RENDER_RIVERRACE- 1],
      renderPlayers:  r[CC.RENDER_PLAYERS  - 1],
      condicion:      condicion,
    };
  }
  return mapa;
}

/**
 * _formatearInfoClan(info)
 * Construye el texto de "Información sobre el clan" a partir de los datos de la hoja Clan.
 */
function _formatearInfoClan(info) {
  var lineas = [];
  lineas.push('ClanTag: ' + (info.clanTag       || ''));
  lineas.push('Nombre: '  + (info.nombre         || ''));
  lineas.push('Líder: '   + (info.lider          || ''));
  lineas.push('Miembros: '+ _fmt(info.miembros));
  lineas.push('Min_G: '   + _fmt(info.minG));
  lineas.push('Trofeos: ' + _fmt(info.trofeos));
  lineas.push('Liga: '    + (info.liga           || ''));
  lineas.push('Requerimiento: ' + _fmt(info.requerimiento));
  lineas.push('Copas: '   + _fmt(info.copas));
  lineas.push('Donaciones: ' + _fmt(info.donaciones));
  lineas.push('Tipo: '    + (info.tipo           || ''));
  lineas.push('País: '    + (info.pais           || ''));
  lineas.push('Descripción: ' + (info.descripcion|| ''));
  lineas.push('RoyaleApi: '  + (info.royaleApi   || ''));
  lineas.push('CWStats: '    + (info.cwStats      || ''));
  lineas.push('App: '        + (info.app          || ''));
  lineas.push('Render (clans): '     + (info.renderClans     || ''));
  lineas.push('Render (members): '   + (info.renderMembers   || ''));
  lineas.push('Render (riverrace): ' + (info.renderRiverrace || ''));
  lineas.push('Render (players): '   + (info.renderPlayers   || ''));
  return lineas.join('\n');
}

/** Formatea un número con separadores de miles, o devuelve '' si vacío. */
function _fmt(v) {
  if (v === '' || v === null || v === undefined) return '';
  var n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString('es-PE');
}

/**
 * _getNombresClanesOrdenados(ss, clanOrden) [→ Contexto_Base_Web.md §30B032]
 */
function _getNombresClanesOrdenados(ss, clanOrden) {
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (!sh || sh.getLastRow() < 2) return [];
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  return data.map(function(r) { return String(r[2] || '').trim(); }).filter(Boolean);
}

/**
 * _agruparPorClanOrdenado(lista, clanOrden) [→ Contexto_Base_Web.md §30B033]
 */
function _agruparPorClanOrdenado(lista, clanOrden) {
  var grupos = {};
  var clanes  = [];
  for (var i = 0; i < lista.length; i++) {
    var cn = lista[i].clan;
    if (!grupos[cn]) { grupos[cn] = []; clanes.push(cn); }
    grupos[cn].push(lista[i]);
  }
  clanes.sort(function(a, b) {
    var oa = clanOrden[a.toLowerCase()]; if (oa === undefined) oa = 9999;
    var ob = clanOrden[b.toLowerCase()]; if (ob === undefined) ob = 9999;
    return oa - ob;
  });
  return clanes.map(function(cn) { return { clan: cn, lista: grupos[cn] }; });
}

/**
 * _obtenerCelularPorTag()
 * Devuelve un mapa { tag -> true } para jugadores activos Terna con celular.
 */
/**
 * _obtenerCelularPorTag(ss) [→ Contexto_Base_Web.md §30B034]
 */
function _obtenerCelularPorTag(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return {};
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  var mapa = {};
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][IC.ESTADO - 1]) === 'Activo' &&
        String(data[i][IC.CELULAR - 1] || '').trim() !== '' &&
        CFG.TERNA_TAGS.indexOf(String(data[i][IC.CLAN_TAG - 1])) >= 0) {
      mapa[String(data[i][IC.TAG - 1])] = String(data[i][IC.CELULAR - 1]).trim();
    }
  }
  return mapa;
}

/**
 * _obtenerPrestamoPorTag(ss) [→ Contexto_Base_Web.md §30B035]
 */
function _obtenerPrestamoPorTag(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return {};
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  var mapa = {};
  for (var i = 0; i < data.length; i++) {
    var tag = String(data[i][DC.TAG - 1] || '').trim();
    var prestamo = String(data[i][DC.PRESTAMO - 1] || '').trim();
    if (tag && prestamo) {
      mapa[tag] = prestamo;
    }
  }
  return mapa;
}

/**
 * _sufijoPrestamo(nombrePrestamo) [→ Contexto_Base_Web.md §30B036]
 */
function _sufijoPrestamo(nombrePrestamo) {
  var n = String(nombrePrestamo || '').trim();
  if (!n) return '';
  return ' (' + n.charAt(0).toUpperCase() + ')';
}

/**
 * _getPlantillasParaMensajes(ss) [→ Contexto_Base_Web.md §30B037]
 */
function _getPlantillasParaMensajes(ss) {
  var estaticas = _leerEntradasIndicePorTipo('Estático');
  var out = [];
  for (var i = 0; i < estaticas.length; i++) {
    var categoria    = String(estaticas[i].categoria    || '').trim();
    var subcategoria = String(estaticas[i].subcategoria || '').trim();
    var clan         = String(estaticas[i].clan         || '').trim();
    var contenido    = String(estaticas[i].contenido    || '');
    if (!categoria || !contenido) continue;
    out.push({ categoria: categoria, subcategoria: subcategoria, clan: clan, contenido: contenido });
  }
  return out;
}

function _obtenerDatosPendientes(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.PENDIENTES);
  if (!sh || sh.getLastRow() < 2) return [];
  // 9 columnas: N°|Tag|Nombre|Nom_Multi|Préstamo|Clan|Faltantes|Celular|WSP [→ Contexto_Base_Web.md §30B038]
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
  var pendientes = data.map(function(r) { return { tag: r[1], nombre: r[2], nomMulti: r[3], prestamo: r[4], clan: r[5], faltantes: r[6] }; });

  // NUEVO (pedido usuario): se agrega `rango` a cada pendiente, cruzado por [→ Contexto_Base_Web.md §30B039]
  var dirPorTagRango = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.DIRECTORIO, IC.TAG - 1, DIR_SHEET_COLS);
  pendientes.forEach(function(p) {
    var filaDirP = dirPorTagRango[String(p.tag || '').trim().toUpperCase()];
    p.rango = filaDirP ? String(filaDirP[IC.RANGO - 1] || '') : '';
  });

  return pendientes;
}

function _obtenerDatosSinCelular(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return [];
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  var filtrado = [];
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][IC.ESTADO    - 1]) === 'Activo' &&
        String(data[i][IC.CELULAR   - 1] || '').trim() === '' &&
        CFG.TERNA_TAGS.indexOf(String(data[i][IC.CLAN_TAG - 1])) >= 0) {
      filtrado.push({ nombre: data[i][IC.NOMBRE - 1], clan: data[i][IC.CLAN - 1] });
    }
  }
  return filtrado;
}

function _obtenerDatosSinEtiqueta(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return [];
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  var filtrado = [];
  for (var i = 0; i < data.length; i++) {
    // NOTA: "Iniciales" ya NO se exige aquí. Es un campo distinto (identificación/ [→ Contexto_Base_Web.md §30B040]
    if (String(data[i][IC.ESTADO    - 1]) === 'Activo' &&
        String(data[i][IC.ETIQUETA  - 1]) !== 'Sí' &&
        CFG.TERNA_TAGS.indexOf(String(data[i][IC.CLAN_TAG - 1])) >= 0) {
      filtrado.push({ nombre: data[i][IC.NOMBRE - 1], clan: data[i][IC.CLAN - 1] });
    }
  }
  return filtrado;
}