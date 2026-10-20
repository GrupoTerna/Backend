// =============================================================================
// 11_Imagenes_API.gs
// Descarga a GitHub (repo GrupoTerna/Web) las imágenes de la API de Supercell
// y las guarda en las carpetas `api`, junto a las de `Fankit`.
// [→ Contexto_Base_Web.md §PF130]
//
//  Regla de la usuaria (19-oct-2026): donde hay una carpeta `Fankit` debe haber,
//  al lado, una carpeta `api`. Orden de uso en la web: enlace de la API → copia
//  en `api` → copia en `Fankit`.
//
//  De dónde salen los enlaces: (1) de los CSV que ya están en Drive
//  (Backup_Cards.csv, Backup_Cards_2.csv, Backup_Insignias.csv y
//  Backup_Insignias_2.csv) y (2) de los JSON de jugadores de la carpeta
//  «players» (CARPETA_PLAYERS_ID_, 04_Organizador_JSON.gs), que
//  imagenesApiEscanearJsonPlayers() recorre y resume en el archivo de Drive
//  Imagenes_API_Urls.txt (una dirección por línea). Se buscan TODAS las
//  direcciones de api-assets.clashroyale.com que aparezcan, sin depender de columnas.
//
//  Dónde se guardan (nombre del archivo = el de la dirección, que es único):
//    cards/, cardevolutions/, cardheroes/  → assets/cards/api/<archivo>
//    playerbadges/                          → assets/playerbadges/api/<archivo>
//
//  Funciones para correr desde el editor:
//    - imagenesApiEscanearJsonPlayers(): recorre los JSON de players y guarda las direcciones
//                                    en Imagenes_API_Urls.txt; reanudable (vuelve a correrla
//                                    hasta que diga «TERMINADO»). Correrla ANTES de subir.
//    - imagenesApiReiniciarEscaneoJson(): olvida el avance del escaneo (no borra el archivo).
//    - imagenesApiProbar():          solo cuenta y muestra qué faltaría; no escribe en GitHub.
//    - imagenesApiCartasAGithub():   cartas, evoluciones y héroes.
//    - imagenesApiInsigniasAGithub(): insignias de jugador.
//    - imagenesApiAGithub():         las dos categorías.
//    - carpetasApiJuntoAFankit():    crea `api/LEEME.txt` donde haya `Fankit` y falte `api`.
//
//  Es REANUDABLE: omite lo que ya está en GitHub, y cada corrida procesa un
//  tope (60 archivos, 12 MB o 2 minutos de descarga). Si queda algo, el registro lo dice: se vuelve
//  a correr la misma función. Solo AGREGA archivos: nunca borra nada del repo.
//
//  TOKEN: el mismo GITHUB_TOKEN de 08_GitHub.gs, pero debe tener acceso al repo
//  Web (Contents: Read and write). Si se prefiere uno aparte, se guarda como
//  GITHUB_TOKEN_WEB y tiene prioridad.
// =============================================================================

var IMGAPI_REPO_   = 'Web';
var IMGAPI_BRANCH_ = 'main';

// Solo se descargan direcciones con esta forma exacta (evita bajar cualquier cosa
// y evita rutas raras al armar el nombre del archivo).
var IMGAPI_REGEX_URL_ = /https:\/\/api-assets\.clashroyale\.com\/(cards|cardevolutions|cardheroes|playerbadges)\/(\d+)\/([A-Za-z0-9_-]+\.(?:png|webp|jpg))/g;

var IMGAPI_DESTINOS_ = {
  cards:          'assets/cards/api/',
  cardevolutions: 'assets/cards/api/',
  cardheroes:     'assets/cards/api/',
  playerbadges:   'assets/playerbadges/api/'
};

var IMGAPI_CSV_CARTAS_      = ['Backup_Cards.csv', 'Backup_Cards_2.csv'];
var IMGAPI_CSV_INSIGNIAS_   = ['Backup_Insignias.csv', 'Backup_Insignias_2.csv'];

// Acumulador de direcciones sacadas de los JSON de players, y estado del escaneo.
var IMGAPI_ARCHIVO_URLS_    = 'Imagenes_API_Urls.txt';
var IMGAPI_PROP_ESCANEO_    = 'IMGAPI_ESCANEO_JSON_V1';
var IMGAPI_ESCANEO_MS_      = 4 * 60 * 1000;

var IMGAPI_CATEGORIAS_ = {
  cartas:    { cards: 1, cardevolutions: 1, cardheroes: 1 },
  insignias: { playerbadges: 1 }
};

// Topes por corrida (Apps Script corta a los 6 minutos).
// La subida a GitHub tarda más que la descarga (127 cartas = 5,5 min en la primera corrida real), y el
// tope de tiempo solo vigila la descarga: por eso los topes son bajos, para que la corrida entera
// quede muy por debajo de los 6 minutos de Apps Script.
var IMGAPI_MAX_ARCHIVOS_ = 60;
var IMGAPI_MAX_BYTES_    = 12 * 1024 * 1024;
var IMGAPI_MAX_MS_       = 2 * 60 * 1000;
var IMGAPI_LOTE_         = 15;

// -----------------------------------------------------------------------------
// Puntos de entrada
// -----------------------------------------------------------------------------

function imagenesApiProbar() {
  return _imgApiEjecutar_(['cartas', 'insignias'], true);
}

function imagenesApiCartasAGithub() {
  return _imgApiEjecutar_(['cartas'], false);
}

function imagenesApiInsigniasAGithub() {
  return _imgApiEjecutar_(['insignias'], false);
}

function imagenesApiAGithub() {
  return _imgApiEjecutar_(['cartas', 'insignias'], false);
}

/** Crea api/LEEME.txt junto a cada carpeta Fankit que no tenga su `api` al lado. */
function carpetasApiJuntoAFankit() {
  var ctx = _imgApiContexto_();
  var entradas = _imgApiCarpetasApiFaltantes_(ctx.rutas);
  if (!entradas.length) {
    console.log('Todas las carpetas Fankit ya tienen su carpeta api al lado.');
    return 'Sin cambios.';
  }
  var res = _imgApiCommit_(ctx, entradas, 'Carpetas api junto a cada carpeta Fankit (con LEEME.txt)');
  var texto = 'Se crearon ' + entradas.length + ' carpetas api (commit ' + res.commit.substring(0, 7) + '): ' +
              entradas.map(function(e) { return e.path.replace('/LEEME.txt', ''); }).join(', ');
  console.log(texto);
  console.log('Falta hacer pull de Web en GitHub Desktop.');
  return texto;
}

// -----------------------------------------------------------------------------
// Flujo principal
// -----------------------------------------------------------------------------

function _imgApiEjecutar_(grupos, soloProbar) {
  var inicio = Date.now();
  var ctx = _imgApiContexto_();

  // 1) Direcciones únicas desde los CSV de Drive.
  var nombresCsv = [];
  if (grupos.indexOf('cartas') !== -1)    nombresCsv = nombresCsv.concat(IMGAPI_CSV_CARTAS_);
  if (grupos.indexOf('insignias') !== -1) nombresCsv = nombresCsv.concat(IMGAPI_CSV_INSIGNIAS_);
  nombresCsv.push(IMGAPI_ARCHIVO_URLS_); // direcciones de los JSON de players (si ya se escanearon)
  var urls = _imgApiRecolectarUrls_(nombresCsv).filter(function(u) {
    return grupos.some(function(g) { return IMGAPI_CATEGORIAS_[g][u.categoria]; });
  });

  var porCategoria = {};
  urls.forEach(function(u) { porCategoria[u.categoria] = (porCategoria[u.categoria] || 0) + 1; });
  console.log('Direcciones únicas encontradas: ' + urls.length + ' ' + JSON.stringify(porCategoria));

  // 2) Cuáles faltan en GitHub (por ruta destino).
  var faltan = urls.filter(function(u) { return !ctx.rutas[u.destino]; });
  console.log('Ya están en GitHub: ' + (urls.length - faltan.length) + ' | faltan: ' + faltan.length);

  if (soloProbar) {
    var carpetas = _imgApiCarpetasApiFaltantes_(ctx.rutas).map(function(e) { return e.path.replace('/LEEME.txt', ''); });
    var t = 'Prueba sin escribir. Faltan ' + faltan.length + ' imágenes de ' + urls.length +
            (carpetas.length ? '; faltan carpetas api en: ' + carpetas.join(', ') : '; todas las carpetas Fankit tienen su api.');
    console.log(t);
    return t;
  }

  // 3) Descarga en lotes, con topes de archivos, bytes y tiempo.
  var entradas = [], bytes = 0, fallos = [], procesadas = 0;
  for (var i = 0; i < faltan.length; i += IMGAPI_LOTE_) {
    if (entradas.length >= IMGAPI_MAX_ARCHIVOS_ || bytes >= IMGAPI_MAX_BYTES_ || (Date.now() - inicio) > IMGAPI_MAX_MS_) break;
    var lote = faltan.slice(i, i + IMGAPI_LOTE_);
    var reqs = lote.map(function(u) { return { url: u.url, method: 'get', muteHttpExceptions: true, followRedirects: true }; });
    var resps = UrlFetchApp.fetchAll(reqs);
    for (var k = 0; k < resps.length; k++) {
      procesadas++;
      var u = lote[k], r = resps[k];
      var code = r.getResponseCode();
      if (code !== 200) { fallos.push(u.url + ' → HTTP ' + code); continue; }
      var tipo = String(r.getHeaders()['Content-Type'] || r.getHeaders()['content-type'] || '');
      var datos = r.getContent();
      if (tipo.indexOf('image/') !== 0 || !datos || datos.length < 100) {
        fallos.push(u.url + ' → no parece una imagen (' + tipo + ', ' + (datos ? datos.length : 0) + ' bytes)');
        continue;
      }
      entradas.push({ path: u.destino, base64: Utilities.base64Encode(datos), bytes: datos.length });
      bytes += datos.length;
    }
  }
  var pendientes = faltan.length - procesadas;

  // Las carpetas api que falten junto a Fankit se crean en el mismo commit.
  var nuevasRutas = {};
  entradas.forEach(function(e) { nuevasRutas[e.path] = true; });
  var conLeeme = _imgApiCarpetasApiFaltantes_(Object.assign({}, ctx.rutas, nuevasRutas));

  if (!entradas.length && !conLeeme.length) {
    var vacio = fallos.length
      ? 'No se descargó ninguna imagen. Fallos (' + fallos.length + '): ' + fallos.slice(0, 5).join(' | ')
      : 'No hay nada por descargar: GitHub ya tiene todas las imágenes.';
    console.log(vacio);
    return vacio;
  }

  var res = _imgApiCommit_(ctx, entradas.concat(conLeeme),
    'Imágenes de la API de Supercell en las carpetas api (' + entradas.length + ' archivos)');

  var mb = (bytes / 1048576).toFixed(1);
  var texto = 'Subidas ' + entradas.length + ' imágenes (' + mb + ' MB) y ' + conLeeme.length + ' carpetas api nuevas en el commit ' +
              res.commit.substring(0, 7) + '.';
  if (pendientes > 0) texto += ' QUEDAN ' + pendientes + ' por subir: vuelve a correr la misma función.';
  if (fallos.length) {
    texto += ' Fallos: ' + fallos.length + ' (se reintentan en la próxima corrida).';
    fallos.slice(0, 10).forEach(function(f) { console.log('  ✗ ' + f); });
  }
  console.log(texto);
  console.log('Falta hacer pull de Web en GitHub Desktop.');
  return texto;
}

// -----------------------------------------------------------------------------
// Escaneo de los JSON de players (reanudable)
// -----------------------------------------------------------------------------

/** Archivo acumulador en Drive (raíz); lo crea vacío si no existe. Si hay varios con el mismo nombre usa el más reciente. */
function _imgApiArchivoUrls_() {
  var it = DriveApp.getFilesByName(IMGAPI_ARCHIVO_URLS_);
  var archivos = [];
  while (it.hasNext()) archivos.push(it.next());
  if (!archivos.length) return DriveApp.createFile(IMGAPI_ARCHIVO_URLS_, '', 'text/plain');
  archivos.sort(function(a, b) { return b.getLastUpdated().getTime() - a.getLastUpdated().getTime(); });
  return archivos[0];
}

/**
 * Recorre la carpeta «players» (los .json de jugadores) y suma al archivo Imagenes_API_Urls.txt
 * todas las direcciones de imágenes de la API que encuentre (se leen con una expresión regular,
 * sin interpretar el JSON). Solo lee Drive; no toca GitHub. Se corta a los 4 minutos y guarda el
 * punto de avance: se vuelve a correr hasta que el registro diga «TERMINADO».
 */
function imagenesApiEscanearJsonPlayers() {
  var inicio = Date.now();
  var props = PropertiesService.getScriptProperties();
  var estado = {};
  try { estado = JSON.parse(props.getProperty(IMGAPI_PROP_ESCANEO_) || '{}'); } catch (e) { estado = {}; }
  var escaneados = estado.escaneados || 0;

  var archivoUrls = _imgApiArchivoUrls_();
  var conocidas = {};
  archivoUrls.getBlob().getDataAsString('UTF-8').split('\n').forEach(function(l) { l = l.trim(); if (l) conocidas[l] = true; });
  var antes = Object.keys(conocidas).length;

  var it;
  if (estado.token) {
    try { it = DriveApp.continueFileIterator(estado.token); }
    catch (e) { console.log('No se pudo retomar el avance guardado (' + e + '); se empieza de nuevo.'); estado = {}; escaneados = 0; }
  }
  if (!it) it = DriveApp.getFolderById(CARPETA_PLAYERS_ID_).getFiles();

  var terminado = true;
  var hechosEstaVez = 0;
  while (it.hasNext()) {
    if (Date.now() - inicio > IMGAPI_ESCANEO_MS_) { terminado = false; break; }
    var archivo = it.next();
    if (archivo.getName().slice(-5).toLowerCase() !== '.json') continue;
    var texto = archivo.getBlob().getDataAsString('UTF-8');
    var m;
    IMGAPI_REGEX_URL_.lastIndex = 0;
    while ((m = IMGAPI_REGEX_URL_.exec(texto)) !== null) conocidas[m[0]] = true;
    escaneados++;
    hechosEstaVez++;
  }

  var lista = Object.keys(conocidas).sort();
  archivoUrls.setContent(lista.join('\n') + '\n');
  var nuevas = lista.length - antes;

  if (terminado) props.deleteProperty(IMGAPI_PROP_ESCANEO_);
  else props.setProperty(IMGAPI_PROP_ESCANEO_, JSON.stringify({ token: it.getContinuationToken(), escaneados: escaneados }));

  var texto2 = (terminado ? 'TERMINADO. ' : 'Falta recorrer más archivos: vuelve a correr la función. ') +
               'Esta vez se leyeron ' + hechosEstaVez + ' JSON (' + escaneados + ' en total) y se sumaron ' + nuevas +
               ' direcciones nuevas; ' + lista.length + ' en ' + IMGAPI_ARCHIVO_URLS_ + '.';
  console.log(texto2);
  return texto2;
}

/** Olvida el avance del escaneo para volver a empezar desde el primer archivo. No borra Imagenes_API_Urls.txt. */
function imagenesApiReiniciarEscaneoJson() {
  PropertiesService.getScriptProperties().deleteProperty(IMGAPI_PROP_ESCANEO_);
  console.log('Avance del escaneo borrado.');
}

// -----------------------------------------------------------------------------
// Lectura de los CSV de Drive
// -----------------------------------------------------------------------------

/** Busca cada CSV por nombre (si hay varios, usa el más reciente) y junta las direcciones únicas. */
function _imgApiRecolectarUrls_(nombresCsv) {
  var vistas = {};
  var lista = [];
  var destinosUsados = {};
  var repetidas = 0, ejemplosRepetidas = [];
  nombresCsv.forEach(function(nombre) {
    var it = DriveApp.getFilesByName(nombre);
    var archivos = [];
    while (it.hasNext()) archivos.push(it.next());
    if (!archivos.length) { console.log('  · ' + nombre + ': no está en Drive; se omite.'); return; }
    archivos.sort(function(a, b) { return b.getLastUpdated().getTime() - a.getLastUpdated().getTime(); });
    if (archivos.length > 1) console.log('  · ' + nombre + ': hay ' + archivos.length + ' archivos con ese nombre; se usa el más reciente.');
    var texto = archivos[0].getBlob().getDataAsString('UTF-8');
    var antes = lista.length;
    var m;
    IMGAPI_REGEX_URL_.lastIndex = 0;
    while ((m = IMGAPI_REGEX_URL_.exec(texto)) !== null) {
      var url = m[0];
      if (vistas[url]) continue;
      vistas[url] = true;
      var destino = IMGAPI_DESTINOS_[m[1]] + m[3];
      if (destinosUsados[destino]) {
        // Mismo nombre de archivo bajo otra categoría (por ejemplo la evolución que usa el mismo PNG
        // que la carta): el nombre es un hash del contenido, así que es la misma imagen; se baja una vez.
        repetidas++;
        if (ejemplosRepetidas.length < 3) ejemplosRepetidas.push(m[1] + '/' + m[3]);
        continue;
      }
      destinosUsados[destino] = true;
      lista.push({ url: url, categoria: m[1], destino: destino });
    }
    console.log('  · ' + nombre + ': ' + (lista.length - antes) + ' direcciones nuevas.');
  });
  if (repetidas) {
    console.log('  · ' + repetidas + ' direcciones repetidas (mismo archivo bajo otra categoría o en otro CSV con otra ruta); se bajan una sola vez. Ejemplos: ' +
                ejemplosRepetidas.join(', '));
  }
  return lista;
}

// -----------------------------------------------------------------------------
// GitHub (repo Web): solo agrega archivos
// -----------------------------------------------------------------------------

function _imgApiToken_() {
  var p = PropertiesService.getScriptProperties();
  return p.getProperty('GITHUB_TOKEN_WEB') || p.getProperty('GITHUB_TOKEN') || '';
}

function _imgApiReq_(metodo, ruta, payload, accept) {
  var req = {
    url: 'https://api.github.com/repos/' + GITHUB_OWNER_ + '/' + IMGAPI_REPO_ + ruta,
    method: metodo,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + _imgApiToken_(),
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

function _imgApiJson_(req) {
  var resp = UrlFetchApp.fetchAll([req])[0];
  var code = resp.getResponseCode();
  if (code < 200 || code >= 300) {
    var msg = resp.getContentText();
    if (msg.length > 300) msg = msg.substring(0, 300);
    throw 'GitHub (Web) ' + req.method + ' ' + req.url.replace('https://api.github.com', '') + ' → HTTP ' + code +
          ': ' + msg + (code === 404 || code === 403 ? ' (¿el token tiene acceso al repo Web con Contents: Read and write?)' : '');
  }
  return JSON.parse(resp.getContentText());
}

/** Lee la rama y el árbol completo de Web. Devuelve { commitSha, treeSha, rutas: {ruta: true}, carpetas: [...] }. */
function _imgApiContexto_() {
  if (!_imgApiToken_()) throw 'Falta GITHUB_TOKEN (o GITHUB_TOKEN_WEB): Configuración del proyecto → Propiedades del script.';
  var ref = _imgApiJson_(_imgApiReq_('get', '/git/ref/heads/' + IMGAPI_BRANCH_));
  var commit = _imgApiJson_(_imgApiReq_('get', '/git/commits/' + ref.object.sha));
  var arbol = _imgApiJson_(_imgApiReq_('get', '/git/trees/' + commit.tree.sha + '?recursive=1'));
  if (arbol.truncated) throw 'El árbol del repo Web vino truncado; no se puede saber qué imágenes ya existen. No se hizo nada.';
  var rutas = {};
  var carpetas = [];
  (arbol.tree || []).forEach(function(n) {
    if (n.type === 'blob') rutas[n.path] = true;
    else if (n.type === 'tree') carpetas.push(n.path);
  });
  return { commitSha: ref.object.sha, treeSha: commit.tree.sha, rutas: rutas, carpetas: carpetas };
}

/**
 * Para cada carpeta llamada `Fankit` (en cualquier nivel) devuelve la entrada api/LEEME.txt
 * si en el mismo nivel no hay ningún archivo bajo `api/`. Entradas: { path, texto }.
 * Como git no guarda carpetas vacías, la carpeta api «existe» si tiene al menos un archivo.
 */
function _imgApiCarpetasApiFaltantes_(rutas) {
  var carpetasFankit = {};
  Object.keys(rutas).forEach(function(ruta) {
    var partes = ruta.split('/');
    for (var i = 0; i < partes.length - 1; i++) {
      if (partes[i] === 'Fankit') carpetasFankit[partes.slice(0, i).join('/')] = true;
    }
  });
  var salida = [];
  Object.keys(carpetasFankit).forEach(function(padre) {
    var prefijoApi = (padre ? padre + '/' : '') + 'api/';
    var existe = Object.keys(rutas).some(function(r) { return r.indexOf(prefijoApi) === 0; });
    if (existe) return;
    salida.push({
      path: prefijoApi + 'LEEME.txt',
      texto: 'Carpeta reservada para imágenes descargadas desde la API de Supercell (api-assets.clashroyale.com).\n' +
             'Va al lado de la carpeta Fankit. Orden de uso: enlace de la API, luego esta carpeta (api), luego Fankit.\n' +
             'La llena la función imagenesApiAGithub() del Generador. Ver §PF130 de Contexto_Base_Web.md (repo Backend).\n'
    });
  });
  return salida;
}

/** Sube las entradas (con base64 o texto) en UN commit sobre la rama; nunca borra. Reintenta una vez si la rama se movió. */
function _imgApiCommit_(ctx, entradas, mensaje) {
  var items = [];
  for (var i = 0; i < entradas.length; i += IMGAPI_LOTE_) {
    var lote = entradas.slice(i, i + IMGAPI_LOTE_);
    var reqs = lote.map(function(e) {
      return _imgApiReq_('post', '/git/blobs',
        e.base64 ? { content: e.base64, encoding: 'base64' } : { content: e.texto, encoding: 'utf-8' });
    });
    var resps = UrlFetchApp.fetchAll(reqs);
    for (var k = 0; k < resps.length; k++) {
      var code = resps[k].getResponseCode();
      if (code < 200 || code >= 300) {
        throw 'GitHub (Web) POST /git/blobs → HTTP ' + code + ': ' + resps[k].getContentText().substring(0, 200);
      }
      items.push({ path: lote[k].path, mode: '100644', type: 'blob', sha: JSON.parse(resps[k].getContentText()).sha });
    }
  }

  for (var intento = 0; intento < 2; intento++) {
    var cabeza = intento === 0 ? { commitSha: ctx.commitSha, treeSha: ctx.treeSha } : _imgApiContexto_();
    var arbolNuevo = _imgApiJson_(_imgApiReq_('post', '/git/trees', { base_tree: cabeza.treeSha, tree: items }));
    var commitNuevo = _imgApiJson_(_imgApiReq_('post', '/git/commits',
      { message: mensaje, tree: arbolNuevo.sha, parents: [cabeza.commitSha] }));
    try {
      _imgApiJson_(_imgApiReq_('patch', '/git/refs/heads/' + IMGAPI_BRANCH_, { sha: commitNuevo.sha }));
      return { commit: commitNuevo.sha };
    } catch (e) {
      if (intento === 1) throw e;
      console.log('La rama de Web cambió mientras se subía; se reintenta una vez sobre lo más reciente.');
    }
  }
}
