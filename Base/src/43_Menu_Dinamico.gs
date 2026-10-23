// ==============================================================================
// 43_Menu_Dinamico.gs
// Índice de contenido del bot y del panel web (reemplaza la hoja Menú): Docs de Drive (Estático) + Información sobre el clan y Mensajes (Dinámico); se guarda en Drive y caché. [→ Contexto_Base_Web.md §43B001]
// ==============================================================================

// ----- Funciones manuales / punto de entrada -----

// Wrapper manual: refresca el índice con syncPlantillasDesdeDrive() y _actualizarMenuDinamico(); ya no escribe ninguna hoja. [→ Contexto_Base_Web.md §43B002]
function actualizarMenuSheet() {
  syncPlantillasDesdeDrive();
  _actualizarMenuDinamico();
}

// ---------------------------------------------------------------------------
// Sincronización de plantillas desde Drive (carpeta raíz + 5 subcarpetas) al índice; nombre de Doc "Categoría - Subcategoría - Clan"; renombrado automático del formato antiguo. [→ Contexto_Base_Web.md §43B003]
// ---------------------------------------------------------------------------
function syncPlantillasDesdeDrive() {
  var ss = _getSs();

  var est = _leerEntradasEstaticasDrive(ss);
  if (!est) return;

  function clave(cat, sub, clan) { return cat + '||' + sub + '||' + clan; }
  var entradas = est.entradas;
  var orden    = est.orden;

  var totalDocsValidos = orden.length;
  if (totalDocsValidos === 0) {
    Logger.log('[Plantillas] Sin documentos válidos encontrados.');
  }

  // Preservar las entradas Dinámico ya guardadas (no se relee Mensajes aquí).
  var preservadas = _leerEntradasIndiceGuardadoPorTipo('Dinámico');
  for (var p = 0; p < preservadas.length; p++) {
    var e  = preservadas[p];
    var k2 = clave(e.categoria, e.subcategoria, e.clan);
    if (!entradas[k2]) {
      entradas[k2] = e;
      orden.push(k2);
    }
  }

  _actualizarIndiceContenido(ss, entradas, orden);
  Logger.log('[Plantillas] Sincronizados ' + totalDocsValidos + ' documentos desde Drive hacia el índice de contenido.');
}

// ----- Funciones internas / helpers -----




// Núcleo compartido: ordena las entradas ya resueltas por Extra y hoja Clan y las guarda como índice (Drive + caché). [→ Contexto_Base_Web.md §43B004]
function _actualizarIndiceContenido(ss, entradas, orden) {
  if (orden.length === 0) {
    Logger.log('[Índice] Sin datos — índice sin cambios.');
    return [];
  }
  var lista = _ordenarEntradasIndice(ss, orden.map(function(k) { return entradas[k]; }));
  var indice = [];
  for (var i = 0; i < lista.length; i++) {
    var e = lista[i];
    indice.push({
      categoria:    e.categoria,
      subcategoria: e.subcategoria,
      clan:         e.clan,
      tipo:         e.tipo,
      contenido:    (e.contenido !== undefined) ? e.contenido : '',
      docId:        e.docId || ''
    });
  }
  _guardarIndiceContenido(indice);
  Logger.log('[Índice] Guardado con ' + indice.length + ' entradas.');
  return indice;
}

// Refresca las entradas Dinámico (Mensajes + hoja Clan) preservando las Estático; se ejecuta tras runPendientesYMensajes(). [→ Contexto_Base_Web.md §43B005]
function _actualizarMenuDinamico() {
  var ss = _getSs();

  function clave(cat, sub, clan) { return cat + '||' + sub + '||' + clan; }

  var entradas = {};
  var orden    = [];

  // 1) Entradas Estático ya frescas en el índice (prioridad, igual que antes).
  var estaticas = _leerEntradasIndiceGuardadoPorTipo('Estático');
  if (estaticas.length === 0) {
    Logger.log('[Índice] No hay entradas Estático guardadas: se reconstruye todo el índice.');
    _reconstruirIndiceContenido();
    return;
  }
  for (var e0 = 0; e0 < estaticas.length; e0++) {
    var e  = estaticas[e0];
    var k0 = clave(e.categoria, e.subcategoria, e.clan);
    if (!entradas[k0]) {
      entradas[k0] = e;
      orden.push(k0);
    }
  }

  // 2) y 3) Información sobre el clan + Mensajes.
  _agregarEntradasDinamicas(ss, entradas, orden);

  _actualizarIndiceContenido(ss, entradas, orden);
}

// Intenta renombrar un Doc de formato antiguo "Clan - Categoría" a "Categoría - Subcategoría - Clan"; devuelve el nombre nuevo o null. [→ Contexto_Base_Web.md §43B006]
function _renombrarDocFormatoAntiguo(ss, file, clan, categoria) {
  var catNorm  = categoria.trim().toLowerCase();
  var clanNorm = clan.trim().toLowerCase();
  var subcategoria = null;

  // 1. Intentar buscar en el índice guardado (sin reconstruir: esta función corre DENTRO de la lectura
  // de Drive que usa la reconstrucción del índice).
  var guardado = _leerIndiceGuardado() || [];
  for (var i = 0; i < guardado.length; i++) {
    if (String(guardado[i].categoria || '').trim().toLowerCase() === catNorm &&
        String(guardado[i].clan || '').trim().toLowerCase() === clanNorm) {
      subcategoria = String(guardado[i].subcategoria || '').trim();
      break;
    }
  }

  // 2. Fallback: mapa estático basado en la estructura conocida del sistema
  //    Clan específico → Subcategoría = 'Particular'
  //    Clan familia/comunidad → Subcategoría según Categoría
  if (!subcategoria) {
    var CLANES_PARTICULARES = [
      'grupo乂terna™', 'grupoxterna™2', 'grupoxterna™3', 'mini乂ternas™'
    ];
    var CLANES_COMUNIDAD = [
      'ᴳ乂ᵀ ⚜️ familia terna', 'familia terna'
    ];
    var MAPA_SUBCATEGORIA_FALLBACK = {
      'bienvenida':          { particular: 'Particular', comunidad: 'Particular' },
      'descripción':         { particular: 'Particular', comunidad: 'Chat General',
                               comunidades: { 'Comunidad': true, 'Detectives': true, 'RoyaleAPI': true } },
      'defensas de barcos':  { particular: 'Comunidad', comunidad: 'Comunidad' },
      'día de guerra':       { particular: 'Comunidad', comunidad: 'Comunidad' },
      'etiqueta de miembro': { particular: 'Particular', comunidad: 'Comunidad' },
      'celular':             { particular: 'Particular', comunidad: 'Chat General' },
      'mensaje de guerra':   { particular: 'Particular', comunidad: 'Chat General' },
      'información del clan':{ particular: 'Terna',      comunidad: 'Vetado' },
      'información sobre mí':{ particular: 'Terna',      comunidad: 'Terna' },
    };

    var esParticular = CLANES_PARTICULARES.indexOf(clanNorm) >= 0;
    var entrada = MAPA_SUBCATEGORIA_FALLBACK[catNorm];
    if (entrada) {
      subcategoria = esParticular ? entrada.particular : entrada.comunidad;
    }
    // Para Descripción con subcategorías múltiples, intentar inferir por nombre del clan
    if (catNorm === 'descripción' && !esParticular) {
      var clanLow = clanNorm;
      if (clanLow.indexOf('detective') >= 0)      subcategoria = 'Detectives';
      else if (clanLow.indexOf('royale') >= 0)    subcategoria = 'RoyaleAPI';
      else if (clanLow.indexOf('comunidad') >= 0) subcategoria = 'Comunidad';
      else                                         subcategoria = 'Chat General';
    }
  }

  if (!subcategoria) {
    Logger.log('[Plantillas] No se pudo determinar subcategoría para renombrar: "' + clan + ' - ' + categoria + '"');
    return null;
  }

  var nuevoNombre = categoria + ' - ' + subcategoria + ' - ' + clan;
  try {
    file.setName(nuevoNombre);
    Logger.log('[Plantillas] Renombrado: "' + clan + ' - ' + categoria + '" → "' + nuevoNombre + '"');
    return nuevoNombre;
  } catch(e) {
    Logger.log('[Plantillas] Error al renombrar "' + file.getName() + '": ' + e.message);
    return null;
  }
}

// Lee la hoja Extra y devuelve { valorLower -> índice } para 'categoria' o 'subcategoria'. [→ Contexto_Base_Web.md §43B007]
function _getOrdenExtra(ss, tipo) {
  var sh = ss.getSheetByName(CFG.SHEETS.EXTRA);
  var mapa = {};
  if (!sh || sh.getLastRow() < 2) return mapa;
  var colIdx = (tipo === 'subcategoria') ? 12 : 11; // 0-based
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 13).getValues();
  var orden = 0;
  for (var i = 0; i < data.length; i++) {
    var v = String(data[i][colIdx] || '').trim();
    if (v && mapa[v.toLowerCase()] === undefined) {
      mapa[v.toLowerCase()] = orden++;
    }
  }
  return mapa;
}

// Lee la hoja Clan y devuelve { nombreClanLower -> índice } según el orden de filas. [→ Contexto_Base_Web.md §43B008]
function _getOrdenClanHoja(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  var mapa = {};
  if (!sh || sh.getLastRow() < 2) return mapa;
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  for (var i = 0; i < data.length; i++) {
    var v = String(data[i][2] || '').trim();
    if (v) mapa[v.toLowerCase()] = i;
  }
  return mapa;
}





// ==============================================================================
// ÍNDICE DE CONTENIDO
// ------------------------------------------------------------------------------
// Dónde vive el índice (caché 6 h → Indice_Contenido.json en Drive → reconstrucción) y qué entradas guarda; ver AVISOS ABIERTOS / FASE B en 09_API_ClashRoyale.gs. [→ Contexto_Base_Web.md §43B009]
// ==============================================================================
var INDICE_CONTENIDO_FILE       = 'Indice_Contenido.json';
var INDICE_CONTENIDO_CACHE_META = 'IDX_CONT_META';
var INDICE_CONTENIDO_CACHE_TTL  = 21600; // 6 h, máximo de CacheService
var INDICE_CONTENIDO_CHUNK      = 24000; // caracteres por parte (peor caso UTF-8: 96 KB)

// Devuelve el índice completo: caché → Drive → reconstrucción desde las fuentes. [→ Contexto_Base_Web.md §43B010]
function _getIndiceContenido() {
  var idx = _leerIndiceContenidoDeCache();
  if (idx && idx.length) return idx;

  idx = _leerIndiceContenidoDeDrive();
  if (idx && idx.length) {
    _guardarIndiceContenidoEnCache(JSON.stringify(idx));
    return idx;
  }

  Logger.log('[Índice] No hay índice en caché ni en Drive: se reconstruye desde las fuentes.');
  return _reconstruirIndiceContenido();
}

// Entradas del índice de un tipo ('Estático' o 'Dinámico'); reconstruye el índice si no existe. [→ Contexto_Base_Web.md §43B011]
function _leerEntradasIndicePorTipo(tipo) {
  var todo = _getIndiceContenido();
  var out = [];
  for (var i = 0; i < todo.length; i++) {
    if (todo[i].tipo === tipo) out.push(todo[i]);
  }
  return out;
}

// Persiste el índice en Drive y caché; nunca lanza error. [→ Contexto_Base_Web.md §43B012]
function _guardarIndiceContenido(lista) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(INDICE_CONTENIDO_FILE);
    var contenido = JSON.stringify({ _ts: Date.now(), entradas: lista });
    if (files.hasNext()) {
      files.next().setContent(contenido);
      while (files.hasNext()) files.next().setTrashed(true); // duplicados
    } else {
      folder.createFile(INDICE_CONTENIDO_FILE, contenido, MimeType.PLAIN_TEXT);
    }
  } catch (e) {
    Logger.log('[Índice] Error guardando el índice en Drive: ' + e.message);
  }
  _guardarIndiceContenidoEnCache(JSON.stringify(lista));
}

function _guardarIndiceContenidoEnCache(json) {
  try {
    var cache = CacheService.getScriptCache();
    var ts = String(Date.now());
    var n = Math.max(1, Math.ceil(json.length / INDICE_CONTENIDO_CHUNK));
    var partes = {};
    for (var i = 0; i < n; i++) {
      partes['IDX_CONT_' + ts + '_' + i] = json.substr(i * INDICE_CONTENIDO_CHUNK, INDICE_CONTENIDO_CHUNK);
    }
    cache.putAll(partes, INDICE_CONTENIDO_CACHE_TTL);
    cache.put(INDICE_CONTENIDO_CACHE_META, JSON.stringify({ ts: ts, n: n }), INDICE_CONTENIDO_CACHE_TTL);
  } catch (e) {
    Logger.log('[Índice] No se pudo guardar el índice en caché: ' + e.message);
  }
}

function _leerIndiceContenidoDeCache() {
  try {
    var cache = CacheService.getScriptCache();
    var meta = cache.get(INDICE_CONTENIDO_CACHE_META);
    if (!meta) return null;
    var m = JSON.parse(meta);
    var claves = [];
    for (var i = 0; i < m.n; i++) claves.push('IDX_CONT_' + m.ts + '_' + i);
    var got = cache.getAll(claves);
    var partes = [];
    for (var j = 0; j < claves.length; j++) {
      var v = got[claves[j]];
      if (v === undefined || v === null) return null; // alguna parte venció
      partes.push(v);
    }
    return JSON.parse(partes.join(''));
  } catch (e) {
    return null;
  }
}

function _leerIndiceContenidoDeDrive() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(INDICE_CONTENIDO_FILE);
    if (!files.hasNext()) return null;
    var parsed = JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));
    return (parsed && parsed.entradas instanceof Array) ? parsed.entradas : null;
  } catch (e) {
    Logger.log('[Índice] Error leyendo el índice desde Drive: ' + e.message);
    return null;
  }
}

// Reconstruye el índice desde las fuentes reales; prioridad Estático > Información sobre el clan > Mensajes. [→ Contexto_Base_Web.md §43B013]
function _reconstruirIndiceContenido() {
  var ss = _getSs();
  var est = _leerEntradasEstaticasDrive(ss);
  if (!est) {
    Logger.log('[Índice] Sin acceso a las carpetas de Drive: no se reconstruye el índice.');
    return _leerIndiceGuardado() || [];
  }
  var entradas = est.entradas;
  var orden    = est.orden;
  _agregarEntradasDinamicas(ss, entradas, orden);
  return _actualizarIndiceContenido(ss, entradas, orden);
}

// Devuelve el índice guardado (caché → Drive) sin reconstruir; null si no existe. [→ Contexto_Base_Web.md §43B014]
function _leerIndiceGuardado() {
  var idx = _leerIndiceContenidoDeCache();
  if (idx && idx.length) return idx;
  idx = _leerIndiceContenidoDeDrive();
  if (idx && idx.length) return idx;
  return null;
}

// Como _leerEntradasIndicePorTipo() pero sin reconstruir: devuelve [] si no hay índice guardado. [→ Contexto_Base_Web.md §43B015]
function _leerEntradasIndiceGuardadoPorTipo(tipo) {
  var todo = _leerIndiceGuardado() || [];
  var out = [];
  for (var i = 0; i < todo.length; i++) {
    if (todo[i].tipo === tipo) out.push(todo[i]);
  }
  return out;
}

// Manual: fuerza la reconstrucción del índice desde Drive, Clan y Mensajes (ejecutar una vez tras instalar esta versión). [→ Contexto_Base_Web.md §43B016]
function inicializarIndiceContenido() {
  var idx = _reconstruirIndiceContenido();
  Logger.log('[Índice] Listo: ' + idx.length + ' entradas.');
}

// ----- Helpers extraídos (antes vivían dentro de otras funciones) -----

// Lee los Docs de la carpeta raíz de plantillas y subcarpetas; devuelve {entradas, orden} o null si no pudo abrir ninguna carpeta. [→ Contexto_Base_Web.md §43B017]
function _leerEntradasEstaticasDrive(ss) {
  // Carpeta raíz "Plantillas" + sus 5 subcarpetas (Torneos y sorteos, Otras,
  // Mazos, Descripciones, Bienvenidas). Una carpeta que falle al abrirse se
  // omite (con log) sin cortar el resto — ver _getCarpetasPlantillas().
  var carpetas = _getCarpetasPlantillas();
  if (carpetas.length === 0) {
    Logger.log('[Plantillas] No se pudo abrir ninguna carpeta (ni la raíz ni las subcarpetas). Se omite la sincronización.');
    return null;
  }

  // Junta los Google Docs de la raíz + las 5 subcarpetas en un solo array
  // antes de procesarlos, para que el resto de la función (parseo,
  // renombrado automático, etc.) no cambie: sigue siendo un único recorrido
  // secuencial, solo que la fuente ahora son varias carpetas en vez de una.
  var todosLosArchivos = [];
  for (var c = 0; c < carpetas.length; c++) {
    var iterArchivos = carpetas[c].getFilesByType(MimeType.GOOGLE_DOCS);
    while (iterArchivos.hasNext()) todosLosArchivos.push(iterArchivos.next());
  }

  function clave(cat, sub, clan) { return cat + '||' + sub + '||' + clan; }
  var entradas = {};
  var orden    = [];

  for (var idxArch = 0; idxArch < todosLosArchivos.length; idxArch++) {
    var f = todosLosArchivos[idxArch];
    var nombre = f.getName();

    // Detectar y migrar formato antiguo "Clan - Categoría" (exactamente 1 separador " - ")
    var partes = nombre.split(' - ');
    if (partes.length === 2) {
      // Formato antiguo: intentar renombrar buscando subcategoría en el índice
      var nuevoNombre = _renombrarDocFormatoAntiguo(ss, f, partes[0].trim(), partes[1].trim());
      if (nuevoNombre) {
        nombre = nuevoNombre;
        partes = nombre.split(' - ');
      }
    }

    if (partes.length < 3) {
      Logger.log('[Plantillas] Ignorado (no cumple estructura "Categoría - Subcategoría - Clan"): ' + nombre);
      continue;
    }

    var categoria    = partes[0].trim();
    var subcategoria = partes[1].trim();
    var clan         = partes.slice(2).join(' - ').trim(); // por si el clan tiene " - "

    if (!categoria || !subcategoria || !clan) {
      Logger.log('[Plantillas] Ignorado (parte vacía): ' + nombre);
      continue;
    }

    var contenido = '';
    try {
      var docPlantilla = DocumentApp.openById(f.getId());
      // PF186 (23-oct-2026, pedido de la usuaria): en los Docs de Bienvenida y Descripción, el bloque Líder / Colíderes / Administradores se reescribe con los datos reales de Directorio antes de leer el texto; solo se guarda el Doc si algo cambió. [→ Contexto_Base_Web.md §PF186]
      try {
        if (_adminDocActualizar_(docPlantilla, categoria, clan)) {
          docPlantilla.saveAndClose();
          docPlantilla = DocumentApp.openById(f.getId());
        }
      } catch (eAdm) {
        Logger.log('[Plantillas] No se pudo actualizar la administración de "' + nombre + '": ' + eAdm.message);
      }
      contenido = docPlantilla.getBody().getText().trim();
    } catch(e2) {
      Logger.log('[Plantillas] Error leyendo "' + nombre + '": ' + e2.message);
      continue;
    }
    if (!contenido) continue;

    // Prioridad: el primer Doc de una misma clave gana; se guardan contenido y docId (permite al panel web armar el link de exportación a PDF). [→ Contexto_Base_Web.md §43B018]
    var k = clave(categoria, subcategoria, clan);
    if (!entradas[k]) {
      entradas[k] = { categoria: categoria, subcategoria: subcategoria, clan: clan, tipo: 'Estático', contenido: contenido, docId: f.getId() };
      orden.push(k);
    }
  }

  return { entradas: entradas, orden: orden };
}

// Agrega las entradas Dinámico (Información sobre el clan y Mensajes) a entradas/orden sin pisar claves ya presentes. [→ Contexto_Base_Web.md §43B019]
function _agregarEntradasDinamicas(ss, entradas, orden) {
  function clave(cat, sub, clan) { return cat + '||' + sub + '||' + clan; }

  // Paso 2: Información sobre el clan se construye directo desde la hoja Clan (hasta el 19/08/2026 lo armaba generarTodosMensajes()). [→ Contexto_Base_Web.md §43B020]
  var clanOrdenInfo        = _getOrdenClanHoja(ss);
  var nombresClanTernaInfo = _getNombresClanesOrdenados(ss, clanOrdenInfo);
  var dataClanInfo         = _getDatosClanHoja(ss);
  for (var ci1 = 0; ci1 < nombresClanTernaInfo.length; ci1++) {
    var clanNombreInfo = nombresClanTernaInfo[ci1];
    var infoClan = dataClanInfo[clanNombreInfo.toLowerCase()];
    if (!infoClan) continue;
    var k1 = clave('Información sobre el clan', infoClan.subcategoria || 'Terna', clanNombreInfo);
    if (!entradas[k1]) {
      entradas[k1] = {
        categoria:    'Información sobre el clan',
        subcategoria: infoClan.subcategoria || 'Terna',
        clan:         clanNombreInfo,
        tipo:         'Dinámico',
        contenido:    _formatearInfoClan(infoClan)
      };
      orden.push(k1);
    }
  }

  // Paso 3: Mensajes fresco → Dinámico solo si la clave no está cubierta; FIX 28-sep-2026: el contenido se lee con MC (Mensajes pasó a 15 columnas) en vez de índice fijo. [→ Contexto_Base_Web.md §43B021]
  var shMsg = ss.getSheetByName(CFG.SHEETS.MENSAJES);
  if (shMsg && shMsg.getLastRow() >= 2) {
    var dataMsg = shMsg.getRange(2, 1, shMsg.getLastRow() - 1, MENSAJES_TOTAL_COLS).getValues();
    for (var j = 0; j < dataMsg.length; j++) {
      var cat2  = String(dataMsg[j][MC.CATEGORIA    - 1] || '').trim();
      var sub2  = String(dataMsg[j][MC.SUBCATEGORIA - 1] || '').trim();
      var clan2 = String(dataMsg[j][MC.CLAN         - 1] || '').trim();
      var cont2 = String(dataMsg[j][MC.CONTENIDO    - 1] || '').trim();
      if (!cat2 || !sub2 || !clan2) continue;
      var k2 = clave(cat2, sub2, clan2);
      if (!entradas[k2]) {
        entradas[k2] = { categoria: cat2, subcategoria: sub2, clan: clan2, tipo: 'Dinámico', contenido: cont2 };
        orden.push(k2);
      }
    }
  }

}

// Ordena una lista de entradas por Extra (Categoría → Subcategoría) y hoja Clan; devuelve la misma lista ordenada. [→ Contexto_Base_Web.md §43B022]
function _ordenarEntradasIndice(ss, lista) {
  var categoriaOrden    = _getOrdenExtra(ss, 'categoria');
  var subcategoriaOrden = _getOrdenExtra(ss, 'subcategoria');
  var clanOrden         = _getOrdenClanHoja(ss);

  // Ordenar respetando Extra (Categoría → Subcategoría) y hoja Clan
  lista.sort(function(a, b) {
    var oCatA = categoriaOrden[a.categoria.toLowerCase()];
    var oCatB = categoriaOrden[b.categoria.toLowerCase()];
    if (oCatA === undefined) oCatA = 9999;
    if (oCatB === undefined) oCatB = 9999;
    if (oCatA !== oCatB) return oCatA - oCatB;

    var oSubA = subcategoriaOrden[a.subcategoria.toLowerCase()];
    var oSubB = subcategoriaOrden[b.subcategoria.toLowerCase()];
    if (oSubA === undefined) oSubA = 9999;
    if (oSubB === undefined) oSubB = 9999;
    if (oSubA !== oSubB) return oSubA - oSubB;

    var oClanA = clanOrden[a.clan.toLowerCase()];
    var oClanB = clanOrden[b.clan.toLowerCase()];
    if (oClanA === undefined) oClanA = 9999;
    if (oClanB === undefined) oClanB = 9999;
    return oClanA - oClanB;
  });
  return lista;
}