/**
 * 54_Correccion_AtaquesSemana_Anomalias.gs
 *
 * Corrige filas puntuales de Backup_Guerra (CSV de Drive y, si corresponde, la hoja Guerra)
 * que informeAnomaliasAtaquesSemana() marcó como SUMA_CLANES_MAYOR_16: series en las que la suma
 * del AtaquesSemana final de cada clan supera el tope de 16 (4 días x 4 ataques).
 *
 * Criterio (validado con la usuaria el 19-oct-2026):
 *  - Cada clan lleva su propio registro de la persona (su JSON), sin mezclar con otros clanes.
 *  - Entre todos los clanes el tope es 4 ataques por día y 16 por semana.
 *  - NO se usa la propuesta automática "USAR_SUMA_HOY": la suma de AtaquesHoy subestima cuando
 *    faltan días en las filas. Cada fila a corregir está escrita a mano abajo, con el valor
 *    comprobado contra la tabla del propio clan en RoyaleAPI o contra el Historial.
 *  - Cada corrección lleva los valores ESPERADOS de la fila. Si la fila ya no los tiene
 *    (alguien la tocó), no se modifica y se avisa en el informe.
 *
 * Uso (igual que las demás reparaciones):
 *  1) corregirAnomaliasAtaquesSemanaInforme()  -> no escribe nada; deja un CSV en Informes.
 *  2) corregirAnomaliasAtaquesSemanaAplicar()  -> respalda Backup_Guerra.csv, aplica y verifica.
 */

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Anomalías de ataques por semana: informe y aplicar
//  Parte 2 — Funciones que no se corren a mano
//    - Anomalías de ataques por semana: motor común y evaluación
//    - Anomalías de ataques por semana: lectores pequeños
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// Solo se corrigen filas que tengan los valores "esperado". Los nombres de clan usan escapes Unicode:
//   乂 = el caracter chino del clan principal   ™ = el simbolo de marca registrada
var ANOM_ATQSEM_CORRECCIONES = [
  {
    temporada: 4, semana: 1, tag: '#2C982888C', clan: 'GrupoXTerna™2', periodIndex: 3,
    esperado: { hoy: 0, sem: 4, fame: 400, barcos: 0 },
    nuevo:    { hoy: 0, sem: 0, fame: 0,   barcos: 0 },
    motivo: 'Tabla de GrupoXTerna™2 en RoyaleAPI (semana 135-1): 0 mazos y 0 de fama. Los 4 / 400 del jueves no son de este clan.'
  },
  {
    temporada: 2, semana: 3, tag: '#LRQ8YJRCU', clan: 'GrupoXTerna™2', periodIndex: 14,
    esperado: { hoy: 4, sem: 11, fame: 1200, barcos: 0 },
    nuevo:    { hoy: 0, sem: 0,  fame: 0,    barcos: 0 },
    motivo: 'Lunes (dia de entrenamiento, sin ataques). Es copia del cierre de la semana 2 (4 / 11 / 1200). El cierre de la semana 3 es 16 en Grupo乂Terna™ (Historial).'
  },
  {
    temporada: 2, semana: 2, tag: '#LRQ8YJRCU', clan: 'GrupoXTerna™2', periodIndex: 7,
    esperado: { hoy: 4, sem: 16, fame: 2700, barcos: 0 },
    nuevo:    { hoy: 0, sem: 0,  fame: 0,    barcos: 0 },
    motivo: 'Lunes (dia de entrenamiento, sin ataques). Valores de la semana anterior arrastrados; no cambia el cierre de la semana (11, confirmado por el Historial).'
  },
  {
    temporada: 2, semana: 2, tag: '#LRQ8YJRCU', clan: 'Grupo乂Terna™', periodIndex: 13,
    esperado: { hoy: 4, sem: 11, fame: 1200, barcos: 0 },
    nuevo:    { hoy: 0, sem: 0,  fame: 0,    barcos: 0 },
    motivo: 'Domingo. Perfil de RoyaleAPI (semana 133-2): solo figura GrupoXTerna™2 con 11 ataques y 1200; Grupo乂Terna™ no tiene fila esa semana. El cotejo con el JSON marca estos 11 / 1200 como de otro clan.'
  }
];

// Filas detectadas pero SIN decidir: el informe las lista y NO se tocan (hoy no queda ninguna).
var ANOM_ATQSEM_PENDIENTES = [];

var ANOM_ATQSEM_TOPE_SEMANA = 16;

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Anomalías de ataques por semana: informe y aplicar -----

function corregirAnomaliasAtaquesSemanaInforme() { _corregirAnomaliasAtaquesSemana_(false); }

function corregirAnomaliasAtaquesSemanaAplicar() { _corregirAnomaliasAtaquesSemana_(true); }

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Anomalías de ataques por semana: motor común y evaluación -----

function _corregirAnomaliasAtaquesSemana_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[AnomaliasAtaquesSemana] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var ss = _getSs();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var informe = [['Fuente', 'Estado', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'PeriodIndex',
      'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana anterior', 'AtaquesSemana nueva',
      'Fame anterior', 'Fame nueva', 'Barcos anterior', 'Barcos nuevo', 'Origen anterior', 'Motivo']];

    var agregarAlInforme = function (fuente, filas, ev) {
      ev.cambios.forEach(function (x) {
        var f = filas[x.idx], a = _anomAtqSemValores_(f), n = x.corr.nuevo;
        informe.push([fuente, 'Cambio', x.corr.temporada, x.corr.semana, x.corr.tag, f[GC.NOMBRE - 1], x.corr.clan, x.corr.periodIndex,
          a.hoy, n.hoy, a.sem, n.sem, a.fame, n.fame, a.barcos, n.barcos, f[GC.ORIGEN - 1], x.corr.motivo]);
      });
      ev.yaAplicados.forEach(function (c) {
        informe.push([fuente, 'Ya aplicado', c.temporada, c.semana, c.tag, '', c.clan, c.periodIndex, '', c.nuevo.hoy, '', c.nuevo.sem, '', c.nuevo.fame, '', c.nuevo.barcos, '', c.motivo]);
      });
      ev.sinResolver.forEach(function (s) {
        informe.push([fuente, 'SIN RESOLVER', s.corr.temporada, s.corr.semana, s.corr.tag, '', s.corr.clan, s.corr.periodIndex, '', '', '', '', '', '', '', '', '', s.motivo]);
      });
      ev.pendientes.forEach(function (x) {
        var f = filas[x.idx], a = _anomAtqSemValores_(f);
        informe.push([fuente, 'PENDIENTE (no se toca)', x.pend.temporada, x.pend.semana, x.pend.tag, f[GC.NOMBRE - 1], x.pend.clan, x.pend.periodIndex,
          a.hoy, '', a.sem, '', a.fame, '', a.barcos, '', f[GC.ORIGEN - 1], x.pend.motivo]);
      });
    };

    // --- Backup_Guerra.csv (temporadas anteriores; aqui estan T2, T3 y T4) ---
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezadoCsv = null, filasCsv = null, evCsv = null, sumasAntesCsv = '';
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed && parsed.length > 1) {
        encabezadoCsv = parsed[0];
        filasCsv = parsed.slice(1);
        for (var a = 0; a < filasCsv.length; a++) { while (filasCsv[a].length < GUERRA_TOTAL_COLS) filasCsv[a].push(''); }
        evCsv = _anomAtqSemEvaluar_(filasCsv);
        sumasAntesCsv = _anomAtqSemTextoSumas_(filasCsv);
        agregarAlInforme('Backup_Guerra.csv', filasCsv, evCsv);
      }
    }

    // --- Hoja Guerra (temporada vigente; normalmente no contiene estas filas) ---
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    var datosHoja = null, evHoja = null;
    if (sh && sh.getLastRow() >= 2) {
      datosHoja = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
      evHoja = _anomAtqSemEvaluar_(datosHoja);
      // En la hoja solo interesa lo que realmente encuentre; "no se encontro" no es un error alli.
      evHoja.sinResolver = evHoja.sinResolver.filter(function (s) { return s.motivo.indexOf('No se encontro') !== 0; });
      evHoja.yaAplicados = [];
      agregarAlInforme('Hoja Guerra', datosHoja, evHoja);
    }

    var nCsv = evCsv ? evCsv.cambios.length : 0;
    var nHoja = evHoja ? evHoja.cambios.length : 0;
    var nSinResolver = (evCsv ? evCsv.sinResolver.length : 0) + (evHoja ? evHoja.sinResolver.length : 0);
    var nPendientes = (evCsv ? evCsv.pendientes.length : 0);

    var nombreInforme = 'Reparacion_AtaquesSemanaAnomalias ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSVInforme(informe));

    var verificacion = '';
    if (aplicar && (nCsv > 0 || nHoja > 0)) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      if (csvText) _saveCSVToDrive('Backup_Guerra ANTES de reparar AtaquesSemanaAnomalias ' + marca + '.csv', csvText);

      var aplicarEnFila = function (fila, n) {
        fila[GC.ATAQUES_HOY - 1] = String(n.hoy);
        fila[GC.ATAQUES_SEM - 1] = String(n.sem);
        fila[GC.FAME - 1] = String(n.fame);
        fila[GC.BARCOS - 1] = String(n.barcos);
        var og = String(fila[GC.ORIGEN - 1] || '').trim();
        if (og === '' || og === 'Original') fila[GC.ORIGEN - 1] = 'Corregido';
      };

      if (evCsv && evCsv.cambios.length) {
        evCsv.cambios.forEach(function (x) { aplicarEnFila(filasCsv[x.idx], x.corr.nuevo); });
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezadoCsv].concat(filasCsv)));
      }
      if (evHoja && evHoja.cambios.length) {
        evHoja.cambios.forEach(function (x) { aplicarEnFila(datosHoja[x.idx], x.corr.nuevo); });
        var col = function (idx1) { return datosHoja.map(function (r) { return [r[idx1 - 1]]; }); };
        sh.getRange(2, GC.ATAQUES_HOY, datosHoja.length, 1).setValues(col(GC.ATAQUES_HOY));
        sh.getRange(2, GC.ATAQUES_SEM, datosHoja.length, 1).setValues(col(GC.ATAQUES_SEM));
        sh.getRange(2, GC.FAME, datosHoja.length, 1).setValues(col(GC.FAME));
        sh.getRange(2, GC.BARCOS, datosHoja.length, 1).setValues(col(GC.BARCOS));
        sh.getRange(2, GC.ORIGEN, datosHoja.length, 1).setValues(col(GC.ORIGEN));
        _syncGuerraCSV(sh);
      }

      // Verificacion: se vuelve a leer el CSV desde Drive y se comprueba cada fila y el total de filas.
      var problemas = [];
      var csvDespues = _loadCSVFromDrive('Backup_Guerra.csv');
      var parsedDespues = csvDespues ? _parseCSV(csvDespues) : null;
      if (!parsedDespues || parsedDespues.length < 2) {
        problemas.push('No se pudo releer Backup_Guerra.csv');
      } else {
        var filasDespues = parsedDespues.slice(1);
        for (var b = 0; b < filasDespues.length; b++) { while (filasDespues[b].length < GUERRA_TOTAL_COLS) filasDespues[b].push(''); }
        if (filasCsv && filasDespues.length !== filasCsv.length) problemas.push('El numero de filas cambio (' + filasCsv.length + ' -> ' + filasDespues.length + ')');
        if (evCsv) {
          var evDespues = _anomAtqSemEvaluar_(filasDespues);
          if (evDespues.cambios.length) problemas.push(evDespues.cambios.length + ' fila(s) siguen sin corregir');
          var esperadasAplicadas = evCsv.cambios.length + evCsv.yaAplicados.length;
          if (evDespues.yaAplicados.length !== esperadasAplicadas) problemas.push('Filas ya corregidas: ' + evDespues.yaAplicados.length + ' en vez de ' + esperadasAplicadas);
          verificacion = 'Sumas de AtaquesSemana por clan despues: ' + _anomAtqSemTextoSumas_(filasDespues) + '. ';
        }
      }
      verificacion += problemas.length ? 'VERIFICACION FALLO: ' + problemas.join('; ') + '. Restaurar con el respaldo "Backup_Guerra ANTES de reparar AtaquesSemanaAnomalias ' + marca + '.csv".' : 'Verificacion OK.';
    }

    Logger.log('[AnomaliasAtaquesSemana] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). ' +
      'Backup_Guerra.csv: ' + nCsv + ' fila(s) a corregir, ' + (evCsv ? evCsv.yaAplicados.length : 0) + ' ya aplicadas. ' +
      'Hoja Guerra: ' + nHoja + ' fila(s) a corregir. Sin resolver: ' + nSinResolver + '. Pendientes sin decidir (no se tocan): ' + nPendientes + '. ' +
      (sumasAntesCsv ? 'Sumas de AtaquesSemana por clan antes: ' + sumasAntesCsv + '. ' : '') +
      (verificacion ? verificacion + ' ' : '') +
      (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay nada que corregir.') +
      (aplicar ? '' : ' (No se escribio nada; correr corregirAnomaliasAtaquesSemanaAplicar() para aplicar.)'));
  } finally {
    lock.releaseLock();
  }
}

/**
 * Evalua las correcciones sobre un conjunto de filas (CSV u hoja). No modifica nada.
 * Devuelve { cambios: [{idx, corr}], yaAplicados: [corr], sinResolver: [{corr, motivo}], pendientes: [{idx, pend}] }.
 */
function _anomAtqSemEvaluar_(filas) {
  var res = { cambios: [], yaAplicados: [], sinResolver: [], pendientes: [] };
  ANOM_ATQSEM_CORRECCIONES.forEach(function (c) {
    var idxs = [];
    for (var i = 0; i < filas.length; i++) { if (_anomAtqSemCoincide_(filas[i], c)) idxs.push(i); }
    if (idxs.length === 0) { res.sinResolver.push({ corr: c, motivo: 'No se encontro la fila (T' + c.temporada + ' S' + c.semana + ' ' + c.tag + ' PI' + c.periodIndex + ')' }); return; }
    if (idxs.length > 1) { res.sinResolver.push({ corr: c, motivo: 'Hay ' + idxs.length + ' filas que coinciden; no se toca ninguna' }); return; }
    var actual = _anomAtqSemValores_(filas[idxs[0]]);
    if (_anomAtqSemIguales_(actual, c.nuevo)) { res.yaAplicados.push(c); return; }
    if (!_anomAtqSemIguales_(actual, c.esperado)) {
      res.sinResolver.push({ corr: c, motivo: 'La fila ya no tiene los valores esperados (hoy ' + actual.hoy + ', sem ' + actual.sem + ', fame ' + actual.fame + ', barcos ' + actual.barcos + '); no se toca' });
      return;
    }
    res.cambios.push({ idx: idxs[0], corr: c });
  });
  ANOM_ATQSEM_PENDIENTES.forEach(function (p) {
    for (var i = 0; i < filas.length; i++) { if (_anomAtqSemCoincide_(filas[i], p)) { res.pendientes.push({ idx: i, pend: p }); break; } }
  });
  return res;
}

function _anomAtqSemCoincide_(f, c) {
  return _anomAtqSemTag_(f[GC.TAG - 1]) === c.tag &&
    _anomAtqSemNum_(f[GC.TEMPORADA - 1]) === c.temporada &&
    _anomAtqSemNum_(f[GC.SEMANA - 1]) === c.semana &&
    _anomAtqSemNum_(f[GC.PERIOD_IDX - 1]) === c.periodIndex &&
    _anomAtqSemClan_(f[GC.CLAN - 1]) === c.clan;
}

function _anomAtqSemValores_(f) {
  return {
    hoy: _anomAtqSemNum_(f[GC.ATAQUES_HOY - 1]),
    sem: _anomAtqSemNum_(f[GC.ATAQUES_SEM - 1]),
    fame: _anomAtqSemNum_(f[GC.FAME - 1]),
    barcos: _anomAtqSemNum_(f[GC.BARCOS - 1])
  };
}

function _anomAtqSemIguales_(a, b) {
  return a.hoy === b.hoy && a.sem === b.sem && a.fame === b.fame && a.barcos === b.barcos;
}

function _anomAtqSemTextoSumas_(filas) {
  return _anomAtqSemSeriesAfectadas_().map(function (s) {
    var r = _anomAtqSemSumaClanes_(filas, s.tag, s.temporada, s.semana);
    return 'T' + s.temporada + 'S' + s.semana + ' ' + s.tag + ': ' + r.total + (r.total > ANOM_ATQSEM_TOPE_SEMANA ? ' (> ' + ANOM_ATQSEM_TOPE_SEMANA + ')' : '');
  }).join(' | ');
}

/**
 * Suma, por clan, el AtaquesSemana de la ultima fila (mayor PeriodIndex) de la persona en la semana.
 * Devuelve { total: N, porClan: { clan: N } }.
 */
function _anomAtqSemSumaClanes_(filas, tag, temporada, semana) {
  var ultimo = {};
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (_anomAtqSemTag_(f[GC.TAG - 1]) !== tag) continue;
    if (_anomAtqSemNum_(f[GC.TEMPORADA - 1]) !== temporada) continue;
    if (_anomAtqSemNum_(f[GC.SEMANA - 1]) !== semana) continue;
    var clan = _anomAtqSemClan_(f[GC.CLAN - 1]);
    var p = _anomAtqSemNum_(f[GC.PERIOD_IDX - 1]);
    if (!ultimo[clan] || p >= ultimo[clan].p) ultimo[clan] = { p: p, sem: _anomAtqSemNum_(f[GC.ATAQUES_SEM - 1]) };
  }
  var res = { total: 0, porClan: {} };
  Object.keys(ultimo).forEach(function (c) { res.porClan[c] = ultimo[c].sem; res.total += ultimo[c].sem; });
  return res;
}

function _anomAtqSemSeriesAfectadas_() {
  var vistas = {}, lista = [];
  ANOM_ATQSEM_CORRECCIONES.concat(ANOM_ATQSEM_PENDIENTES).forEach(function (c) {
    var k = c.tag + '|' + c.temporada + '|' + c.semana;
    if (!vistas[k]) { vistas[k] = true; lista.push({ tag: c.tag, temporada: c.temporada, semana: c.semana }); }
  });
  return lista;
}

// ----- Anomalías de ataques por semana: lectores pequeños -----

function _anomAtqSemNum_(v) {
  var n = Number(String(v === null || v === undefined ? '' : v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

// Misma normalizacion que usa informeAnomaliasAtaquesSemana() (48_Herramientas_Debug.gs).
function _anomAtqSemTag_(v) { return String(v === null || v === undefined ? '' : v).trim().toUpperCase(); }

function _anomAtqSemClan_(v) { return String(v === null || v === undefined ? '' : v).split(/\r?\n/)[0].trim(); }
