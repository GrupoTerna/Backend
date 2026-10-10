// ==============================================================================
// 12_Players_Links.gs
// Vistas derivadas del Directorio: hojas Players y Links.
// ==============================================================================

// ----- Funciones internas / helpers -----

// FASE B3 (16/07/2026) — Población de las hojas Players y Links. [→ Contexto_Base_Web.md §12B001]

/**
 * _proyectarPlayers(r) [→ Contexto_Base_Web.md §12B002]
 */
function _proyectarPlayers(r) {
  var fila = new Array(PLAYERS_TOTAL_COLS).fill('');
  for (var campo in PC) {
    if (DC[campo] !== undefined) fila[PC[campo] - 1] = r[DC[campo] - 1];
  }
  return fila;
}

/**
 * _escribirPlayers(ss, filas) [→ Contexto_Base_Web.md §12B003]
 */
function _escribirPlayers(ss, filas) {
  var sh = ss.getSheetByName(CFG.SHEETS.PLAYERS);
  if (!sh) { Logger.log('[Players] Hoja no encontrada, se omite.'); return; }
  var lastRow = sh.getLastRow();
  if (lastRow >= 2) sh.getRange(2, 1, lastRow - 1, PLAYERS_TOTAL_COLS).clearContent();
  if (filas.length === 0) return;

  var filasPlayers = filas.map(function(f) { return _proyectarPlayers(f); });
  sh.getRange(2, 1, filasPlayers.length, PLAYERS_TOTAL_COLS).setValues(filasPlayers);

  // Limpiar bordes de todo el rango de datos posible antes de reponerlos, [→ Contexto_Base_Web.md §12B004]
  var maxRowsPlayers = sh.getMaxRows();
  if (maxRowsPlayers > 1) {
    try {
      sh.getRange(2, 1, maxRowsPlayers - 1, PLAYERS_TOTAL_COLS)
        .setBorder(false, false, false, false, false, false);
    } catch(e) {}
  }
  applyBorderCenter(sh.getRange(2, 1, filasPlayers.length, PLAYERS_TOTAL_COLS));

  // Formato condicional por Rango, igual criterio de colores que Directorio. [→ Contexto_Base_Web.md §12B005]
  _aplicarFormatoCondicionalPlayers(sh, filasPlayers.length, PLAYERS_TOTAL_COLS, PC.RANGO);

  var COLS_NUMERICAS_PLAYERS_ = [
    PC.NUM,
    PC.NIVEL, PC.NIVEL2, PC.COPAS, PC.COPAS_MAX, PC.V_GUERRA,
    PC.VICTORIAS, PC.DERROTAS, PC.BATALLAS, PC.RACHA,
    PC.CL_LIGA, PC.CL_TROFEOS, PC.CL_RANGO,
    PC.VICTORIAS_3C, PC.MAX_VIC_DESAFIOS, PC.TORNEOS, PC.EMOTES, PC.BANNERS,
    PC.CARTAS_DESAFIOS, PC.CARTAS_TORNEOS, PC.DON_R, PC.DON_D
  ];
  for (var ci = 0; ci < COLS_NUMERICAS_PLAYERS_.length; ci++) {
    sh.getRange(2, COLS_NUMERICAS_PLAYERS_[ci], filasPlayers.length, 1).setNumberFormat('#,##0');
  }
}

/**
 * _aplicarFormatoCondicionalPlayers(sh, numFilas, totalCols, colRangoNum) [→ Contexto_Base_Web.md §12B006]
 */
function _aplicarFormatoCondicionalPlayers(sh, numFilas, totalCols, colRangoNum) {
  if (numFilas === 0) return;
  var dataRange = sh.getRange(2, 1, numFilas, totalCols);
  var colRango  = colLetter(colRangoNum);
  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Líder"')
      .setBackground(CFG.COLORES.LIDER_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Colíder"')
      .setBackground(CFG.COLORES.COLIDER_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Veterano"')
      .setBackground(CFG.COLORES.VETERANO_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Miembro"')
      .setBackground(CFG.COLORES.MIEMBRO_BG).setRanges([dataRange]).build(),
  ];
  _tryCondFmt(sh, rules);
}

/**
 * _proyectarLinksIdentidad(r) [→ Contexto_Base_Web.md §12B007]
 */
function _proyectarLinksIdentidad(r) {
  var fila = new Array(LINKS_TOTAL_COLS).fill('');
  var CAMPOS_IDENTIDAD_LC = ['NUM', 'TAG', 'NOMBRE', 'NOM_MULTI', 'PRESTAMO', 'CLAN', 'CLAN_TAG', 'RANGO'];
  for (var i = 0; i < CAMPOS_IDENTIDAD_LC.length; i++) {
    var campo = CAMPOS_IDENTIDAD_LC[i];
    fila[LC[campo] - 1] = r[DC[campo] - 1];
  }
  return fila;
}

/**
 * _escribirLinks(ss, filas) [→ Contexto_Base_Web.md §12B008]
 */
function _escribirLinks(ss, filas) {
  var sh = ss.getSheetByName(CFG.SHEETS.LINKS);
  if (!sh) { Logger.log('[Links] Hoja no encontrada, se omite.'); return; }
  var lastRow = sh.getLastRow();

  var oldDeckByTag  = {};
  var oldDeck2ByTag = {};
  if (lastRow >= 2) {
    var tagsPrevios    = sh.getRange(2, LC.TAG,    lastRow - 1, 1).getValues();
    var deckPreviosRT  = sh.getRange(2, LC.DECK,   lastRow - 1, 1).getRichTextValues();
    var deck2PreviosRT = sh.getRange(2, LC.DECK_2, lastRow - 1, 1).getRichTextValues();
    for (var pt = 0; pt < tagsPrevios.length; pt++) {
      var tagPrevio = String(tagsPrevios[pt][0] || '').trim();
      if (!tagPrevio) continue;
      var tagPrevioConHash = tagPrevio.charAt(0) !== '#' ? '#' + tagPrevio : tagPrevio;
      oldDeckByTag[tagPrevioConHash]  = deckPreviosRT[pt][0];
      oldDeck2ByTag[tagPrevioConHash] = deck2PreviosRT[pt][0];
    }
  }

  if (lastRow >= 2) sh.getRange(2, 1, lastRow - 1, LINKS_TOTAL_COLS).clearContent();
  if (filas.length === 0) return;

  var filasIdentidad = filas.map(function(f) { return _proyectarLinksIdentidad(f); });
  sh.getRange(2, 1, filasIdentidad.length, LINKS_TOTAL_COLS).setValues(filasIdentidad);

  var wspVals = [], royaleVals = [], cwstatsVals = [], renderVals = [], deckVals = [], deck2Vals = [];
  var linkVacio = makeLink('', '');

  var cardInfoMazo = _construirCardInfoMap(ss);
  var cards2PorTag = _construirCards2PorTag(ss);

  for (var i = 0; i < filas.length; i++) {
    var tag        = String(filas[i][DC.TAG - 1] || '').trim();
    var tagSinHash = cleanTag(tag);
    var pref       = String(filas[i][DC.PREFIJO - 1] || '').replace(/\D/g, '');
    var cel        = String(filas[i][DC.CELULAR - 1] || '').replace(/\D/g, '');
    var tagMazo    = tag.charAt(0) !== '#' ? '#' + tag : tag;
    var deckUrl    = _generarUrlMazoDesdeMapas(tagMazo, cardInfoMazo, cards2PorTag[tagMazo]);
    var deckUrl2   = _generarUrlMazo2DesdeMapas(tagMazo, cardInfoMazo, cards2PorTag[tagMazo]);

    wspVals.push([cel ? makeLink('Link', 'https://wa.me/' + pref + cel) : linkVacio]);
    royaleVals.push([makeLink('Link', 'https://royaleapi.com/player/' + tagSinHash + '/')]);
    cwstatsVals.push([makeLink('Link', 'https://cwstats.com/player/' + tagSinHash + '/')]);
    renderVals.push([makeLink('Link', CFG.API_BASE + '/players/' + encodeTag(tag))]);
    deckVals.push([deckUrl  ? makeLink('Mazos', deckUrl)  : (oldDeckByTag[tagMazo]  || linkVacio)]);
    deck2Vals.push([deckUrl2 ? makeLink('Mazos', deckUrl2) : (oldDeck2ByTag[tagMazo] || linkVacio)]);
  }

  sh.getRange(2, LC.WSP,        filas.length, 1).setRichTextValues(wspVals);
  sh.getRange(2, LC.ROYALE_API, filas.length, 1).setRichTextValues(royaleVals);
  sh.getRange(2, LC.CW_STATS,   filas.length, 1).setRichTextValues(cwstatsVals);
  sh.getRange(2, LC.RENDER,     filas.length, 1).setRichTextValues(renderVals);
  sh.getRange(2, LC.DECK,       filas.length, 1).setRichTextValues(deckVals);
  sh.getRange(2, LC.DECK_2,     filas.length, 1).setRichTextValues(deck2Vals);

  // FIX (05-ago-2026): Links nunca tenía formato condicional (a diferencia [→ Contexto_Base_Web.md §12B009]
  _aplicarFormatoCondicionalDirectorio(sh, filasIdentidad.length, LINKS_TOTAL_COLS, 0, 0, LC.RANGO);
}

/**
 * _leerLinksRichTextPorTag(ss, camposLC) [→ Contexto_Base_Web.md §12B010]
 */
function _leerLinksRichTextPorTag(ss, camposLC) {
  var mapa = {};
  var sh = ss.getSheetByName(CFG.SHEETS.LINKS);
  if (!sh || sh.getLastRow() < 2) return mapa;
  var lastRow = sh.getLastRow();
  var tags = sh.getRange(2, LC.TAG, lastRow - 1, 1).getValues();
  var rtPorCampo = {};
  for (var c = 0; c < camposLC.length; c++) {
    rtPorCampo[camposLC[c]] = sh.getRange(2, LC[camposLC[c]], lastRow - 1, 1).getRichTextValues();
  }
  for (var i = 0; i < tags.length; i++) {
    var tag = String(tags[i][0] || '').trim();
    if (!tag) continue;
    var obj = {};
    for (var c2 = 0; c2 < camposLC.length; c2++) {
      obj[camposLC[c2]] = rtPorCampo[camposLC[c2]][i][0];
    }
    mapa[tag] = obj;
  }
  return mapa;
}

/**
 * _leerLinksComoMapaPorTagConUrls(ss) [→ Contexto_Base_Web.md §12B011]
 */
function _leerLinksComoMapaPorTagConUrls(ss) {
  var mapa = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.LINKS, LC.TAG - 1, LINKS_TOTAL_COLS);
  var sh = ss.getSheetByName(CFG.SHEETS.LINKS);
  if (!sh || sh.getLastRow() < 2) return mapa;
  var lastRow = sh.getLastRow();
  var CAMPOS_ENLACE = ['WSP', 'ROYALE_API', 'CW_STATS', 'RENDER', 'DECK', 'DECK_2'];
  var tags = sh.getRange(2, LC.TAG, lastRow - 1, 1).getValues();
  for (var c = 0; c < CAMPOS_ENLACE.length; c++) {
    var campo = CAMPOS_ENLACE[c];
    var richCol = sh.getRange(2, LC[campo], lastRow - 1, 1).getRichTextValues();
    for (var i = 0; i < tags.length; i++) {
      var tag = String(tags[i][0] || '').trim().toUpperCase();
      if (!tag || !mapa[tag]) continue;
      mapa[tag][LC[campo] - 1] = richCol[i][0].getLinkUrl() || '';
    }
  }
  return mapa;
}