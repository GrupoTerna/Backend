// =============================================================================
// 08_GitHub.gs
// Sincronización con GitHub (repo GrupoTerna/Backend).
//
//  - _githubSincronizar_(nombre): sube a GitHub, en UN solo commit, los .gs
//    sueltos (Base/src/ o Generador/src/), el consolidado de respaldo
//    (respaldo/<nombre>.gs), INDICE_FUNCIONES.md, Indice_<nombre>.md (N.º, archivo y
//    estado; lo genera _guardarIndiceArchivos_ en 02_Backstage.gs) y LEEME_IA.md.
//  - _githubTraerAProyectoApps_(nombre): lee <Nombre>/src/ de GitHub y deja el
//    proyecto de Apps Script de Base (o del propio Generador) EXACTAMENTE igual
//    (reemplazo atómico).
//  - Aviso de pull pendiente: _githubSincronizar_ no escribe si GitHub tiene cambios
//    nuevos en <Nombre>/ que el Generador no trajo (ver _githubRevisarPullPendiente_).
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

// Desde el 25-oct-2026 (§PF278): GitHub frena con HTTP 403 («secondary rate limit») o 429 si se hacen demasiadas
// escrituras seguidas. _ghJsonReintento_ espera y repite (hasta 3 intentos en total) antes de dejar pasar el error.
function _ghEsLimiteDeGithub_(e) {
  var t = String(e);
  return /HTTP 429/.test(t) || (/HTTP 403/.test(t) && /rate limit/i.test(t));
}
function _ghJsonReintento_(req) {
  for (var intento = 1; ; intento++) {
    try {
      return _ghJson_(req);
    } catch (e) {
      if (!_ghEsLimiteDeGithub_(e) || intento >= 3) throw e;
      console.warn('[GitHub] Límite de escrituras; se espera 45 s y se reintenta (intento ' + (intento + 1) + ' de 3).');
      Utilities.sleep(45000);
    }
  }
}
// Con más de este número de archivos no se crea un blob por archivo: el contenido va dentro de los árboles, de a este tanto por llamada.
var GITHUB_ENTRADAS_BLOB_MAX_ = 40;

// -----------------------------------------------------------------------------
// Aviso de "pull pendiente": no escribir encima de cambios que el Generador no trajo
// -----------------------------------------------------------------------------
// El Generador recuerda (en las propiedades del script) el último commit de GitHub que él
// mismo trajo o escribió, uno por proyecto: GITHUB_ULTIMO_COMMIT_Base y GITHUB_ULTIMO_COMMIT_Generador.
// Antes de escribir en GitHub compara ese commit con el último de la rama. Si hay cambios nuevos
// en la carpeta del proyecto (<Nombre>/), BLOQUEA la subida: escribir el estado de Apps Script
// los pisaría. La variante forzada (descargarBaseForzado / descargarGeneradorForzado) escribe igual.
// [→ Contexto_Base_Web.md §PF150]

var GITHUB_PROP_ULTIMO_COMMIT_ = 'GITHUB_ULTIMO_COMMIT_';

// true: solo bloquea si cambió algo dentro de <Nombre>/ (los commits que tocan solo el contexto,
// los consolidados o la otra carpeta no cuentan, porque _githubCommitArchivos_ los conserva).
// false: bloquea con cualquier commit nuevo en la rama.
var GITHUB_AVISO_SOLO_CARPETA_ = true;

// Intentos totales de subirBaseDesdeGithub() y subirGeneradorDesdeGithub() (y las forzadas) cuando,
// justo antes de escribir su commit de cierre, GitHub recibió cambios nuevos en <Nombre>/: traen lo
// nuevo y reintentan. Si tras el último intento la rama sigue moviéndose, NO escriben el commit de cierre.
// [→ Contexto_Base_Web.md §PF273]
var GITHUB_INTENTOS_TRAER_ = 3;

function _githubLeerUltimoCommit_(nombreBase) {
  return PropertiesService.getScriptProperties().getProperty(GITHUB_PROP_ULTIMO_COMMIT_ + nombreBase) || '';
}

function _githubGuardarUltimoCommit_(nombreBase, sha) {
  if (!sha) return;
  PropertiesService.getScriptProperties().setProperty(GITHUB_PROP_ULTIMO_COMMIT_ + nombreBase, sha);
}

/** SHA del último commit de la rama. */
function _githubCabezaRemota_() {
  return _ghJson_(_ghReq_('get', '/git/ref/heads/' + GITHUB_BRANCH_)).object.sha;
}

/**
 * Compara el último commit que el Generador trajo (o escribió) de <nombreBase> con el de GitHub.
 * Devuelve { bloquear, cabeza, sinBase, mensaje }.
 *  - Sin commit recordado (primera vez): no bloquea, porque no hay con qué comparar; avisa con sinBase.
 *  - Si no se puede comparar (commit recordado ya no existe, o hay 300 archivos o más distintos):
 *    se bloquea, por precaución.
 */
function _githubRevisarPullPendiente_(nombreBase) {
  var cabeza = _githubCabezaRemota_();
  var base = _githubLeerUltimoCommit_(nombreBase);
  if (!base) return { bloquear: false, cabeza: cabeza, sinBase: true };
  if (base === cabeza) return { bloquear: false, cabeza: cabeza };

  var carpeta = nombreBase + '/';
  var cambiados = [];
  var noComparable = '';

  var rq = _ghReq_('get', '/compare/' + base + '...' + cabeza);
  var resp = UrlFetchApp.fetchAll([rq])[0];
  var code = resp.getResponseCode();
  if (code === 404 || code === 422) {
    noComparable = 'el commit que recordaba (' + base.substring(0, 7) + ') ya no existe en GitHub';
  } else {
    var cmp = JSON.parse(_ghRespuesta_(resp, rq).getContentText());
    var archivos = cmp.files || [];
    if (archivos.length >= 300) noComparable = 'hay 300 archivos o más distintos y no se puede listar todos';
    archivos.forEach(function(f) {
      if (f.filename.indexOf(carpeta) === 0 ||
          (f.previous_filename && f.previous_filename.indexOf(carpeta) === 0)) {
        cambiados.push(f.filename);
      }
    });
  }

  if (!noComparable && GITHUB_AVISO_SOLO_CARPETA_ && !cambiados.length) {
    return { bloquear: false, cabeza: cabeza, soloOtrosArchivos: true };
  }

  var detalle = noComparable
    ? 'No se pudo comparar: ' + noComparable + '.'
    : (cambiados.length
        ? 'Archivos distintos en ' + carpeta + ' (' + cambiados.length + '): ' +
          cambiados.slice(0, 10).join(', ') + (cambiados.length > 10 ? ' y ' + (cambiados.length - 10) + ' más' : '') + '.'
        : 'Hay commits nuevos en GitHub (aviso por commit, GITHUB_AVISO_SOLO_CARPETA_ = false).');
  var forzada = nombreBase === 'Base' ? 'descargarBaseForzado()'
              : (nombreBase === 'Contactos_Secundario' ? 'descargarContactosForzado()' : 'descargarGeneradorForzado()');
  var traer   = nombreBase === 'Base' ? 'subirBaseDesdeGithub()'
              : (nombreBase === 'Contactos_Secundario' ? 'subirContactosDesdeGithub()' : 'subirGeneradorDesdeGithub()');
  var mensaje = 'SUBIDA A GITHUB BLOQUEADA: PULL PENDIENTE. GitHub tiene cambios en ' + carpeta +
                ' que este proyecto no ha traído (último commit traído: ' + base.substring(0, 7) +
                ', último en GitHub: ' + cabeza.substring(0, 7) + '). ' + detalle +
                ' Si quieres quedarte con lo de GitHub, corre ' + traer + ' (reemplaza lo que haya en Apps Script). ' +
                'Si quieres que lo de Apps Script pise lo de GitHub, corre ' + forzada + '.';
  return { bloquear: true, cabeza: cabeza, mensaje: mensaje };
}

/**
 * Lista los archivos de <carpeta> (por ejemplo 'Base/') que cambiaron entre dos commits de la rama.
 * Devuelve { cambiados: [rutas], noComparable: 'motivo' o '' }. Es la misma comparación de
 * _githubRevisarPullPendiente_, pero para usarla justo antes de escribir (parámetro guardia de
 * _githubCommitArchivos_). [→ Contexto_Base_Web.md §PF273]
 */
function _githubCambiosEnCarpeta_(desde, hasta, carpeta) {
  var cambiados = [];
  var noComparable = '';
  var rq = _ghReq_('get', '/compare/' + desde + '...' + hasta);
  var resp = UrlFetchApp.fetchAll([rq])[0];
  var code = resp.getResponseCode();
  if (code === 404 || code === 422) {
    noComparable = 'el commit esperado (' + desde.substring(0, 7) + ') ya no existe en GitHub';
  } else {
    var cmp = JSON.parse(_ghRespuesta_(resp, rq).getContentText());
    var archivos = cmp.files || [];
    if (archivos.length >= 300) noComparable = 'hay 300 archivos o más distintos y no se puede listar todos';
    archivos.forEach(function(f) {
      if (f.filename.indexOf(carpeta) === 0 ||
          (f.previous_filename && f.previous_filename.indexOf(carpeta) === 0)) {
        cambiados.push(f.filename);
      }
    });
  }
  return { cambiados: cambiados, noComparable: noComparable };
}

/** Nombres de las funciones que traen GitHub o lo pisan, según el proyecto (para los mensajes). */
function _githubFuncionesDeAccion_(nombreBase) {
  return {
    traer:   nombreBase === 'Base' ? 'subirBaseDesdeGithub()'
           : (nombreBase === 'Contactos_Secundario' ? 'subirContactosDesdeGithub()' : 'subirGeneradorDesdeGithub()'),
    forzada: nombreBase === 'Base' ? 'descargarBaseForzado()'
           : (nombreBase === 'Contactos_Secundario' ? 'descargarContactosForzado()' : 'descargarGeneradorForzado()')
  };
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
  if (nombreBase === 'Contactos_Secundario') {
    // Proyecto de Apps Script de la CUENTA SECUNDARIA (sincronizador de contactos). Su ID no va en el
    // código (es un ID de Drive y el repo es público): vive en las Propiedades del script del Generador.
    // Requisito: ese proyecto debe estar compartido con la cuenta del Generador como editor.
    var idContactos = PropertiesService.getScriptProperties().getProperty('SCRIPT_ID_CONTACTOS_SECUNDARIO');
    if (!idContactos) throw 'Falta la propiedad SCRIPT_ID_CONTACTOS_SECUNDARIO en las Propiedades del script del Generador ' +
      '(ID del proyecto de Apps Script de la cuenta secundaria; ese proyecto debe estar compartido con esta cuenta como editor).';
    return idContactos;
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
    '- `Indice_' + nombreBase + '.md` — lista numerada de los archivos del proyecto y su estado en la última',
    '  tanda (permanece igual, modificado, creado o eliminado).',
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
 *
 * SIN CAMBIOS = SIN COMMIT: si lo que se iba a escribir es idéntico a lo que ya hay en GitHub,
 * NO crea el commit y devuelve { commit: null, sinCambios: true }. Como el consolidado
 * (respaldo/<Nombre>.gs) trae en su primera línea la fecha de generación, que cambia en cada
 * ejecución, se compara sin esa línea; si es lo único distinto, se conserva el archivo remoto.
 * Quien llama debe informar el caso en el log (ver _githubSincronizar_).
 *
 * GUARDIA (opcional, { cabeza, carpeta }): es el último commit de la rama que el que llama revisó
 * (_githubRevisarPullPendiente_) y la carpeta que va a reemplazar (por ejemplo 'Base/'). Si al
 * leer la rama ya no es ese commit y lo nuevo toca la carpeta (o no se puede comparar), NO escribe:
 * devuelve { commit: null, desfasado: true, cabezaNueva, cambiados, motivo }. Si lo nuevo no toca
 * la carpeta (solo contexto, consolidados u otra carpeta), sigue: el árbol nuevo parte del último
 * commit y lo conserva. El PATCH final no fuerza: si la rama se movió entre medias, GitHub
 * responde 422 y con guardia también se devuelve desfasado. Sin guardia, todo se comporta como antes.
 * [→ Contexto_Base_Web.md §PF273]
 */
function _githubCommitArchivos_(entradas, prefijoCarpeta, rutasAntiguas, mensaje, guardia) {
  var ref = _ghJson_(_ghReq_('get', '/git/ref/heads/' + GITHUB_BRANCH_));
  var commitSha = ref.object.sha;
  if (guardia && guardia.cabeza && guardia.cabeza !== commitSha) {
    var dif = _githubCambiosEnCarpeta_(guardia.cabeza, commitSha, guardia.carpeta);
    if (dif.noComparable || dif.cambiados.length) {
      return { commit: null, desfasado: true, cabezaNueva: commitSha, cambiados: dif.cambiados,
               motivo: dif.noComparable, archivos: entradas.length, borrados: [] };
    }
  }
  var commit = _ghJson_(_ghReq_('get', '/git/commits/' + commitSha));
  var treeBaseSha = commit.tree.sha;
  var arbol = _ghJson_(_ghReq_('get', '/git/trees/' + treeBaseSha + '?recursive=1'));

  // El consolidado trae la fecha de generación en su primera línea: si es lo único que cambió,
  // se reutiliza el contenido que ya está en GitHub para que no cuente como cambio.
  var reFechaConsolidado = /\/\* CÓDIGO CONSOLIDADO GENERADO EL [^*]*\*\//;
  // Indice_<Nombre>.md lleva la fecha y los estados de la última tanda: si las huellas de los archivos
  // son las mismas que las del que ya está en GitHub, no hubo cambios de código y se conserva el remoto.
  var reHuellas = /<!--\s*HUELLAS\s+(\{[\s\S]*?\})\s*-->/;
  entradas.forEach(function(e) {
    if (!/\/Indice_[^\/]+\.md$/.test(e.path)) return;
    var nodoI = (arbol.tree || []).filter(function(n) { return n.type === 'blob' && n.path === e.path; })[0];
    if (!nodoI) return;
    var rqI = _ghReq_('get', '/git/blobs/' + nodoI.sha, null, 'application/vnd.github.raw+json');
    var viejoI = _ghRespuesta_(UrlFetchApp.fetchAll([rqI])[0], rqI).getContentText('UTF-8');
    var hv = reHuellas.exec(viejoI), hn = reHuellas.exec(e.content);
    if (hv && hn && hv[1] === hn[1]) e.content = viejoI;
  });
  entradas.forEach(function(e) {
    if (!/\/respaldo\/[^\/]+\.gs$/.test(e.path)) return;
    var nodo = (arbol.tree || []).filter(function(n) { return n.type === 'blob' && n.path === e.path; })[0];
    if (!nodo) return;
    var rq = _ghReq_('get', '/git/blobs/' + nodo.sha, null, 'application/vnd.github.raw+json');
    var viejo = _ghRespuesta_(UrlFetchApp.fetchAll([rq])[0], rq).getContentText('UTF-8');
    if (viejo.replace(reFechaConsolidado, '') === e.content.replace(reFechaConsolidado, '')) e.content = viejo;
  });

  // Pocos archivos: un blob por archivo, en lotes paralelos. Si el contenido no cambió,
  // GitHub devuelve el mismo SHA y ese archivo no figura en el commit.
  // Muchos archivos (más de GITHUB_ENTRADAS_BLOB_MAX_): el contenido va dentro de los árboles, encadenados
  // con base_tree, para no pasar del límite de escrituras de GitHub (§PF278).
  var shas = [];
  var inline = entradas.length > GITHUB_ENTRADAS_BLOB_MAX_;
  var baseIntermedia = treeBaseSha;
  if (inline) {
    for (var ii = 0; ii < entradas.length; ii += GITHUB_ENTRADAS_BLOB_MAX_) {
      var trozo = entradas.slice(ii, ii + GITHUB_ENTRADAS_BLOB_MAX_).map(function(e) {
        return { path: e.path, mode: '100644', type: 'blob', content: e.content };
      });
      baseIntermedia = _ghJsonReintento_(_ghReq_('post', '/git/trees', { base_tree: baseIntermedia, tree: trozo })).sha;
      Utilities.sleep(1000);
    }
  } else {
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
  }

  var nuevas = {};
  var items = [];
  entradas.forEach(function(e, idx) {
    nuevas[e.path] = true;
    if (!inline) items.push({ path: e.path, mode: '100644', type: 'blob', sha: shas[idx] });
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

  var arbolNuevo = (inline && !items.length)
    ? { sha: baseIntermedia }
    : _ghJsonReintento_(_ghReq_('post', '/git/trees', { base_tree: baseIntermedia, tree: items }));
  if (arbolNuevo.sha === treeBaseSha) {
    return { commit: null, sinCambios: true, archivos: entradas.length, borrados: [] };
  }
  var commitNuevo = _ghJson_(_ghReq_('post', '/git/commits',
                      { message: mensaje, tree: arbolNuevo.sha, parents: [commitSha] }));
  try {
    _ghJson_(_ghReq_('patch', '/git/refs/heads/' + GITHUB_BRANCH_, { sha: commitNuevo.sha }));
  } catch (ePatch) {
    if (guardia && String(ePatch).indexOf('HTTP 422') !== -1) {
      return { commit: null, desfasado: true, cabezaNueva: '', cambiados: [],
               motivo: 'la rama se movió mientras se escribía el commit', archivos: entradas.length, borrados: [] };
    }
    throw ePatch;
  }
  return { commit: commitNuevo.sha, archivos: entradas.length, borrados: borrados };
}

/**
 * Sincroniza GitHub con el estado actual del proyecto de Apps Script.
 * NUNCA lanza error: si algo falla lo deja en el log y devuelve { ok:false }.
 * Así una falla de GitHub no rompe las descargas/subidas a Drive.
 *
 * PULL PENDIENTE: antes de escribir compara el último commit que el Generador trajo con el de
 * GitHub (_githubRevisarPullPendiente_). Si GitHub tiene cambios nuevos en <nombreBase>/, NO escribe
 * y devuelve { ok:false, bloqueado:true }. Con forzar=true escribe igual y lo deja en el aviso del log.
 */
function _githubSincronizar_(nombreBase, forzar) {
  try {
    if (!_githubToken_()) {
      console.log('[GitHub] No hay GITHUB_TOKEN en las propiedades del script: se omite la sincronización.');
      return { ok: false, omitido: true };
    }

    var pull = _githubRevisarPullPendiente_(nombreBase);
    var avisoForzado = [];
    if (pull.bloquear && !forzar) {
      console.error('[GitHub] ' + pull.mensaje);
      try { _registrarLogGenerador('_githubSincronizar_() / ' + nombreBase, 'BLOQUEADO: ' + pull.mensaje, [pull.mensaje]); } catch (e0) {}
      return { ok: false, bloqueado: true, error: pull.mensaje };
    }
    if (pull.bloquear && forzar) {
      var avisoF = 'FORZADO: se escribe en GitHub aunque había cambios nuevos en ' + nombreBase + '/ que no se habían traído.';
      console.warn('[GitHub] ' + avisoF + ' ' + pull.mensaje);
      avisoForzado.push(avisoF);
    }
    if (pull.sinBase) {
      console.log('[GitHub] Aún no hay commit de referencia para ' + nombreBase + ' (primera vez): no se pudo comprobar si había un pull pendiente.');
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
    // Indice_<Nombre>.md (N.º / archivo / estado): lo generó _descargarProyectoAArchivos() en Drive.
    var itIndice = _carpetaDeRespaldos_(nombreBase).getFilesByName('Indice_' + nombreBase + '.md');
    if (itIndice.hasNext()) {
      entradas.push({ path: nombreBase + '/Indice_' + nombreBase + '.md', content: itIndice.next().getBlob().getDataAsString('UTF-8') });
    } else {
      console.warn('[GitHub] No encontré Indice_' + nombreBase + '.md en Drive: no se escribe en GitHub.');
    }
    entradas.push({ path: nombreBase + '/LEEME_IA.md', content: _githubGenerarLeeme_(nombreBase, archivos.length) });

    var antiguos = ['.md', '.txt', '.zip', '.gs'].map(function(e) { return nombreBase + '/' + nombreBase + e; });
    var fecha = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
    // Con forzar no hay guardia: se escribe aunque GitHub haya cambiado. Sin forzar, si entre la revisión
    // de arriba y este commit GitHub recibió cambios en <Nombre>/, no se escribe (ver _githubCommitArchivos_).
    var guardia = forzar ? null : { cabeza: pull.cabeza, carpeta: nombreBase + '/' };
    var res = _githubCommitArchivos_(
      entradas, nombreBase + '/src/', antiguos,
      'Descarga ' + nombreBase + ' - ' + fecha + ' (Lima) - ' + archivos.length + ' archivos',
      guardia
    );

    if (res.desfasado) {
      var acc = _githubFuncionesDeAccion_(nombreBase);
      var queCambio = res.motivo
        ? 'No se pudo comparar: ' + res.motivo + '.'
        : (res.cambiados.length
            ? 'Archivos distintos en ' + nombreBase + '/ (' + res.cambiados.length + '): ' +
              res.cambiados.slice(0, 10).join(', ') + (res.cambiados.length > 10 ? ' y ' + (res.cambiados.length - 10) + ' más' : '') + '.'
            : '');
      var msgD = 'COMMIT NO ESCRITO: GitHub recibió cambios en ' + nombreBase + '/ mientras se preparaba la subida' +
                 (res.cabezaNueva ? ' (último revisado: ' + (pull.cabeza || '').substring(0, 7) + ', ahora: ' + res.cabezaNueva.substring(0, 7) + ')' : '') +
                 '. ' + queCambio + ' No se escribió nada para no pisarlos. Si quieres quedarte con lo de GitHub, corre ' +
                 acc.traer + '. Si quieres que lo de Apps Script pise lo de GitHub, corre ' + acc.forzada + '.';
      console.error('[GitHub] ' + msgD);
      try { _registrarLogGenerador('_githubSincronizar_() / ' + nombreBase, 'BLOQUEADO: ' + msgD, [msgD]); } catch (e1) {}
      return { ok: false, desfasado: true, bloqueado: true, error: msgD };
    }

    if (res.sinCambios) {
      var detalleSin = 'Sin cambios: GitHub ya estaba igual a ' + nombreBase + ' (' + res.archivos +
                       ' archivos revisados). No se creó commit.';
      console.log('[GitHub] ' + detalleSin);
      _registrarLogGenerador('_githubSincronizar_() / ' + nombreBase, detalleSin, avisoForzado);
      // GitHub ya es igual a este proyecto: el último commit de la rama pasa a ser el de referencia.
      _githubGuardarUltimoCommit_(nombreBase, pull.cabeza);
      return { ok: true, commit: null, sinCambios: true, borrados: [] };
    }
    _githubGuardarUltimoCommit_(nombreBase, res.commit);

    var detalle = 'Commit ' + res.commit.substring(0, 7) + ' en ' + GITHUB_OWNER_ + '/' + GITHUB_REPO_ +
                  ' (' + res.archivos + ' archivos escritos, ' + res.borrados.length + ' borrados' +
                  (res.borrados.length ? ': ' + res.borrados.join(', ') : '') + ').';
    var avisos = avisoForzado.slice();
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
 * Deja el proyecto de Apps Script de "Base" o del propio "Generador" exactamente
 * igual a <Nombre>/src/ de GitHub. Un solo PUT reemplaza TODO el contenido, así
 * que lo que no esté en GitHub desaparece del proyecto y nunca queda un momento "vacío".
 * Antes hace un respaldo en Drive: "<Nombre>_antes_de_GitHub.zip" (uno solo, se reemplaza).
 *
 * CASO 'Generador' (se reemplaza a sí mismo): además de la salvaguarda de "src/ incompleta",
 * si no es forzado se detiene cuando src/ no trae esta misma función de bajada, porque el
 * Generador quedaría sin poder volver a traer GitHub. Si GitHub trae un error de sintaxis, el
 * Generador puede quedar sin correr: se repara pegando a mano desde el respaldo de Drive.
 * [→ Contexto_Base_Web.md: pendiente de registrar el comportamiento real al autoreemplazarse]
 */
function _githubTraerAProyectoAppsUnaVez_(nombreBase, forzar, esReintento) {
  if (nombreBase !== 'Base' && nombreBase !== 'Generador' && nombreBase !== 'Contactos_Secundario') {
    throw 'Nombre de proyecto no válido para traer desde GitHub: ' + nombreBase;
  }
  if (!_githubToken_()) throw 'Falta la propiedad GITHUB_TOKEN en las propiedades del script.';

  var scriptId = _scriptIdDeProyecto_(nombreBase);
  var actuales = _archivosDelProyecto_(nombreBase);

  // 1. Respaldo previo en Drive: UN solo archivo, "Base_antes_de_GitHub.zip", que se
  //    reemplaza en cada ejecución (la fecha queda en su descripción). Se crea la copia
  //    nueva primero y solo después se mandan a la papelera las anteriores.
  //    En un REINTENTO (esReintento) no se toca: el respaldo debe seguir siendo el estado de
  //    Apps Script anterior a la primera vez que se trajo GitHub, no el del intento anterior.
  var carpeta = _carpetaDeRespaldos_(nombreBase);
  var nombreRespaldo = nombreBase + '_antes_de_GitHub.zip';
  var sello = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
  if (!esReintento) _descargarProyectoAArchivos(nombreBase);
  var zips = esReintento ? { hasNext: function() { return false; } } : carpeta.getFilesByName(nombreBase + '.zip');
  if (zips.hasNext()) {
    var copia = zips.next().makeCopy(nombreRespaldo + '.tmp', carpeta);
    var anteriores = carpeta.getFilesByName(nombreRespaldo);
    while (anteriores.hasNext()) anteriores.next().setTrashed(true);
    copia.setName(nombreRespaldo);
    copia.setDescription('Estado de ' + nombreBase + ' justo antes de traer GitHub: ' + sello + ' (Lima)');
  }

  // 2. Leer <Nombre>/src/ de GitHub.
  //    Se fija el último commit y se lee su árbol: ese commit queda como referencia del pull pendiente.
  var cabezaTraida = _githubCabezaRemota_();
  var treeTraidoSha = _ghJson_(_ghReq_('get', '/git/commits/' + cabezaTraida)).tree.sha;
  var arbol = _ghJson_(_ghReq_('get', '/git/trees/' + treeTraidoSha + '?recursive=1'));
  if (arbol.truncated) throw 'El árbol de GitHub vino truncado; no es seguro continuar.';
  var prefijo = nombreBase + '/src/';
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

  // 3b. Solo para el Generador: no autoreemplazarse con una src/ que no pueda volver a traer GitHub.
  if (nombreBase === 'Generador' && !forzar) {
    var traeBajada = nuevos.some(function(f) {
      return f.type === 'SERVER_JS' && f.source.indexOf('function _githubTraerAProyectoApps_') !== -1;
    });
    if (!traeBajada) {
      throw 'Generador/src/ de GitHub no trae _githubTraerAProyectoApps_(): el Generador quedaría sin poder ' +
            'volver a traer GitHub. No se tocó nada. Si es intencional, corre subirGeneradorDesdeGithubForzado().';
    }
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
    throw 'Error al actualizar el proyecto de ' + nombreBase + ' (' + resp.getResponseCode() + '): ' + resp.getContentText();
  }
  // El proyecto ya es igual a GitHub en ese commit: es la referencia para el aviso de pull pendiente.
  _githubGuardarUltimoCommit_(nombreBase, cabezaTraida);

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

  console.log('--- ' + nombreBase + ' desde GitHub ---');
  console.log('Modificados (' + modificados.length + '): ' + (modificados.join(', ') || 'ninguno'));
  console.log('Agregados (' + agregados.length + '): ' + (agregados.join(', ') || 'ninguno'));
  console.log('Eliminados (' + eliminados.length + '): ' + (eliminados.join(', ') || 'ninguno'));
  console.log('Sin cambios: ' + iguales);
  console.log('Respaldo previo en Drive: ' + nombreRespaldo + ' (' + sello + ')');

  _registrarLogGenerador(
    '_githubTraerAProyectoApps_() / ' + nombreBase,
    'Proyecto de ' + nombreBase + ' reemplazado con ' + nombreBase + '/src/ de GitHub. Modificados: ' + modificados.length +
    ' | Agregados: ' + agregados.length + ' | Eliminados: ' + eliminados.length + ' | Sin cambios: ' + iguales,
    []
  );

  // 7. Regenerar respaldos de Drive y dejar GitHub al día (consolidado + índice).
  //    Si justo antes del commit de cierre GitHub recibió cambios en <Nombre>/, _githubSincronizar_ no
  //    escribe y devuelve desfasado: el que llama (_githubTraerAProyectoApps_) trae lo nuevo y reintenta.
  _descargarProyectoAArchivos(nombreBase);
  var sync = _githubSincronizar_(nombreBase);

  return { modificados: modificados, agregados: agregados, eliminados: eliminados, sinCambios: iguales, sync: sync };
}

/**
 * Trae <Nombre>/src/ de GitHub al proyecto de Apps Script (ver _githubTraerAProyectoAppsUnaVez_) y,
 * si mientras corría GitHub recibió cambios en <Nombre>/ y por eso no se pudo escribir el commit de
 * cierre, TRAE LO NUEVO Y REINTENTA, hasta GITHUB_INTENTOS_TRAER_ intentos en total. El respaldo
 * "<Nombre>_antes_de_GitHub.zip" se hace solo en el primer intento. Si tras el último intento la rama
 * sigue moviéndose, no escribe el commit de cierre (no pisa nada) y lo deja en el log: GitHub queda
 * con lo suyo y el proyecto de Apps Script con lo último que alcanzó a traer. El reporte devuelto
 * junta lo hecho en todos los intentos. [→ Contexto_Base_Web.md §PF273]
 */
function _githubTraerAProyectoApps_(nombreBase, forzar) {
  var mod = [], agr = [], eli = [], ultimo = null;
  function sumar(lista, nuevos) { nuevos.forEach(function(n) { if (lista.indexOf(n) === -1) lista.push(n); }); }
  for (var intento = 1; intento <= GITHUB_INTENTOS_TRAER_; intento++) {
    ultimo = _githubTraerAProyectoAppsUnaVez_(nombreBase, forzar, intento > 1);
    // Un archivo agregado en un intento y modificado en el siguiente sigue contando como agregado.
    sumar(agr, ultimo.agregados);
    sumar(mod, ultimo.modificados.filter(function(n) { return agr.indexOf(n) === -1; }));
    sumar(eli, ultimo.eliminados);
    if (!(ultimo.sync && ultimo.sync.desfasado)) break;
    var aviso = intento < GITHUB_INTENTOS_TRAER_
      ? 'Intento ' + intento + ' de ' + GITHUB_INTENTOS_TRAER_ + ': GitHub recibió cambios en ' + nombreBase +
        '/ antes del commit de cierre. Traigo lo nuevo y reintento.'
      : 'Intento ' + intento + ' de ' + GITHUB_INTENTOS_TRAER_ + ': GitHub sigue recibiendo cambios en ' + nombreBase +
        '/. NO se escribió el commit de cierre (no se pisó nada). Espera a que terminen los cambios y vuelve a correr ' +
        _githubFuncionesDeAccion_(nombreBase).traer + '.';
    console.warn('[GitHub] ' + aviso);
    try { _registrarLogGenerador('_githubTraerAProyectoApps_() / ' + nombreBase, aviso, [aviso]); } catch (e) {}
  }
  var total = ultimo.modificados.length + ultimo.agregados.length + ultimo.sinCambios;
  return { modificados: mod, agregados: agr, eliminados: eli,
           sinCambios: Math.max(0, total - mod.length - agr.length),
           intentos: intento > GITHUB_INTENTOS_TRAER_ ? GITHUB_INTENTOS_TRAER_ : intento,
           cierreEscrito: !(ultimo.sync && ultimo.sync.desfasado) };
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

// -----------------------------------------------------------------------------
// Subida puntual de archivos de Drive a GitHub (solo AGREGA, nunca borra)
// [→ Contexto_Base_Web.md §PF080]
// -----------------------------------------------------------------------------

var EVIDENCIA_T05_CARPETA_GITHUB_ = 'Datos descargados/JSON/Anomalías/';
var EVIDENCIA_T05_NOMBRES_ = [
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Grupo乂Terna™ - currentriverrace.json',
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Grupo乂Terna™ - clans.json',
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Mini乂Ternas™ - currentriverrace.json',
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Mini乂Ternas™ - clans.json'
];

/**
 * Copia a GitHub (Datos descargados/JSON/Anomalías/) los 4 archivos de T-05 del 13-09 12.26 que
 * limpiarDuplicadosJSON() mandaría a la papelera. Correrla ANTES del borrado real: una vez en la
 * papelera, getFilesByName() ya no los encuentra. No toca nada en Drive.
 */
function subirEvidenciaT05AGithub() {
  return _githubSubirArchivosDeDrive_(
    EVIDENCIA_T05_NOMBRES_,
    EVIDENCIA_T05_CARPETA_GITHUB_,
    'Datos descargados: T-05 del 13-09 12.26 (grupo乂terna™ y mini乂ternas™), copiados de Drive antes de borrar duplicados'
  );
}

/**
 * Busca cada archivo por nombre exacto en Drive (fuera de la papelera), comprueba que se lee
 * igual que en Drive (mismos bytes) y que es JSON válido, y lo sube en UN solo commit a
 * carpetaDestino de GitHub. El repo es público: si hay un posible secreto o teléfono, no sube nada.
 * Si cualquier archivo falla, no se sube ninguno. Nunca borra archivos del repo.
 */
function _githubSubirArchivosDeDrive_(nombres, carpetaDestino, mensaje) {
  if (!_githubToken_()) throw 'Falta GITHUB_TOKEN: Configuración del proyecto → Propiedades del script.';

  console.log('════════════════════════════════════════════');
  console.log('Subida de ' + nombres.length + ' archivos de Drive a GitHub (' + carpetaDestino + ')');
  console.log('════════════════════════════════════════════');

  var problemas = [];
  var entradas = [];

  nombres.forEach(function(nombre) {
    var it = DriveApp.getFilesByName(nombre);
    var encontrados = [];
    while (it.hasNext()) encontrados.push(it.next());

    if (encontrados.length === 0) {
      problemas.push(nombre + ' → no está en Drive (¿ya está en la papelera?)');
      return;
    }
    if (encontrados.length > 1) {
      problemas.push(nombre + ' → hay ' + encontrados.length + ' archivos con ese nombre en Drive; no sé cuál subir');
      return;
    }

    var archivo = encontrados[0];
    var contenido = archivo.getBlob().getDataAsString('UTF-8');
    var bytesDrive = archivo.getSize();
    var bytesTexto = Utilities.newBlob(contenido, 'text/plain').getBytes().length;
    if (bytesTexto !== bytesDrive) {
      problemas.push(nombre + ' → Drive dice ' + bytesDrive + ' bytes y el texto leído da ' + bytesTexto +
                     ' (no es UTF-8 limpio); no se sube para no alterarlo');
      return;
    }
    try {
      JSON.parse(contenido);
    } catch (e) {
      problemas.push(nombre + ' → no es un JSON válido');
      return;
    }
    var rev = _githubRevisarSecretos_([{ name: nombre, source: contenido }]);
    if (rev.bloqueos.length) {
      problemas.push(nombre + ' → posible secreto: ' + rev.bloqueos.join(', '));
      return;
    }
    if (/\+\d[\d\s-]{7,}\d|\b\d{9,}\b/.test(contenido)) {
      problemas.push(nombre + ' → posible número de teléfono (9 o más dígitos seguidos); revisa el archivo antes de subirlo a un repo público');
      return;
    }

    entradas.push({ path: carpetaDestino + nombre, content: contenido });
    console.log('  · ' + nombre + ' (' + bytesDrive + ' bytes): leído y verificado');
  });

  if (problemas.length) {
    problemas.forEach(function(p) { console.log('  ✗ ' + p); });
    throw 'No se subió nada a GitHub. Problemas (' + problemas.length + '): ' + problemas.join(' | ');
  }

  // El prefijo '(sin borrar)/' no coincide con ninguna ruta real y rutasAntiguas va vacío:
  // así _githubCommitArchivos_ solo agrega y no borra nada del repo.
  var res = _githubCommitArchivos_(entradas, '(sin borrar)/', [], mensaje);
  var texto = res.sinCambios
    ? 'Sin cambios: GitHub ya tenía estos ' + entradas.length + ' archivos idénticos (no se creó commit).'
    : 'Subidos ' + entradas.length + ' archivos en el commit ' + res.commit.substring(0, 7) + '.';
  console.log(texto);
  console.log('Falta hacer pull de Backend en GitHub Desktop para verlos en tu equipo.');
  return texto;
}