// =============================================================================
// 08_GitHub.gs
// Sincronización con GitHub (repo GrupoTerna/Backend).
//
//  - _githubSincronizar_(nombre): sube a GitHub, en UN solo commit, los .gs
//    sueltos (Base/src/ o Generador/src/), el consolidado de respaldo
//    (respaldo/<nombre>.gs), INDICE_FUNCIONES.md y LEEME_IA.md.
//  - _githubTraerAProyectoApps_('Base'): lee Base/src/ de GitHub y deja el
//    proyecto de Apps Script de Base EXACTAMENTE igual (reemplazo atómico).
//
// TOKEN: nunca va en el código. Se guarda en Configuración del proyecto →
// Propiedades del script → GITHUB_TOKEN (fine-grained, solo el repo Backend,
// permiso "Contents: Read and write", con fecha de caducidad).
// Si GITHUB_TOKEN no existe, la sincronización se omite sin romper nada.
// =============================================================================

var GITHUB_OWNER_  = 'GrupoTerna';
var GITHUB_REPO_   = 'Backend';
var GITHUB_BRANCH_ = 'main';

// Si es true, el primer commit borra del repo los formatos antiguos
// (<Nombre>/<Nombre>.md, .txt, .zip y .gs). El historial de git los conserva.
var GITHUB_BORRAR_FORMATOS_ANTIGUOS_ = true;

// Patrones que BLOQUEAN la subida a GitHub (el repo es público).
var GITHUB_PATRONES_SECRETOS_ = [
  { nombre: 'token de GitHub',            re: /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/ },
  { nombre: 'JWT / token de API',         re: /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/ },
  { nombre: 'clave de Google API',        re: /AIza[0-9A-Za-z_-]{35}/ },
  { nombre: 'Bearer con valor fijo',      re: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
  // Asignación de un valor fijo a algo llamado token/secret/clave...; solo cuenta si el
  // valor parece aleatorio (mezcla letras y dígitos y no es un NOMBRE_EN_MAYUSCULAS, que
  // suele ser el nombre de una propiedad y no un secreto).
  { nombre: 'asignación de secreto fijo',
    re: /(?:token|secret|password|passwd|api[_-]?key|apikey|clave)\w*\s*[:=]\s*['"]([A-Za-z0-9._\-\/+=]{16,})['"]/i,
    valida: function(valor) { return /[A-Za-z]/.test(valor) && /\d/.test(valor) && !/^[A-Z0-9_]+$/.test(valor); } }
];
// Solo AVISO (no bloquea): cadenas que parecen ID de carpeta/hoja de Drive.
var GITHUB_REGEX_ID_DRIVE_ = /['"]1[A-Za-z0-9_-]{32,43}['"]/;

// -----------------------------------------------------------------------------
// HTTP con la API de GitHub
// -----------------------------------------------------------------------------

function _githubToken_() {
  return PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN') || '';
}

/** Arma una petición (objeto compatible con UrlFetchApp.fetchAll). */
function _ghReq_(metodo, ruta, payload, accept) {
  var req = {
    url: 'https://api.github.com/repos/' + GITHUB_OWNER_ + '/' + GITHUB_REPO_ + ruta,
    method: metodo,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + _githubToken_(),
      Accept: accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  };
  if (payload !== undefined && payload !== null) {
    req.contentType = 'application/json';
    req.payload = JSON.stringify(payload);
  }
  return req;
}

/** Valida el código HTTP; si no es 2xx lanza un error SIN incluir el token. */
function _ghRespuesta_(resp, req) {
  var code = resp.getResponseCode();
  if (code < 200 || code >= 300) {
    var msg = resp.getContentText();
    if (msg.length > 300) msg = msg.substring(0, 300);
    throw 'GitHub ' + req.method + ' ' + req.url.replace('https://api.github.com', '') +
          ' → HTTP ' + code + ': ' + msg;
  }
  return resp;
}

function _ghJson_(req) {
  var resp = UrlFetchApp.fetchAll([req])[0];
  return JSON.parse(_ghRespuesta_(resp, req).getContentText());
}

// -----------------------------------------------------------------------------
// Utilidades del proyecto de Apps Script
// -----------------------------------------------------------------------------

function _scriptIdDeProyecto_(nombreBase) {
  if (nombreBase === 'Generador') return ScriptApp.getScriptId();
  if (nombreBase === 'Base') {
    var ssId = obtenerSpreadsheetPorNombreEnCarpeta_(CARPETA_BASE_ID, NOMBRE_HOJA_BASE);
    var id = PropertiesService.getScriptProperties().getProperty('SCRIPT_ID_' + ssId);
    if (!id) throw 'No hay scriptId guardado para Base. Corre subirBaseDesdeZip() (o cualquier subirBaseDesdeX) primero.';
    return id;
  }
  throw 'Nombre de proyecto no válido: ' + nombreBase;
}

function _extDeTipo_(tipo) {
  return tipo === 'HTML' ? '.html' : (tipo === 'JSON' ? '.json' : '.gs');
}

/** Archivos reales del proyecto (sin "Script consolidado"), leídos de la API. */
function _archivosDelProyecto_(nombreBase) {
  return obtenerArchivosProyecto_(_scriptIdDeProyecto_(nombreBase)).filter(function(a) {
    return a.name.indexOf('Script consolidado') !== 0;
  });
}

// -----------------------------------------------------------------------------
// Revisión de secretos
// -----------------------------------------------------------------------------

/**
 * Devuelve { bloqueos: [...], idsDrive: n }. Nunca incluye el valor encontrado,
 * solo archivo, línea y tipo de patrón.
 */
function _githubRevisarSecretos_(archivos) {
  var bloqueos = [];
  var idsDrive = 0;
  archivos.forEach(function(a) {
    var lineas = String(a.source || '').split('\n');
    for (var i = 0; i < lineas.length; i++) {
      var l = lineas[i];
      for (var p = 0; p < GITHUB_PATRONES_SECRETOS_.length; p++) {
        var pat = GITHUB_PATRONES_SECRETOS_[p];
        var m = pat.re.exec(l);
        if (m && (!pat.valida || pat.valida(m[1]))) {
          bloqueos.push(a.name + ' línea ' + (i + 1) + ' (' + pat.nombre + ')');
        }
      }
      if (GITHUB_REGEX_ID_DRIVE_.test(l)) idsDrive++;
    }
  });
  return { bloqueos: bloqueos, idsDrive: idsDrive };
}

// -----------------------------------------------------------------------------
// Documentos generados: INDICE_FUNCIONES.md y LEEME_IA.md
// -----------------------------------------------------------------------------

function _githubGenerarIndice_(nombreBase, archivos) {
  var reFn  = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/;
  var reVar = /^(?:var|let|const)\s+([A-Za-z0-9_$]+)\s*=/;
  var gs = archivos.filter(function(a) { return a.type === 'SERVER_JS'; })
                   .sort(function(a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0); });
  var filas = [];

  gs.forEach(function(a) {
    var lineas = String(a.source || '').split('\n');
    for (var i = 0; i < lineas.length; i++) {
      var tipo = 'función';
      var m = reFn.exec(lineas[i]);
      if (!m) { m = reVar.exec(lineas[i]); tipo = 'global'; }
      if (!m) continue;
      // Referencia "[→ Contexto_Base_Web.md §...]" del comentario que lo precede.
      var ref = '';
      for (var j = i - 1; j >= 0 && j >= i - 15; j--) {
        if (!/^\s*(?:\/\*|\*|\/\/)/.test(lineas[j])) break;
        var r = /\[→\s*([^\]]+)\]/.exec(lineas[j]);
        if (r) { ref = r[1]; break; }
      }
      filas.push({ nombre: m[1], archivo: a.name + '.gs', linea: i + 1, tipo: tipo, ref: ref });
    }
  });

  var out = [];
  out.push('# Índice de funciones — ' + nombreBase);
  out.push('');
  out.push('Generado automáticamente por el Generador. No editar a mano.');
  out.push('Código real: `' + nombreBase + '/src/`. Total: ' + filas.length + ' nombres en ' + gs.length + ' archivos .gs.');
  out.push('');

  out.push('## Por archivo');
  out.push('');
  gs.forEach(function(a) {
    var nombres = filas.filter(function(f) { return f.archivo === a.name + '.gs' && f.tipo === 'función'; })
                       .map(function(f) { return f.nombre; });
    out.push('- **' + a.name + '.gs** (' + nombres.length + ' funciones): ' + (nombres.length ? nombres.join(', ') : '—'));
  });
  out.push('');

  var porNombre = {};
  filas.forEach(function(f) { (porNombre[f.nombre] = porNombre[f.nombre] || []).push(f); });
  var repetidos = Object.keys(porNombre).filter(function(n) { return porNombre[n].length > 1; }).sort();
  out.push('## Nombres repetidos (en Apps Script el último que carga pisa a los demás)');
  out.push('');
  if (!repetidos.length) {
    out.push('Ninguno.');
  } else {
    repetidos.forEach(function(n) {
      out.push('- `' + n + '`: ' + porNombre[n].map(function(f) { return f.archivo + ':' + f.linea; }).join(', '));
    });
  }
  out.push('');

  out.push('## Orden alfabético');
  out.push('');
  out.push('| Nombre | Tipo | Archivo | Línea | Ref. contexto |');
  out.push('|---|---|---|---|---|');
  filas.slice().sort(function(a, b) {
    var x = a.nombre.toLowerCase(), y = b.nombre.toLowerCase();
    return x < y ? -1 : (x > y ? 1 : 0);
  }).forEach(function(f) {
    out.push('| `' + f.nombre + '` | ' + f.tipo + ' | ' + f.archivo + ' | ' + f.linea + ' | ' + f.ref + ' |');
  });
  out.push('');
  return out.join('\n');
}

function _githubGenerarLeeme_(nombreBase, nArchivos) {
  return [
    '# ' + nombreBase + ' — guía para IA y personas',
    '',
    'Esta carpeta la escribe automáticamente el Generador (08_GitHub.gs) cada vez que se',
    'descarga o se sube el proyecto "' + nombreBase + '". No edites estos archivos a mano.',
    '',
    '## Qué leer',
    '',
    '- `src/` — el código real: ' + nArchivos + ' archivos sueltos, uno por archivo de Apps Script.',
    '  **Lee solo esta carpeta.**',
    '- `INDICE_FUNCIONES.md` — en qué archivo y línea vive cada función. Búscala aquí',
    '  primero (con grep o con la búsqueda del repo) y abre solo el archivo que toque.',
    '',
    '## Qué ignorar',
    '',
    '- `respaldo/' + nombreBase + '.gs` — consolidado de todo el código en un solo archivo.',
    '  Es una copia de seguridad que solo usa el Generador. **No lo leas, no lo cites y no',
    '  lo edites**: repite el contenido de `src/` y es larguísimo.',
    '',
    '## Reglas al proponer cambios',
    '',
    '- Entrega el archivo numerado completo que cambió (por ejemplo `01_Principal.gs`),',
    '  no fragmentos ni el consolidado.',
    '- Usa el mismo nombre exacto de archivo; no crees duplicados.',
    ''
  ].join('\n');
}

// -----------------------------------------------------------------------------
// Subida a GitHub (un solo commit)
// -----------------------------------------------------------------------------

/**
 * entradas: [{path, content}]. Reemplaza por completo prefijoCarpeta (borra lo
 * que ya no existe) y, opcionalmente, rutas de formatos antiguos.
 */
function _githubCommitArchivos_(entradas, prefijoCarpeta, rutasAntiguas, mensaje) {
  var ref = _ghJson_(_ghReq_('get', '/git/ref/heads/' + GITHUB_BRANCH_));
  var commitSha = ref.object.sha;
  var commit = _ghJson_(_ghReq_('get', '/git/commits/' + commitSha));
  var treeBaseSha = commit.tree.sha;
  var arbol = _ghJson_(_ghReq_('get', '/git/trees/' + treeBaseSha + '?recursive=1'));

  // Un blob por archivo, en lotes paralelos. Si el contenido no cambió,
  // GitHub devuelve el mismo SHA y ese archivo no figura en el commit.
  var shas = [];
  for (var i = 0; i < entradas.length; i += 20) {
    var lote = entradas.slice(i, i + 20);
    var reqs = lote.map(function(e) {
      return _ghReq_('post', '/git/blobs', { content: e.content, encoding: 'utf-8' });
    });
    var resps = UrlFetchApp.fetchAll(reqs);
    for (var k = 0; k < resps.length; k++) {
      shas.push(JSON.parse(_ghRespuesta_(resps[k], reqs[k]).getContentText()).sha);
    }
  }

  var nuevas = {};
  var items = entradas.map(function(e, idx) {
    nuevas[e.path] = true;
    return { path: e.path, mode: '100644', type: 'blob', sha: shas[idx] };
  });

  var borrados = [];
  if (arbol.truncated) {
    console.warn('[GitHub] El árbol del repo vino truncado: no se detectaron archivos a borrar.');
  } else {
    (arbol.tree || []).forEach(function(n) {
      if (n.type !== 'blob') return;
      var sobraEnSrc = n.path.indexOf(prefijoCarpeta) === 0 && !nuevas[n.path];
      var antiguo = GITHUB_BORRAR_FORMATOS_ANTIGUOS_ && rutasAntiguas.indexOf(n.path) !== -1;
      if (sobraEnSrc || antiguo) {
        items.push({ path: n.path, mode: '100644', type: 'blob', sha: null });
        borrados.push(n.path);
      }
    });
  }

  var arbolNuevo  = _ghJson_(_ghReq_('post', '/git/trees', { base_tree: treeBaseSha, tree: items }));
  var commitNuevo = _ghJson_(_ghReq_('post', '/git/commits',
                      { message: mensaje, tree: arbolNuevo.sha, parents: [commitSha] }));
  _ghJson_(_ghReq_('patch', '/git/refs/heads/' + GITHUB_BRANCH_, { sha: commitNuevo.sha }));
  return { commit: commitNuevo.sha, archivos: entradas.length, borrados: borrados };
}

/**
 * Sincroniza GitHub con el estado actual del proyecto de Apps Script.
 * NUNCA lanza error: si algo falla lo deja en el log y devuelve { ok:false }.
 * Así una falla de GitHub no rompe las descargas/subidas a Drive.
 */
function _githubSincronizar_(nombreBase) {
  try {
    if (!_githubToken_()) {
      console.log('[GitHub] No hay GITHUB_TOKEN en las propiedades del script: se omite la sincronización.');
      return { ok: false, omitido: true };
    }

    var archivos = _archivosDelProyecto_(nombreBase);

    var rev = _githubRevisarSecretos_(archivos);
    if (rev.bloqueos.length) {
      throw 'SUBIDA BLOQUEADA: posibles secretos en el código (repo público). Quítalos del código y ' +
            'guárdalos en Propiedades del script. Hallazgos (' + rev.bloqueos.length + '): ' +
            rev.bloqueos.slice(0, 20).join(' | ');
    }

    // El consolidado ya lo regeneró _descargarProyectoAArchivos() en Drive.
    var it = _carpetaDeRespaldos_(nombreBase).getFilesByName(nombreBase + '.gs');
    if (!it.hasNext()) throw 'No encontré ' + nombreBase + '.gs en Drive para usarlo de respaldo.';
    var consolidado = it.next().getBlob().getDataAsString('UTF-8');

    var entradas = archivos.map(function(a) {
      return { path: nombreBase + '/src/' + a.name + _extDeTipo_(a.type), content: a.source || '' };
    });
    entradas.push({ path: nombreBase + '/respaldo/' + nombreBase + '.gs', content: consolidado });
    entradas.push({ path: nombreBase + '/INDICE_FUNCIONES.md', content: _githubGenerarIndice_(nombreBase, archivos) });
    entradas.push({ path: nombreBase + '/LEEME_IA.md', content: _githubGenerarLeeme_(nombreBase, archivos.length) });

    var antiguos = ['.md', '.txt', '.zip', '.gs'].map(function(e) { return nombreBase + '/' + nombreBase + e; });
    var fecha = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
    var res = _githubCommitArchivos_(
      entradas, nombreBase + '/src/', antiguos,
      'Descarga ' + nombreBase + ' - ' + fecha + ' (Lima) - ' + archivos.length + ' archivos'
    );

    var detalle = 'Commit ' + res.commit.substring(0, 7) + ' en ' + GITHUB_OWNER_ + '/' + GITHUB_REPO_ +
                  ' (' + res.archivos + ' archivos escritos, ' + res.borrados.length + ' borrados' +
                  (res.borrados.length ? ': ' + res.borrados.join(', ') : '') + ').';
    var avisos = [];
    if (rev.idsDrive) avisos.push(rev.idsDrive + ' línea(s) con cadenas que parecen IDs de Drive/Hojas (visibles en el repo público).');
    console.log('[GitHub] ' + detalle);
    _registrarLogGenerador('_githubSincronizar_() / ' + nombreBase, detalle, avisos);
    return { ok: true, commit: res.commit, borrados: res.borrados };

  } catch (e) {
    var msg = (e && e.message) ? e.message : String(e);
    console.error('[GitHub] ' + msg);
    try { _registrarLogGenerador('_githubSincronizar_() / ' + nombreBase, 'ERROR: ' + msg, [msg]); } catch (e2) {}
    return { ok: false, error: msg };
  }
}

// -----------------------------------------------------------------------------
// Bajada desde GitHub al proyecto de Apps Script de Base
// -----------------------------------------------------------------------------

/**
 * Deja el proyecto de Apps Script de "Base" exactamente igual a Base/src/ de
 * GitHub. Un solo PUT reemplaza TODO el contenido, así que lo que no esté en
 * GitHub desaparece del proyecto y nunca queda un momento "vacío".
 * Antes hace un respaldo en Drive: "Base_antes_de_GitHub.zip" (uno solo, se reemplaza).
 * Solo admite 'Base' (nunca el propio Generador).
 */
function _githubTraerAProyectoApps_(nombreBase, forzar) {
  if (nombreBase !== 'Base') {
    throw 'Por seguridad, solo se puede traer desde GitHub el proyecto "Base" (nunca el propio Generador).';
  }
  if (!_githubToken_()) throw 'Falta la propiedad GITHUB_TOKEN en las propiedades del script.';

  var scriptId = _scriptIdDeProyecto_('Base');
  var actuales = _archivosDelProyecto_('Base');

  // 1. Respaldo previo en Drive: UN solo archivo, "Base_antes_de_GitHub.zip", que se
  //    reemplaza en cada ejecución (la fecha queda en su descripción). Se crea la copia
  //    nueva primero y solo después se mandan a la papelera las anteriores.
  _descargarProyectoAArchivos('Base');
  var carpeta = _carpetaDeRespaldos_('Base');
  var nombreRespaldo = 'Base_antes_de_GitHub.zip';
  var sello = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
  var zips = carpeta.getFilesByName('Base.zip');
  if (zips.hasNext()) {
    var copia = zips.next().makeCopy(nombreRespaldo + '.tmp', carpeta);
    var anteriores = carpeta.getFilesByName(nombreRespaldo);
    while (anteriores.hasNext()) anteriores.next().setTrashed(true);
    copia.setName(nombreRespaldo);
    copia.setDescription('Estado de Base justo antes de traer GitHub: ' + sello + ' (Lima)');
  }

  // 2. Leer Base/src/ de GitHub.
  var arbol = _ghJson_(_ghReq_('get', '/git/trees/' + GITHUB_BRANCH_ + '?recursive=1'));
  if (arbol.truncated) throw 'El árbol de GitHub vino truncado; no es seguro continuar.';
  var prefijo = 'Base/src/';
  var nodos = (arbol.tree || []).filter(function(n) {
    return n.type === 'blob' && n.path.indexOf(prefijo) === 0;
  });
  if (!nodos.length) throw 'No hay archivos en ' + prefijo + ' de GitHub. No se tocó el proyecto.';

  var nuevos = [];
  for (var i = 0; i < nodos.length; i += 20) {
    var lote = nodos.slice(i, i + 20);
    var reqs = lote.map(function(n) {
      return _ghReq_('get', '/git/blobs/' + n.sha, null, 'application/vnd.github.raw+json');
    });
    var resps = UrlFetchApp.fetchAll(reqs);
    for (var k = 0; k < resps.length; k++) {
      var nombreArchivo = lote[k].path.substring(prefijo.length);
      var m = /^([^\/]+)\.(gs|html|json)$/.exec(nombreArchivo);
      if (!m) { console.warn('[GitHub] Se ignora (no es .gs/.html/.json en la raíz de src/): ' + nombreArchivo); continue; }
      nuevos.push({
        name: m[1],
        type: m[2] === 'gs' ? 'SERVER_JS' : (m[2] === 'html' ? 'HTML' : 'JSON'),
        source: _ghRespuesta_(resps[k], reqs[k]).getContentText('UTF-8')
      });
    }
  }

  // 3. Manifiesto: si no viene en src/, se conserva el actual (o el canónico).
  if (!nuevos.some(function(f) { return f.name === 'appsscript'; })) {
    var man = actuales.filter(function(a) { return a.name === 'appsscript'; })[0];
    nuevos.push({
      name: 'appsscript', type: 'JSON',
      source: man ? man.source : JSON.stringify(MANIFIESTO_CANONICO_)
    });
  }

  // 4. Salvaguarda contra una carpeta src/ incompleta.
  var gsNuevos   = nuevos.filter(function(f) { return f.type === 'SERVER_JS'; }).length;
  var gsActuales = actuales.filter(function(f) { return f.type === 'SERVER_JS'; }).length;
  if (!forzar && gsNuevos < Math.ceil(gsActuales / 2)) {
    throw 'GitHub trae ' + gsNuevos + ' archivos .gs y el proyecto tiene ' + gsActuales +
          '. Parece incompleto, no se tocó nada. Si es intencional, corre subirBaseDesdeGithubForzado().';
  }

  // 5. Reemplazo atómico.
  var resp = UrlFetchApp.fetch('https://script.googleapis.com/v1/projects/' + scriptId + '/content', {
    method: 'put',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ files: nuevos }),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200) {
    throw 'Error al actualizar el proyecto de Base (' + resp.getResponseCode() + '): ' + resp.getContentText();
  }

  // 6. Reporte.
  var antes = {};
  actuales.forEach(function(a) { antes[a.name] = a.source; });
  var despues = {};
  var agregados = [], modificados = [], iguales = 0;
  nuevos.forEach(function(f) {
    despues[f.name] = true;
    if (!(f.name in antes)) agregados.push(f.name);
    else if (antes[f.name] !== f.source) modificados.push(f.name);
    else iguales++;
  });
  var eliminados = actuales.map(function(a) { return a.name; }).filter(function(n) { return !despues[n]; });

  console.log('--- Base desde GitHub ---');
  console.log('Modificados (' + modificados.length + '): ' + (modificados.join(', ') || 'ninguno'));
  console.log('Agregados (' + agregados.length + '): ' + (agregados.join(', ') || 'ninguno'));
  console.log('Eliminados (' + eliminados.length + '): ' + (eliminados.join(', ') || 'ninguno'));
  console.log('Sin cambios: ' + iguales);
  console.log('Respaldo previo en Drive: ' + nombreRespaldo + ' (' + sello + ')');

  _registrarLogGenerador(
    '_githubTraerAProyectoApps_() / Base',
    'Proyecto de Base reemplazado con Base/src/ de GitHub. Modificados: ' + modificados.length +
    ' | Agregados: ' + agregados.length + ' | Eliminados: ' + eliminados.length + ' | Sin cambios: ' + iguales,
    []
  );

  // 7. Regenerar respaldos de Drive y dejar GitHub al día (consolidado + índice).
  _descargarProyectoAArchivos('Base');
  _githubSincronizar_('Base');

  return { modificados: modificados, agregados: agregados, eliminados: eliminados, sinCambios: iguales };
}

// -----------------------------------------------------------------------------
// Diagnóstico
// -----------------------------------------------------------------------------

/** Comprueba token, acceso al repo, permiso de escritura y rama. */
function _githubProbar_() {
  if (!_githubToken_()) throw 'Falta GITHUB_TOKEN: Configuración del proyecto → Propiedades del script.';
  var repo = _ghJson_(_ghReq_('get', ''));
  var rama = _ghJson_(_ghReq_('get', '/git/ref/heads/' + GITHUB_BRANCH_));
  var escritura = (repo.permissions && repo.permissions.push) ? 'SÍ' : 'NO / no informado';
  var texto = 'Repo: ' + repo.full_name + ' | ' + (repo.private ? 'PRIVADO' : 'PÚBLICO') +
              ' | escritura: ' + escritura + ' | rama ' + GITHUB_BRANCH_ + ': ' + rama.object.sha.substring(0, 7);
  console.log('[GitHub] ' + texto);
  return texto;
}