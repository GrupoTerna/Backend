// 15_DeteccionInfiltrados.gs
// Cruza miembros ACTUALES de los 4 clanes Terna contra los clanes rivales
// de la temporada de guerra vigente (currentriverrace, 09_API_ClashRoyale.gs)
// más una lista MANUAL de clanes en conflicto, mantenida en la hoja
// CFG.SHEETS.CONFLICTOS ('Conflictos', ver _setupConflictos() en
// 02_Setup_Hojas.gs).
// FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje). [→ Contexto_Base_Web.md §15B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Índice de clanes externos: generar (§PF369)
//  Parte 2 — Funciones que no se corren a mano
//    - Infiltrados: búsqueda desde la web de admin (en el orden de la llamada)
//    - Clanes: ficha y veto desde «Buscar clan» de la web de admin (§PF368)
//    - Índice de clanes externos: armar, guardar y consultar (§PF369)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// Columnas de la hoja 'Conflictos' (ver _setupConflictos(), 02_Setup_Hojas.gs). [→ Contexto_Base_Web.md §15B002]
var CFC = { TAG:1, NOMBRE:2, MOTIVO:3 };

var CFC_TOTAL_COLS = 3;

// Índice de clanes externos (§PF369): por cada clan donde algún jugador nuestro jugó guerra sin ser de la Familia, qué Tags de jugador estuvieron ahí. Se arma leyendo los JSON individuales de RoyaleAPI.
var INDICE_CLANES_JSON = 'Indice_Clanes_Externos.json';
var INDICE_CLANES_CSV = 'Indice_Clanes_Externos.csv';
var INDICE_CLANES_PRESUPUESTO_MS = 270000;
var _indiceClanesCache_ = undefined;

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Índice de clanes externos: generar (§PF369) -----

/**
 * generarIndiceClanesExternos() [→ Contexto_Base_Web.md §PF369]
 * Lee los JSON individuales de RoyaleAPI y arma el índice «clan externo → Tags de los jugadores nuestros que estuvieron ahí»: Indice_Clanes_Externos.json (carpeta Otros, con el detalle de cada jugador) e Indice_Clanes_Externos.csv (un clan por fila, para leerlo en una hoja).
 * Son más de 2 000 archivos y Apps Script corta a los 6 minutos, así que trabaja con un presupuesto de tiempo y guarda lo avanzado: si queda incompleto, vuelve a correrla y continúa donde se quedó. Cuando termina, la siguiente corrida empieza de cero con los archivos actuales.
 * «Buscar clan» de la web de admin usa este índice para listar a los jugadores nuestros que pasaron por cualquier clan (§PF369).
 */
function generarIndiceClanesExternos() {
  var inicio = Date.now();
  var carpeta = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
  var archivos = _getHistorialGuerraDriveIndexPorTag(carpeta);
  var tags = Object.keys(archivos).sort();

  var estado = _cargarIndiceClanes_();
  var continuaba = !!(estado && !estado.completo && estado.procesados);
  if (!continuaba) estado = _indiceClanesVacio_();

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
  estado.completo = listos >= tags.length;
  estado.actualizado = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm');
  if (!estado.generado) estado.generado = estado.actualizado;
  estado.jugadoresLeidos = listos;

  if (estado.completo) {
    estado.procesados = {};
    estado.totalClanes = Object.keys(estado.clanes).length;
    _guardarIndiceClanes_(estado);
    _saveCSVToDrive(INDICE_CLANES_CSV, _encodeCSV(_indiceClanesAFilasCsv_(estado)));
    Logger.log('[IndiceClanes] COMPLETO: ' + listos + ' jugadores leídos, ' + estado.totalClanes + ' clanes externos' + (estado.ilegibles.length ? ', ' + estado.ilegibles.length + ' JSON ilegibles' : '') + '. Archivos: ' + INDICE_CLANES_JSON + ' (Otros) y ' + INDICE_CLANES_CSV + '.');
  } else {
    _guardarIndiceClanes_(estado);
    Logger.log('[IndiceClanes] INCOMPLETO: ' + listos + ' de ' + tags.length + ' jugadores leídos (' + hechosAhora + ' en esta corrida). Vuelve a correr generarIndiceClanesExternos() para continuar.');
  }
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

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

  // 1) Probar como CLAN.
  var clanInfo = null;
  try {
    clanInfo = _apiGet('/clans/' + encodeTag('#' + tagNorm));
  } catch (eClan) {
    Logger.log('[DeteccionInfiltrados] /clans falló para ' + tagNorm + ': ' + eClan.message);
  }

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
      coincidencias: coincidenciasClan
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
 * Ficha de un clan para «Buscar clan» de admin.html: una sola consulta a /clans/<Tag> más la lista de rivales y conflicto. No cruza los miembros con nuestro roster (eso lo hace la pastilla «¿Infiltrado?» con _buscarInfiltrado(tag, true)).
 * Respuesta: { ok, clan:{ tag, nombre, miembros, puntos, trofeosGuerra, ubicacion, tipo, copasRequeridas, esNuestro }, esRivalTemporada, infoRival } o { ok:false, error }.
 */
function _webAdminBuscarClan(token, tag) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var tagNorm = cleanTag(tag);
  if (!tagNorm || tagNorm.length < 3) return { ok: false, error: 'Ingresa un Tag de clan (con o sin #).' };

  var clanInfo = null;
  try {
    clanInfo = _apiGet('/clans/' + encodeTag('#' + tagNorm));
  } catch (eClan) {
    Logger.log('[BuscarClan] /clans falló para ' + tagNorm + ': ' + eClan.message);
  }
  if (!clanInfo || !clanInfo.name) {
    return { ok: false, error: 'No encontré ningún clan con ese Tag. Verifica que esté bien escrito (con o sin #). Si es un jugador, búscalo en «Buscar miembro».' };
  }

  var rivalesYConflicto = _getRivalesYConflicto(true);
  var infoRival = rivalesYConflicto[tagNorm] || null;
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
      esNuestro: _esClanPropio_(tagNorm)
    },
    esRivalTemporada: !!infoRival,
    infoRival: infoRival
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

  var clanInfo = null;
  try {
    clanInfo = _apiGet('/clans/' + encodeTag('#' + tagNorm));
  } catch (eClan) {
    Logger.log('[VetarClan] /clans falló para ' + tagNorm + ': ' + eClan.message);
  }
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
 * _getClanesRivalesTemporadaActual() [→ Contexto_Base_Web.md §15B003]
 */
function _getClanesRivalesTemporadaActual() {
  var rivales = {};
  var propiosNorm = {};
  for (var p = 0; p < CFG.CLAN_TAGS.length; p++) {
    propiosNorm[cleanTag(CFG.CLAN_TAGS[p])] = true;
  }

  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTagPropio = CFG.TERNA_TAGS[i];
    var clanData = _getClanCache(clanTagPropio);
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

// ----- Índice de clanes externos: armar, guardar y consultar (§PF369) -----

/**
 * _indiceClanesVacio_() [→ Contexto_Base_Web.md §PF369]
 * Estado inicial del índice. `procesados` (Tags de jugador ya leídos) solo existe mientras la generación está incompleta.
 */
function _indiceClanesVacio_() {
  return { version: 1, generado: '', actualizado: '', completo: false, jugadoresLeidos: 0, totalClanes: 0, ilegibles: [], procesados: {}, clanes: {} };
}

/**
 * _indiceClanesAgregar_(indice, tagJugador, registros) [→ Contexto_Base_Web.md §PF369]
 * Suma al índice los clanes externos (filas `externa: true` con clanTag, §PF340) de un jugador. Por cada clan guarda al jugador una sola vez, con cuántas semanas jugó ahí y su primera y última semana. El nombre del clan es el de la semana más reciente vista en cualquier jugador (los clanes cambian de nombre); los otros nombres quedan en `nombres`.
 */
function _indiceClanesAgregar_(indice, tagJugador, registros) {
  var tagJ = '#' + cleanTag(tagJugador);
  var porClan = {};
  for (var i = 0; i < (registros || []).length; i++) {
    var r = registros[i];
    if (!r || r.externa !== true || !r.clanTag) continue;
    var tagC = '#' + cleanTag(r.clanTag);
    var temp = Number(r.temporadaInterna), sem = Number(r.semana);
    var tRoy = Number(r.temporadaRoyaleAPI);
    var punto = { temporada: temp, semana: sem, temporadaRoyaleApi: isNaN(tRoy) ? null : tRoy };
    var nombre = String(r.clan || '').replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim();
    var g = porClan[tagC];
    if (!g) { g = porClan[tagC] = { vistas: {}, semanas: 0, primera: null, ultima: null, nombre: '' }; }
    var claveSemana = temp + '|' + sem;
    if (!g.vistas[claveSemana]) { g.vistas[claveSemana] = true; g.semanas++; }
    if (!g.primera || temp < g.primera.temporada || (temp === g.primera.temporada && sem < g.primera.semana)) g.primera = punto;
    if (!g.ultima || temp > g.ultima.temporada || (temp === g.ultima.temporada && sem > g.ultima.semana)) { g.ultima = punto; if (nombre) g.nombre = nombre; }
    else if (!g.nombre && nombre) g.nombre = nombre;
  }
  for (var tagClan in porClan) {
    var d = porClan[tagClan];
    var c = indice.clanes[tagClan];
    if (!c) { c = indice.clanes[tagClan] = { nombre: '', nombres: [], jugadores: [], _ref: null }; }
    if (d.nombre && c.nombres.indexOf(d.nombre) < 0) c.nombres.push(d.nombre);
    var u = d.ultima;
    if (d.nombre && (!c._ref || u.temporada > c._ref.temporada || (u.temporada === c._ref.temporada && u.semana >= c._ref.semana))) {
      c.nombre = d.nombre;
      c._ref = { temporada: u.temporada, semana: u.semana };
    }
    c.jugadores.push({ tag: tagJ, semanas: d.semanas, primera: d.primera, ultima: d.ultima });
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
 * Jugadores nuestros que estuvieron en un clan externo, según el índice completo: [{ tag, semanas, primera, ultima }]. Devuelve null si el índice no existe o está incompleto (distinto de [] = el clan no figura en el índice). El índice se lee una vez por ejecución.
 */
function _indiceClanesJugadoresDe_(tagClanNorm) {
  if (_indiceClanesCache_ === undefined) _indiceClanesCache_ = _cargarIndiceClanes_();
  var ind = _indiceClanesCache_;
  if (!ind || !ind.completo || !ind.clanes) return null;
  var c = ind.clanes['#' + cleanTag(tagClanNorm)];
  return c ? c.jugadores : [];
}

/**
 * _exMiembrosDesdeIndice_(jugadoresIndice, tagsActuales, yaListados) [→ Contexto_Base_Web.md §PF369]
 * Pasa los jugadores del índice de clanes externos a filas de «Jugadores nuestros que pasaron por este clan»: { origen, tag, nombre, clan, razon, semanas }. Cada jugador sale una vez por cada hoja del roster donde figura (Directorio, Inactivos o Vetados); si no figura en ninguna, sale con origen «Fuera del roster» y sin nombre (el índice guarda solo Tags). Se omiten los miembros actuales del clan (`tagsActuales`, ya salen en la tabla de coincidencias) y lo que ya estaba en `yaListados` (misma hoja y mismo Tag), a lo que se le agrega `semanas`. Devuelve la lista completa, ordenada por Origen (Directorio, Inactivos, Vetados, Fuera del roster) y luego por semanas.
 */
function _exMiembrosDesdeIndice_(jugadoresIndice, tagsActuales, yaListados) {
  var salida = (yaListados || []).slice();
  var semanasPorTag = {};
  for (var a = 0; a < jugadoresIndice.length; a++) semanasPorTag[cleanTag(jugadoresIndice[a].tag)] = jugadoresIndice[a].semanas;
  var porClave = {};
  for (var b = 0; b < salida.length; b++) {
    var tb = cleanTag(salida[b].tag);
    porClave[salida[b].origen + '|' + tb] = salida[b];
    if (semanasPorTag[tb] !== undefined) salida[b].semanas = semanasPorTag[tb];
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
      var nueva = { origen: mapas[m].origen, tag: '#' + tagJ, nombre: String(fila[mapas[m].nombre - 1] || ''), clan: String(fila[mapas[m].clan - 1] || ''), razon: String(fila[mapas[m].razon - 1] || ''), semanas: jugadoresIndice[i].semanas };
      porClave[nueva.origen + '|' + tagJ] = nueva;
      salida.push(nueva);
    }
    if (!hallado) salida.push({ origen: 'Fuera del roster', tag: '#' + tagJ, nombre: '', clan: '', razon: '', semanas: jugadoresIndice[i].semanas });
  }
  var orden = { 'Directorio': 0, 'Inactivos': 1, 'Vetados': 2, 'Fuera del roster': 3 };
  salida.sort(function (x, y) {
    var ox = orden[x.origen] !== undefined ? orden[x.origen] : 9, oy = orden[y.origen] !== undefined ? orden[y.origen] : 9;
    return (ox - oy) || ((y.semanas || 0) - (x.semanas || 0)) || (x.tag < y.tag ? -1 : x.tag > y.tag ? 1 : 0);
  });
  return salida;
}
