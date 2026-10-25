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
//   - Backup_Guerra.csv y Backup_Guerra_Logs.csv → Datos descargados/CSV/Hojas/
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
// Sin probar en Apps Script real al escribir este archivo.
// =============================================================================

var DATOS_GH_CARPETA_TAMPERMONKEY_ = '1rYAHT0dCpAPFT6BYXDncpuo9ZY780LFt';
var DATOS_GH_CARPETA_HOJAS_        = '1emYkDZMEzYgO5lwmtY-NMhFc5JJd2I3R';
var DATOS_GH_CARPETA_INFORMES_     = '17Mv2oQFTMIdSKlGyHNnrBiApYoHfHg4X';

var DATOS_GH_FUENTES_ = [
  { carpetaId: DATOS_GH_CARPETA_TAMPERMONKEY_,
    nombres: ['Correcciones_Guerra.csv', 'Correcciones_Nuevos.csv', 'Backup_Guerra_Semanal.csv'],
    destino: 'Datos descargados/CSV/Tampermonkey/', maxBytes: 8 * 1024 * 1024 },
  { carpetaId: DATOS_GH_CARPETA_TAMPERMONKEY_,
    todos: true,
    solo: /^(Correcciones_RiverRace_Pendientes\.csv|Log_Tampermonkey_.*\.csv)$/i,
    destino: 'Datos descargados/CSV/Tampermonkey/', maxBytes: 8 * 1024 * 1024 },
  { carpetaId: DATOS_GH_CARPETA_HOJAS_,
    nombres: ['Backup_Guerra.csv', 'Backup_Guerra_Logs.csv'],
    destino: 'Datos descargados/CSV/Hojas/', maxBytes: 8 * 1024 * 1024 },
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

// -----------------------------------------------------------------------------
// Puntos de entrada
// -----------------------------------------------------------------------------

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

/** Crea el activador diario (4:00 a 5:00, hora de Lima). Se corre una sola vez. */
function instalarActivadorDatosDriveGithub() {
  _datosGhQuitarActivadores_(DATOS_GH_HANDLER_AUTO_);
  ScriptApp.newTrigger(DATOS_GH_HANDLER_AUTO_)
    .timeBased().everyDays(1).atHour(4).inTimezone('America/Lima').create();
  console.log('Activador diario creado: ' + DATOS_GH_HANDLER_AUTO_ + ' (entre las 4:00 y las 5:00, hora de Lima).');
}

/** Quita el activador diario y cualquier continuación pendiente. */
function quitarActivadorDatosDriveGithub() {
  var n = _datosGhQuitarActivadores_(DATOS_GH_HANDLER_AUTO_) + _datosGhQuitarActivadores_(DATOS_GH_HANDLER_SEGUIR_);
  console.log('Activadores eliminados: ' + n + '.');
}

function _datosGhQuitarActivadores_(handler) {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === handler) { ScriptApp.deleteTrigger(t); n++; }
  });
  return n;
}

// -----------------------------------------------------------------------------
// Revisiones de seguridad
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Lógica principal
// -----------------------------------------------------------------------------

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

    for (var i = 0; i < lista.candidatos.length; i++) {
      var c = lista.candidatos[i];
      var f = c.archivo;
      var nombre = f.getName();
      var huella = f.getLastUpdated().getTime() + '_' + f.getSize();
      var clave = DATOS_GH_PREFIJO_ESTADO_ + f.getId();

      if (!op.forzar && estado[clave] === huella) { sinCambios++; continue; }
      if (Date.now() - t0 > DATOS_GH_TIEMPO_MAX_MS_) { pendientes++; continue; }

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
      revisados.forEach(function(r) { console.log('  · subiría: ' + r); });
      console.log('Modo revisión: no se escribió nada en GitHub.');
      return 'Revisión: ' + porSubir.length + ' por subir, ' + omitidos.length + ' omitidos.';
    }

    // Se sube en lotes para no pasar de unos 8 MB de contenido por commit.
    var subidos = 0, commits = [], sinCambioGit = 0;
    var lote = [], bytesLote = 0;
    var marca = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
    var vaciar = function() {
      if (!lote.length) return;
      var mensaje = 'Datos descargados: copia automática desde Drive - ' + marca + ' (Lima) - ' + lote.length + ' archivos';
      var res = _githubCommitArchivos_(lote.map(function(x) { return x.entrada; }), '(sin borrar)/', [], mensaje);
      if (res.sinCambios) sinCambioGit += lote.length; else { subidos += lote.length; commits.push(res.commit.substring(0, 7)); }
      // Recién ahora, con el commit hecho (o GitHub ya igual), se recuerda la huella.
      var nuevas = {};
      lote.forEach(function(x) { nuevas[x.clave] = x.huella; });
      props.setProperties(nuevas);
      lote = []; bytesLote = 0;
    };
    porSubir.forEach(function(x) {
      if (bytesLote + x.bytes > DATOS_GH_LOTE_BYTES_ && lote.length) vaciar();
      lote.push(x); bytesLote += x.bytes;
    });
    vaciar();

    var texto = 'Copia a GitHub: ' + subidos + ' archivos subidos' + (commits.length ? ' (commit ' + commits.join(', ') + ')' : '') +
                ', ' + sinCambioGit + ' ya estaban idénticos en GitHub, ' + sinCambios + ' sin cambios en Drive, ' +
                omitidos.length + ' omitidos, ' + pendientes + ' pendientes.';
    console.log(texto);
    if (subidos) console.log('Falta hacer pull de Backend en GitHub Desktop para verlos en tu equipo.');

    if (pendientes && op.auto) {
      _datosGhQuitarActivadores_(DATOS_GH_HANDLER_SEGUIR_);
      ScriptApp.newTrigger(DATOS_GH_HANDLER_SEGUIR_).timeBased().after(60 * 1000).create();
      console.log('Quedaron ' + pendientes + ' archivos por falta de tiempo; se continúa en 1 minuto.');
    }
    return texto;
  } finally {
    lock.releaseLock();
  }
}
