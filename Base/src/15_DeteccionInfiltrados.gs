// 15_DeteccionInfiltrados.gs
// Cruza miembros ACTUALES de los 4 clanes Terna contra los clanes rivales
// de la temporada de guerra vigente (currentriverrace, 09_API_ClashRoyale.gs)
// más una lista MANUAL de clanes en conflicto, mantenida en la hoja
// CFG.SHEETS.CONFLICTOS ('Conflictos', ver _setupConflictos() en
// 02_Setup_Hojas.gs).
// FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje). [→ Contexto_Base_Web.md §15B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Índice de clanes externos: generar (§PF369; continúa sola desde el §PF398)
//    - Alertas de clanes sospechosos: actualizar (§PF375)
//  Parte 2 — Funciones que no se corren a mano
//    - Clanes externos: /clans una vez al día, solo a pedido (§PF390); resumen de miembros para la ficha (§PF391)
//    - Infiltrados: búsqueda desde la web de admin (en el orden de la llamada)
//    - Clanes: ficha y veto desde «Buscar clan» de la web de admin (§PF368)
//    - Índice de clanes externos: una pasada y ejecución programada, semanal o manual (§PF376, §PF398)
//    - Índice de clanes externos: armar, guardar y consultar (§PF369)
//    - Archivos por clan externo: un JSON histórico por clan (§PF378)
//    - Alertas de clanes sospechosos: cruzar, guardar y consultar (§PF375); miembros nuevos desde el JSON individual (§PF397)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// Columnas de la hoja 'Conflictos' (ver _setupConflictos(), 02_Setup_Hojas.gs). [→ Contexto_Base_Web.md §15B002]
var CFC = { TAG:1, NOMBRE:2, MOTIVO:3 };

var CFC_TOTAL_COLS = 3;

// Consulta de un clan una vez al día (§PF390): nombre del archivo por clan en DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL («Busqueda_Clan - #TAG.json»).
var CLAN_DIA_PREFIJO_ARCHIVO = 'Busqueda_Clan - ';

// Índice de clanes externos (§PF369): por cada clan donde algún jugador nuestro jugó guerra sin ser de la Familia, qué Tags de jugador estuvieron ahí. Se arma leyendo los JSON individuales de RoyaleAPI.
var INDICE_CLANES_JSON = 'Indice_Clanes_Externos.json';
var INDICE_CLANES_CSV = 'Indice_Clanes_Externos.csv';
var INDICE_CLANES_PRESUPUESTO_MS = 270000;
// Ejecución programada del índice (§PF376): un activador semanal (08_Activadores.gs) llama a generarIndiceClanesExternosProgramado(); si el índice queda incompleto, se programa una continuación a INDICE_CLANES_CONT_ESPERA_MS, hasta INDICE_CLANES_CONT_MAX corridas seguidas.
var INDICE_CLANES_HANDLER_CONT = '_continuarGenerarIndiceClanesExternos';
var INDICE_CLANES_CONT_ESPERA_MS = 60000;
var INDICE_CLANES_CONT_MAX = 12; // §PF378: era 8; la primera vez hay que crear un archivo por clan (más de 1 400), y eso se reparte en varias corridas
var INDICE_CLANES_CONT_PROP = 'INDICE_CLANES_CONT_N';
var _indiceClanesCache_ = undefined;

// Archivos por clan externo (§PF378): carpeta Clanes_Externos dentro de Otros, un JSON «Clan - #TAG.json» por clan con sus jugadores y las semanas en que estuvieron ahí. Es HISTÓRICO: las semanas se suman y nunca se borran, aunque el JSON individual del jugador se limpie o se corrija. La corrida del índice lee los JSON individuales, guarda el avance en Indice_Clanes_Externos_Parcial.json (el índice completo anterior no se toca hasta terminar) y luego fusiona cada clan con su archivo. Indice_Clanes_Externos_Firmas.json guarda una firma de lo último fusionado por clan, para no volver a abrir los archivos que no cambiaron.
var CLANES_EXTERNOS_CARPETA = 'Clanes_Externos';
var CLAN_EXTERNO_PREFIJO = 'Clan - ';
var INDICE_CLANES_PARCIAL_JSON = 'Indice_Clanes_Externos_Parcial.json';
var INDICE_CLANES_FIRMAS_JSON = 'Indice_Clanes_Externos_Firmas.json';
var INDICE_CLANES_PARCIAL_MAX_EDAD_MS = 3 * 24 * 60 * 60 * 1000;
var CLANES_EXTERNOS_LISTAR_DESDE = 100;
var CLANES_EXTERNOS_FALLOS_MAX = 5;
var _clanesExternosCarpetaCache_ = undefined;
var _clanesExternosListoCache_ = undefined; // §PF378: «dd/MM/yyyy HH:mm» de la última corrida completa del índice ('' = todavía ninguna); se lee una vez por ejecución

// Alertas de clanes sospechosos (§PF375): jugadores nuestros que alguna vez jugaron guerra en un clan vetado, en conflicto o rival de la temporada. Se guardan en Drive (carpeta Otros) y no en una columna de Directorio: esa hoja tiene el mismo ancho que Inactivos y las filas se mueven entre las dos, así que una columna nueva obligaría a tocar las dos hojas, sus respaldos CSV y las tablas.
var ALERTAS_CLANES_JSON = 'Alertas_Clanes_Sospechosos.json';
var ALERTAS_CLANES_CACHE_KEY = 'ALERTAS_CLANES_RESUMEN_V1';
var ALERTAS_CLANES_CACHE_TTL_SEG = 21600;
var ALERTAS_CLANES_FIRMA_PROP = 'ALERTAS_CLANES_FIRMA';

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Índice de clanes externos: generar (§PF369) -----

/**
 * generarIndiceClanesExternos() [→ Contexto_Base_Web.md §PF369, §PF378, §PF398]
 * Lee los JSON individuales de RoyaleAPI y arma el índice «clan externo → jugadores nuestros que estuvieron ahí» (archivos por clan en Clanes_Externos, histórico, y como respaldo Indice_Clanes_Externos.json y .csv); el detalle del armado está en _generarIndiceClanesExternosUnaCorrida_().
 * Desde el 6-nov-2026 (§PF398) se continúa sola: corre una pasada y, si queda incompleto, programa la siguiente 60 s después (INDICE_CLANES_CONT_ESPERA_MS), hasta INDICE_CLANES_CONT_MAX corridas seguidas, igual que el activador semanal (§PF376). Basta correrla UNA vez; el registro de cada corrida dice cuánto falta y la última dice COMPLETO. Al completarse actualiza solo las alertas (§PF375). Si se agotan las corridas seguidas y sigue incompleto, se vuelve a correr a mano y sigue donde quedó.
 * Al empezar borra una continuación pendiente (para no tener dos corridas a la vez) y pone en cero el contador de corridas seguidas.
 */
function generarIndiceClanesExternos() {
  _borrarTriggersDeContinuacion(INDICE_CLANES_HANDLER_CONT);
  PropertiesService.getScriptProperties().setProperty(INDICE_CLANES_CONT_PROP, '0');
  _indiceClanesCorrerProgramado_();
}

// ----- Alertas de clanes sospechosos: actualizar (§PF375) -----

/**
 * actualizarAlertasClanesSospechosos() [→ Contexto_Base_Web.md §PF375]
 * Cruza el índice de clanes externos (generarIndiceClanesExternos(), debe estar COMPLETO) con los clanes vetados, en conflicto y rivales de la temporada, y guarda en Alertas_Clanes_Sospechosos.json qué jugadores nuestros estuvieron en ellos. Lo permanente es el CLAN (§PF378): un clan que dejó de ser rival no se quita, y se pueden sumar clanes pero no restar; su marca queda también en el archivo del clan (Clanes_Externos). Los jugadores se recalculan desde los archivos de clan en cada corrida.
 * Normalmente no hace falta correrla a mano: la corre sola generarIndiceClanesExternos() al completarse y capturarApiClanes_() cuando aparece un clan sospechoso nuevo (por ejemplo, un rival de la semana).
 */
function actualizarAlertasClanesSospechosos() {
  var r = _alertasClanesActualizar_('manual');
  if (!r.ok) Logger.log('[AlertasClanes] No se actualizó: ' + r.motivo);
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Clanes externos: /clans una vez al día, solo a pedido (§PF390) -----

/**
 * _obtenerClanDelDia_(tagNorm) [→ Contexto_Base_Web.md §PF390]
 * 5-nov-2026 (pedido de la usuaria: «que se consulte una vez al día por clan, así como upcomingchests, solo a pedido»). Única puerta a /clans/<Tag> para las
 * consultas web de clanes externos («Buscar clan», pastilla «¿Infiltrado?» del clan y «Vetar clan»). Mismo patrón que _webObtenerJsonJugadorDelDia() (37_Web_API.gs, cofres):
 * el JSON del clan se guarda en Drive (DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL, un archivo por clan: «Busqueda_Clan - #TAG.json», con { dia, fecha, ts, clan }; `ts` son los milisegundos de la consulta y falta en los archivos guardados antes del §PF391).
 * Si ese archivo es de HOY (día calendario de Lima, tomado de `dia` dentro del archivo), se lee de ahí y no se llama a la API. Si no, se consulta /clans/<Tag> UNA vez, se guarda y se devuelve.
 * Nunca se consulta por horario: solo cuando alguien lo pide. Si la API falla y hay un archivo de un día anterior, se devuelve ese en vez de un error. Un Tag que no existe no se guarda
 * (un error de tipeo no deja archivos). Si Drive falla al leer o al guardar, la consulta sigue y solo se pierde la reutilización.
 * @param {string} tagNorm Tag del clan sin «#» (cleanTag()).
 * @returns {?{info:Object, origen:string, fecha:string, ts:?number}} `info` es la respuesta de /clans/<Tag> (con memberList); `origen` es 'api', 'drive_hoy' o 'drive_anterior'; `fecha` es dd/MM/yyyy HH:mm (Lima) de la consulta; `ts` son sus milisegundos (null si el archivo es anterior al §PF391). null si no hay dato ni de hoy ni de antes.
 */
function _obtenerClanDelDia_(tagNorm) {
  var nombre = CLAN_DIA_PREFIJO_ARCHIVO + '#' + tagNorm + '.json';
  var tzLima = 'America/Lima';
  var ahora = new Date();
  var hoy = Utilities.formatDate(ahora, tzLima, 'yyyy-MM-dd');

  var folder = null;
  var guardado = null;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL);
    var it = folder.getFilesByName(nombre);
    if (it.hasNext()) {
      var g = JSON.parse(it.next().getBlob().getDataAsString('UTF-8'));
      if (g && g.dia && g.clan && g.clan.name) guardado = g;
    }
  } catch (eLeer) {
    Logger.log('[ClanDelDia] No se pudo leer el archivo de ' + tagNorm + ': ' + eLeer.message);
  }
  if (guardado && guardado.dia === hoy) {
    return { info: guardado.clan, origen: 'drive_hoy', fecha: guardado.fecha || '', ts: Number(guardado.ts) || null };
  }

  var info = null;
  try {
    info = _apiGet('/clans/' + encodeTag('#' + tagNorm));
  } catch (eApi) {
    Logger.log('[ClanDelDia] /clans falló para ' + tagNorm + ': ' + eApi.message);
  }
  if (info && info.name) {
    var fechaTxt = Utilities.formatDate(ahora, tzLima, 'dd/MM/yyyy HH:mm');
    if (folder) {
      try {
        _guardarArchivoProgresoVerificado_(folder, nombre, JSON.stringify({ dia: hoy, fecha: fechaTxt, ts: ahora.getTime(), clan: info }));
      } catch (eGuardar) {
        Logger.log('[ClanDelDia] No se pudo guardar el archivo de ' + tagNorm + ': ' + eGuardar.message);
      }
    }
    return { info: info, origen: 'api', fecha: fechaTxt, ts: ahora.getTime() };
  }
  if (guardado) return { info: guardado.clan, origen: 'drive_anterior', fecha: guardado.fecha || '', ts: Number(guardado.ts) || null };
  return null;
}

/**
 * _resumenMiembrosClan_(memberList, refMs) [→ Contexto_Base_Web.md §PF391]
 * 5-nov-2026 (pedido de la usuaria: aprovechar más datos de /clans en «Buscar clan»). Resume la `memberList` de /clans/<Tag> para la ficha, sin otra consulta a la API:
 * líder (getClanLeader()), cantidad de colíderes, copas promedio de los miembros y cuántos se conectaron en los últimos 7 días.
 * `refMs` es la hora de la consulta (_obtenerClanDelDia_().ts): como la ficha puede salir de un archivo de hoy, «últimos 7 días» se cuenta desde esa hora y no desde ahora.
 * Sin `refMs` (archivo anterior al §PF391) se usa la hora actual. `lastSeen` viene como «20260706T035151.000Z» (UTC); un miembro sin ese dato no cuenta como activo ni como inactivo.
 * @param {Array} memberList memberList de /clans/<Tag>.
 * @param {?number} refMs Milisegundos de la consulta, o null.
 * @returns {{lider:string, coLideres:number, copasPromedio:?number, activos7d:?number}} Los dos últimos son null si no hay dato.
 */
function _resumenMiembrosClan_(memberList, refMs) {
  var res = { lider: '', coLideres: 0, copasPromedio: null, activos7d: null };
  if (!memberList || !memberList.length) return res;
  res.lider = getClanLeader(memberList);
  var limite = (Number(refMs) || new Date().getTime()) - 7 * 86400000;
  var sumaCopas = 0, conCopas = 0, activos = 0, conConexion = 0;
  for (var i = 0; i < memberList.length; i++) {
    var m = memberList[i] || {};
    if (m.role === 'coLeader') res.coLideres++;
    if (typeof m.trophies === 'number') { sumaCopas += m.trophies; conCopas++; }
    var f = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(String(m.lastSeen || ''));
    if (f) {
      conConexion++;
      if (Date.UTC(+f[1], +f[2] - 1, +f[3], +f[4], +f[5], +f[6]) >= limite) activos++;
    }
  }
  if (conCopas) res.copasPromedio = Math.round(sumaCopas / conCopas);
  if (conConexion) res.activos7d = activos;
  return res;
}

// ----- Infiltrados: búsqueda desde la web de admin (en el orden de la llamada) -----

/**
 * _webAdminBuscarInfiltrado(token, tag, soloClan) [→ Contexto_Base_Web.md §15B009]
 * `soloClan` (5-nov-2026, §PF367): la tarjeta «Detección de infiltrados» de admin.html solo revisa clanes; la pastilla «¿Infiltrado?» de la ficha cubre al jugador.
 */
function _webAdminBuscarInfiltrado(token, tag, soloClan) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  return _buscarInfiltrado(tag, soloClan === true || soloClan === '1' || soloClan === 'true');
}

/**
 * _buscarInfiltrado(query, soloClan) [→ Contexto_Base_Web.md §15B008]
 */
function _buscarInfiltrado(query, soloClan) {
  var tagNorm = cleanTag(query);
  if (!tagNorm || tagNorm.length < 3) {
    return { ok: false, error: 'Ingresa un Tag de clan o de jugador (con o sin #).' };
  }

  var rivalesYConflicto = _getRivalesYConflicto(true);

  // 1) Probar como CLAN. §PF390: una consulta a /clans por clan y por día (_obtenerClanDelDia_()).
  var clanDelDia = _obtenerClanDelDia_(tagNorm);
  var clanInfo = clanDelDia ? clanDelDia.info : null;

  if (clanInfo && clanInfo.name && clanInfo.memberList) {
    var esRivalClan = !!rivalesYConflicto[tagNorm];
    var coincidenciasClan = [];
    for (var m = 0; m < clanInfo.memberList.length; m++) {
      var miembro = clanInfo.memberList[m];
      var tagMiembro = cleanTag(miembro.tag);
      var matches = _buscarEnRosterTerna(tagMiembro);
      if (matches.length) {
        coincidenciasClan.push({
          tagEnClanRival:    '#' + tagMiembro,
          nombreEnClanRival: miembro.name || '',
          rolEnClanRival:    mapRol(miembro.role),
          coincidencias:     matches
        });
      }
    }
    var respuestaClan = {
      ok: true,
      tipo: 'clan',
      clan: { tag: '#' + tagNorm, nombre: clanInfo.name, miembros: clanInfo.memberList.length },
      esRivalTemporada: esRivalClan,
      infoRival: esRivalClan ? rivalesYConflicto[tagNorm] : null,
      coincidencias: coincidenciasClan,
      // §PF390: de cuándo son los datos del clan y de dónde salieron ('api', 'drive_hoy' o 'drive_anterior').
      fechaConsulta: clanDelDia.fecha,
      origenDatos: clanDelDia.origen
    };
    // §PF368 (5-nov-2026, pedido de la usuaria): el clan vetado (NARANJA x) tuvo jugadores nuestros que ya salieron y hoy están en Inactivos o Vetados; no figuran en su lista actual.
    // §PF369: para cualquier clan, los jugadores nuestros que pasaron por él salen del índice de clanes externos (generarIndiceClanesExternos()), que lee los JSON individuales de RoyaleAPI. Sin índice completo solo queda lo del clan vetado.
    var tagsActuales = {};
    for (var q = 0; q < clanInfo.memberList.length; q++) tagsActuales[cleanTag(clanInfo.memberList[q].tag)] = true;
    var exMiembros = [];
    if (CFG.VETADO_TAG && cleanTag(CFG.VETADO_TAG) === tagNorm) {
      respuestaClan.esClanVetado = true;
      exMiembros = _rosterPasoPorClanVetado_(clanInfo.name, tagsActuales);
    }
    var jugadoresIndice = _indiceClanesJugadoresDe_(tagNorm);
    respuestaClan.indiceClanesDisponible = jugadoresIndice !== null;
    if (jugadoresIndice !== null) exMiembros = _exMiembrosDesdeIndice_(jugadoresIndice, tagsActuales, exMiembros);
    respuestaClan.exMiembros = exMiembros;
    return respuestaClan;
  }

  // Modo «solo clan» (§PF367): no se prueba como jugador, así que tampoco se gasta la consulta a /players.
  if (soloClan) {
    return { ok: false, error: 'No encontré ningún clan con ese Tag. Si es un jugador, usa la pastilla «¿Infiltrado?» de su ficha en «Buscar miembro».' };
  }

  // 2) Probar como JUGADOR.
  var playerInfo = null;
  try {
    playerInfo = _apiGet('/players/' + encodeTag('#' + tagNorm));
  } catch (ePlayer) {
    Logger.log('[DeteccionInfiltrados] /players falló para ' + tagNorm + ': ' + ePlayer.message);
  }

  if (playerInfo && playerInfo.name) {
    var clanActualTag = (playerInfo.clan && playerInfo.clan.tag) ? cleanTag(playerInfo.clan.tag) : '';
    var esRivalJugador = !!(clanActualTag && rivalesYConflicto[clanActualTag]);
    var historial = _buscarEnRosterTerna(tagNorm);
    var clanesExt = _clanesExternosDeJugador_(tagNorm, rivalesYConflicto);
    return {
      ok: true,
      tipo: 'jugador',
      jugador: {
        tag: '#' + tagNorm,
        nombre: playerInfo.name,
        clanActual:    (playerInfo.clan && playerInfo.clan.name) || '',
        clanActualTag: clanActualTag ? '#' + clanActualTag : ''
      },
      esRivalTemporada: esRivalJugador,
      infoRival: esRivalJugador ? rivalesYConflicto[clanActualTag] : null,
      historialTerna: historial,
      clanesExternos: clanesExt || [],
      clanesExternosDisponible: clanesExt !== null
    };
  }

  return { ok: false, error: 'No encontré ningún clan ni jugador con ese Tag. Verifica que esté bien escrito (incluyendo mayúsculas/minúsculas y los caracteres tras el #).' };
}

/**
 * _clanesExternosDeJugador_(tagNorm, rivalesYConflicto) [→ Contexto_Base_Web.md §PF367]
 * Clanes externos (que no son de CFG.TERNA_TAGS) donde el jugador jugó guerra, leídos de su JSON individual de RoyaleAPI (filas `externa: true`, §PF340).
 * Devuelve un arreglo por clan, del más reciente al más antiguo: { tag, nombre, semanas, ultima:{temporada,semana,temporadaRoyaleApi,supercell}, primera:{...igual}, infoRival }.
 * `temporada` es la propia (puede ser 0 o negativa en semanas anteriores a la T1 interna); `supercell` es el id «AAAA-MM» de esa semana (§PF368: la web lo muestra en vez de «T-7» cuando `temporada` <= 0).
 * `infoRival` es la entrada de rivalesYConflicto del clan (misma forma que la de la respuesta principal) o null. Devuelve null si el JSON no se pudo leer (distinto de [] = sin filas externas).
 * Solo ve semanas con fila de guerra: no prueba que no pasara por otro clan donde no jugó guerra.
 */
function _clanesExternosDeJugador_(tagNorm, rivalesYConflicto) {
  var historial = null;
  try {
    historial = _cargarHistorialGuerraIndividual('#' + tagNorm);
  } catch (e) {
    Logger.log('[DeteccionInfiltrados] JSON individual de ' + tagNorm + ' no se pudo leer: ' + e.message);
    return null;
  }
  var registros = (historial && historial.registros) ? historial.registros : [];
  var porClan = {};
  var orden = [];
  for (var i = 0; i < registros.length; i++) {
    var r = registros[i];
    if (!r || r.externa !== true) continue;
    var tagClan = r.clanTag ? cleanTag(r.clanTag) : '';
    var nombre = String(r.clan || '').replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim();
    var clave = tagClan ? ('T:' + tagClan) : ('N:' + nombre.toUpperCase());
    var g = porClan[clave];
    if (!g) {
      g = { tag: tagClan ? ('#' + tagClan) : '', nombre: nombre, semanasVistas: {}, semanas: 0, ultima: null, primera: null, infoRival: tagClan && rivalesYConflicto[tagClan] ? rivalesYConflicto[tagClan] : null };
      porClan[clave] = g;
      orden.push(clave);
    }
    if (!g.nombre && nombre) g.nombre = nombre;
    var temp = Number(r.temporadaInterna), sem = Number(r.semana);
    var claveSemana = temp + '|' + sem;
    if (!g.semanasVistas[claveSemana]) { g.semanasVistas[claveSemana] = true; g.semanas++; }
    var tRoy = Number(r.temporadaRoyaleAPI);
    var punto = { temporada: temp, semana: sem, temporadaRoyaleApi: isNaN(tRoy) ? null : tRoy, supercell: _temporadaSupercellDeRoyaleApi_(tRoy) };
    if (!g.ultima  || temp > g.ultima.temporada  || (temp === g.ultima.temporada  && sem > g.ultima.semana))  g.ultima  = punto;
    if (!g.primera || temp < g.primera.temporada || (temp === g.primera.temporada && sem < g.primera.semana)) g.primera = punto;
  }
  var salida = [];
  for (var k = 0; k < orden.length; k++) {
    var c = porClan[orden[k]];
    salida.push({ tag: c.tag, nombre: c.nombre, semanas: c.semanas, ultima: c.ultima, primera: c.primera, infoRival: c.infoRival });
  }
  salida.sort(function (a, b) {
    var ua = a.ultima || { temporada: 0, semana: 0 }, ub = b.ultima || { temporada: 0, semana: 0 };
    if (ua.temporada !== ub.temporada) return ub.temporada - ua.temporada;
    if (ua.semana !== ub.semana) return ub.semana - ua.semana;
    return b.semanas - a.semanas;
  });
  return salida;
}

/**
 * _temporadaSupercellDeRoyaleApi_(temporadaRoyaleApi) [→ Contexto_Base_Web.md §PF368]
 * Id «AAAA-MM» de la temporada de Supercell que corresponde a una temporada de RoyaleAPI (un mes por temporada; ancla 2026-05 = RoyaleAPI 132). Es el mismo cálculo de _cgwTemporadaSupercellTexto_() (18_CorreccionGuerra.gs) y usa sus constantes CGW_SUPERCELL_ANCLA_*, pero parte de la temporada de RoyaleAPI que ya trae cada fila del JSON individual, sin pasar por la propia ni por el offset. Devuelve '' si el número no es válido.
 */
function _temporadaSupercellDeRoyaleApi_(temporadaRoyaleApi) {
  var r = Number(temporadaRoyaleApi);
  if (isNaN(r) || r < 1) return '';
  var meses = CGW_SUPERCELL_ANCLA_ANIO * 12 + (CGW_SUPERCELL_ANCLA_MES - 1) + (r - CGW_SUPERCELL_ANCLA_ROYALEAPI);
  var anio = Math.floor(meses / 12), mes = (meses % 12) + 1;
  return anio + '-' + (mes < 10 ? '0' : '') + mes;
}

// ----- Clanes: ficha y veto desde «Buscar clan» de la web de admin (§PF368) -----

/**
 * _rosterPasoPorClanVetado_(nombreClan, tagsActuales) [→ Contexto_Base_Web.md §PF368]
 * Jugadores de nuestro roster que pasaron por el clan vetado (CFG.VETADO_TAG, NARANJA x) y ya no están en él: filas de Directorio, Inactivos o Vetados cuyo Clan Tag es el del clan vetado, o cuya Razón (o Clan, en Vetados) es el nombre del clan vetado. Se excluyen los Tags de `tagsActuales` (miembros actuales del clan, que ya salen en la tabla de coincidencias). Barato: lee tres hojas, no recorre JSON de Drive. Solo se pide para el clan vetado; el cruce inverso de cualquier otro clan no existe (habría que recorrer los JSON individuales). Devuelve [{ origen, tag, nombre, clan, razon }].
 */
function _rosterPasoPorClanVetado_(nombreClan, tagsActuales) {
  var salida = [];
  try {
    var ss = _getSs();
    var tagVet = cleanTag(CFG.VETADO_TAG);
    var norm = function (t) { return String(t || '').trim().toLowerCase(); };
    var nombres = {};
    nombres['naranja x'] = true;
    if (norm(nombreClan)) nombres[norm(nombreClan)] = true;
    var vistos = {};
    var agregar = function (origen, tag, nombre, clan, razon) {
      var t = cleanTag(tag);
      if (!t || (tagsActuales && tagsActuales[t]) || vistos[origen + '|' + t]) return;
      vistos[origen + '|' + t] = true;
      salida.push({ origen: origen, tag: '#' + t, nombre: String(nombre || ''), clan: String(clan || ''), razon: String(razon || '') });
    };

    var mapaDir = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.DIRECTORIO, IC.TAG - 1, DIR_SHEET_COLS);
    for (var kd in mapaDir) {
      var fd = mapaDir[kd];
      if (cleanTag(fd[IC.CLAN_TAG - 1]) === tagVet) agregar('Directorio', kd, fd[IC.NOMBRE - 1], fd[IC.CLAN - 1], '');
    }
    var mapaIna = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.INACTIVOS, IC.TAG - 1, INACTIVOS_TOTAL_COLS);
    for (var ki in mapaIna) {
      var fi = mapaIna[ki];
      if (cleanTag(fi[IC.CLAN_TAG - 1]) === tagVet || nombres[norm(fi[IC.RAZON - 1])] || nombres[norm(fi[IC.CLAN - 1])]) {
        agregar('Inactivos', ki, fi[IC.NOMBRE - 1], fi[IC.CLAN - 1], fi[IC.RAZON - 1]);
      }
    }
    var mapaVet = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.VETADOS, VC.TAG - 1, VETADOS_TOTAL_COLS);
    for (var kv in mapaVet) {
      var fv = mapaVet[kv];
      if (nombres[norm(fv[VC.RAZON - 1])] || nombres[norm(fv[VC.CLAN - 1])]) {
        agregar('Vetados', kv, fv[VC.NOMBRE - 1], fv[VC.CLAN - 1], fv[VC.RAZON - 1]);
      }
    }
  } catch (e) {
    Logger.log('[BuscarClan] _rosterPasoPorClanVetado_ falló: ' + e.message);
  }
  return salida;
}

/**
 * _webAdminBuscarClan(token, tag) [→ Contexto_Base_Web.md §PF368]
 * Ficha de un clan para «Buscar clan» de admin.html: los datos del clan salen de _obtenerClanDelDia_() (§PF390: /clans/<Tag> se consulta una vez por clan y por día; el resto del día se lee de Drive) más la lista de rivales y conflicto. No cruza los miembros con nuestro roster (eso lo hace la pastilla «¿Infiltrado?» con _buscarInfiltrado(tag, true)).
 * Respuesta: { ok, clan:{ tag, nombre, miembros, puntos, trofeosGuerra, ubicacion, tipo, copasRequeridas, descripcion, donacionesSemana, badgeId, liga, lider, coLideres, copasPromedio, activos7d, esNuestro }, esRivalTemporada, infoRival, fechaConsulta, origenDatos } o { ok:false, error }.
 */
function _webAdminBuscarClan(token, tag) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var tagNorm = cleanTag(tag);
  if (!tagNorm || tagNorm.length < 3) return { ok: false, error: 'Ingresa un Tag de clan (con o sin #).' };

  // §PF390: una consulta a /clans por clan y por día (_obtenerClanDelDia_()).
  var clanDelDia = _obtenerClanDelDia_(tagNorm);
  var clanInfo = clanDelDia ? clanDelDia.info : null;
  if (!clanInfo || !clanInfo.name) {
    return { ok: false, error: 'No encontré ningún clan con ese Tag. Verifica que esté bien escrito (con o sin #). Si es un jugador, búscalo en «Buscar miembro».' };
  }

  var rivalesYConflicto = _getRivalesYConflicto(true);
  var infoRival = rivalesYConflicto[tagNorm] || null;
  var resumen = _resumenMiembrosClan_(clanInfo.memberList, clanDelDia.ts); // §PF391
  return {
    ok: true,
    clan: {
      tag: '#' + tagNorm,
      nombre: clanInfo.name,
      miembros: clanInfo.members !== undefined ? clanInfo.members : (clanInfo.memberList ? clanInfo.memberList.length : 0),
      puntos: clanInfo.clanScore !== undefined ? clanInfo.clanScore : null,
      trofeosGuerra: clanInfo.clanWarTrophies !== undefined ? clanInfo.clanWarTrophies : null,
      ubicacion: (clanInfo.location && clanInfo.location.name) || '',
      tipo: clanInfo.type || '',
      copasRequeridas: clanInfo.requiredTrophies !== undefined ? clanInfo.requiredTrophies : null,
      // §PF391: más datos de /clans para la ficha. `liga` se calcula igual que en la hoja Clan (getLiga() sobre los trofeos de guerra).
      descripcion: clanInfo.description || '',
      donacionesSemana: clanInfo.donationsPerWeek !== undefined ? clanInfo.donationsPerWeek : null,
      badgeId: Number(clanInfo.badgeId) || 0,
      liga: clanInfo.clanWarTrophies !== undefined ? getLiga(clanInfo.clanWarTrophies) : '',
      lider: resumen.lider,
      coLideres: resumen.coLideres,
      copasPromedio: resumen.copasPromedio,
      activos7d: resumen.activos7d,
      esNuestro: _esClanPropio_(tagNorm),
      // 6-nov-2026 (§PF393): puesto del clan en los rankings semanales de Perú y globales (copas y guerra); null si no figura en ninguno y admin.html oculta la sección. [→ Contexto_Base_Web.md §PF393]
      ranking: _rankingsDeClanSeguro_(tagNorm)
    },
    esRivalTemporada: !!infoRival,
    infoRival: infoRival,
    // §PF390: de cuándo son los datos del clan y de dónde salieron ('api', 'drive_hoy' o 'drive_anterior').
    fechaConsulta: clanDelDia.fecha,
    origenDatos: clanDelDia.origen
  };
}

/**
 * _esClanPropio_(tagNorm) [→ Contexto_Base_Web.md §PF368]
 * true si el Tag (sin #) es de uno de los clanes de la Familia (CFG.TERNA_TAGS). NO incluye al clan vetado (CFG.VETADO_TAG, NARANJA x): está en CFG.CLAN_TAGS pero no es nuestro, es un clan vetado como cualquier otro (corrección del 5-nov-2026, hora de Lima, pedido de la usuaria).
 */
function _esClanPropio_(tagNorm) {
  var listas = [CFG.TERNA_TAGS || []];
  for (var a = 0; a < listas.length; a++) {
    for (var b = 0; b < listas[a].length; b++) {
      if (cleanTag(listas[a][b]) === tagNorm) return true;
    }
  }
  return false;
}

/**
 * _webAdminVetarClan(token, datos) [→ Contexto_Base_Web.md §PF368]
 * «Vetar» un clan desde la ficha de «Buscar clan»: lo agrega a la hoja «Conflictos» (lista manual de clanes en conflicto, la misma que lee _getClanesConflictoManual()), así que desde ese momento figura como «En lista de conflicto» en toda detección de infiltrados.
 * datos = { tag, motivo }. Requiere la Función «Vetar», releída por Celular como en _webAdminVetar() (quitar la Función aplica de inmediato). No se puede vetar un clan de la Familia. El nombre se toma de la API, no del cliente. Es de un solo sentido, como el veto de jugadores: no hay «desvetar» desde la web (se quita la fila a mano en la hoja).
 * El Motivo se guarda con el autor y la fecha de Lima al final: «motivo (Web: autor, dd/mm/aaaa)».
 */
function _webAdminVetarClan(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var adminFresco = _webBuscarAdminPorCelular(admin.celular);
  if (!adminFresco || !_webAdminTieneFuncion(adminFresco.funciones, 'Vetar')) {
    return { ok: false, error: 'No tienes permiso para vetar.' };
  }
  if (!datos || !datos.tag) return { ok: false, error: 'Falta el Tag del clan a vetar.' };
  var tagNorm = cleanTag(datos.tag);
  if (!tagNorm || tagNorm.length < 3) return { ok: false, error: 'Tag inválido.' };
  if (_esClanPropio_(tagNorm)) return { ok: false, error: 'No se puede vetar un clan de la Familia.' };
  if (CFG.VETADO_TAG && cleanTag(CFG.VETADO_TAG) === tagNorm) return { ok: false, error: 'Ese clan ya es el clan vetado (NARANJA x).' };

  var motivo = String((datos && datos.motivo) || '').trim().replace(/\s+/g, ' ');
  if (!motivo) return { ok: false, error: 'Escribe el motivo del veto.' };
  if (motivo.length > 200) return { ok: false, error: 'El motivo es muy largo (máximo 200 caracteres).' };

  // §PF390: el nombre sale de la consulta del día del clan (_obtenerClanDelDia_()); si ya se buscó hoy, no se vuelve a llamar a la API.
  var clanDelDia = _obtenerClanDelDia_(tagNorm);
  var clanInfo = clanDelDia ? clanDelDia.info : null;
  if (!clanInfo || !clanInfo.name) return { ok: false, error: 'No encontré ningún clan con ese Tag.' };

  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CONFLICTOS);
  if (!sh) {
    _setupConflictos(ss);
    sh = ss.getSheetByName(CFG.SHEETS.CONFLICTOS);
  }
  if (!sh) return { ok: false, error: 'No pudimos abrir la hoja Conflictos, intenta de nuevo en un momento.' };

  var ultima = sh.getLastRow();
  if (ultima >= 2) {
    var tagsActuales = sh.getRange(2, CFC.TAG, ultima - 1, 1).getValues();
    for (var i = 0; i < tagsActuales.length; i++) {
      if (cleanTag(tagsActuales[i][0]) === tagNorm) return { ok: false, error: 'Ese clan ya está en la lista de conflicto.' };
    }
  }

  var autor = admin.nomMulti || admin.nombre || '';
  var fecha = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy');
  sh.appendRow(['#' + tagNorm, String(clanInfo.name), motivo + ' (Web: ' + autor + ', ' + fecha + ')']);
  try {
    applyBorderCenter(sh.getRange(sh.getLastRow(), 1, 1, CFC_TOTAL_COLS));
  } catch (eFormato) {
    Logger.log('[VetarClan] no se pudo dar formato a la fila nueva: ' + eFormato.message);
  }
  return { ok: true, nombre: String(clanInfo.name) };
}

/**
 * _getRivalesYConflicto(incluirVetado) [→ Contexto_Base_Web.md §15B006]
 * incluirVetado (opcional, false por defecto): agrega al clan vetado (CFG.VETADO_TAG, NARANJA x) con fuente 'vetado', salvo que ya figure en Conflictos. Solo lo piden la detección de infiltrados y «Buscar clan» (§PF368); Ingresos recientes (37_Web_API.gs) no lo pide y sigue igual.
 */
function _getRivalesYConflicto(incluirVetado) {
  var automatico = _getClanesRivalesTemporadaActual();
  var manual = _getClanesConflictoManual();

  var combinado = {};
  for (var tagM in manual) combinado[tagM] = manual[tagM];
  for (var tagA in automatico) {
    if (combinado[tagA] && combinado[tagA].fuente === 'manual') {
      combinado[tagA].fuente = 'currentriverrace+manual';
      combinado[tagA].clanTernaTag    = automatico[tagA].clanTernaTag;
      combinado[tagA].clanTernaNombre = automatico[tagA].clanTernaNombre;
      // motivo manual se conserva tal cual ya estaba en combinado[tagA]
    } else {
      combinado[tagA] = automatico[tagA];
    }
  }
  if (incluirVetado && CFG.VETADO_TAG) {
    var tagVet = cleanTag(CFG.VETADO_TAG);
    if (tagVet && !combinado[tagVet]) {
      combinado[tagVet] = { tag: '#' + tagVet, nombre: 'NARANJA x', fuente: 'vetado', motivo: 'Clan vetado' };
    }
  }
  return combinado;
}

/**
 * _cacheClanesParaRivales_() [→ Contexto_Base_Web.md §PF370]
 * 5-nov-2026: de dónde sale la lista de clanes de nuestras carreras. CACHE_CLAN_DATA vive solo en la memoria de una ejecución y las
 * consultas web («Buscar clan», «¿Infiltrado?», Ingresos recientes) no la llenan: llegaba null y _getClanesRivalesTemporadaActual()
 * devolvía siempre {}, así que la marca «Rival de esta temporada» nunca salía (solo la de Conflictos). Ahora, si la memoria está
 * vacía, se lee el checkpoint de clanes de Drive (Cache_Clanes_Progreso.json, el que escribe la captura de runGuerra()) sin tocar
 * CACHE_CLAN_DATA, para no alterar a las demás funciones. Si el checkpoint tiene más de RIVALES_CHECKPOINT_MAX_EDAD_MS, no se usa:
 * es mejor no marcar que marcar rivales de una semana vieja. Se lee una sola vez por ejecución.
 */
var RIVALES_CHECKPOINT_MAX_EDAD_MS = 3 * 24 * 60 * 60 * 1000;
var _CACHE_RIVALES_ = undefined;
function _cacheClanesParaRivales_() {
  if (CACHE_CLAN_DATA && Object.keys(CACHE_CLAN_DATA).length) return CACHE_CLAN_DATA;
  if (_CACHE_RIVALES_ !== undefined) return _CACHE_RIVALES_;
  _CACHE_RIVALES_ = null;
  try {
    var cp = _leerProgresoClanesConEdad_(); // 09_API_ClashRoyale.gs: { clanes, ts, edadMs } o null
    if (!cp) {
      Logger.log('[Rivales] No hay checkpoint de clanes legible en Drive: no se marcan rivales de la carrera (sí los de Conflictos).');
    } else if (cp.edadMs > RIVALES_CHECKPOINT_MAX_EDAD_MS) {
      Logger.log('[Rivales] El checkpoint de clanes tiene ' + (cp.edadMs === Infinity ? 'edad desconocida' : Math.round(cp.edadMs / 3600000) + ' h') + ' (máximo ' + Math.round(RIVALES_CHECKPOINT_MAX_EDAD_MS / 3600000) + ' h): no se marcan rivales de la carrera.');
    } else {
      _CACHE_RIVALES_ = cp.clanes;
    }
  } catch (eRiv) {
    Logger.log('[Rivales] No se pudo leer el checkpoint de clanes: ' + eRiv.message);
  }
  return _CACHE_RIVALES_;
}

/**
 * _getClanesRivalesTemporadaActual() [→ Contexto_Base_Web.md §15B003]
 */
function _getClanesRivalesTemporadaActual() {
  var rivales = {};
  var propiosNorm = {};
  for (var p = 0; p < CFG.CLAN_TAGS.length; p++) {
    propiosNorm[cleanTag(CFG.CLAN_TAGS[p])] = true;
  }

  var cacheRivales = _cacheClanesParaRivales_();
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTagPropio = CFG.TERNA_TAGS[i];
    var clanData = (cacheRivales && cacheRivales[clanTagPropio]) || null;
    if (!clanData || !clanData.riverrace) continue;

    var rr = clanData.riverrace;
    var clansRivales = rr.clans; // ver docblock: campo NUEVO, sin uso previo en el proyecto
    if (!clansRivales || !clansRivales.length) continue;

    var nombreClanPropio = (clanData.info && clanData.info.name) || '';

    for (var j = 0; j < clansRivales.length; j++) {
      var rival = clansRivales[j];
      var tagRival = cleanTag(rival && rival.tag);
      if (!tagRival || propiosNorm[tagRival]) continue;
      rivales[tagRival] = {
        tag: '#' + tagRival,
        nombre: (rival && rival.name) || '',
        fuente: 'currentriverrace',
        clanTernaTag: clanTagPropio,
        clanTernaNombre: nombreClanPropio
      };
    }
  }
  return rivales;
}

/**
 * _getClanesConflictoManual() [→ Contexto_Base_Web.md §15B004]
 */
function _getClanesConflictoManual() {
  var manual = {};
  var ss = _getSs();
  var mapaHoja = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.CONFLICTOS, CFC.TAG - 1, CFC_TOTAL_COLS);
  // _leerHojaComoMapaPorTag() solo hace trim()+toUpperCase() sobre la [→ Contexto_Base_Web.md §15B005]
  for (var tagCrudo in mapaHoja) {
    var fila = mapaHoja[tagCrudo];
    var tagNorm = cleanTag(tagCrudo);
    if (!tagNorm) continue;
    manual[tagNorm] = {
      tag: '#' + tagNorm,
      nombre: String(fila[CFC.NOMBRE - 1] || ''),
      fuente: 'manual',
      motivo: String(fila[CFC.MOTIVO - 1] || '')
    };
  }
  return manual;
}

/**
 * _buscarEnRosterTerna(tagNorm) [→ Contexto_Base_Web.md §15B007]
 */
function _buscarEnRosterTerna(tagNorm) {
  if (!tagNorm) return [];
  var ss = _getSs();
  var resultado = [];

  var mapaDirectorio = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.DIRECTORIO, IC.TAG - 1, DIR_SHEET_COLS);
  if (mapaDirectorio[tagNorm]) {
    var filaDir = mapaDirectorio[tagNorm];
    resultado.push({
      origen: 'Directorio',
      tag:    '#' + tagNorm,
      nombre: String(filaDir[IC.NOMBRE - 1] || ''),
      clan:   String(filaDir[IC.CLAN   - 1] || ''),
      razon:  ''
    });
  }

  var mapaInactivos = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.INACTIVOS, IC.TAG - 1, INACTIVOS_TOTAL_COLS);
  if (mapaInactivos[tagNorm]) {
    var filaInact = mapaInactivos[tagNorm];
    resultado.push({
      origen: 'Inactivos',
      tag:    '#' + tagNorm,
      nombre: String(filaInact[IC.NOMBRE - 1] || ''),
      clan:   String(filaInact[IC.CLAN   - 1] || ''),
      razon:  String(filaInact[IC.RAZON  - 1] || '')
    });
  }

  var mapaVetados = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.VETADOS, VC.TAG - 1, VETADOS_TOTAL_COLS);
  if (mapaVetados[tagNorm]) {
    var filaVet = mapaVetados[tagNorm];
    resultado.push({
      origen: 'Vetados',
      tag:    '#' + tagNorm,
      nombre: String(filaVet[VC.NOMBRE - 1] || ''),
      clan:   String(filaVet[VC.CLAN   - 1] || ''),
      razon:  String(filaVet[VC.RAZON  - 1] || '')
    });
  }

  return resultado;
}

// ----- Índice de clanes externos: ejecución programada semanal (§PF376) -----

/**
 * generarIndiceClanesExternosProgramado() [→ Contexto_Base_Web.md §PF376]
 * Handler del activador semanal (ACTIVADORES_CONFIG, 08_Activadores.gs). Pone en cero el contador de corridas seguidas y corre el índice. No se corre a mano: a mano se usa generarIndiceClanesExternos(), que desde el §PF398 hace lo mismo (continúa sola).
 */
function generarIndiceClanesExternosProgramado() {
  PropertiesService.getScriptProperties().setProperty(INDICE_CLANES_CONT_PROP, '0');
  _indiceClanesCorrerProgramado_();
}

/**
 * _continuarGenerarIndiceClanesExternos() [→ Contexto_Base_Web.md §PF376]
 * Continuación de generarIndiceClanesExternosProgramado(): borra su propio activador, suma una corrida al contador y vuelve a correr el índice, que sigue donde se quedó.
 */
function _continuarGenerarIndiceClanesExternos() {
  _borrarTriggersDeContinuacion(INDICE_CLANES_HANDLER_CONT);
  var props = PropertiesService.getScriptProperties();
  var n = (Number(props.getProperty(INDICE_CLANES_CONT_PROP)) || 0) + 1;
  props.setProperty(INDICE_CLANES_CONT_PROP, String(n));
  _indiceClanesCorrerProgramado_();
}

/**
 * _generarIndiceClanesExternosUnaCorrida_() [→ Contexto_Base_Web.md §PF369, §PF378, §PF398]
 * UNA pasada del índice (hasta INDICE_CLANES_PRESUPUESTO_MS). La continuación la programa _indiceClanesCorrerProgramado_() (§PF376, §PF398); desde generarIndiceClanesExternos() ya no hace falta volver a correr nada a mano.
 * Lee los JSON individuales de RoyaleAPI y arma el índice «clan externo → jugadores nuestros que estuvieron ahí». Desde §PF378 el resultado principal son los archivos por clan (carpeta Clanes_Externos de Otros, un «Clan - #TAG.json» por clan, histórico: las semanas se suman y nunca se borran). Como respaldo sigue generando Indice_Clanes_Externos.json e Indice_Clanes_Externos.csv (un clan por fila, para leerlo en una hoja), que se reemplazan solo al terminar.
 * Son más de 2 000 archivos y Apps Script corta a los 6 minutos, así que trabaja con un presupuesto de tiempo y guarda lo avanzado en Indice_Clanes_Externos_Parcial.json (nunca sobre el índice completo anterior): primero lee los JSON de los jugadores y, cuando terminó de leerlos, fusiona cada clan con su archivo. Si queda incompleta, la siguiente pasada continúa donde se quedó. La primera vez crea más de 1 400 archivos y necesita varias corridas; después solo toca los clanes con semanas nuevas (compara una firma guardada en Indice_Clanes_Externos_Firmas.json; para forzar una revisión completa se borra ese archivo).
 * «Buscar clan» de la web de admin usa estos datos para listar a los jugadores nuestros que pasaron por cualquier clan (§PF369).
 * Desde el 5-nov-2026 (§PF376) también la corre cada semana generarIndiceClanesExternosProgramado() (activador de 08_Activadores.gs), que continúa sola hasta completarlo. Devuelve true si quedó todo completo y false si quedó incompleto.
 */
function _generarIndiceClanesExternosUnaCorrida_() {
  var inicio = Date.now();
  var carpeta = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
  var archivos = _getHistorialGuerraDriveIndexPorTag(carpeta);
  var tags = Object.keys(archivos).sort();
  if (!tags.length) throw new Error('No se encontró ningún JSON individual de RoyaleAPI en Drive: no se genera nada para no pisar el índice anterior.');
  var ahoraTxt = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm');

  // 1) Lectura de los JSON individuales (el avance va a Indice_Clanes_Externos_Parcial.json, nunca al índice completo).
  var estado = _indiceClanesCargarParcial_();
  var continuaba = !!estado;
  if (!estado) {
    estado = _indiceClanesVacio_();
    estado.generado = ahoraTxt;
    estado.iniciadoMs = inicio;
  }

  var hechosAhora = 0;
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    if (estado.procesados[tag]) continue;
    if (Date.now() - inicio > INDICE_CLANES_PRESUPUESTO_MS) break;
    var registros = null;
    try {
      var historial = JSON.parse(archivos[tag].getBlob().getDataAsString('UTF-8'));
      registros = (historial && historial.registros) ? historial.registros : [];
    } catch (eLeer) {
      Logger.log('[IndiceClanes] No se pudo leer el JSON de ' + tag + ': ' + eLeer.message);
      estado.ilegibles.push(tag);
    }
    if (registros) _indiceClanesAgregar_(estado, tag, registros);
    estado.procesados[tag] = true;
    hechosAhora++;
  }

  var listos = 0;
  for (var t = 0; t < tags.length; t++) if (estado.procesados[tags[t]]) listos++;
  estado.actualizado = ahoraTxt;
  estado.jugadoresLeidos = listos;

  if (listos < tags.length) {
    _indiceClanesGuardarParcial_(estado);
    Logger.log('[IndiceClanes] INCOMPLETO: ' + listos + ' de ' + tags.length + ' jugadores leídos (' + hechosAhora + ' en esta corrida' + (continuaba ? ', continuando el avance guardado' : '') + '). La siguiente corrida continúa donde se quedó (ver el registro de continuación); los archivos de clan y el índice anterior no se tocaron.');
    return false;
  }

  // 2) Fusión de cada clan con su archivo de Clanes_Externos (solo los clanes cuya firma cambió).
  var res = _clanesExternosEscribirPendientes_(estado, inicio, ahoraTxt);
  if (res.pendientes > 0) {
    _indiceClanesGuardarParcial_(estado);
    Logger.log('[IndiceClanes] INCOMPLETO: los ' + listos + ' jugadores ya están leídos; faltan ' + res.pendientes + ' de ' + res.total + ' archivos de clan (en esta corrida: ' + res.creados + ' creados, ' + res.actualizados + ' actualizados, ' + res.sinCambios + ' sin cambios' + (res.fallos ? ', ' + res.fallos + ' con error' : '') + '). La siguiente corrida continúa donde se quedó (ver el registro de continuación).');
    return false;
  }

  // 3) Todo fusionado: se reemplaza el respaldo (índice y CSV), se actualizan las alertas y se retira el avance.
  var legado = _indiceClanesLegadoDe_(estado);
  _guardarIndiceClanes_(legado);
  _saveCSVToDrive(INDICE_CLANES_CSV, _encodeCSV(_indiceClanesAFilasCsv_(legado)));
  res.firmas.ultimaCompleta = ahoraTxt;
  _clanesExternosFirmasGuardar_(res.firmas);
  _clanesExternosListoCache_ = ahoraTxt;
  _indiceClanesBorrarParcial_();
  // §PF375: con el índice recién completo se actualizan las alertas de clanes sospechosos; si falla, el índice ya quedó guardado. §PF378: las alertas leen los archivos de clan que acaban de quedar completos (no el respaldo).
  try { _alertasClanesActualizar_('índice'); }
  catch (eAlertas) { Logger.log('[AlertasClanes] No se pudieron actualizar tras generar el índice: ' + eAlertas.message); }
  Logger.log('[IndiceClanes] COMPLETO: ' + listos + ' jugadores leídos, ' + legado.totalClanes + ' clanes externos' + (estado.ilegibles.length ? ', ' + estado.ilegibles.length + ' JSON ilegibles' : '') + '. Archivos de clan (' + CLANES_EXTERNOS_CARPETA + ' en Otros): ' + res.creados + ' creados, ' + res.actualizados + ' actualizados, ' + res.sinCambios + ' sin cambios' + (res.ilegiblesApartados ? ', ' + res.ilegiblesApartados + ' ilegibles apartados' : '') + '. Respaldo: ' + INDICE_CLANES_JSON + ' (Otros) y ' + INDICE_CLANES_CSV + '.');
  return true;
}

/**
 * _indiceClanesCorrerProgramado_() [→ Contexto_Base_Web.md §PF376]
 * Corre una pasada del índice (_generarIndiceClanesExternosUnaCorrida_()) una vez. Si el índice queda completo, termina; si queda incompleto y no se llegó al máximo de corridas seguidas, programa la continuación; si falla, lo anota y no reintenta (la próxima corrida semanal sigue donde quedó el índice guardado).
 */
function _indiceClanesCorrerProgramado_() {
  var props = PropertiesService.getScriptProperties();
  var n = Number(props.getProperty(INDICE_CLANES_CONT_PROP)) || 0;
  var completo = false;
  try {
    completo = _generarIndiceClanesExternosUnaCorrida_() === true;
  } catch (e) {
    Logger.log('[IndiceClanes] La corrida programada falló: ' + e.message + '. La próxima corrida semanal sigue donde quedó.');
    props.deleteProperty(INDICE_CLANES_CONT_PROP);
    return;
  }
  if (completo) {
    Logger.log('[IndiceClanes] Corrida programada: índice completo tras ' + (n + 1) + (n === 0 ? ' corrida.' : ' corridas.'));
    props.deleteProperty(INDICE_CLANES_CONT_PROP);
    return;
  }
  if (n + 1 >= INDICE_CLANES_CONT_MAX) {
    Logger.log('[IndiceClanes] Corrida programada: el índice sigue incompleto tras ' + INDICE_CLANES_CONT_MAX + ' corridas seguidas; la próxima corrida semanal sigue donde quedó.');
    props.deleteProperty(INDICE_CLANES_CONT_PROP);
    return;
  }
  _borrarTriggersDeContinuacion(INDICE_CLANES_HANDLER_CONT);
  ScriptApp.newTrigger(INDICE_CLANES_HANDLER_CONT).timeBased().after(INDICE_CLANES_CONT_ESPERA_MS).create();
  Logger.log('[IndiceClanes] Corrida programada: el índice quedó incompleto; continúa en ' + Math.round(INDICE_CLANES_CONT_ESPERA_MS / 1000) + ' s (corrida ' + (n + 2) + ' de ' + INDICE_CLANES_CONT_MAX + ' como máximo).');
}

// ----- Índice de clanes externos: armar, guardar y consultar (§PF369) -----

/**
 * _indiceClanesVacio_() [→ Contexto_Base_Web.md §PF369, §PF378]
 * Estado inicial de una lectura de los JSON individuales (el que se guarda en Indice_Clanes_Externos_Parcial.json mientras no termina). `procesados` son los Tags de jugador ya leídos; `iniciadoMs` es cuándo empezó la lectura (si el avance es muy viejo se descarta). Cada clan lleva `jugadores: { '#JUGADOR': [semanas] }` con la lista de semanas, no solo el resumen.
 */
function _indiceClanesVacio_() {
  return { version: 2, generado: '', iniciadoMs: 0, actualizado: '', jugadoresLeidos: 0, ilegibles: [], procesados: {}, clanes: {} };
}

/**
 * _indiceClanesAgregar_(indice, tagJugador, registros) [→ Contexto_Base_Web.md §PF369, §PF378]
 * Suma al estado de lectura los clanes externos (filas `externa: true` con clanTag, §PF340) de un jugador. Por cada clan guarda al jugador con la lista de sus semanas, cada una { temporadaRoyaleApi, temporada (interna), semana }; la semana se identifica por temporadaRoyaleApi + semana, que no cambia en una reenumeración (si una fila no trae temporadaRoyaleAPI se usa la interna). El total y la primera y última semana ya no se guardan: se calculan al leer (_semanasResumen_()). El nombre del clan es el de la semana más reciente vista en cualquier jugador (los clanes cambian de nombre; se ordena por temporada de RoyaleAPI) y todos los nombres vistos quedan en `nombres`.
 */
function _indiceClanesAgregar_(indice, tagJugador, registros) {
  var tagJ = '#' + cleanTag(tagJugador);
  var numONull = function (v) {
    if (v === null || v === undefined || v === '') return null;
    var n = Number(v);
    return isNaN(n) ? null : n;
  };
  for (var i = 0; i < (registros || []).length; i++) {
    var r = registros[i];
    if (!r || r.externa !== true || !r.clanTag) continue;
    var sem = numONull(r.semana);
    if (sem === null) continue;
    var tagC = '#' + cleanTag(r.clanTag);
    var semana = { temporadaRoyaleApi: numONull(r.temporadaRoyaleAPI), temporada: numONull(r.temporadaInterna), semana: sem };
    var nombre = String(r.clan || '').replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim();
    var c = indice.clanes[tagC];
    if (!c) c = indice.clanes[tagC] = { nombre: '', nombres: [], _ref: null, jugadores: {} };
    var lista = c.jugadores[tagJ];
    if (!lista) lista = c.jugadores[tagJ] = [];
    var clave = _claveSemanaClan_(semana), ya = false;
    for (var j = 0; j < lista.length; j++) if (_claveSemanaClan_(lista[j]) === clave) { ya = true; break; }
    if (!ya) lista.push(semana);
    if (nombre && c.nombres.indexOf(nombre) < 0) c.nombres.push(nombre);
    if (nombre && (!c._ref || _cmpSemanaClan_(semana, c._ref) >= 0)) {
      c.nombre = nombre;
      c._ref = { temporadaRoyaleApi: semana.temporadaRoyaleApi, temporada: semana.temporada, semana: semana.semana };
    }
  }
}

/**
 * _indiceClanesAFilasCsv_(indice) [→ Contexto_Base_Web.md §PF369]
 * Filas del CSV: un clan por fila, del que más jugadores nuestros tuvo al que menos. «Tags de jugadores» va separado por espacios, del que más semanas jugó ahí al que menos.
 */
function _indiceClanesAFilasCsv_(indice) {
  var fmt = function (p) { return p ? ((p.temporadaRoyaleApi !== null ? p.temporadaRoyaleApi : '?') + ' S' + p.semana) : ''; };
  var lista = [];
  for (var tagClan in indice.clanes) {
    var c = indice.clanes[tagClan];
    var jug = c.jugadores.slice().sort(function (a, b) { return (b.semanas - a.semanas) || (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0); });
    var semanas = 0, primera = null, ultima = null;
    for (var j = 0; j < jug.length; j++) {
      semanas += jug[j].semanas;
      var pa = jug[j].primera, pu = jug[j].ultima;
      if (pa && (!primera || pa.temporada < primera.temporada || (pa.temporada === primera.temporada && pa.semana < primera.semana))) primera = pa;
      if (pu && (!ultima || pu.temporada > ultima.temporada || (pu.temporada === ultima.temporada && pu.semana > ultima.semana))) ultima = pu;
    }
    lista.push({ tag: tagClan, c: c, jug: jug, semanas: semanas, primera: primera, ultima: ultima });
  }
  lista.sort(function (a, b) { return (b.jug.length - a.jug.length) || (b.semanas - a.semanas) || (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0); });
  var filas = [['ClanTag', 'Clan', 'Otros nombres', 'Jugadores', 'Semanas', 'Primera (temporada RoyaleAPI y semana)', 'Última (temporada RoyaleAPI y semana)', 'Tags de jugadores']];
  for (var i = 0; i < lista.length; i++) {
    var e = lista[i];
    var otros = e.c.nombres.filter(function (n) { return n !== e.c.nombre; }).join(' | ');
    filas.push([e.tag, e.c.nombre, otros, e.jug.length, e.semanas, fmt(e.primera), fmt(e.ultima), e.jug.map(function (x) { return x.tag; }).join(' ')]);
  }
  return filas;
}

/**
 * _cargarIndiceClanes_() [→ Contexto_Base_Web.md §PF369]
 * Lee Indice_Clanes_Externos.json de la carpeta Otros; null si no existe o no se pudo leer.
 */
function _cargarIndiceClanes_() {
  try {
    var files = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS).getFilesByName(INDICE_CLANES_JSON);
    if (files.hasNext()) return JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    Logger.log('[IndiceClanes] Error leyendo ' + INDICE_CLANES_JSON + ': ' + e.message);
  }
  return null;
}

/**
 * _guardarIndiceClanes_(indice) [→ Contexto_Base_Web.md §PF369]
 * Guarda el índice en la carpeta Otros. Antes de escribir quita el campo interno `_ref` de cada clan.
 */
function _guardarIndiceClanes_(indice) {
  try {
    for (var k in indice.clanes) delete indice.clanes[k]._ref;
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(INDICE_CLANES_JSON);
    var content = JSON.stringify(indice);
    if (files.hasNext()) _setContentConConteo_(files.next(), content);
    else _createFileConConteo_(folder, INDICE_CLANES_JSON, content, MimeType.PLAIN_TEXT);
  } catch (e) {
    Logger.log('[IndiceClanes] Error guardando ' + INDICE_CLANES_JSON + ': ' + e.message);
  }
}

/**
 * _indiceClanesJugadoresDe_(tagClanNorm) [→ Contexto_Base_Web.md §PF369]
 * Jugadores nuestros que estuvieron en un clan externo: [{ tag, semanas, primera, ultima }]. Devuelve null si no hay de dónde leer (distinto de [] = el clan no figura). §PF378: desde la primera corrida completa del índice lee UN solo archivo pequeño, el del clan en Clanes_Externos (histórico); si ese archivo no se puede leer, o aún no hubo una corrida completa, usa el índice anterior (Indice_Clanes_Externos.json), que se lee una vez por ejecución y devuelve null si no existe o está incompleto.
 */
function _indiceClanesJugadoresDe_(tagClanNorm) {
  if (_clanesExternosListos_()) {
    var lectura = _clanExternoLeer_(tagClanNorm);
    if (!lectura.error) return lectura.datos ? _clanExternoJugadoresDe_(lectura.datos) : [];
  }
  if (_indiceClanesCache_ === undefined) _indiceClanesCache_ = _cargarIndiceClanes_();
  var ind = _indiceClanesCache_;
  if (!ind || !ind.completo || !ind.clanes) return null;
  var c = ind.clanes['#' + cleanTag(tagClanNorm)];
  return c ? c.jugadores : [];
}

/**
 * _exMiembrosDesdeIndice_(jugadoresIndice, tagsActuales, yaListados) [→ Contexto_Base_Web.md §PF369]
 * Pasa los jugadores del índice de clanes externos a filas de «Jugadores nuestros que pasaron por este clan»: { origen, tag, nombre, clan, razon, semanas, primera, ultima } (§PF372: primera y última son {temporada, semana, temporadaRoyaleApi, supercell} o null; Web separa «activos» (origen Directorio, por clan nuestro) de «inactivos»). Cada jugador sale una vez por cada hoja del roster donde figura (Directorio, Inactivos o Vetados); si no figura en ninguna, sale con origen «Fuera del roster» y sin nombre (el índice guarda solo Tags). Se omiten los miembros actuales del clan (`tagsActuales`, ya salen en la tabla de coincidencias) y lo que ya estaba en `yaListados` (misma hoja y mismo Tag), a lo que se le agrega `semanas`. Devuelve la lista completa, ordenada por Origen (Directorio, Inactivos, Vetados, Fuera del roster) y luego por semanas.
 */
function _exMiembrosDesdeIndice_(jugadoresIndice, tagsActuales, yaListados) {
  var salida = (yaListados || []).slice();
  var semanasPorTag = {}, rangoPorTag = {};
  for (var a = 0; a < jugadoresIndice.length; a++) {
    semanasPorTag[cleanTag(jugadoresIndice[a].tag)] = jugadoresIndice[a].semanas;
    rangoPorTag[cleanTag(jugadoresIndice[a].tag)] = { primera: jugadoresIndice[a].primera || null, ultima: jugadoresIndice[a].ultima || null }; // §PF372: primera y última semana en ese clan, para la lista de activos e inactivos
  }
  var porClave = {};
  for (var b = 0; b < salida.length; b++) {
    var tb = cleanTag(salida[b].tag);
    porClave[salida[b].origen + '|' + tb] = salida[b];
    if (semanasPorTag[tb] !== undefined) { salida[b].semanas = semanasPorTag[tb]; salida[b].primera = rangoPorTag[tb].primera; salida[b].ultima = rangoPorTag[tb].ultima; }
  }
  var mapas = [];
  try {
    var ss = _getSs();
    mapas = [
      { origen: 'Directorio', mapa: _leerHojaComoMapaPorTag(ss, CFG.SHEETS.DIRECTORIO, IC.TAG - 1, DIR_SHEET_COLS), nombre: IC.NOMBRE, clan: IC.CLAN, razon: IC.RAZON },
      { origen: 'Inactivos', mapa: _leerHojaComoMapaPorTag(ss, CFG.SHEETS.INACTIVOS, IC.TAG - 1, INACTIVOS_TOTAL_COLS), nombre: IC.NOMBRE, clan: IC.CLAN, razon: IC.RAZON },
      { origen: 'Vetados', mapa: _leerHojaComoMapaPorTag(ss, CFG.SHEETS.VETADOS, VC.TAG - 1, VETADOS_TOTAL_COLS), nombre: VC.NOMBRE, clan: VC.CLAN, razon: VC.RAZON }
    ];
  } catch (eHojas) {
    Logger.log('[IndiceClanes] No se pudo leer el roster para cruzar el índice: ' + eHojas.message);
  }
  for (var i = 0; i < jugadoresIndice.length; i++) {
    var tagJ = cleanTag(jugadoresIndice[i].tag);
    if (!tagJ || tagsActuales[tagJ]) continue;
    var hallado = false;
    for (var m = 0; m < mapas.length; m++) {
      var fila = null;
      for (var k in mapas[m].mapa) { if (cleanTag(k) === tagJ) { fila = mapas[m].mapa[k]; break; } }
      if (!fila) continue;
      hallado = true;
      if (porClave[mapas[m].origen + '|' + tagJ]) continue;
      var nueva = { origen: mapas[m].origen, tag: '#' + tagJ, nombre: String(fila[mapas[m].nombre - 1] || ''), clan: String(fila[mapas[m].clan - 1] || ''), razon: String(fila[mapas[m].razon - 1] || ''), semanas: jugadoresIndice[i].semanas, primera: jugadoresIndice[i].primera || null, ultima: jugadoresIndice[i].ultima || null };
      porClave[nueva.origen + '|' + tagJ] = nueva;
      salida.push(nueva);
    }
    if (!hallado) salida.push({ origen: 'Fuera del roster', tag: '#' + tagJ, nombre: '', clan: '', razon: '', semanas: jugadoresIndice[i].semanas, primera: jugadoresIndice[i].primera || null, ultima: jugadoresIndice[i].ultima || null });
  }
  var orden = { 'Directorio': 0, 'Inactivos': 1, 'Vetados': 2, 'Fuera del roster': 3 };
  salida.sort(function (x, y) {
    var ox = orden[x.origen] !== undefined ? orden[x.origen] : 9, oy = orden[y.origen] !== undefined ? orden[y.origen] : 9;
    return (ox - oy) || ((y.semanas || 0) - (x.semanas || 0)) || (x.tag < y.tag ? -1 : x.tag > y.tag ? 1 : 0);
  });
  return salida;
}

// ----- Archivos por clan externo: un JSON histórico por clan (§PF378) -----

/**
 * _claveSemanaClan_(w) / _cmpSemanaClan_(a, b) [→ Contexto_Base_Web.md §PF378]
 * Una semana de un clan es { temporadaRoyaleApi, temporada (interna), semana }. La clave es temporadaRoyaleApi + semana (no cambia en una reenumeración); si falta la de RoyaleAPI se usa la interna. El orden también va por RoyaleAPI cuando las dos semanas la traen. Funciones puras.
 */
function _claveSemanaClan_(w) {
  var tieneRoy = w.temporadaRoyaleApi !== null && w.temporadaRoyaleApi !== undefined;
  return (tieneRoy ? 'R' + w.temporadaRoyaleApi : 'I' + w.temporada) + '|' + w.semana;
}
function _cmpSemanaClan_(a, b) {
  var ra = a.temporadaRoyaleApi, rb = b.temporadaRoyaleApi;
  var tieneA = ra !== null && ra !== undefined, tieneB = rb !== null && rb !== undefined;
  if (tieneA && tieneB) { if (ra !== rb) return ra - rb; }
  else if ((a.temporada || 0) !== (b.temporada || 0)) return (a.temporada || 0) - (b.temporada || 0);
  return (a.semana || 0) - (b.semana || 0);
}

/**
 * _semanasResumen_(lista) [→ Contexto_Base_Web.md §PF378]
 * Total, primera y última semana de una lista de semanas de un jugador en un clan: { semanas, primera, ultima }, con primera y última como { temporada, semana, temporadaRoyaleApi } (la misma forma que tenía el índice, §PF369) o null si la lista está vacía. Se calcula al leer; en los archivos no se guarda.
 */
function _semanasResumen_(lista) {
  var primera = null, ultima = null;
  for (var i = 0; i < (lista || []).length; i++) {
    var w = lista[i];
    if (!primera || _cmpSemanaClan_(w, primera) < 0) primera = w;
    if (!ultima || _cmpSemanaClan_(w, ultima) > 0) ultima = w;
  }
  var punto = function (w) { return w ? { temporada: w.temporada, semana: w.semana, temporadaRoyaleApi: w.temporadaRoyaleApi } : null; };
  return { semanas: (lista || []).length, primera: punto(primera), ultima: punto(ultima) };
}

/**
 * _unirSemanasClan_(a, b) [→ Contexto_Base_Web.md §PF378]
 * Une dos listas de semanas por clave (_claveSemanaClan_) y devuelve una lista nueva ordenada de la más antigua a la más reciente. NUNCA quita una semana: si está en cualquiera de las dos, queda. Si una semana está en las dos, los valores de `b` (la lectura nueva) pisan a los de `a`, salvo que sean null (así la temporada interna vigente reemplaza a la vieja y no se pierde un dato por una fila incompleta). Función pura.
 */
function _unirSemanasClan_(a, b) {
  var porClave = {}, orden = [];
  var sumar = function (lista) {
    for (var i = 0; i < (lista || []).length; i++) {
      var w = lista[i];
      if (!w || w.semana === null || w.semana === undefined) continue;
      var k = _claveSemanaClan_(w);
      var nuevo = { temporadaRoyaleApi: (w.temporadaRoyaleApi === undefined ? null : w.temporadaRoyaleApi), temporada: (w.temporada === undefined ? null : w.temporada), semana: w.semana };
      var previa = porClave[k];
      if (previa) {
        if (nuevo.temporadaRoyaleApi === null) nuevo.temporadaRoyaleApi = previa.temporadaRoyaleApi;
        if (nuevo.temporada === null) nuevo.temporada = previa.temporada;
      } else {
        orden.push(k);
      }
      porClave[k] = nuevo;
    }
  };
  sumar(a);
  sumar(b);
  var salida = [];
  for (var j = 0; j < orden.length; j++) salida.push(porClave[orden[j]]);
  salida.sort(_cmpSemanaClan_);
  return salida;
}

/**
 * _clanExternoFirma_(c) [→ Contexto_Base_Web.md §PF378]
 * Firma (texto corto) de lo que la lectura sabe de un clan: su nombre, sus nombres y cada jugador con sus semanas (clave y temporada interna). Si la firma es la misma que la guardada en Indice_Clanes_Externos_Firmas.json, el archivo del clan ya tiene todo eso y no hace falta abrirlo. Dos sumas de 32 bits más el largo del texto: una colisión dejaría un clan sin actualizar hasta su siguiente cambio, y es muy improbable. Función pura.
 */
function _clanExternoFirma_(c) {
  var partes = [String(c.nombre || ''), (c.nombres || []).slice().sort().join('\u0001')];
  var tagsJ = Object.keys(c.jugadores).sort();
  for (var i = 0; i < tagsJ.length; i++) {
    var ws = c.jugadores[tagsJ[i]].slice().sort(_cmpSemanaClan_);
    var txt = [];
    for (var j = 0; j < ws.length; j++) txt.push(_claveSemanaClan_(ws[j]) + '=' + ((ws[j].temporada === null || ws[j].temporada === undefined) ? '' : ws[j].temporada));
    partes.push(tagsJ[i] + ':' + txt.join(','));
  }
  var texto = partes.join('\u0002');
  var h1 = 5381, h2 = 7;
  for (var k = 0; k < texto.length; k++) {
    var ch = texto.charCodeAt(k);
    h1 = (h1 * 33 + ch) >>> 0;
    h2 = (h2 * 131 + ch) >>> 0;
  }
  return texto.length.toString(36) + '.' + h1.toString(36) + '.' + h2.toString(36);
}

/**
 * _clanExternoFusionar_(previo, tagClan, acum, ahoraTxt) [→ Contexto_Base_Web.md §PF378]
 * Fusiona lo leído de un clan (`acum`, del estado de _indiceClanesAgregar_()) con el contenido de su archivo (`previo`, o null si no existe). Devuelve { datos, cambio }: `datos` es el archivo ya fusionado y `cambio` es false si quedaría igual que `previo` (entonces no se escribe).
 * Forma del archivo: { version: 1, tag, nombre, nombres: [], refNombre: { temporadaRoyaleApi, temporada, semana } | null, marcas: {}, actualizado, jugadores: { '#JUGADOR': [{ temporadaRoyaleApi, temporada, semana }] } }. Las semanas se unen sin quitar ninguna (_unirSemanasClan_); los nombres se suman; `nombre` es el de la semana más reciente (refNombre); `marcas` (rival o vetado, con su fecha) no las toca esta función. Para saber si hubo cambio se compara el archivo previo normalizado con el fusionado, así que un archivo editado a mano se reescribe una vez en formato normal. Función pura.
 */
function _clanExternoFusionar_(previo, tagClan, acum, ahoraTxt) {
  var armar = function (p, a) {
    var d = {
      version: 1,
      tag: tagClan,
      nombre: String((p && p.nombre) || ''),
      nombres: [],
      refNombre: (p && p.refNombre) || null,
      marcas: (p && p.marcas && typeof p.marcas === 'object') ? p.marcas : {},
      actualizado: String((p && p.actualizado) || ''),
      jugadores: {}
    };
    if (p && p.reenumeracionId) d.reenumeracionId = p.reenumeracionId; // §PF378: marca de _reenumerarClanesExternos_() (47_Migraciones.gs); se conserva para no sumar el delta dos veces si el índice corre en medio de una reenumeración
    var previos = (p && p.nombres instanceof Array) ? p.nombres : [];
    for (var n = 0; n < previos.length; n++) if (previos[n] && d.nombres.indexOf(previos[n]) < 0) d.nombres.push(previos[n]);
    if (a) {
      for (var m = 0; m < a.nombres.length; m++) if (a.nombres[m] && d.nombres.indexOf(a.nombres[m]) < 0) d.nombres.push(a.nombres[m]);
      if (a.nombre && a._ref && (!d.refNombre || _cmpSemanaClan_(a._ref, d.refNombre) >= 0)) {
        d.nombre = a.nombre;
        d.refNombre = { temporadaRoyaleApi: a._ref.temporadaRoyaleApi, temporada: a._ref.temporada, semana: a._ref.semana };
      }
    }
    if (!d.nombre && d.nombres.length) d.nombre = d.nombres[0];
    var pj = (p && p.jugadores && typeof p.jugadores === 'object') ? p.jugadores : {};
    var claves = {};
    for (var k1 in pj) claves[k1] = true;
    if (a) for (var k2 in a.jugadores) claves[k2] = true;
    var orden = Object.keys(claves).sort();
    for (var i = 0; i < orden.length; i++) d.jugadores[orden[i]] = _unirSemanasClan_(pj[orden[i]], a ? a.jugadores[orden[i]] : null);
    return d;
  };
  var base = armar(previo, null);
  var datos = armar(previo, acum);
  var cambio = !previo || JSON.stringify(base) !== JSON.stringify(datos);
  if (cambio) datos.actualizado = ahoraTxt;
  return { datos: datos, cambio: cambio };
}

/**
 * _indiceClanesLegadoDe_(estado) [→ Contexto_Base_Web.md §PF378]
 * Arma, desde lo leído de los JSON individuales, el índice con la forma de siempre (§PF369): { version, generado, actualizado, completo: true, jugadoresLeidos, totalClanes, ilegibles, procesados: {}, clanes: { '#CLAN': { nombre, nombres, jugadores: [{ tag, semanas, primera, ultima }] } } }. Sigue guardándose como respaldo (Indice_Clanes_Externos.json y .csv) y es lo que lee «Buscar clan» hasta que lea los archivos de clan. Función pura.
 */
function _indiceClanesLegadoDe_(estado) {
  var legado = { version: 1, generado: estado.generado, actualizado: estado.actualizado, completo: true, jugadoresLeidos: estado.jugadoresLeidos, totalClanes: 0, ilegibles: estado.ilegibles, procesados: {}, clanes: {} };
  for (var tagC in estado.clanes) {
    var c = estado.clanes[tagC], jugadores = [];
    var tagsJ = Object.keys(c.jugadores).sort();
    for (var i = 0; i < tagsJ.length; i++) {
      var r = _semanasResumen_(c.jugadores[tagsJ[i]]);
      jugadores.push({ tag: tagsJ[i], semanas: r.semanas, primera: r.primera, ultima: r.ultima });
    }
    legado.clanes[tagC] = { nombre: c.nombre, nombres: c.nombres.slice(), jugadores: jugadores };
  }
  legado.totalClanes = Object.keys(legado.clanes).length;
  return legado;
}

/**
 * _clanesExternosCarpeta_(crear) [→ Contexto_Base_Web.md §PF378]
 * Carpeta Clanes_Externos dentro de Otros. Si no existe, la crea cuando `crear` es true y si no devuelve null. Se busca una vez por ejecución.
 */
function _clanesExternosCarpeta_(crear) {
  if (_clanesExternosCarpetaCache_) return _clanesExternosCarpetaCache_;
  var padre = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
  var it = padre.getFoldersByName(CLANES_EXTERNOS_CARPETA);
  var carpeta = it.hasNext() ? it.next() : (crear ? padre.createFolder(CLANES_EXTERNOS_CARPETA) : null);
  if (carpeta) _clanesExternosCarpetaCache_ = carpeta;
  return carpeta;
}

/**
 * _clanExternoNombreArchivo_(tagClan) / _clanesExternosListar_(carpeta) / _clanExternoBuscar_(carpeta, mapa, tagClan) [→ Contexto_Base_Web.md §PF378]
 * El archivo de un clan se llama «Clan - #TAG.json». Listar devuelve { '#TAG': archivo } con todos los archivos de la carpeta (si hubiera dos del mismo Tag, queda el primero); Buscar usa ese mapa si se lo dan y, si no, pide solo ese nombre a Drive (más barato cuando se necesitan pocos).
 */
function _clanExternoNombreArchivo_(tagClan) {
  return CLAN_EXTERNO_PREFIJO + tagClan + '.json';
}
function _clanesExternosListar_(carpeta) {
  var mapa = {};
  var re = /^Clan - (#[0-9A-Z]+)\.json$/i;
  var it = carpeta.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    var m = re.exec(f.getName());
    if (!m) continue;
    var tag = m[1].toUpperCase();
    if (!mapa[tag]) mapa[tag] = f;
  }
  return mapa;
}
function _clanExternoBuscar_(carpeta, mapa, tagClan) {
  if (mapa) return mapa[tagClan] || null;
  var it = carpeta.getFilesByName(_clanExternoNombreArchivo_(tagClan));
  return it.hasNext() ? it.next() : null;
}

/**
 * _clanesExternosEscribirPendientes_(estado, inicio, ahoraTxt) [→ Contexto_Base_Web.md §PF378]
 * Fusiona con su archivo de Clanes_Externos cada clan de `estado` cuya firma (_clanExternoFirma_) no coincide con la guardada en Indice_Clanes_Externos_Firmas.json, hasta agotar INDICE_CLANES_PRESUPUESTO_MS contado desde `inicio`. Un clan con firma distinta pero sin semanas ni nombres nuevos no se reescribe (solo se actualiza su firma). Si el archivo de un clan existe pero no se puede leer, no se pisa: se renombra «Clan - #TAG (ilegible AAAA-MM-DD HH.mm).json» para poder recuperarlo desde Drive y se crea uno nuevo con lo leído. Cada 200 clanes y al final guarda las firmas, para no perder lo hecho si la corrida se corta.
 * Devuelve { total, creados, actualizados, sinCambios, pendientes, fallos, ilegiblesApartados, firmas }: `pendientes` son los clanes que faltan (incluidos los que dieron error); la corrida del índice no se da por completa mientras haya alguno. Se detiene si hay CLANES_EXTERNOS_FALLOS_MAX errores.
 */
function _clanesExternosEscribirPendientes_(estado, inicio, ahoraTxt) {
  var firmas = _clanesExternosFirmasCargar_();
  var nuevas = {}, pendientes = [];
  for (var tagC in estado.clanes) {
    var sig = _clanExternoFirma_(estado.clanes[tagC]);
    nuevas[tagC] = sig;
    if (firmas.clanes[tagC] !== sig) pendientes.push(tagC);
  }
  pendientes.sort();
  var res = { total: Object.keys(estado.clanes).length, creados: 0, actualizados: 0, sinCambios: 0, pendientes: pendientes.length, fallos: 0, ilegiblesApartados: 0, firmas: firmas };
  if (!pendientes.length) return res;

  var carpeta = _clanesExternosCarpeta_(true);
  var mapa = pendientes.length > CLANES_EXTERNOS_LISTAR_DESDE ? _clanesExternosListar_(carpeta) : null;
  var sinGuardar = 0;
  for (var i = 0; i < pendientes.length; i++) {
    if (Date.now() - inicio > INDICE_CLANES_PRESUPUESTO_MS) break;
    if (res.fallos >= CLANES_EXTERNOS_FALLOS_MAX) break;
    var tag = pendientes[i];
    try {
      var nombreArchivo = _clanExternoNombreArchivo_(tag);
      var archivo = _clanExternoBuscar_(carpeta, mapa, tag);
      var previo = null;
      if (archivo) {
        try {
          previo = JSON.parse(archivo.getBlob().getDataAsString('UTF-8'));
        } catch (eLeer) {
          var apartado = nombreArchivo.replace(/\.json$/, '') + ' (ilegible ' + Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH.mm') + ').json';
          archivo.setName(apartado);
          Logger.log('[IndiceClanes] El archivo de ' + tag + ' no se pudo leer (' + eLeer.message + '): se renombró «' + apartado + '» para poder recuperarlo desde Drive y se crea uno nuevo.');
          res.ilegiblesApartados++;
          archivo = null;
          previo = null;
        }
      }
      var f = _clanExternoFusionar_(previo, tag, estado.clanes[tag], ahoraTxt);
      if (!f.cambio) {
        res.sinCambios++;
      } else {
        var texto = JSON.stringify(f.datos);
        if (archivo) {
          archivo.setContent(texto);
          _asegurarEscrituraCompleta_(archivo, texto, nombreArchivo);
          res.actualizados++;
        } else {
          var creado = carpeta.createFile(nombreArchivo, texto, MimeType.PLAIN_TEXT);
          _asegurarEscrituraCompleta_(creado, texto, nombreArchivo);
          if (mapa) mapa[tag] = creado;
          res.creados++;
        }
      }
      firmas.clanes[tag] = nuevas[tag];
      res.pendientes--;
      sinGuardar++;
      if (sinGuardar >= 200) { _clanesExternosFirmasGuardar_(firmas); sinGuardar = 0; }
    } catch (eClan) {
      res.fallos++;
      Logger.log('[IndiceClanes] No se pudo guardar el archivo del clan ' + tag + ': ' + eClan.message);
    }
  }
  _clanesExternosFirmasGuardar_(firmas);
  return res;
}

/**
 * _clanesExternosFirmasCargar_() / _clanesExternosFirmasGuardar_(firmas) [→ Contexto_Base_Web.md §PF378]
 * Indice_Clanes_Externos_Firmas.json (carpeta Otros): { version: 1, ultimaCompleta: 'dd/MM/yyyy HH:mm' | '', clanes: { '#CLAN': firma } }. `ultimaCompleta` queda vacía hasta que una corrida termina de verdad (lectura, archivos de clan y respaldo); mientras esté vacía los archivos de clan no se consideran un índice completo. Si el archivo no existe o no se puede leer, se devuelve uno vacío (todos los clanes quedan pendientes: más lento pero seguro).
 */
function _clanesExternosFirmasCargar_() {
  var vacio = { version: 1, ultimaCompleta: '', clanes: {} };
  try {
    var it = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS).getFilesByName(INDICE_CLANES_FIRMAS_JSON);
    if (!it.hasNext()) return vacio;
    var d = JSON.parse(it.next().getBlob().getDataAsString('UTF-8'));
    if (d && d.clanes && typeof d.clanes === 'object') {
      if (!d.ultimaCompleta) d.ultimaCompleta = '';
      return d;
    }
  } catch (e) {
    Logger.log('[IndiceClanes] No se pudo leer ' + INDICE_CLANES_FIRMAS_JSON + ' (' + e.message + '): se revisan todos los clanes.');
  }
  return vacio;
}
function _clanesExternosFirmasGuardar_(firmas) {
  _guardarArchivoProgresoVerificado_(DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS), INDICE_CLANES_FIRMAS_JSON, JSON.stringify(firmas));
}

/**
 * _clanesExternosUltimaCompleta_() / _clanesExternosListos_() [→ Contexto_Base_Web.md §PF378]
 * Desde que una corrida del índice termina entera (Indice_Clanes_Externos_Firmas.json con `ultimaCompleta`), los archivos de la carpeta Clanes_Externos son el índice: «Buscar clan» y las alertas leen de ellos. Antes de esa primera corrida completa siguen leyendo el índice anterior (Indice_Clanes_Externos.json), así que la migración no deja a la web sin datos. Como los archivos son históricos y solo se suman, una corrida nueva a medias NO los deja incompletos. Se consulta una vez por ejecución.
 */
function _clanesExternosUltimaCompleta_() {
  if (_clanesExternosListoCache_ === undefined) _clanesExternosListoCache_ = String(_clanesExternosFirmasCargar_().ultimaCompleta || '');
  return _clanesExternosListoCache_;
}
function _clanesExternosListos_() {
  return !!_clanesExternosUltimaCompleta_();
}

/**
 * _clanExternoLeer_(tagClanNorm) [→ Contexto_Base_Web.md §PF378]
 * Lee el archivo «Clan - #TAG.json» de un clan externo. Devuelve { error, datos, archivo }: `datos` es el contenido (forma de _clanExternoFusionar_()) o null si el clan no tiene archivo (ningún jugador nuestro jugó ahí, no es un error); `error` es true si no se pudo leer (carpeta inexistente, JSON dañado o falla de Drive), para no confundirlo con «sin jugadores». `archivo` es el File de Drive, para poder escribir marcas.
 */
function _clanExternoLeer_(tagClanNorm) {
  try {
    var carpeta = _clanesExternosCarpeta_(false);
    if (!carpeta) return { error: true, datos: null, archivo: null };
    var it = carpeta.getFilesByName(_clanExternoNombreArchivo_('#' + cleanTag(tagClanNorm)));
    if (!it.hasNext()) return { error: false, datos: null, archivo: null };
    var archivo = it.next();
    var d = JSON.parse(archivo.getBlob().getDataAsString('UTF-8'));
    if (!d || !d.jugadores || typeof d.jugadores !== 'object') {
      Logger.log('[IndiceClanes] El archivo de ' + tagClanNorm + ' no tiene el formato esperado.');
      return { error: true, datos: null, archivo: archivo };
    }
    return { error: false, datos: d, archivo: archivo };
  } catch (e) {
    Logger.log('[IndiceClanes] No se pudo leer el archivo del clan ' + tagClanNorm + ': ' + e.message);
    return { error: true, datos: null, archivo: null };
  }
}

/**
 * _clanExternoJugadoresDe_(datos) [→ Contexto_Base_Web.md §PF378]
 * Jugadores del archivo de un clan con la forma que daba el índice anterior: [{ tag, semanas, primera, ultima }], con el total y la primera y última semana calculados de la lista de semanas (_semanasResumen_). Los jugadores sin semanas no salen. Función pura.
 */
function _clanExternoJugadoresDe_(datos) {
  var salida = [];
  var pj = (datos && datos.jugadores) || {};
  var tagsJ = Object.keys(pj).sort();
  for (var i = 0; i < tagsJ.length; i++) {
    var r = _semanasResumen_(pj[tagsJ[i]]);
    if (r.semanas > 0) salida.push({ tag: tagsJ[i], semanas: r.semanas, primera: r.primera, ultima: r.ultima });
  }
  return salida;
}

/**
 * _indiceClanesCargarParcial_() / _indiceClanesGuardarParcial_(estado) / _indiceClanesBorrarParcial_() [→ Contexto_Base_Web.md §PF378]
 * Indice_Clanes_Externos_Parcial.json (carpeta Otros): el avance de la lectura mientras la corrida no termina, aparte del índice completo. Cargar devuelve null si no existe, tiene otro formato o es más viejo que INDICE_CLANES_PARCIAL_MAX_EDAD_MS (una lectura de hace días ya no es «la de esta semana»; no daña los archivos de clan porque solo suman, pero el respaldo saldría mezclado). Borrar manda el archivo a la papelera al completarse.
 */
function _indiceClanesCargarParcial_() {
  try {
    var it = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS).getFilesByName(INDICE_CLANES_PARCIAL_JSON);
    if (!it.hasNext()) return null;
    var p = JSON.parse(it.next().getBlob().getDataAsString('UTF-8'));
    if (!p || p.version !== 2 || !p.procesados || !p.clanes) {
      Logger.log('[IndiceClanes] ' + INDICE_CLANES_PARCIAL_JSON + ' tiene un formato que no se reconoce: se descarta y se empieza de cero.');
      return null;
    }
    var edad = Date.now() - (Number(p.iniciadoMs) || 0);
    if (edad > INDICE_CLANES_PARCIAL_MAX_EDAD_MS) {
      Logger.log('[IndiceClanes] El avance guardado tiene ' + Math.round(edad / 3600000) + ' h (máximo ' + Math.round(INDICE_CLANES_PARCIAL_MAX_EDAD_MS / 3600000) + ' h): se descarta y se empieza de cero.');
      return null;
    }
    return p;
  } catch (e) {
    Logger.log('[IndiceClanes] No se pudo leer ' + INDICE_CLANES_PARCIAL_JSON + ' (' + e.message + '): se empieza de cero.');
    return null;
  }
}
function _indiceClanesGuardarParcial_(estado) {
  _guardarArchivoProgresoVerificado_(DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS), INDICE_CLANES_PARCIAL_JSON, JSON.stringify(estado));
}
function _indiceClanesBorrarParcial_() {
  try {
    var it = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS).getFilesByName(INDICE_CLANES_PARCIAL_JSON);
    while (it.hasNext()) it.next().setTrashed(true);
  } catch (e) {
    Logger.log('[IndiceClanes] No se pudo retirar ' + INDICE_CLANES_PARCIAL_JSON + ': ' + e.message);
  }
}

// ----- Alertas de clanes sospechosos: cruzar, guardar y consultar (§PF375) -----

/**
 * _alertasClanesSospechosos_(rivalesYConflicto) [→ Contexto_Base_Web.md §PF375]
 * Pasa el resultado de _getRivalesYConflicto(true) a { TAGNORM: { nombre, tipos } }, con tipos 'rival' (rival de la temporada) y/o 'vetado' (hoja Conflictos o clan vetado). Los clanes de la Familia nunca llegan aquí (_getClanesRivalesTemporadaActual() los excluye).
 */
function _alertasClanesSospechosos_(rivalesYConflicto) {
  var salida = {};
  for (var tag in rivalesYConflicto) {
    var r = rivalesYConflicto[tag];
    var fuente = String((r && r.fuente) || '');
    var tipos = [];
    if (fuente.indexOf('currentriverrace') >= 0) tipos.push('rival');
    if (fuente === 'manual' || fuente === 'currentriverrace+manual' || fuente === 'vetado') tipos.push('vetado');
    var tagNorm = cleanTag(tag);
    if (!tipos.length || !tagNorm) continue;
    salida[tagNorm] = { nombre: String((r && r.nombre) || ''), tipos: tipos };
  }
  return salida;
}

/**
 * _clanRivalConfirmadoPorTag_(tagJugador, nombreNorm, tagsRivales) [→ Contexto_Base_Web.md §PF400]
 * Confirma por Tag un aviso de «clan rival» que Ingresos recientes (37_Web_API.gs) detectó por NOMBRE. Dos clanes distintos pueden llamarse igual (caso Ribe: #YGQ8JPV y el rival #8JV20LCJ, ambos «Argentina»), y la hoja «Nuevos» solo guarda el nombre.
 * Lee el JSON individual del jugador (una lectura de Drive; solo se llama cuando el nombre ya coincidió con un clan sospechoso) y mira sus filas cuyo clan, sin la fecha final, se llama `nombreNorm` (mayúsculas):
 *   { estado: 'si', tag: 'TAG' }  alguna de esas filas trae el Tag de un clan de `tagsRivales` (Tags sin «#»): el aviso es correcto.
 *   { estado: 'no' }              todas esas filas traen Tag y ninguno es rival: era otro clan con el mismo nombre, no se avisa.
 *   { estado: 'sin_dato' }        no hay JSON, no hay filas con ese nombre o alguna no trae Tag (CSV anteriores a §PF253): no se puede decir, se conserva el aviso por nombre.
 * @param {string} tagJugador Tag del jugador, con o sin «#».
 * @param {string} nombreNorm Nombre del clan en mayúsculas y sin espacios en los extremos.
 * @param {string[]} tagsRivales Tags (sin «#») de los clanes sospechosos que se llaman así.
 * @return {{estado: string, tag: (string|undefined)}}
 */
function _clanRivalConfirmadoPorTag_(tagJugador, nombreNorm, tagsRivales) {
  var historial = null;
  try { historial = _cargarHistorialGuerraIndividual('#' + cleanTag(tagJugador)); }
  catch (e) { return { estado: 'sin_dato' }; }
  var registros = (historial && historial.registros) ? historial.registros : [];
  var conTag = 0, sinTag = 0;
  for (var i = 0; i < registros.length; i++) {
    var r = registros[i];
    if (!r) continue;
    var nombre = String(r.clan || '').replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim().toUpperCase();
    if (nombre !== nombreNorm) continue;
    var tagFila = cleanTag(r.clanTag);
    if (!tagFila) { sinTag++; continue; }
    if (tagsRivales.indexOf(tagFila) >= 0) return { estado: 'si', tag: tagFila };
    conTag++;
  }
  return (conTag > 0 && sinTag === 0) ? { estado: 'no' } : { estado: 'sin_dato' };
}

/**
 * _alertasClanesCruzar_(previo, sospechosos, indice, ahoraTxt) [→ Contexto_Base_Web.md §PF375]
 * Función pura: devuelve { estado, jugadoresNuevos, clanesNuevos }. `previo` es lo ya guardado (o null); `sospechosos` sale de _alertasClanesSospechosos_(); `indice` tiene la forma { actualizado, clanes: { '#CLAN': { nombre, jugadores: [{ tag, semanas, primera, ultima }], marcas? } } } (el índice anterior completo, o lo leído de los archivos de clan, §PF378).
 * Estado: { version, actualizado, indiceActualizado, clanes: { '#CLAN': { nombre, tipos, desde } }, jugadores: { '#JUGADOR': { clanes: { '#CLAN': { semanas, primera, ultima } } } } }.
 * PERMANENTE es el CLAN (§PF378): se revisan los clanes sospechosos de hoy y TAMBIÉN los ya guardados; nunca se borra un clan y los tipos se suman (un clan que fue rival y luego se vetó queda con los dos; las `marcas` del archivo del clan también cuentan como tipos).
 * Los JUGADORES: con `opciones.recalcular` (la fuente son los archivos de clan, que son históricos) se arman de nuevo en cada corrida, así que un jugador sin respaldo en el archivo de su clan deja de salir. Solo se conserva lo anterior de los clanes de `opciones.fallidos` (su archivo no se pudo leer: no se castiga un error de Drive). Sin `recalcular` (fuente: el índice anterior, que se vuelve a calcular y pierde historia si se limpia un JSON individual) se acumula como antes: nunca se borra un jugador.
 * Un clan sospechoso sin jugadores nuestros en la fuente no se guarda.
 */
function _alertasClanesCruzar_(previo, sospechosos, indice, ahoraTxt, opciones) {
  var opc = opciones || {};
  var estado = (previo && previo.clanes && previo.jugadores) ? previo : { version: 1, actualizado: '', indiceActualizado: '', clanes: {}, jugadores: {} };
  var claves = {};
  for (var t in sospechosos) claves['#' + t] = true;
  for (var k in estado.clanes) claves[k] = true;
  var antes = estado.jugadores;
  if (opc.recalcular) {
    estado.jugadores = {};
    var fallidos = opc.fallidos || {};
    for (var tagAnt in antes) {
      for (var claveAnt in antes[tagAnt].clanes) {
        if (!fallidos[claveAnt]) continue;
        if (!estado.jugadores[tagAnt]) estado.jugadores[tagAnt] = { clanes: {} };
        estado.jugadores[tagAnt].clanes[claveAnt] = antes[tagAnt].clanes[claveAnt];
      }
    }
  }
  var jugadoresNuevos = 0, clanesNuevos = 0;
  for (var clave in claves) {
    var enIndice = indice && indice.clanes ? indice.clanes[clave] : null;
    if (!enIndice || !enIndice.jugadores || !enIndice.jugadores.length) continue;
    var hoy = sospechosos[cleanTag(clave)] || null;
    var c = estado.clanes[clave];
    if (!c) { c = estado.clanes[clave] = { nombre: '', tipos: [], desde: String(ahoraTxt).slice(0, 10) }; clanesNuevos++; }
    if (hoy && hoy.nombre) c.nombre = hoy.nombre;
    else if (!c.nombre && enIndice.nombre) c.nombre = enIndice.nombre;
    var tiposHoy = hoy ? hoy.tipos : [];
    for (var ti = 0; ti < tiposHoy.length; ti++) if (c.tipos.indexOf(tiposHoy[ti]) < 0) c.tipos.push(tiposHoy[ti]);
    if (enIndice.marcas && typeof enIndice.marcas === 'object') {
      for (var tipoMarca in enIndice.marcas) if (c.tipos.indexOf(tipoMarca) < 0) c.tipos.push(tipoMarca);
    }
    for (var j = 0; j < enIndice.jugadores.length; j++) {
      var jug = enIndice.jugadores[j];
      var tagJ = '#' + cleanTag(jug.tag);
      if (tagJ === '#') continue;
      var pj = estado.jugadores[tagJ];
      if (!pj) { pj = estado.jugadores[tagJ] = { clanes: {} }; if (!antes[tagJ]) jugadoresNuevos++; }
      pj.clanes[clave] = { semanas: jug.semanas || 0, primera: jug.primera || null, ultima: jug.ultima || null };
    }
  }
  estado.actualizado = ahoraTxt;
  estado.indiceActualizado = (indice && indice.actualizado) || '';
  return { estado: estado, jugadoresNuevos: jugadoresNuevos, clanesNuevos: clanesNuevos };
}

/**
 * _alertasClanesCargar_() / _alertasClanesGuardar_(estado) [→ Contexto_Base_Web.md §PF375]
 * Lee y escribe Alertas_Clanes_Sospechosos.json en la carpeta Otros. Cargar devuelve null si no existe o no se pudo leer; guardar borra el resumen en caché para que la web vea lo nuevo.
 */
function _alertasClanesCargar_() {
  try {
    var files = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS).getFilesByName(ALERTAS_CLANES_JSON);
    if (files.hasNext()) return JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    Logger.log('[AlertasClanes] Error leyendo ' + ALERTAS_CLANES_JSON + ': ' + e.message);
  }
  return null;
}
function _alertasClanesGuardar_(estado) {
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
  var files = folder.getFilesByName(ALERTAS_CLANES_JSON);
  var content = JSON.stringify(estado);
  if (files.hasNext()) _setContentConConteo_(files.next(), content);
  else _createFileConConteo_(folder, ALERTAS_CLANES_JSON, content, MimeType.PLAIN_TEXT);
  try { CacheService.getScriptCache().remove(ALERTAS_CLANES_CACHE_KEY); } catch (eCache) { /* el resumen se vuelve a armar solo al vencer */ }
}

/**
 * _alertasClanesActualizar_(origen, sospechososDados, indiceDado) [→ Contexto_Base_Web.md §PF375]
 * Orquesta: fuente de datos + clanes sospechosos de hoy (los dados o los de _getRivalesYConflicto(true)) + lo ya guardado. Devuelve { ok, motivo?, jugadoresNuevos, clanesNuevos, jugadores, clanes }; ok:false con motivo 'sin-indice' si no hay fuente completa (no se toca nada). Al terminar anota la firma de los clanes sospechosos de hoy, que usa _alertasClanesDesdeCaptura_() para no repetir el trabajo.
 * Fuente (§PF378): si hay un índice dado, ese; si no, y ya hubo una corrida completa, los archivos de clan de los clanes sospechosos (hoy y ya guardados), leídos de uno en uno: ahí los jugadores se recalculan en cada corrida y la marca (rival o vetado, con su fecha) se escribe también en el archivo del clan; si no, el índice anterior completo (Indice_Clanes_Externos.json), con el comportamiento acumulativo de siempre.
 */
function _alertasClanesActualizar_(origen, sospechososDados, indiceDado) {
  var sospechosos = sospechososDados || _alertasClanesSospechosos_(_getRivalesYConflicto(true));
  var ahoraTxt = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm');
  var previo = _alertasClanesCargar_();
  var indice = indiceDado || null, opciones = null, lecturas = null, fuenteTxt = 'índice anterior';
  if (!indice && _clanesExternosListos_()) {
    var claves = {};
    for (var t in sospechosos) claves['#' + t] = true;
    if (previo && previo.clanes) for (var k in previo.clanes) claves[k] = true;
    var f = _alertasClanesFuenteDeArchivos_(claves);
    indice = f.fuente;
    lecturas = f.lecturas;
    opciones = { recalcular: true, fallidos: f.fallidos };
    fuenteTxt = 'archivos de clan';
  }
  if (!indice) {
    indice = _cargarIndiceClanes_();
    if (!indice || !indice.completo || !indice.clanes) return { ok: false, motivo: 'sin-indice' };
  }
  var tiposPrevios = {};
  if (previo && previo.clanes) for (var kp in previo.clanes) tiposPrevios[kp] = (previo.clanes[kp].tipos || []).slice();
  var res = _alertasClanesCruzar_(previo, sospechosos, indice, ahoraTxt, opciones);
  _alertasClanesGuardar_(res.estado);
  if (lecturas) _alertasClanesMarcarEnArchivos_(res.estado, lecturas, tiposPrevios, ahoraTxt);
  PropertiesService.getScriptProperties().setProperty(ALERTAS_CLANES_FIRMA_PROP, Object.keys(sospechosos).sort().join(','));
  var nJug = Object.keys(res.estado.jugadores).length, nClan = Object.keys(res.estado.clanes).length;
  Logger.log('[AlertasClanes] (' + origen + ', ' + fuenteTxt + ') ' + nJug + ' jugadores en ' + nClan + ' clanes sospechosos (' + res.jugadoresNuevos + ' jugadores y ' + res.clanesNuevos + ' clanes nuevos; ' + Object.keys(sospechosos).length + ' clanes sospechosos hoy).');
  return { ok: true, jugadoresNuevos: res.jugadoresNuevos, clanesNuevos: res.clanesNuevos, jugadores: nJug, clanes: nClan };
}

/**
 * _alertasClanesFuenteDeArchivos_(claves) [→ Contexto_Base_Web.md §PF378]
 * Lee los archivos de clan de `claves` ({ '#CLAN': true }) y los deja con la forma de índice que espera _alertasClanesCruzar_(): { fuente: { actualizado, clanes: { '#CLAN': { nombre, jugadores, marcas } } }, lecturas: { '#CLAN': lectura de _clanExternoLeer_() }, fallidos: { '#CLAN': true } }. Un clan sin archivo (ningún jugador nuestro jugó ahí) no aparece en `clanes`; uno cuyo archivo no se pudo leer queda en `fallidos`. `actualizado` es la fecha de la última corrida completa del índice.
 */
function _alertasClanesFuenteDeArchivos_(claves) {
  var fuente = { actualizado: _clanesExternosUltimaCompleta_(), clanes: {} };
  var lecturas = {}, fallidos = {};
  for (var clave in claves) {
    var l = _clanExternoLeer_(cleanTag(clave));
    if (l.error) { fallidos[clave] = true; continue; }
    if (!l.datos) continue;
    lecturas[clave] = l;
    fuente.clanes[clave] = { nombre: String(l.datos.nombre || ''), jugadores: _clanExternoJugadoresDe_(l.datos), marcas: (l.datos.marcas && typeof l.datos.marcas === 'object') ? l.datos.marcas : {} };
  }
  return { fuente: fuente, lecturas: lecturas, fallidos: fallidos };
}

/**
 * _alertasClanesMarcarEnArchivos_(estado, lecturas, tiposPrevios, ahoraTxt) [→ Contexto_Base_Web.md §PF378]
 * Escribe en `marcas` del archivo de cada clan sospechoso los tipos (rival, vetado) que aún no tenía, con su fecha: la de la primera alerta del clan (`desde`) si el tipo ya estaba en las alertas guardadas, o la de hoy si es nuevo. Las marcas nunca se quitan. Solo se reescriben los archivos que cambian; si falla uno, se anota y se sigue (las alertas ya quedaron guardadas).
 */
function _alertasClanesMarcarEnArchivos_(estado, lecturas, tiposPrevios, ahoraTxt) {
  for (var clave in lecturas) {
    var c = estado.clanes[clave];
    var l = lecturas[clave];
    if (!c || !l.datos || !l.archivo) continue;
    try {
      var marcas = (l.datos.marcas && typeof l.datos.marcas === 'object') ? l.datos.marcas : {};
      var previos = tiposPrevios[clave] || [];
      var cambio = false;
      for (var i = 0; i < c.tipos.length; i++) {
        var tipo = c.tipos[i];
        if (marcas[tipo]) continue;
        marcas[tipo] = (previos.indexOf(tipo) >= 0 && c.desde) ? c.desde : String(ahoraTxt).slice(0, 10);
        cambio = true;
      }
      if (!cambio) continue;
      l.datos.marcas = marcas;
      var texto = JSON.stringify(l.datos);
      l.archivo.setContent(texto);
      _asegurarEscrituraCompleta_(l.archivo, texto, _clanExternoNombreArchivo_(clave));
    } catch (e) {
      Logger.log('[AlertasClanes] No se pudo escribir la marca en el archivo del clan ' + clave + ': ' + e.message);
    }
  }
}

/**
 * _alertasClanesDesdeCaptura_() [→ Contexto_Base_Web.md §PF375]
 * Gancho de capturarApiClanes_() (00_Main.gs), fuera de la ventana de las 4 a. m.: si los clanes sospechosos de hoy (rivales, Conflictos, vetado) son los mismos de la última vez, no hace nada (solo lee la hoja Conflictos y una propiedad de script); si aparece uno nuevo, vuelve a cruzar con el índice. Nunca lanza error: la captura no debe fallar por esto. Con el índice incompleto no anota la firma y lo reintenta en la siguiente captura.
 */
function _alertasClanesDesdeCaptura_() {
  try {
    var sospechosos = _alertasClanesSospechosos_(_getRivalesYConflicto(true));
    var firma = Object.keys(sospechosos).sort().join(',');
    if (PropertiesService.getScriptProperties().getProperty(ALERTAS_CLANES_FIRMA_PROP) === firma) return;
    var r = _alertasClanesActualizar_('captura', sospechosos);
    if (!r.ok) Logger.log('[AlertasClanes] Captura: no se actualizó (' + r.motivo + ').');
  } catch (e) {
    Logger.log('[AlertasClanes] Captura: no se pudo actualizar las alertas: ' + e.message);
  }
}

/**
 * _alertasClanesDesdeJugadoresNuevos_(tagsJugadores) [→ Contexto_Base_Web.md §PF397]
 * 6-nov-2026 (pedido de la usuaria: que el ⚠️ de un miembro nuevo salga sin esperar a la corrida semanal del índice). La llama _aplicarHistorialGuerra() (20_HistorialGuerraJugador.gs) cuando el lote de Tampermonkey trae filas de un clan externo (`externa: true`).
 * Para esos jugadores lee su JSON individual ya guardado y, por cada clan externo donde jugaron que sea sospechoso (rival de la temporada, Conflictos, vetado o ya presente en las alertas), hace dos cosas; ambas solo SUMAN:
 *  1) Fusiona sus semanas con el archivo del clan en Clanes_Externos (solo desde la primera corrida completa del índice, §PF378). Es lo que evita que el jugador desaparezca cuando _alertasClanesActualizar_() recalcula los jugadores desde esos archivos (`recalcular: true`): sin esto, el siguiente cambio de rivales lo borraría hasta la corrida semanal.
 *  2) Lo agrega a Alertas_Clanes_Sospechosos.json con _alertasClanesCruzar_() (modo acumulativo) y escribe la marca (rival o vetado) en el archivo del clan.
 * Solo escribe en Drive si algo cambia: reenviar el mismo lote no reescribe nada. No toca ALERTAS_CLANES_FIRMA_PROP (esa firma es de los clanes sospechosos de hoy, no de los jugadores).
 * La corrida semanal del índice sigue siendo la que revisa a todos; esto solo adelanta a quienes llegan entre una corrida y otra. Con una reenumeración en curso, sin lock o con el archivo del clan ilegible no hace nada en ese punto (la corrida del índice lo cubre) y nunca pisa un archivo que no pudo leer.
 * @param {Array<string>} tagsJugadores Tags de jugador (con o sin «#») cuyo lote trajo filas externas.
 * @returns {{ok:boolean, motivo:string, jugadoresNuevos:number, clanesTocados:number, archivosEscritos:number}} Nunca lanza error: el guardado del historial no debe fallar por esto.
 */
function _alertasClanesDesdeJugadoresNuevos_(tagsJugadores) {
  var res = { ok: false, motivo: '', jugadoresNuevos: 0, clanesTocados: 0, archivosEscritos: 0 };
  var lock = null, tieneLock = false;
  try {
    var tagsLote = {}, listaTags = [];
    for (var i = 0; i < (tagsJugadores || []).length; i++) {
      var tn = cleanTag(tagsJugadores[i]);
      if (!tn || tagsLote['#' + tn]) continue;
      tagsLote['#' + tn] = true;
      listaTags.push('#' + tn);
    }
    if (!listaTags.length) { res.ok = true; res.motivo = 'sin-jugadores'; return res; }
    if (_reenumeracionEnCurso_()) { res.motivo = 'reenumerando'; Logger.log('[AlertasClanes] Miembros nuevos: hay una reenumeración en curso; las alertas de estos jugadores las cubre la corrida del índice.'); return res; }

    // 1) Clanes externos de cada jugador, leídos de su JSON individual (el mismo armado que usa el índice).
    var acum = _indiceClanesVacio_();
    for (var j = 0; j < listaTags.length; j++) {
      var historial = _cargarHistorialGuerraIndividual(listaTags[j]);
      if (historial && historial.registros) _indiceClanesAgregar_(acum, listaTags[j], historial.registros);
    }
    if (!Object.keys(acum.clanes).length) { res.ok = true; res.motivo = 'sin-clanes-externos'; return res; }

    // 2) Solo importan los clanes sospechosos de hoy y los que ya están en las alertas.
    var sospechosos = _alertasClanesSospechosos_(_getRivalesYConflicto(true));
    var previo = _alertasClanesCargar_();
    var objetivo = [];
    for (var clave in acum.clanes) {
      if (sospechosos[cleanTag(clave)] || (previo && previo.clanes && previo.clanes[clave])) objetivo.push(clave);
    }
    if (!objetivo.length) { res.ok = true; res.motivo = 'sin-clanes-sospechosos'; return res; }

    lock = LockService.getScriptLock();
    tieneLock = lock.tryLock(30000);
    if (!tieneLock) { res.motivo = 'sin-lock'; Logger.log('[AlertasClanes] Miembros nuevos: no se pudo obtener el lock; las alertas de estos jugadores las cubre la corrida del índice.'); return res; }
    previo = _alertasClanesCargar_(); // se vuelve a leer ya con el lock, por si otra corrida escribió entre medio

    var ahoraTxt = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm');
    var listos = _clanesExternosListos_();
    var sintetico = { actualizado: (previo && previo.indiceActualizado) || '', clanes: {} };
    var lecturas = {};

    // 3) Por cada clan sospechoso: se fusiona con su archivo (si ya hubo una corrida completa) y se arma la entrada para las alertas.
    for (var o = 0; o < objetivo.length; o++) {
      var claveClan = objetivo[o];
      var acumClan = acum.clanes[claveClan];
      var jugadoresClan = null, marcas = {};
      if (listos) {
        var l = _clanExternoLeer_(cleanTag(claveClan));
        if (l.error) {
          Logger.log('[AlertasClanes] Miembros nuevos: el archivo del clan ' + claveClan + ' no se pudo leer; no se toca y las alertas toman lo leído del JSON del jugador.');
        } else {
          var f = _clanExternoFusionar_(l.datos, claveClan, acumClan, ahoraTxt);
          var archivo = l.archivo;
          if (f.cambio) {
            var texto = JSON.stringify(f.datos);
            var nombreArchivo = _clanExternoNombreArchivo_(claveClan);
            if (archivo) {
              archivo.setContent(texto);
            } else {
              archivo = _clanesExternosCarpeta_(true).createFile(nombreArchivo, texto, MimeType.PLAIN_TEXT);
            }
            _asegurarEscrituraCompleta_(archivo, texto, nombreArchivo);
            res.archivosEscritos++;
          }
          lecturas[claveClan] = { error: false, datos: f.datos, archivo: archivo };
          marcas = (f.datos.marcas && typeof f.datos.marcas === 'object') ? f.datos.marcas : {};
          jugadoresClan = _clanExternoJugadoresDe_(f.datos).filter(function (jug) { return !!tagsLote['#' + cleanTag(jug.tag)]; });
        }
      }
      if (!jugadoresClan) {
        jugadoresClan = [];
        for (var tagJ in acumClan.jugadores) {
          var r = _semanasResumen_(acumClan.jugadores[tagJ]);
          if (r.semanas > 0) jugadoresClan.push({ tag: tagJ, semanas: r.semanas, primera: r.primera, ultima: r.ultima });
        }
      }
      sintetico.clanes[claveClan] = { nombre: acumClan.nombre, jugadores: jugadoresClan, marcas: marcas };
    }
    res.clanesTocados = Object.keys(sintetico.clanes).length;

    // 4) Alertas: se cruzan solo estos clanes (los demás se saltan porque no están en `sintetico`) y se guarda solo si hubo un cambio real.
    var sinFecha = function (e) { if (!e) return ''; var c = JSON.parse(JSON.stringify(e)); delete c.actualizado; return JSON.stringify(c); };
    var tiposPrevios = {};
    if (previo && previo.clanes) for (var kp in previo.clanes) tiposPrevios[kp] = (previo.clanes[kp].tipos || []).slice();
    var antesTxt = sinFecha(previo);
    var jugadoresAntes = {};
    if (previo && previo.jugadores) for (var tp in previo.jugadores) jugadoresAntes[tp] = true;
    var cr = _alertasClanesCruzar_(previo, sospechosos, sintetico, ahoraTxt);
    // El conteo `cr.jugadoresNuevos` de _alertasClanesCruzar_() sale siempre 0 en modo acumulativo (compara contra el mismo objeto que va llenando); aquí se cuenta contra lo que había antes.
    for (var tn2 in cr.estado.jugadores) if (!jugadoresAntes[tn2]) res.jugadoresNuevos++;
    var hayAlgo = Object.keys(cr.estado.jugadores).length > 0;
    if (hayAlgo && sinFecha(cr.estado) !== antesTxt) {
      _alertasClanesGuardar_(cr.estado);
      if (Object.keys(lecturas).length) _alertasClanesMarcarEnArchivos_(cr.estado, lecturas, tiposPrevios, ahoraTxt);
      Logger.log('[AlertasClanes] (miembros nuevos) ' + res.jugadoresNuevos + ' jugadores y ' + cr.clanesNuevos + ' clanes nuevos en las alertas; ' + res.archivosEscritos + ' archivos de clan escritos (' + (listos ? 'con' : 'sin') + ' archivos de clan).');
    }
    res.ok = true;
    return res;
  } catch (e) {
    res.motivo = 'error';
    Logger.log('[AlertasClanes] Miembros nuevos: no se pudieron actualizar las alertas: ' + e.message);
    return res;
  } finally {
    if (tieneLock) { try { lock.releaseLock(); } catch (eLiberar) { /* el lock vence solo */ } }
  }
}

/**
 * _alertasClanesResumen_(estado) [→ Contexto_Base_Web.md §PF375]
 * Lo mínimo que necesita la web para pintar el ⚠️: { ok, actualizado, jugadores: { 'TAGSINNUMERAL': { n: clanes sospechosos, tipos: ['rival','vetado'] } } }. Sin nombres ni semanas (eso va aparte, al abrir el modal).
 */
function _alertasClanesResumen_(estado) {
  var jugadores = {};
  for (var tj in estado.jugadores) {
    var tipos = {}, n = 0;
    for (var tc in estado.jugadores[tj].clanes) {
      n++;
      var ct = estado.clanes[tc];
      var lista = (ct && ct.tipos) || [];
      for (var i = 0; i < lista.length; i++) tipos[lista[i]] = true;
    }
    if (n) jugadores[cleanTag(tj)] = { n: n, tipos: Object.keys(tipos).sort() };
  }
  return { ok: true, actualizado: estado.actualizado || '', jugadores: jugadores };
}

/**
 * _webAdminTagsClanesSospechosos(token) [→ Contexto_Base_Web.md §PF375]
 * Para el ⚠️ junto al 📈 del mini historial: Tags (sin #) de jugadores que estuvieron en clanes vetados o rivales. Solo admins (las tablas públicas no llevan este dato). Lee el resumen de la caché del script o, si no está, de Alertas_Clanes_Sospechosos.json (un solo archivo pequeño; no recorre hojas ni JSON individuales).
 */
function _webAdminTagsClanesSospechosos(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var cache = null;
  try {
    cache = CacheService.getScriptCache();
    var crudo = cache.get(ALERTAS_CLANES_CACHE_KEY);
    if (crudo) return JSON.parse(crudo);
  } catch (eLeer) { cache = null; }
  var estado = _alertasClanesCargar_();
  var resumen = estado ? _alertasClanesResumen_(estado) : { ok: true, actualizado: '', jugadores: {} };
  if (cache) { try { cache.put(ALERTAS_CLANES_CACHE_KEY, JSON.stringify(resumen), ALERTAS_CLANES_CACHE_TTL_SEG); } catch (eGuardar) { /* sin caché solo se lee de Drive */ } }
  return resumen;
}

/**
 * _webAdminClanesSospechososJugador(token, tag) [→ Contexto_Base_Web.md §PF375]
 * Para el modal del ⚠️: por cada clan sospechoso de un jugador, sus semanas jugadas ahí (filas `externa: true` de su JSON individual de RoyaleAPI con ese clanTag, §PF340): { tag, nombre, tipos, semanas, primera, ultima, filas: [{ temporada, temporadaRoyaleApi, supercell, semana, ataques, fame, barcos, cerrada }] }, del clan más reciente al más antiguo y las semanas de la más reciente a la más antigua. De un clan externo solo hay totales por semana (no por día, como en el mini historial de nuestros clanes). `historialDisponible` es false si el JSON individual no se pudo leer; las semanas salen vacías pero la lista de clanes sale igual (viene de las alertas). Solo admins.
 */
function _webAdminClanesSospechososJugador(token, tag) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var tagNorm = cleanTag(tag);
  if (!tagNorm) return { ok: false, error: 'Falta el Tag del jugador.' };
  var estado = _alertasClanesCargar_();
  var pj = estado && estado.jugadores ? estado.jugadores['#' + tagNorm] : null;
  if (!pj) return { ok: true, tag: '#' + tagNorm, clanes: [], historialDisponible: true };

  var historial = null;
  try { historial = _cargarHistorialGuerraIndividual('#' + tagNorm); }
  catch (eJson) { Logger.log('[AlertasClanes] JSON individual de ' + tagNorm + ' no se pudo leer: ' + eJson.message); }
  var registros = (historial && historial.registros) ? historial.registros : [];

  var clanes = [];
  for (var clave in pj.clanes) {
    var tagC = cleanTag(clave);
    var filas = [];
    for (var i = 0; i < registros.length; i++) {
      var r = registros[i];
      if (!r || r.externa !== true || cleanTag(r.clanTag) !== tagC) continue;
      var tRoy = Number(r.temporadaRoyaleAPI);
      filas.push({
        temporada: Number(r.temporadaInterna), temporadaRoyaleApi: isNaN(tRoy) ? null : tRoy, supercell: _temporadaSupercellDeRoyaleApi_(tRoy),
        semana: Number(r.semana), ataques: (r.ataques == null) ? null : r.ataques, fame: (r.fame == null) ? null : r.fame, barcos: (r.barcos == null) ? null : r.barcos, cerrada: !!r.cerrada
      });
    }
    filas.sort(function (a, b) { return (b.temporada - a.temporada) || (b.semana - a.semana); });
    var ct = estado.clanes[clave] || {};
    clanes.push({ tag: clave, nombre: ct.nombre || '', tipos: ct.tipos || [], semanas: pj.clanes[clave].semanas || filas.length, primera: pj.clanes[clave].primera || null, ultima: pj.clanes[clave].ultima || null, filas: filas });
  }
  clanes.sort(function (a, b) {
    var ua = a.ultima || { temporada: 0, semana: 0 }, ub = b.ultima || { temporada: 0, semana: 0 };
    return (ub.temporada - ua.temporada) || (ub.semana - ua.semana) || (b.semanas - a.semanas);
  });
  return { ok: true, tag: '#' + tagNorm, clanes: clanes, historialDisponible: historial !== null };
}

/**
 * diagnosticarAlertaClanJugador(tag) [→ Contexto_Base_Web.md §PF399]
 * SOLO LECTURA. Explica en el registro por qué un jugador tiene (o no) el ⚠️: lee su JSON individual, lista sus clanes externos con su clanTag, dice cuáles son sospechosos hoy (rival, Conflictos o vetado), si cada clan existe en las alertas y si el jugador figura en Alertas_Clanes_Sospechosos.json. Sin argumento (se corre desde el editor) usa DIAG_ALERTA_TAG_DEFECTO; cámbialo o llama con otro Tag.
 * @param {string=} tag Tag del jugador, con o sin «#».
 */
var DIAG_ALERTA_TAG_DEFECTO = '#JUJP2UJVJ';
function diagnosticarAlertaClanJugador(tag) {
  var tagNorm = cleanTag(tag || DIAG_ALERTA_TAG_DEFECTO);
  var L = function (t) { Logger.log('[DiagAlerta] ' + t); };
  L('Jugador #' + tagNorm);
  var historial = null;
  try { historial = _cargarHistorialGuerraIndividual('#' + tagNorm); } catch (e) { L('No se pudo leer su JSON individual: ' + e.message); }
  var registros = (historial && historial.registros) ? historial.registros : [];
  var externas = registros.filter(function (r) { return r && r.externa === true; });
  var sinTag = externas.filter(function (r) { return !r.clanTag; });
  L('JSON individual: ' + (historial ? 'existe' : 'NO existe') + '; filas: ' + registros.length + '; filas externas: ' + externas.length + '; externas SIN clanTag (no cuentan para el ⚠️): ' + sinTag.length);
  var nombresHist = {};
  registros.forEach(function (r) { if (r && r.clan) nombresHist[String(r.clan).replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim()] = true; });
  L('Nombres de clan en su historial: ' + (Object.keys(nombresHist).join(' | ') || '(ninguno)'));

  var acum = _indiceClanesVacio_();
  if (registros.length) _indiceClanesAgregar_(acum, '#' + tagNorm, registros);
  var sospechosos = {};
  try { sospechosos = _alertasClanesSospechosos_(_getRivalesYConflicto(true)); } catch (e2) { L('No se pudo leer rivales/Conflictos: ' + e2.message); }
  var previo = _alertasClanesCargar_();
  var claves = Object.keys(acum.clanes);
  L('Clanes externos con clanTag: ' + claves.length);
  claves.forEach(function (c) {
    var sosp = sospechosos[cleanTag(c)];
    var enAlertas = !!(previo && previo.clanes && previo.clanes[c]);
    L('  ' + c + ' «' + acum.clanes[c].nombre + '»: sospechoso hoy = ' + (sosp ? 'SÍ (' + sosp.tipos.join('+') + ')' : 'no') + '; clan en alertas = ' + (enAlertas ? 'sí' : 'no'));
  });
  var pj = previo && previo.jugadores ? previo.jugadores['#' + tagNorm] : null;
  L('Archivo de alertas: ' + (previo ? 'existe (actualizado ' + (previo.actualizado || '?') + ', índice ' + (previo.indiceActualizado || '?') + ')' : 'NO existe') + '; el jugador ' + (pj ? 'FIGURA con ' + Object.keys(pj.clanes || {}).join(', ') : 'NO figura'));
  var rivalesNombres = [];
  for (var t in sospechosos) rivalesNombres.push(sospechosos[t].nombre + ' (#' + t + ', ' + sospechosos[t].tipos.join('+') + ')');
  L('Clanes sospechosos hoy (' + rivalesNombres.length + '): ' + rivalesNombres.join(' | '));
  if (!externas.length) L('CONCLUSIÓN: sin filas externas con clanTag el ⚠️ no puede salir; el aviso «clan rival» viene del nombre del clan en «Nuevos». Hay que volver a capturar a este jugador con Tampermonkey (Miembros nuevos) con el script actual.');
  else if (!claves.length) L('CONCLUSIÓN: sus filas externas no traen clanTag.');
  else if (!claves.some(function (c) { return sospechosos[cleanTag(c)]; })) L('CONCLUSIÓN: ninguno de sus clanes externos es sospechoso por Tag hoy; el aviso por nombre puede ser un falso positivo (otro clan con el mismo nombre).');
  else if (!pj) L('CONCLUSIÓN: tiene clanes sospechosos pero no figura en las alertas: correr actualizarAlertasClanesSospechosos().');
  else L('CONCLUSIÓN: figura en las alertas; si no sale el ⚠️, revisa la sesión de admin y la caché (60 s) o recarga con Ctrl+F5.');
}
