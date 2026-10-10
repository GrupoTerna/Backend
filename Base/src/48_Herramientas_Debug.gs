// ==============================================================================
// 48_Herramientas_Debug.gs
// Herramientas de depuración de un solo uso (usar con precaución). demolerTodoElSpreadsheet() vive en 00_Main.gs; diagnosticoPlayersTag() vino de 04_Formato_Comun.gs. [→ Contexto_Base_Web.md §48B001]
// ==============================================================================

// ----- Funciones manuales / punto de entrada -----

// =============================================================================
// debugAtaquesTag(): diagnóstico TEMPORAL de solo lectura para un tag (qué hay en Guerra y qué arma _procesarFilasGuerraParaControl()). [→ Contexto_Base_Web.md §48B002]
// =============================================================================
function debugAtaquesTag() {
  var TAG_A_REVISAR = '#Q98RGPGCU'; // <-- cambiar por el tag que se quiera inspeccionar

  var ctx = _getCtx();
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[Debug] Hoja Guerra vacía o no encontrada.'); return; }

  var data = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();

  // 1) Filas CRUDAS en Guerra para este tag, temporada actual — para
  //    descartar que falten filas o haya duplicados/valores raros.
  var filasTag = data.filter(function(r) {
    return String(r[GC.TAG - 1] || '').trim() === TAG_A_REVISAR &&
           String(r[GC.TEMPORADA - 1] || '') === String(ctx.temporada);
  });
  Logger.log('[Debug] Filas crudas en Guerra para ' + TAG_A_REVISAR +
    ' (temporada ' + ctx.temporada + '): ' + filasTag.length);
  filasTag.forEach(function(r) {
    Logger.log('  · Semana ' + r[GC.SEMANA - 1] + ' | Día ' + r[GC.DIA - 1] +
      ' | PeriodIndex ' + r[GC.PERIOD_IDX - 1] + ' | Etapa ' + r[GC.ETAPA - 1] +
      ' | AtaquesHoy ' + r[GC.ATAQUES_HOY - 1] + ' | AtaquesSemana ' + r[GC.ATAQUES_SEM - 1]);
  });

  // 2) Qué arma _procesarFilasGuerraParaControl() con esos datos — el mapa
  //    que después pinta la cuadrícula de Control (dia_0..dia_3 por semana).
  var mapa = _procesarFilasGuerraParaControl(data, ctx);
  Logger.log('[Debug] Mapa agregado para ' + TAG_A_REVISAR + ': ' +
    JSON.stringify(mapa[TAG_A_REVISAR] || 'NO EXISTE EN EL MAPA (esto sería el bug: la fila no llegó a agruparse)'));

  // 3) ¿El tag aparece más de una vez en Directorio? Una fila duplicada
  //    podría hacer que se pinte dos veces la misma fila en Control, una
  //    de ellas sin datos, pisando visualmente a la correcta.
  var dirData = _leerDirectorioFisicoComoDC(ss);
  var filasDir = dirData.filter(function(r) { return String(r[DC.TAG - 1] || '').trim() === TAG_A_REVISAR; });
  Logger.log('[Debug] Filas en Directorio para ' + TAG_A_REVISAR + ': ' + filasDir.length);
  filasDir.forEach(function(r) {
    Logger.log('  · Estado ' + r[DC.ESTADO - 1] + ' | ClanTag ' + r[DC.CLAN_TAG - 1]);
  });

  Logger.log('[Debug] ctx actual → temporada:' + ctx.temporada + ' sectionIndex:' + ctx.sectionIndex +
    ' periodIndex:' + ctx.periodIndex + ' periodIndexSospechoso:' + ctx.periodIndexSospechoso);
}
function fixGuerraYControl() {
  _fetchAllClanData();
  updateGuerraSheet();
  updateGuerraLogsSheet();
  updateControlSheet();
}
function testRespaldoRoyaleAPI() {
  var tag = '2GG8PJ8GC'; // sin '#', ej: '2Y08GLPY' — usa un Tag real que sepas que existe
  var url = 'https://royaleapi.com/player/' + tag + '/';
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

  Logger.log('Código de respuesta: ' + resp.getResponseCode());
  Logger.log('Primeros 500 caracteres del HTML: ' + resp.getContentText().substring(0, 500));

  // Mismo regex que usa _webAdminVerificarTag() en 37_Web_API.gs
  var mNombre = resp.getContentText().match(/<title>\s*([^<|]+?)\s*[\|<]/);
  Logger.log('Nombre extraído por el regex: ' + (mNombre ? mNombre[1].trim() : 'NO MATCHEÓ'));
}
function testTorneoJsonDesdeAppsScript() {
  var url = 'https://royaleapi.com/tournament/82RCJCVR/members/json';
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  Logger.log('Código: ' + resp.getResponseCode());
  Logger.log('Primeros 300: ' + resp.getContentText().substring(0, 300));
}
function _diagCompararTemporadaCSVvsCtx() {
  var ctx = _getCtx();
  Logger.log('[Diag] ctx.temporada ACTUAL: ' + ctx.temporada);

  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) { Logger.log('[Diag] No se encontró Backup_Guerra.csv.'); return; }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) { Logger.log('[Diag] CSV vacío.'); return; }

  var conteoPorTemporada = {};
  for (var i = 1; i < parsed.length; i++) {
    var temp = String(parsed[i][GC.TEMPORADA - 1] || '(vacío)');
    conteoPorTemporada[temp] = (conteoPorTemporada[temp] || 0) + 1;
  }

  Logger.log('[Diag] Filas por valor de Temporada en el CSV:');
  Object.keys(conteoPorTemporada).sort().forEach(function(t) {
    var marca = (t === String(ctx.temporada)) ? '  <-- coincide con ctx.temporada' : '';
    Logger.log('  Temporada=' + t + ': ' + conteoPorTemporada[t] + ' fila(s)' + marca);
  });
}
function DIAGNOSTICO_totalHoy() {
  var d = _getDatosDashboard();
  Logger.log('ctx: ' + JSON.stringify(d.ctx));
  Logger.log('guerraPorClan: ' + JSON.stringify(d.guerraPorClan, null, 2));
}
function DIAGNOSTICO_duplicadosHoy() {
  var ss = _getSs();
  var ctx = _getCtx();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();

  var porTag = {}; // tag -> array de {semana, clan, fecha}
  for (var i = 0; i < data.length; i++) {
    var pIdx = Number(data[i][GC.PERIOD_IDX - 1]) || 0;
    if (pIdx !== ctx.periodIndex) continue;
    if (String(data[i][GC.TEMPORADA - 1] || '') !== String(ctx.temporada)) continue;
    var tag = String(data[i][GC.TAG - 1] || '');
    if (!porTag[tag]) porTag[tag] = [];
    porTag[tag].push({
      clan: data[i][GC.CLAN - 1],
      semana: data[i][GC.SEMANA - 1],
      fecha: data[i][GC.FECHA - 1]
    });
  }

  var tags = Object.keys(porTag);
  Logger.log('Tags distintos hoy (periodIndex=' + ctx.periodIndex + '): ' + tags.length);

  var duplicados = tags.filter(function(t){ return porTag[t].length > 1; });
  Logger.log('Tags con MÁS DE 1 fila hoy: ' + duplicados.length);
  if (duplicados.length) {
    Logger.log('Ejemplo (' + duplicados[0] + '): ' + JSON.stringify(porTag[duplicados[0]]));
  }
}
function _testDiagnosticoCofresBattlelog() {
  var tag = '#2GG8PJ8GC'; // poné acá un tag real, con el # incluido
  Logger.log('--- COFRES ---');
  Logger.log(JSON.stringify(_webCofresJugador(tag)));
  Logger.log('--- BATTLELOG ---');
  Logger.log(JSON.stringify(_webBattlelogJugador(tag)));
}

// =============================================================================
// diagnosticoPlayersTag() — movida desde 04_Formato_Comun.gs, sin cambios de logica.
// =============================================================================
// diagnosticoPlayersTag(tags): Fase 12 (18/07/2026), consulta /players directo sin cache para diagnosticar Clan/Clan_Tag desactualizados; no modifica hojas. [→ Contexto_Base_Web.md §48B003]
function diagnosticoPlayersTag(tags) {
  tags = tags || ['#JURQQRGV9', '#VPQCQRCYJ'];
  Logger.log('[Diag] Consultando /players DIRECTO (sin cache) para ' + tags.length + ' tag(s)...');

  for (var i = 0; i < tags.length; i++) {
    var tag = String(tags[i] || '').trim();
    if (!tag) continue;

    var url  = '/players/' + encodeTag(tag);
    var opts = {
      method: 'get',
      muteHttpExceptions: true,
      headers: { 'Accept': 'application/json' }
    };

    try {
      var resp = UrlFetchApp.fetch(CFG.API_BASE + url, opts);
      var code = resp.getResponseCode();
      var text = resp.getContentText();

      Logger.log('[Diag] ' + tag + ' -> HTTP ' + code);

      if (code === 200) {
        try {
          var data = JSON.parse(text);
          Logger.log('[Diag] ' + tag + ' -> name=' + (data.name || '(sin nombre)') +
                     ' | clan=' + (data.clan ? (data.clan.name + ' (' + data.clan.tag + ')') : '(SIN CLAN en la respuesta)') +
                     ' | role=' + (data.role || '(sin role)'));
        } catch (parseErr) {
          Logger.log('[Diag] ' + tag + ' -> HTTP 200 pero no se pudo parsear JSON: ' + parseErr +
                     ' | body: ' + text.substring(0, 300));
        }
      } else {
        Logger.log('[Diag] ' + tag + ' -> FALLO. Body: ' + text.substring(0, 300));
      }
    } catch (e) {
      Logger.log('[Diag] ' + tag + ' -> EXCEPCIÓN: ' + e);
    }

    Utilities.sleep(300);
  }

  Logger.log('[Diag] Fin del diagnóstico. Revisá el detalle arriba para cada tag.');
}
/**
 * 53_Test_Tamanio_Perfiles.gs  (NUEVO 08-oct-2026)
 *
 * Diagnóstico (solo Logger.log; no escribe nada, no publica nada, no cambia resultados) para decidir si
 * conviene publicar los perfiles como archivo estático en la rama `data` (un perfiles.json con todos, o
 * un archivo por jugador). Mide lo que recibe un VISITANTE: _webPerfilJugador(tag, { esAdmin: false }),
 * que es lo que devuelve doGet en 'webPerfil' sin sesión de admin.
 *
 * Toma una muestra repartida a intervalos regulares entre los miembros Activos del Directorio (no los
 * primeros: así entran clanes y rangos distintos) y calcula:
 *   - peso por perfil (bytes reales UTF-8 y estimación gzip), mínimo / mediana / promedio / máximo;
 *   - cuánto aporta cada clave (jugador, jugador.extendido, extendido.rawClash) al promedio;
 *   - tiempo por perfil y proyección para TODOS los activos (peso total y tiempo de cálculo del bot,
 *     comparado con el límite de 6 min de Apps Script).
 *
 * Uso: ejecutar testTamanioPerfiles() desde el editor y leer el registro de ejecución. Opcional:
 * testTamanioPerfiles(25) para una muestra mayor (máximo 40). Se detiene sola a los 4 min.
 * Nota: la primera lectura puede ser más lenta (Drive/Sheets en frío); mira el promedio y el máximo.
 */
function testTamanioPerfiles(n) {
  var tInicio = Date.now();
  var LIMITE_MS = 4 * 60 * 1000;
  var tam = Math.max(3, Math.min(40, Number(n) || 12));

  var filas = _webLeerDirectorioComoDC().filas;
  var tags = [];
  for (var i = 0; i < filas.length; i++) {
    if (String(filas[i][DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    var t = String(filas[i][DC.TAG - 1] || '').trim();
    if (t) tags.push(t);
  }
  var totalActivos = tags.length;
  if (!totalActivos) { Logger.log('[TamañoPerfil] no hay miembros Activos en el Directorio; nada que medir'); return; }

  var paso = Math.max(1, Math.floor(totalActivos / tam));
  var muestra = [];
  for (var j = 0; j < totalActivos && muestra.length < tam; j += paso) muestra.push(tags[j]);
  Logger.log('[TamañoPerfil] ' + totalActivos + ' miembros Activos; muestra de ' + muestra.length + ' (1 de cada ' + paso + ')');

  var medidas = [];                       // {tag, bytes, gz, ms}
  var porClave = { jugador: {}, extendido: {}, rawClash: {} }; // clave -> suma de bytes
  var errores = 0;
  for (var k = 0; k < muestra.length; k++) {
    if (Date.now() - tInicio > LIMITE_MS) { Logger.log('[TamañoPerfil] se detiene a los 4 min con ' + medidas.length + ' perfiles medidos'); break; }
    var t0 = Date.now();
    var resp;
    try { resp = _webPerfilJugador(muestra[k], { esAdmin: false }); }
    catch (e) { errores++; Logger.log('[TamañoPerfil] ' + muestra[k] + ' lanzó error: ' + e); continue; }
    var ms = Date.now() - t0;
    if (!resp || resp.ok === false || !resp.jugador) { errores++; Logger.log('[TamañoPerfil] ' + muestra[k] + ' sin perfil: ' + (resp && resp.error)); continue; }

    var json = JSON.stringify(resp);
    var bytes = Utilities.newBlob(json).getBytes().length;
    var gz = 0;
    try { gz = Utilities.gzip(Utilities.newBlob(json, 'application/json')).getBytes().length; } catch (eGz) { /* sin estimación gzip */ }
    medidas.push({ tag: muestra[k], bytes: bytes, gz: gz, ms: ms });

    var jug = resp.jugador;
    _tpSumarClaves_(porClave.jugador, jug);
    if (jug.extendido && typeof jug.extendido === 'object') {
      _tpSumarClaves_(porClave.extendido, jug.extendido);
      if (jug.extendido.rawClash && typeof jug.extendido.rawClash === 'object') _tpSumarClaves_(porClave.rawClash, jug.extendido.rawClash);
    }
  }
  if (!medidas.length) { Logger.log('[TamañoPerfil] no se pudo medir ningún perfil (errores: ' + errores + ')'); return; }

  var kb = function (b) { return (b / 1024).toFixed(1) + ' KB'; };
  var bytesOrd = medidas.map(function (m) { return m.bytes; }).sort(function (a, b) { return a - b; });
  var suma = function (arr) { return arr.reduce(function (s, v) { return s + v; }, 0); };
  var prom = suma(bytesOrd) / medidas.length;
  var mediana = bytesOrd[Math.floor(bytesOrd.length / 2)];
  var promGz = suma(medidas.map(function (m) { return m.gz; })) / medidas.length;
  var promMs = suma(medidas.map(function (m) { return m.ms; })) / medidas.length;
  var maxMs = Math.max.apply(null, medidas.map(function (m) { return m.ms; }));

  Logger.log('[TamañoPerfil] ===== ' + medidas.length + ' perfiles medidos (errores: ' + errores + ') =====');
  Logger.log('[TamañoPerfil] peso por perfil: mín ' + kb(bytesOrd[0]) + ' | mediana ' + kb(mediana) + ' | promedio ' + kb(prom) + ' | máx ' + kb(bytesOrd[bytesOrd.length - 1]));
  Logger.log('[TamañoPerfil] promedio gzip (estimado): ' + kb(promGz) + ' (' + Math.round(100 * promGz / prom) + '% del original)');
  Logger.log('[TamañoPerfil] tiempo de cálculo por perfil: promedio ' + Math.round(promMs) + ' ms | máx ' + maxMs + ' ms');

  [['jugador', 'jugador.*'], ['extendido', 'jugador.extendido.*'], ['rawClash', 'jugador.extendido.rawClash.*']].forEach(function (par) {
    var obj = porClave[par[0]];
    var lista = Object.keys(obj).map(function (c) { return { c: c, n: obj[c] / medidas.length }; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 8);
    if (!lista.length) return;
    Logger.log('[TamañoPerfil] -- claves más pesadas en ' + par[1] + ' (promedio por perfil) --');
    lista.forEach(function (x) { Logger.log('[TamañoPerfil]   ' + x.c + ': ' + kb(x.n) + ' (' + Math.round(100 * x.n / prom) + '%)'); });
  });

  var totalBytes = prom * totalActivos;
  var totalGz = promGz * totalActivos;
  var totalSeg = promMs * totalActivos / 1000;
  Logger.log('[TamañoPerfil] ===== PROYECCIÓN a los ' + totalActivos + ' activos =====');
  Logger.log('[TamañoPerfil] un solo perfiles.json: ~' + (totalBytes / 1048576).toFixed(1) + ' MB (~' + (totalGz / 1048576).toFixed(1) + ' MB con gzip) que bajaría CADA visitante para ver UN perfil');
  Logger.log('[TamañoPerfil] un archivo por jugador: ~' + kb(prom) + ' (~' + kb(promGz) + ' gzip) por visita, ' + totalActivos + ' archivos');
  Logger.log('[TamañoPerfil] cálculo de todos los perfiles en el bot: ~' + Math.round(totalSeg) + ' s' + (totalSeg > 240 ? ' (¡pasa de 4 min: riesgo con el límite de 6 min de Apps Script!)' : ' (el límite de Apps Script es 6 min)'));
  Logger.log('[TamañoPerfil] referencia: guerra.json pesa ~900 KB (ver testTamanioGuerraEnVivo)');
  Logger.log('[TamañoPerfil] duración de esta prueba: ' + Math.round((Date.now() - tInicio) / 1000) + ' s');
}

// _tpSumarClaves_(acum, obj): suma al acumulador el peso en bytes (JSON) de cada clave de primer nivel de obj.
function _tpSumarClaves_(acum, obj) {
  Object.keys(obj).forEach(function (c) {
    var v = obj[c];
    if (v === undefined) return;
    var n = Utilities.newBlob(JSON.stringify(v)).getBytes().length;
    acum[c] = (acum[c] || 0) + n;
  });
}
/**
 * 54_Test_Tiempo_Estaticos.gs  (NUEVO 08-oct-2026)
 *
 * Diagnóstico (solo Logger.log; no publica ni escribe nada) para saber DÓNDE se van los 70-90 s que tarda
 * _publicarRosterEstatico_() y los ~25 s de _publicarHomeEstatico_() dentro de la corrida del bot.
 * Mide cada pieza por separado, sin pasar por GitHub:
 *   - lectura del Directorio (_webLeerDirectorioComoDC)
 *   - _resolverArenaDesdeCatalogo() por llamada (el roster la llama una vez por miembro)
 *   - _getClanTagByName() por llamada (el orden de clanes la llama varias veces)
 *   - _webRosterCalcular() completo
 *   - cada sección de home.json (versión sin caché cuando existe)
 * Ejecutar testTiempoEstaticos() desde el editor y mandar el registro.
 */
function testTiempoEstaticos() {
  var L = function (t) { Logger.log('[TiempoEstatico] ' + t); };
  var t0 = Date.now();

  var lectura = _webLeerDirectorioComoDC();
  L('lectura Directorio: ' + (Date.now() - t0) + ' ms | ' + lectura.filas.length + ' filas | origen: ' + lectura.origen);

  // Arena: una llamada por miembro Activo en el roster real.
  var activos = lectura.filas.filter(function (f) { return String(f[DC.ESTADO - 1] || '').trim() === 'Activo'; });
  L('miembros Activos: ' + activos.length);
  var nArena = Math.min(30, activos.length);
  var tA = Date.now();
  for (var i = 0; i < nArena; i++) _resolverArenaDesdeCatalogo(activos[i][DC.ARENA - 1]);
  var msArena = Date.now() - tA;
  L('_resolverArenaDesdeCatalogo: ' + nArena + ' llamadas en ' + msArena + ' ms (' + Math.round(msArena / Math.max(1, nArena)) + ' ms/llamada) -> proyectado a ' + activos.length + ' miembros: ~' + Math.round(msArena / Math.max(1, nArena) * activos.length / 1000) + ' s');

  var nombres = {};
  activos.forEach(function (f) { nombres[String(f[DC.CLAN - 1] || 'Sin clan')] = true; });
  var tC = Date.now();
  var nC = 0;
  Object.keys(nombres).forEach(function (n) { for (var r = 0; r < 5; r++) { _getClanTagByName(n); nC++; } });
  L('_getClanTagByName: ' + nC + ' llamadas en ' + (Date.now() - tC) + ' ms');

  var tR = Date.now();
  var roster = _webRosterCalcular();
  L('_webRosterCalcular() completo: ' + (Date.now() - tR) + ' ms (' + roster.clanes.length + ' clanes)');

  [
    ['clanInfo (_webClanInfoCalcular)', _webClanInfoCalcular],
    ['aniversarios (_webAniversariosCalcular)', _webAniversariosCalcular],
    ['rankings (_webRankings)', _webRankings],
    ['estadisticasCartas (_webEstadisticasCartas)', _webEstadisticasCartas]
  ].forEach(function (par) {
    var t = Date.now();
    try { par[1](); L(par[0] + ': ' + (Date.now() - t) + ' ms'); }
    catch (e) { L(par[0] + ' lanzó error: ' + e); }
  });
  L('prueba completa en ' + Math.round((Date.now() - t0) / 1000) + ' s');
}
/**
 * 55_Test_Perfil_Fases.gs  (NUEVO 08-oct-2026)
 *
 * Diagnóstico (solo Logger.log; no escribe ni publica nada) para saber EN QUÉ se van los ~20 s que
 * tarda _webPerfilJugador() por perfil. testTamanioPerfiles() mostró ~22 s por perfil y el JSON del
 * jugador (Drive/Players) explica solo una parte; el resto parece ser lecturas repetidas de CSV de Drive
 * (cada apertura de archivo en Drive cuesta ~0,5-0,8 s aunque el archivo sea pequeño: Backup_Arena.csv
 * tiene 41 filas y tardaba ~750 ms por lectura).
 *
 * Cómo mide: envuelve temporalmente (solo durante esta ejecución) las funciones de la lista FUNCIONES
 * con un cronómetro, ejecuta _webPerfilJugador(tag, { esAdmin: false }) DOS veces seguidas y restaura
 * todo al terminar. La pasada 1 es lo que vive un visitante (ejecución en frío); la pasada 2 muestra lo
 * que ya queda en memoria dentro de la misma ejecución. Los tiempos son INCLUSIVOS (una función que
 * llama a otra incluye su tiempo), así que no se pueden sumar entre filas.
 * Para _loadCSVFromDrive además se detalla el tiempo por archivo.
 *
 * Uso: testTiempoPerfil() (usa el primer miembro Activo) o testTiempoPerfil('#TAG').
 *      construirIndicePlayers() arma ahora el índice tag -> archivo de Players (ver 09_API_ClashRoyale.gs)
 *      sin esperar a que lo haga el bot; ejecútala ANTES de testTiempoPerfil() para medir con el índice.
 */
function construirIndicePlayers() {
  var t0 = Date.now();
  var idx = _getPlayersDriveIndexPorTag(DriveApp.getFolderById(DRIVE_FOLDER_ID_PLAYERS));
  var n = Object.keys(idx).length;
  var enCache = !!CacheService.getScriptCache().get(PLAYERS_IDX_CACHE_KEY);
  Logger.log('[IndicePlayers] ' + n + ' tags indexados en ' + (Date.now() - t0) + ' ms | guardado en caché: ' + (enCache ? 'sí' : 'NO (revisar)'));
}

function testTiempoPerfil(tag) {
  var L = function (t) { Logger.log('[PerfilFases] ' + t); };
  var G = (function () { return this; })();

  if (!tag) {
    var filas = _webLeerDirectorioComoDC().filas;
    for (var i = 0; i < filas.length; i++) {
      if (String(filas[i][DC.ESTADO - 1] || '').trim() === 'Activo' && filas[i][DC.TAG - 1]) { tag = String(filas[i][DC.TAG - 1]).trim(); break; }
    }
  }
  if (!tag) { L('no hay tag para medir'); return; }
  L('perfil de ' + tag + ' | índice de Players en caché: ' + (CacheService.getScriptCache().get(PLAYERS_IDX_CACHE_KEY) ? 'sí' : 'no'));

  var FUNCIONES = [
    '_loadCSVFromDrive', '_parseCSV', '_getSs', '_getCtx',
    '_webLeerDirectorioComoDC', '_webBuscarFilaDirectorioPorTagConOrigen',
    '_webPerfilExtendido', '_webDatosDriveJugador',
    '_cargarPlayerDesideDrive', '_cargarPlayerDesideDriveScan_', '_cargarPlayerDesideDriveRapido_',
    '_obtenerFilasConFallbackCSV', '_leerArenaCSV', '_leerInsigniasCSV',
    '_webPerfilWebCsv', '_webCartasCsvPrimero', '_webBadgesCsvPrimero', '_webLogrosCsvPrimero',
    '_webConCards2Csv', '_webProgresoEventosCsv', '_webCaminoLeyendasCsv', '_webCatalogoCartasPorId',
    '_webMazoActualDesdeCards2', '_webProgresoRequisitos', '_getAtaquesYExentosSemanaActualPorTag'
  ];
  var stats = {}, porArchivo = {}, originales = {};

  FUNCIONES.forEach(function (nombre) {
    if (typeof G[nombre] !== 'function') return;
    var orig = G[nombre];
    originales[nombre] = orig;
    G[nombre] = function () {
      var t = Date.now();
      try { return orig.apply(this, arguments); }
      finally {
        var ms = Date.now() - t;
        var s = stats[nombre] || (stats[nombre] = { n: 0, ms: 0, max: 0 });
        s.n++; s.ms += ms; if (ms > s.max) s.max = ms;
        if (nombre === '_loadCSVFromDrive') {
          var k = String(arguments[0]);
          var a = porArchivo[k] || (porArchivo[k] = { n: 0, ms: 0 });
          a.n++; a.ms += ms;
        }
      }
    };
  });
  L('funciones instrumentadas: ' + Object.keys(originales).length + ' de ' + FUNCIONES.length + (Object.keys(originales).length ? '' : ' (¡no se pudo instrumentar!)'));

  try {
    for (var pasada = 1; pasada <= 2; pasada++) {
      Object.keys(stats).forEach(function (k) { delete stats[k]; });
      Object.keys(porArchivo).forEach(function (k) { delete porArchivo[k]; });
      var t0 = Date.now();
      var resp = _webPerfilJugador(tag, { esAdmin: false });
      var total = Date.now() - t0;
      L('===== pasada ' + pasada + (pasada === 1 ? ' (en frío, lo que vive un visitante)' : ' (misma ejecución, con lo que quedó en memoria)') + ': ' + total + ' ms | ok: ' + !!(resp && resp.ok !== false) + ' =====');
      Object.keys(stats).map(function (k) { return { k: k, s: stats[k] }; })
        .sort(function (a, b) { return b.s.ms - a.s.ms; }).slice(0, 14)
        .forEach(function (x) { L('  ' + x.k + ': ' + x.s.n + ' llamada(s), ' + x.s.ms + ' ms (máx ' + x.s.max + ' ms)'); });
      var arch = Object.keys(porArchivo).map(function (k) { return { k: k, a: porArchivo[k] }; }).sort(function (a, b) { return b.a.ms - a.a.ms; });
      if (arch.length) {
        var sumaCsv = arch.reduce(function (s, x) { return s + x.a.ms; }, 0);
        L('  -- _loadCSVFromDrive por archivo (' + arch.length + ' archivos, ' + sumaCsv + ' ms en total) --');
        arch.slice(0, 12).forEach(function (x) { L('     ' + x.k + ': ' + x.a.n + 'x, ' + x.a.ms + ' ms'); });
      }
    }
  } finally {
    Object.keys(originales).forEach(function (nombre) { G[nombre] = originales[nombre]; });
  }
}