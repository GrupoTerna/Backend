// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 31-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Informes (solo leen y registran)
//    - Aplicar las correcciones desde Control_2 (aplicarCorreccionGuerraATodasLasTemporadas() corre por tandas: cadena CORRGUERRA, §PF358)
//    - Auditorías de la guerra reconstruida
//    - Completar el domingo y reparar la semana desde el JSON de RoyaleAPI
//    - Cerrar las contradicciones de clan terminado de Revision_Guerra.csv (§PF357)
//  Parte 2 — Funciones que no se corren a mano
//    - Fame: combinaciones posibles por día
//    - Overlay de correcciones (CSV): lectura, escritura y formato
//    - Fuente de guerra y temporadas de RoyaleAPI
//    - Aplicar las correcciones (motor)
//    - Reparto, reconstrucción y cobertura
//    - Reparto del domingo y corrección con ClanTag
//    - Battlelog contra guerra
//    - Hoja contra correcciones
//    - Domingo y semana desde el JSON de RoyaleAPI
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.
// Se tomaron como manuales las funciones sin parámetros y sin llamadas desde otro lugar (deducción de Claude, a confirmar), incluidas _auditarReconstruccionesGuerraSospechosas y _eliminarFilasReconstruidasDeCSV.
// Las variables globales que estaban entre las funciones subieron a la zona de constantes y variables.

// ==============================================================================
// 18_CorreccionGuerra.gs
// Correcciones manuales de guerra aplicadas desde Control_2 (overlay de ajustes).
// ==============================================================================

// AVISOS ABIERTOS (18_CorreccionGuerra.gs) — pendientes de confirmar por el usuario [→ Contexto_Base_Web.md §18B001]

// ----- Variables y constantes -----

// Índices de columna (1-based) — Correcciones_Guerra.csv en FORMATO LARGO (el de antes de §PF164): desde el 22-oct-2026 el archivo se escribe en formato ancho y estos índices solo sirven para leer/migrar el formato largo. [→ Contexto_Base_Web.md §18B002]
var CGC = {
  NUM: 1, TEMPORADA: 2, SEMANA: 3, TAG: 4,
  ATAQUES_SEMANA: 5, BARCOS: 6, FAME: 7, ACTUALIZADO: 8,
  APROBACION: 9, IMPLEMENTACION: 10,
  CLAN_TAG: 11
};

var CGC_TOTAL_COLS = 11;

var CORRECCIONES_GUERRA_CSV = 'Correcciones_Guerra.csv';

// TABLA DE FAME POSIBLE DE UN DIA COMPLETO (Fase 15, Tanda 3, sub-tanda 3.1, [→ Contexto_Base_Web.md §18B003]
var FAME_PVP_GANA = 200;     // CW_Battle_1v1 ganada

var FAME_PVP_PIERDE = 100;   // CW_Battle_1v1 perdida

var FAME_BARCO_GANA = 125;   // boatBattle ganado (pregunta 50, cerrada)

var FAME_BARCO_PIERDE = 75;  // boatBattle perdido

var FAME_MAZOS_POR_DIA = 4;  // mazos (ataques) por jugador y dia de guerra, sumando todos sus clanes

// Duelo: maximo UNO por dia; usa 2 o 3 mazos (la 3.ª batalla solo existe si queda 1-1).
// Cada batalla de duelo gana 250 / pierde 100. Resultado «g-p» = ganadas-perdidas.
var FAME_DUELO_RESULTADOS = [
  { etiqueta: '0-2', mazos: 2, fame: 200 },
  { etiqueta: '2-0', mazos: 2, fame: 500 },
  { etiqueta: '1-2', mazos: 3, fame: 450 },
  { etiqueta: '2-1', mazos: 3, fame: 600 }
];

// 3.3b -- CONEXION DEL REPARTO DEL DOMINGO SIN ClanTag CON LA ESCRITURA [→ Contexto_Base_Web.md §18B011]
// Interruptor (decision de Claude, PENDIENTE DE CONFIRMAR): true = una correccion del [→ Contexto_Base_Web.md §18B012]
var CORRECCION_SIN_CLANTAG_REPARTO_DOMINGO = true;

// 3.3c-2b: true = las correcciones que traen ClanTag escriben cada clan con su valor [→ Contexto_Base_Web.md §18B013]
var CORRECCION_CON_CLANTAG_POR_CLAN = true;

var REVISION_GUERRA_CSV = 'Revision_Guerra.csv';

var REVISION_GUERRA_ENCABEZADO = ['N°', 'Fecha', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Tipo', 'Motivo', 'Detalle', 'Estado'];

// §PF313 (PF307 punto 4, §PF253 punto 1): registro de contradicciones entre filas de Correcciones_Guerra.csv. [→ Contexto_Base_Web.md §PF313]
var CGW_CONTRADICCION_TIPO = 'Contradicción';      // columna «Tipo» de Revision_Guerra.csv
var CGW_CONTRADICCION_ESTADO = 'Pendiente';        // columna «Estado» de lo que no se resolvió solo
var CGW_CONTRADICCIONES_MAX_LINEAS = 200;          // tope de líneas que viajan en la respuesta (el resto solo cuenta)
var CGW_MIN_JUGADORES_COBERTURA = 5;               // §PF436: un día cuenta como «cubierto» para un clan si hay al menos 5 jugadores distintos con fila real ese día; con menos se toma como un día sin registro (la ausencia de un jugador no prueba nada)
var CGW_MAX_ATAQUES_SIN_FAME = 4;                 // §PF357: clan que cruzó la meta el domingo: el domingo no da fame: cuentan todos sus ataques (máximo 4) o ninguno (decisión de la usuaria, 4-nov-2026)
// §PF357 (5-nov-2026): contradicciones de Revision_Guerra.csv que la usuaria resolvió con la regla del clan terminado; las cierra cerrarContradiccionesClanTerminado() [→ Contexto_Base_Web.md §PF357]
var CGW_CONTRADICCIONES_CERRAR_PF357 = [
  { temporada: 7,  semana: 1, tag: '#VY0UJ82PV', ataques: 16, fame: 1325, barcos: 1 },   // N° 912 al 4-nov-2026
  { temporada: 19, semana: 1, tag: '#V9P20U8RC', ataques: 15, fame: 1200, barcos: 0 }    // N° 913 al 4-nov-2026
];
var CGW_MAX_SEMANAS_VERIFICAR_CIERRE = 5;           // §PF357: semanas distintas por corrida cuyos currentriverrace se leen de Drive para verificar el cierre (leer una semana son miles de archivos); el resto queda «sin verificar»
// §PF358 (4-nov-2026): cadena por tandas de aplicarCorreccionGuerraATodasLasTemporadas() (id CORRGUERRA; regla 0.10 de la skill). NOMBRES_PASOS_CORRGUERRA va en el mismo orden que PASOS_CORRGUERRA. [→ Contexto_Base_Web.md §PF358]
var PASOS_CORRGUERRA = [
  function () { _cgwPasoCorrGuerraCache_(); },
  function () { return _cgwPasoCorrGuerraAplicar_(); },
  function () { _cgwPasoCorrGuerraControl_(); },
  function () { _cgwPasoCorrGuerraControl2_(); }
];
var NOMBRES_PASOS_CORRGUERRA = [
  'Caché de clanes: refrescar → caché al día (si falla, se continúa igual)',
  'Correcciones de Guerra: aplicar por temporada y por jugador-semana → hoja Guerra o Backup_Guerra.csv corregidos y Revision_Guerra.csv al día',
  'Hoja Control: repintar → Control al día con la guerra corregida',
  'Hoja Control_2: repintar → Control_2 al día con la guerra corregida'
];
var CGW_REGRESO_HUECO_DIAS = 7;                    // §PF314 (PF253 opción B): un hueco de 7 días o más sin clan Terna cuenta como «salió y regresó»
var _CGW_MITADES_SEMANA_CACHE_ = null;             // §PF313: sumas de dos días de guerra, para comprobar semanas completas

// 3.5a -- RESUMEN PURO DEL BATTLELOG POR DIA DE GUERRA Y POR CLAN (Fase 15, Tanda 3, [→ Contexto_Base_Web.md §18B034]
// Indices base 0 dentro de una fila de BLS_HEADERS (N° es el 0).
var BLG_COL = {
  TAG: 1, NOMBRE: 2, BATTLETIME: 3, TIPO: 4, CLAN_TAG: 5, CLAN_NOMBRE: 6,
  CORONAS_PROPIAS: 9, CORONAS_RIVAL: 10, RONDAS_DUELO: 11, BARCO_GANADO: 12,
  PRIMERA_COMPARABLE: 5, ULTIMA_COMPARABLE: 14,
  // NUEVO (4-oct-2026): LadoBarco = boatBattleSide crudo del JSON (06_Battlelogs_Siembra.gs). Las filas viejas
  // pueden ser mas cortas (17 columnas) o traerlo vacio: se leen como «sin lado».
  LADO_BARCO: 17
};

// Dias de guerra por semana (jueves=0 a domingo=3).
var BLG_DIAS_GUERRA = 4;

// Ventana en la que cada clan cambia de PeriodIndex: 09:00 a 10:00 UTC (04:00 a 05:00 Lima). La hora [→ Contexto_Base_Web.md §18B035]
var BLG_VENTANA_CAMBIO_UTC = { desde: 9, hasta: 10 };

// Fame de cada ronda de un duelo (seccion 2 del bloque de contexto; coincide con FAME_DUELO_RESULTADOS).
var BLG_FAME_RONDA_DUELO_GANA = 250;

var BLG_FAME_RONDA_DUELO_PIERDE = 100;

// 3.5b-2b -- COBERTURA DEL LOG (Fase 15, Tanda 3, 4-oct-2026, parte 59). Ver la seccion 26 del bloque [→ Contexto_Base_Web.md §18B045]
// Mejor cobertura primero (se usa para elegir entre varios JSON de un mismo Tag).
var BLG_COBERTURA_RANGO = { 'completa': 5, 'en-curso': 4, 'parcial': 3, 'ninguna': 2, 'futuro': 1, 'sin-dato': 0 };

// Presupuesto de tiempo para leer JSON dentro de una ejecucion del informe (los JSON pesan unos 290 KB cada uno).
var BLG_COBERTURA_PRESUPUESTO_MS = 240000;

// 3.5b-1 -- COMPARAR EL BATTLELOG CON LA HOJA GUERRA Y DECIDIR LAS AMBIGUAS POR CUPO [→ Contexto_Base_Web.md §18B051]
// Nombre corto de cada dia de guerra (indice 0..3 = jueves..domingo), para el log.
var BLG_DIAS_NOMBRE = ['Jue', 'Vie', 'Sab', 'Dom'];

// Maximo de lineas de detalle que imprime el informe (el resumen siempre se imprime completo).
var BLG_INFORME_MAX_LINEAS = 80;

// OVERLAY — lectura y escritura de Correcciones_Guerra.csv [→ Contexto_Base_Web.md §18B092]
// FORMATO ANCHO DEFINITIVO (22-oct-2026, pedido de la usuaria; [→ Contexto_Base_Web.md §PF164]).
// Correcciones_Guerra.csv pasa de una fila por (temporada, semana, jugador, clan) a UNA fila por (temporada, semana, jugador):
//   N°, Actualizado, Temporada, Semana, Tag,
//   Ataques <clan1..clanN>, Ataques Externo, Ataques RoyaleAPI, Barcos ..., Medallas ...,
//   Aprobación, Implementación, Origen RoyaleAPI, Clan RoyaleAPI (PF183 act. 16)
// En memoria NADA cambia: el mapa sigue siendo «temporada|semana|clanTag|tag» (clanTag '' = el perfil) y los consumidores
// (17, 18, 23, 47) no se enteran; solo cambia la capa que lee y escribe el CSV (este bloque).
// Reglas: (a) una fila por temporada, semana y jugador; (b) el Log actualiza las columnas de cada clan; (c) la columna RoyaleAPI
// la actualiza la visita al perfil; (d) Externo = RoyaleAPI - suma de los clanes, solo si la suma es menor; vacío en los demás casos.
// «Origen RoyaleAPI» dice de dónde salió esa columna: «perfil» (la mandó la fase de perfiles) o «desconocido» (no se puede asegurar). §PF244: si la fila no tiene perfil pero sí datos de un clan, dice «sin perfil: Log/Analytics».
var CGW_MAGNITUDES = [
  { nombre: 'Ataques',  campo: 'ataquesSemana' },
  { nombre: 'Barcos',   campo: 'barcos' },
  { nombre: 'Medallas', campo: 'fame' }
];

var CGW_ORIGEN_PERFIL = 'perfil';

var CGW_ORIGEN_DESCONOCIDO = 'desconocido';

// §PF244 (punto 1 de §PF235): seña de «perfil no consultado». Solo se ESCRIBE (valor calculado, como Externo y ID): una fila sin dato
// de perfil pero con datos de algún clan (Log/Analytics/River Race) dice por qué no tiene perfil, en vez de dejar «Origen RoyaleAPI» vacío.
// Nunca se lee como origen: al leer, el origen solo se mira cuando hay valores en las columnas RoyaleAPI, y cualquier texto que no sea
// «perfil» se trata como «desconocido». No distingue Log de Analytics (el mapa en memoria no guarda esa fuente).
var CGW_ORIGEN_SIN_PERFIL = 'sin perfil: Log/Analytics';

// §PF245: fuente de cada dato de clan (Log o Analytics; River Race no se guarda en este CSV). Columnas «Fuente <clanTag>», al final del encabezado
// (el lector va por nombre, así que no mueven nada). Se guarda como texto «Log» o «Analytics»; vacío = no se sabe (filas anteriores a §PF245).
// La seña de «sin perfil» la usa para decir de cuál vino: «sin perfil: Log», «sin perfil: Analytics» o, si hay de las dos o alguna no se sabe,
// «sin perfil: Log/Analytics».
var CGW_FUENTE_LOG = 'Log';

var CGW_FUENTE_ANALYTICS = 'Analytics';

var CGW_ENCABEZADO_ORIGEN = 'Origen RoyaleAPI';

// §PF238: columna «ID» (segunda columna del formato ancho): T_NN_S_NN_#TAG con la temporada propia y la semana de la fila. Es un valor
// calculado al escribir (se ignora al leer, como Externo): no hay que migrar nada, cada escritura lo completa en todas las filas.
var CGW_ENCABEZADO_ID = 'ID';

// §PF242: columnas «Temporada RoyaleAPI» y «Temporada Supercell» (junto a «Temporada», que es la propia). También son calculadas al escribir y
// se ignoran al leer. RoyaleAPI = propia + offset (_getTemporadaOffsetRoyaleApi, hoy 131: T6 = 137). Supercell es el id «AAAA-MM» del endpoint
// /locations/global/seasons (Backup_Seasons.csv, §PF239): un mes por temporada, con el ancla 2026-05 = RoyaleAPI 132 (= T1). Se calcula con la
// misma ancla que descargarSeasons() y no con el N° del arreglo; si la numeración propia se reenumera, el offset cambia y el id sigue siendo el mismo.
var CGW_ENCABEZADO_TEMP_ROYALEAPI = 'Temporada RoyaleAPI';

var CGW_ENCABEZADO_TEMP_SUPERCELL = 'Temporada Supercell';

var CGW_SUPERCELL_ANCLA_ROYALEAPI = 132;

var CGW_SUPERCELL_ANCLA_ANIO = 2026;

var CGW_SUPERCELL_ANCLA_MES = 5;

// PF183 act. 15 y 16 (24-oct-2026): última columna del formato ancho. Tag del clan de la fila del perfil de RoyaleAPI (leído del enlace del clan).
// Si ese clan no es de CFG.TERNA_TAGS, la fila es de clan externo: se guarda en RoyaleAPI y en Externo, pero NO cuenta como dato Terna. [→ Contexto_Base_Web.md §PF183]
var CGW_ENCABEZADO_CLAN_PERFIL = 'Clan RoyaleAPI';

// Antes de esta fecha (v2.9 de Tampermonkey) las filas sin ClanTag podían ser lo leído en un clan y no el perfil. [→ Contexto_Base_Web.md §PF164]
var CGW_FECHA_CORTE_PERFIL = '2026-09-29 00:00:00';

// REPARTO CONJUNTO DE ATAQUES, BARCOS Y FAME DE UNA SEMANA [→ Contexto_Base_Web.md §PF122]
var _FAME_CATALOGO_DIA_CACHE_ = null;

// INFORME HOJA GUERRA vs CORRECCIONES (SOLO LECTURA) [→ Contexto_Base_Web.md §18B120]
var HCC_MAX_LINEAS = 80;

// ==============================================================================
// COMPLETAR EL DOMINGO CON LOS JSON DE RoyaleAPI (19-oct-2026, pedido de la usuaria). [→ Contexto_Base_Web.md §PF123]
// Si el JSON individual de RoyaleAPI (registros cerrados: perfil, log, analytics) trae MAS que lo guardado en Guerra para un jugador, un clan y una semana,
// la diferencia se asigna al domingo (ultimo dia de guerra) de esa serie: AtaquesHoy, AtaquesSemana, Fame y Barcos, con Origen = Reconstruido.
// Solo se aplica si ningun valor del JSON es menor que lo guardado, la serie tiene fila de domingo, el domingo no pasa de 4 ataques ni de 900 medallas y la suma de
// los clanes del jugador ese domingo sigue siendo un dia posible (la misma tabla que Diario_C, calculada con _fameEsPosibleDia_). Lo demas se avisa y no se toca.
// Primero ...Informe() (solo lee y escribe un CSV de informe en Drive) y luego ...Aplicar() (respalda Backup_Guerra.csv antes de escribir).
// ==============================================================================
var COMPLETAR_DOMINGO_JSON_TOPE_ATAQUES_DIA = 4;

var COMPLETAR_DOMINGO_JSON_TOPE_MEDALLAS_DIA = 900;

var COMPLETAR_DOMINGO_JSON_LETRA_DOMINGO = 'D';

var COMPLETAR_DOMINGO_JSON_PRESUPUESTO_LECTURA_MS = 240000;

var COMPLETAR_DOMINGO_JSON_ENCABEZADO_INFORME = ['Fuente', 'Tipo', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'PeriodIndex domingo', 'Estado',
  'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana anterior', 'AtaquesSemana nueva', 'Fame anterior', 'Fame nueva', 'Barcos anterior', 'Barcos nuevo',
  'JSON ataques', 'JSON fame', 'JSON barcos', 'JSON fuentes', 'Detalle', 'Origen anterior'];

var _CDJ_CACHE_DIA_POSIBLE = {};

var REPARAR_SEMANA_JSON_OFFSET_DIA = { 'J': 0, 'V': 1, 'S': 2, 'D': 3 };

// ==============================================================================
// REPARAR LA SEMANA CUANDO EL JSON DE RoyaleAPI TRAE MENOS QUE LO GUARDADO (19-oct-2026, pedido de la usuaria). [→ Contexto_Base_Web.md §PF123]
// Si el JSON cerrado de RoyaleAPI coincide con RoyaleAPI (Correcciones_Guerra, HistorialGuerra_Grupal y Backup_Guerra_Semanal) y la serie guardada trae MAS, la
// que esta mal es la hoja o el CSV: se reparte la semana de esa serie con _repartirSemanaConjunto_() (ataques, barcos y fame del JSON a la vez), solo entre las
// filas que ya existen. Si ninguna combinacion de la tabla cuadra, o la suma de los clanes del jugador ese dia deja de ser un dia posible, no se toca y se avisa.
// Las filas cambiadas pasan a Origen = Corregido (si ya eran Reconstruido o Corregido se mantienen). Primero ...Informe() y luego ...Aplicar() (respalda Backup_Guerra.csv).
// ==============================================================================
var REPARAR_SEMANA_JSON_ENCABEZADO_INFORME = ['Fuente', 'Tipo', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'PeriodIndex', 'Dia', 'Estado',
  'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana anterior', 'AtaquesSemana nueva', 'Fame anterior', 'Fame nueva', 'Barcos anterior', 'Barcos nuevo',
  'JSON ataques', 'JSON fame', 'JSON barcos', 'JSON fuentes', 'Detalle', 'Origen anterior', 'Origen nuevo'];

// ===== PARTE 1 — Funciones que se corren a mano =====

// ----- Informes (solo leen y registran) -----

/**
 * informeRepartoDomingoSinClanTag() [→ Contexto_Base_Web.md §18B023]
 */
function informeRepartoDomingoSinClanTag() {
  var ss = _getSs();
  var ctxReal = _getCtx();
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var temporadaExtra = Number(shExtra.getRange(2, 7).getValue()); // G2 = Mostrar
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }
  var overlay = _cargarOverlayCorreccionesGuerra();
  var claves = Object.keys(overlay).filter(function (clave) {
    var v = overlay[clave];
    return String(clave.split('|')[0]) === String(temporadaMostrar) && v.clanes.length > 0 &&
      v.clanes.every(function (c) { return c === ''; });
  });
  if (!claves.length) {
    Logger.log('[Reparto domingo] Informe T' + temporadaMostrar + ': no hay correcciones sin ClanTag en ' + CORRECCIONES_GUERRA_CSV + '.');
    return;
  }
  var fuente = _cargarFuenteGuerraParaTemporada(temporadaMostrar, ctxReal.temporada);
  if (!fuente) { Logger.log('[Reparto domingo] Informe ABORT: no se pudo cargar la fuente de Guerra (hoja/CSV).'); return; }
  var ternaOrden = [];
  try { ternaOrden = _getNombresClanesTernaOrdenados(); } catch (eT) { ternaOrden = []; }
  var stats = {};
  var sinFilas = 0;
  for (var i = 0; i < claves.length; i++) {
    var partes = claves[i].split('|');
    var v = overlay[claves[i]];
    var r = _aplicarRepartoDomingoSinClanTagAFuente_(
      fuente, temporadaMostrar, Number(partes[1]), partes[2],
      { ataquesSemana: v.ataquesSemana, fame: v.fame, barcos: v.barcos },
      { soloInforme: true, ternaOrden: ternaOrden }, stats);
    if (r.estado === 'sin-filas') sinFilas++;
  }
  Logger.log('[Reparto domingo] Informe T' + temporadaMostrar + ': ' + claves.length + ' correccion(es) sin ClanTag. ' +
    'A acreditar: ' + (stats.repDomAcreditadas || 0) + ' (exactas ' + (stats.repDomExactas || 0) + ', estimadas ' + (stats.repDomEstimadas || 0) +
    '). Nada: ' + (stats.repDomNada || 0) + '. Alarmas: ' + (stats.repDomAlarmas || 0) +
    '. Pendientes (sin domingo): ' + (stats.repDomPendientes || 0) + '. Semanas sin filas (se reconstruirian): ' + sinFilas + '.');
}

/**
 * informeCorreccionConClanTag() [→ Contexto_Base_Web.md §18B027]
 */
function informeCorreccionConClanTag() {
  var ss = _getSs();
  var ctxReal = _getCtx();
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var temporadaExtra = Number(shExtra.getRange(2, 7).getValue()); // G2 = Mostrar
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }
  var overlay = _cargarOverlayCorreccionesGuerra();
  var claves = Object.keys(overlay).filter(function (clave) {
    var v = overlay[clave];
    return String(clave.split('|')[0]) === String(temporadaMostrar) && v.clanes.some(function (c) { return c !== ''; });
  });
  if (!claves.length) {
    Logger.log('[Con ClanTag] Informe T' + temporadaMostrar + ': no hay correcciones con ClanTag en ' + CORRECCIONES_GUERRA_CSV + '.');
    return;
  }
  var fuente = _cargarFuenteGuerraParaTemporada(temporadaMostrar, ctxReal.temporada);
  if (!fuente) { Logger.log('[Con ClanTag] Informe ABORT: no se pudo cargar la fuente de Guerra (hoja/CSV).'); return; }
  var ternaTags = CFG.TERNA_TAGS.slice();
  var nombresPorTag = _mapaNombresClanTerna_(ternaTags);
  var stats = { jugadores: 0, aplicar: 0, sinCambio: 0, reconstruir: 0, ignorar: 0, alarma: 0, baja: 0, incompletos: 0, revisiones: 0 };
  for (var i = 0; i < claves.length; i++) {
    var partes = claves[i].split('|');
    var semana = Number(partes[1]);
    var tag = partes[2];
    var ev = _evaluarCorreccionConClanTagSemana_(fuente.filas, temporadaMostrar, semana, tag, overlay[claves[i]],
      { ternaTags: ternaTags, nombresPorTag: nombresPorTag });
    stats.jugadores++;
    if (ev.incompleto) stats.incompletos++;
    stats.revisiones += ev.revisiones.length;
    for (var p = 0; p < ev.problemas.length; p++) {
      Logger.log('[Con ClanTag] PROBLEMA T' + temporadaMostrar + ' S' + semana + ' ' + tag + ': ' + ev.problemas[p].tipo + ' - ' +
        ev.problemas[p].motivo + '. ' + ev.problemas[p].detalle);
    }
    for (var k = 0; k < ev.decision.clanes.length; k++) {
      var c = ev.decision.clanes[k];
      if (c.accion === 'sin-cambio') { stats.sinCambio++; continue; }
      if (c.accion === 'aplicar') stats.aplicar++;
      else if (c.accion === 'reconstruir') stats.reconstruir++;
      else if (c.accion === 'ignorar') stats.ignorar++;
      else if (c.accion === 'alarma') stats.alarma++;
      if (c.baja) stats.baja++;
      Logger.log('[Con ClanTag] INFORME T' + temporadaMostrar + ' S' + semana + ' ' + tag + ' clan ' + c.clanTag + ': ' + c.accion +
        (c.baja ? ' (BAJA valores de la hoja)' : '') + ' - ' + c.motivo +
        (c.escribir ? '. Escribiria ataques=' + c.escribir.ataques + ' fame=' + c.escribir.fame + ' barcos=' + (c.escribir.barcos === null ? 'sin dato (no se toca)' : c.escribir.barcos) : '') +
        (c.delta ? '; diferencia con la hoja ataques=' + c.delta.ataques + ' fame=' + c.delta.fame + ' barcos=' + (c.delta.barcos === null ? 'sin dato' : c.delta.barcos) : ''));
    }
  }
  Logger.log('[Con ClanTag] Informe T' + temporadaMostrar + ': ' + stats.jugadores + ' jugador(es)-semana. Clanes: aplicar ' + stats.aplicar +
    ' (de ellos bajan valores: ' + stats.baja + '), sin cambio ' + stats.sinCambio + ', reconstruir ' + stats.reconstruir +
    ', ignorar (clan ajeno) ' + stats.ignorar + ', alarma ' + stats.alarma + '. Incompletos (nombre de clan sin resolver): ' + stats.incompletos +
    '. Revisiones que dejaria: ' + stats.revisiones + '. No se escribio nada.');
}

/**
 * informeHojaContraCorrecciones() [→ Contexto_Base_Web.md §18B124]
 */
function informeHojaContraCorrecciones() {
  var etiqueta = '[Hoja vs Correcciones]';
  // DiaGuerra puede venir como Date (hoja) o como texto (CSV): se muestra siempre como dd/mm/aaaa (fix 4-oct-2026, el log
  // mostraba la fecha larga de JavaScript).
  function fmtDia(v) {
    if (v instanceof Date && !isNaN(v.getTime())) return Utilities.formatDate(v, 'America/Lima', 'dd/MM/yyyy');
    return String(v);
  }
  var ss = _getSs();
  var ctxReal = _getCtx();
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var temporadaExtra = Number(shExtra.getRange(2, 7).getValue()); // G2 = Mostrar
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }
  var fuente = _cargarFuenteGuerraParaTemporada(temporadaMostrar, ctxReal.temporada);
  if (!fuente) { Logger.log(etiqueta + ' ABORT: no se pudo cargar la fuente de Guerra (hoja/CSV).'); return; }
  var overlay = _cargarOverlayCorreccionesGuerra();
  if (!overlay || Object.keys(overlay).length === 0) {
    Logger.log(etiqueta + ' ' + CORRECCIONES_GUERRA_CSV + ' no existe o esta vacio: no hay nada que comparar.');
    return;
  }

  var r = _hccCompararHojaConCorrecciones_(fuente.filas, overlay, temporadaMostrar);
  var c = r.cuenta;
  Logger.log(etiqueta + ' Informe T' + temporadaMostrar + ' (SOLO LECTURA, no se escribio nada). Jugador-semana en la hoja: ' + c.paresHoja +
    ' (comparados con una correccion y con ultima fila en domingo: ' + c.comparados + '; sin correccion: ' + c.sinCorreccion +
    '; semana en curso o cortada, no se compara: ' + c.semanaIncompleta + ').');
  Logger.log(etiqueta + ' De los comparados: iguales ' + c.iguales + '; HOJA MAYOR que la correccion ' + c.hojaMayor +
    '; HOJA MENOR ' + c.hojaMenor + '; mixtas (ataques y fame en sentidos opuestos) ' + c.mixtas +
    '. De las que difieren, solo difiere la fame (mismos ataques): ' + c.soloFameDifiere + '. Correcciones de la temporada sin ninguna fila en la hoja: ' + c.correccionesSinFilaEnHoja + '.');

  // NUEVO (4-oct-2026): veredicto del battlelog para cada caso que difiere (solo si 06_Battlelogs_Siembra.gs y el CSV estan).
  var pisoPorCaso = {};
  var cuentaVer = { 'hoja': 0, 'correccion': 0, 'ambas-bajas': 0, 'no-distingue': 0, sinLog: 0, notaHoja: 0, notaCorr: 0 };
  var logListo = (typeof _blsLeerCsv_ === 'function' && typeof BLS_HEADERS !== 'undefined' && typeof BLS_CSV_NOMBRE !== 'undefined' &&
                  typeof _blgResumirBatallasJugador_ === 'function');
  var csvLog = null;
  if (logListo) { csvLog = _blsLeerCsv_(BLS_CSV_NOMBRE, BLS_HEADERS); if (!csvLog || !csvLog.ok || !csvLog.rows.length) logListo = false; }
  if (!logListo) {
    Logger.log(etiqueta + ' Sin battlelog: no se pudo leer Backup_Battlelogs.csv o falta 06_Battlelogs_Siembra.gs; los casos se listan sin veredicto del log.');
  } else {
    var csvPorTag = {};
    var iC;
    for (iC = 0; iC < csvLog.rows.length; iC++) {
      var tgC = _blgNormalizarTag_(csvLog.rows[iC][BLG_COL.TAG]);
      if (!tgC) continue;
      if (!csvPorTag[tgC]) csvPorTag[tgC] = [];
      csvPorTag[tgC].push(csvLog.rows[iC]);
    }
    var juevesPorSemana = {};
    for (iC = 0; iC < fuente.filas.length; iC++) {
      var fC = fuente.filas[iC];
      if (String(fC[GC.TEMPORADA - 1]).trim() !== String(temporadaMostrar)) continue;
      var kC = _blgNormalizarTag_(String(fC[GC.TAG - 1]).trim()) + '|' + String(fC[GC.SEMANA - 1]).trim();
      if (juevesPorSemana[kC]) continue;
      var offC = (Number(fC[GC.PERIOD_IDX - 1]) || 0) % 7 - 3;
      if (offC >= -3 && offC <= 3) juevesPorSemana[kC] = _blgJuevesDeSemana_(_blgFechaIsoDeDiaGuerra_(fC[GC.DIA_GUERRA - 1]), offC);
    }
    var ternaTagsC = CFG.TERNA_TAGS.slice();
    r.resultados.forEach(function (x) {
      var jueves = juevesPorSemana[x.tag + '|' + x.semana];
      var limites = jueves ? _blgLimitesDiasGuerra_(jueves) : null;
      if (!limites || !csvPorTag[x.tag]) { cuentaVer.sinLog++; return; }
      var resumen = _blgResumirBatallasJugador_(csvPorTag[x.tag], x.tag, limites, { ternaTags: ternaTagsC });
      if (!resumen.ok) { cuentaVer.sinLog++; return; }
      var piso = _hccPisoLogDeResumen_(resumen);
      var ver = _hccVeredictoLog_(x.hojaAtaques, x.hojaFame, x.corrAtaques, x.corrFame, piso.ataques, piso.fame);
      cuentaVer[ver.codigo] = (cuentaVer[ver.codigo] || 0) + 1;
      if (ver.notas.length) {
        if (x.hojaFame < Math.min(FAME_BARCO_PIERDE, FAME_PVP_PIERDE) * x.hojaAtaques) cuentaVer.notaHoja++;
        if (x.corrFame < Math.min(FAME_BARCO_PIERDE, FAME_PVP_PIERDE) * x.corrAtaques) cuentaVer.notaCorr++;
      }
      pisoPorCaso[x.tag + '|' + x.semana] = { piso: piso, ver: ver };
    });
    Logger.log(etiqueta + ' Veredicto del battlelog en los ' + r.resultados.length + ' casos que difieren (el log da solo un PISO y pierde batallas): ' +
      'respalda la hoja ' + cuentaVer['hoja'] + '; respalda la correccion ' + cuentaVer['correccion'] + '; supera a las dos ' + cuentaVer['ambas-bajas'] +
      '; no distingue ' + cuentaVer['no-distingue'] + '; sin log utilizable ' + cuentaVer.sinLog +
      '. Coherencia interna: fame de la hoja insuficiente para sus ataques ' + cuentaVer.notaHoja + '; fame de la correccion insuficiente ' + cuentaVer.notaCorr + '.');
  }

  var lineas = [];
  r.resultados.forEach(function (x) {
    var txtEstado = x.estado === 'hoja-mayor' ? 'HOJA MAYOR' : (x.estado === 'hoja-menor' ? 'HOJA MENOR' : 'MIXTA');
    lineas.push(etiqueta + ' T' + temporadaMostrar + ' S' + x.semana + ' ' + x.tag + ' ' + x.nombre + ' | ' + x.clanes.join(' + ') +
      ' | ultima fila de la hoja: ' + x.dia + ' ' + fmtDia(x.diaGuerra) + ' (Origen ' + (x.origen || 'vacio') + '): ' + x.hojaAtaques + ' ataque(s) y ' + x.hojaFame + ' de fame' +
      ' | correccion: ' + x.corrAtaques + ' y ' + x.corrFame + ' (Aprobacion ' + (x.aprobacion || 'vacia') + ', Implementacion ' + (x.implementacion || 'vacia') + ')' +
      ' -> ' + txtEstado + ': ataques ' + (x.dAtaques > 0 ? '+' : '') + x.dAtaques + ', fame ' + (x.dFame > 0 ? '+' : '') + x.dFame +
      (function () {
        var pc = pisoPorCaso[x.tag + '|' + x.semana];
        if (!pc) return logListo ? ' | log: sin datos utilizables de esa semana' : '';
        return ' | log (piso): al menos ' + pc.piso.ataques + ' ataque(s) y ' + pc.piso.fame + ' de fame' +
          (pc.piso.ambiguasIncluidas ? ' (incluye ' + pc.piso.ambiguasIncluidas + ' batalla(s) de dia sin decidir) ' : ' ') + '=> ' + pc.ver.texto +
          (pc.ver.notas.length ? ' | ATENCION: ' + pc.ver.notas.join('; ') : '');
      })());
  });
  r.sinFila.slice(0, 10).forEach(function (ks) {
    var p = ks.split('|');
    lineas.push(etiqueta + ' T' + temporadaMostrar + ' S' + p[1] + ' ' + p[0] + ': hay correccion pero la hoja no tiene ninguna fila de ese jugador esa semana');
  });
  var tope = Math.min(lineas.length, HCC_MAX_LINEAS);
  for (var i = 0; i < tope; i++) Logger.log(lineas[i]);
  if (lineas.length > tope) {
    Logger.log(etiqueta + ' ... y ' + (lineas.length - tope) + ' linea(s) mas sin mostrar (primero se listan las que difieren en ataques, luego las que solo difieren en fame, al final las correcciones sin fila en la hoja).');
  }
}

/**
 * informeBattlelogContraGuerra() [→ Contexto_Base_Web.md §18B058]
 */
function informeBattlelogContraGuerra() {
  var etiqueta = '[Battlelog vs Guerra]';
  if (typeof _blsLeerCsv_ !== 'function' || typeof BLS_HEADERS === 'undefined' || typeof BLS_CSV_NOMBRE === 'undefined') {
    Logger.log(etiqueta + ' ABORT: falta 06_Battlelogs_Siembra.gs (funcion _blsLeerCsv_ y constantes BLS_*).');
    return;
  }
  var ss = _getSs();
  var ctxReal = _getCtx();
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var temporadaExtra = Number(shExtra.getRange(2, 7).getValue()); // G2 = Mostrar
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }
  var csv = _blsLeerCsv_(BLS_CSV_NOMBRE, BLS_HEADERS);
  if (!csv.ok) { Logger.log(etiqueta + ' ABORT: ' + csv.error); return; }
  if (!csv.rows.length) { Logger.log(etiqueta + ' Backup_Battlelogs.csv no existe o esta vacio: no hay nada que comparar.'); return; }
  var fuente = _cargarFuenteGuerraParaTemporada(temporadaMostrar, ctxReal.temporada);
  if (!fuente) { Logger.log(etiqueta + ' ABORT: no se pudo cargar la fuente de Guerra (hoja/CSV).'); return; }

  var ternaTags = CFG.TERNA_TAGS.slice();
  var nombresPorTag = {};
  try { nombresPorTag = _mapaNombresClanTerna_(ternaTags); } catch (eN) { nombresPorTag = {}; }
  var tagPorNombre = {};
  ternaTags.forEach(function (t) { if (nombresPorTag[t]) tagPorNombre[nombresPorTag[t]] = t; });
  function nombreClan(t) { return nombresPorTag[t] ? nombresPorTag[t] + ' (' + t + ')' : t; }

  var csvPorTag = {};
  var i;
  // NUEVO (4-oct-2026): valores de LadoBarco en TODAS las filas boatBattle del CSV (sin repetir por semana). Sirve para
  // confirmar como se ve un ataque real (AVISO 5 de 06_Battlelogs_Siembra.gs).
  var ladosCsv = {};
  var barcosCsv = 0;
  for (i = 0; i < csv.rows.length; i++) {
    if (String(csv.rows[i][BLG_COL.TIPO]).trim() !== 'boatBattle') continue;
    barcosCsv++;
    var lv = String(csv.rows[i][BLG_COL.LADO_BARCO] === undefined || csv.rows[i][BLG_COL.LADO_BARCO] === null ? '' : csv.rows[i][BLG_COL.LADO_BARCO]).trim();
    var lk = lv === '' ? '(vacio)' : lv;
    ladosCsv[lk] = (ladosCsv[lk] || 0) + 1;
  }
  for (i = 0; i < csv.rows.length; i++) {
    var tg = _blgNormalizarTag_(csv.rows[i][BLG_COL.TAG]);
    if (!tg) continue;
    if (!csvPorTag[tg]) csvPorTag[tg] = [];
    csvPorTag[tg].push(csv.rows[i]);
  }

  // Pares (Tag, semana) de la temporada que tienen el Tag en el CSV.
  var pares = {};
  var claves = [];
  for (i = 0; i < fuente.filas.length; i++) {
    var f = fuente.filas[i];
    if (String(f[GC.TEMPORADA - 1]) !== String(temporadaMostrar)) continue;
    var tagH = String(f[GC.TAG - 1]).trim();
    var tagN = _blgNormalizarTag_(tagH);
    if (!tagN || !csvPorTag[tagN]) continue;
    var sem = String(f[GC.SEMANA - 1]).trim();
    var clave = tagN + '|' + sem;
    if (!pares[clave]) {
      pares[clave] = { tagHoja: tagH, tag: tagN, semana: sem, nombre: String(f[GC.NOMBRE - 1] || '').trim(), jueves: '' };
      claves.push(clave);
    }
    if (!pares[clave].jueves) {
      var off = (Number(f[GC.PERIOD_IDX - 1]) || 0) % 7 - 3;
      if (off >= -3 && off <= 3) pares[clave].jueves = _blgJuevesDeSemana_(_blgFechaIsoDeDiaGuerra_(f[GC.DIA_GUERRA - 1]), off);
    }
  }
  claves.sort(function (a, b) {
    var pa = pares[a], pb = pares[b];
    var sa = Number(pa.semana) || 0, sb = Number(pb.semana) || 0;
    if (sa !== sb) return sa - sb;
    return pa.tag < pb.tag ? -1 : (pa.tag > pb.tag ? 1 : 0);
  });

  var cuenta = {
    pares: claves.length, sinLimites: 0, resumenFallido: 0, sinBatallas: 0, evaluados: 0,
    compatibles: 0, faltanEnHoja: 0, sinFilaHoja: 0, logMenor: 0,
    ambDiaUnico: 0, ambFuera: 0, ambSinDecidir: 0, ambImposibles: 0,
    conflictos: 0, excedeTope: 0, filasClanSinTag: 0, defensasBarco: 0, barcosSinLado: 0,
    domCalculado: 0, domNoCalculable: 0,
    fb: { fame: { compatible: 0, faltanEnHoja: 0, logMenor: 0 }, barcos: { compatible: 0, faltanEnHoja: 0, logMenor: 0 } }
  };
  // 3.5b-2b: cobertura del log. Los JSON se leen SOLO para los Tag que tengan alguna linea «log menor», una sola vez
  // por Tag y dentro de un presupuesto de tiempo (BLG_COBERTURA_PRESUPUESTO_MS).
  cuenta.cob = { completa: 0, enCurso: 0, parcial: 0, ninguna: 0, futuro: 0, sinDato: 0, sinMedir: 0 };
  cuenta.jsonLeidos = 0;
  cuenta.jsonErrores = 0;
  var archivosPorTag = null;
  var logsPorTag = {};
  var t0Cob = Date.now();
  function logsDe(tag) {
    if (logsPorTag.hasOwnProperty(tag)) return logsPorTag[tag];
    if (Date.now() - t0Cob > BLG_COBERTURA_PRESUPUESTO_MS) return null; // sin tiempo: no se mide (no se cachea)
    if (archivosPorTag === null) {
      archivosPorTag = {};
      try {
        if (typeof _blsListarArchivos_ === 'function') archivosPorTag = _blsListarArchivos_().porTag || {};
      } catch (eL) { archivosPorTag = {}; }
    }
    var lec = _blgLeerLogsDeArchivos_(archivosPorTag[tag] || []);
    cuenta.jsonLeidos += lec.leidos;
    cuenta.jsonErrores += lec.errores;
    logsPorTag[tag] = lec.logs;
    return lec.logs;
  }
  // Etiqueta de una linea «log menor»: devuelve { prio, texto } segun la cobertura del dia (y la cuenta).
  function etiquetaLogMenor(p, limites, dia) {
    var logs = logsDe(p.tag);
    var estado = logs === null ? 'sin-medir' : _blgMejorCobertura_(dia, limites, logs).estado;
    var clave = { 'completa': 'completa', 'en-curso': 'enCurso', 'parcial': 'parcial', 'ninguna': 'ninguna', 'futuro': 'futuro', 'sin-medir': 'sinMedir' }[estado] || 'sinDato';
    cuenta.cob[clave]++;
    return _blgEtiquetaCobertura_(estado);
  }
  var lineas = [];
  function agregar(prio, p, texto) {
    lineas.push({ prio: prio, orden: lineas.length, texto: 'T' + temporadaMostrar + ' S' + p.semana + ' ' + p.tag + ' ' + p.nombre + ' | ' + texto });
  }

  for (var k = 0; k < claves.length; k++) {
    var p = pares[claves[k]];
    if (!p.jueves) { cuenta.sinLimites++; agregar(0, p, 'no se pudo ubicar el jueves de la semana (falta una fecha DiaGuerra valida); no se compara'); continue; }
    var limites = _blgLimitesDiasGuerra_(p.jueves);
    if (!limites) { cuenta.sinLimites++; agregar(0, p, 'la fecha ' + p.jueves + ' no es un jueves; no se compara'); continue; }
    var resumen = _blgResumirBatallasJugador_(csvPorTag[p.tag], p.tag, limites, { ternaTags: ternaTags });
    if (!resumen.ok) { cuenta.resumenFallido++; agregar(0, p, 'no se pudo resumir el battlelog: ' + resumen.motivo); continue; }
    cuenta.defensasBarco += resumen.defensasBarco;
    cuenta.barcosSinLado += resumen.barcosSinLado;

    var hayBatallas = resumen.ambiguas.length > 0 || resumen.ajenasAmbiguas.length > 0;
    for (var d0 = 0; d0 < BLG_DIAS_GUERRA && !hayBatallas; d0++) {
      if (resumen.ajenasPorDia[d0].batallas > 0) hayBatallas = true;
      Object.keys(resumen.porClanDia).forEach(function (cl) { if (resumen.porClanDia[cl][d0].batallas > 0) hayBatallas = true; });
    }
    if (!hayBatallas) { cuenta.sinBatallas++; continue; }
    cuenta.evaluados++;

    var porClan = _indexarFilasJugadorSemanaPorClan_(fuente.filas, temporadaMostrar, p.semana, p.tagHoja);
    var hoja = {};
    var hojaFB = {};
    var hojaNoComparar = {};
    Object.keys(porClan).forEach(function (nombre) {
      var ct = tagPorNombre[nombre];
      if (!ct) { cuenta.filasClanSinTag++; return; }
      var arr = [null, null, null, null];
      var arrFB = [null, null, null, null];
      var arrNo = [false, false, false, false];
      for (var o = 0; o < BLG_DIAS_GUERRA; o++) {
        var idx = porClan[nombre][o];
        if (idx === undefined) continue;
        var fila = fuente.filas[idx];
        arr[o] = Number(fila[GC.ATAQUES_HOY - 1]) || 0;
        // NUEVO (4-oct-2026, parte 59): el DOMINGO la ultima actualizacion de la fila ocurre despues del reinicio, cuando el [→ Contexto_Base_Web.md §18B059]
        if (o === BLG_DIAS_GUERRA - 1 && arr[o] === 0) {
          var idxSab = porClan[nombre][o - 1];
          var semDom = _blgNumero_(fila[GC.ATAQUES_SEM - 1]);
          var semSab = idxSab === undefined ? null : _blgNumero_(fuente.filas[idxSab][GC.ATAQUES_SEM - 1]);
          // CORRECCION (4-oct-2026, regla 9, caso MiniCandre S1): el AtaquesSemana del sabado solo sirve de base si es [→ Contexto_Base_Web.md §18B060]
          var sumaJueSab = 0;
          for (var oo = 0; oo < o; oo++) sumaJueSab += (arr[oo] === null ? 0 : arr[oo]);
          var difDom = (semDom === null || semSab === null || semSab < sumaJueSab) ? null : semDom - semSab;
          if (difDom !== null && difDom >= 0 && difDom <= FAME_MAZOS_POR_DIA) {
            arr[o] = difDom;
            cuenta.domCalculado++;
          } else {
            arr[o] = null;
            arrNo[o] = true;
            cuenta.domNoCalculable++;
          }
        }
        // Fame y barcos de la hoja son ACUMULADOS de la semana por clan: el dia = acumulado de hoy menos el de la fila
        // de ayer del MISMO clan (0 si no hay fila de ayer), igual que Control (3.4). Nunca negativo.
        var idxAyer = o > 0 ? porClan[nombre][o - 1] : undefined;
        var fAcum = _blgNumero_(fila[GC.FAME - 1]), bAcum = _blgNumero_(fila[GC.BARCOS - 1]);
        var fAyer = idxAyer === undefined ? 0 : _blgNumero_(fuente.filas[idxAyer][GC.FAME - 1]);
        var bAyer = idxAyer === undefined ? 0 : _blgNumero_(fuente.filas[idxAyer][GC.BARCOS - 1]);
        arrFB[o] = {
          fame: (fAcum === null || fAyer === null) ? null : Math.max(0, fAcum - fAyer),
          barcos: (bAcum === null || bAyer === null) ? null : Math.max(0, bAcum - bAyer)
        };
      }
      hoja[ct] = arr;
      hojaFB[ct] = arrFB;
      hojaNoComparar[ct] = arrNo;
    });

    var cmp = _blgCompararConHoja_(resumen, hoja, { noComparar: hojaNoComparar });
    if (!cmp.ok) { cuenta.resumenFallido++; agregar(0, p, 'no se pudo comparar: ' + cmp.motivo); continue; }
    cuenta.compatibles += cmp.cuenta.compatible;
    cuenta.faltanEnHoja += cmp.cuenta.faltanEnHoja;
    cuenta.sinFilaHoja += cmp.cuenta.sinFilaHoja;
    cuenta.logMenor += cmp.cuenta.logMenor;
    cmp.filas.forEach(function (fl) {
      var dn = BLG_DIAS_NOMBRE[fl.dia];
      var rango = fl.logMin === fl.logMax ? String(fl.logMin) : (fl.logMin + ' a ' + fl.logMax);
      if (fl.estado === 'faltan-en-hoja') agregar(0, p, dn + ' clan ' + nombreClan(fl.clanTag) + ': la hoja dice ' + fl.hoja + ' ataque(s) y el log tiene al menos ' + fl.logMin + ' (' + fl.batallas + ' batalla(s)): FALTAN ' + fl.diferencia + ' en la hoja');
      else if (fl.estado === 'sin-fila-hoja') agregar(0, p, dn + ' clan ' + nombreClan(fl.clanTag) + ': el log tiene ' + fl.batallas + ' batalla(s) (' + rango + ' mazos) y la hoja no tiene fila de ese clan ese dia');
      else if (fl.estado === 'log-menor') {
        var etA = etiquetaLogMenor(p, limites, fl.dia);
        agregar(etA.prio, p, dn + ' clan ' + nombreClan(fl.clanTag) + ': la hoja dice ' + fl.hoja + ' y el log como maximo ' + fl.logMax + ' (' + fl.batallas + ' batalla(s)): ' + etA.texto);
      }
    });

    var cfb = _blgCompararFameBarcos_(resumen, hojaFB);
    if (!cfb.ok) { cuenta.resumenFallido++; agregar(0, p, 'no se pudo comparar fame y barcos: ' + cfb.motivo); }
    else {
      ['fame', 'barcos'].forEach(function (cp) {
        cuenta.fb[cp].compatible += cfb.cuenta[cp].compatible;
        cuenta.fb[cp].faltanEnHoja += cfb.cuenta[cp].faltanEnHoja;
        cuenta.fb[cp].logMenor += cfb.cuenta[cp].logMenor;
      });
      cfb.filas.forEach(function (fl) {
        if (fl.estado === 'compatible') return;
        var dn = BLG_DIAS_NOMBRE[fl.dia];
        var etiq = fl.campo === 'fame' ? 'fame del dia' : 'barcos del dia';
        var rg = fl.logMin === fl.logMax ? String(fl.logMin) : (fl.logMin + ' a ' + fl.logMax);
        if (fl.estado === 'faltan-en-hoja') {
          agregar(1, p, dn + ' clan ' + nombreClan(fl.clanTag) + ': ' + etiq + ' en la hoja ' + fl.hoja + ' y el log tiene al menos ' + fl.logMin + ': FALTAN ' + fl.diferencia +
            (fl.campo === 'fame' ? ' (puede ser un desfase: si el dia anterior no se cerro, esa fame cae en el dia siguiente)' : ''));
        } else {
          var etF = etiquetaLogMenor(p, limites, fl.dia);
          agregar(etF.prio, p, dn + ' clan ' + nombreClan(fl.clanTag) + ': ' + etiq + ' en la hoja ' + fl.hoja + ' y el log como maximo ' + fl.logMax + ' (' + rg + '): ' + etF.texto);
        }
      });
    }

    var dec = _blgDecidirAmbiguas_(resumen);
    cuenta.ambDiaUnico += dec.diaUnico;
    cuenta.ambFuera += dec.fuera;
    cuenta.ambSinDecidir += dec.sinDecidir;
    cuenta.ambImposibles += dec.imposibles;
    dec.decisiones.forEach(function (x) {
      var ms = _blgParsearBattleTime_(x.battleTime);
      var hora = ms === null ? x.battleTime : Utilities.formatDate(new Date(ms), 'America/Lima', 'dd/MM HH:mm') + ' Lima';
      var cands = x.candidatos.map(function (q) { return BLG_DIAS_NOMBRE[q]; }).join(' o ') + (x.puedeSerFuera ? (x.candidatos.length ? ' o fuera de la semana' : 'fuera de la semana') : '');
      var que = x.resultado === 'dia-unico' ? ('DIA ' + BLG_DIAS_NOMBRE[x.dia]) : (x.resultado === 'fuera' ? 'FUERA DE LA SEMANA' : (x.resultado === 'imposible' ? 'IMPOSIBLE' : 'SIN DECIDIR'));
      agregar(x.resultado === 'imposible' ? 0 : 1, p, 'ambigua ' + hora + ' ' + x.tipo + ' clan ' + nombreClan(x.clanTag) + ' (candidatos: ' + cands + ') -> ' + que + ': ' + x.motivo);
    });
    if (resumen.conflictos.length) {
      cuenta.conflictos += resumen.conflictos.length;
      agregar(0, p, resumen.conflictos.length + ' batalla(s) con la misma clave y datos distintos en el CSV: no se cuentan (' + resumen.conflictos.join('; ') + ')');
    }
    for (var dd = 0; dd < BLG_DIAS_GUERRA; dd++) {
      if (resumen.porDia[dd].excedeTope) {
        cuenta.excedeTope++;
        agregar(0, p, BLG_DIAS_NOMBRE[dd] + ': el log suma al menos ' + resumen.porDia[dd].mazosMin + ' mazos entre todos los clanes (el tope es ' + FAME_MAZOS_POR_DIA + '): dato inconsistente');
      }
    }
  }

  lineas.sort(function (a, b) { return a.prio !== b.prio ? a.prio - b.prio : a.orden - b.orden; });
  Logger.log(etiqueta + ' Informe T' + temporadaMostrar + ' (SOLO LECTURA, no se escribio nada). CSV: ' + csv.rows.length + ' fila(s), ' +
    Object.keys(csvPorTag).length + ' Tag(s). Jugador-semana de la hoja con Tag en el CSV: ' + cuenta.pares +
    ' (comparados ' + cuenta.evaluados + ', sin batallas de guerra de esa semana en el CSV ' + cuenta.sinBatallas +
    ', sin poder ubicar el jueves ' + cuenta.sinLimites + ', con error ' + cuenta.resumenFallido + ').');
  Logger.log(etiqueta + ' Ataques por dia y clan: compatibles ' + cuenta.compatibles + '; FALTAN EN LA HOJA ' + cuenta.faltanEnHoja +
    '; sin fila en la hoja ' + cuenta.sinFilaHoja + '; log menor que la hoja (no concluyente) ' + cuenta.logMenor +
    '. Ambiguas: dia unico ' + cuenta.ambDiaUnico + ', fuera de la semana ' + cuenta.ambFuera + ', sin decidir ' + cuenta.ambSinDecidir +
    ', imposibles ' + cuenta.ambImposibles + '. Claves en conflicto: ' + cuenta.conflictos + '. Dias que pasan de ' + FAME_MAZOS_POR_DIA +
    ' mazos: ' + cuenta.excedeTope + '. Filas de la hoja en un clan sin nombre Terna conocido (no se comparan): ' + cuenta.filasClanSinTag + '.');
  Logger.log(etiqueta + ' Domingos de la hoja con AtaquesHoy en 0: calculados con la diferencia de AtaquesSemana contra el sabado del mismo clan ' + cuenta.domCalculado +
    '; no calculables (sin sabado en ese clan, sabado con AtaquesSemana incoherente o diferencia fuera de 0..' + FAME_MAZOS_POR_DIA + ', no se comparan) ' + cuenta.domNoCalculable + '.');
  Logger.log(etiqueta + ' LadoBarco en el CSV (todas las filas boatBattle, sin repetir por semana): total ' + barcosCsv + ' -> ' + JSON.stringify(ladosCsv) + '.');
  Logger.log(etiqueta + ' Barcos del log que NO se cuentan (filtro de defensas, 4-oct-2026): defensas de barco (LadoBarco defender) DENTRO de las semanas evaluadas ' + cuenta.defensasBarco +
    '; barcos sin lado conocido (filas viejas, no concluyentes) ' + cuenta.barcosSinLado + '.');
  Logger.log(etiqueta + ' Fame del dia: compatibles ' + cuenta.fb.fame.compatible + '; FALTAN EN LA HOJA ' + cuenta.fb.fame.faltanEnHoja +
    '; log menor (no concluyente) ' + cuenta.fb.fame.logMenor + '. Barcos del dia: compatibles ' + cuenta.fb.barcos.compatible +
    '; FALTAN EN LA HOJA ' + cuenta.fb.barcos.faltanEnHoja + '; log menor (no concluyente) ' + cuenta.fb.barcos.logMenor + '.');
  Logger.log(etiqueta + ' Cobertura del log en las lineas de «log menor» (ataques, fame y barcos; solo con los JSON que hoy siguen en la carpeta). TODAS son no concluyentes: cobertura completa (el log pierde batallas, ya no se llama «hoja de mas») ' + cuenta.cob.completa +
    '; en curso ' + cuenta.cob.enCurso + ', parcial ' + cuenta.cob.parcial + ', el JSON no llega ' + cuenta.cob.ninguna + ', JSON anterior al dia ' + cuenta.cob.futuro +
    ', sin JSON legible ' + cuenta.cob.sinDato + ', sin medir por tiempo ' + cuenta.cob.sinMedir + '. JSON leidos ' + cuenta.jsonLeidos + ' (con error ' + cuenta.jsonErrores + ').');
  var mostrar = Math.min(lineas.length, BLG_INFORME_MAX_LINEAS);
  for (var li = 0; li < mostrar; li++) Logger.log(etiqueta + ' ' + lineas[li].texto);
  if (lineas.length > mostrar) Logger.log(etiqueta + ' ... y ' + (lineas.length - mostrar) + ' linea(s) mas sin mostrar (primero se listan las firmes, despues las ambiguas y al final las no concluyentes).');
  if (!lineas.length) Logger.log(etiqueta + ' Sin diferencias que listar.');
}

// ----- Aplicar las correcciones desde Control_2 -----

// Corrección de registros de guerra desde RoyaleAPI, vía un userscript de [→ Contexto_Base_Web.md §18B061]
// PENDIENTE REENUMERACIÓN (punto 2): antes era `var TEMPORADA_OFFSET_ROYALEAPI = 131;` [→ Contexto_Base_Web.md §18B062]
/**
 * corregirGuerraYControlDesdeControl2() [→ Contexto_Base_Web.md §18B063]
 */
function corregirGuerraYControlDesdeControl2() {
  var ss = _getSs();

  // FIX (20-ago-2026, pedido usuario): "corregirGuerraYControlDesdeControl2() [→ Contexto_Base_Web.md §18B064]
  try {
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'CorreccionGuerra');
  } catch (eFetch) {
    Logger.log('[Corregir Guerra<-Control_2] AVISO: no se pudo refrescar el cache de clanes (' +
      eFetch.message + '). Se continúa igual -- Control/Control_2 podrían no repintarse al final.');
  }

  var shC2 = ss.getSheetByName('Control_2');
  if (!shC2) { Logger.log('[Corregir Guerra<-Control_2] ABORT: hoja Control_2 no encontrada.'); return; }

  var lastRowC2 = shC2.getLastRow();
  if (lastRowC2 < 4) {
    Logger.log('[Corregir Guerra<-Control_2] ABORT: Control_2 no tiene filas de datos (desde fila 4).');
    return;
  }

  // Misma temporada que muestra Control_2 ahora mismo — mismo mecanismo que [→ Contexto_Base_Web.md §18B065]
  var ctxReal = _getCtx();
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var mostrarVal = shExtra.getRange(2, 7).getValue(); // G2 = Mostrar
    var temporadaExtra = Number(mostrarVal);
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }

  var numFilasC2 = lastRowC2 - 3;
  var tagsC2 = shC2.getRange(4, CC2.TAG, numFilasC2, 1).getValues();
  var gridC2 = shC2.getRange(4, COL_INICIO_GRID2, numFilasC2, GRID_WIDTH2).getValues();

  // Lista de correcciones a aplicar: { tag, semana(1-based), ataques, fame, barcos }.
  var correcciones = [];
  var filasSinTag = 0, semanasVacias = 0;
  for (var i = 0; i < numFilasC2; i++) {
    var tag = String(tagsC2[i][0] || '').trim();
    if (!tag) { filasSinTag++; continue; }
    for (var sem = 0; sem < 5; sem++) {
      var ataques = gridC2[i][OFF2.ATA + sem];
      if (ataques === '' || ataques === null) { semanasVacias++; continue; } // semana futura, en blanco
      var puntaje = gridC2[i][OFF2.PUN + sem];
      var barcos  = gridC2[i][OFF2.BAR + sem];
      correcciones.push({
        tag: tag, semana: sem + 1,
        ataques: Number(ataques) || 0,
        fame: Number(puntaje) || 0,
        barcos: Number(barcos) || 0
      });
    }
  }

  if (correcciones.length === 0) {
    Logger.log('[Corregir Guerra<-Control_2] Nada que corregir (0 semanas con datos en Control_2).');
    return;
  }

  var fuente = _cargarFuenteGuerraParaTemporada(temporadaMostrar, ctxReal.temporada);
  if (!fuente) { Logger.log('[Corregir Guerra<-Control_2] ABORT: no se pudo cargar la fuente de Guerra (hoja/CSV).'); return; }

  var offsetsPorClave = _construirOffsetsPorClave(fuente.filas, temporadaMostrar);
  var stats = {};

  for (var c = 0; c < correcciones.length; c++) {
    var corr = correcciones[c];
    _aplicarCorreccionAGuerraConReparto(
      fuente, offsetsPorClave, temporadaMostrar, corr.semana, corr.tag,
      { ataquesSemana: corr.ataques, fame: corr.fame, barcos: corr.barcos },
      {}, stats
    );
  }

  _guardarFuenteGuerra(fuente);

  // Repinta Control y Control_2 ya con la fuente corregida.
  try { updateControlSheet(); } catch (eCtrl) {
    Logger.log('[Corregir Guerra<-Control_2] Corrección aplicada pero updateControlSheet() falló: ' + eCtrl.message);
  }
  try { actualizarControl2(); } catch (eCtrl2) {
    Logger.log('[Corregir Guerra<-Control_2] Corrección aplicada pero actualizarControl2() falló: ' + eCtrl2.message);
  }

  var esTemporadaActual = (fuente.tipo === 'hoja');
  Logger.log('[Corregir Guerra<-Control_2] Temporada ' + temporadaMostrar +
    (esTemporadaActual ? ' (actual, corregida en hoja Guerra + Backup_Guerra.csv).' : ' (histórica, corregida solo en Backup_Guerra.csv).') +
    ' Claves procesadas: ' + correcciones.length +
    '. Ajustadas: ' + (stats.corregidas || 0) + '. Reconstruidas desde cero: ' + (stats.reconstruidas || 0) +
    '. Sin clan (no se crearon filas): ' + (stats.sinClan || 0) +
    '. Filas de Control_2 sin Tag: ' + filasSinTag + '. Semanas en blanco omitidas: ' + semanasVacias + '.');
}

/**
 * aplicarCorreccionGuerraATemporadaSeleccionada() [→ Contexto_Base_Web.md §18B066]
 */
function aplicarCorreccionGuerraATemporadaSeleccionada() {
  var ss = _getSs();
  var ctxReal = _getCtx();
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var mostrarVal = shExtra.getRange(2, 7).getValue(); // G2 = Mostrar
    var temporadaExtra = Number(mostrarVal);
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }

  var overlay = _cargarOverlayCorreccionesGuerra();
  var claves = Object.keys(overlay).filter(function (clave) {
    return String(clave.split('|')[0]) === String(temporadaMostrar);
  });

  if (!claves.length) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] Temporada ' + temporadaMostrar +
      ': no hay correcciones en ' + CORRECCIONES_GUERRA_CSV + ' para esta temporada.');
    return;
  }

  try {
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'CorreccionGuerra'); // ver comentario equivalente en corregirGuerraYControlDesdeControl2()
  } catch (eFetch) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] AVISO: no se pudo refrescar el cache de clanes (' +
      eFetch.message + '). Se continúa igual.');
  }

  var fuente = _cargarFuenteGuerraParaTemporada(temporadaMostrar, ctxReal.temporada);
  if (!fuente) { Logger.log('[Corregir Guerra<-RoyaleAPI] ABORT: no se pudo cargar la fuente de Guerra (hoja/CSV).'); return; }

  var offsetsPorClave = _construirOffsetsPorClave(fuente.filas, temporadaMostrar);
  var stats = {};
  var temporadaRoyaleApi = _getTemporadaRoyaleApiDesdePropia(temporadaMostrar);
  // 3.3b: revisiones (Revision_Guerra.csv) y orden fijo de clanes Terna para el reparto del domingo.
  var revisionAcum = [];
  var ternaOrden = [];
  try { ternaOrden = _getNombresClanesTernaOrdenados(); } catch (eTerna) { ternaOrden = []; }
  // 3.3c-2b: nombres de los clanes Terna (una sola vez por corrida) para la rama con ClanTag.
  var nombresPorTag; // si falla, la rama los arma ella misma
  try { nombresPorTag = _mapaNombresClanTerna_(CFG.TERNA_TAGS.slice()); } catch (eNom) { nombresPorTag = undefined; }

  for (var i = 0; i < claves.length; i++) {
    var partes = claves[i].split('|');
    var semana = Number(partes[1]);
    var tag = partes[2];
    var v = overlay[claves[i]];
    _aplicarCorreccionOverlayAFuente_(
      fuente, offsetsPorClave, temporadaMostrar, semana, tag, v,
      { temporadaRoyaleApi: temporadaRoyaleApi, revision: revisionAcum, ternaOrden: ternaOrden, nombresPorTag: nombresPorTag }, stats
    );
  }

  _guardarFuenteGuerra(fuente);
  try { _registrarRevisionGuerra_(revisionAcum); } catch (eRev) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] Corrección aplicada pero no se pudo escribir ' + REVISION_GUERRA_CSV + ': ' + eRev.message);
  }

  try { updateControlSheet(); } catch (e1) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] Corrección aplicada pero updateControlSheet() falló: ' + e1.message);
  }
  try { actualizarControl2(); } catch (e2) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] Corrección aplicada pero actualizarControl2() falló: ' + e2.message);
  }

  Logger.log('[Corregir Guerra<-RoyaleAPI] Temporada ' + temporadaMostrar + ': ' + claves.length +
    ' clave(s) procesada(s). Ajustadas: ' + (stats.corregidas || 0) +
    '. Reconstruidas desde cero: ' + (stats.reconstruidas || 0) +
    '. Reparto del domingo sin ClanTag: acreditadas ' + (stats.repDomAcreditadas || 0) + ', alarmas ' + (stats.repDomAlarmas || 0) +
    ', pendientes ' + (stats.repDomPendientes || 0) + '. Con ClanTag: aplicadas ' + (stats.ccAplicadas || 0) +
    ', reconstruidas ' + (stats.ccReconstruidas || 0) + ', sin cambio ' + (stats.ccSinCambio || 0) +
    ', alarmas ' + (stats.ccAlarmas || 0) + ', revertidas ' + (stats.ccRevertidos || 0) +
    ', incompletas ' + (stats.ccIncompletos || 0) + ', clanes ajenos ignorados ' + (stats.ccIgnoradas || 0) + '.');
}

/**
 * aplicarCorreccionGuerraATodasLasTemporadas() [→ Contexto_Base_Web.md §18B067]
 * §PF358 (4-nov-2026): corre como cadena por tandas (id CORRGUERRA, motor _ejecutarPorTandas()). La versión anterior recorría todas las temporadas en una sola ejecución y la
 * plataforma la cortaba a los 6 minutos (T22, 4-nov-2026), sin repintar Control ni Control_2. Ahora cada tanda aplica las correcciones hasta agotar su presupuesto
 * (CFG.CORRGUERRA_PRESUPUESTO_MS), guarda lo hecho, anota el avance y programa sola la continuación; no hace falta volver a correr nada. Si la cancelas con cancelarEjecucion() o corres
 * esta función otra vez, empieza de cero (es seguro: lo ya aplicado no cambia). El detalle del avance sale en el registro.
 */
function aplicarCorreccionGuerraATodasLasTemporadas() {
  if (!_adquirirLockEjecucion('aplicarCorreccionGuerraATodasLasTemporadas')) return;
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('CORRGUERRA_ESTADO');
  props.setProperty('CORRGUERRA_PASO', '0');
  _continuarAplicarCorreccionGuerraATodas();
}

/**
 * _continuarAplicarCorreccionGuerraATodas() - punto de entrada de aplicarCorreccionGuerraATodasLasTemporadas() y del activador de continuación (§PF358). [→ Contexto_Base_Web.md §PF358]
 * Cuando la cadena termina escribe el resumen de todas las temporadas, borra el estado guardado y libera el candado.
 */
function _continuarAplicarCorreccionGuerraATodas() {
  var props = PropertiesService.getScriptProperties();
  var paso = parseInt(props.getProperty('CORRGUERRA_PASO') || '0', 10);
  Logger.log(paso === 0 ? '=== Corrección de Guerra (todas las temporadas) INICIO ===' : '=== Corrección de Guerra (todas las temporadas) CONTINÚA desde el paso ' + (paso + 1) + '/' + PASOS_CORRGUERRA.length + ' ===');
  try {
    var completo = _ejecutarPorTandas('CORRGUERRA', PASOS_CORRGUERRA, CFG.CORRGUERRA_PRESUPUESTO_MS, '_continuarAplicarCorreccionGuerraATodas', NOMBRES_PASOS_CORRGUERRA);
    if (completo) {
      _cgwResumenCorrGuerra_(props);
      props.deleteProperty('CORRGUERRA_ESTADO');
      _liberarLockEjecucion();
      Logger.log('=== Corrección de Guerra (todas las temporadas) FIN ===');
    }
    // Si no está completo, el candado NO se libera: _ejecutarPorTandas ya refrescó su marca y programó la continuación.
  } catch (e) {
    props.deleteProperty('CORRGUERRA_PASO');
    props.deleteProperty('CORRGUERRA_ESTADO');
    _borrarTriggersDeContinuacion('_continuarAplicarCorreccionGuerraATodas');
    _liberarLockEjecucion();
    Logger.log('[Corregir Guerra<-RoyaleAPI] ERROR: ' + e.message + ' — candado liberado. Lo ya guardado queda; vuelve a correr la función para retomar desde cero.');
    throw e;
  }
}

/**
 * limpiarCorreccionesGuerraAprobadasImplementadas() [→ Contexto_Base_Web.md §18B068]
 */
function limpiarCorreccionesGuerraAprobadasImplementadas() {
  // §PF164: con el formato ancho hay UNA fila por jugador y semana (clanes y perfil juntos), así que se borra el jugador-semana
  // completo, y solo si TODAS sus entradas están aprobadas e implementadas (Sí y Sí). Hoy Aprobación está vacía en todas las filas
  // y esta función no borra nada. La regla que quiere la usuaria para borrar («solo si se cumplen los acumulados de cada clan y
  // del perfil») sigue sin definirse. [→ Contexto_Base_Web.md §PF164]
  var mapa = _cargarOverlayCorreccionesGuerraPorClan();
  var claves = Object.keys(mapa);
  if (!claves.length) {
    Logger.log('[CorreccionGuerra] Nada que limpiar — ' + CORRECCIONES_GUERRA_CSV + ' no existe todavía o está vacío.');
    return;
  }

  var grupos = {};
  for (var i = 0; i < claves.length; i++) {
    var p = claves[i].split('|'); // temporada | semana | clantag | tag
    var g = p[0] + '|' + p[1] + '|' + p[3];
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(claves[i]);
  }
  var borradas = 0, semanasBorradas = 0;
  Object.keys(grupos).forEach(function (g) {
    var ks = grupos[g];
    var todas = ks.every(function (k) { return mapa[k].aprobacion === 'Sí' && mapa[k].implementacion === 'Sí'; });
    if (!todas) return;
    ks.forEach(function (k) { delete mapa[k]; borradas++; });
    semanasBorradas++;
  });

  if (borradas > 0) _guardarOverlayCorreccionesGuerra(mapa);
  Logger.log('[CorreccionGuerra] Limpieza manual: ' + semanasBorradas + ' jugador-semana(s) borrada(s) (' + borradas +
    ' entrada(s) con Aprobación=Sí + Implementación=Sí). Quedan ' + Object.keys(mapa).length + ' entrada(s) en el CSV.');
}

/**
 * agregarIdCorreccionesGuerraCSV()  (§PF238; §PF242 añade las columnas de temporada RoyaleAPI y Supercell; se corre a mano desde el editor)
 * Vuelve a escribir Correcciones_Guerra.csv tal como está para que las columnas calculadas (ID y temporadas) aparezcan en todas las filas sin esperar a la
 * próxima corrección. No cambia ningún dato: lee y escribe con las mismas funciones de siempre. Usa el mismo candado que las correcciones.
 */
function agregarIdCorreccionesGuerraCSV() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[CorreccionGuerra] Ocupado guardando otra corrección; intenta de nuevo en unos segundos.'); return; }
  try {
    var mapa = _cargarOverlayCorreccionesGuerraPorClan();
    var n = Object.keys(mapa).length;
    if (!n) { Logger.log('[CorreccionGuerra] ' + CORRECCIONES_GUERRA_CSV + ' no existe o está vacío: nada que hacer.'); return; }
    _guardarOverlayCorreccionesGuerra(mapa);
    Logger.log('[CorreccionGuerra] Columnas calculadas (ID y temporadas RoyaleAPI y Supercell) agregadas a ' + CORRECCIONES_GUERRA_CSV + ' (' + n + ' entradas reescritas sin cambiar datos).');
  } finally {
    lock.releaseLock();
  }
}

// ----- Auditorías de la guerra reconstruida -----

/**
 * auditarPisoBarcosAtaques() [→ Contexto_Base_Web.md §18B081]
 */
function auditarPisoBarcosAtaques() {
  var ctxReal = _getCtx();
  var stats = { revisadas: 0, violaciones: 0, corregidas: 0 };

  // --- Hoja Guerra (solo puede tener la temporada vigente) ---
  var fuenteHoja = _cargarFuenteGuerraParaTemporada(ctxReal.temporada, ctxReal.temporada);
  if (fuenteHoja) {
    _auditarPisoEnFuente(fuenteHoja, ctxReal.temporada, stats);
    _guardarFuenteGuerra(fuenteHoja);
  }

  // --- Backup_Guerra.csv (histórico completo, todas las temporadas) ---
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (csvText) {
    var parsed = _parseCSV(csvText);
    if (parsed && parsed.length > 1) {
      var encabezadoCsv = parsed[0];
      var filasCsv = [];
      for (var i = 1; i < parsed.length; i++) {
        var f = parsed[i].slice(0, GUERRA_TOTAL_COLS);
        while (f.length < GUERRA_TOTAL_COLS) f.push('');
        filasCsv.push(f);
      }
      var temporadasCsv = {};
      for (var r = 0; r < filasCsv.length; r++) {
        var t = String(filasCsv[r][GC.TEMPORADA - 1] || '');
        if (t) temporadasCsv[t] = true;
      }
      var fuenteCsv = { tipo: 'csv', encabezadoCsv: encabezadoCsv, filas: filasCsv };
      var temporadas = Object.keys(temporadasCsv);
      for (var tt = 0; tt < temporadas.length; tt++) {
        _auditarPisoEnFuente(fuenteCsv, temporadas[tt], stats);
      }
      _guardarFuenteGuerra(fuenteCsv);
    }
  }

  Logger.log('[Auditoría Barcos->Ataques] Filas-día revisadas: ' + stats.revisadas +
    '. Violaciones encontradas (AtaquesHoy < pisoBarcos): ' + stats.violaciones +
    '. Corregidas: ' + stats.corregidas + '.');
}

/**
 * _auditarReconstruccionesGuerraSospechosas() [→ Contexto_Base_Web.md §18B088]
 */
function _auditarReconstruccionesGuerraSospechosas() {
  var resultado = { revisadas: 0, sospechosas: [], sinDatosParaVerificar: [] };

  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) {
    Logger.log('[Auditoría Reconstrucciones] No se encontró Backup_Guerra.csv.');
    return resultado;
  }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) {
    Logger.log('[Auditoría Reconstrucciones] Backup_Guerra.csv vacío o sin filas de datos.');
    return resultado;
  }

  var ventanasPorTag = _construirVentanasMembresiaTernaPorTag();
  var tz = Session.getScriptTimeZone() || 'America/Lima';

  // Agrupar filas Reconstruido por Temporada|Semana|Tag (mismo criterio que
  // el resto del archivo).
  var grupos = {};
  var ordenClaves = [];
  for (var i = 1; i < parsed.length; i++) {
    var f = parsed[i];
    if (!_origenGuerraEs_(f[GC.ORIGEN - 1], 'Reconstruido')) continue;

    var temporada = String(f[GC.TEMPORADA - 1] || '').trim();
    var semana    = String(f[GC.SEMANA - 1]    || '').trim();
    var tag       = String(f[GC.TAG - 1]       || '').trim();
    if (!temporada || !semana || !tag) continue;

    var clave = temporada + '|' + semana + '|' + tag;
    if (!grupos[clave]) { grupos[clave] = []; ordenClaves.push(clave); }
    grupos[clave].push(f);
  }

  for (var g = 0; g < ordenClaves.length; g++) {
    var grupo = grupos[ordenClaves[g]];
    resultado.revisadas++;

    // Fecha representativa de la semana: la del PeriodIndex más alto del
    // grupo (mismo criterio de "cierre de semana" que generarBackupGuerraSemanalCSV()).
    var filaRef = grupo[0];
    var pIdxMax = Number(filaRef[GC.PERIOD_IDX - 1]) || 0;
    for (var k = 1; k < grupo.length; k++) {
      var pIdx = Number(grupo[k][GC.PERIOD_IDX - 1]) || 0;
      if (pIdx > pIdxMax) { pIdxMax = pIdx; filaRef = grupo[k]; }
    }
    var fechaRef = filaRef[GC.FECHA - 1];
    if (!(fechaRef instanceof Date)) fechaRef = new Date(fechaRef);

    var sumaAtaques = 0, maxFame = 0, maxBarcos = 0;
    for (var kk = 0; kk < grupo.length; kk++) {
      sumaAtaques += Number(grupo[kk][GC.ATAQUES_HOY - 1]) || 0;
      maxFame = Math.max(maxFame, Number(grupo[kk][GC.FAME - 1]) || 0);
      maxBarcos = Math.max(maxBarcos, Number(grupo[kk][GC.BARCOS - 1]) || 0);
    }

    var tagGrupo = String(filaRef[GC.TAG - 1] || '').trim();
    var verificacion = _tagEstuvoEnTernaEnFecha(tagGrupo, fechaRef, ventanasPorTag);

    var entrada = {
      tag: tagGrupo,
      nombre: String(filaRef[GC.NOMBRE - 1] || ''),
      temporada: filaRef[GC.TEMPORADA - 1],
      semana: filaRef[GC.SEMANA - 1],
      fecha: (fechaRef instanceof Date && !isNaN(fechaRef.getTime()))
        ? Utilities.formatDate(fechaRef, tz, 'dd/MM/yyyy') : '',
      clanEnFila: String(filaRef[GC.CLAN - 1] || ''),
      ataques: sumaAtaques,
      fame: maxFame,
      barcos: maxBarcos
    };

    if (verificacion === false) {
      resultado.sospechosas.push(entrada);
      Logger.log('[Auditoría Reconstrucciones] SOSPECHOSA: Tag=' + entrada.tag +
        ' (' + entrada.nombre + ') Temporada=' + entrada.temporada + ' Semana=' + entrada.semana +
        ' Fecha=' + entrada.fecha + ' ClanEnFila=' + entrada.clanEnFila +
        ' Ataques=' + entrada.ataques + ' Fame=' + entrada.fame + ' Barcos=' + entrada.barcos +
        ' — Historial_I/S confirma que este Tag NO estuvo en ningún clan Terna esa fecha.');
    } else if (verificacion === null) {
      resultado.sinDatosParaVerificar.push(entrada);
    }
  }

  Logger.log('[Auditoría Reconstrucciones] Semanas Reconstruido revisadas: ' + resultado.revisadas +
    '. Sospechosas (confirmadas fuera de Terna por Historial_I/S): ' + resultado.sospechosas.length +
    '. Sin datos en Historial_I/S para verificar: ' + resultado.sinDatosParaVerificar.length + '.');

  return resultado;
}

/**
 * _eliminarFilasReconstruidasDeCSV() [→ Contexto_Base_Web.md §18B089]
 */
function _eliminarFilasReconstruidasDeCSV() {
  var resultado = { eliminadas: 0, restantes: 0 };

  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) {
    Logger.log('[Eliminar Reconstruidas] No se encontró Backup_Guerra.csv.');
    return resultado;
  }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) {
    Logger.log('[Eliminar Reconstruidas] Backup_Guerra.csv vacío o sin filas de datos.');
    return resultado;
  }

  var headers = parsed[0];
  var filasFiltradas = [headers];

  for (var i = 1; i < parsed.length; i++) {
    var f = parsed[i];
    if (_origenGuerraEs_(f[GC.ORIGEN - 1], 'Reconstruido')) {
      resultado.eliminadas++;
      continue; // se descarta, no pasa al CSV nuevo
    }
    filasFiltradas.push(f);
  }

  resultado.restantes = filasFiltradas.length - 1; // sin contar headers

  if (resultado.eliminadas === 0) {
    Logger.log('[Eliminar Reconstruidas] No había filas Origen=\'Reconstruido\' en el CSV. Nada que hacer.');
    return resultado;
  }

  _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV(filasFiltradas));

  Logger.log('[Eliminar Reconstruidas] Filas eliminadas: ' + resultado.eliminadas +
    '. Filas restantes en Backup_Guerra.csv: ' + resultado.restantes + '.');

  return resultado;
}

// ----- Completar el domingo y reparar la semana desde el JSON de RoyaleAPI -----

function completarDomingoDesdeJsonRoyaleApiInforme() { _completarDomingoDesdeJsonRoyaleApi_(false); }

function completarDomingoDesdeJsonRoyaleApiAplicar() { _completarDomingoDesdeJsonRoyaleApi_(true); }

function repararSemanaDesdeJsonRoyaleApiInforme() { _repararSemanaDesdeJsonRoyaleApi_(false); }

function repararSemanaDesdeJsonRoyaleApiAplicar() { _repararSemanaDesdeJsonRoyaleApi_(true); }

// ----- Comparar Correcciones_Nuevos.csv con Correcciones_Guerra.csv (§PF329) -----

/**
 * Se corre a mano. Compara, por jugador, temporada de RoyaleAPI y semana, lo que guarda Correcciones_Nuevos.csv con lo que guarda Correcciones_Guerra.csv
 * para el mismo clan, y anota en Revision_Guerra.csv (Tipo «Contradicción», Estado «Pendiente») lo que no coincide. No cambia ninguno de los dos archivos
 * de correcciones. Detalle en _cnvCompararNuevosConGuerra_().
 */
function compararNuevosConGuerraInforme() {
  var textoNuevos = _loadCSVFromDrive(NOMBRE_CSV_DEBUG_NUEVOS);
  var textoGuerra = _loadCSVFromDrive(CORRECCIONES_GUERRA_CSV);
  if (!textoNuevos || !textoGuerra) {
    Logger.log('[Nuevos contra Guerra] No se puede comparar: ' + (!textoNuevos ? NOMBRE_CSV_DEBUG_NUEVOS : CORRECCIONES_GUERRA_CSV) + ' no existe o está vacío.');
    return;
  }
  var nombresPorTag = {};
  try { nombresPorTag = _mapaNombresClanTerna_(CFG.TERNA_TAGS); } catch (eNom) { nombresPorTag = {}; }
  var r = _cnvCompararNuevosConGuerra_(textoNuevos, textoGuerra, nombresPorTag, 300);
  if (r.error) { Logger.log('[Nuevos contra Guerra] ' + r.error); return; }
  var st = r.stats;
  Logger.log('[Nuevos contra Guerra] Filas de ' + NOMBRE_CSV_DEBUG_NUEVOS + ': ' + st.filasNuevos + '. Sin clan de Terna identificable: ' + st.sinClan +
    '. Sin fila de ese jugador y semana en ' + CORRECCIONES_GUERRA_CSV + ': ' + st.sinFilaGuerra + '. Sin valores de ese clan allí: ' + st.sinDatoDelClan +
    '. Comparadas: ' + st.comparadas + ' (iguales ' + st.iguales + ', distintas ' + st.diferentes + ').');
  if (st.diferentes > r.entradas.length) Logger.log('[Nuevos contra Guerra] Hay ' + st.diferentes + ' diferencias; esta corrida solo anota las primeras ' + r.entradas.length + '. Vuelve a correrla cuando se resuelvan.');
  if (!r.entradas.length) return;
  var reg = _registrarRevisionGuerra_(r.entradas);
  Logger.log('[Nuevos contra Guerra] Revision_Guerra.csv: ' + reg.nuevas + ' nueva(s), ' + reg.actualizadas + ' actualizada(s), ' + reg.sinCambio + ' sin cambio.');
}

// ----- Cerrar las contradicciones de clan terminado de Revision_Guerra.csv (§PF357) -----

/**
 * cerrarContradiccionesClanTerminado() [→ Contexto_Base_Web.md §PF357]
 * Se corre a mano, una sola vez. Pasa a «Resuelto» las filas de Revision_Guerra.csv (Tipo «Contradicción», Estado «Pendiente») de las semanas de
 * CGW_CONTRADICCIONES_CERRAR_PF357 (T7 S1 y T19 S1), que la usuaria resolvió el 5-nov-2026 con la regla del clan terminado. Las busca por temporada, semana y tag
 * (no por el N°, que cambia al reescribirse el archivo). Antes de cambiar una fila comprueba que el valor de «ahora» en el Detalle sea el esperado y que
 * _cgwRepartoClanTerminado_() siga dando un reparto con el domingo sin fame; si no, la deja como está y lo avisa. No borra filas, no cambia el N° ni la fecha, y agrega
 * al Detalle la fecha, el k y el reparto por día. «Resuelto» no lo toca aplicarDecisionesRevisionGuerra().
 */
function cerrarContradiccionesClanTerminado() {
  if (_bloquearSiReenumerando_('cerrarContradiccionesClanTerminado')) return;
  var etq = '[Contradicciones clan terminado]';
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log(etq + ' No se pudo obtener el lock: hay otra escritura en curso. Vuelve a correr la función en unos minutos.');
    return;
  }
  try {
    var texto = _loadCSVFromDrive(REVISION_GUERRA_CSV);
    var parsed = texto ? _parseCSV(texto) : [];
    if (!parsed || parsed.length < 2) { Logger.log(etq + ' ' + REVISION_GUERRA_CSV + ' no existe o no tiene filas: no hay nada que cerrar.'); return; }
    var ncol = REVISION_GUERRA_ENCABEZADO.length, filas = [];
    for (var i = 1; i < parsed.length; i++) {
      var f = parsed[i].slice(0, ncol);
      while (f.length < ncol) f.push('');
      filas.push(f);
    }
    var hoy = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd');
    var cerradas = 0;
    CGW_CONTRADICCIONES_CERRAR_PF357.forEach(function (c) {
      var nombre = 'T' + c.temporada + ' S' + c.semana + ' ' + c.tag;
      var halladas = 0, yaResueltas = 0, hecha = false;
      for (var r = 0; r < filas.length; r++) {
        var fila = filas[r];
        if (String(fila[2]).trim() !== String(c.temporada) || String(fila[3]).trim() !== String(c.semana) || String(fila[4]).trim() !== c.tag) continue;
        if (String(fila[6]).trim() !== CGW_CONTRADICCION_TIPO) continue;
        halladas++;
        var estado = String(fila[9]).trim().toLowerCase();
        if (estado === 'resuelto') { yaResueltas++; continue; }
        if (estado !== 'pendiente') { Logger.log(etq + ' ' + nombre + ': la fila N° ' + fila[0] + ' tiene el Estado «' + fila[9] + '»; no se toca.'); continue; }
        var m = /ahora (\d+) ataques \/ (\d+) fame \/ (\d+) barcos/.exec(String(fila[8]));
        if (!m) { Logger.log(etq + ' ' + nombre + ': la fila N° ' + fila[0] + ' no trae «ahora … ataques / … fame / … barcos» en el Detalle; no se toca.'); continue; }
        if (Number(m[1]) !== c.ataques || Number(m[2]) !== c.fame || Number(m[3]) !== c.barcos) {
          Logger.log(etq + ' ' + nombre + ': la fila N° ' + fila[0] + ' trae ' + _cgwTextoValores_(Number(m[1]), Number(m[2]), Number(m[3])) + ' y se esperaba ' + _cgwTextoValores_(c.ataques, c.fame, c.barcos) + '; el valor cambió desde la decisión, no se toca.');
          continue;
        }
        var rep = _cgwRepartoClanTerminado_(c.ataques, c.fame, c.barcos, null);
        if (!rep || !(rep.k > 0)) { Logger.log(etq + ' ' + nombre + ': la fila N° ' + fila[0] + ' ya no cuadra con el domingo sin fame (reparto: ' + (rep ? 'k = ' + rep.k : 'ninguno') + '); no se toca.'); continue; }
        fila[8] = String(fila[8]) + ' | Resuelto el ' + hoy + ': cuadra con el domingo sin fame, k = ' + rep.k + ' (§PF357). Reparto: ' + _cgwTextoReparto_(rep);
        fila[9] = 'Resuelto';
        cerradas++; hecha = true;
        Logger.log(etq + ' ' + nombre + ': fila N° ' + fila[0] + ' pasa a «Resuelto» (k = ' + rep.k + '). Reparto: ' + _cgwTextoReparto_(rep) + '.');
      }
      if (!halladas) Logger.log(etq + ' ' + nombre + ': no hay fila de Contradicción en ' + REVISION_GUERRA_CSV + ' (¿ya se borró?).');
      else if (!hecha && yaResueltas === halladas) Logger.log(etq + ' ' + nombre + ': ya estaba «Resuelto».');
    });
    if (!cerradas) { Logger.log(etq + ' No se cambió ninguna fila; ' + REVISION_GUERRA_CSV + ' queda como estaba.'); return; }
    _saveCSVToDrive(REVISION_GUERRA_CSV, _encodeCSV([REVISION_GUERRA_ENCABEZADO].concat(filas)));
    Logger.log(etq + ' Listo: ' + cerradas + ' fila(s) pasaron a «Resuelto» en ' + REVISION_GUERRA_CSV + '.');
  } catch (e) {
    Logger.log(etq + ' Error: ' + (e.message || e) + '. ' + REVISION_GUERRA_CSV + ' no se modificó; vuelve a correr la función.');
  } finally {
    lock.releaseLock();
  }
}

// ===== PARTE 2 — Funciones que no se corren a mano =====

// ----- Fame: combinaciones posibles por día -----

/**
 * _fameDescomposicionesDia_(n, b) [→ Contexto_Base_Web.md §18B004]
 */
function _fameDescomposicionesDia_(n, b) {
  var salida = [];
  if (typeof n !== 'number' || typeof b !== 'number' || n % 1 !== 0 || b % 1 !== 0) return salida;
  if (n < 0 || n > FAME_MAZOS_POR_DIA || b < 0 || b > n) return salida;

  // Opciones de duelo: ninguno, o uno de los resultados que quepa en los mazos que quedan.
  var opcionesDuelo = [{ etiqueta: null, mazos: 0, fame: 0 }];
  for (var d = 0; d < FAME_DUELO_RESULTADOS.length; d++) {
    if (b + FAME_DUELO_RESULTADOS[d].mazos <= n) opcionesDuelo.push(FAME_DUELO_RESULTADOS[d]);
  }

  for (var o = 0; o < opcionesDuelo.length; o++) {
    var duelo = opcionesDuelo[o];
    var pvp = n - b - duelo.mazos; // el resto de los mazos son batallas PvP normales
    for (var bg = 0; bg <= b; bg++) {
      for (var pg = 0; pg <= pvp; pg++) {
        salida.push({
          fame: bg * FAME_BARCO_GANA + (b - bg) * FAME_BARCO_PIERDE +
                pg * FAME_PVP_GANA + (pvp - pg) * FAME_PVP_PIERDE + duelo.fame,
          barcosGanados: bg, barcosPerdidos: b - bg,
          pvpGanados: pg, pvpPerdidos: pvp - pg,
          duelo: duelo.etiqueta
        });
      }
    }
  }
  return salida;
}

/**
 * _fameTablaDia_(n, b) [→ Contexto_Base_Web.md §18B005]
 */
function _fameTablaDia_(n, b) {
  var desc = _fameDescomposicionesDia_(n, b);
  var vistos = {};
  var lista = [];
  for (var i = 0; i < desc.length; i++) {
    if (!vistos[desc[i].fame]) { vistos[desc[i].fame] = true; lista.push(desc[i].fame); }
  }
  lista.sort(function (x, y) { return x - y; });
  return lista;
}

/**
 * _fameEsPosibleDia_(n, fame, b) [→ Contexto_Base_Web.md §18B006]
 */
function _fameEsPosibleDia_(n, fame, b) {
  if (typeof fame !== 'number' || isNaN(fame)) return false;
  return _fameTablaDia_(n, b).indexOf(fame) >= 0;
}

/**
 * _fameNPosiblesPorFame_(fame, b) [→ Contexto_Base_Web.md §18B007]
 */
function _fameNPosiblesPorFame_(fame, b) {
  var ns = [];
  if (typeof b !== 'number' || b % 1 !== 0 || b < 0) return ns;
  for (var n = b; n <= FAME_MAZOS_POR_DIA; n++) {
    if (_fameEsPosibleDia_(n, fame, b)) ns.push(n);
  }
  return ns;
}

/**
 * _fameDescomposicionesDeCifra_(n, fame, b) [→ Contexto_Base_Web.md §18B008]
 */
function _fameDescomposicionesDeCifra_(n, fame, b) {
  return _fameDescomposicionesDia_(n, b).filter(function (d) { return d.fame === fame; });
}

/**
 * _fameCatalogoDia_() [→ Contexto_Base_Web.md §PF122]
 * Todos los estados posibles de UN dia: lista de { n: ataques, b: barcos, f: medallas } sin repetir,
 * sacada de _fameDescomposicionesDia_() (77 estados). Se calcula una sola vez por ejecucion.
 */
function _fameCatalogoDia_() {
  if (_FAME_CATALOGO_DIA_CACHE_) return _FAME_CATALOGO_DIA_CACHE_;
  var vistos = {};
  var lista = [];
  for (var n = 0; n <= FAME_MAZOS_POR_DIA; n++) {
    for (var b = 0; b <= n; b++) {
      var desc = _fameDescomposicionesDia_(n, b);
      for (var i = 0; i < desc.length; i++) {
        var clave = n + ',' + b + ',' + desc[i].fame;
        if (!vistos[clave]) { vistos[clave] = true; lista.push({ n: n, b: b, f: desc[i].fame }); }
      }
    }
  }
  _FAME_CATALOGO_DIA_CACHE_ = lista;
  return lista;
}

/**
 * _cgwMitadesSemana_() [→ Contexto_Base_Web.md §PF313]
 * Todas las sumas posibles de DOS días de guerra, sacadas de _fameCatalogoDia_(): { conBarcos: {'n|b|f': true}, sinBarcos: {'n|f': true}, lista: [{n,b,f}] }.
 * La semana tiene 4 días (BLG_DIAS_GUERRA), así que una semana posible es la suma de dos mitades. Se calcula una sola vez por ejecución.
 */
function _cgwMitadesSemana_() {
  if (_CGW_MITADES_SEMANA_CACHE_) return _CGW_MITADES_SEMANA_CACHE_;
  var cat = _fameCatalogoDia_();
  var conBarcos = {}, sinBarcos = {}, lista = [];
  for (var i = 0; i < cat.length; i++) {
    for (var j = i; j < cat.length; j++) {
      var n = cat[i].n + cat[j].n, b = cat[i].b + cat[j].b, f = cat[i].f + cat[j].f;
      var kb = n + '|' + b + '|' + f;
      if (!conBarcos[kb]) { conBarcos[kb] = true; lista.push({ n: n, b: b, f: f }); }
      sinBarcos[n + '|' + f] = true;
    }
  }
  _CGW_MITADES_SEMANA_CACHE_ = { conBarcos: conBarcos, sinBarcos: sinBarcos, lista: lista };
  return _CGW_MITADES_SEMANA_CACHE_;
}

/**
 * _cgwSemanaEsPosible_(ataques, fame, barcos, memo) [→ Contexto_Base_Web.md §PF313]
 * §PF253 punto 2: «una terna posible» = una combinación posible de ataques, fame y barcos. Devuelve true si existen 4 días de guerra del catálogo
 * (_fameCatalogoDia_()) cuya suma sea exactamente esa semana. barcos null/undefined = «sin dato»: se comprueba solo ataques y fame.
 * Cubre la semana de UN clan o de un jugador en varios (las sumas más chicas también caben: hay días con 0 ataques). memo (opcional): objeto para no repetir cálculos.
 * No conoce la regla del clan terminado (ataques del domingo sin fame, §PF183): eso lo prueba _cgwSemanaPosibleClanTerminado_() (§PF357), que usa esta función.
 */
function _cgwSemanaEsPosible_(ataques, fame, barcos, memo) {
  if (typeof ataques !== 'number' || typeof fame !== 'number' || isNaN(ataques) || isNaN(fame)) return false;
  if (ataques % 1 !== 0 || fame % 1 !== 0 || ataques < 0 || fame < 0) return false;
  if (ataques > BLG_DIAS_GUERRA * FAME_MAZOS_POR_DIA) return false;
  var hayBarcos = (typeof barcos === 'number' && !isNaN(barcos));
  if (hayBarcos && (barcos % 1 !== 0 || barcos < 0 || barcos > ataques)) return false;
  var clave = ataques + '|' + (hayBarcos ? barcos : 'x') + '|' + fame;
  if (memo && memo[clave] !== undefined) return memo[clave];
  var m = _cgwMitadesSemana_();
  var ok = false;
  for (var i = 0; i < m.lista.length && !ok; i++) {
    var x = m.lista[i];
    var n2 = ataques - x.n, f2 = fame - x.f;
    if (n2 < 0 || f2 < 0) continue;
    ok = hayBarcos ? !!m.conBarcos[n2 + '|' + (barcos - x.b) + '|' + f2] : !!m.sinBarcos[n2 + '|' + f2];
  }
  if (memo) memo[clave] = ok;
  return ok;
}

/**
 * _cgwSemanaEsPosibleTresDias_(ataques, fame, barcos) [→ Contexto_Base_Web.md §PF357]
 * Como _cgwSemanaEsPosible_ pero con TRES días de guerra (jueves, viernes y sábado): un día del catálogo (_fameCatalogoDia_) más una suma de dos días (_cgwMitadesSemana_).
 * Sirve para la semana de un clan que cruzó la meta al empezar el domingo, cuando el domingo no dio fame. barcos null/undefined = «sin dato».
 */
function _cgwSemanaEsPosibleTresDias_(ataques, fame, barcos) {
  if (typeof ataques !== 'number' || typeof fame !== 'number' || isNaN(ataques) || isNaN(fame)) return false;
  if (ataques % 1 !== 0 || fame % 1 !== 0 || ataques < 0 || fame < 0) return false;
  var hayBarcos = (typeof barcos === 'number' && !isNaN(barcos));
  var m = _cgwMitadesSemana_(), cat = _fameCatalogoDia_();
  for (var i = 0; i < cat.length; i++) {
    var d = cat[i], n2 = ataques - d.n, f2 = fame - d.f;
    if (n2 < 0 || f2 < 0) continue;
    if (hayBarcos) { if (barcos - d.b >= 0 && m.conBarcos[n2 + '|' + (barcos - d.b) + '|' + f2]) return true; }
    else if (m.sinBarcos[n2 + '|' + f2]) return true;
  }
  return false;
}

/**
 * _cgwSemanaPosibleClanTerminado_(ataques, fame, barcos, memo) [→ Contexto_Base_Web.md §PF357]
 * §PF357 (reglas de la usuaria, 4-nov-2026; §PF183): el clan cruza la meta en el cambio de periodIndex hacia el domingo, así que en el domingo cuentan todos los ataques con fame
 * o ninguno. Primero prueba la semana tal cual (k = 0, _cgwSemanaEsPosible_, cuatro días). Si no cabe, prueba k = 1 a 4 ataques en el domingo, TODOS sin fame (CGW_MAX_ATAQUES_SIN_FAME), y los
 * (ataques - k) restantes deben cuadrar con la tabla en jueves, viernes y sábado (_cgwSemanaEsPosibleTresDias_). Los k ataques pueden ser de PvP, de duelo o de barco (no se ha descartado
 * que se pueda atacar barcos con el clan ya terminado), así que los barcos que dieron fame pueden ser desde (barcos - k) hasta barcos. Sin dato de barcos solo se comprueban ataques y fame.
 * Devuelve el menor k que cuadra (0 = cabe sin suponer nada) o -1 si no cabe de ninguna forma. No comprueba que el clan haya terminado (eso es _cgwClanTerminadoVerificado_).
 */
function _cgwSemanaPosibleClanTerminado_(ataques, fame, barcos, memo) {
  if (typeof ataques !== 'number' || typeof fame !== 'number' || isNaN(ataques) || isNaN(fame)) return -1;
  if (ataques % 1 !== 0 || ataques < 0 || ataques > BLG_DIAS_GUERRA * FAME_MAZOS_POR_DIA) return -1;
  var hayBarcos = (typeof barcos === 'number' && !isNaN(barcos));
  var clave = 'T|' + ataques + '|' + (hayBarcos ? barcos : 'x') + '|' + fame;
  if (memo && memo[clave] !== undefined) return memo[clave];
  var res = -1;
  if (_cgwSemanaEsPosible_(ataques, fame, hayBarcos ? barcos : null, null)) res = 0;
  for (var k = 1; k <= CGW_MAX_ATAQUES_SIN_FAME && k <= ataques && res < 0; k++) {
    if (!hayBarcos) {
      if (_cgwSemanaEsPosibleTresDias_(ataques - k, fame, null)) res = k;
    } else {
      for (var b2 = Math.max(0, barcos - k); b2 <= barcos && res < 0; b2++) {
        if (_cgwSemanaEsPosibleTresDias_(ataques - k, fame, b2)) res = k;
      }
    }
  }
  if (memo) memo[clave] = res;
  return res;
}

/**
 * _cgwTextoDiaDescomposicion_(d) / _cgwDescripcionDia_(n, b, f) [→ Contexto_Base_Web.md §PF357]
 * De las descomposiciones de un día (_fameDescomposicionesDia_) con esos ataques, barcos y fame, elige la de menos barcos ganados (regla de la usuaria: si hay dos casos posibles,
 * se prefiere que el barco se haya perdido) y devuelve { barcosGanados, texto }.
 */
function _cgwDescripcionDia_(n, b, f) {
  var desc = _fameDescomposicionesDia_(n, b).filter(function (d) { return d.fame === f; });
  var mejor = null;
  for (var i = 0; i < desc.length; i++) if (!mejor || desc[i].barcosGanados < mejor.barcosGanados) mejor = desc[i];
  if (!mejor) return { barcosGanados: 0, texto: '' };
  var partes = [];
  if (mejor.duelo) partes.push('duelo ' + mejor.duelo);
  if (mejor.barcosGanados) partes.push(mejor.barcosGanados + ' barco(s) ganado(s)');
  if (mejor.barcosPerdidos) partes.push(mejor.barcosPerdidos + ' barco(s) perdido(s)');
  if (mejor.pvpGanados) partes.push(mejor.pvpGanados + ' PvP ganado(s)');
  if (mejor.pvpPerdidos) partes.push(mejor.pvpPerdidos + ' PvP perdido(s)');
  return { barcosGanados: mejor.barcosGanados, texto: partes.join(', ') };
}

/**
 * _cgwRepartoClanTerminado_(ataques, fame, barcos, memo) [→ Contexto_Base_Web.md §PF357]
 * Reparto por día de una semana que solo cuadra con el domingo sin fame (k de 1 a 4; si cabe sin suponer nada devuelve { k: 0 } sin reparto; si no cabe, null).
 * Reglas de la usuaria (4-nov-2026): (1) el domingo cuentan todos los ataques o ninguno: los k ataques del domingo dan 0 de fame y jueves, viernes y sábado cuadran con la tabla
 * (_fameCatalogoDia_). Primero se descarta todo lo que no cuadra y, entre las combinaciones semanales que SÍ quedan posibles, se aplica la regla de la usuaria (5-nov-2026):
 * (2) **si aún quedan dos casos posibles se prefiere que el barco se haya perdido** (usualmente se necesitan varios ataques de barco para derrotar las defensas). Esa regla NO va primera:
 * solo desempata lo que los criterios anteriores no resolvieron. Orden (los criterios a y b son de Claude, por confirmar): a) el menor k (más ataques con fame), b) menos barcos con el domingo
 * en 0 (los barcos de la semana dieron fame), c) menos barcos ganados (barco perdido; regla de la usuaria), d) los días más llenos primero (J, V, S) y, a igual, el de más fame primero (como en las hojas de la usuaria,
 * donde el duelo y el barco caen en los primeros días), e) el primero en el orden del catálogo.
 * Devuelve { k, barcosGanados, dias: [{ dia, n, b, f, texto }] (J, V, S, D) } o { k: 0 } o null. Un día con el mismo total puede tener otro orden (por ejemplo el duelo en jueves o en viernes):
 * el reparto elegido es uno entre varios equivalentes.
 */
function _cgwRepartoClanTerminado_(ataques, fame, barcos, memo) {
  if (typeof ataques !== 'number' || typeof fame !== 'number' || isNaN(ataques) || isNaN(fame) || ataques % 1 !== 0 || ataques < 0 || ataques > BLG_DIAS_GUERRA * FAME_MAZOS_POR_DIA) return null;
  var hayBarcos = (typeof barcos === 'number' && !isNaN(barcos));
  var clave = 'R|' + ataques + '|' + (hayBarcos ? barcos : 'x') + '|' + fame;
  if (memo && memo[clave] !== undefined) return memo[clave];
  var res = null;
  if (_cgwSemanaEsPosible_(ataques, fame, hayBarcos ? barcos : null, null)) {
    res = { k: 0 };
  } else {
    var cat = _fameCatalogoDia_(), porClave = {};
    for (var c = 0; c < cat.length; c++) porClave[cat[c].n + '|' + cat[c].b + '|' + cat[c].f] = cat[c];
    var info = {};
    var infoDe = function (st) {
      var kk = st.n + '|' + st.b + '|' + st.f;
      if (!info[kk]) info[kk] = _cgwDescripcionDia_(st.n, st.b, st.f);
      return info[kk];
    };
    var mejor = null, mejorClave = null;
    for (var k = 1; k <= CGW_MAX_ATAQUES_SIN_FAME && k <= ataques; k++) {
      var n3 = ataques - k;
      if (n3 > 3 * FAME_MAZOS_POR_DIA) continue;
      var b2ini = hayBarcos ? Math.max(0, barcos - k) : 0, b2fin = hayBarcos ? barcos : 0;
      for (var b2 = b2ini; b2 <= b2fin; b2++) {
        for (var i = 0; i < cat.length; i++) {
          var s1 = cat[i];
          for (var j = 0; j < cat.length; j++) {
            var s2 = cat[j];
            var nr = n3 - s1.n - s2.n, fr = fame - s1.f - s2.f;
            if (nr < 0 || fr < 0) continue;
            var cands = [];
            if (hayBarcos) { var st = porClave[nr + '|' + (b2 - s1.b - s2.b) + '|' + fr]; if (st) cands.push(st); }
            else for (var q = 0; q < cat.length; q++) if (cat[q].n === nr && cat[q].f === fr) cands.push(cat[q]);
            for (var z = 0; z < cands.length; z++) {
              var s3 = cands[z];
              var ganados = infoDe(s1).barcosGanados + infoDe(s2).barcosGanados + infoDe(s3).barcosGanados;
              var bDom = hayBarcos ? barcos - b2 : 0;
              var clv = [k, bDom, ganados, -s1.n, -s2.n, -s3.n, -s1.f, -s2.f, -s3.f]; // el barco perdido (ganados) desempata solo entre las combinaciones que quedan (5-nov-2026)
              var mejorQue = !mejorClave;
              for (var t = 0; !mejorQue && t < clv.length; t++) { if (clv[t] < mejorClave[t]) mejorQue = true; else if (clv[t] > mejorClave[t]) break; }
              if (mejorQue) { mejorClave = clv; mejor = { k: k, barcosGanados: ganados, bDom: bDom, s: [s1, s2, s3] }; }
            }
          }
        }
      }
    }
    if (mejor) {
      var letras = ['J', 'V', 'S'], dias = [];
      for (var d = 0; d < 3; d++) dias.push({ dia: letras[d], n: mejor.s[d].n, b: mejor.s[d].b, f: mejor.s[d].f, texto: infoDe(mejor.s[d]).texto });
      dias.push({ dia: 'D', n: mejor.k, b: mejor.bDom, f: 0, texto: 'sin fame' });
      res = { k: mejor.k, barcosGanados: mejor.barcosGanados, dias: dias };
    }
  }
  if (memo) memo[clave] = res;
  return res;
}

/** Texto corto del reparto de _cgwRepartoClanTerminado_ para el registro: «J 4 atq 525 (…); V …; D 4 atq sin fame». [→ Contexto_Base_Web.md §PF357] */
function _cgwTextoReparto_(r) {
  if (!r || !r.dias) return '';
  return r.dias.map(function (d) {
    return d.dia + ' ' + d.n + ' atq' + (d.dia === 'D' ? ' sin fame' : ' ' + d.f + (d.texto ? ' (' + d.texto + ')' : ''));
  }).join('; ');
}

/**
 * _cgwClanTerminadoVerificado_(temporadaPropia, semana, clanTag, cache) [→ Contexto_Base_Web.md §PF357]
 * true solo si los currentriverrace de Drive prueban que el clan ya había cruzado la meta al empezar el domingo esa semana (_crrDomingoSinFame_, módulo 56). false = «sin verificar»:
 * no hay captura, la temporada es anterior a T1, el clan no se conoce, el módulo 56 no está, falló la lectura o se llegó al tope de semanas por corrida
 * (CGW_MAX_SEMANAS_VERIFICAR_CIERRE). Que dé false NO prueba que el clan no terminó. El módulo 56 reconoce el cruce al cierre del sábado; la usuaria (4-nov-2026) nunca ha visto cruces en otro día, así que el cruce se toma como del domingo hasta que se demuestre lo contrario. cache: { leidas: {}, n: 0 }.
 */
function _cgwClanTerminadoVerificado_(temporadaPropia, semana, clanTag, cache) {
  if (typeof _crrDomingoSinFame_ !== 'function' || !clanTag || !(temporadaPropia >= 1) || !cache) return false;
  var claveSem = temporadaPropia + '|' + semana;
  if (!cache.leidas[claveSem]) {
    if (cache.n >= CGW_MAX_SEMANAS_VERIFICAR_CIERRE) return false;
    cache.leidas[claveSem] = true;
    cache.n++;
  }
  try { return !!_crrDomingoSinFame_(temporadaPropia, semana, clanTag); }
  catch (e) { return false; }
}

/**
 * _cgwFuenteDeFila_(clanTag, fuenteTexto, guardada) [→ Contexto_Base_Web.md §PF313]
 * Nombre de la fuente de una fila para el registro de contradicciones. Sin «guardada»: la del envío (fuenteTexto = c.fuente). Con «guardada»: la de la fila del mapa.
 * Fila sin ClanTag (RoyaleAPI): «perfil» o «desconocida». Fila con ClanTag: «Log», «Analytics» o «desconocida».
 */
function _cgwFuenteDeFila_(clanTag, fuenteTexto, guardada) {
  if (clanTag === '') {
    var esPerfil = guardada ? (guardada.origenPerfil === CGW_ORIGEN_PERFIL)
      : (String(fuenteTexto || '').trim().toLowerCase() === CGW_ORIGEN_PERFIL);
    return esPerfil ? 'perfil' : 'desconocida';
  }
  var f = guardada ? (guardada.fuenteClan || '') : _cgwFuenteClanDesdeTexto_(fuenteTexto);
  return f || 'desconocida';
}

function _cgwTextoValores_(ataques, fame, barcos) {
  return ataques + ' ataques / ' + fame + ' fame' + ((barcos !== null && barcos !== undefined) ? ' / ' + barcos + ' barcos' : '');
}

// ----- Overlay de correcciones (CSV): lectura, escritura y formato -----

function _cgwFuenteClanDesdeTexto_(v) {
  var t = String(v || '').trim().toLowerCase();
  if (t === 'log') return CGW_FUENTE_LOG;
  if (t === 'analytics') return CGW_FUENTE_ANALYTICS;
  return '';
}

function _cgwSenaSinPerfil_(entradasClan) {
  var hayLog = false, hayAn = false, hayDesconocida = false;
  for (var i = 0; i < entradasClan.length; i++) {
    var f = entradasClan[i].fuenteClan || '';
    if (f === CGW_FUENTE_LOG) hayLog = true; else if (f === CGW_FUENTE_ANALYTICS) hayAn = true; else hayDesconocida = true;
  }
  if (hayDesconocida || (hayLog && hayAn)) return CGW_ORIGEN_SIN_PERFIL;
  return hayLog ? 'sin perfil: Log' : 'sin perfil: Analytics';
}

function _cgwIdFila_(temporada, semana, tag) {
  function dos(n) { var v = Number(n); return v < 0 ? '-' + (v > -10 ? '0' : '') + (-v) : (v < 10 ? '0' : '') + v; } // §PF247: antes de la reenumeración la temporada puede ser 0 o negativa: T_00, T_-05
  return 'T_' + dos(temporada) + '_S_' + dos(semana) + '_' + tag;
}

// El offset se lee UNA vez por escritura y se pasa como segundo parámetro: leerlo por fila (PropertiesService) agotó los 6 minutos en
// agregarIdCorreccionesGuerraCSV() con las miles de filas del archivo (25-oct-2026, §PF242).
function _cgwTemporadaRoyaleApiTexto_(temporadaPropia, offset) {
  var t = Number(temporadaPropia);
  if (isNaN(t)) return '';
  var r = t + (offset === undefined ? _getTemporadaOffsetRoyaleApi() : offset); // §PF247: también para temporadas propias 0 o negativas
  return r < 1 ? '' : r;
}

function _cgwTemporadaSupercellTexto_(temporadaPropia, offset) {
  var r = _cgwTemporadaRoyaleApiTexto_(temporadaPropia, offset);
  if (r === '') return '';
  var meses = CGW_SUPERCELL_ANCLA_ANIO * 12 + (CGW_SUPERCELL_ANCLA_MES - 1) + (r - CGW_SUPERCELL_ANCLA_ROYALEAPI);
  var anio = Math.floor(meses / 12), mes = (meses % 12) + 1;
  return anio + '-' + (mes < 10 ? '0' : '') + mes;
}

/**
 * _normalizarClanTagCorreccion(v)
 * ClanTag siempre en mayúsculas y con '#'; '' si no viene (formato anterior).
 */
function _normalizarClanTagCorreccion(v) {
  var t = String(v === undefined || v === null ? '' : v).trim().toUpperCase();
  if (!t) return '';
  return t.charAt(0) === '#' ? t : '#' + t;
}

function _cgwQuitarBom_(texto) {
  return (texto && texto.charCodeAt(0) === 0xFEFF) ? texto.substring(1) : texto;
}

// El formato ancho se reconoce por su columna «Ataques RoyaleAPI»; el largo (el de antes) por «ClanTag».
function _cgwEsFormatoAncho_(encabezado) {
  for (var i = 0; i < (encabezado || []).length; i++) {
    if (String(encabezado[i]).trim() === 'Ataques RoyaleAPI') return true;
  }
  return false;
}

function _cgwNuevaEntrada_(ataques, barcos, medallas, comunes, clanTag, origenPerfil, clanPerfil, fuenteClan) {
  var e = {
    ataquesSemana: Number(ataques) || 0,
    // Barcos es opcional: '' = sin dato (null), nunca un 0 falso. [→ Contexto_Base_Web.md §18B094]
    barcos: (barcos === '' || barcos === undefined || barcos === null) ? null : (Number(barcos) || 0),
    fame: Number(medallas) || 0,
    actualizado: comunes.actualizado,
    aprobacion: comunes.aprobacion,
    implementacion: comunes.implementacion,
    clanTag: clanTag
  };
  if (clanTag === '') {
    e.origenPerfil = origenPerfil || CGW_ORIGEN_DESCONOCIDO;
    e.clanPerfil = _normalizarClanTagCorreccion(clanPerfil); // '' = no se conoce el clan de la fila (formato anterior)
  } else {
    e.fuenteClan = _cgwFuenteClanDesdeTexto_(fuenteClan); // §PF245: «Log», «Analytics» o '' (no se sabe)
  }
  return e;
}

/**
 * _cgwPerfilEsExterno_(e)
 * PF183 act. 16: true si la entrada es la fila del perfil (sin ClanTag) y su «Clan RoyaleAPI» es un tag que no es de CFG.TERNA_TAGS.
 * Sin clan conocido devuelve false (se trata como antes: dato Terna).
 */
function _cgwPerfilEsExterno_(e) {
  return !!e && e.clanTag === '' && !!e.clanPerfil && CFG.TERNA_TAGS.indexOf(e.clanPerfil) < 0;
}

/**
 * _cgwIndiceAtaqueTerna_(mapa, correcciones, offset)  (§PF343)
 * Índice «temporada propia|semana|tag jugador» → true de las semanas en que ya hay registro de al menos un ataque en un clan Terna: filas del overlay con
 * ClanTag (Log o Analytics, `mapa`) y filas con clanTag de este mismo lote (el perfil puede llegar antes que el Log dentro del envío). Se arma una sola vez por envío.
 */
function _cgwIndiceAtaqueTerna_(mapa, correcciones, offset) {
  var idx = {};
  Object.keys(mapa).forEach(function (k) {
    var q = k.split('|'); // temporada | semana | clantag | tag
    if (q.length === 4 && q[2] !== '' && Number(mapa[k].ataquesSemana) > 0) idx[q[0] + '|' + q[1] + '|' + q[3]] = true;
  });
  for (var i = 0; i < correcciones.length; i++) {
    var c = correcciones[i] || {};
    if (_normalizarClanTagCorreccion(c.clanTag) === '' || !(Number(c.ataquesSemana) > 0)) continue;
    idx[(Number(c.temporadaRoyaleApi) - offset) + '|' + Number(c.semana) + '|' + String(c.tag || '').trim()] = true;
  }
  return idx;
}

/**
 * _cgwHayAtaqueTernaEnSemana_(indice, cacheJson, temporadaPropia, semana, tag)  (§PF343)
 * true si hay registro de que el jugador hizo al menos un ataque esa semana en un clan Terna: el índice de _cgwIndiceAtaqueTerna_(), o su JSON individual
 * (registros del Log, Analytics o River Race de un clan Terna, con ataques > 0; las filas del perfil y las `externa` no cuentan). El JSON se lee una vez por
 * jugador y solo cuando hace falta (`cacheJson`). Un fallo al leerlo cuenta como «sin registro».
 */
function _cgwHayAtaqueTernaEnSemana_(indice, cacheJson, temporadaPropia, semana, tag) {
  if (indice[temporadaPropia + '|' + semana + '|' + tag]) return true;
  if (cacheJson[tag] === undefined) {
    var registros = [];
    try {
      var hist = _cargarHistorialGuerraIndividual(tag);
      registros = (hist && hist.registros) ? hist.registros : [];
    } catch (e) { registros = []; }
    cacheJson[tag] = registros;
  }
  var regs = cacheJson[tag];
  for (var i = 0; i < regs.length; i++) {
    var r = regs[i];
    if (!r || r.externa === true) continue;
    if (Number(r.temporadaInterna) !== Number(temporadaPropia) || Number(r.semana) !== Number(semana)) continue;
    var f = String(r.fuente || '').toLowerCase();
    if ((f === 'log' || f === 'analytics' || f === 'riverrace') && Number(r.ataques) > 0) return true;
  }
  return false;
}

/**
 * _cgwFilasLargasAMapa_(parsed)
 * Lee el formato de antes (una fila por clan, columna ClanTag) y le asigna el origen a las filas sin ClanTag. [→ Contexto_Base_Web.md §18B093]
 */
function _cgwFilasLargasAMapa_(parsed) {
  var mapa = {};
  var filas = parsed.slice(1);
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var temporada = String(f[CGC.TEMPORADA - 1] || '').trim();
    var semana    = String(f[CGC.SEMANA - 1]    || '').trim();
    var tag       = String(f[CGC.TAG - 1]       || '').trim();
    if (!temporada || !semana || !tag) continue;

    var clanTag = _normalizarClanTagCorreccion(f[CGC.CLAN_TAG - 1]);
    var clave = temporada + '|' + semana + '|' + clanTag + '|' + tag;
    var actualizado = String(f[CGC.ACTUALIZADO - 1] || '').trim();

    var existente = mapa[clave];
    if (existente && existente.actualizado && actualizado && existente.actualizado >= actualizado) {
      continue; // ya había una fila igual o más reciente para esta clave — se descarta esta duplicada
    }

    // Aprobación/Implementación (pregunta 4, FIX 27-ago-2026): se leen tal cual. [→ Contexto_Base_Web.md §18B095]
    mapa[clave] = _cgwNuevaEntrada_(f[CGC.ATAQUES_SEMANA - 1], f[CGC.BARCOS - 1], f[CGC.FAME - 1], {
      actualizado: actualizado,
      aprobacion: String(f[CGC.APROBACION - 1] || '').trim(),
      implementacion: String(f[CGC.IMPLEMENTACION - 1] || '').trim()
    }, clanTag, CGW_ORIGEN_PERFIL);
  }
  _cgwAsignarOrigenMigracion_(mapa);
  return mapa;
}

/**
 * _cgwAsignarOrigenMigracion_(mapa)
 * Migración del formato largo: una fila sin ClanTag anterior al 29-sep-2026 (CGW_FECHA_CORTE_PERFIL) en una semana con 2 o más clanes
 * NO se trata como perfil (pudo ser lo leído en un clan, no lo que decía el perfil: «desconocido»). En las semanas de un solo clan,
 * o desde el 29-sep, se deja como «perfil». [→ Contexto_Base_Web.md §PF164]
 */
function _cgwAsignarOrigenMigracion_(mapa) {
  var clanesPorSemana = {};
  var claves = Object.keys(mapa);
  for (var i = 0; i < claves.length; i++) {
    var p = claves[i].split('|'); // temporada | semana | clanTag | tag
    if (p[2] === '') continue;
    var g = p[0] + '|' + p[1] + '|' + p[3];
    clanesPorSemana[g] = (clanesPorSemana[g] || 0) + 1;
  }
  for (var j = 0; j < claves.length; j++) {
    var q = claves[j].split('|');
    if (q[2] !== '') continue;
    var e = mapa[claves[j]];
    var anterior = !e.actualizado || e.actualizado < CGW_FECHA_CORTE_PERFIL;
    var varios = (clanesPorSemana[q[0] + '|' + q[1] + '|' + q[3]] || 0) >= 2;
    e.origenPerfil = (anterior && varios) ? CGW_ORIGEN_DESCONOCIDO : CGW_ORIGEN_PERFIL;
  }
}

/**
 * _cgwFilasAnchasAMapa_(parsed)
 * Lee el formato ancho POR NOMBRE DE ENCABEZADO (no por posición): si aparece un clan nuevo se leen sus columnas en vez de perderlas.
 * Cada fila se expande a una entrada por clan con algún valor y, si RoyaleAPI trae algún valor, a la entrada del perfil (clanTag '').
 * Actualizado, Aprobación e Implementación son de la fila (de la semana del jugador) y se copian a todas sus entradas.
 * Externo se ignora al leer: se recalcula al escribir.
 */
function _cgwFilasAnchasAMapa_(parsed) {
  var mapa = {};
  var enc = parsed[0].map(function (h) { return String(h).trim(); });
  var col = {};
  var colClan = {}; // clanTag -> { Ataques: i, Barcos: i, Medallas: i }
  var clanes = [];
  var reClan = /^(Ataques|Barcos|Medallas) (#[0-9A-Za-z]+)$/;
  for (var h = 0; h < enc.length; h++) {
    col[enc[h]] = h;
    var m = reClan.exec(enc[h]);
    if (m) {
      var ct = _normalizarClanTagCorreccion(m[2]);
      if (!colClan[ct]) { colClan[ct] = {}; clanes.push(ct); }
      colClan[ct][m[1]] = h;
    }
  }
  function cel(f, idx) {
    if (idx === undefined) return '';
    var v = f[idx];
    return (v === undefined || v === null) ? '' : String(v).trim();
  }

  for (var i = 1; i < parsed.length; i++) {
    var f = parsed[i];
    var temporada = cel(f, col['Temporada']);
    var semana    = cel(f, col['Semana']);
    var tag       = cel(f, col['Tag']);
    if (!temporada || !semana || !tag) continue;

    var comunes = {
      actualizado: cel(f, col['Actualizado']),
      aprobacion: cel(f, col['Aprobación']),
      implementacion: cel(f, col['Implementación'])
    };
    for (var c = 0; c < clanes.length; c++) {
      var cc = colClan[clanes[c]];
      var a = cel(f, cc.Ataques), b = cel(f, cc.Barcos), md = cel(f, cc.Medallas);
      if (a === '' && b === '' && md === '') continue;
      mapa[temporada + '|' + semana + '|' + clanes[c] + '|' + tag] = _cgwNuevaEntrada_(a, b, md, comunes, clanes[c], undefined, undefined, cel(f, col['Fuente ' + clanes[c]])); // §PF245
    }
    var pa = cel(f, col['Ataques RoyaleAPI']), pb = cel(f, col['Barcos RoyaleAPI']), pm = cel(f, col['Medallas RoyaleAPI']);
    if (pa !== '' || pb !== '' || pm !== '') {
      var origen = cel(f, col[CGW_ENCABEZADO_ORIGEN]).toLowerCase() === CGW_ORIGEN_PERFIL ? CGW_ORIGEN_PERFIL : CGW_ORIGEN_DESCONOCIDO;
      mapa[temporada + '|' + semana + '||' + tag] = _cgwNuevaEntrada_(pa, pb, pm, comunes, '', origen, cel(f, col[CGW_ENCABEZADO_CLAN_PERFIL]));
    }
  }
  return mapa;
}

/**
 * _cgwLeerOverlayDeTexto_(csvText)
 * Reconoce el formato (ancho o largo) por el encabezado y devuelve el mapa «temporada|semana|clanTag|tag».
 */
function _cgwLeerOverlayDeTexto_(csvText) {
  if (!csvText) return {};
  var parsed = _parseCSV(_cgwQuitarBom_(csvText));
  if (!parsed || parsed.length < 2) return {};
  return _cgwEsFormatoAncho_(parsed[0]) ? _cgwFilasAnchasAMapa_(parsed) : _cgwFilasLargasAMapa_(parsed);
}

/**
 * _cargarOverlayCorreccionesGuerraPorClan() [→ Contexto_Base_Web.md §18B093]
 * Lee Correcciones_Guerra.csv en cualquiera de los dos formatos (ancho o largo; §PF164).
 */
function _cargarOverlayCorreccionesGuerraPorClan() {
  return _cgwLeerOverlayDeTexto_(_loadCSVFromDrive(CORRECCIONES_GUERRA_CSV));
}

/**
 * _cargarOverlayCorreccionesGuerra() [→ Contexto_Base_Web.md §18B096]
 */
function _cargarOverlayCorreccionesGuerra() {
  var porClan = _cargarOverlayCorreccionesGuerraPorClan();
  var grupos = {};
  var claves = Object.keys(porClan);
  for (var i = 0; i < claves.length; i++) {
    if (_cgwPerfilEsExterno_(porClan[claves[i]])) continue; // PF183 act. 16: la fila del perfil de un clan externo no cuenta como dato Terna
    var p = claves[i].split('|'); // temporada | semana | clantag | tag
    var claveTag = p[0] + '|' + p[1] + '|' + p[3];
    if (!grupos[claveTag]) grupos[claveTag] = [];
    grupos[claveTag].push(porClan[claves[i]]);
  }

  var mapa = {};
  var clavesGrupo = Object.keys(grupos);
  for (var g = 0; g < clavesGrupo.length; g++) {
    var filas = grupos[clavesGrupo[g]];
    var conClan = filas.filter(function (x) { return x.clanTag !== ''; });
    // §PF302: el valor de perfil de RoyaleAPI (fila sin ClanTag con origen «perfil»; la de un clan externo ya se saltó arriba) se guarda aparte para compararlo
    // con la suma de los clanes; aunque las filas sin ClanTag se ignoren para escribir, ese valor sirve de tope.
    var perfilGrupo = null;
    for (var pg = 0; pg < filas.length; pg++) {
      if (filas[pg].clanTag === '' && filas[pg].origenPerfil === CGW_ORIGEN_PERFIL) perfilGrupo = { ataquesSemana: filas[pg].ataquesSemana, barcos: filas[pg].barcos, fame: filas[pg].fame };
    }
    if (conClan.length > 0) filas = conClan; // AVISO 1: las sin ClanTag se ignoran

    var ataques = 0, fame = 0, barcos = null, actualizado = '';
    var todasAprobadas = true, todasImpl = true, algunaImplNo = false;
    for (var k = 0; k < filas.length; k++) {
      var r = filas[k];
      ataques += r.ataquesSemana;
      fame += r.fame;
      if (r.barcos !== null && r.barcos !== undefined) barcos = (barcos === null ? 0 : barcos) + r.barcos;
      if (r.actualizado && r.actualizado > actualizado) actualizado = r.actualizado;
      if (r.aprobacion !== 'Sí') todasAprobadas = false;
      if (r.implementacion !== 'Sí') todasImpl = false;
      if (r.implementacion === 'No') algunaImplNo = true;
    }
    mapa[clavesGrupo[g]] = {
      ataquesSemana: ataques,
      barcos: barcos,
      fame: fame,
      actualizado: actualizado,
      aprobacion: todasAprobadas ? 'Sí' : '',
      implementacion: todasImpl ? 'Sí' : (algunaImplNo ? 'No' : ''),
      clanes: filas.map(function (x) { return x.clanTag; }),
      filasPorClan: filas,
      perfil: perfilGrupo
    };
  }
  return mapa;
}

// Externo (regla (d) de la usuaria, 22-oct-2026): RoyaleAPI - suma de los clanes, solo si la suma es MENOR; vacío en los demás casos
// (también si son iguales, si ningún clan trae dato de esa magnitud o si el origen de RoyaleAPI no es «perfil»: un valor «desconocido»
// pudo ser lo leído en un clan y no se compara). Es un valor calculado: nunca se lee del CSV. [→ Contexto_Base_Web.md §PF164]
function _cgwExterno_(perfil, entradasClan, campo) {
  if (!perfil || perfil.origenPerfil !== CGW_ORIGEN_PERFIL) return '';
  var pv = perfil[campo];
  if (pv === null || pv === undefined) return '';
  // PF183 act. 16: si la fila del perfil es de un clan externo, todo el valor es Externo (no se resta la suma de los clanes Terna). Vacío si es 0.
  if (_cgwPerfilEsExterno_(perfil)) return pv > 0 ? pv : '';
  var suma = 0, hay = false;
  for (var i = 0; i < entradasClan.length; i++) {
    var v = entradasClan[i][campo];
    if (v !== null && v !== undefined) { suma += v; hay = true; }
  }
  if (!hay) return '';
  return pv > suma ? pv - suma : '';
}

function _cgwEncabezadoAncho_(clanes) {
  var enc = ['N°', CGW_ENCABEZADO_ID, 'Actualizado', 'Temporada', CGW_ENCABEZADO_TEMP_ROYALEAPI, CGW_ENCABEZADO_TEMP_SUPERCELL, 'Semana', 'Tag'];
  for (var m = 0; m < CGW_MAGNITUDES.length; m++) {
    for (var c = 0; c < clanes.length; c++) enc.push(CGW_MAGNITUDES[m].nombre + ' ' + clanes[c]);
    enc.push(CGW_MAGNITUDES[m].nombre + ' Externo');
    enc.push(CGW_MAGNITUDES[m].nombre + ' RoyaleAPI');
  }
  enc.push('Aprobación', 'Implementación', CGW_ENCABEZADO_ORIGEN, CGW_ENCABEZADO_CLAN_PERFIL);
  for (var cf = 0; cf < clanes.length; cf++) enc.push('Fuente ' + clanes[cf]); // §PF245
  return enc;
}

/**
 * _cgwMapaAFilasAnchas_(mapa)
 * Convierte el mapa en memoria en las filas del formato ancho (encabezado incluido). Los clanes de las columnas son los de
 * CFG.TERNA_TAGS (en ese orden) más cualquier otro clan que tenga datos en el mapa (nunca se pierde un dato por falta de columna).
 * Una fila por temporada, semana y jugador.
 */
function _cgwMapaAFilasAnchas_(mapa) {
  var claves = Object.keys(mapa).sort();
  var clanes = CFG.TERNA_TAGS.slice();
  var grupos = {};
  for (var i = 0; i < claves.length; i++) {
    var p = claves[i].split('|');
    if (p.length < 4) p = [p[0], p[1], '', p[2]]; // clave de 3 partes (formato anterior): sin clan
    var ct = p[2];
    if (ct !== '' && clanes.indexOf(ct) < 0) clanes.push(ct);
    var gk = p[0] + '|' + p[1] + '|' + p[3];
    if (!grupos[gk]) grupos[gk] = { temporada: p[0], semana: p[1], tag: p[3], clanes: {}, perfil: null, todas: [] };
    var e = mapa[claves[i]];
    if (ct === '') grupos[gk].perfil = e; else grupos[gk].clanes[ct] = e;
    grupos[gk].todas.push(e);
  }
  var gks = Object.keys(grupos).sort(function (a, b) {
    var ga = grupos[a], gb = grupos[b];
    if (Number(ga.temporada) !== Number(gb.temporada)) return Number(ga.temporada) - Number(gb.temporada);
    if (Number(ga.semana) !== Number(gb.semana)) return Number(ga.semana) - Number(gb.semana);
    return String(ga.tag).localeCompare(String(gb.tag));
  });

  var filas = [_cgwEncabezadoAncho_(clanes)];
  var offsetRoyaleApi = _getTemporadaOffsetRoyaleApi();
  for (var n = 0; n < gks.length; n++) {
    var g = grupos[gks[n]];
    var actualizado = '', todasAprobadas = true, todasImpl = true, algunaImplNo = false;
    for (var k = 0; k < g.todas.length; k++) {
      var r = g.todas[k];
      if (r.actualizado && r.actualizado > actualizado) actualizado = r.actualizado;
      if (r.aprobacion !== 'Sí') todasAprobadas = false;
      if (r.implementacion !== 'Sí') todasImpl = false;
      if (r.implementacion === 'No') algunaImplNo = true;
    }
    var entradasClan = Object.keys(g.clanes).map(function (x) { return g.clanes[x]; });
    var fila = [n + 1, _cgwIdFila_(g.temporada, g.semana, g.tag), actualizado, g.temporada,
      _cgwTemporadaRoyaleApiTexto_(g.temporada, offsetRoyaleApi), _cgwTemporadaSupercellTexto_(g.temporada, offsetRoyaleApi), g.semana, g.tag];
    for (var m = 0; m < CGW_MAGNITUDES.length; m++) {
      var campo = CGW_MAGNITUDES[m].campo;
      for (var c = 0; c < clanes.length; c++) {
        var ec = g.clanes[clanes[c]];
        fila.push((ec && ec[campo] !== null && ec[campo] !== undefined) ? ec[campo] : '');
      }
      fila.push(_cgwExterno_(g.perfil, entradasClan, campo));
      fila.push((g.perfil && g.perfil[campo] !== null && g.perfil[campo] !== undefined) ? g.perfil[campo] : '');
    }
    fila.push(todasAprobadas ? 'Sí' : '', todasImpl ? 'Sí' : (algunaImplNo ? 'No' : ''),
      g.perfil ? (g.perfil.origenPerfil || CGW_ORIGEN_DESCONOCIDO) : (entradasClan.length > 0 ? _cgwSenaSinPerfil_(entradasClan) : ''), // §PF244, §PF245
      g.perfil ? (g.perfil.clanPerfil || '') : '');
    for (var cfi = 0; cfi < clanes.length; cfi++) fila.push((g.clanes[clanes[cfi]] && g.clanes[clanes[cfi]].fuenteClan) || ''); // §PF245
    filas.push(fila);
  }
  return filas;
}

/**
 * _guardarOverlayCorreccionesGuerra(mapa) [→ Contexto_Base_Web.md §18B097]
 * Escribe SIEMPRE en formato ancho (§PF164), UTF-8 con BOM (para que Excel lea bien «N°» y las tildes). Si el archivo que encuentra
 * todavía está en formato largo, antes guarda una copia suya (Correcciones_Guerra_formato_largo_AAAAMMDD_HHmmss.csv).
 */
function _guardarOverlayCorreccionesGuerra(mapa) {
  var actual = _loadCSVFromDrive(CORRECCIONES_GUERRA_CSV);
  if (actual) {
    var primera = _cgwQuitarBom_(actual).split(/\r?\n/)[0];
    var eraLargo = primera.indexOf('ClanTag') >= 0 && primera.indexOf('Ataques RoyaleAPI') < 0;
    if (eraLargo) {
      var sello = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT-5', 'yyyyMMdd_HHmmss');
      _saveCSVToDrive('Correcciones_Guerra_formato_largo_' + sello + '.csv', actual);
      Logger.log('[CorreccionGuerra] Formato largo respaldado en Correcciones_Guerra_formato_largo_' + sello + '.csv antes de pasar al formato ancho.');
    }
  }
  _saveCSVToDrive(CORRECCIONES_GUERRA_CSV, '﻿' + _encodeCSV(_cgwMapaAFilasAnchas_(mapa)));
}

/**
 * _tagsSinPerfilEnOverlay_(mapa)  (§PF246)
 * Tags de jugador que tienen alguna fila de clan en el mapa de Correcciones_Guerra.csv y ninguna fila de perfil con origen «perfil»
 * (una fila de perfil «desconocido» no cuenta como perfil: no se sabe de dónde salió). Con el CSV del 25-oct-2026 son 152 tags (241 filas de clan).
 * Incluye jugadores que ya no están en los clanes: Tampermonkey solo visita los que están en la lista de activos.
 */
function _tagsSinPerfilEnOverlay_(mapa) {
  var conPerfil = {}, conClan = {};
  Object.keys(mapa || {}).forEach(function (k) {
    var p = k.split('|'); // temporada | semana | clantag | tag
    if (p[2] === '') { if (mapa[k].origenPerfil === CGW_ORIGEN_PERFIL) conPerfil[p[3]] = true; }
    else conClan[p[3]] = true;
  });
  return Object.keys(conClan).filter(function (t) { return !conPerfil[t]; }).sort();
}

/**
 * _tagsRegresadosSinPerfilTrasRegreso_(mapa, ventanasOpc)  (§PF314, PF253 opción B; por confirmar tras la contrastación con los json)
 * Tags de jugadores que SALIERON de los clanes Terna y REGRESARON, y cuyo perfil no se ha leído desde que regresaron. Así Tampermonkey visita su
 * perfil (manda todas las semanas, incluidas las del lapso fuera) y el backend decide: una fila igual a la guardada no se reescribe, una distinta
 * la reemplaza con aviso «antes / ahora» y una semana que falta se agrega (§PF236, §PF237). El backend no necesita contarle a Tampermonkey qué semanas tiene cada jugador (opción A).
 * Regreso = la membresía en clanes Terna (ventanas de Historial, _construirVentanasMembresiaTernaPorTag()) tiene un hueco de CGW_REGRESO_HUECO_DIAS o más
 * (un traslado entre clanes Terna con pocos días de por medio no cuenta) y el jugador está hoy en un clan Terna (última ventana abierta).
 * «Perfil leído desde el regreso» = alguna fila del perfil (sin ClanTag, origen «perfil») con «Actualizado» igual o posterior a la fecha del regreso.
 * Riesgo conocido: si el perfil de RoyaleAPI no trae ninguna semana nueva o distinta, «Actualizado» no cambia (§PF236) y el jugador seguiría en la lista.
 */
function _tagsRegresadosSinPerfilTrasRegreso_(mapa, ventanasOpc) {
  var ventanas = ventanasOpc || _construirVentanasMembresiaTernaPorTag();
  var tz = Session.getScriptTimeZone() || 'GMT-5';
  var ultimaLecturaPerfil = {}; // tag -> «Actualizado» más reciente de una fila de perfil con origen «perfil»
  Object.keys(mapa || {}).forEach(function (k) {
    var p = k.split('|'); // temporada | semana | clantag | tag
    if (p[2] !== '' || mapa[k].origenPerfil !== CGW_ORIGEN_PERFIL) return;
    var tg = String(p[3] || '').trim().toUpperCase();
    var act = String(mapa[k].actualizado || '');
    if (act && act > (ultimaLecturaPerfil[tg] || '')) ultimaLecturaPerfil[tg] = act;
  });
  var margen = CGW_REGRESO_HUECO_DIAS * 24 * 3600 * 1000;
  var salida = [];
  Object.keys(ventanas || {}).forEach(function (t) {
    var v = (ventanas[t] || []).slice().sort(function (a, b) { return a.desde.getTime() - b.desde.getTime(); });
    if (v.length < 2) return;
    // Se funden las ventanas que se tocan o se traslapan (traslado entre clanes Terna) y se busca la última interrupción.
    var tramos = [];
    v.forEach(function (w) {
      var fin = (w.hasta === null) ? null : w.hasta.getTime();
      var ult = tramos[tramos.length - 1];
      if (ult && (ult.fin === null || w.desde.getTime() - ult.fin < margen)) {
        if (fin === null || (ult.fin !== null && fin > ult.fin)) ult.fin = fin;
      } else {
        tramos.push({ desde: w.desde, fin: fin });
      }
    });
    if (tramos.length < 2) return;
    var ultimo = tramos[tramos.length - 1];
    if (ultimo.fin !== null) return; // hoy no está en un clan Terna: Tampermonkey solo visita a los activos
    var regreso = Utilities.formatDate(ultimo.desde, tz, 'yyyy-MM-dd HH:mm:ss');
    if ((ultimaLecturaPerfil[t] || '') < regreso) salida.push(t);
  });
  return salida.sort();
}

/**
 * _cuentasConVariosClanesEnOverlay_()
 * §PF164: tags de jugador con al menos una semana con filas de 2 o más clanes Terna en Correcciones_Guerra.csv. Con los datos del 12-oct-2026
 * son 35. Es la lista que Tampermonkey ofrece al forzar la lectura del perfil (opción «VARIOS»).
 */
function _cuentasConVariosClanesEnOverlay_(mapaOpc) {
  var mapa = mapaOpc || _cargarOverlayCorreccionesGuerraPorClan(); // §PF246: la lista de correcciones lee el CSV una sola vez y se lo pasa
  var clanesPorSemana = {};
  Object.keys(mapa).forEach(function (k) {
    var p = k.split('|'); // temporada | semana | clantag | tag
    if (p[2] === '') return;
    var g = p[0] + '|' + p[1] + '|' + p[3];
    clanesPorSemana[g] = (clanesPorSemana[g] || 0) + 1;
  });
  var tags = {};
  Object.keys(clanesPorSemana).forEach(function (g) {
    if (clanesPorSemana[g] >= 2) tags[g.split('|')[2]] = true;
  });
  return Object.keys(tags).sort();
}

// ----- Fuente de guerra y temporadas de RoyaleAPI -----

// NÚCLEO REUTILIZABLE DE CORRECCIÓN (punto 1.1) + RECONSTRUCCIÓN COMPLETA [→ Contexto_Base_Web.md §18B069]
/**
 * _cargarFuenteGuerraParaTemporada(temporadaPropia, temporadaReal) [→ Contexto_Base_Web.md §18B070]
 */
function _cargarFuenteGuerraParaTemporada(temporadaPropia, temporadaReal) {
  var ss = _getSs();
  var esActual = (String(temporadaPropia) === String(temporadaReal));

  if (esActual) {
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    if (!sh) return null;
    var lastRow = sh.getLastRow();
    var filas = (lastRow >= 2) ? sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).getValues() : [];
    return { tipo: 'hoja', sh: sh, filas: filas };
  }

  var encabezadoCsv = ['N°', 'Fecha', 'Temporada', 'Semana', 'Día', 'PeriodIndex', 'DiaGuerra', 'Etapa',
    'Clan', 'Tag', 'Nombre', 'AtaquesHoy', 'AtaquesSemana', 'Fame', 'Barcos',
    'Donaciones_r', 'Donaciones_d', 'Ranking', 'Temporada_2', 'Origen', 'Copas'];
  var filas = [];
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (csvText) {
    var parsed = _parseCSV(csvText);
    if (parsed && parsed.length >= 1) {
      encabezadoCsv = parsed[0];
      for (var i = 1; i < parsed.length; i++) {
        var f = parsed[i].slice(0, GUERRA_TOTAL_COLS);
        while (f.length < GUERRA_TOTAL_COLS) f.push('');
        filas.push(f);
      }
    }
  }
  return { tipo: 'csv', encabezadoCsv: encabezadoCsv, filas: filas };
}

/**
 * _guardarFuenteGuerra(fuente) [→ Contexto_Base_Web.md §18B071]
 */
function _guardarFuenteGuerra(fuente) {
  if (fuente.tipo === 'hoja') {
    var sh = fuente.sh;
    var filasNecesarias = fuente.filas.length + 1; // +1 encabezado
    if (filasNecesarias > sh.getMaxRows()) {
      sh.insertRowsAfter(sh.getMaxRows(), filasNecesarias - sh.getMaxRows() + 10);
    }
    if (fuente.filas.length > 0) {
      sh.getRange(2, 1, fuente.filas.length, GUERRA_TOTAL_COLS).setValues(fuente.filas);
      sh.getRange(2, GC.FECHA,      fuente.filas.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
      sh.getRange(2, GC.DIA_GUERRA, fuente.filas.length, 1).setNumberFormat('dd/mm/yyyy');
      _aplicarFormatoMilesGuerra_(sh);
    }
    // FIX (30-ago-2026, reporte usuario: "las filas Reconstruido no tienen [→ Contexto_Base_Web.md §18B072]
    _aplicarFmtCondicionalGuerra(sh);
    _syncGuerraCSV(sh); // propaga a Backup_Guerra.csv (fusión, ver 17_GuerraSheet.gs)
  } else {
    var salida = [fuente.encabezadoCsv].concat(fuente.filas);
    _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV(salida));
  }
}

/**
 * _construirOffsetsPorClave(filas, temporadaFiltro) [→ Contexto_Base_Web.md §18B073]
 */
function _construirOffsetsPorClave(filas, temporadaFiltro) {
  var offsetsPorClave = {};
  for (var r = 0; r < filas.length; r++) {
    var fila = filas[r];
    if (String(fila[GC.TEMPORADA - 1]) !== String(temporadaFiltro)) continue;
    var clave = String(fila[GC.TAG - 1]).trim() + '|' + String(fila[GC.SEMANA - 1]).trim();
    var pIdx = Number(fila[GC.PERIOD_IDX - 1]) || 0;
    var offDia = (pIdx % 7) - 3;
    if (offDia < 0 || offDia > 3) continue;
    if (!offsetsPorClave[clave]) offsetsPorClave[clave] = {};
    var idxPrevio = offsetsPorClave[clave][offDia];
    if (idxPrevio === undefined || pIdx > (Number(filas[idxPrevio][GC.PERIOD_IDX - 1]) || 0)) {
      offsetsPorClave[clave][offDia] = r;
    }
  }
  return offsetsPorClave;
}

// SECCIÓN 2: RESTO DE FUNCIONES (overlay de correcciones, helpers internos) — [→ Contexto_Base_Web.md §18B090]
function _getTemporadaOffsetRoyaleApi() {
  var props = PropertiesService.getScriptProperties();
  var guardado = props.getProperty('CFG_OFFSET_ROYALEAPI');
  return (guardado !== null && guardado !== '') ? Number(guardado) : 131; // 131 = bootstrap
}

/**
 * _getTemporadaRoyaleApiDesdePropia(temporadaPropia) [→ Contexto_Base_Web.md §18B091]
 */
function _getTemporadaRoyaleApiDesdePropia(temporadaPropia) {
  return Number(temporadaPropia) + _getTemporadaOffsetRoyaleApi();
}

/**
 * _buscarDatosJugadorParaReconstruccion(tag) [→ Contexto_Base_Web.md §18B077]
 */
function _buscarDatosJugadorParaReconstruccion(tag) {
  try {
    var ss = _getSs();
    var dirData = _leerDirectorioFisicoComoDC(ss);
    for (var i = 0; i < dirData.length; i++) {
      if (String(dirData[i][DC.TAG - 1] || '').trim() === tag) {
        var nombre = String(dirData[i][DC.NOMBRE - 1] || dirData[i][DC.NOM_MULTI - 1] || '').trim();
        return { clan: String(dirData[i][DC.CLAN - 1] || ''), nombre: nombre || tag };
      }
    }
  } catch (e) {
    Logger.log('[CorreccionGuerra] _buscarDatosJugadorParaReconstruccion(' + tag + '): ' + e.message);
  }
  return { clan: '', nombre: tag };
}

// ----- Aplicar las correcciones (motor) -----

/**
 * _aplicarCorreccionesGuerra(correcciones) [→ Contexto_Base_Web.md §18B098]
 */
/**
 * _aplicarCorreccionesGuerra(correcciones) [→ Contexto_Base_Web.md §18B099]
 */
function _aplicarCorreccionesGuerra(correcciones) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { ok: false, error: 'El sistema está ocupado guardando otra corrección. Intenta de nuevo en unos segundos.', aplicadas: 0 };
  }
  try {
    return _aplicarCorreccionesGuerraImpl(correcciones);
  } finally {
    _webUltimaGuerraPreviaInvalidar_(); // 03-nov-2026: la instantánea de la última guerra previa de «Ingresos recientes» no debe mostrar un valor anterior a la corrección (§PF125)
    lock.releaseLock();
  }
}

function _aplicarCorreccionesGuerraImpl(correcciones) {
  if (!correcciones || !correcciones.length) {
    return { ok: false, error: 'Sin correcciones en el payload.', aplicadas: 0 };
  }

  var mapa = _cargarOverlayCorreccionesGuerraPorClan(); // FIX 29-sep-2026: una fila por clan, no la vista sumada
  var ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT-5', 'yyyy-MM-dd HH:mm:ss');

  var aplicadas = 0, omitidas = 0, sinCambios = 0;
  var anterioresT1 = 0; // §PF247: filas de este envío con temporada propia menor que 1 (se guardan igual)
  var cambiosPerfil = []; // §PF237: filas del perfil que reemplazan un dato del perfil ya guardado y distinto
  var clavesTocadas = []; // FIX (27-ago-2026, pregunta 4): claves de ESTE lote, para completar Implementación más abajo sin tocar correcciones de corridas anteriores.
  var clavesIgualesClan = []; // §PF240: filas de Log/Analytics (con ClanTag) iguales a las ya guardadas: no se reescriben, pero cuentan para el aviso «revisar a mano»
  var contradicciones = [], contradiccionesTotal = 0, contradiccionesSinPisar = 0; // §PF313: registro de contradicciones de esta corrida (líneas topadas; el total cuenta todas)
  var revisionContradicciones = []; // §PF313: lo que no se resuelve solo va también a Revision_Guerra.csv (Estado pendiente)
  var memoPosible = {}; // §PF313: memoria de _cgwSemanaEsPosible_() para no repetir cálculos en un lote grande
  var indiceAtaqueTerna = _cgwIndiceAtaqueTerna_(mapa, correcciones, _getTemporadaOffsetRoyaleApi()); // §PF343
  var cacheJsonTerna = {}, contradiccionesExternasIgnoradas = 0; // §PF343
  var aceptadasClanTerminado = [], aceptadasClanTerminadoTotal = 0; // §PF357: filas que solo cuadran suponiendo ataques sin fame por clan terminado (sin verificar)
  var aceptadasClanTerminadoVerificadas = 0, cacheCierreCrr = { leidas: {}, n: 0 }; // §PF357: cuántas se verificaron con los currentriverrace de Drive
  for (var i = 0; i < correcciones.length; i++) {
    var c = correcciones[i] || {};
    var tag = String(c.tag || '').trim();
    var temporadaRoyale = Number(c.temporadaRoyaleApi);
    var semana = Number(c.semana);
    var ataquesSemana = Number(c.ataquesSemana);
    var fame = Number(c.fame);

    if (!tag || !temporadaRoyale || !semana || isNaN(ataquesSemana) || isNaN(fame)) {
      omitidas++;
      continue;
    }

    var temporadaPropia = temporadaRoyale - _getTemporadaOffsetRoyaleApi();
    // §PF247: ya NO se descartan las temporadas propias menores que 1. El sistema registra desde mayo de 2026 (T1), pero los clanes existen desde antes;
    // el plan (pendiente de la reenumeración de temporadas) es traer ese historial de RoyaleAPI y, cuando se conozca la más antigua con un clan Terna,
    // correr runReenumerarTemporadas(): suma el mismo delta a toda «Temporada» (también a Correcciones_Guerra.csv) y esas filas pasan a ser T1 en adelante.
    // Mientras tanto se guardan con temporada 0 o negativa (RoyaleAPI - 131). Los módulos que escriben en la hoja Guerra las saltan hasta la reenumeración.
    if (temporadaPropia < 1) anterioresT1++;

    var clanTag = _normalizarClanTagCorreccion(c.clanTag);
    var clave = temporadaPropia + '|' + semana + '|' + clanTag + '|' + tag;
    var existente = mapa[clave];

    // barcos es opcional: si no viene en el payload (o viene vacío/NaN),
    // se preserva el que ya hubiera guardado para esta clave.
    var barcosNuevo = null;
    if (c.barcos !== undefined && c.barcos !== null && c.barcos !== '') {
      var bNum = Number(c.barcos);
      if (!isNaN(bNum)) barcosNuevo = bNum;
    }
    var barcosFinal = (barcosNuevo !== null) ? barcosNuevo :
      (existente && existente.barcos !== undefined ? existente.barcos : null);

    // §PF236: Tampermonkey v3.5 manda TODAS las filas de un perfil visitado y el backend decide qué conserva.
    // Una fila del perfil (sin ClanTag) igual a la ya guardada (ataques, fame, barcos, origen y clan) no se reescribe:
    // se cuenta en «sinCambios» y no toca «Actualizado». Si la guardada quedó con Implementación «No», se reintenta.
    if (clanTag === '' && existente && existente.implementacion !== 'No') {
      var origenEntrante = String(c.fuente || '').trim().toLowerCase() === CGW_ORIGEN_PERFIL ? CGW_ORIGEN_PERFIL : CGW_ORIGEN_DESCONOCIDO;
      var barcosExistente = (existente.barcos === undefined) ? null : existente.barcos;
      if (existente.ataquesSemana === ataquesSemana && existente.fame === fame && barcosExistente === barcosFinal &&
          existente.origenPerfil === origenEntrante && (existente.clanPerfil || '') === _normalizarClanTagCorreccion(c.clanPerfil)) {
        sinCambios++;
        continue;
      }
    }

    // §PF240: la misma conservación para las filas de Log y Analytics (con ClanTag). Una fila igual a la ya guardada (ataques, fame y
    // barcos) no se reescribe ni toca «Actualizado»: se cuenta en «sinCambios». Si la guardada quedó con Implementación «No», se
    // reintenta. Estas filas siguen contando para el aviso «revisar a mano» de más abajo (clavesIgualesClan). [→ Contexto_Base_Web.md §PF240]
    if (clanTag !== '' && existente && existente.implementacion !== 'No') {
      var barcosExistenteClan = (existente.barcos === undefined) ? null : existente.barcos;
      // §PF245: si la fuente guardada ya está, no se cambia (Log y Analytics pueden traer lo mismo y no deben alternarla en cada corrida);
      // si no se sabía y ahora llega, se completa (se reescribe esa fila una vez).
      if (existente.ataquesSemana === ataquesSemana && existente.fame === fame && barcosExistenteClan === barcosFinal &&
          (existente.fuenteClan || !_cgwFuenteClanDesdeTexto_(c.fuente))) {
        sinCambios++;
        clavesIgualesClan.push(clave);
        continue;
      }
    }

    // §PF237: si la fila del perfil reemplaza un valor del perfil ya guardado y distinto, se aplica igual (el perfil es la
    // fuente de esa columna) pero se avisa «antes / ahora», para detectar una lectura mala (tabla a medias, ceros) o una
    // semana que cambia en cada corrida. No avisa si lo guardado era «desconocido» (llenarlo es justo lo esperado).
    var valoresDistintos = existente && (existente.ataquesSemana !== ataquesSemana || existente.fame !== fame ||
      (existente.barcos !== null && existente.barcos !== undefined && barcosFinal !== null && existente.barcos !== barcosFinal));
    // §PF313 (PF307 punto 4; reglas de §PF253 punto 1, por confirmar tras la contrastación con los json). Todo conflicto deja una línea en el registro de la
    // corrida (jugador, semana, clan, valor antes y ahora, fuente de cada uno y cuál ganó). Lo que NO se resuelve solo no se pisa y va también a Revision_Guerra.csv:
    //  · D: dos fuentes del mismo nivel que discrepan en la misma clave (Log contra Analytics): se conserva lo guardado.
    //  · B: valores que no caben en ninguna combinación posible de ataques, fame y barcos: si ya había otro valor, se conserva; si no había, se guarda y se avisa.
    // El caso A (misma clave, valores distintos, fuentes de distinto nivel o la misma fuente que actualiza) se aplica como siempre y solo deja la línea.
    // El caso C (clan con nombre de Terna sin enlace) y la comparación Correcciones_Nuevos contra Correcciones_Guerra siguen pendientes (§PF313).
    var fuenteEntrante = _cgwFuenteDeFila_(clanTag, c.fuente, null);
    var fuenteGuardada = existente ? _cgwFuenteDeFila_(clanTag, '', existente) : '';
    var etiquetaConflicto = 'T' + temporadaPropia + ' semana ' + semana + ' ' + tag + ' (' + (clanTag || 'perfil') + ')';
    var textoAntesC = existente ? _cgwTextoValores_(existente.ataquesSemana, existente.fame, existente.barcos) + ' [' + fuenteGuardada + ']' : '';
    var textoAhoraC = _cgwTextoValores_(ataquesSemana, fame, barcosFinal) + ' [' + fuenteEntrante + ']';
    var nombreConflicto = String(c.nombre || '');
    var mismoNivelDiscrepa = !!(existente && valoresDistintos && clanTag !== '' && fuenteGuardada !== 'desconocida' &&
      fuenteEntrante !== 'desconocida' && fuenteGuardada !== fuenteEntrante);
    var yaGuardadaIgual = !!(existente && !valoresDistintos); // reintento por Implementación «No»: el valor ya estaba, no es un conflicto nuevo
    // §PF357: antes de decir «no cabe» se prueba el caso del clan que cruzó la meta el domingo (hasta 4 ataques sin fame; _cgwSemanaPosibleClanTerminado_).
    var sinFameK = yaGuardadaIgual ? 0 : _cgwSemanaPosibleClanTerminado_(ataquesSemana, fame, barcosFinal, memoPosible);
    var noCabeSemana = !yaGuardadaIgual && sinFameK < 0;
    var hayConflicto = mismoNivelDiscrepa || noCabeSemana || (valoresDistintos && !(clanTag === '' && fuenteGuardada === 'perfil' && fuenteEntrante === 'perfil'));
    // §PF343 (2-nov-2026, regla de la usuaria): la fila del perfil de un clan que NO es Terna solo genera contradicción si hay registro de que el jugador hizo al
    // menos un ataque esa semana en algún clan Terna (Log, Analytics o River Race). Sin ese registro se ignora: el valor se aplica como siempre, sin línea de conflicto
    // ni fila en Revision_Guerra.csv. [→ Contexto_Base_Web.md §PF343]
    if (hayConflicto && clanTag === '') {
      var clanPerfilFila = _normalizarClanTagCorreccion(c.clanPerfil);
      if (clanPerfilFila && CFG.TERNA_TAGS.indexOf(clanPerfilFila) < 0 &&
          !_cgwHayAtaqueTernaEnSemana_(indiceAtaqueTerna, cacheJsonTerna, temporadaPropia, semana, tag)) {
        hayConflicto = false;
        contradiccionesExternasIgnoradas++;
      }
    }
    if (hayConflicto) {
      // (perfil contra perfil ya se avisa abajo como «antes / ahora» en cambiosPerfil; no se duplica)
      var decision, motivoRev = '';
      if (mismoNivelDiscrepa) {
        decision = 'mismo nivel: no se pisa, queda lo guardado y va a Revision_Guerra.csv';
        motivoRev = fuenteGuardada + ' y ' + fuenteEntrante + ' difieren (' + clanTag + ')';
      } else if (noCabeSemana && existente && valoresDistintos) {
        decision = 'no cabe en ninguna semana posible: no se pisa, queda lo guardado y va a Revision_Guerra.csv';
        motivoRev = 'Valor que no cabe en una semana posible (' + (clanTag || 'perfil') + ')';
      } else if (noCabeSemana) {
        decision = 'no cabe en ninguna semana posible: se guarda porque no había otro valor y va a Revision_Guerra.csv';
        motivoRev = 'Valor que no cabe en una semana posible (' + (clanTag || 'perfil') + ')';
      } else {
        decision = 'gana el valor de ahora';
      }
      contradiccionesTotal++;
      if (contradicciones.length < CGW_CONTRADICCIONES_MAX_LINEAS) {
        contradicciones.push(etiquetaConflicto + ': ' + (existente ? 'antes ' + textoAntesC + ', ' : 'sin valor guardado, ') + 'ahora ' + textoAhoraC + '; ' + decision);
      }
      if (motivoRev) {
        revisionContradicciones.push({
          temporada: temporadaPropia, semana: semana, tag: tag, nombre: nombreConflicto, tipo: CGW_CONTRADICCION_TIPO, motivo: motivoRev,
          detalle: (existente ? 'antes ' + textoAntesC + '; ' : '') + 'ahora ' + textoAhoraC + '; ' + decision, estado: CGW_CONTRADICCION_ESTADO
        });
      }
      if (mismoNivelDiscrepa || (noCabeSemana && existente && valoresDistintos)) {
        contradiccionesSinPisar++;
        if (clanTag !== '') clavesIgualesClan.push(clave); // sigue contando para el aviso «revisar a mano»
        continue;
      }
    }

    if (clanTag === '' && valoresDistintos && existente.origenPerfil === CGW_ORIGEN_PERFIL) {
      var baja0 = (ataquesSemana === 0 && fame === 0 && (existente.ataquesSemana > 0 || existente.fame > 0));
      var etiquetaCambio = 'T' + temporadaPropia + ' semana ' + semana + ' ' + tag + ': perfil antes ' + existente.ataquesSemana + ' ataques / ' +
        existente.fame + ' fame' + (existente.barcos !== null && existente.barcos !== undefined ? ' / ' + existente.barcos + ' barcos' : '') +
        ', ahora ' + ataquesSemana + ' ataques / ' + fame + ' fame' + (barcosFinal !== null ? ' / ' + barcosFinal + ' barcos' : '') +
        (baja0 ? '  BAJA A 0, REVISAR' : '');
      if (cambiosPerfil.length < 200) cambiosPerfil.push(etiquetaCambio);
    }

    if (sinFameK > 0) { // §PF357: se aplica el valor; queda dicho en el registro que se supuso clan terminado (no hay fila en Revision_Guerra.csv)
      aceptadasClanTerminadoTotal++;
      var clanCierre = clanTag !== '' ? clanTag : _normalizarClanTagCorreccion(c.clanPerfil);
      var cierreVerificado = _cgwClanTerminadoVerificado_(temporadaPropia, semana, clanCierre, cacheCierreCrr);
      if (cierreVerificado) aceptadasClanTerminadoVerificadas++;
      if (aceptadasClanTerminado.length < CGW_CONTRADICCIONES_MAX_LINEAS) {
        var repartoCierre = _cgwTextoReparto_(_cgwRepartoClanTerminado_(ataquesSemana, fame, barcosFinal, memoPosible));
        aceptadasClanTerminado.push(etiquetaConflicto + ': ' + textoAhoraC + ' cuadra con el domingo sin fame, ' + sinFameK + ' ataque(s) (' +
          (cierreVerificado ? 'verificado con la API: el clan ' + clanCierre + ' ya había cruzado la meta al empezar el domingo' : 'clan terminado, sin verificar') + ')' +
          (repartoCierre ? '. Reparto: ' + repartoCierre : ''));
      }
    }
    // Aprobación/Implementación (pregunta 4, FIX 27-ago-2026, ver comentario [→ Contexto_Base_Web.md §18B100]
    mapa[clave] = {
      ataquesSemana: ataquesSemana, barcos: barcosFinal, fame: fame, actualizado: ahora,
      aprobacion: existente ? (existente.aprobacion || '') : '',
      clanTag: clanTag
    };
    if (clanTag !== '') mapa[clave].fuenteClan = _cgwFuenteClanDesdeTexto_(c.fuente); // §PF245: el valor se reescribió, así que la fuente es la de este envío ('' si no la trae)
    // §PF164: la fila sin ClanTag es la columna RoyaleAPI; su origen es «perfil» solo si Tampermonkey (v3.2 o posterior) lo dice
    // con fuente:'perfil'. Sin ese dato (versión anterior del script, otro origen) queda «desconocido»: no se compara con los clanes.
    if (clanTag === '') {
      mapa[clave].origenPerfil = String(c.fuente || '').trim().toLowerCase() === CGW_ORIGEN_PERFIL ? CGW_ORIGEN_PERFIL : CGW_ORIGEN_DESCONOCIDO;
      // PF183 act. 16: Tampermonkey v3.3 manda clanPerfil = tag del clan de la fila del perfil (leído del enlace). Sin él queda '' (se trata como Terna, como antes).
      mapa[clave].clanPerfil = _normalizarClanTagCorreccion(c.clanPerfil);
    }
    clavesTocadas.push(clave);
    aplicadas++;
  }

  // FIX (29-sep-2026, Fase 15 tanda 1, AVISO 4): jugador-semana del lote con [→ Contexto_Base_Web.md §18B101]
  var revisarManual = [];
  var triples = {};
  var clavesParaAviso = clavesTocadas.concat(clavesIgualesClan); // §PF240: el aviso no depende de que la fila se haya reescrito
  for (var kt = 0; kt < clavesParaAviso.length; kt++) {
    var pcl = clavesParaAviso[kt].split('|'); // temporada | semana | clantag | tag
    if (pcl[2] === '') continue;
    triples[pcl[0] + '|' + pcl[1] + '|' + pcl[3]] = true;
  }
  var clavesMapa = Object.keys(mapa);
  Object.keys(triples).forEach(function (tr) {
    var tp = tr.split('|');
    var sumaAtaques = 0, clanesTr = [];
    clavesMapa.forEach(function (ck) {
      var q = ck.split('|');
      if (q[0] === tp[0] && q[1] === tp[1] && q[3] === tp[2] && q[2] !== '') {
        sumaAtaques += mapa[ck].ataquesSemana;
        clanesTr.push(q[2] + '=' + mapa[ck].ataquesSemana);
      }
    });
    if (clanesTr.length > 1) {
      revisarManual.push('T' + tp[0] + ' semana ' + tp[1] + ' ' + tp[2] + ': ' + clanesTr.length + ' clanes (' +
        clanesTr.join(', ') + '), suma de ataques ' + sumaAtaques + (sumaAtaques > 16 ? ' — MÁS DE 16, REVISAR' : ''));
    }
  });

  var avisos = [];
  // §PF313: lo que no se resolvió solo va a Revision_Guerra.csv con Estado «Pendiente». Un fallo aquí no afecta a lo ya decidido: se avisa.
  var resultadoRevision = null, avisoRevision = '';
  if (revisionContradicciones.length) {
    try {
      resultadoRevision = _registrarRevisionGuerra_(revisionContradicciones);
    } catch (eRevC) {
      avisoRevision = 'Contradicciones: no se pudo escribir Revision_Guerra.csv (' + (eRevC.message || eRevC) + ').';
      Logger.log('[CorreccionGuerra] ' + avisoRevision);
    }
  }
  if (aplicadas > 0) {
    _guardarOverlayCorreccionesGuerra(mapa);
    var falloAlgunaPropagacion = false;
    try {
      generarBackupGuerraSemanalCSV(); // 23_Control2_GuerraSemanal.gs — aplica el overlay al recalcular
    } catch (e1) {
      falloAlgunaPropagacion = true;
      var avisoCsv = 'Overlay guardado pero generarBackupGuerraSemanalCSV() falló: ' + e1.message;
      Logger.log('[CorreccionGuerra] ' + avisoCsv);
      avisos.push(avisoCsv);
    }
    try {
      actualizarControl2(); // 23_Control2_GuerraSemanal.gs — aplica el overlay a la hoja
    } catch (e2) {
      falloAlgunaPropagacion = true;
      // FIX (13-ago-2026, pedido del usuario: "Control_2 solo actualiza [→ Contexto_Base_Web.md §18B102]
      var avisoControl2 = 'Overlay guardado pero actualizarControl2() falló: ' + e2.message;
      Logger.log('[CorreccionGuerra] ' + avisoControl2);
      avisos.push(avisoControl2);
    }

    // Implementación (pregunta 4, FIX 27-ago-2026): recién aquí se conoce el [→ Contexto_Base_Web.md §18B103]
    for (var k = 0; k < clavesTocadas.length; k++) {
      mapa[clavesTocadas[k]].implementacion = falloAlgunaPropagacion ? 'No' : 'Sí';
    }
    _guardarOverlayCorreccionesGuerra(mapa);
  }

  Logger.log('[CorreccionGuerra] Aplicadas: ' + aplicadas + ', sin cambios: ' + sinCambios + ', omitidas: ' + omitidas +
    ' (de ' + correcciones.length + ' recibidas)' + (anterioresT1 ? '; ' + anterioresT1 + ' anterior(es) a T1 (temporada 0 o negativa, a la espera de la reenumeración)' : '') + '.');

  var resultado = { ok: true, aplicadas: aplicadas, omitidas: omitidas, sinCambios: sinCambios, total: correcciones.length };
  if (anterioresT1) resultado.anterioresT1 = anterioresT1; // §PF247
  if (contradiccionesExternasIgnoradas) { // §PF343
    resultado.contradiccionesExternasIgnoradas = contradiccionesExternasIgnoradas;
    Logger.log('[CorreccionGuerra] ' + contradiccionesExternasIgnoradas + ' contradicción(es) de filas de perfil de clan externo ignorada(s): sin registro de ataques en un clan Terna esa semana.');
  }
  if (aceptadasClanTerminadoTotal) { // §PF357
    resultado.aceptadasClanTerminado = aceptadasClanTerminado;
    resultado.aceptadasClanTerminadoTotal = aceptadasClanTerminadoTotal;
    resultado.aceptadasClanTerminadoVerificadas = aceptadasClanTerminadoVerificadas;
    Logger.log('[CorreccionGuerra] ' + aceptadasClanTerminadoTotal + ' fila(s) cuadran solo con ataques sin fame por clan terminado (' + aceptadasClanTerminadoVerificadas +
      ' verificada(s) con los currentriverrace de Drive, el resto sin verificar): ' +
      aceptadasClanTerminado.slice(0, 20).join(' | ') + (aceptadasClanTerminado.length > 20 ? ' | … (ver la respuesta del endpoint)' : ''));
  }
  if (revisarManual.length) resultado.revisarManual = revisarManual; // FIX 29-sep-2026 (Fase 15 tanda 1)
  if (cambiosPerfil.length) resultado.cambiosPerfil = cambiosPerfil; // §PF237
  if (contradiccionesTotal) { // §PF313: el log de la corrida; viaja en la respuesta y queda en el log de Drive del botón
    resultado.contradicciones = contradicciones;
    resultado.contradiccionesTotal = contradiccionesTotal;
    resultado.contradiccionesSinPisar = contradiccionesSinPisar;
    if (resultadoRevision) resultado.revisionContradicciones = resultadoRevision;
    if (avisoRevision) resultado.avisoRevision = avisoRevision;
    Logger.log('[CorreccionGuerra] Contradicciones: ' + contradiccionesTotal + ' (' + contradiccionesSinPisar + ' sin pisar). ' +
      contradicciones.slice(0, 20).join(' | ') + (contradicciones.length > 20 ? ' | … (ver la respuesta del endpoint)' : ''));
  }
  if (avisos.length) {
    // avisoControl2: se mantiene este nombre de campo (aunque ahora puede [→ Contexto_Base_Web.md §18B104]
    resultado.avisoControl2 = avisos.join(' | ');
    resultado.avisos = avisos;
  }
  return resultado;
}

// LISTA DE JUGADORES A CORREGIR (para el userscript) [→ Contexto_Base_Web.md §18B105]
/**
 * _obtenerListaCorreccionGuerra() [→ Contexto_Base_Web.md §18B106]
 */
function _obtenerListaCorreccionGuerra(opciones) {
  // PF041: opciones.soloClanes (Verificar semana en curso) omite Directorio y cobertura. [→ Contexto_Base_Web.md §PF041]
  var soloClanes = !!(opciones && opciones.soloClanes);
  var tInicio = Date.now();
  var ss = _getSs();
  var jugadores = [];
  if (!soloClanes) {
    // FIX (24-sep-2026, pedido del usuario -- auditoría Sheet->CSV->JSON, [→ Contexto_Base_Web.md §18B107]
    // PF042: se lee solo el Directorio físico (layout IC) en vez de _leerDirectorioFisicoComoDC(), que además leía Players y Links y armaba filas de 60 columnas para todos los registros; los seis campos que usa esta lista (estado, clan, tag, nombre, nom_multi, clan_tag) salen todos de la hoja Directorio y no se pisan con Players/Links. [→ Contexto_Base_Web.md §PF042]
    var shDirCorr = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
    var dirData;
    var ix; // índices 0-based según el layout de las filas leídas
    if (shDirCorr && shDirCorr.getLastRow() >= 2) {
      dirData = shDirCorr.getRange(2, 1, shDirCorr.getLastRow() - 1, DIR_SHEET_COLS).getValues();
      ix = { estado: IC.ESTADO - 1, clanTag: IC.CLAN_TAG - 1, tag: IC.TAG - 1, nombre: IC.NOMBRE - 1, nomMulti: IC.NOM_MULTI - 1, clan: IC.CLAN - 1 };
    } else {
      var lecturaDirCorr = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
      dirData = (lecturaDirCorr.origen === 'csv') ? lecturaDirCorr.filas : [];
      ix = { estado: DC.ESTADO - 1, clanTag: DC.CLAN_TAG - 1, tag: DC.TAG - 1, nombre: DC.NOMBRE - 1, nomMulti: DC.NOM_MULTI - 1, clan: DC.CLAN - 1 };
    }

    for (var i = 0; i < dirData.length; i++) {
      var r = dirData[i];
      if (String(r[ix.estado]) !== 'Activo') continue;
      var tag = String(r[ix.clanTag] || '').trim();
      if (CFG.TERNA_TAGS.indexOf(tag) < 0) continue;

      var tagJugador = String(r[ix.tag] || '').trim();
      if (!tagJugador) continue;

      // FIX (23-ago-2026, pedido usuario): antes se priorizaba Nom_Multi [→ Contexto_Base_Web.md §18B108]
      jugadores.push({
        tag: tagJugador,
        nombre: String(r[ix.nombre] || r[ix.nomMulti] || ''),
        clan: String(r[ix.clan] || ''),
        royaleApiUrl: 'https://royaleapi.com/player/' + tagJugador.replace('#', '') + '/'
      });
    }
  }
  var tDirectorio = Date.now();

  // PUNTO 2 (Consolidado_HistorialGuerra_Jugador.md, Sección 2.4/3.1): River [→ Contexto_Base_Web.md §18B109]
  var ctxActual = _getCtx();
  var temporadaRiverRaceActual = null;
  var semanaRiverRaceActual = null;
  if (!ctxActual.periodIndexSospechoso) {
    temporadaRiverRaceActual = ctxActual.temporada + _getTemporadaOffsetRoyaleApi();
    semanaRiverRaceActual = ctxActual.sectionIndex + 1;
  }

  var coberturaPorTag = soloClanes ? {} : _construirCoberturaPorTag();
  var mapaOverlayLista = soloClanes ? null : _cargarOverlayCorreccionesGuerraPorClan(); // §PF246: una sola lectura del CSV para las dos listas de abajo
  var cuentasVariosClanes = soloClanes ? [] : _cuentasConVariosClanesEnOverlay_(mapaOverlayLista); // §PF164: para forzar su perfil desde Tampermonkey (v3.2)
  var sinPerfilEnCsv = soloClanes ? [] : _tagsSinPerfilEnOverlay_(mapaOverlayLista); // §PF246 (punto 2 de §PF235)
  var regresadosSinPerfil = [];
  if (!soloClanes) { // §PF314 (PF253 opción B): quien salió y regresó se visita aunque ya tenga perfil guardado de antes; un fallo no frena la lista
    try { regresadosSinPerfil = _tagsRegresadosSinPerfilTrasRegreso_(mapaOverlayLista); }
    catch (eReg) { Logger.log('[CorreccionGuerra][Lista] AVISO: no se pudo calcular quién regresó (' + (eReg.message || eReg) + '); la lista sale sin ese campo.'); }
  }
  Logger.log('[CorreccionGuerra][Lista] modo=' + (soloClanes ? 'clanes' : 'completo') +
             ' · directorio ' + (tDirectorio - tInicio) + ' ms · cobertura ' + (Date.now() - tDirectorio) + ' ms · ' +
             jugadores.length + ' jugador(es) · total ' + (Date.now() - tInicio) + ' ms');

  return {
    ok: true,
    temporadaOffsetRoyaleApi: _getTemporadaOffsetRoyaleApi(),
    temporadaRoyaleApiActual: temporadaRiverRaceActual,
    semanaActual: semanaRiverRaceActual,
    clanesTerna: _getNombresClanesTernaOrdenados(),
    clanTagsTerna: CFG.TERNA_TAGS,
    jugadores: jugadores,
    // FASE 10 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3.1, pregunta [→ Contexto_Base_Web.md §18B110]
    coberturaPorTag: coberturaPorTag,
    // §PF164: tags con alguna semana en 2 o más clanes Terna (cuentas de apoyo); Tampermonkey v3.2 puede forzar su perfil. [→ Contexto_Base_Web.md §PF164]
    cuentasVariosClanes: cuentasVariosClanes,
    // §PF246: tags con datos de algún clan (Log/Analytics) en Correcciones_Guerra.csv y NINGUNA fila de perfil con origen «perfil» (el «Grupo B» de §PF235).
    // Tampermonkey v3.10 visita su perfil aunque Log/Analytics los hayan cubierto, una sola vez: al guardarse su perfil salen de esta lista.
    sinPerfilEnCsv: sinPerfilEnCsv,
    // §PF314 (PF253 opción B): activos que salieron de los clanes Terna y regresaron, sin perfil leído desde el regreso. Tampermonkey v3.17 visita su perfil (todas las semanas) y el backend decide qué reemplaza o agrega.
    regresadosSinPerfil: regresadosSinPerfil
  };
}

/**
 * _aplicarCorreccionAGuerraConReparto(fuente, offsetsPorClave, temporadaPropia, semana, tag, valores, opciones,… [→ Contexto_Base_Web.md §18B080]
 */
function _aplicarCorreccionAGuerraConReparto(fuente, offsetsPorClave, temporadaPropia, semana, tag, valores, opciones, stats) {
  opciones = opciones || {};
  stats = stats || {};
  var clave = String(tag).trim() + '|' + String(semana).trim();
  var offsetsClave = offsetsPorClave[clave];

  if (offsetsClave) {
    // ---- MODO AJUSTE ----
    // Varios clanes (§PF131): esta rama no sabe de clanes (offsetsClave guarda una sola fila por dia, la de
    // mayor PeriodIndex, sea del clan que sea) y escribiria el total del jugador sobre filas de clanes distintos.
    // Si el jugador tiene filas en mas de un clan esa semana, no se escribe nada y se avisa en Revision_Guerra.csv.
    var clanesDeLaSemana = Object.keys(_indexarFilasJugadorSemanaPorClan_(fuente.filas, temporadaPropia, semana, tag));
    if (clanesDeLaSemana.length > 1) {
      stats.variosClanes = (stats.variosClanes || 0) + 1;
      var detVarios = 'clanes con filas esa semana: ' + clanesDeLaSemana.join(', ') + '; correccion sin ClanTag: ataques ' + valores.ataquesSemana + ', fame ' + valores.fame;
      Logger.log('[Sin ClanTag, varios clanes] SIN CAMBIOS T' + temporadaPropia + ' S' + semana + ' ' + tag + ': ' + detVarios + '. No se toca.');
      if (opciones.revision) opciones.revision.push({ temporada: temporadaPropia, semana: semana, tag: tag, nombre: '', tipo: 'alarma', motivo: 'correccion sin ClanTag con varios clanes en la semana', detalle: detVarios });
      return { modo: 'ajuste', huboCambio: false, variosClanes: true };
    }
    // Reparto conjunto (§PF122): si ninguna combinacion de la tabla cuadra, no se toca nada y se avisa.
    var rep = _repartirSemanaConjunto_(fuente.filas, offsetsClave, valores);
    if (!rep.ok) {
      stats.sinCombinacion = (stats.sinCombinacion || 0) + 1;
      Logger.log('[Reparto conjunto] SIN CAMBIOS T' + temporadaPropia + ' S' + semana + ' ' + tag + ': ' + rep.motivo + '. No se toca.');
      var conflictoCrr = rep.crr === 'conflicto';
      if (conflictoCrr) stats.conflictoCrr = (stats.conflictoCrr || 0) + 1;
      if (opciones.revision) opciones.revision.push({ temporada: temporadaPropia, semana: semana, tag: tag, nombre: '', tipo: 'alarma', motivo: conflictoCrr ? 'conflicto con CurrentRiverRace: revision manual' : 'reparto conjunto sin combinacion', detalle: rep.motivo });
      return { modo: 'ajuste', huboCambio: false, sinCombinacion: true, conflictoCrr: conflictoCrr, motivo: rep.motivo };
    }

    var offsetsOrdenados = Object.keys(offsetsClave).map(Number).sort(function (a, b) { return b - a; });
    fuente.filas[offsetsClave[offsetsOrdenados[0]]][GC.ATAQUES_SEM - 1] = valores.ataquesSemana;

    if (opciones.temporadaRoyaleApi) {
      for (var od = 0; od < offsetsOrdenados.length; od++) {
        fuente.filas[offsetsClave[offsetsOrdenados[od]]][GC.TEMPORADA_2 - 1] = opciones.temporadaRoyaleApi;
      }
    }

    var huboCambio = rep.huboCambio;
    if (huboCambio) _marcarOrigenCorregido(fuente.filas, offsetsClave);

    stats.corregidas = (stats.corregidas || 0) + 1;
    return { modo: 'ajuste', huboCambio: huboCambio };
  }

  // ---- MODO RECONSTRUCCIÓN COMPLETA (punto 1.5) ----
  opciones.ultimoRepartoFallido = null;
  opciones.ultimaReconstruccionClanTerminado = null;
  opciones.sinClanReconstruccion = false;
  opciones.sinPresenciaReconstruccion = false; // §PF436
  var offsetsNuevos = _reconstruirSemanaDesdeCero(fuente, temporadaPropia, semana, tag, valores, opciones);
  if (!offsetsNuevos && opciones.sinPresenciaReconstruccion) {
    // §PF436: sin evidencia de que el jugador estuviera en el clan esa semana: no se crea nada y va a revisión (no cuenta como «sin combinación»).
    stats.sinPresencia = (stats.sinPresencia || 0) + 1;
    if (opciones.revision) opciones.revision.push({ temporada: temporadaPropia, semana: semana, tag: tag, nombre: '', tipo: 'alarma', motivo: 'presencia no establecida: no se crearon las filas (reconstruccion)', detalle: String(opciones.detallePresenciaReconstruccion || '') });
    return { modo: 'reconstruccion', huboCambio: false, sinPresencia: true };
  }
  if (!offsetsNuevos && opciones.sinClanReconstruccion) {
    // §PF402: no se conoce el clan: no se crea nada y va a revision (no cuenta como «sin combinacion»).
    stats.sinClan = (stats.sinClan || 0) + 1;
    if (opciones.revision) opciones.revision.push({ temporada: temporadaPropia, semana: semana, tag: tag, nombre: '', tipo: 'alarma', motivo: 'sin clan: no se crearon las filas (reconstruccion)', detalle: 'el jugador no figura en el Directorio y la correccion no trae su clan de esa semana' });
    return { modo: 'reconstruccion', huboCambio: false, sinClan: true };
  }
  if (!offsetsNuevos) {
    stats.sinCombinacion = (stats.sinCombinacion || 0) + 1;
    var fallo = opciones.ultimoRepartoFallido || null;
    var conflictoCrr2 = !!fallo && fallo.crr === 'conflicto';
    if (conflictoCrr2) stats.conflictoCrr = (stats.conflictoCrr || 0) + 1;
    if (opciones.revision) opciones.revision.push({ temporada: temporadaPropia, semana: semana, tag: tag, nombre: '', tipo: 'alarma', motivo: conflictoCrr2 ? 'conflicto con CurrentRiverRace: revision manual (reconstruccion)' : 'reparto conjunto sin combinacion (reconstruccion)', detalle: fallo ? fallo.motivo + '; no se crearon las filas' : 'no se crearon las filas' });
    return { modo: 'reconstruccion', huboCambio: false, sinCombinacion: true, conflictoCrr: conflictoCrr2 };
  }
  offsetsPorClave[clave] = offsetsNuevos;
  stats.reconstruidas = (stats.reconstruidas || 0) + 1;
  if (opciones.ultimaReconstruccionClanTerminado) stats.reconstruidasClanTerminado = (stats.reconstruidasClanTerminado || 0) + 1; // §PF358
  return { modo: 'reconstruccion', huboCambio: true };
}

/**
 * _aplicarCorreccionOverlayAFuente_(fuente, offsetsPorClave, temporadaPropia, semana, tag, v, opciones, stats) [→ Contexto_Base_Web.md §18B021]
 */
function _aplicarCorreccionOverlayAFuente_(fuente, offsetsPorClave, temporadaPropia, semana, tag, v, opciones, stats) {
  opciones = opciones || {};
  var conClanTag = CORRECCION_CON_CLANTAG_POR_CLAN && v && v.clanes && v.clanes.some(function (c) { return c !== ''; });
  if (conClanTag) {
    return _aplicarCorreccionConClanTagAFuente_(fuente, offsetsPorClave, temporadaPropia, semana, tag, v, opciones, stats);
  }
  var sinClanTag = CORRECCION_SIN_CLANTAG_REPARTO_DOMINGO && v && v.clanes && v.clanes.length > 0 &&
    v.clanes.every(function (c) { return c === ''; });
  var clave = String(tag).trim() + '|' + String(semana).trim();
  if (sinClanTag && offsetsPorClave[clave]) {
    var r = _aplicarRepartoDomingoSinClanTagAFuente_(
      fuente, temporadaPropia, semana, tag,
      { ataquesSemana: v.ataquesSemana, fame: v.fame, barcos: v.barcos },
      opciones, stats);
    if (r.estado !== 'sin-filas') return { modo: 'reparto-domingo', huboCambio: r.escrito };
  }
  return _aplicarCorreccionAGuerraConReparto(
    fuente, offsetsPorClave, temporadaPropia, semana, tag,
    { ataquesSemana: v.ataquesSemana, fame: v.fame, barcos: v.barcos },
    opciones, stats);
}

// RAMA CON ClanTag -- SEGUNDA PARTE, PRIMER TRAMO (Fase 15, Tanda 3, sub-tanda 3.3c-2a, [→ Contexto_Base_Web.md §18B024]
/**
 * _mapaNombresClanTerna_(ternaTags) [→ Contexto_Base_Web.md §18B025]
 */
function _mapaNombresClanTerna_(ternaTags) {
  var nombres = {};
  var i;
  for (i = 0; i < ternaTags.length; i++) nombres[ternaTags[i]] = '';
  try {
    var sh = _getSs().getSheetByName(CFG.SHEETS.CLAN);
    if (sh && sh.getLastRow() >= 2) {
      var data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues(); // Orden, ClanTag, Nombre
      for (i = 0; i < data.length; i++) {
        var t = _normalizarClanTagCorreccion(data[i][1]);
        var n = String(data[i][2] || '').trim();
        if (n && Object.prototype.hasOwnProperty.call(nombres, t)) nombres[t] = n;
      }
    }
  } catch (eHoja) { /* se intenta el respaldo de abajo */ }
  for (i = 0; i < ternaTags.length; i++) {
    if (nombres[ternaTags[i]]) continue;
    try {
      var r = String(_resolverNombreClan(ternaTags[i]) || '').trim();
      if (r && r !== ternaTags[i]) nombres[ternaTags[i]] = r;
    } catch (eRes) { /* queda sin resolver */ }
  }
  var cuenta = {};
  for (i = 0; i < ternaTags.length; i++) { var nn = nombres[ternaTags[i]]; if (nn) cuenta[nn] = (cuenta[nn] || 0) + 1; }
  for (i = 0; i < ternaTags.length; i++) { if (nombres[ternaTags[i]] && cuenta[nombres[ternaTags[i]]] > 1) nombres[ternaTags[i]] = ''; }
  return nombres;
}

/**
 * _registrarRevisionGuerra_(entradas) [→ Contexto_Base_Web.md §18B022]
 */
function _registrarRevisionGuerra_(entradas) {
  var resultado = { nuevas: 0, actualizadas: 0, sinCambio: 0 };
  if (!entradas || !entradas.length) return resultado;
  var ncol = REVISION_GUERRA_ENCABEZADO.length;
  var filas = [];
  var texto = _loadCSVFromDrive(REVISION_GUERRA_CSV);
  if (texto) {
    var parsed = _parseCSV(texto);
    if (parsed && parsed.length > 1) {
      for (var i = 1; i < parsed.length; i++) {
        var f = parsed[i].slice(0, ncol);
        while (f.length < ncol) f.push('');
        filas.push(f);
      }
    }
  }
  var indice = {};
  for (var k = 0; k < filas.length; k++) {
    indice[[filas[k][2], filas[k][3], filas[k][4], filas[k][6], filas[k][7]].join('|')] = k;
  }
  var ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT-5', 'yyyy-MM-dd HH:mm:ss');
  for (var e = 0; e < entradas.length; e++) {
    var en = entradas[e];
    var clave = [String(en.temporada), String(en.semana), String(en.tag), String(en.tipo), String(en.motivo)].join('|');
    var pos = indice[clave];
    if (pos === undefined) {
      filas.push(['', ahora, en.temporada, en.semana, en.tag, en.nombre || '', en.tipo, en.motivo, en.detalle || '', en.estado || '']); // §PF313: en.estado es opcional («Pendiente» para las contradicciones)
      indice[clave] = filas.length - 1;
      resultado.nuevas++;
    } else if (String(filas[pos][8]) !== String(en.detalle || '')) {
      filas[pos][1] = ahora;
      filas[pos][5] = en.nombre || filas[pos][5];
      filas[pos][8] = en.detalle || '';
      resultado.actualizadas++;
    } else {
      resultado.sinCambio++;
    }
  }
  if (resultado.nuevas === 0 && resultado.actualizadas === 0) return resultado; // nada que reescribir
  for (var n = 0; n < filas.length; n++) filas[n][0] = n + 1;
  _saveCSVToDrive(REVISION_GUERRA_CSV, _encodeCSV([REVISION_GUERRA_ENCABEZADO].concat(filas)));
  return resultado;
}

/**
 * _cnvCompararNuevosConGuerra_(textoNuevos, textoGuerra, nombresPorTag, tope) (§PF329, 1-nov-2026). Función pura: no lee ni escribe Drive.
 * La clave común es el jugador, la temporada de RoyaleAPI y la semana: el «136-2» de la columna Temporada de Correcciones_Nuevos.csv es la temporada 136 de RoyaleAPI y su
 * semana 2 (el número de la derecha, contado desde 1), igual que «Temporada RoyaleAPI» y «Semana» de Correcciones_Guerra.csv (formato ancho). La temporada interna no se usa
 * (la reenumeración la cambia y la de RoyaleAPI no). El clan sale del ClanTag de Nuevos o, si falta, del nombre cuando es el de UN solo clan de Terna (nombresPorTag: tag -> nombre,
 * vacío si el nombre se repite). Se comparan ataques, fame (contra Medallas) y barcos solo cuando AMBOS archivos traen el valor de ese clan; un hueco no es diferencia.
 * Nada se pisa: devuelve las entradas para _registrarRevisionGuerra_ (Tipo «Contradicción», Estado «Pendiente»), hasta `tope`.
 * Devuelve { stats, entradas } o { error }.
 */
function _cnvCompararNuevosConGuerra_(textoNuevos, textoGuerra, nombresPorTag, tope) {
  var stats = { filasNuevos: 0, sinClan: 0, sinFilaGuerra: 0, sinDatoDelClan: 0, comparadas: 0, iguales: 0, diferentes: 0 };
  var entradas = [];
  var pN = _parseCSV(_cgwQuitarBom_(textoNuevos));
  var pG = _parseCSV(_cgwQuitarBom_(textoGuerra));
  if (!pN || pN.length < 2) return { error: 'Correcciones_Nuevos.csv no tiene filas.' };
  if (!pG || pG.length < 2) return { error: 'Correcciones_Guerra.csv no tiene filas.' };
  if (!_cgwEsFormatoAncho_(pG[0])) return { error: 'Correcciones_Guerra.csv no está en el formato ancho; solo se compara con ese formato.' };

  function celda(fila, idx) { return (idx === undefined || fila[idx] === undefined || fila[idx] === null) ? '' : String(fila[idx]).trim(); }
  function numero(x) { if (x === '') return null; var v = Number(String(x).replace(',', '.')); return isFinite(v) ? v : null; }
  function mostrar(x) { return x === null ? 'sin dato' : x; }

  // Correcciones_Guerra.csv: 'tag|temporadaRoyaleApi|semana' -> { temporadaInterna, clanes: { clanTag: { ataques, barcos, medallas } } }
  var encG = pG[0].map(function (h) { return String(h).trim(); });
  var colG = {}, colClan = {}, h, m;
  var reClan = /^(Ataques|Barcos|Medallas) (#[0-9A-Za-z]+)$/;
  for (h = 0; h < encG.length; h++) {
    colG[encG[h]] = h;
    m = reClan.exec(encG[h]);
    if (m) { var ct = _normalizarClanTagCorreccion(m[2]); if (!colClan[ct]) colClan[ct] = {}; colClan[ct][m[1]] = h; }
  }
  var guerra = {}, i;
  for (i = 1; i < pG.length; i++) {
    var fg = pG[i];
    var tagG = celda(fg, colG['Tag']), rapiG = celda(fg, colG['Temporada RoyaleAPI']), semG = celda(fg, colG['Semana']);
    if (!tagG || !rapiG || !semG) continue;
    var ent = { temporadaInterna: celda(fg, colG['Temporada']), clanes: {} };
    Object.keys(colClan).forEach(function (c) {
      var v = { ataques: numero(celda(fg, colClan[c].Ataques)), barcos: numero(celda(fg, colClan[c].Barcos)), medallas: numero(celda(fg, colClan[c].Medallas)) };
      if (v.ataques !== null || v.barcos !== null || v.medallas !== null) ent.clanes[c] = v;
    });
    guerra[tagG + '|' + rapiG + '|' + semG] = ent;
  }

  // nombre de clan (minúsculas) -> clanTag, solo para los nombres que identifican a un único clan de Terna
  var tagPorNombre = {};
  Object.keys(nombresPorTag || {}).forEach(function (t) {
    var nom = String(nombresPorTag[t] || '').trim().toLowerCase();
    if (nom) tagPorNombre[nom] = _normalizarClanTagCorreccion(t);
  });

  var encN = pN[0].map(function (x) { return String(x).trim(); });
  var colN = {};
  encN.forEach(function (x, idx) { colN[x] = idx; });
  for (i = 1; i < pN.length; i++) {
    var fn = pN[i];
    var tagN = celda(fn, colN['Tag']), temporadaN = celda(fn, colN['Temporada']);
    var partes = temporadaN.split('-');
    if (!tagN || partes.length !== 2) continue;
    stats.filasNuevos++;
    var clanNombre = celda(fn, colN['Clan']);
    var clanTag = celda(fn, colN['ClanTag']) ? _normalizarClanTagCorreccion(celda(fn, colN['ClanTag'])) : (tagPorNombre[clanNombre.toLowerCase()] || '');
    if (!clanTag || !colClan[clanTag]) { stats.sinClan++; continue; }
    var g = guerra[tagN + '|' + partes[0] + '|' + partes[1]];
    if (!g) { stats.sinFilaGuerra++; continue; }
    var vg = g.clanes[clanTag];
    if (!vg) { stats.sinDatoDelClan++; continue; }
    var vn = { ataques: numero(celda(fn, colN['Ataques'])), fame: numero(celda(fn, colN['Fame'])), barcos: numero(celda(fn, colN['Barcos'])) };
    var distintas = [];
    if (vn.ataques !== null && vg.ataques !== null && vn.ataques !== vg.ataques) distintas.push('ataques');
    if (vn.fame !== null && vg.medallas !== null && vn.fame !== vg.medallas) distintas.push('fame');
    if (vn.barcos !== null && vg.barcos !== null && vn.barcos !== vg.barcos) distintas.push('barcos');
    var comparable = (vn.ataques !== null && vg.ataques !== null) || (vn.fame !== null && vg.medallas !== null) || (vn.barcos !== null && vg.barcos !== null);
    if (!comparable) { stats.sinDatoDelClan++; continue; }
    stats.comparadas++;
    if (!distintas.length) { stats.iguales++; continue; }
    stats.diferentes++;
    if (entradas.length >= (tope || 300)) continue;
    entradas.push({
      temporada: g.temporadaInterna, semana: partes[1], tag: tagN, nombre: '', tipo: CGW_CONTRADICCION_TIPO,
      motivo: 'Nuevos y Guerra difieren (' + (clanNombre || clanTag) + ')', estado: CGW_CONTRADICCION_ESTADO,
      detalle: 'Difieren en ' + distintas.join(', ') + '. Correcciones_Nuevos.csv: ataques ' + mostrar(vn.ataques) + ', fame ' + mostrar(vn.fame) + ', barcos ' + mostrar(vn.barcos) +
        '. Correcciones_Guerra.csv (' + clanTag + '): ataques ' + mostrar(vg.ataques) + ', medallas ' + mostrar(vg.medallas) + ', barcos ' + mostrar(vg.barcos) + '. No se cambió ninguno de los dos.'
    });
  }
  return { stats: stats, entradas: entradas };
}

// §PF358: pasos de la cadena CORRGUERRA (aplicarCorreccionGuerraATodasLasTemporadas). Estado entre tandas: propiedad CORRGUERRA_ESTADO (JSON) con { ultima: última temporada terminada,
// parcial: { temp, idx, n, stats } de la temporada a medias, temporadas: cuántas se terminaron, st: suma de las estadísticas }. Lo hecho se deduce del propio orden de las claves.
// [→ Contexto_Base_Web.md §PF358]

/** Paso 1 de CORRGUERRA: refresca el caché de clanes (como hacían las demás funciones de este tema); si falla se continúa igual. */
function _cgwPasoCorrGuerraCache_() {
  try {
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'CorreccionGuerra');
  } catch (eFetch) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] AVISO: no se pudo refrescar el cache de clanes (' + eFetch.message + '). Se continúa igual.');
  }
}

/** Suma, clave por clave, las estadísticas numéricas de `origen` en `destino`. */
function _cgwSumarStats_(destino, origen) {
  Object.keys(origen || {}).forEach(function (k) {
    if (typeof origen[k] === 'number') destino[k] = (destino[k] || 0) + origen[k];
  });
  return destino;
}

/**
 * Paso 2 de CORRGUERRA. Aplica las correcciones de Correcciones_Guerra.csv temporada por temporada (de la menor a la mayor) y, dentro de cada una, clave por clave
 * (jugador-semana). Cuando la tanda agota su presupuesto guarda la fuente de guerra, anota el avance (claves hechas de las totales) y devuelve false: el motor programa
 * la continuación y esta función retoma en la clave siguiente. Devuelve undefined cuando ya no queda nada. Siempre procesa al menos una clave por llamada, para que haya avance.
 */
function _cgwPasoCorrGuerraAplicar_() {
  var etq = '[Corregir Guerra<-RoyaleAPI]';
  var props = PropertiesService.getScriptProperties();
  var inicioMs = INICIO_TANDA_MS_ || Date.now();
  var agotado = function () { return (Date.now() - inicioMs) >= CFG.CORRGUERRA_PRESUPUESTO_MS; };
  var ctxReal = _getCtx();
  var overlay = _cargarOverlayCorreccionesGuerra();
  var todasLasClaves = Object.keys(overlay);
  if (!todasLasClaves.length) { Logger.log(etq + ' ' + CORRECCIONES_GUERRA_CSV + ' está vacío, nada que aplicar.'); return; }

  var porTemporada = {};
  for (var i = 0; i < todasLasClaves.length; i++) {
    var temporadaClave = todasLasClaves[i].split('|')[0];
    if (!porTemporada[temporadaClave]) porTemporada[temporadaClave] = [];
    porTemporada[temporadaClave].push(todasLasClaves[i]);
  }
  var temporadas = Object.keys(porTemporada).sort(function (a, b) { return Number(a) - Number(b); });

  var est = null;
  try { est = JSON.parse(props.getProperty('CORRGUERRA_ESTADO') || 'null'); } catch (eEst) { est = null; }
  if (!est) {
    est = { ultima: null, parcial: null, temporadas: 0, st: {} };
    temporadas.forEach(function (ts) { // §PF247: anteriores a T1; no existen en Guerra y no se crean filas con temporada 0 o negativa hasta la reenumeración
      if (Number(ts) < 1) Logger.log(etq + ' Temporada ' + ts + ': ' + porTemporada[ts].length + ' clave(s) anteriores a T1, se dejan en el CSV hasta la reenumeración.');
    });
  }

  // Total de claves a procesar y las ya hechas (por el orden de las temporadas y el índice de la temporada a medias).
  var total = 0, previas = 0;
  temporadas.forEach(function (ts) {
    var n = Number(ts);
    if (n < 1) return;
    total += porTemporada[ts].length;
    if (est.ultima !== null && n <= est.ultima) previas += porTemporada[ts].length;
    else if (est.parcial && est.parcial.temp === n && est.parcial.n === porTemporada[ts].length) previas += est.parcial.idx;
  });

  var ternaOrden = [];
  try { ternaOrden = _getNombresClanesTernaOrdenados(); } catch (eTerna) { ternaOrden = []; }
  var nombresPorTag;
  try { nombresPorTag = _mapaNombresClanTerna_(CFG.TERNA_TAGS.slice()); } catch (eNom) { nombresPorTag = undefined; }

  var estaTanda = 0, cortado = false;
  for (var t = 0; t < temporadas.length && !cortado; t++) {
    var temporadaPropia = Number(temporadas[t]);
    if (temporadaPropia < 1) continue;
    if (est.ultima !== null && temporadaPropia <= est.ultima) continue;
    var claves = porTemporada[temporadas[t]];

    var idx = 0, statsTemp = {};
    if (est.parcial && est.parcial.temp === temporadaPropia) {
      if (est.parcial.n === claves.length) { idx = est.parcial.idx; statsTemp = est.parcial.stats || {}; }
      else Logger.log(etq + ' Temporada ' + temporadaPropia + ': las correcciones cambiaron entre tandas (' + est.parcial.n + ' → ' + claves.length + ' claves); se repasa desde la primera, lo ya aplicado no cambia.');
    }
    if (estaTanda > 0 && agotado()) { cortado = true; break; } // no se abre otra temporada si ya no hay tiempo

    var fuente = _cargarFuenteGuerraParaTemporada(temporadaPropia, ctxReal.temporada);
    if (!fuente) {
      Logger.log(etq + ' Temporada ' + temporadaPropia + ': no se pudo cargar la fuente, se omite.');
      est.ultima = temporadaPropia; est.parcial = null; est.temporadas++;
      props.setProperty('CORRGUERRA_ESTADO', JSON.stringify(est));
      continue;
    }

    var offsetsPorClave = _construirOffsetsPorClave(fuente.filas, temporadaPropia);
    var stats = {};
    var revisionAcum = [];
    var temporadaRoyaleApi = _getTemporadaRoyaleApiDesdePropia(temporadaPropia);
    var idxInicial = idx;
    while (idx < claves.length) {
      var partes = claves[idx].split('|');
      _aplicarCorreccionOverlayAFuente_(
        fuente, offsetsPorClave, temporadaPropia, Number(partes[1]), partes[2], overlay[claves[idx]],
        { temporadaRoyaleApi: temporadaRoyaleApi, revision: revisionAcum, ternaOrden: ternaOrden, nombresPorTag: nombresPorTag }, stats
      );
      idx++; estaTanda++;
      if (idx < claves.length && agotado()) { cortado = true; break; }
    }

    _guardarFuenteGuerra(fuente);
    try { _registrarRevisionGuerra_(revisionAcum); } catch (eRev) {
      Logger.log(etq + ' Corrección aplicada pero no se pudo escribir ' + REVISION_GUERRA_CSV + ': ' + eRev.message);
    }
    stats.claves = idx - idxInicial;
    _cgwSumarStats_(statsTemp, stats);
    _cgwSumarStats_(est.st, stats);

    if (idx >= claves.length) {
      est.ultima = temporadaPropia; est.parcial = null; est.temporadas++;
      Logger.log(etq + ' Temporada ' + temporadaPropia + ': ' + claves.length +
        ' clave(s). Ajustadas: ' + (statsTemp.corregidas || 0) + '. Reconstruidas desde cero: ' + (statsTemp.reconstruidas || 0) +
        (statsTemp.reconstruidasClanTerminado ? ' (' + statsTemp.reconstruidasClanTerminado + ' con el domingo sin fame del clan terminado)' : '') +
        '. Con ClanTag: aplicadas ' + (statsTemp.ccAplicadas || 0) + ', reconstruidas ' + (statsTemp.ccReconstruidas || 0) + ', alarmas ' + (statsTemp.ccAlarmas || 0) +
        ', revertidas ' + (statsTemp.ccRevertidos || 0) + ', incompletas ' + (statsTemp.ccIncompletos || 0) + '.');
    } else {
      est.parcial = { temp: temporadaPropia, idx: idx, n: claves.length, stats: statsTemp };
      Logger.log(etq + ' Temporada ' + temporadaPropia + ': corte por tiempo tras ' + idx + ' de ' + claves.length + ' clave(s); la tanda siguiente retoma en la clave ' + (idx + 1) + '.');
    }
    props.setProperty('CORRGUERRA_ESTADO', JSON.stringify(est));
  }

  if (cortado) {
    _logProgresoPaso_('Corregir Guerra<-RoyaleAPI', 'Correcciones de guerra aplicadas', previas, estaTanda, total, 'clave(s) jugador-semana');
    return false;
  }
}

/** Paso 3 de CORRGUERRA: repinta la hoja Control. Si falla lo dice y sigue (lo corregido ya está guardado). */
function _cgwPasoCorrGuerraControl_() {
  try { updateControlSheet(); } catch (e1) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] Corrección aplicada pero no se pudo repintar la hoja Control: ' + e1.message);
  }
}

/** Paso 4 de CORRGUERRA: repinta la hoja Control_2. Si falla lo dice y sigue (lo corregido ya está guardado). */
function _cgwPasoCorrGuerraControl2_() {
  try { actualizarControl2(); } catch (e2) {
    Logger.log('[Corregir Guerra<-RoyaleAPI] Corrección aplicada pero no se pudo repintar la hoja Control_2: ' + e2.message);
  }
}

/** Resumen final de CORRGUERRA (el mismo que escribía la versión de una sola ejecución), a partir del estado guardado entre tandas. */
function _cgwResumenCorrGuerra_(props) {
  var est = null;
  try { est = JSON.parse(props.getProperty('CORRGUERRA_ESTADO') || 'null'); } catch (e) { est = null; }
  if (!est) { Logger.log('[Corregir Guerra<-RoyaleAPI] TODAS LAS TEMPORADAS: sin resumen (no quedó estado guardado).'); return; }
  var s = est.st || {};
  Logger.log('[Corregir Guerra<-RoyaleAPI] TODAS LAS TEMPORADAS: ' + est.temporadas + ' temporada(s), ' + (s.claves || 0) + ' clave(s) procesada(s) en total. Ajustadas: ' + (s.corregidas || 0) +
    '. Sin clan (no se crearon filas): ' + (s.sinClan || 0) + '. Reconstruidas desde cero: ' + (s.reconstruidas || 0) + (s.reconstruidasClanTerminado ? ' (' + s.reconstruidasClanTerminado + ' con el domingo sin fame del clan terminado)' : '') +
    '. Con ClanTag: aplicadas ' + (s.ccAplicadas || 0) + ', reconstruidas ' + (s.ccReconstruidas || 0) + ', alarmas ' + (s.ccAlarmas || 0) + ', revertidas ' + (s.ccRevertidos || 0) +
    ', incompletas ' + (s.ccIncompletos || 0) + '.');
}

// ----- Reparto, reconstrucción y cobertura -----

/**
 * _repartirSemanaConjunto_(filas, offsetsExistentes, valores) [→ Contexto_Base_Web.md §PF122]
 * Reemplaza el reparto por campos (barcos, piso, ataques, fame) y el «sobrante». Recibe las tres cifras a la vez
 * (valores.ataquesSemana, valores.fame y valores.barcos; barcos null = «sin dato», se conserva el actual) y busca para
 * cada fila existente (jueves a domingo) UN estado de la tabla de _fameCatalogoDia_() tal que la suma de la semana cuadre.
 * Entre las soluciones elige la que cambia menos dias (un dia que ya encaja se deja igual) y, a igual numero de dias,
 * la que se mueve menos y prefiere cambiar los dias mas recientes. Si NINGUNA combinacion cuadra NO TOCA nada y devuelve
 * { ok: false, motivo }. Escribe AtaquesHoy (diario), Barcos y Fame (acumulados) y AtaquesSemana (acumulado) en cada fila.
 * Busqueda por mitades (maximo 77 x 77 combinaciones por mitad), sin recorrer toda la semana.
 * CurrentRiverRace (§PF139, 21-oct-2026): si el modulo 56 tiene los ataques y la fame de un dia, ese dia SOLO puede tomar un estado de la tabla con
 * esas cifras (lo que falta, como los barcos o la fame de un dia sin dato, lo sigue decidiendo el reparto). Si con esas restricciones ninguna
 * combinacion suma los totales, se AVISA en el registro y se hace el reparto de siempre, sin restricciones. El resultado trae crr:
 * 'aplicado', 'conflicto' o 'sin datos'. valores.sinCurrentRiverRace = true apaga todo esto.
 * RANGOS Y MERMA (§PF301, 30-oct-2026): ANTES de encajar con la tabla se aplican los rangos de los JSON (_repartoRangosCrr_): lo que el JSON ya mostró es piso,
 * los ataques perdidos bajan el máximo semanal (con merma no se llega a 16 ni se aspira al tope de fame y barcos) y cada día solo admite estados de la tabla dentro
 * de su rango. Si con los JSON limpios (todos utilizables) los totales de RoyaleAPI no caben, NO se escribe nada (ok:false, crr:'conflicto') y el motivo va a revisión
 * manual; si la serie tiene un JSON descartado o una métrica incoherente, se avisa y se sigue con el reparto de siempre. El resultado trae crr: 'rangos', 'aplicado', 'conflicto' o 'sin datos'.
 * VARIOS CLANES (§PF302, 30-oct-2026): los rangos de un clan ya vienen sumados con lo que los JSON de los otros clanes del jugador muestran (topes de 16 ataques, 16 barcos y 3600 medallas
 * por semana entre todos los clanes). Si los JSON sumados ya rompen un tope, devuelve ok:false, crr:'conflicto' y conflictoTopes:true: no se escribe y va a revisión manual (criterio 11).
 */
function _repartirSemanaConjunto_(filas, offsetsExistentes, valores) {
  var offs = Object.keys(offsetsExistentes).map(Number).sort(function (a, b) { return a - b; });
  var k = offs.length;
  if (!k) return { ok: false, huboCambio: false, motivo: 'no hay filas de guerra para repartir' };

  var A = Number(valores.ataquesSemana);
  var F = Number(valores.fame);
  if (!isFinite(A) || A % 1 !== 0 || A < 0 || !isFinite(F) || F < 0) {
    return { ok: false, huboCambio: false, motivo: 'ataques o fame de la semana no son validos (' + valores.ataquesSemana + ', ' + valores.fame + ')' };
  }

  // Estado actual de cada fila como dia (ataques del dia; barcos y fame por diferencia de acumulados).
  var cur = [];
  var cbPrev = 0, cfPrev = 0, maxB = 0;
  for (var i = 0; i < k; i++) {
    var fila = filas[offsetsExistentes[offs[i]]];
    var cb = Number(fila[GC.BARCOS - 1]) || 0;
    var cf = Number(fila[GC.FAME - 1]) || 0;
    cur.push({ n: Number(fila[GC.ATAQUES_HOY - 1]) || 0, b: cb - cbPrev, f: cf - cfPrev });
    cbPrev = cb; cfPrev = cf;
    if (cb > maxB) maxB = cb;
  }
  var B = (valores.barcos === null || valores.barcos === undefined) ? maxB : Number(valores.barcos);
  if (!isFinite(B) || B % 1 !== 0 || B < 0) {
    return { ok: false, huboCambio: false, motivo: 'barcos de la semana no son validos (' + valores.barcos + ')' };
  }

  var catalogo = _fameCatalogoDia_();
  function costo(j, s) {
    var c = cur[j];
    if (c.n === s.n && c.b === s.b && c.f === s.f) return 0;
    return 1000000 + (3 - offs[j]) * 10000 + Math.abs(c.n - s.n) * 100 + Math.abs(c.b - s.b) * 100 + Math.abs(c.f - s.f);
  }
  function grupo(indices, cats) {
    var mapa = { '0,0,0': { a: 0, b: 0, f: 0, c: 0, p: [] } };
    for (var x = 0; x < indices.length; x++) {
      var j = indices[x];
      var nuevo = {};
      var claves = Object.keys(mapa);
      var catJ = cats[j];
      for (var q = 0; q < claves.length; q++) {
        var m = mapa[claves[q]];
        for (var t = 0; t < catJ.length; t++) {
          var s = catJ[t];
          var na = m.a + s.n, nb = m.b + s.b, nf = m.f + s.f;
          if (na > A || nb > B || nf > F) continue;
          var c = m.c + costo(j, s);
          var kk = na + ',' + nb + ',' + nf;
          if (!nuevo[kk] || c < nuevo[kk].c) nuevo[kk] = { a: na, b: nb, f: nf, c: c, p: m.p.concat([s]) };
        }
      }
      mapa = nuevo;
    }
    return mapa;
  }

  var h = Math.floor(k / 2);
  var izqIdx = [], derIdx = [];
  for (var u = 0; u < k; u++) { if (u < h) izqIdx.push(u); else derIdx.push(u); }
  function resolver(cats) {
    var izq = grupo(izqIdx, cats);
    var der = grupo(derIdx, cats);
    var mej = null;
    var clavesIzq = Object.keys(izq);
    for (var w = 0; w < clavesIzq.length; w++) {
      var li = izq[clavesIzq[w]];
      var rd = der[(A - li.a) + ',' + (B - li.b) + ',' + (F - li.f)];
      if (!rd) continue;
      var total = li.c + rd.c;
      if (mej === null || total < mej.c) mej = { c: total, p: li.p.concat(rd.p) };
    }
    return mej;
  }

  // Rangos de CurrentRiverRace (§PF301): primero lo que dicen los JSON (piso, merma y máximo semanal), después la tabla.
  function resolverConAcumulado(cats, acum) {
    function dentro(j, a, b2, f2) {
      var x = acum[j];
      if (!x) return true;
      if (x.a && (a < x.a[0] || a > x.a[1])) return false;
      if (x.b && (b2 < x.b[0] || b2 > x.b[1])) return false;
      if (x.f && (f2 < x.f[0] || f2 > x.f[1])) return false;
      return true;
    }
    // Izquierda: como grupo(), pero cada día debe dejar el acumulado dentro de su rango (la izquierda arranca en 0).
    var izq = { '0,0,0': { a: 0, b: 0, f: 0, c: 0, p: [] } };
    for (var x1 = 0; x1 < izqIdx.length; x1++) {
      var j1 = izqIdx[x1], nuevoI = {}, clavesI = Object.keys(izq);
      for (var q1 = 0; q1 < clavesI.length; q1++) {
        var m1 = izq[clavesI[q1]];
        for (var t1 = 0; t1 < cats[j1].length; t1++) {
          var s1 = cats[j1][t1], na1 = m1.a + s1.n, nb1 = m1.b + s1.b, nf1 = m1.f + s1.f;
          if (na1 > A || nb1 > B || nf1 > F || !dentro(j1, na1, nb1, nf1)) continue;
          var c1 = m1.c + costo(j1, s1), k1 = na1 + ',' + nb1 + ',' + nf1;
          if (!nuevoI[k1] || c1 < nuevoI[k1].c) nuevoI[k1] = { a: na1, b: nb1, f: nf1, c: c1, p: m1.p.concat([s1]) };
        }
      }
      izq = nuevoI;
    }
    // Derecha: se guardan TODAS las combinaciones con sus acumulados parciales (la derecha no sabe lo que sumó la izquierda hasta que se unen).
    var lista = [{ a: 0, b: 0, f: 0, c: 0, p: [], pre: [] }];
    for (var x2 = 0; x2 < derIdx.length; x2++) {
      var j2 = derIdx[x2], nuevaD = [];
      for (var q2 = 0; q2 < lista.length; q2++) {
        var m2 = lista[q2];
        for (var t2 = 0; t2 < cats[j2].length; t2++) {
          var s2 = cats[j2][t2], na2 = m2.a + s2.n, nb2 = m2.b + s2.b, nf2 = m2.f + s2.f;
          if (na2 > A || nb2 > B || nf2 > F) continue;
          nuevaD.push({ a: na2, b: nb2, f: nf2, c: m2.c + costo(j2, s2), p: m2.p.concat([s2]), pre: m2.pre.concat([[na2, nb2, nf2]]) });
        }
      }
      lista = nuevaD;
    }
    var der = {};
    lista.forEach(function (e) { var kd = e.a + ',' + e.b + ',' + e.f; (der[kd] = der[kd] || []).push(e); });
    var mej = null, clavesIzq2 = Object.keys(izq);
    for (var w = 0; w < clavesIzq2.length; w++) {
      var li = izq[clavesIzq2[w]];
      var cand = der[(A - li.a) + ',' + (B - li.b) + ',' + (F - li.f)];
      if (!cand) continue;
      for (var e2 = 0; e2 < cand.length; e2++) {
        var rd = cand[e2], bien = true;
        for (var u2 = 0; u2 < derIdx.length && bien; u2++) bien = dentro(derIdx[u2], li.a + rd.pre[u2][0], li.b + rd.pre[u2][1], li.f + rd.pre[u2][2]);
        if (!bien) continue;
        var total = li.c + rd.c;
        if (mej === null || total < mej.c) mej = { c: total, p: li.p.concat(rd.p) };
      }
    }
    return mej;
  }

  var catsLlenos = [];
  for (var v = 0; v < k; v++) catsLlenos.push(catalogo);
  var mejor = null;
  var estadoCrr = 'sin datos';
  var rng = _repartoRangosCrr_(filas, offsetsExistentes, offs, valores);
  if (rng && rng.conflictoTopes) {
    // §PF302: los JSON de los clanes del jugador, sumados, ya rompen un tope semanal (criterio 11): no se escribe nada y va a revisión manual.
    return { ok: false, huboCambio: false, crr: 'conflicto', conflictoTopes: true, motivo: 'los JSON de CurrentRiverRace de los clanes del jugador, sumados, rompen un tope semanal (' + rng.etiqueta + ': ' + rng.conflictoTopes + '); no se escribe y queda para revision manual' };
  }
  if (rng) {
    var catsRng = [];
    for (var d0 = 0; d0 < k; d0++) {
      var dr = rng.dias[d0];
      catsRng.push(catalogo.filter(function (s3) {
        return (dr.n === null || (s3.n >= dr.n[0] && s3.n <= dr.n[1])) &&
               (dr.b === null || (s3.b >= dr.b[0] && s3.b <= dr.b[1])) &&
               (dr.f === null || (s3.f >= dr.f[0] && s3.f <= dr.f[1]));
      }));
    }
    mejor = resolverConAcumulado(catsRng, rng.acum);
    if (mejor !== null) {
      estadoCrr = 'rangos';
    } else {
      estadoCrr = 'conflicto';
      var ult = rng.acum[k - 1] || null;
      var rango = function (c) { return !c ? '?' : (c[0] + ' a ' + (c[1] === Infinity ? 'sin tope' : c[1])); };
      var detalleRng = rng.etiqueta + ': ataques ' + rango(ult && ult.a) + ', barcos ' + rango(ult && ult.b) + ', fame ' + rango(ult && ult.f) + ' al cierre del ultimo dia' +
        ' (totales a repartir: ataques=' + A + ', barcos=' + B + ', fame=' + F + ')';
      if (rng.estricto) {
        return { ok: false, huboCambio: false, crr: 'conflicto', motivo: 'los totales no caben en lo que muestran los JSON de CurrentRiverRace (piso, merma y maximo semanal; ' + detalleRng + '); no se escribe y queda para revision manual' };
      }
      Logger.log('[Reparto conjunto] AVISO rangos de CurrentRiverRace (la serie tiene un JSON descartado o una metrica incoherente) ' + detalleRng + '. Se reparte como siempre, sin usarlos.');
    }
  }

  // CurrentRiverRace como restriccion (§PF139): cada dia con dato solo admite estados de la tabla con esos ataques y esa fame.
  var crr = (mejor === null) ? _repartoRestriccionesCrr_(filas, offsetsExistentes, offs, A, F, valores) : null;
  if (crr) {
    var catsCrr = [];
    for (var d = 0; d < k; d++) {
      var rest = crr.dias[d];
      catsCrr.push(catalogo.filter(function (s2) {
        return (rest.n === null || s2.n === rest.n) && (rest.f === null || s2.f === rest.f);
      }));
    }
    mejor = resolver(catsCrr);
    if (mejor !== null) {
      estadoCrr = 'aplicado';
    } else {
      estadoCrr = 'conflicto';
      Logger.log('[Reparto conjunto] AVISO CurrentRiverRace ' + crr.etiqueta + ': ataques ' + crr.dias.map(function (x) { return x.n === null ? '?' : x.n; }).join('|') +
        ', fame ' + crr.dias.map(function (x) { return x.f === null ? '?' : x.f; }).join('|') + ' no cuadran con los totales (ataques=' + A + ', barcos=' + B +
        ', fame=' + F + '). Se reparte como siempre, sin usarlos.');
    }
  }
  if (mejor === null) mejor = resolver(catsLlenos);
  if (mejor === null) {
    return { ok: false, huboCambio: false, crr: estadoCrr, motivo: 'ninguna combinacion de la tabla suma ataques=' + A + ', barcos=' + B + ', fame=' + F + ' en ' + k + ' dia(s)' };
  }

  var huboCambio = false;
  var an = 0, bn = 0, fn = 0;
  for (var z = 0; z < k; z++) {
    var fila2 = filas[offsetsExistentes[offs[z]]];
    an += mejor.p[z].n; bn += mejor.p[z].b; fn += mejor.p[z].f;
    if ((Number(fila2[GC.ATAQUES_HOY - 1]) || 0) !== mejor.p[z].n) huboCambio = true;
    if ((Number(fila2[GC.ATAQUES_SEM - 1]) || 0) !== an) huboCambio = true;
    if ((Number(fila2[GC.BARCOS - 1]) || 0) !== bn) huboCambio = true;
    if ((Number(fila2[GC.FAME - 1]) || 0) !== fn) huboCambio = true;
    fila2[GC.ATAQUES_HOY - 1] = mejor.p[z].n;
    fila2[GC.ATAQUES_SEM - 1] = an;
    fila2[GC.BARCOS - 1] = bn;
    fila2[GC.FAME - 1] = fn;
  }
  return { ok: true, huboCambio: huboCambio, crr: estadoCrr };
}

/**
 * _repartoRestriccionesCrr_(filas, offsetsExistentes, offs, A, F, valores) [→ Contexto_Base_Web.md §PF139]
 * Pide al modulo 56 los ataques y la fame por dia de CurrentRiverRace del jugador de estas filas. Temporada propia, semana y tag salen de
 * la primera fila (valores.temporada, valores.semana y valores.tag, si vienen, los reemplazan). Devuelve { etiqueta, dias: [{ n, f }] } con una
 * entrada por cada posicion de offs (null = sin dato en CurrentRiverRace), o null si no hay capturas, si estas son incoherentes, si no se pudo
 * leer Drive o si valores.sinCurrentRiverRace es true. No escribe nada.
 */
function _repartoRestriccionesCrr_(filas, offsetsExistentes, offs, A, F, valores) {
  if (valores.sinCurrentRiverRace === true || typeof _crrDiasDeJugador_ !== 'function') return null;
  try {
    var f0 = filas[offsetsExistentes[offs[0]]];
    function num(v) { var t = String(v === undefined || v === null ? '' : v).trim(); return t === '' ? NaN : Number(t); }
    var temp = num(valores.temporada !== undefined ? valores.temporada : f0[GC.TEMPORADA - 1]);
    var sem = num(valores.semana !== undefined ? valores.semana : f0[GC.SEMANA - 1]);
    var tag = _blgNormalizarTag_(valores.tag !== undefined ? valores.tag : f0[GC.TAG - 1]);
    if (!(temp > 0) || !(sem > 0) || !tag) return null;
    var etiqueta = 'T' + temp + ' S' + sem + ' ' + tag;
    var r = _crrDiasDeJugador_(temp, sem, tag, A, F);
    if (!r || !r.hayCapturas) return null;
    if (r.notas && r.notas.length) {
      Logger.log('[Reparto conjunto] CurrentRiverRace ' + etiqueta + ': capturas incoherentes (' + r.notas.join('; ') + '). No se usa; se reparte como siempre.');
      return null;
    }
    var fd = _crrFameDia_(r.fameAcum);
    var dias = [], hay = false;
    for (var i = 0; i < offs.length; i++) {
      var o = offs[i];
      var n = (r.ataques[o] === undefined) ? null : r.ataques[o];
      var f = (fd[o] === undefined) ? null : fd[o];
      dias.push({ n: n, f: f });
      if (n !== null || f !== null) hay = true;
    }
    return hay ? { etiqueta: etiqueta, dias: dias } : null;
  } catch (e) {
    Logger.log('[Reparto conjunto] No se pudo leer CurrentRiverRace: ' + e.message + '. Se reparte como siempre.');
    return null;
  }
}

/**
 * _repartoRangosCrr_(filas, offsetsExistentes, offs, valores) [→ Contexto_Base_Web.md §PF301]
 * Los rangos que dejan los JSON de CurrentRiverRace (59_Verificar_CRR_vs_Backup.gs, _vcrrRangosJugadorClan_) como restricción del reparto, ANTES de
 * encajar con la tabla de fame: para cada día, cuántos ataques, barcos y fame puede haber hecho ese día (aumento del día) y, mientras los días
 * sean consecutivos desde el jueves, entre qué valores puede estar el acumulado al cierre del día. El acumulado ya lleva la MERMA (los ataques que
 * se perdieron y lo que eso baja el tope de barcos y fame) y por eso el máximo del domingo es el máximo semanal: con ataques perdidos no se puede
 * llegar a 16. Cada métrica solo se usa si sus capturas son coherentes (serie.validos). Se calcula por clan (las filas son de un clan).
 * VARIOS CLANES (§PF302, 30-oct-2026): si el jugador tiene JSON en más de un clan esa semana, los topes valen para el jugador y no para cada clan; por eso los rangos
 * de este clan se ajustan con lo que los JSON de los OTROS clanes ya muestran (59_Verificar_CRR_vs_Backup.gs, _vcrrRangosAjustadosJugadorClan_): su máximo semanal
 * no pasa de 16 ataques, 16 barcos ni 3600 medallas menos el piso de los otros clanes. Si los JSON sumados ya rompen un tope, devuelve conflictoTopes (texto).
 * Devuelve null si no hay rangos (sin JSON, sin clan en las filas o valores.sinCurrentRiverRace),
 * o { etiqueta, estricto, dias: [{ n, b, f }], acum: [{ a, b, f } | null], estado, multiclan, conflictoTopes } con cada cota como [mínimo, máximo] o null si no hay dato.
 * estricto = true solo si todos los JSON de la serie son utilizables: ahí un total de RoyaleAPI que no cabe es un caso para revisión manual, no se
 * encaja a la fuerza ni se sigue sin los JSON. No escribe nada.
 */
function _repartoRangosCrr_(filas, offsetsExistentes, offs, valores) {
  if (valores.sinCurrentRiverRace === true || typeof _vcrrRangosJugadorClan_ !== 'function') return null;
  try {
    var f0 = filas[offsetsExistentes[offs[0]]];
    function num(v) { var t = String(v === undefined || v === null ? '' : v).trim(); return t === '' ? NaN : Number(t); }
    var temp = num(valores.temporada !== undefined ? valores.temporada : f0[GC.TEMPORADA - 1]);
    var sem = num(valores.semana !== undefined ? valores.semana : f0[GC.SEMANA - 1]);
    var tag = _blgNormalizarTag_(valores.tag !== undefined ? valores.tag : f0[GC.TAG - 1]);
    var clan = String(f0[GC.CLAN - 1] === undefined || f0[GC.CLAN - 1] === null ? '' : f0[GC.CLAN - 1]).trim();
    if (!(temp > 0) || !(sem > 0) || !tag || !clan) return null;
    var aj = (typeof _vcrrRangosAjustadosJugadorClan_ === 'function') ? _vcrrRangosAjustadosJugadorClan_(temp, sem, tag, clan) : null;
    if (!aj || !aj.serie || !aj.validos) return null;
    var serie = aj.serie;
    var etiqueta = 'T' + temp + ' S' + sem + ' ' + tag + ' ' + clan + (aj.multiclan ? ' (con sus otros clanes)' : '');
    var estrictoSerie = serie.validos.length === 3 && (serie.estado === 'ok' || serie.estado === 'multiclan');
    // Varios clanes: si los JSON sumados rompen un tope semanal no hay nada que repartir con ellos; se devuelve el motivo y quien reparte lo manda a revisión manual.
    if (aj.conflicto) return { etiqueta: etiqueta, estricto: true, dias: [], acum: [], estado: serie.estado, multiclan: true, conflictoTopes: aj.conflicto };
    var r = aj.r, hayA = aj.validos.indexOf('A') >= 0, hayB = aj.validos.indexOf('B') >= 0, hayF = aj.validos.indexOf('F') >= 0;
    var dias = [], acum = [], contiguo = true;
    for (var i = 0; i < offs.length; i++) {
      var o = offs[i];
      if (!(o >= 0 && o <= 3)) return null;
      if (o !== i) contiguo = false;   // con un día sin fila el acumulado de las filas que hay no es el de la semana: solo valen los rangos del día
      dias.push({ n: hayA ? [r.A.il[o], r.A.ih[o]] : null, b: hayB ? [r.B.il[o], r.B.ih[o]] : null, f: hayF ? [r.F.il[o], r.F.ih[o]] : null });
      acum.push(contiguo ? { a: hayA ? [r.A.lo[o], r.A.hi[o]] : null, b: hayB ? [r.B.lo[o], r.B.hi[o]] : null, f: hayF ? [r.F.lo[o], r.F.hi[o]] : null } : null);
    }
    return { etiqueta: etiqueta, estricto: estrictoSerie, dias: dias, acum: acum, estado: serie.estado, multiclan: aj.multiclan, conflictoTopes: '' };
  } catch (e) {
    Logger.log('[Reparto conjunto] No se pudieron leer los rangos de CurrentRiverRace: ' + e.message + '. Se reparte como siempre.');
    return null;
  }
}

// CORREGIR GUERRA/BACKUP_GUERRA.CSV DESDE CONTROL_2 (MANUAL, UNA SOLA VEZ) [→ Contexto_Base_Web.md §18B113]
/**
 * _corregirCampoDiarioConDistribucion(dataRows, offsetsExistentes, campoIdx1based, nuevoTotal, maxDiario) [→ Contexto_Base_Web.md §18B114]
 */
function _corregirCampoDiarioConDistribucion(dataRows, offsetsExistentes, campoIdx1based, nuevoTotal, maxDiario, pisoPorOffset) {
  pisoPorOffset = pisoPorOffset || {};
  var offsets = Object.keys(offsetsExistentes).map(Number);
  if (!offsets.length) return false;

  // PASO 0 (FIX 20-ago-2026, idempotencia): normaliza primero cada día YA [→ Contexto_Base_Web.md §18B115]
  var huboCambio = false;
  for (var j = 0; j < offsets.length; j++) {
    var offJ = offsets[j];
    var rowIdxJ = offsetsExistentes[offJ];
    var pisoJ = Math.max(0, Math.min(maxDiario, pisoPorOffset[offJ] || 0));
    var valJ = Number(dataRows[rowIdxJ][campoIdx1based - 1]) || 0;
    var clampJ = Math.max(pisoJ, Math.min(maxDiario, valJ));
    if (clampJ !== valJ) {
      dataRows[rowIdxJ][campoIdx1based - 1] = clampJ;
      huboCambio = true;
    }
  }

  var sumaActual = 0;
  for (var i = 0; i < offsets.length; i++) {
    sumaActual += Number(dataRows[offsetsExistentes[offsets[i]]][campoIdx1based - 1]) || 0;
  }
  var diff = nuevoTotal - sumaActual;
  if (diff === 0) return huboCambio;

  // Orden descendente por offset de día: SIEMPRE arranca en el mayor [→ Contexto_Base_Web.md §18B116]
  var ordenDesc = offsets.sort(function (a, b) { return b - a; });
  var restante = diff;

  for (var k = 0; k < ordenDesc.length && restante !== 0; k++) {
    var off = ordenDesc[k];
    var rowIdx = offsetsExistentes[off];
    var actual = Number(dataRows[rowIdx][campoIdx1based - 1]) || 0;
    var piso = Math.max(0, Math.min(maxDiario, pisoPorOffset[off] || 0));

    if (restante > 0) {
      var capacidad = maxDiario - actual;
      if (capacidad > 0) {
        var aplicar = Math.min(restante, capacidad);
        dataRows[rowIdx][campoIdx1based - 1] = actual + aplicar;
        restante -= aplicar;
        huboCambio = true;
      }
    } else {
      // PUNTO 1.6, paso 4: nunca bajar un día por debajo de su propio piso [→ Contexto_Base_Web.md §18B117]
      var margenSobrePiso = actual - piso;
      if (margenSobrePiso > 0) {
        var aplicar2 = Math.min(-restante, margenSobrePiso);
        dataRows[rowIdx][campoIdx1based - 1] = actual - aplicar2;
        restante += aplicar2;
        huboCambio = true;
      }
    }
  }

  // Sobrante (los días existentes no alcanzaron el tope/piso para absorber
  // toda la diferencia): se carga en el día más reciente para no perderlo.
  if (restante !== 0) {
    var rowIdxUlt = offsetsExistentes[ordenDesc[0]];
    dataRows[rowIdxUlt][campoIdx1based - 1] = (Number(dataRows[rowIdxUlt][campoIdx1based - 1]) || 0) + restante;
    huboCambio = true;
  }

  return huboCambio;
}

/**
 * _corregirCampoAcumuladoConDistribucion(dataRows, offsetsExistentes, campoIdx1based, nuevoTotal, maxDiario) [→ Contexto_Base_Web.md §18B118]
 */
function _corregirCampoAcumuladoConDistribucion(dataRows, offsetsExistentes, campoIdx1based, nuevoTotal, maxDiario) {
  var offsets = Object.keys(offsetsExistentes).map(Number).sort(function (a, b) { return a - b; }); // Jueves..Domingo
  if (!offsets.length) return false;

  // 1) Reconstruir el diario de cada día existente a partir del acumulado.
  var diarios = {};
  var acumAnterior = 0;
  for (var i = 0; i < offsets.length; i++) {
    var off = offsets[i];
    var acumHoy = Number(dataRows[offsetsExistentes[off]][campoIdx1based - 1]) || 0;
    diarios[off] = acumHoy - acumAnterior;
    acumAnterior = acumHoy;
  }

  // 1.5) PASO NUEVO (FIX 20-ago-2026, idempotencia): normaliza cada diario [→ Contexto_Base_Web.md §18B119]
  for (var jj = 0; jj < offsets.length; jj++) {
    var offJJ = offsets[jj];
    diarios[offJJ] = Math.max(0, Math.min(maxDiario, diarios[offJJ]));
  }

  // 2) Repartir la diferencia entre esos mismos días, empezando por el
  // offset más alto presente (el día más reciente ya registrado).
  var sumaDiaria = 0;
  for (var i = 0; i < offsets.length; i++) sumaDiaria += diarios[offsets[i]];
  var restante = nuevoTotal - sumaDiaria;

  var ordenDesc = offsets.slice().sort(function (a, b) { return b - a; });
  for (var k = 0; k < ordenDesc.length && restante !== 0; k++) {
    var off2 = ordenDesc[k];
    var actual = diarios[off2];

    if (restante > 0) {
      var capacidad = maxDiario - actual;
      if (capacidad > 0) {
        var aplicar = Math.min(restante, capacidad);
        diarios[off2] = actual + aplicar;
        restante -= aplicar;
      }
    } else {
      if (actual > 0) {
        var aplicar2 = Math.min(-restante, actual);
        diarios[off2] = actual - aplicar2;
        restante += aplicar2;
      }
    }
  }
  // Sobrante: se carga en el día más reciente igual, para no perderlo.
  if (restante !== 0) {
    diarios[ordenDesc[0]] += restante;
  }

  // 3) Reconstruir acumulados a partir de los diarios corregidos y
  // volver a escribirlos en sus filas respectivas (orden Jueves..Domingo).
  var acum = 0;
  var huboCambio = false;
  for (var i = 0; i < offsets.length; i++) {
    var off3 = offsets[i];
    acum += diarios[off3];
    var rowIdx = offsetsExistentes[off3];
    if ((Number(dataRows[rowIdx][campoIdx1based - 1]) || 0) !== acum) huboCambio = true;
    dataRows[rowIdx][campoIdx1based - 1] = acum;
  }

  return huboCambio;
}

/**
 * _reconstruirDeltaAcumulado(filas, offsetsExistentes, campoIdx1based) [→ Contexto_Base_Web.md §18B074]
 */
function _reconstruirDeltaAcumulado(filas, offsetsExistentes, campoIdx1based) {
  var offsets = Object.keys(offsetsExistentes).map(Number).sort(function (a, b) { return a - b; });
  var diarios = {};
  var acumAnterior = 0;
  for (var i = 0; i < offsets.length; i++) {
    var off = offsets[i];
    var acumHoy = Number(filas[offsetsExistentes[off]][campoIdx1based - 1]) || 0;
    diarios[off] = Math.max(0, acumHoy - acumAnterior);
    acumAnterior = acumHoy;
  }
  return diarios;
}

/**
 * _aplicarPisoDiario(filas, offsetsExistentes, campoIdx1based, pisoPorOffset, maxDiario) [→ Contexto_Base_Web.md §18B075]
 */
function _aplicarPisoDiario(filas, offsetsExistentes, campoIdx1based, pisoPorOffset, maxDiario) {
  var huboCambio = false;
  var offsets = Object.keys(offsetsExistentes).map(Number);
  for (var i = 0; i < offsets.length; i++) {
    var off = offsets[i];
    var rowIdx = offsetsExistentes[off];
    var piso = Math.max(0, Math.min(maxDiario, pisoPorOffset[off] || 0));
    var actual = Number(filas[rowIdx][campoIdx1based - 1]) || 0;
    if (actual < piso) {
      filas[rowIdx][campoIdx1based - 1] = piso;
      huboCambio = true;
    }
  }
  return huboCambio;
}

/**
 * _marcarOrigenCorregido(filas, offsetsExistentes) [→ Contexto_Base_Web.md §18B076]
 */
function _marcarOrigenCorregido(filas, offsetsExistentes) {
  var offsets = Object.keys(offsetsExistentes).map(Number);
  for (var i = 0; i < offsets.length; i++) {
    var rowIdx = offsetsExistentes[offsets[i]];
    var origenActual = String(filas[rowIdx][GC.ORIGEN - 1] || '').trim();
    if (origenActual === '' || origenActual === 'Original') {
      filas[rowIdx][GC.ORIGEN - 1] = 'Corregido';
    }
  }
}

/**
 * _cgwIndicePresencia_(fuente) [→ Contexto_Base_Web.md §PF436]
 * Índice de presencia sacado de las filas REALES de Guerra (Origen distinto de «Reconstruido»: Original o Corregido). Cada fila real existe porque el jugador estaba en la lista de miembros
 * del clan ese día (updateGuerraSheet() escribe una fila por participante que esté en el memberList, también en entrenamiento). Un día se identifica con clave = Temporada*1000 + PeriodIndex
 * (orden cronológico; no hace falta calcular fechas). El clan se identifica por ClanTag y, si la fila no lo trae (filas antiguas), por el nombre del clan.
 * Se arma UNA vez por fuente y se guarda en fuente.indicePresencia: durante la corrida solo se agregan filas «Reconstruido», que no entran al índice.
 * Devuelve { jugadorDias: {tag|clan: {clave: true}}, clanDias: {clan: {clave: {n, tags}}}, cubiertos: {clan: [claves ordenadas]} (se llena al consultar) }.
 */
function _cgwIndicePresencia_(fuente) {
  if (fuente.indicePresencia) return fuente.indicePresencia;
  var idx = { jugadorDias: {}, clanDias: {}, cubiertos: {} };
  var filas = fuente.filas || [];
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (_origenGuerraEs_(f[GC.ORIGEN - 1], 'Reconstruido')) continue;
    var tag = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    var t = Number(f[GC.TEMPORADA - 1]), p = Number(f[GC.PERIOD_IDX - 1]);
    if (!tag || !isFinite(t) || !isFinite(p) || String(f[GC.PERIOD_IDX - 1]).trim() === '') continue;
    var clan = String(f[GC.CLAN_TAG - 1] || '').trim().toUpperCase() || ('N:' + String(f[GC.CLAN - 1] || '').trim());
    if (clan === 'N:') continue;
    var clave = t * 1000 + p;
    var kj = tag + '|' + clan;
    if (!idx.jugadorDias[kj]) idx.jugadorDias[kj] = {};
    idx.jugadorDias[kj][clave] = true;
    if (!idx.clanDias[clan]) idx.clanDias[clan] = {};
    var d = idx.clanDias[clan][clave];
    if (!d) d = idx.clanDias[clan][clave] = { n: 0, tags: {} };
    if (!d.tags[tag]) { d.tags[tag] = true; d.n++; }
  }
  fuente.indicePresencia = idx;
  return idx;
}

/**
 * _cgwPresenciaSemana_(fuente, temporadaPropia, semana, tag, clanTag, clanNombre) [→ Contexto_Base_Web.md §PF436]
 * Regla de la usuaria (9-nov-2026): una semana solo se reconstruye desde cuando el jugador estuvo de verdad en el clan; si estuvo y no aportó nada, se registra con 0. La hora de RoyaleAPI
 * no sirve para decidirlo (puede errar unas 12 horas), así que la evidencia es propia: las filas reales de Backup_Guerra (que salen de la lista de miembros del clan).
 * Para cada día de guerra de la semana (jueves a domingo, offsets 0 a 3):
 *   a) el jugador tiene fila real ese día en ese clan -> presente;
 *   b) no la tiene pero el clan SÍ tiene registro ese día (al menos CGW_MIN_JUGADORES_COBERTURA jugadores con fila real) -> ausente: si hubiera estado, tendría fila;
 *   c) el clan no tiene registro ese día (corte de la recolección): presente solo si el jugador tiene fila real en el día con registro anterior más cercano Y en el posterior más cercano;
 *   d) el clan no tiene ningún registro en todo el archivo -> sin datos: no se puede decidir y se deja como antes (todos los días presentes).
 * La semana se reconstruye solo en los días presentes. Devuelve { dias: [bool x 4], hayPresencia, sinDatos, texto }.
 */
function _cgwPresenciaSemana_(fuente, temporadaPropia, semana, tag, clanTag, clanNombre) {
  var idx = _cgwIndicePresencia_(fuente);
  var tg = String(tag || '').trim().toUpperCase();
  var claves = [];
  var ct = String(clanTag || '').trim().toUpperCase();
  if (ct) claves.push(ct);
  var cn = String(clanNombre || '').trim();
  if (cn) claves.push('N:' + cn);
  // días con registro del clan (unión del ClanTag y del nombre) y días del jugador
  var cubierto = {}, jugador = {}, hayCobertura = false;
  for (var c = 0; c < claves.length; c++) {
    var dc = idx.clanDias[claves[c]];
    if (dc) Object.keys(dc).forEach(function (k) { if (dc[k].n >= CGW_MIN_JUGADORES_COBERTURA) { cubierto[k] = true; hayCobertura = true; } });
    var dj = idx.jugadorDias[tg + '|' + claves[c]];
    if (dj) Object.keys(dj).forEach(function (k) { jugador[k] = true; });
  }
  var res = { dias: [true, true, true, true], hayPresencia: true, sinDatos: false, texto: '' };
  if (!hayCobertura) { res.sinDatos = true; res.texto = 'el clan no tiene registros reales en el archivo: no se puede decidir la presencia'; return res; }
  var ordenados = Object.keys(cubierto).map(Number).sort(function (a, b) { return a - b; });
  var partes = [];
  var algunaPresente = false;
  for (var off = 0; off <= 3; off++) {
    var pIdx = (Number(semana) - 1) * 7 + 3 + off;
    var clave = Number(temporadaPropia) * 1000 + pIdx;
    var presente;
    if (jugador[clave]) presente = true;
    else if (cubierto[clave]) presente = false;
    else {
      var antes = null, despues = null;
      for (var q = 0; q < ordenados.length; q++) { if (ordenados[q] < clave) antes = ordenados[q]; else if (ordenados[q] > clave) { despues = ordenados[q]; break; } }
      presente = (antes !== null && despues !== null && !!jugador[antes] && !!jugador[despues]);
    }
    res.dias[off] = presente;
    if (presente) algunaPresente = true;
    partes.push('JVSD'.charAt(off) + (presente ? ' sí' : ' no'));
  }
  res.hayPresencia = algunaPresente;
  res.texto = 'presencia por día (' + partes.join(', ') + ') según las filas reales de Backup_Guerra.csv del clan';
  return res;
}

/**
 * _reconstruirSemanaDesdeCero(fuente, temporadaPropia, semana, tag, valores, opciones) [→ Contexto_Base_Web.md §18B078]
 */
function _reconstruirSemanaDesdeCero(fuente, temporadaPropia, semana, tag, valores, opciones) {
  var temporadaRoyaleApi = opciones.temporadaRoyaleApi || _getTemporadaRoyaleApiDesdePropia(temporadaPropia);
  var datosJugador = _buscarDatosJugadorParaReconstruccion(tag);
  // 6-nov-2026 (§PF402): nunca se crea una fila de Guerra sin clan. Antes, si el jugador no estaba en el Directorio, la fila salia con el nombre igual al tag y el Clan vacio (las 3920 filas de Backup_Guerra.csv). Ahora no se escribe nada y el caso va a revision.
  // 7-nov-2026 (tanda 7, Clan_Tag): el clan se identifica por Tag. Si quien llama trae el Tag (opciones.clanTag), el nombre sale de el cuando no viene aparte; la fila lleva siempre el Tag
  // del clan (el de la correccion o, si falta, el que resuelve _getClanTagByName() para los clanes Terna; vacio para un clan externo sin Tag conocido).
  var clanTagReconstruccion = _normalizarClanTagCorreccion(opciones.clanTag);
  var nombreDesdeTag = '';
  if (clanTagReconstruccion) { nombreDesdeTag = String(_resolverNombreClan(clanTagReconstruccion) || '').trim(); if (nombreDesdeTag.charAt(0) === '#') nombreDesdeTag = ''; }
  var clanReconstruccion = String(opciones.clanNombre || nombreDesdeTag || datosJugador.clan || '').trim();
  if (!clanTagReconstruccion && clanReconstruccion) clanTagReconstruccion = String(_getClanTagByName(clanReconstruccion) || '').trim().toUpperCase();
  if (!clanReconstruccion) {
    opciones.sinClanReconstruccion = true;
    Logger.log('[CorreccionGuerra] No se reconstruye T' + temporadaPropia + ' S' + semana + ' ' + tag + ': no se conoce su clan (no figura en el Directorio y la correccion no lo trae). No se crearon filas.');
    return null;
  }
  // §PF436 (9-nov-2026, regla de la usuaria): solo se reconstruye desde cuando el jugador estuvo de verdad en el clan; si no hay evidencia de presencia no se crean filas y va a revisión.
  // quien llama desde un clan concreto pasa la fuente real en opciones.fuenteEvidencia (aquí `fuente` es una temporal vacía).
  var presencia = _cgwPresenciaSemana_(opciones.fuenteEvidencia || fuente, temporadaPropia, semana, tag, clanTagReconstruccion, clanReconstruccion);
  // Si lo que se reconstruye trae ataques, barcos o fame en ESTE clan, el jugador estuvo ahí esa semana (quien no está en el clan no ataca por él): la actividad prueba la presencia. No dice en qué
  // día entró, así que se mantiene lo de antes (los 4 días). Solo un 0 puro (como el del log de un clan que lista a quien pasó por él) depende de la evidencia de las filas reales.
  if ((Number(valores.ataquesSemana) > 0) || (Number(valores.fame) > 0) || (Number(valores.barcos) > 0)) {
    presencia = { dias: [true, true, true, true], hayPresencia: true, sinDatos: false, texto: 'la semana trae ataques, barcos o fame en este clan: presencia probada por la actividad' };
  }
  if (!presencia.hayPresencia) {
    opciones.sinPresenciaReconstruccion = true;
    opciones.detallePresenciaReconstruccion = presencia.texto;
    Logger.log('[CorreccionGuerra] No se reconstruye T' + temporadaPropia + ' S' + semana + ' ' + tag + ' en ' + clanReconstruccion + ': no hay evidencia de que estuviera en el clan (' + presencia.texto + '). No se crearon filas.');
    return null;
  }
  var inicioSemanaPeriodIndex = (Number(semana) - 1) * 7;

  var offsetsNuevos = {};
  var filasAntes = fuente.filas.length;
  for (var off = 0; off <= 3; off++) {
    if (!presencia.dias[off]) continue; // §PF436: día sin presencia, no se crea fila
    var pIdx = inicioSemanaPeriodIndex + 3 + off; // 3=Jueves .. 6=Domingo
    var diaGuerraObj = calcDiaGuerraIdx(CFG.REF_DEFAULT, temporadaPropia, pIdx);

    var filaNueva = new Array(GUERRA_TOTAL_COLS).fill('');
    filaNueva[GC.NUM         - 1] = '';
    filaNueva[GC.TEMPORADA   - 1] = temporadaPropia;
    filaNueva[GC.SEMANA      - 1] = semana;
    filaNueva[GC.DIA         - 1] = periodIdxToLetra(pIdx);
    filaNueva[GC.PERIOD_IDX  - 1] = pIdx;
    filaNueva[GC.ETAPA       - 1] = 'Guerra';
    filaNueva[GC.CLAN        - 1] = clanReconstruccion; // 31-oct-2026: el clan que reporta Nuevos manda sobre el del Directorio; §PF402: nunca vacio
    filaNueva[GC.CLAN_TAG    - 1] = clanTagReconstruccion; // 7-nov-2026 (tanda 7): Tag del clan de la fila
    filaNueva[GC.TAG         - 1] = tag;
    filaNueva[GC.NOMBRE      - 1] = datosJugador.nombre;
    filaNueva[GC.ATAQUES_HOY - 1] = 0;
    filaNueva[GC.ATAQUES_SEM - 1] = 0;
    filaNueva[GC.FAME        - 1] = 0;
    filaNueva[GC.BARCOS      - 1] = 0;
    filaNueva[GC.DON_R       - 1] = ''; // no reconstruible desde RoyaleAPI (punto 1.5, paso 4)
    filaNueva[GC.DON_D       - 1] = '';
    filaNueva[GC.RANKING     - 1] = '';
    filaNueva[GC.TEMPORADA_2 - 1] = temporadaRoyaleApi;
    filaNueva[GC.ORIGEN      - 1] = 'Reconstruido';

    // FECHA/DIA_GUERRA: no hay un instante real de registro (nunca se [→ Contexto_Base_Web.md §18B079]
    if (fuente.tipo === 'hoja') {
      filaNueva[GC.FECHA      - 1] = (diaGuerraObj instanceof Date) ? diaGuerraObj : '';
      filaNueva[GC.DIA_GUERRA - 1] = (diaGuerraObj instanceof Date) ? diaGuerraObj : '';
    } else {
      filaNueva[GC.FECHA      - 1] = (diaGuerraObj instanceof Date) ? _formatFechaCanonica(diaGuerraObj, true) : '';
      filaNueva[GC.DIA_GUERRA - 1] = (diaGuerraObj instanceof Date) ? _formatFechaCanonica(diaGuerraObj) : '';
    }

    offsetsNuevos[off] = fuente.filas.length;
    fuente.filas.push(filaNueva);
  }

  // Mismo reparto conjunto que el modo ajuste (§PF122), partiendo de una base de 4 días en cero.
  // Si ninguna combinación cuadra no se crea nada: se quitan las filas recién agregadas y se devuelve null.
  var rep = _repartirSemanaConjunto_(fuente.filas, offsetsNuevos, valores);
  // §PF358 (4-nov-2026): si ninguna combinación de los 4 días cuadra (y no es un conflicto con los JSON de CurrentRiverRace, que se deja a revisión manual), se prueba la regla del
  // clan terminado de §PF357: jueves, viernes y sábado con la tabla y el domingo con k ataques sin fame (k de 1 a 4). Escribe las 4 filas con Origen «Reconstruido».
  if (!rep.ok && /^ninguna combinacion de la tabla/.test(String(rep.motivo || ''))) {
    var repTerminado = _cgwEscribirRepartoClanTerminado_(fuente.filas, offsetsNuevos, valores);
    if (repTerminado) {
      rep = { ok: true, huboCambio: true, crr: 'clan terminado' };
      if (opciones) opciones.ultimaReconstruccionClanTerminado = { k: repTerminado.k, texto: _cgwTextoReparto_(repTerminado) };
      Logger.log('[Reparto clan terminado] RECONSTRUIDA T' + temporadaPropia + ' S' + semana + ' ' + tag + ': ' + _cgwTextoValores_(valores.ataquesSemana, valores.fame, valores.barcos) +
        ' cuadra con el domingo sin fame, ' + repTerminado.k + ' ataque(s) (clan terminado, sin verificar con la API). Reparto: ' + _cgwTextoReparto_(repTerminado));
    }
  }
  if (!rep.ok) {
    fuente.filas.length = filasAntes;
    Logger.log('[Reparto conjunto] SIN CAMBIOS (reconstruccion) T' + temporadaPropia + ' S' + semana + ' ' + tag + ': ' + rep.motivo + '. No se crean las filas.');
    // §PF302: el motivo real (por ejemplo el conflicto con los JSON) llega a quien registra la revisión.
    if (opciones) { opciones.ultimoRepartoFallido = { crr: rep.crr || '', motivo: rep.motivo }; if (opciones.conflictosReparto) opciones.conflictosReparto.push({ crr: rep.crr || '', motivo: rep.motivo }); }
    return null;
  }

  var offsetsOrdenadosNuevos = Object.keys(offsetsNuevos).map(Number).sort(function (a, b) { return b - a; });
  fuente.filas[offsetsNuevos[offsetsOrdenadosNuevos[0]]][GC.ATAQUES_SEM - 1] = valores.ataquesSemana; // §PF436: el último día con presencia (antes siempre el domingo)

  return offsetsNuevos;
}

/**
 * _cgwEscribirRepartoClanTerminado_(filas, offsets, valores) [→ Contexto_Base_Web.md §PF358]
 * Escribe en las 4 filas de la semana (offsets 0 a 3: jueves a domingo) el reparto de _cgwRepartoClanTerminado_(): ataques del día, y ataques de la semana, barcos y fame acumulados.
 * Jueves, viernes y sábado salen de la tabla; el domingo lleva sus k ataques con 0 de fame (los acumulados de barcos y fame ya son los totales). barcos null se toma como 0, igual que
 * el reparto normal en una reconstrucción. Devuelve el reparto escrito, o null (sin escribir nada) si los valores no son válidos, no hacen falta k ataques sin fame o no cuadra.
 */
function _cgwEscribirRepartoClanTerminado_(filas, offsets, valores) {
  var A = Number(valores.ataquesSemana), F = Number(valores.fame);
  var B = (valores.barcos === null || valores.barcos === undefined) ? 0 : Number(valores.barcos);
  if (!isFinite(A) || A % 1 !== 0 || A < 0 || !isFinite(F) || F < 0 || !isFinite(B) || B % 1 !== 0 || B < 0) return null;
  var rep = _cgwRepartoClanTerminado_(A, F, B, null);
  if (!rep || !(rep.k > 0) || !rep.dias || rep.dias.length !== 4) return null;
  for (var o = 0; o < 4; o++) { if (offsets[o] === undefined || !filas[offsets[o]]) return null; }
  var an = 0, bn = 0, fn = 0;
  for (var z = 0; z < 4; z++) {
    var d = rep.dias[z], fila = filas[offsets[z]];
    an += d.n; bn += d.b; fn += d.f;
    fila[GC.ATAQUES_HOY - 1] = d.n;
    fila[GC.ATAQUES_SEM - 1] = an;
    fila[GC.BARCOS - 1] = bn;
    fila[GC.FAME - 1] = fn;
  }
  return rep;
}

/**
 * _auditarPisoEnFuente(fuente, temporadaFiltro, stats) [→ Contexto_Base_Web.md §18B082]
 */
function _auditarPisoEnFuente(fuente, temporadaFiltro, stats) {
  var offsetsPorClave = _construirOffsetsPorClave(fuente.filas, temporadaFiltro);
  var claves = Object.keys(offsetsPorClave);

  for (var i = 0; i < claves.length; i++) {
    var offsetsClave = offsetsPorClave[claves[i]];
    var offsets = Object.keys(offsetsClave).map(Number);
    stats.revisadas += offsets.length;

    var pisoPorOffset = _reconstruirDeltaAcumulado(fuente.filas, offsetsClave, GC.BARCOS);
    var huboViolacion = false;

    for (var o = 0; o < offsets.length; o++) {
      var off = offsets[o];
      var rowIdx = offsetsClave[off];
      var ataquesActual = Number(fuente.filas[rowIdx][GC.ATAQUES_HOY - 1]) || 0;
      var piso = pisoPorOffset[off] || 0;
      if (ataquesActual < piso) {
        huboViolacion = true;
        stats.violaciones++;
        var partesClave = claves[i].split('|');
        Logger.log('[Auditoría Barcos->Ataques] Violación: Tag=' + partesClave[0] +
          ' Temporada=' + temporadaFiltro + ' Semana=' + partesClave[1] +
          ' Día(offset)=' + off + ' AtaquesHoy=' + ataquesActual + ' < pisoBarcos=' + piso);
      }
    }

    if (huboViolacion) {
      var pisoCambio = _aplicarPisoDiario(fuente.filas, offsetsClave, GC.ATAQUES_HOY, pisoPorOffset, 4);
      if (pisoCambio) {
        _marcarOrigenCorregido(fuente.filas, offsetsClave);
        stats.corregidas++;
      }
    }
  }
}

// VERIFICACIÓN DE MEMBRESÍA TERNA POR FECHA (FIX 30-ago-2026, pedido usuario: [→ Contexto_Base_Web.md §18B083]
/**
 * _construirVentanasMembresiaTernaPorTag() [→ Contexto_Base_Web.md §18B084]
 */
function _construirVentanasMembresiaTernaPorTag() {
  var ventanas = {};
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.HISTORIAL);
  if (!sh || sh.getLastRow() < 2) return ventanas;

  // Columnas (1-based): 1=N°, 2=Fecha, 3=Tag, 4=Nombre, 5=Movimiento, 6=Clan, 7=ClanTag.
  var totalRows = sh.getLastRow() - 1;
  var data = sh.getRange(2, 1, totalRows, 7).getValues();

  // Agrupar por Tag, conservando solo movimientos de clanes Terna.
  var porTag = {};
  for (var i = 0; i < data.length; i++) {
    var fila = data[i];
    var tag = String(fila[2] || '').trim().toUpperCase();
    var fecha = fila[1];
    var movimiento = String(fila[4] || '').trim();
    var clanTag = String(fila[6] || '').trim();
    if (!tag || !(fecha instanceof Date) || isNaN(fecha.getTime())) continue;
    if (CFG.TERNA_TAGS.indexOf(clanTag) < 0) continue; // no es un clan Terna, no aporta a esta verificación

    if (!porTag[tag]) porTag[tag] = [];
    porTag[tag].push({ fecha: fecha, movimiento: movimiento, clanTag: clanTag });
  }

  for (var t in porTag) {
    var movs = porTag[t];
    movs.sort(function (a, b) { return a.fecha.getTime() - b.fecha.getTime(); });

    var abiertas = {}; // clanTag -> índice de la ventana abierta en ventanas[t]
    ventanas[t] = [];

    for (var m = 0; m < movs.length; m++) {
      var mv = movs[m];
      var esEntrada = (mv.movimiento === 'Ingreso' || mv.movimiento === 'Reingreso');
      var esSalida = (mv.movimiento === 'Salida' || mv.movimiento === 'Expulsión');

      if (esEntrada) {
        // Si ya había una ventana abierta para este mismo clan sin cerrar [→ Contexto_Base_Web.md §18B085]
        if (abiertas[mv.clanTag] === undefined) {
          ventanas[t].push({ clanTag: mv.clanTag, desde: mv.fecha, hasta: null });
          abiertas[mv.clanTag] = ventanas[t].length - 1;
        }
      } else if (esSalida) {
        var idx = abiertas[mv.clanTag];
        if (idx !== undefined && ventanas[t][idx].hasta === null) {
          ventanas[t][idx].hasta = mv.fecha;
          delete abiertas[mv.clanTag];
        }
        // Una Salida sin Ingreso previo registrado se ignora (dato [→ Contexto_Base_Web.md §18B086]
      }
    }
  }

  return ventanas;
}

/**
 * _tagEstuvoEnTernaEnFecha(tag, fecha, ventanasPorTag) [→ Contexto_Base_Web.md §18B087]
 */
function _tagEstuvoEnTernaEnFecha(tag, fecha, ventanasPorTag) {
  var tagNorm = String(tag || '').trim().toUpperCase();
  var lista = ventanasPorTag[tagNorm];
  if (!lista) return null;
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) return null;

  for (var i = 0; i < lista.length; i++) {
    var v = lista[i];
    if (fecha >= v.desde && (v.hasta === null || fecha <= v.hasta)) return true;
  }
  return false;
}

/**
 * _construirCoberturaPorTag() [→ Contexto_Base_Web.md §18B111]
 */
function _construirCoberturaPorTag() {
  // PF042: el resultado (unos 14 KB con los datos reales) se guarda en CacheService; _csvCacheBorrar_('Backup_Guerra.csv') lo invalida al guardar el CSV y vence a los 10 min como el propio CSV. [→ Contexto_Base_Web.md §PF042]
  var enCache = _coberturaGuerraCacheGet_();
  if (enCache) return enCache;

  var cobertura = {};
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) return cobertura;

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) return cobertura;

  // Deduplicación barata: un Set-por-tag no es directamente serializable a [→ Contexto_Base_Web.md §18B112]
  var vistos = {};
  for (var i = 1; i < parsed.length; i++) {
    var f = parsed[i];
    var tag = String(f[GC.TAG - 1] || '').trim();
    if (!tag) continue;
    var temporadaRoyaleApi = String(f[GC.TEMPORADA_2 - 1] || '').trim();
    var semana = String(f[GC.SEMANA - 1] || '').trim();
    if (!temporadaRoyaleApi || !semana) continue; // sin Temporada_2 poblado, no se puede etiquetar (ver docblock)

    var etiqueta = temporadaRoyaleApi + '-' + semana;
    if (!vistos[tag]) vistos[tag] = {};
    vistos[tag][etiqueta] = true;
  }

  var tags = Object.keys(vistos);
  for (var t = 0; t < tags.length; t++) {
    cobertura[tags[t]] = Object.keys(vistos[tags[t]]);
  }
  _coberturaGuerraCachePut_(cobertura); // PF042
  return cobertura;
}

// PF042: lectura/escritura del caché de la cobertura; ante cualquier fallo se recalcula desde el CSV. [→ Contexto_Base_Web.md §PF042]
function _coberturaGuerraCacheGet_() {
  try {
    var crudo = CacheService.getScriptCache().get(COBERTURA_GUERRA_CACHE_KEY);
    if (!crudo) return null;
    var obj = JSON.parse(crudo);
    return (obj && typeof obj === 'object') ? obj : null;
  } catch (e) {
    return null;
  }
}

function _coberturaGuerraCachePut_(cobertura) {
  try {
    var json = JSON.stringify(cobertura);
    if (json.length > 90000) return; // tope de CacheService: 100 KB por valor
    CacheService.getScriptCache().put(COBERTURA_GUERRA_CACHE_KEY, json, CSV_CACHE_TTL_SEG);
  } catch (e) { /* sin caché: no pasa nada */ }
}

// ----- Reparto del domingo y corrección con ClanTag -----

// REPARTO DEL DOMINGO SIN ClanTag (Fase 15, Tanda 3, sub-tanda 3.3a, 2-oct-2026). [→ Contexto_Base_Web.md §18B009]
/**
 * _repartoDomingoSinClanTag_(datos) [→ Contexto_Base_Web.md §18B010]
 */
function _repartoDomingoSinClanTag_(datos) {
  function esEntero(v) { return typeof v === 'number' && !isNaN(v) && isFinite(v) && v % 1 === 0 && v >= 0; }
  function resultado(accion, tipo, motivo, x, fx, barcos, posibles, desc, dom) {
    return {
      accion: accion, tipo: tipo, motivo: motivo,
      ataques: x, fame: fx, barcos: barcos, barcosPosibles: posibles || [],
      descartado: desc || { ataques: 0, fame: 0, barcos: null },
      domingoCompleto: dom || { ataques: 0, fame: 0 }
    };
  }
  var d = datos || {};
  var sinBarcos = (d.barcosRoyale === null || d.barcosRoyale === undefined);
  var obligatorios = [d.ataquesRoyale, d.fameRoyale, d.ataquesHoja, d.fameHoja, d.barcosHoja,
                      d.ataquesDomingo, d.fameDomingo, d.barcosDomingo];
  for (var i = 0; i < obligatorios.length; i++) {
    if (!esEntero(obligatorios[i])) return resultado('alarma', null, 'datos de entrada no validos', 0, 0, null);
  }
  if (!sinBarcos && !esEntero(d.barcosRoyale)) return resultado('alarma', null, 'datos de entrada no validos', 0, 0, null);

  var y = d.ataquesDomingo, fy = d.fameDomingo, by = d.barcosDomingo;
  var D = d.ataquesRoyale - d.ataquesHoja;
  var DF = d.fameRoyale - d.fameHoja;
  var DB = sinBarcos ? null : d.barcosRoyale - d.barcosHoja;
  var descTodo = { ataques: Math.max(D, 0), fame: Math.max(DF, 0), barcos: (DB === null ? null : Math.max(DB, 0)) };
  var dom0 = { ataques: y, fame: fy };

  if (y > FAME_MAZOS_POR_DIA || by > y) return resultado('alarma', null, 'domingo registrado incoherente (ataques o barcos)', 0, 0, null, [], descTodo, dom0);
  if (d.ataquesDomingo > d.ataquesHoja || d.fameDomingo > d.fameHoja || d.barcosDomingo > d.barcosHoja) {
    return resultado('alarma', null, 'el domingo supera al acumulado semanal de la hoja', 0, 0, null, [], descTodo, dom0);
  }
  if (D < 0 || DF < 0 || (DB !== null && DB < 0)) {
    return resultado('alarma', null, 'RoyaleAPI trae menos que la hoja (esta funcion solo suma)', 0, 0, null, [], descTodo, dom0);
  }
  if (DB !== null && DB > D) return resultado('alarma', null, 'mas barcos que ataques en el exceso', 0, 0, null, [], descTodo, dom0);
  if (D === 0 && (DF > 0 || (DB !== null && DB > 0))) {
    return resultado('alarma', null, 'fame o barcos sin ataques en el exceso', 0, 0, null, [], descTodo, dom0);
  }
  if (D === 0) return resultado('nada', null, 'sin exceso', 0, 0, null, [], descTodo, dom0);

  // Busqueda: mayor x, y con ese x la mayor fame fx.
  var tope = Math.min(D, FAME_MAZOS_POR_DIA - y);
  for (var x = tope; x >= 1; x--) {
    var candidatos = [];
    if (DB === null) {
      for (var bb = by; bb <= by + x; bb++) candidatos.push(bb);
    } else {
      candidatos.push(by + Math.min(DB, x));
    }
    var mejorFx = -1, bPorFx = {};
    for (var c = 0; c < candidatos.length; c++) {
      var tabla = _fameTablaDia_(y + x, candidatos[c]);
      for (var t = 0; t < tabla.length; t++) {
        var fx = tabla[t] - fy;
        if (fx < 0 || fx > DF) continue;
        if (!bPorFx[fx]) bPorFx[fx] = [];
        if (bPorFx[fx].indexOf(candidatos[c]) < 0) bPorFx[fx].push(candidatos[c]);
        if (fx > mejorFx) mejorFx = fx;
      }
    }
    if (mejorFx < 0) continue;
    var posibles = bPorFx[mejorFx].slice().sort(function (p, q) { return p - q; });
    var barcosElegido = (posibles.length === 1) ? (posibles[0] - by) : null;
    var exacto = (x === D && mejorFx === DF && posibles.length === 1);
    return resultado(
      'acreditar', exacto ? 'exacto' : 'estimado',
      exacto ? 'el exceso cabe entero en el domingo' : 'parte del exceso se descarta como clanes ajenos o quedan varios barcos posibles',
      x, mejorFx, barcosElegido, posibles.map(function (p) { return p - by; }),
      { ataques: D - x, fame: DF - mejorFx, barcos: (DB === null ? null : (barcosElegido === null ? null : DB - barcosElegido)) },
      { ataques: y + x, fame: fy + mejorFx }
    );
  }

  // Ningun x >= 1 cabe: el exceso entero es ajeno si el domingo ya registrado es posible.
  if (!_fameEsPosibleDia_(y, fy, by)) return resultado('alarma', null, 'el domingo registrado no cuadra con la tabla de fame', 0, 0, null, [], descTodo, dom0);
  return resultado('nada', null, 'todo el exceso se asume de clanes ajenos', 0, 0, null, [], descTodo, dom0);
}

// RAMA CON ClanTag -- PRIMERA PARTE (Fase 15, Tanda 3, sub-tanda 3.3c-1, 2-oct-2026). [→ Contexto_Base_Web.md §18B014]
/**
 * _limitesFameSemanaClan_(ataques, barcos) [→ Contexto_Base_Web.md §18B015]
 */
function _limitesFameSemanaClan_(ataques, barcos) {
  var otros = ataques - barcos;
  var duelos = Math.min(4, Math.floor(otros / 2));
  return {
    min: barcos * FAME_BARCO_PIERDE + otros * FAME_PVP_PIERDE,
    max: barcos * FAME_BARCO_GANA + otros * FAME_PVP_GANA + duelos * 100
  };
}

/**
 * _decidirCorreccionConClanTag_(datos) [→ Contexto_Base_Web.md §18B016]
 */
function _decidirCorreccionConClanTag_(datos) {
  datos = datos || {};
  var ternaTags = datos.ternaTags || [];
  var correcciones = datos.correcciones || [];
  var otros = datos.otrosClanesHoja || [];
  var resultado = { clanes: [], hayAlarma: false };

  function esEnt(x) { return typeof x === 'number' && isFinite(x) && x % 1 === 0 && x >= 0; }
  function alarma(clanTag, motivo) {
    resultado.hayAlarma = true;
    return { clanTag: clanTag, accion: 'alarma', motivo: motivo, escribir: null, delta: null, baja: false,
             revision: { tipo: 'alarma', motivo: motivo } };
  }

  // Paso 1: repetidos (regla 2).
  var vistos = {};
  var repetido = false;
  for (var i = 0; i < correcciones.length; i++) {
    var ct = String(correcciones[i].clanTag);
    if (vistos[ct]) repetido = true;
    vistos[ct] = true;
  }
  if (repetido) {
    for (var r = 0; r < correcciones.length; r++) {
      resultado.clanes.push(alarma(correcciones[r].clanTag, 'clan repetido en las correcciones del jugador'));
    }
    return resultado;
  }

  // Paso 2: clasificar cada clan (reglas 1 y 3).
  var estado = []; // 'ignorar' | 'alarma' | 'ok'
  var parcial = []; // resultado ya armado para ignorar/alarma
  var sumaAt = 0, sumaBar = 0, sumaFame = 0;
  for (var j = 0; j < correcciones.length; j++) {
    var c = correcciones[j];
    if (ternaTags.indexOf(c.clanTag) < 0) {
      estado[j] = 'ignorar';
      parcial[j] = { clanTag: c.clanTag, accion: 'ignorar', motivo: 'clan ajeno a la comunidad Terna (P43)', escribir: null,
                     delta: null, baja: false, revision: { tipo: 'informativo', motivo: 'resto en clanes ajenos' } };
      continue;
    }
    var motivo = null;
    var bar = (c.barcos === null || c.barcos === undefined) ? null : c.barcos;
    if (!esEnt(c.ataques) || !esEnt(c.fame) || (bar !== null && !esEnt(bar))) motivo = 'valores no validos (deben ser enteros >= 0)';
    else if (c.ataques > 16) motivo = 'mas de 16 ataques en la semana';
    else if (bar !== null && bar > c.ataques) motivo = 'mas barcos que ataques';
    else if (c.fame % 25 !== 0) motivo = 'la fame no es multiplo de 25';
    else if (c.ataques === 0 && (c.fame > 0 || (bar !== null && bar > 0))) motivo = 'fame o barcos sin ataques';
    else {
      // Con barcos conocidos, cotas exactas; sin barcos, la cota minima es todo barcos perdidos
      // (75 por ataque) y la maxima es la de cero barcos (PvP y duelos: 200 por ataque y +100 por duelo).
      var lim = _limitesFameSemanaClan_(c.ataques, bar === null ? 0 : bar);
      var limMin = bar === null ? c.ataques * FAME_BARCO_PIERDE : lim.min;
      var maxReal = lim.max;
      if (c.fame < limMin) motivo = 'fame por debajo del minimo posible para esos ataques';
      else if (c.fame > maxReal) motivo = 'fame por encima del maximo posible para esos ataques';
    }
    if (motivo) { estado[j] = 'alarma'; parcial[j] = alarma(c.clanTag, motivo); continue; }
    estado[j] = 'ok';
    sumaAt += c.ataques; sumaFame += c.fame; sumaBar += (bar === null ? 0 : bar);
  }

  // Paso 3: tope entre clanes (regla 4), solo si ningun clan Terna fallo solo.
  var alarmaGlobal = null;
  var hayOk = estado.indexOf('ok') >= 0;
  if (hayOk) {
    for (var k = 0; k < otros.length; k++) {
      var o = otros[k];
      sumaAt += Number(o.ataques) || 0; sumaFame += Number(o.fame) || 0; sumaBar += Number(o.barcos) || 0;
    }
    if (sumaAt > 16) alarmaGlobal = 'la suma de ataques entre clanes supera 16';
    else if (sumaBar > sumaAt) alarmaGlobal = 'la suma de barcos entre clanes supera la de ataques';
    else if (sumaFame > _limitesFameSemanaClan_(sumaAt, 0).max) alarmaGlobal = 'la suma de fame entre clanes supera el maximo posible';
    // §PF302 (criterio 14 de §PF160): pasados los topes, la suma de los clanes no puede superar el valor de perfil de RoyaleAPI (el perfil puede ser mayor: la diferencia es
    // el clan Externo). Si lo supera, los valores se contradicen y va a revisión manual. Con barcos sin dato la suma es solo un piso, y un piso que ya pasa el perfil también contradice.
    var pf = datos.perfil;
    if (!alarmaGlobal && pf) {
      if (typeof pf.ataquesSemana === 'number' && sumaAt > pf.ataquesSemana) alarmaGlobal = 'la suma de ataques de los clanes (' + sumaAt + ') supera el valor de perfil de RoyaleAPI (' + pf.ataquesSemana + ')';
      else if (typeof pf.barcos === 'number' && sumaBar > pf.barcos) alarmaGlobal = 'la suma de barcos de los clanes (' + sumaBar + ') supera el valor de perfil de RoyaleAPI (' + pf.barcos + ')';
      else if (typeof pf.fame === 'number' && sumaFame > pf.fame) alarmaGlobal = 'la suma de medallas de los clanes (' + sumaFame + ') supera el valor de perfil de RoyaleAPI (' + pf.fame + ')';
    }
  }

  // Paso 4: armar la salida (reglas 5 y 6).
  for (var m = 0; m < correcciones.length; m++) {
    var cm = correcciones[m];
    if (estado[m] !== 'ok') { resultado.clanes.push(parcial[m]); continue; }
    if (alarmaGlobal) { resultado.clanes.push(alarma(cm.clanTag, alarmaGlobal)); continue; }
    var h = cm.hoja || {};
    if (!h.tieneFilas) {
      resultado.clanes.push({ clanTag: cm.clanTag, accion: 'reconstruir', motivo: 'el clan no tiene filas esa semana en la hoja',
        escribir: { ataques: cm.ataques, fame: cm.fame, barcos: (cm.barcos === undefined ? null : cm.barcos) }, delta: null, baja: false,
        revision: { tipo: null, motivo: '' } });
      continue;
    }
    var barcosNuevo = (cm.barcos === null || cm.barcos === undefined) ? null : cm.barcos;
    var dAt = cm.ataques - (Number(h.ataques) || 0);
    var dFa = cm.fame - (Number(h.fame) || 0);
    var dBa = barcosNuevo === null ? null : barcosNuevo - (Number(h.barcos) || 0);
    var cambia = dAt !== 0 || dFa !== 0 || (dBa !== null && dBa !== 0);
    var baja = dAt < 0 || dFa < 0 || (dBa !== null && dBa < 0);
    resultado.clanes.push({
      clanTag: cm.clanTag,
      accion: cambia ? 'aplicar' : 'sin-cambio',
      motivo: cambia ? (baja ? 'la correccion baja algun valor de la hoja' : 'la hoja queda con el valor de la correccion') : 'la hoja ya coincide',
      escribir: cambia ? { ataques: cm.ataques, fame: cm.fame, barcos: barcosNuevo } : null,
      delta: cambia ? { ataques: dAt, fame: dFa, barcos: dBa } : null,
      baja: baja,
      revision: baja ? { tipo: 'informativo', motivo: 'la correccion baja valores de la hoja' } : { tipo: null, motivo: '' }
    });
  }
  return resultado;
}

/**
 * _indexarFilasJugadorSemanaPorClan_(filas, temporada, semana, tag) [→ Contexto_Base_Web.md §18B017]
 */
function _indexarFilasJugadorSemanaPorClan_(filas, temporada, semana, tag) {
  var porClan = {};
  var tempN = String(temporada), semN = String(semana).trim(), tagN = String(tag).trim();
  for (var r = 0; r < filas.length; r++) {
    var f = filas[r];
    if (String(f[GC.TEMPORADA - 1]) !== tempN) continue;
    if (String(f[GC.TAG - 1]).trim() !== tagN) continue;
    if (String(f[GC.SEMANA - 1]).trim() !== semN) continue;
    var pIdx = Number(f[GC.PERIOD_IDX - 1]) || 0;
    var off = (pIdx % 7) - 3;
    if (off < 0 || off > 3) continue;
    var clan = String(f[GC.CLAN - 1] || '').trim();
    if (!porClan[clan]) porClan[clan] = {};
    var previo = porClan[clan][off];
    if (previo === undefined || pIdx > (Number(filas[previo][GC.PERIOD_IDX - 1]) || 0)) porClan[clan][off] = r;
  }
  return porClan;
}

/**
 * _resumenHojaParaReparto_(filas, porClan) [→ Contexto_Base_Web.md §18B018]
 */
function _resumenHojaParaReparto_(filas, porClan) {
  function num(v) { return Number(v) || 0; }
  var res = { ataquesHoja: 0, fameHoja: 0, barcosHoja: 0, ataquesDomingo: 0, fameDomingo: 0, barcosDomingo: 0, hayDomingo: false };
  var clanes = Object.keys(porClan);
  for (var c = 0; c < clanes.length; c++) {
    var mapa = porClan[clanes[c]];
    var offs = Object.keys(mapa).map(Number).sort(function (a, b) { return a - b; });
    var sumaHoy = 0;
    for (var i = 0; i < offs.length; i++) sumaHoy += num(filas[mapa[offs[i]]][GC.ATAQUES_HOY - 1]);
    var ult = filas[mapa[offs[offs.length - 1]]];
    var sem = ult[GC.ATAQUES_SEM - 1];
    var semNum = (sem === '' || sem === null || sem === undefined) ? sumaHoy : Math.max(num(sem), sumaHoy);
    res.ataquesHoja += semNum;
    res.fameHoja += num(ult[GC.FAME - 1]);
    res.barcosHoja += num(ult[GC.BARCOS - 1]);
    if (mapa[3] !== undefined) {
      res.hayDomingo = true;
      var dom = filas[mapa[3]];
      var offPrevio = -1;
      for (var j = 0; j < offs.length; j++) { if (offs[j] < 3) offPrevio = offs[j]; }
      var fPrev = 0, bPrev = 0;
      if (offPrevio >= 0) { var p = filas[mapa[offPrevio]]; fPrev = num(p[GC.FAME - 1]); bPrev = num(p[GC.BARCOS - 1]); }
      res.ataquesDomingo += num(dom[GC.ATAQUES_HOY - 1]);
      res.fameDomingo += Math.max(0, num(dom[GC.FAME - 1]) - fPrev);
      res.barcosDomingo += Math.max(0, num(dom[GC.BARCOS - 1]) - bPrev);
    }
  }
  return res;
}

/**
 * _elegirClanDestinoDomingo_(filas, porClan, ternaOrden, clanActual) [→ Contexto_Base_Web.md §18B019]
 */
function _elegirClanDestinoDomingo_(filas, porClan, ternaOrden, clanActual) {
  var cands = [];
  var clanes = Object.keys(porClan);
  for (var c = 0; c < clanes.length; c++) {
    var mapa = porClan[clanes[c]];
    if (mapa[3] === undefined) continue;
    var primerAtaque = Infinity, ataquesEseDia = 0, primeraFila = Infinity;
    for (var o = 0; o <= 3; o++) {
      var idx = mapa[o];
      if (idx === undefined) continue;
      if (o < primeraFila) primeraFila = o;
      var a = Number(filas[idx][GC.ATAQUES_HOY - 1]) || 0;
      if (a > 0 && o < primerAtaque) { primerAtaque = o; ataquesEseDia = a; }
    }
    var ti = (ternaOrden || []).indexOf(clanes[c]);
    cands.push({ clan: clanes[c], k: [primerAtaque, -ataquesEseDia, primeraFila, (clanes[c] === clanActual ? 0 : 1), (ti < 0 ? 99 : ti)] });
  }
  if (!cands.length) return null;
  cands.sort(function (x, y) {
    for (var q = 0; q < x.k.length; q++) {
      if (x.k[q] < y.k[q]) return -1;
      if (x.k[q] > y.k[q]) return 1;
    }
    return String(x.clan).localeCompare(String(y.clan));
  });
  return cands[0].clan;
}

/**
 * _aplicarRepartoDomingoSinClanTagAFuente_(fuente, temporadaPropia, semana, tag, valores, opciones, stats) [→ Contexto_Base_Web.md §18B020]
 */
function _aplicarRepartoDomingoSinClanTagAFuente_(fuente, temporadaPropia, semana, tag, valores, opciones, stats) {
  opciones = opciones || {};
  stats = stats || {};
  var filas = fuente.filas;
  var porClan = _indexarFilasJugadorSemanaPorClan_(filas, temporadaPropia, semana, tag);
  if (!Object.keys(porClan).length) return { estado: 'sin-filas', decision: null, clanDestino: null, escrito: false };

  function suma(campo) { stats[campo] = (stats[campo] || 0) + 1; }
  function revisar(tipo, motivo, detalle) {
    if (!opciones.revision) return;
    opciones.revision.push({ temporada: temporadaPropia, semana: semana, tag: tag, nombre: opciones.nombre || '', tipo: tipo, motivo: motivo, detalle: detalle });
  }

  var res = _resumenHojaParaReparto_(filas, porClan);
  var base = 'RoyaleAPI ataques=' + valores.ataquesSemana + ' fame=' + valores.fame + ' barcos=' +
    ((valores.barcos === null || valores.barcos === undefined) ? 'sin dato' : valores.barcos) +
    '; hoja semana ataques=' + res.ataquesHoja + ' fame=' + res.fameHoja + ' barcos=' + res.barcosHoja +
    '; domingo ataques=' + res.ataquesDomingo + ' fame=' + res.fameDomingo + ' barcos=' + res.barcosDomingo;

  if (!res.hayDomingo) {
    suma('repDomPendientes');
    Logger.log('[Reparto domingo] PENDIENTE T' + temporadaPropia + ' S' + semana + ' ' + tag +
      ': ningun clan tiene fila de domingo (semana en curso o sin registrar). ' + base);
    revisar('pendiente', 'no hay fila de domingo para acreditar', base);
    return { estado: 'sin-domingo', decision: null, clanDestino: null, escrito: false };
  }

  var d = _repartoDomingoSinClanTag_({
    ataquesRoyale: valores.ataquesSemana, fameRoyale: valores.fame,
    barcosRoyale: (valores.barcos === undefined ? null : valores.barcos),
    ataquesHoja: res.ataquesHoja, fameHoja: res.fameHoja, barcosHoja: res.barcosHoja,
    ataquesDomingo: res.ataquesDomingo, fameDomingo: res.fameDomingo, barcosDomingo: res.barcosDomingo
  });

  var etiqueta = '[Reparto domingo] T' + temporadaPropia + ' S' + semana + ' ' + tag + ': ' + d.accion +
    (d.tipo ? ' (' + d.tipo + ')' : '') + ' - ' + d.motivo + '. ';

  if (d.accion === 'alarma') {
    suma('repDomAlarmas');
    Logger.log(etiqueta + 'ALARMA, no se escribe nada. ' + base);
    revisar('alarma', d.motivo, base);
    return { estado: 'decidido', decision: d, clanDestino: null, escrito: false };
  }
  if (d.accion === 'nada') {
    suma('repDomNada');
    if (d.motivo.indexOf('clanes ajenos') >= 0) {
      Logger.log(etiqueta + base);
      revisar('informativo', d.motivo, base + '; descartado ataques=' + d.descartado.ataques + ' fame=' + d.descartado.fame);
    }
    return { estado: 'decidido', decision: d, clanDestino: null, escrito: false };
  }

  // accion === 'acreditar'
  var ternaOrden = opciones.ternaOrden || [];
  var clanActual = opciones.clanActual;
  if (clanActual === undefined) {
    clanActual = '';
    try { clanActual = _buscarDatosJugadorParaReconstruccion(tag).clan || ''; } catch (eClan) { clanActual = ''; }
  }
  var clanDestino = _elegirClanDestinoDomingo_(filas, porClan, ternaOrden, clanActual);
  var barcosAcred = (d.barcos !== null) ? d.barcos : (d.barcosPosibles.length ? d.barcosPosibles[0] : 0);
  var detalleAcred = base + '; acreditado ataques=' + d.ataques + ' fame=' + d.fame + ' barcos=' + barcosAcred +
    (d.barcos === null ? ' (barcos posibles: ' + d.barcosPosibles.join('/') + ')' : '') +
    '; descartado ataques=' + d.descartado.ataques + ' fame=' + d.descartado.fame + '; clan=' + clanDestino;

  suma('repDomAcreditadas');
  suma(d.tipo === 'exacto' ? 'repDomExactas' : 'repDomEstimadas');
  Logger.log(etiqueta + (opciones.soloInforme ? 'INFORME (no se escribe). ' : 'Escrito. ') + detalleAcred);
  if (d.tipo !== 'exacto') revisar('estimado', d.motivo, detalleAcred);

  if (opciones.soloInforme) return { estado: 'decidido', decision: d, clanDestino: clanDestino, escrito: false };

  var rowIdx = porClan[clanDestino][3];
  var fila = filas[rowIdx];
  fila[GC.ATAQUES_HOY - 1] = (Number(fila[GC.ATAQUES_HOY - 1]) || 0) + d.ataques;
  fila[GC.ATAQUES_SEM - 1] = (Number(fila[GC.ATAQUES_SEM - 1]) || 0) + d.ataques;
  fila[GC.FAME - 1]        = (Number(fila[GC.FAME - 1]) || 0) + d.fame;
  fila[GC.BARCOS - 1]      = (Number(fila[GC.BARCOS - 1]) || 0) + barcosAcred;
  _marcarOrigenCorregido(filas, { 3: rowIdx });
  return { estado: 'decidido', decision: d, clanDestino: clanDestino, escrito: true };
}

/**
 * _evaluarCorreccionConClanTagSemana_(filas, temporada, semana, tag, v, opciones) [→ Contexto_Base_Web.md §18B026]
 */
function _evaluarCorreccionConClanTagSemana_(filas, temporada, semana, tag, v, opciones) {
  opciones = opciones || {};
  var ternaTags = opciones.ternaTags || CFG.TERNA_TAGS;
  var nombres = opciones.nombresPorTag || _mapaNombresClanTerna_(ternaTags);
  var porClan = _indexarFilasJugadorSemanaPorClan_(filas, temporada, semana, tag);
  var entradas = ((v && v.filasPorClan) ? v.filasPorClan : []).filter(function (x) { return x.clanTag !== ''; });
  var problemas = [];
  var correcciones = [];
  var conCorreccion = {};
  var incompleto = false;
  var i;

  function resumenClan(nombreClan) {
    var sub = {};
    sub[nombreClan] = porClan[nombreClan];
    var r = _resumenHojaParaReparto_(filas, sub);
    return { ataques: r.ataquesHoja, fame: r.fameHoja, barcos: r.barcosHoja };
  }

  var sinNombre = ternaTags.filter(function (t) { return !nombres[t]; });
  if (sinNombre.length) {
    incompleto = true;
    problemas.push({ clanTag: sinNombre.join(','), tipo: 'alarma', motivo: 'no se pudo resolver el nombre de un clan Terna',
      detalle: 'sin nombre (o ambiguo): ' + sinNombre.join(', ') + '. No se decide para esos clanes y no se debe escribir.' });
  }

  for (i = 0; i < entradas.length; i++) {
    var e = entradas[i];
    conCorreccion[e.clanTag] = true;
    var hoja = { tieneFilas: false, ataques: 0, fame: 0, barcos: 0 };
    if (ternaTags.indexOf(e.clanTag) >= 0) {
      var nom = nombres[e.clanTag] || '';
      if (!nom) continue; // ya quedo anotado arriba; este clan no se decide
      if (porClan[nom]) {
        var rc = resumenClan(nom);
        hoja = { tieneFilas: true, ataques: rc.ataques, fame: rc.fame, barcos: rc.barcos };
      }
    }
    correcciones.push({ clanTag: e.clanTag, ataques: e.ataquesSemana, fame: e.fame,
      barcos: (e.barcos === null || e.barcos === undefined) ? null : e.barcos, hoja: hoja });
  }

  var otros = [];
  var nombresMapeados = {};
  for (i = 0; i < ternaTags.length; i++) {
    var tt = ternaTags[i];
    var nn = nombres[tt] || '';
    if (nn) nombresMapeados[nn] = true;
    if (conCorreccion[tt] || !nn || !porClan[nn]) continue;
    var ro = resumenClan(nn);
    otros.push({ clanTag: tt, ataques: ro.ataques, fame: ro.fame, barcos: ro.barcos });
  }
  Object.keys(porClan).forEach(function (nombreFila) {
    if (!nombresMapeados[nombreFila]) {
      problemas.push({ clanTag: '', tipo: 'informativo', motivo: 'clan de la hoja que no coincide con ningun clan Terna',
        detalle: 'la hoja tiene filas de este jugador y semana en el clan «' + nombreFila + '», que no corresponde a ningun nombre de clan Terna; no cuenta para el tope entre clanes' });
    }
  });

  var decision = _decidirCorreccionConClanTag_({ ternaTags: ternaTags, correcciones: correcciones, otrosClanesHoja: otros, perfil: (v && v.perfil) ? v.perfil : null });

  var revisiones = [];
  function agregarRevision(tipo, motivo, detalle) {
    revisiones.push({ temporada: temporada, semana: semana, tag: tag, nombre: opciones.nombre || '', tipo: tipo, motivo: motivo, detalle: detalle });
  }
  for (i = 0; i < decision.clanes.length; i++) {
    var c = decision.clanes[i];
    if (c.revision && c.revision.tipo) {
      agregarRevision(c.revision.tipo, c.revision.motivo,
        'clan=' + c.clanTag + '; accion=' + c.accion + '; ' + c.motivo +
        (c.delta ? '; delta ataques=' + c.delta.ataques + ' fame=' + c.delta.fame + ' barcos=' + (c.delta.barcos === null ? 'sin dato' : c.delta.barcos) : ''));
    }
  }
  for (i = 0; i < problemas.length; i++) agregarRevision(problemas[i].tipo, problemas[i].motivo, problemas[i].detalle);

  return { decision: decision, problemas: problemas, incompleto: incompleto, otrosClanesHoja: otros, revisiones: revisiones };
}

// RAMA CON ClanTag -- SEGUNDA PARTE, SEGUNDO TRAMO (Fase 15, Tanda 3, sub-tanda 3.3c-2b, [→ Contexto_Base_Web.md §18B028]
/**
 * _ataquesPorDiaEntreClanes_(filas, temporada, semana, tag) [→ Contexto_Base_Web.md §18B029]
 */
function _ataquesPorDiaEntreClanes_(filas, temporada, semana, tag) {
  var dias = { 0: 0, 1: 0, 2: 0, 3: 0 };
  var porClan = _indexarFilasJugadorSemanaPorClan_(filas, temporada, semana, tag);
  Object.keys(porClan).forEach(function (clan) {
    var mapa = porClan[clan];
    Object.keys(mapa).forEach(function (o) { dias[o] += Number(filas[mapa[o]][GC.ATAQUES_HOY - 1]) || 0; });
  });
  return dias;
}

/**
 * _problemasFilasClan_(filas, offsets) [→ Contexto_Base_Web.md §18B030]
 */
function _problemasFilasClan_(filas, offsets) {
  var problemas = [];
  var offs = Object.keys(offsets).map(Number).sort(function (a, b) { return a - b; });
  var fameAnt = 0, barcosAnt = 0;
  for (var i = 0; i < offs.length; i++) {
    var f = filas[offsets[offs[i]]];
    var at = Number(f[GC.ATAQUES_HOY - 1]);
    var fame = Number(f[GC.FAME - 1]) || 0;
    var barcos = Number(f[GC.BARCOS - 1]) || 0;
    if (!isFinite(at) || at % 1 !== 0 || at < 0 || at > FAME_MAZOS_POR_DIA) problemas.push('dia ' + offs[i] + ': ataques del dia fuera de 0..' + FAME_MAZOS_POR_DIA + ' (' + f[GC.ATAQUES_HOY - 1] + ')');
    if (fame < fameAnt) problemas.push('dia ' + offs[i] + ': la fame acumulada baja (' + fameAnt + ' -> ' + fame + ')');
    if (barcos < barcosAnt) problemas.push('dia ' + offs[i] + ': los barcos acumulados bajan (' + barcosAnt + ' -> ' + barcos + ')');
    if (barcos - barcosAnt > at) problemas.push('dia ' + offs[i] + ': mas barcos que ataques en el dia (' + (barcos - barcosAnt) + ' > ' + at + ')');
    fameAnt = Math.max(fameAnt, fame); barcosAnt = Math.max(barcosAnt, barcos);
  }
  return problemas;
}

/**
 * _ajustarSemanaDeUnClan_(filas, offsets, valores, opciones) [→ Contexto_Base_Web.md §18B031]
 */
function _ajustarSemanaDeUnClan_(filas, offsets, valores, opciones) {
  opciones = opciones || {};
  // Reparto conjunto (§PF122): si ninguna combinacion de la tabla cuadra, no se toca nada y se avisa.
  var rep = _repartirSemanaConjunto_(filas, offsets, valores);
  if (!rep.ok) {
    Logger.log('[Reparto conjunto] SIN CAMBIOS: ' + rep.motivo + '. No se toca esta semana del clan.');
    // §PF302: quien llama (_aplicarCorreccionConClanTagAFuente_) lo manda a revisión manual con el motivo real, no con el aviso genérico de la comprobación (b).
    if (opciones.conflictosReparto) opciones.conflictosReparto.push({ crr: rep.crr || '', motivo: rep.motivo });
    return false;
  }
  var offsOrd = Object.keys(offsets).map(Number).sort(function (a, b) { return b - a; });
  var ultima = filas[offsets[offsOrd[0]]];
  var semAnterior = ultima[GC.ATAQUES_SEM - 1];
  ultima[GC.ATAQUES_SEM - 1] = valores.ataquesSemana;
  var semCambio = String(semAnterior) !== String(valores.ataquesSemana);
  if (opciones.temporadaRoyaleApi) {
    for (var i = 0; i < offsOrd.length; i++) filas[offsets[offsOrd[i]]][GC.TEMPORADA_2 - 1] = opciones.temporadaRoyaleApi;
  }
  var huboCambio = rep.huboCambio || semCambio;
  if (huboCambio) _marcarOrigenCorregido(filas, offsets);
  return huboCambio;
}

/**
 * _reconstruirSemanaDeUnClanDesdeCero_(fuente, temporadaPropia, semana, tag, valores, opciones, nombreClan,… [→ Contexto_Base_Web.md §18B032]
 */
function _reconstruirSemanaDeUnClanDesdeCero_(fuente, temporadaPropia, semana, tag, valores, opciones, nombreClan, nombreJugador, clanTag) {
  var temp = { tipo: fuente.tipo, filas: [] };
  // §PF402: aqui el clan ya se conoce (nombreClan); se pasa para que la reconstruccion no dependa del Directorio. Se restaura al terminar porque `opciones` se comparte con quien llama.
  var opcionesRec = opciones || {};
  var clanNombrePrevio = opcionesRec.clanNombre, clanTagPrevio = opcionesRec.clanTag;
  if (nombreClan) opcionesRec.clanNombre = nombreClan;
  if (clanTag) opcionesRec.clanTag = clanTag; // 7-nov-2026 (tanda 7): el Tag del clan de esta semana
  var offsTemp;
  var fuenteEvPrevia = opcionesRec.fuenteEvidencia;
  opcionesRec.fuenteEvidencia = fuente; // §PF436: `temp` está vacía; la presencia se decide con las filas reales de la fuente
  try { offsTemp = _reconstruirSemanaDesdeCero(temp, temporadaPropia, semana, tag, valores, opcionesRec); }
  finally { opcionesRec.clanNombre = clanNombrePrevio; opcionesRec.clanTag = clanTagPrevio; opcionesRec.fuenteEvidencia = fuenteEvPrevia; }
  if (!offsTemp) return {}; // sin combinacion (§PF122): no se escribe nada; la comprobacion (b) de quien llama lo revierte y lo avisa
  for (var i = 0; i < temp.filas.length; i++) {
    temp.filas[i][GC.CLAN - 1] = nombreClan;
    if (clanTag) temp.filas[i][GC.CLAN_TAG - 1] = _normalizarClanTagCorreccion(clanTag); // 7-nov-2026 (tanda 7)
    if (nombreJugador) temp.filas[i][GC.NOMBRE - 1] = nombreJugador;
  }
  var base = fuente.filas.length;
  for (var j = 0; j < temp.filas.length; j++) fuente.filas.push(temp.filas[j]);
  var res = {};
  Object.keys(offsTemp).forEach(function (o) { res[o] = base + offsTemp[o]; });
  return res;
}

/**
 * _aplicarCorreccionConClanTagAFuente_(fuente, offsetsPorClave, temporadaPropia, semana, tag, v, opciones, stats) [→ Contexto_Base_Web.md §18B033]
 */
function _aplicarCorreccionConClanTagAFuente_(fuente, offsetsPorClave, temporadaPropia, semana, tag, v, opciones, stats) {
  opciones = opciones || {};
  stats = stats || {};
  var filas = fuente.filas;
  var ternaTags = CFG.TERNA_TAGS.slice();
  var nombres = opciones.nombresPorTag || _mapaNombresClanTerna_(ternaTags);
  var etq = '[Con ClanTag] T' + temporadaPropia + ' S' + semana + ' ' + tag + ': ';
  var resultado = { modo: 'con-clantag', huboCambio: false };

  function suma(campo, n) { stats[campo] = (stats[campo] || 0) + (n === undefined ? 1 : n); }
  var porClan = _indexarFilasJugadorSemanaPorClan_(filas, temporadaPropia, semana, tag);
  var nombreJugador = '';
  Object.keys(porClan).forEach(function (cn) {
    Object.keys(porClan[cn]).forEach(function (o) {
      var nm = String(filas[porClan[cn][o]][GC.NOMBRE - 1] || '').trim();
      if (!nombreJugador && nm) nombreJugador = nm;
    });
  });
  function revisar(tipo, motivo, detalle) {
    if (!opciones.revision) return;
    opciones.revision.push({ temporada: temporadaPropia, semana: semana, tag: tag, nombre: nombreJugador, tipo: tipo, motivo: motivo, detalle: detalle });
  }

  var ev = _evaluarCorreccionConClanTagSemana_(filas, temporadaPropia, semana, tag, v,
    { ternaTags: ternaTags, nombresPorTag: nombres, nombre: nombreJugador });
  if (opciones.revision) { for (var q = 0; q < ev.revisiones.length; q++) opciones.revision.push(ev.revisiones[q]); }

  var sinTag = ((v && v.filasPorClan) ? v.filasPorClan : []).filter(function (x) { return x.clanTag === ''; });
  if (sinTag.length) {
    suma('ccMezcladas');
    var detMezcla = sinTag.map(function (x) { return 'ataques=' + x.ataquesSemana + ' fame=' + x.fame + ' barcos=' + (x.barcos === null || x.barcos === undefined ? 'sin dato' : x.barcos); }).join(' | ');
    Logger.log(etq + 'AVISO: hay correcciones sin ClanTag mezcladas con otras que si lo traen; las que no traen ClanTag NO se aplican. ' + detMezcla);
    revisar('alarma', 'correcciones sin ClanTag mezcladas con otras que traen ClanTag', 'no se aplican las que no traen ClanTag: ' + detMezcla);
  }

  if (ev.incompleto) {
    suma('ccIncompletos');
    Logger.log(etq + 'INCOMPLETO (nombre de clan Terna sin resolver): no se escribe nada. ' +
      ev.problemas.filter(function (p) { return p.tipo === 'alarma'; }).map(function (p) { return p.detalle; }).join(' '));
    return resultado;
  }

  var aEscribir = [];
  for (var i = 0; i < ev.decision.clanes.length; i++) {
    var c = ev.decision.clanes[i];
    if (c.accion === 'aplicar' || c.accion === 'reconstruir') aEscribir.push(c);
    else if (c.accion === 'sin-cambio') suma('ccSinCambio');
    else if (c.accion === 'ignorar') suma('ccIgnoradas');
    else if (c.accion === 'alarma') { suma('ccAlarmas'); Logger.log(etq + 'ALARMA clan ' + c.clanTag + ': ' + c.motivo + '. No se escribe ese clan.'); }
  }
  if (!aEscribir.length) return resultado;

  // Copia de seguridad para poder devolver todo si la comprobacion final falla.
  var n0 = filas.length;
  var copia = {};
  Object.keys(porClan).forEach(function (cn) {
    Object.keys(porClan[cn]).forEach(function (o) { var ix = porClan[cn][o]; copia[ix] = filas[ix].slice(); });
  });
  var diasAntes = _ataquesPorDiaEntreClanes_(filas, temporadaPropia, semana, tag);
  var cambioAlgo = false;
  // §PF302: fallos del reparto de cada clan (por ejemplo el conflicto con los JSON de CurrentRiverRace), para mandarlos a revisión manual con su motivo real.
  var conflictosReparto = [];
  var opcionesReparto = {};
  Object.keys(opciones).forEach(function (kk) { opcionesReparto[kk] = opciones[kk]; });
  opcionesReparto.conflictosReparto = conflictosReparto;
  var problemasAntes = {};
  var offsetsEscritos = {}; // clanTag -> { offsetDia: rowIdx } de las filas que quedaron escritas
  var sinPresenciaClanes = {}; // §PF436: clanes donde no se reconstruyó por falta de evidencia de presencia
  for (var pa = 0; pa < aEscribir.length; pa++) {
    var nomPa = nombres[aEscribir[pa].clanTag];
    if (aEscribir[pa].accion === 'aplicar') problemasAntes[aEscribir[pa].clanTag] = _problemasFilasClan_(filas, porClan[nomPa]);
  }
  function devolver() {
    Object.keys(copia).forEach(function (ix) { for (var k = 0; k < copia[ix].length; k++) filas[ix][k] = copia[ix][k]; });
    filas.length = n0;
  }

  for (var e = 0; e < aEscribir.length; e++) {
    var ce = aEscribir[e];
    var nombreClan = nombres[ce.clanTag];
    var valores = { ataquesSemana: ce.escribir.ataques, fame: ce.escribir.fame, barcos: ce.escribir.barcos };
    if (ce.accion === 'aplicar') {
      if (_ajustarSemanaDeUnClan_(filas, porClan[nombreClan], valores, opcionesReparto)) cambioAlgo = true;
      offsetsEscritos[ce.clanTag] = porClan[nombreClan];
    } else {
      opcionesReparto.sinPresenciaReconstruccion = false;
      offsetsEscritos[ce.clanTag] = _reconstruirSemanaDeUnClanDesdeCero_(fuente, temporadaPropia, semana, tag, valores, opcionesReparto, nombreClan, nombreJugador, ce.clanTag);
      if (opcionesReparto.sinPresenciaReconstruccion) {
        // §PF436: sin evidencia de presencia en este clan esa semana: no se crean filas, no es un error de reparto; se avisa y las comprobaciones de abajo lo saltan.
        sinPresenciaClanes[ce.clanTag] = true;
        offsetsEscritos[ce.clanTag] = {};
        suma('ccSinPresencia');
        Logger.log(etq + 'Sin presencia en el clan ' + ce.clanTag + ': no se reconstruye (' + opcionesReparto.detallePresenciaReconstruccion + ').');
        revisar('alarma', 'presencia no establecida: no se crearon las filas (reconstruccion)', 'clan=' + ce.clanTag + '; ataques=' + valores.ataquesSemana + ' fame=' + valores.fame + ' barcos=' + (valores.barcos === null || valores.barcos === undefined ? 'sin dato' : valores.barcos) + '; ' + opcionesReparto.detallePresenciaReconstruccion);
        continue;
      }
      cambioAlgo = true;
    }
  }

  // Comprobacion (a): tope de 4 mazos por dia entre clanes.
  var diasDespues = _ataquesPorDiaEntreClanes_(filas, temporadaPropia, semana, tag);
  var excede = [];
  for (var d = 0; d <= 3; d++) {
    if (diasDespues[d] > FAME_MAZOS_POR_DIA && diasDespues[d] > diasAntes[d]) excede.push('dia ' + d + ': ' + diasAntes[d] + ' -> ' + diasDespues[d]);
  }
  if (excede.length) {
    devolver();
    suma('ccRevertidos');
    var mot1 = 'la correccion deja mas de ' + FAME_MAZOS_POR_DIA + ' ataques en un dia sumando clanes';
    Logger.log(etq + 'REVERTIDO: ' + mot1 + ' (' + excede.join('; ') + '). No se escribe nada para este jugador y semana.');
    revisar('alarma', mot1, excede.join('; ') + '; clanes: ' + aEscribir.map(function (x) { return x.clanTag; }).join(','));
    return resultado;
  }

  // Comprobacion (b): la hoja debe haber quedado con el valor de cada clan escrito.
  var ev2 = _evaluarCorreccionConClanTagSemana_(filas, temporadaPropia, semana, tag, v,
    { ternaTags: ternaTags, nombresPorTag: nombres, nombre: nombreJugador });
  var noQuedo = [];
  for (var x = 0; x < aEscribir.length; x++) {
    if (sinPresenciaClanes[aEscribir[x].clanTag]) continue; // §PF436
    var hallado = null;
    for (var y = 0; y < ev2.decision.clanes.length; y++) { if (ev2.decision.clanes[y].clanTag === aEscribir[x].clanTag) hallado = ev2.decision.clanes[y]; }
    if (!hallado || hallado.accion !== 'sin-cambio') noQuedo.push(aEscribir[x].clanTag + (hallado ? ' (' + hallado.accion + ': ' + hallado.motivo + ')' : ''));
  }
  if (noQuedo.length) {
    devolver();
    suma('ccRevertidos');
    var conflictosCrr = conflictosReparto.filter(function (x) { return x.crr === 'conflicto'; });
    if (conflictosCrr.length) {
      // §PF302: el reparto no escribió porque lo que dice RoyaleAPI no cabe en lo que muestran los JSON de CurrentRiverRace: revisión manual con el motivo real.
      suma('ccConflictoCrr');
      var mot2c = 'conflicto con CurrentRiverRace: revision manual';
      var det2c = conflictosCrr.map(function (x) { return x.motivo; }).join(' | ');
      Logger.log(etq + 'REVERTIDO: ' + mot2c + ': ' + det2c + '. No se escribe nada para este jugador y semana.');
      revisar('alarma', mot2c, det2c);
      return resultado;
    }
    var mot2 = 'la hoja no quedo con el valor de la correccion (no caben los valores en las filas del clan)';
    Logger.log(etq + 'REVERTIDO: ' + mot2 + ': ' + noQuedo.join('; ') + '. No se escribe nada para este jugador y semana.');
    revisar('alarma', mot2, noQuedo.join('; ') + (conflictosReparto.length ? '; reparto: ' + conflictosReparto.map(function (x) { return x.motivo; }).join(' | ') : ''));
    return resultado;
  }

  // Comprobacion (c): las filas escritas deben ser validas (solo cuentan los problemas que no estaban antes).
  var invalidos = [];
  for (var w = 0; w < aEscribir.length; w++) {
    var prev = problemasAntes[aEscribir[w].clanTag] || [];
    var ahora = _problemasFilasClan_(filas, offsetsEscritos[aEscribir[w].clanTag]);
    for (var u = 0; u < ahora.length; u++) { if (prev.indexOf(ahora[u]) < 0) invalidos.push(aEscribir[w].clanTag + ' ' + ahora[u]); }
  }
  if (invalidos.length) {
    devolver();
    suma('ccRevertidos');
    var mot3 = 'la escritura dejaria valores invalidos en las filas del clan';
    Logger.log(etq + 'REVERTIDO: ' + mot3 + ': ' + invalidos.join('; ') + '. No se escribe nada para este jugador y semana.');
    revisar('alarma', mot3, invalidos.join('; '));
    return resultado;
  }

  for (var z = 0; z < aEscribir.length; z++) {
    if (sinPresenciaClanes[aEscribir[z].clanTag]) continue; // §PF436
    suma(aEscribir[z].accion === 'aplicar' ? 'ccAplicadas' : 'ccReconstruidas');
    Logger.log(etq + (aEscribir[z].accion === 'aplicar' ? 'Escrito clan ' : 'Reconstruido clan ') + aEscribir[z].clanTag +
      ': ataques=' + aEscribir[z].escribir.ataques + ' fame=' + aEscribir[z].escribir.fame + ' barcos=' +
      (aEscribir[z].escribir.barcos === null ? 'sin dato (no se toca)' : aEscribir[z].escribir.barcos) +
      (aEscribir[z].baja ? ' (BAJO valores de la hoja)' : ''));
  }
  var clave = String(tag).trim() + '|' + String(semana).trim();
  if (!offsetsPorClave[clave]) {
    var porClan2 = _indexarFilasJugadorSemanaPorClan_(filas, temporadaPropia, semana, tag);
    var m = {};
    Object.keys(porClan2).forEach(function (cn) { Object.keys(porClan2[cn]).forEach(function (o) { if (m[o] === undefined) m[o] = porClan2[cn][o]; }); });
    offsetsPorClave[clave] = m;
  }
  resultado.huboCambio = cambioAlgo;
  return resultado;
}

// ----- Battlelog contra guerra -----

/** Tag en mayusculas y con «#»; vacio si no hay. */
function _blgNormalizarTag_(t) {
  var s = String(t === undefined || t === null ? '' : t).trim().toUpperCase();
  if (!s) return '';
  return s.charAt(0) === '#' ? s : '#' + s;
}

/** Numero o null si la celda esta vacia o no es un numero. */
function _blgNumero_(v) {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  var n = Number(v);
  return isNaN(n) ? null : n;
}

/**
 * _blgParsearBattleTime_(texto) [→ Contexto_Base_Web.md §18B036]
 */
function _blgParsearBattleTime_(texto) {
  var m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d{1,3}))?Z$/.exec(
    String(texto === undefined || texto === null ? '' : texto).trim());
  if (!m) return null;
  var y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], s = +m[6];
  var ms = m[7] ? +((m[7] + '00').slice(0, 3)) : 0;
  var t = Date.UTC(y, mo - 1, d, h, mi, s, ms);
  var f = new Date(t);
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== mo - 1 || f.getUTCDate() !== d ||
      f.getUTCHours() !== h || f.getUTCMinutes() !== mi || f.getUTCSeconds() !== s) return null;
  return t;
}

/**
 * _blgLimitesValidos_(limites) [→ Contexto_Base_Web.md §18B037]
 */
function _blgLimitesValidos_(limites) {
  if (!Array.isArray(limites) || limites.length !== BLG_DIAS_GUERRA + 1) return false;
  for (var i = 0; i < limites.length; i++) {
    var l = limites[i];
    if (!l || typeof l.lo !== 'number' || typeof l.hi !== 'number' || isNaN(l.lo) || isNaN(l.hi) || l.lo > l.hi) return false;
    if (i > 0 && limites[i - 1].hi > l.lo) return false;
  }
  return true;
}

/**
 * _blgLimitesDiasGuerra_(fechaJueves, opciones) [→ Contexto_Base_Web.md §18B038]
 */
function _blgLimitesDiasGuerra_(fechaJueves, opciones) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fechaJueves === undefined || fechaJueves === null ? '' : fechaJueves).trim());
  if (!m) return null;
  var base = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  var f = new Date(base);
  if (f.getUTCFullYear() !== +m[1] || f.getUTCMonth() !== +m[2] - 1 || f.getUTCDate() !== +m[3]) return null;
  if (f.getUTCDay() !== 4) return null; // 4 = jueves
  var limites = [];
  if (opciones && opciones.cambios !== undefined && opciones.cambios !== null) {
    if (!Array.isArray(opciones.cambios)) return null;
    for (var c = 0; c < opciones.cambios.length; c++) {
      var cc = opciones.cambios[c];
      limites.push(cc ? { lo: cc.lo, hi: cc.hi } : cc);
    }
  } else {
    var v = (opciones && opciones.ventana) || BLG_VENTANA_CAMBIO_UTC;
    if (typeof v.desde !== 'number' || typeof v.hasta !== 'number' || isNaN(v.desde) || isNaN(v.hasta) ||
        v.desde < 0 || v.hasta > 24 || v.desde > v.hasta) return null;
    for (var i = 0; i <= BLG_DIAS_GUERRA; i++) {
      limites.push({ lo: base + i * 86400000 + v.desde * 3600000, hi: base + i * 86400000 + v.hasta * 3600000 });
    }
  }
  return _blgLimitesValidos_(limites) ? limites : null;
}

/**
 * _blgDiaDeBatalla_(ms, limites) [→ Contexto_Base_Web.md §18B039]
 */
function _blgDiaDeBatalla_(ms, limites) {
  var invalido = { estado: 'invalido', dia: null, candidatos: [], puedeSerFuera: false };
  if (typeof ms !== 'number' || isNaN(ms) || !_blgLimitesValidos_(limites)) return invalido;
  var n = BLG_DIAS_GUERRA;
  if (ms < limites[0].lo || ms >= limites[n].hi) return { estado: 'fuera', dia: null, candidatos: [], puedeSerFuera: true };
  for (var k = 0; k <= n; k++) {
    if (ms >= limites[k].lo && ms < limites[k].hi) {
      var cand = [];
      var fuera = false;
      if (k - 1 >= 0) cand.push(k - 1); else fuera = true;
      if (k <= n - 1) cand.push(k); else fuera = true;
      return { estado: 'ambiguo', dia: null, candidatos: cand, puedeSerFuera: fuera };
    }
    if (k < n && ms >= limites[k].hi && ms < limites[k + 1].lo) {
      return { estado: 'seguro', dia: k, candidatos: [k], puedeSerFuera: false };
    }
  }
  return invalido; // inalcanzable con limites validos
}

/** Lista ordenada y sin repetidos. */
function _blgUnicosOrdenados_(lista) {
  var vistos = {};
  var salida = [];
  for (var i = 0; i < lista.length; i++) {
    if (!vistos[lista[i]]) { vistos[lista[i]] = true; salida.push(lista[i]); }
  }
  salida.sort(function (a, b) { return a - b; });
  return salida;
}

/**
 * _blgClasificarBatallaGuerra_(fila) [→ Contexto_Base_Web.md §18B040]
 */
function _blgClasificarBatallaGuerra_(fila) {
  if (!Array.isArray(fila)) return { ok: false, motivo: 'la fila no es una lista' };
  var celda = fila[BLG_COL.TIPO];
  var tipo = String(celda === undefined || celda === null ? '' : celda).trim();

  if (tipo === 'riverRacePvP') {
    var pr = _blgNumero_(fila[BLG_COL.CORONAS_PROPIAS]);
    var ri = _blgNumero_(fila[BLG_COL.CORONAS_RIVAL]);
    var fame;
    if (pr !== null && ri !== null && pr > ri) fame = [FAME_PVP_GANA];
    else if (pr !== null && ri !== null && pr < ri) fame = [FAME_PVP_PIERDE];
    else fame = [FAME_PVP_PIERDE, FAME_PVP_GANA];
    return { ok: true, tipo: 'pvp', mazosPosibles: [1], famePosibles: fame, barcos: 0, exacto: fame.length === 1, incompleto: false };
  }

  if (tipo === 'boatBattle') {
    var ladoCel = fila[BLG_COL.LADO_BARCO];
    var lado = String(ladoCel === undefined || ladoCel === null ? '' : ladoCel).trim().toLowerCase();
    if (lado === 'defender') {
      return { ok: true, tipo: 'defensaBarco', mazosPosibles: [0], famePosibles: [0], barcos: 0, exacto: true, incompleto: false };
    }
    if (lado === '') {
      return { ok: true, tipo: 'barcoSinLado', mazosPosibles: [0], famePosibles: [0], barcos: 0, exacto: true, incompleto: false };
    }
    var g = String(fila[BLG_COL.BARCO_GANADO] === undefined || fila[BLG_COL.BARCO_GANADO] === null ? '' : fila[BLG_COL.BARCO_GANADO])
      .trim().toLowerCase();
    var fameB;
    if (g === 'sí' || g === 'si') fameB = [FAME_BARCO_GANA];
    else if (g === 'no') fameB = [FAME_BARCO_PIERDE];
    else fameB = [FAME_BARCO_PIERDE, FAME_BARCO_GANA];
    return { ok: true, tipo: 'barco', mazosPosibles: [1], famePosibles: fameB, barcos: 1, exacto: fameB.length === 1, incompleto: false };
  }

  if (tipo.indexOf('riverRaceDuel') === 0) {
    var rondasTxt = String(fila[BLG_COL.RONDAS_DUELO] === undefined || fila[BLG_COL.RONDAS_DUELO] === null ? '' : fila[BLG_COL.RONDAS_DUELO]).trim();
    var rondas = [];
    var legible = rondasTxt !== '';
    if (legible) {
      var partes = rondasTxt.split('/');
      for (var p = 0; p < partes.length; p++) {
        var mm = /^\s*(\d+|\?)\s+vs\s+(\d+|\?)\s*$/.exec(partes[p]);
        if (!mm) { legible = false; break; }
        rondas.push([mm[1] === '?' ? null : +mm[1], mm[2] === '?' ? null : +mm[2]]);
      }
    }
    if (!legible || (rondas.length !== 2 && rondas.length !== 3)) {
      var todas = [];
      for (var d = 0; d < FAME_DUELO_RESULTADOS.length; d++) todas.push(FAME_DUELO_RESULTADOS[d].fame);
      return { ok: true, tipo: 'duelo', mazosPosibles: [2, 3], famePosibles: _blgUnicosOrdenados_(todas), barcos: 0, exacto: false, incompleto: true };
    }
    var sumas = [0];
    for (var r = 0; r < rondas.length; r++) {
      var a = rondas[r][0], b = rondas[r][1];
      var valores;
      if (a !== null && b !== null && a > b) valores = [BLG_FAME_RONDA_DUELO_GANA];
      else if (a !== null && b !== null && a < b) valores = [BLG_FAME_RONDA_DUELO_PIERDE];
      else valores = [BLG_FAME_RONDA_DUELO_PIERDE, BLG_FAME_RONDA_DUELO_GANA];
      var nuevas = [];
      for (var s = 0; s < sumas.length; s++) for (var v = 0; v < valores.length; v++) nuevas.push(sumas[s] + valores[v]);
      sumas = nuevas;
    }
    var fameD = _blgUnicosOrdenados_(sumas);
    return { ok: true, tipo: 'duelo', mazosPosibles: [rondas.length], famePosibles: fameD, barcos: 0, exacto: fameD.length === 1, incompleto: false };
  }

  if (tipo.indexOf('riverRace') === 0) return { ok: false, motivo: 'tipo de guerra no reconocido: ' + tipo };
  return { ok: false, noEsGuerra: true };
}

/** Bucket vacio de un dia y clan (o de los clanes ajenos). */
function _blgBucketVacio_() {
  return { batallas: 0, mazosMin: 0, mazosMax: 0, fameMin: 0, fameMax: 0, pvp: 0, duelos: 0, barcos: 0, exacto: true };
}

/** Suma una batalla clasificada a un bucket y deja «exacto» al dia. */
function _blgSumarEnBucket_(bucket, c) {
  bucket.batallas += 1;
  bucket.mazosMin += c.mazosPosibles[0];
  bucket.mazosMax += c.mazosPosibles[c.mazosPosibles.length - 1];
  bucket.fameMin += c.famePosibles[0];
  bucket.fameMax += c.famePosibles[c.famePosibles.length - 1];
  if (c.tipo === 'pvp') bucket.pvp += 1;
  else if (c.tipo === 'duelo') bucket.duelos += 1;
  else if (c.tipo === 'barco') bucket.barcos += 1;
  bucket.exacto = bucket.mazosMin === bucket.mazosMax && bucket.fameMin === bucket.fameMax;
}

/** Suma el bucket b en el bucket destino. */
function _blgSumarBuckets_(destino, b) {
  destino.batallas += b.batallas;
  destino.mazosMin += b.mazosMin;
  destino.mazosMax += b.mazosMax;
  destino.fameMin += b.fameMin;
  destino.fameMax += b.fameMax;
  destino.pvp += b.pvp;
  destino.duelos += b.duelos;
  destino.barcos += b.barcos;
  destino.exacto = destino.mazosMin === destino.mazosMax && destino.fameMin === destino.fameMax;
}

function _blgBucketsDelDia_() {
  var l = [];
  for (var i = 0; i < BLG_DIAS_GUERRA; i++) l.push(_blgBucketVacio_());
  return l;
}

/**
 * _blgResumirBatallasJugador_(filas, tag, limites, opciones) [→ Contexto_Base_Web.md §18B041]
 */
function _blgResumirBatallasJugador_(filas, tag, limites, opciones) {
  var tagN = _blgNormalizarTag_(tag);
  if (!tagN) return { ok: false, motivo: 'falta el Tag del jugador' };
  if (!opciones || !Array.isArray(opciones.ternaTags)) return { ok: false, motivo: 'falta opciones.ternaTags (lista de clanes Terna)' };
  if (!_blgLimitesValidos_(limites)) return { ok: false, motivo: 'limites de dia no validos' };
  if (!Array.isArray(filas)) return { ok: false, motivo: 'filas no es una lista' };

  var terna = {};
  for (var t = 0; t < opciones.ternaTags.length; t++) {
    var tn = _blgNormalizarTag_(opciones.ternaTags[t]);
    if (tn) terna[tn] = true;
  }

  var res = {
    ok: true, tag: tagN, porClanDia: {}, ajenasPorDia: _blgBucketsDelDia_(), porDia: [],
    ambiguas: [], ajenasAmbiguas: [], fueraDeGuerra: [], conflictos: [], invalidas: [],
    duplicadas: 0, noGuerra: 0, deOtroTag: 0, descartadas: { clanAjeno: 0, sinClan: 0 },
    defensasBarco: 0, barcosSinLado: 0
  };

  // Paso 1: validar, quedarse con las filas del Tag y agrupar por clave de duplicado.
  var grupos = {};
  var orden = [];
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (!Array.isArray(f) || f.length < BLG_COL.ULTIMA_COMPARABLE + 1) {
      res.invalidas.push({ indice: i, motivo: 'fila con menos columnas de las esperadas' });
      continue;
    }
    if (_blgNormalizarTag_(f[BLG_COL.TAG]) !== tagN) { res.deOtroTag++; continue; }
    var clasif = _blgClasificarBatallaGuerra_(f);
    if (!clasif.ok) {
      if (clasif.noEsGuerra) res.noGuerra++;
      else res.invalidas.push({ indice: i, motivo: clasif.motivo });
      continue;
    }
    var bt = String(f[BLG_COL.BATTLETIME] === undefined || f[BLG_COL.BATTLETIME] === null ? '' : f[BLG_COL.BATTLETIME]).trim();
    var ms = _blgParsearBattleTime_(bt);
    if (ms === null) { res.invalidas.push({ indice: i, motivo: 'battleTime no valido: ' + bt }); continue; }
    var tipo = String(f[BLG_COL.TIPO]).trim();
    var clave = bt + '|' + tipo + '|' + tagN;
    var partes = [];
    for (var c = BLG_COL.PRIMERA_COMPARABLE; c <= BLG_COL.ULTIMA_COMPARABLE; c++) {
      var cel = f[c];
      partes.push(cel === undefined || cel === null ? '' : String(cel).trim());
    }
    var firma = partes.join('\u0001');
    if (!grupos[clave]) {
      grupos[clave] = { fila: f, clasif: clasif, ms: ms, battleTime: bt, firma: firma, conflicto: false };
      orden.push(clave);
    } else if (grupos[clave].firma === firma) {
      res.duplicadas++;
    } else {
      grupos[clave].conflicto = true;
    }
  }

  // Paso 2: clasificar cada batalla unica.
  for (var k = 0; k < orden.length; k++) {
    var g = grupos[orden[k]];
    if (g.conflicto) { res.conflictos.push(orden[k]); continue; }
    var dia = _blgDiaDeBatalla_(g.ms, limites);
    var clanTag = _blgNormalizarTag_(g.fila[BLG_COL.CLAN_TAG]);
    var esTerna = clanTag !== '' && terna[clanTag] === true;
    var cl = g.clasif;
    // NUEVO (4-oct-2026): defensas de barco y barcos sin lado no son mazos, fame ni barcos de nadie; se cuentan aparte [→ Contexto_Base_Web.md §18B042]
    var dentroSemana = (dia.estado !== 'fuera' && dia.estado !== 'invalido');
    if (cl.tipo === 'defensaBarco') { if (dentroSemana) res.defensasBarco++; continue; }
    if (cl.tipo === 'barcoSinLado') { if (dentroSemana) res.barcosSinLado++; continue; }
    var item = {
      clave: orden[k], battleTime: g.battleTime, clanTag: clanTag,
      clanNombre: String(g.fila[BLG_COL.CLAN_NOMBRE] === undefined || g.fila[BLG_COL.CLAN_NOMBRE] === null ? '' : g.fila[BLG_COL.CLAN_NOMBRE]).trim(),
      tipo: cl.tipo, mazosMin: cl.mazosPosibles[0], mazosMax: cl.mazosPosibles[cl.mazosPosibles.length - 1],
      fameMin: cl.famePosibles[0], fameMax: cl.famePosibles[cl.famePosibles.length - 1], barcos: cl.barcos
    };
    if (dia.estado === 'invalido') { res.invalidas.push({ indice: -1, motivo: 'no se pudo ubicar el dia de ' + orden[k] }); continue; }
    if (dia.estado === 'fuera') { res.fueraDeGuerra.push(item); continue; }
    if (!esTerna) {
      if (clanTag === '') res.descartadas.sinClan++; else res.descartadas.clanAjeno++;
      if (dia.estado === 'seguro') _blgSumarEnBucket_(res.ajenasPorDia[dia.dia], cl);
      else { item.candidatos = dia.candidatos; item.puedeSerFuera = dia.puedeSerFuera; res.ajenasAmbiguas.push(item); }
      continue;
    }
    if (dia.estado === 'ambiguo') {
      item.candidatos = dia.candidatos;
      item.puedeSerFuera = dia.puedeSerFuera;
      res.ambiguas.push(item);
      continue;
    }
    if (!res.porClanDia[clanTag]) res.porClanDia[clanTag] = _blgBucketsDelDia_();
    _blgSumarEnBucket_(res.porClanDia[clanTag][dia.dia], cl);
  }

  // Paso 3: totales por dia entre los clanes Terna y los ajenos (para el tope de 4 mazos).
  for (var d = 0; d < BLG_DIAS_GUERRA; d++) {
    var ternaDia = _blgBucketVacio_();
    Object.keys(res.porClanDia).forEach(function (cn) { _blgSumarBuckets_(ternaDia, res.porClanDia[cn][d]); });
    var ajenasDia = res.ajenasPorDia[d];
    var minTotal = ternaDia.mazosMin + ajenasDia.mazosMin;
    res.porDia.push({
      terna: ternaDia, ajenas: ajenasDia,
      mazosMin: minTotal, mazosMax: ternaDia.mazosMax + ajenasDia.mazosMax,
      excedeTope: minTotal > FAME_MAZOS_POR_DIA
    });
  }
  return res;
}

/**
 * _blgInicioDelLog_(battlelog) [→ Contexto_Base_Web.md §18B043]
 */
function _blgInicioDelLog_(battlelog) {
  if (!Array.isArray(battlelog)) return null;
  var menor = null;
  for (var i = 0; i < battlelog.length; i++) {
    var ms = _blgParsearBattleTime_(battlelog[i] && battlelog[i].battleTime);
    if (ms !== null && (menor === null || ms < menor)) menor = ms;
  }
  return menor;
}

/**
 * _blgCoberturaDia_(dia, limites, inicioLogMs, descargaMs) [→ Contexto_Base_Web.md §18B044]
 */
function _blgCoberturaDia_(dia, limites, inicioLogMs, descargaMs) {
  if (typeof dia !== 'number' || dia % 1 !== 0 || dia < 0 || dia >= BLG_DIAS_GUERRA || !_blgLimitesValidos_(limites)) return 'sin-dato';
  if (typeof inicioLogMs !== 'number' || isNaN(inicioLogMs) || typeof descargaMs !== 'number' || isNaN(descargaMs)) return 'sin-dato';
  var inicio = limites[dia];
  var fin = limites[dia + 1];
  if (descargaMs < inicio.lo) return 'futuro';
  if (inicioLogMs <= inicio.lo) return descargaMs >= fin.hi ? 'completa' : 'en-curso';
  if (inicioLogMs < fin.hi) return 'parcial';
  return 'ninguna';
}

/**
 * _blgDescargaMsDeNombreArchivo_(nombre) [→ Contexto_Base_Web.md §18B046]
 */
function _blgDescargaMsDeNombreArchivo_(nombre) {
  var m = /^(\d{2})-(\d{2})-(\d{4}) (\d{2})\.(\d{2}) - /.exec(String(nombre === null || nombre === undefined ? '' : nombre));
  if (!m) return null;
  var dd = Number(m[1]), mm = Number(m[2]), yy = Number(m[3]), hh = Number(m[4]), mi = Number(m[5]);
  var ms = Date.UTC(yy, mm - 1, dd, hh + 5, mi);
  var chk = new Date(ms - 5 * 3600000);
  if (chk.getUTCFullYear() !== yy || chk.getUTCMonth() !== mm - 1 || chk.getUTCDate() !== dd ||
      chk.getUTCHours() !== hh || chk.getUTCMinutes() !== mi) return null;
  return ms;
}

/**
 * _blgMejorCobertura_(dia, limites, logs) [→ Contexto_Base_Web.md §18B047]
 */
function _blgMejorCobertura_(dia, limites, logs) {
  var mejor = 'sin-dato';
  var n = 0;
  if (!Array.isArray(logs)) return { estado: mejor, n: 0 };
  for (var i = 0; i < logs.length; i++) {
    var lg = logs[i];
    if (!lg || typeof lg !== 'object') continue;
    n++;
    var est = _blgCoberturaDia_(dia, limites, lg.inicioMs, lg.descargaMs);
    if ((BLG_COBERTURA_RANGO[est] || 0) > (BLG_COBERTURA_RANGO[mejor] || 0)) mejor = est;
  }
  return { estado: mejor, n: n };
}

/**
 * _blgEtiquetaCobertura_(estado) [→ Contexto_Base_Web.md §18B048]
 */
function _blgEtiquetaCobertura_(estado) {
  switch (estado) {
    case 'completa':
      // CAMBIO (4-oct-2026, parte 59; corrige lo anterior, regla 9): ya NO es firme. Con los JSON reales se vio que el log [→ Contexto_Base_Web.md §18B049]
      return { firme: false, prio: 2, texto: 'NO CONCLUYENTE (el JSON actual cubre ese dia completo pero el log suele perder batallas; no se puede afirmar que la hoja tenga de mas)' };
    case 'en-curso':
      return { firme: false, prio: 2, texto: 'NO CONCLUYENTE (el JSON actual cubre hasta su descarga y ese dia aun no habia terminado)' };
    case 'parcial':
      return { firme: false, prio: 2, texto: 'NO CONCLUYENTE (el JSON actual empieza dentro de ese dia)' };
    case 'ninguna':
      return { firme: false, prio: 2, texto: 'NO CONCLUYENTE (el JSON actual no llega hasta ese dia)' };
    case 'futuro':
      return { firme: false, prio: 2, texto: 'NO CONCLUYENTE (el JSON se descargo antes de ese dia)' };
    case 'sin-medir':
      return { firme: false, prio: 2, texto: 'NO CONCLUYENTE (se acabo el tiempo para leer JSON en esta ejecucion; volver a correr el informe)' };
    default:
      return { firme: false, prio: 2, texto: 'NO CONCLUYENTE (no hay JSON legible de ese Tag para medir la cobertura)' };
  }
}

/**
 * _blgLeerLogsDeArchivos_(archivos) [→ Contexto_Base_Web.md §18B050]
 */
function _blgLeerLogsDeArchivos_(archivos) {
  var res = { logs: [], errores: 0, leidos: 0 };
  if (!Array.isArray(archivos)) return res;
  for (var i = 0; i < archivos.length; i++) {
    var a = archivos[i];
    try {
      var descargaMs = _blgDescargaMsDeNombreArchivo_(a.nombre);
      var datos = JSON.parse(a.file.getBlob().getDataAsString());
      res.leidos++;
      var inicioMs = _blgInicioDelLog_(datos);
      if (descargaMs === null || inicioMs === null) { res.errores++; continue; }
      res.logs.push({ inicioMs: inicioMs, descargaMs: descargaMs });
    } catch (e) {
      res.errores++;
    }
  }
  return res;
}

/**
 * _blgDecidirAmbiguas_(resumen) [→ Contexto_Base_Web.md §18B052]
 */
function _blgDecidirAmbiguas_(resumen) {
  if (!resumen || resumen.ok !== true || !Array.isArray(resumen.ambiguas) ||
      !Array.isArray(resumen.porDia) || resumen.porDia.length !== BLG_DIAS_GUERRA) {
    return { ok: false, motivo: 'resumen no valido (se espera el resultado de _blgResumirBatallasJugador_)' };
  }
  var salida = { ok: true, decisiones: [], diaUnico: 0, fuera: 0, sinDecidir: 0, imposibles: 0 };
  for (var i = 0; i < resumen.ambiguas.length; i++) {
    var a = resumen.ambiguas[i];
    var cand = [];
    var caben = [];
    var lista = Array.isArray(a.candidatos) ? a.candidatos : [];
    for (var c = 0; c < lista.length; c++) {
      var d = lista[c];
      if (typeof d !== 'number' || d % 1 !== 0 || d < 0 || d >= BLG_DIAS_GUERRA) continue;
      cand.push(d);
      if (resumen.porDia[d].mazosMin + a.mazosMin <= FAME_MAZOS_POR_DIA) caben.push(d);
    }
    var puedeFuera = a.puedeSerFuera === true;
    var opciones = caben.length + (puedeFuera ? 1 : 0);
    var r = {
      clave: a.clave, clanTag: a.clanTag, battleTime: a.battleTime, tipo: a.tipo,
      mazosMin: a.mazosMin, mazosMax: a.mazosMax, candidatos: cand, puedeSerFuera: puedeFuera,
      caben: caben, resultado: '', dia: null, motivo: ''
    };
    if (opciones === 0) {
      r.resultado = 'imposible';
      r.motivo = 'no cabe en ningun dia posible (pasaria de ' + FAME_MAZOS_POR_DIA + ' mazos)';
      salida.imposibles++;
    } else if (opciones === 1) {
      if (caben.length === 1) {
        r.resultado = 'dia-unico';
        r.dia = caben[0];
        r.motivo = 'solo ese dia tiene cupo';
        salida.diaUnico++;
      } else {
        r.resultado = 'fuera';
        r.motivo = 'los dias de guerra posibles no tienen cupo: es de fuera de la semana de guerra';
        salida.fuera++;
      }
    } else {
      r.resultado = 'sin-decidir';
      r.motivo = 'cabe en mas de una opcion: decidir con los contadores o revision manual';
      salida.sinDecidir++;
    }
    salida.decisiones.push(r);
  }
  return salida;
}

/**
 * _blgCompararConHoja_(resumen, hojaPorClanDia) [→ Contexto_Base_Web.md §18B053]
 */
function _blgCompararConHoja_(resumen, hojaPorClanDia, opciones) {
  // NUEVO (4-oct-2026, tanda del domingo): opciones.noComparar = { '#CLAN': [bool x4] }. Un (clan, dia) marcado true [→ Contexto_Base_Web.md §18B054]
  var noComparar = (opciones && opciones.noComparar && typeof opciones.noComparar === 'object') ? opciones.noComparar : {};
  if (!resumen || resumen.ok !== true || !resumen.porClanDia || typeof resumen.porClanDia !== 'object') {
    return { ok: false, motivo: 'resumen no valido (se espera el resultado de _blgResumirBatallasJugador_)' };
  }
  if (!hojaPorClanDia || typeof hojaPorClanDia !== 'object' || Array.isArray(hojaPorClanDia)) {
    return { ok: false, motivo: 'hojaPorClanDia no es un objeto { clanTag: [4 dias] }' };
  }
  var hoja = {};
  var clanesHoja = Object.keys(hojaPorClanDia);
  for (var k = 0; k < clanesHoja.length; k++) {
    var tn = _blgNormalizarTag_(clanesHoja[k]);
    if (!tn) continue;
    var arr = hojaPorClanDia[clanesHoja[k]];
    if (!Array.isArray(arr) || arr.length !== BLG_DIAS_GUERRA) {
      return { ok: false, motivo: 'la hoja del clan ' + clanesHoja[k] + ' no trae ' + BLG_DIAS_GUERRA + ' dias' };
    }
    hoja[tn] = arr;
  }
  var union = {};
  Object.keys(hoja).forEach(function (t) { union[t] = true; });
  Object.keys(resumen.porClanDia).forEach(function (t) { union[t] = true; });
  var clanes = Object.keys(union).sort();
  var res = { ok: true, filas: [], cuenta: { compatible: 0, faltanEnHoja: 0, sinFilaHoja: 0, logMenor: 0 } };
  for (var c = 0; c < clanes.length; c++) {
    var clan = clanes[c];
    for (var d = 0; d < BLG_DIAS_GUERRA; d++) {
      var h = hoja[clan] ? _blgNumero_(hoja[clan][d]) : null;
      var b = (resumen.porClanDia[clan] && resumen.porClanDia[clan][d]) || _blgBucketVacio_();
      if (h === null && b.batallas === 0) continue;
      if (h === null && noComparar[clan] && noComparar[clan][d] === true) continue;
      var estado;
      var diferencia = 0;
      if (h === null) { estado = 'sin-fila-hoja'; diferencia = b.mazosMin; res.cuenta.sinFilaHoja++; }
      else if (b.mazosMin > h) { estado = 'faltan-en-hoja'; diferencia = b.mazosMin - h; res.cuenta.faltanEnHoja++; }
      else if (b.mazosMax < h) { estado = 'log-menor'; diferencia = h - b.mazosMax; res.cuenta.logMenor++; }
      else { estado = 'compatible'; res.cuenta.compatible++; }
      res.filas.push({
        clanTag: clan, dia: d, hoja: h, logMin: b.mazosMin, logMax: b.mazosMax,
        batallas: b.batallas, estado: estado, diferencia: diferencia
      });
    }
  }
  return res;
}

/**
 * _blgCompararFameBarcos_(resumen, hojaFameBarcos) [→ Contexto_Base_Web.md §18B055]
 */
function _blgCompararFameBarcos_(resumen, hojaFameBarcos) {
  if (!resumen || resumen.ok !== true || !resumen.porClanDia || typeof resumen.porClanDia !== 'object') {
    return { ok: false, motivo: 'resumen no valido (se espera el resultado de _blgResumirBatallasJugador_)' };
  }
  if (!hojaFameBarcos || typeof hojaFameBarcos !== 'object' || Array.isArray(hojaFameBarcos)) {
    return { ok: false, motivo: 'hojaFameBarcos no es un objeto { clanTag: [4 dias] }' };
  }
  var hoja = {};
  var claves = Object.keys(hojaFameBarcos);
  for (var k = 0; k < claves.length; k++) {
    var tn = _blgNormalizarTag_(claves[k]);
    if (!tn) continue;
    var arr = hojaFameBarcos[claves[k]];
    if (!Array.isArray(arr) || arr.length !== BLG_DIAS_GUERRA) {
      return { ok: false, motivo: 'la hoja del clan ' + claves[k] + ' no trae ' + BLG_DIAS_GUERRA + ' dias' };
    }
    hoja[tn] = arr;
  }
  var res = {
    ok: true, filas: [],
    cuenta: { fame: { compatible: 0, faltanEnHoja: 0, logMenor: 0 }, barcos: { compatible: 0, faltanEnHoja: 0, logMenor: 0 } }
  };
  var clanes = Object.keys(hoja).sort();
  for (var c = 0; c < clanes.length; c++) {
    var clan = clanes[c];
    for (var d = 0; d < BLG_DIAS_GUERRA; d++) {
      var x = hoja[clan][d];
      if (x === null || x === undefined || typeof x !== 'object') continue;
      var b = (resumen.porClanDia[clan] && resumen.porClanDia[clan][d]) || _blgBucketVacio_();
      var campos = [
        { campo: 'fame', hoja: _blgNumero_(x.fame), min: b.fameMin, max: b.fameMax },
        { campo: 'barcos', hoja: _blgNumero_(x.barcos), min: b.barcos, max: b.barcos }
      ];
      for (var q = 0; q < campos.length; q++) {
        var cp = campos[q];
        if (cp.hoja === null) continue;
        var estado, diferencia = 0;
        var cu = res.cuenta[cp.campo];
        if (cp.min > cp.hoja) { estado = 'faltan-en-hoja'; diferencia = cp.min - cp.hoja; cu.faltanEnHoja++; }
        else if (cp.max < cp.hoja) { estado = 'log-menor'; diferencia = cp.hoja - cp.max; cu.logMenor++; }
        else { estado = 'compatible'; cu.compatible++; }
        res.filas.push({
          clanTag: clan, dia: d, campo: cp.campo, hoja: cp.hoja, logMin: cp.min, logMax: cp.max,
          batallas: b.batallas, estado: estado, diferencia: diferencia
        });
      }
    }
  }
  return res;
}

/**
 * _blgFechaIsoDeDiaGuerra_(valor) [→ Contexto_Base_Web.md §18B056]
 */
function _blgFechaIsoDeDiaGuerra_(valor) {
  var y, mo, d;
  if (valor instanceof Date) {
    if (isNaN(valor.getTime())) return '';
    var t = Utilities.formatDate(valor, 'America/Lima', 'yyyy-MM-dd');
    var mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
    if (!mt) return '';
    y = +mt[1]; mo = +mt[2]; d = +mt[3];
  } else {
    var s = String(valor === undefined || valor === null ? '' : valor).trim();
    var m1 = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s.*)?$/.exec(s);
    var m2 = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(s);
    if (m1) { d = +m1[1]; mo = +m1[2]; y = +m1[3]; }
    else if (m2) { y = +m2[1]; mo = +m2[2]; d = +m2[3]; }
    else return '';
  }
  var f = new Date(Date.UTC(y, mo - 1, d));
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== mo - 1 || f.getUTCDate() !== d) return '';
  return y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (d < 10 ? '0' : '') + d;
}

/**
 * _blgJuevesDeSemana_(isoDia, offset) [→ Contexto_Base_Web.md §18B057]
 */
function _blgJuevesDeSemana_(isoDia, offset) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDia || ''));
  if (!m || typeof offset !== 'number' || offset % 1 !== 0 || offset < -3 || offset >= BLG_DIAS_GUERRA) return '';
  var ms = Date.UTC(+m[1], +m[2] - 1, +m[3]) - offset * 86400000;
  var f = new Date(ms);
  var mo = f.getUTCMonth() + 1, d = f.getUTCDate();
  return f.getUTCFullYear() + '-' + (mo < 10 ? '0' : '') + mo + '-' + (d < 10 ? '0' : '') + d;
}

// ----- Hoja contra correcciones -----

/**
 * _hccCompararHojaConCorrecciones_(filas, overlay, temporada) [→ Contexto_Base_Web.md §18B121]
 */
function _hccCompararHojaConCorrecciones_(filas, overlay, temporada) {
  var porClan = {};   // "tag|semana|clan" -> mejor fila
  var i, f;
  for (i = 0; i < filas.length; i++) {
    f = filas[i];
    if (String(f[GC.TEMPORADA - 1]).trim() !== String(temporada)) continue;
    var tag = _blgNormalizarTag_(String(f[GC.TAG - 1]).trim());
    if (!tag) continue;
    var sem = String(f[GC.SEMANA - 1]).trim();
    var pidx = _blgNumero_(f[GC.PERIOD_IDX - 1]);
    if (pidx === null) continue;
    var num = _blgNumero_(f[GC.NUM - 1]);
    var clave = tag + '|' + sem + '|' + String(f[GC.CLAN - 1]).trim();
    var previa = porClan[clave];
    if (!previa || pidx > previa.pidx || (pidx === previa.pidx && (num === null ? -1 : num) > previa.num)) {
      porClan[clave] = { tag: tag, sem: sem, clan: String(f[GC.CLAN - 1]).trim(), pidx: pidx, num: (num === null ? -1 : num), fila: f };
    }
  }

  var porSemana = {}; // "tag|semana" -> { clanes: [...], ataques, fame, pidxMax, ... }
  Object.keys(porClan).forEach(function (k) {
    var p = porClan[k];
    var ks = p.tag + '|' + p.sem;
    if (!porSemana[ks]) porSemana[ks] = { tag: p.tag, sem: p.sem, nombre: '', clanes: [], ataques: 0, fame: 0, pidxMax: -1, filaMax: null };
    var g = porSemana[ks];
    g.ataques += _blgNumero_(p.fila[GC.ATAQUES_SEM - 1]) || 0;
    g.fame += _blgNumero_(p.fila[GC.FAME - 1]) || 0;
    if (p.clan && g.clanes.indexOf(p.clan) < 0) g.clanes.push(p.clan);
    if (!g.nombre) g.nombre = String(p.fila[GC.NOMBRE - 1] || '').trim();
    if (p.pidx > g.pidxMax) { g.pidxMax = p.pidx; g.filaMax = p.fila; }
  });

  // overlay por (tag normalizado, semana) de la temporada
  var ovPorTag = {};
  Object.keys(overlay || {}).forEach(function (k) {
    var p = k.split('|'); // temporada | semana | tag
    if (String(p[0]).trim() !== String(temporada)) return;
    ovPorTag[_blgNormalizarTag_(p[2]) + '|' + String(p[1]).trim()] = overlay[k];
  });

  var cuenta = { paresHoja: 0, comparados: 0, iguales: 0, hojaMayor: 0, hojaMenor: 0, mixtas: 0,
                 sinCorreccion: 0, semanaIncompleta: 0, correccionesSinFilaEnHoja: 0, soloFameDifiere: 0 };
  var resultados = [];
  Object.keys(porSemana).forEach(function (ks) {
    var g = porSemana[ks];
    cuenta.paresHoja++;
    var ov = ovPorTag[ks];
    if (!ov) { cuenta.sinCorreccion++; return; }
    if (g.pidxMax % 7 !== 6) { cuenta.semanaIncompleta++; return; }
    cuenta.comparados++;
    var dA = g.ataques - (Number(ov.ataquesSemana) || 0);
    var dF = g.fame - (Number(ov.fame) || 0);
    var estado;
    if (dA === 0 && dF === 0) { estado = 'igual'; cuenta.iguales++; }
    else if (dA >= 0 && dF >= 0) { estado = 'hoja-mayor'; cuenta.hojaMayor++; }
    else if (dA <= 0 && dF <= 0) { estado = 'hoja-menor'; cuenta.hojaMenor++; }
    else { estado = 'mixta'; cuenta.mixtas++; }
    if (estado !== 'igual' && dA === 0) cuenta.soloFameDifiere++;
    if (estado === 'igual') return;
    resultados.push({
      semana: g.sem, tag: g.tag, nombre: g.nombre, clanes: g.clanes.slice(),
      dia: String(g.filaMax[GC.DIA - 1] || '').trim(), diaGuerra: g.filaMax[GC.DIA_GUERRA - 1],
      origen: String(g.filaMax[GC.ORIGEN - 1] || '').trim(),
      hojaAtaques: g.ataques, hojaFame: g.fame,
      corrAtaques: Number(ov.ataquesSemana) || 0, corrFame: Number(ov.fame) || 0,
      aprobacion: ov.aprobacion || '', implementacion: ov.implementacion || '',
      dAtaques: dA, dFame: dF, estado: estado
    });
  });

  var sinFila = [];
  Object.keys(ovPorTag).forEach(function (ks) {
    if (!porSemana[ks]) { cuenta.correccionesSinFilaEnHoja++; sinFila.push(ks); }
  });

  // Orden: primero las que difieren en ataques, luego las que solo difieren en fame; dentro, semana y tag.
  resultados.sort(function (a, b) {
    var pa = a.dAtaques !== 0 ? 0 : 1, pb = b.dAtaques !== 0 ? 0 : 1;
    if (pa !== pb) return pa - pb;
    var sa = Number(a.semana) || 0, sb = Number(b.semana) || 0;
    if (sa !== sb) return sa - sb;
    return a.tag < b.tag ? -1 : (a.tag > b.tag ? 1 : 0);
  });
  sinFila.sort();
  return { resultados: resultados, cuenta: cuenta, sinFila: sinFila };
}

/**
 * _hccPisoLogDeResumen_(resumen) [→ Contexto_Base_Web.md §18B122]
 */
function _hccPisoLogDeResumen_(resumen) {
  var ataques = 0, fame = 0, amb = 0;
  Object.keys(resumen.porClanDia || {}).forEach(function (cl) {
    var dias = resumen.porClanDia[cl] || [];
    for (var d = 0; d < dias.length; d++) { ataques += dias[d].mazosMin; fame += dias[d].fameMin; }
  });
  (resumen.ambiguas || []).forEach(function (it) {
    if (it.puedeSerFuera) return;
    ataques += it.mazosMin; fame += it.fameMin; amb++;
  });
  return { ataques: ataques, fame: fame, ambiguasIncluidas: amb };
}

/**
 * _hccVeredictoLog_(hojaA, hojaF, corrA, corrF, pisoA, pisoF) [→ Contexto_Base_Web.md §18B123]
 */
function _hccVeredictoLog_(hojaA, hojaF, corrA, corrF, pisoA, pisoF) {
  var minPorAtaque = Math.min(FAME_BARCO_PIERDE, FAME_PVP_PIERDE);
  var notas = [];
  if (hojaF < minPorAtaque * hojaA) notas.push('la fame de la hoja (' + hojaF + ') no alcanza para sus ' + hojaA + ' ataque(s) (minimo ' + (minPorAtaque * hojaA) + ')');
  if (corrF < minPorAtaque * corrA) notas.push('la fame de la correccion (' + corrF + ') no alcanza para sus ' + corrA + ' ataque(s) (minimo ' + (minPorAtaque * corrA) + ')');
  function cmp(h, c, piso) {
    if (h === c) return 'igual';
    if (piso > Math.max(h, c)) return 'ambas-bajas';
    if (piso > c && piso <= h) return 'hoja';
    if (piso > h && piso <= c) return 'correccion';
    return 'no-distingue';
  }
  var vA = cmp(hojaA, corrA, pisoA);
  var vF = cmp(hojaF, corrF, pisoF);
  var codigo = vA !== 'igual' ? vA : vF;
  var campo = vA !== 'igual' ? 'ataques' : 'fame';
  if (codigo === 'no-distingue' && vF !== 'igual' && vF !== 'no-distingue') { codigo = vF; campo = 'fame'; }
  var textos = {
    'hoja': 'EL LOG RESPALDA LA HOJA (su piso de ' + campo + ' supera a la correccion y no a la hoja)',
    'correccion': 'EL LOG RESPALDA LA CORRECCION (su piso de ' + campo + ' supera a la hoja y no a la correccion)',
    'ambas-bajas': 'EL LOG SUPERA A LAS DOS (su piso de ' + campo + ' es mayor que hoja y correccion)',
    'no-distingue': 'EL LOG NO DISTINGUE (su piso no llega a ninguno de los dos valores; el log suele perder batallas, no favorece a ninguno)',
    'igual': 'SIN DIFERENCIA'
  };
  return { codigo: codigo, campo: campo, texto: textos[codigo], notas: notas };
}

// ----- Domingo y semana desde el JSON de RoyaleAPI -----

/**
 * _cdjEntero_(v) [→ Contexto_Base_Web.md §PF123]
 * Entero de una celda (vacio o no numerico = 0; trunca hacia cero).
 */
function _cdjEntero_(v) {
  if (v === '' || v === null || v === undefined) return 0;
  var n = Number(v);
  if (!isFinite(n)) return 0;
  return n < 0 ? Math.ceil(n) : Math.floor(n);
}

/**
 * _cdjNormalizarClan_(c) [→ Contexto_Base_Web.md §PF123]
 * En los registros perfil de RoyaleAPI el clan a veces trae basura de rascado (salto de linea y una fecha): se corta en el primer salto de linea.
 */
function _cdjNormalizarClan_(c) {
  return String(c === null || c === undefined ? '' : c).split('\n')[0].trim();
}

/**
 * _cdjEstadoDia_(m, a, b) [→ Contexto_Base_Web.md §PF123]
 * 'sin_ataques' si todo es 0; 'existe' si (medallas, ataques, barcos) es un dia posible (equivale a una clave de Diario_C); 'no_existe' en otro caso.
 */
function _cdjEstadoDia_(m, a, b) {
  if (a === 0 && m === 0 && b === 0) return 'sin_ataques';
  var k = m + '|' + a + '|' + b;
  if (_CDJ_CACHE_DIA_POSIBLE[k] === undefined) _CDJ_CACHE_DIA_POSIBLE[k] = _fameEsPosibleDia_(a, m, b);
  return _CDJ_CACHE_DIA_POSIBLE[k] ? 'existe' : 'no_existe';
}

/**
 * _cdjIndexarRegistrosJson_(registrosPorTag) [→ Contexto_Base_Web.md §PF123]
 * registrosPorTag: { '#TAG': [registro, ...] } con los registros de todos los JSON individuales de ese tag.
 * Devuelve { series: { 'TAG|clan|T|S': [[ataques, fame, barcos|null, fuente, cerrada], ...] }, porSemana: { 'T|S': { 'TAG': { clan: true } } } }.
 */
function _cdjIndexarRegistrosJson_(registrosPorTag) {
  var series = {}, porSemana = {};
  Object.keys(registrosPorTag || {}).forEach(function (tagCrudo) {
    var tag = String(tagCrudo).trim().toUpperCase();
    (registrosPorTag[tagCrudo] || []).forEach(function (x) {
      if (!x || x.externa === true) return; // §PF340: las filas de clan externo viven solo en el JSON individual; nunca entran a Guerra ni a Backup_Guerra.csv
      var t = Number(x.temporadaInterna), s = Number(x.semana);
      var ataques = Number(x.ataques), fame = Number(x.fame);
      if (!(t > 0) || !(s > 0) || !isFinite(ataques) || !isFinite(fame)) return;
      var barcos = (x.barcos === null || x.barcos === undefined || x.barcos === '') ? null : Number(x.barcos);
      if (barcos !== null && !isFinite(barcos)) barcos = null;
      var clan = _cdjNormalizarClan_(x.clan);
      var v = [ataques, fame, barcos, String(x.fuente || ''), !!x.cerrada];
      var k = tag + '|' + clan + '|' + t + '|' + s;
      var lista = series[k] || (series[k] = []);
      var vk = JSON.stringify(v);
      for (var i = 0; i < lista.length; i++) { if (JSON.stringify(lista[i]) === vk) return; }
      lista.push(v);
      var ks = t + '|' + s;
      if (!porSemana[ks]) porSemana[ks] = {};
      if (!porSemana[ks][tag]) porSemana[ks][tag] = {};
      porSemana[ks][tag][clan] = true;
    });
  });
  return { series: series, porSemana: porSemana };
}

/**
 * _cdjJsonDeSerie_(regs) [→ Contexto_Base_Web.md §PF123]
 * Valor semanal del JSON para una serie. Prefiere los registros cerrados (perfil, log, analytics). Si solo hay riverrace (instantanea de una semana sin cerrar)
 * usa el mayor, que es un piso y no el total. Devuelve { estado, ataques, fame, barcos, fuentes, cerrado }.
 */
function _cdjJsonDeSerie_(regs) {
  var vacio = { estado: 'sin_json', ataques: null, fame: null, barcos: null, fuentes: [], cerrado: false };
  if (!regs || !regs.length) return vacio;
  function unicos(lista) {
    var o = {};
    lista.forEach(function (z) { o[z] = true; });
    return Object.keys(o).sort();
  }
  var cerr = regs.filter(function (r) { return r[4]; });
  if (!cerr.length) {
    var mejor = regs[0];
    regs.forEach(function (r) { if (r[0] > mejor[0] || (r[0] === mejor[0] && r[1] > mejor[1])) mejor = r; });
    return { estado: 'ok', ataques: mejor[0], fame: mejor[1], barcos: mejor[2], fuentes: unicos(regs.map(function (r) { return r[3]; })), cerrado: false };
  }
  var pares = {}, barcos = {}, nPares = 0, nBarcos = 0;
  cerr.forEach(function (r) {
    var kp = r[0] + '|' + r[1];
    if (!pares[kp]) { pares[kp] = [r[0], r[1]]; nPares++; }
    if (r[2] !== null && !barcos[r[2]]) { barcos[r[2]] = true; nBarcos++; }
  });
  var fuentes = unicos(cerr.map(function (r) { return r[3]; }));
  if (nPares > 1 || nBarcos > 1) return { estado: 'json_inconsistente', ataques: null, fame: null, barcos: null, fuentes: fuentes, cerrado: true };
  var par = pares[Object.keys(pares)[0]];
  var bk = Object.keys(barcos);
  return { estado: 'ok', ataques: par[0], fame: par[1], barcos: bk.length ? Number(bk[0]) : null, fuentes: fuentes, cerrado: true };
}

/**
 * _calcularCompletarDomingoDesdeJson_(filas, indiceJson, opciones) [→ Contexto_Base_Web.md §PF123]
 * Funcion pura (sin Drive ni hoja). filas: filas de Guerra (GUERRA_TOTAL_COLS columnas, indices GC). indiceJson: salida de _cdjIndexarRegistrosJson_.
 * Devuelve { cambios, cotejo, conteo }:
 *  - cambios: una por serie a completar { idx (fila en filas), temporada, semana, tag, nombre, clan, periodIndex, ataquesHoyAnt, ataquesHoyNuevo, ataquesSemAnt,
 *    ataquesSemNueva, fameAnt, fameNueva, barcosAnt, barcosNuevo, origenAnt, jsonAtaques, jsonFame, jsonBarcos, jsonFuentes, detalle };
 *  - cotejo: una por serie con el estado (coincide, sin_json, json_mas_reconstruido, json_mas_no_resuelve, json_menos, json_distinto, json_inconsistente, json_sin_cerrar);
 *  - conteo: { estado: cantidad }.
 */
function _calcularCompletarDomingoDesdeJson_(filas, indiceJson, opciones) {
  opciones = opciones || {};
  var topeA = opciones.topeAtaquesDia || COMPLETAR_DOMINGO_JSON_TOPE_ATAQUES_DIA;
  var topeM = opciones.topeMedallasDia || COMPLETAR_DOMINGO_JSON_TOPE_MEDALLAS_DIA;
  var letraDomingo = opciones.letraDomingo || COMPLETAR_DOMINGO_JSON_LETRA_DOMINGO;
  var semanas = {}, orden = [];
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (String(f[GC.ETAPA - 1] || '').trim() !== 'Guerra') continue;
    var t = _cdjEntero_(f[GC.TEMPORADA - 1]), s = _cdjEntero_(f[GC.SEMANA - 1]);
    if (!(t > 0) || !(s > 0)) continue;
    var ks = t + '|' + s;
    if (!semanas[ks]) { semanas[ks] = { t: t, s: s, idxs: [] }; orden.push(ks); }
    semanas[ks].idxs.push(i);
  }
  orden.sort(function (x, y) {
    var a = x.split('|'), b = y.split('|');
    return (Number(a[0]) - Number(b[0])) || (Number(a[1]) - Number(b[1]));
  });
  var salida = { cambios: [], repartos: [], cotejo: [], conteo: {}, repararMenos: !!opciones.repararMenos };
  orden.forEach(function (ks) { _cdjProcesarSemana_(filas, semanas[ks], indiceJson, topeA, topeM, letraDomingo, salida); });
  salida.cotejo.forEach(function (c) { salida.conteo[c.estado] = (salida.conteo[c.estado] || 0) + 1; });
  return salida;
}

/**
 * _cdjProcesarSemana_(filas, sem, indiceJson, topeA, topeM, letraDomingo, salida) [→ Contexto_Base_Web.md §PF123]
 * Cotejo y reconstruccion de UNA semana (ver _calcularCompletarDomingoDesdeJson_).
 */
function _cdjProcesarSemana_(filas, sem, indiceJson, topeA, topeM, letraDomingo, salida) {
  var T = sem.t, S = sem.s;
  var piSet = {}, letras = {};
  sem.idxs.forEach(function (i) {
    var f = filas[i];
    var pi = _cdjEntero_(f[GC.PERIOD_IDX - 1]);
    piSet[pi] = true;
    var l = String(f[GC.DIA - 1] || '').trim();
    if (!letras[pi]) letras[pi] = {};
    letras[pi][l] = (letras[pi][l] || 0) + 1;
  });
  var pis = Object.keys(piSet).map(Number).sort(function (a, b) { return a - b; });
  var dom = pis.length ? pis[pis.length - 1] : null;
  var letraDom = '';
  if (dom !== null) {
    var mejorN = -1;
    Object.keys(letras[dom]).forEach(function (l) { if (letras[dom][l] > mejorN) { mejorN = letras[dom][l]; letraDom = l; } });
  }
  var domEsDomingo = (letraDom === letraDomingo);

  // Series (jugador + clan): gana la ultima fila del archivo si un periodIndex se repite.
  var series = {}, repetidas = {}, claves = [];
  sem.idxs.forEach(function (i) {
    var f = filas[i];
    var tag = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    var clan = String(f[GC.CLAN - 1] === null || f[GC.CLAN - 1] === undefined ? '' : f[GC.CLAN - 1]).trim();
    var pi = _cdjEntero_(f[GC.PERIOD_IDX - 1]);
    var sk = tag + '|' + clan;
    if (!series[sk]) { series[sk] = { tag: tag, clan: clan, porPi: {} }; repetidas[sk] = {}; claves.push(sk); }
    if (series[sk].porPi[pi] !== undefined) repetidas[sk][pi] = true;
    series[sk].porPi[pi] = i;
  });

  // Valores del dia por serie (Fame y Barcos son acumulados de la semana: el dia es la diferencia con la fila anterior).
  var dia = {};
  claves.forEach(function (sk) {
    var d = series[sk].porPi;
    var ps = Object.keys(d).map(Number).sort(function (a, b) { return a - b; });
    var pf = 0, pb = 0;
    ps.forEach(function (pi) {
      var f = filas[d[pi]];
      var fame = _cdjEntero_(f[GC.FAME - 1]), barcos = _cdjEntero_(f[GC.BARCOS - 1]), ataques = _cdjEntero_(f[GC.ATAQUES_HOY - 1]);
      dia[sk + '|' + pi] = { m: fame - pf, a: ataques, b: barcos - pb, i: d[pi], recon: false };
      pf = fame; pb = barcos;
    });
  });

  // Cotejo con el JSON.
  var candidatos = {}, candidatosMenos = {};
  var cotejoSemana = [];
  var tagsJsonSemana = (indiceJson.porSemana && indiceJson.porSemana[T + '|' + S]) || {};
  claves.sort().forEach(function (sk) {
    var ser = series[sk], d = ser.porPi;
    var ps = Object.keys(d).map(Number).sort(function (a, b) { return a - b; });
    var ultPi = ps[ps.length - 1];
    var ult = filas[d[ultPi]];
    var aS = 0;
    ps.forEach(function (pi) { aS += _cdjEntero_(filas[d[pi]][GC.ATAQUES_HOY - 1]); });
    var fS = _cdjEntero_(ult[GC.FAME - 1]), bS = _cdjEntero_(ult[GC.BARCOS - 1]);
    var js = _cdjJsonDeSerie_(indiceJson.series[ser.tag + '|' + ser.clan + '|' + T + '|' + S]);
    var fila = { temporada: T, semana: S, tag: ser.tag, nombre: String(ult[GC.NOMBRE - 1] || ''), clan: ser.clan, estado: '', tipo: '', detalle: '',
      idxDomingo: null, aS: aS, fS: fS, bS: bS, ja: js.ataques, jf: js.fame, jb: js.barcos, fuentes: js.fuentes.join(','), origenAnt: '' };
    if (js.estado === 'sin_json') {
      var otros = Object.keys(tagsJsonSemana[ser.tag] || {}).filter(function (c) { return c !== ser.clan; }).sort();
      fila.estado = 'sin_json'; fila.tipo = 'Aviso';
      fila.detalle = 'No hay JSON de ese jugador y clan esa semana' + (otros.length ? ' (hay JSON de otro clan del mismo jugador: ' + otros.join(' | ') + ')' : '');
    } else if (js.estado === 'json_inconsistente') {
      fila.estado = 'json_inconsistente'; fila.tipo = 'No se toca';
      fila.detalle = 'Los registros cerrados del JSON no coinciden entre si';
    } else {
      var da = js.ataques - aS, df = js.fame - fS, db = (js.barcos !== null) ? (js.barcos - bS) : 0;
      var txt = 'JSON - Guerra: ataques ' + (da > 0 ? '+' : '') + da + ', fame ' + (df > 0 ? '+' : '') + df + ', barcos ' + (db > 0 ? '+' : '') + db;
      if (da === 0 && df === 0 && db === 0) {
        fila.estado = 'coincide'; fila.tipo = '';
      } else if (!js.cerrado) {
        fila.estado = 'json_sin_cerrar'; fila.tipo = 'No se toca';
        fila.detalle = txt + ' (instantanea de una semana sin cerrar: es un piso, no el total)';
      } else if (da >= 0 && df >= 0 && db >= 0) {
        fila.estado = 'json_mas'; fila.detalle = txt;
        candidatos[sk] = { da: da, df: df, db: db, js: js };
      } else if (da <= 0 && df <= 0 && db <= 0) {
        fila.estado = 'json_menos'; fila.tipo = 'No se toca'; fila.detalle = txt;
        candidatosMenos[sk] = { js: js };
      } else {
        fila.estado = 'json_distinto'; fila.tipo = 'No se toca'; fila.detalle = txt + ' (unos suben y otros bajan)';
      }
    }
    cotejoSemana.push({ sk: sk, fila: fila });
  });

  // Reconstruccion: lo que el JSON trae de mas va al domingo, solo si el reparto es posible.
  var motivo = {}, prov = {};
  Object.keys(candidatos).forEach(function (sk) {
    var c = candidatos[sk];
    var x = dia[sk + '|' + dom];
    var ps = Object.keys(series[sk].porPi).map(Number);
    var ultPi = Math.max.apply(null, ps);
    if (!domEsDomingo) { motivo[sk] = 'la ultima fila de la semana no es un domingo (' + (letraDom || 'sin dia') + '): semana abierta o incompleta'; return; }
    if (!x || ultPi !== dom) { motivo[sk] = 'no hay fila de domingo para esa serie'; return; }
    if (repetidas[sk][dom]) { motivo[sk] = 'la fila del domingo esta repetida en la hoja: revisar a mano'; return; }
    // §PF298 (30-oct-2026, criterio 1 de §PF160): si a la serie le falta una fila ENTRE su primer y su ultimo dia, lo que el JSON trae de mas puede ser de ese dia y no del domingo; no se vuelca todo al domingo, se deja a revision manual. (Una serie que empieza tarde, p. ej. un ingreso el sabado, es contigua y no cae aqui.)
    var psSerie = ps.slice().sort(function (u, v) { return u - v; });
    if (psSerie[psSerie.length - 1] - psSerie[0] + 1 !== psSerie.length) { motivo[sk] = 'a la serie le falta la fila de un dia intermedio (periodIndex ' + psSerie.join(', ') + '): lo que el JSON trae de mas puede no ser del domingo; revisar a mano'; return; }
    var p = { m: x.m + c.df, a: x.a + c.da, b: x.b + c.db };
    if (p.a > topeA || p.m < 0 || p.m > topeM) { motivo[sk] = 'el domingo pasaria el tope diario (' + topeA + ' ataques o ' + topeM + ' medallas)'; return; }
    prov[sk] = p;
  });
  // La suma de los clanes del mismo jugador el domingo debe seguir siendo un dia posible.
  var porJugador = {};
  Object.keys(prov).forEach(function (sk) {
    var tag = series[sk].tag;
    if (!porJugador[tag]) porJugador[tag] = [];
    porJugador[tag].push(sk);
  });
  Object.keys(porJugador).forEach(function (tag) {
    var tot = { m: 0, a: 0, b: 0 };
    claves.forEach(function (sk) {
      if (series[sk].tag !== tag) return;
      var v = dia[sk + '|' + dom];
      if (!v) return;
      var src = prov[sk] || v;
      tot.m += src.m; tot.a += src.a; tot.b += src.b;
    });
    if (_cdjEstadoDia_(tot.m, tot.a, tot.b) === 'no_existe' || tot.a > topeA) {
      porJugador[tag].forEach(function (sk) {
        motivo[sk] = 'la suma de los clanes del jugador el domingo (' + tot.m + ' medallas, ' + tot.a + ' ataques, ' + tot.b + ' barcos) no es un dia posible';
        delete prov[sk];
      });
    }
  });

  // Reparto de lo que el JSON trae de MENOS (solo en el modo salida.repararMenos): se reparte la semana de la serie con _repartirSemanaConjunto_().
  var repMenos = {}, motivoMenos = {};
  if (salida.repararMenos) {
    Object.keys(candidatosMenos).forEach(function (sk) {
      if (Object.keys(repetidas[sk]).length) { motivoMenos[sk] = 'hay un periodo repetido en la hoja para esa serie: revisar a mano'; return; }
      var r = _cdjRepartirSerieMenos_(filas, series[sk], candidatosMenos[sk].js);
      if (r.ok) repMenos[sk] = r; else motivoMenos[sk] = r.motivo;
    });
    // Cada dia que cambia, la suma de los clanes del mismo jugador debe seguir siendo un dia posible y no pasar de topeA ataques.
    var tagsRep = {};
    Object.keys(repMenos).forEach(function (sk) { tagsRep[series[sk].tag] = true; });
    Object.keys(tagsRep).forEach(function (tag) {
      var pisCambiados = {};
      Object.keys(repMenos).forEach(function (sk) {
        if (series[sk].tag !== tag) return;
        repMenos[sk].cambios.forEach(function (c) { pisCambiados[c.periodIndex] = true; });
      });
      var malo = '';
      Object.keys(pisCambiados).forEach(function (pi) {
        var tot = { m: 0, a: 0, b: 0 };
        claves.forEach(function (sk) {
          if (series[sk].tag !== tag) return;
          var v = repMenos[sk] ? repMenos[sk].dias[pi] : dia[sk + '|' + pi];
          if (!v) return;
          tot.m += v.m; tot.a += v.a; tot.b += v.b;
        });
        if (!malo && (_cdjEstadoDia_(tot.m, tot.a, tot.b) === 'no_existe' || tot.a > topeA)) {
          malo = 'la suma de los clanes del jugador el periodo ' + pi + ' (' + tot.m + ' medallas, ' + tot.a + ' ataques, ' + tot.b + ' barcos) no es un dia posible';
        }
      });
      if (malo) {
        Object.keys(repMenos).forEach(function (sk) {
          if (series[sk].tag !== tag) return;
          motivoMenos[sk] = malo;
          delete repMenos[sk];
        });
      }
    });
  }

  cotejoSemana.forEach(function (e) {
    var fila = e.fila, sk = e.sk;
    if (fila.estado === 'json_menos' && salida.repararMenos) {
      if (repMenos[sk]) {
        fila.estado = 'json_menos_reparado'; fila.tipo = 'Cambio';
        fila.detalle += ' | semana repartida con el JSON';
        salida.repartos.push({ temporada: T, semana: S, tag: fila.tag, nombre: fila.nombre, clan: fila.clan, cambios: repMenos[sk].cambios,
          jsonAtaques: fila.ja, jsonFame: fila.jf, jsonBarcos: fila.jb, jsonFuentes: fila.fuentes, detalle: fila.detalle });
      } else {
        fila.estado = 'json_menos_no_resuelve'; fila.tipo = 'SIN RESOLVER';
        fila.detalle += ' | ' + (motivoMenos[sk] || '');
      }
    }
    if (fila.estado === 'json_mas') {
      if (prov[sk]) {
        var c = candidatos[sk], x = dia[sk + '|' + dom];
        var f = filas[x.i];
        fila.estado = 'json_mas_reconstruido'; fila.tipo = 'Cambio';
        fila.detalle += ' | domingo completado';
        fila.idxDomingo = x.i;
        fila.origenAnt = String(f[GC.ORIGEN - 1] || '');
        salida.cambios.push({
          idx: x.i, temporada: T, semana: S, tag: fila.tag, nombre: fila.nombre, clan: fila.clan, periodIndex: dom,
          ataquesHoyAnt: _cdjEntero_(f[GC.ATAQUES_HOY - 1]), ataquesHoyNuevo: prov[sk].a,
          ataquesSemAnt: _cdjEntero_(f[GC.ATAQUES_SEM - 1]), ataquesSemNueva: c.js.ataques,
          fameAnt: _cdjEntero_(f[GC.FAME - 1]), fameNueva: c.js.fame,
          barcosAnt: _cdjEntero_(f[GC.BARCOS - 1]), barcosNuevo: fila.bS + c.db,
          origenAnt: fila.origenAnt, jsonAtaques: c.js.ataques, jsonFame: c.js.fame, jsonBarcos: c.js.barcos, jsonFuentes: fila.fuentes,
          detalle: fila.detalle
        });
      } else {
        fila.estado = 'json_mas_no_resuelve'; fila.tipo = 'SIN RESOLVER';
        fila.detalle += ' | ' + (motivo[sk] || '');
      }
    }
    salida.cotejo.push(fila);
  });
}

/**
 * _cdjRepartirSerieMenos_(filas, ser, js) [→ Contexto_Base_Web.md §PF123]
 * Para una serie (jugador y clan, una semana) donde el JSON cerrado de RoyaleAPI trae MENOS que lo guardado: reparte la semana con
 * _repartirSemanaConjunto_() (ataques, barcos y fame del JSON a la vez) sobre COPIAS de las filas; no escribe en el arreglo recibido.
 * Devuelve { ok:false, motivo } o { ok:true, cambios:[{ idx, periodIndex, letra, ataquesHoyAnt, ataquesHoyNuevo, ataquesSemAnt, ataquesSemNueva,
 * fameAnt, fameNueva, barcosAnt, barcosNuevo, origenAnt, origenNuevo }], dias:{ periodIndex: {m, a, b} } } (dias = el dia nuevo de cada fila).
 */
function _cdjRepartirSerieMenos_(filas, ser, js) {
  var pis = Object.keys(ser.porPi).map(Number).sort(function (a, b) { return a - b; });
  var tmp = [], offsets = {}, info = [];
  for (var p = 0; p < pis.length; p++) {
    var i = ser.porPi[pis[p]];
    var letra = String(filas[i][GC.DIA - 1] || '').trim();
    var off = REPARAR_SEMANA_JSON_OFFSET_DIA[letra];
    if (off === undefined) return { ok: false, motivo: 'dia de guerra no reconocido (' + (letra || 'vacio') + ')' };
    if (offsets[off] !== undefined) return { ok: false, motivo: 'hay dos filas el mismo dia (' + letra + ')' };
    tmp.push(filas[i].slice());
    offsets[off] = tmp.length - 1;
    info.push({ i: i, pi: pis[p], letra: letra });
  }
  var rep = _repartirSemanaConjunto_(tmp, offsets, { ataquesSemana: js.ataques, fame: js.fame, barcos: js.barcos });
  if (!rep.ok) return { ok: false, motivo: rep.motivo };
  var cambios = [], dias = {}, pf = 0, pb = 0;
  for (var q = 0; q < info.length; q++) {
    var a = filas[info[q].i], n = tmp[q];
    var fN = _cdjEntero_(n[GC.FAME - 1]), bN = _cdjEntero_(n[GC.BARCOS - 1]);
    dias[info[q].pi] = { m: fN - pf, a: _cdjEntero_(n[GC.ATAQUES_HOY - 1]), b: bN - pb };
    pf = fN; pb = bN;
    if (_cdjEntero_(a[GC.ATAQUES_HOY - 1]) !== _cdjEntero_(n[GC.ATAQUES_HOY - 1]) || _cdjEntero_(a[GC.ATAQUES_SEM - 1]) !== _cdjEntero_(n[GC.ATAQUES_SEM - 1]) ||
        _cdjEntero_(a[GC.FAME - 1]) !== fN || _cdjEntero_(a[GC.BARCOS - 1]) !== bN) {
      var og = String(a[GC.ORIGEN - 1] || '').trim();
      cambios.push({ idx: info[q].i, periodIndex: info[q].pi, letra: info[q].letra,
        ataquesHoyAnt: _cdjEntero_(a[GC.ATAQUES_HOY - 1]), ataquesHoyNuevo: _cdjEntero_(n[GC.ATAQUES_HOY - 1]),
        ataquesSemAnt: _cdjEntero_(a[GC.ATAQUES_SEM - 1]), ataquesSemNueva: _cdjEntero_(n[GC.ATAQUES_SEM - 1]),
        fameAnt: _cdjEntero_(a[GC.FAME - 1]), fameNueva: fN, barcosAnt: _cdjEntero_(a[GC.BARCOS - 1]), barcosNuevo: bN,
        origenAnt: og, origenNuevo: (og === '' || og === 'Original') ? 'Corregido' : og });
    }
  }
  if (!cambios.length) return { ok: false, motivo: 'el reparto no cambia ninguna fila' };
  return { ok: true, cambios: cambios, dias: dias };
}

/**
 * _cdjCargarRegistrosJsonDrive_(tagsSet, presupuestoMs) [→ Contexto_Base_Web.md §PF123]
 * Lee TODOS los JSON individuales de RoyaleAPI de esos tags (si un tag tiene mas de un archivo, junta los registros de todos). Se detiene si se pasa del presupuesto
 * de tiempo: en ese caso devuelve ok:false y no se debe escribir nada.
 */
function _cdjCargarRegistrosJsonDrive_(tagsSet, presupuestoMs) {
  var t0 = Date.now();
  var carpeta = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
  var reTag = /-\s(#[0-9A-Z]+)\.json$/i;
  var porTag = {}, archivos = 0, errores = 0;
  var it = carpeta.getFiles();
  while (it.hasNext()) {
    if (Date.now() - t0 > presupuestoMs) return { ok: false, porTag: porTag, archivos: archivos, errores: errores };
    var f = it.next();
    var m = reTag.exec(f.getName());
    if (!m) continue;
    var tagNombre = m[1].toUpperCase();
    if (!tagsSet[tagNombre]) continue;
    try {
      var d = JSON.parse(f.getBlob().getDataAsString('UTF-8'));
      var tag = String((d && d.tag) || tagNombre).trim().toUpperCase();
      if (!porTag[tag]) porTag[tag] = [];
      porTag[tag] = porTag[tag].concat(d.registros || []);
      archivos++;
    } catch (e) {
      errores++;
      Logger.log('[CompletarDomingoJson] No se pudo leer ' + f.getName() + ': ' + e.message);
    }
  }
  return { ok: true, porTag: porTag, archivos: archivos, errores: errores };
}

/**
 * _completarDomingoDesdeJsonRoyaleApi_(aplicar) [→ Contexto_Base_Web.md §PF123]
 * Informe (aplicar = false): solo lee y deja un CSV de informe en Drive. Aplicar (aplicar = true): respalda Backup_Guerra.csv, escribe en el CSV y en la hoja Guerra
 * (solo AtaquesHoy, AtaquesSemana, Fame, Barcos y Origen) y sincroniza la hoja con el CSV, igual que repararDomingosDesdeCorrecciones.
 */
function _completarDomingoDesdeJsonRoyaleApi_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[CompletarDomingoJson] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var ss = _getSs();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');

    // --- Fuentes: Backup_Guerra.csv (todas las temporadas) y hoja Guerra (temporada vigente) ---
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezadoCsv = null, filasCsv = null;
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed && parsed.length > 1) {
        encabezadoCsv = parsed[0];
        filasCsv = parsed.slice(1);
        for (var a = 0; a < filasCsv.length; a++) { while (filasCsv[a].length < GUERRA_TOTAL_COLS) filasCsv[a].push(''); }
      }
    }
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    var datosHoja = (sh && sh.getLastRow() >= 2) ? sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues() : null;
    if (!filasCsv && !datosHoja) { Logger.log('[CompletarDomingoJson] No hay filas en Backup_Guerra.csv ni en la hoja Guerra; no se hace nada.'); return; }

    // --- JSON de RoyaleAPI de los jugadores que aparecen en esas filas ---
    var tagsSet = {};
    [filasCsv, datosHoja].forEach(function (filas) {
      (filas || []).forEach(function (f) {
        if (String(f[GC.ETAPA - 1] || '').trim() !== 'Guerra') return;
        var tg = String(f[GC.TAG - 1] || '').trim().toUpperCase();
        if (tg) tagsSet[tg] = true;
      });
    });
    var lectura = _cdjCargarRegistrosJsonDrive_(tagsSet, COMPLETAR_DOMINGO_JSON_PRESUPUESTO_LECTURA_MS);
    if (!lectura.ok) {
      Logger.log('[CompletarDomingoJson] ABORT: se agoto el presupuesto de tiempo leyendo los JSON de RoyaleAPI (' + lectura.archivos + ' archivos leidos). No se escribio nada.');
      return;
    }
    var indiceJson = _cdjIndexarRegistrosJson_(lectura.porTag);

    var resCsv = filasCsv ? _calcularCompletarDomingoDesdeJson_(filasCsv, indiceJson) : null;
    var resHoja = datosHoja ? _calcularCompletarDomingoDesdeJson_(datosHoja, indiceJson) : null;

    // --- Informe en Drive: solo lo que cambia, no se toca o queda sin resolver (coincide y sin_json van como conteo en el log) ---
    var informe = [COMPLETAR_DOMINGO_JSON_ENCABEZADO_INFORME];
    var agregarInforme = function (fuente, res) {
      if (!res) return;
      res.cotejo.forEach(function (c) {
        if (c.estado === 'coincide' || c.estado === 'sin_json') return;
        var cambio = null;
        if (c.estado === 'json_mas_reconstruido') {
          for (var q = 0; q < res.cambios.length; q++) { if (res.cambios[q].idx === c.idxDomingo) { cambio = res.cambios[q]; break; } }
        }
        informe.push([fuente, c.tipo, c.temporada, c.semana, c.tag, c.nombre, c.clan, cambio ? cambio.periodIndex : '', c.estado,
          cambio ? cambio.ataquesHoyAnt : '', cambio ? cambio.ataquesHoyNuevo : '', cambio ? cambio.ataquesSemAnt : '', cambio ? cambio.ataquesSemNueva : '',
          cambio ? cambio.fameAnt : '', cambio ? cambio.fameNueva : '', cambio ? cambio.barcosAnt : '', cambio ? cambio.barcosNuevo : '',
          c.ja === null ? '' : c.ja, c.jf === null ? '' : c.jf, c.jb === null ? '' : c.jb, c.fuentes, c.detalle, c.origenAnt]);
      });
    };
    agregarInforme('Backup_Guerra.csv', resCsv);
    agregarInforme('Hoja Guerra', resHoja);
    var nombreInforme = 'Completar_DomingoDesdeJsonRoyaleApi ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSVInforme(informe));

    var nCsv = resCsv ? resCsv.cambios.length : 0, nHoja = resHoja ? resHoja.cambios.length : 0;
    if (aplicar && (nCsv > 0 || nHoja > 0)) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      if (csvText) _saveCSVToDrive('Backup_Guerra ANTES de completar DomingoDesdeJsonRoyaleApi ' + marca + '.csv', csvText);

      if (resCsv && nCsv) {
        resCsv.cambios.forEach(function (c) {
          var fila = filasCsv[c.idx];
          fila[GC.ATAQUES_HOY - 1] = String(c.ataquesHoyNuevo);
          fila[GC.ATAQUES_SEM - 1] = String(c.ataquesSemNueva);
          fila[GC.FAME - 1] = String(c.fameNueva);
          fila[GC.BARCOS - 1] = String(c.barcosNuevo);
          fila[GC.ORIGEN - 1] = 'Reconstruido';
        });
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezadoCsv].concat(filasCsv)));
      }
      if (resHoja && nHoja) {
        // Solo AtaquesHoy, AtaquesSemana, Barcos, Fame y Origen: no se reescribe el resto (la merma la recalcula _syncGuerraCSV).
        var bloque = datosHoja.map(function (r) { return [r[GC.ATAQUES_HOY - 1], r[GC.ATAQUES_SEM - 1], r[GC.FAME - 1], r[GC.BARCOS - 1]]; });
        var colOrigen = datosHoja.map(function (r) { return [r[GC.ORIGEN - 1]]; });
        resHoja.cambios.forEach(function (c) {
          bloque[c.idx] = [c.ataquesHoyNuevo, c.ataquesSemNueva, c.fameNueva, c.barcosNuevo];
          colOrigen[c.idx][0] = 'Reconstruido';
        });
        // 30-oct-2026 (§PF304): con el orden nuevo ya no son 4 columnas contiguas (entre Semana y Barcos están las 2 de merma): dos tramos.
        sh.getRange(2, GC.ATAQUES_HOY, bloque.length, 2).setValues(bloque.map(function (b) { return [b[0], b[1]]; }));   // AtaquesHoy, AtaquesSemana
        sh.getRange(2, GC.BARCOS, bloque.length, 2).setValues(bloque.map(function (b) { return [b[3], b[2]]; }));        // Barcos, Fame (ese orden en la hoja)
        sh.getRange(2, GC.ORIGEN, colOrigen.length, 1).setValues(colOrigen);
        _syncGuerraCSV(sh); // propaga la hoja al CSV, igual que en PF031, PF045 y PF047
      }
    }

    function resumenConteo(res) {
      if (!res) return 'sin filas';
      return Object.keys(res.conteo).sort().map(function (k) { return k + ' ' + res.conteo[k]; }).join(', ');
    }
    Logger.log('[CompletarDomingoJson] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). JSON: ' + lectura.archivos +
      ' archivo(s) leidos, ' + lectura.errores + ' con error. Backup_Guerra.csv: ' + nCsv + ' serie(s) a completar (' + resumenConteo(resCsv) + '). Hoja Guerra: ' + nHoja +
      ' serie(s) a completar (' + resumenConteo(resHoja) + '). ' +
      (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay nada que completar.') +
      (aplicar ? ' Si cambio la hoja, corre updateControlSheet() y actualizarControl2() para refrescar los controles.' : ' (No se escribio nada en Guerra; corre completarDomingoDesdeJsonRoyaleApiAplicar() para aplicar.)'));
  } finally {
    lock.releaseLock();
  }
}

/**
 * _repararSemanaDesdeJsonRoyaleApi_(aplicar) [→ Contexto_Base_Web.md §PF123]
 * Informe (aplicar = false): solo lee y deja un CSV de informe en Drive. Aplicar (aplicar = true): respalda Backup_Guerra.csv, escribe en el CSV y en la hoja Guerra
 * (solo AtaquesHoy, AtaquesSemana, Fame, Barcos y Origen de las filas que cambian) y sincroniza la hoja con el CSV.
 */
function _repararSemanaDesdeJsonRoyaleApi_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[RepararSemanaJson] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var ss = _getSs();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');

    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezadoCsv = null, filasCsv = null;
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed && parsed.length > 1) {
        encabezadoCsv = parsed[0];
        filasCsv = parsed.slice(1);
        for (var a = 0; a < filasCsv.length; a++) { while (filasCsv[a].length < GUERRA_TOTAL_COLS) filasCsv[a].push(''); }
      }
    }
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    var datosHoja = (sh && sh.getLastRow() >= 2) ? sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues() : null;
    if (!filasCsv && !datosHoja) { Logger.log('[RepararSemanaJson] No hay filas en Backup_Guerra.csv ni en la hoja Guerra; no se hace nada.'); return; }

    var tagsSet = {};
    [filasCsv, datosHoja].forEach(function (filas) {
      (filas || []).forEach(function (f) {
        if (String(f[GC.ETAPA - 1] || '').trim() !== 'Guerra') return;
        var tg = String(f[GC.TAG - 1] || '').trim().toUpperCase();
        if (tg) tagsSet[tg] = true;
      });
    });
    var lectura = _cdjCargarRegistrosJsonDrive_(tagsSet, COMPLETAR_DOMINGO_JSON_PRESUPUESTO_LECTURA_MS);
    if (!lectura.ok) {
      Logger.log('[RepararSemanaJson] ABORT: se agoto el presupuesto de tiempo leyendo los JSON de RoyaleAPI (' + lectura.archivos + ' archivos leidos). No se escribio nada.');
      return;
    }
    var indiceJson = _cdjIndexarRegistrosJson_(lectura.porTag);

    var resCsv = filasCsv ? _calcularCompletarDomingoDesdeJson_(filasCsv, indiceJson, { repararMenos: true }) : null;
    var resHoja = datosHoja ? _calcularCompletarDomingoDesdeJson_(datosHoja, indiceJson, { repararMenos: true }) : null;

    // --- Informe en Drive: una linea por fila que cambia, y una por serie que no se resuelve o que el JSON deja distinta ---
    var informe = [REPARAR_SEMANA_JSON_ENCABEZADO_INFORME];
    var agregarInforme = function (fuente, res) {
      if (!res) return;
      var porClave = {};
      res.repartos.forEach(function (r) { porClave[r.temporada + '|' + r.semana + '|' + r.tag + '|' + r.clan] = r; });
      res.cotejo.forEach(function (c) {
        if (c.estado !== 'json_menos_reparado' && c.estado !== 'json_menos_no_resuelve' && c.estado !== 'json_distinto' && c.estado !== 'json_inconsistente') return;
        var base = [fuente, c.tipo, c.temporada, c.semana, c.tag, c.nombre, c.clan];
        var fin = [c.ja === null ? '' : c.ja, c.jf === null ? '' : c.jf, c.jb === null ? '' : c.jb, c.fuentes, c.detalle];
        var rep = (c.estado === 'json_menos_reparado') ? porClave[c.temporada + '|' + c.semana + '|' + c.tag + '|' + c.clan] : null;
        if (rep) {
          rep.cambios.forEach(function (x) {
            informe.push(base.concat([x.periodIndex, x.letra, c.estado, x.ataquesHoyAnt, x.ataquesHoyNuevo, x.ataquesSemAnt, x.ataquesSemNueva,
              x.fameAnt, x.fameNueva, x.barcosAnt, x.barcosNuevo]).concat(fin).concat([x.origenAnt, x.origenNuevo]));
          });
        } else {
          informe.push(base.concat(['', '', c.estado, '', '', '', '', '', '', '', '']).concat(fin).concat(['', '']));
        }
      });
    };
    agregarInforme('Backup_Guerra.csv', resCsv);
    agregarInforme('Hoja Guerra', resHoja);
    var nombreInforme = 'Reparar_SemanaDesdeJsonRoyaleApi ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSVInforme(informe));

    var nCsv = resCsv ? resCsv.repartos.length : 0, nHoja = resHoja ? resHoja.repartos.length : 0;
    if (aplicar && (nCsv > 0 || nHoja > 0)) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      if (csvText) _saveCSVToDrive('Backup_Guerra ANTES de reparar SemanaDesdeJsonRoyaleApi ' + marca + '.csv', csvText);

      if (resCsv && nCsv) {
        resCsv.repartos.forEach(function (r) {
          r.cambios.forEach(function (c) {
            var fila = filasCsv[c.idx];
            fila[GC.ATAQUES_HOY - 1] = String(c.ataquesHoyNuevo);
            fila[GC.ATAQUES_SEM - 1] = String(c.ataquesSemNueva);
            fila[GC.FAME - 1] = String(c.fameNueva);
            fila[GC.BARCOS - 1] = String(c.barcosNuevo);
            fila[GC.ORIGEN - 1] = c.origenNuevo;
          });
        });
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezadoCsv].concat(filasCsv)));
      }
      if (resHoja && nHoja) {
        // Solo AtaquesHoy, AtaquesSemana, Barcos, Fame y Origen: no se reescribe el resto (la merma la recalcula _syncGuerraCSV).
        var bloque = datosHoja.map(function (r) { return [r[GC.ATAQUES_HOY - 1], r[GC.ATAQUES_SEM - 1], r[GC.FAME - 1], r[GC.BARCOS - 1]]; });
        var colOrigen = datosHoja.map(function (r) { return [r[GC.ORIGEN - 1]]; });
        resHoja.repartos.forEach(function (r) {
          r.cambios.forEach(function (c) {
            bloque[c.idx] = [c.ataquesHoyNuevo, c.ataquesSemNueva, c.fameNueva, c.barcosNuevo];
            colOrigen[c.idx][0] = c.origenNuevo;
          });
        });
        // 30-oct-2026 (§PF304): con el orden nuevo ya no son 4 columnas contiguas (entre Semana y Barcos están las 2 de merma): dos tramos.
        sh.getRange(2, GC.ATAQUES_HOY, bloque.length, 2).setValues(bloque.map(function (b) { return [b[0], b[1]]; }));   // AtaquesHoy, AtaquesSemana
        sh.getRange(2, GC.BARCOS, bloque.length, 2).setValues(bloque.map(function (b) { return [b[3], b[2]]; }));        // Barcos, Fame (ese orden en la hoja)
        sh.getRange(2, GC.ORIGEN, colOrigen.length, 1).setValues(colOrigen);
        _syncGuerraCSV(sh); // propaga la hoja al CSV, igual que en PF031, PF045 y PF047
      }
    }

    function resumenConteo(res) {
      if (!res) return 'sin filas';
      return Object.keys(res.conteo).sort().map(function (k) { return k + ' ' + res.conteo[k]; }).join(', ');
    }
    Logger.log('[RepararSemanaJson] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). JSON: ' + lectura.archivos +
      ' archivo(s) leidos, ' + lectura.errores + ' con error. Backup_Guerra.csv: ' + nCsv + ' serie(s) a reparar (' + resumenConteo(resCsv) + '). Hoja Guerra: ' + nHoja +
      ' serie(s) a reparar (' + resumenConteo(resHoja) + '). ' +
      (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay nada que reparar.') +
      (aplicar ? ' Si cambio la hoja, corre updateControlSheet() y actualizarControl2() para refrescar los controles.' : ' (No se escribio nada en Guerra; corre repararSemanaDesdeJsonRoyaleApiAplicar() para aplicar.)'));
  } finally {
    lock.releaseLock();
  }
}
