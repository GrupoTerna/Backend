/**
 * 60_Control_Medallas_API.gs — Control de medallas por clan y día contra la API (§PF584, 24-nov-2026, pedido de la usuaria)
 *
 * Índice del orden (criterios de 0.9 de la skill):
 *   1. Funciones que la usuaria corre a mano: ninguna todavía (parte 1: solo función pura; la parte 2 agrega el guardado).
 *   2. No manuales, tema «control de medallas»: _cmaControlClanes_() y sus ayudas.
 *
 * Regla de la usuaria: la API manda siempre; la web solo es respaldo donde la API no da dato. Este archivo trabaja SOLO con el JSON de
 * currentriverrace de la API. [→ Contexto_Base_Web.md §PF584]
 */

/** Día de guerra de la semana `sectionIndex`: el jueves es el periodIndex 7 * sectionIndex + 3 y el domingo, el + 6 (§PF198, §PF185). */
var CMA_PRIMER_DIA_GUERRA_OFFSET = 3;
var CMA_DIAS_GUERRA_POR_SEMANA = 4;

/**
 * _cmaControlClanes_(rr) — para cada clan de la carrera (también los rivales) comprueba la identidad que verificó la usuaria
 * (§PF198): suma de participants[].fame = Σ pointsEarned de los días de guerra ya cerrados de la semana + clan.periodPoints.
 * Función pura: solo lee `rr` (un currentriverrace.json de la API); no usa Drive ni hojas.
 *
 * Devuelve una lista (un objeto por clan):
 *   { tag, nombre, periodIndex, sectionIndex, periodType, sumaFame, periodPoints, porDia: [{ periodIndex, pointsEarned }],
 *     sumaPointsEarned, diasEsperados, diasConDato, residuo, estado, fuente: 'api' }
 *   residuo = sumaFame - periodPoints - sumaPointsEarned (null si no se puede calcular).
 *   estado:
 *     'cuadra'        residuo 0.
 *     'difiere'       residuo distinto de 0 (con la API, negativo suele ser alguien que salió del clan o una captura previa al cierre).
 *     'sin dato'      falta el log de algún día cerrado de la semana para ese clan: no se inventa.
 *     'coliseo'       periodType 'colosseum': periodLogs no trae días de coliseo y periodPoints vale 0 (Detalle, «Estructura del JSON»).
 *     'sin guerra'    periodType 'training' u otro: no hay medallas de día de guerra que comprobar.
 *     'sin datos api' rr no trae clanes.
 * Un día de guerra distinto de jueves a domingo no existe, así que los días esperados son los de la semana anteriores al periodIndex actual.
 */
function _cmaControlClanes_(rr) {
  var salida = [];
  if (!rr) return salida;
  var clanes = (rr.clans && rr.clans.length) ? rr.clans : (rr.clan ? [rr.clan] : []);
  var periodType = String(rr.periodType || '');
  var pi = Number(rr.periodIndex);
  var sec = Number(rr.sectionIndex);
  var primerDia = (isFinite(sec) ? sec * 7 + CMA_PRIMER_DIA_GUERRA_OFFSET : NaN);
  var logs = rr.periodLogs || [];

  for (var c = 0; c < clanes.length; c++) {
    var clan = clanes[c] || {};
    var tag = String(clan.tag || '').trim().toUpperCase();
    var fila = {
      tag: tag, nombre: String(clan.name || ''), periodIndex: isFinite(pi) ? pi : null, sectionIndex: isFinite(sec) ? sec : null,
      periodType: periodType, sumaFame: 0, periodPoints: Number(clan.periodPoints) || 0, porDia: [], sumaPointsEarned: 0,
      diasEsperados: 0, diasConDato: 0, residuo: null, estado: 'sin datos api', fuente: 'api'
    };
    var parts = clan.participants || [];
    for (var p = 0; p < parts.length; p++) fila.sumaFame += Number(parts[p] && parts[p].fame) || 0;

    if (!tag || (!parts.length && clan.fame === undefined)) { salida.push(fila); continue; }
    if (periodType === 'colosseum') { fila.estado = 'coliseo'; salida.push(fila); continue; }
    if (periodType !== 'warDay' || !isFinite(pi) || !isFinite(primerDia)) { fila.estado = 'sin guerra'; salida.push(fila); continue; }

    // Días de guerra cerrados de la semana (anteriores al día en curso, que periodLogs todavía no trae).
    var ultimoCerrado = Math.min(pi - 1, primerDia + CMA_DIAS_GUERRA_POR_SEMANA - 1);
    fila.diasEsperados = Math.max(0, ultimoCerrado - primerDia + 1);
    for (var d = primerDia; d <= ultimoCerrado; d++) {
      var encontrado = null;
      for (var l = 0; l < logs.length && encontrado === null; l++) {
        if (Number(logs[l].periodIndex) !== d) continue;
        var items = logs[l].items || [];
        for (var k = 0; k < items.length; k++) {
          if (items[k] && items[k].clan && String(items[k].clan.tag || '').trim().toUpperCase() === tag) { encontrado = Number(items[k].pointsEarned) || 0; break; }
        }
      }
      if (encontrado !== null) { fila.porDia.push({ periodIndex: d, pointsEarned: encontrado }); fila.sumaPointsEarned += encontrado; fila.diasConDato++; }
    }
    if (fila.diasConDato < fila.diasEsperados) { fila.estado = 'sin dato'; salida.push(fila); continue; }
    fila.residuo = fila.sumaFame - fila.periodPoints - fila.sumaPointsEarned;
    fila.estado = (fila.residuo === 0) ? 'cuadra' : 'difiere';
    salida.push(fila);
  }
  return salida;
}
