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

// FAMA DE HOY (PF194, 23-oct-2026): `participants[].fame` de currentriverrace es el ACUMULADO de la semana de guerra, no el del día.
// Para mostrar lo de hoy hay que restarle la fama que el clan ya traía al empezar el día (la "base"). La base sale de:
//   1) una FOTO que guarda _pronosticoRegistrarFotoDia_() en cada captura fresca de clanes (propios y rivales); o, si no hay foto,
//   2) solo para clanes propios, la fama de AYER de la hoja Guerra (_pronosticoBaseDesdeHoja_). Sin ninguna de las dos, la base es
//      null y el clan queda sin fama de hoy (nunca se inventa). `periodPoints` de la API NO sirve: se probó y no es la fama del día.
//      [→ Contexto_Base_Web.md §PF194]

var PRONOSTICO_FOTO_PROP = 'PRON_FOTO_DIA_V1'; // propiedad de script: { 'TAG': { p: periodIndex, b: base|null, u: última suma vista, t: ms } }
var PRONOSTICO_FOTO_MAX_CHARS = 8500;           // las propiedades de script admiten ~9 KB por valor

/**
 * _pronosticoTagNorm_(tag): '#abc ' -> '#ABC' (misma normalización que ya usa este archivo para comparar tags).
 */
function _pronosticoTagNorm_(tag) {
  return String(tag || '').trim().toUpperCase();
}

/**
 * _pronosticoSumaFame_(participants): suma de `fame` (medallas acumuladas de la semana) de todos los participantes listados.
 */
function _pronosticoSumaFame_(participants) {
  var lista = participants || [];
  var total = 0;
  for (var i = 0; i < lista.length; i++) total += Number((lista[i] || {}).fame) || 0;
  return total;
}

/**
 * _pronosticoFotoLeer_(): lee la foto guardada. Devuelve {} si no existe o está corrupta (no rompe el pronóstico).
 */
function _pronosticoFotoLeer_() {
  try {
    var crudo = PropertiesService.getScriptProperties().getProperty(PRONOSTICO_FOTO_PROP);
    if (crudo) {
      var obj = JSON.parse(crudo);
      if (obj && typeof obj === 'object') return obj;
    }
  } catch (e) { /* foto corrupta o propiedades no disponibles: se trata como si no hubiera */ }
  return {};
}

/**
 * _pronosticoBaseDeFoto_(foto, tag, periodIndex): fama acumulada que el clan traía al empezar el día `periodIndex`, o null si
 * no se sabe. Jueves (periodIndex % 7 === 3, primer día de guerra y de coliseo): la fama arranca en 0, no hace falta foto.
 * Con foto: si ya hay registro de hoy, su base; si el último registro es de ayer, la última suma vista ayer (la captura de las
 * 4:xx a. m. Lima, cada 5 min, deja esa suma casi al cierre); cualquier otro caso (sin registro, salto de días) = null.
 */
function _pronosticoBaseDeFoto_(foto, tag, periodIndex) {
  var p = Number(periodIndex);
  if (!isFinite(p) || p < 0) return null;
  if (p % 7 === 3) return 0;
  var r = (foto || {})[_pronosticoTagNorm_(tag)];
  if (!r) return null;
  if (Number(r.p) === p) return (r.b === null || r.b === undefined) ? null : Number(r.b);
  if (Number(r.p) === p - 1) return Number(r.u) || 0;
  return null;
}

/**
 * _pronosticoBaseDeLogs_(rr, tag, periodIndex): base del día sacada de `rr.periodLogs` (24-oct-2026, PF198). Cada log trae, por
 * clan de la carrera y por día ya cerrado, `pointsEarned` (medallas ganadas ese día; también de los rivales). La fama acumulada de
 * los participantes es la de la semana, así que la base de hoy = suma de `pointsEarned` de los días anteriores de ESTA semana.
 * Semana de guerra: periodIndex % 7 === 3 es el jueves (primer día). Jueves: base 0. Devuelve null si falta el log de algún día
 * anterior de la semana para ese clan (no se inventa). Comprobado con las capturas de `Datos descargados/` (165 de 185 casos
 * exactos; el resto, capturas tomadas antes del cierre del día). [→ Contexto_Base_Web.md §PF198]
 */
function _pronosticoBaseDeLogs_(rr, tag, periodIndex) {
  var p = Number(periodIndex);
  if (!isFinite(p) || p < 0) return null;
  var dia = p % 7;
  if (dia < 3) return null;            // entrenamiento: no hay fama de guerra
  if (dia === 3) return 0;
  var logs = (rr && rr.periodLogs) ? rr.periodLogs : [];
  if (!logs.length) return null;
  var t = _pronosticoTagNorm_(tag);
  var inicio = p - (dia - 3);
  var puntos = {};
  for (var i = 0; i < logs.length; i++) {
    var lg = logs[i] || {};
    var q = Number(lg.periodIndex);
    if (!isFinite(q) || q < inicio || q >= p) continue;
    var items = lg.items || [];
    for (var j = 0; j < items.length; j++) {
      var it = items[j] || {};
      if (_pronosticoTagNorm_((it.clan || {}).tag) === t) { puntos[q] = Number(it.pointsEarned) || 0; break; }
    }
  }
  var total = 0;
  for (var d = inicio; d < p; d++) {
    if (puntos[d] === undefined) return null;
    total += puntos[d];
  }
  return total;
}

/**
 * _pronosticoAplicarFotoARegistro_(foto, tag, periodIndex, suma, ahoraMs): actualiza el registro de un clan en la foto (en
 * memoria) y devuelve true si algo cambió. Registro nuevo = base desconocida (null); pasar de ayer a hoy = la base de hoy es la
 * última suma de ayer; un salto de más de un día = base desconocida; un periodIndex menor al guardado (dato viejo) se ignora.
 */
function _pronosticoAplicarFotoARegistro_(foto, tag, periodIndex, suma, ahoraMs) {
  var t = _pronosticoTagNorm_(tag);
  var p = Number(periodIndex);
  if (!t || !isFinite(p)) return false;
  var r = foto[t];
  if (!r) { foto[t] = { p: p, b: null, u: suma, t: ahoraMs }; return true; }
  var pr = Number(r.p);
  if (pr === p) {
    if (Number(r.u) === suma) return false; // sin cambio: no se reescribe la propiedad
    r.u = suma; r.t = ahoraMs;
    return true;
  }
  if (pr === p - 1) { foto[t] = { p: p, b: Number(r.u) || 0, u: suma, t: ahoraMs }; return true; }
  if (pr < p) { foto[t] = { p: p, b: null, u: suma, t: ahoraMs }; return true; }
  return false;
}

/**
 * _pronosticoRegistrarFotoDia_(): guarda, por cada clan de las carreras de los clanes Terna (propios y rivales), la suma de fama
 * acumulada que acaba de traer la API. La llama capturarApiClanes_() (00_Main.gs) después de cada captura, así que corre cada
 * 5 min entre 4:00 y 4:59 a. m. Lima (cierre del día) y una vez por hora el resto del día. Solo actúa si esta ejecución pidió los
 * clanes a la API (con datos del checkpoint no hay nada nuevo que guardar). Solo guarda días de guerra o coliseo.
 * [→ Contexto_Base_Web.md §PF194]
 */
function _pronosticoRegistrarFotoDia_() {
  if (typeof _clanesBasicoDesdeApiEnEstaEjecucion !== 'undefined' && !_clanesBasicoDesdeApiEnEstaEjecucion) return;
  if (!CACHE_CLAN_DATA) return;
  var foto = _pronosticoFotoLeer_();
  var ahora = Date.now();
  var cambio = false;
  var vistos = {};
  var maxP = -1;

  for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
    var d = CACHE_CLAN_DATA[CFG.CLAN_TAGS[i]];
    var rr = d && d.riverrace;
    if (!rr) continue;
    var tipo = String(rr.periodType || '');
    if (tipo !== 'warDay' && tipo !== 'colosseum') continue;
    var pIdx = Number(rr.periodIndex);
    if (rr.periodIndex === '' || rr.periodIndex === null || rr.periodIndex === undefined || !isFinite(pIdx)) continue;
    if (pIdx > maxP) maxP = pIdx;

    var lista = [];
    if (rr.clan) lista.push(rr.clan);
    var enCarrera = rr.clans || [];
    for (var j = 0; j < enCarrera.length; j++) lista.push(enCarrera[j]);

    for (var k = 0; k < lista.length; k++) {
      var c = lista[k] || {};
      var tagN = _pronosticoTagNorm_(c.tag);
      if (!tagN || vistos[tagN]) continue;
      if (!c.participants || !c.participants.length) continue; // sin lista de participantes no hay suma que guardar
      vistos[tagN] = true;
      if (_pronosticoAplicarFotoARegistro_(foto, tagN, pIdx, _pronosticoSumaFame_(c.participants), ahora)) cambio = true;
    }
  }

  if (!cambio) return;

  // Limpieza: fuera los clanes que no se vieron en las últimas 2 semanas de periodIndex (rivales de carreras viejas).
  if (maxP >= 0) {
    Object.keys(foto).forEach(function (t) {
      if (Number((foto[t] || {}).p) < maxP - 14) delete foto[t];
    });
  }
  var texto = JSON.stringify(foto);
  if (texto.length > PRONOSTICO_FOTO_MAX_CHARS) {
    // Tope de tamaño de la propiedad: se quitan primero los registros más viejos.
    var tags = Object.keys(foto).sort(function (a, b) { return (Number(foto[a].t) || 0) - (Number(foto[b].t) || 0); });
    while (texto.length > PRONOSTICO_FOTO_MAX_CHARS && tags.length) {
      delete foto[tags.shift()];
      texto = JSON.stringify(foto);
    }
  }
  PropertiesService.getScriptProperties().setProperty(PRONOSTICO_FOTO_PROP, texto);
}

/**
 * _pronosticoBaseDesdeHoja_(participants, clanTag, ctx): respaldo SOLO para clanes propios cuando no hay foto: suma de la fama
 * de AYER (fila del periodIndex anterior de la hoja Guerra, acumulado al cierre) de las cuentas que figuran hoy en la carrera.
 * Devuelve null si la hoja no tiene filas de ayer para ese clan. Mismos criterios de lectura que _pronosticoMapaFameHoyPorTag().
 */
function _pronosticoBaseDesdeHoja_(participants, clanTag, ctx) {
  if (!ctx || !ctx.periodIndex) return null;
  var clanCache  = _getClanCache(clanTag);
  var clanNombre = (clanCache && clanCache.info && clanCache.info.name) || '';
  if (!clanNombre) return null;

  var ss = _getSs();
  var lectura = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.GUERRA, 'Backup_Guerra.csv', GUERRA_TOTAL_COLS);
  var datos = lectura.filas;
  if (!datos.length) return null;

  var pAyer = ctx.periodIndex - 1;
  var fameAyerPorTag = {};
  var hayAyer = false;
  for (var i = 0; i < datos.length; i++) {
    var fila = datos[i];
    if (String(fila[GC.CLAN - 1] || '') !== clanNombre) continue;
    if (String(fila[GC.TEMPORADA - 1] || '') !== String(ctx.temporada)) continue;
    if ((Number(fila[GC.PERIOD_IDX - 1]) || 0) !== pAyer) continue;
    var tagFila = _pronosticoTagNorm_(fila[GC.TAG - 1]);
    if (!tagFila) continue;
    fameAyerPorTag[tagFila] = Number(fila[GC.FAME - 1]) || 0;
    hayAyer = true;
  }
  if (!hayAyer) return null;

  var base = 0;
  var lista = participants || [];
  for (var j = 0; j < lista.length; j++) {
    base += fameAyerPorTag[_pronosticoTagNorm_((lista[j] || {}).tag)] || 0;
  }
  return base;
}

/**
 * _pronosticoAgregarDiario_(calc, base, origen): agrega a `calc` los campos de HOY a partir de la base del día. Con base null los
 * campos diarios quedan en null (la web muestra «—»; nunca se mezcla un acumulado con un diario). fameTecho*Hoy nunca baja de fameHoy.
 */
function _pronosticoAgregarDiario_(calc, base, origen) {
  if (base === null || base === undefined || !isFinite(Number(base))) {
    calc.fameBase = null;
    calc.fameHoy = null;
    calc.fameTechoRosterHoy = null;
    calc.fameTechoHoy = null;
    calc.baseOrigen = '';
    return calc;
  }
  var b = Number(base);
  calc.fameBase = b;
  calc.fameHoy = Math.max(0, calc.fameActual - b);
  calc.fameTechoRosterHoy = Math.max(calc.fameHoy, calc.fameTechoRoster - b);
  calc.fameTechoHoy = Math.max(calc.fameHoy, calc.fameTecho - b);
  calc.baseOrigen = origen || '';
  return calc;
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
  // PF194: foto de la fama al empezar el día (se lee una sola vez; la escribe _pronosticoRegistrarFotoDia_() en cada captura).
  var fotoDia = _pronosticoFotoLeer_();

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
      // PF194: fama de HOY. Primero la foto del día; sin foto, la hoja Guerra (fama de ayer); sin ninguna, queda en null.
      var periodoPropio = Number(rr.periodIndex);
      if (!isFinite(periodoPropio) || rr.periodIndex === '' || rr.periodIndex === null || rr.periodIndex === undefined) periodoPropio = ctx.periodIndex;
      // PF198: primero los periodLogs de la carrera (valen también para rivales y no dependen de la foto).
      var basePropio = _pronosticoBaseDeLogs_(rr, clanTag, periodoPropio);
      var origenPropio = 'logs';
      if (basePropio === null) { basePropio = _pronosticoBaseDeFoto_(fotoDia, clanTag, periodoPropio); origenPropio = 'foto'; }
      if (basePropio === null) {
        try { basePropio = _pronosticoBaseDesdeHoja_(propios, clanTag, ctx); }
        catch (eHoja) { Logger.log('[Pronóstico] Base desde la hoja Guerra falló para ' + clanTag + ': ' + eHoja.message); basePropio = null; }
        origenPropio = 'hoja';
      }
      _pronosticoAgregarDiario_(calcPropio, basePropio, origenPropio);
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
      // PF194: los rivales no están en la hoja Guerra; su base sale solo de la foto (null hasta que haya foto de ayer).
      var periodoRival = Number(rr.periodIndex);
      if (!isFinite(periodoRival) || rr.periodIndex === '' || rr.periodIndex === null || rr.periodIndex === undefined) periodoRival = ctx.periodIndex;
      // PF198: base desde los periodLogs; sin ellos, la foto.
      var baseRival = _pronosticoBaseDeLogs_(rr, rivalTag, periodoRival);
      var origenRival = 'logs';
      if (baseRival === null) { baseRival = _pronosticoBaseDeFoto_(fotoDia, rivalTag, periodoRival); origenRival = 'foto'; }
      _pronosticoAgregarDiario_(calcRival, baseRival, origenRival);
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
  // PF194: con fama de hoy conocida manda el techo de HOY; los que no la tienen (rivales sin foto todavía) van al final, entre
  // ellos por el techo acumulado de siempre.
  salida.sort(function (a, b) {
    var ha = (a.fameTechoHoy === null || a.fameTechoHoy === undefined) ? null : a.fameTechoHoy;
    var hb = (b.fameTechoHoy === null || b.fameTechoHoy === undefined) ? null : b.fameTechoHoy;
    if (ha !== null && hb !== null) return hb - ha;
    if (ha !== null) return -1;
    if (hb !== null) return 1;
    return b.fameTecho - a.fameTecho;
  });
  return { ok: true, clanes: salida };
}

var PRONOSTICO_WEB_CACHE_KEY     = 'web_pronostico_guerra_v6'; // v6 (PF194): agrega fameBase/fameHoy/fameTechoRosterHoy/fameTechoHoy/baseOrigen (fama del día; null si no se conoce la base); v2: agrega puesto/clanesEnCarrera; v3: agrega clanTernaTag/clanTernaNombre a los rivales; v4: fameTechoRoster ya respeta los topes de 200 ataques / 50 cuentas; v5 (Tanda 14): agrega coliseo/estimado al clan propio
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