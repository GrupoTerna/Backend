// =============================================================================
// 11_Imagenes_API.gs
// Descarga a GitHub (repo GrupoTerna/Web) las imágenes de la API de Supercell
// y las guarda en las carpetas API, junto a las de Fankit:
// assets/Imágenes/<tipo>/{API,Fankit}.
// [→ Contexto_Base_Web.md §PF130]
//
//  Regla de la usuaria (19-oct-2026; rutas nuevas desde el 20-oct-2026): donde hay una
//  carpeta Fankit debe haber, al lado, una carpeta API (en mayúscula: GitHub Pages
//  distingue mayúsculas). Orden de uso en la web: enlace de la API → copia en API →
//  copia en Fankit.
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
//    cards/, cardevolutions/, cardheroes/  → assets/Imágenes/cards/API/<archivo>
//    playerbadges/ (maestrías: el nombre empieza con Mastery)
//                                           → assets/Imágenes/badges/API/Maestrías/<archivo>
//    playerbadges/ (todas las demás)        → assets/Imágenes/badges/API/Insignias/<archivo>
//
//  Cómo se sabe si una insignia es maestría (20-oct-2026): la dirección solo trae un hash, el
//  nombre (por ejemplo MasteryArcher) está en la columna Name de Backup_Insignias.csv y en cada
//  insignia de los JSON de players. imagenesApiEscanearJsonPlayers() anota ese tipo, junto con el
//  archivo, en Imagenes_API_Insignias_Tipos.txt (una línea por insignia: M o I, tabulador y
//  archivo). Una insignia que no esté en ninguna de las dos fuentes NO se descarga (para no
//  guardarla en la carpeta equivocada): el registro avisa cuántas son y qué hacer.
//
//  Funciones para correr desde el editor:
//    - imagenesApiEscanearJsonPlayers(): recorre los JSON de players y guarda las direcciones
//                                    en Imagenes_API_Urls.txt y el tipo de cada insignia en
//                                    Imagenes_API_Insignias_Tipos.txt; reanudable (vuelve a
//                                    correrla hasta que diga «TERMINADO»). Correrla ANTES de subir.
//    - imagenesApiReiniciarEscaneoJson(): olvida el avance del escaneo (no borra los archivos).
//                                    Hay que usarla una vez para que el escaneo vuelva a pasar
//                                    por los JSON ya leídos y anote los tipos de insignia.
//    - imagenesApiProbar():          solo cuenta y muestra qué faltaría; no escribe en GitHub.
//    - imagenesApiCartasAGithub():   cartas, evoluciones y héroes.
//    - imagenesApiInsigniasAGithub(): insignias de jugador.
//    - imagenesApiAGithub():         las dos categorías.
//    - carpetasApiJuntoAFankit():    crea API/LEEME.txt donde haya Fankit y falte API.
//    - imagenesApiReintentarNoDisponibles(): vacía la lista de direcciones con HTTP 404 (ver abajo)
//                                    para que la próxima corrida vuelva a probarlas.
//
//  Direcciones que el CDN ya no tiene (HTTP 404, «NoSuchKey»; 20-oct-2026): se anotan una vez en el
//  archivo de Drive Imagenes_API_No_Disponibles.txt (raíz; una dirección por línea) y las corridas
//  siguientes las omiten, en vez de contarlas como «Fallos» en cada ejecución. Solo el 404 entra en
//  esa lista: un 403, un 5xx, un tiempo agotado o una respuesta que no es imagen siguen contando
//  como fallos y se reintentan.
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
  cards:          'assets/Imágenes/cards/API/',
  cardevolutions: 'assets/Imágenes/cards/API/',
  cardheroes:     'assets/Imágenes/cards/API/'
};

// Insignias de jugador (playerbadges): el destino depende del tipo, no de la categoría.
var IMGAPI_DESTINO_MAESTRIAS_ = 'assets/Imágenes/badges/API/Maestrías/';
var IMGAPI_DESTINO_INSIGNIAS_ = 'assets/Imágenes/badges/API/Insignias/';
var IMGAPI_PREFIJO_MAESTRIA_  = 'Mastery';
var IMGAPI_ARCHIVO_TIPOS_     = 'Imagenes_API_Insignias_Tipos.txt';

// En los JSON de players: "name": "MasteryArcher", ..., "iconUrls": {"large": "https://.../playerbadges/512/<archivo>"}.
// [^{}]*? no cruza llaves, así que nombre y dirección son siempre de la misma insignia.
var IMGAPI_REGEX_INSIGNIA_ = /"name"\s*:\s*"([^"]+)"[^{}]*?"iconUrls"\s*:\s*\{\s*"large"\s*:\s*"https:\/\/api-assets\.clashroyale\.com\/playerbadges\/\d+\/([A-Za-z0-9_-]+\.(?:png|webp|jpg))"/g;

var IMGAPI_CSV_CARTAS_      = ['Backup_Cards.csv', 'Backup_Cards_2.csv'];
var IMGAPI_CSV_INSIGNIAS_   = ['Backup_Insignias.csv', 'Backup_Insignias_2.csv'];

// Acumulador de direcciones sacadas de los JSON de players, y estado del escaneo.
var IMGAPI_ARCHIVO_URLS_    = 'Imagenes_API_Urls.txt';
var IMGAPI_PROP_ESCANEO_    = 'IMGAPI_ESCANEO_JSON_V1';

// Direcciones que el CDN respondió con HTTP 404: se omiten en las corridas siguientes.
var IMGAPI_ARCHIVO_404_     = 'Imagenes_API_No_Disponibles.txt';
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

/** Crea API/LEEME.txt junto a cada carpeta Fankit que no tenga su carpeta API al lado. */
function carpetasApiJuntoAFankit() {
  var ctx = _imgApiContexto_();
  var entradas = _imgApiCarpetasApiFaltantes_(ctx.rutas);
  if (!entradas.length) {
    console.log('Todas las carpetas Fankit ya tienen su carpeta API al lado.');
    return 'Sin cambios.';
  }
  var res = _imgApiCommit_(ctx, entradas, 'Carpetas API junto a cada carpeta Fankit (con LEEME.txt)');
  var texto = 'Se crearon ' + entradas.length + ' carpetas API (commit ' + res.commit.substring(0, 7) + '): ' +
              entradas.map(function(e) { return e.path.replace('/LEEME.txt', ''); }).join(', ');
  console.log(texto);
  console.log('Falta hacer pull de Web en GitHub Desktop.');
  return texto;
}

/**
 * Vacía la lista de direcciones no disponibles (manda a la papelera de Drive el archivo
 * Imagenes_API_No_Disponibles.txt; se puede recuperar desde ahí). La próxima corrida vuelve a
 * probar esas direcciones y, las que sigan dando 404, las anota otra vez.
 */
function imagenesApiReintentarNoDisponibles() {
  var it = DriveApp.getFilesByName(IMGAPI_ARCHIVO_404_);
  var n = 0;
  while (it.hasNext()) { it.next().setTrashed(true); n++; }
  var texto = n
    ? 'Lista de no disponibles a la papelera (' + n + ' archivo' + (n === 1 ? '' : 's') + '). La próxima corrida vuelve a probar esas direcciones.'
    : 'No hay lista de no disponibles; no hay nada que vaciar.';
  console.log(texto);
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
  var faltanTodas = urls.filter(function(u) { return !ctx.rutas[u.destino]; });
  // Las que el CDN ya respondió con 404 en una corrida anterior no se vuelven a pedir.
  var noDisp = _imgApiLeerNoDisponibles_();
  var faltan = faltanTodas.filter(function(u) { return !noDisp.mapa[u.url]; });
  var omitidas404 = faltanTodas.length - faltan.length;
  console.log('Ya están en GitHub: ' + (urls.length - faltanTodas.length) + ' | faltan: ' + faltan.length +
              (omitidas404 ? ' | no disponibles en origen (HTTP 404, se omiten): ' + omitidas404 : ''));

  if (soloProbar) {
    var carpetas = _imgApiCarpetasApiFaltantes_(ctx.rutas).map(function(e) { return e.path.replace('/LEEME.txt', ''); });
    var t = 'Prueba sin escribir. Faltan ' + faltan.length + ' imágenes de ' + urls.length +
            (omitidas404 ? ' (' + omitidas404 + ' más dan 404 en el CDN y se omiten)' : '') +
            (carpetas.length ? '; faltan carpetas API en: ' + carpetas.join(', ') : '; todas las carpetas Fankit tienen su API.');
    console.log(t);
    return t;
  }

  // 3) Descarga en lotes, con topes de archivos, bytes y tiempo.
  var entradas = [], bytes = 0, fallos = [], nuevas404 = [], procesadas = 0;
  for (var i = 0; i < faltan.length; i += IMGAPI_LOTE_) {
    if (entradas.length >= IMGAPI_MAX_ARCHIVOS_ || bytes >= IMGAPI_MAX_BYTES_ || (Date.now() - inicio) > IMGAPI_MAX_MS_) break;
    var lote = faltan.slice(i, i + IMGAPI_LOTE_);
    var reqs = lote.map(function(u) { return { url: u.url, method: 'get', muteHttpExceptions: true, followRedirects: true }; });
    var resps = UrlFetchApp.fetchAll(reqs);
    for (var k = 0; k < resps.length; k++) {
      procesadas++;
      var u = lote[k], r = resps[k];
      var code = r.getResponseCode();
      if (code === 404) { nuevas404.push(u.url); continue; }
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

  // Los 404 se guardan aunque no haya nada que subir. Si Drive falla, se avisa y se sigue con lo demás.
  if (nuevas404.length) {
    try {
      _imgApiGuardarNoDisponibles_(noDisp, nuevas404);
      console.log('Sin copia en el CDN (HTTP 404): ' + nuevas404.length + ' direcciones nuevas; quedaron en ' +
                  IMGAPI_ARCHIVO_404_ + ' y ya no se vuelven a pedir.');
    } catch (e) {
      console.log('No se pudo guardar ' + IMGAPI_ARCHIVO_404_ + ' (' + e + '); esas ' + nuevas404.length + ' direcciones se volverán a pedir.');
    }
    nuevas404.slice(0, 40).forEach(function(f) { console.log('  · 404: ' + f); });
    if (nuevas404.length > 40) console.log('  · … y ' + (nuevas404.length - 40) + ' más (están todas en ' + IMGAPI_ARCHIVO_404_ + ').');
  }

  // Las carpetas API que falten junto a Fankit se crean en el mismo commit.
  var nuevasRutas = {};
  entradas.forEach(function(e) { nuevasRutas[e.path] = true; });
  var conLeeme = _imgApiCarpetasApiFaltantes_(Object.assign({}, ctx.rutas, nuevasRutas));

  if (!entradas.length && !conLeeme.length) {
    var vacio;
    if (fallos.length) {
      vacio = 'No se descargó ninguna imagen. Fallos (' + fallos.length + '): ' + fallos.slice(0, 5).join(' | ');
    } else if (nuevas404.length) {
      vacio = 'No hay nada por subir: ' + nuevas404.length + ' direcciones dieron HTTP 404 (el CDN ya no las tiene) y pasaron a la lista de no disponibles. GitHub ya tiene todo lo demás.';
    } else {
      vacio = 'No hay nada por descargar: GitHub ya tiene todas las imágenes' +
              (omitidas404 ? ' (' + omitidas404 + ' dan 404 en el CDN y se omiten)' : '') + '.';
    }
    console.log(vacio);
    return vacio;
  }

  var res = _imgApiCommit_(ctx, entradas.concat(conLeeme),
    'Imágenes de la API de Supercell en las carpetas API (' + entradas.length + ' archivos)');

  var mb = (bytes / 1048576).toFixed(1);
  var texto = 'Subidas ' + entradas.length + ' imágenes (' + mb + ' MB) y ' + conLeeme.length + ' carpetas API nuevas en el commit ' +
              res.commit.substring(0, 7) + '.';
  if (pendientes > 0) texto += ' QUEDAN ' + pendientes + ' por subir: vuelve a correr la misma función.';
  if (nuevas404.length) texto += ' ' + nuevas404.length + ' dieron HTTP 404 y pasaron a la lista de no disponibles.';
  if (fallos.length) {
    texto += ' Fallos: ' + fallos.length + ' (se reintentan en la próxima corrida).';
    fallos.slice(0, 10).forEach(function(f) { console.log('  ✗ ' + f); });
  }
  console.log(texto);
  console.log('Falta hacer pull de Web en GitHub Desktop.');
  return texto;
}

// -----------------------------------------------------------------------------
// Lista de direcciones no disponibles en el CDN (HTTP 404)
// -----------------------------------------------------------------------------

/** Lee Imagenes_API_No_Disponibles.txt (si hay varios, el más reciente). No lo crea. Devuelve { archivo: File|null, mapa: {url: true} }. */
function _imgApiLeerNoDisponibles_() {
  var it = DriveApp.getFilesByName(IMGAPI_ARCHIVO_404_);
  var archivos = [];
  while (it.hasNext()) archivos.push(it.next());
  var mapa = {};
  if (!archivos.length) return { archivo: null, mapa: mapa };
  archivos.sort(function(a, b) { return b.getLastUpdated().getTime() - a.getLastUpdated().getTime(); });
  archivos[0].getBlob().getDataAsString('UTF-8').split('\n').forEach(function(l) { l = l.trim(); if (l) mapa[l] = true; });
  return { archivo: archivos[0], mapa: mapa };
}

/** Suma las direcciones nuevas a la lista (ordenada, una por línea) y la guarda; crea el archivo si no existía. Solo agrega. */
function _imgApiGuardarNoDisponibles_(actual, nuevas) {
  var mapa = actual.mapa;
  nuevas.forEach(function(u) { mapa[u] = true; });
  var texto = Object.keys(mapa).sort().join('\n') + '\n';
  if (actual.archivo) actual.archivo.setContent(texto);
  else actual.archivo = DriveApp.createFile(IMGAPI_ARCHIVO_404_, texto, 'text/plain');
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

  // Tipo de cada insignia (M = maestría, I = insignia), por nombre de archivo.
  var archivoTipos = _imgApiArchivoTipos_();
  var tiposConocidos = {};
  archivoTipos.getBlob().getDataAsString('UTF-8').split('\n').forEach(function(l) {
    var partes = l.trim().split('\t');
    if (partes.length === 2 && (partes[0] === 'M' || partes[0] === 'I')) tiposConocidos[partes[1]] = partes[0];
  });
  var antesTipos = Object.keys(tiposConocidos).length;

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
    IMGAPI_REGEX_INSIGNIA_.lastIndex = 0;
    while ((m = IMGAPI_REGEX_INSIGNIA_.exec(texto)) !== null) {
      tiposConocidos[m[2]] = m[1].indexOf(IMGAPI_PREFIJO_MAESTRIA_) === 0 ? 'M' : 'I';
    }
    escaneados++;
    hechosEstaVez++;
  }

  var lista = Object.keys(conocidas).sort();
  archivoUrls.setContent(lista.join('\n') + '\n');
  var nuevas = lista.length - antes;

  var archivosConTipo = Object.keys(tiposConocidos).sort();
  archivoTipos.setContent(archivosConTipo.map(function(a) { return tiposConocidos[a] + '\t' + a; }).join('\n') + '\n');
  var nMaestrias = archivosConTipo.filter(function(a) { return tiposConocidos[a] === 'M'; }).length;

  if (terminado) props.deleteProperty(IMGAPI_PROP_ESCANEO_);
  else props.setProperty(IMGAPI_PROP_ESCANEO_, JSON.stringify({ token: it.getContinuationToken(), escaneados: escaneados }));

  var texto2 = (terminado ? 'TERMINADO. ' : 'Falta recorrer más archivos: vuelve a correr la función. ') +
               'Esta vez se leyeron ' + hechosEstaVez + ' JSON (' + escaneados + ' en total) y se sumaron ' + nuevas +
               ' direcciones nuevas; ' + lista.length + ' en ' + IMGAPI_ARCHIVO_URLS_ + '. Tipos de insignia anotados: ' +
               archivosConTipo.length + ' (' + nMaestrias + ' maestrías y ' + (archivosConTipo.length - nMaestrias) +
               ' insignias; ' + (archivosConTipo.length - antesTipos) + ' nuevos) en ' + IMGAPI_ARCHIVO_TIPOS_ + '.';
  console.log(texto2);
  return texto2;
}

/** Olvida el avance del escaneo para volver a empezar desde el primer archivo. No borra Imagenes_API_Urls.txt. */
function imagenesApiReiniciarEscaneoJson() {
  PropertiesService.getScriptProperties().deleteProperty(IMGAPI_PROP_ESCANEO_);
  console.log('Avance del escaneo borrado.');
}

// -----------------------------------------------------------------------------
// Tipo de las insignias de jugador: maestría o insignia (20-oct-2026)
// -----------------------------------------------------------------------------

/** El archivo de Drive con ese nombre (si hay varios, el más reciente), o null si no existe. No lo crea. */
function _imgApiArchivoMasReciente_(nombre) {
  var it = DriveApp.getFilesByName(nombre);
  var archivos = [];
  while (it.hasNext()) archivos.push(it.next());
  if (!archivos.length) return null;
  archivos.sort(function(a, b) { return b.getLastUpdated().getTime() - a.getLastUpdated().getTime(); });
  return archivos[0];
}

/** Archivo de tipos de insignia en Drive (raíz); lo crea vacío si no existe. */
function _imgApiArchivoTipos_() {
  return _imgApiArchivoMasReciente_(IMGAPI_ARCHIVO_TIPOS_) || DriveApp.createFile(IMGAPI_ARCHIVO_TIPOS_, '', 'text/plain');
}

/** Ruta destino de una insignia de jugador según su tipo. */
function _imgApiDestinoInsignia_(esMaestria, archivo) {
  return (esMaestria ? IMGAPI_DESTINO_MAESTRIAS_ : IMGAPI_DESTINO_INSIGNIAS_) + archivo;
}

function _imgApiNormalizarCabecera_(texto) {
  return String(texto || '').replace(/^\uFEFF/, '').trim().toLowerCase();
}

/**
 * Devuelve { archivo: true|false } para las insignias de jugador: true si es maestría (el nombre
 * empieza con Mastery), false si es una insignia común. Fuentes: la columna Name de
 * Backup_Insignias.csv (y su segunda parte) junto a la columna Ícono, y el archivo
 * Imagenes_API_Insignias_Tipos.txt que llena el escaneo de los JSON de players. Si las dos fuentes
 * dicen cosas distintas para el mismo archivo, manda el CSV y se avisa en el registro.
 */
function _imgApiTiposInsignias_() {
  var tipos = {};
  var deCsv = 0, deJson = 0, conflictos = 0;
  var reArchivo = /playerbadges\/\d+\/([A-Za-z0-9_-]+\.(?:png|webp|jpg))/;

  IMGAPI_CSV_INSIGNIAS_.forEach(function(nombre) {
    var archivo = _imgApiArchivoMasReciente_(nombre);
    if (!archivo) return;
    var filas = Utilities.parseCsv(archivo.getBlob().getDataAsString('UTF-8'));
    if (!filas.length) return;
    var cab = filas[0].map(_imgApiNormalizarCabecera_);
    var iNombre = cab.indexOf('name');
    var iIcono = cab.indexOf('ícono');
    if (iIcono === -1) iIcono = cab.indexOf('icono');
    if (iNombre === -1 || iIcono === -1) {
      console.log('  · ' + nombre + ': no tiene las columnas Name e Ícono; no sirve para saber el tipo de las insignias.');
      return;
    }
    for (var i = 1; i < filas.length; i++) {
      var m = reArchivo.exec(String(filas[i][iIcono] || ''));
      if (!m) continue;
      var esMaestria = String(filas[i][iNombre] || '').trim().indexOf(IMGAPI_PREFIJO_MAESTRIA_) === 0;
      if (tipos[m[1]] === undefined) { tipos[m[1]] = esMaestria; deCsv++; }
      else if (tipos[m[1]] !== esMaestria) conflictos++;
    }
  });

  var archivoTipos = _imgApiArchivoMasReciente_(IMGAPI_ARCHIVO_TIPOS_);
  if (archivoTipos) {
    archivoTipos.getBlob().getDataAsString('UTF-8').split('\n').forEach(function(linea) {
      var partes = linea.trim().split('\t');
      if (partes.length !== 2 || (partes[0] !== 'M' && partes[0] !== 'I')) return;
      var esMaestria = partes[0] === 'M';
      if (tipos[partes[1]] === undefined) { tipos[partes[1]] = esMaestria; deJson++; }
      else if (tipos[partes[1]] !== esMaestria) conflictos++;
    });
  }

  console.log('  · Tipo de insignias: ' + deCsv + ' desde Backup_Insignias.csv y ' + deJson + ' más desde ' + IMGAPI_ARCHIVO_TIPOS_ +
              (archivoTipos ? '' : ' (no existe todavía; se crea al correr imagenesApiEscanearJsonPlayers())') + '.');
  if (conflictos) console.log('  · Aviso: ' + conflictos + ' insignias con tipo distinto entre el CSV y los JSON; se usó el del CSV.');
  return tipos;
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
  var tiposInsignias = null, sinClasificar = 0, ejemplosSinClasificar = [];
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
      var destino;
      if (m[1] === 'playerbadges') {
        if (!tiposInsignias) tiposInsignias = _imgApiTiposInsignias_();
        var esMaestria = tiposInsignias[m[3]];
        if (esMaestria === undefined) {
          // No se sabe si es maestría o insignia: no se descarga para no dejarla en la carpeta equivocada.
          sinClasificar++;
          if (ejemplosSinClasificar.length < 3) ejemplosSinClasificar.push(m[3]);
          continue;
        }
        destino = _imgApiDestinoInsignia_(esMaestria, m[3]);
      } else {
        destino = IMGAPI_DESTINOS_[m[1]] + m[3];
      }
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
  if (sinClasificar) {
    console.log('  · ' + sinClasificar + ' insignias sin tipo conocido (no están en Backup_Insignias.csv ni en ' + IMGAPI_ARCHIVO_TIPOS_ +
                '); NO se descargan. Ejemplos: ' + ejemplosSinClasificar.join(', ') + '. Para clasificarlas: corre imagenesApiReiniciarEscaneoJson() y ' +
                'luego imagenesApiEscanearJsonPlayers() hasta que diga «TERMINADO».');
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
 * Para cada carpeta llamada Fankit (en cualquier nivel) devuelve la entrada API/LEEME.txt
 * si en el mismo nivel no hay ningún archivo bajo API/ (en mayúscula). Entradas: { path, texto }.
 * Como git no guarda carpetas vacías, la carpeta API «existe» si tiene al menos un archivo.
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
    var prefijoApi = (padre ? padre + '/' : '') + 'API/';
    var existe = Object.keys(rutas).some(function(r) { return r.indexOf(prefijoApi) === 0; });
    if (existe) return;
    salida.push({
      path: prefijoApi + 'LEEME.txt',
      texto: 'Carpeta reservada para imágenes descargadas desde la API de Supercell (api-assets.clashroyale.com).\n' +
             'Va al lado de la carpeta Fankit. Orden de uso: enlace de la API, luego esta carpeta (API), luego Fankit.\n' +
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
