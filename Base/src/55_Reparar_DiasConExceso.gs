/**
 * 55_Reparar_DiasConExceso.gs
 *
 * Días de guerra con MÁS de 4 ataques en Backup_Guerra.csv (pregunta e de PF120; 249 casos medidos el 14-oct-2026,
 * 243 de ellos en T3 S1 a S3). Casi todos son filas que traen lo de más de un día porque faltan las filas de los
 * días siguientes (el sábado trae sábado y domingo; o solo existe el jueves y trae los cuatro días).
 *
 * Entradas (Drive):
 *   repararDiasConExcesoInforme()        -> SOLO INFORMA: CSV de clasificacion y CSV del plan (lo que escribiria el aplicar).
 *   repararDiasConExcesoAplicarUnicas()  -> tanda 1: escribe solo los casos de clase 'unica'.
 *   repararDiasConExcesoAplicar()        -> escribe 'unica' y 'ambigua_ataques_coinciden'; el resto va a Revision_Guerra.csv.
 *   informeFameCurrentRiverRace52() / aplicarFameCurrentRiverRace52() -> fame por día real de 52 casos de T3 S1 y S2 según CurrentRiverRace (al final del archivo; §PF139).
 * Escribir = respaldo previo de Backup_Guerra.csv, reparto de AtaquesHoy, creacion de las filas que faltan (Origen 'Reconstruido - Solución ...')
 * y verificacion releyendo el CSV. Solo toca Backup_Guerra.csv (los casos de la hoja Guerra no se tocan).
 *
 * Es el modelo de Datos descargados/CSV/Informes/cruce_exceso.py (Python, 14-oct-2026) pasado a Apps Script;
 * el funcionamiento y las decisiones están en Contexto_Base_Web.md §PF132 y §PF120.
 *  - Reparto dentro de la misma semana, jugador y clan (jueves a domingo).
 *  - Se parte de los ACUMULADOS (AtaquesSemana, Fame, Barcos) de cada fila, no de AtaquesHoy (que no es confiable).
 *  - Si falta el jueves y la primera fila es la del viernes, los ataques del jueves son AtaquesSemana - AtaquesHoy del viernes.
 *  - Si un tramo no cabe en sus días, se prueban coberturas que absorben filas vecinas con delta cero (filas viejas)
 *    o que se extienden hasta el domingo; se elige la de menos días extra y, si hay varias, se unen sus soluciones.
 *  - Se escribe solo si los ataques por día coinciden en todas las soluciones; entre varias ternas válidas (barcos y fame del día)
 *    se elige UNA terna completa, la que menos cambia lo registrado, y el Origen dice 'Corregido - Solución estimada' o
 *    'Reconstruido - Solución estimada' (con una sola terna posible: '... - Solución única'). Lo demás, revisión manual.
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
 * ¿Esta serie (jugador, clan, semana) necesita reparo? [→ Contexto_Base_Web.md §PF160, criterio 1]
 * Se parte de los ACUMULADOS, no de AtaquesHoy (que es de la última captura y puede quedarse atrás). Necesita reparo si:
 *  - algún AtaquesHoy pasa de 4 (selector de siempre), o
 *  - algún tramo trae más ataques de los que caben en los días que cubre (4 por día): el acumulado salta de más, o
 *  - falta la fila de un día anterior y el tramo que lo absorbe trae más de 4 ataques (ejemplo: primera fila el viernes con 8 acumulados;
 *    el jueves sale de AtaquesSemana - AtaquesHoy del viernes, ver _excDiasFaltanteJueves()).
 * Antes solo se miraba el primer punto, y los jueves que faltan con AtaquesHoy de 4 o menos quedaban fuera aunque el perfil los mostrara con 8.
 */
function _excDiasNecesitaReparo(dias) {
  var offs = Object.keys(dias);
  for (var i = 0; i < offs.length; i++) {
    if (_excDiasNum(dias[offs[i]][GC.ATAQUES_HOY - 1]) > 4) return true;
  }
  var segs = _excDiasSegmentos(dias);
  for (var j = 0; j < segs.length; j++) {
    var s = segs[j];
    if (s.A > 4 * s.dias.length) return true;
    if (s.dias.length > 1 && s.A > 4) return true;
  }
  return false;
}

/**
 * Clasifica todos los casos de un conjunto de filas (sin encabezado). Devuelve un arreglo de
 * { grupo, patron, resumen } ordenado por temporada, semana, tag y clan.
 */
function _excDiasClasificar(filas) {
  var grupos = _excDiasAgrupar(filas);
  var claves = Object.keys(grupos).filter(function (k) { return _excDiasNecesitaReparo(grupos[k].dias); }).sort();
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

// ---------------------------------------------------------------------------------------------------------------
// PLAN DE ESCRITURA (funciones puras: no tocan las filas; se prueban en node)
// ---------------------------------------------------------------------------------------------------------------

var EXC_DIAS_CLASES_UNICAS = ['unica'];
var EXC_DIAS_CLASES_TODAS = ['unica', 'ambigua_ataques_coinciden'];

/** Lo registrado hoy por día (ataques de la fila y delta de barcos y fame de los acumulados), para elegir la solución más cercana. */
function _excDiasRegistradoPorDia(dias) {
  var reg = {}, pb = 0, pf = 0;
  Object.keys(dias).map(Number).sort(function (a, b) { return a - b; }).forEach(function (o) {
    var r = dias[o];
    var b = _excDiasNum(r[GC.BARCOS - 1]), f = _excDiasNum(r[GC.FAME - 1]);
    reg[o] = { n: _excDiasNum(r[GC.ATAQUES_HOY - 1]), b: Math.max(0, b - pb), f: Math.max(0, f - pf) };
    pb = b; pf = f;
  });
  return reg;
}

/** Entre las soluciones de un tramo elige UNA terna completa: la que cambia menos lo registrado (empate: la primera, orden fijo). */
function _excDiasElegirSolucion(item, regPorDia) {
  var mejor = null, mejorD = Infinity;
  item.sols.forEach(function (z) {
    var d = 0;
    item.dias.forEach(function (dia, i) {
      var r = regPorDia[dia] || { n: 0, b: 0, f: 0 };
      d += (z[i][0] !== r.n ? 1 : 0) + (z[i][1] !== r.b ? 1 : 0) + (z[i][2] !== r.f ? 1 : 0);
    });
    if (d < mejorD) { mejorD = d; mejor = z; }
  });
  return mejor;
}

/** Acumulados (ataques, barcos, fame) de la fila de mayor día de un grupo. */
function _excDiasFinalDe(dias) {
  var offs = Object.keys(dias).map(Number).sort(function (a, b) { return a - b; });
  if (!offs.length) return { a: 0, b: 0, f: 0 };
  var r = dias[offs[offs.length - 1]];
  return { a: _excDiasNum(r[GC.ATAQUES_SEM - 1]), b: _excDiasNum(r[GC.BARCOS - 1]), f: _excDiasNum(r[GC.FAME - 1]) };
}

/**
 * Origen nuevo de una fila: 'Corregido' (la fila ya existia) o 'Reconstruido' (la fila se crea), mas el sufijo
 * ' - Solución única' (una sola terna posible en el tramo) o ' - Solución estimada' (varias ternas válidas; se eligió una).
 * Una fila que ya era 'Reconstruido' sigue siendo 'Reconstruido'. Cualquier otro origen distinto de vacío, 'Original' o
 * 'Corregido' no se toca.
 */
function _excDiasOrigenNuevo(origenActual, existe, estimado) {
  var sufijo = estimado ? ' - Solución estimada' : ' - Solución única';
  if (!existe) return 'Reconstruido' + sufijo;
  var o = String(origenActual || '').trim();
  if (_origenGuerraEs_(o, 'Reconstruido')) return 'Reconstruido' + sufijo;
  if (o === '' || _origenGuerraEs_(o, 'Original') || _origenGuerraEs_(o, 'Corregido')) return 'Corregido' + sufijo;
  return o;
}

/**
 * Planifica la escritura de los casos cuya clase esté en clases. NO modifica `filas`.
 * Devuelve { casos: [{ grupo, clase, estimado, ops: [{ dia, existe, fila, ant, nuevo }] }], omitidos: [{ grupo, clase, motivo }] }.
 * Cada op lleva los valores del día: nuevo = { hoy, sem, fame, barcos, origen }. Las ternas salen de UNA solución completa
 * por tramo (ataques, barcos y fame del día en la tabla y con las sumas de los acumulados de las filas reales).
 */
function _excDiasPlanificar(filas, clases) {
  var grupos = _excDiasAgrupar(filas);
  var porSemana = {};
  Object.keys(grupos).forEach(function (k) {
    var g = grupos[k], ks = g.temporada + '|' + g.semana + '|' + g.tag;
    if (!porSemana[ks]) porSemana[ks] = [];
    porSemana[ks].push(g);
  });
  var plan = { casos: [], omitidos: [] };
  _excDiasClasificar(filas).forEach(function (c) {
    var g = c.grupo, clase = c.resumen.clase;
    if (clases.indexOf(clase) < 0) return;
    var res = _excDiasResolver(g.dias);
    if (res.clase !== 'ok') { plan.omitidos.push({ grupo: g, clase: clase, motivo: 'sin solucion' }); return; }
    var reg = _excDiasRegistradoPorDia(g.dias);
    var finalAntes = _excDiasFinalDe(g.dias);
    var ops = [], estimado = false, cumA = 0, cumB = 0, cumF = 0, cubiertos = {};
    res.hechos.forEach(function (item) {
      var z = _excDiasElegirSolucion(item, reg);
      if (item.sols.length > 1) estimado = true;
      item.dias.forEach(function (d, i) {
        cumA += z[i][0]; cumB += z[i][1]; cumF += z[i][2];
        var fila = g.dias[d] || null;
        cubiertos[d] = true;
        ops.push({ dia: d, existe: !!fila, fila: fila, estimadoDia: item.sols.length > 1,
          ant: fila ? { hoy: _excDiasNum(fila[GC.ATAQUES_HOY - 1]), sem: _excDiasNum(fila[GC.ATAQUES_SEM - 1]), fame: _excDiasNum(fila[GC.FAME - 1]), barcos: _excDiasNum(fila[GC.BARCOS - 1]), origen: String(fila[GC.ORIGEN - 1] || '') } : null,
          antDia: reg[d] || null,
          nuevo: { hoy: z[i][0], sem: cumA, fame: cumF, barcos: cumB, fameDia: z[i][2], barcosDia: z[i][1], origen: '' } });
      });
    });
    // Toda fila existente tiene que quedar cubierta por algun tramo.
    var sinCubrir = Object.keys(g.dias).map(Number).filter(function (d) { return !cubiertos[d]; });
    if (sinCubrir.length) { plan.omitidos.push({ grupo: g, clase: clase, motivo: 'filas existentes sin cubrir por el modelo' }); return; }
    // El total de la semana no cambia.
    if (cumA !== finalAntes.a || cumB !== finalAntes.b || cumF !== finalAntes.f) {
      plan.omitidos.push({ grupo: g, clase: clase, motivo: 'el total de la semana no cuadra (' + cumA + '/' + cumB + '/' + cumF + ' contra ' + finalAntes.a + '/' + finalAntes.b + '/' + finalAntes.f + ')' }); return;
    }
    // Comprobacion entre clanes: tope de 4 por dia y de 16 por semana sumando los demas clanes del jugador.
    var otros = (porSemana[g.temporada + '|' + g.semana + '|' + g.tag] || []).filter(function (o) { return o.clan !== g.clan; });
    var excede = '';
    ops.forEach(function (op) {
      var suma = op.nuevo.hoy;
      otros.forEach(function (o) { if (o.dias[op.dia]) suma += _excDiasNum(o.dias[op.dia][GC.ATAQUES_HOY - 1]); });
      if (suma > 4) excede = 'dia ' + EXC_DIAS_LETRAS.charAt(op.dia) + ' quedaria con ' + suma + ' ataques sumando clanes';
    });
    var semanaOtros = 0;
    otros.forEach(function (o) { semanaOtros += _excDiasFinalDe(o.dias).a; });
    if (!excede && cumA + semanaOtros > 16) excede = 'la semana quedaria con ' + (cumA + semanaOtros) + ' ataques sumando clanes';
    if (excede) { plan.omitidos.push({ grupo: g, clase: clase, motivo: excede }); return; }
    ops.forEach(function (op) {
      op.nuevo.origen = _excDiasOrigenNuevo(op.existe ? op.ant.origen : '', op.existe, op.estimadoDia);
      // Una fila que ya tenia exactamente esos valores no cambia: se deja con su Origen (no se marca 'Corregido' sin haberla corregido).
      if (op.existe && op.ant.hoy === op.nuevo.hoy && op.ant.sem === op.nuevo.sem && op.ant.fame === op.nuevo.fame && op.ant.barcos === op.nuevo.barcos) {
        op.sinCambio = true; op.nuevo.origen = op.ant.origen;
      }
    });
    plan.casos.push({ grupo: g, clase: clase, estimado: estimado, ops: ops });
  });
  return plan;
}

/** Fila nueva (reconstruida) de un dia que no tiene fila, con los datos del propio jugador y clan. */
function _excDiasFilaNueva(g, op) {
  var temporada = Number(g.temporada), semana = Number(g.semana);
  var pIdx = (semana - 1) * 7 + 3 + op.dia;
  var diaGuerraObj = calcDiaGuerraIdx(CFG.REF_DEFAULT, temporada, pIdx);
  var f = new Array(GUERRA_TOTAL_COLS).fill('');
  var modelo = null;
  Object.keys(g.dias).forEach(function (o) { if (!modelo) modelo = g.dias[o]; });
  f[GC.TEMPORADA - 1] = String(g.temporada);
  f[GC.SEMANA - 1] = String(g.semana);
  f[GC.DIA - 1] = periodIdxToLetra(pIdx);
  f[GC.PERIOD_IDX - 1] = String(pIdx);
  f[GC.ETAPA - 1] = 'Guerra';
  f[GC.CLAN - 1] = g.clan;
  f[GC.TAG - 1] = g.tag;
  f[GC.NOMBRE - 1] = g.nombre;
  f[GC.TEMPORADA_2 - 1] = (modelo && String(modelo[GC.TEMPORADA_2 - 1] || '') !== '') ? String(modelo[GC.TEMPORADA_2 - 1]) : String(_getTemporadaRoyaleApiDesdePropia(temporada));
  f[GC.FECHA - 1] = (diaGuerraObj instanceof Date) ? _formatFechaCanonica(diaGuerraObj, true) : '';
  f[GC.DIA_GUERRA - 1] = (diaGuerraObj instanceof Date) ? _formatFechaCanonica(diaGuerraObj) : '';
  return f;
}

/** Aplica el plan sobre `filas` (modifica las filas existentes y agrega al final las nuevas). Devuelve cuantas modifico y cuantas creo. */
function _excDiasAplicarPlan(filas, plan) {
  var modificadas = 0, creadas = 0;
  plan.casos.forEach(function (c) {
    c.ops.forEach(function (op) {
      var fila = op.fila;
      if (!op.existe) {
        fila = _excDiasFilaNueva(c.grupo, op);
        filas.push(fila);
        op.filaNueva = fila;
        creadas++;
      } else if (!op.sinCambio) {
        modificadas++;
      }
      fila[GC.ATAQUES_HOY - 1] = String(op.nuevo.hoy);
      fila[GC.ATAQUES_SEM - 1] = String(op.nuevo.sem);
      fila[GC.FAME - 1] = String(op.nuevo.fame);
      fila[GC.BARCOS - 1] = String(op.nuevo.barcos);
      fila[GC.ORIGEN - 1] = op.nuevo.origen;
    });
  });
  return { modificadas: modificadas, creadas: creadas };
}

/**
 * Verifica, sobre las filas ya leidas de nuevo desde Drive, que:
 *  (1) el numero de filas es el de antes mas las creadas; (2) las filas que el plan no toca son identicas a las de antes;
 *  (3) cada fila del plan quedo con los valores planeados; (4) en cada caso, cada dia esta en la tabla de fame (ataques, barcos y fame del dia),
 *      ninguno pasa de 4 ataques y el total de la semana es el mismo de antes. Devuelve la lista de problemas (vacia = todo bien).
 */
function _excDiasVerificar(filasAntes, filasDespues, plan, creadasEsperadas) {
  var problemas = [];
  if (filasDespues.length !== filasAntes.length + creadasEsperadas) problemas.push('numero de filas ' + filasDespues.length + ' en vez de ' + (filasAntes.length + creadasEsperadas));
  var tocadas = {};
  plan.casos.forEach(function (c) { c.ops.forEach(function (op) { if (op.existe) tocadas[op.idxAntes] = true; }); });
  for (var i = 0; i < filasAntes.length && i < filasDespues.length; i++) {
    if (tocadas[i]) continue;
    if (filasAntes[i].join('\u0001') !== filasDespues[i].slice(0, filasAntes[i].length).join('\u0001')) { problemas.push('cambio una fila no planeada (linea ' + (i + 2) + ')'); if (problemas.length > 10) break; }
  }
  var grupos = _excDiasAgrupar(filasDespues);
  plan.casos.forEach(function (c) {
    var g = c.grupo, k = [g.temporada, g.semana, g.tag, g.clan].join('|'), gd = grupos[k];
    var etq = 'T' + g.temporada + ' S' + g.semana + ' ' + g.tag + ' ' + g.clan + ': ';
    if (!gd) { problemas.push(etq + 'no se encuentra la serie'); return; }
    c.ops.forEach(function (op) {
      var f = gd.dias[op.dia];
      if (!f) { problemas.push(etq + 'falta la fila del dia ' + EXC_DIAS_LETRAS.charAt(op.dia)); return; }
      var v = { hoy: _excDiasNum(f[GC.ATAQUES_HOY - 1]), sem: _excDiasNum(f[GC.ATAQUES_SEM - 1]), fame: _excDiasNum(f[GC.FAME - 1]), barcos: _excDiasNum(f[GC.BARCOS - 1]) };
      if (v.hoy !== op.nuevo.hoy || v.sem !== op.nuevo.sem || v.fame !== op.nuevo.fame || v.barcos !== op.nuevo.barcos || String(f[GC.ORIGEN - 1]) !== op.nuevo.origen) problemas.push(etq + 'la fila del dia ' + EXC_DIAS_LETRAS.charAt(op.dia) + ' no quedo como se planeo');
    });
    var pb = 0, pf = 0, pa = 0;
    Object.keys(gd.dias).map(Number).sort(function (a, b) { return a - b; }).forEach(function (o) {
      var f = gd.dias[o];
      var n = _excDiasNum(f[GC.ATAQUES_HOY - 1]), b = _excDiasNum(f[GC.BARCOS - 1]), fm = _excDiasNum(f[GC.FAME - 1]), a = _excDiasNum(f[GC.ATAQUES_SEM - 1]);
      if (n > 4) problemas.push(etq + 'dia ' + EXC_DIAS_LETRAS.charAt(o) + ' con mas de 4 ataques');
      if (a - pa !== n) problemas.push(etq + 'dia ' + EXC_DIAS_LETRAS.charAt(o) + ': AtaquesSemana no sube lo que dice AtaquesHoy');
      if (_fameTablaDia_(n, b - pb).indexOf(fm - pf) < 0) problemas.push(etq + 'dia ' + EXC_DIAS_LETRAS.charAt(o) + ': ' + n + ' ataques, ' + (b - pb) + ' barcos y ' + (fm - pf) + ' de fame no estan en la tabla');
      pa = a; pb = b; pf = fm;
    });
    var fin = _excDiasFinalDe(gd.dias), antes = c.finalAntes;
    if (antes && (fin.a !== antes.a || fin.b !== antes.b || fin.f !== antes.f)) problemas.push(etq + 'el total de la semana cambio (' + fin.a + '/' + fin.b + '/' + fin.f + ' contra ' + antes.a + '/' + antes.b + '/' + antes.f + ')');
  });
  return problemas;
}

// ---------------------------------------------------------------------------------------------------------------
// ENTRADAS (Drive)
// ---------------------------------------------------------------------------------------------------------------

/** repararDiasConExcesoInforme() -> SOLO INFORMA: CSV de clasificacion (una fila por caso) y CSV del plan (que escribiria el aplicar). */
function repararDiasConExcesoInforme() { _repararDiasConExceso_(false, EXC_DIAS_CLASES_TODAS); }

/** Tanda 1: aplica solo los casos de clase 'unica' (los 12 con ataques, barcos y fame del dia determinados). */
function repararDiasConExcesoAplicarUnicas() { _repararDiasConExceso_(true, EXC_DIAS_CLASES_UNICAS); }

/** Aplica los casos 'unica' y 'ambigua_ataques_coinciden'; los 'ambigua' y los 'imposible' van a Revision_Guerra.csv. */
function repararDiasConExcesoAplicar() { _repararDiasConExceso_(true, EXC_DIAS_CLASES_TODAS); }

function _repararDiasConExceso_(aplicar, clases) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[DiasConExceso] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    if (!csvText) { Logger.log('[DiasConExceso] No se encontro Backup_Guerra.csv; no se hace nada.'); return; }
    var parsed = _parseCSV(csvText);
    if (!parsed || parsed.length < 2) { Logger.log('[DiasConExceso] Backup_Guerra.csv esta vacio; no se hace nada.'); return; }
    var encabezado = parsed[0];
    var filas = parsed.slice(1);
    for (var a = 0; a < filas.length; a++) { while (filas[a].length < GUERRA_TOTAL_COLS) filas[a].push(''); }
    var copiaAntes = filas.map(function (r) { return r.slice(); });

    var casos = _excDiasClasificar(filas);
    var cuenta = {};
    var suma = function (k) { cuenta[k] = (cuenta[k] || 0) + 1; };
    casos.forEach(function (c) { suma(c.resumen.clase); });
    var porClase = ['unica', 'ambigua_ataques_coinciden', 'ambigua', 'imposible'].map(function (k) { return k + ' ' + (cuenta[k] || 0); }).join(' | ');

    var plan = _excDiasPlanificar(filas, clases);
    var idxDe = new Map();
    for (var q = 0; q < filas.length; q++) idxDe.set(filas[q], q);
    plan.casos.forEach(function (c) {
      c.finalAntes = _excDiasFinalDe(c.grupo.dias);
      c.ops.forEach(function (op) { if (op.existe) op.idxAntes = idxDe.get(op.fila); });
    });
    var nCrear = 0, nModificar = 0;
    plan.casos.forEach(function (c) { c.ops.forEach(function (op) { if (!op.existe) nCrear++; else if (!op.sinCambio) nModificar++; }); });

    // Hoja Guerra (temporada vigente): los casos de la hoja no se tocan, solo se cuentan.
    var casosHoja = 0;
    try {
      var sh = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
      if (sh && sh.getLastRow() >= 2) casosHoja = _excDiasClasificar(sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues()).length;
    } catch (eHoja) { Logger.log('[DiasConExceso] No se pudo revisar la hoja Guerra: ' + eHoja.message); }

    // CSV de clasificacion (solo en modo informe).
    var nombresCsv = [];
    if (!aplicar) {
      var clasif = [['Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Filas existentes', 'AtaquesHoy actual (J|V|S|D)', 'Clase', 'Soluciones',
        'Ataques coinciden', 'Ataques por dia (J|V|S|D)', 'Fame por dia', 'Barcos por dia', 'Notas']];
      casos.forEach(function (c) {
        var g = c.grupo, r = c.resumen;
        clasif.push([g.temporada, g.semana, g.tag, g.nombre, g.clan, c.patron, _excDiasTextoActual(g.dias), r.clase, r.soluciones,
          r.ataquesCoinciden, _excDiasTextoPorDia(r.porDia, 'n'), _excDiasTextoPorDia(r.porDia, 'f'), _excDiasTextoPorDia(r.porDia, 'b'), r.notas]);
      });
      var nomClasif = 'Reparacion_DiasConExceso ' + marca + ' (informe).csv';
      if (clasif.length > 1) { _saveCSVToDrive(nomClasif, _encodeCSV(clasif)); nombresCsv.push(nomClasif); }
    }

    // CSV del plan / de lo aplicado: una fila por dia escrito.
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
    plan.omitidos.forEach(function (o) {
      var g = o.grupo;
      detalle.push([g.temporada, g.semana, g.tag, g.nombre, g.clan, o.clase, '', '', 'OMITIDO: ' + o.motivo, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    });
    var nomDetalle = 'Reparacion_DiasConExceso ' + marca + ' (' + (aplicar ? 'aplicado' : 'plan') + ').csv';
    if (detalle.length > 1) { _saveCSVToDrive(nomDetalle, _encodeCSV(detalle)); nombresCsv.push(nomDetalle); }

    var verificacion = '', revisionTxt = '';
    if (aplicar && plan.casos.length > 0) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      _saveCSVToDrive('Backup_Guerra ANTES de reparar DiasConExceso ' + marca + '.csv', csvText);
      var res = _excDiasAplicarPlan(filas, plan);
      _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezado].concat(filas)));

      // Verificacion: se vuelve a leer el CSV desde Drive.
      var problemas = [];
      var despues = _loadCSVFromDrive('Backup_Guerra.csv');
      var parsedDespues = despues ? _parseCSV(despues) : null;
      if (!parsedDespues || parsedDespues.length < 2) {
        problemas.push('No se pudo releer Backup_Guerra.csv');
      } else {
        var filasDespues = parsedDespues.slice(1);
        for (var b = 0; b < filasDespues.length; b++) { while (filasDespues[b].length < GUERRA_TOTAL_COLS) filasDespues[b].push(''); }
        problemas = _excDiasVerificar(copiaAntes, filasDespues, plan, res.creadas);
        var restantes = _excDiasClasificar(filasDespues).filter(function (c) { return clases.indexOf(c.resumen.clase) >= 0; }).length;
        verificacion = 'Casos que siguen con mas de 4 ataques en esas clases: ' + restantes + '. ';
      }
      verificacion += problemas.length
        ? 'VERIFICACION FALLO (' + problemas.length + '): ' + problemas.slice(0, 5).join('; ') + '. Restaurar con el respaldo "Backup_Guerra ANTES de reparar DiasConExceso ' + marca + '.csv".'
        : 'Verificacion OK (' + res.modificadas + ' fila(s) modificadas, ' + res.creadas + ' creadas).';

      // Los casos que el modelo no resuelve van a Revision_Guerra.csv (solo cuando se aplica el conjunto completo).
      if (clases.length > 1) {
        var entradas = [];
        casos.forEach(function (c) {
          if (c.resumen.clase === 'ambigua' || c.resumen.clase === 'imposible') {
            entradas.push({ temporada: c.grupo.temporada, semana: c.grupo.semana, tag: c.grupo.tag, nombre: c.grupo.nombre, tipo: 'alarma',
              motivo: 'dia con mas de 4 ataques: ' + (c.resumen.clase === 'imposible' ? 'sin reparto posible' : 'ataques por dia distintos segun la solucion'),
              detalle: c.grupo.clan + ', filas ' + c.patron + ', AtaquesHoy actual ' + _excDiasTextoActual(c.grupo.dias) + '. ' + c.resumen.notas });
          }
        });
        plan.omitidos.forEach(function (o) {
          entradas.push({ temporada: o.grupo.temporada, semana: o.grupo.semana, tag: o.grupo.tag, nombre: o.grupo.nombre, tipo: 'alarma',
            motivo: 'dia con mas de 4 ataques: no se escribio', detalle: o.grupo.clan + ': ' + o.motivo });
        });
        var rr = _registrarRevisionGuerra_(entradas);
        revisionTxt = 'Revision_Guerra.csv: ' + rr.nuevas + ' nuevas, ' + rr.actualizadas + ' actualizadas. ';
      }
    }

    Logger.log('[DiasConExceso] ' + (aplicar ? 'APLICAR ' + clases.join('+') : 'SOLO INFORMAR') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). Backup_Guerra.csv: ' + filas.length + ' filas. ' +
      'Casos con algun dia de mas de 4 ataques: ' + casos.length + '. Por clase: ' + porClase + '. ' +
      'Se escribirian/escribieron: ' + plan.casos.length + ' caso(s), ' + nModificar + ' fila(s) a modificar y ' + nCrear + ' a crear; omitidos por el plan: ' + plan.omitidos.length + '. ' +
      'Casos en la hoja Guerra (no se tocan): ' + casosHoja + '. ' + revisionTxt + (verificacion ? verificacion + ' ' : '') +
      (nombresCsv.length ? 'Detalle en Drive: ' + nombresCsv.join(' y ') + '.' : 'No hay casos.') +
      (aplicar ? '' : ' (No se escribio nada en el Backup ni en Guerra.)'));
  } finally {
    lock.releaseLock();
  }
}


// ============================================================================================================
// FAME POR DÍA REAL DE LOS 52 CASOS CON CurrentRiverRace (20-oct-2026; Contexto_Base_Web.md §PF139)
// Cruce hecho en solo lectura (Datos descargados/CSV/Informes/Informe_52_CurrentRiverRace_vs_Hoja 2026-10-20.csv):
// en estos casos los ataques por día ya coinciden con CurrentRiverRace y la fame de la semana también; solo cambia
// cómo se reparte la fame entre los días. Cada fila: [temporada, semana, tag, ataques J|V|S|D, fame por día HOY,
// fame por día REAL]. La fame por día real sale de los JSON de CurrentRiverRace (cierre de cada día) y del total semanal.
//   informeFameCurrentRiverRace52()  -> SOLO INFORMA: CSV con lo que escribiría. No toca nada.
//   aplicarFameCurrentRiverRace52()  -> respaldo previo de Backup_Guerra.csv, escribe la Fame acumulada de J, V y S
//                                       (el domingo conserva el total semanal), Origen 'Corregido - CurrentRiverRace',
//                                       y verifica releyendo el CSV.
// Solo escribe un caso si TODO coincide con lo medido: las cuatro filas existen, AtaquesHoy y AtaquesSemana son los del
// informe, Barcos acumulados = 0 y la fame por día de hoy es exactamente la del informe. Si no, lo omite y dice por qué
// (si ya tiene la fame real, dice «ya aplicado»). No toca ataques, barcos ni el total semanal.
// ============================================================================================================
var FAME_CRR52_ORIGEN = 'Corregido - CurrentRiverRace';
var FAME_CRR52_CASOS = [
  ['3', '1', '#20YVVYCU2', '4|4|4|4', '800|500|400|500', '800|500|500|400'],
  ['3', '1', '#22C090RVJ', '4|4|4|4', '600|600|400|800', '600|600|500|700'],
  ['3', '1', '#2GG8PJ8GC', '4|4|4|4', '600|800|600|900', '600|800|800|700'],
  ['3', '1', '#2LCJLUC9J', '4|4|4|4', '550|550|400|900', '550|550|600|700'],
  ['3', '1', '#80PPY9R9G', '4|4|4|4', '700|800|400|700', '700|800|600|500'],
  ['3', '1', '#829GQP0JL', '4|4|4|4', '600|500|400|800', '600|500|600|600'],
  ['3', '1', '#8C0PQ9PR9', '4|4|4|4', '800|800|400|900', '800|800|500|800'],
  ['3', '1', '#8VU0Y9LJ0', '4|4|4|4', '700|700|500|900', '700|700|600|800'],
  ['3', '1', '#9G0RQR2GV', '4|4|4|4', '800|650|500|900', '800|650|700|700'],
  ['3', '1', '#9LCJ2JQ08', '4|4|4|4', '900|900|700|900', '900|900|800|800'],
  ['3', '1', '#C0PGPR90U', '4|4|4|4', '800|700|400|600', '800|700|500|500'],
  ['3', '1', '#C0YVCRPY2', '4|4|4|4', '800|700|400|700', '800|700|500|600'],
  ['3', '1', '#CGGGR82PJ', '4|4|4|4', '550|800|600|900', '550|800|800|700'],
  ['3', '1', '#CPRQG82L', '4|4|4|4', '700|500|400|600', '700|500|600|400'],
  ['3', '1', '#CUQG9CJUG', '4|4|4|4', '800|500|400|800', '800|500|500|700'],
  ['3', '1', '#GVVPJ8CLG', '4|4|4|4', '500|700|600|900', '500|700|800|700'],
  ['3', '1', '#J2JJ8LGV9', '4|4|4|4', '900|400|550|800', '900|400|650|700'],
  ['3', '1', '#J8V9PQJP9', '4|4|4|4', '500|400|400|800', '500|400|600|600'],
  ['3', '1', '#JV08RQU2Y', '4|4|4|4', '800|400|400|650', '800|400|500|550'],
  ['3', '1', '#LRQ8YJRCU', '4|4|4|4', '400|400|400|600', '400|400|500|500'],
  ['3', '1', '#LRR2RGCCV', '4|4|4|4', '650|700|600|900', '650|700|800|700'],
  ['3', '1', '#PJL9GL8U2', '4|4|4|4', '600|600|400|800', '600|600|600|600'],
  ['3', '1', '#Q98RGPGCU', '4|4|4|4', '500|600|500|900', '500|600|600|800'],
  ['3', '1', '#QR8JGLC9Q', '4|4|4|4', '800|700|400|800', '800|700|700|500'],
  ['3', '1', '#R98JQRU99', '4|4|4|4', '500|600|500|900', '500|600|700|700'],
  ['3', '1', '#RGQUGU0CU', '4|4|4|4', '550|650|400|650', '550|650|500|550'],
  ['3', '1', '#U9L82V28P', '4|4|4|4', '500|700|500|900', '500|700|800|600'],
  ['3', '1', '#U9P0PYQQ2', '4|4|4|4', '500|500|400|800', '500|500|500|700'],
  ['3', '1', '#UG90QUU0P', '4|4|4|4', '700|700|400|800', '700|700|600|600'],
  ['3', '1', '#UJUGRYY9C', '4|4|4|4', '800|700|700|900', '800|700|800|800'],
  ['3', '1', '#UR902UV8L', '4|4|4|4', '600|700|600|900', '600|700|700|800'],
  ['3', '1', '#V0UJ0RPVP', '4|4|4|4', '500|500|400|800', '500|500|700|500'],
  ['3', '1', '#VLU8GLL09', '4|4|4|4', '700|700|600|900', '700|700|700|800'],
  ['3', '1', '#VPRGY9YGG', '4|4|4|4', '700|700|400|800', '700|700|600|600'],
  ['3', '1', '#VQCG0G09G', '4|4|4|4', '500|800|400|650', '500|800|500|550'],
  ['3', '1', '#VR92C8LYU', '4|4|4|4', '500|700|400|700', '500|700|550|550'],
  ['3', '1', '#YGL2QV8LG', '0|4|4|4', '0|650|700|900', '0|650|900|700'],
  ['3', '2', '#20YVVYCU2', '4|4|4|4', '800|400|550|700', '800|550|700|400'],
  ['3', '2', '#8J9PL92GU', '4|4|4|4', '650|400|400|700', '650|400|500|600'],
  ['3', '2', '#8PYCU9U9Q', '4|4|4|4', '700|400|500|900', '700|600|600|600'],
  ['3', '2', '#8Q92GV08U', '4|4|4|4', '600|400|600|900', '600|700|500|700'],
  ['3', '2', '#8VU0Y9LJ0', '4|4|4|4', '500|400|600|900', '500|500|600|800'],
  ['3', '2', '#92YRUUV9P', '4|4|4|4', '400|500|400|500', '400|500|500|400'],
  ['3', '2', '#C8Q0C88UL', '4|4|4|4', '500|700|400|500', '500|700|500|400'],
  ['3', '2', '#CGGGR82PJ', '4|4|4|4', '800|700|550|800', '800|700|650|700'],
  ['3', '2', '#CYR2PVLLY', '4|4|4|4', '650|400|650|900', '650|500|800|650'],
  ['3', '2', '#Q98RGPGCU', '4|4|4|4', '600|400|600|900', '600|600|800|500'],
  ['3', '2', '#RGQUGU0CU', '4|4|4|4', '900|400|400|900', '900|550|650|500'],
  ['3', '2', '#U8CJG9JQ0', '4|4|4|4', '600|400|800|900', '600|800|700|600'],
  ['3', '2', '#V929CC8CC', '4|4|4|4', '550|550|700|900', '550|650|800|700'],
  ['3', '2', '#VLU8GLL09', '4|4|4|4', '800|500|900|900', '800|600|800|900'],
  ['3', '2', '#VY0UJ82PV', '4|4|4|4', '700|400|400|900', '700|600|600|500']
];

function informeFameCurrentRiverRace52() { _fameCrr52_(false); }
function aplicarFameCurrentRiverRace52() { _fameCrr52_(true); }

/** Arma el plan sobre filas (arreglo de arreglos sin encabezado). No modifica filas. */
function _fameCrr52Planificar_(filas) {
  var grupos = _excDiasAgrupar(filas);
  var porClave = {};
  Object.keys(grupos).forEach(function (k) {
    var g = grupos[k], c = [g.temporada, g.semana, g.tag].join('|');
    if (!porClave[c]) porClave[c] = [];
    porClave[c].push(g);
  });
  var casos = [], omitidos = [], yaAplicados = [];
  FAME_CRR52_CASOS.forEach(function (e) {
    var etq = 'T' + e[0] + ' S' + e[1] + ' ' + e[2];
    var lista = porClave[[e[0], e[1], e[2]].join('|')] || [];
    if (lista.length !== 1) { omitidos.push({ etq: etq, motivo: lista.length ? 'el jugador aparece en ' + lista.length + ' clanes esa semana' : 'no se encuentra la serie en Backup_Guerra.csv' }); return; }
    var g = lista[0];
    var ata = e[3].split('|').map(Number), fh = e[4].split('|').map(Number), fr = e[5].split('|').map(Number);
    var motivo = '', cur = [], ops = [], acumAnt = 0, acumNue = 0, acumAtaques = 0;
    for (var d = 0; d < 4 && !motivo; d++) {
      var f = g.dias[d];
      if (!f) { motivo = 'falta la fila del dia ' + EXC_DIAS_LETRAS.charAt(d); break; }
      var hoy = _excDiasNum(f[GC.ATAQUES_HOY - 1]), sem = _excDiasNum(f[GC.ATAQUES_SEM - 1]), fame = _excDiasNum(f[GC.FAME - 1]), barcos = _excDiasNum(f[GC.BARCOS - 1]);
      acumAtaques += ata[d];
      if (hoy !== ata[d] || sem !== acumAtaques) { motivo = 'los ataques del dia ' + EXC_DIAS_LETRAS.charAt(d) + ' ya no son los del informe (' + hoy + ' hoy y ' + sem + ' acumulados)'; break; }
      if (barcos !== 0) { motivo = 'el dia ' + EXC_DIAS_LETRAS.charAt(d) + ' tiene barcos acumulados (' + barcos + ')'; break; }
      cur.push(fame - acumAnt);
      acumNue += fr[d];
      ops.push({ dia: d, fila: f, acumAnt: fame, acumNue: acumNue, deltaAnt: fame - acumAnt, deltaNue: fr[d], origenAnt: String(f[GC.ORIGEN - 1] || '') });
      acumAnt = fame;
    }
    if (!motivo) {
      var igualHoy = cur.every(function (v, i) { return v === fh[i]; });
      var igualReal = cur.every(function (v, i) { return v === fr[i]; });
      var sumH = fh.reduce(function (a, b) { return a + b; }, 0), sumR = fr.reduce(function (a, b) { return a + b; }, 0);
      if (sumH !== sumR) motivo = 'el informe no conserva el total semanal (' + sumH + ' contra ' + sumR + ')';
      else if (igualReal) { yaAplicados.push({ etq: etq, motivo: 'ya aplicado: la fame por dia ya es la de CurrentRiverRace' }); return; }
      else if (!igualHoy) motivo = 'la fame por dia de hoy (' + cur.join('|') + ') no es la del informe (' + fh.join('|') + ')';
      else {
        for (var q = 0; q < 4; q++) {
          if (_fameTablaDia_(ata[q], 0).indexOf(fr[q]) < 0) { motivo = 'la fame real del dia ' + EXC_DIAS_LETRAS.charAt(q) + ' (' + fr[q] + ') no esta en la tabla para ' + ata[q] + ' ataques'; break; }
        }
      }
    }
    if (motivo) { omitidos.push({ etq: etq, motivo: motivo }); return; }
    casos.push({ grupo: g, etq: etq, ops: ops, ata: ata, fh: fh, fr: fr, totalFame: ops[3].acumAnt });
  });
  return { casos: casos, omitidos: omitidos, yaAplicados: yaAplicados };
}

function _fameCrr52_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[FameCRR52] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    if (!csvText) { Logger.log('[FameCRR52] No se encontro Backup_Guerra.csv; no se hace nada.'); return; }
    var parsed = _parseCSV(csvText);
    if (!parsed || parsed.length < 2) { Logger.log('[FameCRR52] Backup_Guerra.csv esta vacio; no se hace nada.'); return; }
    var encabezado = parsed[0];
    var filas = parsed.slice(1);
    for (var a = 0; a < filas.length; a++) { while (filas[a].length < GUERRA_TOTAL_COLS) filas[a].push(''); }
    var copiaAntes = filas.map(function (r) { return r.slice(); });
    var idxDe = new Map();
    for (var q = 0; q < filas.length; q++) idxDe.set(filas[q], q);

    var plan = _fameCrr52Planificar_(filas);
    plan.casos.forEach(function (c) { c.ops.forEach(function (op) { op.idxAntes = idxDe.get(op.fila); }); });
    var nFilas = 0;
    plan.casos.forEach(function (c) { c.ops.forEach(function (op) { if (op.acumAnt !== op.acumNue) nFilas++; }); });

    var detalle = [['Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Dia', 'PeriodIndex', 'Accion', 'Ataques del dia',
      'Fame del dia anterior', 'Fame del dia nueva', 'Fame anterior (acumulado)', 'Fame nueva (acumulado)', 'Origen anterior', 'Origen nuevo']];
    plan.casos.forEach(function (c) {
      var g = c.grupo;
      c.ops.forEach(function (op) {
        detalle.push([g.temporada, g.semana, g.tag, g.nombre, g.clan, EXC_DIAS_LETRAS.charAt(op.dia), _excDiasNum(op.fila[GC.PERIOD_IDX - 1]),
          op.acumAnt !== op.acumNue ? 'Modificar' : 'Sin cambio', c.ata[op.dia], op.deltaAnt, op.deltaNue, op.acumAnt, op.acumNue,
          op.origenAnt, op.acumAnt !== op.acumNue ? FAME_CRR52_ORIGEN : op.origenAnt]);
      });
    });
    plan.omitidos.concat(plan.yaAplicados).forEach(function (o) {
      detalle.push(['', '', o.etq, '', '', '', '', 'OMITIDO: ' + o.motivo, '', '', '', '', '', '', '']);
    });
    var nomDetalle = 'Reparacion_FameCurrentRiverRace52 ' + marca + ' (' + (aplicar ? 'aplicado' : 'plan') + ').csv';
    if (detalle.length > 1) _saveCSVToDrive(nomDetalle, _encodeCSV(detalle));

    var verificacion = '';
    if (aplicar && plan.casos.length > 0) {
      _saveCSVToDrive('Backup_Guerra ANTES de reparar FameCurrentRiverRace52 ' + marca + '.csv', csvText);
      plan.casos.forEach(function (c) {
        c.ops.forEach(function (op) {
          if (op.acumAnt === op.acumNue) return;
          op.fila[GC.FAME - 1] = String(op.acumNue);
          op.fila[GC.ORIGEN - 1] = FAME_CRR52_ORIGEN;
        });
      });
      _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezado].concat(filas)));

      var problemas = [];
      var despues = _loadCSVFromDrive('Backup_Guerra.csv');
      var parsedDespues = despues ? _parseCSV(despues) : null;
      if (!parsedDespues || parsedDespues.length < 2) {
        problemas.push('No se pudo releer Backup_Guerra.csv');
      } else {
        var filasDespues = parsedDespues.slice(1);
        for (var b = 0; b < filasDespues.length; b++) { while (filasDespues[b].length < GUERRA_TOTAL_COLS) filasDespues[b].push(''); }
        problemas = _fameCrr52Verificar_(copiaAntes, filasDespues, plan);
      }
      verificacion = problemas.length
        ? 'VERIFICACION FALLO (' + problemas.length + '): ' + problemas.slice(0, 5).join('; ') + '. Restaurar con el respaldo "Backup_Guerra ANTES de reparar FameCurrentRiverRace52 ' + marca + '.csv".'
        : 'Verificacion OK (' + nFilas + ' fila(s) modificadas en ' + plan.casos.length + ' caso(s)).';

      var entradas = plan.omitidos.map(function (o) {
        return { temporada: '', semana: '', tag: o.etq, nombre: '', tipo: 'alarma', motivo: 'fame por dia con CurrentRiverRace: no se escribio', detalle: o.motivo };
      });
      if (entradas.length) {
        var rr = _registrarRevisionGuerra_(entradas);
        verificacion += ' Revision_Guerra.csv: ' + rr.nuevas + ' nuevas, ' + rr.actualizadas + ' actualizadas.';
      }
    }

    Logger.log('[FameCRR52] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + '. Casos del informe: ' + FAME_CRR52_CASOS.length + '. Se escribirian/escribieron: ' + plan.casos.length +
      ' caso(s) y ' + nFilas + ' fila(s). Ya aplicados: ' + plan.yaAplicados.length + '. Omitidos: ' + plan.omitidos.length +
      (plan.omitidos.length ? ' (' + plan.omitidos.slice(0, 5).map(function (o) { return o.etq + ': ' + o.motivo; }).join('; ') + ')' : '') + '. ' +
      (verificacion ? verificacion + ' ' : '') + (detalle.length > 1 ? 'Detalle en Drive: ' + nomDetalle + '.' : 'No hay nada que hacer.') +
      (aplicar ? '' : ' (No se escribio nada en el Backup ni en Guerra.)'));
  } finally {
    lock.releaseLock();
  }
}

function _fameCrr52Verificar_(filasAntes, filasDespues, plan) {
  var problemas = [];
  if (filasDespues.length !== filasAntes.length) problemas.push('numero de filas ' + filasDespues.length + ' en vez de ' + filasAntes.length);
  var tocadas = {};
  plan.casos.forEach(function (c) { c.ops.forEach(function (op) { if (op.acumAnt !== op.acumNue) tocadas[op.idxAntes] = true; }); });
  for (var i = 0; i < filasAntes.length && i < filasDespues.length; i++) {
    var a = filasAntes[i].slice(), d = filasDespues[i].slice(0, filasAntes[i].length);
    if (tocadas[i]) {
      a[GC.FAME - 1] = ''; d[GC.FAME - 1] = ''; a[GC.ORIGEN - 1] = ''; d[GC.ORIGEN - 1] = '';
    }
    if (a.join('\u0001') !== d.join('\u0001')) { problemas.push('cambio una fila no planeada o una columna que no era (linea ' + (i + 2) + ')'); if (problemas.length > 10) break; }
  }
  var grupos = _excDiasAgrupar(filasDespues);
  plan.casos.forEach(function (c) {
    var g = c.grupo, k = [g.temporada, g.semana, g.tag, g.clan].join('|'), gd = grupos[k];
    if (!gd) { problemas.push(c.etq + ': no se encuentra la serie'); return; }
    var pf = 0, pa = 0;
    for (var d2 = 0; d2 < 4; d2++) {
      var f = gd.dias[d2];
      if (!f) { problemas.push(c.etq + ': falta la fila del dia ' + EXC_DIAS_LETRAS.charAt(d2)); return; }
      var fm = _excDiasNum(f[GC.FAME - 1]), sem = _excDiasNum(f[GC.ATAQUES_SEM - 1]);
      if (fm - pf !== c.fr[d2]) problemas.push(c.etq + ': la fame del dia ' + EXC_DIAS_LETRAS.charAt(d2) + ' quedo en ' + (fm - pf) + ' y debia ser ' + c.fr[d2]);
      if (_fameTablaDia_(c.ata[d2], 0).indexOf(fm - pf) < 0) problemas.push(c.etq + ': dia ' + EXC_DIAS_LETRAS.charAt(d2) + ' fuera de la tabla de fame');
      if (sem - pa !== c.ata[d2] || _excDiasNum(f[GC.ATAQUES_HOY - 1]) !== c.ata[d2]) problemas.push(c.etq + ': cambiaron los ataques del dia ' + EXC_DIAS_LETRAS.charAt(d2));
      pf = fm; pa = sem;
    }
    if (pf !== c.totalFame) problemas.push(c.etq + ': el total de fame de la semana cambio (' + pf + ' contra ' + c.totalFame + ')');
  });
  return problemas;
}
