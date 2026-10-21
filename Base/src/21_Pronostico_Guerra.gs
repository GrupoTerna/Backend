// ==============================================================================
// 21_Pronostico_Guerra.gs
// Reemplaza la regla de tres que se venía usando a ojo ("si 126 ataques
// lograron 20.550 puntos, entonces 20.550 x (200/126)") por un techo
// calculado ataque por ataque, que es lo único que permite decir "hasta
// aquí PUEDE llegar este clan" sin inventar.
// ==============================================================================

// DOCUMENTACIÓN DEL PUNTAJE DE GUERRA: valor de ataques/duelos, techo diario 900/700/400/200/0, límites 200 ataques / 50 cuentas (pedido 15-sep-2026). [→ Contexto_Base_Web.md §21B001]

// ----- Variables y constantes -----

var PG = {
  ATAQUES_POR_CUENTA_DIA: 4,
  ATAQUES_MAX_CLAN_DIA:   200,
  CUENTAS_MAX_CLAN_DIA:   50,
  FAME_VICTORIA_DUELO:    250,
  FAME_VICTORIA_NORMAL:   200,
  FAME_DERROTA:           100,
  // Mínimo de mazos disponibles para poder INICIAR un duelo. Es el número [→ Contexto_Base_Web.md §21B002]
  MAZOS_MINIMOS_DUELO:    3
};

// ----- Funciones manuales / punto de entrada -----

/**
 * pronosticoGuerraHoy() [→ Contexto_Base_Web.md §21B003]
 */
function pronosticoGuerraHoy() {
  var resultado = calcularPronosticoGuerra();
  if (!resultado.ok) {
    Logger.log('[Pronóstico] ' + resultado.error);
    return resultado;
  }
  resultado.clanes.forEach(function (c) {
    Logger.log('[Pronóstico] ' + c.nombre + ' (' + c.clanTag + '): ' +
      'fame ' + c.fameActual +
      ' | techo con el roster actual ' + c.fameTechoRoster +
      ' | techo absoluto (con apoyo) ' + c.fameTecho +
      ' | ataques ' + c.ataquesUsados + '/' + PG.ATAQUES_MAX_CLAN_DIA +
      ' | cuentas que ya atacaron: ' + c.cuentasQueAtacaron +
      ' | ataques reemplazables: ' + c.ataquesReemplazables +
      (c.esRival ? ' [RIVAL]' : ''));
  });
  return resultado;
}

// CÁLCULO POR JUGADOR [→ Contexto_Base_Web.md §21B004]

/**
 * _pronosticoTechoRestante(ataquesUsadosHoy, fameDelDiaOpcional) [→ Contexto_Base_Web.md §21B005]
 */
function _pronosticoTechoRestante(ataquesUsadosHoy, fameDelDiaOpcional) {
  var usados = Math.max(0, Math.min(PG.ATAQUES_POR_CUENTA_DIA, Number(ataquesUsadosHoy) || 0));
  var restantes = PG.ATAQUES_POR_CUENTA_DIA - usados;
  if (restantes <= 0) return 0;

  // Refinamiento: duelo ya jugado y confirmado por la fama del día. Solo es [→ Contexto_Base_Web.md §21B006]
  if (fameDelDiaOpcional !== undefined && fameDelDiaOpcional !== null) {
    if (_pronosticoYaHizoDuelo(usados, Number(fameDelDiaOpcional) || 0)) {
      return PG.FAME_VICTORIA_NORMAL * restantes;
    }
  }

  if (restantes >= PG.MAZOS_MINIMOS_DUELO) {
    // Duelo ganado 2-0: 250 + 250 = 500 con solo 2 mazos consumidos, y cada
    // mazo sobrante rinde 200 en batalla individual.
    var fameDuelo20 = PG.FAME_VICTORIA_DUELO * 2;
    return fameDuelo20 + PG.FAME_VICTORIA_NORMAL * (restantes - 2);
  }

  // Menos de 3 mazos: el duelo ya no es posible. Aquí vive la corrección del
  // 15-sep-2026 (2 mazos = 400, no 500).
  return PG.FAME_VICTORIA_NORMAL * restantes;
}

/**
 * _pronosticoYaHizoDuelo(ataquesUsadosHoy, fameDelDia) [→ Contexto_Base_Web.md §21B007]
 */
function _pronosticoYaHizoDuelo(ataquesUsadosHoy, fameDelDia) {
  var usados = Number(ataquesUsadosHoy) || 0;
  var fame = Number(fameDelDia) || 0;
  return usados === 2 && fame === (PG.FAME_VICTORIA_DUELO * 2);
}

/**
 * _pronosticoMapaFameHoyPorTag(clanTag, ctx) [→ Contexto_Base_Web.md §21B008]
 */
function _pronosticoMapaFameHoyPorTag(clanTag, ctx) {
  var mapa = {};
  if (!ctx || !ctx.periodIndex) return mapa; // sin cache de clanes, ver _getCtx()

  // Resolver el NOMBRE de clan asociado a clanTag -- la columna Clan de la [→ Contexto_Base_Web.md §21B009]
  var clanCachePronostico  = _getClanCache(clanTag);
  var clanNombrePronostico = (clanCachePronostico && clanCachePronostico.info && clanCachePronostico.info.name) || '';
  if (!clanNombrePronostico) return mapa;

  var ss = _getSs();
  var lecturaGuerraPronostico = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.GUERRA, 'Backup_Guerra.csv', GUERRA_TOTAL_COLS);
  var datosGuerra = lecturaGuerraPronostico.filas;
  if (!datosGuerra.length) return mapa;

  var pIdxHoy  = ctx.periodIndex;
  var pIdxAyer = ctx.periodIndex - 1;

  // Acumulado de Fame por Tag y por periodo, SOLO de este clan y esta [→ Contexto_Base_Web.md §21B010]
  var fameByTagPeriod = {};
  for (var i = 0; i < datosGuerra.length; i++) {
    var fila = datosGuerra[i];
    if (String(fila[GC.CLAN - 1] || '') !== clanNombrePronostico) continue;
    if (String(fila[GC.TEMPORADA - 1] || '') !== String(ctx.temporada)) continue;
    var pIdxFila = Number(fila[GC.PERIOD_IDX - 1]) || 0;
    if (pIdxFila !== pIdxHoy && pIdxFila !== pIdxAyer) continue;

    var tagFila = String(fila[GC.TAG - 1] || '').trim().toUpperCase();
    if (!tagFila) continue;
    if (!fameByTagPeriod[tagFila]) fameByTagPeriod[tagFila] = {};
    fameByTagPeriod[tagFila][pIdxFila] = Number(fila[GC.FAME - 1]) || 0;
  }

  Object.keys(fameByTagPeriod).forEach(function (tag) {
    var fameHoy  = fameByTagPeriod[tag][pIdxHoy]  || 0;
    var fameAyer = fameByTagPeriod[tag][pIdxAyer] || 0;
    mapa[tag] = Math.min(Math.max(fameHoy - fameAyer, 0), 900);
  });

  return mapa;
}

// CÁLCULO POR CLAN [→ Contexto_Base_Web.md §21B011]

/**
 * _pronosticoTechoDePozo(ataques) [→ Contexto_Base_Web.md §21B012]
 */
function _pronosticoTechoDePozo(ataques) {
  var n = Math.max(0, Number(ataques) || 0);
  var completas = Math.floor(n / PG.ATAQUES_POR_CUENTA_DIA);
  var resto = n % PG.ATAQUES_POR_CUENTA_DIA;
  return completas * _pronosticoTechoRestante(0) + // 900 por cuenta completa
    (resto > 0 ? _pronosticoTechoRestante(PG.ATAQUES_POR_CUENTA_DIA - resto) : 0);
}

/**
 * _pronosticoTechoClan(participants, mapaFameHoyPorTag) [→ Contexto_Base_Web.md §21B013]
 */
function _pronosticoTechoClan(participants, mapaFameHoyPorTag) {
  var lista = participants || [];
  var fameActual = 0;
  var ataquesUsados = 0;
  var cuentasQueAtacaron = 0;
  var techoDeQuienesYaAtacaron = 0;
  // Techo contando SOLO a las cuentas que hoy figuran en la carrera, sin [→ Contexto_Base_Web.md §21B014]
  var techoRoster = 0;
  var cuentasEnCero = 0;

  for (var i = 0; i < lista.length; i++) {
    var part = lista[i] || {};
    var usadosHoy = Math.max(0, Math.min(PG.ATAQUES_POR_CUENTA_DIA, Number(part.decksUsedToday) || 0));
    fameActual += Number(part.fame) || 0;

    // FASE (16-sep-2026): fama HECHA HOY de esta cuenta puntual, si vino en [→ Contexto_Base_Web.md §21B015]
    var tagPart = String(part.tag || '').trim().toUpperCase();
    var fameHoyPart = (mapaFameHoyPorTag && tagPart) ? mapaFameHoyPorTag[tagPart] : undefined;

    if (usadosHoy === 0) cuentasEnCero++;

    if (usadosHoy > 0) {
      techoRoster += _pronosticoTechoRestante(usadosHoy, fameHoyPart);
      // Cuenta con ataques ya RESERVADOS: lo que le quede es solo suyo.
      cuentasQueAtacaron++;
      ataquesUsados += usadosHoy;
      techoDeQuienesYaAtacaron += _pronosticoTechoRestante(usadosHoy, fameHoyPart);
    }
  }

  // Pozo reemplazable: cuánto margen queda para cuentas que todavía no [→ Contexto_Base_Web.md §21B016]
  var margenPorAtaques = Math.max(0, PG.ATAQUES_MAX_CLAN_DIA - ataquesUsados);
  var margenPorCuentas = Math.max(0, PG.CUENTAS_MAX_CLAN_DIA - cuentasQueAtacaron) * PG.ATAQUES_POR_CUENTA_DIA;
  var ataquesReemplazables = Math.min(margenPorAtaques, margenPorCuentas);

  // Ese pozo se reparte en cuentas COMPLETAS de 4 ataques (900 de techo cada [→ Contexto_Base_Web.md §21B017]
  var techoReemplazables = _pronosticoTechoDePozo(ataquesReemplazables);

  // FIX (20-sep-2026, reporte del usuario: en guerra.html "Techo (solo [→ Contexto_Base_Web.md §21B018]
  var ataquesRosterEnCero = Math.min(cuentasEnCero * PG.ATAQUES_POR_CUENTA_DIA, ataquesReemplazables);
  techoRoster += _pronosticoTechoDePozo(ataquesRosterEnCero);

  // Dos techos, a propósito, porque responden preguntas distintas: [→ Contexto_Base_Web.md §21B019]
  return {
    fameActual: fameActual,
    fameTecho: fameActual + techoDeQuienesYaAtacaron + techoReemplazables,
    fameTechoRoster: fameActual + techoRoster,
    ataquesUsados: ataquesUsados,
    cuentasQueAtacaron: cuentasQueAtacaron,
    ataquesReservados: cuentasQueAtacaron * PG.ATAQUES_POR_CUENTA_DIA,
    ataquesReemplazables: ataquesReemplazables,
    participantes: lista.length
  };
}

/**
 * _pronosticoPuestoEnCarrera(rr, clanTag) [→ Contexto_Base_Web.md §21B020]
 */
function _pronosticoPuestoEnCarrera(rr, clanTag) {
  var lista = (rr && rr.clans) ? rr.clans : [];
  var tag = String(clanTag || '').trim().toUpperCase();
  var fameMia = null;
  for (var i = 0; i < lista.length; i++) {
    if (String((lista[i] || {}).tag || '').trim().toUpperCase() === tag) {
      fameMia = Number(lista[i].fame) || 0;
      break;
    }
  }
  if (fameMia === null) return { puesto: 0, total: lista.length };
  var mejores = 0;
  for (var j = 0; j < lista.length; j++) {
    if ((Number((lista[j] || {}).fame) || 0) > fameMia) mejores++;
  }
  return { puesto: mejores + 1, total: lista.length };
}

/**
 * calcularPronosticoGuerra() [→ Contexto_Base_Web.md §21B021]
 */
function calcularPronosticoGuerra(ctxOpcional) {
  var salida = [];
  var vistos = {};
  // Mismo cache de clanes que ya usa el resto de esta función -- no dispara [→ Contexto_Base_Web.md §21B022]
  var ctx = ctxOpcional || _getCtx();

  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTag = CFG.TERNA_TAGS[i];
    var clanData = _getClanCache(clanTag);
    if (!clanData) {
      Logger.log('[Pronóstico] Sin cache para ' + clanTag + ', se salta.');
      continue;
    }

    var rr = clanData.riverrace || {};
    var info = clanData.info || {};

    // Clan propio.
    var propios = (rr.clan && rr.clan.participants) ? rr.clan.participants : [];
    if (!vistos[clanTag]) {
      vistos[clanTag] = true;
      // FASE (16-sep-2026): refinamiento "ya hizo duelo" -- SOLO para el [→ Contexto_Base_Web.md §21B023]
      var mapaFameHoyPropio = _pronosticoMapaFameHoyPorTag(clanTag, ctx);
      var calcPropio = _pronosticoTechoClan(propios, mapaFameHoyPropio);
      calcPropio.clanTag = clanTag;
      calcPropio.nombre = info.name || clanTag;
      calcPropio.esRival = false;
      // 19-sep-2026 (guerra.html, tarjetas "Guerra de Hoy"): puesto actual del
      // clan propio en su carrera, por fame acumulada. Solo para clanes propios.
      var posicion = _pronosticoPuestoEnCarrera(rr, clanTag);
      calcPropio.puesto = posicion.puesto;
      calcPropio.clanesEnCarrera = posicion.total;
      // TANDA 14 (21-sep-2026): en coliseo el puesto es una estimación por [→ Contexto_Base_Web.md §21B024]
      var esColiseoPropio = (String(rr.periodType || '') === 'colosseum');
      calcPropio.coliseo = esColiseoPropio;
      calcPropio.estimado = esColiseoPropio && posicion.puesto > 0;
      salida.push(calcPropio);
    }

    // Rivales de la carrera de ESTE clan. `rr.clans` incluye también al clan [→ Contexto_Base_Web.md §21B025]
    var enCarrera = rr.clans || [];
    for (var j = 0; j < enCarrera.length; j++) {
      var rival = enCarrera[j] || {};
      var rivalTag = String(rival.tag || '').trim();
      if (!rivalTag || vistos[rivalTag]) continue;
      vistos[rivalTag] = true;

      // Sin mapaFameHoyPorTag: la hoja Guerra no registra a los rivales [→ Contexto_Base_Web.md §21B026]
      var calcRival = _pronosticoTechoClan(rival.participants || []);
      calcRival.clanTag = rivalTag;
      calcRival.nombre = rival.name || rivalTag;
      calcRival.esRival = true;
      // 20-sep-2026 (guerra.html, tarjetas "Guerra de Hoy"): a qué clan Terna [→ Contexto_Base_Web.md §21B027]
      calcRival.clanTernaTag = clanTag;
      calcRival.clanTernaNombre = info.name || clanTag;
      salida.push(calcRival);
    }
  }

  if (!salida.length) {
    return { ok: false, error: 'No hay datos de currentriverrace en caché para ningún clan Terna.', clanes: [] };
  }

  // Más arriba primero por techo: es el orden en que interesa leerlo (quién
  // PUEDE ganar, no quién va ganando ahora).
  salida.sort(function (a, b) { return b.fameTecho - a.fameTecho; });
  return { ok: true, clanes: salida };
}

var PRONOSTICO_WEB_CACHE_KEY     = 'web_pronostico_guerra_v5'; // v2: agrega puesto/clanesEnCarrera; v3: agrega clanTernaTag/clanTernaNombre a los rivales; v4: fameTechoRoster ya respeta los topes de 200 ataques / 50 cuentas; v5 (Tanda 14): agrega coliseo/estimado al clan propio
var PRONOSTICO_WEB_CACHE_TTL_SEG = 120;
var PRONOSTICO_WEB_CHECKPOINT_MAX_EDAD_MS = 70 * 60 * 1000;

/**
 * _webPronosticoGuerra() [→ Contexto_Base_Web.md §21B028]
 */
function _webPronosticoGuerra() {
  var cache = CacheService.getScriptCache();
  try {
    var crudo = cache.get(PRONOSTICO_WEB_CACHE_KEY);
    if (crudo) return JSON.parse(crudo);
  } catch (e1) { /* caché corrupta o no disponible: se calcula igual */ }

  var ctx = _getCtx(); // antes de cargar el caché de clanes, ver docblock
  if (!CACHE_CLAN_DATA) {
    var progreso = _cargarProgresoClanes(PRONOSTICO_WEB_CHECKPOINT_MAX_EDAD_MS);
    if (progreso) CACHE_CLAN_DATA = progreso;
  }

  var resultado = calcularPronosticoGuerra(ctx);
  if (resultado && resultado.ok) {
    try { cache.put(PRONOSTICO_WEB_CACHE_KEY, JSON.stringify(resultado), PRONOSTICO_WEB_CACHE_TTL_SEG); }
    catch (e2) { /* valor grande o cuota: el endpoint sigue funcionando sin caché */ }
  }
  return resultado;
}