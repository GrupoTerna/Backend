// ==============================================================================
// 03_Indice_Sheet.gs
// Todo lo relativo a la hoja Indice (orden y visibilidad de hojas).
// ==============================================================================

// ----- Funciones manuales / punto de entrada -----

/**
 * importarIndiceDesdeCSV() [→ Contexto_Base_Web.md §03B001]
 */
function importarIndiceDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.INDICE);
  if (!sh) { Logger.log('[Índice] Hoja no existe, se omite import.'); return; }
  if (sh.getLastRow() >= 2) {
    Logger.log('[Índice] Ya tiene datos, se omite import desde CSV.');
    return;
  }
  var csv = _loadCSVFromDrive('Backup_Índice.csv');
  if (!csv) { Logger.log('[Índice] No hay Backup_Índice.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[Índice] Backup_Índice.csv sin filas de datos.'); return; }

  var totalCols = _indiceTotalCols();
  var nombreAIdx = _mapaNombreAIdxDesdeHoja(sh, totalCols, 1);
  var filas;
  if (Object.keys(nombreAIdx).length > 0) {
    var csvIdxAIdx = _mapearIndicesCSVPorEncabezado(parsed[0], nombreAIdx);
    filas = parsed.slice(1).map(function (fila) {
      return _reconstruirFilaCSVPorEncabezado(fila, csvIdxAIdx, totalCols);
    });
  } else {
    // Red de seguridad: si la hoja todavía no tiene encabezado en la fila 1 [→ Contexto_Base_Web.md §03B002]
    Logger.log('[Índice][ALERTA] Sin encabezado en la fila 1 al restaurar ' +
               '(¿corrió antes que setupAllSheets()?) -- se restaura POR POSICIÓN como respaldo.');
    var idxFechaCsv = parsed[0].indexOf('Fecha');
    filas = parsed.slice(1).map(function (fila) {
      if (idxFechaCsv < 0) return fila;
      return fila.slice(0, idxFechaCsv).concat(fila.slice(idxFechaCsv + 1));
    });
  }

  sh.getRange(2, 1, filas.length, totalCols).setValues(filas);
  Logger.log('[Índice] Restaurada desde CSV: ' + filas.length + ' fila(s). ' +
             'actualizarIndiceSheet() se encargará de conciliar por ID contra las hojas reales.');
}

/**
 * actualizarIndiceSheet() [→ Contexto_Base_Web.md §03B003]
 */
function actualizarIndiceSheet() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.INDICE);
  if (!sh) return;

  // Mapa de hojas reales por su sheetId (estable: NO cambia si se renombra [→ Contexto_Base_Web.md §03B004]
  var hojasPorId = {};
  var hojas = ss.getSheets();
  for (var h = 0; h < hojas.length; h++) hojasPorId[String(hojas[h].getSheetId())] = hojas[h].getName();

  var colNombre      = _colIndiceFor('Nombre');
  var colVisibilidad = _colIndiceFor('Visibilidad');
  var colTipo        = _colIndiceFor('Tipo');
  var colEdicion     = _colIndiceFor('Edición');
  var colId          = _colIndiceFor('ID');
  var totalCols      = _indiceTotalCols();

  // DIAGNÓSTICO TEMPORAL (12-ago-2026, pedido del usuario): "Visibilidad/ [→ Contexto_Base_Web.md §03B005]
  Logger.log('[Índice][DIAG] --- INICIO reconciliación. Hojas reales detectadas: ' +
    Object.keys(hojasPorId).length + ' | Filas leídas de la hoja Índice: ' + (sh.getLastRow() - 1));

var numFilas = sh.getLastRow() - 1;
  var filas = []; // {nombre, visibilidad, tipo, edicion, vigente, id}
  var nombresVistos = {}; // Nombre -> true. UNA fila por Nombre, máximo.
  if (numFilas > 0) {
    var data = sh.getRange(2, 1, numFilas, totalCols).getValues();
    for (var i = 0; i < data.length; i++) {
      var nombre = String(data[i][colNombre - 1] || '').trim();
      if (!nombre) continue;

      // Corrección (30/07/2026): "se ha generado un montón de registros, [→ Contexto_Base_Web.md §03B006]
      if (nombresVistos[nombre]) {
        Logger.log('[Índice][DIAG] Fila ' + (i + 2) + ' DESCARTADA por duplicado de Nombre: "' + nombre + '"');
        continue;
      }

      var id = String(data[i][colId - 1] || '').trim();
      var idOriginalCsv = id;
      var existe = id && hojasPorId.hasOwnProperty(id);
      var comoMatcheo = existe ? 'ID directo (' + id + ')' : null;
      if (!existe) {
        for (var sid in hojasPorId) {
          if (hojasPorId[sid] === nombre) { id = sid; existe = true; comoMatcheo = 'Nombre (ID viejo "' + idOriginalCsv + '" -> ID nuevo "' + sid + '")'; break; }
        }
      }
      if (!existe) comoMatcheo = 'SIN MATCH (huérfana, Vigente pasa a No; si hay una hoja real con este nombre, se re-creará más abajo con valores por DEFECTO)';

      Logger.log('[Índice][DIAG] Fila ' + (i + 2) + ' | Nombre="' + nombre + '" | ID leído="' + idOriginalCsv +
        '" | Visibilidad="' + String(data[i][colVisibilidad - 1] || '') + '" | Tipo="' + String(data[i][colTipo - 1] || '') +
        '" | Edición="' + String(data[i][colEdicion - 1] || '') + '" | Match: ' + comoMatcheo);

      filas.push({
        nombre: existe ? hojasPorId[id] : nombre, // refleja el nombre actual si fue renombrada
        visibilidad: String(data[i][colVisibilidad - 1] || '').trim(),
        tipo: String(data[i][colTipo - 1] || '').trim(),
        edicion: String(data[i][colEdicion - 1] || '').trim(),
        vigente: existe ? 'Sí' : 'No',
        id: id
      });
      nombresVistos[nombre] = true;
      if (existe) delete hojasPorId[id];
    }
  }

  // DIAGNÓSTICO 2: lo que queda en hojasPorId en este punto son hojas [→ Contexto_Base_Web.md §03B007]
  var nombresSinReconectar = [];
  for (var idPend in hojasPorId) nombresSinReconectar.push(hojasPorId[idPend] + ' (ID ' + idPend + ')');
  if (nombresSinReconectar.length > 0) {
    Logger.log('[Índice][DIAG] *** ' + nombresSinReconectar.length + ' hoja(s) NO se pudieron reconectar con la fila restaurada y van a recrearse con valores por DEFECTO: ' +
      nombresSinReconectar.join(' | '));
  } else {
    Logger.log('[Índice][DIAG] Todas las hojas reales se reconectaron correctamente con su fila restaurada (ninguna quedó con valores por defecto).');
  }

  // Lo que queda en hojasPorId son hojas reales que no tenían fila en [→ Contexto_Base_Web.md §03B008]
  for (var nuevoId in hojasPorId) {
    var nuevoNombre = hojasPorId[nuevoId];
    var def = CFG.INDICE_DEFAULTS[nuevoNombre] || { visibilidad: 'No', tipo: 'Secundario', edicion: 'Solo Lectura' };
    filas.push({
      nombre: nuevoNombre,
      visibilidad: def.visibilidad,
      tipo: def.tipo,
      edicion: def.edicion,
      vigente: 'Sí',
      id: nuevoId
    });
  }

  filas.sort(_compararFilasIndice);

  var salida = filas.map(function(f, idx) {
    var fila = new Array(totalCols);
    fila[0] = idx + 1;
    fila[colNombre - 1]      = f.nombre;
    fila[colVisibilidad - 1] = f.visibilidad;
    fila[colTipo - 1]        = f.tipo;
    fila[colEdicion - 1]     = f.edicion;
    fila[_colIndiceFor('Vigente') - 1] = f.vigente;
    fila[colId - 1]          = f.id;
    return fila;
  });

  if (salida.length > 0) {
    if (salida.length > sh.getMaxRows() - 1) {
      sh.insertRowsAfter(sh.getMaxRows(), salida.length - (sh.getMaxRows() - 1) + 5);
    }
    sh.getRange(2, 1, salida.length, totalCols).setValues(salida);
    // Limpiar filas sobrantes si el total se redujo (no debería pasar, pero por seguridad)
    var filasHoja = sh.getLastRow();
    if (filasHoja > salida.length + 1) {
      sh.getRange(salida.length + 2, 1, filasHoja - salida.length - 1, totalCols).clearContent();
    }
    applyBorderCenter(sh.getRange(2, 1, salida.length, totalCols));

    var dvVigente     = SpreadsheetApp.newDataValidation().requireValueInList(CFG.EXTRA_VIGENTE, true).setAllowInvalid(false).build();
    var dvVisibilidad = SpreadsheetApp.newDataValidation().requireValueInList(CFG.EXTRA_VISIBILIDAD, true).setAllowInvalid(false).build();
    var dvTipo        = SpreadsheetApp.newDataValidation().requireValueInList(CFG.EXTRA_TIPO, true).setAllowInvalid(false).build();
    var dvEdicion     = SpreadsheetApp.newDataValidation().requireValueInList(CFG.EXTRA_EDICION, true).setAllowInvalid(false).build();
    sh.getRange(2, _colIndiceFor('Vigente'), salida.length, 1).setDataValidation(dvVigente);
    sh.getRange(2, colVisibilidad, salida.length, 1).setDataValidation(dvVisibilidad);
    sh.getRange(2, colTipo, salida.length, 1).setDataValidation(dvTipo);
    sh.getRange(2, colEdicion, salida.length, 1).setDataValidation(dvEdicion);

    // FIX (09-ago-2026, pedido del usuario): ocultar filas de hojas ya NO [→ Contexto_Base_Web.md §03B009]
    var primerNoVigenteIdx = -1;
    for (var fi = 0; fi < filas.length; fi++) {
      if (filas[fi].vigente !== 'Sí') { primerNoVigenteIdx = fi; break; }
    }
    if (primerNoVigenteIdx === -1) {
      sh.showRows(2, salida.length);
    } else {
      if (primerNoVigenteIdx > 0) sh.showRows(2, primerNoVigenteIdx);
      sh.hideRows(2 + primerNoVigenteIdx, salida.length - primerNoVigenteIdx);
    }
  }

  Logger.log('[Índice] Actualizado con ' + salida.length + ' hojas.');
}

// ----- Funciones internas / helpers -----

function _setupIndice(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.INDICE);
  _migrarOrdenColumnasIndiceSiHaceFalta(sh);
  var headers = ['N°', 'Nombre', 'ID'].concat(CFG.INDICE_COLUMNAS);
  // Se reescribe siempre (no solo si está vacía): así una hoja con [→ Contexto_Base_Web.md §03B010]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  _aplicarFormatoCondicionalIndice(sh, headers.length);
  Logger.log('[Setup] Índice OK');
}

/**
 * _setupIndice(ss) [→ Contexto_Base_Web.md §03B011]
 */
/**
 * _colIndiceFor(campo) [→ Contexto_Base_Web.md §03B012]
 */
function _colIndiceFor(campo) {
  if (campo === 'N°') return 1;
  if (campo === 'Nombre') return 2;
  if (campo === 'ID') return 3;
  var idx = CFG.INDICE_COLUMNAS.indexOf(campo);
  return idx === -1 ? -1 : idx + 4;
}

/**
 * _migrarOrdenColumnasIndiceSiHaceFalta(sh) [→ Contexto_Base_Web.md §03B013]
 */
function _migrarOrdenColumnasIndiceSiHaceFalta(sh) {
  if (sh.getLastRow() < 1) return; // hoja recién creada, sin encabezado todavía
  var totalColsViejo = CFG.INDICE_COLUMNAS.length + 3;
  var lastCol = sh.getLastColumn();
  if (lastCol < 2) return;

  var encabezadoActual = sh.getRange(1, 1, 1, Math.min(lastCol, totalColsViejo)).getValues()[0];
  if (String(encabezadoActual[1] || '') === 'Nombre') return; // ya está en el orden nuevo
  if (String(encabezadoActual[1] || '') !== 'Vigente') return; // no es el layout viejo esperado; no tocar nada

  var numFilas = sh.getLastRow() - 1;
  if (numFilas < 1) return; // solo encabezado, nada que reacomodar

  function _viejaColIndiceFor(campo) {
    if (campo === 'N°') return 1;
    if (campo === 'Nombre') return CFG.INDICE_COLUMNAS.length + 2;
    if (campo === 'ID') return CFG.INDICE_COLUMNAS.length + 3;
    var idx = CFG.INDICE_COLUMNAS.indexOf(campo);
    return idx === -1 ? -1 : idx + 2;
  }

  var data = sh.getRange(2, 1, numFilas, totalColsViejo).getValues();
  var camposIndice = ['N°'].concat(CFG.INDICE_COLUMNAS, ['Nombre', 'ID']);
  var reordenado = data.map(function (fila) {
    var nueva = new Array(totalColsViejo);
    camposIndice.forEach(function (campo) {
      nueva[_colIndiceFor(campo) - 1] = fila[_viejaColIndiceFor(campo) - 1];
    });
    return nueva;
  });
  sh.getRange(2, 1, numFilas, totalColsViejo).setValues(reordenado);
  Logger.log('[Índice] Migradas ' + numFilas + ' fila(s) al nuevo orden de columnas (Nombre/ID después de N°).');
}

/**
 * _indiceTotalCols()
 * Número total de columnas de la hoja Índice: N° + INDICE_COLUMNAS + Nombre + ID.
 */
function _indiceTotalCols() {
  return CFG.INDICE_COLUMNAS.length + 3;
}

/**
 * _aplicarFormatoCondicionalIndice(sh, numCols) [→ Contexto_Base_Web.md §03B014]
 */
function _aplicarFormatoCondicionalIndice(sh, numCols) {
  // Limpiar reglas anteriores para evitar duplicados
  sh.clearConditionalFormatRules();

  var colTipo = _colIndiceFor('Tipo'); // columna 1-based de Tipo
  var maxRows = 1000; // rango suficiente para todas las hojas posibles
  var rango = sh.getRange(2, 1, maxRows, numCols);

  // Letra de columna para la referencia de fórmula (A=1, B=2, C=3...)
  var letraColTipo = _colLetra(colTipo);

  var reglas = [
    // Raíz → verde pastel
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letraColTipo + '2="Raíz"')
      .setBackground('#d9ead3')
      .setRanges([rango])
      .build(),
    // Secundario → azul pastel
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letraColTipo + '2="Secundario"')
      .setBackground('#cfe2f3')
      .setRanges([rango])
      .build(),
    // Respaldo → naranja pastel
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letraColTipo + '2="Respaldo"')
      .setBackground('#fce5cd')
      .setRanges([rango])
      .build(),
  ];
  sh.setConditionalFormatRules(reglas);
}

/**
 * _colLetra(n) [→ Contexto_Base_Web.md §03B015]
 */
function _colLetra(n) {
  var s = '';
  while (n > 0) {
    var r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * _compararFilasIndice(a, b) [→ Contexto_Base_Web.md §03B016]
 */
function _compararFilasIndice(a, b) {
  var rangoSiNo = function(v) { return v === 'Sí' ? 0 : 1; };
  var rVigA = rangoSiNo(a.vigente), rVigB = rangoSiNo(b.vigente);
  if (rVigA !== rVigB) return rVigA - rVigB;

  var idxVisibilidad = function(v) {
    var idx = CFG.EXTRA_VISIBILIDAD.indexOf(v);
    return idx === -1 ? CFG.EXTRA_VISIBILIDAD.length : idx;
  };
  var rVisA = idxVisibilidad(a.visibilidad), rVisB = idxVisibilidad(b.visibilidad);
  if (rVisA !== rVisB) return rVisA - rVisB;

  var idxTipo = function(t) {
    var idx = CFG.EXTRA_TIPO.indexOf(t);
    return idx === -1 ? CFG.EXTRA_TIPO.length : idx;
  };
  var rTipoA = idxTipo(a.tipo), rTipoB = idxTipo(b.tipo);
  if (rTipoA !== rTipoB) return rTipoA - rTipoB;

  var idxEdicion = function(e) {
    var idx = CFG.EXTRA_EDICION.indexOf(e);
    return idx === -1 ? CFG.EXTRA_EDICION.length : idx;
  };
  var rEdA = idxEdicion(a.edicion), rEdB = idxEdicion(b.edicion);
  if (rEdA !== rEdB) return rEdA - rEdB;

  return a.nombre.localeCompare(b.nombre, 'es');
}

/**
 * _reordenarYOcultarHojasSegunIndice() [→ Contexto_Base_Web.md §03B017]
 */
function _reordenarYOcultarHojasSegunIndice() {
  var ss = _getSs();
  var shIndice = ss.getSheetByName(CFG.SHEETS.INDICE);
  if (!shIndice) return;

  var numFilas = shIndice.getLastRow() - 1;
  if (numFilas < 1) return;

  var colNombre      = _colIndiceFor('Nombre');
  var colVisibilidad = _colIndiceFor('Visibilidad');
  var colEdicion     = _colIndiceFor('Edición');
  var colVigente     = _colIndiceFor('Vigente');
  var totalCols      = _indiceTotalCols();

  var data = shIndice.getRange(2, 1, numFilas, totalCols).getValues();

  var hojasReales = ss.getSheets();
  var visiblesRestantes = 0;
  for (var i = 0; i < hojasReales.length; i++) {
    if (!hojasReales[i].isSheetHidden()) visiblesRestantes++;
  }

  var posicion = 0;
  for (var i = 0; i < data.length; i++) {
    var nombre      = String(data[i][colNombre - 1] || '').trim();
    var visibilidad = String(data[i][colVisibilidad - 1] || '').trim();
    var edicion     = String(data[i][colEdicion - 1] || '').trim();
    var vigente     = String(data[i][colVigente - 1] || '').trim();
    if (!nombre || vigente !== 'Sí') continue;

    var sh = ss.getSheetByName(nombre);
    if (!sh) continue;

    try {
      ss.setActiveSheet(sh);
      ss.moveActiveSheet(posicion + 1);
    } catch (e) {
      Logger.log('[Índice] No se pudo reordenar "' + nombre + '": ' + e.message);
    }
    posicion++;

    if (visibilidad === 'Sí') {
      if (sh.isSheetHidden()) { sh.showSheet(); visiblesRestantes++; }
    } else {
      if (!sh.isSheetHidden()) {
        if (visiblesRestantes > 1) {
          sh.hideSheet();
          visiblesRestantes--;
        } else {
          Logger.log('[Índice] No se ocultó "' + nombre + '" para evitar dejar el documento sin pestañas visibles. Marca "Sí" en Visibilidad para otra hoja si quieres ocultar esta.');
        }
      }
    }

    if (edicion === 'Solo Lectura') _protegerSoloAdvertencia(sh);
    else _quitarProteccionAdvertencia(sh);
  }

  Logger.log('[Índice] Pestañas reordenadas/ocultadas (' + posicion + ' hojas vigentes).');
}