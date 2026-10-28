// 46_Test.gs
// Tests de endpoints disponibles, también se documentan cuáles no están disponibles por fallas desde Supercell o faltas de permisos (funciones pagadas)

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Pruebas manuales de la API
//  Parte 2 — Funciones que no se corren a mano
//    - Pruebas manuales de la API: ayuda
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var TAG_PRUEBA = '#9LCJ2JQ08'; // <-- REEMPLAZAR por un tag real

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Pruebas manuales de la API -----

// Prueba /players/{tag}/upcomingchests y /battlelog; imprime un resumen legible en el log. [→ Contexto_Base_Web.md §46B001]
function testCofresYBatallas() {
  var tag = TAG_PRUEBA;
  Logger.log('=== TEST con tag: ' + tag + ' ===');

  // --- 1) Ciclo de cofres ---
  Logger.log('\n--- /upcomingchests ---');
  var cofres = _apiGet('/players/' + encodeTag(tag) + '/upcomingchests');
  if (!cofres) {
    Logger.log('Sin respuesta (null). Revisar logs de _apiGet arriba.');
  } else {
    Logger.log('Claves de la respuesta: ' + Object.keys(cofres).join(', '));
    var lista = cofres.items || [];
    Logger.log('Cofres en cola: ' + lista.length);
    for (var i = 0; i < Math.min(lista.length, 10); i++) {
      Logger.log('  [' + i + '] index=' + lista[i].index + ' name=' + lista[i].name);
    }
  }

  // --- 2) Battlelog ---
  Logger.log('\n--- /battlelog ---');
  var batallas = _apiGet('/players/' + encodeTag(tag) + '/battlelog');
  if (!batallas) {
    Logger.log('Sin respuesta (null). Revisar logs de _apiGet arriba.');
  } else {
    Logger.log('Tipo: ' + (Array.isArray(batallas) ? 'array' : typeof batallas));
    var listaB = batallas; // el endpoint devuelve un array directo
    if (Array.isArray(listaB)) {
      Logger.log('Batallas devueltas: ' + listaB.length);
      for (var j = 0; j < Math.min(listaB.length, 5); j++) {
        var b = listaB[j];
        var tipo = b.type || '?';
        var resumen = '';
        if (b.team && b.team[0]) {
          resumen = ' team.crowns=' + (b.team[0].crowns !== undefined ? b.team[0].crowns : '?') +
                    ' opponent.crowns=' + (b.opponent && b.opponent[0] ? b.opponent[0].crowns : '?');
        }
        Logger.log('  [' + j + '] type=' + tipo +
                   ' time=' + (b.battleTime || '?') +
                   resumen);
      }
      // Volcar la primera batalla completa al log para ver la estructura real
      if (listaB.length > 0) {
        Logger.log('\nPrimera batalla (JSON completo):');
        Logger.log(JSON.stringify(listaB[0], null, 2).substring(0, 3000));
      }
    }
  }

  Logger.log('\n=== FIN TEST ===');
}

// Test alternativo: recorre el cache y prueba ambos endpoints solo con el primer miembro de cada clan Terna. [→ Contexto_Base_Web.md §46B002]
function testCofresYBatallasTodos() {
  if (!CACHE_CLAN_DATA) {
    Logger.log('No hay cache. Llamando a _fetchClanesBasico()...');
    _fetchClanesBasico();
  }
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var cd = CACHE_CLAN_DATA[CFG.TERNA_TAGS[i]];
    if (!cd || !cd.members || !cd.members.length) {
      Logger.log('Clan ' + CFG.TERNA_TAGS[i] + ': sin miembros en cache.');
      continue;
    }
    var t = cd.members[0].tag;
    Logger.log('\n=== Clan ' + CFG.TERNA_TAGS[i] + ' — primer miembro ' + t + ' ===');
    var c = _apiGet('/players/' + encodeTag(t) + '/upcomingchests');
    Logger.log('  upcomingchests: ' + (c ? (c.items ? c.items.length + ' cofres' : 'respuesta sin items') : 'NULL'));
    var b = _apiGet('/players/' + encodeTag(t) + '/battlelog');
    Logger.log('  battlelog: ' + (Array.isArray(b) ? b.length + ' batallas' : (b ? 'respuesta no-array' : 'NULL')));
    Utilities.sleep(500);
  }
}

// TEST — Endpoints viables de la API de Clash Royale (temporal)

// Endpoints MUERTOS/REMOVIDOS por Supercell (no se prueban a propósito), VIVOS que suelen devolver {items:[]} y los que sí se prueban; archivo temporal. [→ Contexto_Base_Web.md §46B003]

function testTodosLosEndpoints() {
  var clanTag = CFG.TERNA_TAGS[0]; // '#GCRG8L00'
  var resultados = [];
  var t0 = Date.now();

  Logger.log('===== INICIO TEST DE ENDPOINTS =====');
  Logger.log('Clan de prueba: ' + clanTag);
  Logger.log('');

  // ------------------------------------------------------------------
  // BLOQUE 1 — Endpoints SIN parámetros
  // ------------------------------------------------------------------

  Logger.log('--- BLOQUE 1: endpoints sin parámetros ---');

  resultados.push(_probarEp('GET /cards', '/cards', function (d) {
    return (d && d.items) ? d.items.length + ' cartas' : 'sin items';
  }));

  resultados.push(_probarEp('GET /locations', '/locations', function (d) {
    return (d && d.items) ? d.items.length + ' ubicaciones' : 'sin items';
  }));

  resultados.push(_probarEp('GET /locations/global/seasons', '/locations/global/seasons', function (d) {
    return (d && d.items) ? d.items.length + ' temporadas' : 'sin items';
  }));

  // "terna" es un valor de ejemplo, no un requisito del endpoint -- ver
  // "DETALLE /tournaments?name=X" en 26_Torneos_Core.gs: el param SIEMPRE
  // debe llamarse "name" (probado por el usuario: con "limit" en vez de
  // "name" no devuelve nada), pero puede llevar cualquier palabra.
  resultados.push(_probarEp('GET /tournaments?name=terna', '/tournaments?name=terna', function (d) {
    return (d && d.items) ? d.items.length + ' torneos' : 'sin items';
  }));

  resultados.push(_probarEp('GET /globaltournaments', '/globaltournaments', function (d) {
    return (d && d.items) ? d.items.length + ' torneos globales' : 'sin items';
  }));

  // Rankings globales (sin locationId específico)
  resultados.push(_probarEp('GET /locations/global/rankings/clans?limit=5',
    '/locations/global/rankings/clans?limit=5',
    function (d) { return (d && d.items) ? d.items.length + ' clanes (top global)' : 'sin items'; }
  ));

  resultados.push(_probarEp('GET /locations/global/rankings/clanwars?limit=5',
    '/locations/global/rankings/clanwars?limit=5',
    function (d) { return (d && d.items) ? d.items.length + ' clanes (guerra, top global)' : 'sin items'; }
  ));

  resultados.push(_probarEp('GET /locations/global/rankings/players',
    '/locations/global/rankings/players',
    function (d) { return (d && d.items) ? d.items.length + ' jugadores (top global)' : 'sin items'; }
  ));

  // ------------------------------------------------------------------
  // BLOQUE 2 — Extracción de IDs para los endpoints con parámetros
  // ------------------------------------------------------------------

  Logger.log('');
  Logger.log('--- BLOQUE 2: extracción de IDs ---');

  // Location ID de Perú (o el primero disponible como fallback)
  var peruId = null;
  var locationsData = _apiGet('/locations');
  if (locationsData && locationsData.items) {
    for (var i = 0; i < locationsData.items.length; i++) {
      var nom = String(locationsData.items[i].name || '');
      if (nom === 'Peru' || nom === 'Perú' || nom === 'PERU') {
        peruId = locationsData.items[i].id;
        break;
      }
    }
    if (peruId === null) peruId = locationsData.items[0].id; // fallback
    Logger.log('Location ID de Perú: ' + peruId +
      (peruId === locationsData.items[0].id ? ' (fallback: primera ubicación de la lista)' : ''));
  } else {
    Logger.log('No se pudo leer /locations para extraer el ID de Perú.');
  }

  // Tournament tag: {"items":[]} es el resultado normal casi siempre (nota 25-sep-2026). [→ Contexto_Base_Web.md §46B004]
  var tournamentTag = null;
  var tournamentsData = _apiGet('/tournaments?name=terna');
  _guardarJsonBusquedaNombreEnDrive('terna', tournamentsData);
  if (tournamentsData && tournamentsData.items && tournamentsData.items.length > 0) {
    tournamentTag = tournamentsData.items[0].tag;
    Logger.log('Tournament tag del primer torneo con "terna": ' + tournamentTag);
  } else {
    Logger.log('No hay torneos con "terna" ahora mismo — se omite /tournaments/{tag}.');
  }

  // Season ID para Path of Legend (la más reciente de /locations/global/seasons)
  var seasonId = null;
  if (locationsData && locationsData.items) {
    // reutilizamos la llamada previa a /locations/global/seasons del bloque 1
  }
  var seasonsData = _apiGet('/locations/global/seasons');
  if (seasonsData && seasonsData.items && seasonsData.items.length > 0) {
    seasonId = seasonsData.items[0].id; // ej. "2026-08"
    Logger.log('Season ID más reciente: ' + seasonId);
  } else {
    Logger.log('No se pudo leer /locations/global/seasons para extraer seasonId.');
  }

  // ------------------------------------------------------------------
  // BLOQUE 3 — Endpoints CON parámetros
  // ------------------------------------------------------------------

  Logger.log('');
  Logger.log('--- BLOQUE 3: endpoints con parámetros ---');

  // --- Detalle de ubicación (Perú) ---
  if (peruId !== null) {
    resultados.push(_probarEp('GET /locations/' + peruId,
      '/locations/' + peruId,
      function (d) {
        return d ? ('name="' + (d.name || '?') + '", isCountry=' + (d.isCountry) +
                    ', countryCode=' + (d.countryCode || '?')) : 'null';
      }
    ));
  }

  // --- Rankings por ubicación ---
  if (peruId !== null) {
    resultados.push(_probarEp('GET /locations/' + peruId + '/rankings/clans',
      '/locations/' + peruId + '/rankings/clans',
      function (d) { return (d && d.items) ? d.items.length + ' clanes en ranking' : 'sin items'; }
    ));

    resultados.push(_probarEp('GET /locations/' + peruId + '/rankings/players',
      '/locations/' + peruId + '/rankings/players',
      function (d) { return (d && d.items) ? d.items.length + ' jugadores en ranking' : 'sin items'; }
    ));

    resultados.push(_probarEp('GET /locations/' + peruId + '/rankings/clanwars',
      '/locations/' + peruId + '/rankings/clanwars',
      function (d) { return (d && d.items) ? d.items.length + ' clanes (guerra) en ranking' : 'sin items'; }
    ));
  } else {
    resultados.push('GET /locations/{id}/rankings/* -> OMITIDO (no se obtuvo location ID)');
  }

  // --- Path of Legend por ubicación ---
  if (peruId !== null) {
    resultados.push(_probarEp('GET /locations/' + peruId + '/pathoflegend/players?limit=5',
      '/locations/' + peruId + '/pathoflegend/players?limit=5',
      function (d) {
        if (!d || !d.items) return 'sin items';
        var primero = d.items[0];
        return d.items.length + ' jugadores PoL' +
               (primero ? (' — #1: ' + (primero.name || '?') + ' (' + (primero.eloRating || '?') + ')') : '');
      }
    ));
  }

  // --- Path of Legend global por temporada ---
  if (seasonId) {
    resultados.push(_probarEp('GET /locations/global/pathoflegend/' + seasonId + '/rankings/players',
      '/locations/global/pathoflegend/' + seasonId + '/rankings/players',
      function (d) {
        if (!d || !d.items) return 'sin items';
        var primero = d.items[0];
        return d.items.length + ' jugadores PoL (temporada ' + seasonId + ')' +
               (primero ? (' — #1: ' + (primero.name || '?') + ' (' + (primero.eloRating || '?') + ')') : '');
      }
    ));
  } else {
    resultados.push('GET /locations/global/pathoflegend/{season}/rankings/players -> OMITIDO (sin seasonId)');
  }

  // --- Detalle del torneo individual ---
  if (tournamentTag) {
    resultados.push(_probarEp('GET /tournaments/{tag}',
      '/tournaments/' + encodeTag(tournamentTag),
      function (d) {
        return d ? ('OK — name="' + (d.name || '?') + '", capacity=' + (d.capacity || '?') + ', status=' + (d.status || '?')) : 'null';
      }
    ));
  } else {
    resultados.push('GET /tournaments/{tag} -> OMITIDO (no hay torneos con "terna")');
  }

  // ------------------------------------------------------------------
  // BLOQUE 4 — Endpoints de CLANES (miembros y búsqueda)
  // ------------------------------------------------------------------

  Logger.log('');
  Logger.log('--- BLOQUE 4: clanes (miembros + búsqueda) ---');

  // --- Detalle del clan (ruta corta, sin sub-ruta) ---
  resultados.push(_probarEp('GET /clans/' + encodeTag(clanTag),
    '/clans/' + encodeTag(clanTag),
    function (d) {
      return d ? ('name="' + (d.name || '?') + '", members=' + (d.members || '?') +
                  ', clanScore=' + (d.clanScore || '?') +
                  ', memberList=' + ((d.memberList && d.memberList.length) || 0)) : 'null';
    }
  ));

  // --- Miembros del clan (endpoint dedicado con paginación) ---
  resultados.push(_probarEp('GET /clans/{tag}/members?limit=5',
    '/clans/' + encodeTag(clanTag) + '/members?limit=5',
    function (d) {
      if (!d || !d.items) return 'sin items';
      var primero = d.items[0];
      return d.items.length + ' miembros' +
             (primero ? (' — [0] ' + (primero.name || '?') + ' (' + (primero.role || '?') + ')') : '') +
             (d.paging && d.paging.cursors && d.paging.cursors.after ? ' [hay más]' : '');
    }
  ));

  // --- Búsqueda de clanes por nombre (sin filtro de ubicación) ---
  resultados.push(_probarEp('GET /clans?name=terna',
    '/clans?name=terna',
    function (d) {
      if (!d || !d.items) return 'sin items';
      return d.items.length + ' clanes con "terna"';
    }
  ));

  // --- Búsqueda de clanes por nombre + locationId (filtro combinado) ---
  if (peruId !== null) {
    resultados.push(_probarEp('GET /clans?name=terna&locationId=' + peruId,
      '/clans?name=terna&locationId=' + peruId,
      function (d) {
        if (!d || !d.items) return 'sin items';
        var nombres = [];
        for (var k = 0; k < Math.min(d.items.length, 5); k++) {
          nombres.push(d.items[k].name);
        }
        return d.items.length + ' clanes — [' + nombres.join(', ') + ']';
      }
    ));
  }

  // ------------------------------------------------------------------
  // RESUMEN FINAL
  // ------------------------------------------------------------------

  Logger.log('');
  Logger.log('===== RESUMEN FINAL (' + ((Date.now() - t0) / 1000).toFixed(1) + 's) =====');
  for (var r = 0; r < resultados.length; r++) {
    Logger.log('  ' + resultados[r]);
  }
  Logger.log('===== FIN TEST =====');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Pruebas manuales de la API: ayuda -----

// Helper: prueba UN endpoint con _apiGet() y devuelve una línea de resumen; no lanza. [→ Contexto_Base_Web.md §46B005]
function _probarEp(nombre, path, analizar) {
  try {
    var data = _apiGet(path);
    if (data === null) {
      return nombre + ' -> NULL (ver logs de _apiGet arriba para el HTTP code)';
    }
    try {
      return nombre + ' -> OK: ' + analizar(data);
    } catch (eAn) {
      return nombre + ' -> OK pero análisis falló: ' + eAn.message;
    }
  } catch (e) {
    return nombre + ' -> EXCEPCIÓN: ' + e.message;
  }
}

// _guardarJsonBusquedaNombreEnDrive() vive en 09_API_ClashRoyale.gs; se llama tal cual (mismo proyecto). [→ Contexto_Base_Web.md §46B006]
