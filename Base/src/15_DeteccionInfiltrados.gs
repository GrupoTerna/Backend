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
 * `soloClan` (6-nov-2026, §PF367): la tarjeta «Detección de infiltrados» de admin.html solo revisa clanes; la pastilla «¿Infiltrado?» de la ficha cubre al jugador.
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

  var rivalesYConflicto = _getRivalesYConflicto();

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
    return {
      ok: true,
      tipo: 'clan',
      clan: { tag: '#' + tagNorm, nombre: clanInfo.name, miembros: clanInfo.memberList.length },
      esRivalTemporada: esRivalClan,
      infoRival: esRivalClan ? rivalesYConflicto[tagNorm] : null,
      coincidencias: coincidenciasClan
    };
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
 * Devuelve un arreglo por clan, del más reciente al más antiguo: { tag, nombre, semanas, ultima:{temporada,semana}, primera:{temporada,semana}, infoRival }.
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
    var punto = { temporada: temp, semana: sem };
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
 * _getRivalesYConflicto() [→ Contexto_Base_Web.md §15B006]
 */
function _getRivalesYConflicto() {
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
