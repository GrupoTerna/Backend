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
//  Parte 2 — Funciones que no se corren a mano
//    - CurrentRiverRace por días: capturas de Drive y días del jugador
//    - CurrentRiverRace por días: usos de otras cadenas (cierre y totales)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var CRR_DIAS_LETRAS = 'JVSD';   // desplazamiento 0..3 = jueves a domingo (PeriodIndex % 7 - 3)

var _CRR_CACHE_SEMANA_ = {};

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- CurrentRiverRace por días: capturas de Drive y días del jugador -----

/**
 * Punto de entrada para las demás funciones: ataques y fame por día de UN jugador en una semana, según CurrentRiverRace.
 * totA y totF = totales de la semana (null si no se conocen). Devuelve { ataques, fameAcum, inicio, notas, hayCapturas }.
 */
function _crrDiasDeJugador_(temporada, semana, tag, totA, totF) {
  var caps = _crrCapturasDeSemana_(temporada, semana)[String(tag || '').trim()];
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
  if (_CRR_CACHE_SEMANA_[clave]) return _CRR_CACHE_SEMANA_[clave];
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
  _CRR_CACHE_SEMANA_[clave] = _crrCapturasDesdeArchivos_(archivos);
  return _CRR_CACHE_SEMANA_[clave];
}

function _crrSubcarpeta_(padre, nombre) {
  var it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : null;
}

/**
 * archivos = [{ nombre, datos }] con datos = JSON de /currentriverrace ya convertido en objeto.
 * Devuelve { tag: { J: [captura, ...], V: [...], S: [...], D: [...] } } con captura = { fame, usados, hoy }.
 * Un jugador puede tener dos capturas el mismo día si estuvo en dos clanes.
 */
function _crrCapturasDesdeArchivos_(archivos) {
  var porTag = {};
  (archivos || []).forEach(function (a) {
    var p = _crrParsearNombre_(a && a.nombre);
    var part = a && a.datos && a.datos.clan && a.datos.clan.participants;
    if (!p || !part) return;
    part.forEach(function (j) {
      var tag = String((j && j.tag) || '').trim();
      if (!tag) return;
      if (!porTag[tag]) porTag[tag] = {};
      if (!porTag[tag][p.letra]) porTag[tag][p.letra] = [];
      porTag[tag][p.letra].push({ fame: Number(j.fame) || 0, usados: Number(j.decksUsed) || 0, hoy: Number(j.decksUsedToday) || 0 });
    });
  });
  return porTag;
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
 * porDia = { J: [captura], V: [...], S: [...], D: [...] } de UN jugador (o null/{} si no hay capturas).
 * totA / totF = ataques y fame de toda la semana (null si no se conocen).
 * Devuelve { ataques: [J,V,S,D], fameAcum: [J,V,S,D], inicio: [J,V,S,D], notas: [] }; null = «sin dato».
 */
function _crrResolverJugador_(porDia, totA, totF) {
  var c = porDia || {};
  var L = CRR_DIAS_LETRAS;
  var inicio = [undefined, undefined, undefined, undefined];   // undefined = no hay captura; null = capturas que no se ponen de acuerdo
  var notas = [];
  var i, j;
  for (i = 0; i < 4; i++) {
    var lista = c[L.charAt(i)] || [];
    var vistos = {}, n = 0, v = null;
    for (j = 0; j < lista.length; j++) {
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
  if (inicio[0] === undefined) inicio[0] = ((c.J && c.J.length) || (c.V && c.V.length)) ? 0 : null;

  var ataques = [null, null, null, null];
  for (i = 0; i < 3; i++) {
    var a0 = inicio[i], a1 = inicio[i + 1];
    ataques[i] = (a0 !== undefined && a0 !== null && a1 !== undefined && a1 !== null) ? a1 - a0 : null;
  }
  ataques[3] = (totA !== null && totA !== undefined && inicio[3] !== undefined && inicio[3] !== null) ? totA - inicio[3] : null;

  var fameAcum = [null, null, null, null];
  for (i = 0; i < 3; i++) {
    var v2 = null;
    (c[L.charAt(i)] || []).forEach(function (x) { if (x.hoy === 4) v2 = x.fame; });
    if (v2 === null) (c[L.charAt(i + 1)] || []).forEach(function (x) { if (x.hoy === 0) v2 = x.fame; });
    fameAcum[i] = v2;
  }
  if (totF !== null && totF !== undefined) fameAcum[3] = totF;

  return { ataques: ataques, fameAcum: fameAcum, inicio: inicio.map(function (x) { return x === undefined ? null : x; }), notas: notas };
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
