// =============================================================================
// 06_Battlelogs_Siembra.gs
// SIEMBRA DEL REGISTRO Backup_Battlelogs.csv CON LOS JSON QUE YA HAY EN LA
// CARPETA "Battlelog" (DRIVE_FOLDER_ID_BATTLELOG).
// =============================================================================
// Vuelca a Backup_Battlelogs.csv los JSON ya existentes en la carpeta Battlelog (pedido 1-oct-2026, preg. 51), con avisos abiertos [1]-[6]. Archivo autónomo. [→ Contexto_Base_Web.md §06B001]

var BLS_CSV_NOMBRE = 'Backup_Battlelogs.csv';
var BLS_REVISION_CSV_NOMBRE = 'Revision_Guerra.csv';
var BLS_PROGRESO_FILE = 'Cache_Battlelogs_Siembra_Progreso.json';
var BLS_PRESUPUESTO_MS = 270000;                    // 4,5 min de trabajo por ejecucion
var BLS_PROGRESO_MAX_EDAD_MS = 6 * 60 * 60 * 1000;  // el punto de control vence a las 6 h
var BLS_GUARDAR_CADA_TAGS = 40;

var BLS_HEADERS = ['N°', 'Tag', 'Nombre', 'battleTime', 'Tipo', 'ClanTag', 'ClanNombre',
  'ModoId', 'ModoNombre', 'CoronasPropias', 'CoronasRival', 'RondasDuelo',
  'BarcoGanado', 'TorresNuevas', 'TorresRestantes', 'Archivo', 'Descargado', 'LadoBarco'];

var BLS_REVISION_HEADERS = ['N°', 'Registrado', 'Origen', 'Tag', 'Motivo', 'Detalle'];

// Posiciones de las columnas dentro de una fila de BLS_HEADERS.
var BLS_COL = { TAG: 1, NOMBRE: 2, BATTLETIME: 3, TIPO: 4, CLAN_TAG: 5, CLAN_NOMBRE: 6,
  PRIMERA_COMPARABLE: 5, ULTIMA_COMPARABLE: 14, ARCHIVO: 15, DESCARGADO: 16, LADO: 17 };

// PUNTOS DE ENTRADA [→ Contexto_Base_Web.md §06B002]

/**
 * sembrarBattlelogsDesdeCarpeta()
 * Siembra de verdad Backup_Battlelogs.csv (ver docblock del archivo).
 */
function sembrarBattlelogsDesdeCarpeta() {
  return _blsSembrar_(false);
}

/**
 * sembrarBattlelogsDesdeCarpetaPrueba() [→ Contexto_Base_Web.md §06B003]
 */
function sembrarBattlelogsDesdeCarpetaPrueba() {
  return _blsSembrar_(true);
}

// NUCLEO [→ Contexto_Base_Web.md §06B004]

function _blsSembrar_(soloContar) {
  var t0 = Date.now();
  var etiqueta = soloContar ? '[Battlelogs/Siembra PRUEBA]' : '[Battlelogs/Siembra]';
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    Logger.log(etiqueta + ' Hay otra ejecucion del proyecto en curso (candado ocupado). No se hace nada; reintentar en unos minutos.');
    return null;
  }
  try {
    return _blsSembrarConCandado_(soloContar, t0, etiqueta);
  } finally {
    lock.releaseLock();
  }
}

function _blsSembrarConCandado_(soloContar, t0, etiqueta) {
  // 1) Estado actual de los CSV.
  var csv = _blsLeerCsv_(BLS_CSV_NOMBRE, BLS_HEADERS);
  if (!csv.ok) {
    Logger.log(etiqueta + ' ' + csv.error);
    return null;
  }
  var filas = csv.rows;
  var porClave = {};
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    porClave[_blsClave_(f[BLS_COL.BATTLETIME], f[BLS_COL.TIPO], f[BLS_COL.TAG])] = f;
  }
  var filasAntes = filas.length;

  var rev = _blsLeerCsv_(BLS_REVISION_CSV_NOMBRE, BLS_REVISION_HEADERS);
  var revisionDisponible = rev.ok;
  if (!rev.ok) {
    Logger.log(etiqueta + ' AVISO: ' + rev.error + ' Los conflictos se contaran pero NO se anotaran en Revision_Guerra.csv.');
  }
  var revFilas = rev.ok ? rev.rows : [];
  var revVistos = {};
  for (var r = 0; r < revFilas.length; r++) {
    revVistos[_blsClaveRevision_(revFilas[r][3], revFilas[r][4], revFilas[r][5])] = true;
  }
  var revNuevas = [];

  // 2) Archivos de la carpeta agrupados por Tag.
  var listado = _blsListarArchivos_();
  var tags = Object.keys(listado.porTag).sort();
  var hechos = soloContar ? {} : _blsCargarProgreso_();
  var tagsPendientes = [];
  for (var t = 0; t < tags.length; t++) {
    if (!hechos[tags[t]]) tagsPendientes.push(tags[t]);
  }

  var cont = {
    archivosLeidos: 0, tagsProcesados: 0, batallasGuerraVistas: 0, nuevas: 0,
    duplicadasIguales: 0, ladosCompletados: 0, conflictosClan: 0, conflictosOtros: 0,
    sinBattleTime: 0, errores: [], cortado: false
  };
  var ts = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
  var sinGuardarDesde = 0;

  // 3) Recorrido por Tag (mas viejo a mas nuevo dentro de cada Tag).
  for (var p = 0; p < tagsPendientes.length; p++) {
    if (Date.now() - t0 > BLS_PRESUPUESTO_MS) { cont.cortado = true; break; }
    var tag = tagsPendientes[p];
    var archivos = listado.porTag[tag].slice().sort(function (a, b) {
      return a.orden < b.orden ? -1 : (a.orden > b.orden ? 1 : 0);
    });

    for (var k = 0; k < archivos.length; k++) {
      var a = archivos[k];
      var data;
      try {
        data = JSON.parse(a.file.getBlob().getDataAsString('UTF-8'));
      } catch (eLeer) {
        cont.errores.push(a.nombre + ': ' + eLeer.message);
        continue;
      }
      if (!Array.isArray(data)) {
        cont.errores.push(a.nombre + ': el JSON no es una lista de batallas.');
        continue;
      }
      cont.archivosLeidos++;

      for (var b = 0; b < data.length; b++) {
        var bat = data[b];
        if (!bat || !_blsEsBatallaGuerra_(bat.type)) continue;
        cont.batallasGuerraVistas++;
        if (!bat.battleTime) { cont.sinBattleTime++; continue; }

        var fila = _blsFilaDeBatalla_(bat, tag, a);
        var clave = _blsClave_(fila[BLS_COL.BATTLETIME], fila[BLS_COL.TIPO], tag);
        var previa = porClave[clave];

        if (!previa) {
          porClave[clave] = fila;
          filas.push(fila);
          cont.nuevas++;
          continue;
        }
        var cmp = _blsComparar_(previa, fila);
        if (cmp === 'igual') {
          cont.duplicadasIguales++;
          if (_blsCompletarLado_(previa, fila)) cont.ladosCompletados++;
          continue;
        }
        var motivo;
        if (cmp === 'clan') {
          motivo = 'Clan distinto entre descargas (evidencia pregunta 44)';
          cont.conflictosClan++;
        } else {
          motivo = 'Mismo battleTime, datos distintos';
          cont.conflictosOtros++;
        }
        var detalle = 'battleTime ' + fila[BLS_COL.BATTLETIME] + ' | Tipo ' + fila[BLS_COL.TIPO] +
          ' | Guardado (' + previa[BLS_COL.ARCHIVO] + '): ' + _blsFirma_(previa) +
          ' | Nuevo (' + a.nombre + '): ' + _blsFirma_(fila);
        var claveRev = _blsClaveRevision_(tag, motivo, detalle);
        if (revisionDisponible && !revVistos[claveRev]) {
          revVistos[claveRev] = true;
          revNuevas.push(['', ts, 'Siembra Battlelogs', tag, motivo, detalle]);
        }
      }
    }

    hechos[tag] = true;
    cont.tagsProcesados++;
    sinGuardarDesde++;
    if (!soloContar && sinGuardarDesde >= BLS_GUARDAR_CADA_TAGS) {
      _blsGuardarTodo_(filas, revFilas, revNuevas, hechos, revisionDisponible);
      revFilas = revFilas.concat(revNuevas);
      revNuevas = [];
      sinGuardarDesde = 0;
    }
  }

  // 4) Guardado final y punto de control.
  var completa = !cont.cortado;
  if (!soloContar) {
    _blsGuardarTodo_(filas, revFilas, revNuevas, hechos, revisionDisponible);
    if (completa) _blsBorrarProgreso_();
  }

  // 5) Resumen.
  var resumen = {
    prueba: !!soloContar,
    completa: completa,
    tagsEnCarpeta: tags.length,
    tagsProcesadosEstaVez: cont.tagsProcesados,
    tagsPendientes: tagsPendientes.length - cont.tagsProcesados,
    archivosLeidos: cont.archivosLeidos,
    batallasGuerraVistas: cont.batallasGuerraVistas,
    filasAntes: filasAntes,
    filasNuevas: cont.nuevas,
    duplicadasIguales: cont.duplicadasIguales,
    ladosCompletados: cont.ladosCompletados,
    conflictosClan: cont.conflictosClan,
    conflictosOtros: cont.conflictosOtros,
    sinBattleTime: cont.sinBattleTime,
    errores: cont.errores.length,
    archivosSinFormatoDeNombre: listado.sinFormato.length,
    segundos: Math.round((Date.now() - t0) / 1000)
  };
  Logger.log(etiqueta + ' ' + JSON.stringify(resumen));
  if (cont.errores.length) {
    Logger.log(etiqueta + ' Errores (primeros 10): ' + cont.errores.slice(0, 10).join(' || '));
  }
  if (listado.sinFormato.length) {
    Logger.log(etiqueta + ' Archivos de la carpeta cuyo nombre no tiene el formato esperado (primeros 10, no se leyeron): ' +
      listado.sinFormato.slice(0, 10).join(' || '));
  }
  if (soloContar) {
    Logger.log(etiqueta + ' PRUEBA: no se escribio nada en Drive.' +
      (cont.cortado ? ' Se corto por tiempo: la siembra real necesitara varias ejecuciones.' : ''));
  } else if (completa) {
    Logger.log(etiqueta + ' SIEMBRA COMPLETA. Filas en ' + BLS_CSV_NOMBRE + ': ' + filas.length + '.');
  } else {
    Logger.log(etiqueta + ' SIEMBRA PARCIAL (se agoto el tiempo de esta ejecucion). Vuelve a ejecutar sembrarBattlelogsDesdeCarpeta() hasta ver "SIEMBRA COMPLETA".');
  }
  return resumen;
}

// LECTURA DE LA CARPETA Y DE LAS BATALLAS [→ Contexto_Base_Web.md §06B005]

/**
 * _blsListarArchivos_() [→ Contexto_Base_Web.md §06B006]
 */
function _blsListarArchivos_() {
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_BATTLELOG);
  var it = folder.getFiles();
  var re = /^(\d{2})-(\d{2})-(\d{4}) (\d{2})\.(\d{2}) - (.*) - (#[0-9A-Z]+)\.json$/i;
  var porTag = {};
  var sinFormato = [];
  while (it.hasNext()) {
    var f = it.next();
    var nombre = f.getName();
    var m = re.exec(nombre);
    if (!m) { sinFormato.push(nombre); continue; }
    var tag = m[7].toUpperCase();
    if (!porTag[tag]) porTag[tag] = [];
    porTag[tag].push({
      file: f,
      nombre: nombre,
      orden: m[3] + m[2] + m[1] + m[4] + m[5],
      descargado: m[1] + '/' + m[2] + '/' + m[3] + ' ' + m[4] + ':' + m[5]
    });
  }
  return { porTag: porTag, sinFormato: sinFormato };
}

function _blsEsBatallaGuerra_(tipo) {
  var t = String(tipo || '');
  return t.indexOf('riverRace') === 0 || t === 'boatBattle';
}

/**
 * _blsClanDeBatalla_(equipo0) [→ Contexto_Base_Web.md §06B007]
 */
function _blsClanDeBatalla_(equipo0) {
  var clan = (equipo0 && equipo0.clan) || {};
  return { tag: String(clan.tag || '').toUpperCase(), nombre: String(clan.name || '') };
}

/**
 * _blsRondasDuelo_(equipo0, rival0) [→ Contexto_Base_Web.md §06B008]
 */
function _blsRondasDuelo_(equipo0, rival0) {
  var propias = (equipo0 && Array.isArray(equipo0.rounds)) ? equipo0.rounds : [];
  if (!propias.length) return '';
  var rivales = (rival0 && Array.isArray(rival0.rounds)) ? rival0.rounds : [];
  var partes = [];
  for (var i = 0; i < propias.length; i++) {
    var c1 = (propias[i] && propias[i].crowns !== undefined && propias[i].crowns !== null) ? propias[i].crowns : '?';
    var c2 = (rivales[i] && rivales[i].crowns !== undefined && rivales[i].crowns !== null) ? rivales[i].crowns : '?';
    partes.push(c1 + ' vs ' + c2);
  }
  return partes.join(' / ');
}

function _blsNumeroOVacio_(valor) {
  if (valor === undefined || valor === null || valor === '') return '';
  var n = Number(valor);
  return isNaN(n) ? '' : n;
}

function _blsFilaDeBatalla_(bat, tag, archivo) {
  var eq = (bat.team && bat.team[0]) || {};
  var ri = (bat.opponent && bat.opponent[0]) || {};
  var modo = bat.gameMode || {};
  var clan = _blsClanDeBatalla_(eq);
  var esBarco = (bat.type === 'boatBattle');
  var barcoGanado = '';
  if (esBarco) {
    if (bat.boatBattleWon === true) barcoGanado = 'Sí';
    else if (bat.boatBattleWon === false) barcoGanado = 'No';
  }
  return [
    '',                                                   // N° (se numera al guardar)
    tag,                                                  // Tag
    String(eq.name || ''),                                // Nombre
    String(bat.battleTime || ''),                         // battleTime (UTC, crudo)
    String(bat.type || ''),                               // Tipo
    clan.tag,                                             // ClanTag
    clan.nombre,                                          // ClanNombre
    _blsNumeroOVacio_(modo.id),                           // ModoId
    String(modo.name || ''),                              // ModoNombre
    _blsNumeroOVacio_(eq.crowns),                         // CoronasPropias
    _blsNumeroOVacio_(ri.crowns),                         // CoronasRival
    _blsRondasDuelo_(eq, ri),                             // RondasDuelo
    barcoGanado,                                          // BarcoGanado
    esBarco ? _blsNumeroOVacio_(bat.newTowersDestroyed) : '',  // TorresNuevas
    esBarco ? _blsNumeroOVacio_(bat.remainingTowers) : '',     // TorresRestantes
    archivo.nombre,                                       // Archivo
    archivo.descargado,                                   // Descargado (Lima)
    esBarco ? String(bat.boatBattleSide || '') : ''       // LadoBarco (crudo; "defender" = defensa)
  ];
}

/**
 * _blsCompletarLado_(previa, nueva) [→ Contexto_Base_Web.md §06B009]
 */
function _blsCompletarLado_(previa, nueva) {
  if (!previa || !nueva) return false;
  if (_blsCelda_(previa, BLS_COL.TIPO) !== 'boatBattle') return false;
  if (_blsCelda_(previa, BLS_COL.LADO) !== '') return false;
  var lado = _blsCelda_(nueva, BLS_COL.LADO);
  if (lado === '') return false;
  while (previa.length <= BLS_COL.LADO) previa.push('');
  previa[BLS_COL.LADO] = lado;
  return true;
}

// COMPARACION Y CLAVES [→ Contexto_Base_Web.md §06B010]

function _blsClave_(battleTime, tipo, tag) {
  return String(battleTime || '') + '|' + String(tipo || '') + '|' + String(tag || '').toUpperCase();
}

function _blsClaveRevision_(tag, motivo, detalle) {
  return String(tag || '').toUpperCase() + '|' + String(motivo || '') + '|' + String(detalle || '');
}

function _blsCelda_(fila, idx) {
  var v = fila[idx];
  return (v === undefined || v === null) ? '' : String(v).trim();
}

/**
 * _blsFirma_(fila) [→ Contexto_Base_Web.md §06B011]
 */
function _blsFirma_(fila) {
  var partes = [];
  for (var i = BLS_COL.PRIMERA_COMPARABLE; i <= BLS_COL.ULTIMA_COMPARABLE; i++) {
    partes.push(_blsCelda_(fila, i));
  }
  return partes.join(',');
}

/**
 * _blsComparar_(previa, nueva)
 * Devuelve 'igual', 'clan' (difieren SOLO ClanTag/ClanNombre) o 'otros'.
 */
function _blsComparar_(previa, nueva) {
  var difiereClan = false;
  var difiereOtro = false;
  for (var i = BLS_COL.PRIMERA_COMPARABLE; i <= BLS_COL.ULTIMA_COMPARABLE; i++) {
    if (_blsCelda_(previa, i) !== _blsCelda_(nueva, i)) {
      if (i === BLS_COL.CLAN_TAG || i === BLS_COL.CLAN_NOMBRE) difiereClan = true;
      else difiereOtro = true;
    }
  }
  if (difiereOtro) return 'otros';
  return difiereClan ? 'clan' : 'igual';
}

// CSV Y PUNTO DE CONTROL [→ Contexto_Base_Web.md §06B012]

/**
 * _blsLeerCsv_(nombre, headersEsperados) [→ Contexto_Base_Web.md §06B013]
 */
function _blsLeerCsv_(nombre, headersEsperados) {
  var texto = _loadCSVFromDrive(nombre);
  if (!texto || !String(texto).trim()) return { ok: true, rows: [] };
  var parsed = _parseCSV(texto);
  if (!parsed || !parsed.length) return { ok: true, rows: [] };
  var cab = parsed[0].map(function (h) { return String(h).replace(/^﻿/, '').trim(); });
  var esperado = headersEsperados.join('|');
  // Encabezado ANTERIOR (sin la ultima columna, LadoBarco): se acepta y se completa con vacios.
  var anterior = headersEsperados.slice(0, headersEsperados.length - 1).join('|');
  var esAnterior = (nombre === BLS_CSV_NOMBRE) && cab.join('|') === anterior;
  if (cab.join('|') !== esperado && !esAnterior) {
    return { ok: false, error: nombre + ' existe con un encabezado distinto al esperado (' +
      headersEsperados.join(', ') + '). No se toca nada; revisar el archivo.' };
  }
  var filas = [];
  for (var i = 1; i < parsed.length; i++) {
    var fila = parsed[i];
    if (fila.length === 1 && String(fila[0]).trim() === '') continue;
    while (fila.length < headersEsperados.length) fila.push('');
    filas.push(fila);
  }
  return { ok: true, rows: filas };
}

function _blsRenumerar_(filas) {
  for (var i = 0; i < filas.length; i++) filas[i][0] = i + 1;
}

/**
 * _blsGuardarTodo_(...) [→ Contexto_Base_Web.md §06B014]
 */
function _blsGuardarTodo_(filas, revFilas, revNuevas, hechos, revisionDisponible) {
  filas.sort(function (a, b) {
    var ka = String(a[BLS_COL.BATTLETIME]), kb = String(b[BLS_COL.BATTLETIME]);
    if (ka !== kb) return ka < kb ? -1 : 1;
    var ta = String(a[BLS_COL.TAG]), tb = String(b[BLS_COL.TAG]);
    if (ta === tb) return 0;
    return ta < tb ? -1 : 1;
  });
  _blsRenumerar_(filas);
  _saveCSVToDrive(BLS_CSV_NOMBRE, _encodeCSV([BLS_HEADERS].concat(filas)));

  if (revisionDisponible && revNuevas.length) {
    var todas = revFilas.concat(revNuevas);
    _blsRenumerar_(todas);
    _saveCSVToDrive(BLS_REVISION_CSV_NOMBRE, _encodeCSV([BLS_REVISION_HEADERS].concat(todas)));
  }
  _blsGuardarProgreso_(hechos);
}

function _blsGuardarProgreso_(hechos) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var contenido = JSON.stringify({ _ts: Date.now(), tags: Object.keys(hechos) });
    var it = folder.getFilesByName(BLS_PROGRESO_FILE);
    if (it.hasNext()) it.next().setContent(contenido);
    else folder.createFile(BLS_PROGRESO_FILE, contenido, MimeType.PLAIN_TEXT);
  } catch (e) {
    Logger.log('[Battlelogs/Siembra] Error guardando el punto de control: ' + e.message);
  }
}

function _blsCargarProgreso_() {
  var hechos = {};
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var it = folder.getFilesByName(BLS_PROGRESO_FILE);
    if (!it.hasNext()) return hechos;
    var file = it.next();
    var parsed = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if (!parsed || !parsed._ts || Date.now() - Number(parsed._ts) > BLS_PROGRESO_MAX_EDAD_MS) {
      file.setTrashed(true);
      return hechos;
    }
    var lista = parsed.tags || [];
    for (var i = 0; i < lista.length; i++) hechos[lista[i]] = true;
  } catch (e) {
    Logger.log('[Battlelogs/Siembra] Error leyendo el punto de control (se empieza desde cero; el CSV evita duplicados): ' + e.message);
  }
  return hechos;
}

function _blsBorrarProgreso_() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var it = folder.getFilesByName(BLS_PROGRESO_FILE);
    while (it.hasNext()) it.next().setTrashed(true);
  } catch (e) {
    Logger.log('[Battlelogs/Siembra] Error borrando el punto de control: ' + e.message);
  }
}