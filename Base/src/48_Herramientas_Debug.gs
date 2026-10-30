// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 30-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Diagnóstico de guerra y Control
//    - Pruebas de RoyaleAPI
//    - Diagnóstico de jugadores y perfiles
//    - Informes de guerra desde Drive (cruce con el historial, totales semanales y anomalías)
//  Parte 2 — Funciones que no se corren a mano
//    - Ayuda de testTamanioPerfiles
//    - Ayudas del cruce con el historial
//    - Totales semanales desde el historial (versión anterior, sin uso, y ayudas)
//    - Ayudas del informe de anomalías de ataques
// Dentro de cada tema, en el orden en que se espera ejecutarlas (diagnosticar antes de corregir; informar antes de aplicar). Al reordenar no se cambió el código de ninguna función.

// ==============================================================================
// 48_Herramientas_Debug.gs
// Herramientas de depuración de un solo uso (usar con precaución). demolerTodoElSpreadsheet() vive en 00_Main.gs; diagnosticoPlayersTag() vino de 04_Formato_Comun.gs. [→ Contexto_Base_Web.md §48B001]
// ==============================================================================

// ----- Constantes y variables globales -----

var CRUCE_CFG = {
  CARPETA_BACKUP_ID: '1emYkDZMEzYgO5lwmtY-NMhFc5JJd2I3R',
  CARPETA_HISTORIAL_ID: '1T8PhxVVRZ-p7o2A_U6ARP-LsC3Zg7ObL',
  CARPETA_INFORMES_ID: '17Mv2oQFTMIdSKlGyHNnrBiApYoHfHg4X',
  ARCHIVO_BACKUP: 'Backup_Guerra.csv',
  ARCHIVO_HISTORIAL: 'HistorialGuerra_Grupal.csv',
  PREFIJO_INFORME: 'Completar_DomingoDesdeJsonRoyaleApi'
};

var TOT_CFG = {
  CARPETA_BACKUP_ID: '1emYkDZMEzYgO5lwmtY-NMhFc5JJd2I3R',
  CARPETA_HISTORIAL_ID: '1T8PhxVVRZ-p7o2A_U6ARP-LsC3Zg7ObL',
  CARPETA_INFORMES_ID: '17Mv2oQFTMIdSKlGyHNnrBiApYoHfHg4X',
  ARCHIVO_BACKUP: 'Backup_Guerra.csv',
  ARCHIVO_HISTORIAL: 'HistorialGuerra_Grupal.csv',
  PREFIJO_INFORME: 'Completar_DomingoDesdeJsonRoyaleApi',
  MAX_CAMBIOS: 60
};

var ANO_CFG = {
  CARPETA_BACKUP_ID: '1emYkDZMEzYgO5lwmtY-NMhFc5JJd2I3R',
  CARPETA_HISTORIAL_ID: '1T8PhxVVRZ-p7o2A_U6ARP-LsC3Zg7ObL',
  CARPETA_INFORMES_ID: '17Mv2oQFTMIdSKlGyHNnrBiApYoHfHg4X',
  ARCHIVO_BACKUP: 'Backup_Guerra.csv',
  ARCHIVO_HISTORIAL: 'HistorialGuerra_Grupal.csv',
  TOPE_SEMANA: 16,
  TOPE_DIA: 4
};

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Diagnóstico de guerra y Control -----

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

// ----- Pruebas de RoyaleAPI -----

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

// ----- Diagnóstico de jugadores y perfiles -----

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

  Logger.log('[Diag] Fin del diagnóstico. Revisa el detalle arriba para cada tag.');
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

// ----- Informes de guerra desde Drive (cruce con el historial, totales semanales y anomalías) -----

/**
 * cruzarSinResolverConHistorialInforme()
 *
 * SOLO INFORMA. No escribe en la hoja Guerra ni toca Backup_Guerra.csv.
 *
 * Toma las series "SIN RESOLVER" (json_mas_no_resuelve) del ultimo informe
 * Completar_DomingoDesdeJsonRoyaleApi ... (informe).csv, y compara el total
 * semanal de cada una entre tres fuentes:
 *   - Backup_Guerra.csv      (ultima fila de la semana)
 *   - JSON RoyaleAPI         (columnas "JSON ataques/fame/barcos" del informe)
 *   - HistorialGuerra_Grupal (Ataques/Fame/Barcos de la semana)
 *
 * Deja un CSV en la carpeta Informes con la clasificacion de cada serie.
 */

function cruzarSinResolverConHistorialInforme() {
  var t0 = new Date();

  // 1) Series SIN RESOLVER del ultimo informe de completar domingo.
  var inf = cruce_leerUltimoInforme_();
  var hi = cruce_indices_(inf.filas[0]);
  var objetivos = [];
  var claves = {};
  for (var i = 1; i < inf.filas.length; i++) {
    var f = inf.filas[i];
    if (cruce_celda_(f, hi, 'Fuente') !== 'Backup_Guerra.csv') continue;
    if (cruce_celda_(f, hi, 'Tipo') !== 'SIN RESOLVER') continue;
    var o = {
      temporada: cruce_num_(cruce_celda_(f, hi, 'Temporada')),
      semana: cruce_num_(cruce_celda_(f, hi, 'Semana')),
      tag: cruce_tag_(cruce_celda_(f, hi, 'Tag')),
      nombre: cruce_celda_(f, hi, 'Nombre'),
      clan: cruce_clan_(cruce_celda_(f, hi, 'Clan')),
      jsonAtaques: cruce_num_(cruce_celda_(f, hi, 'JSON ataques')),
      jsonFame: cruce_num_(cruce_celda_(f, hi, 'JSON fame')),
      jsonBarcos: cruce_num_(cruce_celda_(f, hi, 'JSON barcos'))
    };
    o.clave = cruce_clave_(o.tag, o.temporada, o.semana, o.clan);
    objetivos.push(o);
    claves[o.clave] = true;
  }

  // 2) Total semanal en Backup_Guerra.csv (fila con mayor PeriodIndex de la semana).
  var bk = cruce_leerCsv_(CRUCE_CFG.CARPETA_BACKUP_ID, CRUCE_CFG.ARCHIVO_BACKUP);
  var hb = cruce_indices_(bk[0]);
  var backup = {};
  for (var b = 1; b < bk.length; b++) {
    var r = bk[b];
    var kb = cruce_clave_(
      cruce_tag_(cruce_celda_(r, hb, 'Tag')),
      cruce_num_(cruce_celda_(r, hb, 'Temporada')),
      cruce_num_(cruce_celda_(r, hb, 'Semana')),
      cruce_clan_(cruce_celda_(r, hb, 'Clan')));
    if (!claves[kb]) continue;
    var pi = cruce_num_(cruce_celda_(r, hb, 'PeriodIndex'));
    var previo = backup[kb];
    if (!previo || pi >= previo.pi) {
      backup[kb] = {
        pi: pi,
        ataques: cruce_num_(cruce_celda_(r, hb, 'AtaquesSemana')),
        fame: cruce_num_(cruce_celda_(r, hb, 'Fame')),
        barcos: cruce_num_(cruce_celda_(r, hb, 'Barcos'))
      };
    }
  }

  // 3) Totales semanales en HistorialGuerra_Grupal.csv.
  var hs = cruce_leerCsv_(CRUCE_CFG.CARPETA_HISTORIAL_ID, CRUCE_CFG.ARCHIVO_HISTORIAL);
  var hh = cruce_indices_(hs[0]);
  var historial = {};
  var temporadasHist = {};
  for (var h = 1; h < hs.length; h++) {
    var q = hs[h];
    var temp = cruce_num_(cruce_celda_(q, hh, 'TemporadaInterna'));
    temporadasHist[temp] = true;
    var kh = cruce_clave_(
      cruce_tag_(cruce_celda_(q, hh, 'Tag')),
      temp,
      cruce_num_(cruce_celda_(q, hh, 'Semana')),
      cruce_clan_(cruce_celda_(q, hh, 'Clan')));
    if (!claves[kh]) continue;
    var cerrada = String(cruce_celda_(q, hh, 'Cerrada')).toLowerCase() === 'true';
    var reg = {
      ataques: cruce_num_(cruce_celda_(q, hh, 'Ataques')),
      fame: cruce_num_(cruce_celda_(q, hh, 'Fame')),
      barcos: cruce_num_(cruce_celda_(q, hh, 'Barcos')),
      cerrada: cerrada,
      fuente: cruce_celda_(q, hh, 'Fuente')
    };
    // Si hay varias filas para la misma clave, prefiere la cerrada.
    var ex = historial[kh];
    if (!ex || (reg.cerrada && !ex.cerrada)) historial[kh] = reg;
  }

  // 4) Clasificar.
  var salida = [[
    'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan',
    'JSON ataques', 'JSON fame', 'JSON barcos',
    'Backup ataques', 'Backup fame', 'Backup barcos',
    'Historial ataques', 'Historial fame', 'Historial barcos',
    'Historial cerrada', 'Historial fuente',
    'Clasificacion'
  ]];
  var conteo = {};
  for (var k = 0; k < objetivos.length; k++) {
    var ob = objetivos[k];
    var bb = backup[ob.clave];
    var hr = historial[ob.clave];
    var clase;
    if (!bb) {
      clase = 'SIN_FILA_BACKUP';
    } else if (!hr) {
      clase = 'SIN_FILA_HISTORIAL';
    } else {
      var hiEqBk = hr.ataques === bb.ataques && hr.fame === bb.fame;
      var hiEqJs = hr.ataques === ob.jsonAtaques && hr.fame === ob.jsonFame;
      if (hiEqBk) clase = 'HISTORIAL_IGUAL_BACKUP';
      else if (hiEqJs) clase = 'HISTORIAL_IGUAL_JSON';
      else clase = 'HISTORIAL_DISTINTO_DE_AMBOS';
      if (!hr.cerrada) clase += ' (semana abierta en historial)';
    }
    conteo[clase] = (conteo[clase] || 0) + 1;
    salida.push([
      ob.temporada, ob.semana, ob.tag, ob.nombre, ob.clan,
      ob.jsonAtaques, ob.jsonFame, ob.jsonBarcos,
      bb ? bb.ataques : '', bb ? bb.fame : '', bb ? bb.barcos : '',
      hr ? hr.ataques : '', hr ? hr.fame : '', hr ? hr.barcos : '',
      hr ? hr.cerrada : '', hr ? hr.fuente : '',
      clase
    ]);
  }

  // 5) Guardar informe en Informes.
  var zona = Session.getScriptTimeZone();
  var nombre = 'Cruce_SinResolver_Historial ' +
    Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd HH.mm.ss') + ' (informe).csv';
  var csv = _informeConIdSemana_(salida).map(function (fila) {
    return fila.map(cruce_csvCelda_).join(',');
  }).join('\r\n');
  _createFileConConteo_(DriveApp.getFolderById(CRUCE_CFG.CARPETA_INFORMES_ID), nombre, csv, MimeType.CSV);

  var resumen = Object.keys(conteo).sort().map(function (c) {
    return c + ' ' + conteo[c];
  }).join(' | ');
  var seg = Math.round((new Date() - t0) / 1000);
  Logger.log('[CruceSinResolver] SOLO INFORMAR (' + seg + ' s). Informe base: ' + inf.nombre +
    '. Series SIN RESOLVER: ' + objetivos.length + '. ' + resumen +
    '. TemporadaInterna en historial: ' + Object.keys(temporadasHist).sort().join(',') +
    '. Detalle en Drive: ' + nombre + '. (No se escribio nada en Guerra.)');
}

/**
 * aplicarTotalesSemanaDesdeHistorialInforme()  -> SOLO INFORMA (no escribe nada).
 * aplicarTotalesSemanaDesdeHistorialAplicar()  -> escribe en Backup_Guerra.csv (con copia previa).
 *
 * Que hace:
 *  Toma las series "SIN RESOLVER" (Backup_Guerra.csv) del ultimo informe
 *  Completar_DomingoDesdeJsonRoyaleApi ... (informe).csv y, para cada una,
 *  corrige los TOTALES SEMANALES (AtaquesSemana, Fame, Barcos) de la ULTIMA fila
 *  de esa semana (la de mayor PeriodIndex) cuando se cumplen TODAS estas condiciones:
 *    1. Existe la fila en el Backup y en HistorialGuerra_Grupal.csv.
 *    2. La semana esta cerrada en el Historial.
 *    3. El Historial coincide exactamente con el JSON (ataques, fame y barcos).
 *    4. El Backup no coincide y es MENOR O IGUAL en los tres totales (nunca se baja nada).
 *    5. La semana no esta vacia en el Backup (ataques y fame distintos de 0 a la vez
 *       no son ambos 0): si el Backup tiene 0/0 se deja para revision manual.
 *
 *  NO toca AtaquesHoy ni ninguna otra fila de la semana. No reparte ataques por dia.
 *  NO toca la hoja Guerra.
 *
 * Seguridad:
 *  - Antes de escribir comprueba que re-serializar el CSV reproduce EXACTAMENTE el texto
 *    original; si no, aborta sin escribir.
 *  - Guarda una copia "Backup_Guerra ANTES de aplicar TotalesSemanaDesdeHistorial ..." en Informes.
 *  - Aborta si hay mas de MAX_CAMBIOS cambios (se esperan ~27).
 *  - Verifica leyendo de nuevo el archivo despues de escribir.
 */

// §PF139 (21-oct-2026): estas dos entradas ahora llaman a _totSemanaPorDias_() (57_ReconstruirSemanaPorDias.gs), que reconstruye los cuatro dias de cada
// semana con los registros, el total cerrado de RoyaleAPI y CurrentRiverRace, y corrige o crea las filas. tot_ejecutar_() (la version que solo ponia el
// total en la ultima fila) queda sin uso.
function aplicarTotalesSemanaDesdeHistorialInforme() { _totSemanaPorDias_(false); }
function aplicarTotalesSemanaDesdeHistorialAplicar() { _totSemanaPorDias_(true); }

/**
 * informeAnomaliasAtaquesSemana()  -> SOLO INFORMA (no escribe en Guerra ni en Backup_Guerra.csv).
 *
 * Busca en Backup_Guerra.csv las series (jugador + temporada + semana + clan) con mas de
 * 16 ataques semanales (4 dias x 4 ataques), que son anomalias heredadas de correcciones
 * erroneas de las primeras versiones. Detecta dos casos:
 *   - SEMANA_MAYOR_16:       alguna fila de la serie tiene AtaquesSemana > 16.
 *   - SUMA_CLANES_MAYOR_16:  el jugador estuvo en varios clanes esa semana y la suma de los
 *                            totales finales de sus series supera 16.
 *
 * Para cada serie anomala compara con:
 *   - la suma de AtaquesHoy de sus filas (reconstruccion desde los dias), y
 *   - el total semanal de HistorialGuerra_Grupal.csv (si existe y la semana esta cerrada),
 * y propone una accion SIN aplicarla.
 *
 * Deja dos CSV en la carpeta Informes:
 *   Anomalias_AtaquesSemana <fecha> (resumen).csv   una fila por serie anomala
 *   Anomalias_AtaquesSemana <fecha> (detalle).csv   todas las filas de esas series
 */

function informeAnomaliasAtaquesSemana() {
  var t0 = new Date();
  var zona = Session.getScriptTimeZone();
  var sello = Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd HH.mm.ss');

  // 1) Agrupar el Backup por serie.
  var bk = ano_leerCsv_(ANO_CFG.CARPETA_BACKUP_ID, ANO_CFG.ARCHIVO_BACKUP);
  var hb = ano_indices_(bk[0]);
  var series = {};
  var orden = [];
  for (var b = 1; b < bk.length; b++) {
    var r = bk[b];
    if (r.length < 2) continue;
    var tag = ano_tag_(ano_celda_(r, hb, 'Tag'));
    var temp = ano_num_(ano_celda_(r, hb, 'Temporada'));
    var sem = ano_num_(ano_celda_(r, hb, 'Semana'));
    var clan = ano_clan_(ano_celda_(r, hb, 'Clan'));
    var k = ano_clave_(tag, temp, sem, clan);
    var s = series[k];
    if (!s) {
      s = { clave: k, tag: tag, temp: temp, sem: sem, clan: clan, nombre: '', filas: [] };
      series[k] = s;
      orden.push(k);
    }
    s.nombre = ano_celda_(r, hb, 'Nombre');
    s.filas.push({
      idx: b,
      fecha: ano_celdaOpc_(r, hb, 'Fecha'),
      dia: ano_celdaOpc_(r, hb, 'Día'),
      pi: ano_num_(ano_celda_(r, hb, 'PeriodIndex')),
      hoy: ano_num_(ano_celda_(r, hb, 'AtaquesHoy')),
      sem: ano_num_(ano_celda_(r, hb, 'AtaquesSemana')),
      fame: ano_num_(ano_celda_(r, hb, 'Fame')),
      barcos: ano_num_(ano_celda_(r, hb, 'Barcos')),
      origen: ano_celdaOpc_(r, hb, 'Origen')
    });
  }

  // 2) Resumen por serie y suma de clanes por jugador-semana.
  var jugadorSemana = {};
  for (var i = 0; i < orden.length; i++) {
    var se = series[orden[i]];
    var ult = se.filas[0];
    var maxSem = 0, sumaHoy = 0, maxHoy = 0, conOrigen = 0;
    for (var j = 0; j < se.filas.length; j++) {
      var fl = se.filas[j];
      if (fl.pi >= ult.pi) ult = fl;
      if (fl.sem > maxSem) maxSem = fl.sem;
      sumaHoy += fl.hoy;
      if (fl.hoy > maxHoy) maxHoy = fl.hoy;
      if (fl.origen) conOrigen++;
    }
    se.ult = ult; se.maxSem = maxSem; se.sumaHoy = sumaHoy; se.maxHoy = maxHoy; se.conOrigen = conOrigen;
    var kj = se.tag + '|' + se.temp + '|' + se.sem;
    if (!jugadorSemana[kj]) jugadorSemana[kj] = { suma: 0, series: [] };
    jugadorSemana[kj].suma += ult.sem;
    jugadorSemana[kj].series.push(se.clave);
  }

  var anomalas = [];
  var claves = {};
  for (var a = 0; a < orden.length; a++) {
    var sa = series[orden[a]];
    var tipos = [];
    if (sa.maxSem > ANO_CFG.TOPE_SEMANA) tipos.push('SEMANA_MAYOR_16');
    var js = jugadorSemana[sa.tag + '|' + sa.temp + '|' + sa.sem];
    if (js.series.length > 1 && js.suma > ANO_CFG.TOPE_SEMANA) tipos.push('SUMA_CLANES_MAYOR_16');
    if (tipos.length) {
      sa.tipo = tipos.join('+');
      sa.sumaClanes = js.suma;
      anomalas.push(sa);
      claves[sa.clave] = true;
    }
  }

  // 3) Historial de referencia solo para las series anomalas.
  var historial = {};
  var hs = ano_leerCsv_(ANO_CFG.CARPETA_HISTORIAL_ID, ANO_CFG.ARCHIVO_HISTORIAL);
  var hh = ano_indices_(hs[0]);
  for (var h = 1; h < hs.length; h++) {
    var q = hs[h];
    if (q.length < 3) continue;
    var kh = ano_clave_(
      ano_tag_(ano_celda_(q, hh, 'Tag')),
      ano_num_(ano_celda_(q, hh, 'TemporadaInterna')),
      ano_num_(ano_celda_(q, hh, 'Semana')),
      ano_clan_(ano_celda_(q, hh, 'Clan')));
    if (!claves[kh]) continue;
    var reg = {
      ataques: ano_num_(ano_celda_(q, hh, 'Ataques')),
      fame: ano_num_(ano_celda_(q, hh, 'Fame')),
      barcos: ano_num_(ano_celda_(q, hh, 'Barcos')),
      cerrada: String(ano_celda_(q, hh, 'Cerrada')).toLowerCase() === 'true',
      fuente: ano_celdaOpc_(q, hh, 'Fuente')
    };
    var ex = historial[kh];
    if (!ex || (reg.cerrada && !ex.cerrada)) historial[kh] = reg;
  }

  // 4) Proponer (sin aplicar) y armar salidas.
  var resumen = [[
    'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Tipo de anomalia',
    'Filas', 'Max AtaquesSemana', 'AtaquesSemana final', 'Suma de clanes (final)',
    'Suma AtaquesHoy', 'Max AtaquesHoy', 'Filas con Origen',
    'Fame final', 'Barcos final',
    'Historial ataques', 'Historial fame', 'Historial barcos', 'Historial cerrada', 'Historial fuente',
    'Propuesta', 'Valor propuesto AtaquesSemana final'
  ]];
  var detalle = [[
    'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Linea en Backup', 'Fecha', 'Dia', 'PeriodIndex',
    'AtaquesHoy', 'AtaquesSemana', 'Fame', 'Barcos', 'Origen', 'Tipo de anomalia'
  ]];
  var porPropuesta = {};
  var porTipo = {};
  var porTemporada = {};
  var filasConOrigen = 0;

  anomalas.sort(function (x, y) {
    return (x.temp - y.temp) || (x.sem - y.sem) || (x.tag < y.tag ? -1 : x.tag > y.tag ? 1 : 0);
  });

  for (var n = 0; n < anomalas.length; n++) {
    var an = anomalas[n];
    var hr = historial[an.clave];
    var hoyOk = an.sumaHoy <= ANO_CFG.TOPE_SEMANA && an.maxHoy <= ANO_CFG.TOPE_DIA;
    var histOk = !!hr && hr.cerrada && hr.ataques <= ANO_CFG.TOPE_SEMANA;
    var propuesta, valor;
    if (histOk && hoyOk && hr.ataques === an.sumaHoy) {
      propuesta = 'CONFIABLE (Historial = suma de AtaquesHoy)'; valor = hr.ataques;
    } else if (histOk && hoyOk) {
      propuesta = 'USAR_HISTORIAL (suma de AtaquesHoy distinta)'; valor = hr.ataques;
    } else if (histOk) {
      propuesta = 'USAR_HISTORIAL (AtaquesHoy no confiable)'; valor = hr.ataques;
    } else if (hoyOk) {
      propuesta = 'USAR_SUMA_HOY (sin respaldo del Historial)'; valor = an.sumaHoy;
    } else {
      propuesta = 'MANUAL'; valor = '';
    }
    porPropuesta[propuesta] = (porPropuesta[propuesta] || 0) + 1;
    porTipo[an.tipo] = (porTipo[an.tipo] || 0) + 1;
    var kt = 'T' + an.temp + 'S' + an.sem;
    porTemporada[kt] = (porTemporada[kt] || 0) + 1;
    filasConOrigen += an.conOrigen;

    resumen.push([
      an.temp, an.sem, an.tag, an.nombre, an.clan, an.tipo,
      an.filas.length, an.maxSem, an.ult.sem, an.sumaClanes,
      an.sumaHoy, an.maxHoy, an.conOrigen,
      an.ult.fame, an.ult.barcos,
      hr ? hr.ataques : '', hr ? hr.fame : '', hr ? hr.barcos : '', hr ? hr.cerrada : '', hr ? hr.fuente : '',
      propuesta, valor
    ]);

    var ordenadas = an.filas.slice().sort(function (x, y) { return (x.pi - y.pi) || (x.idx - y.idx); });
    for (var d = 0; d < ordenadas.length; d++) {
      var f = ordenadas[d];
      detalle.push([
        an.temp, an.sem, an.tag, an.nombre, an.clan, f.idx + 1, f.fecha, f.dia, f.pi,
        f.hoy, f.sem, f.fame, f.barcos, f.origen, an.tipo
      ]);
    }
  }

  // 5) Guardar.
  var carpeta = DriveApp.getFolderById(ANO_CFG.CARPETA_INFORMES_ID);
  var nombreRes = 'Anomalias_AtaquesSemana ' + sello + ' (resumen).csv';
  var nombreDet = 'Anomalias_AtaquesSemana ' + sello + ' (detalle).csv';
  ano_guardarCsv_(carpeta, nombreRes, resumen);
  ano_guardarCsv_(carpeta, nombreDet, detalle);

  var fmt = function (o) {
    return Object.keys(o).sort().map(function (c) { return c + ' ' + o[c]; }).join(' | ');
  };
  Logger.log('[AnomaliasAtaquesSemana] SOLO INFORMAR (' + Math.round((new Date() - t0) / 1000) + ' s). ' +
    'Series revisadas: ' + orden.length + '. Series anomalas: ' + anomalas.length + '. ' +
    'Por tipo: ' + (fmt(porTipo) || '-') + '. ' +
    'Por propuesta: ' + (fmt(porPropuesta) || '-') + '. ' +
    'Por temporada/semana: ' + (fmt(porTemporada) || '-') + '. ' +
    'Filas con Origen en series anomalas: ' + filasConOrigen + '. ' +
    'Detalle en Drive: ' + nombreRes + ' y ' + nombreDet + '. (No se escribio nada en el Backup ni en Guerra.)');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Ayuda de testTamanioPerfiles -----

// _tpSumarClaves_(acum, obj): suma al acumulador el peso en bytes (JSON) de cada clave de primer nivel de obj.
function _tpSumarClaves_(acum, obj) {
  Object.keys(obj).forEach(function (c) {
    var v = obj[c];
    if (v === undefined) return;
    var n = Utilities.newBlob(JSON.stringify(v)).getBytes().length;
    acum[c] = (acum[c] || 0) + n;
  });
}

// ----- Ayudas del cruce con el historial -----

// ---------- utilidades ----------

function cruce_leerCsv_(carpetaId, nombre) {
  var it = DriveApp.getFolderById(carpetaId).getFilesByName(nombre);
  if (!it.hasNext()) throw new Error('No encuentro ' + nombre + ' en la carpeta ' + carpetaId);
  var texto = it.next().getBlob().getDataAsString('UTF-8');
  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.substring(1);
  return Utilities.parseCsv(texto);
}

function cruce_leerUltimoInforme_() {
  var it = DriveApp.getFolderById(CRUCE_CFG.CARPETA_INFORMES_ID).getFiles();
  var mejor = null;
  while (it.hasNext()) {
    var f = it.next();
    var n = f.getName();
    if (n.indexOf(CRUCE_CFG.PREFIJO_INFORME) !== 0) continue;
    if (n.indexOf('(informe).csv') === -1) continue;
    if (!mejor || f.getDateCreated() > mejor.getDateCreated()) mejor = f;
  }
  if (!mejor) throw new Error('No hay informe ' + CRUCE_CFG.PREFIJO_INFORME + ' en Informes.');
  var texto = mejor.getBlob().getDataAsString('UTF-8');
  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.substring(1);
  return { nombre: mejor.getName(), filas: Utilities.parseCsv(texto) };
}

function cruce_indices_(encabezado) {
  var m = {};
  for (var i = 0; i < encabezado.length; i++) {
    m[String(encabezado[i]).trim()] = i;
  }
  return m;
}

function cruce_celda_(fila, indices, nombre) {
  var i = indices[nombre];
  if (i === undefined) throw new Error('Falta la columna "' + nombre + '"');
  return fila[i] === undefined ? '' : String(fila[i]).trim();
}

function cruce_num_(v) {
  var n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function cruce_tag_(v) {
  var t = String(v).trim().toUpperCase();
  return t.charAt(0) === '#' ? t : '#' + t;
}

// En el historial el clan viene como "Nombre\nfecha": se queda con la primera linea.
function cruce_clan_(v) {
  return String(v).split(/\r?\n/)[0].trim();
}

function cruce_clave_(tag, temporada, semana, clan) {
  return tag + '|' + temporada + '|' + semana + '|' + clan;
}

function cruce_csvCelda_(v) {
  var s = (v === null || v === undefined) ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// ----- Totales semanales desde el historial (versión anterior, sin uso, y ayudas) -----

function tot_ejecutar_(aplicar) {
  var t0 = new Date();
  var zona = Session.getScriptTimeZone();
  var sello = Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd HH.mm.ss');

  // 1) Series SIN RESOLVER del ultimo informe de completar domingo.
  var inf = tot_leerUltimoInforme_();
  var hi = tot_indices_(inf.filas[0]);
  var objetivos = [];
  var claves = {};
  for (var i = 1; i < inf.filas.length; i++) {
    var f = inf.filas[i];
    if (tot_celda_(f, hi, 'Fuente') !== 'Backup_Guerra.csv') continue;
    if (tot_celda_(f, hi, 'Tipo') !== 'SIN RESOLVER') continue;
    var o = {
      temporada: tot_num_(tot_celda_(f, hi, 'Temporada')),
      semana: tot_num_(tot_celda_(f, hi, 'Semana')),
      tag: tot_tag_(tot_celda_(f, hi, 'Tag')),
      nombre: tot_celda_(f, hi, 'Nombre'),
      clan: tot_clan_(tot_celda_(f, hi, 'Clan')),
      jsonAtaques: tot_num_(tot_celda_(f, hi, 'JSON ataques')),
      jsonFame: tot_num_(tot_celda_(f, hi, 'JSON fame')),
      jsonBarcos: tot_num_(tot_celda_(f, hi, 'JSON barcos'))
    };
    o.clave = tot_clave_(o.tag, o.temporada, o.semana, o.clan);
    objetivos.push(o);
    claves[o.clave] = true;
  }

  // 2) Backup: lee el texto, comprueba que el formato se reproduce y ubica la ultima fila.
  var archivoBackup = tot_buscarArchivo_(TOT_CFG.CARPETA_BACKUP_ID, TOT_CFG.ARCHIVO_BACKUP);
  var texto = archivoBackup.getBlob().getDataAsString('UTF-8');
  var bom = texto.charCodeAt(0) === 0xFEFF;
  if (bom) texto = texto.substring(1);
  var eol = texto.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
  var terminaEnEol = /\r?\n$/.test(texto);
  var filas = Utilities.parseCsv(texto);
  while (filas.length && filas[filas.length - 1].length === 1 && filas[filas.length - 1][0] === '') filas.pop();

  var reproduce = tot_serializar_(filas, eol) === texto.replace(/(\r?\n)+$/, '');

  var hb = tot_indices_(filas[0]);
  var cAtk = tot_indice_(hb, 'AtaquesSemana');
  var cFame = tot_indice_(hb, 'Fame');
  var cBar = tot_indice_(hb, 'Barcos');
  var ultimo = {};
  for (var b = 1; b < filas.length; b++) {
    var r = filas[b];
    var kb = tot_clave_(
      tot_tag_(tot_celda_(r, hb, 'Tag')),
      tot_num_(tot_celda_(r, hb, 'Temporada')),
      tot_num_(tot_celda_(r, hb, 'Semana')),
      tot_clan_(tot_celda_(r, hb, 'Clan')));
    if (!claves[kb]) continue;
    var pi = tot_num_(tot_celda_(r, hb, 'PeriodIndex'));
    if (pi % 7 < 3) continue;   // §PF139: solo jueves a domingo (un PeriodIndex no numerico, que da 0, tambien queda fuera)
    var previo = ultimo[kb];
    if (!previo || pi >= previo.pi) {
      ultimo[kb] = {
        idx: b, pi: pi,
        ataques: tot_num_(r[cAtk]), fame: tot_num_(r[cFame]), barcos: tot_num_(r[cBar])
      };
    }
  }

  // 3) Historial semanal.
  var hs = tot_leerCsv_(TOT_CFG.CARPETA_HISTORIAL_ID, TOT_CFG.ARCHIVO_HISTORIAL);
  var hh = tot_indices_(hs[0]);
  var historial = {};
  for (var h = 1; h < hs.length; h++) {
    var q = hs[h];
    var kh = tot_clave_(
      tot_tag_(tot_celda_(q, hh, 'Tag')),
      tot_num_(tot_celda_(q, hh, 'TemporadaInterna')),
      tot_num_(tot_celda_(q, hh, 'Semana')),
      tot_clan_(tot_celda_(q, hh, 'Clan')));
    if (!claves[kh]) continue;
    var reg = {
      ataques: tot_num_(tot_celda_(q, hh, 'Ataques')),
      fame: tot_num_(tot_celda_(q, hh, 'Fame')),
      barcos: tot_num_(tot_celda_(q, hh, 'Barcos')),
      cerrada: String(tot_celda_(q, hh, 'Cerrada')).toLowerCase() === 'true'
    };
    var ex = historial[kh];
    if (!ex || (reg.cerrada && !ex.cerrada)) historial[kh] = reg;
  }

  // 4) Evaluar cada serie.
  var salida = [[
    'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Linea en Backup', 'PeriodIndex',
    'Ataques antes', 'Ataques nuevo', 'Fame antes', 'Fame nueva', 'Barcos antes', 'Barcos nuevo',
    'Decision', 'CRR ataques domingo', 'CRR fame domingo'
  ]];
  var cambios = [];
  var conteo = {};
  for (var k = 0; k < objetivos.length; k++) {
    var ob = objetivos[k];
    var bb = ultimo[ob.clave];
    var hr = historial[ob.clave];
    var motivo;
    if (!bb) motivo = 'SIN_FILA_BACKUP';
    else if (!hr) motivo = 'SIN_FILA_HISTORIAL';
    else if (!hr.cerrada) motivo = 'HISTORIAL_ABIERTO';
    else if (hr.ataques !== ob.jsonAtaques || hr.fame !== ob.jsonFame || hr.barcos !== ob.jsonBarcos) motivo = 'HISTORIAL_DISTINTO_DE_JSON';
    // §PF139: el total semanal solo se escribe en la fila del DOMINGO. Si la ultima fila que hay es otra (por ejemplo el sabado), no se escribe
    // nada y se avisa: escribirlo ahi hace que esa fila absorba los ataques del domingo (como paso el 18-oct-2026 en 11 casos de T3 S1 a S3).
    else if (bb.pi % 7 !== 6) motivo = 'ULTIMA_FILA_NO_ES_DOMINGO';
    else if (bb.ataques === ob.jsonAtaques && bb.fame === ob.jsonFame && bb.barcos === ob.jsonBarcos) motivo = 'YA_COINCIDE';
    else if (bb.ataques > ob.jsonAtaques || bb.fame > ob.jsonFame || bb.barcos > ob.jsonBarcos) motivo = 'BACKUP_MAYOR_EN_ALGO';
    else if (bb.ataques === 0 && bb.fame === 0) motivo = 'SEMANA_VACIA_EN_BACKUP_REVISAR';
    else motivo = 'APLICAR';
    // §PF139: CurrentRiverRace como comprobacion. Si con estos totales el domingo (o cualquier dia) saldria imposible, no se escribe y se avisa.
    var crrDom = null;
    if (motivo === 'APLICAR' && typeof _crrDomingoParaTotales_ === 'function') {
      crrDom = _crrDomingoParaTotales_(ob.temporada, ob.semana, ob.tag, ob.jsonAtaques, ob.jsonFame);
      if (crrDom && crrDom.conflicto) motivo = 'CRR_NO_CUADRA';
    }
    conteo[motivo] = (conteo[motivo] || 0) + 1;

    if (motivo === 'APLICAR') {
      cambios.push({ idx: bb.idx, atk: ob.jsonAtaques, fame: ob.jsonFame, barcos: ob.jsonBarcos });
    }
    salida.push([
      ob.temporada, ob.semana, ob.tag, ob.nombre, ob.clan,
      bb ? bb.idx + 1 : '', bb ? bb.pi : '',
      bb ? bb.ataques : '', motivo === 'APLICAR' ? ob.jsonAtaques : '',
      bb ? bb.fame : '', motivo === 'APLICAR' ? ob.jsonFame : '',
      bb ? bb.barcos : '', motivo === 'APLICAR' ? ob.jsonBarcos : '',
      motivo + (crrDom && crrDom.conflicto ? ' (' + crrDom.conflicto + ')' : ''),
      crrDom && crrDom.ataquesDomingo !== null ? crrDom.ataquesDomingo : '',
      crrDom && crrDom.fameDomingo !== null ? crrDom.fameDomingo : ''
    ]);
  }

  var resumen = Object.keys(conteo).sort().map(function (c) { return c + ' ' + conteo[c]; }).join(' | ');
  var carpetaInformes = DriveApp.getFolderById(TOT_CFG.CARPETA_INFORMES_ID);

  // 5) Solo informar: guarda el detalle y termina.
  if (!aplicar) {
    var nombreInf = 'AplicarTotalesSemana_Historial ' + sello + ' (informe).csv';
    tot_guardarCsv_(carpetaInformes, nombreInf, salida);
    Logger.log('[TotalesSemanaHistorial] SOLO INFORMAR (' + Math.round((new Date() - t0) / 1000) + ' s). ' +
      'Informe base: ' + inf.nombre + '. Series SIN RESOLVER: ' + objetivos.length + '. ' + resumen +
      '. Cambios que se aplicarian: ' + cambios.length +
      '. Formato del Backup reproducible: ' + (reproduce ? 'SI' : 'NO (no se podria aplicar)') +
      '. Detalle en Drive: ' + nombreInf + '. (No se escribio nada.)');
    return;
  }

  // 6) Aplicar: validaciones previas.
  if (!reproduce) {
    throw new Error('El formato de ' + TOT_CFG.ARCHIVO_BACKUP + ' no se reproduce exactamente al re-serializarlo. No se escribio nada.');
  }
  if (cambios.length === 0) {
    Logger.log('[TotalesSemanaHistorial] APLICAR: no hay nada que cambiar. ' + resumen);
    return;
  }
  if (cambios.length > TOT_CFG.MAX_CAMBIOS) {
    throw new Error('Se piden ' + cambios.length + ' cambios (limite ' + TOT_CFG.MAX_CAMBIOS + '). No se escribio nada.');
  }

  // 7) Copia previa, escritura y verificacion.
  var nombreCopia = 'Backup_Guerra ANTES de aplicar TotalesSemanaDesdeHistorial ' + sello + '.csv';
  archivoBackup.makeCopy(nombreCopia, carpetaInformes);

  for (var c = 0; c < cambios.length; c++) {
    var cb = cambios[c];
    filas[cb.idx][cAtk] = String(cb.atk);
    filas[cb.idx][cFame] = String(cb.fame);
    filas[cb.idx][cBar] = String(cb.barcos);
  }
  var nuevoTexto = tot_serializar_(filas, eol) + (terminaEnEol ? eol : '');
  _setContentConConteo_(archivoBackup, (bom ? '﻿' : '') + nuevoTexto);

  var texto2 = archivoBackup.getBlob().getDataAsString('UTF-8');
  if (texto2.charCodeAt(0) === 0xFEFF) texto2 = texto2.substring(1);
  var filas2 = Utilities.parseCsv(texto2);
  while (filas2.length && filas2[filas2.length - 1].length === 1 && filas2[filas2.length - 1][0] === '') filas2.pop();
  var ok = filas2.length === filas.length;
  for (var v = 0; ok && v < cambios.length; v++) {
    var vb = cambios[v];
    ok = filas2[vb.idx][cAtk] === String(vb.atk) &&
         filas2[vb.idx][cFame] === String(vb.fame) &&
         filas2[vb.idx][cBar] === String(vb.barcos);
  }

  var nombreApl = 'AplicarTotalesSemana_Historial ' + sello + ' (aplicado).csv';
  tot_guardarCsv_(carpetaInformes, nombreApl, salida);
  Logger.log('[TotalesSemanaHistorial] APLICADO (' + Math.round((new Date() - t0) / 1000) + ' s). ' +
    cambios.length + ' fila(s) corregidas en ' + TOT_CFG.ARCHIVO_BACKUP + '. ' + resumen +
    '. Verificacion tras escribir: ' + (ok ? 'OK' : 'FALLO, restaura la copia previa') +
    '. Copia previa: ' + nombreCopia + '. Detalle: ' + nombreApl +
    '. Siguiente: sube Backup_Guerra.csv a GitHub y corre updateControlSheet() y actualizarControl2().');
}

// ---------- utilidades ----------

function tot_buscarArchivo_(carpetaId, nombre) {
  var it = DriveApp.getFolderById(carpetaId).getFilesByName(nombre);
  if (!it.hasNext()) throw new Error('No encuentro ' + nombre + ' en la carpeta ' + carpetaId);
  return it.next();
}

function tot_leerCsv_(carpetaId, nombre) {
  var texto = tot_buscarArchivo_(carpetaId, nombre).getBlob().getDataAsString('UTF-8');
  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.substring(1);
  return Utilities.parseCsv(texto);
}

function tot_leerUltimoInforme_() {
  var it = DriveApp.getFolderById(TOT_CFG.CARPETA_INFORMES_ID).getFiles();
  var mejor = null;
  while (it.hasNext()) {
    var f = it.next();
    var n = f.getName();
    if (n.indexOf(TOT_CFG.PREFIJO_INFORME) !== 0) continue;
    if (n.indexOf('(informe).csv') === -1) continue;
    if (!mejor || f.getDateCreated() > mejor.getDateCreated()) mejor = f;
  }
  if (!mejor) throw new Error('No hay informe ' + TOT_CFG.PREFIJO_INFORME + ' en Informes.');
  var texto = mejor.getBlob().getDataAsString('UTF-8');
  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.substring(1);
  return { nombre: mejor.getName(), filas: Utilities.parseCsv(texto) };
}

function tot_indices_(encabezado) {
  var m = {};
  for (var i = 0; i < encabezado.length; i++) m[String(encabezado[i]).trim()] = i;
  return m;
}

function tot_indice_(indices, nombre) {
  var i = indices[nombre];
  if (i === undefined) throw new Error('Falta la columna "' + nombre + '"');
  return i;
}

function tot_celda_(fila, indices, nombre) {
  var i = tot_indice_(indices, nombre);
  return fila[i] === undefined ? '' : String(fila[i]).trim();
}

function tot_num_(v) {
  var n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function tot_tag_(v) {
  var t = String(v).trim().toUpperCase();
  return t.charAt(0) === '#' ? t : '#' + t;
}

// En el historial el clan viene como "Nombre\nfecha": se queda con la primera linea.
function tot_clan_(v) {
  return String(v).split(/\r?\n/)[0].trim();
}

function tot_clave_(tag, temporada, semana, clan) {
  return tag + '|' + temporada + '|' + semana + '|' + clan;
}

function tot_csvCelda_(v) {
  var s = (v === null || v === undefined) ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function tot_serializar_(filas, eol) {
  return filas.map(function (fila) {
    return fila.map(tot_csvCelda_).join(',');
  }).join(eol);
}

function tot_guardarCsv_(carpeta, nombre, filas) {
  _createFileConConteo_(carpeta, nombre, tot_serializar_(_informeConIdSemana_(filas), '\r\n'), MimeType.CSV);
}

// ----- Ayudas del informe de anomalías de ataques -----

// ---------- utilidades ----------

function ano_leerCsv_(carpetaId, nombre) {
  var it = DriveApp.getFolderById(carpetaId).getFilesByName(nombre);
  if (!it.hasNext()) throw new Error('No encuentro ' + nombre + ' en la carpeta ' + carpetaId);
  var texto = it.next().getBlob().getDataAsString('UTF-8');
  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.substring(1);
  var filas = Utilities.parseCsv(texto);
  while (filas.length && filas[filas.length - 1].length === 1 && filas[filas.length - 1][0] === '') filas.pop();
  return filas;
}

function ano_indices_(encabezado) {
  var m = {};
  for (var i = 0; i < encabezado.length; i++) m[String(encabezado[i]).trim()] = i;
  return m;
}

function ano_celda_(fila, indices, nombre) {
  var i = indices[nombre];
  if (i === undefined) throw new Error('Falta la columna "' + nombre + '"');
  return fila[i] === undefined ? '' : String(fila[i]).trim();
}

function ano_celdaOpc_(fila, indices, nombre) {
  var i = indices[nombre];
  return (i === undefined || fila[i] === undefined) ? '' : String(fila[i]).trim();
}

function ano_num_(v) {
  var n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function ano_tag_(v) {
  var t = String(v).trim().toUpperCase();
  return t.charAt(0) === '#' ? t : '#' + t;
}

// En el historial el clan viene como "Nombre\nfecha": se queda con la primera linea.
function ano_clan_(v) {
  return String(v).split(/\r?\n/)[0].trim();
}

function ano_clave_(tag, temporada, semana, clan) {
  return tag + '|' + temporada + '|' + semana + '|' + clan;
}

function ano_csvCelda_(v) {
  var s = (v === null || v === undefined) ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function ano_guardarCsv_(carpeta, nombre, filas) {
  var texto = _informeConIdSemana_(filas).map(function (fila) { return fila.map(ano_csvCelda_).join(','); }).join('\r\n');
  _createFileConConteo_(carpeta, nombre, texto, MimeType.CSV);
}