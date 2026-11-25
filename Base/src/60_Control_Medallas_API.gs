/**
 * 60_Control_Medallas_API.gs — Control de medallas por clan y día contra la API (§PF584, 24-nov-2026, pedido de la usuaria)
 *
 * Índice del orden (criterios de 0.9 de la skill):
 *   1. Funciones que la usuaria corre a mano: estadoControlMedallasApi() (solo lectura; parte 2).
 *   2. No manuales, tema «control de medallas», en el orden en que se usan:
 *        _cmaControlClanes_() (parte 1, pura) -> _cmaFilasDeControl_() y _cmaMezclarFilas_() (parte 2, puras) -> _cmaGuardarControlDeCorrida_() (parte 2, escribe el CSV).
 *      Quien la llama: updateGuerraSheet() (17_GuerraSheet.gs), una vez por corrida, junto a la corrección automática del cierre del día.
 *
 * Regla de la usuaria: la API manda siempre; la web solo es respaldo donde la API no da dato. Este archivo trabaja SOLO con el JSON de
 * currentriverrace de la API. [→ Contexto_Base_Web.md §PF584]
 */

var CMA_CSV = 'Control_Medallas_API.csv';   // CSV propio en Drive (raíz de CSV; precedente §PF362 punto 9). Una fila por clan, temporada y día en curso. [→ Contexto_Base_Web.md §PF584]
var CMA_LETRAS_DIAS = 'JVSD';                 // desplazamiento 0..3 = jueves a domingo (periodIndex % 7 - 3)
var CMA_ENCABEZADOS = ['Temporada', 'SectionIndex', 'PeriodIndex', 'Dia', 'Clan', 'Tag', 'Tipo', 'Fuente', 'SumaFame', 'PeriodPoints',
  'SumaPointsEarned', 'DiasEsperados', 'DiasConDato', 'Residuo', 'Estado', 'PointsEarnedPorDia', 'Capturado'];

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

/**
 * estadoControlMedallasApi() [→ Contexto_Base_Web.md §PF584]
 * Manual, SOLO LECTURA (proyecto Base): cuenta en el registro las filas de Control_Medallas_API.csv por estado y tipo, y lista las que difieren.
 * No escribe nada.
 */
function estadoControlMedallasApi() {
  var texto = _loadCSVFromDrive(CMA_CSV);
  if (!texto) { Logger.log('[Control medallas API] Todavía no existe ' + CMA_CSV + ' (se crea en la primera corrida de la guerra que encuentre un día de guerra).'); return; }
  var filas = _parseCSV(texto);
  var porEstado = {}, difieren = [];
  for (var i = 1; i < filas.length; i++) {
    var f = filas[i];
    if (!f || f.length < CMA_ENCABEZADOS.length) continue;
    var k = f[6] + ' / ' + f[14];
    porEstado[k] = (porEstado[k] || 0) + 1;
    if (f[14] === 'difiere') difieren.push('T' + f[0] + ' idx ' + f[2] + ' (' + f[3] + ') ' + f[4] + ' ' + f[5] + ': residuo ' + f[13]);
  }
  Logger.log('[Control medallas API] ' + (filas.length - 1) + ' fila(s) en ' + CMA_CSV + '. Por tipo y estado: ' + JSON.stringify(porEstado) + '.' +
    (difieren.length ? ' Difieren: ' + difieren.slice(-10).join(' | ') : ' Ninguna difiere.'));
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

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

// ----- Control de medallas: filas del CSV (parte 2, puras) -----

/**
 * _cmaFilasDeControl_(controles, temporada, ternaTags, capturado) — convierte lo que devuelve _cmaControlClanes_() en filas del CSV (§PF584 parte 2).
 * Función pura. Solo guarda días de guerra (`warDay`): coliseo y entrenamiento no tienen medallas que comprobar (la parte 3 agrega el respaldo).
 * Una fila por clan de la carrera (también los rivales), con el periodIndex del día EN CURSO al capturar: durante ese día `periodLogs` ya trae el
 * anterior cerrado, así que ahí se cierra la verificación del día anterior. `Fuente` es siempre 'api'.
 */
function _cmaFilasDeControl_(controles, temporada, ternaTags, capturado) {
  var filas = [];
  var propios = {};
  (ternaTags || []).forEach(function (t) { propios[String(t || '').trim().toUpperCase()] = true; });
  for (var i = 0; i < (controles || []).length; i++) {
    var x = controles[i];
    if (!x || x.periodType !== 'warDay' || !x.tag || x.periodIndex === null) continue;
    var dias = (x.porDia || []).map(function (d) {
      var off = (Number(d.periodIndex) % 7) - CMA_PRIMER_DIA_GUERRA_OFFSET;
      return (off >= 0 && off < CMA_DIAS_GUERRA_POR_SEMANA ? CMA_LETRAS_DIAS.charAt(off) : '?') + ':' + d.pointsEarned;
    }).join('|');
    var offHoy = (x.periodIndex % 7) - CMA_PRIMER_DIA_GUERRA_OFFSET;
    filas.push([
      Number(temporada) || 0, x.sectionIndex === null ? '' : x.sectionIndex, x.periodIndex,
      (offHoy >= 0 && offHoy < CMA_DIAS_GUERRA_POR_SEMANA) ? CMA_LETRAS_DIAS.charAt(offHoy) : '?',
      x.nombre, x.tag, propios[x.tag] ? 'Terna' : 'Rival', 'api',
      x.sumaFame, x.periodPoints, x.sumaPointsEarned, x.diasEsperados, x.diasConDato,
      x.residuo === null ? '' : x.residuo, x.estado, dias, capturado
    ]);
  }
  return filas;
}

/**
 * _cmaMezclarFilas_(existentes, nuevas) — une las filas nuevas con las del CSV (§PF584 parte 2). Función pura.
 * `existentes`: filas ya leídas del CSV, con el encabezado en la posición 0 (o [] si el archivo no existe). Clave = Tag + Temporada + PeriodIndex.
 *  - Fila nueva: se agrega. Fila con la misma clave: solo cambia si algún valor es distinto (la columna `Capturado` no cuenta: así una corrida
 *    que no cambia nada no reescribe el archivo) y nunca se reemplaza por una con MENOS días con dato (un log que faltó un momento no borra lo comprobado).
 * Devuelve { ok, filas, nuevas, actualizadas }. ok = false si el encabezado del archivo no es el esperado (no se toca: se avisa).
 */
function _cmaMezclarFilas_(existentes, nuevas) {
  var res = { ok: true, filas: [], nuevas: 0, actualizadas: 0 };
  var enc = CMA_ENCABEZADOS.join('\t');
  var base = (existentes && existentes.length) ? existentes.map(function (f) { return f.slice(); }) : [CMA_ENCABEZADOS.slice()];
  if (base[0].join('\t') !== enc) { res.ok = false; res.filas = base; return res; }
  var indice = {};
  for (var i = 1; i < base.length; i++) indice[String(base[i][5]) + '|' + String(base[i][0]) + '|' + String(base[i][2])] = i;
  var ultimo = CMA_ENCABEZADOS.length - 1;   // Capturado
  for (var n = 0; n < (nuevas || []).length; n++) {
    var f = nuevas[n].map(function (v) { return (v === null || v === undefined) ? '' : String(v); });
    var k = f[5] + '|' + f[0] + '|' + f[2];
    var pos = indice[k];
    if (pos === undefined) { base.push(f); indice[k] = base.length - 1; res.nuevas++; continue; }
    var viejo = base[pos].map(String);
    var igual = true;
    for (var c = 0; c < ultimo; c++) { if (viejo[c] !== f[c]) { igual = false; break; } }
    if (igual) continue;
    if ((Number(viejo[12]) || 0) > (Number(f[12]) || 0)) continue;
    base[pos] = f; res.actualizadas++;
  }
  res.filas = base;
  return res;
}

// ----- Control de medallas: guardado en Drive (parte 2) -----

/**
 * _cmaGuardarControlDeCorrida_(items) — guarda en Control_Medallas_API.csv el control de cada clan de las carreras leídas en esta corrida (§PF584 parte 2).
 * items: [{ rr, temporada }] con el currentriverrace de la API de cada clan Terna. Solo guarda y avisa: NO cambia nada de lo que se escribe en las hojas.
 * Escribe el CSV solo si hay filas nuevas o cambiadas (_cmaMezclarFilas_). Sin lock: cada corrida vuelve a calcular todo, así que una corrida que
 * pierda una escritura se corrige en la siguiente. Devuelve { guardado, nuevas, actualizadas, difieren }.
 */
function _cmaGuardarControlDeCorrida_(items) {
  var res = { guardado: false, nuevas: 0, actualizadas: 0, difieren: 0 };
  if (!items || !items.length) return res;
  var capturado = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
  var nuevas = [];
  for (var i = 0; i < items.length; i++) {
    nuevas = nuevas.concat(_cmaFilasDeControl_(_cmaControlClanes_(items[i].rr), items[i].temporada, CFG.TERNA_TAGS, capturado));
  }
  if (!nuevas.length) return res;
  var texto = _loadCSVFromDrive(CMA_CSV);
  var existentes = texto ? _parseCSV(texto) : [];
  var m = _cmaMezclarFilas_(existentes, nuevas);
  if (!m.ok) {
    Logger.log('[Control medallas API] AVISO: ' + CMA_CSV + ' tiene otro encabezado que el esperado; no se escribió nada.');
    return res;
  }
  res.nuevas = m.nuevas; res.actualizadas = m.actualizadas;
  nuevas.forEach(function (f) { if (f[14] === 'difiere') res.difieren++; });
  if (m.nuevas + m.actualizadas > 0) {
    _saveCSVToDrive(CMA_CSV, _encodeCSV(m.filas));
    res.guardado = true;
  }
  Logger.log('[Control medallas API] ' + nuevas.length + ' clan(es) controlados; ' + m.nuevas + ' fila(s) nueva(s), ' + m.actualizadas + ' actualizada(s)' +
    (res.difieren ? '; ' + res.difieren + ' con residuo distinto de 0 (ver ' + CMA_CSV + ')' : '') + (res.guardado ? '.' : '; sin cambios, no se escribió.'));
  return res;
}
