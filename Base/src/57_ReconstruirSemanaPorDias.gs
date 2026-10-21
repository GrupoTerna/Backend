/**
 * 57_ReconstruirSemanaPorDias.gs
 *
 * Reconstruye, por jugador y clan, los ataques, barcos y fame de CADA día de una semana de guerra (jueves a domingo) en
 * Backup_Guerra.csv a partir de lo registrado, del total semanal de RoyaleAPI y, si existe, de CurrentRiverRace.
 * Reemplaza a la escritura de «AplicarTotalesSemana_Historial» (que solo ponía el total en la última fila). Contexto_Base_Web.md §PF139.
 *
 * Entradas (Drive):
 *   aplicarTotalesSemanaDesdeHistorialInforme() -> SOLO INFORMA: CSV de series y CSV del plan. No escribe nada en el Backup.
 *   aplicarTotalesSemanaDesdeHistorialAplicar() -> respaldo previo, escribe, y verifica releyendo el CSV.
 *   (las dos llaman a _totSemanaPorDias_(aplicar); sus nombres se mantienen y están en 48_Herramientas_Debug.gs)
 *
 * El modelo (decisiones de la usuaria, 21-oct-2026):
 *  - Cada día es una terna (ataques, barcos, fame) de la tabla de fame (_fameTablaDia_()). No se editan por separado.
 *  - El acumulado de la semana al final del domingo es el total CERRADO de RoyaleAPI (los JSON que ya lee completarDomingoDesdeJsonRoyaleApi; una semana sin cerrar no se toca).
 *  - Cada fila registrada es un acumulado al momento de registrarla. Si el registro fue temprano, le faltan ataques o medallas: el verdadero
 *    acumulado de ese día es MAYOR que el registrado. Si no, es igual. Se sabe cuál es el caso por las diferencias:
 *    AtaquesSemana - AtaquesHoy de una fila = ataques hechos hasta el día anterior (jueves = viernes, y así).
 *  - Una fila puede traer el acumulado de un día POSTERIOR (el total puesto en la última fila que existía, como pasó en T3 S1 a S3): se prueba
 *    que cada fila corresponda a su día o a uno de los días siguientes hasta la próxima fila (primero lo menos desplazado).
 *  - Se buscan TODAS las combinaciones de ternas de los cuatro días que cumplan eso y sumen el total. Con una sola, es definitiva
 *    («Solución única»). Con varias, se elige la que menos cambia lo registrado y, a igualdad, la que reparte de domingo a jueves
 *    («Solución estimada»). Los días con la misma terna en todas las soluciones se marcan «única» aunque la semana sea ambigua.
 *  - CurrentRiverRace (módulo 56), si hay, fija los ataques y la fame de cada día que tenga dato. Si con eso no hay solución, se avisa
 *    y se reparte sin él (misma decisión de las tandas anteriores de §PF139).
 *  - Se corrigen las filas existentes que no coinciden y se CREAN las que faltan (Origen 'Reconstruido - Solución ...').
 *  - Si ningún reparto cumple los registros y el total, no se escribe y la serie queda en el informe y en Revision_Guerra.csv.
 * Reutiliza de 55_Reparar_DiasConExceso.gs la agrupación, la creación de filas, la aplicación del plan y la verificación.
 */

var RS_MAX_FILAS = 2500;     // tope de filas a modificar + crear en una escritura (si se pasa, no se escribe nada)
var RS_MS_LIMITE = 270000;   // tiempo máximo de planificación (ms); lo que falte se deja para otra corrida

var RS_NIVELES = [
  { nombre: 'estricto con AtaquesHoy y CurrentRiverRace', estricto: true, hoy: true, crr: true },
  { nombre: 'estricto con AtaquesHoy', estricto: true, hoy: true, crr: false },
  { nombre: 'estricto sin AtaquesHoy', estricto: true, hoy: false, crr: false },
  { nombre: 'relajado con AtaquesHoy', estricto: false, hoy: true, crr: false },
  { nombre: 'relajado sin AtaquesHoy', estricto: false, hoy: false, crr: false }
];

var _rsCatalogo_ = null;
/** Las 77 ternas posibles de un día: { lista: [{ n, b, f, k }], claves: { 'n,b,f': true } }. */
function _rsCatalogo() {
  if (_rsCatalogo_) return _rsCatalogo_;
  var o = _excDiasOpciones(), lista = [], claves = {};
  for (var i = 0; i < o.length; i++) {
    var e = { n: o[i][0], b: o[i][1], f: o[i][2], k: o[i][0] + ',' + o[i][1] + ',' + o[i][2] };
    lista.push(e); claves[e.k] = true;
  }
  _rsCatalogo_ = { lista: lista, claves: claves };
  return _rsCatalogo_;
}

/** Lo registrado por día (acumulados de la fila): arreglo de 4 con { a, b, f, hoy } o null. */
function _rsRegistros(dias) {
  var rec = [null, null, null, null];
  for (var d = 0; d < 4; d++) {
    var r = dias[d];
    if (r) rec[d] = { a: _excDiasNum(r[GC.ATAQUES_SEM - 1]), b: _excDiasNum(r[GC.BARCOS - 1]), f: _excDiasNum(r[GC.FAME - 1]), hoy: _excDiasNum(r[GC.ATAQUES_HOY - 1]) };
  }
  return rec;
}

/**
 * A qué día puede corresponder cada fila registrada: a su propio día o a uno de los siguientes hasta la próxima fila.
 * Devuelve { offs: [días con fila], combos: [[día al que corresponde cada fila]] } con los menos desplazados primero.
 */
function _rsMapeos(rec) {
  var offs = [];
  for (var d = 0; d < 4; d++) if (rec[d]) offs.push(d);
  var combos = [[]];
  offs.forEach(function (d, i) {
    var hi = (i + 1 < offs.length) ? offs[i + 1] - 1 : 3;
    var nuevos = [];
    combos.forEach(function (c) { for (var m = d; m <= hi; m++) nuevos.push(c.concat([m])); });
    combos = nuevos;
  });
  var desp = function (c) { var s = 0; for (var i = 0; i < c.length; i++) s += c[i] - offs[i]; return s; };
  combos.sort(function (u, v) { return desp(u) - desp(v); });
  return { offs: offs, combos: combos };
}

/** ¿La solución a es mejor que b a igualdad de cambios? Reparte de domingo a jueves: más ataques, luego más fame, luego más barcos, mirando primero el domingo. */
function _rsMenor(a, b) {
  var d;
  for (d = 3; d >= 0; d--) if (a[d].n !== b[d].n) return a[d].n > b[d].n;
  for (d = 3; d >= 0; d--) if (a[d].f !== b[d].f) return a[d].f > b[d].f;
  for (d = 3; d >= 0; d--) if (a[d].b !== b[d].b) return a[d].b > b[d].b;
  return false;
}

/**
 * Busca todas las soluciones (t0, t1, t2, t3) de un nivel y una correspondencia fila -> día.
 *  tot = { a, b, f } total de la semana; rec = _rsRegistros(); mapeo = { offs, m: [día al que corresponde cada fila] };
 *  restr = restricciones de CurrentRiverRace por día ([{ n, f }|null] o null).
 * Devuelve { nSol, porDia: [cantidad de ternas distintas por día], mejor: [4 ternas] | null }.
 */
function _rsResolverNivel(tot, rec, mapeo, restr, nivel) {
  var cat = _rsCatalogo();
  var cand = [], sets = [], d, i;
  for (d = 0; d < 4; d++) {
    var rs = restr ? restr[d] : null, lst = [], st = {};
    for (i = 0; i < cat.lista.length; i++) {
      var e = cat.lista[i];
      if (rs && ((rs.n !== null && e.n !== rs.n) || (rs.f !== null && e.f !== rs.f))) continue;
      lst.push(e); st[e.k] = true;
    }
    cand.push(lst); sets.push(st);
  }
  var rowAt = [null, null, null, null], K = [null, null, null, tot.a];
  for (i = 0; i < mapeo.offs.length; i++) {
    var dEn = mapeo.offs[i], dMap = mapeo.m[i], r = rec[dEn];
    rowAt[dMap] = r;
    // Ataques hechos hasta el dia anterior = AtaquesSemana - AtaquesHoy (solo si la fila corresponde a su propio dia).
    if (nivel.hoy && dMap === dEn && dEn >= 1 && r.hoy <= r.a) {
      var v = r.a - r.hoy;
      if (v <= 4 * dEn && K[dEn - 1] === null) K[dEn - 1] = v;
    }
  }
  function chk(dia, a, b, f) {
    if (K[dia] !== null && a !== K[dia]) return false;
    var rr = rowAt[dia];
    if (!rr) return true;
    if (a < rr.a || b < rr.b || f < rr.f) return false;
    if (nivel.estricto && a === rr.a && (b !== rr.b || f !== rr.f)) return false;
    return true;
  }
  var vacio = { nSol: 0, porDia: [0, 0, 0, 0], mejor: null };
  if (!chk(3, tot.a, tot.b, tot.f)) return vacio;

  var nSol = 0, mejor = null, mejorCosto = Infinity, claves = [{}, {}, {}, {}];
  var l0 = cand[0], l1 = cand[1], l3 = cand[3], s2 = sets[2];
  for (var i3 = 0; i3 < l3.length; i3++) {
    var t3 = l3[i3];
    var a2 = tot.a - t3.n, b2 = tot.b - t3.b, f2 = tot.f - t3.f;           // acumulado al cierre del sabado
    if (a2 < 0 || b2 < 0 || f2 < 0 || !chk(2, a2, b2, f2)) continue;
    for (var i0 = 0; i0 < l0.length; i0++) {
      var t0 = l0[i0];
      if (t0.n > a2 || t0.b > b2 || t0.f > f2 || !chk(0, t0.n, t0.b, t0.f)) continue;
      for (var i1 = 0; i1 < l1.length; i1++) {
        var t1 = l1[i1];
        var a1 = t0.n + t1.n, b1 = t0.b + t1.b, f1 = t0.f + t1.f;           // acumulado al cierre del viernes
        if (a1 > a2 || b1 > b2 || f1 > f2 || !chk(1, a1, b1, f1)) continue;
        var k2 = (a2 - a1) + ',' + (b2 - b1) + ',' + (f2 - f1);
        if (!s2[k2]) continue;
        nSol++;
        claves[0][t0.k] = true; claves[1][t1.k] = true; claves[2][k2] = true; claves[3][t3.k] = true;
        // Costo = campos de las filas registradas que cambian.
        var costo = 0;
        for (i = 0; i < mapeo.offs.length; i++) {
          var dd = mapeo.offs[i], rg = rec[dd];
          var ca = dd === 0 ? t0.n : (dd === 1 ? a1 : (dd === 2 ? a2 : tot.a));
          var cb = dd === 0 ? t0.b : (dd === 1 ? b1 : (dd === 2 ? b2 : tot.b));
          var cf = dd === 0 ? t0.f : (dd === 1 ? f1 : (dd === 2 ? f2 : tot.f));
          costo += (ca !== rg.a ? 1 : 0) + (cb !== rg.b ? 1 : 0) + (cf !== rg.f ? 1 : 0);
        }
        if (costo > mejorCosto) continue;
        var p = k2.split(',');
        var cand4 = [t0, t1, { n: Number(p[0]), b: Number(p[1]), f: Number(p[2]), k: k2 }, t3];
        if (mejor === null || costo < mejorCosto || _rsMenor(cand4, mejor)) { mejor = cand4; mejorCosto = costo; }
      }
    }
  }
  return { nSol: nSol, porDia: claves.map(function (c) { return Object.keys(c).length; }), mejor: mejor };
}

/**
 * Resuelve una serie: de lo más estricto a lo más relajado, y con las filas en su día antes que desplazadas, la primera
 * forma que tenga solución. Devuelve { nSol, porDia, mejor, nivel, desplazadas, crrIgnorado } o { nSol: 0 } si no hay ninguna.
 */
function _rsResolver(dias, tot, crr) {
  var rec = _rsRegistros(dias), mp = _rsMapeos(rec);
  for (var n = 0; n < RS_NIVELES.length; n++) {
    var nivel = RS_NIVELES[n];
    if (nivel.crr && !crr) continue;
    for (var c = 0; c < mp.combos.length; c++) {
      var mapeo = { offs: mp.offs, m: mp.combos[c] };
      var res = _rsResolverNivel(tot, rec, mapeo, nivel.crr ? crr : null, nivel);
      if (res.nSol > 0) {
        var despl = [];
        mapeo.offs.forEach(function (o, i) { if (mapeo.m[i] !== o) despl.push(EXC_DIAS_LETRAS.charAt(o) + '->' + EXC_DIAS_LETRAS.charAt(mapeo.m[i])); });
        res.nivel = nivel.nombre; res.desplazadas = despl.join(' '); res.crrIgnorado = !!crr && !nivel.crr;
        return res;
      }
    }
  }
  return { nSol: 0, porDia: [0, 0, 0, 0], mejor: null, nivel: '', desplazadas: '', crrIgnorado: !!crr };
}

/** Restricciones de CurrentRiverRace por día ([{ n, f }|null] x 4) o null si no hay capturas, se contradicen o no se puede leer Drive. */
function _rsCrrRestricciones(temporada, semana, tag, tot) {
  if (typeof _crrDiasDeJugador_ !== 'function') return null;
  try {
    var r = _crrDiasDeJugador_(temporada, semana, tag, tot.a, tot.f);
    if (!r || !r.hayCapturas || (r.notas && r.notas.length)) return null;
    var fd = _crrFameDia_(r.fameAcum), out = [], hay = false;
    for (var d = 0; d < 4; d++) {
      var n = (r.ataques[d] === undefined) ? null : r.ataques[d];
      var f = (fd[d] === undefined) ? null : fd[d];
      if (n === null && f === null) { out.push(null); continue; }
      out.push({ n: n, f: f }); hay = true;
    }
    return hay ? out : null;
  } catch (e) {
    Logger.log('[Semana por dias] No se pudo leer CurrentRiverRace (' + tag + '): ' + e.message + '. Se sigue sin el.');
    return null;
  }
}

/**
 * Planifica la escritura. NO modifica filas. objetivos = [{ temporada, semana, tag, nombre, clan, jsonAtaques, jsonFame, jsonBarcos, omitir }]
 * (omitir = motivo de texto si el Historial no confirma el total). opciones = { usarCrr, t0 }.
 * Devuelve { casos: [{ grupo, clase, estimado, ops, finalAntes }], omitidos: [{ grupo, clase, motivo, alarma }], series: [...] } (mismo formato de ops que
 * _excDiasPlanificar(), para reutilizar _excDiasAplicarPlan() y _excDiasVerificar()).
 */
function _rsPlanificar(filas, objetivos, opciones) {
  opciones = opciones || {};
  var grupos = _excDiasAgrupar(filas), porClave = {}, porSemana = {};
  Object.keys(grupos).forEach(function (k) {
    var g = grupos[k];
    porClave[tot_clave_(tot_tag_(g.tag), tot_num_(g.temporada), tot_num_(g.semana), tot_clan_(g.clan))] = g;
    var ks = g.temporada + '|' + g.semana + '|' + g.tag;
    if (!porSemana[ks]) porSemana[ks] = [];
    porSemana[ks].push(g);
  });
  var plan = { casos: [], omitidos: [], series: [] };
  var t0 = opciones.t0 || Date.now();

  objetivos.forEach(function (ob) {
    var clave = tot_clave_(ob.tag, ob.temporada, ob.semana, ob.clan);
    var g = porClave[clave] || { temporada: String(ob.temporada), semana: String(ob.semana), tag: ob.tag, clan: ob.clan, nombre: ob.nombre || '', dias: {} };
    var patron = Object.keys(g.dias).map(Number).sort(function (a, b) { return a - b; }).map(function (o) { return EXC_DIAS_LETRAS.charAt(o); }).join('');
    var tot = { a: ob.jsonAtaques, b: ob.jsonBarcos, f: ob.jsonFame };
    var serie = { grupo: g, ob: ob, patron: patron, tot: tot, clase: '', nivel: '', soluciones: '', accion: '', nMod: 0, nCrear: 0, notas: '' };
    plan.series.push(serie);
    var omitir = function (motivo, alarma) {
      serie.clase = 'omitida'; serie.accion = 'OMITIDA'; serie.notas = motivo;
      plan.omitidos.push({ grupo: g, clase: 'omitida', motivo: motivo, alarma: !!alarma });
    };
    if (ob.omitir) { omitir(ob.omitir, false); return; }
    if (Date.now() - t0 > RS_MS_LIMITE) { omitir('tiempo agotado: volver a correr para el resto', false); return; }
    if (tot.a > 16 || tot.a < 0) { omitir('total de ataques fuera de 0 a 16 (' + tot.a + ')', true); return; }

    var crr = opciones.usarCrr === false ? null : _rsCrrRestricciones(ob.temporada, ob.semana, ob.tag, tot);
    var res = _rsResolver(g.dias, tot, crr);
    if (res.nSol === 0) {
      omitir('ningun reparto de ternas cumple los registros y el total de RoyaleAPI (' + tot.a + '/' + tot.b + '/' + tot.f + ')', true);
      return;
    }
    serie.nivel = res.nivel; serie.soluciones = res.nSol;
    var notas = [];
    if (res.crrIgnorado) { notas.push('CurrentRiverRace no cuadra con los registros y el total: no se uso'); Logger.log('[Semana por dias] AVISO ' + ob.tag + ' T' + ob.temporada + ' S' + ob.semana + ': CurrentRiverRace no cuadra; se repartio sin el.'); }
    if (res.desplazadas) notas.push('fila(s) con el acumulado de un dia posterior: ' + res.desplazadas);
    if (res.nivel.indexOf('sin AtaquesHoy') >= 0) notas.push('AtaquesHoy no cuadra con los acumulados: no se uso');
    if (res.nivel.indexOf('relajado') === 0) notas.push('nivel relajado: se acepto que una fila con todos sus ataques tuviera barcos o fame mayores (revisar)');

    var reg = _excDiasRegistradoPorDia(g.dias), sol = res.mejor, cumA = 0, cumB = 0, cumF = 0, ops = [], estimado = false;
    for (var d = 0; d < 4; d++) {
      var e = sol[d];
      cumA += e.n; cumB += e.b; cumF += e.f;
      var fila = g.dias[d] || null, estDia = res.porDia[d] > 1;
      if (estDia) estimado = true;
      ops.push({ dia: d, existe: !!fila, fila: fila, estimadoDia: estDia,
        ant: fila ? { hoy: _excDiasNum(fila[GC.ATAQUES_HOY - 1]), sem: _excDiasNum(fila[GC.ATAQUES_SEM - 1]), fame: _excDiasNum(fila[GC.FAME - 1]), barcos: _excDiasNum(fila[GC.BARCOS - 1]), origen: String(fila[GC.ORIGEN - 1] || '') } : null,
        antDia: reg[d] || null,
        nuevo: { hoy: e.n, sem: cumA, fame: cumF, barcos: cumB, fameDia: e.f, barcosDia: e.b, origen: '' } });
    }
    // Comprobacion entre clanes: tope de 4 por dia y de 16 por semana sumando los demas clanes del jugador.
    var otros = (porSemana[g.temporada + '|' + g.semana + '|' + g.tag] || []).filter(function (o) { return o.clan !== g.clan; });
    var excede = '';
    ops.forEach(function (op) {
      var suma = op.nuevo.hoy;
      otros.forEach(function (o) { if (o.dias[op.dia]) suma += _excDiasNum(o.dias[op.dia][GC.ATAQUES_HOY - 1]); });
      if (suma > 4) excede = 'el dia ' + EXC_DIAS_LETRAS.charAt(op.dia) + ' quedaria con ' + suma + ' ataques sumando clanes';
    });
    var semanaOtros = 0;
    otros.forEach(function (o) { semanaOtros += _excDiasFinalDe(o.dias).a; });
    if (!excede && cumA + semanaOtros > 16) excede = 'la semana quedaria con ' + (cumA + semanaOtros) + ' ataques sumando clanes';
    if (excede) { omitir(excede, true); return; }

    ops.forEach(function (op) {
      op.nuevo.origen = _excDiasOrigenNuevo(op.existe ? op.ant.origen : '', op.existe, op.estimadoDia);
      if (op.existe && op.ant.hoy === op.nuevo.hoy && op.ant.sem === op.nuevo.sem && op.ant.fame === op.nuevo.fame && op.ant.barcos === op.nuevo.barcos) {
        op.sinCambio = true; op.nuevo.origen = op.ant.origen;
      }
      if (!op.existe) serie.nCrear++; else if (!op.sinCambio) serie.nMod++;
    });
    serie.clase = res.nSol === 1 ? 'unica' : 'estimada';
    serie.notas = notas.join('; ');
    if (serie.nMod === 0 && serie.nCrear === 0) { serie.accion = 'Sin cambios'; return; }
    serie.accion = 'Escribir';
    plan.casos.push({ grupo: g, clase: serie.clase, estimado: estimado, ops: ops, finalAntes: { a: tot.a, b: tot.b, f: tot.f } });
  });
  return plan;
}

/** Claves (tag|temporada|semana|clan) de las series que tienen filas en la hoja Guerra (temporada vigente): esas no se tocan aqui. */
function _rsClavesHoja() {
  var set = {};
  try {
    var sh = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
    if (!sh || sh.getLastRow() < 2) return set;
    var datos = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
    datos.forEach(function (f) {
      if (String(f[GC.ETAPA - 1] || '').trim() !== 'Guerra') return;
      set[tot_clave_(tot_tag_(f[GC.TAG - 1]), tot_num_(f[GC.TEMPORADA - 1]), tot_num_(f[GC.SEMANA - 1]), tot_clan_(f[GC.CLAN - 1]))] = true;
    });
  } catch (e) { Logger.log('[Semana por dias] No se pudo leer la hoja Guerra: ' + e.message); }
  return set;
}

/**
 * Objetivos = una serie (jugador, clan, temporada, semana) por cada total semanal CERRADO de los JSON de RoyaleAPI de los jugadores que aparecen en el
 * Backup (mismo origen que completarDomingoDesdeJsonRoyaleApi: _cdjCargarRegistrosJsonDrive_ y _cdjIndexarRegistrosJson_), con o sin filas en el Backup.
 * Cada objetivo trae omitir (texto) si no se puede usar: JSON sin cerrar, JSON inconsistente, sin total de barcos o serie de la hoja Guerra.
 * Devuelve null si se agotó el tiempo leyendo los JSON (no se escribe nada).
 */
function _rsObjetivos(filas, claveHoja) {
  var tagsSet = {};
  filas.forEach(function (f) {
    if (String(f[GC.ETAPA - 1] || '').trim() !== 'Guerra') return;
    var tg = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    if (tg) tagsSet[tg] = true;
  });
  var lectura = _cdjCargarRegistrosJsonDrive_(tagsSet, COMPLETAR_DOMINGO_JSON_PRESUPUESTO_LECTURA_MS);
  if (!lectura.ok) return null;
  var indice = _cdjIndexarRegistrosJson_(lectura.porTag), objetivos = [];
  Object.keys(indice.series).sort().forEach(function (k) {
    var p = k.split('|');
    var js = _cdjJsonDeSerie_(indice.series[k]);
    var ob = { temporada: Number(p[2]), semana: Number(p[3]), tag: tot_tag_(p[0]), nombre: '', clan: tot_clan_(p[1]),
      jsonAtaques: js.ataques, jsonFame: js.fame, jsonBarcos: js.barcos, omitir: '' };
    ob.clave = tot_clave_(ob.tag, ob.temporada, ob.semana, ob.clan);
    if (js.estado === 'json_inconsistente') ob.omitir = 'JSON_INCONSISTENTE';
    else if (js.estado !== 'ok') return;
    else if (!js.cerrado) ob.omitir = 'JSON_SIN_CERRAR';
    else if (js.barcos === null) ob.omitir = 'JSON_SIN_TOTAL_DE_BARCOS';
    else if (claveHoja && claveHoja[ob.clave]) ob.omitir = 'SERIE_EN_LA_HOJA_GUERRA (no se toca)';
    objetivos.push(ob);
  });
  return objetivos;
}

// ---------------------------------------------------------------------------------------------------------------
// ENTRADA (Drive)
// ---------------------------------------------------------------------------------------------------------------

function _totSemanaPorDias_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[Semana por dias] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    if (!csvText) { Logger.log('[Semana por dias] No se encontro Backup_Guerra.csv; no se hace nada.'); return; }
    var parsed = _parseCSV(csvText);
    if (!parsed || parsed.length < 2) { Logger.log('[Semana por dias] Backup_Guerra.csv esta vacio; no se hace nada.'); return; }
    var encabezado = parsed[0], filas = parsed.slice(1);
    for (var a = 0; a < filas.length; a++) { while (filas[a].length < GUERRA_TOTAL_COLS) filas[a].push(''); }
    var copiaAntes = filas.map(function (r) { return r.slice(); });

    var objetivos = _rsObjetivos(filas, _rsClavesHoja());
    if (!objetivos) { Logger.log('[Semana por dias] ABORT: se agoto el tiempo leyendo los JSON de RoyaleAPI. No se escribio nada.'); return; }
    var plan = _rsPlanificar(filas, objetivos, { usarCrr: true, t0: t0 });
    var idxDe = new Map();
    for (var q = 0; q < filas.length; q++) idxDe.set(filas[q], q);
    plan.casos.forEach(function (c) { c.ops.forEach(function (op) { if (op.existe) op.idxAntes = idxDe.get(op.fila); }); });
    var nCrear = 0, nModificar = 0, cuenta = {};
    plan.series.forEach(function (s) { nCrear += s.nCrear; nModificar += s.nMod; var k = s.clase + ' / ' + s.accion; cuenta[k] = (cuenta[k] || 0) + 1; });
    var resumenSeries = Object.keys(cuenta).sort().map(function (k) { return k + ': ' + cuenta[k]; }).join(' | ');

    var nombresCsv = [];
    var series = [['Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Filas existentes', 'Total RoyaleAPI ataques/barcos/fame', 'Nivel', 'Soluciones', 'Clase', 'Accion', 'Filas a modificar', 'Filas a crear', 'Notas']];
    plan.series.forEach(function (s) {
      var g = s.grupo;
      series.push([g.temporada, g.semana, g.tag, g.nombre, g.clan, s.patron, s.tot.a + '/' + s.tot.b + '/' + s.tot.f, s.nivel, s.soluciones, s.clase, s.accion, s.nMod, s.nCrear, s.notas]);
    });
    if (!aplicar && series.length > 1) {
      var nomSeries = 'AplicarTotalesSemana_Historial ' + marca + ' (informe).csv';
      _saveCSVToDrive(nomSeries, _encodeCSV(series)); nombresCsv.push(nomSeries);
    }
    var detalle = [['Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Clase', 'Dia', 'PeriodIndex', 'Accion',
      'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana anterior (acumulado)', 'AtaquesSemana nueva (acumulado)',
      'Fame del dia anterior', 'Fame del dia nueva', 'Fame anterior (acumulado)', 'Fame nueva (acumulado)',
      'Barcos del dia anterior', 'Barcos del dia nuevo', 'Barcos anterior (acumulado)', 'Barcos nuevo (acumulado)',
      'Origen anterior', 'Origen nuevo', 'Solucion']];
    plan.casos.forEach(function (c) {
      var g = c.grupo;
      c.ops.forEach(function (op) {
        var an = op.ant;
        detalle.push([g.temporada, g.semana, g.tag, g.nombre, g.clan, c.clase, EXC_DIAS_LETRAS.charAt(op.dia), (Number(g.semana) - 1) * 7 + 3 + op.dia,
          !op.existe ? 'Crear' : (op.sinCambio ? 'Sin cambio' : 'Modificar'), an ? an.hoy : '', op.nuevo.hoy, an ? an.sem : '', op.nuevo.sem,
          op.antDia ? op.antDia.f : '', op.nuevo.fameDia, an ? an.fame : '', op.nuevo.fame,
          op.antDia ? op.antDia.b : '', op.nuevo.barcosDia, an ? an.barcos : '', op.nuevo.barcos,
          an ? an.origen : '', op.nuevo.origen, op.estimadoDia ? 'estimada (varias ternas validas)' : 'unica']);
      });
    });
    var nomDetalle = 'AplicarTotalesSemana_Historial ' + marca + ' (' + (aplicar ? 'aplicado' : 'plan') + ').csv';
    if (detalle.length > 1) { _saveCSVToDrive(nomDetalle, _encodeCSV(detalle)); nombresCsv.push(nomDetalle); }

    var verificacion = '', revisionTxt = '';
    if (aplicar && (nCrear + nModificar) > RS_MAX_FILAS) {
      verificacion = 'NO SE ESCRIBIO NADA: ' + (nCrear + nModificar) + ' fila(s) a modificar o crear pasan el tope de ' + RS_MAX_FILAS + '. Revisar el CSV del plan (corre primero el informe).';
    } else if (aplicar && plan.casos.length > 0) {
      _saveCSVToDrive('Backup_Guerra ANTES de aplicar TotalesSemanaDesdeHistorial ' + marca + '.csv', csvText);
      var res = _excDiasAplicarPlan(filas, plan);
      _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezado].concat(filas)));
      var problemas = [];
      var despues = _loadCSVFromDrive('Backup_Guerra.csv');
      var parsedDespues = despues ? _parseCSV(despues) : null;
      if (!parsedDespues || parsedDespues.length < 2) {
        problemas.push('No se pudo releer Backup_Guerra.csv');
      } else {
        var filasDespues = parsedDespues.slice(1);
        for (var b = 0; b < filasDespues.length; b++) { while (filasDespues[b].length < GUERRA_TOTAL_COLS) filasDespues[b].push(''); }
        problemas = _excDiasVerificar(copiaAntes, filasDespues, plan, res.creadas);
      }
      verificacion = problemas.length
        ? 'VERIFICACION FALLO (' + problemas.length + '): ' + problemas.slice(0, 5).join('; ') + '. Restaurar con el respaldo "Backup_Guerra ANTES de aplicar TotalesSemanaDesdeHistorial ' + marca + '.csv".'
        : 'Verificacion OK (' + res.modificadas + ' fila(s) modificadas, ' + res.creadas + ' creadas).';
      var entradas = [];
      plan.omitidos.forEach(function (o) {
        if (!o.alarma) return;
        entradas.push({ temporada: o.grupo.temporada, semana: o.grupo.semana, tag: o.grupo.tag, nombre: o.grupo.nombre, tipo: 'alarma',
          motivo: 'totales semanales: no se escribio', detalle: o.grupo.clan + ': ' + o.motivo });
      });
      if (entradas.length) { var rr = _registrarRevisionGuerra_(entradas); revisionTxt = 'Revision_Guerra.csv: ' + rr.nuevas + ' nuevas, ' + rr.actualizadas + ' actualizadas. '; }
    }
    Logger.log('[Semana por dias] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). Backup_Guerra.csv: ' + filas.length + ' filas. ' +
      'Series del informe: ' + plan.series.length + ' (' + resumenSeries + '). Filas a modificar: ' + nModificar + ', a crear: ' + nCrear + '. ' + revisionTxt +
      (verificacion ? verificacion + ' ' : '') + (nombresCsv.length ? 'Detalle en Drive: ' + nombresCsv.join(' y ') + '.' : 'Nada que escribir.') +
      (aplicar ? '' : ' (No se escribio nada en el Backup ni en Guerra.)'));
  } finally {
    lock.releaseLock();
  }
}
