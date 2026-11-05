// 15_DeteccionInfiltrados.gs
// Cruza miembros ACTUALES de los 4 clanes Terna contra los clanes rivales
// de la temporada de guerra vigente (currentriverrace, 09_API_ClashRoyale.gs)
// más una lista MANUAL de clanes en conflicto, mantenida en la hoja
// CFG.SHEETS.CONFLICTOS ('Conflictos', ver _setupConflictos() en
// 02_Setup_Hojas.gs).
// FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje). [→ Contexto_Base_Web.md §15B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que no se corren a mano
//    - Infiltrados: búsqueda desde la web de admin (en el orden de la llamada)
//    - Clanes: ficha y veto desde «Buscar clan» de la web de admin (§PF368)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// Columnas de la hoja 'Conflictos' (ver _setupConflictos(), 02_Setup_Hojas.gs). [→ Contexto_Base_Web.md §15B002]
var CFC = { TAG:1, NOMBRE:2, MOTIVO:3 };

var CFC_TOTAL_COLS = 3;

// =============================================================================
// PARTE 1 — FUNCIONES QUE NO SE CORREN A MANO
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
    if (CFG.VETADO_TAG && cleanTag(CFG.VETADO_TAG) === tagNorm) {
      var tagsActuales = {};
      for (var q = 0; q < clanInfo.memberList.length; q++) tagsActuales[cleanTag(clanInfo.memberList[q].tag)] = true;
      respuestaClan.esClanVetado = true;
      respuestaClan.exMiembros = _rosterPasoPorClanVetado_(clanInfo.name, tagsActuales);
    }
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
