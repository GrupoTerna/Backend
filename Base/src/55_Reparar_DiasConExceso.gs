/**
 * 55_Reparar_DiasConExceso.gs
 *
 * Días de guerra con MÁS de 4 ataques en Backup_Guerra.csv (pregunta e de PF120; 249 casos medidos el 14-oct-2026,
 * 243 de ellos en T3 S1 a S3). Casi todos son filas que traen lo de más de un día porque faltan las filas de los
 * días siguientes (el sábado trae sábado y domingo; o solo existe el jueves y trae los cuatro días).
 *
 * Esta primera tanda SOLO INFORMA (no escribe nada en Backup_Guerra.csv ni en la hoja Guerra):
 *   repararDiasConExcesoInforme()  -> deja un CSV en Informes con una fila por jugador, semana y clan.
 *
 * Es el modelo de Datos descargados/CSV/Informes/cruce_exceso.py (Python, 14-oct-2026) pasado a Apps Script;
 * el funcionamiento y las decisiones están en Contexto_Base_Web.md §PF132 y §PF120.
 *  - Reparto dentro de la misma semana, jugador y clan (jueves a domingo).
 *  - Se parte de los ACUMULADOS (AtaquesSemana, Fame, Barcos) de cada fila, no de AtaquesHoy (que no es confiable).
 *  - Si falta el jueves y la primera fila es la del viernes, los ataques del jueves son AtaquesSemana - AtaquesHoy del viernes.
 *  - Si un tramo no cabe en sus días, se prueban coberturas que absorben filas vecinas con delta cero (filas viejas)
 *    o que se extienden hasta el domingo; se elige la de menos días extra y, si hay varias, se unen sus soluciones.
 *  - Lo que se podría escribir es solo lo que coincide en TODAS las soluciones (decisión a); lo demás, revisión manual.
 * La tabla de fame de un día es la de _fameTablaDia_() (18_CorreccionGuerra.gs).
 */

var EXC_DIAS_CAP = 5000;          // tope de soluciones por tramo (si se pasa, el caso queda marcado como truncado)
var EXC_DIAS_LETRAS = 'JVSD';     // desplazamiento 0..3 = jueves a domingo

var _excDiasOpciones_ = null;
function _excDiasOpciones() {
  if (_excDiasOpciones_) return _excDiasOpciones_;
  var lista = [];
  for (var n = 0; n <= 4; n++) {
    for (var b = 0; b <= n; b++) {
      var tabla = _fameTablaDia_(n, b);
      for (var i = 0; i < tabla.length; i++) lista.push([n, b, tabla[i]]);
    }
  }
  _excDiasOpciones_ = lista;
  return lista;
}

function _excDiasNum(v) {
  var n = Number(String(v === null || v === undefined ? '' : v).replace(/,/g, '').trim());
  return isNaN(n) ? 0 : Math.trunc(n);
}

/**
 * Agrupa las filas de guerra por (temporada, semana, tag, clan): { clave: { info:{...}, dias:{ off: fila } } }.
 * Por cada día se queda con la fila de mayor PeriodIndex. filas = arreglo de arreglos (sin encabezado).
 */
function _excDiasAgrupar(filas) {
  var grupos = {};
  for (var i = 0; i < filas.length; i++) {
    var r = filas[i];
    if (String(r[GC.ETAPA - 1]) !== 'Guerra') continue;
    var pi = _excDiasNum(r[GC.PERIOD_IDX - 1]);
    var off = (pi % 7) - 3;
    if (off < 0 || off > 3) continue;
    var tag = String(r[GC.TAG - 1]).trim();
    var clave = [String(r[GC.TEMPORADA - 1]), String(r[GC.SEMANA - 1]), tag, String(r[GC.CLAN - 1])].join('|');
    var g = grupos[clave];
    if (!g) {
      g = { temporada: String(r[GC.TEMPORADA - 1]), semana: String(r[GC.SEMANA - 1]), tag: tag, clan: String(r[GC.CLAN - 1]), nombre: String(r[GC.NOMBRE - 1] || ''), dias: {} };
      grupos[clave] = g;
    }
    var previa = g.dias[off];
    if (!previa || pi > _excDiasNum(previa[GC.PERIOD_IDX - 1])) g.dias[off] = r;
    if (!g.nombre) g.nombre = String(r[GC.NOMBRE - 1] || '');
  }
  return grupos;
}

/** Tramos entre filas consecutivas: cada fila cubre los días desde la anterior hasta ella (deltas de los acumulados). */
function _excDiasSegmentos(dias) {
  var offs = Object.keys(dias).map(Number).sort(function (a, b) { return a - b; });
  var segs = [], pa = 0, pb = 0, pf = 0, po = -1;
  for (var i = 0; i < offs.length; i++) {
    var o = offs[i], r = dias[o];
    var a = _excDiasNum(r[GC.ATAQUES_SEM - 1]), b = _excDiasNum(r[GC.BARCOS - 1]), f = _excDiasNum(r[GC.FAME - 1]);
    var cubre = [];
    for (var d = po + 1; d <= o; d++) cubre.push(d);
    segs.push({ dias: cubre, A: a - pa, B: b - pb, F: f - pf, hoy: _excDiasNum(r[GC.ATAQUES_HOY - 1]), offFila: o });
    pa = a; pb = b; pf = f; po = o;
  }
  return segs;
}

/** Si falta el jueves y la primera fila es la del viernes: jueves = acumulado del viernes - ataques de hoy del viernes. */
function _excDiasFaltanteJueves(segs) {
  var s0 = segs[0];
  if (s0 && s0.dias.length === 2 && s0.dias[0] === 0 && s0.dias[1] === 1 && s0.offFila === 1) {
    var nJue = s0.A - s0.hoy;
    return (nJue >= 0 && nJue <= 4) ? nJue : null;
  }
  return null;
}

/** Todas las (n, b, f) por día para k días con sumas exactas A, B y F. fijoN0: ataques del primer día fijados (o null). */
function _excDiasSoluciones(k, A, B, F, fijoN0) {
  var opts = _excDiasOpciones();
  var sols = [];
  function dfs(i, a, b, f, acc) {
    if (sols.length > EXC_DIAS_CAP) return;
    if (i === k) {
      if (a === A && b === B && f === F) sols.push(acc.slice());
      return;
    }
    var resto = k - i - 1;
    for (var j = 0; j < opts.length; j++) {
      var o = opts[j];
      if (i === 0 && fijoN0 !== null && o[0] !== fijoN0) continue;
      var na = a + o[0], nb = b + o[1], nf = f + o[2];
      if (na > A || nb > B || nf > F) continue;
      if (na + 4 * resto < A) continue;
      acc.push(o); dfs(i + 1, na, nb, nf, acc); acc.pop();
    }
  }
  dfs(0, 0, 0, 0, []);
  return sols;
}

function _excDiasEsCero(s) { return s.A === 0 && s.B === 0 && s.F === 0; }

/** Devuelve { clase: 'imposible'|'ok', notas: [...], hechos: [{ dias, sols }] }. */
function _excDiasResolver(dias) {
  var segs = _excDiasSegmentos(dias);
  var nj = _excDiasFaltanteJueves(segs);
  var out = [], notas = [], i = 0;
  while (i < segs.length) {
    var s = segs[i];
    var fijo = (i === 0 && nj !== null && s.dias[0] === 0) ? nj : null;
    var sols = _excDiasSoluciones(s.dias.length, s.A, s.B, s.F, fijo);
    if (sols.length) {
      out.push({ dias: s.dias.slice(), sols: sols, zero: _excDiasEsCero(s) });
      i++;
      continue;
    }
    var backMax = 0;
    while (backMax < out.length && out[out.length - 1 - backMax].zero) backMax++;
    var sig = 0;
    while (i + 1 + sig < segs.length && _excDiasEsCero(segs[i + 1 + sig])) sig++;
    var finOk = (i + 1 + sig === segs.length);
    var cands = [];
    for (var m = 0; m <= backMax; m++) {
      for (var f = 0; f <= sig; f++) {
        var doms = (finOk && f === sig) ? [false, true] : [false];
        for (var di = 0; di < doms.length; di++) {
          var dom = doms[di];
          var dd = [];
          var previos = out.slice(out.length - m);
          for (var p = 0; p < previos.length; p++) dd = dd.concat(previos[p].dias);
          dd = dd.concat(s.dias);
          var siguientes = segs.slice(i + 1, i + 1 + f);
          for (var q = 0; q < siguientes.length; q++) dd = dd.concat(siguientes[q].dias);
          if (dom && dd[dd.length - 1] < 3) {
            for (var x = dd[dd.length - 1] + 1; x <= 3; x++) dd.push(x);
          } else if (dom) {
            continue;
          }
          cands.push({ extra: dd.length - s.dias.length, m: m, f: f, dom: dom, dd: dd });
        }
      }
    }
    var extras = [];
    cands.forEach(function (c) { if (extras.indexOf(c.extra) < 0) extras.push(c.extra); });
    extras.sort(function (u, v) { return u - v; });
    var elegido = null;
    for (var ei = 0; ei < extras.length && !elegido; ei++) {
      var fact = [];
      var delExtra = cands.filter(function (c) { return c.extra === extras[ei]; });
      for (var ci = 0; ci < delExtra.length; ci++) {
        var c = delExtra[ci];
        var fijo2 = (c.dd[0] === 0 && nj !== null) ? nj : null;
        var ss = _excDiasSoluciones(c.dd.length, s.A, s.B, s.F, fijo2);
        if (ss.length) fact.push({ m: c.m, f: c.f, dom: c.dom, dd: c.dd, ss: ss });
      }
      if (fact.length) elegido = fact;
    }
    if (!elegido) return { clase: 'imposible', notas: notas, hechos: [] };
    if (elegido.length > 1) notas.push('cobertura_ambigua');
    if (elegido.some(function (x) { return x.m > 0; })) notas.push('absorbe_fila_vieja');
    if (elegido.some(function (x) { return x.dom || x.f > 0; })) notas.push('extiende_adelante');
    var spanSet = {};
    elegido.forEach(function (x) { x.dd.forEach(function (d) { spanSet[d] = true; }); });
    var span = Object.keys(spanSet).map(Number).sort(function (u, v) { return u - v; });
    var uni = {};
    elegido.forEach(function (x) {
      x.ss.forEach(function (z) {
        var mp = {};
        for (var k = 0; k < x.dd.length; k++) mp[x.dd[k]] = z[k];
        var tupla = span.map(function (d) { return mp[d] !== undefined ? mp[d] : [0, 0, 0]; });
        uni[JSON.stringify(tupla)] = tupla;
      });
    });
    var unicas = Object.keys(uni).sort().map(function (k2) { return uni[k2]; });
    var mmax = Math.max.apply(null, elegido.map(function (x) { return x.m; }));
    var fmax = Math.max.apply(null, elegido.map(function (x) { return x.f; }));
    for (var z2 = 0; z2 < mmax; z2++) out.pop();
    out.push({ dias: span, sols: unicas, zero: false });
    i += 1 + fmax;
  }
  // Notas sin repetir y ordenadas, como en el modelo de Python.
  var vistas = {}, notasU = [];
  notas.forEach(function (n) { if (!vistas[n]) { vistas[n] = true; notasU.push(n); } });
  notasU.sort();
  return { clase: 'ok', notas: notasU, hechos: out };
}

/**
 * Clasifica un caso ya resuelto y resume, por día, lo que coincide en todas las soluciones.
 * Devuelve { clase, soluciones, ataquesCoinciden, notas, porDia: { off: { n, b, f } } } donde cada cifra es un número
 * (igual en todas las soluciones), '?' (varía) o falta el día (sin dato: ningún tramo lo cubre).
 */
function _excDiasResumir(res) {
  if (res.clase === 'imposible') return { clase: 'imposible', soluciones: '', ataquesCoinciden: '', notas: res.notas.join('|'), porDia: {} };
  var total = 1, ataquesUnicos = true, unico = true, truncado = false;
  var porDia = {};
  res.hechos.forEach(function (h) {
    total *= h.sols.length;
    if (h.sols.length > EXC_DIAS_CAP) truncado = true;
    if (h.sols.length > 1) unico = false;
    var distintosN = {};
    h.sols.forEach(function (z) { distintosN[z.map(function (x) { return x[0]; }).join(',')] = true; });
    if (Object.keys(distintosN).length > 1) ataquesUnicos = false;
    h.dias.forEach(function (d, idx) {
      var vn = {}, vb = {}, vf = {};
      h.sols.forEach(function (z) { vn[z[idx][0]] = true; vb[z[idx][1]] = true; vf[z[idx][2]] = true; });
      var uno = function (set) { var ks = Object.keys(set); return ks.length === 1 ? Number(ks[0]) : '?'; };
      porDia[d] = { n: uno(vn), b: uno(vb), f: uno(vf) };
    });
  });
  var clase = unico ? 'unica' : (ataquesUnicos ? 'ambigua_ataques_coinciden' : 'ambigua');
  var notas = res.notas.slice();
  if (truncado) notas.push('truncado');
  return { clase: clase, soluciones: total, ataquesCoinciden: ataquesUnicos ? 'si' : 'no', notas: notas.join('|'), porDia: porDia };
}

/**
 * Clasifica todos los casos de un conjunto de filas (sin encabezado). Devuelve un arreglo de
 * { grupo, patron, resumen } ordenado por temporada, semana, tag y clan.
 */
function _excDiasClasificar(filas) {
  var grupos = _excDiasAgrupar(filas);
  var claves = Object.keys(grupos).filter(function (k) {
    var dias = grupos[k].dias;
    return Object.keys(dias).some(function (o) { return _excDiasNum(dias[o][GC.ATAQUES_HOY - 1]) > 4; });
  }).sort();
  return claves.map(function (k) {
    var g = grupos[k];
    var patron = Object.keys(g.dias).map(Number).sort(function (a, b) { return a - b; }).map(function (o) { return EXC_DIAS_LETRAS.charAt(o); }).join('');
    return { grupo: g, patron: patron, resumen: _excDiasResumir(_excDiasResolver(g.dias)) };
  });
}

function _excDiasTextoPorDia(porDia, campo) {
  var partes = [];
  for (var d = 0; d <= 3; d++) partes.push(porDia[d] ? String(porDia[d][campo]) : '-');
  return partes.join('|');
}

function _excDiasTextoActual(dias) {
  var partes = [];
  for (var d = 0; d <= 3; d++) partes.push(dias[d] ? String(_excDiasNum(dias[d][GC.ATAQUES_HOY - 1])) : '-');
  return partes.join('|');
}

/**
 * repararDiasConExcesoInforme() -> SOLO INFORMA. Una fila por jugador, semana y clan con algún día de más de 4 ataques.
 * Columnas de reparto: J|V|S|D con el valor que coincide en todas las soluciones, '?' si varía y '-' si ningún tramo
 * cubre ese día (por ejemplo, el domingo sin fila que el modelo no necesita). Fame y Barcos son del DÍA (delta del acumulado).
 */
function repararDiasConExcesoInforme() {
  var t0 = Date.now();
  var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) { Logger.log('[DiasConExceso] No se encontro Backup_Guerra.csv; no se hace nada.'); return; }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) { Logger.log('[DiasConExceso] Backup_Guerra.csv esta vacio; no se hace nada.'); return; }
  var filas = parsed.slice(1);
  for (var a = 0; a < filas.length; a++) { while (filas[a].length < GUERRA_TOTAL_COLS) filas[a].push(''); }

  var casos = _excDiasClasificar(filas);
  var informe = [['Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Filas existentes', 'AtaquesHoy actual (J|V|S|D)', 'Clase', 'Soluciones',
    'Ataques coinciden', 'Ataques por dia (J|V|S|D)', 'Fame por dia', 'Barcos por dia', 'Notas']];
  var cuenta = {};
  var suma = function (k) { cuenta[k] = (cuenta[k] || 0) + 1; };
  casos.forEach(function (c) {
    var g = c.grupo, r = c.resumen;
    suma(r.clase);
    suma('patron ' + c.patron + ' ' + r.clase);
    informe.push([g.temporada, g.semana, g.tag, g.nombre, g.clan, c.patron, _excDiasTextoActual(g.dias), r.clase, r.soluciones,
      r.ataquesCoinciden, _excDiasTextoPorDia(r.porDia, 'n'), _excDiasTextoPorDia(r.porDia, 'f'), _excDiasTextoPorDia(r.porDia, 'b'), r.notas]);
  });

  var nombreInforme = 'Reparacion_DiasConExceso ' + marca + ' (informe).csv';
  if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSV(informe));

  var porClase = ['unica', 'ambigua_ataques_coinciden', 'ambigua', 'imposible'].map(function (k) { return k + ' ' + (cuenta[k] || 0); }).join(' | ');
  Logger.log('[DiasConExceso] SOLO INFORMAR (' + Math.round((Date.now() - t0) / 1000) + ' s). Backup_Guerra.csv: ' + (filas.length) + ' filas. ' +
    'Casos con algun dia de mas de 4 ataques: ' + casos.length + '. Por clase: ' + porClase + '. ' +
    (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay casos.') +
    ' (No se escribio nada en el Backup ni en Guerra.)');
}
