/**
 * 60_Control_Medallas_API.gs — Control de medallas por clan y día contra la API (§PF584, 24-nov-2026, pedido de la usuaria)
 *
 * Índice del orden (criterios de 0.9 de la skill):
 *   1. Funciones que la usuaria corre a mano: estadoControlMedallasApi() (solo lectura; parte 2), actualizarControlMedallasWeb() (parte 3, escribe Control_Medallas_Web.csv; también la dispara el activador semanal de 08_Activadores.gs)
 *      e informeMedallasPorDiaContraApi() (parte 4, opción A: solo informa; escribe Control_Medallas_Dia.csv).
 *   2. No manuales, tema «control de medallas», en el orden en que se usan:
 *        _cmaControlClanes_() (parte 1, pura) -> _cmaFilasDeControl_() y _cmaMezclarFilas_() (parte 2, puras) -> _cmaCierreSemana_() y _cmaFilasDeCierre_() (cierre del domingo en el lunes, puras)
 *        -> _cmaGuardarControlDeCorrida_() (parte 2, escribe el CSV)
 *        -> _cmaNombreClanWeb_(), _cmaTotalesSemanaWeb_(), _cmaDiasApiPorSemana_(), _cmaFilasRespaldoWeb_() y _cmaMezclarFilasWeb_() (parte 3, puras)
 *        -> _cmaMedallasDiaHoja_(), _cmaFilasMedallasDia_() y _cmaMezclarFilasDia_() (parte 4, opción A, puras).
 *      Quien la llama: updateGuerraSheet() (17_GuerraSheet.gs), una vez por corrida, junto a la corrección automática del cierre del día.
 *
 * Regla de la usuaria: la API manda siempre; la web solo es respaldo donde la API no da dato. Este archivo trabaja SOLO con el JSON de
 * currentriverrace de la API. [→ Contexto_Base_Web.md §PF584]
 */

var CMA_CSV = 'Control_Medallas_API.csv';   // CSV propio en Drive (raíz de CSV; precedente §PF362 punto 9). Una fila por clan, temporada y día en curso; y, de lunes a miércoles, una fila `L` con el cierre de la semana anterior. [→ Contexto_Base_Web.md §PF584]
var CMA_LETRAS_DIAS = 'JVSD';                 // desplazamiento 0..3 = jueves a domingo (periodIndex % 7 - 3)
var CMA_ENCABEZADOS = ['Temporada', 'SectionIndex', 'PeriodIndex', 'Dia', 'Clan', 'Tag', 'Tipo', 'Fuente', 'SumaFame', 'PeriodPoints',
  'SumaPointsEarned', 'DiasEsperados', 'DiasConDato', 'Residuo', 'Estado', 'PointsEarnedPorDia', 'Capturado'];

// Parte 3: respaldo con la web. Una fila por clan Terna y semana cerrada, con lo que suma el Log de RoyaleAPI (HistorialGuerra_Grupal.csv, Fuente 'log'). [→ Contexto_Base_Web.md §PF584]
var CMW_CSV = 'Control_Medallas_Web.csv';
var CMW_ENCABEZADOS = ['Temporada', 'Semana', 'Clan', 'Tag', 'Fuente', 'SumaFameWeb', 'Ataques', 'Jugadores', 'DiasApi', 'SumaPointsEarnedApi', 'Residuo',
  'Estado', 'DomingoRespaldo', 'PointsEarnedPorDia', 'Capturado'];

// Parte 4 (opción A): medallas por clan y día de la hoja (Backup_Guerra.csv) contra el `pointsEarned` de la API. Solo informa. [→ Contexto_Base_Web.md §PF584]
var CMD_CSV = 'Control_Medallas_Dia.csv';
var CMD_ENCABEZADOS = ['Temporada', 'Semana', 'Dia', 'Clan', 'Tag', 'SumaHoja', 'PointsEarnedApi', 'Residuo', 'Estado', 'Jugadores', 'DiasSinFila', 'Anomalias', 'Capturado'];

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

/**
 * actualizarControlMedallasWeb() [→ Contexto_Base_Web.md §PF584]
 * Manual o por el activador semanal de `ACTIVADORES_CONFIG` (`08_Activadores.gs`: miércoles, 23:00 a 23:59 de Lima) (proyecto Base): parte 3 del control de medallas. Lee HistorialGuerra_Grupal.csv (lo que trae Tampermonkey del Log de RoyaleAPI) y
 * Control_Medallas_API.csv (parte 2) y guarda en Control_Medallas_Web.csv una fila por clan Terna y semana cerrada con el total de fama de la web y,
 * donde la API no da la semana completa (coliseo, o domingo todavía sin cerrar), el respaldo. La API manda siempre: si ya tiene los 4 días, la fila
 * solo compara. No cambia nada de lo que se escribe en las hojas ni en los demás CSV.
 */
function actualizarControlMedallasWeb() {
  var textoWeb = _loadHistorialGuerraGrupalCSV();
  if (!textoWeb) { Logger.log('[Control medallas web] No se encontró HistorialGuerra_Grupal.csv; no se hizo nada.'); return; }
  var textoApi = _loadCSVFromDrive(CMA_CSV);
  var nombreATag = {};
  CFG.TERNA_TAGS.forEach(function (t) {
    var tag = String(t || '').trim().toUpperCase();
    [CFG.CLAN_NOMBRES_FALLBACK[t], _resolverNombreClan(t)].forEach(function (n) { var k = _cmaNombreClanWeb_(n); if (k) nombreATag[k] = tag; });
  });
  var capturado = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
  var calc = _cmaFilasRespaldoWeb_(_cmaTotalesSemanaWeb_(_parseCSV(textoWeb)), nombreATag, _cmaDiasApiPorSemana_(textoApi ? _parseCSV(textoApi) : []), capturado);
  var textoPrev = _loadCSVFromDrive(CMW_CSV);
  var m = _cmaMezclarFilasWeb_(textoPrev ? _parseCSV(textoPrev) : [], calc.filas);
  if (!m.ok) { Logger.log('[Control medallas web] AVISO: ' + CMW_CSV + ' tiene otro encabezado que el esperado; no se escribió nada.'); return; }
  if (m.nuevas + m.actualizadas > 0) _saveCSVToDrive(CMW_CSV, _encodeCSV(m.filas));
  var porEstado = {};
  calc.filas.forEach(function (f) { porEstado[f[11]] = (porEstado[f[11]] || 0) + 1; });
  var difieren = calc.filas.filter(function (f) { return f[11] === 'difiere'; }).map(function (f) { return 'T' + f[0] + ' S' + f[1] + ' ' + f[2] + ' residuo ' + f[10]; });
  Logger.log('[Control medallas web] ' + calc.filas.length + ' clan-semana(s) con Log cerrado; por estado: ' + JSON.stringify(porEstado) + '; ' + m.nuevas + ' fila(s) nueva(s), ' +
    m.actualizadas + ' actualizada(s)' + ((m.nuevas + m.actualizadas) ? '.' : '; sin cambios, no se escribió.') +
    (calc.sinTag.length ? ' Clanes del historial sin Tag conocido (no se usaron): ' + calc.sinTag.join(', ') + '.' : '') +
    (difieren.length ? ' Difieren: ' + difieren.slice(-10).join(' | ') : ''));
}

/**
 * informeMedallasPorDiaContraApi() [→ Contexto_Base_Web.md §PF584]
 * Manual (proyecto Base): parte 4, opción A (pista para los repartos). SOLO INFORMA: no cambia ninguna hoja ni ninguna elección de reparto.
 * Para cada clan Terna, semana y día de guerra, suma las medallas que la hoja repartió ese día entre todos los jugadores (Backup_Guerra.csv: `Fame` es
 * acumulada por semana, así que la de un día es la diferencia con el día anterior de la misma serie) y la compara con el `pointsEarned` de la API que ya
 * guarda Control_Medallas_API.csv (J, V, S y, desde el cierre del domingo, D). Escribe Control_Medallas_Dia.csv (una fila por clan, semana y día) solo si hay
 * filas nuevas o distintas. Un residuo distinto de 0 en un día con el total de la semana igual es la pista: algún ataque quedó en otro día.
 */
function informeMedallasPorDiaContraApi() {
  var textoHoja = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!textoHoja) { Logger.log('[Control medallas día] No se encontró Backup_Guerra.csv; no se hizo nada.'); return; }
  var textoApi = _loadCSVFromDrive(CMA_CSV);
  if (!textoApi) { Logger.log('[Control medallas día] Todavía no existe ' + CMA_CSV + '; no hay medallas de la API con las que comparar.'); return; }
  var capturado = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
  var hoja = _cmaMedallasDiaHoja_(_parseCSV(textoHoja));
  var diasApi = _cmaDiasApiPorSemana_(_parseCSV(textoApi));
  var filas = _cmaFilasMedallasDia_(hoja, diasApi, CFG.TERNA_TAGS, capturado);
  var textoPrev = _loadCSVFromDrive(CMD_CSV);
  var m = _cmaMezclarFilasDia_(textoPrev ? _parseCSV(textoPrev) : [], filas);
  if (!m.ok) { Logger.log('[Control medallas día] AVISO: ' + CMD_CSV + ' tiene otro encabezado que el esperado; no se escribió nada.'); return; }
  if (m.nuevas + m.actualizadas > 0) _saveCSVToDrive(CMD_CSV, _encodeCSV(m.filas));
  var porEstado = {};
  filas.forEach(function (f) { porEstado[f[8]] = (porEstado[f[8]] || 0) + 1; });
  var mayores = filas.filter(function (f) { return f[8] === 'difiere'; }).sort(function (a, b) { return Math.abs(Number(b[7])) - Math.abs(Number(a[7])); }).slice(0, 10)
    .map(function (f) { return 'T' + f[0] + ' S' + f[1] + ' ' + f[2] + ' ' + f[3] + ' residuo ' + f[7]; });
  Logger.log('[Control medallas día] ' + filas.length + ' clan-día(s) de clanes Terna; por estado: ' + JSON.stringify(porEstado) + '; ' + m.nuevas + ' fila(s) nueva(s), ' +
    m.actualizadas + ' actualizada(s)' + ((m.nuevas + m.actualizadas) ? '.' : '; sin cambios, no se escribió.') +
    (mayores.length ? ' Mayores residuos: ' + mayores.join(' | ') : ' Ningún día difiere.'));
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
 * Función pura. Solo guarda días de guerra (`warDay`): coliseo y entrenamiento no tienen medallas que comprobar (la parte 3 agrega el respaldo; el entrenamiento solo aporta el cierre del domingo, _cmaCierreSemana_).
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

// ----- Control de medallas: cierre del domingo con la captura del lunes (puras) -----

/**
 * _cmaCierreSemana_(rr) — toma de una captura de ENTRENAMIENTO (lunes, martes o miércoles) los `pointsEarned` de los 4 días de guerra de la semana
 * anterior, domingo incluido (§PF584, hueco del domingo). Función pura: solo lee `rr`; no usa Drive ni hojas.
 * Por qué: el `pointsEarned` del domingo recién llega en la captura del lunes (el día en curso no está en `periodLogs`) y la parte 2 solo guardaba
 * días de guerra, así que Control_Medallas_API.csv nunca tenía los 4 días y toda semana normal salía `respaldo` con `DomingoRespaldo`.
 * Solo aplica a `training` con sectionIndex >= 1 y periodIndex dentro de esa semana (7 * sectionIndex a +2): en la primera semana de la temporada
 * no hay semana anterior y la del coliseo nunca se cierra aquí (después viene otra temporada, con sectionIndex 0). Vale para cualquiera de los 3 días de
 * entrenamiento: todos traen el mismo cierre, y así una captura del lunes que falte la cubre la del martes.
 * Devuelve una lista (un objeto por clan, también rivales):
 *   { tag, nombre, periodIndex (el del lunes: 7 * sectionIndex, para que las capturas de los 3 días caigan en la misma clave), sectionIndex (de la semana
 *     CERRADA, o sea el de la captura menos 1; así `Semana` = sectionIndex + 1 coincide con la web), porDia: [{ periodIndex, pointsEarned }],
 *     sumaPointsEarned, diasEsperados: 4, diasConDato, estado: 'cierre' (los 4 días) o 'sin dato' (falta alguno: no se inventa), fuente: 'api' }
 */
function _cmaCierreSemana_(rr) {
  var salida = [];
  if (!rr || String(rr.periodType || '') !== 'training') return salida;
  var pi = Number(rr.periodIndex), sec = Number(rr.sectionIndex);
  if (!isFinite(pi) || !isFinite(sec) || sec < 1 || pi < sec * 7 || pi > sec * 7 + 2) return salida;
  var primerDia = (sec - 1) * 7 + CMA_PRIMER_DIA_GUERRA_OFFSET;
  var clanes = (rr.clans && rr.clans.length) ? rr.clans : (rr.clan ? [rr.clan] : []);   // clan-por-nombre-ok: lista de clanes de la carrera, no compara nombres
  var logs = rr.periodLogs || [];
  for (var c = 0; c < clanes.length; c++) {
    var clan = clanes[c] || {};
    var tag = String(clan.tag || '').trim().toUpperCase();
    if (!tag) continue;
    var fila = { tag: tag, nombre: String(clan.name || ''), periodIndex: sec * 7, sectionIndex: sec - 1, porDia: [], sumaPointsEarned: 0,
      diasEsperados: CMA_DIAS_GUERRA_POR_SEMANA, diasConDato: 0, estado: 'sin dato', fuente: 'api' };
    for (var d = primerDia; d < primerDia + CMA_DIAS_GUERRA_POR_SEMANA; d++) {
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
    if (fila.diasConDato === fila.diasEsperados) fila.estado = 'cierre';
    salida.push(fila);
  }
  return salida;
}

/**
 * _cmaFilasDeCierre_(cierres, temporada, ternaTags, capturado) — convierte lo que devuelve _cmaCierreSemana_() en filas de Control_Medallas_API.csv
 * (mismas columnas que _cmaFilasDeControl_; §PF584, hueco del domingo). Función pura.
 * Fila de cierre: `Dia` = 'L' (lunes; la fila es del cierre de la semana anterior), `SectionIndex` = el de la semana cerrada, `PeriodIndex` = el del lunes,
 * `SumaFame` y `PeriodPoints` vacíos (la fama de los participantes ya se reinició, o llega rezagada: no sirve para la identidad de la fama) y `Residuo` vacío.
 * `PointsEarnedPorDia` trae J, V, S y D (por ejemplo `J:500|V:700|S:650|D:900`): _cmaDiasApiPorSemana_() lo lee sin cambios y la parte 3 pasa de
 * `respaldo` a `cuadra` o `difiere`. `Estado` = `cierre` (4 días) o `sin dato`.
 */
function _cmaFilasDeCierre_(cierres, temporada, ternaTags, capturado) {
  var filas = [];
  var propios = {};
  (ternaTags || []).forEach(function (t) { propios[String(t || '').trim().toUpperCase()] = true; });
  for (var i = 0; i < (cierres || []).length; i++) {
    var x = cierres[i];
    if (!x || !x.tag || x.periodIndex === null || x.sectionIndex === null) continue;
    var dias = (x.porDia || []).map(function (d) {
      var off = (Number(d.periodIndex) % 7) - CMA_PRIMER_DIA_GUERRA_OFFSET;
      return (off >= 0 && off < CMA_DIAS_GUERRA_POR_SEMANA ? CMA_LETRAS_DIAS.charAt(off) : '?') + ':' + d.pointsEarned;
    }).join('|');
    filas.push([
      Number(temporada) || 0, x.sectionIndex, x.periodIndex, 'L',
      x.nombre, x.tag, propios[x.tag] ? 'Terna' : 'Rival', 'api',
      '', '', x.sumaPointsEarned, x.diasEsperados, x.diasConDato,
      '', x.estado, dias, capturado
    ]);
  }
  return filas;
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
    nuevas = nuevas.concat(_cmaFilasDeCierre_(_cmaCierreSemana_(items[i].rr), items[i].temporada, CFG.TERNA_TAGS, capturado));   // lunes a miércoles: cierre de la semana anterior (domingo incluido)
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
  Logger.log('[Control medallas API] ' + nuevas.length + ' fila(s) de control (día de guerra o cierre del domingo); ' + m.nuevas + ' fila(s) nueva(s), ' + m.actualizadas + ' actualizada(s)' +
    (res.difieren ? '; ' + res.difieren + ' con residuo distinto de 0 (ver ' + CMA_CSV + ')' : '') + (res.guardado ? '.' : '; sin cambios, no se escribió.'));
  return res;
}

// ----- Control de medallas: respaldo con la web (parte 3, puras) -----

/** _cmaNombreClanWeb_(nombre) — el historial web a veces guarda el nombre del clan con una fecha en una segunda línea; se toma solo la primera línea. */
function _cmaNombreClanWeb_(nombre) {
  return String(nombre === null || nombre === undefined ? '' : nombre).split(/\r?\n/)[0].trim();
}

/**
 * _cmaTotalesSemanaWeb_(filas) — suma lo que trae el Log de RoyaleAPI por clan y semana cerrada (§PF584 parte 3). Función pura.
 * `filas`: HistorialGuerra_Grupal.csv ya leído, con el encabezado en la posición 0. Solo cuentan las filas con Fuente `log` y Cerrada `true`; cada bloque
 * del historial es una semana distinta, así que un mismo jugador puede salir en varias filas sin que estén repetidas (clave: Tag, temporada, semana, clan).
 * `filasPerfil` cuenta las filas `perfil` del mismo clan y semana: si las hay, el Log de esa semana quedó parcial (con los datos reales, esas semanas no
 * cuadraban con la API) y la parte 3 no usa el total.
 * Devuelve [{ clanNombre, temporada (interna), semana, sumaFame, ataques, jugadores, filasPerfil }], ordenado por temporada, semana y clan.
 */
function _cmaTotalesSemanaWeb_(filas) {
  if (!filas || filas.length < 2) return [];
  var enc = filas[0].map(function (c) { return String(c || '').trim(); });
  var ix = {};
  ['TemporadaInterna', 'Semana', 'Clan', 'Ataques', 'Fame', 'Fuente', 'Cerrada'].forEach(function (c) { ix[c] = enc.indexOf(c); });
  for (var c in ix) { if (ix[c] < 0) return []; }
  var grupos = {}, orden = [];
  for (var i = 1; i < filas.length; i++) {
    var f = filas[i];
    if (!f || f.length <= ix.Fuente) continue;
    var temporada = Number(f[ix.TemporadaInterna]), semana = Number(f[ix.Semana]);
    var clan = _cmaNombreClanWeb_(f[ix.Clan]);
    if (!clan || isNaN(temporada) || isNaN(semana)) continue;
    var k = clan + '|' + temporada + '|' + semana;
    var g = grupos[k];
    if (!g) { g = grupos[k] = { clanNombre: clan, temporada: temporada, semana: semana, sumaFame: 0, ataques: 0, jugadores: 0, filasPerfil: 0 }; orden.push(k); }
    var fuente = String(f[ix.Fuente] || '').trim();
    if (fuente === 'perfil') { g.filasPerfil++; continue; }
    if (fuente !== 'log' || String(f[ix.Cerrada] || '').trim().toLowerCase() !== 'true') continue;
    g.sumaFame += Number(f[ix.Fame]) || 0; g.ataques += Number(f[ix.Ataques]) || 0; g.jugadores++;
  }
  return orden.map(function (k) { return grupos[k]; }).filter(function (g) { return g.jugadores > 0; }).sort(function (a, b) {
    return (a.temporada - b.temporada) || (a.semana - b.semana) || (a.clanNombre < b.clanNombre ? -1 : (a.clanNombre > b.clanNombre ? 1 : 0));
  });
}

/**
 * _cmaDiasApiPorSemana_(filasControl) — junta, por clan Terna y semana, los `pointsEarned` por día que Control_Medallas_API.csv ya guardó (§PF584 parte 3).
 * Función pura. `filasControl`: ese CSV ya leído, con el encabezado en la posición 0. Clave: `TAG|temporada|semana` (semana = SectionIndex + 1).
 * Devuelve { clave: { J: n, V: n, S: n, D: n } } con los días que se conocen; una fila más nueva pisa el valor de un día ya guardado (un día cerrado no cambia).
 */
function _cmaDiasApiPorSemana_(filasControl) {
  var salida = {};
  for (var i = 1; i < (filasControl || []).length; i++) {
    var f = filasControl[i];
    if (!f || f.length < CMA_ENCABEZADOS.length || String(f[7]) !== 'api' || String(f[6]) !== 'Terna') continue;
    var seccion = Number(f[1]);
    if (f[1] === '' || isNaN(seccion)) continue;
    var k = String(f[5]).trim().toUpperCase() + '|' + Number(f[0]) + '|' + (seccion + 1);
    var dias = salida[k] || (salida[k] = {});
    String(f[15] || '').split('|').forEach(function (par) {
      var m = /^([JVSD]):(-?\d+)$/.exec(par.trim());
      if (m) dias[m[1]] = Number(m[2]);
    });
  }
  return salida;
}

/**
 * _cmaFilasRespaldoWeb_(totales, nombreATag, diasApi, capturado) — arma las filas de Control_Medallas_Web.csv (§PF584 parte 3). Función pura.
 * La API manda siempre; la web solo respalda donde la API no da la semana completa. Estado de cada fila:
 *   - `incompleto`: el clan y la semana también tienen filas `perfil`, así que el Log web quedó parcial; no se usa el total.
 *   - `cuadra` o `difiere`: la API ya tiene los 4 días de guerra; se compara la web contra Σ pointsEarned (residuo = web − API).
 *   - `respaldo`: a la API le faltan días (coliseo, que `periodLogs` no trae, o el domingo todavía sin guardar). El total de la semana es el de la web.
 *     Si se conocen jueves, viernes y sábado, `DomingoRespaldo` = web − (J + V + S); si eso da negativo la fila pasa a `difiere`.
 * `nombreATag`: { nombre limpio del clan: TAG }. El historial web solo trae el nombre del clan, sin Tag, así que aquí se resuelve por los nombres de los
 * clanes Terna y los que no se reconocen salen en `sinTag` y no se usan (no se adivina un Tag).
 * Devuelve { filas, sinTag }.
 */
function _cmaFilasRespaldoWeb_(totales, nombreATag, diasApi, capturado) {
  var filas = [], sinTag = [];
  var letras = CMA_LETRAS_DIAS.split('');
  (totales || []).forEach(function (t) {
    var tag = nombreATag ? nombreATag[t.clanNombre] : '';   // clan-por-nombre-ok: el historial web no trae Tag del clan
    if (!tag) { if (sinTag.indexOf(t.clanNombre) < 0) sinTag.push(t.clanNombre); return; }
    var dias = (diasApi && diasApi[tag + '|' + t.temporada + '|' + t.semana]) || {};
    var conocidos = letras.filter(function (l) { return dias[l] !== undefined; });
    var sumaApi = conocidos.reduce(function (a, l) { return a + dias[l]; }, 0);
    var residuo = '', estado, domingo = '';
    if (t.filasPerfil > 0) {
      estado = 'incompleto';
    } else if (conocidos.length === letras.length) {
      residuo = t.sumaFame - sumaApi;
      estado = residuo === 0 ? 'cuadra' : 'difiere';
    } else {
      estado = 'respaldo';
      if (conocidos.length === 3 && dias.D === undefined && dias.J !== undefined && dias.V !== undefined && dias.S !== undefined) {
        var dom = t.sumaFame - sumaApi;
        if (dom < 0) { estado = 'difiere'; residuo = dom; } else domingo = dom;
      }
    }
    filas.push([t.temporada, t.semana, t.clanNombre, tag, 'web', t.sumaFame, t.ataques, t.jugadores, conocidos.length,
      conocidos.length ? sumaApi : '', residuo, estado, domingo,
      conocidos.map(function (l) { return l + ':' + dias[l]; }).join('|'), capturado]);
  });
  return { filas: filas, sinTag: sinTag };
}

/**
 * _cmaMezclarFilasWeb_(existentes, nuevas) — une las filas nuevas con las de Control_Medallas_Web.csv (§PF584 parte 3). Función pura.
 * Clave = Tag + Temporada + Semana. Fila nueva: se agrega. Misma clave: solo cambia si algún valor es distinto (`Capturado` no cuenta, para que una corrida
 * sin novedades no reescriba el archivo); y no se reemplaza por una con MENOS días de la API si el total de la web es el mismo.
 * Devuelve { ok, filas, nuevas, actualizadas }; ok = false si el encabezado del archivo no es el esperado (no se toca: se avisa).
 */
function _cmaMezclarFilasWeb_(existentes, nuevas) {
  var res = { ok: true, filas: [], nuevas: 0, actualizadas: 0 };
  var enc = CMW_ENCABEZADOS.join('\t');
  var base = (existentes && existentes.length) ? existentes.map(function (f) { return f.slice(); }) : [CMW_ENCABEZADOS.slice()];
  if (base[0].join('\t') !== enc) { res.ok = false; res.filas = base; return res; }
  var indice = {};
  for (var i = 1; i < base.length; i++) indice[String(base[i][3]) + '|' + String(base[i][0]) + '|' + String(base[i][1])] = i;
  var ultimo = CMW_ENCABEZADOS.length - 1;   // Capturado
  (nuevas || []).forEach(function (n) {
    var f = n.map(function (v) { return (v === null || v === undefined) ? '' : String(v); });
    var k = f[3] + '|' + f[0] + '|' + f[1];
    var pos = indice[k];
    if (pos === undefined) { base.push(f); indice[k] = base.length - 1; res.nuevas++; return; }
    var viejo = base[pos].map(String);
    var igual = true;
    for (var c = 0; c < ultimo; c++) { if (viejo[c] !== f[c]) { igual = false; break; } }
    if (igual) return;
    if ((Number(viejo[8]) || 0) > (Number(f[8]) || 0) && viejo[5] === f[5]) return;
    base[pos] = f; res.actualizadas++;
  });
  res.filas = base;
  return res;
}

// ----- Control de medallas: medallas por día de la hoja contra la API (parte 4, opción A; puras) -----

/**
 * _cmaMedallasDiaHoja_(filas) — suma, por clan, temporada, semana y día, las medallas que la hoja repartió entre los jugadores (§PF584 parte 4, opción A). Función pura.
 * `filas`: Backup_Guerra.csv ya leído, con el encabezado en la posición 0. Solo cuentan las filas de `Etapa` = `Guerra` con `Día` J, V, S o D y un Clan_Tag.
 * `Fame` de esa hoja es ACUMULADA por semana: la de un día es la diferencia con el día anterior de la misma serie (jugador, clan, temporada y semana).
 * Si a una serie le falta la fila de un día, la diferencia cae en el siguiente día con fila y se cuenta en `diasSinFila` (la hoja no sabe de qué día fue);
 * si la fame baja respecto del día anterior (corrección), ese día suma 0, se conserva el máximo anterior y se cuenta en `anomalias`.
 * Devuelve { 'TAG|temporada|semana': { clanTag, temporada, semana, nombre, dias: [J, V, S, D], jugadores, diasSinFila, anomalias } }.
 * Límite conocido: solo ve a los jugadores con fila en la hoja; las medallas de quien salió del clan antes de la captura no están y salen como residuo positivo de la API.
 */
function _cmaMedallasDiaHoja_(filas) {
  var salida = {};
  if (!filas || filas.length < 2) return salida;
  var enc = filas[0].map(function (c) { return String(c || '').trim(); });
  var ix = {};
  ['Temporada', 'Semana', 'Día', 'Etapa', 'Clan', 'Tag', 'Fame', 'Clan_Tag'].forEach(function (c) { ix[c] = enc.indexOf(c); });
  for (var c in ix) { if (ix[c] < 0) return salida; }
  var series = {}, ordenSeries = [];
  for (var i = 1; i < filas.length; i++) {
    var f = filas[i];
    if (!f || f.length <= ix.Clan_Tag) continue;
    if (String(f[ix.Etapa] || '').trim() !== 'Guerra') continue;
    var off = CMA_LETRAS_DIAS.indexOf(String(f[ix['Día']] || '').trim());
    var clanTag = String(f[ix.Clan_Tag] || '').trim().toUpperCase();
    var jugador = String(f[ix.Tag] || '').trim().toUpperCase();
    var temporada = Number(f[ix.Temporada]), semana = Number(f[ix.Semana]);
    if (off < 0 || !clanTag || !jugador || isNaN(temporada) || isNaN(semana)) continue;
    var clave = clanTag + '|' + temporada + '|' + semana;
    var ks = clave + '|' + jugador;
    var s = series[ks];
    if (!s) { s = series[ks] = { clave: clave, fame: [null, null, null, null] }; ordenSeries.push(ks); }
    s.fame[off] = Number(f[ix.Fame]) || 0;
    var g = salida[clave];
    if (!g) g = salida[clave] = { clanTag: clanTag, temporada: temporada, semana: semana, nombre: '', dias: [0, 0, 0, 0], jugadores: 0, diasSinFila: 0, anomalias: 0 };
    g.nombre = String(f[ix.Clan] || '').trim() || g.nombre;
  }
  ordenSeries.forEach(function (ks) {
    var s = series[ks], g = salida[s.clave];
    g.jugadores++;
    var previo = 0, vistoAlguno = false, huecos = 0;
    var ultimo = -1;
    for (var d = 0; d < 4; d++) { if (s.fame[d] !== null) ultimo = d; }
    for (var d2 = 0; d2 <= ultimo; d2++) {
      if (s.fame[d2] === null) { huecos++; continue; }
      var delta = s.fame[d2] - previo;
      if (delta < 0) { g.anomalias++; delta = 0; } else previo = s.fame[d2];
      g.dias[d2] += delta;
      vistoAlguno = true;
    }
    if (vistoAlguno) g.diasSinFila += huecos;
  });
  return salida;
}

/**
 * _cmaFilasMedallasDia_(hoja, diasApi, ternaTags, capturado) — arma las filas de Control_Medallas_Dia.csv (§PF584 parte 4, opción A). Función pura.
 * `hoja`: lo que devuelve _cmaMedallasDiaHoja_(); `diasApi`: lo que devuelve _cmaDiasApiPorSemana_() ({ 'TAG|temporada|semana': { J, V, S, D } }, solo clanes Terna).
 * Una fila por clan Terna, semana y día con medallas en la hoja o con dato de la API. Estado: `cuadra` o `difiere` (residuo = hoja − API) si la API tiene ese día;
 * `sin dato api` si no (semanas anteriores a la parte 2, o el domingo antes del cierre). Orden: temporada, semana, clan y día.
 */
function _cmaFilasMedallasDia_(hoja, diasApi, ternaTags, capturado) {
  var filas = [];
  var propios = {};
  (ternaTags || []).forEach(function (t) { propios[String(t || '').trim().toUpperCase()] = true; });
  var claves = Object.keys(hoja || {}).filter(function (k) { return propios[hoja[k].clanTag]; }).sort(function (a, b) {
    var x = hoja[a], y = hoja[b];
    return (x.temporada - y.temporada) || (x.semana - y.semana) || (x.clanTag < y.clanTag ? -1 : (x.clanTag > y.clanTag ? 1 : 0));
  });
  claves.forEach(function (k) {
    var g = hoja[k], api = (diasApi && diasApi[k]) || {};
    for (var d = 0; d < 4; d++) {
      var letra = CMA_LETRAS_DIAS.charAt(d);
      var tieneApi = api[letra] !== undefined;
      if (!tieneApi && !g.dias[d]) continue;
      var residuo = tieneApi ? g.dias[d] - api[letra] : '';
      filas.push([g.temporada, g.semana, letra, g.nombre, g.clanTag, g.dias[d], tieneApi ? api[letra] : '', residuo,
        tieneApi ? (residuo === 0 ? 'cuadra' : 'difiere') : 'sin dato api', g.jugadores, g.diasSinFila, g.anomalias, capturado]);
    }
  });
  return filas;
}

/**
 * _cmaMezclarFilasDia_(existentes, nuevas) — une las filas nuevas con las de Control_Medallas_Dia.csv (§PF584 parte 4, opción A). Función pura.
 * Clave = Tag + Temporada + Semana + Día. Fila nueva: se agrega. Misma clave: solo cambia si algún valor es distinto (`Capturado` no cuenta, para que una corrida
 * sin novedades no reescriba el archivo). Las filas del archivo que esta corrida no recalcula se conservan.
 * Devuelve { ok, filas, nuevas, actualizadas }; ok = false si el encabezado del archivo no es el esperado (no se toca: se avisa).
 */
function _cmaMezclarFilasDia_(existentes, nuevas) {
  var res = { ok: true, filas: [], nuevas: 0, actualizadas: 0 };
  var enc = CMD_ENCABEZADOS.join('\t');
  var base = (existentes && existentes.length) ? existentes.map(function (f) { return f.slice(); }) : [CMD_ENCABEZADOS.slice()];
  if (base[0].join('\t') !== enc) { res.ok = false; res.filas = base; return res; }
  var indice = {};
  for (var i = 1; i < base.length; i++) indice[String(base[i][4]) + '|' + String(base[i][0]) + '|' + String(base[i][1]) + '|' + String(base[i][2])] = i;
  var ultimo = CMD_ENCABEZADOS.length - 1;   // Capturado
  (nuevas || []).forEach(function (n) {
    var f = n.map(function (v) { return (v === null || v === undefined) ? '' : String(v); });
    var k = f[4] + '|' + f[0] + '|' + f[1] + '|' + f[2];
    var pos = indice[k];
    if (pos === undefined) { base.push(f); indice[k] = base.length - 1; res.nuevas++; return; }
    var viejo = base[pos].map(String);
    var igual = true;
    for (var c = 0; c < ultimo; c++) { if (viejo[c] !== f[c]) { igual = false; break; } }
    if (igual) return;
    base[pos] = f; res.actualizadas++;
  });
  res.filas = base;
  return res;
}
