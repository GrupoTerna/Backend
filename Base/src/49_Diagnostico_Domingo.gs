// ==============================================================================
//49_Diagnostico_Domingo.gs
// Repara los ataques del domingo 04-oct-2026 (T5 S4, periodIndex 27) que quedaron en 0 por sobrescritura sin ratchet en updateGuerraSheet(). [→ Contexto_Base_Web.md §49B001]
// ==============================================================================
// (05-oct-2026) Fuente JSON de currentriverrace, reglas de seguridad, límite, ESTADO de la corrida (5 SIN RESOLVER) y fuentes pendientes. Uso: Informe y luego Aplicar. [→ Contexto_Base_Web.md §49B002]
function repararDomingoT5S4Informe() { _repararDomingoT5S4_(false); }
function repararDomingoT5S4Aplicar() { _repararDomingoT5S4_(true); }

function _repararDomingoT5S4_(aplicar) {
  // 26-oct-2026: la temporada objetivo ya no es el 5 fijo. El domingo 04-oct-2026 es la temporada 136 de RoyaleAPI, que no cambia al reenumerar;
  // la numeración propia sí (RoyaleAPI = propia + offset, y la reenumeración resta el delta al offset). Con el offset de arranque (131) da 5, igual que antes.
  var TEMP_ROYALEAPI_OBJ = 136;
  var TEMP_OBJ = TEMP_ROYALEAPI_OBJ - _getTemporadaOffsetRoyaleApi(), SEM_OBJ = 4, P_SAB = 26, P_DOM = 27; // semana y periodIndex no cambian al reenumerar
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[ReparoDomT5S4] Hay otra ejecucion en curso; se cancela. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var tz = Session.getScriptTimeZone();
    var marca = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH.mm.ss');
    var C = { TEMP: 2, SEM: 3, PIDX: 5 }; // indices 0-based (columnas C, D, F)
    var iClan = GC.CLAN - 1, iTag = GC.TAG - 1, iNom = GC.NOMBRE - 1, iHoy = GC.ATAQUES_HOY - 1, iSem = GC.ATAQUES_SEM - 1, iOri = GC.ORIGEN - 1;
    var n = function (x) { return Number(x) || 0; };

    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    if (!csvText) { Logger.log('[ReparoDomT5S4] No se pudo leer Backup_Guerra.csv.'); return; }
    var parsed = _parseCSV(csvText);
    if (!parsed || parsed.length < 2) { Logger.log('[ReparoDomT5S4] Backup_Guerra.csv vacio.'); return; }
    var encabezado = parsed[0], filas = parsed.slice(1);
    for (var a = 0; a < filas.length; a++) { while (filas[a].length < GUERRA_TOTAL_COLS) filas[a].push(''); }

    // Fila del sabado por tag|clan (para validar el acumulado).
    var sab = {};
    filas.forEach(function (r) {
      if (n(r[C.TEMP]) !== TEMP_OBJ || n(r[C.SEM]) !== SEM_OBJ || n(r[C.PIDX]) !== P_SAB) return;
      sab[String(r[iTag] || '').trim().toUpperCase() + '|' + String(r[iClan] || '')] = r;
    });

    var lector = _crearLectorDiaJSONGuerra_(t0);
    var informe = [['Tag', 'Nombre', 'Clan', 'Resultado', 'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana anterior', 'AtaquesSemana nueva', 'Detalle']];
    var cambios = [], res = { filas: 0, cambian: 0, igual: 0, sinResolver: 0, ataquesRecuperados: 0 };

    for (var i = 0; i < filas.length; i++) {
      var r = filas[i];
      if (n(r[C.TEMP]) !== TEMP_OBJ || n(r[C.SEM]) !== SEM_OBJ || n(r[C.PIDX]) !== P_DOM) continue;
      res.filas++;
      var tag = String(r[iTag] || '').trim().toUpperCase(), clan = String(r[iClan] || ''), nom = String(r[iNom] || tag);
      var hAnt = n(r[iHoy]), sAnt = n(r[iSem]);
      var sinRes = function (motivo) { res.sinResolver++; informe.push([tag, nom, clan, 'SIN RESOLVER', hAnt, '', sAnt, '', motivo]); };

      var jd = lector.leer(clan, TEMP_OBJ, P_DOM, tag);
      if (jd.estado === 'tiempo') { sinRes('se acabo el tiempo de lectura (volver a correr)'); continue; }
      if (jd.estado !== 'ok') { sinRes('JSON del domingo: ' + jd.estado + (jd.motivo ? ' (' + jd.motivo + ')' : '')); continue; }
      var d = n(jd.d), t = n(jd.t);
      if (t > 4 || t > d) { sinRes('datos incoherentes en el JSON (decksUsed=' + d + ', decksUsedToday=' + t + ')'); continue; }
      var acumSab = d - t;

      var fs = sab[tag + '|' + clan];
      if (fs && n(fs[iSem]) !== acumSab) { sinRes('el acumulado del JSON (' + acumSab + ') no coincide con AtaquesSemana de su fila del sabado (' + n(fs[iSem]) + ')'); continue; }

      var hNuevo = t, nota = 'JSON ' + jd.hora + ': decksUsed=' + d + ', decksUsedToday=' + t + ', acumulado sabado=' + acumSab + '. ';
      if (sAnt > acumSab) {
        var deFila = sAnt - acumSab;
        if (deFila > 4) { sinRes('AtaquesSemana de la fila del domingo (' + sAnt + ') supera en ' + deFila + ' al acumulado del sabado (' + acumSab + '): revisar a mano'); continue; }
        if (deFila > hNuevo) { hNuevo = deFila; nota += 'Se usa el domingo que sale del AtaquesSemana de la fila (' + deFila + '), mayor que el del JSON. '; }
      }
      var sNuevo = acumSab + hNuevo;
      if (hNuevo < 4 && sNuevo < 16) nota += 'Minimo: pudo atacar despues de la captura del JSON. ';

      if (hNuevo === hAnt && sNuevo === sAnt) { res.igual++; continue; }
      res.cambian++;
      res.ataquesRecuperados += (hNuevo - hAnt);
      cambios.push({ idx: i, h: hNuevo, s: sNuevo });
      informe.push([tag, nom, clan, 'CAMBIO', hAnt, hNuevo, sAnt, sNuevo, nota]);
    }

    var nombreInforme = 'Reparacion_Domingo_T' + TEMP_OBJ + 'S' + SEM_OBJ + ' ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSVInforme(informe));

    if (aplicar && cambios.length) {
      _saveCSVToDrive('Backup_Guerra ANTES de reparar Domingo T' + TEMP_OBJ + 'S' + SEM_OBJ + ' ' + marca + '.csv', csvText); // respaldo previo
      cambios.forEach(function (c) {
        var fila = filas[c.idx];
        fila[iHoy] = String(c.h);
        fila[iSem] = String(c.s);
        var og = String(fila[iOri] || '').trim();
        if (og === '' || og === 'Original') fila[iOri] = 'Corregido';
      });
      _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezado].concat(filas)));
    }

    Logger.log('[ReparoDomT5S4] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). Filas del domingo 04-oct-2026 (T' + TEMP_OBJ + ' S' + SEM_OBJ + ', RoyaleAPI ' + TEMP_ROYALEAPI_OBJ + '): ' + res.filas +
      ' | a cambiar: ' + res.cambian + ' (ataques recuperados: ' + res.ataquesRecuperados + ') | ya correctas: ' + res.igual + ' | sin resolver: ' + res.sinResolver +
      (informe.length > 1 ? ' | Detalle en Drive: ' + nombreInforme : ' | Nada que reparar.') +
      (lector.agotado() ? ' | SE ACABO EL TIEMPO: volver a correr.' : '') +
      (aplicar ? '' : ' | No se escribio nada en Backup_Guerra.csv; correr repararDomingoT5S4Aplicar() para aplicar.'));
  } finally {
    lock.releaseLock();
  }
}
// =============================================================================
// Diagnostico_Guerra
// =============================================================================
// Diagnóstico de solo lectura (06-oct-2026): confirma por qué el domingo 4-oct no tiene filas en Guerra (hipótesis: purga de temporada antes del respaldo CSV). [→ Contexto_Base_Web.md §49B003]
// =============================================================================

function _diagnosticoGuerraDia(temporada, semana, offsetDia) {
  var temp = String(temporada === undefined ? (136 - _getTemporadaOffsetRoyaleApi()) : temporada); // 26-oct-2026: 136 = RoyaleAPI del 04-oct-2026; sigue la reenumeración (antes 5 fijo)
  var sem = Number(semana === undefined ? 4 : semana);
  var off = Number(offsetDia === undefined ? 3 : offsetDia); // 0=jue, 1=vie, 2=sáb, 3=dom
  var pIdxBuscado = (sem - 1) * 7 + 3 + off;

  function resumir(filas, etiqueta) {
    var porDia = {};   // PeriodIndex -> { filas, clanes:{}, maxAtaques }
    var ultimaFecha = null;
    for (var i = 0; i < filas.length; i++) {
      var f = filas[i];
      if (String(f[GC.TEMPORADA - 1] || '') !== temp) continue;
      if (Number(f[GC.SEMANA - 1]) !== sem) continue;
      var p = Number(f[GC.PERIOD_IDX - 1]);
      var d = porDia[p] || (porDia[p] = { filas: 0, clanes: {}, maxAtaques: 0 });
      d.filas++;
      d.clanes[String(f[GC.CLAN - 1] || '').trim()] = true;
      d.maxAtaques = Math.max(d.maxAtaques, Number(f[GC.ATAQUES_HOY - 1]) || 0);
      var fe = f[GC.FECHA - 1];
      if (fe) ultimaFecha = fe;
    }
    Logger.log('--- ' + etiqueta + ': temporada ' + temp + ', semana ' + sem + ' ---');
    var claves = Object.keys(porDia).map(Number).sort(function (a, b) { return a - b; });
    if (!claves.length) Logger.log('   (sin ninguna fila de esa temporada y semana)');
    claves.forEach(function (p) {
      var d = porDia[p];
      Logger.log('   PeriodIndex ' + p + (p === pIdxBuscado ? '  <== día buscado' : '') + ': ' + d.filas + ' fila(s), ' +
        Object.keys(d.clanes).length + ' clan(es), máx. AtaquesHoy visto = ' + d.maxAtaques);
    });
    Logger.log('   ¿Hay filas del día buscado (PeriodIndex ' + pIdxBuscado + ')? ' + (porDia[pIdxBuscado] ? 'SÍ' : 'NO'));
    return !!porDia[pIdxBuscado];
  }

  var enHoja = false, enCsv = false;

  try {
    var sh = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
    if (sh && sh.getLastRow() >= 2) {
      var dataHoja = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
      enHoja = resumir(dataHoja, 'Hoja Guerra (' + dataHoja.length + ' filas en total)');
    } else {
      Logger.log('--- Hoja Guerra: vacía o inexistente ---');
    }
  } catch (e1) { Logger.log('No pude leer la hoja Guerra: ' + e1.message); }

  try {
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    if (csvText) {
      var parsed = _parseCSV(csvText);
      var dataCsv = (parsed && parsed.length > 1) ? parsed.slice(1) : [];
      enCsv = resumir(dataCsv, 'Backup_Guerra.csv (' + dataCsv.length + ' filas en total)');
    } else {
      Logger.log('--- Backup_Guerra.csv: no encontrado o vacío ---');
    }
  } catch (e2) { Logger.log('No pude leer Backup_Guerra.csv: ' + e2.message); }

  var veredicto;
  if (enHoja || enCsv) veredicto = 'El día SÍ tiene filas (' + (enHoja ? 'hoja' : '') + (enHoja && enCsv ? ' y ' : '') + (enCsv ? 'CSV' : '') + '): el problema no es que falten, revisar cómo se leen.';
  else veredicto = 'El día NO tiene filas ni en la hoja ni en el CSV: se perdieron antes de respaldarse (compatible con la hipótesis de la purga del cambio de temporada). Las filas de Guerra_Logs y el JSON de Drive pueden servir para reconstruirlas.';
  Logger.log('VEREDICTO: ' + veredicto);
  return veredicto;
}