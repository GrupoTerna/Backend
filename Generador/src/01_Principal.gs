// =============================================================================
// 01_Principal.gs
// Punto de entrada: solo las funciones que ejecutas manualmente desde el editor.
// Orden: 1) subidas, 2) descargas, 3) mantenimiento.
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


// ------------------------------------------------------------------
// GITHUB (repo GrupoTerna/Backend)
// ------------------------------------------------------------------

/**
 * Trae Base/src/ de GitHub y deja el proyecto de Apps Script de "Base"
 * EXACTAMENTE igual (lo que no esté en GitHub se elimina del proyecto).
 * Antes crea en Drive el respaldo "Base_antes_de_GitHub <fecha>.zip" y al
 * terminar regenera Base.zip/.gs/.txt/.md y el consolidado/índice de GitHub.
 * Se detiene si src/ parece incompleta (menos de la mitad de los .gs).
 */
function subirBaseDesdeGithub() {
  return _githubTraerAProyectoApps_('Base', false);
}

/** Igual que subirBaseDesdeGithub(), pero sin la salvaguarda de "src/ incompleta". */
function subirBaseDesdeGithubForzado() {
  return _githubTraerAProyectoApps_('Base', true);
}

/** Comprueba GITHUB_TOKEN, acceso al repo, permiso de escritura y rama. */
function probarConexionGithub() {
  return _githubProbar_();
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