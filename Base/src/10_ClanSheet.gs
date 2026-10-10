// ==============================================================================
// 10_ClanSheet.gs
// Hoja Clan: resumen agregado por clan.
// ==============================================================================

// ----- Variables y constantes -----

// 10_ClanSheet.gs [→ Contexto_Base_Web.md §10B001]

// Índices de columna en la hoja Clan (1-based) [→ Contexto_Base_Web.md §10B002]
var CC = {
  ORDEN:1, CLAN_TAG:2, NOMBRE:3, LIDER:4, MIEMBROS:5,
  TROFEOS:6, LIGA:7, REQUERIMIENTO:8, COPAS:9, DONACIONES:10,
  TIPO:11, PAIS:12, DESCRIPCION:13,
  // NUEVO (16-sep-2026, pedido del usuario -- "hay imágenes de clan, [→ Contexto_Base_Web.md §10B003]
  BADGE_ID:14,
  ROYALE_API:15, ANALYTICS:16, CSV:17, CW_STATS:18, APP:19,
  RENDER_CLANS:20, RENDER_MEMBERS:21, RENDER_RIVERRACE:22, RENDER_PLAYERS:23,
  CONDICION:24
};

// ----- Funciones manuales / punto de entrada -----

/**
 * Actualiza la hoja Clan con los datos de cada clan desde CACHE_CLAN_DATA.
 */
function updateClanSheet() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (!sh) { Logger.log('[Clan] Hoja no encontrada'); return; }

  var lastRow = sh.getLastRow();
  if (lastRow < 2) { Logger.log('[Clan] Sin filas de datos'); return; }

  Logger.log('[Clan] Actualizando ' + (lastRow - 1) + ' clanes...');

  // Min_T y Min_G ya NO viven en esta hoja (hoy: Min_T en T_Lista/S_Lista y
  // Min_G en CR_Lista — FASE 27, 11/08/2026).

  for (var row = 2; row <= lastRow; row++) {
    var clanTag = String(sh.getRange(row, CC.CLAN_TAG).getValue() || '').trim();
    if (!clanTag) continue;

    var clanData = _getClanCache(clanTag);
    if (!clanData) {
      // API falló para este clan -> conservar datos existentes
      Logger.log('[Clan] Sin cache para ' + clanTag + ', conservando datos existentes.');
      continue;
    }

    var info    = clanData.info;
    var members = clanData.members || [];
    var tagSinHash = cleanTag(clanTag);

    // Nombre, líder, miembros
    sh.getRange(row, CC.NOMBRE).setValue(info.name || '');
    sh.getRange(row, CC.LIDER).setValue(getClanLeader(members));
    sh.getRange(row, CC.MIEMBROS).setValue(info.members || 0);

    // Trofeos y liga
    var trofeos = Number(info.clanWarTrophies) || 0;
    sh.getRange(row, CC.TROFEOS).setValue(trofeos);
    _trySetFmt(sh, row, CC.TROFEOS, '#,##0');
    sh.getRange(row, CC.LIGA).setValue(getLiga(trofeos));

    // Requerimiento, copas, donaciones
    sh.getRange(row, CC.REQUERIMIENTO).setValue(info.requiredTrophies || 0);
    _trySetFmt(sh, row, CC.REQUERIMIENTO, '#,##0');
    sh.getRange(row, CC.COPAS).setValue(info.clanScore || 0);
    _trySetFmt(sh, row, CC.COPAS, '#,##0');
    sh.getRange(row, CC.DONACIONES).setValue(info.donationsPerWeek || 0);
    _trySetFmt(sh, row, CC.DONACIONES, '#,##0');

    // Tipo, país, descripción
    sh.getRange(row, CC.TIPO).setValue(info.type || '');
    sh.getRange(row, CC.PAIS).setValue((info.location && info.location.name) ? info.location.name : '');
    sh.getRange(row, CC.DESCRIPCION).setValue(info.description || '');

    // NUEVO (16-sep-2026, pedido del usuario -- ver docblock de CC.BADGE_ID, [→ Contexto_Base_Web.md §10B004]
    sh.getRange(row, CC.BADGE_ID).setValue(info.badgeId || '');

    // Condición: fijo por ClanTag
    var condicion = (CFG.TERNA_TAGS.indexOf(clanTag) >= 0) ? 'Terna' : 'Vetado';
    sh.getRange(row, CC.CONDICION).setValue(condicion);

    // ENLACES con makeLink (texto enriquecido - NUNCA HYPERLINK()) [→ Contexto_Base_Web.md §10B005]
    sh.getRange(row, CC.ROYALE_API).setRichTextValue(
      makeLink('Link', 'https://royaleapi.com/clan/' + tagSinHash));

    // FIX (12-ago-2026): 'Analytics' y 'CSV' — dos enlaces más al historial [→ Contexto_Base_Web.md §10B006]
    sh.getRange(row, CC.ANALYTICS).setRichTextValue(
      makeLink('Link', 'https://royaleapi.com/clan/' + tagSinHash + '/war/analytics'));

    sh.getRange(row, CC.CSV).setRichTextValue(
      makeLink('Link', 'https://royaleapi.com/clan/' + tagSinHash + '/war/analytics/csv'));

    sh.getRange(row, CC.CW_STATS).setRichTextValue(
      makeLink('Link', 'https://cwstats.com/clan/' + tagSinHash));

    sh.getRange(row, CC.APP).setRichTextValue(
      makeLink('Link', 'https://link.clashroyale.com/es/?clanInfo?id=' + tagSinHash));

    sh.getRange(row, CC.RENDER_CLANS).setRichTextValue(
      makeLink('Link', CFG.API_BASE + '/clans/%23' + tagSinHash));

    sh.getRange(row, CC.RENDER_MEMBERS).setRichTextValue(
      makeLink('Link', CFG.API_BASE + '/clans/%23' + tagSinHash + '/members'));

    sh.getRange(row, CC.RENDER_RIVERRACE).setRichTextValue(
      makeLink('Link', CFG.API_BASE + '/clans/%23' + tagSinHash + '/currentriverrace'));

    // Render (players): texto = nombre del líder, URL = API /players del líder [→ Contexto_Base_Web.md §10B007]
    var liderNombre = getClanLeader(members);
    var liderTagSinHash = cleanTag(getClanLeaderTag(members));
    if (liderNombre && liderTagSinHash) {
      sh.getRange(row, CC.RENDER_PLAYERS).setRichTextValue(
        makeLink(liderNombre, CFG.API_BASE + '/players/%23' + liderTagSinHash));
    }
  }

  // Formato condicional (Condición columna V, filas con datos)
  _aplicarFormatoCondicionalClan(sh, lastRow);

  // Bordes y centrado en el rango de datos
  if (lastRow >= 2) {
    applyBorderCenter(sh.getRange(2, 1, lastRow - 1, CC.CONDICION));
  }

  // Persistir el estado actual de la hoja (incluye Min_G manual) en el [→ Contexto_Base_Web.md §10B008]
  syncClanCSV();

  Logger.log('[Clan] updateClanSheet completado.');
}

// ----- Funciones internas / helpers -----

/**
 * _getMinGClanMaps() [→ Contexto_Base_Web.md §10B009]
 */
function _getMinGClanMaps() {
  var byTag = {}, byNombre = {};

  // Fuente única: par vigente de CR_Lista (Extra!Descenso_Vigente_ID). Se [→ Contexto_Base_Web.md §10B010]
  var idDescensoVigente = _getIdVigenteExtraCR('Descenso');
  var filaDescensoCR = idDescensoVigente ? _getFilaCRListaPorId(idDescensoVigente) : null;

  if (filaDescensoCR) {
    filaDescensoCR.porClan.forEach(function (b) {
      var minG = (b.minCR && b.minCR.miembro && b.minCR.miembro.qty > 0) ? b.minCR.miembro.qty : CFG.MIN_G_DEFAULT;
      byNombre[b.clan] = minG;
    });
  } else if (idDescensoVigente) {
    Logger.log('[Min_G] Extra!Descenso_Vigente_ID (' + idDescensoVigente + ') no matchea ninguna fila real de ' +
      'CR_Lista. Sin respaldo (T_Requisitos dado de baja): sin datos de Min_G esta corrida.');
  } else {
    Logger.log('[Min_G] Extra!Descenso_Vigente_ID está vacío. Sin respaldo (T_Requisitos dado de baja): ' +
      'sin datos de Min_G esta corrida.');
  }

  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (sh && sh.getLastRow() >= 2) {
    var data = sh.getRange(2, 1, sh.getLastRow() - 1, CC.NOMBRE).getValues();
    for (var i = 0; i < data.length; i++) {
      var tag    = String(data[i][CC.CLAN_TAG - 1] || '').trim();
      var nombre = String(data[i][CC.NOMBRE    - 1] || '').trim();
      if (tag && nombre && byNombre[nombre] !== undefined) byTag[tag] = byNombre[nombre];
    }
  }

  return { byTag: byTag, byNombre: byNombre };
}

/**
 * Aplica formato condicional a la hoja Clan según la columna Condición.
 */
function _aplicarFormatoCondicionalClan(sh, lastRow) {
  if (lastRow < 2) return;

  var dataRange = sh.getRange(2, 1, lastRow - 1, CC.CONDICION);
  var colCond   = colLetter(CC.CONDICION);

  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + colCond + '2="Terna"')
      .setBackground(CFG.COLORES.TERNA_BG)
      .setRanges([dataRange])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + colCond + '2="Vetado"')
      .setBackground(CFG.COLORES.VETADO_CLAN_ROW_BG)
      .setRanges([dataRange])
      .build(),
  ];

  _tryCondFmt(sh, rules);
}