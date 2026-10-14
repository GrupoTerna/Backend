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
    var carpeta = DriveApp.getFolderById(CARPETAS_CLAN_[claves[c]]);
    console.log('── ' + carpeta.getName() + ' ──');
    var archivos = _archivosDeCarpetaClan_(carpeta);

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
