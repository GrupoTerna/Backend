# Generador — código consolidado
_Generado: 09/10/2026 20:38:36 (Lima)_

> AVISO PARA CUALQUIER IA O PERSONA QUE EDITE ESTE PROYECTO:
> 1) NO metas los archivos dentro de una carpeta al armar el ZIP. Cada
>    archivo .gs debe quedar SUELTO en la raíz del .zip.
>    Correcto:   01_Principal.gs
>    Incorrecto: Base/01_Principal.gs  (esto pega el nombre de la carpeta
>    al del archivo y crea un duplicado en vez de actualizar el original).
> 2) Al subir de vuelta, usa el MISMO nombre exacto de archivo que bajaste,
>    sin prefijos ni sufijos. Si agregas un archivo nuevo, dale un nombre
>    distinto; nunca dupliques uno existente con otro nombre.
> 3) NO leas, edites, generes ni actualices "Script consolidado.gs". Ese
>    archivo es un respaldo generado 100% automáticamente por las propias
>    funciones del Generador (_descargarProyectoAArchivos) cada vez que se
>    sube o descarga cualquier formato. Cualquier IA o persona que edite
>    este proyecto debe ignorarlo por completo: no es código fuente real,
>    es solo un resumen legible; editarlo a mano no tiene efecto (se
>    sobrescribe automáticamente) y leerlo para entender el código es
>    redundante, ya que su contenido es idéntico a la suma de los demás
>    archivos .gs del proyecto.
> 4) Cuando una IA edite este proyecto a pedido del usuario, NO debe
>    reempaquetar ni entregar el .zip completo del proyecto por defecto.
>    Debe entregar el CONTENIDO COMPLETO (no fragmentos ni parches) de
>    cada archivo NUMERADO que haya modificado (01_Principal.gs,
>    02_Backstage.gs, etc.), listo para copiar/pegar y reemplazar el
>    archivo entero en el editor; y el manifiesto "appsscript.json"
>    completo también, solo si ese archivo cambió. Nunca entregar
>    "Script consolidado.gs" ni este mismo LEEME como parte de una
>    edición (ver punto 3). Esto ahorra tokens y tiempo frente a
>    regenerar y comprimir todos los archivos cada vez, incluidos los
>    que no cambiaron. Solo generar el .zip completo si el usuario lo
>    pide explícitamente.
> 5) Los archivos modificados (punto 4) se deben ENTREGAR COMO ARCHIVO
>    DESCARGABLE/ABRIBLE, nunca pegados como bloque de código dentro del
>    chat. Un archivo real se puede abrir, copiar y guardar directamente;
>    un bloque de código en el chat obliga a seleccionar y copiar a mano,
>    y es más difícil de manejar en archivos largos.

## 01_Principal.gs
```javascript
// =============================================================================
// 01_Principal.gs
// Punto de entrada: solo las funciones que ejecutas manualmente desde el editor.
// Orden: 1) subidas, 2) descargas, 3) mantenimiento.
// =============================================================================
// ------------------------------------------------------------------
// DESCARGA (zip + txt + gs + md, siempre los 4 a la vez)
// ------------------------------------------------------------------

/** Descarga el código de la hoja "Base" y crea Base.zip, Base.gs, Base.txt y Base.md */
function descargarBase() {
  _descargarProyectoAArchivos('Base');
}
// ------------------------------------------------------------------
// SUBIDA A BASE (Funciones independientes por tipo de archivo)
// "Subir" y "actualizar" ya NO son cosas distintas: cada función de
// aquí sube el formato indicado al proyecto real de "Base" Y, en el
// mismo paso, regenera automáticamente los otros 3 respaldos
// (Base.zip/.gs/.txt/.md) para que ninguno quede desactualizado
// respecto al código recién subido. subirBaseDesdeZip() además
// conserva el paso opcional de crear/actualizar la hoja "Sistema"
// (ver el interruptor CREAR_O_ACTUALIZAR_HOJA_SISTEMA en 02_Backstage.gs),
// que antes vivía en la ya eliminada ejecutarTodoElProceso().
// ------------------------------------------------------------------

/** Sube Base.zip y sincroniza Base.zip/.gs/.txt/.md */
function subirBaseDesdeZip() {
  return _subirArchivosAProyecto('Base', 'zip');
}

/** Sube Base.txt y sincroniza Base.zip/.gs/.txt/.md */
function subirBaseDesdeTxt() {
  return _subirArchivosAProyecto('Base', 'txt');
}

/** Sube Base.gs y sincroniza Base.zip/.gs/.txt/.md */
function subirBaseDesdeGs() {
  return _subirArchivosAProyecto('Base', 'gs');
}

/** Sube Base.md y sincroniza Base.zip/.gs/.txt/.md */
function subirBaseDesdeMd() {
  return _subirArchivosAProyecto('Base', 'md');
}

// ------------------------------------------------------------------
// DESCARGA (zip + txt + gs + md, siempre los 4 a la vez)
// ------------------------------------------------------------------


/** Descarga el código del propio "Generador" y crea Generador.zip, Generador.gs, Generador.txt y Generador.md */
function descargarGenerador() {
  _descargarProyectoAArchivos('Generador');
}

// ------------------------------------------------------------------
// SUBIDA AL GENERADOR (Funciones independientes por tipo de archivo)
// Mismo comportamiento que arriba: subir cualquier formato del
// Generador sincroniza automáticamente los otros 3 (Generador.zip/
// .gs/.txt/.md), sin pasos adicionales.
// ------------------------------------------------------------------

/** Sube Generador.zip y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeZip() {
  return _subirArchivosAProyecto('Generador', 'zip');
}

/** Sube Generador.txt y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeTxt() {
  return _subirArchivosAProyecto('Generador', 'txt');
}

/** Sube Generador.gs y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeGs() {
  return _subirArchivosAProyecto('Generador', 'gs');
}

/** Sube Generador.md y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeMd() {
  return _subirArchivosAProyecto('Generador', 'md');
}


// ------------------------------------------------------------------
// MANTENIMIENTO (uso ocasional / peligroso)
// ------------------------------------------------------------------

/**
 * PELIGRO: borra TODOS los archivos de código del proyecto de Apps Script
 * vinculado a la hoja "Base", dejando únicamente el manifiesto appsscript.json.
 * Útil para partir de cero antes de una subida limpia. No se puede deshacer.
 */
function eliminarTodosLosArchivosDeBase() {
  _eliminarTodosLosArchivosDeProyecto('Base');
}

```

## 02_Backstage.gs
```javascript
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
```

## 03_RoyaleAPI_Torneos.gs
```javascript
// =============================================================================
// 03_RoyaleAPI_Torneos.gs
// =============================================================================
function obtenerJSON_viaProxy() {
  // Intenta con allorigins (suele funcionar para RoyaleAPI)
  var url = "https://api.allorigins.win/raw?url=" + 
            encodeURIComponent("https://royaleapi.com/tournament/2JV8UCU8/members/json");
  
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  
  if (response.getResponseCode() === 200) {
    var datos = JSON.parse(response.getContentText());
    Logger.log("✅ Datos obtenidos con allorigins");
    return datos;
  } else {
    Logger.log("❌ allorigins falló con código: " + response.getResponseCode());
    // Intenta con un proxy alternativo si el primero falla
    return tryAlternativeProxy();
  }
}

function tryAlternativeProxy() {
  var url = "https://corsproxy.io/?" + 
            encodeURIComponent("https://royaleapi.com/tournament/2JV8UCU8/members/json");
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  
  if (response.getResponseCode() === 200) {
    var datos = JSON.parse(response.getContentText());
    Logger.log("✅ Datos obtenidos con corsproxy.io");
    return datos;
  } else {
    Logger.log("❌ corsproxy.io también falló: " + response.getResponseCode());
    return null;
  }
}
```

## 04_Organizador_JSON.gs
```javascript
// =============================================================================
// 04_Organizador_JSON.gs
// Organización de archivos de respaldo JSON: drena la carpeta raíz hacia la
// carpeta de cada clan y, dentro de ella, hacia la subcarpeta que le
// corresponda según el endpoint (CurrentRiverRace / Clans).
//
// Esta es la ÚNICA implementación de "drenar raíz → carpeta de clan" del
// proyecto. Antes existía una copia casi idéntica dentro de
// 05_Migrador_Formato.gs (_mig_drenarRaiz); ahora ese archivo simplemente
// llama a _organizarJSON_procesarRaiz_() de aquí, así que solo hay un lugar
// que mantener.
//
// Contiene:
//   - organizarArchivosJSON()        → punto de entrada manual (editor).
//   - _organizarJSON_procesarRaiz_() → motor reutilizable, también se llama
//                                       internamente desde 05 (y podría
//                                       llamarse desde 06 si hiciera falta).
// =============================================================================

/** @const {string} ID de la carpeta raíz que contiene los respaldos JSON. */
var CARPETA_JSON_RAIZ_ID_ = '1fe_z2gahCDeVrYEbG8B2ts-XDJzbNBu8';

/**
 * Mapa de clanes a IDs de subcarpeta en Drive.
 * @const {Object.<string, string>}
 */
var CARPETAS_CLAN_ = {
  'grupo乂terna™':   '1J7M0A2sKoN0vwXDHPOKjJ_QkLzwbIoWR',
  'grupoxterna™2':   '1i7lZIw_69S_6NtQLAmSjMV_6TePKu8cH',
  'grupoxterna™3':   '1nkBknCl29nAO7Pph4QM4BAeO05Up2GFm',
  'mini乂ternas™':   '1p7mu6rh0wu5hCWTEPttlCjNGF1Cgdqbi',
  'naranja x':       '1DKxLFE7P0pnItV6nTk6Q1jCctF1YgGx9'
};

// ID reservado para uso futuro (carpeta "players").
var CARPETA_PLAYERS_ID_ = '1Kqmn7ExFr3cDER_DgKnHwHlWc9lLW9aF';

/**
 * Mapa endpoint (tal como aparece en el nombre del archivo, en minúsculas,
 * sin ".json") → nombre de la subcarpeta dentro de CADA carpeta de clan.
 *
 * Un endpoint que NO esté en este mapa se queda suelto en la raíz de la
 * carpeta del clan (comportamiento anterior a este cambio), así que
 * agregar más endpoints en el futuro es seguro y no rompe nada.
 */
var CARPETAS_JSON_POR_ENDPOINT_ = {
  'currentriverrace': 'CurrentRiverRace',
  'clans':             'Clans'
};

/** @const {number} Presupuesto de tiempo por ejecución manual, en ms. */
var ORGANIZAR_LIMITE_MS_ = 5 * 60 * 1000;

/** @const {string} Clave en PropertiesService para el estado de organizarArchivosJSON(). */
var ORGANIZAR_PROP_ESTADO_ = 'ORGANIZAR_JSON_ESTADO_V1';

/** @const {string} Nombre del handler que se re-programa como trigger. */
var ORGANIZAR_TRIGGER_HANDLER_ = 'organizarArchivosJSON';

/**
 * Punto de entrada MANUAL. Ejecutar directamente desde el editor cuando se
 * quiera drenar la raíz sin correr la migración completa de 05.
 *
 * Igual que migrarFormatoJSON() (05), controla su propio presupuesto de
 * tiempo: si hay tantos archivos que no alcanza a terminar en una sola
 * ejecución, guarda el avance y programa un trigger para continuar sola en
 * ~1 minuto, sin repetir trabajo (mover un archivo que ya no está en la
 * raíz simplemente no vuelve a aparecer).
 */
function organizarArchivosJSON() {
  var inicio = new Date().getTime();
  var props  = PropertiesService.getScriptProperties();
  var estadoGuardado = props.getProperty(ORGANIZAR_PROP_ESTADO_);
  var resumen = estadoGuardado ? JSON.parse(estadoGuardado) : { movidos: 0, ignorados: [] };

  console.log('organizarArchivosJSON() — ' +
    (estadoGuardado ? 'continuando ejecución anterior…' : 'inicio nuevo…'));

  var completo = _organizarJSON_procesarRaiz_(resumen, inicio);

  if (!completo) {
    props.setProperty(ORGANIZAR_PROP_ESTADO_, JSON.stringify(resumen));
    _organizarJSON_borrarTriggersPendientes_();
    ScriptApp.newTrigger(ORGANIZAR_TRIGGER_HANDLER_).timeBased().after(60 * 1000).create();
    console.log('⏸ Presupuesto de tiempo alcanzado. Progreso guardado (movidos hasta ahora: ' +
      resumen.movidos + '). Continuará sola en ~1 minuto.');
    return;
  }

  props.deleteProperty(ORGANIZAR_PROP_ESTADO_);
  _organizarJSON_borrarTriggersPendientes_();

  console.log('──────────────────────────────────────────');
  console.log('Archivos movidos: ' + resumen.movidos);
  if (resumen.ignorados.length === 0) {
    console.log('Sin archivos ignorados.');
  } else {
    console.log('Archivos ignorados (' + resumen.ignorados.length + '):');
    resumen.ignorados.forEach(function(linea) { console.log('  · ' + linea); });
  }
}

/**
 * Motor reutilizable: recorre la carpeta raíz de JSON y mueve cada archivo
 * a la subcarpeta del clan que figure en su nombre y, dentro de ella, a la
 * subcarpeta que le corresponda según su endpoint (ver
 * CARPETAS_JSON_POR_ENDPOINT_). Las subcarpetas de endpoint se crean solas
 * si todavía no existen en esa carpeta de clan (getOrCreate).
 *
 * El nombre debe tener la forma: <fecha> - <clan> - <endpoint>.json
 * El separador es " - " (espacio guion espacio). Si el archivo ya trae el
 * tag "T-.. S-.. P.I-.." de una migración anterior, sigue funcionando
 * igual: ese tag vive DENTRO del primer segmento (antes de la primera
 * " - "), así que no afecta el corte de clan/endpoint.
 *
 * Es el "motor" compartido: lo llama organizarArchivosJSON() (uso manual)
 * y migrarFormatoJSON() en 05_Migrador_Formato.gs (como su Paso 1).
 *
 * @param {Object} resumen Acumulador con, al menos, { movidos, ignorados }.
 * @param {number=} inicio Timestamp (ms) de inicio de la ejecución actual.
 *   Si se pasa, la función revisa el presupuesto de tiempo periódicamente
 *   (ORGANIZAR_LIMITE_MS_) y puede cortar antes de terminar toda la raíz.
 * @return {boolean} true si terminó de drenar toda la raíz, false si se
 *   cortó por presupuesto de tiempo (es seguro reintentar: los archivos ya
 *   movidos no vuelven a aparecer en la raíz).
 */
function _organizarJSON_procesarRaiz_(resumen, inicio) {
  var carpetaRaiz = DriveApp.getFolderById(CARPETA_JSON_RAIZ_ID_);
  var archivos    = carpetaRaiz.getFiles();

  while (archivos.hasNext()) {
    if (inicio && _organizarJSON_tiempoAgotado_(inicio)) {
      console.log('    (presupuesto de tiempo alcanzado; se continúa el drenaje de la raíz en la próxima ejecución)');
      return false;
    }

    var archivo = archivos.next();
    var nombre  = archivo.getName();

    if (nombre.slice(-5).toLowerCase() !== '.json') {
      resumen.ignorados.push(nombre + '  [razón: no es .json]');
      continue;
    }

    var partes = nombre.split(' - ');
    if (partes.length < 3) {
      resumen.ignorados.push(nombre + '  [razón: formato no reconocido]');
      continue;
    }

    var segClan   = partes[1].trim();
    var clanClave = segClan.toLowerCase();

    if (!CARPETAS_CLAN_.hasOwnProperty(clanClave)) {
      resumen.ignorados.push(nombre + '  [razón: clan "' + segClan + '" no registrado]');
      continue;
    }

    var carpetaClan = DriveApp.getFolderById(CARPETAS_CLAN_[clanClave]);

    var endpoint = partes.slice(2).join(' - ').replace(/\.json$/i, '').toLowerCase();
    var nombreSubcarpeta = CARPETAS_JSON_POR_ENDPOINT_[endpoint];
    var carpetaDestino = nombreSubcarpeta
      ? _carpetaHijaOCrear_(carpetaClan, nombreSubcarpeta)
      : carpetaClan;

    archivo.moveTo(carpetaDestino);
    resumen.movidos++;
    console.log('    [raíz → ' + segClan + (nombreSubcarpeta ? '/' + nombreSubcarpeta : '') + '] ' + nombre);
  }

  return true;
}

/**
 * Devuelve la subcarpeta "nombre" dentro de "carpetaPadre", creándola si
 * todavía no existe. Idempotente: si dos ejecuciones la buscan a la vez,
 * en el peor caso Drive permite carpetas con nombre repetido, pero en el
 * uso normal (secuencial) esto nunca pasa.
 * @param {Folder} carpetaPadre
 * @param {string} nombre
 * @return {Folder}
 */
function _carpetaHijaOCrear_(carpetaPadre, nombre) {
  var it = carpetaPadre.getFoldersByName(nombre);
  if (it.hasNext()) return it.next();
  return carpetaPadre.createFolder(nombre);
}

/**
 * Devuelve TODOS los archivos que pertenecen a una carpeta de clan: los
 * que están sueltos directamente en ella (compatibilidad con lo que ya
 * había antes de organizar en subcarpetas) más los que están dentro de
 * cada subcarpeta de endpoint conocida (CurrentRiverRace, Clans, y
 * cualquier otra que se agregue a CARPETAS_JSON_POR_ENDPOINT_ en el
 * futuro). La usan 06_Limpieza_Duplicados_JSON.gs (_analizarCarpetaJSON_)
 * para que el análisis de identidad vea el historial completo del clan
 * sin importar en qué subcarpeta quedó cada archivo.
 * @param {Folder} carpetaClan
 * @return {Array<File>}
 */
function _archivosDeCarpetaClan_(carpetaClan) {
  var lista = [];

  var top = carpetaClan.getFiles();
  while (top.hasNext()) lista.push(top.next());

  var nombresSubcarpetas = {};
  Object.keys(CARPETAS_JSON_POR_ENDPOINT_).forEach(function(k) {
    nombresSubcarpetas[CARPETAS_JSON_POR_ENDPOINT_[k]] = true;
  });

  Object.keys(nombresSubcarpetas).forEach(function(nombreSub) {
    var itCarpetas = carpetaClan.getFoldersByName(nombreSub);
    while (itCarpetas.hasNext()) {
      var sub = itCarpetas.next();
      var archivosSub = sub.getFiles();
      while (archivosSub.hasNext()) lista.push(archivosSub.next());
    }
  });

  return lista;
}

function _organizarJSON_tiempoAgotado_(inicio) {
  return (new Date().getTime() - inicio) > ORGANIZAR_LIMITE_MS_;
}

function _organizarJSON_borrarTriggersPendientes_() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === ORGANIZAR_TRIGGER_HANDLER_) {
      ScriptApp.deleteTrigger(t);
    }
  });
}
```

## 05_Migrador_Formato.gs
```javascript
// =============================================================================
// 05_Migrador_Formato.gs
// Migra los archivos JSON al nuevo formato de nombre:
//
//   "T-<temporada> S-<semana> P.I-<periodIndex> <fecha hora> - <clan> - <endpoint>.json"
//
// donde:
//   - temporada  : se INFIERE (ver _analizarCarpetaJSON_ en
//                  06_Limpieza_Duplicados_JSON.gs), no viene en el nombre
//                  ni en el JSON.
//   - semana     : sectionIndex + 1, leído del contenido de currentriverrace.json.
//   - periodIndex: periodIndex real, leído del contenido de currentriverrace.json
//                  (la PRIMERA mención dentro del archivo, ver _leerPeriodo_).
//
// Requiere que 04_Organizador_JSON.gs, 06_Limpieza_Duplicados_JSON.gs y
// 07_Cache_Periodos_JSON.gs estén cargados en el MISMO proyecto de Apps
// Script: reutiliza _organizarJSON_procesarRaiz_ (04, para el Paso 1),
// _analizarCarpetaJSON_ y _leerPeriodo_ (06) para que el renombrado y la
// limpieza de duplicados (limpiarDuplicadosJSON) siempre calculen
// exactamente la misma identidad para una misma captura, y el cache de
// periodos (07) para no releer contenido ya leído antes.
//
// Las carpetas/IDs (raíz, clanes, players) están declaradas UNA sola vez,
// en 04_Organizador_JSON.gs (CARPETA_JSON_RAIZ_ID_, CARPETAS_CLAN_,
// CARPETA_PLAYERS_ID_): este archivo las reutiliza directamente, no
// mantiene su propia copia.
//
// Orden de ejecución recomendado:
//   1) migrarFormatoJSON()      → organiza y etiqueta los nombres
//   2) limpiarDuplicadosJSON()  → usando esos mismos nombres/identidad,
//                                 revisa duplicados (con LIMPIEZA_DRY_RUN_)
//
// Es idempotente: se puede correr varias veces sin duplicar el tag ni
// mover archivos que ya están en su carpeta.
//
// -----------------------------------------------------------------------
// CONTINUACIÓN AUTOMÁTICA (para no cortarse por el límite de ~6 min de
// Apps Script cuando hay muchos archivos)
// -----------------------------------------------------------------------
// migrarFormatoJSON() controla cuánto tiempo lleva corriendo. Si se acerca
// al límite de ejecución antes de terminar todas las fases:
//   1) guarda en PropertiesService en qué fase/carpeta se quedó,
//   2) guarda el cache de periodos leídos hasta ese momento (07),
//   3) programa un trigger de tiempo para que la MISMA función se vuelva
//      a ejecutar sola ~1 minuto después,
//   4) termina la ejecución actual de forma ordenada (sin lanzar error).
//
// La siguiente ejecución (automática o manual) detecta el estado guardado
// y continúa exactamente donde quedó, sin repetir trabajo: los archivos ya
// renombrados/movidos se detectan como tal y se saltan, y los
// currentriverrace.json ya leídos se resuelven desde el cache en vez de
// descargarse de nuevo. Se puede dejar el proceso completo ejecutando
// migrarFormatoJSON() una vez y dejando que los triggers encadenados
// terminen el trabajo solos, o volviendo a ejecutarla a mano cuando se
// quiera.
// =============================================================================

/** @const {number} Presupuesto de tiempo por ejecución, en ms.
 *  Deja margen bajo el límite real de Apps Script (~6 min en cuentas
 *  gratuitas/Gmail normales). Si el proyecto es de Google Workspace con
 *  límite de 30 min, se puede subir con confianza (p. ej. a 25 min). */
var MIG_LIMITE_MS_ = 5 * 60 * 1000;

/** @const {string} Clave en PropertiesService para el estado de la migración. */
var MIG_PROP_ESTADO_ = 'MIG_FORMATO_ESTADO_V1';

/** @const {string} Nombre del handler que se re-programa como trigger. */
var MIG_TRIGGER_HANDLER_ = 'migrarFormatoJSON';

/**
 * migrarFormatoJSON()
 * Punto de entrada. Ejecutar manualmente desde el editor del Generador (o
 * dejar que continúe sola vía el trigger programado, ver cabecera del
 * archivo).
 *
 * Paso 1: drena cualquier archivo suelto en la carpeta raíz hacia su
 *         carpeta de clan (sin renombrar todavía).
 * Paso 2: en cada carpeta de clan, calcula la identidad real de cada
 *         captura (temporada/sección/periodIndex) sobre el historial
 *         COMPLETO de esa carpeta y renombra todos sus archivos con el
 *         tag "T-.. S-.. P.I-..".
 * Paso 3: normaliza los nombres de la carpeta de players usando la fecha
 *         real de creación de CADA archivo (getDateCreated), no la hora
 *         de la corrida actual; esos archivos no llevan tag, porque no
 *         tienen sectionIndex/periodIndex propio.
 */
function migrarFormatoJSON() {
  var inicio = new Date().getTime();
  var props = PropertiesService.getScriptProperties();
  var estadoGuardado = props.getProperty(MIG_PROP_ESTADO_);
  var estado = estadoGuardado ? JSON.parse(estadoGuardado) : _mig_estadoInicial_();
  var cache = _cache_cargar_();

  console.log('═══════════════════════════════════════════════════════');
  console.log('migrarFormatoJSON() — ' + _mig_horaLima(new Date()) +
    (estadoGuardado ? '  [continuando ejecución anterior, fase: ' + estado.fase + ']' : '  [inicio nuevo]'));
  console.log('Cache de periodos: ' + Object.keys(cache).length + ' archivos ya leídos anteriormente (no se vuelven a descargar).');
  console.log('═══════════════════════════════════════════════════════');

  // --- Paso 1: drenar raíz (motor compartido, ver 04_Organizador_JSON.gs) ---
  if (estado.fase === 'raiz') {
    console.log('\n── Paso 1: drenar raíz JSON hacia carpetas de clan ──');
    var raizCompleta = _organizarJSON_procesarRaiz_(estado.resumen, inicio);
    _mig_guardarEstado_(estado); // conserva el avance de "movidos" aunque no haya terminado

    if (!raizCompleta) {
      _mig_pausarYContinuar_(estado, cache, 'durante el drenaje de la raíz');
      return;
    }

    estado.fase = 'clanes';
    estado.clanesPendientes = Object.keys(CARPETAS_CLAN_);
    _mig_guardarEstado_(estado);
  }

  // --- Paso 2: etiquetar por carpeta de clan ---
  if (estado.fase === 'clanes') {
    console.log('\n── Paso 2: etiquetar T-/S-/P.I- por carpeta de clan ──');

    while (estado.clanesPendientes.length > 0) {
      var clave = estado.clanesPendientes[0];
      console.log('  Procesando: ' + clave);

      var clanCompleto = _mig_etiquetarCarpetaClan(CARPETAS_CLAN_[clave], estado.resumen, cache, inicio);

      // El cache se guarda apenas se procesa (o intenta procesar) una
      // carpeta, sin importar si se terminó: es lo que evita releer
      // contenido ya leído en la próxima ejecución.
      _cache_guardar_(cache);

      if (!clanCompleto) {
        // La carpeta quedó a medias. NO se saca de clanesPendientes: en la
        // próxima ejecución se vuelve a analizar completa (rápido, gracias
        // al cache) y se retoma el renombrado de lo que falte.
        _mig_guardarEstado_(estado);
        _mig_pausarYContinuar_(estado, cache, 'durante el etiquetado de "' + clave + '"');
        return;
      }

      estado.clanesPendientes.shift();
      _mig_guardarEstado_(estado);

      if (_mig_tiempoAgotado_(inicio)) {
        _mig_pausarYContinuar_(estado, cache, 'entre carpetas de clan');
        return;
      }
    }

    estado.fase = 'players';
    _mig_guardarEstado_(estado);
  }

  // --- Paso 3: carpeta players ---
  if (estado.fase === 'players') {
    console.log('\n── Carpeta players ──');
    _migrarCarpetaPlayers(estado.resumen);
    estado.fase = 'hecho';
  }

  _mig_finalizar_(estado, cache);
}

/**
 * Utilidad manual: descarta cualquier estado/pausa guardada de una
 * ejecución anterior y borra el trigger de continuación pendiente, sin
 * tocar el cache de periodos (que sigue siendo válido). Usar si se quiere
 * forzar que la próxima llamada a migrarFormatoJSON() empiece las 3 fases
 * desde el Paso 1 (por ejemplo, si el estado guardado quedó inconsistente).
 */
function migrarFormatoJSON_reiniciarEstado() {
  _mig_borrarEstado_();
  _mig_borrarTriggersPendientes_();
  console.log('Estado de migrarFormatoJSON() reiniciado. El cache de periodos NO se tocó (usa reiniciarCachePeriodosJSON() para eso).');
}

/**
 * Paso 2: para una carpeta de clan, calcula la identidad real de cada
 * captura (temporada / sección / periodIndex) vía _analizarCarpetaJSON_
 * (compartida con 06_Limpieza_Duplicados_JSON.gs, usando el cache de 07
 * para no releer contenido ya leído), MUEVE cada archivo a su subcarpeta
 * de endpoint (CurrentRiverRace / Clans, creándola si todavía no existe
 * en ese clan — ver CARPETAS_JSON_POR_ENDPOINT_ y _carpetaHijaOCrear_ en
 * 04_Organizador_JSON.gs) y renombra sus archivos con el prefijo
 * "T-<t> S-<s> P.I-<p>". Idempotente: si un archivo ya tiene un tag de
 * una ejecución anterior, se reemplaza por el recién calculado en vez de
 * apilarse (ver _quitarTagExistente_ en el archivo 06), y si ya está en
 * su subcarpeta correcta no se vuelve a mover.
 * @param {string} folderId
 * @param {Object} resumen
 * @param {Object} cache Cache de periodos (07_Cache_Periodos_JSON.gs).
 * @param {number=} inicio Timestamp (ms) de inicio de la ejecución actual.
 * @return {boolean} true si se terminó de etiquetar toda la carpeta,
 *   false si se cortó por presupuesto de tiempo (la carpeta se debe
 *   reintentar completa la próxima vez; es rápido porque el análisis ya
 *   quedó en el cache y mover/renombrar un archivo ya correcto no hace nada).
 */
function _mig_etiquetarCarpetaClan(folderId, resumen, cache, inicio) {
  var carpeta  = DriveApp.getFolderById(folderId);
  var analisis = _analizarCarpetaJSON_(carpeta, cache);
  var subcarpetasCache = {}; // nombreSubcarpeta -> Folder (evita repetir getFoldersByName por cada archivo)

  analisis.sinResolver.forEach(function(clave) {
    resumen.ignorados.push('[' + carpeta.getName() + '] ' + clave +
      ' [sin currentriverrace.json legible, no se pudo etiquetar]');
  });

  for (var i = 0; i < analisis.resueltas.length; i++) {
    if (inicio && _mig_tiempoAgotado_(inicio)) {
      console.log('    (presupuesto de tiempo alcanzado dentro de "' + carpeta.getName() + '"; se retoma esta misma carpeta en la próxima ejecución)');
      return false;
    }

    var item = analisis.resueltas[i];
    var cv = item.clave.split(' - ');
    var fechaHoraPura   = _mig_fechaHoraStr(item.real); // fecha real (getDateCreated), no la del nombre viejo (cv[0])
    var segClanOriginal = cv.slice(1).join(' - ');

    var tag = 'T-' + _pad2_(item.temporada) +
      '  S-' + _pad2_(item.sectionIndex + 1) +
      ' P.I-' + _pad2_(item.periodIndex);

    var endpointKeys = Object.keys(item.archivos);
    for (var j = 0; j < endpointKeys.length; j++) {
      var endpointKey = endpointKeys[j];
      var archivo = item.archivos[endpointKey];

      // Mueve el archivo a su subcarpeta de endpoint (CurrentRiverRace /
      // Clans), creándola si todavía no existe en ESTE clan (antes esto
      // solo pasaba en el drenaje de la raíz, así que un archivo que ya
      // estaba suelto directo en la carpeta del clan —sin haber pasado
      // por la raíz— se quedaba ahí para siempre, solo renombrado).
      var nombreSubcarpeta = CARPETAS_JSON_POR_ENDPOINT_[endpointKey];
      if (nombreSubcarpeta) {
        var carpetaDestino = subcarpetasCache[nombreSubcarpeta] ||
          (subcarpetasCache[nombreSubcarpeta] = _carpetaHijaOCrear_(carpeta, nombreSubcarpeta));
        if (!_mig_yaEstaEnCarpeta_(archivo, carpetaDestino)) {
          archivo.moveTo(carpetaDestino);
          resumen.movidos++;
          console.log('    [clan] ' + endpointKey + ' movido a subcarpeta "' + nombreSubcarpeta + '"');
        }
      }

      var partesArchivo = archivo.getName().split(' - ');
      var segEndpointOriginal = partesArchivo.slice(2).join(' - '); // conserva mayúsculas/extensión tal cual

      var nombreNuevo = tag + ' ' + fechaHoraPura + ' - ' + segClanOriginal + ' - ' + segEndpointOriginal;

      if (archivo.getName() !== nombreNuevo) {
        nombreNuevo = _mig_renombrarSeguro(archivo, nombreNuevo, resumen);
        resumen.renombrados++;
        console.log('    [clan] ' + endpointKey + ' → ' + nombreNuevo);
      }
    }
  }

  return true;
}

/**
 * @return {boolean} true si "archivo" ya tiene a "carpeta" como padre
 *   directo (evita un moveTo innecesario cuando ya está en su lugar).
 */
function _mig_yaEstaEnCarpeta_(archivo, carpeta) {
  var padres = archivo.getParents();
  while (padres.hasNext()) {
    if (padres.next().getId() === carpeta.getId()) return true;
  }
  return false;
}

function _migrarCarpetaPlayers(resumen) {
  var carpeta  = DriveApp.getFolderById(CARPETA_PLAYERS_ID_);
  var archivos = carpeta.getFiles();

  while (archivos.hasNext()) {
    var archivo = archivos.next();
    var nombre  = archivo.getName();

    if (nombre.slice(-5).toLowerCase() !== '.json') continue;

    var contenido, obj;
    try {
      contenido = archivo.getBlob().getDataAsString('UTF-8');
      obj       = JSON.parse(contenido);
    } catch(e) {
      resumen.ignorados.push(nombre + ' [players — no se pudo leer/parsear JSON]');
      continue;
    }

    var playerTag = (obj.tag || nombre.replace('.json', '')).trim();
    var clanName  = (obj.clan && obj.clan.name) ? obj.clan.name : 'Sin clan';

    // Fecha real de creación de ESTE archivo (getDateCreated), no la hora
    // compartida de la corrida actual: así cada player conserva su propia
    // fecha de captura en vez de que todos queden re-fechados con el
    // instante en que se ejecutó migrarFormatoJSON() (mismo bug que se
    // corrigió en _mig_etiquetarCarpetaClan, ver 05_Migrador_Formato.gs).
    var fechaHora = _mig_fechaHoraStr(archivo.getDateCreated());

    var nombreNuevo = fechaHora + ' - ' + clanName + ' - ' + playerTag + '.json';

    if (nombre === nombreNuevo) continue;

    _mig_renombrarSeguro(archivo, nombreNuevo, resumen);
    resumen.renombrados++;
    console.log('    [player] ' + nombre + '\n       → ' + nombreNuevo);
  }
}

/**
 * Renombra un archivo, evitando pisar un archivo distinto que ya tenga el
 * nombre destino. El chequeo de duplicados se hace en el padre REAL del
 * archivo (getParents), no en una carpeta pasada por parámetro: desde que
 * 04_Organizador_JSON.gs organiza los JSON en subcarpetas por endpoint
 * (CurrentRiverRace / Clans), el padre real de un archivo puede ser una
 * subcarpeta y no la carpeta de clan de nivel superior.
 * @param {File} archivo
 * @param {string} nombreNuevo
 * @param {Object} resumen
 * @return {string} el nombre finalmente usado (puede llevar sufijo " (dup)").
 */
function _mig_renombrarSeguro(archivo, nombreNuevo, resumen) {
  var padres = archivo.getParents();
  var carpetaReal = padres.hasNext() ? padres.next() : null;
  var existentes = carpetaReal ? carpetaReal.getFilesByName(nombreNuevo) : null;

  if (existentes && existentes.hasNext() && existentes.next().getId() !== archivo.getId()) {
    var base = nombreNuevo.slice(0, -5);
    nombreNuevo = base + ' (dup).json';
    resumen.duplicados++;
    console.log('    ⚠ Nombre duplicado — renombrado a: ' + nombreNuevo);
  }
  archivo.setName(nombreNuevo);
  return nombreNuevo;
}

/** Rellena con un cero a la izquierda si el número tiene un solo dígito. */
function _pad2_(n) {
  var s = String(Math.abs(n));
  return (n < 0 ? '-' : '') + (s.length < 2 ? '0' + s : s);
}

function _mig_fechaHoraStr(d) {
  return Utilities.formatDate(d, 'America/Lima', 'dd-MM-yyyy HH.mm');
}

function _mig_soloHora(d) {
  return Utilities.formatDate(d, 'America/Lima', 'HH.mm');
}

function _mig_horaLima(d) {
  return Utilities.formatDate(d, 'America/Lima', 'dd/MM/yyyy HH:mm:ss') + ' (Lima)';
}

// -----------------------------------------------------------------------
// Presupuesto de tiempo, estado persistente y continuación automática
// -----------------------------------------------------------------------

/** @return {boolean} true si ya se consumió el presupuesto de tiempo. */
function _mig_tiempoAgotado_(inicio) {
  return (new Date().getTime() - inicio) > MIG_LIMITE_MS_;
}

function _mig_estadoInicial_() {
  return {
    fase: 'raiz', // 'raiz' -> 'clanes' -> 'players' -> 'hecho'
    clanesPendientes: null, // se llena al entrar a la fase 'clanes'
    resumen: { renombrados: 0, movidos: 0, duplicados: 0, ignorados: [] },
    inicioProceso: _mig_horaLima(new Date())
  };
}

function _mig_guardarEstado_(estado) {
  PropertiesService.getScriptProperties().setProperty(MIG_PROP_ESTADO_, JSON.stringify(estado));
}

function _mig_borrarEstado_() {
  PropertiesService.getScriptProperties().deleteProperty(MIG_PROP_ESTADO_);
}

/** Guarda estado + cache, programa la continuación y explica en el log qué pasó. */
function _mig_pausarYContinuar_(estado, cache, motivo) {
  _mig_guardarEstado_(estado);
  _cache_guardar_(cache);
  _mig_programarContinuacion_();

  console.log('\n⏸ Presupuesto de tiempo alcanzado (' + motivo + '). Progreso guardado (nada se repite).');
  console.log('   Renombrados hasta ahora: ' + estado.resumen.renombrados +
    ' | Movidos: ' + estado.resumen.movidos +
    ' | Duplicados: ' + estado.resumen.duplicados);
  console.log('   Se programó una continuación automática en ~1 minuto.');
  console.log('   (también se puede ejecutar migrarFormatoJSON() manualmente para continuar antes)');
}

function _mig_programarContinuacion_() {
  _mig_borrarTriggersPendientes_();
  ScriptApp.newTrigger(MIG_TRIGGER_HANDLER_)
    .timeBased()
    .after(60 * 1000)
    .create();
}

function _mig_borrarTriggersPendientes_() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === MIG_TRIGGER_HANDLER_) {
      ScriptApp.deleteTrigger(t);
    }
  });
}

/** Cierra el proceso: guarda cache, limpia estado/trigger, imprime resumen y registra el log. */
function _mig_finalizar_(estado, cache) {
  _cache_guardar_(cache);
  _mig_borrarEstado_();
  _mig_borrarTriggersPendientes_();

  var resumen = estado.resumen;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('RESUMEN FINAL (proceso iniciado ' + estado.inicioProceso + '):');
  console.log('  Renombrados : ' + resumen.renombrados);
  console.log('  Movidos     : ' + resumen.movidos);
  console.log('  Duplicados  : ' + resumen.duplicados);
  console.log('  Ignorados   : ' + resumen.ignorados.length);
  if (resumen.ignorados.length) {
    resumen.ignorados.forEach(function(l) { console.log('    · ' + l); });
  }
  console.log('═══════════════════════════════════════════════════════');

  // Registrar en el Log del Generador (definido en 02_Backstage.gs)
  _registrarLogGenerador(
    'migrarFormatoJSON()',
    'Migración de archivos JSON al nuevo formato "T-/S-/P.I-". ' +
    'Renombrados: ' + resumen.renombrados + ', ' +
    'movidos a subcarpeta: ' + resumen.movidos + ', ' +
    'duplicados detectados: ' + resumen.duplicados + ', ' +
    'ignorados: ' + resumen.ignorados.length + '.',
    resumen.ignorados
  );

  console.log('migrarFormatoJSON() completado.');
}
```

## 06_Limpieza_Duplicados_JSON.gs
```javascript
// =============================================================================
// 06_Limpieza_Duplicados_JSON.gs
// Limpieza de respaldos JSON duplicados o con periodIndex incorrecto en las
// carpetas donde opera el organizador (04_Organizador_JSON.gs).
//
// Depende de CARPETA_JSON_RAIZ_ID_, CARPETAS_CLAN_ y _archivosDeCarpetaClan_,
// definidos en 04_Organizador_JSON.gs (debe estar en el mismo proyecto de
// Apps Script). _archivosDeCarpetaClan_ es lo que permite que el análisis
// vea tanto los archivos sueltos como los ya organizados en subcarpetas
// por endpoint (CurrentRiverRace, Clans).
//
// PROBLEMA QUE RESUELVE
// ----------------------------------------------------------------------------
// 1) El nombre de archivo ("<fecha hora> - <clan> - <endpoint>.json") puede
//    traer una fecha/hora FICTICIA (bug de la fuente que genera el nombre).
//    Por eso NUNCA se usa el nombre para decidir identidad, solo para
//    agrupar los archivos que pertenecen a una misma captura (comparten
//    idéntico prefijo "fecha hora - clan").
//
// 2) La identidad real de una captura es la terna (temporada, sectionIndex,
//    periodIndex). El número de temporada NO viene en el nombre ni en el
//    JSON, pero se puede CALCULAR: Clash Royale reinicia temporada el
//    primer lunes de cada mes, y ese primer lunes tiene un número de
//    temporada conocido (ver ancla en _temporadaDeFecha_ más abajo). Con
//    eso, la temporada de cualquier captura sale directo de su fecha REAL
//    de creación en Drive (getDateCreated, nunca el nombre del archivo,
//    que puede traer una fecha ficticia). No depende de leer ninguna otra
//    captura ni del orden en que quedaron guardadas, así que es correcta
//    aunque falten archivos en el historial de un clan. sectionIndex y
//    periodIndex SÍ vienen del contenido de currentriverrace.json (ver
//    punto 3), así que solo se pueden leer directamente de una captura
//    que tenga ese archivo.
//
// 2b) No todas las capturas tienen su propio currentriverrace.json con el
//    MISMO string de fecha-hora: si la fuente hace la llamada a la API de
//    currentriverrace y la de clan por separado, pueden quedar con
//    timestamps distintos (segundos u horas de diferencia) y no agruparse
//    en la misma captura. Para esos casos (típicamente "clans.json"
//    sueltos), se les PRESTA la identidad (sectionIndex/periodIndex) de
//    la captura con currentriverrace.json más cercana en el tiempo real,
//    siempre que esté dentro de un margen razonable (PAREO_TOLERANCIA_MS_,
//    6 horas por defecto). Si no hay ninguna ancla lo bastante cerca,
//    se dejan sin resolver (intactas) en vez de adivinar mal. Estas
//    capturas "prestadas" se marcan con esAncla=false y jamás compiten en
//    la limpieza de duplicados (punto 4): solo se comparan por tamaño las
//    que sí tienen su propio currentriverrace.json legible.
//
// 3) Dentro de UN MISMO currentriverrace.json, "periodIndex" aparece varias
//    veces: una vez a nivel superior del documento, y luego otras veces más
//    adentro (p. ej. dentro de cada entrada de "periodLogs", que numera algo
//    distinto). La mención correcta es SIEMPRE LA PRIMERA que aparece en el
//    archivo (en el orden en que está escrita en el JSON); las que aparecen
//    después, más adentro del documento, se ignoran por completo.
//
// 4) Puede haber varias capturas (varios archivos) válidas de la misma
//    (temporada, sectionIndex, periodIndex) real —por reintentos o
//    ejecuciones repetidas—. De esas, solo se conserva la MÁS COMPLETA
//    (mayor tamaño de currentriverrace.json) y se descartan las demás.
//
// Por seguridad, los archivos descartados se mandan a la papelera de Drive
// (setTrashed), nunca se borran de forma permanente. Corre primero en modo
// simulación (LIMPIEZA_DRY_RUN_ = true) y revisa el log antes de aplicar.
// =============================================================================

/** @const {boolean} true = solo reporta en el log, no borra nada. */
var LIMPIEZA_DRY_RUN_ = true;

/**
 * Punto de entrada manual. Revisa la carpeta raíz de JSON y cada carpeta de
 * clan, y limpia duplicados / periodIndex incorrectos según las reglas
 * descritas arriba.
 */
function limpiarDuplicadosJSON() {
  console.log('════════════════════════════════════════════');
  console.log(LIMPIEZA_DRY_RUN_
    ? 'MODO SIMULACIÓN — no se borrará nada, solo se reporta.'
    : 'MODO REAL — los archivos descartados se enviarán a la papelera.');
  console.log('════════════════════════════════════════════');

  // Cache persistente (07_Cache_Periodos_JSON.gs), compartido con
  // migrarFormatoJSON(): evita releer el contenido de currentriverrace.json
  // que ya se leyó antes, en esta ejecución o en una anterior.
  var cache = _cache_cargar_();
  console.log('Cache de periodos cargado: ' + Object.keys(cache).length + ' archivos ya leídos anteriormente.');

  _limpiarCarpeta_(DriveApp.getFolderById(CARPETA_JSON_RAIZ_ID_), '[RAÍZ / sin organizar]', cache);

  Object.keys(CARPETAS_CLAN_).forEach(function(clave) {
    var carpeta = DriveApp.getFolderById(CARPETAS_CLAN_[clave]);
    _limpiarCarpeta_(carpeta, clave, cache);
  });

  _cache_guardar_(cache);

  console.log('════════════════════════════════════════════');
  console.log(LIMPIEZA_DRY_RUN_
    ? 'Fin de la simulación. Si el reporte se ve correcto, cambia LIMPIEZA_DRY_RUN_ a false y vuelve a ejecutar.'
    : 'Limpieza aplicada.');
}

/**
 * Procesa una carpeta: usa _analizarCarpetaJSON_ para resolver identidad y
 * temporada de cada captura, y descarta los duplicados menos completos de
 * cada (temporada, sectionIndex, periodIndex).
 * @param {Folder} carpeta
 * @param {string} etiqueta Nombre descriptivo para el log.
 * @param {Object=} cache Cache de periodos (07_Cache_Periodos_JSON.gs).
 */
function _limpiarCarpeta_(carpeta, etiqueta, cache) {
  console.log('── ' + etiqueta + ' ──');

  var analisis = _analizarCarpetaJSON_(carpeta, cache);
  var resueltas = analisis.resueltas;
  var sinResolver = analisis.sinResolver;

  if (sinResolver.length) {
    console.log('  Sin currentriverrace.json legible, se dejan intactas (' + sinResolver.length + '):');
    sinResolver.forEach(function(c) { console.log('    · ' + c); });
  }

  if (resueltas.length === 0) {
    console.log('  Nada que procesar.');
    return;
  }

  for (var i = 1; i < resueltas.length; i++) {
    if (resueltas[i].temporada !== resueltas[i - 1].temporada) {
      console.log('  · Cambio de temporada → temporada ' + resueltas[i].temporada +
        ' | fecha real: ' + resueltas[i].real + ' | nombre: "' + resueltas[i].clave + '"');
    }
  }

  // --- Única regla de descarte: por cada (temporada, sectionIndex, periodIndex)
  //     real -leído como la PRIMERA mención de periodIndex dentro de cada
  //     archivo, ignorando las menciones posteriores como las de
  //     periodLogs- quedarse solo con la captura más completa.
  //
  //     Esta comparación SOLO aplica entre capturas con su propio
  //     currentriverrace.json legible (esAncla=true): son las únicas para
  //     las que "tamaño del currentriverrace.json" significa algo. Las
  //     capturas con identidad PRESTADA (p. ej. un clans.json huérfano que
  //     tomó prestada la identidad de la ancla más cercana en el tiempo,
  //     ver Paso B de _analizarCarpetaJSON_) comparten (temporada,
  //     sección, periodo) con esa ancla sin ser la misma captura, así que
  //     NUNCA se comparan/descartan por esta regla: siempre se conservan. ---
  var porPeriodo = {};
  var aConservar = [];

  resueltas.forEach(function(item) {
    if (!item.esAncla) {
      aConservar.push(item);
      return;
    }
    var k = 'T' + item.temporada + '-' + item.sectionIndex + '-' + item.periodIndex;
    if (!porPeriodo[k]) porPeriodo[k] = [];
    porPeriodo[k].push(item);
  });

  var descartadas = [];

  Object.keys(porPeriodo).forEach(function(k) {
    var grupo = porPeriodo[k];
    grupo.sort(function(a, b) { return b.tamano - a.tamano; }); // mayor tamaño primero
    aConservar.push(grupo[0]);
    grupo.slice(1).forEach(function(item) {
      item.motivo = 'duplicado del mismo periodo (' + k + '), no es el más completo (' + item.tamano + ' bytes vs ' + grupo[0].tamano + ' bytes)';
      descartadas.push(item);
    });
  });

  // --- Reporte ---
  console.log('  Temporada más reciente: ' + resueltas[resueltas.length - 1].temporada + ' | Períodos detectados: ' + Object.keys(porPeriodo).length + ' | capturas totales leídas: ' + resueltas.length);

  aConservar.forEach(function(item) {
    console.log('  ✔ CONSERVA  temporada ' + item.temporada + ' / sección ' + item.sectionIndex + ' / periodo ' + item.periodIndex +
      ' | fecha real: ' + item.real + ' | nombre: "' + item.clave + '"' +
      (item.esAncla ? ' | tamaño: ' + item.tamano + ' bytes' : ' | identidad prestada de la captura más cercana en el tiempo'));
  });

  var archivosAfectados = 0;

  descartadas.forEach(function(item) {
    var endpoints = Object.keys(item.archivos);
    console.log('  ✘ ' + (LIMPIEZA_DRY_RUN_ ? 'SE BORRARÍA' : 'BORRADA') +
      '  temporada ' + item.temporada + ' / sección ' + item.sectionIndex + ' / periodo ' + item.periodIndex +
      ' | fecha real: ' + item.real + ' | nombre: "' + item.clave + '"' +
      ' | archivos: ' + endpoints.join(', ') +
      ' | motivo: ' + item.motivo);

    archivosAfectados += endpoints.length;

    if (!LIMPIEZA_DRY_RUN_) {
      endpoints.forEach(function(endpoint) {
        item.archivos[endpoint].setTrashed(true);
      });
    }
  });

  console.log('  Total de archivos ' + (LIMPIEZA_DRY_RUN_ ? 'a enviar a la papelera' : 'enviados a la papelera') + ': ' + archivosAfectados);
}

/**
 * Analiza una carpeta y devuelve, para cada "captura" (grupo de archivos
 * que comparten el mismo prefijo "<fecha hora> - <clan>" en el nombre, sin
 * contar un posible tag "T-.. S-.. P.I-.." si ya lo traen de una ejecución
 * anterior), su identidad real: sectionIndex y periodIndex (primera
 * mención dentro del currentriverrace.json del grupo, ver _leerPeriodo_) y
 * la temporada, inferida recorriendo las capturas en orden real de
 * creación en Drive (getDateCreated, nunca el nombre) y detectando cada
 * retroceso de periodIndex como el inicio de una temporada nueva.
 *
 * No modifica ni borra nada, es de solo lectura. La usan tanto
 * migrarFormatoJSON() (05_Migrador_Formato.gs, para renombrar) como
 * limpiarDuplicadosJSON() (para decidir qué conservar), así ambas
 * coinciden siempre en la misma identidad para una misma captura.
 *
 * @param {Folder} carpeta
 * @param {Object=} cache Cache opcional de periodos ya leídos, indexado por
 *   ID de archivo (ver 07_Cache_Periodos_JSON.gs). Si un currentriverrace.json
 *   ya está en el cache, NO se vuelve a descargar/leer su contenido: se usa
 *   directamente el sectionIndex/periodIndex guardado. Los archivos leídos
 *   por primera vez se agregan al cache (mutando el objeto in-place) para
 *   que quien llamó a esta función pueda persistirlo después. Si se omite,
 *   se usa un cache vacío de un solo uso (comportamiento anterior, sin
 *   ahorro entre llamadas).
 * @return {{resueltas: Array<Object>, sinResolver: Array<string>}}
 *   Cada elemento de "resueltas" trae: clave, real, sectionIndex,
 *   periodIndex, temporada, archivos ({endpoint: File}), tamano (bytes del
 *   currentriverrace.json). Ordenado por fecha real ascendente.
 */
function _analizarCarpetaJSON_(carpeta, cache) {
  cache = cache || {};
  // _archivosDeCarpetaClan_ (04_Organizador_JSON.gs) trae tanto los
  // archivos sueltos directamente en "carpeta" como los que ya están
  // organizados dentro de sus subcarpetas de endpoint (CurrentRiverRace,
  // Clans). En la carpeta raíz (sin esas subcarpetas) simplemente no
  // encuentra ninguna y se comporta igual que antes.
  var archivos = _archivosDeCarpetaClan_(carpeta);
  var capturas = {}; // claveCaptura -> { archivos: {endpoint: File}, realCreado: Date }

  archivos.forEach(function(f) {
    var nombre = f.getName();
    if (!/\.json$/i.test(nombre)) return;

    var partes = nombre.split(' - ');
    if (partes.length < 3) return; // formato no reconocido, se deja intacto

    var fechaHoraPura = _quitarTagExistente_(partes[0].trim());
    var claveCaptura = fechaHoraPura + ' - ' + partes[1].trim();
    var endpoint = partes.slice(2).join(' - ').replace(/\.json$/i, '').toLowerCase();

    if (!capturas[claveCaptura]) {
      capturas[claveCaptura] = { archivos: {}, realCreado: f.getDateCreated() };
    }
    capturas[claveCaptura].archivos[endpoint] = f;
    if (f.getDateCreated() < capturas[claveCaptura].realCreado) {
      capturas[claveCaptura].realCreado = f.getDateCreated();
    }
  });

  // --- Paso A: resolver identidad PROPIA (desde su currentriverrace.json)
  // de cada captura que sí lo tenga y se pueda leer. Estas son las
  // "anclas": los únicos puntos con sectionIndex/periodIndex confiables.
  var claves = Object.keys(capturas);
  var anclas = []; // { real: Date, sectionIndex, periodIndex }

  claves.forEach(function(clave) {
    var grupo = capturas[clave];
    var archivoRiverRace = grupo.archivos['currentriverrace'];
    if (!archivoRiverRace) return;

    var fileId = archivoRiverRace.getId();
    var cacheado = cache[fileId];

    if (cacheado) {
      // Ya se leyó este archivo antes (en esta ejecución o en una
      // anterior): nos ahorramos la descarga/parseo del contenido.
      grupo.idPeriodo = { sectionIndex: cacheado.s, periodIndex: cacheado.p };
      grupo.tamano = cacheado.t;
    } else {
      var idPeriodo = _leerPeriodo_(archivoRiverRace);
      if (idPeriodo) {
        grupo.idPeriodo = idPeriodo;
        grupo.tamano = archivoRiverRace.getSize();
        cache[fileId] = { s: idPeriodo.sectionIndex, p: idPeriodo.periodIndex, t: grupo.tamano };
      }
    }

    if (grupo.idPeriodo) {
      anclas.push({ real: grupo.realCreado, sectionIndex: grupo.idPeriodo.sectionIndex, periodIndex: grupo.idPeriodo.periodIndex });
    }
  });

  anclas.sort(function(a, b) { return a.real - b.real; });

  // --- Paso B: a las capturas SIN currentriverrace.json propio y legible
  // (p. ej. un "clans.json" cuya llamada a la API quedó con un timestamp
  // unos segundos/minutos distinto al de su currentriverrace.json
  // hermano, y por eso no cayeron en la MISMA captura del paso anterior),
  // prestarles la identidad de la ancla más cercana en el tiempo real
  // (mismo clan), siempre que esté dentro de un margen razonable
  // (PAREO_TOLERANCIA_MS_). Así igual se etiquetan, en vez de quedar
  // huérfanas para siempre. Se marcan con esAncla=false para que
  // _limpiarCarpeta_ NUNCA las compare/descarte como si fueran
  // duplicados de la ancla de la que tomaron prestada la identidad
  // (comparten (temporada,sección,periodo) mas no son la misma captura).
  var resueltas = [];
  var sinResolver = [];

  claves.forEach(function(clave) {
    var grupo = capturas[clave];
    var esAncla = !!grupo.idPeriodo;
    var idPeriodo = grupo.idPeriodo;
    var tamano = grupo.tamano;

    if (!idPeriodo && anclas.length) {
      var prestada = _anclaMasCercana_(anclas, grupo.realCreado);
      if (prestada && Math.abs(prestada.real.getTime() - grupo.realCreado.getTime()) <= PAREO_TOLERANCIA_MS_) {
        idPeriodo = { sectionIndex: prestada.sectionIndex, periodIndex: prestada.periodIndex };
      }
    }

    if (!idPeriodo) {
      sinResolver.push(clave);
      return;
    }

    resueltas.push({
      clave: clave,
      real: grupo.realCreado,
      sectionIndex: idPeriodo.sectionIndex,
      periodIndex: idPeriodo.periodIndex,
      archivos: grupo.archivos,
      tamano: tamano,
      esAncla: esAncla // false = identidad prestada de otra captura cercana
    });
  });

  // Orden por fecha REAL de creación en Drive (no el nombre, que puede
  // traer una fecha ficticia): solo para dejar el resultado ordenado
  // cronológicamente, ya no hace falta para calcular la temporada.
  resueltas.sort(function(a, b) { return a.real - b.real; });

  resueltas.forEach(function(item) {
    item.temporada = _temporadaDeFecha_(item.real);
  });

  return { resueltas: resueltas, sinResolver: sinResolver };
}

/** @const {number} Margen máximo para prestar identidad a una captura sin
 *  currentriverrace.json propio, en ms. Si la ancla más cercana en el
 *  tiempo real queda más lejos que esto, se prefiere dejarla sin resolver
 *  (ver Paso B en _analizarCarpetaJSON_) antes que adivinar mal. */
var PAREO_TOLERANCIA_MS_ = 6 * 60 * 60 * 1000; // 6 horas

/**
 * Busca, dentro de una lista de anclas ordenada por fecha, la más cercana
 * en el tiempo real a "fecha" (puede quedar antes o después).
 * @param {Array<{real:Date}>} anclas
 * @param {Date} fecha
 * @return {?Object}
 */
function _anclaMasCercana_(anclas, fecha) {
  var mejor = null;
  var mejorDiferencia = Infinity;
  for (var i = 0; i < anclas.length; i++) {
    var diferencia = Math.abs(anclas[i].real.getTime() - fecha.getTime());
    if (diferencia < mejorDiferencia) {
      mejorDiferencia = diferencia;
      mejor = anclas[i];
    }
  }
  return mejor;
}

/**
 * Calcula el número de temporada de Clash Royale al que pertenece una
 * fecha, usando la regla de calendario real: la temporada reinicia el
 * PRIMER LUNES de cada mes (hora America/Lima) y el número de temporada
 * sube en 1 cada vez que reinicia.
 *
 * Ancla usada: la Temporada 1 (numeración interna propia, no la de
 * Supercell) comenzó el lunes 4 de mayo de 2026 — primer lunes de mayo
 * 2026 —. A partir de esa ancla se cuentan meses hacia adelante o hacia
 * atrás para cualquier otra fecha (mayo=1, junio=2, julio=3, …), así que
 * esto funciona igual para archivos históricos ya existentes que para
 * archivos nuevos: no hace falta borrar nada ni reiniciar ningún contador.
 *
 * Precisión: al día (no a la hora exacta del reinicio). Una captura
 * tomada en las pocas horas alrededor del instante exacto del reinicio
 * podría, en un caso límite, calcularse con la temporada equivocada; en
 * la práctica esto no afecta capturas tomadas durante el resto del día.
 *
 * Si alguna vez cambia el día de reinicio (deja de ser el primer lunes) o
 * se quiere correr la numeración interna por cualquier motivo, hay que
 * actualizar la constante MIG_TEMPORADA_ANCLA_ con un nuevo par
 * fecha/temporada conocido; el resto del cálculo no cambia.
 *
 * @param {Date} fechaReal
 * @return {number}
 */
function _temporadaDeFecha_(fechaReal) {
  var partes = Utilities.formatDate(fechaReal, 'America/Lima', 'yyyy-MM-dd').split('-');
  var anio = parseInt(partes[0], 10);
  var mes0 = parseInt(partes[1], 10) - 1; // 0 = enero
  var dia  = parseInt(partes[2], 10);

  var diaPrimerLunes = _primerLunesDia_(anio, mes0);
  if (dia < diaPrimerLunes) {
    // Todavía no llegó el reinicio de este mes calendario: la captura
    // pertenece a la ventana de temporada del mes anterior.
    mes0 -= 1;
    if (mes0 < 0) { mes0 = 11; anio -= 1; }
  }

  var mesesDesdeAncla = (anio - MIG_TEMPORADA_ANCLA_.anio) * 12 + (mes0 - MIG_TEMPORADA_ANCLA_.mes0);
  return MIG_TEMPORADA_ANCLA_.temporada + mesesDesdeAncla;
}

/** @const Ancla: Temporada 1 (numeración interna) = primer lunes de mayo de 2026. */
var MIG_TEMPORADA_ANCLA_ = { temporada: 1, anio: 2026, mes0: 4 };

/**
 * Día del mes (1-31) en que cae el primer lunes de un mes dado. Cálculo de
 * calendario puro (no depende de zona horaria real: el día de la semana
 * del día 1 de un mes es el mismo en cualquier zona horaria mientras no
 * se cruce medianoche UTC de forma ambigua, por eso se puede usar
 * Date.UTC de forma segura solo para esta cuenta de día-de-semana).
 * @param {number} anio
 * @param {number} mes0 0 = enero … 11 = diciembre
 * @return {number}
 */
function _primerLunesDia_(anio, mes0) {
  var diaSemanaDel1 = new Date(Date.UTC(anio, mes0, 1)).getUTCDay(); // 0=domingo … 6=sábado
  var offset = (8 - diaSemanaDel1) % 7;
  return 1 + offset;
}

/**
 * Quita un tag "T-<n> S-<n> P.I-<n> " existente al inicio de un segmento de
 * nombre, si lo trae (para poder re-analizar/re-etiquetar archivos que ya
 * pasaron por migrarFormatoJSON() en una ejecución anterior sin apilar
 * tags ni romper el agrupamiento por captura).
 * @param {string} segmento
 * @return {string}
 */
function _quitarTagExistente_(segmento) {
  return segmento.replace(/^T-\d+\s+S-\d+\s+P\.I-\d+\s+/, '');
}

/**
 * Lee sectionIndex y periodIndex de un currentriverrace.json tomando la
 * PRIMERA mención de cada campo en el orden en que aparece escrito en el
 * archivo (no un campo fijo de nivel superior por nombre de propiedad,
 * porque "periodIndex" vuelve a aparecer más adentro del documento, p. ej.
 * dentro de cada entrada de "periodLogs", y esas menciones posteriores
 * deben ignorarse).
 * @param {File} archivo
 * @return {?{sectionIndex:number, periodIndex:number}} null si no se pudo leer.
 */
function _leerPeriodo_(archivo) {
  try {
    var texto = archivo.getBlob().getDataAsString();
    JSON.parse(texto); // valida que sea JSON antes de confiar en el texto crudo

    var periodIndex = _primeraMencionNumerica_(texto, 'periodIndex');
    var sectionIndex = _primeraMencionNumerica_(texto, 'sectionIndex');

    if (periodIndex === null || sectionIndex === null) return null;
    return { sectionIndex: sectionIndex, periodIndex: periodIndex };
  } catch (e) {
    return null;
  }
}

/**
 * Busca la primera aparición de "<clave>": <numero> en un texto JSON crudo,
 * en el orden en que está escrito el archivo, ignorando las que aparezcan
 * después.
 * @param {string} texto
 * @param {string} clave
 * @return {?number} null si no se encontró ninguna mención.
 */
function _primeraMencionNumerica_(texto, clave) {
  var patron = new RegExp('"' + clave + '"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)');
  var m = patron.exec(texto);
  if (!m) return null;
  return Number(m[1]);
}
```

## 07_Cache_Periodos_JSON.gs
```javascript
// =============================================================================
// 07_Cache_Periodos_JSON.gs
// Cache persistente (en un archivo dentro de la carpeta del Generador) del
// resultado de _leerPeriodo_ (06_Limpieza_Duplicados_JSON.gs) para cada
// currentriverrace.json, indexado por su ID de Drive.
//
// POR QUÉ EXISTE
// ----------------------------------------------------------------------------
// Lo que realmente hace lenta a migrarFormatoJSON() (y a limpiarDuplicadosJSON())
// no es mover o renombrar archivos, sino DESCARGAR Y LEER el contenido de cada
// currentriverrace.json para sacarle sectionIndex/periodIndex. Con miles de
// archivos, eso solo, ya excede el límite de ejecución de Apps Script (~6 min).
//
// Como esos respaldos son inmutables una vez creados (nunca se editan después),
// el resultado de leer un mismo archivo (por su ID) nunca cambia. Este cache
// evita volver a descargar/parsear un archivo que ya fue leído en una
// ejecución anterior, sin importar cuántas veces se vuelva a correr el script.
//
// Requiere que CARPETA_GENERADOR_ID esté definido (02_Backstage.gs) y que
// este archivo esté en el mismo proyecto de Apps Script que 05 y 06.
// =============================================================================

/** @const {string} Nombre del archivo de cache dentro de la carpeta del Generador. */
var CACHE_PERIODOS_NOMBRE_ = '_cache_periodos_json.json';

/**
 * Carga el cache desde Drive. Si no existe o está corrupto, devuelve un
 * objeto vacío (no falla nunca: en el peor caso simplemente no hay cache
 * y todo se relee, como antes de tener este archivo).
 * @return {Object.<string, {s:number, p:number, t:number}>}
 *   Mapa fileId -> { s: sectionIndex, p: periodIndex, t: tamaño en bytes }.
 */
function _cache_cargar_() {
  try {
    var carpeta = DriveApp.getFolderById(CARPETA_GENERADOR_ID);
    var it = carpeta.getFilesByName(CACHE_PERIODOS_NOMBRE_);
    if (!it.hasNext()) return {};

    var texto = it.next().getBlob().getDataAsString('UTF-8');
    var datos = JSON.parse(texto);
    return (datos && typeof datos === 'object') ? datos : {};
  } catch (e) {
    console.log('  ⚠ No se pudo leer el cache de periodos (se empieza uno nuevo): ' + e);
    return {};
  }
}

/**
 * Guarda el cache en Drive, sobrescribiendo el archivo anterior si existe.
 * Segura para llamar seguido (p. ej. cada vez que se procesa una carpeta),
 * para no perder progreso si la ejecución se corta de golpe.
 * @param {Object} cache
 */
function _cache_guardar_(cache) {
  try {
    var carpeta = DriveApp.getFolderById(CARPETA_GENERADOR_ID);
    var contenido = JSON.stringify(cache);
    var it = carpeta.getFilesByName(CACHE_PERIODOS_NOMBRE_);
    if (it.hasNext()) {
      it.next().setContent(contenido);
    } else {
      carpeta.createFile(CACHE_PERIODOS_NOMBRE_, contenido, MimeType.PLAIN_TEXT);
    }
  } catch (e) {
    // No se detiene el proceso por esto: en el peor caso, se pierde el
    // avance de cache de ESTA ejecución y la próxima relee un poco más.
    console.log('  ⚠ No se pudo guardar el cache de periodos: ' + e);
  }
}

/**
 * Utilidad manual: borra el archivo de cache de Drive por si alguna vez se
 * necesita forzar una relectura completa de todos los currentriverrace.json
 * (por ejemplo, si se sospecha que quedó una entrada mala en el cache).
 * No es necesaria en el uso normal.
 */
function reiniciarCachePeriodosJSON() {
  var carpeta = DriveApp.getFolderById(CARPETA_GENERADOR_ID);
  var it = carpeta.getFilesByName(CACHE_PERIODOS_NOMBRE_);
  var borrados = 0;
  while (it.hasNext()) {
    it.next().setTrashed(true);
    borrados++;
  }
  console.log(borrados
    ? 'Cache de periodos borrado (' + borrados + ' archivo(s) enviado(s) a la papelera).'
    : 'No había cache de periodos que borrar.');
}
```
