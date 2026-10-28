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

/* CÓDIGO CONSOLIDADO GENERADO EL 28/10/2026 00:24:22 */



// --- ARCHIVO: 01_Principal.gs ---
// =============================================================================
// 01_Principal.gs
// Punto de entrada: solo las funciones que ejecutas manualmente desde el editor.
// Orden: 1) subidas, 2) descargas, 3) mantenimiento.
// Comentario de prueba para obtener el archivo modificado desde Github
// =============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): este archivo no tiene constantes ni variables globales; por partes:
//  Parte 1 — Funciones que se corren a mano (todas las de este archivo), en este orden, y en cada grupo Base, Generador y Contactos_Secundario:
//    1) Subidas: primero las de GitHub (normal y forzada), luego zip, txt, gs y md
//    2) Descargas: normal y forzada
//    3) Mantenimiento (uso ocasional / peligroso)
//  Parte 2 — Funciones que no se corren a mano: ninguna
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// =============================================================================
// 1) SUBIDAS (primero las de GitHub)
// =============================================================================

// ----- Subidas a Base (primero GitHub, luego zip, txt, gs y md) -----
// SUBIDA A BASE (Funciones independientes por tipo de archivo)
// "Subir" y "actualizar" ya NO son cosas distintas: cada función de
// aquí sube el formato indicado al proyecto real de "Base" Y, en el
// mismo paso, regenera automáticamente los otros 3 respaldos
// (Base.zip/.gs/.txt/.md) para que ninguno quede desactualizado
// respecto al código recién subido. subirBaseDesdeZip() además
// conserva el paso opcional de crear/actualizar la hoja "Sistema"
// (ver el interruptor CREAR_O_ACTUALIZAR_HOJA_SISTEMA en 02_Backstage.gs),
// que antes vivía en la ya eliminada ejecutarTodoElProceso().

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

// ----- Subidas al Generador (primero GitHub, luego zip, txt, gs y md) -----
// SUBIDA AL GENERADOR (Funciones independientes por tipo de archivo)
// Mismo comportamiento que arriba: subir cualquier formato del
// Generador sincroniza automáticamente los otros 3 (Generador.zip/
// .gs/.txt/.md), sin pasos adicionales.

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

// ----- Subidas a Contactos_Secundario (primero GitHub, luego zip, txt, gs y md) -----
// CONTACTOS_SECUNDARIO (proyecto de Apps Script de la cuenta secundaria, 23-oct-2026)
// Mismas funciones que Base y Generador: descargar (Apps Script -> Drive + GitHub),
// subir desde zip/txt/gs/md y subir desde GitHub. Carpeta en GitHub: Contactos_Secundario/src/.
// REQUISITOS: (1) propiedad SCRIPT_ID_CONTACTOS_SECUNDARIO en las Propiedades del script de
// este proyecto (el ID no va en el código); (2) el proyecto secundario compartido con la cuenta
// del Generador como editor. La PRIMERA vez corre descargarContactos(), para que GitHub traiga
// también el appsscript.json real (servicio People) antes de usar subirContactosDesdeGithub().

/**
 * Sube Contactos_Secundario/src/ de GitHub: deja el proyecto de Apps Script de la cuenta secundaria
 * EXACTAMENTE igual (lo que no esté en GitHub se elimina del proyecto). Antes guarda en Drive
 * "Contactos_Secundario_antes_de_GitHub.zip" y al terminar regenera los respaldos.
 */
function subirContactosDesdeGithub() {
  return _githubTraerAProyectoApps_('Contactos_Secundario', false);
}

/** Igual que subirContactosDesdeGithub(), pero sin la salvaguarda de "src/ incompleta". */
function subirContactosDesdeGithubForzado() {
  return _githubTraerAProyectoApps_('Contactos_Secundario', true);
}

/** Sube Contactos_Secundario.zip y sincroniza Contactos_Secundario.zip/.gs/.txt/.md */
function subirContactosDesdeZip() {
  var reporte = _subirArchivosAProyecto('Contactos_Secundario', 'zip');
  _githubSincronizar_('Contactos_Secundario');
  return reporte;
}

/** Sube Contactos_Secundario.txt y sincroniza Contactos_Secundario.zip/.gs/.txt/.md */
function subirContactosDesdeTxt() {
  var reporte = _subirArchivosAProyecto('Contactos_Secundario', 'txt');
  _githubSincronizar_('Contactos_Secundario');
  return reporte;
}

/** Sube Contactos_Secundario.gs y sincroniza Contactos_Secundario.zip/.gs/.txt/.md */
function subirContactosDesdeGs() {
  var reporte = _subirArchivosAProyecto('Contactos_Secundario', 'gs');
  _githubSincronizar_('Contactos_Secundario');
  return reporte;
}

/** Sube Contactos_Secundario.md y sincroniza Contactos_Secundario.zip/.gs/.txt/.md */
function subirContactosDesdeMd() {
  var reporte = _subirArchivosAProyecto('Contactos_Secundario', 'md');
  _githubSincronizar_('Contactos_Secundario');
  return reporte;
}

// =============================================================================
// 2) DESCARGAS
// =============================================================================

// ----- Descargas de Base -----
// DESCARGA (zip + txt + gs + md, siempre los 4 a la vez)
// Además sincroniza GitHub (08_GitHub.gs): .gs sueltos en <Nombre>/src/,
// consolidado en <Nombre>/respaldo/, INDICE_FUNCIONES.md, Indice_<Nombre>.md y LEEME_IA.md.
// Si no hay GITHUB_TOKEN en las propiedades del script, GitHub se omite.

/** Descarga el código de la hoja "Base" y crea Base.zip, Base.gs, Base.txt y Base.md (y sincroniza GitHub) */
function descargarBase() {
  _descargarProyectoAArchivos('Base');
  _githubSincronizar_('Base');
}

/**
 * Igual que descargarBase(), pero escribe en GitHub aunque haya un "pull pendiente": cambios nuevos
 * en Base/ de GitHub que este proyecto no trajo. Esos cambios de GitHub SE PIERDEN (quedan solo en
 * el historial de git). Úsala solo si quieres que lo de Apps Script pise lo de GitHub.
 */
function descargarBaseForzado() {
  _descargarProyectoAArchivos('Base');
  _githubSincronizar_('Base', true);
}

// ----- Descargas del Generador -----
// DESCARGA (zip + txt + gs + md, siempre los 4 a la vez)

/** Descarga el código del propio "Generador" y crea Generador.zip, Generador.gs, Generador.txt y Generador.md (y actualiza el README y GitHub) */
function descargarGenerador() {
  _descargarProyectoAArchivos('Generador');
  _githubSincronizar_('Generador');
}

/**
 * Igual que descargarGenerador(), pero escribe en GitHub aunque haya un "pull pendiente": cambios
 * nuevos en Generador/ de GitHub que este proyecto no trajo. Esos cambios de GitHub SE PIERDEN
 * (quedan solo en el historial de git). Úsala solo si quieres que lo de Apps Script pise lo de GitHub.
 */
function descargarGeneradorForzado() {
  _descargarProyectoAArchivos('Generador');
  _githubSincronizar_('Generador', true);
}

// ----- Descargas de Contactos_Secundario -----
// Requisitos de Contactos_Secundario: ver el tema de subidas, arriba.

/** Descarga el código del proyecto secundario y crea Contactos_Secundario.zip/.gs/.txt/.md (y sincroniza GitHub) */
function descargarContactos() {
  _descargarProyectoAArchivos('Contactos_Secundario');
  _githubSincronizar_('Contactos_Secundario');
}

/** Igual que descargarContactos(), pero escribe en GitHub aunque haya un "pull pendiente" (lo de GitHub se pierde). */
function descargarContactosForzado() {
  _descargarProyectoAArchivos('Contactos_Secundario');
  _githubSincronizar_('Contactos_Secundario', true);
}

// =============================================================================
// 3) MANTENIMIENTO (uso ocasional / peligroso)
// =============================================================================

// ----- Mantenimiento -----
// MANTENIMIENTO (uso ocasional / peligroso)

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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: ninguna (las que se corren a mano, subirBaseDesdeZip() y las demás, están en 01_Principal.gs y llaman a las de este archivo)
//  Parte 2 — Funciones que no se corren a mano
//    - Subida desde zip, txt, gs o md: entrada y lectura de los archivos (en el orden en que las llama _subirArchivosAProyecto)
//    - Subida: escritura en el proyecto de Apps Script (API; obtenerArchivosProyecto_ la usan también 08, la descarga y el vaciado)
//    - Descarga: respaldos .zip/.txt/.gs/.md e Indice_<Nombre>.md (en el orden en que los arma _descargarProyectoAArchivos)
//    - Vaciado del proyecto de Base
//    - Utilidades compartidas: carpeta de respaldos, hoja de Base, aviso y registro
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var CARPETA_GENERADOR_ID = '1YmgyCh-7Y6DIoScS6lpidQZk3IeDsEGA';
var CARPETA_BASE_ID = '1OmSVruEHm4RlP-7VN3G_M2HublfWK1W8';
var NOMBRE_HOJA_BASE = 'Base';

// Valla de código del Markdown legible (tres comillas inversas). Se escribe con el código \x60 para que ningún .gs contenga esa secuencia: la regla 6 de la skill y el validador de CI la tratan como resto de formato Markdown. Valor: tres comillas inversas seguidas, igual que antes.
var VALLA_MD_ = '\x60\x60\x60';

// Interruptor: si es true, subirBaseDesdeZip() también crea/actualiza una
// hoja "Sistema Clanes - Familia Terna - <fecha>" con el mismo código que
// se sube a Base. Antes vivía en la ya eliminada ejecutarTodoElProceso();
// se conserva aquí con el mismo comportamiento y apagado por defecto.
var CREAR_O_ACTUALIZAR_HOJA_SISTEMA = false;

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Subida desde zip, txt, gs o md: entrada y lectura de los archivos -----

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
    // Formato Markdown legible: encabezados "## archivo.gs" + bloque entre vallas (VALLA_MD_)
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

function nombreBaseDesdeArchivo_(nombreCompleto) {
  var nombre = nombreCompleto;
  while (/\.(gs|js)$/i.test(nombre)) {
    nombre = nombre.replace(/\.(gs|js)$/i, '');
  }
  return nombre;
}

/**
 * Reconstruye la lista de archivos [{nombre, contenido}, ...] a partir del
 * Markdown legible generado por _generarMarkdownLegible_. Busca encabezados
 * "## nombre.gs" seguidos de un bloque entre vallas de tres comillas inversas (VALLA_MD_).
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
      if (i < lineas.length && lineas[i].trim().indexOf(VALLA_MD_) === 0) {
        i++; // saltar la valla de apertura (VALLA_MD_, con o sin «javascript»)
        var contenido = '';
        while (i < lineas.length && lineas[i].trim() !== VALLA_MD_) {
          contenido += lineas[i] + '\n';
          i++;
        }
        i++; // saltar la valla de cierre (VALLA_MD_)
        if (contenido.endsWith('\n')) contenido = contenido.slice(0, -1);
        archivos.push({ nombre: nombre, contenido: contenido });
        continue;
      }
    }
    i++;
  }
  return archivos;
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

// ----- Subida: escritura en el proyecto de Apps Script (API) -----

function actualizarScriptDeHoja(ssId, archivosNuevos, nombreBase) {
  var scriptId;
  if (nombreBase && nombreBase === 'Generador') {
    scriptId = ScriptApp.getScriptId();
  } else if (nombreBase && nombreBase === 'Contactos_Secundario') {
    scriptId = _scriptIdDeProyecto_(nombreBase);
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

// ----- Descarga: respaldos .zip/.txt/.gs/.md e Indice_<Nombre>.md -----

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
  } else if (nombreBase === 'Contactos_Secundario') {
    scriptId = _scriptIdDeProyecto_(nombreBase); // propiedad SCRIPT_ID_CONTACTOS_SECUNDARIO (ver 08_GitHub.gs)
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

  // Desde el 28-oct-2026: cada descarga o subida del Generador actualiza el bloque automático de ReadMe_Generador.md
  // (09_ReadmeGenerador.gs). Nunca lanza error y, si el README no existe en Drive, no lo crea. [→ Contexto_Base_Web.md §PF285]
  if (nombreBase === 'Generador') _actualizarReadmeGenerador_();
}

// FORMATO MARKDOWN LEGIBLE (solo para .md — pensado para que una IA lo lea
// directo, sin descomprimir el ZIP: encabezados "## archivo.gs" + bloque de
// código, en vez del formato "// --- ARCHIVO: ... ---" usado en .txt/.gs.
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
    partes.push(VALLA_MD_ + 'javascript');
    partes.push(a.contenido);
    partes.push(VALLA_MD_);
    partes.push('');
  });
  return partes.join('\n');
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

// ----- Vaciado del proyecto de Base -----

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

// ----- Utilidades compartidas: carpeta de respaldos, hoja de Base, aviso y registro -----

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

function obtenerSpreadsheetPorNombreEnCarpeta_(folderId, nombreHoja) {
  var carpeta = DriveApp.getFolderById(folderId);
  var archivos = carpeta.getFilesByName(nombreHoja);
  if (!archivos.hasNext()) {
    throw 'No se encontró la hoja "' + nombreHoja + '" en la carpeta ' + folderId;
  }
  return archivos.next().getId();
}

/** Antepone el aviso a un texto, solo si todavía no está presente. */
function _conAviso_(texto) {
  if (texto.indexOf(AVISO_ANTI_CARPETAS_) !== -1) return texto;
  return '/*\n' + AVISO_ANTI_CARPETAS_ + '\n*/\n\n' + texto;
}

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


// --- ARCHIVO: 03_RoyaleAPI_Torneos.gs ---
// 03_RoyaleAPI_Torneos.gs
// Lectura de la lista de miembros de un torneo de RoyaleAPI a través de proxies públicos.

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): este archivo no tiene constantes ni variables globales; por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Lectura del torneo vía proxy
//  Parte 2 — Funciones que no se corren a mano
//    - Lectura del torneo vía proxy: ayuda (proxy alternativo)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Lectura del torneo vía proxy -----

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Lectura del torneo vía proxy: ayuda (proxy alternativo) -----

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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Organización de respaldos JSON: drenar la raíz
//  Parte 2 — Funciones que no se corren a mano
//    - Organización de respaldos JSON: motor y ayudas (en el orden en que las llama organizarArchivosJSON; el motor lo usa también 05)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

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

/** Clanes para los que ya se aviso que su carpeta vieja no se puede abrir (un solo aviso por ejecucion). */
var _CARPETA_VIEJA_AVISADA_ = {};

/** Memoria de las carpetas de temporada/semana ya resueltas en esta ejecucion (evita repetir getFoldersByName). */
var _SEMANA_MEM_ = {};

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Organización de respaldos JSON: drenar la raíz -----

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Organización de respaldos JSON: motor y ayudas (en el orden en que las llama organizarArchivosJSON; el motor lo usa también 05) -----

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

function _organizarJSON_tiempoAgotado_(inicio) {
  return (new Date().getTime() - inicio) > ORGANIZAR_LIMITE_MS_;
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

function _organizarJSON_borrarTriggersPendientes_() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === ORGANIZAR_TRIGGER_HANDLER_) {
      ScriptApp.deleteTrigger(t);
    }
  });
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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Migración de formato de los respaldos JSON
//  Parte 2 — Funciones que no se corren a mano
//    - Migración de formato: pasos (en el orden en que los llama migrarFormatoJSON)
//    - Migración de formato: fechas y letra del día (las usan también 06 y 10)
//    - Presupuesto de tiempo, estado persistente y continuación automática
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

/** @const {number} Presupuesto de tiempo por ejecución, en ms.
 *  Deja margen bajo el límite real de Apps Script (~6 min en cuentas
 *  gratuitas/Gmail normales). Si el proyecto es de Google Workspace con
 *  límite de 30 min, se puede subir con confianza (p. ej. a 25 min). */
var MIG_LIMITE_MS_ = 5 * 60 * 1000;

/** @const {string} Clave en PropertiesService para el estado de la migración. */
var MIG_PROP_ESTADO_ = 'MIG_FORMATO_ESTADO_V1';

/** @const {string} Nombre del handler que se re-programa como trigger. */
var MIG_TRIGGER_HANDLER_ = 'migrarFormatoJSON';

/** @const {string} Letras del día de la semana, índice 0 = lunes … 6 = domingo (L M X J V S D). */
var LETRAS_DIA_GUERRA_ = 'LMXJVSD';

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Migración de formato de los respaldos JSON -----

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
 * Paso 3: carpeta de players. El nombre lleva la fecha de CREACIÓN del
 *         archivo (getDateCreated), no la de modificación, y sin sufijo
 *         « - P{n}» (regla de la usuaria, 15-oct-2026). Esos archivos no
 *         llevan tag, porque no tienen sectionIndex/periodIndex propio.
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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Migración de formato: pasos (en el orden en que los llama migrarFormatoJSON) -----

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
    // PF080: con presupuesto de tiempo. Si no alcanza, se pausa y la continuacion automatica sigue (los ya correctos se saltan).
    if (!_migrarCarpetaPlayers(estado.resumen, inicio)) {
      _mig_pausarYContinuar_(estado, cache, 'durante la carpeta players');
      return;
    }
    estado.fase = 'hecho';
  }

  _mig_finalizar_(estado, cache);
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

/**
 * Paso 3: carpeta players. REGLA (la usuaria, 15-oct-2026): el nombre de un JSON de players lleva la fecha de CREACION del
 * archivo en Drive (getDateCreated), nunca la de modificacion; y sin sufijo « - P{n}». Formato:
 * "dd-MM-yyyy HH.mm - {Clan} - {#TAG}.json". Se vuelve a este criterio tras haberlo cambiado por error el mismo dia.
 * PF080: mejoras de tiempo, sin cambiar la regla. (1) Clan y tag se toman del propio nombre (que ya los trae), de modo que
 * no se descarga ni se parsea el JSON; solo si el nombre no tiene la forma esperada se lee el contenido, como antes.
 * (2) Un archivo que ya tiene su nombre correcto se salta. (3) Respeta el presupuesto de tiempo de la ejecucion.
 * @param {Object} resumen
 * @param {number=} inicio Timestamp (ms) de inicio de la ejecucion actual, para respetar el presupuesto de tiempo.
 * @return {boolean} true si se reviso toda la carpeta; false si se corto por presupuesto de tiempo (se retoma sola: los
 *   archivos ya correctos se saltan sin costo).
 */
function _migrarCarpetaPlayers(resumen, inicio) {
  var carpeta  = DriveApp.getFolderById(CARPETA_PLAYERS_ID_);
  var archivos = carpeta.getFiles();

  while (archivos.hasNext()) {
    if (inicio && _mig_tiempoAgotado_(inicio)) {
      console.log('    (presupuesto de tiempo alcanzado dentro de players; se retoma en la próxima ejecución)');
      return false;
    }

    var archivo = archivos.next();
    var nombre  = archivo.getName();

    if (nombre.slice(-5).toLowerCase() !== '.json') continue;

    // Fecha real de creación de ESTE archivo (no la hora de la corrida ni la de modificación).
    var fechaHora = _mig_fechaHoraStr(archivo.getDateCreated());

    var nombreNuevo = _mig_nombrePlayerPorCreacion_(nombre, fechaHora);
    if (nombreNuevo === null) {
      // El nombre no tiene la forma "fecha - clan - tag": se arma desde el contenido, como antes de PF080.
      var obj;
      try {
        obj = JSON.parse(archivo.getBlob().getDataAsString('UTF-8'));
      } catch(e) {
        resumen.ignorados.push(nombre + ' [players — no se pudo leer/parsear JSON]');
        continue;
      }
      var playerTag = (obj.tag || nombre.replace('.json', '')).trim();
      var clanName  = (obj.clan && obj.clan.name) ? obj.clan.name : 'Sin clan';
      nombreNuevo = fechaHora + ' - ' + clanName + ' - ' + playerTag + '.json';
    }

    if (nombre === nombreNuevo) continue;

    nombreNuevo = _mig_renombrarSeguro(archivo, nombreNuevo, resumen);
    resumen.renombrados++;
    console.log('    [player] ' + nombre + '\n       → ' + nombreNuevo);
  }
  return true;
}

/**
 * PF080: nombre que debe llevar un JSON de players: la fecha de creacion + el clan y el tag que ya trae el nombre, sin el
 * sufijo « - P{n}» del formato anterior a la Fase 18. Funcion pura.
 * @param {string} nombre Ej. "15-10-2026 13.16 - GrupoXTerna™2 - #VYQRG02V9.json" o con " - P17" antes de ".json".
 * @param {string} fechaHora Fecha de creacion ya formateada "dd-MM-yyyy HH.mm".
 * @return {?string} el nombre nuevo, o null si el nombre no tiene la forma "dd-MM-yyyy HH.mm - clan - tag.json".
 */
function _mig_nombrePlayerPorCreacion_(nombre, fechaHora) {
  var m = /^\d{2}-\d{2}-\d{4} \d{2}\.\d{2} - (.+ - #[^ ]+?)(?: - P\d+)?\.json$/i.exec(nombre);
  return m ? fechaHora + ' - ' + m[1] + '.json' : null;
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

// ----- Migración de formato: fechas y letra del día (las usan también 06 y 10) -----

function _mig_fechaHoraStr(d) {
  return Utilities.formatDate(d, 'America/Lima', 'dd-MM-yyyy HH.mm');
}

function _mig_soloHora(d) {
  return Utilities.formatDate(d, 'America/Lima', 'HH.mm');
}

function _mig_horaLima(d) {
  return Utilities.formatDate(d, 'America/Lima', 'dd/MM/yyyy HH:mm:ss') + ' (Lima)';
}

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

// ----- Presupuesto de tiempo, estado persistente y continuación automática -----
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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Limpieza de duplicados de los respaldos JSON
//  Parte 2 — Funciones que no se corren a mano
//    - Limpieza de duplicados: motor (en el orden en que lo llama limpiarDuplicadosJSON)
//    - Lectura del periodo de cada archivo (la usa también 10)
//    - Corte diario y día de juego
//    - Temporada de una fecha (la usa también 10)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

/** @const {boolean} true = solo reporta en el log, no borra nada. */
var LIMPIEZA_DRY_RUN_ = true;

/** @const {number} Margen máximo para prestar identidad a una captura sin
 *  currentriverrace.json propio, en ms. Si la ancla más cercana en el
 *  tiempo real queda más lejos que esto, se prefiere dejarla sin resolver
 *  (ver Paso B en _analizarCarpetaJSON_) antes que adivinar mal. */
var PAREO_TOLERANCIA_MS_ = 6 * 60 * 60 * 1000; // 6 horas

/** @const {number} PF080: minimo de pares de anclas consecutivas (p -> p+1) para dar por medido el corte diario. */
var CORTE_MIN_PARES_ = 3;

/** @const {number} PF080: fraccion minima de esos pares que debe coincidir en el rango medido (tolera anclas raras). */
var CORTE_MIN_FRACCION_ = 0.9;

/** @const Ancla: Temporada 1 (numeración interna) = primer lunes de mayo de 2026. */
var MIG_TEMPORADA_ANCLA_ = { temporada: 1, anio: 2026, mes0: 4 };

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Limpieza de duplicados de los respaldos JSON -----

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Limpieza de duplicados: motor (en el orden en que lo llama limpiarDuplicadosJSON) -----

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
    // PF080 (15-oct-2026, decidido por la usuaria): mayor tamaño primero y, a IGUAL tamaño, la captura MAS RECIENTE
    // (antes quedaba la mas antigua por el orden de "resueltas"). Dos capturas del mismo periodo con el mismo peso pueden
    // diferir en el contenido (caso Mini乂Ternas™ T-05, 13-09 y 14-09: solo cambia decksUsedToday) y la posterior trae mas datos.
    grupo.sort(function(a, b) { return (b.tamano - a.tamano) || (b.real - a.real); });
    aConservar.push(grupo[0]);
    grupo.slice(1).forEach(function(item) {
      item.motivo = 'duplicado del mismo periodo (' + k + '), no es el más completo (' + item.tamano + ' bytes vs ' + grupo[0].tamano + ' bytes' +
        (item.tamano === grupo[0].tamano ? ', mismo tamaño: se conserva la captura más reciente' : '') + ')';
      descartadas.push(item);
    });
  });

  // --- Reporte ---
  console.log('  Temporada más reciente: ' + resueltas[resueltas.length - 1].temporada + ' | Períodos detectados: ' + Object.keys(porPeriodo).length + ' | capturas totales leídas: ' + resueltas.length);

  aConservar.forEach(function(item) {
    console.log('  ✔ CONSERVA  temporada ' + item.temporada + ' / sección ' + item.sectionIndex + ' / periodo ' + item.periodIndex +
      ' | fecha real: ' + item.real + ' | nombre: "' + item.clave + '"' +
      (item.esAncla ? ' | tamaño: ' + item.tamano + ' bytes' : (item.porEtiqueta ? ' | identidad tomada del tag con letra que ya traía el nombre' : ' | identidad prestada de la captura más cercana en el tiempo')));
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
 *   PF080: salvo que el nombre ya traiga un tag completo con letra (T-xx S-xx P.I-xx-L, letra = periodIndex mod 7): entonces
 *   esa captura pasa a "resueltas" (esAncla=false, porEtiqueta=true) y deja de listarse como ignorada.
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
    // PF080 (15-oct-2026, pedido de la usuaria): si el nombre ya trae un tag COMPLETO con letra (T-xx S-xx P.I-xx-L), se
    // guarda como ultimo recurso para las capturas que no se puedan resolver por contenido ni por ancla (ver abajo).
    // Solo se acepta si la letra coincide con periodIndex mod 7 (_letraDiaGuerra_); si no, se ignora.
    if (!capturas[claveCaptura].etiquetaManual) {
      var mTag = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)-([LMXJVSD])\s/.exec(partes[0].trim() + ' ');
      if (mTag) {
        var tT = parseInt(mTag[1], 10), tS = parseInt(mTag[2], 10), tP = parseInt(mTag[3], 10);
        if (tT >= 1 && tS >= 1 && _letraDiaGuerra_(tP) === mTag[4]) {
          capturas[claveCaptura].etiquetaManual = { temporada: tT, sectionIndex: tS - 1, periodIndex: tP };
        }
      }
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
    var motivoRevision = null;
    var porEtiqueta = false;

    if (!idPeriodo && anclas.length) {
      var prestada = _anclaMasCercana_(anclas, grupo.realCreado);
      if (prestada && Math.abs(prestada.real.getTime() - grupo.realCreado.getTime()) <= PAREO_TOLERANCIA_MS_) {
        var ajuste = _ajustarPeriodoPrestado_(prestada, grupo.realCreado, (corteDiario && corteDiario.ok) ? corteDiario : null);
        if (ajuste.revision) {
          motivoRevision = ajuste.revision;
        } else {
          idPeriodo = { sectionIndex: ajuste.sectionIndex, periodIndex: ajuste.periodIndex };
          cortes = ajuste.cortes;
          temporadaDelDia = ajuste.temporada;
        }
      }
    }

    // PF080 (15-oct-2026, pedido de la usuaria): ULTIMO RECURSO. Si no se pudo resolver ni por contenido ni por ancla (o
    // cayo en revision) pero el nombre ya trae un tag completo con letra puesto a mano, se respeta ese tag y la captura
    // se trata como resuelta (el migrador la mueve a su carpeta T-xx / S-xx y la renombra con el formato de siempre).
    // No pisa nada resuelto por contenido o ancla: solo ocupa el lugar de "ignorado".
    if (!idPeriodo && grupo.etiquetaManual) {
      idPeriodo = { sectionIndex: grupo.etiquetaManual.sectionIndex, periodIndex: grupo.etiquetaManual.periodIndex };
      temporadaDelDia = grupo.etiquetaManual.temporada;
      porEtiqueta = true;
    }

    if (!idPeriodo) {
      if (motivoRevision) aRevision.push({ clave: clave, motivo: motivoRevision });
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
      temporadaDelDia: temporadaDelDia, // PF077: temporada del DIA DE JUEGO si se corrio el periodIndex; null si no
      porEtiqueta: porEtiqueta // PF080: true = identidad tomada del tag con letra que ya traia el nombre (decidido a mano)
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

// ----- Lectura del periodo de cada archivo (la usa también 10) -----

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

// ----- Corte diario y día de juego -----

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

/** @return {number} Hora de Lima de un instante, decimal en [0, 24). */
function _horaLimaDecimal_(fecha) {
  var d = new Date(fecha.getTime() - VERIF_LIMA_OFFSET_H_ * 3600 * 1000);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3600000;
}

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
 * PF077: corre el (sectionIndex, periodIndex) de una ancla al dia de juego de otro archivo (un clans.json, que no trae
 * periodIndex propio). Cuenta los cortes de las 04:00 (Lima) entre ambas fechas: 0 = mismo dia, se copia; +1 / -1 = se suma
 * o resta un dia. Como el prestamo es de 6 horas como maximo (PAREO_TOLERANCIA_MS_), no puede haber mas de un corte.
 *  - Si el ARCHIVO cayo entre las 04:00 y las 05:00 no se sabe en que dia estaba el servidor: se devuelve {revision} y el
 *    archivo queda sin etiquetar para que lo revise la usuaria. PF080: si solo la ANCLA cayo en la ventana, el dia de juego
 *    de la ancla se deduce de su periodIndex (_diaJuegoAnclaEnVentana_) y el archivo se resuelve por su fecha.
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
  // PF080 (15-oct-2026, decidido por la usuaria): si la ANCLA cayo en la ventana pero el archivo esta claramente fuera de
  // ella, el dia de juego del archivo se calcula por su fecha. El dia de juego de la ancla sale de su propio periodIndex
  // (_diaJuegoAnclaEnVentana_) y se usa una hora de referencia del mismo dia, fuera de la ventana, para el resto del calculo.
  var anclaReal = ancla.real;
  if (_enVentanaCorte_(ancla.real, corte)) {
    var diaAncla = _diaJuegoAnclaEnVentana_(ancla);
    if (diaAncla === null) {
      return { revision: 'la captura de la que tomaria el periodIndex se guardo ' + ventana + ' (Lima) y su periodIndex ' + ancla.periodIndex +
        ' no cuadra con el dia de la semana de su fecha: no se sabe en que dia de juego estaba' };
    }
    anclaReal = new Date(diaAncla * 86400000 + (VERIF_LIMA_OFFSET_H_ + cH) * 3600 * 1000 + 12 * 3600 * 1000);
  }

  var cortes = _diaJuegoNum_(fecha, cH) - _diaJuegoNum_(anclaReal, cH);
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
    if (_esInicioDeTemporada_(anclaReal, cH)) {
      // El archivo es del ultimo dia de la temporada anterior: su largo sale del calendario.
      var d = _diaJuegoFecha_(anclaReal, cH);
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

/** @return {string} Hora decimal (0-24) como "HH:MM". */
function _fmtHoraH_(h) {
  var min = Math.round(h * 60);
  var hh = Math.floor(min / 60) % 24, mm = min % 60;
  return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
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
 * PF080 (15-oct-2026): dia de juego de una ancla guardada DENTRO de la ventana de corte, deducido de su propio periodIndex.
 * El periodIndex da el dia de la semana (0 = lunes ... 6 = domingo): si coincide con el dia de calendario de Lima de la
 * captura, el servidor ya estaba en el dia nuevo; si coincide con el anterior, todavia estaba en el viejo. Cualquier otro
 * valor (por ejemplo la T-05 con periodIndex 7 un domingo) no se puede interpretar y devuelve null.
 * Funcion pura (no toca Drive).
 * @param {{real:Date, periodIndex:number}} ancla
 * @return {?number} Numero de dia de calendario de Lima (dias enteros desde 1970) del dia de juego, o null.
 */
function _diaJuegoAnclaEnVentana_(ancla) {
  var calNum = _diaJuegoNum_(ancla.real, 0); // dia de calendario de Lima (corte a las 00:00)
  var diaSemanaCal = (((calNum + 3) % 7) + 7) % 7; // 1970-01-01 fue jueves = 3 (0 = lunes)
  var diaSemanaP = (((Math.round(Number(ancla.periodIndex)) % 7) + 7) % 7);
  if (diaSemanaP === diaSemanaCal) return calNum;
  if (diaSemanaP === (diaSemanaCal + 6) % 7) return calNum - 1;
  return null;
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

/** @return {boolean} true si el dia de juego de "fecha" es el primer lunes de su mes, o sea el dia 0 de una temporada. */
function _esInicioDeTemporada_(fecha, corteH) {
  var d = _diaJuegoFecha_(fecha, corteH);
  return d.getUTCDay() === 1 && d.getUTCDate() === _primerLunesDia_(d.getUTCFullYear(), d.getUTCMonth());
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

/** @return {string} PF080: linea de log con el corte diario medido (o por que se uso la ventana 04:00-05:00). */
function _textoCorteDiario_(c) {
  if (!c) return 'Corte diario: sin pares de anclas seguidas, se usa la ventana 04:00-05:00.';
  if (!c.ok) return 'Corte diario: no se pudo medir (' + c.motivo + '), se usa la ventana 04:00-05:00.';
  return 'Corte diario medido: ' + _fmtHoraH_(c.desdeH) + '-' + _fmtHoraH_(c.hastaH) + ' (Lima), con ' + c.coinciden + ' de ' + c.pares + ' pares de anclas.';
}

// ----- Temporada de una fecha (la usa también 10) -----

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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Cache de periodos: reinicio
//  Parte 2 — Funciones que no se corren a mano
//    - Cache de periodos: lectura y escritura (las llaman 05, 06 y 10)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

/** @const {string} Nombre del archivo de cache dentro de la carpeta del Generador. */
var CACHE_PERIODOS_NOMBRE_ = '_cache_periodos_json.json';

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Cache de periodos: reinicio -----

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Cache de periodos: lectura y escritura (cargar y luego guardar) -----

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


// --- ARCHIVO: 08_GitHub.gs ---
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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Subida puntual de archivos de Drive a GitHub: ejecución (subirEvidenciaT05AGithub)
//  Parte 2 — Funciones que no se corren a mano
//    - Bajada desde GitHub al proyecto de Apps Script (entrada y reintentos, luego el trabajo de cada intento)
//    - Subida a GitHub en un solo commit (_githubSincronizar_, y en el orden en que la llama: aviso de pull pendiente, revisión de secretos,
//      documentos generados, commit y, después del commit, mensajes y commit de referencia)
//    - Diagnóstico (_githubProbar_; la llama un envoltorio de 01_Principal.gs)
//    - Subida puntual de archivos de Drive a GitHub: ayuda
//    - HTTP con la API de GitHub (las usan todos los temas anteriores)
//    - Utilidades del proyecto de Apps Script
// Dentro de cada tema, en el orden en que se espera ejecutarlas (deducido del código: la usuaria no lo ha confirmado). Al reordenar no se cambió el código de ninguna función.

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

// Con más de este número de archivos no se crea un blob por archivo: el contenido va dentro de los árboles, de a este tanto por llamada.
var GITHUB_ENTRADAS_BLOB_MAX_ = 40;

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

// Subida puntual de archivos de Drive a GitHub (solo AGREGA, nunca borra)
// [→ Contexto_Base_Web.md §PF080]
var EVIDENCIA_T05_CARPETA_GITHUB_ = 'Datos descargados/JSON/Anomalías/';
var EVIDENCIA_T05_NOMBRES_ = [
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Grupo乂Terna™ - currentriverrace.json',
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Grupo乂Terna™ - clans.json',
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Mini乂Ternas™ - currentriverrace.json',
  'T-05  S-02 P.I-07-L 13-09-2026 12.26 - Mini乂Ternas™ - clans.json'
];

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Subida puntual de archivos de Drive a GitHub: ejecución (solo AGREGA, nunca borra) -----

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Bajada desde GitHub al proyecto de Apps Script (Base, Generador o Contactos_Secundario) -----

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

// ----- Subida a GitHub (un solo commit): entrada -----

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

// ----- Subida a GitHub: aviso de "pull pendiente" (no escribir encima de cambios que el Generador no trajo), comprobación antes de escribir -----
// (La explicación del aviso y sus constantes GITHUB_PROP_ULTIMO_COMMIT_, GITHUB_AVISO_SOLO_CARPETA_ y GITHUB_INTENTOS_TRAER_ están arriba, con las demás variables globales.)

/** SHA del último commit de la rama. */
function _githubCabezaRemota_() {
  return _ghJson_(_ghReq_('get', '/git/ref/heads/' + GITHUB_BRANCH_)).object.sha;
}

function _githubLeerUltimoCommit_(nombreBase) {
  return PropertiesService.getScriptProperties().getProperty(GITHUB_PROP_ULTIMO_COMMIT_ + nombreBase) || '';
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

// ----- Subida a GitHub: revisión de secretos -----

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

// ----- Subida a GitHub: documentos generados (INDICE_FUNCIONES.md y LEEME_IA.md) -----

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

// ----- Subida a GitHub: commit -----

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

// ----- Subida a GitHub: aviso de pull pendiente, mensajes y commit de referencia (después del commit) -----

/** Nombres de las funciones que traen GitHub o lo pisan, según el proyecto (para los mensajes). */
function _githubFuncionesDeAccion_(nombreBase) {
  return {
    traer:   nombreBase === 'Base' ? 'subirBaseDesdeGithub()'
           : (nombreBase === 'Contactos_Secundario' ? 'subirContactosDesdeGithub()' : 'subirGeneradorDesdeGithub()'),
    forzada: nombreBase === 'Base' ? 'descargarBaseForzado()'
           : (nombreBase === 'Contactos_Secundario' ? 'descargarContactosForzado()' : 'descargarGeneradorForzado()')
  };
}

function _githubGuardarUltimoCommit_(nombreBase, sha) {
  if (!sha) return;
  PropertiesService.getScriptProperties().setProperty(GITHUB_PROP_ULTIMO_COMMIT_ + nombreBase, sha);
}

// ----- Diagnóstico -----

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

// ----- Subida puntual de archivos de Drive a GitHub: ayuda -----

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

// ----- HTTP con la API de GitHub (las usan todos los temas anteriores) -----

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

// ----- Utilidades del proyecto de Apps Script -----

/** Archivos reales del proyecto (sin "Script consolidado"), leídos de la API. */
function _archivosDelProyecto_(nombreBase) {
  return obtenerArchivosProyecto_(_scriptIdDeProyecto_(nombreBase)).filter(function(a) {
    return a.name.indexOf('Script consolidado') !== 0;
  });
}

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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: ninguna (todas las de este archivo las llama el Generador al descargar o subir)
//  Parte 2 — Funciones que no se corren a mano
//    - ReadMe del Generador: actualización (primero la función de entrada, luego sus ayudas en el orden en que se llaman)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var README_GENERADOR_NOMBRE_ = 'ReadMe_Generador.md';
var README_MARCA_INICIO_ = '<!-- AUTO:INICIO';
var README_MARCA_FIN_    = '<!-- AUTO:FIN -->';
var README_LINEA_INICIO_ = '<!-- AUTO:INICIO (lo escribe 09_ReadmeGenerador.gs en cada descarga/subida del Generador; no edites entre las marcas) -->';

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- ReadMe del Generador: actualización -----

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
  var ordenGrupos = ['Subir (Base)', 'Subir (Generador)', 'Subir (Contactos_Secundario)', 'Descargar', 'Mantenimiento y otras'];
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
  if (/^subirContactos/.test(nombre)) return 'Subir (Contactos_Secundario)';
  if (/^descargar/.test(nombre))      return 'Descargar';
  return 'Mantenimiento y otras';
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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Verificación de los respaldos JSON (solo lectura)
//  Parte 2 — Funciones que no se corren a mano
//    - Verificación de los respaldos JSON: ayudas (en el orden en que las llama verificarPeriodIndexJSON)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

/** @const {number} Lima es UTC-5 fijo. */
var VERIF_LIMA_OFFSET_H_ = 5;

/** @const {number} Hora Lima en que, como pronto, un clan cambia de día de guerra. */
var VERIF_CAMBIO_DESDE_H_ = 4;

/** @const {number} Hora Lima en que, como tarde, todos los clanes ya cambiaron. */
var VERIF_CAMBIO_HASTA_H_ = 5;

/** @const {RegExp} Tag del nombre: T-nn  S-nn P.I-nn[-letra] y el resto. */
var VERIF_REGEX_TAG_ = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(?:-([LMXJVSD]))?\s/;

/**
 * @const {Array<string>} PF080: nombres de archivo que son correctos aunque la fecha de creación no cuadre con el día del
 * periodIndex (manda el contenido). Solo se exceptúa el aviso «la fecha de creación cae en X pero el periodIndex…»; el resto
 * de las comprobaciones sigue aplicándose. Comparación sin distinguir espacios repetidos.
 * HOY VACÍA (15-oct-2026): tenía los 4 archivos de T-05 del 13-09-2026 12.26 (Grupo乂Terna™ y Mini乂Ternas™), que la API
 * devolvió con periodIndex 7 un domingo. Se borraron de Drive con limpiarDuplicadosJSON() y su evidencia quedó en
 * Datos descargados/JSON/Anomalías/ del repo [→ Contexto_Base_Web.md §PF080]. Si vuelve a pasar algo igual y se decide
 * que manda el contenido, se agrega el nombre aquí.
 */
var VERIF_EXCEPCIONES_FECHA_ = [];

/** @const {number} Máximo de líneas de detalle que se escriben en el log del Generador. */
var VERIF_MAX_LINEAS_LOG_ = 60;

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Verificación de los respaldos JSON (solo lectura) -----

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
  var r = { revisados: 0, ok: 0, faltaLetra: 0, ventana: 0, exceptuados: 0, problemas: [], sinVerificar: [], completo: true };

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
      if (v.exceptuado) r.exceptuados++; // PF080: se cuenta aparte, además de su estado normal
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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Verificación de los respaldos JSON: ayudas -----

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
  var exceptuado = false;
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
    if (_verif_esExcepcionFecha_(nombre)) {
      exceptuado = true; // PF080: nombre correcto (manda el contenido); ver VERIF_EXCEPCIONES_FECHA_
    } else {
      problemas.push('la fecha de creación cae en ' + LETRAS_DIA_GUERRA_.charAt(dia4) +
        ' pero el periodIndex ' + pReal + ' es ' + letraReal);
    }
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

  return { estado: estado, problemas: problemas, avisos: avisos, exceptuado: exceptuado };
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

/** @return {boolean} true si el nombre está en VERIF_EXCEPCIONES_FECHA_ (ignorando espacios repetidos). */
function _verif_esExcepcionFecha_(nombre) {
  var n = String(nombre).replace(/\s+/g, ' ').trim();
  return VERIF_EXCEPCIONES_FECHA_.indexOf(n) !== -1;
}

/** Escribe el resumen en la consola y deja una entrada en el log del Generador. */
function _verif_imprimirResumen_(r) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('RESUMEN (solo lectura, no se renombró nada):');
  console.log('  Revisados                          : ' + r.revisados);
  console.log('  Correctos (con letra)              : ' + r.ok);
  console.log('  Correctos, creados en 04:00-05:00  : ' + r.ventana);
  console.log('  Correctos pero sin letra todavía   : ' + r.faltaLetra + '  (los arregla migrarFormatoJSON, salvo un clans.json sin currentriverrace cercano)');
  console.log('  Exceptuados (ya contados arriba)   : ' + r.exceptuados + '  (nombres de VERIF_EXCEPCIONES_FECHA_, cuya fecha no cuadra pero manda el contenido; hoy ninguno)');
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


// --- ARCHIVO: 11_Imagenes_API.gs ---
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

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Escaneo de los JSON de players: reiniciar el avance y escanear (se escanea ANTES de subir)
//    - Descarga de imágenes de la API a GitHub (repo Web): probar, cartas, insignias y las dos categorías
//    - Carpetas API junto a Fankit
//    - Lista de direcciones no disponibles (HTTP 404): vaciarla para reintentar
//  Parte 2 — Funciones que no se corren a mano
//    - Descarga de imágenes: flujo principal (_imgApiEjecutar_)
//    - Direcciones desde los CSV de Drive y tipo de las insignias (en el orden en que las llama _imgApiEjecutar_)
//    - Lista de direcciones no disponibles: lectura y escritura
//    - Recorte del margen transparente de las insignias (lector y escritor de PNG; en el orden en que los llama _imgApiRecortarPng_)
//    - GitHub (repo Web): contexto, carpetas API y commit (solo agrega archivos), y el nivel bajo (token, petición, JSON)
//    - Escaneo de los JSON de players: ayudas
// Dentro de cada tema, en el orden en que se espera ejecutarlas (deducido del código: la usuaria no lo ha confirmado). Al reordenar no se cambió el código de ninguna función.

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

var IMGAPI_ALFA_MIN_ = 8;
var _IMGAPI_TABLA_CRC_ = null;
var _IMGAPI_LONG_BASE_ = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
var _IMGAPI_LONG_EXTRA_ = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
var _IMGAPI_DIST_BASE_ = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
var _IMGAPI_DIST_EXTRA_ = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
var _IMGAPI_ORDEN_CL_ = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Escaneo de los JSON de players (reanudable): reiniciar el avance y escanear -----

/** Olvida el avance del escaneo para volver a empezar desde el primer archivo. No borra Imagenes_API_Urls.txt. */
function imagenesApiReiniciarEscaneoJson() {
  PropertiesService.getScriptProperties().deleteProperty(IMGAPI_PROP_ESCANEO_);
  console.log('Avance del escaneo borrado.');
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

// ----- Descarga de imágenes de la API a GitHub (repo Web): probar, cartas, insignias y las dos categorías -----

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

// ----- Carpetas API junto a Fankit -----

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

// ----- Lista de direcciones no disponibles en el CDN (HTTP 404): vaciarla para reintentar -----

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

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Descarga de imágenes: flujo principal -----

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

// ----- Descarga de imágenes: direcciones desde los CSV de Drive y tipo de las insignias de jugador (maestría o insignia, 20-oct-2026) -----

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

/** El archivo de Drive con ese nombre (si hay varios, el más reciente), o null si no existe. No lo crea. */
function _imgApiArchivoMasReciente_(nombre) {
  var it = DriveApp.getFilesByName(nombre);
  var archivos = [];
  while (it.hasNext()) archivos.push(it.next());
  if (!archivos.length) return null;
  archivos.sort(function(a, b) { return b.getLastUpdated().getTime() - a.getLastUpdated().getTime(); });
  return archivos[0];
}

function _imgApiNormalizarCabecera_(texto) {
  return String(texto || '').replace(/^\uFEFF/, '').trim().toLowerCase();
}

/** Ruta destino de una insignia de jugador según su tipo. */
function _imgApiDestinoInsignia_(esMaestria, archivo) {
  return (esMaestria ? IMGAPI_DESTINO_MAESTRIAS_ : IMGAPI_DESTINO_INSIGNIAS_) + archivo;
}

// ----- Lista de direcciones no disponibles en el CDN (HTTP 404): lectura y escritura -----

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

// ----- Recorte del margen transparente de las insignias (22-oct-2026; la explicación y las constantes están arriba, con las variables globales) -----

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

/** Bytes con signo de Apps Script (-128..127) a Uint8Array. */
function _imgApiAU8_(bytes) {
  var n = bytes.length, u = new Uint8Array(n);
  for (var i = 0; i < n; i++) u[i] = bytes[i] & 255;
  return u;
}

function _imgApiLeeU32_(u8, p) { return ((u8[p] << 24) | (u8[p + 1] << 16) | (u8[p + 2] << 8) | u8[p + 3]) >>> 0; }

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

function _imgApiAdler32_(u8) {
  var a = 1, b = 0, n = u8.length, i = 0;
  while (i < n) {
    var tope = Math.min(i + 3800, n);
    for (; i < tope; i++) { a += u8[i]; b += a; }
    a %= 65521; b %= 65521;
  }
  return ((b << 16) | a) >>> 0;
}

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

/** Uint8Array a bytes con signo, que es lo que esperan Utilities.base64Encode y newBlob. */
function _imgApiAConSigno_(u8) {
  var n = u8.length, a = new Array(n);
  for (var i = 0; i < n; i++) { var v = u8[i]; a[i] = v > 127 ? v - 256 : v; }
  return a;
}

// ----- GitHub (repo Web): contexto, carpetas API y commit (solo agrega archivos) -----

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

// ----- GitHub (repo Web): nivel bajo (token, petición y respuesta JSON) -----

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

// ----- Escaneo de los JSON de players: ayudas (las llama imagenesApiEscanearJsonPlayers) -----

/** Archivo acumulador en Drive (raíz); lo crea vacío si no existe. Si hay varios con el mismo nombre usa el más reciente. */
function _imgApiArchivoUrls_() {
  var it = DriveApp.getFilesByName(IMGAPI_ARCHIVO_URLS_);
  var archivos = [];
  while (it.hasNext()) archivos.push(it.next());
  if (!archivos.length) return DriveApp.createFile(IMGAPI_ARCHIVO_URLS_, '', 'text/plain');
  archivos.sort(function(a, b) { return b.getLastUpdated().getTime() - a.getLastUpdated().getTime(); });
  return archivos[0];
}

/** Archivo de tipos de insignia en Drive (raíz); lo crea vacío si no existe. */
function _imgApiArchivoTipos_() {
  return _imgApiArchivoMasReciente_(IMGAPI_ARCHIVO_TIPOS_) || DriveApp.createFile(IMGAPI_ARCHIVO_TIPOS_, '', 'text/plain');
}


// --- ARCHIVO: 12_Datos_Drive_GitHub.gs ---
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
    if (subidos) console.log('Falta hacer pull de Backend en GitHub Desktop para verlos en tu equipo.');

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


