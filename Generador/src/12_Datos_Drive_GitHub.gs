// =============================================================================
// 12_Datos_Drive_GitHub.gs
// Copia automática de los CSV de guerra y de la carpeta de informes de Drive a
// GitHub (repo GrupoTerna/Backend, carpeta «Datos descargados/CSV/»), para que
// Claude pueda leerlos sin que la usuaria los suba a mano.
// [→ Contexto_Base_Web.md §PF241]
//
// QUÉ COPIA (ver DATOS_GH_FUENTES_):
//   - Tampermonkey/: Correcciones_Guerra.csv, Correcciones_Nuevos.csv y
//     Backup_Guerra_Semanal.csv        → Datos descargados/CSV/Tampermonkey/
//     Desde el 25-oct-2026 (§PF241, decisión de la usuaria) también, de esa misma
//     carpeta, Correcciones_RiverRace_Pendientes.csv y los Log_Tampermonkey_*.csv
//     (se buscan con el filtro «solo»; si no existen no es un error).
//   - Carpeta Seasons: Cache_Seasons.json (respuesta cruda de descargarSeasons(), ids de
//     temporada de Supercell)  → Datos descargados/JSON/Endpoints/Seasons/
//   - Backup_Guerra.csv y Backup_Guerra_Logs.csv → Datos descargados/CSV/Hojas/
//   - Carpeta Individual de RoyaleAPI (JSON por jugador; desde el 25-oct-2026, §PF276): todos los .json
//     → Datos descargados/JSON/RoyaleAPI/Individual/. Se omiten los nombres con una fecha AAAA-MM-DD pegada
//     antes del tag (el defecto que corrige _buildHistorialGuerraFilename, §PF275): el repo ya tiene esos
//     archivos con el nombre limpio y no se quiere repetirlos.
//   - Carpeta de informes: TODOS los archivos de texto que haya (CSV, TXT, JSON,
//     MD, PY), también los que cree una función nueva, porque se recorre la
//     carpeta y no una lista de nombres  → Datos descargados/CSV/Informes/
//     Se omiten las copias «Backup_Guerra ANTES de ...» (pesan unos 2 MB cada
//     una y son copias de Backup_Guerra.csv).
//
// REGLAS DE SEGURIDAD (el repo es público):
//   - Un archivo con posible token o clave se omite (reutiliza _githubRevisarSecretos_).
//   - Un archivo con posible número de teléfono se omite. Solo se informa el número
//     de línea, nunca el valor. Los números de 13 cifras que empiezan con 15 a 19
//     (marcas de tiempo en milisegundos) no cuentan.
//   - Un archivo omitido no frena a los demás.
//   - Solo agrega o actualiza archivos: nunca borra nada del repo.
//
// CUÁNDO: un activador diario (instalarActivadorDatosDriveGithub) o a mano
// (subirDatosDriveAGithub). Solo se leen los archivos cuya fecha de modificación o
// tamaño cambió desde la última copia (propiedades del script DATOS_GH_...).
//
// TOKEN: el mismo GITHUB_TOKEN del Generador (repo Backend, Contents: Read and write).
// Desde el 25-oct-2026 (§PF272, pedido de la usuaria) el registro de la corrida lista los archivos subidos agrupados por carpeta de destino,
// con el total por carpeta (_datosGhLineasPorCarpeta_); el modo revisión lo muestra igual.
// Desde el 25-oct-2026 (§PF276) si una corrida se queda sin tiempo, la continuación se programa sola (un activador a 1 minuto, que se repite hasta terminar),
// también cuando se corre a mano o forzada; antes solo lo hacía el activador diario.
// Desde el 25-oct-2026 (§PF278) si GitHub frena por exceso de escrituras (HTTP 403 «rate limit»/429) la continuación se programa a 10 minutos; y
// _githubCommitArchivos_ sube el contenido dentro de los árboles cuando son muchos archivos (no un blob por archivo).
// Sin probar en Apps Script real al escribir este archivo.
// =============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Copia de Drive a GitHub: ejecución (subir, forzado, revisar sin subir; la que lanza el activador y su continuación)
//    - Activador diario: instalar y quitar
//  Parte 2 — Funciones que no se corren a mano
//    - Copia de Drive a GitHub: lógica y ayudas (en el orden en que las llama _datosDriveAGithub_)
//    - Activador diario: ayuda
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var DATOS_GH_CARPETA_TAMPERMONKEY_ = '1rYAHT0dCpAPFT6BYXDncpuo9ZY780LFt';
var DATOS_GH_CARPETA_HOJAS_        = '1emYkDZMEzYgO5lwmtY-NMhFc5JJd2I3R';
var DATOS_GH_CARPETA_INFORMES_     = '17Mv2oQFTMIdSKlGyHNnrBiApYoHfHg4X';
var DATOS_GH_CARPETA_INDIVIDUAL_   = '1U11RBaJJLdqJST9wJF4z_ExcLE92TjO7';   // = DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL de Base (01_Config_Global.gs)
var DATOS_GH_CARPETA_SEASONS_      = '1oIMkaJS6ElqXD9Z8xRA5jn0YVaz3l01d';   // = DRIVE_FOLDER_ID_SEASONS de Base (01_Config_Global.gs)

var DATOS_GH_FUENTES_ = [
  { carpetaId: DATOS_GH_CARPETA_TAMPERMONKEY_,
    nombres: ['Correcciones_Guerra.csv', 'Correcciones_Nuevos.csv', 'Backup_Guerra_Semanal.csv'],
    destino: 'Datos descargados/CSV/Tampermonkey/', maxBytes: 8 * 1024 * 1024 },
  { carpetaId: DATOS_GH_CARPETA_TAMPERMONKEY_,
    todos: true,
    solo: /^(Correcciones_RiverRace_Pendientes\.csv|Log_Tampermonkey_.*\.csv)$/i,
    destino: 'Datos descargados/CSV/Tampermonkey/', maxBytes: 8 * 1024 * 1024 },
  { carpetaId: DATOS_GH_CARPETA_SEASONS_,
    nombres: ['Cache_Seasons.json'],
    destino: 'Datos descargados/JSON/Endpoints/Seasons/', maxBytes: 1 * 1024 * 1024 },
  { carpetaId: DATOS_GH_CARPETA_HOJAS_,
    nombres: ['Backup_Guerra.csv', 'Backup_Guerra_Logs.csv'],
    destino: 'Datos descargados/CSV/Hojas/', maxBytes: 8 * 1024 * 1024 },
  { carpetaId: DATOS_GH_CARPETA_INDIVIDUAL_,
    todos: true,
    omitir: /\d{4}-\d{2}-\d{2} - #/,
    destino: 'Datos descargados/JSON/RoyaleAPI/Individual/', maxBytes: 1 * 1024 * 1024 },
  { carpetaId: DATOS_GH_CARPETA_INFORMES_,
    todos: true,
    omitir: /^Backup_Guerra ANTES de /i,
    destino: 'Datos descargados/CSV/Informes/', maxBytes: 3 * 1024 * 1024 }
];

var DATOS_GH_PREFIJO_ESTADO_   = 'DATOS_GH_';
var DATOS_GH_HANDLER_AUTO_     = 'subirDatosDriveAGithubAuto';
var DATOS_GH_HANDLER_SEGUIR_   = 'subirDatosDriveAGithubContinuar';
var DATOS_GH_LOTE_BYTES_       = 8 * 1024 * 1024;   // tamaño máximo de contenido por commit
var DATOS_GH_TIEMPO_MAX_MS_    = 4 * 60 * 1000;     // a los 4 min deja lo que falte para la corrida siguiente

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Copia de Drive a GitHub: ejecución -----

/** Sube lo que cambió en Drive desde la última copia. Para correr a mano. */
function subirDatosDriveAGithub() {
  return _datosDriveAGithub_({ forzar: false, soloRevisar: false });
}

/** Igual, pero ignora la memoria de lo ya copiado y revisa todos los archivos. */
function subirDatosDriveAGithubForzado() {
  return _datosDriveAGithub_({ forzar: true, soloRevisar: false });
}

/** Prueba sin escribir nada en GitHub: dice qué subiría y qué omitiría y por qué. */
function revisarDatosDriveAGithubSinSubir() {
  return _datosDriveAGithub_({ forzar: true, soloRevisar: true });
}

/** Lo que ejecuta el activador diario. Nunca lanza error. */
function subirDatosDriveAGithubAuto() {
  try {
    return _datosDriveAGithub_({ forzar: false, soloRevisar: false, auto: true });
  } catch (e) {
    console.error('[DatosDriveGitHub] ' + (e && e.message ? e.message : e));
  }
}

/** Continuación de una corrida que se quedó sin tiempo (la crea la propia función). */
function subirDatosDriveAGithubContinuar() {
  _datosGhQuitarActivadores_(DATOS_GH_HANDLER_SEGUIR_);
  try {
    return _datosDriveAGithub_({ forzar: false, soloRevisar: false, auto: true });
  } catch (e) {
    console.error('[DatosDriveGitHub] ' + (e && e.message ? e.message : e));
  }
}

// ----- Activador diario: instalar y quitar -----

/** Crea el activador diario (hora de Lima): atHour(5) + nearMinute(30) = entre las 5:15 y las 5:45; antes 4:00 a 5:00 (§PF279) y 5:00 a 5:59 (§PF279), cambiado el 26-oct-2026 (§PF280) para que no caiga mientras Base hace su primera corrida completa y la cola del respaldo CSV (5:00 a ~5:12). Se corre una sola vez. */
function instalarActivadorDatosDriveGithub() {
  _datosGhQuitarActivadores_(DATOS_GH_HANDLER_AUTO_);
  ScriptApp.newTrigger(DATOS_GH_HANDLER_AUTO_)
    .timeBased().everyDays(1).atHour(5).nearMinute(30).inTimezone('America/Lima').create();
  console.log('Activador diario creado: ' + DATOS_GH_HANDLER_AUTO_ + ' (entre las 5:15 y las 5:45, hora de Lima).');
}

/** Quita el activador diario y cualquier continuación pendiente. */
function quitarActivadorDatosDriveGithub() {
  var n = _datosGhQuitarActivadores_(DATOS_GH_HANDLER_AUTO_) + _datosGhQuitarActivadores_(DATOS_GH_HANDLER_SEGUIR_);
  console.log('Activadores eliminados: ' + n + '.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Copia de Drive a GitHub: lógica y ayudas -----

function _datosDriveAGithub_(op) {
  var t0 = Date.now();
  if (!_githubToken_()) throw 'Falta GITHUB_TOKEN: Configuración del proyecto → Propiedades del script.';

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.log('[DatosDriveGitHub] Otra corrida está en curso; no se hace nada.');
    return 'Otra corrida en curso.';
  }
  try {
    var props = PropertiesService.getScriptProperties();
    var estado = props.getProperties();   // DATOS_GH_<idArchivo> = '<modificado ms>_<tamaño>'

    var lista = _datosGhListarCandidatos_();
    var omitidos = lista.problemas.slice();
    var sinCambios = 0;
    var porSubir = [];            // { entrada, clave, huella, bytes }
    var pendientes = 0;
    var revisados = [];
    var olvidar = [];             // claves de huella que se borran para que la continuación retome esos archivos

    for (var i = 0; i < lista.candidatos.length; i++) {
      var c = lista.candidatos[i];
      var f = c.archivo;
      var nombre = f.getName();
      var huella = f.getLastUpdated().getTime() + '_' + f.getSize();
      var clave = DATOS_GH_PREFIJO_ESTADO_ + f.getId();

      if (!op.forzar && estado[clave] === huella) { sinCambios++; continue; }
      if (Date.now() - t0 > DATOS_GH_TIEMPO_MAX_MS_) {
        pendientes++;
        // En una corrida forzada la huella guardada ya coincide, y la continuación (no forzada) lo saltaría: se olvida para que lo retome.
        if (op.forzar && estado[clave] === huella) olvidar.push(clave);
        continue;
      }

      var bytesDrive = f.getSize();
      if (bytesDrive > c.maxBytes) {
        omitidos.push(nombre + ' → pesa ' + bytesDrive + ' bytes y el máximo es ' + c.maxBytes);
        continue;
      }
      var contenido = f.getBlob().getDataAsString('UTF-8');
      var bytesTexto = Utilities.newBlob(contenido, 'text/plain').getBytes().length;
      if (bytesTexto !== bytesDrive) {
        omitidos.push(nombre + ' → Drive dice ' + bytesDrive + ' bytes y el texto leído da ' + bytesTexto + ' (no es UTF-8 limpio); no se copia para no alterarlo');
        continue;
      }
      var rev = _githubRevisarSecretos_([{ name: nombre, source: contenido }]);
      if (rev.bloqueos.length) {
        omitidos.push(nombre + ' → posible secreto: ' + rev.bloqueos.join(', '));
        continue;
      }
      var tel = _datosGhBuscarTelefonos_(contenido);
      if (tel.length) {
        omitidos.push(nombre + ' → posible teléfono: ' + tel.join(', ') + '. Revisa el archivo; no se copió a un repo público');
        continue;
      }
      var ruta = c.destino + nombre.replace(/[\/\\]/g, '_');
      porSubir.push({ entrada: { path: ruta, content: contenido }, clave: clave, huella: huella, bytes: bytesTexto });
      revisados.push(ruta);
    }

    console.log('════════════════════════════════════════════');
    console.log('Copia de Drive a GitHub (Datos descargados): ' + lista.candidatos.length + ' archivos vistos, ' +
                sinCambios + ' sin cambios desde la última copia, ' + porSubir.length + ' por subir, ' +
                omitidos.length + ' omitidos, ' + pendientes + ' para la próxima corrida.');
    console.log('════════════════════════════════════════════');
    omitidos.forEach(function(o) { console.log('  ✗ ' + o); });

    if (op.soloRevisar) {
      if (revisados.length) console.log('Subiría, por carpeta (' + revisados.length + ' archivos):');
      _datosGhLineasPorCarpeta_(revisados).forEach(function(l) { console.log(l); });
      console.log('Modo revisión: no se escribió nada en GitHub.');
      return 'Revisión: ' + porSubir.length + ' por subir, ' + omitidos.length + ' omitidos.';
    }

    // Se sube en lotes para no pasar de unos 8 MB de contenido por commit.
    var subidos = 0, commits = [], sinCambioGit = 0;
    var rutasSubidas = [];      // PF272: rutas que de verdad entraron en un commit
    var lote = [], bytesLote = 0;
    var marca = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
    var vaciar = function() {
      if (!lote.length) return;
      var mensaje = 'Datos descargados: copia automática desde Drive - ' + marca + ' (Lima) - ' + lote.length + ' archivos';
      var res = _githubCommitArchivos_(lote.map(function(x) { return x.entrada; }), '(sin borrar)/', [], mensaje);
      if (res.sinCambios) sinCambioGit += lote.length;
      else { subidos += lote.length; commits.push(res.commit.substring(0, 7)); lote.forEach(function(x) { rutasSubidas.push(x.entrada.path); }); }
      // Recién ahora, con el commit hecho (o GitHub ya igual), se recuerda la huella.
      var nuevas = {};
      lote.forEach(function(x) { nuevas[x.clave] = x.huella; });
      props.setProperties(nuevas);
      lote = []; bytesLote = 0;
    };
    // §PF278: si GitHub frena por exceso de escrituras (HTTP 403 «rate limit» o 429), no se termina con error:
    // lo que ya se subió queda hecho, lo del lote que falló no guardó su huella (se repite) y se programa la continuación a 10 minutos.
    var frenoGithub = false;
    try {
      porSubir.forEach(function(x) {
        if (bytesLote + x.bytes > DATOS_GH_LOTE_BYTES_ && lote.length) vaciar();
        lote.push(x); bytesLote += x.bytes;
      });
      vaciar();
    } catch (eSubida) {
      if (!_ghEsLimiteDeGithub_(eSubida)) throw eSubida;
      frenoGithub = true;
      pendientes += porSubir.length - subidos - sinCambioGit;   // incluye el lote que falló
      console.log('GitHub frenó las escrituras por exceso de peticiones: ' + String(eSubida).substring(0, 120));
    }

    var texto = 'Copia a GitHub: ' + subidos + ' archivos subidos' + (commits.length ? ' (commit ' + commits.join(', ') + ')' : '') +
                ', ' + sinCambioGit + ' ya estaban idénticos en GitHub, ' + sinCambios + ' sin cambios en Drive, ' +
                omitidos.length + ' omitidos, ' + pendientes + ' pendientes.';
    console.log(texto);
    if (rutasSubidas.length) {
      console.log('Archivos subidos, por carpeta de Datos descargados (' + rutasSubidas.length + '):');
      _datosGhLineasPorCarpeta_(rutasSubidas).forEach(function(l) { console.log(l); });
    }

    // Si falta algo por falta de tiempo, se programa sola la continuación (también en corridas a mano o forzadas; no en la revisión).
    if (pendientes && !op.soloRevisar) {
      olvidar.forEach(function(k) { props.deleteProperty(k); });
      _datosGhQuitarActivadores_(DATOS_GH_HANDLER_SEGUIR_);
      var esperaMin = frenoGithub ? 10 : 1;
      ScriptApp.newTrigger(DATOS_GH_HANDLER_SEGUIR_).timeBased().after(esperaMin * 60 * 1000).create();
      console.log('Quedaron ' + pendientes + ' archivos ' + (frenoGithub ? 'porque GitHub frenó las escrituras' : 'por falta de tiempo') +
                  '; se continúa sola en ' + esperaMin + (esperaMin === 1 ? ' minuto' : ' minutos') + ' (no hace falta volver a correrla).');
    }
    return texto;
  } finally {
    lock.releaseLock();
  }
}

/** Lista los archivos candidatos: { archivo, destino, maxBytes } o { problema }. */
function _datosGhListarCandidatos_() {
  var candidatos = [];
  var problemas = [];
  DATOS_GH_FUENTES_.forEach(function(fuente) {
    var carpeta;
    try { carpeta = DriveApp.getFolderById(fuente.carpetaId); }
    catch (e) { problemas.push('carpeta ' + fuente.destino + ' → no se pudo abrir en Drive'); return; }

    if (fuente.nombres) {
      fuente.nombres.forEach(function(nombre) {
        var it = carpeta.getFilesByName(nombre);
        var encontrados = [];
        while (it.hasNext()) encontrados.push(it.next());
        if (encontrados.length === 0) { problemas.push(nombre + ' → no está en la carpeta de Drive'); return; }
        if (encontrados.length > 1) { problemas.push(nombre + ' → hay ' + encontrados.length + ' archivos con ese nombre en la carpeta; no sé cuál copiar'); return; }
        candidatos.push({ archivo: encontrados[0], destino: fuente.destino, maxBytes: fuente.maxBytes });
      });
    } else if (fuente.todos) {
      var it2 = carpeta.getFiles();
      while (it2.hasNext()) {
        var f = it2.next();
        if (fuente.omitir && fuente.omitir.test(f.getName())) continue;
        if (fuente.solo && !fuente.solo.test(f.getName())) continue;
        var mime = f.getMimeType();
        if (mime.indexOf('text/') !== 0 && mime !== 'application/json') continue;
        candidatos.push({ archivo: f, destino: fuente.destino, maxBytes: fuente.maxBytes });
      }
    }
  });
  return { candidatos: candidatos, problemas: problemas };
}

/**
 * Devuelve una lista de textos tipo «línea 12 (teléfono con +)». Nunca incluye el valor.
 * Reglas (probadas contra 99 CSV del repo sin falsos positivos):
 *   A) «+» seguido de 8 o más cifras (con espacios, guiones o paréntesis);
 *   B) tres grupos de cifras separados por espacio o guion (999 999 999);
 *   C) 9 a 15 cifras seguidas, salvo marcas de tiempo (13 cifras que empiezan con 15 a 19,
 *      o 10 cifras que empiezan con 15 a 19).
 */
function _datosGhBuscarTelefonos_(texto) {
  var lineas = String(texto).split('\n');
  var hallazgos = [];
  var reA = /\+\d[\d ()-]{7,}\d/;
  var reB = /(^|[^\d-])\d{3}[ -]\d{3}[ -]\d{3,4}(?![\d-])/;
  for (var i = 0; i < lineas.length; i++) {
    var l = lineas[i];
    if (reA.test(l)) { hallazgos.push('línea ' + (i + 1) + ' (teléfono con +)'); }
    else if (reB.test(l)) { hallazgos.push('línea ' + (i + 1) + ' (cifras separadas)'); }
    else {
      var reC = /(^|\D)(\d{9,15})(?!\d)/g;
      var m;
      while ((m = reC.exec(l)) !== null) {
        var d = m[2];
        var marcaTiempo = /^1[5-9]/.test(d) && (d.length === 13 || d.length === 10);
        if (!marcaTiempo) { hallazgos.push('línea ' + (i + 1) + ' (' + d.length + ' cifras seguidas)'); break; }
      }
    }
    if (hallazgos.length >= 5) break;
  }
  return hallazgos;
}

/**
 * _datosGhLineasPorCarpeta_(rutas): PF272 (25-oct-2026). Agrupa rutas «carpeta/archivo» por carpeta de destino y devuelve las líneas
 * del registro: una por carpeta con su total y debajo sus archivos. Función pura (sin Drive ni GitHub); carpetas y archivos en orden alfabético.
 * Una ruta sin «/» se agrupa bajo «(raíz)».
 */
function _datosGhLineasPorCarpeta_(rutas) {
  var grupos = {};
  (rutas || []).forEach(function(r) {
    var k = String(r).lastIndexOf('/');
    var carpeta = k >= 0 ? String(r).substring(0, k + 1) : '(raíz)';
    var nombre = k >= 0 ? String(r).substring(k + 1) : String(r);
    (grupos[carpeta] = grupos[carpeta] || []).push(nombre);
  });
  var lineas = [];
  Object.keys(grupos).sort().forEach(function(carpeta) {
    var nombres = grupos[carpeta].sort();
    lineas.push('  ▸ ' + carpeta + ' → ' + nombres.length + (nombres.length === 1 ? ' archivo' : ' archivos'));
    nombres.forEach(function(n) { lineas.push('      · ' + n); });
  });
  return lineas;
}

// ----- Activador diario: ayuda -----

function _datosGhQuitarActivadores_(handler) {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === handler) { ScriptApp.deleteTrigger(t); n++; }
  });
  return n;
}
