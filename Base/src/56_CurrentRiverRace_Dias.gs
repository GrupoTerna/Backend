// 56_CurrentRiverRace_Dias.gs
// Ataques y fame por día de cada jugador, leídos de las capturas de CurrentRiverRace guardadas en Drive
// (21-oct-2026; Contexto_Base_Web.md §PF139, regla 1: «lo más confiable son los CurrentRiverRace»).
//
// Este archivo solo LEE y calcula; no escribe en ninguna hoja ni CSV.
// Tanda 1 (21-oct-2026): módulo nuevo. Tanda 2 (21-oct-2026): _repartirSemanaConjunto_() (18_CorreccionGuerra.gs) ya usa
// _crrDiasDeJugador_() como restricción. Tanda 3 (21-oct-2026): la corrección al cerrar el día (17_GuerraSheet.gs,
// _autocorregirAtaqueDiaAnteriorDecksUsed) usa _crrAyerParaCierre_(). Tanda 4 (21-oct-2026): AplicarTotalesSemana_Historial se rehizo en 57_ReconstruirSemanaPorDias.gs, que usa _crrDiasDeJugador_() y _crrFameDia_();
// _crrDomingoParaTotales_() (abajo) solo la usa tot_ejecutar_() de 48_Herramientas_Debug.gs, que ya no se llama.
//
// Qué trae cada captura (un archivo por clan, semana y día, que se va sobrescribiendo: queda la ÚLTIMA captura de ese día):
//   decksUsed = ataques acumulados de la semana; decksUsedToday = ataques de ese día; fame = fame acumulada de la semana.
//   La fame NO trae «de hoy».
// Método (el mismo del cruce de solo lectura del 20-oct-2026, que dio 80 casos resueltos, 62 con la fame ambigua y 107 sin captura):
//   - Ataques acumulados al INICIO de un día = decksUsed - decksUsedToday de cualquier captura de ese día.
//   - Ataques del día d = inicio del día d+1 - inicio del día d. El domingo = total semanal - inicio del domingo.
//   - Si en un día hay una captura con 4 ataques, el día quedó completo: el inicio del día siguiente es inicio + 4.
//   - Fame acumulada al cierre del día d: la captura de ese día con 4 ataques, o la captura del día siguiente si trae
//     decksUsedToday = 0. Si no hay ninguna de las dos, el día queda en null (no se estima aquí).
//   - Fame del domingo: el total semanal que pasa quien llama.
// Con la tabla de fame (_fameTablaDia_) quien llama completa los días en null.

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - CurrentRiverRace por días: prueba de solo lectura
//    - Capturas continuas de currentriverrace (§PF426): estado y reinicio
//  Parte 2 — Funciones que no se corren a mano
//    - CurrentRiverRace por días: capturas de Drive y días del jugador
//    - CurrentRiverRace por días: usos de otras cadenas (cierre y totales)
//    - Capturas continuas de currentriverrace (§PF426): la captura y su carpeta
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var CRR_DIAS_LETRAS = 'JVSD';   // desplazamiento 0..3 = jueves a domingo (PeriodIndex % 7 - 3)

var _CRR_DESCARTAR_CLAN_VACIO_ = false;   // §PF183: true en el informe y en Aplicar de totales por días (57; desde el 3-nov-2026); descarta las capturas de un clan con la fame menor que la del día anterior (_crrArchivosSinClanVacio_)
var _CRR_CACHE_SEMANA_ = {};
var _CRR_CACHE_CIERRES_ = {};

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- CurrentRiverRace por días: prueba de solo lectura -----

/**
 * Prueba manual SOLO LECTURA: lee T3 S1 desde Drive y revisa a Chistris (#2GG8PJ8GC), cuyo valor real ya se comprobó a mano:
 * ataques 4|4|4|4 y fame por día 600|800|800|700 (total semanal 16 ataques y 2900 de fame). No escribe nada.
 */
function probarCurrentRiverRaceDias() {
  var mapa = _crrCapturasDeSemana_(3, 1);
  var tags = Object.keys(mapa);
  var r = _crrDiasDeJugador_(3, 1, '#2GG8PJ8GC', 16, 2900);
  var ata = r.ataques.join('|'), fame = _crrFameDia_(r.fameAcum).join('|');
  var ok = ata === '4|4|4|4' && fame === '600|800|800|700';
  Logger.log('[CRR] T3 S1: ' + tags.length + ' jugador(es) con capturas. Chistris: ataques ' + ata + ', fame ' + fame + ' -> ' +
    (ok ? 'OK (coincide con lo comprobado a mano).' : 'DIFIERE de lo esperado (4|4|4|4 y 600|800|800|700).') + ' (No se escribio nada.)');
}

// ----- Capturas continuas de currentriverrace (§PF426): estado y reinicio -----

/**
 * estadoCapturaContinuaCRR() [→ Contexto_Base_Web.md §PF426]
 * Manual, solo lectura: muestra en el registro cuántos días llevan captura, la última captura y cuántos archivos hay en la carpeta. No escribe nada.
 */
function estadoCapturaContinuaCRR() {
  var props = PropertiesService.getScriptProperties();
  var dias = (props.getProperty('CAPTURA_CONTINUA_DIAS') || '').split(',').filter(Boolean);
  var ult = Number(props.getProperty('CAPTURA_CONTINUA_ULTIMA_MS')) || 0;
  var nArchivos = 0;
  try {
    var it = _carpetaCapturasContinuasCRR_().getFiles();
    while (it.hasNext()) { it.next(); nArchivos++; }
  } catch (e) { Logger.log('[CapturaContinua] No se pudo contar los archivos: ' + e.message); }
  Logger.log('[CapturaContinua] Activa: ' + !!CFG.CAPTURA_CONTINUA_ACTIVA + '. Días con captura: ' + dias.length + ' de ' + CFG.CAPTURA_CONTINUA_DIAS_MAX +
    (dias.length ? ' (' + dias.join(', ') + ')' : '') + '. Última captura: ' + (ult ? Utilities.formatDate(new Date(ult), 'America/Lima', 'yyyy-MM-dd HH:mm:ss') + ' (Lima)' : 'ninguna') +
    '. Archivos en ' + CFG.CAPTURA_CONTINUA_CARPETA + ': ' + nArchivos + '. Horario: 04:45 a 07:00 Lima, clanes ' + CFG.CAPTURA_CONTINUA_TAGS.join(', ') + '.');
}

/**
 * reiniciarCapturaContinuaCRR() [→ Contexto_Base_Web.md §PF426]
 * Manual: pone a cero el conteo de días (la captura se detiene sola tras CFG.CAPTURA_CONTINUA_DIAS_MAX días distintos) para que vuelva a capturar. No borra ningún archivo.
 */
function reiniciarCapturaContinuaCRR() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('CAPTURA_CONTINUA_DIAS');
  props.deleteProperty('CAPTURA_CONTINUA_ULTIMA_MS');
  Logger.log('[CapturaContinua] Conteo reiniciado: vuelve a capturar desde la próxima ventana (04:45 a 07:00 Lima). Los archivos ya guardados no se tocaron.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- CurrentRiverRace por días: capturas de Drive y días del jugador -----

/**
 * Punto de entrada para las demás funciones: ataques y fame por día de UN jugador en una semana, según CurrentRiverRace.
 * totA y totF = totales de la semana (null si no se conocen). Devuelve { ataques, fameAcum, inicio, notas, anomalias, hayCapturas } (ver _crrResolverJugador_: las
 * anomalias son fallos conocidos del JSON, §PF319, que NO invalidan la semana; las notas sí).
 * clanTag (opcional, §PF183): si se pasa, solo se usan las capturas de ese clan; sin él se juntan las de todos los clanes Terna, como siempre.
 */
function _crrDiasDeJugador_(temporada, semana, tag, totA, totF, clanTag) {
  var caps = _crrCapturasDeSemana_(temporada, semana)[String(tag || '').trim()];
  if (clanTag) caps = _crrCapturasDeClan_(caps, clanTag);   // §PF183: solo las capturas del clan de la serie (un jugador en dos clanes trae capturas de los dos)
  var r = _crrResolverJugador_(caps || null, totA, totF);
  r.hayCapturas = !!caps;
  return r;
}

/**
 * Lee los JSON de CurrentRiverRace de una semana en los clanes Terna (CurrentRiverRace/<clan>/T-xx/S-xx) y devuelve
 * { tag: { J: [captura], ... } } (ver _crrCapturasDesdeArchivos_). Se guarda en memoria por ejecución. Solo lee.
 * Solo mira la carpeta de la semana: un archivo que siga suelto en la carpeta del clan (sin mover) no se lee.
 */
function _crrCapturasDeSemana_(temporada, semana) {
  var clave = Number(temporada) + '|' + Number(semana);
  if (!_CRR_CACHE_SEMANA_[clave]) _crrLeerSemana_(temporada, semana);
  return _CRR_CACHE_SEMANA_[clave];
}

/**
 * Lee la semana de Drive UNA vez y guarda solo lo pequeño: las capturas por jugador (_CRR_CACHE_SEMANA_) y los clanes que ya habían cruzado la meta (_CRR_CACHE_CIERRES_).
 * Los JSON completos NO se guardan en memoria (una caché de ellos, probada el 2-nov-2026, agotó el tiempo del informe de totales por días: son miles de archivos).
 */
function _crrLeerSemana_(temporada, semana) {
  var clave = Number(temporada) + '|' + Number(semana);
  var archivos = _crrArchivosDeSemana_(temporada, semana);
  var paraCapturas = archivos;
  if (_CRR_DESCARTAR_CLAN_VACIO_) {   // §PF183 (2-nov-2026; informe y Aplicar desde el 3-nov-2026): las capturas de un clan que vino vacío no valen; el cierre de carrera sigue usando todos los archivos.
    var limpio = _crrArchivosSinClanVacio_(archivos);
    paraCapturas = limpio.validos;
    if (limpio.descartados.length) Logger.log('[CRR] AVISO T' + temporada + ' S' + semana + ': se descartaron ' + limpio.descartados.length + ' captura(s) de clan con la fame menor que la del dia anterior (clan vacio): ' + limpio.descartados.join(' | '));
  }
  _CRR_CACHE_SEMANA_[clave] = _crrCapturasDesdeArchivos_(paraCapturas);
  _CRR_CACHE_CIERRES_[clave] = _crrCierresDesdeArchivos_(archivos);
}

/**
 * Lee de Drive los JSON de CurrentRiverRace de una semana en los clanes Terna y devuelve [{ nombre, datos }]. NO se guarda en memoria (ver _crrLeerSemana_). Solo lee.
 * (Separada de _crrCapturasDeSemana_ el 2-nov-2026 para que el cierre de carrera, §PF183, use los mismos archivos sin leerlos dos veces.)
 */
function _crrArchivosDeSemana_(temporada, semana) {
  var archivos = [];
  var nT = 'T-' + _pad2_(temporada), nS = 'S-' + _pad2_(semana);
  Object.keys(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_).forEach(function (k) {
    try {
      var carpetaClan = DriveApp.getFolderById(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_[k]);
      var cT = _crrSubcarpeta_(carpetaClan, nT);
      var cS = cT ? _crrSubcarpeta_(cT, nS) : null;
      if (!cS) return;
      var it = cS.getFiles();
      while (it.hasNext()) {
        var f = it.next();
        var nombre = f.getName();
        if (!_crrParsearNombre_(nombre)) continue;
        try { archivos.push({ nombre: nombre, datos: JSON.parse(f.getBlob().getDataAsString()) }); }
        catch (eJson) { Logger.log('[CRR] No se pudo leer ' + nombre + ': ' + eJson.message); }
      }
    } catch (eClan) {
      Logger.log('[CRR] No se pudo leer la carpeta de ' + k + ' (' + nT + ' ' + nS + '): ' + eClan.message);
    }
  });
  return archivos;
}

function _crrSubcarpeta_(padre, nombre) {
  var it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : null;
}

/**
 * archivos = [{ nombre, datos }] con datos = JSON de /currentriverrace ya convertido en objeto.
 * Devuelve { tag: { J: [captura, ...], V: [...], S: [...], D: [...] } } con captura = { fame, usados, hoy, clan } (clan = tag del clan del archivo, en mayúsculas).
 * Un jugador puede tener dos capturas el mismo día si estuvo en dos clanes.
 */
function _crrCapturasDesdeArchivos_(archivos) {
  var porTag = {};
  (archivos || []).forEach(function (a) {
    var p = _crrParsearNombre_(a && a.nombre);
    var part = a && a.datos && a.datos.clan && a.datos.clan.participants;
    if (!p || !part) return;
    var clanTag = String(a.datos.clan.tag || '').trim().toUpperCase();
    part.forEach(function (j) {
      var tag = String((j && j.tag) || '').trim();
      if (!tag) return;
      if (!porTag[tag]) porTag[tag] = {};
      if (!porTag[tag][p.letra]) porTag[tag][p.letra] = [];
      porTag[tag][p.letra].push({ fame: Number(j.fame) || 0, usados: Number(j.decksUsed) || 0, hoy: Number(j.decksUsedToday) || 0, clan: clanTag });
    });
  });
  return porTag;
}

/**
 * Función pura (§PF183, 2-nov-2026). De las capturas de UN jugador ({ J: [captura], ... }) deja solo las de un clan. Devuelve null si ese clan no tiene ninguna.
 * Sin clanTag devuelve las capturas tal cual. Un jugador que estuvo en dos clanes la misma semana trae capturas de los dos: juntarlas hacía que _crrResolverJugador_
 * viera inicios del día incoherentes y la semana quedara sin CurrentRiverRace.
 */
function _crrCapturasDeClan_(porDia, clanTag) {
  var tag = String(clanTag || '').trim().toUpperCase();
  if (!porDia || !tag) return porDia || null;
  var out = {}, hay = false;
  Object.keys(porDia).forEach(function (letra) {
    var lista = (porDia[letra] || []).filter(function (x) { return x.clan === tag; });
    if (lista.length) { out[letra] = lista; hay = true; }
  });
  return hay ? out : null;
}

/**
 * Función pura (§PF183, 2-nov-2026). archivos = [{ nombre, datos }]. Quita las capturas de un clan que vinieron vacías: dentro de una semana la fame del clan solo sube, así que un archivo
 * cuyo clan.fame es MENOR que el del archivo anterior del mismo clan (ordenados por periodIndex) no es una captura válida. Caso real: T24 S5, el domingo de GrupoXTerna™3, Mini乂Ternas™ y
 * NARANJA x vino con todo el clan en 0 y dejaba el sábado con ataques negativos (solo esos 3 archivos de los 602 del repo). Devuelve { validos, descartados: [nombre] }; los archivos sin clan
 * o con un nombre que no se entiende se dejan pasar.
 */
function _crrArchivosSinClanVacio_(archivos) {
  var porClan = {}, malos = [];
  (archivos || []).forEach(function (a) {
    var p = _crrParsearNombre_(a && a.nombre);
    var c = a && a.datos && a.datos.clan;
    if (!p || !c || !c.tag) return;
    var tag = String(c.tag).trim().toUpperCase();
    if (!porClan[tag]) porClan[tag] = [];
    porClan[tag].push({ a: a, pi: (a.datos.periodIndex !== undefined && a.datos.periodIndex !== null) ? Number(a.datos.periodIndex) : p.periodIndex, fame: Number(c.fame) || 0 });
  });
  Object.keys(porClan).forEach(function (tag) {
    var lista = porClan[tag].sort(function (x, y) { return x.pi - y.pi; }), prev = -1;
    lista.forEach(function (x) { if (x.fame < prev) malos.push(x.a); else prev = x.fame; });
  });
  return {
    validos: (archivos || []).filter(function (a) { return malos.indexOf(a) < 0; }),
    descartados: malos.map(function (a) { return a.nombre; })
  };
}

/**
 * Cierre de carrera por clan (§PF183, regla de la usuaria del 2-nov-2026). Función pura.
 * archivos = [{ nombre, datos }]. Devuelve { '#CLAN': { finishTime, nombre } } con los clanes que YA HABÍAN CRUZADO la meta antes del domingo:
 * la captura del domingo (D) trae clan.finishTime Y periodLogs dice que el clan terminó el sábado (periodIndex - 1) con progressEndOfDay >= META_GUERRA_PROGRESO.
 * En los 10 cruces observados el cruce fue el sábado (§PF183 actualización 8). Un cruce a mitad de otro día NO se reconoce aquí (queda sin regla hasta tener los JSON del cruce, §PF185).
 */
function _crrCierresDesdeArchivos_(archivos) {
  var out = {};
  (archivos || []).forEach(function (a) {
    var p = _crrParsearNombre_(a && a.nombre);
    var d = a && a.datos;
    if (!p || p.letra !== 'D' || !d || !d.clan || !d.clan.finishTime) return;
    var tag = String(d.clan.tag || '').trim().toUpperCase();
    if (!tag) return;
    var idxSabado = (d.periodIndex !== undefined && d.periodIndex !== null) ? Number(d.periodIndex) - 1 : p.periodIndex - 1;
    var logs = d.periodLogs || [];
    for (var l = 0; l < logs.length; l++) {
      if (Number(logs[l].periodIndex) !== idxSabado) continue;
      var items = logs[l].items || [];
      for (var k = 0; k < items.length; k++) {
        if (!items[k] || !items[k].clan || String(items[k].clan.tag || '').trim().toUpperCase() !== tag) continue;
        if (Number(items[k].progressEndOfDay) >= META_GUERRA_PROGRESO) out[tag] = { finishTime: String(d.clan.finishTime), nombre: a.nombre };
      }
    }
  });
  return out;
}

/** Clanes que ya habían cruzado la meta antes del domingo en una semana ({ '#CLAN': { finishTime, nombre } }; ver _crrCierresDesdeArchivos_). Solo lee Drive; se guarda por ejecución. */
function _crrCierresDeSemana_(temporada, semana) {
  var clave = Number(temporada) + '|' + Number(semana);
  if (!_CRR_CACHE_CIERRES_[clave]) _crrLeerSemana_(temporada, semana);
  return _CRR_CACHE_CIERRES_[clave];
}

/**
 * ¿Los ataques del domingo en ESTE clan no dan fame? true solo si el clan ya había cruzado la meta antes del domingo (_crrCierresDeSemana_). Regla de la usuaria (2-nov-2026): afecta
 * únicamente a los ataques hechos en el clan que cruzó; los que el mismo jugador hace el domingo en otro clan Terna que no cruzó siguen dando fame (se resuelve por clan).
 * clanTag = tag del clan de la serie. Sin captura que lo pruebe devuelve false: no se relaja nada.
 */
function _crrDomingoSinFame_(temporada, semana, clanTag) {
  var tag = String(clanTag || '').trim().toUpperCase();
  if (!tag) return false;
  try { return !!_crrCierresDeSemana_(temporada, semana)[tag]; }
  catch (e) { Logger.log('[CRR] No se pudo leer el cierre de ' + clanTag + ': ' + e.message); return false; }
}

/** Nombre del archivo -> { temporada, semana, periodIndex, letra, off } o null. Ej.: 'T-03  S-02 P.I-11-V 17-07-2026 11.35 - Clan - currentriverrace.json'. Los días de entrenamiento (L, M, X) devuelven null. */
function _crrParsearNombre_(nombre) {
  var m = /^T-(\d+)\s+S-(\d+) P\.I-(\d+)-([LMXJVSD]) /.exec(String(nombre || ''));
  if (!m) return null;
  var off = CRR_DIAS_LETRAS.indexOf(m[4]);
  if (off < 0) return null;
  return { temporada: Number(m[1]), semana: Number(m[2]), periodIndex: Number(m[3]), letra: m[4], off: off };
}

/**
 * Función pura. Clasifica una captura { fame, usados, hoy } del día d (0..3, jueves a domingo) según los fallos conocidos del JSON que ya trata el módulo 59
 * (59_Verificar_CRR_vs_Backup.gs, _vcrrRestriccionesSerie_; Contexto_Base_Web.md §PF319 puntos 1 a 3 y 7). Devuelve:
 *  - 'normal': decksUsedToday es fiable, así que usados - hoy es el inicio del día.
 *  - 'domingo_sin_hoy': domingo con decksUsedToday 0 y más de 12 ataques (hasta 16). El 0 es un fallo: esa captura es solo el acumulado al cierre de la semana.
 *    Un domingo con 12 ataques o menos y hoy 0 es legítimo (el jugador no atacó ese día) y sigue siendo 'normal'.
 *  - 'hoy_excedido': decksUsedToday mayor que 4, pero posible con los acumulados (hoy <= usados y usados <= 4 por los días hasta ese). La cifra del día no es fiable.
 *  - 'hoy_imposible': decksUsedToday mayor que 4 y no cabe: no restringe nada.
 * Los barcos no se leen en este módulo, así que no entran en la comprobación (el módulo 59 sí los comprueba).
 */
function _crrClasificarCaptura_(x, d) {
  if (!x) return 'normal';
  if (x.hoy > 4) return (x.hoy <= x.usados && x.usados <= 4 * (d + 1)) ? 'hoy_excedido' : 'hoy_imposible';
  if (d === 3 && x.hoy === 0 && x.usados > 12 && x.usados <= 16) return 'domingo_sin_hoy';
  return 'normal';
}

/**
 * porDia = { J: [captura], V: [...], S: [...], D: [...] } de UN jugador (o null/{} si no hay capturas).
 * totA / totF = ataques y fame de toda la semana (null si no se conocen; si no se pasan y hay una captura D 'domingo_sin_hoy', el total es el de esa captura).
 * Devuelve { ataques: [J,V,S,D], fameAcum: [J,V,S,D], inicio: [J,V,S,D], notas: [], anomalias: [] }; null = «sin dato».
 * notas = capturas que se contradicen entre sí (quien llama no usa la semana). anomalias = capturas con un fallo conocido del JSON (_crrClasificarCaptura_): no fijan el inicio del
 * día ni cuentan como cierre del día anterior, pero NO invalidan la semana. Si la captura de un día trae decksUsedToday mayor que 4 y los acumulados lo admiten, ese día se toma
 * como de 4 ataques (decisión de la usuaria, 1-nov-2026, §PF319 punto 7); si no cabe, el día queda sin dato.
 */
function _crrResolverJugador_(porDia, totA, totF) {
  var c = porDia || {};
  var L = CRR_DIAS_LETRAS;
  var inicio = [undefined, undefined, undefined, undefined];   // undefined = no hay captura; null = capturas que no se ponen de acuerdo
  var notas = [], anomalias = [], domingoFinal = null;
  var i, j;
  for (i = 0; i < 4; i++) {
    var lista = c[L.charAt(i)] || [];
    var vistos = {}, n = 0, v = null;
    for (j = 0; j < lista.length; j++) {
      var clase = _crrClasificarCaptura_(lista[j], i);
      if (clase !== 'normal') {
        if (clase === 'domingo_sin_hoy') {
          anomalias.push('captura D con decksUsedToday 0 y ' + lista[j].usados + ' ataques: anómala, se usa solo como acumulado al cierre');
          if (domingoFinal === null || lista[j].usados > domingoFinal.usados) domingoFinal = lista[j];
        } else if (clase === 'hoy_excedido') anomalias.push('captura ' + L.charAt(i) + ' con decksUsedToday ' + lista[j].hoy + ': anómala, no fija el inicio del día');
        else anomalias.push('captura ' + L.charAt(i) + ' con decksUsedToday ' + lista[j].hoy + ' imposible con ' + lista[j].usados + ' ataques: se descarta');
        continue;
      }
      var s = lista[j].usados - lista[j].hoy;
      if (!vistos[s]) { vistos[s] = true; n++; v = s; }
    }
    if (n > 1) { notas.push('inicio ' + L.charAt(i) + ' incoherente'); inicio[i] = null; }
    else if (n === 1) inicio[i] = v;
  }
  for (i = 0; i < 3; i++) {
    var lista2 = c[L.charAt(i)] || [];
    var completo = lista2.some(function (x) { return x.hoy === 4; });
    if ((inicio[i + 1] === undefined || inicio[i + 1] === null) && inicio[i] !== undefined && inicio[i] !== null && completo) inicio[i + 1] = inicio[i] + 4;
  }
  // decksUsedToday mayor que 4 (§PF319 punto 7): el día se toma como de 4 ataques solo si hay un inicio del día siguiente conocido y los acumulados lo admiten. De atrás hacia adelante para encadenar.
  for (i = 2; i >= 1; i--) {
    var excedidas = (c[L.charAt(i)] || []).filter(function (x) { return _crrClasificarCaptura_(x, i) === 'hoy_excedido'; });
    if (!excedidas.length || inicio[i] !== undefined || typeof inicio[i + 1] !== 'number') continue;
    var iniForzado = inicio[i + 1] - 4, piso = 0;
    excedidas.forEach(function (x) { if (x.usados > piso) piso = x.usados; });
    if (iniForzado < 0 || iniForzado > 4 * i || piso > inicio[i + 1]) { anomalias.push('los acumulados no admiten 4 ataques el ' + L.charAt(i) + ': no se fuerza'); continue; }
    inicio[i] = iniForzado;
    anomalias.push('el ' + L.charAt(i) + ' se toma como de 4 ataques: los acumulados lo admiten');
  }
  if (inicio[0] === undefined) inicio[0] = ((c.J && c.J.length) || (c.V && c.V.length)) ? 0 : null;

  var ataques = [null, null, null, null];
  for (i = 0; i < 3; i++) {
    var a0 = inicio[i], a1 = inicio[i + 1];
    ataques[i] = (a0 !== undefined && a0 !== null && a1 !== undefined && a1 !== null) ? a1 - a0 : null;
  }
  var totAUsado = (totA !== null && totA !== undefined) ? totA : (domingoFinal ? domingoFinal.usados : null);
  ataques[3] = (totAUsado !== null && inicio[3] !== undefined && inicio[3] !== null) ? totAUsado - inicio[3] : null;

  var fameAcum = [null, null, null, null];
  for (i = 0; i < 3; i++) {
    var v2 = null;
    (c[L.charAt(i)] || []).forEach(function (x) { if (x.hoy === 4) v2 = x.fame; });
    // hoy 0 = aún no había ataques ese día, así que su fame es el cierre del día anterior; una captura anómala (hoy 0 por fallo del JSON) no vale como cierre del día anterior.
    if (v2 === null) (c[L.charAt(i + 1)] || []).forEach(function (x) { if (x.hoy === 0 && _crrClasificarCaptura_(x, i + 1) === 'normal') v2 = x.fame; });
    fameAcum[i] = v2;
  }
  if (totF !== null && totF !== undefined) fameAcum[3] = totF;
  else if (domingoFinal) fameAcum[3] = domingoFinal.fame;

  return { ataques: ataques, fameAcum: fameAcum, inicio: inicio.map(function (x) { return x === undefined ? null : x; }), notas: notas, anomalias: anomalias };
}

/** fameAcum [J,V,S,D] (null = sin dato) -> fame por día; un día queda en null si falta su acumulado o el del día anterior. */
function _crrFameDia_(fameAcum) {
  var out = [], prev = 0;
  for (var i = 0; i < 4; i++) {
    if (fameAcum[i] === null || fameAcum[i] === undefined) { out.push(null); prev = null; continue; }
    out.push(prev === null ? null : fameAcum[i] - prev);
    prev = fameAcum[i];
  }
  return out;
}

// ----- CurrentRiverRace por días: usos de otras cadenas (cierre y totales) -----

/**
 * Para la corrección al cerrar el día (17_GuerraSheet.gs, §PF139): ataques de AYER y fame acumulada al cierre de ayer de un jugador, según
 * CurrentRiverRace. ctx = el contexto del clan (temporada propia y sectionIndex); offAyer = 0..2 (jueves a sábado). No se pasan totales
 * semanales (no se conocen aquí), así que el domingo nunca se resuelve por esta vía. Devuelve { ataquesAyer, fameAcumAyer } (null = sin dato)
 * o null si no hay capturas, si estas se contradicen o si falla la lectura de Drive. Solo lee.
 * §PF301: si quien llama pasa clanNombre (el nombre del clan como figura en la hoja), PRIMERO se usan los rangos de los JSON de ese clan
 * (_vcrrRangosJugadorClan_, 59_Verificar_CRR_vs_Backup.gs): los ataques de ayer y la fame acumulada al cierre de ayer valen cuando su piso y su máximo
 * coinciden (el máximo ya descuenta la merma y el tope de la tabla de fame). Si por ahí no sale nada, se sigue con el cálculo de siempre.
 */
function _crrAyerParaCierre_(tag, ctx, offAyer, clanNombre) {
  try {
    if (!(offAyer >= 0 && offAyer <= 2)) return null;
    var temp = Number(ctx && ctx.temporada), sem = Number(ctx && ctx.sectionIndex) + 1;
    if (!(temp > 0) || !(sem > 0)) return null;
    if (clanNombre && typeof _vcrrRangosJugadorClan_ === 'function') {
      var serie = _vcrrRangosJugadorClan_(temp, sem, tag, clanNombre);
      // Un jugador en dos clanes la misma semana: lo que muestra un clan no es todo lo que hizo ese día; se sigue con el cálculo de siempre.
      if (serie && serie.validos && serie.estado !== 'multiclan') {
        var rr = serie.r, ataquesR = null, fameR = null;
        if (serie.validos.indexOf('A') >= 0 && rr.A.il[offAyer] === rr.A.ih[offAyer]) ataquesR = rr.A.il[offAyer];
        if (serie.validos.indexOf('F') >= 0 && rr.F.lo[offAyer] === rr.F.hi[offAyer]) fameR = rr.F.lo[offAyer];
        if (ataquesR !== null || fameR !== null) return { ataquesAyer: ataquesR, fameAcumAyer: fameR };
      }
    }
    var r = _crrDiasDeJugador_(temp, sem, tag, null, null);
    if (!r.hayCapturas || (r.notas && r.notas.length)) return null;
    var a = r.ataques[offAyer], f = r.fameAcum[offAyer];
    return { ataquesAyer: (a === undefined ? null : a), fameAcumAyer: (f === undefined ? null : f) };
  } catch (e) {
    Logger.log('[CRR] No se pudo consultar CurrentRiverRace para cerrar el dia (' + tag + '): ' + e.message);
    return null;
  }
}

/**
 * Aviso del cierre del día (§PF328, pedido de la usuaria el 1-nov-2026): compara lo que trae la API al cierre de ayer con los rangos de los JSON de CurrentRiverRace
 * de ese jugador y clan (_vcrrRangosJugadorClan_, 59_Verificar_CRR_vs_Backup.gs). Solo avisa: no cambia lo que se escribe ni lo que se deja pendiente.
 * api = { ataquesAcum, ataquesDia, fameAcum, barcosAcum } (null o undefined = la API no trae ese dato al cierre de ayer). Se comparan los ataques acumulados y los del día
 * contra el piso y el máximo de los JSON, y la fame y los barcos acumulados cuando la API los trae. Solo se miran las métricas que la serie puede usar (serie.validos).
 * Un jugador en dos clanes la misma semana no se compara (lo que muestra un clan no es todo lo que hizo). Devuelve '' si todo cabe, si no hay JSON de la semana o si falla
 * la lectura; si no, el texto de qué valores quedan fuera y de qué rango.
 */
function _crrAvisoFueraDeRangosCierre_(tag, ctx, offAyer, clanNombre, api) {
  try {
    if (!clanNombre || !api || !(offAyer >= 0 && offAyer <= 2) || typeof _vcrrRangosJugadorClan_ !== 'function') return '';
    var temp = Number(ctx && ctx.temporada), sem = Number(ctx && ctx.sectionIndex) + 1;
    if (!(temp > 0) || !(sem > 0)) return '';
    var serie = _vcrrRangosJugadorClan_(temp, sem, tag, clanNombre);
    if (!serie || !serie.validos || !serie.r || serie.estado === 'multiclan') return '';
    var fuera = [];
    function revisar(letra, nombre, valor, campoLo, campoHi) {
      if (serie.validos.indexOf(letra) < 0 || typeof valor !== 'number' || isNaN(valor)) return;
      var lo = serie.r[letra][campoLo][offAyer], hi = serie.r[letra][campoHi][offAyer];
      if (valor < lo || valor > hi) fuera.push(nombre + ' ' + valor + ' (los JSON permiten de ' + lo + ' a ' + (hi === Infinity ? 'sin tope' : hi) + ')');
    }
    revisar('A', 'ataques acumulados', api.ataquesAcum, 'lo', 'hi');
    revisar('A', 'ataques de ayer', api.ataquesDia, 'il', 'ih');
    revisar('F', 'fame acumulada', api.fameAcum, 'lo', 'hi');
    revisar('B', 'barcos acumulados', api.barcosAcum, 'lo', 'hi');
    return fuera.join('; ');
  } catch (e) {
    Logger.log('[CRR] No se pudo comparar el cierre del dia con los rangos (' + tag + '): ' + e.message);
    return '';
  }
}

/**
 * Para AplicarTotalesSemana_Historial (48_Herramientas_Debug.gs, §PF139): comprueba unos totales semanales (ataques y fame) contra CurrentRiverRace.
 * Devuelve null si no hay capturas, si se contradicen o si no hay ningun dato del domingo; si no, { ataquesDomingo, fameDomingo, conflicto }, con
 * conflicto = '' si todo es posible o el motivo si algun dia saldria imposible con esos totales (ataques de un dia fuera de 0 a 4, o fame de un dia
 * fuera de 0 a 900, ver _fameEsPosibleDia_()). Solo lee; no escribe nada.
 */
function _crrDomingoParaTotales_(temporada, semana, tag, totA, totF) {
  try {
    var r = _crrDiasDeJugador_(temporada, semana, tag, totA, totF);
    if (!r.hayCapturas || (r.notas && r.notas.length)) return null;
    var fd = _crrFameDia_(r.fameAcum);
    var out = { ataquesDomingo: r.ataques[3], fameDomingo: fd[3], conflicto: '' };
    if (out.ataquesDomingo === null && out.fameDomingo === null) return null;
    var nombres = ['jueves', 'viernes', 'sabado', 'domingo'];
    for (var i = 0; i < 4 && !out.conflicto; i++) {
      if (r.ataques[i] !== null && (r.ataques[i] < 0 || r.ataques[i] > 4)) out.conflicto = 'CurrentRiverRace: ' + r.ataques[i] + ' ataque(s) el ' + nombres[i];
      else if (fd[i] !== null && (fd[i] < 0 || fd[i] > 900)) out.conflicto = 'CurrentRiverRace: fame ' + fd[i] + ' el ' + nombres[i];
    }
    return out;
  } catch (e) {
    Logger.log('[CRR] No se pudo comprobar los totales (' + tag + '): ' + e.message);
    return null;
  }
}


// ----- Capturas continuas de currentriverrace (§PF426): la captura y su carpeta -----

/**
 * _capturaContinuaCRR_() [→ Contexto_Base_Web.md §PF426]
 * La llama runGuerra() al empezar (cada 5 min). Entre las 04:45 y las 07:00 (Lima), una vez cada ~5 min, pide /currentriverrace de los clanes de
 * CFG.CAPTURA_CONTINUA_TAGS y guarda la respuesta tal cual en un archivo NUEVO de la subcarpeta Capturas_Continuas (nunca actualiza uno existente), con la
 * hora y los segundos en el nombre, para medir qué trae la API justo después del cambio de periodIndex (criterio 13 de §PF160). Se detiene sola tras
 * CFG.CAPTURA_CONTINUA_DIAS_MAX días distintos. No toca hojas ni el caché normal. Devuelve cuántos archivos escribió.
 */
function _capturaContinuaCRR_() {
  if (!CFG.CAPTURA_CONTINUA_ACTIVA) return 0;
  var ahora = new Date();
  var m = ahora.getUTCHours() * 60 + ahora.getUTCMinutes();
  if (m < CFG.CAPTURA_CONTINUA_INI_UTC_MIN || m >= CFG.CAPTURA_CONTINUA_FIN_UTC_MIN) return 0;
  var props = PropertiesService.getScriptProperties();
  var ultima = Number(props.getProperty('CAPTURA_CONTINUA_ULTIMA_MS')) || 0;
  if (ahora.getTime() - ultima < CFG.CAPTURA_CONTINUA_MIN_ENTRE_MS) return 0;
  var diaLima = Utilities.formatDate(ahora, 'America/Lima', 'yyyy-MM-dd');
  var dias = (props.getProperty('CAPTURA_CONTINUA_DIAS') || '').split(',').filter(Boolean);
  if (dias.indexOf(diaLima) < 0) {
    if (dias.length >= CFG.CAPTURA_CONTINUA_DIAS_MAX) {
      if (props.getProperty('CAPTURA_CONTINUA_AVISO_FIN') !== diaLima) {
        props.setProperty('CAPTURA_CONTINUA_AVISO_FIN', diaLima);
        Logger.log('[CapturaContinua] Detenida: ya hay ' + dias.length + ' días con captura (CFG.CAPTURA_CONTINUA_DIAS_MAX). reiniciarCapturaContinuaCRR() la vuelve a abrir.');
      }
      return 0;
    }
    dias.push(diaLima);
    props.setProperty('CAPTURA_CONTINUA_DIAS', dias.join(','));
  }
  // La hora se anota antes de consultar la API: si otro disparo llega mientras esta captura sigue, no captura de nuevo.
  props.setProperty('CAPTURA_CONTINUA_ULTIMA_MS', String(ahora.getTime()));
  var carpeta = _carpetaCapturasContinuasCRR_();
  var sello = Utilities.formatDate(ahora, 'America/Lima', 'yyyy-MM-dd HH.mm.ss');
  var escritos = 0;
  for (var i = 0; i < CFG.CAPTURA_CONTINUA_TAGS.length; i++) {
    var tag = CFG.CAPTURA_CONTINUA_TAGS[i];
    try {
      var datos = _apiGet('/clans/' + encodeTag(tag) + '/currentriverrace');
      if (!datos) { Logger.log('[CapturaContinua] ' + tag + ': la API no devolvió datos (HTTP ' + API_ULTIMO_HTTP_CODE + '); no se guarda nada.'); continue; }
      var nombreClan = String((datos.clan && datos.clan.name) || cleanTag(tag)).replace(/[\\\/]/g, '-');
      var pi = (datos.periodIndex === undefined || datos.periodIndex === null) ? 'xx' : _pad2_(datos.periodIndex);
      var nombre = 'Captura ' + sello + ' P.I-' + pi + ' ' + (datos.periodType || '') + ' - ' + nombreClan + ' - currentriverrace.json';
      carpeta.createFile(nombre, JSON.stringify(datos), MimeType.PLAIN_TEXT);
      escritos++;
    } catch (e) {
      Logger.log('[CapturaContinua] Error con ' + tag + ': ' + e.message);
    }
  }
  Logger.log('[CapturaContinua] ' + sello + ' (Lima): ' + escritos + ' archivo(s) nuevo(s) en ' + CFG.CAPTURA_CONTINUA_CARPETA + '.');
  return escritos;
}

/**
 * _carpetaCapturasContinuasCRR_() [→ Contexto_Base_Web.md §PF426]
 * Subcarpeta CFG.CAPTURA_CONTINUA_CARPETA dentro de la carpeta CurrentRiverRace de Drive; se crea si no existe y su id se guarda en una propiedad del script.
 * Va aparte de las carpetas por clan, así que ni el caché normal ni el Generador la leen como si fuera un clan.
 */
function _carpetaCapturasContinuasCRR_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('CAPTURA_CONTINUA_CARPETA_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* se vuelve a buscar por nombre */ } }
  var raiz = DriveApp.getFolderById(DRIVE_FOLDER_ID_CURRENTRIVERRACE);
  var it = raiz.getFoldersByName(CFG.CAPTURA_CONTINUA_CARPETA);
  var carpeta = it.hasNext() ? it.next() : raiz.createFolder(CFG.CAPTURA_CONTINUA_CARPETA);
  props.setProperty('CAPTURA_CONTINUA_CARPETA_ID', carpeta.getId());
  return carpeta;
}
