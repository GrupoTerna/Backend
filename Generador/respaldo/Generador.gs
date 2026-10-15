/*
AVISO PARA CUALQUIER IA O PERSONA QUE EDITE ESTE PROYECTO:
1) NO metas los archivos dentro de una carpeta al armar el ZIP. Cada
   archivo .gs debe quedar SUELTO en la raíz del .zip.
   Correcto:   01_Principal.gs
   Incorrecto: Base/01_Principal.gs  (esto pega el nombre de la carpeta
   al del archivo y crea un duplicado en vez de actualizar el original).
2) Al subir de vuelta, usa el MISMO nombre exacto de archivo que bajaste,
   sin prefijos ni sufijos. Si agregas un archivo nuevo, dale un nombre
   distinto; nunca dupliques uno existente con otro nombre.
3) NO leas, edites, generes ni actualices "Script consolidado.gs". Ese
   archivo es un respaldo generado 100% automáticamente por las propias
   funciones del Generador (_descargarProyectoAArchivos) cada vez que se
   sube o descarga cualquier formato. Cualquier IA o persona que edite
   este proyecto debe ignorarlo por completo: no es código fuente real,
   es solo un resumen legible; editarlo a mano no tiene efecto (se
   sobrescribe automáticamente) y leerlo para entender el código es
   redundante, ya que su contenido es idéntico a la suma de los demás
   archivos .gs del proyecto.
4) Cuando una IA edite este proyecto a pedido del usuario, NO debe
   reempaquetar ni entregar el .zip completo del proyecto por defecto.
   Debe entregar el CONTENIDO COMPLETO (no fragmentos ni parches) de
   cada archivo NUMERADO que haya modificado (01_Principal.gs,
   02_Backstage.gs, etc.), listo para copiar/pegar y reemplazar el
   archivo entero en el editor; y el manifiesto "appsscript.json"
   completo también, solo si ese archivo cambió. Nunca entregar
   "Script consolidado.gs" ni este mismo LEEME como parte de una
   edición (ver punto 3). Esto ahorra tokens y tiempo frente a
   regenerar y comprimir todos los archivos cada vez, incluidos los
   que no cambiaron. Solo generar el .zip completo si el usuario lo
   pide explícitamente.
5) Los archivos modificados (punto 4) se deben ENTREGAR COMO ARCHIVO
   DESCARGABLE/ABRIBLE, nunca pegados como bloque de código dentro del
   chat. Un archivo real se puede abrir, copiar y guardar directamente;
   un bloque de código en el chat obliga a seleccionar y copiar a mano,
   y es más difícil de manejar en archivos largos.
*/

/* CÓDIGO CONSOLIDADO GENERADO EL 15/10/2026 14:24:06 */



// --- ARCHIVO: 01_Principal.gs ---
// =============================================================================
// 01_Principal.gs
// Punto de entrada: solo las funciones que ejecutas manualmente desde el editor.
// Orden: 1) subidas, 2) descargas, 3) mantenimiento.
// Comentario de prueba para obtener el archivo modificado desde Github
// =============================================================================
// ------------------------------------------------------------------
// DESCARGA (zip + txt + gs + md, siempre los 4 a la vez)
// Además sincroniza GitHub (08_GitHub.gs): .gs sueltos en <Nombre>/src/,
// consolidado en <Nombre>/respaldo/, INDICE_FUNCIONES.md y LEEME_IA.md.
// Si no hay GITHUB_TOKEN en las propiedades del script, GitHub se omite.
// ------------------------------------------------------------------

/** Descarga el código de la hoja "Base" y crea Base.zip, Base.gs, Base.txt y Base.md (y sincroniza GitHub) */
function descargarBase() {
  _descargarProyectoAArchivos('Base');
  _githubSincronizar_('Base');
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
  var reporte = _subirArchivosAProyecto('Base', 'zip');
  _githubSincronizar_('Base');
  return reporte;
}

/** Sube Base.txt y sincroniza Base.zip/.gs/.txt/.md */
function subirBaseDesdeTxt() {
  var reporte = _subirArchivosAProyecto('Base', 'txt');
  _githubSincronizar_('Base');
  return reporte;
}

/** Sube Base.gs y sincroniza Base.zip/.gs/.txt/.md */
function subirBaseDesdeGs() {
  var reporte = _subirArchivosAProyecto('Base', 'gs');
  _githubSincronizar_('Base');
  return reporte;
}

/** Sube Base.md y sincroniza Base.zip/.gs/.txt/.md */
function subirBaseDesdeMd() {
  var reporte = _subirArchivosAProyecto('Base', 'md');
  _githubSincronizar_('Base');
  return reporte;
}

/**
 * Sube Base/src/ de GitHub: deja el proyecto de Apps Script de "Base"
 * EXACTAMENTE igual (lo que no esté en GitHub se elimina del proyecto).
 * Antes guarda en Drive "Base_antes_de_GitHub.zip" (uno solo, se reemplaza) y al terminar
 * regenera Base.zip/.gs/.txt/.md y el consolidado/índice de GitHub.
 * Se detiene si src/ parece incompleta (menos de la mitad de los .gs).
 */
function subirBaseDesdeGithub() {
  return _githubTraerAProyectoApps_('Base', false);
}

/** Igual que subirBaseDesdeGithub(), pero sin la salvaguarda de "src/ incompleta". */
function subirBaseDesdeGithubForzado() {
  return _githubTraerAProyectoApps_('Base', true);
}

// ------------------------------------------------------------------
// DESCARGA (zip + txt + gs + md, siempre los 4 a la vez)
// ------------------------------------------------------------------


/** Descarga el código del propio "Generador" y crea Generador.zip, Generador.gs, Generador.txt y Generador.md */
function descargarGenerador() {
  _descargarProyectoAArchivos('Generador');
  _githubSincronizar_('Generador');
}

// ------------------------------------------------------------------
// SUBIDA AL GENERADOR (Funciones independientes por tipo de archivo)
// Mismo comportamiento que arriba: subir cualquier formato del
// Generador sincroniza automáticamente los otros 3 (Generador.zip/
// .gs/.txt/.md), sin pasos adicionales.
// ------------------------------------------------------------------

/** Sube Generador.zip y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeZip() {
  var reporte = _subirArchivosAProyecto('Generador', 'zip');
  _githubSincronizar_('Generador');
  return reporte;
}

/** Sube Generador.txt y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeTxt() {
  var reporte = _subirArchivosAProyecto('Generador', 'txt');
  _githubSincronizar_('Generador');
  return reporte;
}

/** Sube Generador.gs y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeGs() {
  var reporte = _subirArchivosAProyecto('Generador', 'gs');
  _githubSincronizar_('Generador');
  return reporte;
}

/** Sube Generador.md y sincroniza Generador.zip/.gs/.txt/.md */
function subirGeneradorDesdeMd() {
  var reporte = _subirArchivosAProyecto('Generador', 'md');
  _githubSincronizar_('Generador');
  return reporte;
}

/**
 * Sube Generador/src/ de GitHub: deja el proyecto de Apps Script del propio Generador
 * EXACTAMENTE igual (lo que no esté en GitHub se elimina del proyecto).
 * Antes guarda en Drive "Generador_antes_de_GitHub.zip" (uno solo, se reemplaza) y al terminar
 * regenera Generador.zip/.gs/.txt/.md y el consolidado/índice de GitHub.
 * Se detiene si src/ parece incompleta o si no trae la función de bajada.
 * [→ Contexto_Base_Web.md: pendiente de registrar el comportamiento real al autoreemplazarse]
 */
function subirGeneradorDesdeGithub() {
  return _githubTraerAProyectoApps_('Generador', false);
}

/** Igual que subirGeneradorDesdeGithub(), pero sin las salvaguardas de src/ incompleta ni de función de bajada. */
function subirGeneradorDesdeGithubForzado() {
  return _githubTraerAProyectoApps_('Generador', true);
}


// ------------------------------------------------------------------
// MANTENIMIENTO (uso ocasional / peligroso)
// ------------------------------------------------------------------

/** Comprueba GITHUB_TOKEN, acceso al repo, permiso de escritura y rama. */
function probarConexionGithub() {
  return _githubProbar_();
}

/**
 * PELIGRO: borra TODOS los archivos de código del proyecto de Apps Script
 * vinculado a la hoja "Base", dejando únicamente el manifiesto appsscript.json.
 * Útil para partir de cero antes de una subida limpia. No se puede deshacer.
 */
function eliminarTodosLosArchivosDeBase() {
  _eliminarTodosLosArchivosDeProyecto('Base');
}


// --- ARCHIVO: 02_Backstage.gs ---
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

// --- ARCHIVO: 03_RoyaleAPI_Torneos.gs ---
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

// --- ARCHIVO: 04_Organizador_JSON.gs ---
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
 * Claves de clan (en minusculas) que reconoce el Generador. PF080 (14-oct-2026): los IDs de las carpetas VIEJAS
 * (esquema JSON/<clan>/...) se dejaron en blanco porque ya no se pueden abrir ("No item with the given ID could be
 * found") y cada intento hacia esperar unos 30 s en verificarPeriodIndexJSON(). Los IDs que tenian estan anotados en
 * Contexto_Base_Web.md §PF080 por si hay que volver a ponerlos. Con el ID en blanco, _carpetaViejaDeClan_ devuelve null
 * sin avisar y el resto del codigo ya lo tolera. Las claves se conservan: son la lista de clanes.
 * @const {Object.<string, string>}
 */
var CARPETAS_CLAN_ = {
  'grupo乂terna™':   '',
  'grupoxterna™2':   '',
  'grupoxterna™3':   '',
  'mini乂ternas™':   '',
  'naranja x':       ''
};

/**
 * PF074 (14-oct-2026): ESQUEMA ACTUAL de carpetas, el que escribe Base desde el 25/26-sep: endpoint -> clan.
 * endpoint (CurrentRiverRace / Clans) -> carpeta del clan dentro de ese endpoint. Las claves de clan son las mismas
 * de CARPETAS_CLAN_. COPIA de _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_ y _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_
 * de Base/src/09_API_ClashRoyale.gs: si cambian alla, hay que cambiarlas aqui (son proyectos de Apps Script separados).
 * CARPETAS_CLAN_ (esquema VIEJO: JSON/<clan>/CurrentRiverRace|Clans) se conserva solo para leer lo historico que
 * pudiera seguir ahi. [→ Contexto_Base_Web.md §PF074]
 * @const {Object.<string, Object.<string, string>>}
 */
var CARPETAS_CLAN_POR_ENDPOINT_ = {
  'currentriverrace': {
    'grupo乂terna™':   '18TF9ufSGw8YlEA9Hpu7fT8d0UmiPnkYB',
    'grupoxterna™2':   '1X6dufNme2whAkjHarBCm1jdC6xI0_aQ6',
    'grupoxterna™3':   '1BN8ercCNZeUZYib8jGoVCzkAx2OJ7LWB',
    'mini乂ternas™':   '1gLW3F9cqNc58VYNvUKmAOT9TtUA6PMxQ',
    'naranja x':       '1YHhptq93vyECa3KpcEnOEXjEcuz6XBvE'
  },
  'clans': {
    'grupo乂terna™':   '1MiiF08kqyTcVt7CyBroyDRjv8eARpgfo',
    'grupoxterna™2':   '1D_GUUFTw9P6oSQXsaonxwXlmmp7sZA9M',
    'grupoxterna™3':   '15FCgOyzp2Vd9JtJszWd-EsS_2kKVnlnp',
    'mini乂ternas™':   '16MPII4hSHAATIPhrGDhuV6uT_Rd2YzHQ',
    'naranja x':       '1Lhs379eEIpdXJ-2DyWkcYBbkXg4WngaN'
  }
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

    var endpoint = partes.slice(2).join(' - ').replace(/\.json$/i, '').toLowerCase();
    // PF074: destino segun el esquema ACTUAL (endpoint -> clan); si el endpoint no esta mapeado, queda en la carpeta
    // vieja del clan como antes.
    var carpetaDestino = _carpetaDestinoJSON_(clanClave, endpoint);
    if (!carpetaDestino) {
      resumen.ignorados.push(nombre + '  [razón: endpoint "' + endpoint + '" sin carpeta actual y la carpeta vieja del clan no existe]');
      continue;
    }

    archivo.moveTo(carpetaDestino);
    resumen.movidos++;
    console.log('    [raíz → ' + segClan + ' / ' + endpoint + '] ' + nombre);
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

/**
 * PF074: carpeta donde debe vivir un JSON de un clan y un endpoint: la del esquema ACTUAL (endpoint -> clan) si ese
 * endpoint esta en CARPETAS_CLAN_POR_ENDPOINT_; si no, la carpeta vieja del clan (CARPETAS_CLAN_).
 * @param {string} clanClave Clave de clan en minusculas (como en CARPETAS_CLAN_).
 * @param {string} endpointKey 'currentriverrace' | 'clans' | otro.
 * @return {Folder}
 */
function _carpetaDestinoJSON_(clanClave, endpointKey) {
  var porClan = CARPETAS_CLAN_POR_ENDPOINT_[endpointKey];
  if (porClan && porClan[clanClave]) return DriveApp.getFolderById(porClan[clanClave]);
  return _carpetaViejaDeClan_(clanClave); // puede ser null si la carpeta vieja ya no existe
}

/** Clanes para los que ya se aviso que su carpeta vieja no se puede abrir (un solo aviso por ejecucion). */
var _CARPETA_VIEJA_AVISADA_ = {};

/**
 * PF074: carpeta VIEJA del clan (esquema JSON/<clan>/...). Devuelve null, y avisa una vez en el registro, si ya no
 * existe o la cuenta no tiene acceso (el 14-oct-2026 la del clan "grupo乂terna™" daba "No item with the given ID could be
 * found"). Todo lo que depende de la carpeta vieja debe tolerar el null.
 * @param {string} clanClave
 * @return {?Folder}
 */
function _carpetaViejaDeClan_(clanClave) {
  var id = CARPETAS_CLAN_[clanClave];
  if (!id) return null;
  try {
    return DriveApp.getFolderById(id);
  } catch (e) {
    if (!_CARPETA_VIEJA_AVISADA_[clanClave]) {
      _CARPETA_VIEJA_AVISADA_[clanClave] = true;
      console.log('    ⚠ La carpeta VIEJA del clan "' + clanClave + '" no se puede abrir (ID ' + id +
        '): se omite y se sigue con las carpetas actuales. (' + e.message + ')');
    }
    return null;
  }
}

/**
 * PF074: lista recursiva (hasta `maxNivel` niveles de subcarpetas) de los archivos de una carpeta.
 * @param {Folder} carpeta
 * @param {number} maxNivel
 * @return {Array<File>}
 */
function _archivosRecursivo_(carpeta, maxNivel) {
  var lista = [];
  (function recorrer(c, nivel) {
    var it = c.getFiles();
    while (it.hasNext()) lista.push(it.next());
    if (nivel >= maxNivel) return;
    var sub = c.getFolders();
    while (sub.hasNext()) recorrer(sub.next(), nivel + 1);
  })(carpeta, 0);
  return lista;
}

/**
 * PF074: TODOS los archivos de un clan, vistos juntos: las carpetas del esquema ACTUAL (CurrentRiverRace/<clan> y
 * Clans/<clan>, con sus subcarpetas de temporada y semana, hasta 3 niveles) mas la carpeta vieja del clan
 * (CARPETAS_CLAN_, con sus subcarpetas CurrentRiverRace y Clans). Hace falta verlos juntos porque un clans.json no trae
 * periodIndex y toma prestado el de la captura currentriverrace.json mas cercana (Paso B de _analizarCarpetaJSON_), y
 * ahora esos dos tipos de archivo viven en carpetas distintas.
 * @param {string} clanClave Clave de clan en minusculas (como en CARPETAS_CLAN_).
 * @return {Array<File>}
 */
function _archivosDeClan_(clanClave) {
  var vistos = {}, lista = [];
  function agregar(arr) {
    arr.forEach(function(f) {
      var id = f.getId();
      if (!vistos[id]) { vistos[id] = true; lista.push(f); }
    });
  }
  Object.keys(CARPETAS_CLAN_POR_ENDPOINT_).forEach(function(endpointKey) {
    var id = CARPETAS_CLAN_POR_ENDPOINT_[endpointKey][clanClave];
    if (!id) return;
    var carpetaActual;
    try {
      carpetaActual = DriveApp.getFolderById(id);
    } catch (e) {
      // La carpeta ACTUAL si debe existir: se falla con un mensaje claro en vez de seguir con datos incompletos.
      throw 'No se pudo abrir la carpeta ACTUAL de ' + endpointKey + ' del clan "' + clanClave + '" (ID ' + id +
        '). Revisa CARPETAS_CLAN_POR_ENDPOINT_ en 04_Organizador_JSON.gs contra Base. (' + e.message + ')';
    }
    agregar(_archivosRecursivo_(carpetaActual, 3));
  });
  var carpetaVieja = _carpetaViejaDeClan_(clanClave);
  if (carpetaVieja) agregar(_archivosDeCarpetaClan_(carpetaVieja));
  return lista;
}

/** Memoria de las carpetas de temporada/semana ya resueltas en esta ejecucion (evita repetir getFoldersByName). */
var _SEMANA_MEM_ = {};

/**
 * PF074: carpeta de la TEMPORADA y la SEMANA de un clan y un endpoint, dentro de la carpeta actual de ese endpoint:
 * CurrentRiverRace|Clans / <clan> / T-02 / S-01. La crea si no existe. Los nombres (T-02, S-01, con cero a la izquierda)
 * son un SUPUESTO por confirmar con la usuaria; el mismo formato que usa Base (_getCarpetaSemana_ en 09_API_ClashRoyale.gs).
 * @return {?Folder} null si el endpoint no esta en CARPETAS_CLAN_POR_ENDPOINT_ (queda donde esta).
 */
function _carpetaSemanaJSON_(clanClave, endpointKey, temporada, sectionIndex) {
  var idClan = (CARPETAS_CLAN_POR_ENDPOINT_[endpointKey] || {})[clanClave];
  if (!idClan) return null;
  var nT = 'T-' + _pad2_(temporada), nS = 'S-' + _pad2_(sectionIndex + 1);
  var k = idClan + '|' + nT + '|' + nS;
  if (_SEMANA_MEM_[k]) return _SEMANA_MEM_[k];
  var cT = _carpetaHijaOCrear_(DriveApp.getFolderById(idClan), nT);
  var cS = _carpetaHijaOCrear_(cT, nS);
  _SEMANA_MEM_[k] = cS;
  return cS;
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

// --- ARCHIVO: 05_Migrador_Formato.gs ---
// =============================================================================
// 05_Migrador_Formato.gs
// Migra los archivos JSON al nuevo formato de nombre:
//
//   "T-<temporada> S-<semana> P.I-<periodIndex>-<letra del día> <fecha hora> - <clan> - <endpoint>.json"
//
// donde:
//   - temporada  : se INFIERE (ver _analizarCarpetaJSON_ en
//                  06_Limpieza_Duplicados_JSON.gs), no viene en el nombre
//                  ni en el JSON.
//   - semana     : sectionIndex + 1, leído del contenido de currentriverrace.json.
//   - periodIndex: periodIndex real, leído del contenido de currentriverrace.json
//                  (la PRIMERA mención dentro del archivo, ver _leerPeriodo_).
//   - letra      : día de la semana de ese periodIndex (L M X J V S D), solo para
//                  facilitar la búsqueda manual; ver _letraDiaGuerra_ y
//                  [→ Contexto_Base_Web.md §PF074].
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
  // PF080 (14-oct-2026): candado para que no corran dos ejecuciones a la vez. El 14-oct, una ejecucion manual y la del
  // disparador automatico se solaparon (8:22/8:23 y 8:29/8:31 p. m.), leyeron el mismo estado guardado y repitieron
  // clanes ya hechos. Si hay otra en curso, esta sale sin tocar nada; la que esta corriendo programa su continuacion.
  var candado = LockService.getScriptLock();
  if (!candado.tryLock(5000)) {
    console.log('migrarFormatoJSON(): ya hay otra ejecución en curso; esta se omite. Espera a que termine (o a su continuación automática); no la lances a mano mientras haya una en proceso.');
    return;
  }
  try {
    _mig_ejecutarMigracion_();
  } finally {
    candado.releaseLock();
  }
}

/** Cuerpo de migrarFormatoJSON() (ver el candado arriba). */
function _mig_ejecutarMigracion_() {
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

      var clanCompleto = _mig_etiquetarCarpetaClan(clave, estado.resumen, cache, inicio, estado); // PF074: recibe la CLAVE del clan; PF080: y el estado, para retomar dentro del clan

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
      estado.progresoClan = null; // PF080
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
 * @param {string} clanClave Clave del clan en minúsculas (como en CARPETAS_CLAN_).
 * @param {Object} resumen
 * @param {Object} cache Cache de periodos (07_Cache_Periodos_JSON.gs).
 * @param {number=} inicio Timestamp (ms) de inicio de la ejecución actual.
 * @param {Object=} estado Estado persistente de migrarFormatoJSON(). PF080: guarda en estado.progresoClan
 *   ({clave, hechos}) cuántas capturas de ESTE clan ya se procesaron, para retomar desde ahí y no desde cero.
 * @return {boolean} true si se terminó de etiquetar toda la carpeta,
 *   false si se cortó por presupuesto de tiempo (la carpeta se debe
 *   reintentar completa la próxima vez; es rápido porque el análisis ya
 *   quedó en el cache y mover/renombrar un archivo ya correcto no hace nada).
 */
function _mig_etiquetarCarpetaClan(clanClave, resumen, cache, inicio, estado) {
  // PF074 (14-oct-2026): recibe la CLAVE del clan y analiza juntas sus carpetas del esquema ACTUAL (endpoint -> clan) y
  // la vieja. Los archivos que ya estan en la carpeta actual del endpoint NO se mueven; los que siguen en la carpeta
  // vieja del clan se renombran en su sitio y se cuentan (resumen.enCarpetaVieja): moverlos es una decision pendiente.
  var carpeta  = { getName: function() { return clanClave; } }; // solo para los mensajes del log
  var analisis = _analizarCarpetaJSON_(clanClave, cache);
  console.log('    [' + clanClave + '] ' + _textoCorteDiario_(analisis.corteDiario)); // PF080

  var enRevision = {}; // PF077: clans.json que caen en la ventana 04:00-05:00 (o piden una captura que cae ahi)
  analisis.aRevision.forEach(function(r) { enRevision[r.clave] = r.motivo; });
  analisis.sinResolver.forEach(function(clave) {
    var linea = '[' + carpeta.getName() + '] ' + clave + (enRevision[clave]
      ? ' [A REVISAR: ' + enRevision[clave] + '; no se renombró]'
      : ' [sin currentriverrace.json legible, no se pudo etiquetar]');
    // PF080: cada ejecución encadenada vuelve a analizar la carpeta que se cortó por tiempo y repetía estas líneas
    // (el 14-oct-2026: 24 líneas, 14 distintas); se anota una sola vez.
    if (resumen.ignorados.indexOf(linea) === -1) resumen.ignorados.push(linea);
  });

  // PF080 (15-oct-2026): retomar donde se quedó. Antes, una carpeta que no cabía en el presupuesto de tiempo se volvía a
  // recorrer desde la primera captura en cada ejecución (el 15-oct, grupoxterna™2: 6 ejecuciones seguidas con 0 renombrados
  // y 0 movidos, sin avanzar). El orden de "resueltas" es fijo (fecha de creación y, a igual fecha, la clave), así que
  // basta con guardar cuántas ya se hicieron.
  var desde = 0;
  if (estado && estado.progresoClan && estado.progresoClan.clave === clanClave) {
    desde = Math.min(estado.progresoClan.hechos || 0, analisis.resueltas.length);
    if (desde > 0) console.log('    (retomando en la captura ' + (desde + 1) + ' de ' + analisis.resueltas.length + '; las anteriores ya se procesaron)');
  }

  for (var i = desde; i < analisis.resueltas.length; i++) {
    if (inicio && _mig_tiempoAgotado_(inicio)) {
      if (estado) estado.progresoClan = { clave: clanClave, hechos: i };
      console.log('    (presupuesto de tiempo alcanzado dentro de "' + carpeta.getName() + '", capturas hechas: ' + i + ' de ' + analisis.resueltas.length + '; se retoma desde ahí en la próxima ejecución)');
      return false;
    }

    var item = analisis.resueltas[i];
    var cv = item.clave.split(' - ');
    var fechaHoraPura   = _mig_fechaHoraStr(item.real); // fecha real (getDateCreated), no la del nombre viejo (cv[0])
    var segClanOriginal = cv.slice(1).join(' - ');

    // La letra del día sale del periodIndex del CONTENIDO (no de la fecha del
    // nombre): "P.I-05-S" = sábado. Ver _letraDiaGuerra_ más abajo.
    var tag = 'T-' + _pad2_(item.temporada) +
      '  S-' + _pad2_(item.sectionIndex + 1) +
      ' P.I-' + _pad2_(item.periodIndex) + '-' + _letraDiaGuerra_(item.periodIndex);

    var endpointKeys = Object.keys(item.archivos);
    for (var j = 0; j < endpointKeys.length; j++) {
      var endpointKey = endpointKeys[j];
      var archivo = item.archivos[endpointKey];

      // PF074: ya no se mueve a una subcarpeta de la carpeta vieja del clan. Si el archivo no cuelga de la carpeta
      // actual de su endpoint, solo se cuenta (decision de moverlo pendiente; ver Contexto_Base_Web.md §PF074).
      var idCarpetaActual = (CARPETAS_CLAN_POR_ENDPOINT_[endpointKey] || {})[clanClave];
      if (idCarpetaActual) {
        // PF074 (tanda 4): lo que ya esta en la carpeta actual del endpoint va a su carpeta de temporada y semana
        // (T-xx / S-xx, misma temporada y semana que el tag). Si ya esta ahi, no se mueve.
        // PF080: se mira primero si ya esta en SU carpeta de semana (1 consulta de padres); si lo esta, tambien esta bajo la
        // carpeta del endpoint y se evita _mig_estaBajoCarpeta_ (hasta 4 niveles de consultas por archivo, lo que hacia
        // que un clan entero no cupiera en el presupuesto de tiempo).
        var carpetaSemana = _carpetaSemanaJSON_(clanClave, endpointKey, item.temporada, item.sectionIndex);
        if (carpetaSemana && _mig_yaEstaEnCarpeta_(archivo, carpetaSemana)) {
          // ya esta en su sitio
        } else if (!_mig_estaBajoCarpeta_(archivo, idCarpetaActual)) {
          resumen.enCarpetaVieja = (resumen.enCarpetaVieja || 0) + 1;
        } else if (carpetaSemana) {
          archivo.moveTo(carpetaSemana);
          resumen.movidos++;
          console.log('    [clan] ' + endpointKey + ' movido a ' + carpetaSemana.getName() + ' de la temporada ' + item.temporada);
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

/**
 * PF074: true si `archivo` esta dentro de la carpeta `idCarpeta` o de una subcarpeta suya (hasta 3 niveles hacia arriba:
 * clan -> temporada -> semana).
 */
function _mig_estaBajoCarpeta_(archivo, idCarpeta) {
  var actuales = [archivo];
  for (var nivel = 0; nivel < 4; nivel++) {
    var siguientes = [];
    for (var i = 0; i < actuales.length; i++) {
      var padres = actuales[i].getParents();
      while (padres.hasNext()) {
        var p = padres.next();
        if (p.getId() === idCarpeta) return true;
        siguientes.push(p);
      }
    }
    actuales = siguientes;
    if (!actuales.length) break;
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

/** @const {string} Letras del día de la semana, índice 0 = lunes … 6 = domingo (L M X J V S D). */
var LETRAS_DIA_GUERRA_ = 'LMXJVSD';

/**
 * Letra del día de la semana al que corresponde un periodIndex:
 * periodIndex % 7 → 0=L, 1=M, 2=X, 3=J, 4=V, 5=S, 6=D. Es la misma regla que
 * usa el contexto del sistema (P.I de un día = 7*(Semana-1) + 3 jueves,
 * 4 viernes, 5 sábado, 6 domingo) y se comprobó contra los 118
 * currentriverrace.json de Datos descargados/JSON (117 coinciden con la
 * fecha; la que queda es una captura dentro de la ventana 04:00-05:00 Lima).
 * @param {number} periodIndex
 * @return {string} Una letra de LETRAS_DIA_GUERRA_.
 */
function _letraDiaGuerra_(periodIndex) {
  var n = Math.round(Number(periodIndex));
  return LETRAS_DIA_GUERRA_.charAt(((n % 7) + 7) % 7);
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
  console.log('   (no la ejecutes a mano mientras esa continuación esté pendiente o corriendo: el candado la omitiría; si quieres adelantarla, espera a que no haya ninguna en proceso)');
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
  console.log('  En carpeta vieja (renombrados en su sitio, sin mover): ' + (resumen.enCarpetaVieja || 0));
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

// --- ARCHIVO: 06_Limpieza_Duplicados_JSON.gs ---
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
    // PF074: se pasa la CLAVE del clan (no una carpeta) para ver juntas las carpetas del esquema actual y la vieja.
    _limpiarCarpeta_(clave, clave, cache);
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
function _limpiarCarpeta_(carpeta, etiqueta, cache) { // PF074: `carpeta` puede ser una Folder (raiz) o la clave de un clan (string)
  console.log('── ' + etiqueta + ' ──');

  var analisis = _analizarCarpetaJSON_(carpeta, cache);
  console.log('  ' + _textoCorteDiario_(analisis.corteDiario)); // PF080
  var resueltas = analisis.resueltas;
  var enRevision = {};
  analisis.aRevision.forEach(function(r) { enRevision[r.clave] = r.motivo; });
  var sinResolver = analisis.sinResolver.filter(function(c) { return !enRevision[c]; });

  if (sinResolver.length) {
    console.log('  Sin currentriverrace.json legible, se dejan intactas (' + sinResolver.length + '):');
    sinResolver.forEach(function(c) { console.log('    · ' + c); });
  }
  if (analisis.aRevision.length) {
    console.log('  A revisión (no se sabe el día de juego), se dejan intactas (' + analisis.aRevision.length + '):');
    analisis.aRevision.forEach(function(r) { console.log('    · ' + r.clave + ' → ' + r.motivo); });
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
 * @return {{resueltas: Array<Object>, sinResolver: Array<string>, aRevision: Array<{clave:string, motivo:string}>, corteDiario: ?Object}}
 *   Cada elemento de "resueltas" trae: clave, real, sectionIndex,
 *   periodIndex, temporada, archivos ({endpoint: File}), tamano (bytes del
 *   currentriverrace.json), esAncla, cortes (PF077). Ordenado por fecha real
 *   ascendente. "aRevision" (PF077) lista, con su motivo, las capturas sin
 *   currentriverrace.json propio cuyo dia de juego no se pudo fijar (ventana
 *   04:00-05:00); tambien figuran en "sinResolver" y quedan sin etiquetar.
 */
function _analizarCarpetaJSON_(carpeta, cache) { // PF074: `carpeta` puede ser una Folder (raiz) o la clave de un clan (string)
  cache = cache || {};
  // _archivosDeCarpetaClan_ (04_Organizador_JSON.gs) trae tanto los
  // archivos sueltos directamente en "carpeta" como los que ya están
  // organizados dentro de sus subcarpetas de endpoint (CurrentRiverRace,
  // Clans). En la carpeta raíz (sin esas subcarpetas) simplemente no
  // encuentra ninguna y se comporta igual que antes.
  var archivos = (typeof carpeta === 'string') ? _archivosDeClan_(carpeta) : _archivosDeCarpetaClan_(carpeta);
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

  // PF080: hora real del corte diario de ESTE clan, medida con sus propias anclas (null si no hay datos suficientes).
  var corteDiario = _estimarCorteDiario_(anclas);

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
  // PF077 (14-oct-2026): el periodIndex prestado ya NO se copia tal cual: se corre segun los cortes de las 04:00 (Lima)
  // que separan la fecha del archivo de la de la ancla (_ajustarPeriodoPrestado_). Si el archivo o la ancla caen en la
  // ventana 04:00-05:00, donde no se sabe el dia, queda SIN etiquetar y se lista aparte en "aRevision".
  var resueltas = [];
  var sinResolver = [];
  var aRevision = []; // { clave, motivo }; tambien estan en sinResolver, para que quien no lo lea los trate como intactos

  claves.forEach(function(clave) {
    var grupo = capturas[clave];
    var esAncla = !!grupo.idPeriodo;
    var idPeriodo = grupo.idPeriodo;
    var tamano = grupo.tamano;
    var cortes = 0;
    var temporadaDelDia = null;

    if (!idPeriodo && anclas.length) {
      var prestada = _anclaMasCercana_(anclas, grupo.realCreado);
      if (prestada && Math.abs(prestada.real.getTime() - grupo.realCreado.getTime()) <= PAREO_TOLERANCIA_MS_) {
        var ajuste = _ajustarPeriodoPrestado_(prestada, grupo.realCreado, (corteDiario && corteDiario.ok) ? corteDiario : null);
        if (ajuste.revision) {
          aRevision.push({ clave: clave, motivo: ajuste.revision });
        } else {
          idPeriodo = { sectionIndex: ajuste.sectionIndex, periodIndex: ajuste.periodIndex };
          cortes = ajuste.cortes;
          temporadaDelDia = ajuste.temporada;
        }
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
      esAncla: esAncla, // false = identidad prestada de otra captura cercana
      cortes: cortes, // PF077: dias que se corrio el periodIndex prestado (-1, 0 o +1); 0 en las anclas
      temporadaDelDia: temporadaDelDia // PF077: temporada del DIA DE JUEGO si se corrio el periodIndex; null si no
    });
  });

  // Orden por fecha REAL de creación en Drive (no el nombre, que puede
  // traer una fecha ficticia): solo para dejar el resultado ordenado
  // cronológicamente, ya no hace falta para calcular la temporada.
  resueltas.sort(function(a, b) { return (a.real - b.real) || (a.clave < b.clave ? -1 : a.clave > b.clave ? 1 : 0); }); // PF080: desempate por clave para que el orden sea fijo entre ejecuciones

  resueltas.forEach(function(item) {
    // PF077: si el periodIndex se corrio un dia, la temporada sale del dia de juego (04:00 Lima), no de la fecha de
    // calendario: asi un clans.json de la madrugada del primer lunes sigue en la temporada que termina.
    item.temporada = (item.temporadaDelDia != null) ? item.temporadaDelDia : _temporadaDeFecha_(item.real);
  });

  return { resueltas: resueltas, sinResolver: sinResolver, aRevision: aRevision, corteDiario: corteDiario };
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

/** @return {string} PF080: linea de log con el corte diario medido (o por que se uso la ventana 04:00-05:00). */
function _textoCorteDiario_(c) {
  if (!c) return 'Corte diario: sin pares de anclas seguidas, se usa la ventana 04:00-05:00.';
  if (!c.ok) return 'Corte diario: no se pudo medir (' + c.motivo + '), se usa la ventana 04:00-05:00.';
  return 'Corte diario medido: ' + _fmtHoraH_(c.desdeH) + '-' + _fmtHoraH_(c.hastaH) + ' (Lima), con ' + c.coinciden + ' de ' + c.pares + ' pares de anclas.';
}

/** @const {number} PF080: minimo de pares de anclas consecutivas (p -> p+1) para dar por medido el corte diario. */
var CORTE_MIN_PARES_ = 3;

/** @const {number} PF080: fraccion minima de esos pares que debe coincidir en el rango medido (tolera anclas raras). */
var CORTE_MIN_FRACCION_ = 0.9;

/** @return {string} Hora decimal (0-24) como "HH:MM". */
function _fmtHoraH_(h) {
  var min = Math.round(h * 60);
  var hh = Math.floor(min / 60) % 24, mm = min % 60;
  return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
}

/** @return {number} Hora de Lima de un instante, decimal en [0, 24). */
function _horaLimaDecimal_(fecha) {
  var d = new Date(fecha.getTime() - VERIF_LIMA_OFFSET_H_ * 3600 * 1000);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3600000;
}

/**
 * PF080: true si la hora de Lima de "fecha" cae estrictamente dentro de (corte.desdeH, corte.hastaH), o, sin "corte",
 * dentro de la ventana fija [04:00, 05:00) (_verif_enVentanaCambio_). Los extremos del rango medido son las horas de las
 * propias anclas que lo fijan, y esas anclas ya traen su periodIndex: no se las marca como dudosas.
 * @param {Date} fecha
 * @param {?{desdeH:number, hastaH:number}} corte
 * @return {boolean}
 */
function _enVentanaCorte_(fecha, corte) {
  if (!corte) return _verif_enVentanaCambio_(fecha);
  var h = _horaLimaDecimal_(fecha);
  return h > corte.desdeH && h < corte.hastaH;
}

/**
 * PF080 (regla nueva, decidida por la usuaria el 14-oct-2026): mide la hora REAL del corte diario de un clan en lugar de
 * suponer la ventana 04:00-05:00. Usa solo las anclas (currentriverrace.json con periodIndex propio, ordenadas por fecha
 * de creacion):
 *  - Dos anclas seguidas con periodIndex p y p+1 (y la semana que corresponde), a menos de 24 h una de otra, dicen que el
 *    corte ocurrio entre sus dos horas de Lima. Cada par es un intervalo de hora del dia donde puede estar el corte.
 *  - Dos anclas seguidas con el MISMO periodIndex dicen que el corte NO esta entre sus dos horas (a menos de 24 h).
 *  - El corte es una hora fija del dia: se toma el rango que coincide en mas intervalos (se tolera una minoria de anclas
 *    raras, como la T-05 con periodIndex 7 en un domingo) y se le recortan los bordes con los pares "sin corte".
 * Las horas se miden desde el mediodia de Lima para que un corte de madrugada no cruce el cambio de dia; un par cuyo
 * intervalo cruza ese punto se omite (no informa).
 * Funcion pura (no toca Drive). Devuelve null si no hay ningun par utilizable.
 * @param {Array<{real:Date, sectionIndex:number, periodIndex:number}>} anclas Ordenadas por fecha ascendente.
 * @return {?{ok:boolean, desdeH:number, hastaH:number, pares:number, coinciden:number, motivo:string}}
 *   ok = true si hay al menos CORTE_MIN_PARES_ pares y coinciden CORTE_MIN_FRACCION_ de ellos; desdeH/hastaH en horas de
 *   Lima (decimal). Si ok es false, "motivo" dice por que y el llamador usa la ventana fija 04:00-05:00.
 */
function _estimarCorteDiario_(anclas) {
  var intervalos = []; // [ini, fin] en horas desde el mediodia de Lima
  var exclusiones = [];
  var unDia = 24 * 3600 * 1000;
  var desdeNoon = function(fecha) { return (_horaLimaDecimal_(fecha) - 12 + 24) % 24; };

  for (var i = 1; i < anclas.length; i++) {
    var a = anclas[i - 1], b = anclas[i];
    var dt = b.real.getTime() - a.real.getTime();
    if (dt <= 0 || dt >= unDia) continue;
    var ia = desdeNoon(a.real), ib = desdeNoon(b.real);
    if (ib < ia) continue; // cruza el mediodia de Lima: no informa
    var mismaSemana = (b.sectionIndex === a.sectionIndex + Math.floor(b.periodIndex / 7) - Math.floor(a.periodIndex / 7));
    if (b.periodIndex === a.periodIndex + 1 && mismaSemana) {
      intervalos.push([ia, ib]);
    } else if (b.periodIndex === a.periodIndex && b.sectionIndex === a.sectionIndex) {
      exclusiones.push([ia, ib]);
    }
  }

  if (!intervalos.length) return null;

  // Rango de mayor coincidencia (barrido de extremos).
  var eventos = [];
  intervalos.forEach(function(iv) { eventos.push([iv[0], 1]); eventos.push([iv[1], -1]); });
  eventos.sort(function(x, y) { return x[0] - y[0] || y[1] - x[1]; }); // a igual hora, primero las entradas
  var cuenta = 0, mejor = 0, lo = null, hi = null;
  for (var e = 0; e < eventos.length; e++) {
    cuenta += eventos[e][1];
    if (cuenta > mejor) {
      mejor = cuenta; lo = eventos[e][0];
      hi = (e + 1 < eventos.length) ? eventos[e + 1][0] : lo;
    }
  }

  // Bordes: un par "sin corte" que tapa el principio o el final del rango lo acorta.
  exclusiones.forEach(function(x) {
    if (x[0] <= lo && x[1] > lo && x[1] < hi) lo = x[1];
    else if (x[1] >= hi && x[0] < hi && x[0] > lo) hi = x[0];
  });

  var res = { ok: false, desdeH: (lo + 12) % 24, hastaH: (hi + 12) % 24, pares: intervalos.length, coinciden: mejor, motivo: '' };
  if (intervalos.length < CORTE_MIN_PARES_) {
    res.motivo = 'solo ' + intervalos.length + ' par(es) de anclas seguidas (se piden ' + CORTE_MIN_PARES_ + ')';
  } else if (mejor < CORTE_MIN_FRACCION_ * intervalos.length) {
    res.motivo = 'los pares no coinciden: ' + mejor + ' de ' + intervalos.length;
  } else if (!(hi > lo)) {
    res.motivo = 'el rango medido quedo vacio';
  } else {
    res.ok = true;
  }
  return res;
}

/**
 * PF077: numero de DIA DE JUEGO de un instante: dias enteros desde 1970 contados en hora de Lima con el cambio de dia
 * a las 04:00. Dos instantes con el mismo numero estan en el mismo dia de juego; la resta de dos numeros es la cantidad
 * de cortes de las 04:00 que los separan. Usa las constantes de 10_Verificar_PeriodIndex_JSON.gs (Lima = UTC-5, corte 04:00).
 * @param {Date} fecha
 * @return {number}
 */
function _diaJuegoNum_(fecha, corteH) {
  var c = (corteH == null) ? VERIF_CAMBIO_DESDE_H_ : corteH; // PF080: hora de corte opcional (por defecto 04:00)
  return Math.floor((fecha.getTime() - (VERIF_LIMA_OFFSET_H_ + c) * 3600 * 1000) / 86400000);
}

/**
 * PF077: fecha de calendario (UTC, solo para leer anio/mes/dia/dia de semana) del DIA DE JUEGO de un instante.
 * @param {Date} fecha
 * @return {Date}
 */
function _diaJuegoFecha_(fecha, corteH) {
  var c = (corteH == null) ? VERIF_CAMBIO_DESDE_H_ : corteH; // PF080
  return new Date(fecha.getTime() - (VERIF_LIMA_OFFSET_H_ + c) * 3600 * 1000);
}

/** @return {boolean} true si el dia de juego de "fecha" es el primer lunes de su mes, o sea el dia 0 de una temporada. */
function _esInicioDeTemporada_(fecha, corteH) {
  var d = _diaJuegoFecha_(fecha, corteH);
  return d.getUTCDay() === 1 && d.getUTCDate() === _primerLunesDia_(d.getUTCFullYear(), d.getUTCMonth());
}

/**
 * PF077: corre el (sectionIndex, periodIndex) de una ancla al dia de juego de otro archivo (un clans.json, que no trae
 * periodIndex propio). Cuenta los cortes de las 04:00 (Lima) entre ambas fechas: 0 = mismo dia, se copia; +1 / -1 = se suma
 * o resta un dia. Como el prestamo es de 6 horas como maximo (PAREO_TOLERANCIA_MS_), no puede haber mas de un corte.
 *  - Si el archivo o la ancla cayeron entre las 04:00 y las 05:00 no se sabe en que dia estaba el servidor: se devuelve
 *    {revision} y el archivo queda sin etiquetar para que lo revise la usuaria.
 *  - La semana (sectionIndex) sube o baja cuando el nuevo periodIndex cruza un multiplo de 7.
 *  - Si el dia nuevo es el primer dia de una temporada (primer lunes del mes), el periodIndex es 0 y la semana 0; si es
 *    el ultimo de la anterior, el largo de esa temporada sale del calendario (del primer lunes anterior a este).
 * Funcion pura (no toca Drive): se puede probar fuera de Apps Script.
 * @param {{real:Date, sectionIndex:number, periodIndex:number}} ancla
 * @param {Date} fecha Fecha de creacion del archivo que toma prestado.
 * @return {{sectionIndex:number, periodIndex:number, cortes:number, temporada:?number}|{revision:string}}
 */
function _ajustarPeriodoPrestado_(ancla, fecha, corte) {
  // PF080: "corte" ({desdeH, hastaH}, horas de Lima) es la hora real del cambio de dia estimada con las anclas del clan
  // (_estimarCorteDiario_). Si es null se usa la ventana fija 04:00-05:00 de siempre. Fuera de la ventana el dia de juego
  // es el mismo con cualquier hora de corte entre desdeH y hastaH (los extremos quedan a cada lado del punto medio).
  var cH = corte ? (corte.desdeH + corte.hastaH) / 2 : VERIF_CAMBIO_DESDE_H_;
  var ventana = corte ? ('entre las ' + _fmtHoraH_(corte.desdeH) + ' y las ' + _fmtHoraH_(corte.hastaH)) : 'entre las 04:00 y las 05:00';
  if (_enVentanaCorte_(fecha, corte)) {
    return { revision: 'creado ' + ventana + ' (Lima): no se sabe en que dia de juego estaba el servidor' };
  }
  if (_enVentanaCorte_(ancla.real, corte)) {
    return { revision: 'la captura de la que tomaria el periodIndex se guardo ' + ventana + ' (Lima): no se sabe en que dia de juego estaba' };
  }

  var cortes = _diaJuegoNum_(fecha, cH) - _diaJuegoNum_(ancla.real, cH);
  var s = ancla.sectionIndex;
  var p = ancla.periodIndex;

  if (cortes === 0) {
    return { sectionIndex: s, periodIndex: p, cortes: 0, temporada: null };
  }
  if (Math.abs(cortes) > 1) {
    return { revision: 'hay ' + Math.abs(cortes) + ' cortes de las 04:00 entre el archivo y la captura de la que tomaria el periodIndex' };
  }

  var nuevoP, nuevoS;
  if (cortes === 1) {
    if (_esInicioDeTemporada_(fecha, cH)) {
      nuevoP = 0; nuevoS = 0; // primer dia de la temporada nueva
    } else {
      nuevoP = p + 1;
      nuevoS = s + Math.floor(nuevoP / 7) - Math.floor(p / 7);
    }
  } else { // cortes === -1
    if (_esInicioDeTemporada_(ancla.real, cH)) {
      // El archivo es del ultimo dia de la temporada anterior: su largo sale del calendario.
      var d = _diaJuegoFecha_(ancla.real, cH);
      var anio = d.getUTCFullYear(), mes0 = d.getUTCMonth();
      var anioAnt = mes0 === 0 ? anio - 1 : anio, mesAnt0 = mes0 === 0 ? 11 : mes0 - 1;
      var largo = Math.round((Date.UTC(anio, mes0, _primerLunesDia_(anio, mes0)) -
        Date.UTC(anioAnt, mesAnt0, _primerLunesDia_(anioAnt, mesAnt0))) / 86400000);
      nuevoP = largo - 1;
      nuevoS = Math.floor(nuevoP / 7);
    } else if (p === 0) {
      return { revision: 'la captura de la que tomaria el periodIndex dice periodIndex 0 pero su dia de juego no es un primer lunes: no cuadra con el calendario' };
    } else {
      nuevoP = p - 1;
      nuevoS = s + Math.floor(nuevoP / 7) - Math.floor(p / 7);
    }
  }

  // Temporada del DIA DE JUEGO del archivo (no la de la fecha de calendario).
  var temporada = _temporadaDeFecha_(new Date(fecha.getTime() - cH * 3600 * 1000));
  return { sectionIndex: nuevoS, periodIndex: nuevoP, cortes: cortes, temporada: temporada };
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
 * Quita un tag "T-<n> S-<n> P.I-<n> " o "T-<n> S-<n> P.I-<n>-<letra> "
 * existente al inicio de un segmento de nombre, si lo trae (para poder
 * re-analizar/re-etiquetar archivos que ya pasaron por migrarFormatoJSON()
 * en una ejecución anterior sin apilar tags ni romper el agrupamiento por
 * captura). La letra opcional es la del día de guerra (L M X J V S D, ver
 * _letraDiaGuerra_ en 05_Migrador_Formato.gs). [→ Contexto_Base_Web.md §PF074]
 * @param {string} segmento
 * @return {string}
 */
function _quitarTagExistente_(segmento) {
  return segmento.replace(/^T-\d+\s+S-\d+\s+P\.I-\d+(?:-[LMXJVSD])?\s+/, '');
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

// --- ARCHIVO: 07_Cache_Periodos_JSON.gs ---
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

// --- ARCHIVO: 08_GitHub.gs ---
// =============================================================================
// 08_GitHub.gs
// Sincronización con GitHub (repo GrupoTerna/Backend).
//
//  - _githubSincronizar_(nombre): sube a GitHub, en UN solo commit, los .gs
//    sueltos (Base/src/ o Generador/src/), el consolidado de respaldo
//    (respaldo/<nombre>.gs), INDICE_FUNCIONES.md y LEEME_IA.md.
//  - _githubTraerAProyectoApps_(nombre): lee <Nombre>/src/ de GitHub y deja el
//    proyecto de Apps Script de Base (o del propio Generador) EXACTAMENTE igual
//    (reemplazo atómico).
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
 *
 * SIN CAMBIOS = SIN COMMIT: si lo que se iba a escribir es idéntico a lo que ya hay en GitHub,
 * NO crea el commit y devuelve { commit: null, sinCambios: true }. Como el consolidado
 * (respaldo/<Nombre>.gs) trae en su primera línea la fecha de generación, que cambia en cada
 * ejecución, se compara sin esa línea; si es lo único distinto, se conserva el archivo remoto.
 * Quien llama debe informar el caso en el log (ver _githubSincronizar_).
 */
function _githubCommitArchivos_(entradas, prefijoCarpeta, rutasAntiguas, mensaje) {
  var ref = _ghJson_(_ghReq_('get', '/git/ref/heads/' + GITHUB_BRANCH_));
  var commitSha = ref.object.sha;
  var commit = _ghJson_(_ghReq_('get', '/git/commits/' + commitSha));
  var treeBaseSha = commit.tree.sha;
  var arbol = _ghJson_(_ghReq_('get', '/git/trees/' + treeBaseSha + '?recursive=1'));

  // El consolidado trae la fecha de generación en su primera línea: si es lo único que cambió,
  // se reutiliza el contenido que ya está en GitHub para que no cuente como cambio.
  var reFechaConsolidado = /\/\* CÓDIGO CONSOLIDADO GENERADO EL [^*]*\*\//;
  entradas.forEach(function(e) {
    if (!/\/respaldo\/[^\/]+\.gs$/.test(e.path)) return;
    var nodo = (arbol.tree || []).filter(function(n) { return n.type === 'blob' && n.path === e.path; })[0];
    if (!nodo) return;
    var rq = _ghReq_('get', '/git/blobs/' + nodo.sha, null, 'application/vnd.github.raw+json');
    var viejo = _ghRespuesta_(UrlFetchApp.fetchAll([rq])[0], rq).getContentText('UTF-8');
    if (viejo.replace(reFechaConsolidado, '') === e.content.replace(reFechaConsolidado, '')) e.content = viejo;
  });

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
  if (arbolNuevo.sha === treeBaseSha) {
    return { commit: null, sinCambios: true, archivos: entradas.length, borrados: [] };
  }
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

    if (res.sinCambios) {
      var detalleSin = 'Sin cambios: GitHub ya estaba igual a ' + nombreBase + ' (' + res.archivos +
                       ' archivos revisados). No se creó commit.';
      console.log('[GitHub] ' + detalleSin);
      _registrarLogGenerador('_githubSincronizar_() / ' + nombreBase, detalleSin, []);
      return { ok: true, commit: null, sinCambios: true, borrados: [] };
    }

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
function _githubTraerAProyectoApps_(nombreBase, forzar) {
  if (nombreBase !== 'Base' && nombreBase !== 'Generador') {
    throw 'Nombre de proyecto no válido para traer desde GitHub: ' + nombreBase;
  }
  if (!_githubToken_()) throw 'Falta la propiedad GITHUB_TOKEN en las propiedades del script.';

  var scriptId = _scriptIdDeProyecto_(nombreBase);
  var actuales = _archivosDelProyecto_(nombreBase);

  // 1. Respaldo previo en Drive: UN solo archivo, "Base_antes_de_GitHub.zip", que se
  //    reemplaza en cada ejecución (la fecha queda en su descripción). Se crea la copia
  //    nueva primero y solo después se mandan a la papelera las anteriores.
  _descargarProyectoAArchivos(nombreBase);
  var carpeta = _carpetaDeRespaldos_(nombreBase);
  var nombreRespaldo = nombreBase + '_antes_de_GitHub.zip';
  var sello = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
  var zips = carpeta.getFilesByName(nombreBase + '.zip');
  if (zips.hasNext()) {
    var copia = zips.next().makeCopy(nombreRespaldo + '.tmp', carpeta);
    var anteriores = carpeta.getFilesByName(nombreRespaldo);
    while (anteriores.hasNext()) anteriores.next().setTrashed(true);
    copia.setName(nombreRespaldo);
    copia.setDescription('Estado de ' + nombreBase + ' justo antes de traer GitHub: ' + sello + ' (Lima)');
  }

  // 2. Leer <Nombre>/src/ de GitHub.
  var arbol = _ghJson_(_ghReq_('get', '/git/trees/' + GITHUB_BRANCH_ + '?recursive=1'));
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
  _descargarProyectoAArchivos(nombreBase);
  _githubSincronizar_(nombreBase);

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

// --- ARCHIVO: 09_ReadmeGenerador.gs ---
// =============================================================================
// 09_ReadmeGenerador.gs
// Mantiene al día ReadMe_Generador.md (subcarpeta "Generador" de Drive) cada vez
// que se descarga o se sube el Generador.
//
// Solo reescribe el bloque que está entre estas dos marcas dentro del README:
//     <!-- AUTO:INICIO ... -->
//     <!-- AUTO:FIN -->
// El resto del README (el texto que escribes tú o una IA) no se toca, salvo la
// línea "_Última actualización: ..._". El bloque contiene lo que se desactualiza
// solo: las funciones que se ejecutan a mano (leídas de 01_Principal.gs) y la
// lista real de archivos del proyecto. Si hay un archivo que el texto manual
// no menciona, lo avisa dentro del bloque.
//
// Si ReadMe_Generador.md no existe en la subcarpeta, NO lo crea (para no
// generar duplicados): se omite y queda anotado en el log de ejecución.
// =============================================================================

var README_GENERADOR_NOMBRE_ = 'ReadMe_Generador.md';
var README_MARCA_INICIO_ = '<!-- AUTO:INICIO';
var README_MARCA_FIN_    = '<!-- AUTO:FIN -->';
var README_LINEA_INICIO_ = '<!-- AUTO:INICIO (lo escribe 09_ReadmeGenerador.gs en cada descarga/subida del Generador; no edites entre las marcas) -->';

/**
 * Funciones públicas (sin "_" al final) de un archivo, con la primera frase de
 * su comentario /** ... *\/ si lo tienen. Solo funciones al inicio de línea.
 */
function _readmeFuncionesManuales_(fuente) {
  var lineas = String(fuente || '').split('\n');
  var res = [];
  for (var i = 0; i < lineas.length; i++) {
    var m = /^function\s+([A-Za-z0-9]+)\s*\(/.exec(lineas[i]);
    if (!m) continue;
    var desc = '';
    var j = i - 1;
    if (j >= 0 && /\*\/\s*$/.test(lineas[j])) {
      var k = j;
      while (k >= 0 && !/\/\*\*/.test(lineas[k])) k--;
      if (k >= 0) {
        var texto = lineas.slice(k, j + 1).join('\n')
          .replace(/^\s*\/\*\*/, '').replace(/\*\/\s*$/, '')
          .split('\n')
          .map(function(l) { return l.replace(/^\s*\*\s?/, '').trim(); })
          .join(' ').replace(/\s+/g, ' ').trim();
        var corte = /\.\s/.exec(texto);
        desc = corte ? texto.substring(0, corte.index + 1) : texto;
        if (desc.length > 260) desc = desc.substring(0, 257) + '...';
      }
    }
    res.push({ nombre: m[1], desc: desc });
  }
  return res;
}

function _readmeGrupo_(nombre) {
  if (/^subirBase/.test(nombre))      return 'Subir (Base)';
  if (/^subirGenerador/.test(nombre)) return 'Subir (Generador)';
  if (/^descargar/.test(nombre))      return 'Descargar';
  return 'Mantenimiento y otras';
}

/**
 * Devuelve el texto del README con el bloque automático reemplazado (o añadido
 * al final si todavía no tiene marcas) y la línea de "Última actualización"
 * al día. Función pura: no toca Drive.
 * @param {string} texto     contenido actual del README
 * @param {Array}  archivos  archivos del proyecto ({name, type, source})
 * @param {string} fuente01  código de 01_Principal.gs
 * @param {string} fechaHora "dd/MM/yyyy HH:mm"
 */
function _readmeAplicarBloque_(texto, archivos, fuente01, fechaHora) {
  var i = texto.indexOf(README_MARCA_INICIO_);
  var j = texto.indexOf(README_MARCA_FIN_);
  var tieneMarcas = (i >= 0 && j > i);
  var manual = tieneMarcas
    ? texto.substring(0, i) + texto.substring(j + README_MARCA_FIN_.length)
    : texto;

  var b = [];
  b.push(README_LINEA_INICIO_);
  b.push('_Bloque actualizado el ' + fechaHora + ' (Lima)._');
  b.push('');
  b.push('### Funciones que se ejecutan manualmente (`01_Principal.gs`)');
  b.push('');
  var funciones = _readmeFuncionesManuales_(fuente01);
  var ordenGrupos = ['Subir (Base)', 'Subir (Generador)', 'Descargar', 'Mantenimiento y otras'];
  ordenGrupos.forEach(function(g) {
    var del = funciones.filter(function(f) { return _readmeGrupo_(f.nombre) === g; });
    if (!del.length) return;
    b.push('**' + g + '**');
    b.push('');
    del.forEach(function(f) { b.push('- `' + f.nombre + '()`' + (f.desc ? ' — ' + f.desc : '')); });
    b.push('');
  });

  b.push('### Archivos actuales del proyecto');
  b.push('');
  b.push('| Archivo | Líneas | Funciones |');
  b.push('|---|---|---|');
  var sinMencion = [];
  archivos.slice().sort(function(a, c) { return a.name < c.name ? -1 : (a.name > c.name ? 1 : 0); })
    .forEach(function(a) {
      var etiqueta = a.name + (a.type === 'JSON' ? '.json' : (a.type === 'HTML' ? '.html' : '.gs'));
      var src = String(a.source || '');
      var nFn = (src.match(/^(?:async\s+)?function\s+[A-Za-z0-9_$]+\s*\(/gm) || []).length;
      b.push('| `' + etiqueta + '` | ' + (src.split('\n').length) + ' | ' + nFn + ' |');
      if (manual.indexOf(etiqueta) === -1) sinMencion.push(etiqueta);
    });
  b.push('');
  if (sinMencion.length) {
    b.push('> ⚠️ Este README todavía no describe: ' + sinMencion.map(function(n) { return '`' + n + '`'; }).join(', ') +
           '. Pide que se actualice la sección "Archivos del proyecto".');
    b.push('');
  }
  b.push(README_MARCA_FIN_);
  var bloque = b.join('\n');

  var resultado;
  if (tieneMarcas) {
    resultado = texto.substring(0, i) + bloque + texto.substring(j + README_MARCA_FIN_.length);
  } else {
    resultado = texto.replace(/\s*$/, '') + '\n\n' + bloque + '\n';
  }
  var dia = fechaHora.split(' ')[0];
  resultado = resultado.replace(/_Última actualización:[^\n]*_/, '_Última actualización: ' + dia + ' (Lima)_');
  return resultado;
}

/**
 * Actualiza ReadMe_Generador.md en Drive. NUNCA lanza error (una falla aquí no
 * debe romper la descarga/subida); lo deja en el log y devuelve { ok:false }.
 */
function _actualizarReadmeGenerador_() {
  try {
    var carpeta = _carpetaDeRespaldos_('Generador');
    var it = carpeta.getFilesByName(README_GENERADOR_NOMBRE_);
    if (!it.hasNext()) {
      console.log('[README] No existe ' + README_GENERADOR_NOMBRE_ + ' en la subcarpeta "Generador": se omite (no se crea para evitar duplicados).');
      return { ok: false, omitido: true };
    }
    var archivo = it.next();
    if (it.hasNext()) console.warn('[README] Hay más de un ' + README_GENERADOR_NOMBRE_ + ' en la carpeta; se actualiza solo el primero.');

    var archivos = _archivosDelProyecto_('Generador');
    var principal = archivos.filter(function(a) { return a.name === '01_Principal'; })[0];
    var textoActual = archivo.getBlob().getDataAsString('UTF-8');
    var fecha = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm');
    var nuevo = _readmeAplicarBloque_(textoActual, archivos, principal ? principal.source : '', fecha);

    archivo.setContent(nuevo);
    console.log('[README] ' + README_GENERADOR_NOMBRE_ + ' actualizado (' + fecha + ').');
    return { ok: true };
  } catch (e) {
    var msg = (e && e.message) ? e.message : String(e);
    console.error('[README] ' + msg);
    return { ok: false, error: msg };
  }
}

// --- ARCHIVO: 10_Verificar_PeriodIndex_JSON.gs ---
// =============================================================================
// 10_Verificar_PeriodIndex_JSON.gs
// Verificación de SOLO LECTURA de los respaldos JSON de cada clan: comprueba
// que el tag del nombre ("T-.. S-.. P.I-..[-letra]") coincida con lo que
// dice el CONTENIDO del currentriverrace.json y con su FECHA DE CREACIÓN en
// Drive. No renombra, no mueve y no borra nada.
//
// POR QUÉ NO SE CONFÍA EN EL NOMBRE
// ----------------------------------------------------------------------------
// Ya hubo nombres con temporadas que todavía no existían (futuras) y hubo que
// corregirlos. Por eso la verdad es, en este orden:
//   1) el contenido del currentriverrace.json (periodIndex y sectionIndex,
//      PRIMERA mención dentro del archivo, ver _leerPeriodo_ en 06);
//   2) la fecha de CREACIÓN del archivo (getDateCreated, no la de
//      modificación: el escritor de Base reescribe el contenido del mismo
//      archivo durante todo el periodo, así que la modificación avanza);
//   3) el nombre, solo como lo que se está verificando.
//
// VENTANA DE 04:00 A 05:00 (LIMA)
// ----------------------------------------------------------------------------
// Cada clan cambia de periodIndex dentro de esa hora (09:00-10:00 UTC, ver
// BLG_VENTANA_CAMBIO_UTC en 18_CorreccionGuerra.gs de Base). Una captura
// creada dentro de la ventana puede pertenecer al día anterior o al nuevo, así
// que la FECHA no decide: se acepta cualquiera de los dos días y decide el
// periodIndex del contenido. Fuera de la ventana, el día de la fecha tiene que
// coincidir con el día del periodIndex (periodIndex % 7, ver _letraDiaGuerra_
// en 05_Migrador_Formato.gs).
//
// Lima es UTC-5 todo el año (Perú no tiene horario de verano), por eso la
// conversión es un desplazamiento fijo y no depende de Utilities.
//
// Requiere 04, 05, 06 y 07 en el mismo proyecto. Registro del diseño y de lo
// comprobado: [→ Contexto_Base_Web.md §PF074].
// =============================================================================

/** @const {number} Lima es UTC-5 fijo. */
var VERIF_LIMA_OFFSET_H_ = 5;

/** @const {number} Hora Lima en que, como pronto, un clan cambia de día de guerra. */
var VERIF_CAMBIO_DESDE_H_ = 4;

/** @const {number} Hora Lima en que, como tarde, todos los clanes ya cambiaron. */
var VERIF_CAMBIO_HASTA_H_ = 5;

/** @const {RegExp} Tag del nombre: T-nn  S-nn P.I-nn[-letra] y el resto. */
var VERIF_REGEX_TAG_ = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(?:-([LMXJVSD]))?\s/;

/** @const {number} Máximo de líneas de detalle que se escriben en el log del Generador. */
var VERIF_MAX_LINEAS_LOG_ = 60;

/**
 * Punto de entrada manual. Recorre cada carpeta de clan (sueltos y
 * subcarpetas CurrentRiverRace / Clans) y verifica cada currentriverrace.json
 * y cada clans.json. Es de solo lectura; guarda el cache de periodos (07) para
 * que una segunda corrida sea rápida si la primera se corta por tiempo.
 *
 * @return {{revisados:number, ok:number, faltaLetra:number, ventana:number,
 *   problemas:Array<string>, sinVerificar:Array<string>, completo:boolean}}
 */
function verificarPeriodIndexJSON() {
  var inicio = new Date().getTime();
  var cache = _cache_cargar_();
  var r = { revisados: 0, ok: 0, faltaLetra: 0, ventana: 0, problemas: [], sinVerificar: [], completo: true };

  console.log('═══════════════════════════════════════════════════════');
  console.log('verificarPeriodIndexJSON() — ' + _mig_horaLima(new Date()) + ' — SOLO LECTURA');
  console.log('Cache de periodos: ' + Object.keys(cache).length + ' archivos ya leídos.');
  console.log('═══════════════════════════════════════════════════════');

  var claves = Object.keys(CARPETAS_CLAN_);
  for (var c = 0; c < claves.length && r.completo; c++) {
    // PF074: se revisan juntas las carpetas del esquema ACTUAL (endpoint -> clan) y la vieja de cada clan.
    var carpeta = { getName: function() { return claves[c]; } }; // solo para los mensajes
    console.log('── ' + carpeta.getName() + ' ──');
    var archivos = _archivosDeClan_(claves[c]);

    for (var i = 0; i < archivos.length; i++) {
      if (_mig_tiempoAgotado_(inicio)) { r.completo = false; break; }
      var f = archivos[i];
      var nombre = f.getName();
      var esRiver = / - currentriverrace\.json$/i.test(nombre);
      var esClans = / - clans\.json$/i.test(nombre);
      if (!esRiver && !esClans) continue;

      var idPeriodo = null;
      if (esRiver) {
        idPeriodo = _verif_periodoDeArchivo_(f, cache);
        if (!idPeriodo) {
          r.sinVerificar.push('[' + carpeta.getName() + '] ' + nombre + ' [no se pudo leer el contenido]');
          continue;
        }
      }

      var v = _verif_comparar_(nombre, idPeriodo, f.getDateCreated(), new Date());
      r.revisados++;
      if (v.problemas.length) {
        r.problemas.push('[' + carpeta.getName() + '] ' + nombre + ' → ' + v.problemas.join(' | '));
      } else if (v.estado === 'ventana') {
        r.ventana++;
      } else if (v.estado === 'falta-letra') {
        r.faltaLetra++;
      } else {
        r.ok++;
      }
      if (v.avisos.length) {
        r.sinVerificar.push('[' + carpeta.getName() + '] ' + nombre + ' → ' + v.avisos.join(' | '));
      }
    }
    _cache_guardar_(cache);
  }

  _cache_guardar_(cache);
  _verif_imprimirResumen_(r);
  return r;
}

/**
 * Lee (o toma del cache de 07) el sectionIndex/periodIndex de un
 * currentriverrace.json. Misma lógica y misma forma de cache que
 * _analizarCarpetaJSON_ en 06.
 * @param {File} archivo
 * @param {Object} cache
 * @return {?{sectionIndex:number, periodIndex:number}}
 */
function _verif_periodoDeArchivo_(archivo, cache) {
  var id = archivo.getId();
  var cacheado = cache[id];
  if (cacheado) return { sectionIndex: cacheado.s, periodIndex: cacheado.p };

  var idPeriodo = _leerPeriodo_(archivo);
  if (idPeriodo) {
    cache[id] = { s: idPeriodo.sectionIndex, p: idPeriodo.periodIndex, t: archivo.getSize() };
  }
  return idPeriodo;
}

/**
 * Índice del día de la semana (0 = lunes … 6 = domingo) de un instante, en
 * hora de Lima, restándole "desplazH" horas antes de mirar el día (el día de
 * guerra empieza a las 04:00-05:00 Lima, no a medianoche).
 * @param {Date} fecha
 * @param {number} desplazH
 * @return {number}
 */
function _verif_indiceDiaLima_(fecha, desplazH) {
  var ms = fecha.getTime() - (VERIF_LIMA_OFFSET_H_ + desplazH) * 3600 * 1000;
  return (new Date(ms).getUTCDay() + 6) % 7; // getUTCDay: 0 = domingo
}

/** @return {boolean} true si la hora de Lima de "fecha" cae dentro de [04:00, 05:00). */
function _verif_enVentanaCambio_(fecha) {
  var h = new Date(fecha.getTime() - VERIF_LIMA_OFFSET_H_ * 3600 * 1000).getUTCHours();
  return h >= VERIF_CAMBIO_DESDE_H_ && h < VERIF_CAMBIO_HASTA_H_;
}

/**
 * Compara el nombre de un archivo con su contenido y su fecha de creación.
 * Es una función pura (no toca Drive), pensada para poder probarse fuera de
 * Apps Script.
 *
 * @param {string} nombre Nombre completo del archivo.
 * @param {?{sectionIndex:number, periodIndex:number}} idPeriodo Lo que dice el
 *   contenido; null para clans.json (que no trae periodIndex propio): en ese
 *   caso solo se compara el P.I del nombre contra la fecha de creación.
 * @param {Date} creada Fecha de CREACIÓN en Drive.
 * @param {Date} ahora Para detectar temporadas que todavía no existen.
 * @return {{estado:string, problemas:Array<string>, avisos:Array<string>}}
 *   estado: 'ok' | 'falta-letra' | 'ventana' | 'problema'.
 */
function _verif_comparar_(nombre, idPeriodo, creada, ahora) {
  var problemas = [];
  var avisos = [];
  var m = VERIF_REGEX_TAG_.exec(nombre);

  if (!m) {
    return { estado: 'problema', problemas: ['sin tag T-/S-/P.I- en el nombre'], avisos: [] };
  }

  var tNombre = parseInt(m[1], 10);
  var sNombre = parseInt(m[2], 10);
  var pNombre = parseInt(m[3], 10);
  var letraNombre = m[4] || '';

  // El periodIndex que manda: el del contenido; si no hay (clans.json), el del
  // nombre, que entonces solo se puede contrastar con la fecha.
  var pReal = idPeriodo ? idPeriodo.periodIndex : pNombre;
  var letraReal = _letraDiaGuerra_(pReal);

  if (idPeriodo) {
    if (pNombre !== idPeriodo.periodIndex) {
      problemas.push('P.I del nombre ' + pNombre + ' ≠ periodIndex del contenido ' + idPeriodo.periodIndex);
    }
    if (sNombre !== idPeriodo.sectionIndex + 1) {
      problemas.push('S del nombre ' + sNombre + ' ≠ sectionIndex+1 del contenido ' + (idPeriodo.sectionIndex + 1));
    }
  }
  // Con idPeriodo === null (clans.json) no hay contenido que contrastar: solo
  // se compara el P.I del nombre con la fecha de creación (más abajo). No se
  // agrega un aviso por archivo para no llenar el reporte; lo dice el resumen.

  if (letraNombre && letraNombre !== letraReal) {
    problemas.push('letra del nombre ' + letraNombre + ' ≠ letra del periodIndex ' + pReal + ' (' + letraReal + ')');
  }

  // Fecha de creación contra el día del periodIndex, con la ventana 04:00-05:00.
  var dia4 = _verif_indiceDiaLima_(creada, VERIF_CAMBIO_DESDE_H_);
  var dia5 = _verif_indiceDiaLima_(creada, VERIF_CAMBIO_HASTA_H_);
  var diaReal = pReal % 7;
  var enVentana = _verif_enVentanaCambio_(creada);

  if (enVentana) {
    if (diaReal !== dia4 && diaReal !== dia5) {
      problemas.push('creado dentro de la ventana 04:00-05:00 y el día del periodIndex (' + letraReal +
        ') no es ni ' + LETRAS_DIA_GUERRA_.charAt(dia5) + ' ni ' + LETRAS_DIA_GUERRA_.charAt(dia4));
    }
  } else if (diaReal !== dia4) {
    problemas.push('la fecha de creación cae en ' + LETRAS_DIA_GUERRA_.charAt(dia4) +
      ' pero el periodIndex ' + pReal + ' es ' + letraReal);
  }

  // Temporada: tiene que ser la que corresponde a la fecha de creación y no
  // una que todavía no existe. La fecha se prueba con y sin el desplazamiento
  // de las 05:00 para no marcar capturas pegadas al reinicio del lunes.
  var tFecha = _temporadaDeFecha_(creada);
  var tFecha5 = _temporadaDeFecha_(new Date(creada.getTime() - VERIF_CAMBIO_HASTA_H_ * 3600 * 1000));
  if (tNombre !== tFecha && tNombre !== tFecha5) {
    problemas.push('T del nombre ' + tNombre + ' ≠ temporada de la fecha de creación ' + tFecha);
  }
  if (tNombre > _temporadaDeFecha_(ahora)) {
    problemas.push('T del nombre ' + tNombre + ' es una temporada que todavía no existe');
  }

  var estado;
  if (problemas.length) estado = 'problema';
  else if (!letraNombre) estado = 'falta-letra';
  else if (enVentana) estado = 'ventana';
  else estado = 'ok';

  return { estado: estado, problemas: problemas, avisos: avisos };
}

/** Escribe el resumen en la consola y deja una entrada en el log del Generador. */
function _verif_imprimirResumen_(r) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('RESUMEN (solo lectura, no se renombró nada):');
  console.log('  Revisados                          : ' + r.revisados);
  console.log('  Correctos (con letra)              : ' + r.ok);
  console.log('  Correctos, creados en 04:00-05:00  : ' + r.ventana);
  console.log('  Correctos pero sin letra todavía   : ' + r.faltaLetra + '  (los arregla migrarFormatoJSON, salvo un clans.json sin currentriverrace cercano)');
  console.log('  Con problemas                      : ' + r.problemas.length);
  console.log('  Avisos / sin poder verificar       : ' + r.sinVerificar.length);
  console.log('  (clans.json no trae periodIndex: solo se contrastó su P.I del nombre con la fecha de creación)');
  if (!r.completo) {
    console.log('  ⏸ Se cortó por tiempo: vuelve a ejecutar verificarPeriodIndexJSON(); el cache ya guardó lo leído.');
  }
  r.problemas.forEach(function(l) { console.log('  ✘ ' + l); });
  r.sinVerificar.forEach(function(l) { console.log('  · ' + l); });
  console.log('═══════════════════════════════════════════════════════');

  var lineas = r.problemas.concat(r.sinVerificar);
  var recorte = lineas.slice(0, VERIF_MAX_LINEAS_LOG_);
  if (lineas.length > recorte.length) {
    recorte.push('… y ' + (lineas.length - recorte.length) + ' más (ver la consola de la ejecución).');
  }
  _registrarLogGenerador(
    'verificarPeriodIndexJSON()',
    'Verificación de solo lectura. Revisados: ' + r.revisados + ', correctos: ' + (r.ok + r.ventana) +
    ', sin letra: ' + r.faltaLetra + ', con problemas: ' + r.problemas.length +
    ', avisos: ' + r.sinVerificar.length + (r.completo ? '.' : ' (incompleta: se cortó por tiempo).'),
    recorte
  );
}


