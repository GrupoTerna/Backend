// 10_ClanSheet.gs
// Hoja Clan: resumen agregado por clan.
// 10_ClanSheet.gs [→ Contexto_Base_Web.md §10B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hoja Clan: actualizar
//    - Hoja Clan: nombre actualizable (tanda 10 de Clanes por Tag)
//  Parte 2 — Funciones que no se corren a mano
//    - Hoja Clan: ayudas
//    - Hoja Clan: nombre actualizable, ayudas (tanda 10 de Clanes por Tag)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

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

// Tanda 10 de Clanes por Tag (17-nov-2026): nombre de clan actualizable. [→ Contexto_Base_Web.md §PF503]
// Tope de filas que _sincronizarNombreClan_() reescribe por corrida (todas las hojas y Backup_Guerra.csv juntos); si se alcanza, el cambio queda pendiente y la siguiente corrida sigue.
var NOMBRE_CLAN_SYNC_TOPE_FILAS = 20000;
// Propiedad del script con el ultimo nombre ya sincronizado de cada clan: JSON { '#TAG': 'Nombre' }.
var NOMBRE_CLAN_SYNC_PROP = 'NOMBRE_CLAN_SINCRONIZADO';

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Hoja Clan: actualizar -----

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

  // Tanda 10 (§PF503): si Supercell cambio el nombre de un clan, se actualiza en las demas hojas, en Backup_Guerra.csv y en sus carpetas de Drive, siempre por Clan_Tag.
  // Va dentro de un try para que un fallo aqui nunca deje a medias la actualizacion de la hoja Clan.
  try { _sincronizarNombreClan_({ aplicar: true }); }
  catch (eNombre) { Logger.log('[NombreClan] No se pudo sincronizar el nombre de los clanes: ' + eNombre.message); }

  _reiniciarMapaNombreClanATagTerna_(); // §PF403: la hoja Clan cambio; el mapa nombre -> Tag de esta ejecucion se vuelve a leer

  Logger.log('[Clan] updateClanSheet completado.');
}

// ----- Hoja Clan: nombre actualizable (tanda 10 de Clanes por Tag) -----

/**
 * sincronizarNombreClanInforme() / sincronizarNombreClanAplicar() [→ Contexto_Base_Web.md §PF503]
 * Manuales. Comparan el nombre vigente de cada clan (hoja Clan, o Backup_Clan.csv si la hoja no esta) con el de las filas de Guerra, Control, Control_2, Vetados, Mensajes, Alertas_HistorialGuerra y
 * Backup_Guerra.csv, y con el nombre de sus carpetas de Drive, SIEMPRE por Clan_Tag. Informe: no cambia nada y deja «Cambio_Nombre_Clan <fecha> (informe).csv» en Drive.
 * Aplicar: reescribe solo la columna Clan de las filas de esos clanes y renombra las carpetas. Es idempotente y sirve tambien para reparar si la sincronizacion automatica quedo a medias.
 * La sincronizacion automatica la llama updateClanSheet() solo cuando el nombre de un clan cambio respecto del ultimo ya sincronizado.
 */
function sincronizarNombreClanInforme() { _sincronizarNombreClanManual_(false); }

function sincronizarNombreClanAplicar() { _sincronizarNombreClanManual_(true); }

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Hoja Clan: ayudas -----

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
  // PF073: hoja Clan viva o Backup_Clan.csv. [→ Contexto_Base_Web.md §PF073]
  var dataClanMin = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.CLAN, 'Backup_Clan.csv', CC.CONDICION).filas;
  if (dataClanMin.length) {
    var data = dataClanMin;
    for (var i = 0; i < data.length; i++) {
      var tag    = String(data[i][CC.CLAN_TAG - 1] || '').trim();
      var nombre = String(data[i][CC.NOMBRE    - 1] || '').trim();
      if (tag && nombre && byNombre[nombre] !== undefined) byTag[tag] = byNombre[nombre];
    }
  }

  return { byTag: byTag, byNombre: byNombre };
}

// ----- Hoja Clan: nombre actualizable, ayudas (tanda 10 de Clanes por Tag) -----

/**
 * _nombresVigentesClanes_() [→ Contexto_Base_Web.md §PF503]
 * { '#TAG': 'Nombre' } de los clanes de CFG.CLAN_TAGS (los cuatro Terna y el vetado), leido de la hoja Clan o de Backup_Clan.csv. Los clanes externos nunca entran: sus nombres en filas historicas son lo que se vio en su momento.
 */
function _nombresVigentesClanes_() {
  var ss = _getSs();
  var filas = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.CLAN, 'Backup_Clan.csv', CC.CONDICION).filas || [];
  var propios = {};
  (CFG.CLAN_TAGS || []).forEach(function (t) { propios[String(t).toUpperCase()] = true; });
  var vigentes = {};
  for (var i = 0; i < filas.length; i++) {
    var tag = String(filas[i][CC.CLAN_TAG - 1] || '').trim().toUpperCase();
    var nombre = String(filas[i][CC.NOMBRE - 1] || '').trim();
    if (propios[tag] && nombre && nombre.charAt(0) !== '#') vigentes[tag] = nombre;
  }
  return vigentes;
}

/**
 * _decidirClanesConNombreNuevo_(vigentes, ultimoSincronizado, forzar) [→ Contexto_Base_Web.md §PF503]
 * Funcion pura. Devuelve { pendientes: {tag: nombre}, inicializar: {tag: nombre} }.
 * pendientes: clanes cuyo nombre vigente difiere del ultimo ya sincronizado (todos los que tengan nombre vigente si forzar es true).
 * inicializar: clanes sin ultimo nombre registrado (primera corrida): se anota el nombre vigente sin reescribir nada, porque no hay nombre anterior con el que comparar.
 */
function _decidirClanesConNombreNuevo_(vigentes, ultimoSincronizado, forzar) {
  var pendientes = {}, inicializar = {};
  Object.keys(vigentes || {}).forEach(function (tag) {
    var nombre = vigentes[tag];
    var previo = (ultimoSincronizado || {})[tag];
    if (forzar) pendientes[tag] = nombre;
    else if (previo === undefined || previo === null || previo === '') inicializar[tag] = nombre;
    else if (String(previo) !== nombre) pendientes[tag] = nombre;
  });
  return { pendientes: pendientes, inicializar: inicializar };
}

/**
 * _planNombreClanEnFilas_(filas, colClan, colTag, nombresPorTag, tope) [→ Contexto_Base_Web.md §PF503]
 * Funcion pura (no toca hojas ni Drive). filas: filas de datos (sin encabezado). Una fila cambia solo si su Clan_Tag es uno de nombresPorTag y su Clan es distinto del nombre vigente.
 * Las filas sin Clan_Tag, o con el Tag de un clan externo, no se tocan nunca (no se adivina por nombre). Se detiene al llegar a tope cambios.
 * Devuelve { cambios: [{ i, tag, antes, despues }], porTag: {tag: n}, truncado: bool }.
 */
function _planNombreClanEnFilas_(filas, colClan, colTag, nombresPorTag, tope) {
  var cambios = [], porTag = {}, truncado = false;
  for (var i = 0; i < filas.length; i++) {
    var tag = String(filas[i][colTag - 1] === undefined || filas[i][colTag - 1] === null ? '' : filas[i][colTag - 1]).trim().toUpperCase();
    var nuevo = tag ? nombresPorTag[tag] : '';
    if (!nuevo) continue;
    var actual = String(filas[i][colClan - 1] === undefined || filas[i][colClan - 1] === null ? '' : filas[i][colClan - 1]);
    if (actual.trim() === nuevo) continue;
    if (cambios.length >= tope) { truncado = true; break; }
    cambios.push({ i: i, tag: tag, antes: actual, despues: nuevo });
    porTag[tag] = (porTag[tag] || 0) + 1;
  }
  return { cambios: cambios, porTag: porTag, truncado: truncado };
}

/**
 * _sincronizarHojaNombreClan_(sh, def, nombresPorTag, tope, aplicar) [→ Contexto_Base_Web.md §PF503]
 * Lee solo las columnas Clan y Clan_Tag de una hoja (def: { colClan, colTag, fila }, fila = primera fila de datos) y, si aplicar, reescribe solo la columna Clan.
 * Si la hoja no existe o su columna Clan_Tag aun no tiene ese encabezado, no la toca y lo dice en estado.
 */
function _sincronizarHojaNombreClan_(sh, def, nombresPorTag, tope, aplicar) {
  var res = { cambiadas: 0, porTag: {}, truncado: false, estado: 'ok' };
  if (!sh) { res.estado = 'la hoja no existe'; return res; }
  if (sh.getLastColumn() < def.colTag || String(sh.getRange(def.fila - 1, def.colTag).getValue()).trim() !== 'Clan_Tag') { res.estado = 'sin columna Clan_Tag (no se toca)'; return res; }
  var ultima = sh.getLastRow();
  if (ultima < def.fila) return res;
  var n = ultima - def.fila + 1;
  var colClan = sh.getRange(def.fila, def.colClan, n, 1).getValues();
  var colTag = sh.getRange(def.fila, def.colTag, n, 1).getValues();
  var filas = [];
  for (var i = 0; i < n; i++) filas.push([colClan[i][0], colTag[i][0]]);
  var plan = _planNombreClanEnFilas_(filas, 1, 2, nombresPorTag, tope);
  res.cambiadas = plan.cambios.length; res.porTag = plan.porTag; res.truncado = plan.truncado;
  if (aplicar && plan.cambios.length) {
    plan.cambios.forEach(function (c) { colClan[c.i][0] = c.despues; });
    sh.getRange(def.fila, def.colClan, n, 1).setValues(colClan);
  }
  return res;
}

/**
 * _sincronizarCsvGuerraNombreClan_(nombresPorTag, tope, aplicar, marca) [→ Contexto_Base_Web.md §PF503]
 * Igual que la de las hojas, sobre Backup_Guerra.csv. Si aplicar y hay cambios, deja primero una copia «Backup_Guerra ANTES de sincronizar nombre de clan <marca>.csv» y luego escribe el CSV completo.
 */
function _sincronizarCsvGuerraNombreClan_(nombresPorTag, tope, aplicar, marca) {
  var res = { cambiadas: 0, porTag: {}, truncado: false, estado: 'ok' };
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) { res.estado = 'Backup_Guerra.csv no existe o esta vacio'; return res; }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) { res.estado = 'Backup_Guerra.csv sin filas de datos'; return res; }
  var encabezado = parsed[0], filas = parsed.slice(1);
  if (String(encabezado[GC.CLAN - 1] || '').trim() !== 'Clan' || String(encabezado[GC.CLAN_TAG - 1] || '').trim() !== 'Clan_Tag') { res.estado = 'orden de columnas distinto del actual (no se toca)'; return res; } // clan-por-nombre-ok: compara el texto del encabezado de la columna, no un clan
  for (var a = 0; a < filas.length; a++) { while (filas[a].length < GUERRA_TOTAL_COLS) filas[a].push(''); }
  var plan = _planNombreClanEnFilas_(filas, GC.CLAN, GC.CLAN_TAG, nombresPorTag, tope);
  res.cambiadas = plan.cambios.length; res.porTag = plan.porTag; res.truncado = plan.truncado;
  if (aplicar && plan.cambios.length) {
    _saveCSVToDrive('Backup_Guerra ANTES de sincronizar nombre de clan ' + marca + '.csv', csvText);
    plan.cambios.forEach(function (c) { filas[c.i][GC.CLAN - 1] = c.despues; });
    _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezado].concat(filas)));
  }
  return res;
}

/**
 * _sincronizarCarpetasNombreClan_(nombresPorTag, aplicar) [→ Contexto_Base_Web.md §PF503]
 * Renombra, POR ID (setName), las carpetas de cada clan (los dos mapas _SUBCARPETAS_CLAN_POR_ENDPOINT_*) a «Nombre nuevo - #TAG». Una carpeta que no se abre o no se renombra cuenta como error y no corta las demas.
 * Devuelve { porTag: {tag: renombradas}, errores: n, detalle: [[endpoint, tag, antes, despues, resultado]] }.
 */
function _sincronizarCarpetasNombreClan_(nombresPorTag, aplicar) {
  var res = { porTag: {}, errores: 0, detalle: [] };
  var mapas = [{ endpoint: 'clans', mapa: _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_ }, { endpoint: 'currentriverrace', mapa: _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_ }];
  Object.keys(nombresPorTag).forEach(function (tag) {
    mapas.forEach(function (m) {
      var id = m.mapa[tag];
      if (!id) return;
      var carpeta = null, antes = '';
      try { carpeta = DriveApp.getFolderById(id); antes = carpeta.getName(); }
      catch (e) { res.errores++; res.detalle.push([m.endpoint, tag, '', '', 'ERROR: no se pudo abrir (' + e.message + ')']); return; }
      var despues = _nombreCarpetaClanConTag_(nombresPorTag[tag], tag);
      if (despues === antes) { res.detalle.push([m.endpoint, tag, antes, despues, 'ya tiene el nombre']); return; }
      if (!aplicar) { res.detalle.push([m.endpoint, tag, antes, despues, 'solo informar: no se cambio']); return; }
      try { carpeta.setName(despues); res.porTag[tag] = (res.porTag[tag] || 0) + 1; res.detalle.push([m.endpoint, tag, antes, despues, 'renombrada']); }
      catch (e2) { res.errores++; res.detalle.push([m.endpoint, tag, antes, despues, 'ERROR: ' + e2.message]); }
    });
  });
  return res;
}

function _sincronizarNombreClanManual_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[NombreClan] Otra ejecucion esta usando el bloqueo del script; se cancela.'); return; }
  try { _sincronizarNombreClan_({ aplicar: aplicar, forzar: true }); }
  finally { lock.releaseLock(); }
}

/**
 * _sincronizarNombreClan_(opciones) [→ Contexto_Base_Web.md §PF503]
 * Tanda 10 de Clanes por Tag. opciones: { aplicar (por defecto true), forzar (por defecto false) }.
 * Sin forzar (llamada de updateClanSheet): solo actua sobre los clanes cuyo nombre vigente difiere del ultimo ya sincronizado (propiedad NOMBRE_CLAN_SINCRONIZADO); la primera vez solo anota los nombres.
 * Forzado (las funciones manuales): revisa los cinco clanes aunque el nombre no haya cambiado, por si una corrida anterior quedo a medias.
 * Por Clan_Tag: Guerra, Control, Control_2, Vetados, Mensajes, Alertas_HistorialGuerra y Backup_Guerra.csv, mas el nombre de las carpetas. Control (desde la tanda 13b-2) tambien va por Clan_Tag; Nuevos no lleva Clan_Tag y se reconstruye solo desde el Directorio.
 * Los clanes externos no se tocan. Idempotente; el tope NOMBRE_CLAN_SYNC_TOPE_FILAS limita las filas por corrida y deja el cambio pendiente. Un archivo «Cambio_Nombre_Clan <fecha>.csv» en Drive lleva una linea por clan.
 * DONDE SE ACTUALIZA A MANO: CFG.CLAN_NOMBRES_FALLBACK (01_Config_Global.gs), _TAG_CARPETA_POR_NOMBRE_RESPALDO_ y los comentarios de los dos mapas (09_API_ClashRoyale.gs). Esta funcion lo avisa en el registro; en memoria si los actualiza.
 */
function _sincronizarNombreClan_(opciones) {
  opciones = opciones || {};
  var aplicar = opciones.aplicar !== false;
  var forzar = opciones.forzar === true;
  var props = PropertiesService.getScriptProperties();
  var ultimo = {};
  try { ultimo = JSON.parse(props.getProperty(NOMBRE_CLAN_SYNC_PROP) || '{}') || {}; } catch (e) { ultimo = {}; }

  var vigentes = _nombresVigentesClanes_();
  var dec = _decidirClanesConNombreNuevo_(vigentes, ultimo, forzar);
  if (aplicar && Object.keys(dec.inicializar).length) {
    Object.keys(dec.inicializar).forEach(function (t) { ultimo[t] = dec.inicializar[t]; });
    props.setProperty(NOMBRE_CLAN_SYNC_PROP, JSON.stringify(ultimo));
  }
  var tags = Object.keys(dec.pendientes);
  if (!tags.length) { Logger.log('[NombreClan] Sin cambios de nombre de clan (' + Object.keys(vigentes).length + ' clanes revisados).'); return { pendientes: [] }; }

  var marca = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH.mm');
  var ss = _getSs();
  var presupuesto = NOMBRE_CLAN_SYNC_TOPE_FILAS, truncado = false;
  var etiquetas = ['Guerra', 'Control', 'Control_2', 'Vetados', 'Mensajes', 'Alertas_HistorialGuerra', 'Backup_Guerra.csv'];
  var conteo = {}, estados = {};
  tags.forEach(function (t) { conteo[t] = {}; });
  var acumular = function (etiqueta, r) {
    estados[etiqueta] = r.estado;
    Object.keys(r.porTag).forEach(function (t) { conteo[t][etiqueta] = r.porTag[t]; });
    presupuesto -= r.cambiadas;
    if (r.truncado) truncado = true;
  };
  var hojas = [
    { etiqueta: 'Guerra', nombre: CFG.SHEETS.GUERRA, colClan: GC.CLAN, colTag: GC.CLAN_TAG, fila: 2 },
    { etiqueta: 'Control', nombre: CFG.SHEETS.CONTROL, colClan: CONTROL_COL_CLAN, colTag: CONTROL_COL_CLAN_TAG, fila: 4 },
    { etiqueta: 'Control_2', nombre: 'Control_2', colClan: CC2.CLAN, colTag: CC2.CLAN_TAG, fila: 4 },
    { etiqueta: 'Vetados', nombre: CFG.SHEETS.VETADOS, colClan: VC.CLAN, colTag: VC.CLAN_TAG, fila: 2 },
    { etiqueta: 'Mensajes', nombre: CFG.SHEETS.MENSAJES, colClan: MC.CLAN, colTag: MC.CLAN_TAG, fila: 2 },
    { etiqueta: 'Alertas_HistorialGuerra', nombre: CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA, colClan: AHG.CLAN, colTag: AHG.CLAN_TAG, fila: 2 }
  ];
  hojas.forEach(function (h) {
    acumular(h.etiqueta, _sincronizarHojaNombreClan_(ss.getSheetByName(h.nombre), h, dec.pendientes, Math.max(presupuesto, 0), aplicar));
  });
  acumular('Backup_Guerra.csv', _sincronizarCsvGuerraNombreClan_(dec.pendientes, Math.max(presupuesto, 0), aplicar, marca));
  var carpetas = _sincronizarCarpetasNombreClan_(dec.pendientes, aplicar);

  // Constantes en memoria de esta ejecucion; el cambio permanente va a mano (ver el docblock).
  var avisoConstantes = [];
  tags.forEach(function (t) {
    var nuevo = dec.pendientes[t];
    if ((CFG.CLAN_NOMBRES_FALLBACK || {})[t] !== nuevo) avisoConstantes.push(t + ' = ' + nuevo);
    if (aplicar) {
      if (CFG.CLAN_NOMBRES_FALLBACK) CFG.CLAN_NOMBRES_FALLBACK[t] = nuevo;
      _TAG_CARPETA_POR_NOMBRE_RESPALDO_[_normalizarNombreClan_(nuevo)] = t; // clan-por-nombre-ok: respaldo declarado (regla 2 del plan Clanes por Tag)
    }
  });

  var completo = !truncado && carpetas.errores === 0;
  var cab = ['Fecha', 'Tag', 'Nombre anterior', 'Nombre nuevo'].concat(etiquetas).concat(['Carpetas renombradas', 'Estado']);
  var informe = [cab];
  tags.forEach(function (t) {
    var fila = [marca, t, ultimo[t] || '(sin registro)', dec.pendientes[t]];
    etiquetas.forEach(function (e) { fila.push(conteo[t][e] || 0); });
    fila.push(carpetas.porTag[t] || 0);
    fila.push(!aplicar ? 'solo informar' : (completo ? 'completo' : (truncado ? 'incompleto: tope de filas, correr de nuevo' : 'incompleto: error en carpetas, correr de nuevo')));
    informe.push(fila);
  });
  informe.push([]);
  informe.push(['Carpetas', 'Endpoint', 'Tag', 'Antes', 'Despues', 'Resultado']);
  carpetas.detalle.forEach(function (d) { informe.push(['', d[0], d[1], d[2], d[3], d[4]]); });
  var nombreInforme = 'Cambio_Nombre_Clan ' + marca + (aplicar ? ' (aplicado).csv' : ' (informe).csv');
  _saveCSVToDrive(nombreInforme, _encodeCSVInforme(informe));

  if (aplicar && completo) {
    tags.forEach(function (t) { ultimo[t] = dec.pendientes[t]; });
    props.setProperty(NOMBRE_CLAN_SYNC_PROP, JSON.stringify(ultimo));
  }
  Logger.log('[NombreClan] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ': ' + tags.length + ' clan(es) con nombre por sincronizar (' + tags.map(function (t) { return t + ' -> ' + dec.pendientes[t]; }).join('; ') + '). Filas ' +
    (aplicar ? 'reescritas' : 'por reescribir') + ': ' + etiquetas.map(function (e) { var s = 0; tags.forEach(function (t) { s += conteo[t][e] || 0; }); return e + ' ' + s + (estados[e] && estados[e] !== 'ok' ? ' (' + estados[e] + ')' : ''); }).join(', ') +
    '. Carpetas ' + (aplicar ? 'renombradas' : 'por renombrar') + ': ' + tags.reduce(function (s, t) { return s + (carpetas.porTag[t] || 0); }, 0) + '; con error: ' + carpetas.errores + '. ' +
    (aplicar ? (completo ? 'Completo.' : 'INCOMPLETO (' + (truncado ? 'tope de ' + NOMBRE_CLAN_SYNC_TOPE_FILAS + ' filas' : 'error en carpetas') + '): queda pendiente; se repite en la siguiente corrida o con sincronizarNombreClanAplicar().') : '(No se cambio nada.)') +
    (avisoConstantes.length ? ' ACTUALIZA A MANO: CFG.CLAN_NOMBRES_FALLBACK (01_Config_Global.gs), _TAG_CARPETA_POR_NOMBRE_RESPALDO_ y los comentarios de los dos mapas de carpetas (09_API_ClashRoyale.gs): ' + avisoConstantes.join('; ') + '.' : '') +
    ' Detalle en Drive: ' + nombreInforme);
  return { pendientes: tags, conteo: conteo, carpetas: carpetas, truncado: truncado, completo: completo, estados: estados };
}
