// ==============================================================================
// 13_Inactivos_Vetados.gs
// Vistas derivadas del Directorio: hojas Inactivos, Vetados y Multicuentas.
// ==============================================================================

// ----- Variables y constantes -----

// HOJA ASCENSOS — registro histórico de cambios de rango (Miembro/Veterano/ [→ Contexto_Base_Web.md §13B001]
var ASC = {
  NUM:1, TAG:2, NOMBRE:3, NOM_MULTI:4, INICIALES:5, PERMISO:6, INACTIVIDAD:7,
  FECHA:8, CLAN:9, CLAN_TAG:10, LIDER:11, AUTOR:12, RANGO:13, RANGO_2:14,
  TIPO:15, ESTADO:16, COMENTARIO:17,
  ESTADO_PROPUESTA:18
};

var ASCENSOS_TOTAL_COLS = 18;

// Valores válidos de ASC.ESTADO_PROPUESTA -- ver dropdown en
// _aplicarFormatoFilaAscenso() (24_Historial_Ascensos.gs).
var ASC_ESTADO_PROPUESTA_VALORES = ['Planificado', 'Realizado'];

// RED DE SEGURIDAD (14-ago-2026, pedido explícito del usuario) — Celular de [→ Contexto_Base_Web.md §13B002]
// El mapa CELULARES_RESPALDO_MANUAL_ ya no esta en el codigo (repo publico): vive en la Script Property CELULARES_RESPALDO_MANUAL_JSON y se lee con
// _getCelularesRespaldoManual_() (01_Config_Global.gs) [→ Contexto_Base_Web.md §PF048]

// RED DE SEGURIDAD (14-ago-2026, pedido explícito del usuario) — "el código [→ Contexto_Base_Web.md §13B003]
var NOMBRE_JSON_VETADOS_CONFIRMADOS_ = 'ClanSystem_Backup_VetadosConfirmados.json';

/**
 * _tagEstaVetadoConfirmado(tag) [→ Contexto_Base_Web.md §13B004]
 */
var _cacheVetadosConfirmados_ = null;

// ----- Funciones internas / helpers -----

function _construirFilaInactiva(tag, existing, csvRow, tagMulticuenta, multiData, colIdxMap, playersRow, linksRow, inactivoPropio) {
  // Construye una fila para un jugador inactivo (no está en ningún clan Terna via API). [→ Contexto_Base_Web.md §13B005]
  var iCelular  = (colIdxMap && colIdxMap.celular  !== undefined) ? colIdxMap.celular  : (IC.CELULAR  - 1);
  var iNomMulti = (colIdxMap && colIdxMap.nomMulti !== undefined) ? colIdxMap.nomMulti : (IC.NOM_MULTI- 1);
  var iNombre   = (colIdxMap && colIdxMap.nombre   !== undefined) ? colIdxMap.nombre   : (IC.NOMBRE   - 1);
  var fila;
  if (existing) {
    // FASE B4 (16/07/2026): antes, `fila = existing.slice(0)` asumía que [→ Contexto_Base_Web.md §13B006]
    fila = _reconstruirFilaDCDesdeFisico(existing, playersRow, linksRow);
    // Normalizar Prefijo/Celular a Number aunque la fila se copie tal cual [→ Contexto_Base_Web.md §13B007]
    var prefExist = soloDigitos(fila[DC.PREFIJO - 1]);
    var celExist  = soloDigitos(fila[DC.CELULAR - 1]);
    // FALLBACK AL CSV (mismo criterio que _construirFila() para activos, [→ Contexto_Base_Web.md §13B008]
    if (!prefExist && csvRow && csvRow.prefijo) prefExist = soloDigitos(csvRow.prefijo);
    if (!celExist  && csvRow && csvRow.celular) celExist  = soloDigitos(csvRow.celular);
    fila[DC.PREFIJO - 1] = prefExist ? Number(prefExist) : '';
    fila[DC.CELULAR - 1] = celExist  ? Number(celExist)  : '';
    // Razón: si la celda ya tenía un valor inválido heredado ('Sí'/'No'/
    // texto cruzado), se limpia aquí mismo (autocorrección).
    if (!esRazonValida(fila[DC.RAZON - 1])) fila[DC.RAZON - 1] = '';
  } else {
    fila = new Array(DIR_TOTAL_COLS).fill('');
    fila[DC.TAG - 1] = tag;
    if (csvRow) {
      fila[DC.NOMBRE - 1]     = csvRow.nombre || '';
      fila[DC.NOM_MULTI - 1]  = csvRow.nom_multi || '';
      fila[DC.PERMISO - 1]    = csvRow.permiso || '';
      fila[DC.PREFIJO - 1]    = soloDigitos(csvRow.prefijo) ? Number(soloDigitos(csvRow.prefijo)) : '';
      fila[DC.CELULAR - 1]    = soloDigitos(csvRow.celular) ? Number(soloDigitos(csvRow.celular)) : '';
      fila[DC.WSP_G - 1]      = csvRow.wsp_g || '';
      fila[DC.ETIQUETA - 1]   = csvRow.etiqueta || '';
      fila[DC.VETADO - 1]     = csvRow.vetado || '';
      // Razón: solo se acepta si es una razón reconocida ('Sí'/'No' u otro
      // valor cruzado se descarta).
      fila[DC.RAZON - 1]      = esRazonValida(csvRow.razon) ? csvRow.razon : '';
      fila[DC.NIVEL - 1]      = csvRow.nivel || '';
      fila[DC.NIVEL2 - 1]     = csvRow.nivel2 || '';
      fila[DC.COPAS - 1]      = csvRow.copas || '';
      fila[DC.V_GUERRA - 1]   = csvRow.v_guerra || '';
      fila[DC.RANGO - 1]      = csvRow.rango || '';
      fila[DC.CLAN - 1]       = csvRow.clan || '';
      fila[DC.CLAN_TAG - 1]   = csvRow.clan_tag || '';
      fila[DC.INACTIVIDAD - 1]= csvRow.inactividad || '';

      var fIngText = csvRow.fechaIng || '';
      fila[DC.FECHA_ING - 1] = _parseStringDate(fIngText) || '';
      // Vigencia y Fecha_lim: mismo fallback que Fecha_ing — antes se [→ Contexto_Base_Web.md §13B009]
      fila[DC.VIGENCIA  - 1] = _parseStringDate(csvRow.vigencia) || '';
      fila[DC.FECHA_LIM - 1] = _parseStringDate(csvRow.fechaLim) || '';
      // Columnas de edición manual — sin esto se perdían al reconstruir la
      // hoja desde cero (ver mismo fallback en _construirFila para activos).
      if (csvRow.admin)    fila[DC.ADMIN    - 1] = String(csvRow.admin).trim();
      if (csvRow.cat_disp) fila[DC.CAT_DISP - 1] = String(csvRow.cat_disp).trim();
      // Préstamo: columna de edición manual — se restaura desde CSV si no hay existing
      if (csvRow.prestamo) fila[DC.PRESTAMO - 1] = String(csvRow.prestamo).trim();

      // Campos que solo vienen de /players: igual que en _construirFila, [→ Contexto_Base_Web.md §13B010]
      fila[DC.ANTIGUEDAD       - 1] = csvRow.antiguedad       || '';
      fila[DC.ARENA            - 1] = csvRow.arena            || '';
      fila[DC.COPAS_MAX        - 1] = csvRow.copas_max        || '';
      fila[DC.VICTORIAS        - 1] = csvRow.victorias        || '';
      fila[DC.DERROTAS         - 1] = csvRow.derrotas         || '';
      fila[DC.BATALLAS         - 1] = csvRow.batallas         || '';
      fila[DC.RACHA            - 1] = csvRow.racha            || '';
      fila[DC.CL_LIGA          - 1] = csvRow.cl_liga          || '';
      fila[DC.CL_TROFEOS       - 1] = csvRow.cl_trofeos       || '';
      fila[DC.CL_RANGO         - 1] = csvRow.cl_rango         || '';
      fila[DC.VICTORIAS_3C     - 1] = csvRow.victorias_3c     || '';
      fila[DC.MAX_VIC_DESAFIOS - 1] = csvRow.max_vic_desafios || '';
      fila[DC.TORNEOS          - 1] = csvRow.torneos          || '';
      fila[DC.CARTAS_DESAFIOS  - 1] = csvRow.cartas_desafios  || '';
      fila[DC.CARTAS_TORNEOS   - 1] = csvRow.cartas_torneos   || '';
      fila[DC.EMOTES           - 1] = csvRow.emotes           || '';
      fila[DC.BANNERS          - 1] = csvRow.banners          || '';
    }
  }

    // FIX (18-ago-2026, pedido explícito del usuario): cuentas de apoyo [→ Contexto_Base_Web.md §13B011]
  if (inactivoPropio) {
    var rawVetadoInact = String(inactivoPropio[IC.VETADO - 1] || '').trim();
    if (!fila[DC.VETADO - 1] && rawVetadoInact && _esSiNoOVacio(rawVetadoInact)) {
      fila[DC.VETADO - 1] = rawVetadoInact;
    }
    var rawRazonInact = String(inactivoPropio[IC.RAZON - 1] || '').trim();
    if (!fila[DC.RAZON - 1] && esRazonValida(rawRazonInact)) {
      fila[DC.RAZON - 1] = rawRazonInact;
    }
    var rawPrefInact = soloDigitos(inactivoPropio[IC.PREFIJO - 1]);
    if (!fila[DC.PREFIJO - 1] && rawPrefInact) {
      fila[DC.PREFIJO - 1] = Number(rawPrefInact);
    }
    var rawCelInact = soloDigitos(inactivoPropio[IC.CELULAR - 1]);
    if (!fila[DC.CELULAR - 1] && rawCelInact.length >= 7) {
      fila[DC.CELULAR - 1] = Number(rawCelInact);
    }
    var rawNomMultiInact = String(inactivoPropio[IC.NOM_MULTI - 1] || '').trim();
    if (!fila[DC.NOM_MULTI - 1] && rawNomMultiInact) {
      fila[DC.NOM_MULTI - 1] = rawNomMultiInact;
    }
    var rawPrestamoInact = String(inactivoPropio[IC.PRESTAMO - 1] || '').trim();
    if (!fila[DC.PRESTAMO - 1] && rawPrestamoInact) {
      fila[DC.PRESTAMO - 1] = rawPrestamoInact;
    }
  }

  var nom = existing ? (existing[iNombre]   || '') : (csvRow ? csvRow.nombre    || '' : (inactivoPropio ? inactivoPropio[IC.NOMBRE - 1]    || '' : ''));
  var cel = existing ? (existing[iCelular]  || '') : (csvRow ? csvRow.celular   || '' : (inactivoPropio ? inactivoPropio[IC.CELULAR - 1]   || '' : ''));
  var nomMulti = existing ? (existing[iNomMulti] || '') : (csvRow ? csvRow.nom_multi || '' : (inactivoPropio ? inactivoPropio[IC.NOM_MULTI - 1] || '' : ''));

  // Jugador = Nom_Multi calculado, incluso para inactivos con una sola cuenta
  fila[DC.JUGADOR - 1] = _calcJugador(tag, nom, nomMulti, cel, multiData);

  fila._clanTag = String(fila[DC.CLAN_TAG - 1] || '');
  fila[DC.ESTADO - 1] = 'Inactivo';
  fila[DC.MULTICUENTA - 1] = tagMulticuenta[tag] ? 'Sí' : 'No';

  // --- Datos frescos de /players para administradores inactivos --- [→ Contexto_Base_Web.md §13B012]
  if (CFG.CLAN_TAGS.indexOf(String(fila[DC.CLAN_TAG - 1] || '').trim()) >= 0) {
    fila[DC.CLAN - 1] = '';
    fila[DC.CLAN_TAG - 1] = '';
  }

  var esAdminInactivo = String(fila[DC.ADMIN - 1] || '').trim() === 'Sí';
  if (PLAYERS_API_ENABLED !== false || esAdminInactivo) {
    var playerDataInactivo = _getPlayerCache(tag);
    if (playerDataInactivo) {

      // 🟢 ACTUALIZACIÓN DE RANGO (role) [→ Contexto_Base_Web.md §13B013]
      if (playerDataInactivo.role) {
        fila[DC.RANGO - 1] = mapRol(playerDataInactivo.role);
      } else if (!playerDataInactivo.clan) {
        fila[DC.RANGO - 1] = '';
      }

      // 🟢 ACTUALIZACIÓN DE DONACIONES (Dadas y Recibidas)
      if (playerDataInactivo.donations !== undefined) fila[DC.DON_D - 1] = playerDataInactivo.donations; // Donaciones Dadas
      if (playerDataInactivo.donationsReceived !== undefined) fila[DC.DON_R - 1] = playerDataInactivo.donationsReceived; // Donaciones Recibidas

      if (Number(playerDataInactivo.expLevel) > 0) fila[DC.NIVEL - 1] = Number(playerDataInactivo.expLevel);

      var vgNuevoInactivo = _getVGuerra(playerDataInactivo);
      if (vgNuevoInactivo !== '') fila[DC.V_GUERRA - 1] = vgNuevoInactivo;

      var n2NuevoInactivo = _getNivel2(playerDataInactivo);
      if (n2NuevoInactivo !== '') fila[DC.NIVEL2 - 1] = n2NuevoInactivo;

      if (playerDataInactivo.trophies !== undefined) fila[DC.COPAS - 1] = playerDataInactivo.trophies;

      var antigInactivo = _getBadgeLevel(playerDataInactivo, 'YearsPlayed');
      if (antigInactivo !== '') fila[DC.ANTIGUEDAD - 1] = antigInactivo;

      if (playerDataInactivo.arena && playerDataInactivo.arena.rawName) fila[DC.ARENA - 1] = playerDataInactivo.arena.rawName;

      if (playerDataInactivo.bestTrophies          !== undefined) fila[DC.COPAS_MAX        - 1] = playerDataInactivo.bestTrophies;
      if (playerDataInactivo.wins                  !== undefined) fila[DC.VICTORIAS        - 1] = playerDataInactivo.wins;
      if (playerDataInactivo.losses                !== undefined) fila[DC.DERROTAS         - 1] = playerDataInactivo.losses;
      if (playerDataInactivo.battleCount           !== undefined) fila[DC.BATALLAS         - 1] = playerDataInactivo.battleCount;
      if (playerDataInactivo.currentWinLoseStreak  !== undefined) fila[DC.RACHA            - 1] = playerDataInactivo.currentWinLoseStreak;

      var polInactivo = playerDataInactivo.currentPathOfLegendSeasonResult || {};
      if (polInactivo.leagueNumber !== undefined) fila[DC.CL_LIGA    - 1] = polInactivo.leagueNumber;
      if (polInactivo.trophies     !== undefined) fila[DC.CL_TROFEOS - 1] = polInactivo.trophies;
      if (polInactivo.rank         !== undefined) fila[DC.CL_RANGO   - 1] = polInactivo.rank;

      if (playerDataInactivo.threeCrownWins        !== undefined) fila[DC.VICTORIAS_3C     - 1] = playerDataInactivo.threeCrownWins;
      if (playerDataInactivo.challengeMaxWins      !== undefined) fila[DC.MAX_VIC_DESAFIOS - 1] = playerDataInactivo.challengeMaxWins;
      if (playerDataInactivo.tournamentBattleCount !== undefined) fila[DC.TORNEOS          - 1] = playerDataInactivo.tournamentBattleCount;
      if (playerDataInactivo.challengeCardsWon     !== undefined) fila[DC.CARTAS_DESAFIOS  - 1] = playerDataInactivo.challengeCardsWon;
      if (playerDataInactivo.tournamentCardsWon    !== undefined) fila[DC.CARTAS_TORNEOS   - 1] = playerDataInactivo.tournamentCardsWon;

      var emotesNuevoInactivo = _getBadgeProgress(playerDataInactivo, 'EmoteCollection');
      if (emotesNuevoInactivo !== '') fila[DC.EMOTES - 1] = emotesNuevoInactivo;
      var bannersNuevoInactivo = _getBadgeProgress(playerDataInactivo, 'BannerCollection');
      if (bannersNuevoInactivo !== '') fila[DC.BANNERS - 1] = bannersNuevoInactivo;

      // 🟢 ACTUALIZACIÓN DE CLAN Y CLAN_TAG [→ Contexto_Base_Web.md §13B014]
      if (playerDataInactivo.clan) {
        fila[DC.CLAN - 1] = playerDataInactivo.clan.name || '';
        fila[DC.CLAN_TAG - 1] = playerDataInactivo.clan.tag || '';
      } else {
        fila[DC.CLAN - 1] = '';
        fila[DC.CLAN_TAG - 1] = '';
      }
    }
  }

  // Clanes_Admin: calculada, no manual (mismo criterio que en _construirFila;
  // un admin inactivo sigue mostrando sus clanes a cargo).
  fila[DC.CLANES_ADMIN - 1] = (String(fila[DC.ADMIN - 1] || '').trim() === 'Sí')
    ? _getClanesAdminTexto(fila[DC.PREFIJO - 1], fila[DC.CELULAR - 1])
    : '';

  return fila;
}

/**
 * _camposExtraInactivos() [→ Contexto_Base_Web.md §13B015]
 */
function _camposExtraInactivos() {
  var extra = [];
  for (var campo in DC) {
    if (IC[campo] === undefined) extra.push(campo);
  }
  return extra;
}

/**
 * _proyectarInactivos(r) [→ Contexto_Base_Web.md §13B016]
 */
function _proyectarInactivos(r) {
  var fila = new Array(INACTIVOS_TOTAL_COLS).fill('');
  fila[IC.NUM         - 1] = r[DC.NUM         - 1];
  fila[IC.TAG         - 1] = r[DC.TAG         - 1];
  fila[IC.NOMBRE      - 1] = r[DC.NOMBRE      - 1];
  fila[IC.JUGADOR     - 1] = r[DC.JUGADOR     - 1];
  fila[IC.NOM_MULTI   - 1] = r[DC.NOM_MULTI   - 1];
  fila[IC.PRESTAMO    - 1] = r[DC.PRESTAMO    - 1];
  fila[IC.MULTICUENTA - 1] = r[DC.MULTICUENTA - 1];
  fila[IC.CLAN        - 1] = r[DC.CLAN        - 1];
  fila[IC.CLAN_TAG    - 1] = r[DC.CLAN_TAG    - 1];
  fila[IC.RANGO       - 1] = r[DC.RANGO       - 1];
  fila[IC.LIDER       - 1] = r[DC.LIDER       - 1];
  fila[IC.PREFIJO     - 1] = r[DC.PREFIJO     - 1];
  fila[IC.CELULAR     - 1] = r[DC.CELULAR     - 1];
  fila[IC.WSP_G       - 1] = r[DC.WSP_G       - 1];
  fila[IC.ETIQUETA    - 1] = r[DC.ETIQUETA    - 1];
  fila[IC.PERMISO     - 1] = r[DC.PERMISO     - 1];
  fila[IC.INICIALES   - 1] = r[DC.INICIALES   - 1];
  fila[IC.ESTADO      - 1] = r[DC.ESTADO      - 1];
  fila[IC.ADMIN       - 1] = r[DC.ADMIN       - 1];
  fila[IC.VETADO      - 1] = r[DC.VETADO      - 1];
  fila[IC.RAZON       - 1] = r[DC.RAZON       - 1];
  fila[IC.ALERTA      - 1] = r[DC.ALERTA      - 1];
  fila[IC.FECHA_ING   - 1] = r[DC.FECHA_ING   - 1];
  fila[IC.FECHA_LIM   - 1] = r[DC.FECHA_LIM   - 1];
  fila[IC.VIGENCIA    - 1] = r[DC.VIGENCIA    - 1];
  fila[IC.INACTIVIDAD - 1] = r[DC.INACTIVIDAD - 1];
  fila[IC.RANKING     - 1] = r[DC.RANKING     - 1];
  fila[IC.RANKING_P   - 1] = r[DC.RANKING_P   - 1];
  fila[IC.COMENTARIO  - 1] = r[DC.COMENTARIO  - 1];
  return fila;
}

/**
 * _leerInactivosParaReactivacion(ss) [→ Contexto_Base_Web.md §13B017]
 */
function _leerInactivosParaReactivacion(ss) {
  var mapa = {};
  var sh = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (!sh || sh.getLastRow() < 2) return mapa;

  var lastRow = sh.getLastRow();
  var datos = sh.getRange(2, 1, lastRow - 1, INACTIVOS_TOTAL_COLS).getValues();
  var extraPorTag = _cargarExtraColsInactivos();

  for (var i = 0; i < datos.length; i++) {
    var tag = String(datos[i][IC.TAG - 1] || '').trim();
    if (!tag) continue;
    mapa[tag] = { ic: datos[i], extra: extraPorTag[tag] || null };
  }
  return mapa;
}

/**
 * _esSiNoOVacio(v) [→ Contexto_Base_Web.md §13B018]
 */
function _esSiNoOVacio(v) {
  var s = String(v || '').trim().toLowerCase();
  return s === '' || s === 'sí' || s === 'si' || s === 'no';
}

/**
 * _reconstruirExistingDesdeInactivos(icRow, extraObj) [→ Contexto_Base_Web.md §13B019]
 */
function _reconstruirExistingDesdeInactivos(icRow, extraObj) {
  var fila = new Array(DIR_TOTAL_COLS).fill('');
  for (var campo in IC) {
    var valorIC = icRow[IC[campo] - 1];
    if (campo === 'VETADO' || campo === 'PERMISO' || campo === 'ADMIN') {
      valorIC = _esSiNoOVacio(valorIC) ? valorIC : '';
    } else if (campo === 'RAZON') {
      valorIC = esRazonValida(valorIC) ? valorIC : '';
    }
    fila[DC[campo] - 1] = valorIC;
  }
  if (extraObj) {
    for (var campoExtra in extraObj) {
      if (DC[campoExtra] !== undefined) fila[DC[campoExtra] - 1] = extraObj[campoExtra];
    }
  }
  return fila;
}

/**
 * _retirarDeInactivosPorReactivacion(ss, tags) [→ Contexto_Base_Web.md §13B020]
 */
function _retirarDeInactivosPorReactivacion(ss, tags) {
  var sh = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (sh && sh.getLastRow() >= 2) {
    var tagsSet = {};
    for (var i = 0; i < tags.length; i++) tagsSet[tags[i]] = true;

    var lastRow = sh.getLastRow();
    var datos = sh.getRange(2, 1, lastRow - 1, INACTIVOS_TOTAL_COLS).getValues();
    var filasRestantes = [];
    var retiradas = 0;
    for (var i = 0; i < datos.length; i++) {
      var tg = String(datos[i][IC.TAG - 1] || '').trim();
      if (tg && tagsSet[tg]) { retiradas++; continue; }
      filasRestantes.push(datos[i]);
    }
    if (retiradas > 0) {
      for (var i = 0; i < filasRestantes.length; i++) filasRestantes[i][IC.NUM - 1] = i + 1;
      sh.getRange(2, 1, lastRow - 1, INACTIVOS_TOTAL_COLS).clearContent();
      if (filasRestantes.length > 0) {
        sh.getRange(2, 1, filasRestantes.length, INACTIVOS_TOTAL_COLS).setValues(filasRestantes);
        applyBorderCenter(sh.getRange(2, 1, filasRestantes.length, INACTIVOS_TOTAL_COLS));
      }
      Logger.log('[Inactivos] ' + retiradas + ' cuenta(s) retiradas de Inactivos por reactivación en un clan Terna.');
    }
  }
  _eliminarExtraColsInactivosPorTags(tags);
}

function _updateInactivos(ss, dirData) {
  var sh = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (!sh) return;

  // Inactivos: tiene su PROPIA estructura reducida de 29 columnas (ver [→ Contexto_Base_Web.md §13B021]

  // Mapa Tag -> fila de dirData, para saber qué tags siguen existiendo ahí
  // (y por lo tanto su estado actual manda sobre Inactivos).
  var dirPorTag = {};
  for (var i = 0; i < dirData.length; i++) {
    var tg = String(dirData[i][DC.TAG - 1] || '').trim();
    if (tg) dirPorTag[tg] = dirData[i];
  }

  // Candidatas frescas según dirData, ya proyectadas a las 29 columnas de [→ Contexto_Base_Web.md §13B022]
  var candidatas = {};
  // extrasFrescos: { Tag -> {campo: valor} } con las 31 columnas de [→ Contexto_Base_Web.md §13B023]
  var extrasFrescos = {};
  var camposExtra = _camposExtraInactivos();
  for (var i = 0; i < dirData.length; i++) {
    var r = dirData[i];
    var esAdmin = String(r[DC.ADMIN - 1] || '').trim().toLowerCase() === 'sí';
    if (esAdmin) continue; // Admins: nunca en Inactivos.

    var esInactivo = String(r[DC.ESTADO - 1]) === 'Inactivo';
    var vet = String(r[DC.VETADO - 1] || '').trim().toLowerCase();
    var esVetado = (vet === 'sí' || vet === 'si');
    var clanTagFila = String(r[DC.CLAN_TAG - 1] || '').trim();
    var activoEnVetado = (String(r[DC.ESTADO - 1]) === 'Activo') && (clanTagFila === CFG.VETADO_TAG);

    if ((esInactivo && !esVetado) || activoEnVetado) {
      var tg = String(r[DC.TAG - 1] || '').trim();
      if (tg) {
        candidatas[tg] = _proyectarInactivos(r);
        var extraObj = {};
        for (var ce = 0; ce < camposExtra.length; ce++) {
          extraObj[camposExtra[ce]] = r[DC[camposExtra[ce]] - 1];
        }
        extrasFrescos[tg] = extraObj;
      }
    }
  }
  if (Object.keys(extrasFrescos).length > 0) {
    _guardarExtraColsInactivosBatch(extrasFrescos);
  }

  // PROTECCIÓN ANTI-BORRADO: la hoja Inactivos se reconstruye a partir de la [→ Contexto_Base_Web.md §13B024]
  var filasFinalesPorTag = {};
  var huerfanosConservados = 0;
  var lastRowSh = sh.getLastRow();
  if (lastRowSh >= 2) {
    var existentes = sh.getRange(2, 1, lastRowSh - 1, INACTIVOS_TOTAL_COLS).getValues();
    for (var i = 0; i < existentes.length; i++) {
      var tg = String(existentes[i][IC.TAG - 1] || '').trim();
      if (!tg) continue;
      if (dirPorTag[tg]) continue; // su estado actual lo decide 'candidatas'
      filasFinalesPorTag[tg] = existentes[i];
      huerfanosConservados++;
    }
  }
  if (huerfanosConservados > 0) {
    Logger.log('[Inactivos] Protección anti-borrado: se conservaron ' + huerfanosConservados + ' fila(s) huérfana(s) (tags que no aparecen en los datos actuales).');
  }
  for (var tg in candidatas) filasFinalesPorTag[tg] = candidatas[tg];

  var filas = Object.keys(filasFinalesPorTag).map(function(tg) { return filasFinalesPorTag[tg]; });

  filas.sort(function(a,b) {
    var ja = String(a[IC.JUGADOR-1]||'').toLowerCase(), jb = String(b[IC.JUGADOR-1]||'').toLowerCase();
    if (ja !== jb) return ja < jb ? -1 : 1;
    return String(a[IC.NOMBRE-1]||'').toLowerCase() < String(b[IC.NOMBRE-1]||'').toLowerCase() ? -1 : 1;
  });
  for (var i = 0; i < filas.length; i++) filas[i][IC.NUM - 1] = i + 1;

  // FIX (05-ago-2026): mismo criterio que _escribirDirectorio() — resetear [→ Contexto_Base_Web.md §13B025]
  if (sh.getLastRow() >= 2) {
    sh.getRange(2, 1, sh.getLastRow() - 1, INACTIVOS_TOTAL_COLS)
      .clearContent()
      .setFontColor(null);
  }
  if (filas.length > 0) {
    sh.getRange(2, 1, filas.length, INACTIVOS_TOTAL_COLS).setValues(filas);
    applyBorderCenter(sh.getRange(2, 1, filas.length, INACTIVOS_TOTAL_COLS));
    // Fix: la hoja Inactivos nunca reaplicaba el formato de Celular al [→ Contexto_Base_Web.md §13B026]
    sh.getRange(2, IC.CELULAR, filas.length, 1).setNumberFormat('### ### ### ###');
  }
  _aplicarDropdownsInactivos(sh, filas.length);   // 👈 NUEVO
}

function _aplicarDropdownsInactivos(sh, numFilas) {
  if (numFilas === 0) return;
  var opsSiNo = SpreadsheetApp.newDataValidation().requireValueInList(['Sí','No'], true).build();
  sh.getRange(2, IC.MULTICUENTA, numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.WSP_G,       numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.ETIQUETA,    numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.PERMISO,     numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.INICIALES,   numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.ADMIN,       numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.VETADO,      numFilas, 1).setDataValidation(opsSiNo);
}

/**
 * _aplicarDropdownsVetados(sh, numFilas) [→ Contexto_Base_Web.md §13B027]
 */
function _aplicarDropdownsVetados(sh, numFilas) {
  if (numFilas === 0) return;
  var opsVia = SpreadsheetApp.newDataValidation().requireValueInList(['Web','Bot','Sheet'], true).build();
  sh.getRange(2, VC.VIA, numFilas, 1).setDataValidation(opsVia);
}

/**
 * _obtenerNomMultisAdmins() [→ Contexto_Base_Web.md §13B028]
 */
function _obtenerNomMultisAdmins() {
  var ss = _getSs();
  var shAdm = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);
  if (!shAdm || shAdm.getLastRow() < 2) return [];

  var lastRow = shAdm.getLastRow();
  var data = shAdm.getRange(2, 1, lastRow - 1, ADMINISTRADORES_TOTAL_COLS).getValues();
  var vistos = {};
  var resultado = [];
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][AC.ADMIN - 1] || '').trim() !== 'Sí') continue;
    var nm = String(data[i][AC.NOM_MULTI - 1] || '').trim();
    if (nm && !vistos[nm]) { vistos[nm] = true; resultado.push(nm); }
  }
  resultado.sort(function (a, b) { return a.localeCompare(b); });
  return resultado;
}

/**
 * _obtenerCuentasDeNomMulti(nomMulti) [→ Contexto_Base_Web.md §13B029]
 */
function _obtenerCuentasDeNomMulti(nomMulti) {
  var nm = String(nomMulti || '').trim();
  if (!nm) return [];

  var ss = _getSs();
  var hojas = [CFG.SHEETS.DIRECTORIO, CFG.SHEETS.INACTIVOS];
  var vistos = {};
  var resultado = [];

  for (var h = 0; h < hojas.length; h++) {
    var sh = ss.getSheetByName(hojas[h]);
    if (!sh || sh.getLastRow() < 2) continue;

    var datos = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
    for (var i = 0; i < datos.length; i++) {
      var nomMultiFila = String(datos[i][IC.NOM_MULTI - 1] || '').trim();
      if (nomMultiFila !== nm) continue;

      var tag = String(datos[i][IC.TAG - 1] || '').trim();
      if (!tag || vistos[tag]) continue;
      vistos[tag] = true;

      resultado.push({
        tag:     tag,
        nombre:  String(datos[i][IC.NOMBRE   - 1] || ''),
        clan:    String(datos[i][IC.CLAN     - 1] || ''),
        clanTag: String(datos[i][IC.CLAN_TAG - 1] || '')
      });
    }
  }

  return resultado;
}

/**
 * _aplicarDropdownAutorVetados(shVet, nomMultisAdmins) [→ Contexto_Base_Web.md §13B030]
 */
function _aplicarDropdownAutorVetados(shVet, nomMultisAdmins) {
  if (!shVet) return;
  var numFilas = shVet.getLastRow() - 1;
  if (numFilas < 1) return;

  if (!nomMultisAdmins || nomMultisAdmins.length === 0) {
    shVet.getRange(2, VC.AUTOR, numFilas, 1).clearDataValidations();
    return;
  }
  var dvAutor = SpreadsheetApp.newDataValidation()
    .requireValueInList(nomMultisAdmins, true)
    .setAllowInvalid(true) // no bloquear si el Autor de un veto viejo ya no es admin hoy
    .build();
  shVet.getRange(2, VC.AUTOR, numFilas, 1).setDataValidation(dvAutor);
}

// (25-sep-2026, FASE B) ClanSystem_Backup_VetadosConfirmados.json se lee y [→ Contexto_Base_Web.md §13B031]
function _cargarVetadosConfirmados_() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(NOMBRE_JSON_VETADOS_CONFIRMADOS_);
    if (files.hasNext()) {
      return JSON.parse(files.next().getBlob().getDataAsString('UTF-8')) || {};
    }
  } catch (e) {
    Logger.log('[Vetados-Registro] Error leyendo ' + NOMBRE_JSON_VETADOS_CONFIRMADOS_ + ': ' + e.message);
  }
  return {};
}

function _guardarVetadosConfirmados_(mapa) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(NOMBRE_JSON_VETADOS_CONFIRMADOS_);
    var content = JSON.stringify(mapa, null, 2);
    if (files.hasNext()) {
      files.next().setContent(content);
    } else {
      folder.createFile(NOMBRE_JSON_VETADOS_CONFIRMADOS_, content, MimeType.PLAIN_TEXT);
    }
  } catch (e) {
    Logger.log('[Vetados-Registro] Error guardando ' + NOMBRE_JSON_VETADOS_CONFIRMADOS_ + ': ' + e.message);
  }
}

/**
 * _registrarVetadoConfirmado(tag) [→ Contexto_Base_Web.md §13B032]
 */
function _registrarVetadoConfirmado(tag) {
  var t = String(tag || '').trim();
  if (!t) return;
  var mapa = _cargarVetadosConfirmados_();
  if (mapa[t]) return; // ya estaba, no reescribir el archivo sin necesidad
  mapa[t] = true;
  _guardarVetadosConfirmados_(mapa);
}

function _tagEstaVetadoConfirmado(tag) {
  if (_cacheVetadosConfirmados_ === null) _cacheVetadosConfirmados_ = _cargarVetadosConfirmados_();
  return !!_cacheVetadosConfirmados_[String(tag || '').trim()];
}

/**
 * _olvidarVetadoConfirmado(tag) [→ Contexto_Base_Web.md §13B033]
 */
function _olvidarVetadoConfirmado(tag) {
  var t = String(tag || '').trim();
  var mapa = _cargarVetadosConfirmados_();
  if (mapa[t]) {
    delete mapa[t];
    _guardarVetadosConfirmados_(mapa);
    Logger.log('[Vetados-Registro] ' + t + ' quitado manualmente del registro de vetados confirmados.');
  } else {
    Logger.log('[Vetados-Registro] ' + t + ' no estaba en el registro.');
  }
}

function _updateVetados(ss, dirData) {
  var sh = ss.getSheetByName(CFG.SHEETS.VETADOS);
  if (!sh) return;

  var dirPorTag = {};
  for (var i = 0; i < dirData.length; i++) {
    var tg = String(dirData[i][DC.TAG - 1] || '').trim();
    if (tg) dirPorTag[tg] = dirData[i];
  }

  // FIX (07-ago-2026): la columna Razón (col J, índice 9) de la hoja [→ Contexto_Base_Web.md §13B034]
  var razonManualPorTag = {};
  var autorViaFechaPorTag = {};
  var lastRowShPrevio = sh.getLastRow();
  if (lastRowShPrevio >= 2) {
    var existentesPrevio = sh.getRange(2, 1, lastRowShPrevio - 1, VETADOS_TOTAL_COLS).getValues();
    for (var i = 0; i < existentesPrevio.length; i++) {
      var tgPrevio = String(existentesPrevio[i][VC.TAG - 1] || '').trim();
      if (!tgPrevio) continue;
      var razonPrevia = existentesPrevio[i][VC.RAZON - 1];
      var yaTieneRazonNoVacia = razonManualPorTag.hasOwnProperty(tgPrevio) &&
        String(razonManualPorTag[tgPrevio] || '').trim() !== '';
      if (!yaTieneRazonNoVacia) {
        razonManualPorTag[tgPrevio] = razonPrevia;
      } else if (String(razonPrevia || '').trim() !== '') {
        // Dos filas del mismo tag con Razón NO vacía en ambas (caso raro, [→ Contexto_Base_Web.md §13B035]
        Logger.log('[Vetados] Tag duplicado con Razón en ambas filas: ' + tgPrevio +
                   '. Se conserva la última leída ("' + razonPrevia + '").');
        razonManualPorTag[tgPrevio] = razonPrevia;
      }
      // Si yaTieneRazonNoVacia es true y razonPrevia está vacía, se ignora
      // esta fila: nunca debe pisar una razón real con una vacía.

      // Autor/Vía/Fecha: mismo criterio (última fila NO vacía gana, sin
      // pisar con vacío un valor ya guardado para ese tag).
      var prevAVF = autorViaFechaPorTag[tgPrevio] || ['', '', ''];
      autorViaFechaPorTag[tgPrevio] = [
        existentesPrevio[i][VC.AUTOR - 1] || prevAVF[0],
        existentesPrevio[i][VC.VIA   - 1] || prevAVF[1],
        existentesPrevio[i][VC.FECHA - 1] || prevAVF[2]
      ];
    }
  }

  var candidatas = {};
  for (var i = 0; i < dirData.length; i++) {
    var r = dirData[i];
    var vet = String(r[DC.VETADO - 1] || '').trim().toLowerCase();
    if (vet === 'sí' || vet === 'si') {
      var tg = String(r[DC.TAG - 1] || '').trim();
      if (!tg) continue;
      // Preservar la Razón manual ya escrita en Vetados; solo si el tag [→ Contexto_Base_Web.md §13B036]
      var razonFinal = razonManualPorTag.hasOwnProperty(tg) ? razonManualPorTag[tg] : r[DC.RAZON-1];
      var avf = autorViaFechaPorTag[tg] || ['', '', ''];
      // NOTA (26-ago-2026): el encabezado de la columna 4 de Vetados es [→ Contexto_Base_Web.md §13B037]
      var filaVC = new Array(VETADOS_TOTAL_COLS).fill('');
      filaVC[VC.TAG - 1]      = r[DC.TAG-1];
      filaVC[VC.NOMBRE - 1]   = r[DC.NOMBRE-1];
      filaVC[VC.NOM_MULTI - 1] = r[DC.NOM_MULTI-1];
      filaVC[VC.CLAN - 1]     = r[DC.CLAN-1];
      filaVC[VC.RANGO - 1]    = r[DC.RANGO-1];
      filaVC[VC.INICIALES-1]  = r[DC.INICIALES-1];
      filaVC[VC.PERMISO - 1]  = r[DC.PERMISO-1];
      filaVC[VC.ESTADO - 1]   = r[DC.ESTADO-1];
      filaVC[VC.RAZON - 1]    = razonFinal;
      filaVC[VC.AUTOR - 1]    = avf[0];
      filaVC[VC.VIA - 1]      = avf[1];
      filaVC[VC.FECHA - 1]    = avf[2];
      candidatas[tg] = filaVC;
    }
  }

  // FIX (14-ago-2026, pedido explícito del usuario): "la hoja Vetados debe [→ Contexto_Base_Web.md §13B038]
  var shInactivosParaVetados = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (shInactivosParaVetados && shInactivosParaVetados.getLastRow() >= 2) {
    var datosInactivosVet = shInactivosParaVetados.getRange(
      2, 1, shInactivosParaVetados.getLastRow() - 1, INACTIVOS_TOTAL_COLS).getValues();
    for (var iv = 0; iv < datosInactivosVet.length; iv++) {
      var ri = datosInactivosVet[iv];
      var vetI = String(ri[IC.VETADO - 1] || '').trim().toLowerCase();
      if (vetI !== 'sí' && vetI !== 'si') continue;
      var tgI = String(ri[IC.TAG - 1] || '').trim();
      // Si dirData ya trajo este tag (caso: activo en el clan Vetado, o
      // admin inactivo), esa fuente manda — no se pisa lo ya calculado.
      if (!tgI || candidatas[tgI]) continue;
      var razonFinalI = razonManualPorTag.hasOwnProperty(tgI) ? razonManualPorTag[tgI] : ri[IC.RAZON - 1];
      var avfI = autorViaFechaPorTag[tgI] || ['', '', ''];
      // Mismo criterio que arriba: columna "Nom_Multi" = valor IC.NOM_MULTI.
      var filaVCI = new Array(VETADOS_TOTAL_COLS).fill('');
      filaVCI[VC.TAG - 1]      = ri[IC.TAG-1];
      filaVCI[VC.NOMBRE - 1]   = ri[IC.NOMBRE-1];
      filaVCI[VC.NOM_MULTI - 1] = ri[IC.NOM_MULTI-1];
      filaVCI[VC.CLAN - 1]     = ri[IC.CLAN-1];
      filaVCI[VC.RANGO - 1]    = ri[IC.RANGO-1];
      filaVCI[VC.INICIALES-1]  = ri[IC.INICIALES-1];
      filaVCI[VC.PERMISO - 1]  = ri[IC.PERMISO-1];
      filaVCI[VC.ESTADO - 1]   = ri[IC.ESTADO-1];
      filaVCI[VC.RAZON - 1]    = razonFinalI;
      filaVCI[VC.AUTOR - 1]    = avfI[0];
      filaVCI[VC.VIA - 1]      = avfI[1];
      filaVCI[VC.FECHA - 1]    = avfI[2];
      candidatas[tgI] = filaVCI;
    }
  }

  // RED DE SEGURIDAD anti-desbaneo (ver CELULARES_RESPALDO_MANUAL_ / [→ Contexto_Base_Web.md §13B039]
  for (var tgConfirmar in candidatas) _registrarVetadoConfirmado(cleanTag(tgConfirmar));

  // PROTECCIÓN ANTI-BORRADO (igual criterio que en Inactivos): un tag solo [→ Contexto_Base_Web.md §13B040]
  var filasFinalesPorTag = {};
var tagsHuerfanos = [];
var lastRowSh = sh.getLastRow();
if (lastRowSh >= 2) {
  var existentes = sh.getRange(2, 1, lastRowSh - 1, VETADOS_TOTAL_COLS).getValues();
  for (var i = 0; i < existentes.length; i++) {
    var tg = String(existentes[i][VC.TAG - 1] || '').trim();
    if (!tg) continue;
    if (dirPorTag[tg]) continue;
    filasFinalesPorTag[tg] = existentes[i];
    tagsHuerfanos.push(tg);
  }
}
if (tagsHuerfanos.length > 0) {
  Logger.log('[Vetados] Protección anti-borrado: se conservaron ' + tagsHuerfanos.length +
    ' fila(s) huérfana(s) (tags que no aparecen en el Directorio actual): ' + tagsHuerfanos.join(', ') + '.');
}
  for (var tg in candidatas) filasFinalesPorTag[tg] = candidatas[tg];

  var filas = Object.keys(filasFinalesPorTag).map(function(tg) { return filasFinalesPorTag[tg]; });

  filas.sort(function(a, b) {
    var razA = String(a[VC.RAZON - 1] || '').toLowerCase(), razB = String(b[VC.RAZON - 1] || '').toLowerCase();
    if (razA !== razB) return razA < razB ? -1 : 1;
    var clanA = String(a[VC.CLAN - 1] || '').toLowerCase(), clanB = String(b[VC.CLAN - 1] || '').toLowerCase();
    if (clanA !== clanB) return clanA < clanB ? -1 : 1;
    var nomA = String(a[VC.NOMBRE - 1] || '').toLowerCase(), nomB = String(b[VC.NOMBRE - 1] || '').toLowerCase();
    return nomA < nomB ? -1 : 1;
  });

  for (var i = 0; i < filas.length; i++) filas[i][VC.NUM - 1] = i + 1;
  if (sh.getLastRow() >= 2) sh.getRange(2, 1, sh.getLastRow() - 1, VETADOS_TOTAL_COLS).clearContent();
  if (filas.length > 0) {
    sh.getRange(2, 1, filas.length, VETADOS_TOTAL_COLS).setValues(filas);
    applyBorderCenter(sh.getRange(2, 1, filas.length, VETADOS_TOTAL_COLS));
    var dataRange = sh.getRange(2, 1, filas.length, VETADOS_TOTAL_COLS), colRazon = colLetter(VC.RAZON);
    var rules = [];
    for (var razonClave in CFG.VETADOS_RAZON_BG) {
      rules.push(
        SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied('=$' + colRazon + '2="' + razonClave + '"')
          .setBackground(CFG.VETADOS_RAZON_BG[razonClave])
          .setRanges([dataRange])
          .build()
      );
    }
    // Cualquier razón no reconocida (texto libre) cae en un color pastel neutro,
    // en vez de quedar sin color.
    var comparaciones = Object.keys(CFG.VETADOS_RAZON_BG).map(function(r) {
      return '$' + colRazon + '2="' + r + '"';
    }).join(',');
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=AND($' + colRazon + '2<>"",NOT(OR(' + comparaciones + ')))')
        .setBackground('#e0e0e0')
        .setRanges([dataRange])
        .build()
    );
    _tryCondFmt(sh, rules);
  }
  // FASE 4 (25-ago-2026): dropdown de Vía sobre las filas recién escritas.
  _aplicarDropdownsVetados(sh, filas.length);
  // FASE 4 — WEB (Sección 7.5.1): dropdown de Autor, recalculado con la
  // lista vigente de Nom_Multi de administradores.
  _aplicarDropdownAutorVetados(sh, _obtenerNomMultisAdmins());
}

function sincronizarRazonHaciaVetados(shDir, row) {
  var tag = String(shDir.getRange(row, DC.TAG).getValue() || '').trim(), razon = String(shDir.getRange(row, IC.RAZON).getValue() || '').trim();
  if (!tag) return;
  // 'Sí'/'No' pertenecen a la columna "Vetado", nunca a "Razón". Si alguien [→ Contexto_Base_Web.md §13B041]
  if (razon === 'Sí' || razon === 'No') {
    razon = '';
    shDir.getRange(row, IC.RAZON).setValue('');
  }
  var shVet = _getSs().getSheetByName(CFG.SHEETS.VETADOS);
  if (!shVet || shVet.getLastRow() < 2) return;
  // Usar VC.* (nunca índices sueltos) para que el orden real de columnas
  // de Vetados nunca vuelva a desalinear qué campo se lee/escribe aquí.
  var data = shVet.getRange(2, 1, shVet.getLastRow() - 1, VETADOS_TOTAL_COLS).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][VC.TAG - 1] || '') === tag) {
      if (String(data[i][VC.RAZON - 1] || '').trim() === razon) return;
      shVet.getRange(i + 2, VC.RAZON).setValue(razon); return;
    }
  }
  var dirRow = shDir.getRange(row, 1, 1, DIR_SHEET_COLS).getValues()[0];
  // NOTA (26-ago-2026): columna "Nom_Multi" (encabezado) = valor IC.NOM_MULTI [→ Contexto_Base_Web.md §13B042]
  var filaNuevaVC = new Array(VETADOS_TOTAL_COLS).fill('');
  filaNuevaVC[VC.NUM - 1]      = shVet.getLastRow();
  filaNuevaVC[VC.TAG - 1]      = tag;
  filaNuevaVC[VC.NOMBRE - 1]   = dirRow[IC.NOMBRE-1];
  filaNuevaVC[VC.NOM_MULTI - 1] = dirRow[IC.NOM_MULTI-1];
  filaNuevaVC[VC.CLAN - 1]     = dirRow[IC.CLAN-1];
  filaNuevaVC[VC.RANGO - 1]    = dirRow[IC.RANGO-1];
  filaNuevaVC[VC.INICIALES-1]  = dirRow[IC.INICIALES-1];
  filaNuevaVC[VC.PERMISO - 1]  = dirRow[IC.PERMISO-1];
  filaNuevaVC[VC.ESTADO - 1]   = dirRow[IC.ESTADO-1];
  filaNuevaVC[VC.RAZON - 1]    = razon;
  shVet.appendRow(filaNuevaVC);
}

function sincronizarRazonHaciaDirectorio(shVet, row) {
  var tag = String(shVet.getRange(row, VC.TAG).getValue() || '').trim(), razon = String(shVet.getRange(row, VC.RAZON).getValue() || '').trim();
  if (!tag) return;
  // Misma protección que en sincronizarRazonHaciaVetados: 'Sí'/'No' no son
  // razones válidas, son valores cruzados de la columna "Vetado".
  if (razon === 'Sí' || razon === 'No') {
    razon = '';
    shVet.getRange(row, VC.RAZON).setValue('');
  }
  var shDir = _getSs().getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return;
  var data = shDir.getRange(2, DC.TAG, shDir.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0] || '') === tag) {
      if (String(shDir.getRange(i + 2, IC.RAZON).getValue() || '').trim() === razon) return;
      shDir.getRange(i + 2, IC.RAZON).setValue(razon); return;
    }
  }
}

/**
 * _upsertVetadoDesdeWeb(tag, filaOrigenIC, razon, autor, via, fecha) [→ Contexto_Base_Web.md §13B043]
 */
function _upsertVetadoDesdeWeb(tag, filaOrigenIC, razon, autor, via, fecha) {
  var shVet = _getSs().getSheetByName(CFG.SHEETS.VETADOS);
  if (!shVet) return;

  var lastRow = shVet.getLastRow();
  if (lastRow >= 2) {
    var tags = shVet.getRange(2, VC.TAG, lastRow - 1, 1).getValues();
    for (var i = 0; i < tags.length; i++) {
      if (String(tags[i][0] || '').trim() === tag) {
        shVet.getRange(i + 2, VC.RAZON).setValue(razon);
        return;
      }
    }
  }

  var filaVC = new Array(VETADOS_TOTAL_COLS).fill('');
  filaVC[VC.NUM - 1]       = shVet.getLastRow();
  filaVC[VC.TAG - 1]       = tag;
  filaVC[VC.NOMBRE - 1]    = filaOrigenIC[IC.NOMBRE    - 1];
  filaVC[VC.NOM_MULTI - 1] = filaOrigenIC[IC.NOM_MULTI - 1];
  filaVC[VC.CLAN - 1]      = filaOrigenIC[IC.CLAN      - 1];
  filaVC[VC.RANGO - 1]     = filaOrigenIC[IC.RANGO     - 1];
  filaVC[VC.INICIALES - 1] = filaOrigenIC[IC.INICIALES - 1];
  filaVC[VC.PERMISO - 1]   = filaOrigenIC[IC.PERMISO   - 1];
  filaVC[VC.ESTADO - 1]    = filaOrigenIC[IC.ESTADO    - 1];
  filaVC[VC.RAZON - 1]     = razon;
  filaVC[VC.AUTOR - 1]     = autor;
  filaVC[VC.VIA - 1]       = via;
  filaVC[VC.FECHA - 1]     = fecha;
  shVet.appendRow(filaVC);
  // Fecha real (Date), formateada dd/mm/yyyy HH:mm:ss en la celda — NO el [→ Contexto_Base_Web.md §13B044]
  _setDateCell(shVet, shVet.getLastRow(), VC.FECHA, fecha, 'dd/mm/yyyy HH:mm:ss');
}

/**
 * _webAgregarComentarioVeto(filaOrigenIC, autor, fecha, razon, comentarioAdmin) [→ Contexto_Base_Web.md §13B045]
 */
function _webAgregarComentarioVeto(filaOrigenIC, autor, fecha, razon, comentarioAdmin) {
  var shCom = _getSs().getSheetByName(CFG.SHEETS.COMENTARIOS);
  if (!shCom) return;

  var fechaLarga = _formatFechaLargaEs(fecha);
  var texto = 'Vetado desde la web por ' + autor + ' el ' + fechaLarga +
              '. Razón: ' + razon + '. ' + (comentarioAdmin || '');

  var filaCMC = new Array(COMENTARIOS_TOTAL_COLS).fill('');
  filaCMC[CMC.NUM - 1]        = shCom.getLastRow();
  filaCMC[CMC.FECHA - 1]      = fecha;
  filaCMC[CMC.TAG - 1]        = filaOrigenIC[IC.TAG      - 1];
  filaCMC[CMC.NOMBRE - 1]     = filaOrigenIC[IC.NOMBRE   - 1];
  filaCMC[CMC.NOM_MULTI - 1]  = filaOrigenIC[IC.NOM_MULTI- 1];
  filaCMC[CMC.CLAN_TAG - 1]   = filaOrigenIC[IC.CLAN_TAG - 1];
  filaCMC[CMC.CLAN - 1]       = filaOrigenIC[IC.CLAN     - 1];
  filaCMC[CMC.RANGO - 1]      = filaOrigenIC[IC.RANGO    - 1];
  filaCMC[CMC.LIDER - 1]      = filaOrigenIC[IC.LIDER    - 1];
  filaCMC[CMC.COMENTARIO - 1] = texto;
  shCom.appendRow(filaCMC);
  _setDateCell(shCom, shCom.getLastRow(), CMC.FECHA, fecha, 'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
}

// =============================================================================

// _updateMulticuentas(ss, dirData) [→ Contexto_Base_Web.md §13B046]
function _updateMulticuentas(ss, dirData) {
  var sh = ss.getSheetByName(CFG.SHEETS.MULTICUENTAS);
  if (!sh) return;

  // Total columnas de Multicuentas
  var MULTI_TOTAL_COLS = 15;

  // Construir mapa del Directorio por tag para acceso rápido
  var dirMap = {};
  for (var i = 0; i < dirData.length; i++) {
    var tg = String(dirData[i][DC.TAG - 1] || '').trim();
    if (tg) dirMap[tg] = dirData[i];
  }

  // FIX (07-ago-2026): "mientras un jugador con varias cuentas asociadas al [→ Contexto_Base_Web.md §13B047]
  var inactivosPorTag = _leerInactivosParaReactivacion(ss);
  var inactivosMap = {}; // tag -> fila reconstruida en formato DC (60 cols)
  for (var tagInact in inactivosPorTag) {
    var entryInact = inactivosPorTag[tagInact];
    inactivosMap[tagInact] = _reconstruirExistingDesdeInactivos(entryInact.ic, entryInact.extra);
  }

  // Por Celular, ¿el grupo tiene al menos una cuenta Activa en un clan [→ Contexto_Base_Web.md §13B048]
  var celularTieneActivoTerna = {};
  for (var i = 0; i < dirData.length; i++) {
    var rAct = dirData[i];
    var celAct = String(rAct[DC.CELULAR - 1] || '').replace(/\D/g, '');
    if (!celAct) continue;
    var clanTagAct = String(rAct[DC.CLAN_TAG - 1] || '').trim();
    if (CFG.TERNA_TAGS.indexOf(clanTagAct) >= 0) celularTieneActivoTerna[celAct] = true;
  }

  var candidatos = dirData.slice();
  for (var tagCand in inactivosMap) {
    if (dirMap[tagCand]) continue; // no debería ocurrir, por las dudas
    candidatos.push(inactivosMap[tagCand]);
  }

  // Fase 10 (17/07/2026): Multicuentas no filtraba Vetado en absoluto — [→ Contexto_Base_Web.md §13B049]
  var filas = candidatos.filter(function(r) {
    if (String(r[DC.MULTICUENTA - 1]) !== 'Sí') return false;

    var estadoFila    = String(r[DC.ESTADO - 1] || '').trim();
    var esActivoFila  = estadoFila === 'Activo';

    if (!esActivoFila) {
      // Cuenta Inactiva: solo se muestra si su Celular tiene al menos una [→ Contexto_Base_Web.md §13B050]
      var celFila = String(r[DC.CELULAR - 1] || '').replace(/\D/g, '');
      return !!(celFila && celularTieneActivoTerna[celFila]);
    }

    var vet = String(r[DC.VETADO - 1] || '').trim().toLowerCase();
    var esVetado = (vet === 'sí' || vet === 'si');
    if (!esVetado) return true;
    var clanTag = String(r[DC.CLAN_TAG - 1] || '').trim();
    return CFG.TERNA_TAGS.indexOf(clanTag) >= 0;
  }).map(function(r) {
    var tg = String(r[DC.TAG - 1] || '').trim();
    var dirRow = dirMap[tg] || r;
    // ACTUALIZADO (16/07/2026): este comentario advertía que dirRow no [→ Contexto_Base_Web.md §13B051]
    return [
      '',                          // N° (se asigna después)
      tg,                          // Tag
      dirRow[DC.NOMBRE - 1],       // Nombre
      dirRow[DC.NOM_MULTI - 1],    // Nom_Multi
      dirRow[DC.PRESTAMO - 1],     // Préstamo (07-ago-2026: reemplaza a Jugador)
      dirRow[DC.CLAN - 1],         // Clan
      dirRow[DC.RANGO - 1],        // Rango
      dirRow[DC.NIVEL - 1],        // Nivel
      dirRow[DC.COPAS - 1],        // Copas
      dirRow[DC.V_GUERRA - 1],     // V_Guerra
      dirRow[DC.INICIALES - 1],    // Iniciales
      dirRow[DC.PERMISO - 1],      // Permiso
      dirRow[DC.INACTIVIDAD - 1],  // Inactividad(d)
      dirRow[DC.ALERTA - 1],       // Alerta
      dirRow[DC.ESTADO - 1]        // Estado
    ];
  });

  for (var i = 0; i < filas.length; i++) filas[i][0] = i + 1;

  // Limpiar todas las filas previas (hasta máximo de columnas posible)
  if (sh.getLastRow() >= 2) sh.getRange(2, 1, sh.getLastRow() - 1, MULTI_TOTAL_COLS).clearContent();
  if (filas.length > 0) {
    sh.getRange(2, 1, filas.length, MULTI_TOTAL_COLS).setValues(filas);
    applyBorderCenter(sh.getRange(2, 1, filas.length, MULTI_TOTAL_COLS));

    // Fix: Multicuentas nunca reaplicaba el formato numérico de Nivel/ [→ Contexto_Base_Web.md §13B052]
    var COLS_NUMERICAS_MULTI_ = [8, 9, 10]; // Nivel, Copas, V_Guerra
    for (var cm = 0; cm < COLS_NUMERICAS_MULTI_.length; cm++) {
      sh.getRange(2, COLS_NUMERICAS_MULTI_[cm], filas.length, 1).setNumberFormat('#,##0');
    }

    // Limpiar bordes en filas vacías residuales
    var maxRows = sh.getMaxRows();
    if (maxRows > filas.length + 1) {
      try {
        sh.getRange(filas.length + 2, 1, maxRows - filas.length - 1, MULTI_TOTAL_COLS)
          .setBorder(false, false, false, false, false, false);
      } catch(e) {}
    }

    var dataRange = sh.getRange(2, 1, filas.length, MULTI_TOTAL_COLS);
    var colRango  = colLetter(7);  // Rango en col 7
    var colEstado = colLetter(15); // Estado en col 15
    // IMPORTANTE: el color por Rango NUNCA debe aplicarse a filas Inactivas. [→ Contexto_Base_Web.md §13B053]
    var rules = [
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colEstado + '2="Activo",$' + colRango + '2="Líder")').setBackground(CFG.COLORES.LIDER_BG).setRanges([dataRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colEstado + '2="Activo",$' + colRango + '2="Colíder")').setBackground(CFG.COLORES.COLIDER_BG).setRanges([dataRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colEstado + '2="Activo",$' + colRango + '2="Veterano")').setBackground(CFG.COLORES.VETERANO_BG).setRanges([dataRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colEstado + '2="Activo",$' + colRango + '2="Miembro")').setBackground(CFG.COLORES.MIEMBRO_BG).setRanges([dataRange]).build(),
    ];
    _tryCondFmt(sh, rules);
  }
}