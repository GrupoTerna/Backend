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
