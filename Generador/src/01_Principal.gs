// =============================================================================
// 01_Principal.gs
// Punto de entrada: solo las funciones que ejecutas manualmente desde el editor.
// Orden: 1) subidas, 2) descargas, 3) mantenimiento.
// Comentario de prueba para obtener el archivo modificado desde Github
// =============================================================================
// ------------------------------------------------------------------
// DESCARGA (zip + txt + gs + md, siempre los 4 a la vez)
// Además sincroniza GitHub (08_GitHub.gs): .gs sueltos en <Nombre>/src/,
// consolidado en <Nombre>/respaldo/, INDICE_FUNCIONES.md, Indice_<Nombre>.md y LEEME_IA.md.
// Si no hay GITHUB_TOKEN en las propiedades del script, GitHub se omite.
// ------------------------------------------------------------------

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

/**
 * Igual que descargarGenerador(), pero escribe en GitHub aunque haya un "pull pendiente": cambios
 * nuevos en Generador/ de GitHub que este proyecto no trajo. Esos cambios de GitHub SE PIERDEN
 * (quedan solo en el historial de git). Úsala solo si quieres que lo de Apps Script pise lo de GitHub.
 */
function descargarGeneradorForzado() {
  _descargarProyectoAArchivos('Generador');
  _githubSincronizar_('Generador', true);
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
