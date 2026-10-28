// 07_Battlelogs_Hoja.gs
// HOJA "Battlelogs": VISTA DE SOLO LECTURA de Backup_Battlelogs.csv.
// Hoja 'Battlelogs' = vista de solo lectura, reconstruida desde el CSV (nunca al revés); avisos abiertos [1]-[7]. [→ Contexto_Base_Web.md §07B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hoja Battlelogs: actualizar
//  Parte 2 — Funciones que no se corren a mano
//    - Hoja Battlelogs: ayudas (en el orden en que las usa actualizarHojaBattlelogs)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var BLH_SHEET_NAME = 'Battlelogs';

// Posiciones (base 0) dentro de BLS_HEADERS = columnas del CSV (06_Battlelogs_Siembra.gs).
var BLH_COLS_NUMERICAS = [0, 7, 9, 10, 13, 14]; // N°, ModoId, CoronasPropias, CoronasRival, TorresNuevas, TorresRestantes

// Columna extra que existe SOLO en la hoja (no en el CSV). true = se agrega.
var BLH_AGREGAR_HORA_LIMA = true;

var BLH_HEADER_HORA_LIMA = 'Hora Lima';

var BLH_TZ = 'America/Lima';

var BLH_FORMATO_HORA_LIMA = 'yyyy-MM-dd HH:mm:ss';

var BLH_NOTA_A1 =
  'Hoja de SOLO LECTURA. Se reconstruye entera desde Backup_Battlelogs.csv ' +
  'cada vez que se corre actualizarHojaBattlelogs() (y una vez al dia dentro de ' +
  'runSyncCSV()). No editar aqui: lo que se cambie se pierde en la proxima ' +
  'actualizacion. El registro real es el CSV. La columna "' + BLH_HEADER_HORA_LIMA + '" solo existe ' +
  'en esta hoja: es battleTime (UTC) convertido a hora de Lima.';

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Hoja Battlelogs: actualizar -----

// PUNTO DE ENTRADA [→ Contexto_Base_Web.md §07B002]

/**
 * actualizarHojaBattlelogs() [→ Contexto_Base_Web.md §07B003]
 */
function actualizarHojaBattlelogs() {
  var etiqueta = '[Battlelogs/Hoja]';
  if (typeof _blsLeerCsv_ !== 'function' || typeof BLS_HEADERS === 'undefined') {
    Logger.log(etiqueta + ' Falta 06_Battlelogs_Siembra.gs en el proyecto. No se hace nada.');
    return null;
  }

  // El candado cubre solo la LECTURA del CSV: asi no se lee a mitad de una
  // escritura de la siembra o de una descarga (que usan el mismo candado).
  var csv;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    Logger.log(etiqueta + ' Hay otra ejecucion del proyecto en curso (candado ocupado). No se hace nada; reintentar en unos minutos.');
    return null;
  }
  try {
    csv = _blsLeerCsv_(BLS_CSV_NOMBRE, BLS_HEADERS);
  } finally {
    lock.releaseLock();
  }

  if (!csv.ok) {
    Logger.log(etiqueta + ' ' + csv.error);
    return null;
  }
  if (!csv.rows.length) {
    Logger.log(etiqueta + ' ' + BLS_CSV_NOMBRE + ' no existe o no tiene filas de dato. No se toca la hoja.');
    return null;
  }

  var ss = _getSs();
  var existia = !!ss.getSheetByName(BLH_SHEET_NAME);
  var sh = _getOrCreateSheet(ss, BLH_SHEET_NAME);

  var dise = _blhDisenoColumnas_();
  var conv = _blhFilasParaHoja_(csv.rows, dise);
  var filas = conv.filas;
  var nCols = dise.headers.length;
  var nFilas = filas.length;

  // Tamano de la hoja: columnas y filas suficientes para el encabezado + datos.
  if (sh.getMaxColumns() < nCols) sh.insertColumnsAfter(sh.getMaxColumns(), nCols - sh.getMaxColumns());
  if (sh.getMaxRows() < nFilas + 1) sh.insertRowsAfter(sh.getMaxRows(), nFilas + 1 - sh.getMaxRows());

  // Reconstruccion completa: se borran los datos viejos (si la hoja tenia mas [→ Contexto_Base_Web.md §07B004]
  var ultimaFilaVieja = sh.getLastRow();
  if (ultimaFilaVieja >= 2) {
    sh.getRange(2, 1, ultimaFilaVieja - 1, Math.max(sh.getLastColumn(), nCols)).clearContent();
  }

  // Formatos ANTES de escribir, para que Sheets no reinterprete el texto.
  for (var c = 0; c < nCols; c++) {
    var esNumerica = dise.numericas[c] === true;
    sh.getRange(2, c + 1, nFilas, 1).setNumberFormat(esNumerica ? '0' : '@');
  }

  sh.getRange(1, 1, 1, nCols).setNumberFormat('@').setValues([dise.headers]);
  sh.getRange(2, 1, nFilas, nCols).setValues(filas);

  applyHeaderStyle(sh, nCols);
  sh.setFrozenColumns(3); // N° | Tag | Nombre, como las demas hojas con ese encabezado
  try { sh.getRange(1, 1).setNote(BLH_NOTA_A1); } catch (eNota) {}
  if (typeof _aplicarFiltroEnFilaHeader === 'function') {
    try { _aplicarFiltroEnFilaHeader(sh, BLH_SHEET_NAME); } catch (eFiltro) {
      Logger.log(etiqueta + ' No se pudo aplicar el filtro: ' + eFiltro.message);
    }
  }

  Logger.log(etiqueta + ' ' + (existia ? 'Hoja actualizada' : 'Hoja CREADA') + ': ' + nFilas +
    ' fila(s) de dato desde ' + BLS_CSV_NOMBRE + '.' +
    (dise.posHora >= 0
      ? ' Columna "' + BLH_HEADER_HORA_LIMA + '": ' + (nFilas - conv.sinHoraLima) + ' calculada(s)' +
        (conv.sinHoraLima ? ', ' + conv.sinHoraLima + ' vacia(s) por battleTime ilegible' : '') + '.'
      : ''));
  return { filas: nFilas, creada: !existia, sinHoraLima: conv.sinHoraLima };
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Hoja Battlelogs: ayudas (en el orden en que las usa actualizarHojaBattlelogs) -----

// AUXILIARES [→ Contexto_Base_Web.md §07B005]

/**
 * _blhDisenoColumnas_() [→ Contexto_Base_Web.md §07B006]
 */
function _blhDisenoColumnas_() {
  var idxBt = BLS_HEADERS.indexOf('battleTime');
  var agregar = (BLH_AGREGAR_HORA_LIMA === true) && idxBt >= 0;
  var posHora = agregar ? idxBt + 1 : -1;
  var headers = BLS_HEADERS.slice();
  if (agregar) headers.splice(posHora, 0, BLH_HEADER_HORA_LIMA);
  var numericas = {};
  for (var s = 0; s < headers.length; s++) {
    if (s === posHora) continue;
    var idxCsv = (posHora >= 0 && s > posHora) ? s - 1 : s;
    if (BLH_COLS_NUMERICAS.indexOf(idxCsv) >= 0) numericas[s] = true;
  }
  return { headers: headers, posHora: posHora, idxBt: idxBt, numericas: numericas };
}

/**
 * _blhFilasParaHoja_(filasCsv, dise) [→ Contexto_Base_Web.md §07B007]
 */
function _blhFilasParaHoja_(filasCsv, dise) {
  if (!dise) dise = _blhDisenoColumnas_();
  var nCols = BLS_HEADERS.length;
  var salida = [];
  var sinHoraLima = 0;
  for (var i = 0; i < filasCsv.length; i++) {
    var fila = [];
    for (var c = 0; c < nCols; c++) {
      var v = filasCsv[i][c];
      if (v === undefined || v === null) v = '';
      if (BLH_COLS_NUMERICAS.indexOf(c) >= 0 && String(v).trim() !== '') {
        var n = Number(v);
        fila.push(isNaN(n) ? String(v) : n);
      } else {
        fila.push(String(v));
      }
    }
    if (dise.posHora >= 0) {
      var hora = _blhHoraLima_(filasCsv[i][dise.idxBt]);
      if (hora === '') sinHoraLima++;
      fila.splice(dise.posHora, 0, hora);
    }
    salida.push(fila);
  }
  return { filas: salida, sinHoraLima: sinHoraLima };
}

/**
 * _blhHoraLima_(battleTime) [→ Contexto_Base_Web.md §07B008]
 */
function _blhHoraLima_(battleTime) {
  var m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d{1,3})?Z$/.exec(String(battleTime === undefined || battleTime === null ? '' : battleTime).trim());
  if (!m) return '';
  var a = +m[1], mes = +m[2], d = +m[3], h = +m[4], mi = +m[5], s = +m[6];
  var fecha = new Date(Date.UTC(a, mes - 1, d, h, mi, s));
  // Date.UTC "arregla" valores fuera de rango (mes 13, dia 40...). Se exige que
  // la fecha resultante tenga exactamente los mismos componentes que el texto.
  if (isNaN(fecha.getTime()) ||
      fecha.getUTCFullYear() !== a || fecha.getUTCMonth() !== mes - 1 || fecha.getUTCDate() !== d ||
      fecha.getUTCHours() !== h || fecha.getUTCMinutes() !== mi || fecha.getUTCSeconds() !== s) {
    return '';
  }
  return Utilities.formatDate(fecha, BLH_TZ, BLH_FORMATO_HORA_LIMA);
}
