// =============================================================================
// 02_Backstage.gs
// MOTOR COMPLETO. Lógica de fondo para Base, Generador, extracción ZIP/TXT y API.
// Nombres de archivo estandarizados a "Base" y "Generador" con su extensión.
// =============================================================================

var CARPETA_GENERADOR_ID = '1YmgyCh-7Y6DIoScS6lpidQZk3IeDsEGA';
var CARPETA_BASE_ID = '1OmSVruEHm4RlP-7VN3G_M2HublfWK1W8';
var NOMBRE_HOJA_BASE = 'Base';

// Interruptor: si es true, subirBaseDesdeZip() también crea/actualiza una
// hoja "Sistema Clanes - Familia Terna - <fecha>" con el mismo código que
// se sube a Base. Antes vivía en la ya eliminada ejecutarTodoElProceso();
// se conserva aquí con el mismo comportamiento y apagado por defecto.
var CREAR_O_ACTUALIZAR_HOJA_SISTEMA = false;

/**
 * Devuelve la subcarpeta de respaldos correspondiente ("Generador" o "Base"),
 * dentro de la carpeta principal del Generador (CARPETA_GENERADOR_ID). Si la
 * subcarpeta no existe todavía, la crea. Así los archivos de cada proyecto
 * (zip/txt/gs/md/log) quedan organizados cada uno en su propia carpeta, en
 * vez de todos sueltos en la raíz.
 * @param {string} nombreBase 'Base' | 'Generador'
 * @return {Folder}
 */
function _carpetaDeRespaldos_(nombreBase) {
  var carpetaPadre = DriveApp.getFolderById(CARPETA_GENERADOR_ID);
  var subcarpetas = carpetaPadre.getFoldersByName(nombreBase);
  if (subcarpetas.hasNext()) return subcarpetas.next();
  return carpetaPadre.createFolder(nombreBase);
}

var MANIFIESTO_CANONICO_ = {
  timeZone: "America/Lima",
  dependencies: {
    enabledAdvancedServices: [
      { userSymbol: "People", version: "v1", serviceId: "peopleapi" }
    ]
  },
  exceptionLogging: "STACKDRIVER",
  runtimeVersion: "V8",
  oauthScopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/script.projects.readonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/contacts",
    "https://www.googleapis.com/auth/script.scriptapp"
  ],
  webapp: {
    executeAs: "USER_DEPLOYING",
    access: "ANYONE_ANONYMOUS"
  }
};

// =============================================================================
// AVISO ANTI-DUPLICADOS (se inserta en toda descarga: Base.txt/.gs/.md y el
// "Script consolidado.gs"/"00_LEEME.txt" dentro del ZIP). Protege contra el
// caso real que ya pasó: una IA reempaquetó los archivos dentro de una
// carpeta y, al subirlos, el nombre de la carpeta se pegó al del archivo
// y se crearon duplicados en vez de actualizar los existentes.
// =============================================================================

var AVISO_ANTI_CARPETAS_ =
  'AVISO PARA CUALQUIER IA O PERSONA QUE EDITE ESTE PROYECTO:\n' +
  '1) NO metas los archivos dentro de una carpeta al armar el ZIP. Cada\n' +
  '   archivo .gs debe quedar SUELTO en la raíz del .zip.\n' +
  '   Correcto:   01_Principal.gs\n' +
  '   Incorrecto: Base/01_Principal.gs  (esto pega el nombre de la carpeta\n' +
  '   al del archivo y crea un duplicado en vez de actualizar el original).\n' +
  '2) Al subir de vuelta, usa el MISMO nombre exacto de archivo que bajaste,\n' +
  '   sin prefijos ni sufijos. Si agregas un archivo nuevo, dale un nombre\n' +
  '   distinto; nunca dupliques uno existente con otro nombre.\n' +
  '3) NO leas, edites, generes ni actualices "Script consolidado.gs". Ese\n' +
  '   archivo es un respaldo generado 100% automáticamente por las propias\n' +
  '   funciones del Generador (_descargarProyectoAArchivos) cada vez que se\n' +
  '   sube o descarga cualquier formato. Cualquier IA o persona que edite\n' +
  '   este proyecto debe ignorarlo por completo: no es código fuente real,\n' +
  '   es solo un resumen legible; editarlo a mano no tiene efecto (se\n' +
  '   sobrescribe automáticamente) y leerlo para entender el código es\n' +
  '   redundante, ya que su contenido es idéntico a la suma de los demás\n' +
  '   archivos .gs del proyecto.\n' +
  '4) Cuando una IA edite este proyecto a pedido del usuario, NO debe\n' +
  '   reempaquetar ni entregar el .zip completo del proyecto por defecto.\n' +
  '   Debe entregar el CONTENIDO COMPLETO (no fragmentos ni parches) de\n' +
  '   cada archivo NUMERADO que haya modificado (01_Principal.gs,\n' +
  '   02_Backstage.gs, etc.), listo para copiar/pegar y reemplazar el\n' +
  '   archivo entero en el editor; y el manifiesto "appsscript.json"\n' +
  '   completo también, solo si ese archivo cambió. Nunca entregar\n' +
  '   "Script consolidado.gs" ni este mismo LEEME como parte de una\n' +
  '   edición (ver punto 3). Esto ahorra tokens y tiempo frente a\n' +
  '   regenerar y comprimir todos los archivos cada vez, incluidos los\n' +
  '   que no cambiaron. Solo generar el .zip completo si el usuario lo\n' +
  '   pide explícitamente.\n' +
  '5) Los archivos modificados (punto 4) se deben ENTREGAR COMO ARCHIVO\n' +
  '   DESCARGABLE/ABRIBLE, nunca pegados como bloque de código dentro del\n' +
  '   chat. Un archivo real se puede abrir, copiar y guardar directamente;\n' +
  '   un bloque de código en el chat obliga a seleccionar y copiar a mano,\n' +
  '   y es más difícil de manejar en archivos largos.';

/** Antepone el aviso a un texto, solo si todavía no está presente. */
function _conAviso_(texto) {
  if (texto.indexOf(AVISO_ANTI_CARPETAS_) !== -1) return texto;
  return '/*\n' + AVISO_ANTI_CARPETAS_ + '\n*/\n\n' + texto;
}

// =============================================================================
// UTILIDADES DE DRIVE Y LOG
// =============================================================================

function _registrarLogGenerador(funcion, descripcion, advertencias) {
  try {
    var carpeta = _carpetaDeRespaldos_('Generador');
    var filename = 'Log_Generador.json';
    var nuevaEntrada = {
      fecha: Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss') + ' (Lima)',
      autor: 'Claude (Anthropic)',
      funcion: funcion || '',
      descripcion: descripcion || '',
      advertencias: advertencias || []
    };
    var archivos = carpeta.getFilesByName(filename);
    if (archivos.hasNext()) {
      var archivoLog = archivos.next();
      var contenidoActual = archivoLog.getBlob().getDataAsString('UTF-8');
      var logArray = [];
      try { logArray = JSON.parse(contenidoActual); } catch(e) { logArray = []; }
      if (!Array.isArray(logArray)) logArray = [];
      logArray.push(nuevaEntrada);
      archivoLog.setContent(JSON.stringify(logArray, null, 2));
    } else {
      carpeta.createFile(filename, JSON.stringify([nuevaEntrada], null, 2), MimeType.PLAIN_TEXT);
    }
  } catch(e) {
    console.log('[Log] Error escribiendo Log_Generador.json: ' + e.message);
  }
}

function obtenerSpreadsheetPorNombreEnCarpeta_(folderId, nombreHoja) {
  var carpeta = DriveApp.getFolderById(folderId);
  var archivos = carpeta.getFilesByName(nombreHoja);
  if (!archivos.hasNext()) {
    throw 'No se encontró la hoja "' + nombreHoja + '" en la carpeta ' + folderId;
  }
  return archivos.next().getId();
}

// =============================================================================
// CONSOLIDACIÓN: LECTURA DE ZIP Y TXT/GS
// =============================================================================

function consolidarCodigoDesdeZip(nombreZip) {
  if (!nombreZip) nombreZip = 'Base.zip'; // Fallback estándar
  var nombreProyecto = nombreZip.replace(/\.zip$/i, ''); // 'Base' o 'Generador'
  var carpeta = _carpetaDeRespaldos_(nombreProyecto);
  var archivosZip = carpeta.getFilesByName(nombreZip);
  if (!archivosZip.hasNext()) throw 'No encontré el ZIP "' + nombreZip + '" en la carpeta "' + nombreProyecto + '"';

  var blobs = Utilities.unzip(archivosZip.next().getBlob());
  blobs.sort(function(a, b){ return a.getName().localeCompare(b.getName()); });

  var textoConsolidado = "/* CÓDIGO CONSOLIDADO GENERADO EL " + Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss') + " */\n\n\n\n";
  var archivos = [];

  blobs.forEach(function(blob) {
    var nombreOriginal = blob.getName();
    if (/^Log[_\s]/i.test(nombreOriginal) || nombreOriginal.indexOf('Log_ScriptTerna') === 0 || nombreOriginal.indexOf('Log_Generador') === 0) return;

    if (nombreOriginal.endsWith('.gs.js') || nombreOriginal.endsWith('.js') || nombreOriginal.endsWith('.gs')) {
      var nombreBase = nombreBaseDesdeArchivo_(nombreOriginal);
      if (nombreBase.indexOf('Script consolidado') === 0) return;

      var contenido = blob.getDataAsString('UTF-8');
      textoConsolidado += "// --- ARCHIVO: " + nombreOriginal + " ---\n";
      textoConsolidado += contenido + "\n\n";
      archivos.push({ nombre: nombreBase, contenido: contenido });
    }
  });

  return { textoConsolidado: textoConsolidado, archivos: archivos };
}

function _extraerArchivosDeTexto(texto) {
  var archivos = [];
  var lineas = texto.split('\n');
  var i = 0;
  while (i < lineas.length) {
    var lineaTrim = lineas[i].trim();
    if (lineaTrim.startsWith('// --- ARCHIVO: ')) {
      var nombre = lineaTrim.replace('// --- ARCHIVO: ', '').replace(' ---', '');
      if (nombre.endsWith('.gs')) nombre = nombre.slice(0, -3);
      if (nombre.endsWith('.js')) nombre = nombre.slice(0, -3);
      var contenido = '';
      i++;
      while (i < lineas.length && !lineas[i].trim().startsWith('// --- ARCHIVO: ')) {
        contenido += lineas[i] + '\n';
        i++;
      }
      if (contenido.endsWith('\n')) contenido = contenido.slice(0, -1);
      archivos.push({ nombre: nombre, contenido: contenido });
    } else {
      i++;
    }
  }
  return archivos;
}

// =============================================================================
// FORMATO MARKDOWN LEGIBLE (solo para .md — pensado para que una IA lo lea
// directo, sin descomprimir el ZIP: encabezados "## archivo.gs" + bloque de
// código, en vez del formato "// --- ARCHIVO: ... ---" usado en .txt/.gs.
// =============================================================================

/**
 * Genera el Markdown legible a partir de una lista de archivos
 * [{nombre, contenido}, ...]. Es más liviano de leer para una IA porque
 * no repite comentarios de separación dentro del propio código.
 */
function _generarMarkdownLegible_(nombreProyecto, archivos, fechaStr) {
  var partes = [];
  partes.push('# ' + nombreProyecto + ' — código consolidado');
  partes.push('_Generado: ' + fechaStr + ' (Lima)_');
  partes.push('');
  partes.push('> ' + AVISO_ANTI_CARPETAS_.split('\n').join('\n> '));
  partes.push('');
  archivos.forEach(function(a) {
    partes.push('## ' + a.nombre + '.gs');
    partes.push('```javascript');
    partes.push(a.contenido);
    partes.push('```');
    partes.push('');
  });
  return partes.join('\n');
}

/**
 * Reconstruye la lista de archivos [{nombre, contenido}, ...] a partir del
 * Markdown legible generado por _generarMarkdownLegible_. Busca encabezados
 * "## nombre.gs" seguidos de un bloque ```...```.
 */
function _extraerArchivosDeMarkdown_(texto) {
  var archivos = [];
  var lineas = texto.split('\n');
  var i = 0;
  while (i < lineas.length) {
    var m = /^##\s+(.+?)\s*$/.exec(lineas[i]);
    if (m) {
      var nombre = m[1].trim();
      if (nombre.endsWith('.gs')) nombre = nombre.slice(0, -3);
      i++;
      while (i < lineas.length && lineas[i].trim() === '') i++;
      if (i < lineas.length && lineas[i].trim().indexOf('```') === 0) {
        i++; // saltar la valla de apertura ``` (o ```javascript)
        var contenido = '';
        while (i < lineas.length && lineas[i].trim() !== '```') {
          contenido += lineas[i] + '\n';
          i++;
        }
        i++; // saltar la valla de cierre ```
        if (contenido.endsWith('\n')) contenido = contenido.slice(0, -1);
        archivos.push({ nombre: nombre, contenido: contenido });
        continue;
      }
    }
    i++;
  }
  return archivos;
}

function nombreBaseDesdeArchivo_(nombreCompleto) {
  var nombre = nombreCompleto;
  while (/\.(gs|js)$/i.test(nombre)) {
    nombre = nombre.replace(/\.(gs|js)$/i, '');
  }
  return nombre;
}

// =============================================================================
// DESCARGA Y SUBIDA (BASE Y GENERADOR)
// =============================================================================

// =============================================================================
// CORRECCIÓN EN LA FUNCIÓN DE DESCARGA
// =============================================================================

function _descargarProyectoAArchivos(nombreBase) {
  var ssId = null;
  var scriptId = null;

  // Determinar el ID del proyecto (Base o Generador)
  if (nombreBase === 'Base') {
    ssId = obtenerSpreadsheetPorNombreEnCarpeta_(CARPETA_BASE_ID, NOMBRE_HOJA_BASE);
    var props = PropertiesService.getScriptProperties();
    scriptId = props.getProperty('SCRIPT_ID_' + ssId);
    if (!scriptId) throw 'No hay scriptId guardado para Base. Corre subirBaseDesdeZip() (o cualquier subirBaseDesdeX) primero.';
  } else if (nombreBase === 'Generador') {
    scriptId = ScriptApp.getScriptId(); 
  } else {
    throw 'Nombre de proyecto no válido: ' + nombreBase;
  }

  var archivos = obtenerArchivosProyecto_(scriptId).filter(function(a) {
    return a.name.indexOf('Script consolidado') !== 0;
  });

  var fechaStr = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
  var archivosServerJs = archivos.filter(function(a){ return a.type === 'SERVER_JS'; });

  // Texto unificado clásico (formato "// --- ARCHIVO: ... ---"), usado por
  // Base.txt / Base.gs y por el "Script consolidado.gs" dentro del ZIP.
  var consolidado = '/* CÓDIGO CONSOLIDADO GENERADO EL ' + fechaStr + ' */\n\n\n\n';
  archivosServerJs.forEach(function(a) {
    consolidado += '// --- ARCHIVO: ' + a.name + '.gs ---\n';
    consolidado += a.source + '\n\n';
  });
  consolidado = _conAviso_(consolidado);

  // AVISO PARA CUALQUIER IA O PERSONA QUE EDITE ESTE PROYECTO:
  // "Script consolidado.gs" (más abajo) es un respaldo 100% autogenerado.
  // No lo leas para entender el código (es redundante con los demás .gs),
  // no lo edites a mano (se sobrescribe solo en cada subida/descarga) y
  // nunca lo generes ni actualices manualmente: eso ya lo hace esta misma
  // función automáticamente.

  // Markdown legible (formato "## archivo.gs" + bloque de código), pensado
  // para que una IA lo lea directo sin descomprimir el ZIP.
  var markdownLegible = _generarMarkdownLegible_(
    nombreBase,
    archivosServerJs.map(function(a){ return { nombre: a.name, contenido: a.source }; }),
    fechaStr
  );

  var carpeta = _carpetaDeRespaldos_(nombreBase);
  
  // 1. Guardar/Actualizar el archivo .txt
  var nombreTxt = nombreBase + '.txt';
  var archivoTxtExistente = carpeta.getFilesByName(nombreTxt);
  if (archivoTxtExistente.hasNext()) {
    archivoTxtExistente.next().setContent(consolidado); // Actualiza el existente
  } else {
    carpeta.createFile(nombreTxt, consolidado, MimeType.PLAIN_TEXT); // Crea nuevo
  }

  // 2. Guardar/Actualizar el archivo .gs
  var nombreGs = nombreBase + '.gs';
  var archivoGsExistente = carpeta.getFilesByName(nombreGs);
  if (archivoGsExistente.hasNext()) {
    archivoGsExistente.next().setContent(consolidado); // Actualiza el existente
  } else {
    carpeta.createFile(nombreGs, consolidado, MimeType.PLAIN_TEXT); // Crea nuevo
  }

  // 2b. Guardar/Actualizar el archivo .md (formato Markdown legible, no el consolidado clásico)
  var nombreMd = nombreBase + '.md';
  var archivoMdExistente = carpeta.getFilesByName(nombreMd);
  if (archivoMdExistente.hasNext()) {
    archivoMdExistente.next().setContent(markdownLegible); // Actualiza el existente
  } else {
    carpeta.createFile(nombreMd, markdownLegible, MimeType.PLAIN_TEXT); // Crea nuevo
  }

  // 2c. Indice_<Nombre>.md: tabla N.º / archivo / estado respecto de la descarga anterior
  _guardarIndiceArchivos_(nombreBase, carpeta, archivos, fechaStr);

  // 3. Guardar ZIP (archivos sueltos tal cual están en el proyecto, + marcador + consolidado)
  var blobs = archivos.map(function(archivo) {
    var extension = (archivo.type === 'JSON') ? '.json' : (archivo.type === 'HTML') ? '.html' : '.gs';
    return Utilities.newBlob(archivo.source, 'text/plain', archivo.name + extension);
  });
  blobs.push(Utilities.newBlob(AVISO_ANTI_CARPETAS_, 'text/plain', '00_LEEME_ANTES_DE_SUBIR.txt'));
  blobs.push(Utilities.newBlob(consolidado, 'text/plain', 'Script consolidado.gs'));

  var nombreZip = nombreBase + '.zip';
  var archivosZipExistentes = carpeta.getFilesByName(nombreZip);
  if (archivosZipExistentes.hasNext()) {
    archivosZipExistentes.next().setTrashed(true); // Elimina el anterior
  }
  carpeta.createFile(Utilities.zip(blobs, nombreZip)); // Crea el nuevo reemplazándolo

  _registrarLogGenerador('_descargarProyectoAArchivos() / ' + nombreBase, 'Proyecto descargado a ' + nombreZip + ', ' + nombreTxt + ', ' + nombreGs + ' y ' + nombreMd + ' con ' + archivos.length + ' archivos.', []);
}

// -----------------------------------------------------------------------------
// Indice_Base.md / Indice_Generador.md
// Se REEMPLAZAN en cada descarga o subida (también en GitHub: <Nombre>/Indice_<Nombre>.md).
// Tabla con N.º automático, nombre del archivo y estado respecto de la descarga anterior:
// «permanece igual», «modificado» (solo los que no se crearon ni eliminaron en esa tanda),
// «creado» o «eliminado». Para saber qué cambió, el propio archivo guarda al final la huella
// de cada archivo en un comentario <!-- HUELLAS {...} -->; la siguiente descarga lo lee.
// Los eliminados figuran solo en la tanda en que desaparecen.
// [→ Contexto_Base_Web.md §PF151]
// -----------------------------------------------------------------------------

var INDICE_ARCHIVOS_RE_HUELLAS_ = /<!--\s*HUELLAS\s+(\{[\s\S]*?\})\s*-->/;

/** Huella corta (MD5, 12 caracteres) del tipo y del contenido de un archivo del proyecto. */
function _huellaArchivo_(a) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,
                                      String(a.type) + '\n' + String(a.source || ''),
                                      Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    hex += ('0' + (bytes[i] < 0 ? bytes[i] + 256 : bytes[i]).toString(16)).slice(-2);
  }
  return hex.substring(0, 12);
}

/**
 * Arma el texto de Indice_<Nombre>.md. Función pura (salvo la huella): recibe el contenido del
 * índice anterior (o '' si no hay) y los archivos reales del proyecto (sin "Script consolidado").
 */
function _generarIndiceArchivos_(nombreBase, archivos, indicePrevio, fechaStr) {
  var previas = null;
  var m = INDICE_ARCHIVOS_RE_HUELLAS_.exec(String(indicePrevio || ''));
  if (m) { try { previas = JSON.parse(m[1]); } catch (e) { previas = null; } }

  var actuales = archivos.map(function(a) {
    return { nombre: a.name + _extDeTipo_(a.type), huella: _huellaArchivo_(a) };
  }).sort(function(x, y) { return x.nombre < y.nombre ? -1 : (x.nombre > y.nombre ? 1 : 0); });

  var filas = [];
  var cuenta = { 'permanece igual': 0, 'modificado': 0, 'creado': 0, 'eliminado': 0 };
  var huellasNuevas = {};
  actuales.forEach(function(f) {
    huellasNuevas[f.nombre] = f.huella;
    var estado;
    if (!previas || !(f.nombre in previas)) estado = 'creado';
    else estado = previas[f.nombre] === f.huella ? 'permanece igual' : 'modificado';
    cuenta[estado]++;
    filas.push({ nombre: f.nombre, estado: estado });
  });
  if (previas) {
    Object.keys(previas).sort().forEach(function(n) {
      if (!(n in huellasNuevas)) { cuenta['eliminado']++; filas.push({ nombre: n, estado: 'eliminado' }); }
    });
  }

  var out = [];
  out.push('# Índice de archivos — ' + nombreBase);
  out.push('');
  out.push('Generado automáticamente por el Generador el ' + fechaStr + ' (Lima). No editar a mano: se reemplaza en cada descarga o subida.');
  out.push('El estado es respecto de la descarga o subida anterior. «modificado» es solo para los archivos que no se crearon ni eliminaron en esa tanda; los eliminados figuran únicamente en la tanda en que desaparecen.');
  if (!previas) {
    out.push('');
    out.push('**No había un índice anterior con el que comparar:** esta vez todos los archivos figuran como «creado».');
  }
  out.push('');
  out.push('Total: ' + actuales.length + ' archivos en el proyecto — ' + cuenta['permanece igual'] + ' permanecen iguales, ' +
           cuenta['modificado'] + ' modificados, ' + cuenta['creado'] + ' creados, ' + cuenta['eliminado'] + ' eliminados.');
  out.push('');
  out.push('| N.º | Archivo | Estado |');
  out.push('|---|---|---|');
  filas.forEach(function(f, i) {
    out.push('| ' + (i + 1) + ' | ' + f.nombre + ' | ' + f.estado + ' |');
  });
  out.push('');
  out.push('<!-- HUELLAS ' + JSON.stringify(huellasNuevas) + ' -->');
  out.push('');
  return out.join('\n');
}

/** Crea o reemplaza (setContent, para conservar las versiones de Drive) Indice_<Nombre>.md en la carpeta de respaldos. */
function _guardarIndiceArchivos_(nombreBase, carpeta, archivos, fechaStr) {
  var nombreIndice = 'Indice_' + nombreBase + '.md';
  var it = carpeta.getFilesByName(nombreIndice);
  var archivoIndice = it.hasNext() ? it.next() : null;
  var previo = archivoIndice ? archivoIndice.getBlob().getDataAsString('UTF-8') : '';
  var texto = _generarIndiceArchivos_(nombreBase, archivos, previo, fechaStr);
  if (archivoIndice) archivoIndice.setContent(texto);
  else carpeta.createFile(nombreIndice, texto, MimeType.PLAIN_TEXT);
  return texto;
}

function _subirArchivosAProyecto(nombreBase, extension) {
  var carpeta = _carpetaDeRespaldos_(nombreBase);
  
  // Búsqueda estricta por nombre base + extensión automática
  var nombreArchivo = nombreBase + '.' + extension;
  var archivosDrive = carpeta.getFilesByName(nombreArchivo);
  if (!archivosDrive.hasNext()) throw 'No encontré el archivo "' + nombreArchivo + '" en la carpeta "' + nombreBase + '".';

  var archivoDrive = archivosDrive.next();
  var nombreReal = archivoDrive.getName();
  var blobs = [];

  // Extraer archivos internos
  if (nombreReal.endsWith('.zip')) {
    var resultadoZip = consolidarCodigoDesdeZip(nombreReal);
    blobs = resultadoZip.archivos;
  } else if (nombreReal.endsWith('.md')) {
    // Formato Markdown legible: encabezados "## archivo.gs" + bloque ```
    var contenidoMd = archivoDrive.getBlob().getDataAsString('UTF-8');
    blobs = _extraerArchivosDeMarkdown_(contenidoMd);
  } else if (nombreReal.endsWith('.txt') || nombreReal.endsWith('.gs')) {
    // Formato clásico: "// --- ARCHIVO: nombre.gs ---"
    var contenido = archivoDrive.getBlob().getDataAsString('UTF-8');
    blobs = _extraerArchivosDeTexto(contenido);
  } else {
    throw 'Formato de archivo no soportado: ' + nombreReal;
  }

  // (Opcional, solo Base.zip) Crear/actualizar la hoja "Sistema" con el
  // mismo código, tal como hacía la antigua ejecutarTodoElProceso().
  if (nombreBase === 'Base' && extension === 'zip' && CREAR_O_ACTUALIZAR_HOJA_SISTEMA) {
    var carpetaPrincipal = DriveApp.getFolderById(CARPETA_GENERADOR_ID);
    var fechaFormateada = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy');
    var nombreHojaSistema = 'Sistema Clanes - Familia Terna - ' + fechaFormateada;
    var archivosExistentes = carpetaPrincipal.getFilesByName(nombreHojaSistema);
    var nuevoSs;
    if (archivosExistentes.hasNext()) {
      nuevoSs = SpreadsheetApp.openById(archivosExistentes.next().getId());
    } else {
      nuevoSs = SpreadsheetApp.create(nombreHojaSistema);
      DriveApp.getFileById(nuevoSs.getId()).moveTo(carpetaPrincipal);
      nuevoSs.getSheets()[0].setName('Terreno_Limpio');
    }
    var ssIdSistema = nuevoSs.getId();
    PropertiesService.getScriptProperties().setProperty('HOJA_ACTIVA_ID', ssIdSistema);
    actualizarScriptDeHoja(ssIdSistema, blobs);
  }

  // Destino: Base o Generador
  var ssId = null;
  if (nombreBase === 'Base') {
    ssId = obtenerSpreadsheetPorNombreEnCarpeta_(CARPETA_BASE_ID, NOMBRE_HOJA_BASE);
  }
  var reporte = actualizarScriptDeHoja(ssId, blobs, nombreBase);

  // A partir de aquí, subir SIEMPRE deja los 4 formatos (.zip/.txt/.gs/.md)
  // sincronizados con lo que se acaba de subir, sin importar desde cuál de
  // los 4 se subió ni si el destino es "Base" o "Generador". Así no hace
  // falta una función "actualizar" separada: subir YA actualiza todo.
  _descargarProyectoAArchivos(nombreBase);

  _registrarLogGenerador(
    '_subirArchivosAProyecto() / ' + nombreBase,
    nombreArchivo + ' subido al proyecto "' + nombreBase + '" y los 4 respaldos (' +
    nombreBase + '.zip/.gs/.txt/.md) regenerados a partir del código recién subido. ' +
    'Actualizados: ' + (reporte.actualizados ? reporte.actualizados.length : 0) +
    ' | Agregados: ' + (reporte.agregados ? reporte.agregados.length : 0) +
    ' | Sin tocar: ' + (reporte.sinTocar ? reporte.sinTocar.length : 0),
    []
  );

  return reporte;
}

// =============================================================================
// INYECCIÓN APPS SCRIPT API
// =============================================================================

function actualizarScriptDeHoja(ssId, archivosNuevos, nombreBase) {
  var scriptId;
  if (nombreBase && nombreBase === 'Generador') {
    scriptId = ScriptApp.getScriptId();
  } else {
    var props = PropertiesService.getScriptProperties();
    var clavePropiedad = 'SCRIPT_ID_' + ssId;
    scriptId = props.getProperty(clavePropiedad);
    if (!scriptId) {
      scriptId = crearProyectoVinculado_(ssId);
      props.setProperty(clavePropiedad, scriptId);
      console.log('Proyecto de Apps Script vinculado creado para ' + ssId + '. scriptId: ' + scriptId);
    }
  }

  var archivosExistentes = obtenerArchivosProyecto_(scriptId);
  var mapaExistentes = {};
  archivosExistentes.forEach(function(a){ mapaExistentes[a.name] = a; });

  var actualizados = [], agregados = [], archivosFinales = [], nombresDelZip = {};

  // El manifiesto NUNCA se pisa a la fuerza. Si el proyecto ya tiene un
  // "appsscript.json" (caso normal: Base ya existe), se conserva tal cual
  // está — subir código no debe tocar scopes ni configuración del
  // manifiesto. MANIFIESTO_CANONICO_ solo se usa como valor por defecto la
  // PRIMERA vez que se crea un proyecto vinculado nuevo (todavía no tiene
  // ningún appsscript.json propio).
  if (mapaExistentes['appsscript']) {
    archivosFinales.push(mapaExistentes['appsscript']);
  } else {
    archivosFinales.push({
      name: 'appsscript',
      type: 'JSON',
      source: JSON.stringify(MANIFIESTO_CANONICO_)
    });
  }

  archivosNuevos.forEach(function(archivo) {
    nombresDelZip[archivo.nombre] = true;
    if (mapaExistentes[archivo.nombre]) {
      actualizados.push(archivo.nombre);
    } else {
      agregados.push(archivo.nombre);
    }
    archivosFinales.push({
      name: archivo.nombre,
      type: 'SERVER_JS',
      source: archivo.contenido
    });
  });

  var sinTocar = [];
  archivosExistentes.forEach(function(a) {
    if (a.name === 'appsscript') return;
    if (!nombresDelZip[a.name]) {
      archivosFinales.push(a);
      sinTocar.push(a.name);
    }
  });

  var opciones = {
    method: 'put',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ files: archivosFinales }),
    muteHttpExceptions: true
  };
  var url = 'https://script.googleapis.com/v1/projects/' + scriptId + '/content';
  var respuesta = UrlFetchApp.fetch(url, opciones);
  var codigoHttp = respuesta.getResponseCode();

  if (codigoHttp !== 200) {
    throw 'Error al actualizar el script (' + codigoHttp + '): ' + respuesta.getContentText();
  }

  console.log('--- Reporte de actualización (' + (nombreBase || 'Base') + ') ---');
  console.log('Actualizados (' + actualizados.length + '): ' + (actualizados.length ? actualizados.join(', ') : 'ninguno'));
  console.log('Agregados (' + agregados.length + '): ' + (agregados.length ? agregados.join(', ') : 'ninguno'));
  console.log('Sin tocar (' + sinTocar.length + '): ' + (sinTocar.length ? sinTocar.join(', ') : 'ninguno'));
  return { 
    todosYaExistian: (agregados.length === 0), 
    actualizados: actualizados, 
    agregados: agregados, 
    sinTocar: sinTocar 
  };
}

// =============================================================================
// MANTENIMIENTO: VACIAR PROYECTO DE APPS SCRIPT
// =============================================================================

/**
 * Elimina TODOS los archivos de código del proyecto de Apps Script indicado,
 * dejando únicamente el manifiesto "appsscript" con la configuración canónica.
 * Por seguridad solo admite 'Base' (nunca borra el propio Generador desde aquí).
 */
function _eliminarTodosLosArchivosDeProyecto(nombreBase) {
  if (nombreBase !== 'Base') {
    throw 'Por seguridad, esta función solo puede vaciar el proyecto de "Base".';
  }

  var ssId = obtenerSpreadsheetPorNombreEnCarpeta_(CARPETA_BASE_ID, NOMBRE_HOJA_BASE);
  var props = PropertiesService.getScriptProperties();
  var scriptId = props.getProperty('SCRIPT_ID_' + ssId);
  if (!scriptId) throw 'No hay scriptId guardado para Base. Corre subirBaseDesdeZip() (o cualquier subirBaseDesdeX) primero.';

  var archivosExistentes = obtenerArchivosProyecto_(scriptId);
  var nombresEliminados = archivosExistentes
    .filter(function(a) { return a.name !== 'appsscript'; })
    .map(function(a) { return a.name; });

  var opciones = {
    method: 'put',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({
      files: [{ name: 'appsscript', type: 'JSON', source: JSON.stringify(MANIFIESTO_CANONICO_) }]
    }),
    muteHttpExceptions: true
  };
  var url = 'https://script.googleapis.com/v1/projects/' + scriptId + '/content';
  var respuesta = UrlFetchApp.fetch(url, opciones);
  var codigoHttp = respuesta.getResponseCode();

  if (codigoHttp !== 200) {
    throw 'Error al vaciar el proyecto de Base (' + codigoHttp + '): ' + respuesta.getContentText();
  }

  console.log('--- Vaciado del proyecto de Apps Script de "Base" ---');
  console.log('Archivos eliminados (' + nombresEliminados.length + '): ' + (nombresEliminados.length ? nombresEliminados.join(', ') : 'ninguno'));
  console.log('Queda únicamente: appsscript');

  _registrarLogGenerador(
    'eliminarTodosLosArchivosDeBase()',
    'Se vació el proyecto de Apps Script de "Base". Archivos eliminados: ' + nombresEliminados.length +
    (nombresEliminados.length ? ' (' + nombresEliminados.join(', ') + ')' : '') + '. Solo queda appsscript.json.',
    []
  );

  return { eliminados: nombresEliminados };
}

function obtenerArchivosProyecto_(scriptId) {
  var url = 'https://script.googleapis.com/v1/projects/' + scriptId + '/content';
  var opciones = {
    method: 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };
  var respuesta = UrlFetchApp.fetch(url, opciones);
  if (respuesta.getResponseCode() !== 200) {
    throw 'No se pudo leer el contenido del proyecto (' + respuesta.getResponseCode() + '): ' + respuesta.getContentText();
  }
  var data = JSON.parse(respuesta.getContentText());
  return data.files || [];
}

function crearProyectoVinculado_(ssId) {
  var url = 'https://script.googleapis.com/v1/projects';
  var opciones = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ title: 'Código del sistema (auto)', parentId: ssId }),
    muteHttpExceptions: true
  };
  var respuesta = UrlFetchApp.fetch(url, opciones);
  if (respuesta.getResponseCode() !== 200) {
    throw 'No se pudo crear el proyecto de Apps Script vinculado (' + respuesta.getResponseCode() + '): ' + respuesta.getContentText();
  }
  var data = JSON.parse(respuesta.getContentText());
  if (!data.scriptId) throw 'La API no devolvió scriptId al crear el proyecto: ' + respuesta.getContentText();
  return data.scriptId;
}