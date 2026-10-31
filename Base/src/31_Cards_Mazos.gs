// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 31-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hojas de cartas (Cards y Cards_2)
//    - Costos de subida de nivel (prueba con un jugador)
//  Parte 2 — Funciones que no se corren a mano
//    - Datos de cartas: lectura y escritura de los CSV, cartas de torre y niveles
//    - Generador de links de mazos de RoyaleAPI (los que llama la web, y sus ayudas)
//    - Costos de subida de nivel: catálogo y cálculo
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// ==============================================================================
// 31_Cards_Mazos.gs
// Datos de cartas (hoja Cards/Cards2) y generador de links de mazo de RoyaleAPI.
// ==============================================================================

// REGLA DE TRABAJO DE ESTE PROYECTO (ver también 17_GuerraSheet.gs): toda [→ Contexto_Base_Web.md §31B001]

// ----- Constantes y variables globales -----

// DIFERENCIA FIJA DE NIVEL POR RAREZA (nivel del JSON -> nivel unificado de la app) [→ Contexto_Base_Web.md §31B014]
var _cacheDiferenciaNivelPorRareza = null;

// CARTAS DE TORRE (24-sep-2026, pedido del usuario). Las tropas de torre viven en [→ Contexto_Base_Web.md §31B015]
var CARTAS_TORRE_ID_MIN = 159000000;

// ===== PARTE 1 — Funciones que se corren a mano =====

// ----- Hojas de cartas (Cards y Cards_2) -----

/**
 * updateCardsSheet() [→ Contexto_Base_Web.md §31B002]
 */
function updateCardsSheet() {
  // Asegura los perfiles de /players (memoizado: no repite peticiones si [→ Contexto_Base_Web.md §31B003]
  if (PLAYERS_API_ENABLED !== false) _fetchPlayersData();

  // Obtener datos de cartas desde el cache de jugadores (líderes primero).
  var cardMap = _getCardsFromCache();
  if (!cardMap || Object.keys(cardMap).length === 0) {
    Logger.log('[Cards] Sin datos de cartas en cache de jugadores. Backup_Cards.csv queda tal cual.');
    return; // el CSV ES el dato: no hay ninguna hoja que pueda quedar vacía y necesitar restauración.
  }

  var csv = _leerCardsCSV();

  var existingIds = {};
  for (var e = 0; e < csv.rows.length; e++) {
    var idExist = String(csv.rows[e][1] || '').trim(); // columna ID
    if (idExist) existingIds[idExist] = true;
  }

  // FIX (23-sep-2026, 2da tanda): refrescar Maxlevel, MaxEvolutionLevel y URLs [→ Contexto_Base_Web.md §31B004]
  var filasRefrescadas = _refrescarCardsRows(csv.rows, cardMap);

  var cardIds = Object.keys(cardMap).sort(function(a, b) { return Number(a) - Number(b); });
  var nuevasFilas = [];
  var nuevasTorre = 0;          // 24-sep-2026: cartas de torre nuevas en esta corrida
  var torreSinRareza = [];      // 24-sep-2026: AVISO C

  for (var i = 0; i < cardIds.length; i++) {
    var id = cardIds[i];
    if (existingIds[id]) continue; // ya existe
    var c = cardMap[id];
    if (c.esTorre) {
      nuevasTorre++;
      if (!c.rarity) torreSinRareza.push(id + ' (' + (c.name || 'sin nombre') + ')');
    }
    nuevasFilas.push([
      '',                         // N° (se asigna en _guardarCardsCSV)
      Number(id),                 // ID
      c.name || '',               // Name
      '',                         // Nombre (traducción manual del usuario; nueva
                                   // carta -> queda vacía hasta que se complete a mano)
      c.maxLevel || '',           // Maxlevel
      c.maxEvolutionLevel,        // MaxEvolutionLevel (ver semántica más arriba)
      _rarezaParaFila(c),         // Rarity (24-sep-2026: en las de torre, con inicial mayúscula como el resto del CSV)
      c.esTorre ? 'Torre' : '',   // Tipo (Tropa/Hechizo/Estructura, completado
                                   // manualmente por el usuario; nueva carta -> [→ Contexto_Base_Web.md §31B005]
      c.elixirCost !== undefined ? c.elixirCost : '', // Elixircost
      c.iconMedium          || '', // Carta (URL real, texto plano)
      c.iconHeroMedium       || '', // Héroe (URL real, texto plano)
      c.iconEvolutionMedium  || ''  // Evolución (URL real, texto plano)
    ]);
  }

  if (nuevasFilas.length === 0 && filasRefrescadas === 0) {
    Logger.log('[Cards] Sin cartas nuevas ni datos por refrescar en Backup_Cards.csv (' + cardIds.length + ' ya presentes).');
    _avisarRevisionNivelesCards(csv.rows);
    return;
  }

  var totalPrevio = csv.rows.length;
  for (var j = 0; j < nuevasFilas.length; j++) csv.rows.push(nuevasFilas[j]);
  _guardarCardsCSV(csv.headers, csv.rows);
  if (nuevasFilas.length > 0) {
    Logger.log('[Cards] Agregadas ' + nuevasFilas.length + ' cartas a Backup_Cards.csv' +
               (nuevasTorre > 0 ? ' (' + nuevasTorre + ' de torre)' : '') + '. Total: ' +
               (totalPrevio + nuevasFilas.length));
  }
  if (torreSinRareza.length > 0) {
    Logger.log('[Cards] CARTA DE TORRE SIN RAREZA: ' + torreSinRareza.join(', ') + '. El JSON de /players no mandó ' +
               'la rareza en supportCards; sin Rarity no hay costo de subida (Backup_Cards_3.csv). ' +
               'Complétala a mano en Backup_Cards.csv (AVISO C).');
  }
  if (filasRefrescadas > 0) {
    Logger.log('[Cards] Backup_Cards.csv guardado con datos refrescados en ' + filasRefrescadas + ' carta(s) existente(s).');
  }
  _avisarRevisionNivelesCards(csv.rows);
}

function updateCards2Sheet() {
  // Si PLAYERS_API_ENABLED = false: NO se llama a /players para nadie [→ Contexto_Base_Web.md §31B006]

  if (PLAYERS_API_ENABLED === false) {
    // Modo OFF total: no se llama a /players para nadie, Backup_Cards_2.csv
    // queda exactamente como estaba.
    Logger.log('[Cards2] PLAYERS_API_ENABLED=false: no se actualiza Backup_Cards_2.csv (sin llamadas a /players para nadie).');
    return;
  }

  if (PLAYERS_API_ENABLED === 'admin') {
    // Modo ADMIN: actualizar SOLO ADMINS, preservar el resto.
    _actualizarCards2SoloAdmins();
    return;
  }

  var ss = _getSs();

  // Asegura los perfiles de /players (memoizado: no repite peticiones si
  // ya se obtuvieron antes en esta misma ejecución).
  _fetchPlayersData();

  // Obtener tags según el modo.
  var tags = [];
  if (PLAYERS_API_ENABLED === true) {
    // Modo TRUE: todos los jugadores con datos en cache.
    tags = _getTagsConPlayerCache();
  } else if (PLAYERS_API_ENABLED === 'partial') {
    // Modo PARTIAL: admins + nuevos (V_Guerra vacía).
    tags = _getTagsParaPartialMode(ss);
  }

  if (!tags || tags.length === 0) {
    Logger.log('[Cards2] Sin jugadores para actualizar');
    return;
  }

  var csv = _leerCards2CSV();
  var todosLosIds = _getTodosLosCardIdsDesdeCSV();

  // Construir filas para los tags a actualizar.
  var todasFilas = [];
  var rarezasSinDif = {}; // rarezas que no están en Backup_Cards.csv (AVISO 14)
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    var pd = _getPlayerCache(tag);
    if (!pd) continue;

    var cards       = pd.cards       || [];
    var currentDeck = pd.currentDeck || [];
    var topeJugador = _nivelUnificadoMaxDeCartas(cards); // solo respaldo para rarezas nuevas

    var deckIds = {};
    for (var d = 0; d < currentDeck.length; d++) {
      if (currentDeck[d].id) deckIds[String(currentDeck[d].id)] = true;
    }
    // FIX (24-sep-2026, pedido usuario -- "currentFavouriteCard se debe [→ Contexto_Base_Web.md §31B007]
    var favId = (pd.currentFavouriteCard && pd.currentFavouriteCard.id != null)
      ? String(pd.currentFavouriteCard.id) : null;

    var idsDelJugador = {};

    for (var k = 0; k < cards.length; k++) {
      var card = cards[k];
      var cardId    = card.id;
      idsDelJugador[String(cardId)] = true;
      // DOC (21-sep-2026, pendiente marcado en perfil.html — "el 'x0' al lado [→ Contexto_Base_Web.md §31B008]
      var nivelApp  = _nivelUnificadoDeCarta(card, topeJugador, rarezasSinDif);
      var enDeck    = deckIds[String(cardId)] ? 'Sí' : 'No';
      var evoLevel  = card.evolutionLevel !== undefined ? card.evolutionLevel : '';

      // AVISO 7 (4ta tanda): Count = copias que tiene el jugador (card.count del JSON).
      var cantidad = Number(card.count);
      // StarLevel (24-sep-2026): starLevel del JSON; vacío si la carta no lo trae.
      var estrella = card.starLevel !== undefined && card.starLevel !== null ? card.starLevel : '';
      todasFilas.push([
        '',
        tag,
        cardId,
        nivelApp,
        evoLevel,
        enDeck,
        cantidad >= 0 ? cantidad : 0,
        estrella,
        (favId && String(cardId) === favId) ? 'Sí' : 'No'
      ]);
    }

    // 24-sep-2026 (pedido del usuario): cartas de torre (`supportCards`). Va ANTES del [→ Contexto_Base_Web.md §31B009]
    var filasTorre = _filasCards2DeTorre(tag, pd, idsDelJugador, topeJugador, rarezasSinDif, favId);
    for (var ft = 0; ft < filasTorre.length; ft++) todasFilas.push(filasTorre[ft]);

    for (var g = 0; g < todosLosIds.length; g++) {
      var idGlobal = todosLosIds[g];
      if (idsDelJugador[idGlobal]) continue;
      todasFilas.push([
        '',
        tag,
        Number(idGlobal),
        0,
        '',
        'No',
        0,
        '',
        'No'
      ]);
    }
  }

  _avisarRarezasSinDiferencia(rarezasSinDif, '[Cards2]');

  if (todasFilas.length === 0) {
    Logger.log('[Cards2] Sin datos para escribir');
    return;
  }

  // FIX (04-ago-2026, conservado tal cual con el merge de 06-ago-2026): [→ Contexto_Base_Web.md §31B010]
  if (PLAYERS_API_ENABLED === true || PLAYERS_API_ENABLED === 'partial') {
    var filasFinales = _mergearCards2CSV(csv.rows, todasFilas);
    _guardarCards2CSV(csv.headers, filasFinales);
    Logger.log('[Cards2] Backup_Cards_2.csv actualizado con merge para ' + tags.length + ' jugador(es) (modo ' +
      (PLAYERS_API_ENABLED === true ? 'TRUE' : 'PARTIAL') + '). Nunca se vacía: el resto de tags conserva su fila anterior.');
  }
}

// ----- Costos de subida de nivel (prueba con un jugador) -----

/**
 * probarCostosSubirNivel() [→ Contexto_Base_Web.md §31B063]
 */
function probarCostosSubirNivel() {
  var cards2 = _leerCards2CSV();
  var tag = '';
  for (var i = 0; i < cards2.rows.length; i++) {
    var t = String(cards2.rows[i][1] || '').trim();
    if (t) { tag = t; break; }
  }
  if (!tag) {
    Logger.log('[Cards3] Backup_Cards_2.csv vacío o inexistente: no hay jugador con el que probar.');
    return;
  }

  var lista = costosSubirNivelJugador(tag);
  if (!lista.length) return; // el motivo ya quedó en el log

  var bloqueadas = 0, enMax = 0, conCosto = 0, sinDato = 0, maxDistinto = 0;
  var ejemplos = [];
  for (var k = 0; k < lista.length; k++) {
    var it = lista[k];
    if (it.maxLevelCsv !== null && it.nivelMaxCards3 !== null && it.maxLevelCsv !== it.nivelMaxCards3) maxDistinto++;
    if (!it.desbloqueada) { bloqueadas++; continue; }
    if (it.esMax === true) { enMax++; continue; }
    if (it.esMax === null) { sinDato++; continue; }
    conCosto++;
    if (ejemplos.length < 12) {
      ejemplos.push('  ' + it.nombre + ' (' + it.rarity + ') nivel app ' + it.nivelApp +
                    ' [rareza ' + it.nivelRareza + '] -> oro ' + it.oro + ' + ' + it.cartas + ' cartas');
    }
  }

  Logger.log('[Cards3] ' + tag + ': ' + lista.length + ' cartas | bloqueadas ' + bloqueadas +
             ' | en nivel máximo ' + enMax + ' | con costo de subida ' + conCosto +
             ' | sin dato en Backup_Cards_3.csv ' + sinDato);
  if (maxDistinto > 0) {
    Logger.log('[Cards3] ' + maxDistinto + ' carta(s) tienen en Backup_Cards.csv un Maxlevel distinto al nivel ' +
               'máximo de su rareza en Backup_Cards_3.csv, y ambos usan la misma numeración (la del JSON), así que ' +
               'deberían coincidir. Si el Maxlevel es MAYOR: nivel nuevo sin cargar en Backup_Cards_3.csv. Si es ' +
               'MENOR: Maxlevel viejo, corre updateCardsSheet() para refrescarlo.');
  }
  _avisarRevisionNivelesCards(_leerCardsCSV().rows);
  for (var e = 0; e < ejemplos.length; e++) Logger.log(ejemplos[e]);
}

// ===== PARTE 2 — Funciones que no se corren a mano =====

// D) DATOS DE CARTAS: Backup_Cards.csv (fijos) y Backup_Cards_2.csv (por jugador) [→ Contexto_Base_Web.md §31B013]

/**
 * _esCartaTorreDatos(id, tipo) [→ Contexto_Base_Web.md §31B016]
 */
function _esCartaTorreDatos(id, tipo) {
  if (String(tipo || '').trim().toLowerCase() === 'torre') return true;
  var n = Number(String(id === undefined || id === null ? '' : id).trim());
  return n >= CARTAS_TORRE_ID_MIN;
}

/**
 * _mapaDiferenciaNivelPorRareza() [→ Contexto_Base_Web.md §31B017]
 */
function _mapaDiferenciaNivelPorRareza() {
  if (_cacheDiferenciaNivelPorRareza) return _cacheDiferenciaNivelPorRareza;
  var maxPorRareza = {};
  var absoluto = 0;
  var idsTorre = {};
  try {
    var rows = _leerCardsCSV().rows; // cols: 1=ID, 4=Maxlevel, 6=Rarity, 7=Tipo
    for (var i = 0; i < rows.length; i++) {
      var idFila = String(rows[i][1] || '').trim();
      if (idFila && _esCartaTorreDatos(idFila, rows[i][7])) idsTorre[idFila] = true; // la fila SIGUE al cálculo de abajo (AVISO A)
      var key = String(rows[i][6] || '').trim().toLowerCase();
      var lv = Number(rows[i][4]);
      if (!key || !(lv >= 1)) continue;
      if (!(maxPorRareza[key] >= lv)) maxPorRareza[key] = lv;
      if (lv > absoluto) absoluto = lv;
    }
  } catch (e) {
    Logger.log('[Cards] No se pudo calcular la diferencia de nivel por rareza (' + e.message + ').');
  }
  var porRareza = {};
  for (var k in maxPorRareza) porRareza[k] = absoluto - maxPorRareza[k];
  _cacheDiferenciaNivelPorRareza = { absoluto: absoluto, porRareza: porRareza, idsTorre: idsTorre };
  return _cacheDiferenciaNivelPorRareza;
}

/**
 * _esCartaTorre(id) [→ Contexto_Base_Web.md §31B018]
 */
function _esCartaTorre(id) {
  var k = String(id === undefined || id === null ? '' : id).trim();
  if (!k) return false;
  if (_mapaDiferenciaNivelPorRareza().idsTorre[k]) return true;
  return _esCartaTorreDatos(k, '');
}

/**
 * _invalidarCacheDiferenciaNivelPorRareza() [→ Contexto_Base_Web.md §31B019]
 */
function _invalidarCacheDiferenciaNivelPorRareza() {
  _cacheDiferenciaNivelPorRareza = null;
}

/**
 * _diferenciaNivelRareza(rarity) [→ Contexto_Base_Web.md §31B020]
 */
function _diferenciaNivelRareza(rarity) {
  var k = String(rarity || '').trim().toLowerCase();
  var mapa = _mapaDiferenciaNivelPorRareza().porRareza;
  if (!k || !mapa.hasOwnProperty(k)) return null;
  return mapa[k];
}

/**
 * _nivelUnificadoMaxDeCartas(cards) [→ Contexto_Base_Web.md §31B021]
 */
function _nivelUnificadoMaxDeCartas(cards) {
  var tope = 0;
  var maxCrudo = 0; // AVISO 14: mayor maxLevel del JSON entre TODAS las rarezas
  for (var k = 0; k < cards.length; k++) {
    var c = cards[k];
    if (!c) continue;
    var mx = Number(c.maxLevel);
    if (mx >= 1 && mx > maxCrudo) maxCrudo = mx;
    var d = _diferenciaNivelRareza(c.rarity);
    if (d === null || !(mx >= 1)) continue;
    if (mx + d > tope) tope = mx + d;
  }
  // Si el catálogo no dio ninguna diferencia (Backup_Cards.csv vacío), se usa la
  // misma regla del AVISO 14 pero con los maxLevel del propio JSON del jugador.
  return tope >= 1 ? tope : maxCrudo;
}

/**
 * _nivelUnificadoDeCarta(card, topeRespaldo, rarezasSinDif) [→ Contexto_Base_Web.md §31B022]
 */
function _nivelUnificadoDeCarta(card, topeRespaldo, rarezasSinDif) {
  var level = card.level || 0;
  var diff = _diferenciaNivelRareza(card.rarity);
  if (diff === null) {
    var clave = String(card.rarity || '(sin rareza)');
    rarezasSinDif[clave] = (rarezasSinDif[clave] || 0) + 1;
    var mxJson = Number(card.maxLevel);
    diff = (topeRespaldo >= 1 && mxJson >= 1) ? (topeRespaldo - mxJson) : 0;
  }
  return level + diff;
}

/**
 * _avisarRarezasSinDiferencia(rarezasSinDif, etiqueta) [→ Contexto_Base_Web.md §31B023]
 */
function _avisarRarezasSinDiferencia(rarezasSinDif, etiqueta) {
  var partes = [];
  for (var r in rarezasSinDif) partes.push(r + ' (' + rarezasSinDif[r] + ' carta(s))');
  if (partes.length === 0) return;
  Logger.log(etiqueta + ' RAREZA SIN DIFERENCIA DE NIVEL: ' + partes.join(', ') +
             '. Su nivel se calculó con el tope del propio JSON del jugador; entrará sola al cálculo ' +
             'cuando una carta de esa rareza esté en Backup_Cards.csv con su Maxlevel (corre updateCardsSheet()).');
}

/**
 * _leerCardsCSV() [→ Contexto_Base_Web.md §31B024]
 */
function _leerCardsCSV() {
  var headersDefault = ['N°', 'ID', 'Name', 'Nombre', 'Maxlevel', 'MaxEvolutionLevel', 'Rarity',
                         'Tipo', 'Elixircost', 'Carta', 'Héroe', 'Evolución'];
  var csvText = _loadCSVFromDrive('Backup_Cards.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  return { headers: parsed[0], rows: parsed.slice(1) };
}

/**
 * _guardarCardsCSV(headers, rows)
 * Renumera la columna N° (índice 0) y guarda Backup_Cards.csv completo.
 */
function _guardarCardsCSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive('Backup_Cards.csv', _encodeCSV([headers].concat(rows)));
  _invalidarCacheDiferenciaNivelPorRareza(); // AVISO 14: el Maxlevel pudo cambiar
}

/**
 * _leerCards2CSV() [→ Contexto_Base_Web.md §31B025]
 */
function _leerCards2CSV() {
  // FIX (24-sep-2026, pedido usuario -- "currentFavouriteCard se debe [→ Contexto_Base_Web.md §31B026]
  var headersDefault = ['N°', 'Tag', 'ID', 'Level', 'EvolutionLevel', 'Currentdeck', 'Count', 'StarLevel', 'Favorita'];
  var csvText = _loadCSVFromDrive('Backup_Cards_2.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  // AVISO 7 (23-sep-2026, 4ta tanda): un Backup_Cards_2.csv anterior a esta [→ Contexto_Base_Web.md §31B027]
  var headers = parsed[0];
  if (headers.length < headersDefault.length) headers = headers.concat(headersDefault.slice(headers.length));
  return { headers: headers, rows: parsed.slice(1) };
}

/**
 * _guardarCards2CSV(headers, rows)
 * Renumera la columna N° (índice 0) y guarda Backup_Cards_2.csv completo.
 */
function _guardarCards2CSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) {
    rows[i][0] = i + 1;
    while (rows[i].length < headers.length) rows[i].push(''); // AVISO 7: filas viejas sin Count
  }
  _saveCSVToDrive('Backup_Cards_2.csv', _encodeCSV([headers].concat(rows)));
}

/**
 * _getTodosLosCardIdsDesdeCSV() [→ Contexto_Base_Web.md §31B028]
 */
function _getTodosLosCardIdsDesdeCSV() {
  var csv = _leerCardsCSV();
  var ids = [];
  for (var i = 0; i < csv.rows.length; i++) {
    var id = String(csv.rows[i][1] || '').trim(); // columna ID
    if (id) ids.push(id);
  }
  return ids;
}

/**
 * _mergearCards2CSV(filasExistentes, todasFilas) [→ Contexto_Base_Web.md §31B029]
 */
function _mergearCards2CSV(filasExistentes, todasFilas) {
  var tagsAActualizar = {};
  for (var i = 0; i < todasFilas.length; i++) {
    var t = String(todasFilas[i][1] || '').trim();
    if (!tagsAActualizar[t]) tagsAActualizar[t] = [];
    tagsAActualizar[t].push(todasFilas[i]);
  }

  var filasFinales = [];
  var procesados = {};

  // Agregar/actualizar filas de tags que están en todasFilas.
  for (var tag in tagsAActualizar) {
    for (var x = 0; x < tagsAActualizar[tag].length; x++) {
      filasFinales.push(tagsAActualizar[tag][x]);
    }
    procesados[tag] = true;
  }

  // Preservar filas de tags NO en todasFilas.
  for (var e = 0; e < filasExistentes.length; e++) {
    var eTag = String(filasExistentes[e][1] || '').trim();
    if (!procesados[eTag]) filasFinales.push(filasExistentes[e]);
  }

  return filasFinales;
}

/**
 * _actualizarCards2SoloAdmins() [→ Contexto_Base_Web.md §31B030]
 */
function _actualizarCards2SoloAdmins() {
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir) {
    Logger.log('[Cards2] Directorio no encontrado');
    return;
  }

  var lastRowDir = shDir.getLastRow();
  if (lastRowDir < 2) {
    Logger.log('[Cards2] Directorio vacío');
    return;
  }

  // Leer Directorio para obtener los tags de admins. [→ Contexto_Base_Web.md §31B031]
  var dataDir = shDir.getRange(2, 1, lastRowDir - 1, DIR_SHEET_COLS).getValues();
  var tagsAdmin = [];

  for (var i = 0; i < dataDir.length; i++) {
    var admin = String(dataDir[i][IC.ADMIN - 1] || '').trim();
    var tag = String(dataDir[i][IC.TAG - 1] || '').trim();
    if (admin === 'Sí' && tag) tagsAdmin.push(tag);
  }

  if (tagsAdmin.length === 0) {
    Logger.log('[Cards2] No hay ningún admin marcado en Directorio, nada que actualizar.');
    return;
  }

  // IMPORTANTE: se llama _fetchPlayersData() ANTES de revisar la cache [→ Contexto_Base_Web.md §31B032]
  _fetchPlayersData();

  var adminsConCards = [];
  for (var a = 0; a < tagsAdmin.length; a++) {
    if (_getPlayerCache(tagsAdmin[a])) adminsConCards.push(tagsAdmin[a]);
  }

  if (adminsConCards.length === 0) {
    Logger.log('[Cards2] Se consultó /players para ' + tagsAdmin.length + ' admin(es) pero ninguno devolvió datos (posible error de API).');
    return;
  }

  var todosLosIds = _getTodosLosCardIdsDesdeCSV();
  var todasFilas = [];
  var rarezasSinDif = {}; // rarezas que no están en Backup_Cards.csv (AVISO 14)

  for (var j = 0; j < adminsConCards.length; j++) {
    var tag = adminsConCards[j];
    var pd = _getPlayerCache(tag);
    if (!pd) continue;

    var cards = pd.cards || [];
    var currentDeck = pd.currentDeck || [];
    var topeJugador = _nivelUnificadoMaxDeCartas(cards); // solo respaldo para rarezas nuevas
    var deckIds = {};
    for (var d = 0; d < currentDeck.length; d++) {
      if (currentDeck[d].id) deckIds[String(currentDeck[d].id)] = true;
    }
    // FIX (24-sep-2026, pedido usuario): mismo criterio que en
    // updateCards2Sheet() -- ver ese comentario para el detalle.
    var favId = (pd.currentFavouriteCard && pd.currentFavouriteCard.id != null)
      ? String(pd.currentFavouriteCard.id) : null;

    var idsDelJugador = {};
    for (var k = 0; k < cards.length; k++) {
      var card = cards[k];
      var cardId = card.id;
      idsDelJugador[String(cardId)] = true;
      // DOC: mismo comportamiento "copias sobrantes -> reacciones al nivel [→ Contexto_Base_Web.md §31B033]
      var nivelApp = _nivelUnificadoDeCarta(card, topeJugador, rarezasSinDif);
      var enDeck = deckIds[String(cardId)] ? 'Sí' : 'No';
      var evoLevel = card.evolutionLevel !== undefined ? card.evolutionLevel : '';

      var cantidad = Number(card.count); // AVISO 7 (4ta tanda): copias que tiene el jugador
      var estrella = card.starLevel !== undefined && card.starLevel !== null ? card.starLevel : ''; // StarLevel (24-sep-2026)
      var esFavorita = (favId && String(cardId) === favId) ? 'Sí' : 'No'; // Favorita (24-sep-2026)
      todasFilas.push(['', tag, cardId, nivelApp, evoLevel, enDeck, cantidad >= 0 ? cantidad : 0, estrella, esFavorita]);
    }

    // 24-sep-2026 (pedido del usuario): cartas de torre (`supportCards`), igual que en
    // updateCards2Sheet(). Antes del relleno de abajo (ver ese comentario).
    var filasTorre = _filasCards2DeTorre(tag, pd, idsDelJugador, topeJugador, rarezasSinDif, favId);
    for (var ft = 0; ft < filasTorre.length; ft++) todasFilas.push(filasTorre[ft]);

    for (var g = 0; g < todosLosIds.length; g++) {
      var idGlobal = todosLosIds[g];
      if (idsDelJugador[idGlobal]) continue;
      todasFilas.push(['', tag, Number(idGlobal), 0, '', 'No', 0, '', 'No']);
    }
  }

  _avisarRarezasSinDiferencia(rarezasSinDif, '[Cards2]');

  if (todasFilas.length === 0) return;

  var csv = _leerCards2CSV();
  var filasFinales = _mergearCards2CSV(csv.rows, todasFilas);
  _guardarCards2CSV(csv.headers, filasFinales);
  Logger.log('[Cards2] Backup_Cards_2.csv actualizado: ' + adminsConCards.length + ' admin(es) (modo ADMIN, preservando no-admins).');
}

/**
 * _rarezaParaFila(c) [→ Contexto_Base_Web.md §31B034]
 */
function _rarezaParaFila(c) {
  var r = String(c.rarity || '');
  if (c.esTorre && r) return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  return r;
}

/**
 * _filasCards2DeTorre(tag, pd, idsDelJugador, topeJugador, rarezasSinDif) [→ Contexto_Base_Web.md §31B035]
 */
function _filasCards2DeTorre(tag, pd, idsDelJugador, topeJugador, rarezasSinDif, favId) {
  var filas = [];
  var soporte = (pd && Array.isArray(pd.supportCards)) ? pd.supportCards : [];
  if (soporte.length === 0) return filas;

  var idsEnMazo = {};
  var mazoSoporte = Array.isArray(pd.currentDeckSupportCards) ? pd.currentDeckSupportCards : [];
  for (var d = 0; d < mazoSoporte.length; d++) {
    if (mazoSoporte[d] && mazoSoporte[d].id) idsEnMazo[String(mazoSoporte[d].id)] = true;
  }

  for (var k = 0; k < soporte.length; k++) {
    var carta = soporte[k];
    if (!carta || !carta.id) continue;
    idsDelJugador[String(carta.id)] = true;
    var nivelApp = _nivelUnificadoDeCarta(carta, topeJugador, rarezasSinDif);
    var evoLevel = carta.evolutionLevel !== undefined ? carta.evolutionLevel : '';
    var cantidad = Number(carta.count);
    var estrella = carta.starLevel !== undefined && carta.starLevel !== null ? carta.starLevel : '';
    filas.push([
      '',
      tag,
      carta.id,
      nivelApp,
      evoLevel,
      idsEnMazo[String(carta.id)] ? 'Sí' : 'No',
      cantidad >= 0 ? cantidad : 0,
      estrella,
      (favId && String(carta.id) === favId) ? 'Sí' : 'No'
    ]);
  }
  return filas;
}

/**
 * _getTagsParaPartialMode(ss)
 * En modo PARTIAL: retorna admins + nuevos (jugadores con V_Guerra vacía en Directorio).
 */
function _getTagsParaPartialMode(ss) {
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return [];

  // Fase C1 (16/07/2026): V_Guerra vive ahora en Players, así que se usa [→ Contexto_Base_Web.md §31B036]
  var dataDir = _leerDirectorioFisicoComoDC(ss);
  var tags = [];
  var vistos = {};

  for (var i = 0; i < dataDir.length; i++) {
    var tag = String(dataDir[i][DC.TAG - 1] || '').trim();
    var admin = String(dataDir[i][DC.ADMIN - 1] || '').trim();
    var vGuerra = String(dataDir[i][DC.V_GUERRA - 1] || '').trim();
    var estado = String(dataDir[i][DC.ESTADO - 1] || '').trim();

    if (!tag || vistos[tag]) continue;

    // Admins: incluir SIEMPRE, sin importar Estado (mismo criterio que [→ Contexto_Base_Web.md §31B037]
    if (admin === 'Sí') {
      tags.push(tag);
      vistos[tag] = true;
      continue;
    }

    // Resto (no-admin): solo activos, y solo si V_Guerra está vacío (nuevo).
    if (estado !== 'Activo') continue;
    if (!vGuerra) {
      tags.push(tag);
      vistos[tag] = true;
    }
  }

  return tags;
}

/**
 * _getCardsFromCache() [→ Contexto_Base_Web.md §31B038]
 */
function _getCardsFromCache() {
  var map = {};
  var lideresLeidos = 0;
  var lideresSinDatos = [];

  // 1) Cuentas de los líderes (una por clan Terna).
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTag = CFG.TERNA_TAGS[i];
    var cdL = _getClanCache(clanTag);
    var liderTag = (cdL && cdL.members) ? getClanLeaderTag(cdL.members) : '';
    var pdL = liderTag ? _getPlayerCache(liderTag) : null;
    if (!pdL || !pdL.cards || pdL.cards.length === 0) {
      lideresSinDatos.push(clanTag + (liderTag ? ' (líder ' + liderTag + ' sin cartas en cache)'
                                               : ' (sin líder en la cache del clan)'));
      continue;
    }
    _mezclarCartasEnMapa(map, pdL.cards);
    if (Array.isArray(pdL.supportCards) && pdL.supportCards.length > 0) {
      _mezclarCartasEnMapa(map, pdL.supportCards, true); // cartas de torre (24-sep-2026)
    }
    lideresLeidos++;
  }
  Logger.log('[Cards] Cuentas de líder con cartas en cache: ' + lideresLeidos + ' de ' + CFG.TERNA_TAGS.length +
             (lideresSinDatos.length > 0 ? '. Sin datos: ' + lideresSinDatos.join('; ') : '') + '.');

  // 2) Complemento: primer jugador con cache (criterio anterior).
  var complementado = false;
  for (var a = 0; a < CFG.TERNA_TAGS.length && !complementado; a++) {
    var cd = _getClanCache(CFG.TERNA_TAGS[a]);
    if (!cd || !cd.members) continue;
    for (var j = 0; j < cd.members.length; j++) {
      var pd = _getPlayerCache(cd.members[j].tag);
      if (!pd || !pd.cards || pd.cards.length === 0) continue;
      _mezclarCartasEnMapa(map, pd.cards);
      if (Array.isArray(pd.supportCards) && pd.supportCards.length > 0) {
        _mezclarCartasEnMapa(map, pd.supportCards, true); // cartas de torre (24-sep-2026)
      }
      complementado = true;
      break; // con un jugador alcanza
    }
  }

  // 24-sep-2026: cuántas cartas de torre se encontraron (y sus IDs, para confirmar
  // el rango de CARTAS_TORRE_ID_MIN en la primera corrida).
  var idsTorreCache = [];
  for (var idT in map) if (map[idT].esTorre) idsTorreCache.push(idT);
  idsTorreCache.sort(function (a, b) { return Number(a) - Number(b); });
  Logger.log('[Cards] Cartas de torre (supportCards) en cache: ' + idsTorreCache.length +
             (idsTorreCache.length > 0 ? ' (IDs: ' + idsTorreCache.join(', ') + ')'
                                       : '. Ninguna cuenta leída trae supportCards: no se agrega ninguna carta de torre.'));
  var idsTorreFueraDeRango = idsTorreCache.filter(function (x) { return Number(x) < CARTAS_TORRE_ID_MIN; });
  if (idsTorreFueraDeRango.length > 0) {
    Logger.log('[Cards] AVISO: ' + idsTorreFueraDeRango.length + ' carta(s) de torre tienen un ID menor a ' + CARTAS_TORRE_ID_MIN +
               ' (' + idsTorreFueraDeRango.join(', ') + '). Se guardan con Tipo = Torre y se detectan por ese Tipo, ' +
               'pero revisa CARTAS_TORRE_ID_MIN (31_Cards_Mazos.gs).');
  }
  return map;
}

/**
 * _mezclarCartasEnMapa(map, cards) [→ Contexto_Base_Web.md §31B039]
 */
function _mezclarCartasEnMapa(map, cards, esTorre) {
  for (var k = 0; k < cards.length; k++) {
    var c = cards[k];
    if (!c || !c.id) continue;
    var iconUrls = c.iconUrls || {};
    var nuevo = {
      name:              c.name              || '',
      maxLevel:          c.maxLevel           || '',
      maxEvolutionLevel: c.maxEvolutionLevel !== undefined ? c.maxEvolutionLevel : '',
      rarity:            c.rarity             || '',
      elixirCost:        c.elixirCost !== undefined ? c.elixirCost : '',
      iconMedium:          iconUrls.medium          || '',
      iconHeroMedium:      iconUrls.heroMedium      || '',
      iconEvolutionMedium: iconUrls.evolutionMedium || '',
      esTorre:           esTorre === true // 24-sep-2026: viene de `supportCards`
    };
    var id = String(c.id);
    var previo = map[id];
    if (!previo) { map[id] = nuevo; continue; }

    if (Number(nuevo.maxLevel) > (Number(previo.maxLevel) || 0)) previo.maxLevel = nuevo.maxLevel;
    if (Number(nuevo.maxEvolutionLevel) > (Number(previo.maxEvolutionLevel) || 0)) {
      previo.maxEvolutionLevel = nuevo.maxEvolutionLevel;
    }
    var campos = ['name', 'rarity', 'elixirCost', 'iconMedium', 'iconHeroMedium', 'iconEvolutionMedium'];
    for (var f = 0; f < campos.length; f++) {
      if (previo[campos[f]] === '' && nuevo[campos[f]] !== '') previo[campos[f]] = nuevo[campos[f]];
    }
  }
}

/**
 * _refrescarCardsRows(rows, cardMap) [→ Contexto_Base_Web.md §31B040]
 */
function _refrescarCardsRows(rows, cardMap) {
  var TOTAL_COLS = 12;
  var COLS_URL = [
    { idx: 9,  campo: 'iconMedium',          etiqueta: 'Carta',     clave: 'carta' },
    { idx: 10, campo: 'iconHeroMedium',      etiqueta: 'Héroe',     clave: 'heroe' },
    { idx: 11, campo: 'iconEvolutionMedium', etiqueta: 'Evolución', clave: 'evolucion' }
  ];
  var filasCambiadas = 0;
  var porColumna = { maxlevel: 0, maxevo: 0, carta: 0, heroe: 0, evolucion: 0 };
  var ejemplos = [];
  var menores = []; // valores del JSON menores a los guardados (no se pisan)

  for (var i = 0; i < rows.length; i++) {
    var id = String(rows[i][1] || '').trim();
    var info = id ? cardMap[id] : undefined;
    if (!info) continue;
    while (rows[i].length < TOTAL_COLS) rows[i].push('');

    var etiquetaCarta = id + ' (' + rows[i][2] + ')';
    var cambios = [];

    // --- Maxlevel (índice 4)
    var maxNuevo = Number(info.maxLevel);
    if (maxNuevo >= 1) {
      var maxTxt = String(rows[i][4]).trim();
      var maxActual = (maxTxt === '') ? null : Number(maxTxt);
      if (maxActual !== null && maxActual === maxNuevo) {
        // igual: nada que hacer
      } else if (maxActual !== null && maxNuevo < maxActual) {
        menores.push(etiquetaCarta + ' Maxlevel JSON ' + maxNuevo + ' < guardado ' + maxActual);
      } else {
        rows[i][4] = maxNuevo;
        porColumna.maxlevel++;
        cambios.push('Maxlevel ' + (maxTxt === '' ? 'vacío' : maxTxt) + ' -> ' + maxNuevo);
      }
    }

    // --- MaxEvolutionLevel (índice 5): vacío = sin evolución ni héroe.
    var evoNuevo = Number(info.maxEvolutionLevel || 0);
    if (isNaN(evoNuevo)) evoNuevo = 0;
    var evoTxt = String(rows[i][5]).trim();
    var evoActual = (evoTxt === '') ? 0 : Number(evoTxt);
    if (isNaN(evoActual)) evoActual = 0;
    if (evoNuevo > evoActual) {
      rows[i][5] = evoNuevo;
      porColumna.maxevo++;
      cambios.push('MaxEvolutionLevel ' + (evoTxt === '' ? 'vacío' : evoTxt) + ' -> ' + evoNuevo);
    } else if (evoNuevo < evoActual) {
      menores.push(etiquetaCarta + ' MaxEvolutionLevel JSON ' + evoNuevo + ' < guardado ' + evoActual);
    }

    // --- URLs de Carta / Héroe / Evolución
    for (var u = 0; u < COLS_URL.length; u++) {
      var col = COLS_URL[u];
      var urlNueva = String(info[col.campo] || '').trim();
      if (!urlNueva) continue; // el JSON no la trae: no se borra la guardada
      var urlActual = String(rows[i][col.idx] === undefined ? '' : rows[i][col.idx]).trim();
      if (urlNueva === urlActual) continue;
      rows[i][col.idx] = urlNueva;
      porColumna[col.clave]++;
      cambios.push(col.etiqueta + (urlActual === '' ? ' (vacío -> URL)' : ' (URL distinta)'));
    }

    if (cambios.length > 0) {
      filasCambiadas++;
      if (ejemplos.length < 8) ejemplos.push(etiquetaCarta + ': ' + cambios.join('; '));
    }
  }

  if (filasCambiadas > 0) {
    Logger.log('[Cards] Datos refrescados en ' + filasCambiadas + ' carta(s) existente(s): Maxlevel ' + porColumna.maxlevel +
               ', MaxEvolutionLevel ' + porColumna.maxevo + ', URL Carta ' + porColumna.carta +
               ', URL Héroe ' + porColumna.heroe + ', URL Evolución ' + porColumna.evolucion +
               '. Ejemplos: ' + ejemplos.join(' | '));
  }
  if (menores.length > 0) {
    Logger.log('[Cards] ' + menores.length + ' valor(es) del JSON son MENORES a los guardados en Backup_Cards.csv ' +
               '(no se modifican, revisar a mano). Ejemplos: ' + menores.slice(0, 5).join(' | '));
  }
  return filasCambiadas;
}

/**
 * _getTagsConPlayerCache() [→ Contexto_Base_Web.md §31B041]
 */
function _getTagsConPlayerCache() {
  var tags = [];
  var visto = {};
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var cd = _getClanCache(CFG.TERNA_TAGS[i]);
    if (!cd || !cd.members) continue;
    for (var j = 0; j < cd.members.length; j++) {
      var t = cd.members[j].tag;
      if (!t || visto[t]) continue;
      if (_getPlayerCache(t)) {
        tags.push(t);
        visto[t] = true;
      }
    }
  }
  return tags;
}

// GENERADOR DE LINKS DE MAZOS ROYALEAPI [→ Contexto_Base_Web.md §31B042]

/**
 * generarUrlMazo(tag) [→ Contexto_Base_Web.md §31B011]
 */
function generarUrlMazo(tag) {
  if (!tag) return null;
  var tagClean = String(tag).trim();
  if (tagClean.charAt(0) !== '#') tagClean = '#' + tagClean;

  var ss = _getSs();
  var cardInfo      = _construirCardInfoMap(ss);
  var cards2PorTag  = _construirCards2PorTag(ss);
  return _generarUrlMazoDesdeMapas(tagClean, cardInfo, cards2PorTag[tagClean]);
}

/**
 * generarUrlMazo2(tag) [→ Contexto_Base_Web.md §31B012]
 */
function generarUrlMazo2(tag) {
  if (!tag) return null;
  var tagClean = String(tag).trim();
  if (tagClean.charAt(0) !== '#') tagClean = '#' + tagClean;

  var ss = _getSs();
  var cardInfo      = _construirCardInfoMap(ss);
  var cards2PorTag  = _construirCards2PorTag(ss);
  return _generarUrlMazo2DesdeMapas(tagClean, cardInfo, cards2PorTag[tagClean]);
}

/**
 * _cardNameToSlug(name) [→ Contexto_Base_Web.md §31B043]
 */
function _cardNameToSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // quitar caracteres especiales
    .replace(/\s+/g, '-');       // espacios → guiones
}

/**
 * _construirCardInfoMap(ss) [→ Contexto_Base_Web.md §31B044]
 */
function _construirCardInfoMap(ss) {
  var csv = _leerCardsCSV();
  if (!csv.rows || csv.rows.length === 0) return {};

  // cols: 0=N°, 1=ID, 2=Name, 3=Nombre, 4=Maxlevel, 5=MaxEvolutionLevel [→ Contexto_Base_Web.md §31B045]
  var cardInfo = {}; // { id: { slug, maxEvoLevel } }
  for (var i = 0; i < csv.rows.length; i++) {
    var cId  = String(csv.rows[i][1] || '').trim();
    var cName = String(csv.rows[i][2] || '').trim();
    var cMaxEvo = csv.rows[i][5]; // vacío, 1, 2, o 3
    if (!cId || !cName) continue;
    if (_esCartaTorreDatos(cId, csv.rows[i][7])) continue; // carta de torre: no va a los links de mazo (24-sep-2026)
    cardInfo[cId] = {
      slug:        _cardNameToSlug(cName),
      maxEvoLevel: cMaxEvo !== '' && cMaxEvo !== null && cMaxEvo !== undefined
                   ? Number(cMaxEvo) : -1
      // -1 = solo versión normal (sin evolución ni héroe posibles)
    };
  }
  return cardInfo;
}

/**
 * _construirCards2PorTag(ss) [→ Contexto_Base_Web.md §31B046]
 */
function _construirCards2PorTag(ss) {
  var csv = _leerCards2CSV();
  if (!csv.rows || csv.rows.length === 0) return {};

  // cols: 0=N°, 1=Tag, 2=ID, 3=Level, 4=EvolutionLevel
  var porTag = {}; // { tag: { id: { level, evoLevel } } }
  for (var j = 0; j < csv.rows.length; j++) {
    var rowTag = String(csv.rows[j][1] || '').trim();
    if (!rowTag) continue;
    var pId  = String(csv.rows[j][2] || '').trim();
    if (!pId) continue;
    var pLevel = csv.rows[j][3];
    var pEvo   = csv.rows[j][4];
    if (!porTag[rowTag]) porTag[rowTag] = {};
    porTag[rowTag][pId] = {
      level: (pLevel !== '' && pLevel !== null && pLevel !== undefined) ? Number(pLevel) : 0,
      evoLevel: (pEvo !== '' && pEvo !== null && pEvo !== undefined) ? Number(pEvo) : -1
      // evoLevel -1 = tiene la carta pero sin evolución ni héroe desbloqueado
    };
  }
  return porTag;
}

/**
 * _construirListasMazoDesdeMapas(cardInfo, playerCards) [→ Contexto_Base_Web.md §31B047]
 */
function _construirListasMazoDesdeMapas(cardInfo, playerCards) {
  var inc = [];
  var exc = [];

  var todosIds = Object.keys(cardInfo);
  for (var i = 0; i < todosIds.length; i++) {
    var id     = todosIds[i];
    var info   = cardInfo[id];
    var slug   = info.slug;
    var maxEvo = info.maxEvoLevel; // qué puede tener según el juego

    var pData     = playerCards[id]; // {level, evoLevel} o undefined
    var tieneBase = pData !== undefined && Number(pData.level) > 0;

    if (!tieneBase) {
      // Nuevo criterio: la carta base no está desbloqueada → se excluye
      // también la carta base, no solo sus variantes evolución/héroe.
      exc.push(slug);
      if (maxEvo === 1 || maxEvo === 3) exc.push(slug + '-ev1');
      if (maxEvo === 2 || maxEvo === 3) exc.push(slug + '-hero');
      continue;
    }

    // El jugador SÍ tiene la carta base desbloqueada.
    inc.push(slug);
    var pEvoLvl = pData.evoLevel; // -1 = sin evo/héroe desbloqueado

    if (maxEvo === 1 || maxEvo === 3) {
      if (pEvoLvl === 1 || pEvoLvl === 3) inc.push(slug + '-ev1'); // tiene la evolución
      else exc.push(slug + '-ev1');                                // existe pero no la tiene
    }
    if (maxEvo === 2 || maxEvo === 3) {
      if (pEvoLvl === 2 || pEvoLvl === 3) inc.push(slug + '-hero'); // tiene el héroe
      else exc.push(slug + '-hero');                                // existe pero no lo tiene
    }
  }

  return { inc: inc, exc: exc };
}

/**
 * _ensamblarUrlMazo(inc, exc, incluirInc) [→ Contexto_Base_Web.md §31B048]
 */
function _ensamblarUrlMazo(inc, exc, incluirInc) {
  var base = 'https://royaleapi.com/decks/popular'
    + '?time=7d&sort=win&size=30&players=PvP'
    + '&min_elixir=1&max_elixir=9&evo=All'
    + '&min_cycle_elixir=4&max_cycle_elixir=28'
    + '&mode=detail&type=NormalBattle&global_exclude=false';

  var params = '';
  if (incluirInc) {
    for (var a = 0; a < inc.length; a++) params += '&inc=' + encodeURIComponent(inc[a]);
  }
  for (var b = 0; b < exc.length; b++) params += '&exc=' + encodeURIComponent(exc[b]);

  return base + params;
}

/**
 * _generarUrlMazoDesdeMapas(tag, cardInfo, playerCards) [→ Contexto_Base_Web.md §31B049]
 */
function _generarUrlMazoDesdeMapas(tag, cardInfo, playerCards) {
  if (!tag) return null;
  if (!cardInfo || Object.keys(cardInfo).length === 0) return null;
  if (!playerCards) return null; // sin datos de Cards_2 para este jugador

  var listas = _construirListasMazoDesdeMapas(cardInfo, playerCards);
  return _ensamblarUrlMazo(listas.inc, listas.exc, true);
}

/**
 * _generarUrlMazo2DesdeMapas(tag, cardInfo, playerCards) [→ Contexto_Base_Web.md §31B050]
 */
function _generarUrlMazo2DesdeMapas(tag, cardInfo, playerCards) {
  if (!tag) return null;
  if (!cardInfo || Object.keys(cardInfo).length === 0) return null;
  if (!playerCards) return null; // sin datos de Cards_2 para este jugador

  var listas = _construirListasMazoDesdeMapas(cardInfo, playerCards);
  return _ensamblarUrlMazo(listas.inc, listas.exc, false);
}

/**
 * _construirCards2DeTag(tag) [→ Contexto_Base_Web.md §PF051]
 * Igual que _construirCards2PorTag(), pero lee solo las filas de UN jugador (la usa el perfil web).
 */
function _construirCards2DeTag(tag) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return null;
  var csv = _leerCards2CSV();
  if (!csv.rows || csv.rows.length === 0) return null;

  // cols: 0=N°, 1=Tag, 2=ID, 3=Level, 4=EvolutionLevel
  var cartas = {};
  var hay = false;
  for (var j = 0; j < csv.rows.length; j++) {
    if (cleanTag(csv.rows[j][1]) !== tagLimpio) continue;
    var pId = String(csv.rows[j][2] || '').trim();
    if (!pId) continue;
    var pLevel = csv.rows[j][3];
    var pEvo   = csv.rows[j][4];
    cartas[pId] = {
      level: (pLevel !== '' && pLevel !== null && pLevel !== undefined) ? Number(pLevel) : 0,
      evoLevel: (pEvo !== '' && pEvo !== null && pEvo !== undefined) ? Number(pEvo) : -1
    };
    hay = true;
  }
  return hay ? cartas : null;
}

/**
 * _nivelPromedioCartas(playerCards) [→ Contexto_Base_Web.md §PF051]
 * Nivel promedio ponderado: cada nivel pesa por la cantidad de cartas que tiene el jugador en ese nivel.
 * Es la misma cuenta del pastel "Cartas por nivel" de perfil.html. No cuenta las cartas de torre ni las de nivel 0.
 * @returns {?{promedio:number, nivelMinimo:number, cartas:number}} nivelMinimo = parte entera hacia abajo del promedio.
 */
function _nivelPromedioCartas(playerCards) {
  if (!playerCards) return null;
  var cantidadPorNivel = {};
  var total = 0;
  for (var id in playerCards) {
    if (!playerCards.hasOwnProperty(id)) continue;
    if (_esCartaTorre(id)) continue;
    var nivel = Number(playerCards[id].level);
    if (!(nivel >= 1)) continue;
    cantidadPorNivel[nivel] = (cantidadPorNivel[nivel] || 0) + 1;
    total++;
  }
  if (total === 0) return null;
  var suma = 0;
  for (var n in cantidadPorNivel) {
    if (cantidadPorNivel.hasOwnProperty(n)) suma += Number(n) * cantidadPorNivel[n];
  }
  var promedio = suma / total;
  return { promedio: promedio, nivelMinimo: Math.floor(promedio), cartas: total };
}

/**
 * _generarUrlMazo3DesdeMapas(tag, cardInfo, playerCards) [→ Contexto_Base_Web.md §PF051]
 * Tercera sugerencia: como la (2) (solo excluye, no fuerza cuáles incluir), pero además excluye las cartas de nivel menor
 * que el máximo entero del nivel promedio. Una carta excluida por nivel se trata como si no estuviera desbloqueada
 * (también se excluyen su evolución y su héroe).
 * @returns {?{url:string, nivelPromedio:number, nivelMinimo:number}}
 */
function _generarUrlMazo3DesdeMapas(tag, cardInfo, playerCards) {
  if (!tag) return null;
  if (!cardInfo || Object.keys(cardInfo).length === 0) return null;
  if (!playerCards) return null;

  var prom = _nivelPromedioCartas(playerCards);
  if (!prom) return null;

  var altas = {};
  for (var id in playerCards) {
    if (playerCards.hasOwnProperty(id) && Number(playerCards[id].level) >= prom.nivelMinimo) altas[id] = playerCards[id];
  }
  var listas = _construirListasMazoDesdeMapas(cardInfo, altas);
  return { url: _ensamblarUrlMazo(listas.inc, listas.exc, false), nivelPromedio: prom.promedio, nivelMinimo: prom.nivelMinimo };
}

/**
 * generarMazo3(tag) [→ Contexto_Base_Web.md §PF051]
 * Para el perfil web (_webPerfilExtendido): null si no hay datos de Cards_2 de este jugador.
 */
function generarMazo3(tag) {
  if (!tag) return null;
  var tagClean = String(tag).trim();
  if (tagClean.charAt(0) !== '#') tagClean = '#' + tagClean;

  var ss = _getSs();
  var cardInfo = _construirCardInfoMap(ss);
  return _generarUrlMazo3DesdeMapas(tagClean, cardInfo, _construirCards2DeTag(tagClean));
}

/**
 * generarMazoPerfil(tag) [→ Contexto_Base_Web.md §PF070]
 * Para el perfil web (_webPerfilExtendido): lee el catálogo (Cards) y las cartas del jugador (Cards_2) UNA sola vez y devuelve
 *  - mazo3: lo mismo que generarMazo3() ({url, nivelPromedio, nivelMinimo}) o null;
 *  - cartas: lista compacta de TODAS las cartas del catálogo (sin cartas de torre), una entrada [slug, nivel, evoLevel, maxEvoLevel] por carta:
 *      nivel = nivel del jugador (0 si no la tiene); evoLevel = -1 si no tiene evolución ni héroe (igual que Cards_2);
 *      maxEvoLevel = -1 si la carta solo existe en versión normal, o 1, 2 o 3 según el juego (igual que Cards).
 *    Con esto la ventana «Sugerencias de mazo» de perfil.html arma la URL de RoyaleAPI en el navegador (incluir / excluir / nivel mínimo)
 *    con la misma regla de _construirListasMazoDesdeMapas(). Las cartas que el jugador no tiene viajan con nivel 0 porque hay que excluirlas en la URL.
 * @returns {?{mazo3: ?Object, cartas: Array}} null si no hay catálogo o no hay datos de Cards_2 de este jugador.
 */
function generarMazoPerfil(tag) {
  if (!tag) return null;
  var tagClean = String(tag).trim();
  if (tagClean.charAt(0) !== '#') tagClean = '#' + tagClean;

  var ss = _getSs();
  var cardInfo = _construirCardInfoMap(ss);
  var playerCards = _construirCards2DeTag(tagClean);
  var ids = Object.keys(cardInfo || {});
  if (!playerCards || ids.length === 0) return null;

  var cartas = [];
  for (var i = 0; i < ids.length; i++) {
    var info = cardInfo[ids[i]];
    var p = playerCards[ids[i]];
    cartas.push([
      info.slug,
      p ? (Number(p.level) || 0) : 0,
      p ? p.evoLevel : -1,
      info.maxEvoLevel
    ]);
  }
  return { mazo3: _generarUrlMazo3DesdeMapas(tagClean, cardInfo, playerCards), cartas: cartas };
}

// E) COSTOS DE SUBIDA DE NIVEL: Backup_Cards_3.csv (catálogo fijo, manual) [→ Contexto_Base_Web.md §31B051]

/**
 * _leerCards3CSV() [→ Contexto_Base_Web.md §31B052]
 */
function _leerCards3CSV() {
  var headersDefault = ['N°', 'Rarity', 'Level', 'Goldcost', 'Cardcost'];
  var csvText = _loadCSVFromDrive('Backup_Cards_3.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  return { headers: parsed[0], rows: parsed.slice(1) };
}

/**
 * _construirCostosPorRareza() [→ Contexto_Base_Web.md §31B053]
 */
function _construirCostosPorRareza() {
  var csv = _leerCards3CSV(); // cols: 0=N°, 1=Rarity, 2=Level, 3=Goldcost, 4=Cardcost
  var porRareza = {};
  var maxDeclarado = {}; // nivel de la fila con costos vacíos
  var maxAlto = {};      // nivel más alto listado (respaldo)
  var hayDatos = false;

  for (var i = 0; i < csv.rows.length; i++) {
    var fila = csv.rows[i];
    var rareza = String(fila[1] || '').trim().toLowerCase();
    var nivel = Number(String(fila[2] || '').trim());
    if (!rareza || !(nivel >= 1)) continue; // fila vacía o sin nivel válido

    var oroTxt    = String(fila[3] === undefined ? '' : fila[3]).trim();
    var cartasTxt = String(fila[4] === undefined ? '' : fila[4]).trim();
    var esMax  = (oroTxt === '' && cartasTxt === '');
    var oro    = (oroTxt === '')    ? null : Number(oroTxt);
    var cartas = (cartasTxt === '') ? null : Number(cartasTxt);

    if (!esMax && (oro === null || cartas === null || !(oro >= 0) || !(cartas >= 0))) {
      Logger.log('[Cards3] Fila ' + (i + 2) + ' (' + fila[1] + ' nivel ' + fila[2] +
                 ') tiene un solo costo o un costo no numérico: se ignora.');
      continue;
    }

    if (!porRareza[rareza]) porRareza[rareza] = {};
    porRareza[rareza][nivel] = { oro: oro, cartas: cartas, esMax: esMax };
    if (esMax) maxDeclarado[rareza] = nivel;
    if (!maxAlto[rareza] || nivel > maxAlto[rareza]) maxAlto[rareza] = nivel;
    hayDatos = true;
  }

  var maxNivel = {};
  for (var r in maxAlto) maxNivel[r] = maxDeclarado[r] || maxAlto[r];

  return { porRareza: porRareza, maxNivel: maxNivel, hayDatos: hayDatos };
}

/**
 * _nivelRarezaDesdeNivelApp(nivelApp, rarity) [→ Contexto_Base_Web.md §31B054]
 */
function _nivelRarezaDesdeNivelApp(nivelApp, rarity) {
  var app = Number(nivelApp);
  var diff = _diferenciaNivelRareza(rarity);
  if (!(app >= 1) || diff === null) return null;
  return app - diff;
}

/**
 * _costoSubirNivel(costos, rarity, nivelRareza) [→ Contexto_Base_Web.md §31B055]
 */
function _costoSubirNivel(costos, rarity, nivelRareza) {
  if (!costos || !costos.porRareza) return null;
  var tabla = costos.porRareza[String(rarity || '').trim().toLowerCase()];
  if (!tabla) return null;
  var c = tabla[nivelRareza];
  if (!c) return null;
  return { oro: c.oro, cartas: c.cartas, esMax: c.esMax };
}

/**
 * _construirCartaRarezaMap() [→ Contexto_Base_Web.md §31B056]
 */
function _construirCartaRarezaMap() {
  var csv = _leerCardsCSV(); // cols: 0=N°, 1=ID, 2=Name, 3=Nombre, 4=Maxlevel, 5=MaxEvolutionLevel, 6=Rarity
  var mapa = {};
  for (var i = 0; i < csv.rows.length; i++) {
    var id = String(csv.rows[i][1] || '').trim();
    if (!id) continue;
    var maxLv = Number(csv.rows[i][4]);
    mapa[id] = {
      nombre:      String(csv.rows[i][3] || csv.rows[i][2] || ('Carta ' + id)),
      rarity:      String(csv.rows[i][6] || '').trim(),
      maxLevelCsv: (maxLv >= 1) ? maxLv : null
    };
  }
  return mapa;
}

/**
 * _calcularCostosSubirDesdeMapas(playerCards, cartaInfo, costos) [→ Contexto_Base_Web.md §31B057]
 */
function _calcularCostosSubirDesdeMapas(playerCards, cartaInfo, costos) {
  var resultado = [];
  if (!playerCards) return resultado;

  var ids = Object.keys(playerCards).sort(function (a, b) { return Number(a) - Number(b); });
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    var info = (cartaInfo && cartaInfo[id]) || { nombre: 'Carta ' + id, rarity: '', maxLevelCsv: null };
    var nivelApp = Number(playerCards[id].level) || 0;
    var nivelMaxCards3 = (costos.maxNivel[String(info.rarity || '').trim().toLowerCase()]) || null;

    var item = {
      id:              id,
      nombre:          info.nombre,
      rarity:          info.rarity,
      nivelApp:        nivelApp,
      nivelRareza:     null,
      diferenciaNivel: _diferenciaNivelRareza(info.rarity),
      maxLevelCsv:     info.maxLevelCsv,
      nivelMaxCards3:  nivelMaxCards3,
      desbloqueada:    nivelApp > 0, // Level=0 en Backup_Cards_2.csv = carta no desbloqueada
      esMax:           null,
      oro:             null,
      cartas:          null
    };

    if (item.desbloqueada) {
      item.nivelRareza = _nivelRarezaDesdeNivelApp(nivelApp, info.rarity);
      if (item.nivelRareza !== null) {
        var c = _costoSubirNivel(costos, info.rarity, item.nivelRareza);
        if (c) {
          item.esMax  = c.esMax;
          item.oro    = c.oro;
          item.cartas = c.cartas;
        }
      }
    }
    resultado.push(item);
  }
  return resultado;
}

/**
 * costosSubirNivelJugador(tag) [→ Contexto_Base_Web.md §31B058]
 */
function costosSubirNivelJugador(tag) {
  if (!tag) return [];
  var tagClean = String(tag).trim();
  if (tagClean.charAt(0) !== '#') tagClean = '#' + tagClean;

  var costos = _construirCostosPorRareza();
  if (!costos.hayDatos) {
    Logger.log('[Cards3] Backup_Cards_3.csv no existe o no tiene filas válidas.');
    return [];
  }
  var cartaInfo    = _construirCartaRarezaMap();
  var cards2PorTag = _construirCards2PorTag(null); // el parámetro se conserva sin uso, ver su docblock
  if (!cards2PorTag[tagClean]) {
    Logger.log('[Cards3] Sin filas en Backup_Cards_2.csv para ' + tagClean + '.');
    return [];
  }
  return _calcularCostosSubirDesdeMapas(cards2PorTag[tagClean], cartaInfo, costos);
}

/**
 * _nivelesFaltantesEnCards3(cardsRows, costos) [→ Contexto_Base_Web.md §31B059]
 */
function _nivelesFaltantesEnCards3(cardsRows, costos) {
  var maxPorRareza = {}; // clave en minúscula -> {rarity, nivel}
  for (var i = 0; i < cardsRows.length; i++) {
    var rarity = String(cardsRows[i][6] || '').trim();
    var key = rarity.toLowerCase();
    var lv = Number(cardsRows[i][4]);
    if (!key || !(lv >= 1)) continue;
    if (!maxPorRareza[key] || lv > maxPorRareza[key].nivel) maxPorRareza[key] = { rarity: rarity, nivel: lv };
  }

  var faltantes = [];
  for (var k in maxPorRareza) {
    var n3 = costos.maxNivel[k] || 0;
    if (maxPorRareza[k].nivel > n3) {
      faltantes.push({ rarity: maxPorRareza[k].rarity, nivelMaxCards: maxPorRareza[k].nivel, nivelMaxCards3: n3 });
    }
  }
  return faltantes;
}

/**
 * _avisarNivelesFaltantesCards3(cardsRows) [→ Contexto_Base_Web.md §31B060]
 */
function _avisarNivelesFaltantesCards3(cardsRows) {
  try {
    var costos = _construirCostosPorRareza();
    if (!costos.hayDatos) return;
    var faltantes = _nivelesFaltantesEnCards3(cardsRows, costos);
    for (var i = 0; i < faltantes.length; i++) {
      var f = faltantes[i];
      Logger.log('[Cards3] NIVEL NUEVO DETECTADO: ' + f.rarity + ' llega al nivel ' + f.nivelMaxCards +
                 ' en Backup_Cards.csv, pero Backup_Cards_3.csv ' +
                 (f.nivelMaxCards3 ? 'solo llega al ' + f.nivelMaxCards3 : 'no tiene esa rareza') +
                 '. Agrega a mano las filas que faltan (Goldcost y Cardcost de cada nivel nuevo).');
    }
  } catch (e) {
    Logger.log('[Cards3] No se pudo revisar si faltan niveles en Backup_Cards_3.csv (' + e.message + ').');
  }
}

/**
 * _avisarDiferenciasNivelCards(cardsRows) [→ Contexto_Base_Web.md §31B061]
 */
function _avisarDiferenciasNivelCards(cardsRows) {
  try {
    var maxPorRareza = {}; // clave en minúscula -> {rarity, nivel}
    for (var i = 0; i < cardsRows.length; i++) {
      var rarity = String(cardsRows[i][6] || '').trim();
      var key = rarity.toLowerCase();
      var lv = Number(cardsRows[i][4]);
      if (!key || !(lv >= 1)) continue;
      if (!maxPorRareza[key] || lv > maxPorRareza[key].nivel) maxPorRareza[key] = { rarity: rarity, nivel: lv };
    }

    var sinDiferencia = [];
    var topes = {}; // tope de la app -> ['Common 16', ...]
    for (var k in maxPorRareza) {
      var d = _diferenciaNivelRareza(k);
      var r = maxPorRareza[k];
      if (d === null) {
        sinDiferencia.push(r.rarity + ' (Maxlevel ' + r.nivel + ')');
        continue;
      }
      var tope = r.nivel + d;
      if (!topes[tope]) topes[tope] = [];
      topes[tope].push(r.rarity + ' ' + r.nivel);
    }

    if (sinDiferencia.length > 0) {
      Logger.log('[Cards] RAREZA SIN DIFERENCIA DE NIVEL en Backup_Cards.csv: ' + sinDiferencia.join(', ') +
                 '. Revisa que su Maxlevel sea un número válido en Backup_Cards.csv.');
    }
    var claves = Object.keys(topes);
    if (claves.length > 1) {
      var partes = [];
      for (var t = 0; t < claves.length; t++) partes.push('tope ' + claves[t] + ': ' + topes[claves[t]].join(', '));
      Logger.log('[Cards] TOPES DE NIVEL DESALINEADOS (Maxlevel + diferencia por rareza no da el mismo tope): ' +
                 partes.join(' | ') + '. Revisa Maxlevel en Backup_Cards.csv.');
    }
  } catch (e) {
    Logger.log('[Cards] No se pudo revisar la diferencia de niveles por rareza (' + e.message + ').');
  }
}

/**
 * _avisarRevisionNivelesCards(cardsRows) [→ Contexto_Base_Web.md §31B062]
 */
function _avisarRevisionNivelesCards(cardsRows) {
  _avisarDiferenciasNivelCards(cardsRows);
  _avisarNivelesFaltantesCards3(cardsRows);
}
