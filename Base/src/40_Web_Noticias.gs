// =============================================================================
// 40_Web_Noticias.gs
//"NOTICIAS DE LA SEMANA" DE admin.html
// =============================================================================
// Fase 9 (e), 05-oct-2026: endpoint de solo lectura _webAdminNoticiasSemana() con 5 noticias de una semana (barcos, ascensos, posiciones, guerra, movimientos); archivo autónomo; decisiones (a)-(d) confirmadas. [→ Contexto_Base_Web.md §40B001]
//
// =============================================================================
// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS
// =============================================================================
// AVISOS [1]-[10]: sin probar en Apps Script real; reglas de barcos, guerra, posiciones y movimientos. PENDIENTE DE VERIFICAR (3 puntos del aviso [8]); ideas opcionales en [10]. [→ Contexto_Base_Web.md §40B002]
// =============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Prueba manual desde el editor (solo log; no escribe nada)
//  Parte 2 — Funciones que no se corren a mano
//    - Punto de entrada web (GET) y ayudas comunes de las cinco noticias
//    - Las cinco noticias en el orden en que se arman: ataques a barcos, ascensos y descensos, posiciones finales, participación y fame de guerra, ingresos y salidas
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var NOTICIAS_TZ = 'America/Lima';
var NOTICIAS_MAX_ASCENSOS = 300; // tope de seguridad de filas devueltas
var NOTICIAS_SEMANAS_TENDENCIA = 6;       // semanas del gráfico de tendencia de Posiciones
var NOTICIAS_ATAQUES_MAX_SEMANA = 16;     // 4 días de guerra x 4 mazos: tope de ataques por jugador y semana
var NOTICIAS_TOP_FAME = 5;                // jugadores del ranking de fame
var NOTICIAS_MAX_NOMBRES_LISTA = 60;      // tope de nombres devueltos en listas (sin ataques, movimientos)

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// -----------------------------------------------------------------------------
// PRUEBA MANUAL (solo log; no escribe nada)
// -----------------------------------------------------------------------------

// Prueba manual desde el editor: cambiar LUNES_PRUEBA por el lunes de una semana ya jugada y revisar el log (sin sesión). [→ Contexto_Base_Web.md §40B012]
function _noticiasPruebaManual() {
  var LUNES_PRUEBA = '2026-09-28';
  var lista = [];
  var ctx = _getCtx();
  var tmp = [];
  _agregarSemanasTemporadaAlSelectorRecientes(tmp, ctx, ctx.temporada, true);
  _agregarSemanasTemporadaAlSelectorRecientes(tmp, ctx, Number(ctx.temporada) - 1, false);
  lista = tmp;
  var semana = null;
  for (var i = 0; i < lista.length; i++) if (lista[i].lunesIso === LUNES_PRUEBA) { semana = lista[i]; break; }
  if (!semana) { Logger.log('[Noticias/Prueba] ' + LUNES_PRUEBA + ' no está en las semanas disponibles: ' + JSON.stringify(lista)); return; }
  Logger.log('[Noticias/Prueba] Barcos: ' + JSON.stringify(_noticiasSeccion_(function () { return _noticiasBarcos_(semana); })));
  Logger.log('[Noticias/Prueba] Ascensos: ' + JSON.stringify(_noticiasSeccion_(function () { return _noticiasAscensos_(semana); })));
  Logger.log('[Noticias/Prueba] Posiciones: ' + JSON.stringify(_noticiasSeccion_(function () { return _noticiasPosiciones_(semana); })));
  Logger.log('[Noticias/Prueba] Guerra: ' + JSON.stringify(_noticiasSeccion_(function () { return _noticiasGuerra_(semana); })));
  Logger.log('[Noticias/Prueba] Movimientos: ' + JSON.stringify(_noticiasSeccion_(function () { return _noticiasMovimientos_(semana); })));
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// Punto de entrada web (GET, solo lectura) del resumen semanal; cada sección devuelve su propio {ok, ...}. [→ Contexto_Base_Web.md §40B003]
function _webAdminNoticiasSemana(token, lunesIso) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var lunes = String(lunesIso || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lunes)) return { ok: false, error: 'Falta elegir la semana.' };

  // La semana debe ser una de las que ya entrega el selector de Torneos/Sorteos
  // (así se obtienen Temporada/Semana reales y el domingo, sin recalcular nada).
  var lista = _webAdminSemanasRecientes(token, '1');
  if (!lista || !lista.ok) return { ok: false, error: (lista && lista.error) || 'No pude leer la lista de semanas.' };
  var semana = null;
  for (var i = 0; i < lista.semanas.length; i++) {
    if (lista.semanas[i].lunesIso === lunes) { semana = lista.semanas[i]; break; }
  }
  if (!semana) return { ok: false, error: 'Esa semana no está en la lista de semanas disponibles.' };

  return {
    ok: true,
    semana: semana,
    barcos: _noticiasSeccion_(function () { return _noticiasBarcos_(semana); }),
    ascensos: _noticiasSeccion_(function () { return _noticiasAscensos_(semana); }),
    posiciones: _noticiasSeccion_(function () { return _noticiasPosiciones_(semana); }),
    guerra: _noticiasSeccion_(function () { return _noticiasGuerra_(semana); }),
    movimientos: _noticiasSeccion_(function () { return _noticiasMovimientos_(semana); })
  };
}

/** Ejecuta una sección; un error en ella NO tumba a las demás. */
function _noticiasSeccion_(fn) {
  try {
    return fn();
  } catch (err) {
    Logger.log('[Noticias] Error en una sección: ' + err.toString());
    return { ok: false, error: 'No se pudo armar esta sección (' + err.message + ').' };
  }
}

/** 'yyyy-MM-dd' + n días -> 'yyyy-MM-dd' (aritmética UTC pura, sin husos). */
function _noticiasSumarDias_(iso, n) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  var t = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + n));
  var p = function (x) { return (x < 10 ? '0' : '') + x; };
  return t.getUTCFullYear() + '-' + p(t.getUTCMonth() + 1) + '-' + p(t.getUTCDate());
}

// -----------------------------------------------------------------------------
// 1) ATAQUES A BARCOS
// -----------------------------------------------------------------------------

// Mes evaluado de una temporada (temporada 1 = mayo 2026, +1 por mes; empieza el primer lunes del mes); null si no es un entero >= 1 (06-oct-2026). [→ Contexto_Base_Web.md §40B004]
function _noticiasMesDeTemporada_(temporada) {
  var t = Number(temporada);
  if (!isFinite(t) || t < 1 || Math.floor(t) !== t) return null;
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var idx = 4 + (t - 1); // mayo = índice 4 (temporada 1, año 2026)
  var mes = MESES[idx % 12], anio = 2026 + Math.floor(idx / 12);
  return { mes: mes, anio: anio, etiqueta: mes + ' ' + anio };
}

// Etiqueta de un sorteo: temporada evaluada, semanas y mes (ej. «Temporada 5 (septiembre 2026), semanas 1-4») (06-oct-2026). [→ Contexto_Base_Web.md §40B005]
function _noticiasEtiquetaSorteo_(celdaSemanas) {
  var arr = (typeof _parseSemanasSorteo === 'function') ? _parseSemanasSorteo(celdaSemanas) : [];
  if (!arr || !arr.length) return '';
  var porTemp = {};
  arr.forEach(function (a) {
    var t = Number(a.temporada), w = Number(a.semana);
    if (!isFinite(t) || !isFinite(w)) return;
    (porTemp[t] || (porTemp[t] = [])).push(w);
  });
  return Object.keys(porTemp).map(Number).sort(function (a, b) { return a - b; }).map(function (t) {
    var ws = porTemp[t].filter(function (w, i, a) { return a.indexOf(w) === i; }).sort(function (a, b) { return a - b; });
    var tramos = [], ini = ws[0], prev = ws[0];
    for (var i = 1; i <= ws.length; i++) {
      if (i < ws.length && ws[i] === prev + 1) { prev = ws[i]; continue; }
      tramos.push(ini === prev ? String(ini) : ini + '-' + prev);
      ini = prev = ws[i];
    }
    var m = _noticiasMesDeTemporada_(t);
    return 'Temporada ' + t + (m ? ' (' + m.etiqueta + ')' : '') + ', semana' + (ws.length > 1 ? 's ' : ' ') + tramos.join(', ');
  }).join(' + ');
}

// Topes de ataques a barcos por evento de la semana (torneo, sorteo, cambio de rango; suma de la semana; 0 es válido, vacío = sin tope) (05-oct-2026). [→ Contexto_Base_Web.md §40B006]
function _noticiasLimitesBarcos_(semana) {
  var res = [];
  var ss = _getSs();
  var temp = Number(semana.temporada), sem = Number(semana.semana);
  function incluyeSemana(celda) {
    var arr = _parseSemanasSorteo(celda);
    for (var i = 0; i < arr.length; i++) if (arr[i].temporada === temp && arr[i].semana === sem) return true;
    return false;
  }
  function leer(origen, hoja, csv, cols, hdr, C, nombreFn) {
    try {
      var lec = _obtenerFilasConFallbackCSV(ss, hoja, csv, cols, hdr);
      if (!lec || lec.origen === 'vacio') return;
      for (var i = 0; i < lec.filas.length; i++) {
        var f = lec.filas[i];
        if (!incluyeSemana(f[C.SEMANAS - 1])) continue;
        var c = f[C.BARCOS - 1];
        if (c === '' || c === null || c === undefined) continue; // sin tope configurado
        var q = Number(c);
        if (isNaN(q)) continue;
        res.push({ origen: origen, id: String(f[C.ID - 1] || '').trim(), nombre: nombreFn(f), qty: q });
      }
    } catch (e) {
      Logger.log('[Noticias] No pude leer los topes de barcos de ' + origen + ': ' + e.message);
    }
  }
  if (typeof TL !== 'undefined' && typeof _parseSemanasSorteo === 'function') {
    leer('Torneo', CFG.SHEETS.T_LISTA, 'Backup_T_Lista.csv', TL_TOTAL_COLS, 2, TL, function (f) { return String(f[TL.NOMBRE - 1] || '').trim(); });
    leer('Sorteo', CFG.SHEETS.S_LISTA, 'Backup_S_Lista.csv', SL_TOTAL_COLS, 2, SL, function (f) { return _noticiasEtiquetaSorteo_(f[SL.SEMANAS - 1]); });
    leer('Cambio de rango', CFG.SHEETS.CR_LISTA, 'Backup_CR_Lista.csv', CR_TOTAL_COLS, 3, CR, function (f) { return String(f[CR.TIPO - 1] || '').trim(); });
  }
  return res;
}

// Ataques a barcos por jugador y clan en la semana (jueves a domingo) desde Backup_Battlelogs.csv; solo cuentan filas boatBattle con LadoBarco de ataque. [→ Contexto_Base_Web.md §40B007]
function _noticiasBarcos_(semana) {
  if (typeof _blsLeerCsv_ !== 'function' || typeof BLS_HEADERS === 'undefined' || typeof BLS_CSV_NOMBRE === 'undefined' ||
      typeof _blgLimitesDiasGuerra_ !== 'function' || typeof _blgDiaDeBatalla_ !== 'function' ||
      typeof _blgParsearBattleTime_ !== 'function') {
    return { ok: false, error: 'Falta 06_Battlelogs_Siembra.gs o 18_CorreccionGuerra.gs en el proyecto.' };
  }

  var jueves = _noticiasSumarDias_(semana.lunesIso, 3);
  var limites = _blgLimitesDiasGuerra_(jueves, null);
  if (!limites) return { ok: false, error: 'No pude calcular los días de guerra de la semana (' + jueves + ').' };

  var lectura = _blsLeerCsv_(BLS_CSV_NOMBRE, BLS_HEADERS);
  if (!lectura.ok) return { ok: false, error: lectura.error || 'No pude leer Backup_Battlelogs.csv.' };

  var iTag = BLS_HEADERS.indexOf('Tag'), iNombre = BLS_HEADERS.indexOf('Nombre');
  var iTiempo = BLS_HEADERS.indexOf('battleTime'), iTipo = BLS_HEADERS.indexOf('Tipo');
  var iClanTag = BLS_HEADERS.indexOf('ClanTag'), iClanNombre = BLS_HEADERS.indexOf('ClanNombre');
  var iGanado = BLS_HEADERS.indexOf('BarcoGanado'), iLado = BLS_HEADERS.indexOf('LadoBarco');

  var defensas = 0, sinLado = 0, dudosas = 0, filasSemana = 0;
  var clanes = {}; // clave de clan -> { clan, jugadores:{tag->{...}} }

  for (var i = 0; i < lectura.rows.length; i++) {
    var f = lectura.rows[i];
    if (String(f[iTipo] || '').trim() !== 'boatBattle') continue;

    var ms = _blgParsearBattleTime_(f[iTiempo]);
    if (ms === null) continue;
    var dia = _blgDiaDeBatalla_(ms, limites);
    if (dia.estado === 'fuera' || dia.estado === 'invalido') continue;
    if (dia.estado === 'ambiguo' && dia.puedeSerFuera) { dudosas++; continue; }
    filasSemana++;

    var lado = String(f[iLado] === undefined || f[iLado] === null ? '' : f[iLado]).trim().toLowerCase();
    if (lado === 'defender') { defensas++; continue; }
    if (lado === '') { sinLado++; continue; }

    var tag = (typeof _blgNormalizarTag_ === 'function') ? _blgNormalizarTag_(f[iTag]) : String(f[iTag] || '').trim().toUpperCase();
    if (!tag) continue;
    var nombreClan = String(f[iClanNombre] || '').trim();
    var tagClan = String(f[iClanTag] || '').trim().toUpperCase();
    var claveClan = tagClan || nombreClan || 'sin-clan';

    var c = clanes[claveClan] || (clanes[claveClan] = { clan: nombreClan || tagClan || 'Sin clan', jugadores: {} });
    if (nombreClan) c.clan = nombreClan;
    var j = c.jugadores[tag] || (c.jugadores[tag] = { tag: tag, nombre: '', ataques: 0, ganados: 0, perdidos: 0, sinResultado: 0 });
    j.nombre = String(f[iNombre] || '').trim() || j.nombre;
    j.ataques++;
    var g = String(f[iGanado] === undefined || f[iGanado] === null ? '' : f[iGanado]).trim().toLowerCase();
    if (g === 'sí' || g === 'si') j.ganados++;
    else if (g === 'no') j.perdidos++;
    else j.sinResultado++;
  }

  // Topes de la semana: uno por evento (torneo, sorteo, cambio de rango) cuya columna Semanas incluye la semana.
  // Respaldo: si ningún evento la incluye, el tope del torneo VIGENTE (Extra!Torneo_Vigente_ID; si no hay, el más
  // reciente de T_Lista). `limite` (compatibilidad) = el tope más estricto entre los usados, o null si no hay ninguno.
  var limites = _noticiasLimitesBarcos_(semana);
  var origenLimite = limites.length ? 'semana' : 'ninguno';
  if (!limites.length) {
    try {
      var bloque = _getConfigMasRecienteCategoria('Torneo');
      if (bloque && bloque.length && bloque[0].barcos && bloque[0].barcos.activo) {
        var q = Number(bloque[0].barcos.qty);
        if (!isNaN(q)) { limites = [{ origen: 'Torneo vigente', id: String(bloque[0].idFila || '').trim(), nombre: '', qty: q }]; origenLimite = 'vigente'; }
      }
    } catch (eLim) {
      Logger.log('[Noticias] No pude leer el tope de barcos: ' + eLim.message);
    }
  }
  var limite = null;
  limites.forEach(function (l) { if (limite === null || l.qty < limite) limite = l.qty; });

  var orden = [];
  try { orden = (_getNombresClanesTernaOrdenados() || []).map(function (n) { return String(n).trim().toLowerCase(); }); } catch (eOrd) { orden = []; }

  var salida = Object.keys(clanes).map(function (k) {
    var c = clanes[k];
    var jugadores = Object.keys(c.jugadores).map(function (t) {
      var j = c.jugadores[t];
      // Se pasó si supera el tope de CUALQUIER evento de la semana; excedeEn dice de cuáles.
      j.excedeEn = limites.filter(function (l) { return j.ataques > l.qty; }).map(function (l) { return l.origen + (l.nombre ? ' ' + l.nombre : '') + (l.id ? ' (' + l.id + ')' : '') + ': ' + l.qty; });
      j.excede = j.excedeEn.length > 0;
      return j;
    }).sort(function (a, b) { return b.ataques - a.ataques || a.nombre.localeCompare(b.nombre); });
    var total = 0; jugadores.forEach(function (j) { total += j.ataques; });
    return { clan: c.clan, totalAtaques: total, jugadores: jugadores };
  }).sort(function (a, b) {
    var ia = orden.indexOf(a.clan.toLowerCase()), ib = orden.indexOf(b.clan.toLowerCase());
    if (ia < 0) ia = 999; if (ib < 0) ib = 999;
    return ia - ib || a.clan.localeCompare(b.clan);
  });

  return { ok: true, clanes: salida, limite: limite, limites: limites, origenLimite: origenLimite, defensas: defensas, sinLado: sinLado, dudosas: dudosas, filasSemana: filasSemana };
}

// -----------------------------------------------------------------------------
// 2) ASCENSOS Y DESCENSOS DE LA SEMANA
// -----------------------------------------------------------------------------

// Cambios de rango de la semana desde Historial_A/D (fecha en hora de Lima); omite los 'Planificado'. [→ Contexto_Base_Web.md §40B008]
function _noticiasAscensos_(semana) {
  var ss = _getSs();
  var lectura = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.ASCENSOS, 'Backup_Historial_A-D.csv', ASCENSOS_TOTAL_COLS);
  if (lectura.origen === 'vacio') return { ok: true, cambios: [] };

  var filas = lectura.filas;
  var cambios = [];
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (String(f[ASC.ESTADO_PROPUESTA - 1] || '').trim() === 'Planificado') continue;

    var fecha = f[ASC.FECHA - 1];
    if (!(fecha instanceof Date)) fecha = _parseSpanishDate(fecha); // el CSV guarda texto
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) continue;
    var iso = Utilities.formatDate(fecha, NOTICIAS_TZ, 'yyyy-MM-dd');
    if (iso < semana.lunesIso || iso > semana.domingoIso) continue;

    var tipo = String(f[ASC.TIPO - 1] || '');
    cambios.push({
      tag: String(f[ASC.TAG - 1] || '').trim(),
      nombre: String(f[ASC.NOMBRE - 1] || ''),
      clan: String(f[ASC.CLAN - 1] || ''),
      tipo: tipo,
      esAscensoClan: tipo === 'Ascenso de clan',
      rangoAnterior: String(f[ASC.RANGO - 1] || ''),
      rangoNuevo: String(f[ASC.RANGO_2 - 1] || ''),
      fechaTxt: Utilities.formatDate(fecha, NOTICIAS_TZ, 'dd/MM/yyyy'),
      autor: String(f[ASC.AUTOR - 1] || ''),
      _orden: fecha.getTime()
    });
  }

  cambios.sort(function (a, b) { return a._orden - b._orden; });
  var truncado = cambios.length > NOTICIAS_MAX_ASCENSOS;
  cambios = cambios.slice(0, NOTICIAS_MAX_ASCENSOS).map(function (c) { delete c._orden; return c; });
  return { ok: true, cambios: cambios, truncado: truncado };
}

// -----------------------------------------------------------------------------
// 3) POSICIONES FINALES POR CLAN
// -----------------------------------------------------------------------------

// Posición final, trofeos y avance de cada clan Terna en la semana, y variación contra la semana anterior (reusa _webGuerraLog()). [→ Contexto_Base_Web.md §40B009]
function _noticiasPosiciones_(semana) {
  var log = _webGuerraLog(); // sin tag: todos los clanes Terna
  var clanes = [];
  (log.clanes || []).forEach(function (c) {
    var lista = c.semanas || []; // descendente: la anterior está en idx + 1
    var idx = -1;
    for (var i = 0; i < lista.length; i++) {
      if (Number(lista[i].temporada) === Number(semana.temporada) && Number(lista[i].semana) === Number(semana.semana)) { idx = i; break; }
    }
    if (idx < 0) { clanes.push({ clan: c.clan || c.tag, tag: c.tag, sinDatos: true }); return; }

    var s = lista[idx], ant = lista[idx + 1] || null;
    var puesto = Number(s.rank) || 0;
    var puestoAnt = ant ? (Number(ant.rank) || 0) : 0;
    // Tendencia para el gráfico: hasta 6 semanas terminando en la elegida, de la más
    // vieja a la más nueva (la lista viene descendente, por eso se invierte).
    var tendencia = lista.slice(idx, idx + NOTICIAS_SEMANAS_TENDENCIA).reverse().map(function (x) {
      return { temporada: Number(x.temporada), semana: Number(x.semana), puesto: Number(x.rank) || 0, trofeos: Number(x.trophy) || 0 };
    });
    clanes.push({
      tendencia: tendencia,
      clan: c.clan || c.tag,
      tag: c.tag,
      sinDatos: false,
      puesto: puesto,                       // 0 = sin dato
      puestoEstimado: !!s.rankEstimado,
      trofeos: Number(s.trophy) || 0,
      variacionTrofeos: Number(s.trophyDelta) || 0,
      barco: Number(s.boat) || 0,
      coliseo: !!s.coliseo,
      puestoAnterior: puestoAnt,
      variacionPuesto: (puesto > 0 && puestoAnt > 0) ? (puestoAnt - puesto) : null
    });
  });
  return { ok: true, clanes: clanes };
}

// -----------------------------------------------------------------------------
// 4) PARTICIPACIÓN Y FAME DE GUERRA (noticia nueva)
// -----------------------------------------------------------------------------

/** Número desde una celda de la hoja o del respaldo CSV ("31,200" -> 31200). 0 si no es número. */
function _noticiasNum_(v) {
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  var t = String(v === undefined || v === null ? '' : v).replace(/ /g, ' ').trim();
  if (!t) return 0;
  if (/^-?\d{1,3}([.,' ]\d{3})+$/.test(t)) t = t.replace(/[.,' ]/g, '');
  var n = Number(t);
  return isNaN(n) ? 0 : n;
}

// Por clan Terna: fame total, ataques usados vs posibles, jugadores sin ataque y completos; solo días exigidos (CAMBIO 05-oct-2026); fuente hoja Guerra o Backup_Guerra.csv. [→ Contexto_Base_Web.md §40B010]
function _noticiasGuerra_(semana) {
  var ss = _getSs();
  var lectura = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.GUERRA, 'Backup_Guerra.csv', GUERRA_TOTAL_COLS);
  if (lectura.origen === 'vacio') return { ok: true, clanes: [], topFame: [], faltaDato: true };

  var baseP = (Number(semana.semana) - 1) * 7 + 3;
  var nombresTerna = [];
  try { nombresTerna = (_getNombresClanesTernaOrdenados() || []).map(function (n) { return String(n).trim().toLowerCase(); }); } catch (eN) { nombresTerna = []; }

  var LETRAS = ['j', 'v', 's', 'd'];
  var jug = {};      // 'clan|tag' -> { tag, nombre, clan, ataques:[4], fame:[4 o null], presente:[4 bool] }
  var clanDias = {}; // clan -> filas vistas por día (0 = el clan no tiene datos ese día)
  for (var i = 0; i < lectura.filas.length; i++) {
    var f = lectura.filas[i];
    if (String(f[GC.TEMPORADA - 1] || '') !== String(semana.temporada)) continue;
    if (Number(f[GC.SEMANA - 1]) !== Number(semana.semana)) continue;
    var off = (Number(f[GC.PERIOD_IDX - 1]) || 0) - baseP;
    if (off < 0 || off > 3) continue; // solo jueves a domingo: el entrenamiento no cuenta

    var clan = String(f[GC.CLAN - 1] || '').trim();
    if (!clan) continue;
    if (nombresTerna.length && nombresTerna.indexOf(clan.toLowerCase()) < 0) continue;
    var tag = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    if (!tag) continue;

    var cdias = clanDias[clan] || (clanDias[clan] = [0, 0, 0, 0]);
    cdias[off]++;
    var k = clan + '|' + tag;
    var j = jug[k] || (jug[k] = { tag: tag, nombre: '', clan: clan, ataques: [0, 0, 0, 0], fame: [null, null, null, null], presente: [false, false, false, false] });
    j.presente[off] = true; // hay fila ese día: el jugador estaba en el clan (sin fila = no estaba, celda vacía)
    j.nombre = String(f[GC.NOMBRE - 1] || '').trim() || j.nombre;
    j.ataques[off] = Math.max(j.ataques[off], _noticiasNum_(f[GC.ATAQUES_HOY - 1]));
    var fm = _noticiasNum_(f[GC.FAME - 1]);
    j.fame[off] = Math.max(j.fame[off] === null ? 0 : j.fame[off], fm);
  }

  // Días OPCIONALES por clan (meta ya cruzada al empezar el día): atacar no se exige. Misma regla que el
  // Control y el perfil (_clanYaCruzoMetaEnPeriodo(), 22_ControlCalendario.gs), pero aquí se evalúan viernes, sábado y domingo
  // (criterio unificado 07-oct-2026; Supercell no confirma desde qué día se puede cruzar la meta): el jueves no puede ser opcional; coliseo tampoco.
  var opcPorClan = {};
  function opcionales(clan) {
    if (opcPorClan[clan]) return opcPorClan[clan];
    var r = [false, false, false, false];
    // Criterio unificado (07-oct-2026): índices 1..3 (viernes, sábado, domingo). Que solo se haya visto cruzar el domingo no es
    // una regla confirmada por Supercell. «Ganar al terminar el sábado» y «meta ya cruzada» son lo mismo.
    for (var d = 1; d < 4; d++) {
      if (!clanDias[clan] || !clanDias[clan][d]) continue;
      try {
        if (typeof _clanYaCruzoMetaEnPeriodo === 'function' &&
            _clanYaCruzoMetaEnPeriodo(clan, baseP + d, String(semana.temporada), false)) r[d] = true;
      } catch (eO) { Logger.log('[Noticias] meta cruzada (' + clan + ', día ' + d + '): ' + eO.message); }
    }
    return (opcPorClan[clan] = r);
  }

  var clanes = {};
  var todos = [];
  Object.keys(jug).forEach(function (k) {
    var j = jug[k];
    var opc = opcionales(j.clan);
    // Fame acumulada: null hasta el primer día con fila; después, si un día no tiene fila, se arrastra la anterior.
    var acum = [], ult = null;
    for (var d = 0; d < 4; d++) { if (j.fame[d] !== null) ult = Math.max(ult === null ? 0 : ult, j.fame[d]); acum.push(ult); }
    // Ataques solo de los días en que estuvo (tope 4 por día). Los días opcionales no se exigen: se separan.
    var exigidos = 0, usadosExig = 0, usadosOpc = 0, usadosTotal = 0;
    for (var d3 = 0; d3 < 4; d3++) {
      if (!j.presente[d3]) continue;
      var a = Math.min(j.ataques[d3], 4);
      usadosTotal += a;
      if (opc[d3]) usadosOpc += a; else { exigidos += 4; usadosExig += a; }
    }
    j.ataquesTotal = Math.min(usadosTotal, NOTICIAS_ATAQUES_MAX_SEMANA);
    j.fameTotal = acum[3] === null ? 0 : acum[3];
    j.fameDias = acum;
    var c = clanes[j.clan] || (clanes[j.clan] = {
      clan: j.clan, jugadores: 0, ataques: 0, ataquesPosibles: 0, ataquesEnOpcionales: 0, fame: 0,
      fameSuma: [0, 0, 0, 0], sinAtaques: [], completos: 0
    });
    c.jugadores++;
    c.ataques += usadosExig;           // solo ataques de días exigidos (coherente con ataquesPosibles)
    c.ataquesPosibles += exigidos;     // 4 por cada día en que estuvo y no era opcional
    c.ataquesEnOpcionales += usadosOpc;
    c.fame += j.fameTotal;
    for (var d2 = 0; d2 < 4; d2++) c.fameSuma[d2] += (acum[d2] === null ? 0 : acum[d2]);
    if (exigidos > 0 && usadosExig === 0) c.sinAtaques.push({ tag: j.tag, nombre: j.nombre || j.tag });
    if (exigidos > 0 && usadosExig >= exigidos) c.completos++;
    todos.push(j);
  });

  var salida = Object.keys(clanes).map(function (nombre) {
    var c = clanes[nombre];
    // Día sin ninguna fila del clan -> null (no 0): la pantalla lo deja en blanco.
    c.fameDias = c.fameSuma.map(function (v, d) { return (clanDias[nombre] && clanDias[nombre][d]) ? v : null; });
    delete c.fameSuma;
    var opc = opcionales(nombre);
    c.diasOpcionales = LETRAS.filter(function (l, d) { return opc[d]; });
    c.diasConDato = LETRAS.filter(function (l, d) { return clanDias[nombre] && clanDias[nombre][d] > 0; });
    c.participacion = c.ataquesPosibles ? Math.round(c.ataques * 1000 / c.ataquesPosibles) / 10 : 0; // %, 1 decimal
    c.sinAtaquesTotal = c.sinAtaques.length;
    c.sinAtaques = c.sinAtaques.slice(0, NOTICIAS_MAX_NOMBRES_LISTA);
    return c;
  });
  var orden = nombresTerna;
  salida.sort(function (a, b) {
    var ia = orden.indexOf(a.clan.toLowerCase()), ib = orden.indexOf(b.clan.toLowerCase());
    if (ia < 0) ia = 999; if (ib < 0) ib = 999;
    return ia - ib || a.clan.localeCompare(b.clan);
  });

  todos.sort(function (a, b) { return b.fameTotal - a.fameTotal; });
  var topFame = todos.slice(0, NOTICIAS_TOP_FAME).filter(function (j) { return j.fameTotal > 0; }).map(function (j) {
    return { tag: j.tag, nombre: j.nombre || j.tag, clan: j.clan, fame: j.fameTotal, ataques: j.ataquesTotal };
  });

  return { ok: true, clanes: salida, topFame: topFame, ataquesMaxJugador: NOTICIAS_ATAQUES_MAX_SEMANA };
}

// -----------------------------------------------------------------------------
// 5) INGRESOS Y SALIDAS (noticia nueva)
// -----------------------------------------------------------------------------

// Ingresos, reingresos, salidas y expulsiones de la semana desde Historial_I/S, contados por clan y con lista. [→ Contexto_Base_Web.md §40B011]
function _noticiasMovimientos_(semana) {
  var ss = _getSs();
  var lectura = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.HISTORIAL, 'Backup_Historial_I-S.csv', 7);
  if (lectura.origen === 'vacio') return { ok: true, clanes: [], lista: [] };

  var clanes = {}, lista = [];
  for (var i = 0; i < lectura.filas.length; i++) {
    var f = lectura.filas[i];
    var fecha = f[1];
    if (!(fecha instanceof Date)) fecha = _parseSpanishDate(fecha); // el CSV guarda texto
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) continue;
    var iso = Utilities.formatDate(fecha, NOTICIAS_TZ, 'yyyy-MM-dd');
    if (iso < semana.lunesIso || iso > semana.domingoIso) continue;

    var mov = String(f[4] || '').trim();
    if (['Ingreso', 'Reingreso', 'Salida', 'Expulsión'].indexOf(mov) < 0) continue;
    var clan = String(f[5] || '').trim() || 'Sin clan';
    var c = clanes[clan] || (clanes[clan] = { clan: clan, ingresos: 0, reingresos: 0, salidas: 0, expulsiones: 0 });
    if (mov === 'Ingreso') c.ingresos++;
    else if (mov === 'Reingreso') c.reingresos++;
    else if (mov === 'Salida') c.salidas++;
    else c.expulsiones++;
    lista.push({
      tag: String(f[2] || '').trim(), nombre: String(f[3] || ''), movimiento: mov, clan: clan,
      fechaTxt: Utilities.formatDate(fecha, NOTICIAS_TZ, 'dd/MM/yyyy'), _orden: fecha.getTime()
    });
  }

  var orden = [];
  try { orden = (_getNombresClanesTernaOrdenados() || []).map(function (n) { return String(n).trim().toLowerCase(); }); } catch (eO) { orden = []; }
  var salida = Object.keys(clanes).map(function (k) {
    var c = clanes[k];
    c.neto = (c.ingresos + c.reingresos) - (c.salidas + c.expulsiones);
    return c;
  }).sort(function (a, b) {
    var ia = orden.indexOf(a.clan.toLowerCase()), ib = orden.indexOf(b.clan.toLowerCase());
    if (ia < 0) ia = 999; if (ib < 0) ib = 999;
    return ia - ib || a.clan.localeCompare(b.clan);
  });

  lista.sort(function (a, b) { return a._orden - b._orden; });
  var total = lista.length;
  lista = lista.slice(0, NOTICIAS_MAX_NOMBRES_LISTA).map(function (m) { delete m._orden; return m; });
  return { ok: true, clanes: salida, lista: lista, total: total };
}