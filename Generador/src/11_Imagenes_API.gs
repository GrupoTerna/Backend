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
//  Recorte del margen (22-oct-2026, pedido de la usuaria): las insignias de jugador (playerbadges) se
//  suben ya recortadas al rectángulo de los píxeles con alfa >= 8, sin reescalar, igual que las 1 079
//  copias que se recortaron antes (PF161), para que todas llenen igual su caja en la web. Los PNG que
//  no sean RGBA de 8 bits, o que no se puedan recortar, NO se suben y quedan como fallo que se
//  reintenta; lo que ni siquiera es un PNG se sube tal cual y se avisa. Las cartas no se recortan.
//  Detalle y límites (sin probar en Apps Script real): sección «Recorte del margen» y §PF162.
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
  var entradas = [], bytes = 0, fallos = [], nuevas404 = [], procesadas = 0, recortadas = 0, sinMargen = 0, noPng = 0;
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
      if (u.categoria === 'playerbadges') {
        // Las insignias de jugador se suben sin el margen transparente (PF162). Ver «Recorte del margen».
        var rec = _imgApiRecortarPng_(datos);
        if (rec.ok) {
          datos = rec.bytes;
          if (rec.recortado) { recortadas++; } else { sinMargen++; }
        } else if (!rec.esPng) {
          // No es un PNG (por ejemplo un webp): se sube tal cual, porque no hay cómo recortarlo aquí.
          noPng++;
          console.log('  · Aviso: ' + u.url + ' no es un PNG (' + rec.motivo + '); se sube tal cual, sin recortar.');
        } else {
          fallos.push(u.url + ' → no se pudo recortar: ' + rec.motivo);
          continue;
        }
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
  if (recortadas || sinMargen || noPng) {
    texto += ' Insignias: ' + recortadas + ' recortadas' + (sinMargen ? ', ' + sinMargen + ' que ya no tenían margen' : '') +
             (noPng ? ', ' + noPng + ' que no eran PNG y se subieron tal cual' : '') + '.';
  }
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
// Recorte del margen transparente de las insignias (22-oct-2026, pedido de la usuaria)
// [→ Contexto_Base_Web.md §PF162]
//
// Las copias locales de badges/API/ se suben SIN el margen transparente que traen los PNG de
// Supercell (512x512 con el dibujo en ~58 % del ancho), igual que las 1 079 que ya se recortaron
// a mano (PF161). Apps Script no trae librería de imágenes, así que aquí hay un lector y escritor
// de PNG en JavaScript puro:
//   - Solo PNG RGBA de 8 bits, sin entrelazado (el formato de todas las insignias vistas). Otro
//     formato NO se sube y queda como fallo que se reintenta; un archivo que ni siquiera es PNG
//     se sube tal cual y se avisa en el registro.
//   - Criterio: rectángulo mínimo con los píxeles de alfa >= 8 (el mismo de PF161). No se reescala
//     ni se cambia ningún píxel; solo se corta. Si no hay nada que cortar, el archivo no se toca.
//   - Descomprime con un inflate propio (se evita Utilities.ungzip porque, por lo que se sabe,
//     valida el CRC del resultado, que aquí no se conoce; no se probó en Apps Script) y comprime
//     con Utilities.gzip, cuyo deflate se envuelve como zlib. Si ese
//     deflate no se puede descomprimir de vuelta igual, se usa compresión «almacenada» (sin
//     comprimir pero válida).
// -----------------------------------------------------------------------------

var IMGAPI_ALFA_MIN_ = 8;

/** Bytes con signo de Apps Script (-128..127) a Uint8Array. */
function _imgApiAU8_(bytes) {
  var n = bytes.length, u = new Uint8Array(n);
  for (var i = 0; i < n; i++) u[i] = bytes[i] & 255;
  return u;
}

/** Uint8Array a bytes con signo, que es lo que esperan Utilities.base64Encode y newBlob. */
function _imgApiAConSigno_(u8) {
  var n = u8.length, a = new Array(n);
  for (var i = 0; i < n; i++) { var v = u8[i]; a[i] = v > 127 ? v - 256 : v; }
  return a;
}

var _IMGAPI_TABLA_CRC_ = null;
function _imgApiCrc32_(u8, ini, fin) {
  if (!_IMGAPI_TABLA_CRC_) {
    _IMGAPI_TABLA_CRC_ = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      _IMGAPI_TABLA_CRC_[n] = c >>> 0;
    }
  }
  var crc = 0xFFFFFFFF;
  for (var i = ini; i < fin; i++) crc = _IMGAPI_TABLA_CRC_[(crc ^ u8[i]) & 255] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function _imgApiAdler32_(u8) {
  var a = 1, b = 0, n = u8.length, i = 0;
  while (i < n) {
    var tope = Math.min(i + 3800, n);
    for (; i < tope; i++) { a += u8[i]; b += a; }
    a %= 65521; b %= 65521;
  }
  return ((b << 16) | a) >>> 0;
}

var _IMGAPI_LONG_BASE_ = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
var _IMGAPI_LONG_EXTRA_ = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
var _IMGAPI_DIST_BASE_ = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
var _IMGAPI_DIST_EXTRA_ = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
var _IMGAPI_ORDEN_CL_ = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

/** Tabla de Huffman canónica a partir de las longitudes de código (algoritmo de puff.c). */
function _imgApiHuffman_(longitudes, n) {
  var cuenta = new Array(16), simbolo = new Array(n), desp = new Array(16), i;
  for (i = 0; i < 16; i++) cuenta[i] = 0;
  for (i = 0; i < n; i++) cuenta[longitudes[i]]++;
  desp[1] = 0;
  for (i = 1; i < 15; i++) desp[i + 1] = desp[i] + cuenta[i];
  for (i = 0; i < n; i++) if (longitudes[i] !== 0) simbolo[desp[longitudes[i]]++] = i;
  return { cuenta: cuenta, simbolo: simbolo };
}

/**
 * Inflate (deflate crudo, RFC 1951) de src desde pos. Devuelve un Uint8Array de exactamente
 * tam bytes; si los datos dan más o menos, lanza error.
 */
function _imgApiInflate_(src, pos, tam) {
  var out = new Uint8Array(tam), op = 0, bitBuf = 0, bitCnt = 0;
  function bits(n) {
    while (bitCnt < n) {
      if (pos >= src.length) throw new Error('inflate: datos truncados');
      bitBuf |= src[pos++] << bitCnt;
      bitCnt += 8;
    }
    var v = bitBuf & ((1 << n) - 1);
    bitBuf >>>= n; bitCnt -= n;
    return v;
  }
  function decodificar(h) {
    var codigo = 0, primero = 0, indice = 0;
    for (var len = 1; len <= 15; len++) {
      codigo |= bits(1);
      var cuenta = h.cuenta[len];
      if (codigo - cuenta < primero) return h.simbolo[indice + (codigo - primero)];
      indice += cuenta; primero += cuenta; primero <<= 1; codigo <<= 1;
    }
    throw new Error('inflate: código de Huffman inválido');
  }
  var fijoLit = null, fijoDist = null;
  var ultimo;
  do {
    ultimo = bits(1);
    var tipo = bits(2), lit, dist, i;
    if (tipo === 0) {
      bitBuf = 0; bitCnt = 0; // se descartan los bits que sobran del byte
      if (pos + 4 > src.length) throw new Error('inflate: bloque almacenado truncado');
      var len = src[pos] | (src[pos + 1] << 8), nlen = src[pos + 2] | (src[pos + 3] << 8);
      pos += 4;
      if ((len ^ 65535) !== nlen) throw new Error('inflate: longitud almacenada inconsistente');
      if (pos + len > src.length || op + len > tam) throw new Error('inflate: bloque almacenado fuera de rango');
      for (i = 0; i < len; i++) out[op++] = src[pos++];
    } else if (tipo === 1 || tipo === 2) {
      if (tipo === 1) {
        if (!fijoLit) {
          var l = new Array(288);
          for (i = 0; i < 144; i++) l[i] = 8;
          for (; i < 256; i++) l[i] = 9;
          for (; i < 280; i++) l[i] = 7;
          for (; i < 288; i++) l[i] = 8;
          fijoLit = _imgApiHuffman_(l, 288);
          var d = new Array(30);
          for (i = 0; i < 30; i++) d[i] = 5;
          fijoDist = _imgApiHuffman_(d, 30);
        }
        lit = fijoLit; dist = fijoDist;
      } else {
        var nlit = bits(5) + 257, ndist = bits(5) + 1, ncl = bits(4) + 4;
        var lcl = new Array(19);
        for (i = 0; i < 19; i++) lcl[i] = 0;
        for (i = 0; i < ncl; i++) lcl[_IMGAPI_ORDEN_CL_[i]] = bits(3);
        var hcl = _imgApiHuffman_(lcl, 19);
        var largos = new Array(nlit + ndist);
        var idx = 0;
        while (idx < nlit + ndist) {
          var s = decodificar(hcl);
          if (s < 16) { largos[idx++] = s; continue; }
          var rep, val = 0;
          if (s === 16) {
            if (idx === 0) throw new Error('inflate: repetición sin valor previo');
            val = largos[idx - 1]; rep = 3 + bits(2);
          } else if (s === 17) { rep = 3 + bits(3); }
          else { rep = 11 + bits(7); }
          if (idx + rep > nlit + ndist) throw new Error('inflate: demasiadas longitudes');
          while (rep--) largos[idx++] = val;
        }
        lit = _imgApiHuffman_(largos.slice(0, nlit), nlit);
        dist = _imgApiHuffman_(largos.slice(nlit), ndist);
      }
      while (true) {
        var sim = decodificar(lit);
        if (sim < 256) {
          if (op >= tam) throw new Error('inflate: más datos de los esperados');
          out[op++] = sim;
        } else if (sim === 256) {
          break;
        } else {
          sim -= 257;
          if (sim >= 29) throw new Error('inflate: símbolo de longitud inválido');
          var largo = _IMGAPI_LONG_BASE_[sim] + bits(_IMGAPI_LONG_EXTRA_[sim]);
          var sd = decodificar(dist);
          if (sd >= 30) throw new Error('inflate: símbolo de distancia inválido');
          var d2 = _IMGAPI_DIST_BASE_[sd] + bits(_IMGAPI_DIST_EXTRA_[sd]);
          if (d2 > op) throw new Error('inflate: distancia fuera de rango');
          if (op + largo > tam) throw new Error('inflate: más datos de los esperados');
          for (i = 0; i < largo; i++) { out[op] = out[op - d2]; op++; }
        }
      }
    } else {
      throw new Error('inflate: tipo de bloque inválido');
    }
  } while (!ultimo);
  if (op !== tam) throw new Error('inflate: se esperaban ' + tam + ' bytes y salieron ' + op);
  return out;
}

/** Deflate crudo «almacenado» (sin comprimir, pero válido). */
function _imgApiDeflateAlmacenado_(datos) {
  var n = datos.length, bloques = Math.max(1, Math.ceil(n / 65535));
  var out = new Uint8Array(n + bloques * 5), op = 0;
  for (var b = 0; b < bloques; b++) {
    var ini = b * 65535, len = Math.min(65535, n - ini);
    out[op++] = (b === bloques - 1) ? 1 : 0;
    out[op++] = len & 255; out[op++] = len >>> 8;
    out[op++] = (~len) & 255; out[op++] = ((~len) >>> 8) & 255;
    for (var i = 0; i < len; i++) out[op++] = datos[ini + i];
  }
  return out;
}

/**
 * Comprime datos como flujo zlib. Usa Utilities.gzip y le quita la cabecera y el cierre de gzip
 * (RFC 1952). Se comprueba descomprimiéndolo de vuelta con el inflate propio; si no coincide
 * (o algo falla), cae a la compresión almacenada. Devuelve { zlib: Uint8Array, modo: 'deflate'|'almacenado' }.
 */
function _imgApiZlib_(datos) {
  var crudo = null;
  try {
    var gz = _imgApiAU8_(Utilities.gzip(Utilities.newBlob(_imgApiAConSigno_(datos), 'application/octet-stream', 'x')).getBytes());
    if (gz.length > 18 && gz[0] === 0x1f && gz[1] === 0x8b && gz[2] === 8) {
      var flg = gz[3], p = 10;
      if (flg & 4) p += 2 + (gz[p] | (gz[p + 1] << 8));
      if (flg & 8) { while (gz[p] !== 0) p++; p++; }
      if (flg & 16) { while (gz[p] !== 0) p++; p++; }
      if (flg & 2) p += 2;
      var candidato = gz.subarray(p, gz.length - 8);
      var vuelta = _imgApiInflate_(candidato, 0, datos.length);
      var igual = true;
      for (var i = 0; i < datos.length; i++) { if (vuelta[i] !== datos[i]) { igual = false; break; } }
      if (igual) crudo = candidato;
    }
  } catch (e) { crudo = null; }
  var modo = 'deflate';
  if (!crudo) { crudo = _imgApiDeflateAlmacenado_(datos); modo = 'almacenado'; }
  var z = new Uint8Array(crudo.length + 6);
  z[0] = 0x78; z[1] = 0x9c;
  z.set(crudo, 2);
  var ad = _imgApiAdler32_(datos), f = crudo.length + 2;
  z[f] = (ad >>> 24) & 255; z[f + 1] = (ad >>> 16) & 255; z[f + 2] = (ad >>> 8) & 255; z[f + 3] = ad & 255;
  return { zlib: z, modo: modo };
}

function _imgApiLeeU32_(u8, p) { return ((u8[p] << 24) | (u8[p + 1] << 16) | (u8[p + 2] << 8) | u8[p + 3]) >>> 0; }

/** Escribe un trozo PNG (longitud, tipo, datos, CRC) en out desde p; devuelve la posición siguiente. */
function _imgApiTrozoPng_(out, p, tipo, datos) {
  var n = datos.length;
  out[p] = (n >>> 24) & 255; out[p + 1] = (n >>> 16) & 255; out[p + 2] = (n >>> 8) & 255; out[p + 3] = n & 255;
  for (var i = 0; i < 4; i++) out[p + 4 + i] = tipo.charCodeAt(i);
  out.set(datos, p + 8);
  var crc = _imgApiCrc32_(out, p + 4, p + 8 + n);
  var q = p + 8 + n;
  out[q] = (crc >>> 24) & 255; out[q + 1] = (crc >>> 16) & 255; out[q + 2] = (crc >>> 8) & 255; out[q + 3] = crc & 255;
  return q + 4;
}

/**
 * Quita los filtros de PNG de las filas de crudo (cada fila: 1 byte de filtro + ancho*4 bytes).
 * Devuelve los píxeles RGBA (alto filas de ancho*4 bytes) o null si algún filtro es inválido.
 * Un bucle por tipo de filtro: así es mucho más rápido que decidir byte a byte.
 */
function _imgApiQuitarFiltros_(crudo, ancho, alto) {
  var bpp = 4, fila = ancho * bpp, pix = new Uint8Array(alto * fila);
  for (var y = 0; y < alto; y++) {
    var o = y * (fila + 1), ft = crudo[o]; o++;
    var d = y * fila, dp = d - fila, i, a, b, c, pp, pa, pb, pc;
    if (ft > 4) return null;
    if (ft === 0) {
      for (i = 0; i < fila; i++) pix[d + i] = crudo[o + i];
    } else if (ft === 1) {
      for (i = 0; i < bpp; i++) pix[d + i] = crudo[o + i];
      for (; i < fila; i++) pix[d + i] = (crudo[o + i] + pix[d + i - bpp]) & 255;
    } else if (ft === 2) {
      if (y === 0) { for (i = 0; i < fila; i++) pix[d + i] = crudo[o + i]; }
      else { for (i = 0; i < fila; i++) pix[d + i] = (crudo[o + i] + pix[dp + i]) & 255; }
    } else if (ft === 3) {
      for (i = 0; i < fila; i++) {
        a = i >= bpp ? pix[d + i - bpp] : 0;
        b = y > 0 ? pix[dp + i] : 0;
        pix[d + i] = (crudo[o + i] + ((a + b) >> 1)) & 255;
      }
    } else {
      for (i = 0; i < fila; i++) {
        a = i >= bpp ? pix[d + i - bpp] : 0;
        b = y > 0 ? pix[dp + i] : 0;
        c = (y > 0 && i >= bpp) ? pix[dp + i - bpp] : 0;
        pp = a + b - c; pa = pp > a ? pp - a : a - pp; pb = pp > b ? pp - b : b - pp; pc = pp > c ? pp - c : c - pp;
        pix[d + i] = (crudo[o + i] + ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c))) & 255;
      }
    }
  }
  return pix;
}

/** Rectángulo mínimo [x0, y0, x1, y1] (incluyente) de los píxeles con alfa >= IMGAPI_ALFA_MIN_; x1 = -1 si no hay ninguno. */
function _imgApiRectanguloVisible_(pix, ancho, alto) {
  var x0 = ancho, y0 = alto, x1 = -1, y1 = -1, fila = ancho * 4, amin = IMGAPI_ALFA_MIN_;
  for (var y = 0; y < alto; y++) {
    var base = y * fila + 3;
    for (var x = 0; x < ancho; x++) {
      if (pix[base + x * 4] >= amin) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
  }
  return [x0, y0, x1, y1];
}

/**
 * Filtra una fila del recorte con el filtro t (0..4) y la deja en dst. La fila empieza en pix[bo]
 * y mide n bytes; la anterior, si hay, empieza en pix[bo - fila] (las filas del recorte son
 * contiguas en pix, con paso fila).
 */
function _imgApiFiltrarFila_(t, pix, bo, hayPrevia, fila, n, dst) {
  var bpp = 4, k, a, b, c, p, pa, pb, pc, bp = bo - fila;
  if (t === 0) {
    for (k = 0; k < n; k++) dst[k] = pix[bo + k];
  } else if (t === 1) {
    for (k = 0; k < bpp; k++) dst[k] = pix[bo + k];
    for (; k < n; k++) dst[k] = (pix[bo + k] - pix[bo + k - bpp]) & 255;
  } else if (t === 2) {
    if (!hayPrevia) { for (k = 0; k < n; k++) dst[k] = pix[bo + k]; }
    else { for (k = 0; k < n; k++) dst[k] = (pix[bo + k] - pix[bp + k]) & 255; }
  } else if (t === 3) {
    for (k = 0; k < n; k++) {
      a = k >= bpp ? pix[bo + k - bpp] : 0;
      b = hayPrevia ? pix[bp + k] : 0;
      dst[k] = (pix[bo + k] - ((a + b) >> 1)) & 255;
    }
  } else {
    for (k = 0; k < n; k++) {
      a = k >= bpp ? pix[bo + k - bpp] : 0;
      b = hayPrevia ? pix[bp + k] : 0;
      c = (hayPrevia && k >= bpp) ? pix[bp + k - bpp] : 0;
      p = a + b - c; pa = p > a ? p - a : a - p; pb = p > b ? p - b : b - p; pc = p > c ? p - c : c - p;
      dst[k] = (pix[bo + k] - ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c))) & 255;
    }
  }
}

/** Vuelve a filtrar el recorte (x0, y0, w2, h2) de pix; por fila elige el filtro de menor suma de valores absolutos. */
function _imgApiFiltrarRecorte_(pix, ancho, x0, y0, w2, h2) {
  var fila = ancho * 4, n = w2 * 4;
  var salida = new Uint8Array(h2 * (n + 1));
  var cand = [new Uint8Array(n), new Uint8Array(n), new Uint8Array(n), new Uint8Array(n), new Uint8Array(n)];
  for (var r = 0; r < h2; r++) {
    var bo = (y0 + r) * fila + x0 * 4, mejor = 0, mejorSuma = -1;
    for (var t = 0; t < 5; t++) {
      var dst = cand[t];
      _imgApiFiltrarFila_(t, pix, bo, r > 0, fila, n, dst);
      var suma = 0;
      for (var k = 0; k < n; k++) { var v = dst[k]; suma += v < 128 ? v : 256 - v; }
      if (mejorSuma < 0 || suma < mejorSuma) { mejorSuma = suma; mejor = t; }
    }
    var so = r * (n + 1);
    salida[so] = mejor;
    salida.set(cand[mejor], so + 1);
  }
  return salida;
}

/**
 * Recorta el margen transparente de un PNG RGBA de 8 bits.
 * bytes: contenido con signo, tal como lo da UrlFetchApp. Devuelve:
 *   { ok: true,  bytes: <con signo>, recortado: true|false, ancho, alto, anchoOrig, altoOrig, modo }
 *   { ok: false, esPng: true|false, motivo: '...' }
 * Sin recortar (recortado:false) devuelve los mismos bytes: ya no tenía margen.
 */
function _imgApiRecortarPng_(bytes) {
  var src;
  try { src = _imgApiAU8_(bytes); } catch (e0) { return { ok: false, esPng: false, motivo: 'no se pudo leer el contenido' }; }
  var firma = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  if (src.length < 33) return { ok: false, esPng: false, motivo: 'archivo demasiado corto' };
  for (var f = 0; f < 8; f++) if (src[f] !== firma[f]) return { ok: false, esPng: false, motivo: 'no tiene la firma de un PNG' };
  try {
    var p = 8, ancho = 0, alto = 0, idats = [], totalIdat = 0, visto = false;
    while (p + 12 <= src.length) {
      var n = _imgApiLeeU32_(src, p);
      var tipo = String.fromCharCode(src[p + 4], src[p + 5], src[p + 6], src[p + 7]);
      if (p + 12 + n > src.length) return { ok: false, esPng: true, motivo: 'PNG truncado' };
      if (tipo === 'IHDR') {
        if (n !== 13) return { ok: false, esPng: true, motivo: 'IHDR inválido' };
        ancho = _imgApiLeeU32_(src, p + 8); alto = _imgApiLeeU32_(src, p + 12);
        var prof = src[p + 16], color = src[p + 17], compr = src[p + 18], filtro = src[p + 19], entrel = src[p + 20];
        if (prof !== 8 || color !== 6 || compr !== 0 || filtro !== 0 || entrel !== 0) {
          return { ok: false, esPng: true, motivo: 'no es PNG RGBA de 8 bits sin entrelazado (profundidad ' + prof + ', color ' + color + ', entrelazado ' + entrel + ')' };
        }
        visto = true;
      } else if (tipo === 'IDAT') {
        idats.push(src.subarray(p + 8, p + 8 + n)); totalIdat += n;
      } else if (tipo === 'IEND') {
        break;
      }
      p += 12 + n;
    }
    if (!visto || !idats.length) return { ok: false, esPng: true, motivo: 'faltan IHDR o IDAT' };
    if (ancho < 1 || alto < 1 || ancho > 4096 || alto > 4096) return { ok: false, esPng: true, motivo: 'tamaño fuera de lo esperado (' + ancho + 'x' + alto + ')' };

    var comp = new Uint8Array(totalIdat), q = 0;
    idats.forEach(function(t) { comp.set(t, q); q += t.length; });
    if ((comp[0] & 15) !== 8 || ((comp[0] << 8) | comp[1]) % 31 !== 0 || (comp[1] & 32)) return { ok: false, esPng: true, motivo: 'cabecera zlib inválida' };

    var crudo = _imgApiInflate_(comp, 2, alto * (ancho * 4 + 1));

    var pix = _imgApiQuitarFiltros_(crudo, ancho, alto);
    if (!pix) return { ok: false, esPng: true, motivo: 'filtro de fila inválido' };

    var rect = _imgApiRectanguloVisible_(pix, ancho, alto);
    var x0 = rect[0], y0 = rect[1], x1 = rect[2], y1 = rect[3];
    if (x1 < 0) return { ok: false, esPng: true, motivo: 'no tiene ningún píxel visible (alfa >= ' + IMGAPI_ALFA_MIN_ + ')' };
    if (x0 === 0 && y0 === 0 && x1 === ancho - 1 && y1 === alto - 1) {
      return { ok: true, bytes: bytes, recortado: false, ancho: ancho, alto: alto, anchoOrig: ancho, altoOrig: alto, modo: 'sin cambios' };
    }

    var w2 = x1 - x0 + 1, h2 = y1 - y0 + 1;
    var salida = _imgApiFiltrarRecorte_(pix, ancho, x0, y0, w2, h2);

    var z = _imgApiZlib_(salida);
    var ihdr = new Uint8Array(13);
    ihdr[0] = (w2 >>> 24) & 255; ihdr[1] = (w2 >>> 16) & 255; ihdr[2] = (w2 >>> 8) & 255; ihdr[3] = w2 & 255;
    ihdr[4] = (h2 >>> 24) & 255; ihdr[5] = (h2 >>> 16) & 255; ihdr[6] = (h2 >>> 8) & 255; ihdr[7] = h2 & 255;
    ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    var png = new Uint8Array(8 + (12 + 13) + (12 + z.zlib.length) + 12);
    png.set(firma, 0);
    var pos = 8;
    pos = _imgApiTrozoPng_(png, pos, 'IHDR', ihdr);
    pos = _imgApiTrozoPng_(png, pos, 'IDAT', z.zlib);
    _imgApiTrozoPng_(png, pos, 'IEND', new Uint8Array(0));
    return { ok: true, bytes: _imgApiAConSigno_(png), recortado: true, ancho: w2, alto: h2, anchoOrig: ancho, altoOrig: alto, modo: z.modo };
  } catch (e) {
    return { ok: false, esPng: true, motivo: 'error al recortar: ' + e };
  }
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
