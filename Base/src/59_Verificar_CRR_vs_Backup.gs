/**
 * 59_Verificar_CRR_vs_Backup.gs
 *
 * Verifica que Backup_Guerra.csv tenga, para cada día de guerra, AL MENOS lo que dicen los JSON de CurrentRiverRace (30-oct-2026;
 * pedido de la usuaria; Contexto_Base_Web.md §PF300).
 *
 * Idea (la explicó la usuaria): la última captura de un día es un PISO, no el cierre del día. Con ella se sabe:
 *   - Ataques acumulados al INICIO del día = decksUsed - decksUsedToday. Eso es el cierre EXACTO del día anterior.
 *   - El día trae al menos decksUsedToday ataques (y como máximo 4), así que el acumulado del día es de decksUsed hacia arriba.
 *   - Lo que no se usó se perdió: si el sábado empieza con 5 acumulados, entre jueves y viernes se perdieron 3 de los 8 posibles
 *     y la semana ya no puede pasar de 13. Cada día agrega restricciones y se ENLAZAN de jueves a domingo (se propaga hacia
 *     adelante y hacia atrás hasta que ya no cambie nada).
 *   - Lo mismo vale para la fame y los barcos (acumulados que nunca bajan), con sus propias reglas (ver _vcrrRestriccionesSerie_).
 * El CSV nunca debe tener MENOS que el piso del JSON ni MÁS que el máximo posible. Si lo tiene, se registra (y la versión «Aplicar»
 * lo corrige subiéndolo al piso). Una captura se descarta como anomalía (no restringe) si está en la lista VCRR_ANOMALIAS, si el JSON ya
 * se movió a la carpeta Anomalías, si su periodIndex o su semana no coinciden con el nombre del archivo, o si sus números son imposibles.
 *
 * Entradas (Drive; se corren desde el editor, proyecto Base):
 *   verificarCrrVsBackupInforme()  -> SOLO INFORMA: escribe Cruce_CRR_Restricciones.csv (los rangos por jugador, clan y semana) y el CSV de
 *                                     hallazgos. No toca Backup_Guerra.csv.
 *   verificarCrrVsBackupAplicar()  -> lo mismo y además, con respaldo previo y verificación, CREA las filas de día que faltan y SUBE al piso
 *                                     del JSON los valores que estén por debajo. Nunca baja un valor ni toca uno que supere el máximo.
 *   verificarCrrVsBackupReiniciar() -> borra el avance de la corrida en curso (no el registro de JSON verificados).
 *   verificarCrrVsBackupOlvidarVerificados() -> vacía el registro de JSON verificados: la próxima corrida vuelve a leer todos los JSON.
 * REGISTRO DE JSON VERIFICADOS (Cruce_CRR_JSON_Verificados.csv): por cada JSON leído guarda clan, semana, día, nombre, fecha de modificación,
 * tamaño, cuándo se verificó y su resultado (ok o el motivo del descarte). La corrida siguiente lista los archivos de cada semana (sin leerlos) y
 * solo vuelve a leer las semanas cuyos JSON cambiaron, son nuevos o faltan, o si cambió VCRR_VERSION_REGLAS: sigue desde donde se quedó.
 * Se programa sola: cada tanda tiene su presupuesto de tiempo y, si no alcanza, deja el avance guardado y programa su continuación.
 * Los pasos son: (1) leer JSON y calcular restricciones, (2) comparar contra el CSV y registrar lo que no coincide, (3) escribir (solo Aplicar).
 * El ID de las filas de los informes es el de siempre (T_NN_S_NN_#TAG, lo agrega _encodeCSVInforme); el clan va en su propia columna.
 */

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 30-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Verificar CurrentRiverRace contra Backup_Guerra.csv: informe, aplicar, reinicio y olvidar verificados (cada principal seguida de su continuación)
//  Parte 2 — Funciones que no se corren a mano
//    - Verificar CRR: motor por tandas (estado, presupuesto y continuación)
//    - Verificar CRR, paso 1: capturas de Drive y restricciones por jugador
//    - Verificar CRR, archivo de restricciones (leer y guardar)
//    - Verificar CRR, registro de JSON verificados (listar, comparar, leer y guardar)
//    - Verificar CRR, paso 2: comparar contra el CSV y registrar hallazgos
//    - Verificar CRR, paso 3: escribir en el CSV (solo Aplicar)
//    - Rangos de un jugador para otras cadenas (corrección de guerra y cierre del día)
// Dentro de cada tema, en el orden en que se espera ejecutarlas.

var VCRR_PRESUPUESTO_MS = 3 * 60 * 1000 + 30 * 1000;   // tanda: pasado este tiempo no se empieza otra semana ni otro paso (la plataforma corta a los 6 min)
var VCRR_RESERVA_SEMANA_MS = 45 * 1000;                // tiempo que debe sobrar para EMPEZAR una semana nueva (leer unos 20 JSON y guardar lo hecho)
var VCRR_MAX_FILAS_APLICAR = 2500;                     // tope de filas a crear + modificar en una escritura (si se pasa, no se escribe nada)
var VCRR_MAX_REVISION = 400;                           // tope de series que se anotan en Revision_Guerra.csv por corrida
var VCRR_ESTADO_PROP = 'VCRR_ESTADO';                  // propiedad del script con el avance (JSON)
var VCRR_ARCHIVO_RESTRICCIONES = 'Cruce_CRR_Restricciones.csv';   // el prefijo «Cruce_» lo manda a CSV/Informes (_csvSubcarpetaDe_)
var VCRR_ARCHIVO_VERIFICADOS = 'Cruce_CRR_JSON_Verificados.csv';   // registro de los JSON ya verificados (mismo prefijo)
var VCRR_VERSION_REGLAS = 1;                           // súbela cuando cambie el cálculo de _vcrrRestriccionesSerie_: invalida el registro y se releen todos los JSON
var VCRR_ORIGEN_CREADA = 'Reconstruido - CurrentRiverRace (mínimo)';
var VCRR_ORIGEN_SUBIDA = 'Corregido - CurrentRiverRace (mínimo)';
var VCRR_DIAS = 'JVSD';                                // desplazamiento 0..3 = jueves a domingo
var _vcrrFameLimites_ = null;                          // caché de _vcrrFameLimitesPorAtaques_()
var _VCRR_CACHE_RANGOS_ = {};                          // caché por ejecución de _vcrrRangosJugadorClan_(): 'temporada|semana' -> { 'clanKey|tag': serie, '*|tag': [series del jugador en todos los clanes] }
// Topes de un jugador en la semana SUMANDO todos sus clanes (los 4 Terna y el externo; Contexto_Base_Web.md §PF160 criterio 4 y §PF302).
var VCRR_TOPE_ATAQUES_DIA = 4, VCRR_TOPE_ATAQUES_SEMANA = 16, VCRR_TOPE_BARCOS_SEMANA = 16, VCRR_TOPE_FAME_DIA = 900, VCRR_TOPE_FAME_SEMANA = 3600;

// JSON que se sabe anómalos aunque sigan en su carpeta: claves 'temporada|semana|clan en minúsculas|letra del día', por ejemplo '23|1|grupoxterna™3|V'.
// Un JSON movido a la carpeta Anomalías no hace falta anotarlo aquí: esa carpeta no se lee.
// OJO con la reenumeración de temporadas (47_Migraciones.gs): estas claves llevan la temporada y NO se ajustan solas; si hay entradas, súmales el mismo delta (REENUM_DELTA_MESES) después de reenumerar.
var VCRR_ANOMALIAS = [];

var VCRR_PASOS_NOMBRES_INFORME = [
  'CurrentRiverRace: leer los JSON de cada semana y clan y calcular los rangos de ataques, fame y barcos por día → Cruce_CRR_Restricciones.csv',
  'Backup_Guerra.csv: comparar cada día contra esos rangos y anotar lo que no coincide → CSV de hallazgos y Revision_Guerra.csv'
];
var VCRR_PASOS_NOMBRES_APLICAR = VCRR_PASOS_NOMBRES_INFORME.concat([
  'Backup_Guerra.csv: crear las filas que faltan y subir al piso del JSON lo que esté por debajo → respaldo, escritura y verificación'
]);

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Verificar CurrentRiverRace contra Backup_Guerra.csv: informe, aplicar y reinicio -----

/**
 * Solo informa (no toca Backup_Guerra.csv): deja los rangos de cada jugador en Cruce_CRR_Restricciones.csv y los hallazgos en
 * «Cruce_CRR_vs_Backup <fecha> (hallazgos).csv». Si no alcanza en una tanda, se programa sola; también se puede volver a correr para seguir.
 */
function verificarCrrVsBackupInforme() { _vcrrEjecutar_(false, false); }

/** Punto de entrada del disparador de continuación de verificarCrrVsBackupInforme() (no se corre a mano). */
function _continuarVerificarCrrVsBackupInforme() { _vcrrEjecutar_(false, true); }

/**
 * Hace lo del informe y además escribe en Backup_Guerra.csv: crea las filas de día que faltan (el JSON trae actividad ese día) y sube al piso
 * del JSON los acumulados de ataques, fame y barcos que estén por debajo. Respaldo previo y verificación incluidos.
 */
function verificarCrrVsBackupAplicar() { _vcrrEjecutar_(true, false); }

/** Punto de entrada del disparador de continuación de verificarCrrVsBackupAplicar() (no se corre a mano). */
function _continuarVerificarCrrVsBackupAplicar() { _vcrrEjecutar_(true, true); }

/** Borra el avance de la corrida en curso y su continuación pendiente. No borra ningún archivo de Drive: el registro de JSON verificados sigue, así que las semanas ya verificadas y sin cambios no se releen (para releerlas: verificarCrrVsBackupOlvidarVerificados()). */
function verificarCrrVsBackupReiniciar() {
  PropertiesService.getScriptProperties().deleteProperty(VCRR_ESTADO_PROP);
  _borrarTriggersDeContinuacion('_continuarVerificarCrrVsBackupInforme');
  _borrarTriggersDeContinuacion('_continuarVerificarCrrVsBackupAplicar');
  try {
    var raw = PropertiesService.getScriptProperties().getProperty('EJECUCION_EN_CURSO');
    var info = raw ? JSON.parse(raw) : null;
    if (info && /^verificarCrrVsBackup/.test(String(info.fn))) _liberarLockEjecucion();
  } catch (e) { /* propiedad corrupta: se deja como está */ }
  Logger.log('[VCRR] Avance de la corrida borrado. La próxima corrida recorre las semanas desde la primera, pero omite las ya verificadas y sin cambios.');
}

/** Vacía el registro de JSON verificados (no toca las restricciones ni el CSV): la próxima corrida vuelve a leer todos los JSON de Drive. */
function verificarCrrVsBackupOlvidarVerificados() {
  _saveCSVToDrive(VCRR_ARCHIVO_VERIFICADOS, _encodeCSVInforme([_vcrrEncabezadoVerificados_()]));
  Logger.log('[VCRR] Registro de JSON verificados vaciado. La próxima corrida vuelve a leer todos los JSON.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Verificar CRR: motor por tandas (estado, presupuesto y continuación) -----

/**
 * Una tanda de la cadena. aplicar = true agrega el paso 3. esContinuacion = true cuando la llama el disparador (el candado de ejecución ya
 * lo tiene esta cadena). El avance vive en la propiedad VCRR_ESTADO: { aplicar, marca, paso, idx, semanas, cont, tandas }.
 */
function _vcrrEjecutar_(aplicar, esContinuacion) {
  var nombreFn = aplicar ? 'verificarCrrVsBackupAplicar' : 'verificarCrrVsBackupInforme';
  var handler = aplicar ? '_continuarVerificarCrrVsBackupAplicar' : '_continuarVerificarCrrVsBackupInforme';
  var props = PropertiesService.getScriptProperties();
  var pasosNombres = aplicar ? VCRR_PASOS_NOMBRES_APLICAR : VCRR_PASOS_NOMBRES_INFORME;
  var pasos = [_vcrrPaso1_, _vcrrPaso2_, _vcrrPaso3_].slice(0, pasosNombres.length);

  if (esContinuacion) {
    if (_reenumeracionEnCurso_() || (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_().protegida)) {
      _borrarTriggersDeContinuacion(handler);
      _liberarLockEjecucion();
      Logger.log('[VCRR] Pausada: hay una reenumeración en curso o la ventana de guerra protegida está activa. El avance queda guardado: vuelve a correr ' + nombreFn + '() después.');
      return;
    }
  } else if (!_adquirirLockEjecucion(nombreFn)) {
    return;
  }

  var t0 = Date.now();
  var st = _vcrrLeerEstado_();
  try {
    if (st && st.aplicar !== aplicar) {
      Logger.log('[VCRR] Hay un avance guardado de la versión ' + (st.aplicar ? 'Aplicar' : 'Informe') + '. Termínalo con esa función o corre verificarCrrVsBackupReiniciar() antes de usar esta.');
      _borrarTriggersDeContinuacion(handler);
      _liberarLockEjecucion();
      return;
    }
    if (!st) {
      st = { aplicar: aplicar, marca: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss'), paso: 0, idx: 0, semanas: null, cont: {}, tandas: 0 };
      Logger.log('=== Verificar CurrentRiverRace contra Backup_Guerra.csv: INICIO (' + (aplicar ? 'Aplicar' : 'solo informe') + ') ===');
    } else {
      Logger.log('=== Verificar CurrentRiverRace contra Backup_Guerra.csv: CONTINÚA en el paso ' + (st.paso + 1) + '/' + pasos.length + ' (tanda ' + (st.tandas + 1) + ') ===');
    }
    st.tandas++;

    while (st.paso < pasos.length) {
      Logger.log('[VCRR] Ejecutando paso ' + (st.paso + 1) + '/' + pasos.length + ': ' + pasosNombres[st.paso]);
      var completo = pasos[st.paso](st, t0);
      if (!completo) {
        _vcrrGuardarEstado_(st);
        _refrescarLockEjecucion(nombreFn);
        _programarContinuacion(handler);
        Logger.log('[VCRR] Paso ' + (st.paso + 1) + '/' + pasos.length + ' incompleto: presupuesto interno agotado. Avance guardado; continuación programada en 10 s.');
        return;
      }
      Logger.log('[VCRR] Paso ' + (st.paso + 1) + '/' + pasos.length + ' COMPLETO.');
      st.paso++; st.idx = 0;
      _vcrrGuardarEstado_(st);
      if (st.paso < pasos.length && (Date.now() - t0) > VCRR_PRESUPUESTO_MS) {
        _refrescarLockEjecucion(nombreFn);
        _programarContinuacion(handler);
        Logger.log('[VCRR] Presupuesto de la tanda agotado entre pasos. Queda: paso ' + (st.paso + 1) + '/' + pasos.length + ' POR EMPEZAR. Continuación programada en 10 s.');
        return;
      }
    }
    var c = st.cont;
    Logger.log('[VCRR] FIN (' + st.tandas + ' tanda(s)). Semanas: ' + (c.semanasOmitidas || 0) + ' ya verificadas y sin cambios (no se releyeron), ' + (c.semanasSinJson || 0) + ' sin JSON. Series nuevas o recalculadas: ' + (c.series || 0) + '; con JSON anómalo o incoherente: ' + (c.anomalas || 0) + '. Hallazgos: CSV menor ' + (c.csv_menor || 0) +
      ', CSV mayor que el máximo ' + (c.csv_mayor_max || 0) + ', filas que faltan ' + (c.fila_faltante || 0) + ', acumulado que baja ' + (c.no_monotono || 0) + '. ' +
      (aplicar ? 'Filas creadas: ' + (c.creadas || 0) + ', modificadas: ' + (c.modificadas || 0) + '. ' : '(No se escribió nada en Backup_Guerra.csv.) ') +
      'Detalle en CSV/Informes: ' + VCRR_ARCHIVO_RESTRICCIONES + ' y «Cruce_CRR_vs_Backup ' + st.marca + ' (hallazgos).csv».');
    props.deleteProperty(VCRR_ESTADO_PROP);
    _borrarTriggersDeContinuacion(handler);
    _liberarLockEjecucion();
  } catch (e) {
    if (st) _vcrrGuardarEstado_(st);
    _borrarTriggersDeContinuacion(handler);
    _liberarLockEjecucion();
    Logger.log('[VCRR] ERROR: ' + e.message + '. El avance quedó guardado hasta el último paso o semana terminados; vuelve a correr ' + nombreFn + '() para seguir.');
    throw e;
  }
}

function _vcrrLeerEstado_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty(VCRR_ESTADO_PROP) || 'null'); } catch (e) { return null; }
}

function _vcrrGuardarEstado_(st) {
  PropertiesService.getScriptProperties().setProperty(VCRR_ESTADO_PROP, JSON.stringify(st));
}

/** Suma n al contador `clave` del estado. */
function _vcrrSumar_(st, clave, n) { st.cont[clave] = (st.cont[clave] || 0) + (n || 1); }

/** Lee Backup_Guerra.csv: devuelve { encabezado, filas, texto } (filas rellenadas hasta GUERRA_TOTAL_COLS) o null si no existe o está vacío. */
function _vcrrLeerBackupGuerra_() {
  var texto = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!texto) return null;
  var parsed = _parseCSV(texto);
  if (!parsed || parsed.length < 2) return null;
  var filas = parsed.slice(1);
  for (var i = 0; i < filas.length; i++) { while (filas[i].length < GUERRA_TOTAL_COLS) filas[i].push(''); }
  return { encabezado: parsed[0], filas: filas, texto: texto };
}

/** Normaliza el nombre de un clan para compararlo (minúsculas y sin espacios en los extremos); es la misma forma de las claves de _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_. */
function _vcrrClanNorm_(clan) { return String(clan === null || clan === undefined ? '' : clan).trim().toLowerCase(); }

// ----- Verificar CRR, paso 1: capturas de Drive y restricciones por jugador -----

/**
 * Paso 1. Recorre las semanas que tiene Backup_Guerra.csv (de la más vieja a la más nueva). De cada una lista sus JSON de CurrentRiverRace sin leerlos
 * y los compara con el registro de verificados: si son los mismos (y la versión de reglas es la vigente) la semana se omite; si no, se leen, se guardan
 * los rangos por jugador, clan y semana en Cruce_CRR_Restricciones.csv y se actualiza el registro. Devuelve true cuando recorrió todas las semanas;
 * false si el presupuesto se agotó (el índice de la próxima semana queda en st.idx).
 */
function _vcrrPaso1_(st, t0) {
  var bk = _vcrrLeerBackupGuerra_();
  if (!bk) { Logger.log('[VCRR] No se encontró Backup_Guerra.csv o está vacío; no se hace nada.'); st.semanas = []; return true; }
  var grupos = _excDiasAgrupar(bk.filas);
  if (!st.semanas) {
    var vistas = {}, lista = [];
    Object.keys(grupos).forEach(function (k) {
      var g = grupos[k], c = Number(g.temporada) * 1000 + Number(g.semana);
      if (!vistas[c]) { vistas[c] = true; lista.push([Number(g.temporada), Number(g.semana)]); }
    });
    lista.sort(function (a, b) { return (a[0] - b[0]) || (a[1] - b[1]); });
    st.semanas = lista;
  }
  var clanes = {};   // clave normalizada -> nombre tal como figura en el CSV
  Object.keys(grupos).forEach(function (k) { clanes[_vcrrClanNorm_(grupos[k].clan)] = grupos[k].clan; });
  var verificados = _vcrrLeerVerificados_();
  var conSeries = {};
  var yaGuardadas = _vcrrLeerRestricciones_();
  Object.keys(yaGuardadas).forEach(function (k) { conSeries[k] = true; });

  var previas = st.idx, vueltas = 0, hechas = 0, omitidas = 0, filasNuevas = [], regNuevo = [], semanasHechas = {};
  while (st.idx < st.semanas.length) {
    if (vueltas > 0 && (Date.now() - t0) > VCRR_PRESUPUESTO_MS - VCRR_RESERVA_SEMANA_MS) break;
    vueltas++;
    var t = st.semanas[st.idx][0], s = st.semanas[st.idx][1], clave = t + '|' + s;
    var archivos = _vcrrArchivosSemana_(t, s);   // solo lista (nombre, fecha y tamaño); no lee el contenido
    if (!archivos.length) { _vcrrSumar_(st, 'semanasSinJson', 1); st.idx++; continue; }
    if (_vcrrSemanaVerificada_(verificados[clave], archivos, !!conSeries[clave])) {
      _vcrrSumar_(st, 'semanasOmitidas', 1); omitidas++; st.idx++; continue;
    }
    var cap = _vcrrCapturasSemana_(t, s, archivos);
    cap.avisos.forEach(function (a) { Logger.log('[VCRR] T' + t + ' S' + s + ': JSON descartado (' + a + ').'); _vcrrSumar_(st, 'jsonDescartados', 1); });
    var series = _vcrrSeriesDeSemana_(t, s, cap.porClan), guardadas = 0;
    series.forEach(function (x) {
      if (!clanes[x.clanKey]) { _vcrrSumar_(st, 'sinClanEnCsv', 1); return; }   // clan que Backup_Guerra.csv no tiene (p. ej. NARANJA x): no se compara
      x.clan = clanes[x.clanKey];
      filasNuevas.push(x); guardadas++;
      _vcrrSumar_(st, 'series', 1);
      if (x.estado !== 'ok') _vcrrSumar_(st, 'anomalas', 1);
    });
    archivos.forEach(function (a) {
      var aviso = cap.avisos.filter(function (m) { return m.indexOf(a.nombre + ':') === 0; })[0];
      regNuevo.push(_vcrrFilaVerificado_(t, s, a, st.marca, aviso ? 'descartado: ' + aviso.slice(a.nombre.length + 2) : 'ok', guardadas));
    });
    semanasHechas[t * 1000 + s] = true;
    st.idx++; hechas++;
  }
  if (hechas > 0) {   // primero las restricciones y después el registro: si se corta entre las dos, la semana se vuelve a leer
    _vcrrGuardarRestricciones_(filasNuevas, semanasHechas);
    _vcrrGuardarVerificados_(regNuevo, semanasHechas);
  }
  var completo = st.idx >= st.semanas.length;
  if (omitidas) Logger.log('[VCRR]   semanas ya verificadas y sin cambios en sus JSON (no se releen): ' + omitidas + ' en esta tanda.');
  if (!completo) {
    Logger.log('[VCRR]   semanas revisadas: acumulado ' + st.idx + ' de ' + st.semanas.length + ' (' + Math.round(st.idx * 100 / st.semanas.length) + ' %); en tandas anteriores: ' + previas + '; faltan ' + (st.semanas.length - st.idx) + '.');
    Logger.log('[VCRR]   semanas revisadas: en esta tanda: ' + (st.idx - previas) + ' semanas (' + hechas + ' leídas de nuevo y ' + omitidas + ' sin cambios).');
    _anotarProgresoPaso_('semanas revisadas: ' + st.idx + ' de ' + st.semanas.length, st.idx);
  }
  return completo;
}

/**
 * Lista los JSON de CurrentRiverRace de una semana (CurrentRiverRace/<clan>/T-NN/S-NN) SIN leer su contenido. Devuelve
 * [{ file, nombre, clanKey, letra, modificado (ms), tamano }]. Una carpeta que falla no corta las demás.
 */
function _vcrrArchivosSemana_(temporada, semana) {
  var lista = [];
  var nT = 'T-' + _pad2_(temporada), nS = 'S-' + _pad2_(semana);
  Object.keys(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_).forEach(function (k) {
    try {
      var cT = _crrSubcarpeta_(DriveApp.getFolderById(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_[k]), nT);
      var cS = cT ? _crrSubcarpeta_(cT, nS) : null;
      if (!cS) return;
      var it = cS.getFiles();
      while (it.hasNext()) {
        var f = it.next(), nombre = f.getName(), p = _crrParsearNombre_(nombre);
        if (!p) continue;
        lista.push({ file: f, nombre: nombre, clanKey: k, letra: p.letra, modificado: f.getLastUpdated().getTime(), tamano: f.getSize() });
      }
    } catch (eClan) {
      Logger.log('[VCRR] No se pudo listar la carpeta de ' + k + ' (' + nT + ' ' + nS + '): ' + eClan.message);
    }
  });
  return lista;
}

/**
 * Lee el contenido de los JSON ya listados por _vcrrArchivosSemana_() y devuelve { porClan, avisos } (ver _vcrrCapturasDeArchivos_). Solo lee.
 * Si no se pasa la lista, la arma.
 */
function _vcrrCapturasSemana_(temporada, semana, lista) {
  var archivos = [];
  (lista || _vcrrArchivosSemana_(temporada, semana)).forEach(function (a) {
    try { archivos.push({ nombre: a.nombre, clanKey: a.clanKey, datos: JSON.parse(a.file.getBlob().getDataAsString()) }); }
    catch (eJson) { archivos.push({ nombre: a.nombre, clanKey: a.clanKey, datos: null, error: eJson.message }); }
  });
  return _vcrrCapturasDeArchivos_(archivos, temporada, semana);
}

/**
 * Función pura. archivos = [{ nombre, clanKey, datos }]. Devuelve { porClan: { clanKey: [dia0..dia3] }, avisos: [texto] } con
 * dia = { archivo, jugadores: { tag: { nombre, fame, usados, hoy, barcos } } } o null. Si hay dos archivos del mismo clan y día se queda con el de hora
 * más tardía. Descarta (y avisa) los JSON anómalos: lista VCRR_ANOMALIAS, archivo ilegible, periodIndex o semana que no coinciden con el nombre.
 */
function _vcrrCapturasDeArchivos_(archivos, temporada, semana) {
  var porClan = {}, avisos = [];
  (archivos || []).forEach(function (a) {
    var p = _crrParsearNombre_(a.nombre);
    if (!p) return;
    var clave = Number(temporada) + '|' + Number(semana) + '|' + a.clanKey + '|' + p.letra;
    if (VCRR_ANOMALIAS.indexOf(clave) >= 0) { avisos.push(a.nombre + ': está en VCRR_ANOMALIAS'); return; }
    if (!a.datos) { avisos.push(a.nombre + ': no se pudo leer (' + (a.error || 'vacío') + ')'); return; }
    if (p.temporada !== Number(temporada) || p.semana !== Number(semana)) { avisos.push(a.nombre + ': la temporada o la semana del nombre no es T' + temporada + ' S' + semana); return; }
    var d = a.datos;
    if (d.periodIndex !== undefined && d.periodIndex !== null && Number(d.periodIndex) !== p.periodIndex) { avisos.push(a.nombre + ': periodIndex ' + d.periodIndex + ' del JSON no coincide con el del nombre ' + p.periodIndex); return; }
    if (d.sectionIndex !== undefined && d.sectionIndex !== null && Number(d.sectionIndex) + 1 !== Number(semana)) { avisos.push(a.nombre + ': sectionIndex ' + d.sectionIndex + ' del JSON no corresponde a la semana ' + semana); return; }
    var part = d.clan && d.clan.participants;
    if (!part) { avisos.push(a.nombre + ': no trae clan.participants'); return; }
    var m = / (\d{2})-(\d{2})-(\d{4}) (\d{2})\.(\d{2}) /.exec(a.nombre);
    var hora = m ? Number(m[3] + m[2] + m[1] + m[4] + m[5]) : 0;
    if (!porClan[a.clanKey]) porClan[a.clanKey] = [null, null, null, null];
    var previa = porClan[a.clanKey][p.off];
    if (previa && previa.hora > hora) return;
    var jugadores = {};
    part.forEach(function (j) {
      var tag = String((j && j.tag) || '').trim();
      if (!tag) return;
      jugadores[tag] = { nombre: String(j.name || ''), fame: Number(j.fame) || 0, usados: Number(j.decksUsed) || 0, hoy: Number(j.decksUsedToday) || 0, barcos: Number(j.boatAttacks) || 0 };
    });
    porClan[a.clanKey][p.off] = { archivo: a.nombre, hora: hora, jugadores: jugadores };
  });
  return { porClan: porClan, avisos: avisos };
}

/**
 * Función pura. porClan = salida de _vcrrCapturasDeArchivos_. Devuelve una serie por (clan, jugador) con sus restricciones:
 * { temporada, semana, clanKey, tag, nombre, capturas: [bool x4], estado, notas, validos, r }. estado = 'ok', 'multiclan' (el jugador
 * aparece en dos clanes de la misma semana: se compara cada clan por separado y el «mayor que el máximo» queda como aviso), 'json_anomalo'
 * (alguna captura se descartó) o 'incoherente' (las capturas no caben juntas: no se usa la métrica que se contradice).
 */
function _vcrrSeriesDeSemana_(temporada, semana, porClan) {
  var series = [], clanesDeTag = {};
  Object.keys(porClan).forEach(function (ck) {
    porClan[ck].forEach(function (dia) {
      if (!dia) return;
      Object.keys(dia.jugadores).forEach(function (tag) { if (!clanesDeTag[tag]) clanesDeTag[tag] = {}; clanesDeTag[tag][ck] = true; });
    });
  });
  Object.keys(porClan).sort().forEach(function (ck) {
    var tags = {};
    porClan[ck].forEach(function (dia) { if (dia) Object.keys(dia.jugadores).forEach(function (t) { tags[t] = true; }); });
    Object.keys(tags).sort().forEach(function (tag) {
      var caps = [null, null, null, null], nombre = '';
      for (var d = 0; d < 4; d++) {
        var dia = porClan[ck][d];
        if (dia && dia.jugadores[tag]) { caps[d] = dia.jugadores[tag]; nombre = dia.jugadores[tag].nombre || nombre; }
      }
      var r = _vcrrRestriccionesSerie_(caps);
      var estado = 'ok', notas = r.notas.slice();
      if (r.descartadas.length) { estado = 'json_anomalo'; r.descartadas.forEach(function (m) { notas.push('captura ' + VCRR_DIAS.charAt(m.dia) + ' descartada: ' + m.motivo); }); }
      if (r.validos.length < 3) estado = 'incoherente';
      if (Object.keys(clanesDeTag[tag]).length > 1 && estado === 'ok') estado = 'multiclan';
      series.push({ temporada: Number(temporada), semana: Number(semana), clanKey: ck, tag: tag, nombre: nombre,
        capturas: caps.map(function (c) { return !!c; }), estado: estado, notas: notas.join('; '), validos: r.validos, r: r });
    });
  });
  return series;
}

/**
 * Función pura: el corazón. caps = [captura|null x4] (jueves a domingo) con captura = { usados, hoy, fame, barcos }.
 * Para cada métrica devuelve cotas del ACUMULADO AL CIERRE de cada día (lo = piso, hi = máximo posible; hi puede ser Infinity)
 * y del aumento de ese día (il, ih). Métricas: A = ataques, F = fame, B = barcos.
 *  - Ataques: la captura del día d fija el acumulado inicial (usados - hoy) = cierre EXACTO del día anterior; el día trae entre hoy y 4 ataques;
 *    el acumulado al cierre es al menos usados. El jueves empieza en 0.
 *  - Fame y barcos: una captura del día d es un piso del cierre de d y un techo del cierre de d-1 (nada baja); si trae hoy = 0 es el cierre exacto de d-1
 *    (aún no había ataques ese día) y si trae hoy = 4 es el cierre exacto de d (ya no puede sumar). Un día sin ataques posibles no suma fame ni barcos;
 *    los barcos no pueden pasar de los ataques; la fame de un día no pasa del máximo de la tabla de fame para los ataques de ese día (_vcrrFameLimitesPorAtaques_). No se usa el mínimo de la tabla como piso: en T24 S2 el JSON trae 4 ataques el domingo con la misma fame del sábado (la fame del JSON se atrasa), y con ese piso 19 series saldrían imposibles.
 *  - Se propaga hacia adelante y hacia atrás (_vcrrPropagar_) hasta que no cambie nada. Si una métrica queda sin solución, esa métrica no se usa
 *    (validos no la incluye) y se anota en notas.
 * descartadas = capturas con números imposibles (no restringen). validos = letras de las métricas utilizables.
 */
function _vcrrRestriccionesSerie_(caps) {
  var INF = Infinity, notas = [], descartadas = [], d;
  var A = { lo: [0, 0, 0, 0], hi: [4, 8, 12, 16], il: [0, 0, 0, 0], ih: [4, 4, 4, 4] };
  var F = { lo: [0, 0, 0, 0], hi: [INF, INF, INF, INF], il: [0, 0, 0, 0], ih: [900, 900, 900, 900] };
  var B = { lo: [0, 0, 0, 0], hi: [INF, INF, INF, INF], il: [0, 0, 0, 0], ih: [4, 4, 4, 4] };
  var ok = [];
  for (d = 0; d < 4; d++) {
    var c = caps[d];
    if (!c) continue;
    var motivo = '';
    if (c.hoy < 0 || c.hoy > 4) motivo = 'decksUsedToday ' + c.hoy + ' fuera de 0 a 4';
    else if (c.hoy > c.usados) motivo = 'decksUsedToday ' + c.hoy + ' mayor que decksUsed ' + c.usados;
    else if (c.usados > 4 * (d + 1)) motivo = 'decksUsed ' + c.usados + ' no cabe en ' + (d + 1) + ' día(s)';
    else if (c.usados - c.hoy > 4 * d) motivo = 'el inicio del día (' + (c.usados - c.hoy) + ') no cabe en ' + d + ' día(s) anteriores';
    else if (d === 0 && c.usados !== c.hoy) motivo = 'el jueves debe empezar en 0 ataques y empieza en ' + (c.usados - c.hoy);
    else if (c.fame < 0 || c.barcos < 0) motivo = 'fame o barcos negativos';
    else if (c.barcos > c.usados) motivo = 'boatAttacks ' + c.barcos + ' mayor que decksUsed ' + c.usados;
    if (motivo) { descartadas.push({ dia: d, motivo: motivo }); continue; }
    ok[d] = true;
    var inicio = c.usados - c.hoy;
    A.il[d] = Math.max(A.il[d], c.hoy);
    A.lo[d] = Math.max(A.lo[d], c.usados);
    if (d > 0) { A.lo[d - 1] = Math.max(A.lo[d - 1], inicio); A.hi[d - 1] = Math.min(A.hi[d - 1], inicio); }
    F.lo[d] = Math.max(F.lo[d], c.fame); B.lo[d] = Math.max(B.lo[d], c.barcos);
    if (d > 0) {
      F.hi[d - 1] = Math.min(F.hi[d - 1], c.fame); B.hi[d - 1] = Math.min(B.hi[d - 1], c.barcos);
      if (c.hoy === 0) { F.lo[d - 1] = Math.max(F.lo[d - 1], c.fame); B.lo[d - 1] = Math.max(B.lo[d - 1], c.barcos); }
    }
    if (c.hoy === 4) { F.hi[d] = Math.min(F.hi[d], c.fame); B.hi[d] = Math.min(B.hi[d], c.barcos); }
  }
  var validos = '';
  if (_vcrrPropagar_(A)) validos += 'A'; else notas.push('ataques: las capturas no caben juntas');
  // Los límites de fame y barcos dependen de los ataques (solo si los ataques son utilizables): sin ataques posibles ese día no suman; los barcos no pasan de los ataques.
  var lim = _vcrrFameLimitesPorAtaques_();
  if (validos === 'A') {
    for (d = 0; d < 4; d++) {
      F.ih[d] = lim.max[A.ih[d]];
      B.ih[d] = A.ih[d];
      B.hi[d] = Math.min(B.hi[d], A.hi[d]);
    }
  } else {
    for (d = 0; d < 4; d++) F.ih[d] = lim.max[4];
  }
  if (_vcrrPropagar_(F)) validos += 'F'; else notas.push('fame: las capturas no caben juntas');
  if (_vcrrPropagar_(B)) validos += 'B'; else notas.push('barcos: las capturas no caben juntos');
  return { A: A, F: F, B: B, validos: validos, notas: notas, descartadas: descartadas };
}

/**
 * Fame mínima y máxima de UN día según los ataques que hizo ese día (0 a 4), con la tabla de fame de siempre (_fameDescomposicionesDia_,
 * 18_CorreccionGuerra.gs; el mejor día posible con 4 ataques da 900). Devuelve { min: [5], max: [5] } indexado por ataques del día; se guarda en memoria.
 */
function _vcrrFameLimitesPorAtaques_() {
  if (_vcrrFameLimites_) return _vcrrFameLimites_;
  var mn = [], mx = [];
  for (var n = 0; n <= 4; n++) {
    var lo = Infinity, hi = 0;
    for (var b = 0; b <= n; b++) {
      _fameDescomposicionesDia_(n, b).forEach(function (x) { if (x.fame < lo) lo = x.fame; if (x.fame > hi) hi = x.fame; });
    }
    mn.push(lo === Infinity ? 0 : lo); mx.push(hi);
  }
  _vcrrFameLimites_ = { min: mn, max: mx };
  return _vcrrFameLimites_;
}

/**
 * Función pura. m = { lo, hi, il, ih } (arreglos de 4): cotas del acumulado al cierre de cada día y del aumento de cada día. El acumulado antes del
 * jueves es 0. Estrecha las cotas hacia adelante y hacia atrás hasta que no cambien. Devuelve false si alguna queda con lo > hi.
 */
function _vcrrPropagar_(m) {
  for (var vuelta = 0; vuelta < 16; vuelta++) {
    var cambio = false;
    for (var d = 0; d < 4; d++) {
      var pl = d ? m.lo[d - 1] : 0, ph = d ? m.hi[d - 1] : 0;
      var n = Math.max(m.lo[d], pl + m.il[d]); if (n !== m.lo[d]) { m.lo[d] = n; cambio = true; }
      n = Math.min(m.hi[d], ph + m.ih[d]); if (n !== m.hi[d]) { m.hi[d] = n; cambio = true; }
      n = Math.max(m.il[d], m.lo[d] - ph); if (n !== m.il[d]) { m.il[d] = n; cambio = true; }
      n = Math.min(m.ih[d], m.hi[d] - pl); if (n !== m.ih[d]) { m.ih[d] = n; cambio = true; }
      if (d) {
        n = Math.max(m.lo[d - 1], m.lo[d] - m.ih[d]); if (n !== m.lo[d - 1]) { m.lo[d - 1] = n; cambio = true; }
        n = Math.min(m.hi[d - 1], m.hi[d] - m.il[d]); if (n !== m.hi[d - 1]) { m.hi[d - 1] = n; cambio = true; }
      }
    }
    if (!cambio) break;
  }
  for (var k = 0; k < 4; k++) { if (m.lo[k] > m.hi[k] || m.il[k] > m.ih[k]) return false; }
  return true;
}

// ----- Verificar CRR, archivo de restricciones (leer y guardar) -----

/** Encabezado de Cruce_CRR_Restricciones.csv (el ID T_NN_S_NN_#TAG lo agrega _encodeCSVInforme al principio). */
function _vcrrEncabezadoRestricciones_() {
  var h = ['Temporada', 'Semana', 'Clan', 'Tag', 'Nombre', 'Capturas (J|V|S|D)', 'Estado', 'Métricas utilizables', 'Notas'];
  ['Ataques', 'Fame', 'Barcos'].forEach(function (m) {
    for (var d = 0; d < 4; d++) { h.push(m + ' acum ' + VCRR_DIAS.charAt(d) + ' min'); h.push(m + ' acum ' + VCRR_DIAS.charAt(d) + ' max'); }
  });
  for (var d2 = 0; d2 < 4; d2++) { h.push('Ataques del día ' + VCRR_DIAS.charAt(d2) + ' min'); h.push('Ataques del día ' + VCRR_DIAS.charAt(d2) + ' max'); }
  // Calculadas (no se leen de vuelta). Merma = lo desperdiciado hasta el cierre del día (tope del día por los días transcurridos menos lo acumulado);
  // máximo semanal = lo más que puede llegar la semana desde ahí (acumulado máximo más el tope de los días que faltan). Para ataques, medallas (fame) y barcos.
  ['Ataques', 'Medallas', 'Barcos'].forEach(function (m) {
    for (var d3 = 0; d3 < 4; d3++) { h.push('Merma ' + m + ' acum ' + VCRR_DIAS.charAt(d3) + ' min'); h.push('Merma ' + m + ' acum ' + VCRR_DIAS.charAt(d3) + ' max'); h.push('Máximo semanal de ' + m + ' tras ' + VCRR_DIAS.charAt(d3)); }
  });
  return h;
}

/** Una serie -> fila del archivo de restricciones. El máximo infinito (fame y barcos sin techo) queda vacío. */
function _vcrrFilaRestriccion_(x) {
  var fila = [x.temporada, x.semana, x.clan, x.tag, x.nombre, x.capturas.map(function (c, i) { return c ? VCRR_DIAS.charAt(i) : '-'; }).join('|'),
    x.estado, x.validos, x.notas];
  var num = function (v) { return v === Infinity ? '' : v; };
  [x.r.A, x.r.F, x.r.B].forEach(function (m) { for (var d = 0; d < 4; d++) { fila.push(num(m.lo[d])); fila.push(num(m.hi[d])); } });
  for (var d2 = 0; d2 < 4; d2++) { fila.push(x.r.A.il[d2]); fila.push(x.r.A.ih[d2]); }
  var topes = [4, _vcrrFameLimitesPorAtaques_().max[4], 4];   // tope de un día completo: ataques, medallas y barcos
  [x.r.A, x.r.F, x.r.B].forEach(function (m, i) {
    for (var d3 = 0; d3 < 4; d3++) { fila.push(num(topes[i] * (d3 + 1) - m.hi[d3])); fila.push(num(topes[i] * (d3 + 1) - m.lo[d3])); fila.push(num(m.hi[d3] + topes[i] * (3 - d3))); }
  });
  return fila;
}

/**
 * Guarda las series en Cruce_CRR_Restricciones.csv: quita primero las filas de las semanas recalculadas (semanasHechas = { temporada*1000+semana: true })
 * y agrega las nuevas, para que una semana releída no deje filas viejas. Lo demás del archivo se conserva.
 */
function _vcrrGuardarRestricciones_(series, semanasHechas) {
  var enc = _vcrrEncabezadoRestricciones_(), filas = [];
  var texto = _loadCSVFromDrive(VCRR_ARCHIVO_RESTRICCIONES);
  if (texto) {
    var parsed = _parseCSV(texto);
    if (parsed && parsed.length > 1) {
      var off = String(parsed[0][0]).trim() === 'ID' ? 1 : 0;
      if (parsed[0].length - off === enc.length) {   // si cambió el formato de columnas, se rehace el archivo con lo calculado ahora
        for (var i = 1; i < parsed.length; i++) {
          var f = parsed[i].slice(off);
          if (semanasHechas[Number(f[0]) * 1000 + Number(f[1])]) continue;
          filas.push(f);
        }
      } else {
        Logger.log('[VCRR] ' + VCRR_ARCHIVO_RESTRICCIONES + ' tenía otro formato de columnas: se rehace con lo calculado ahora.');
      }
    }
  }
  series.forEach(function (x) { filas.push(_vcrrFilaRestriccion_(x)); });
  _saveCSVToDrive(VCRR_ARCHIVO_RESTRICCIONES, _encodeCSVInforme([enc].concat(filas)));
}

/** Lee Cruce_CRR_Restricciones.csv y devuelve { 'temporada|semana': [serie, ...] } con el mismo formato que usan los pasos 2 y 3 (ver _vcrrSerieDeFila_). */
function _vcrrLeerRestricciones_() {
  var texto = _loadCSVFromDrive(VCRR_ARCHIVO_RESTRICCIONES), por = {};
  if (!texto) return por;
  var parsed = _parseCSV(texto);
  if (!parsed || parsed.length < 2) return por;
  var off = String(parsed[0][0]).trim() === 'ID' ? 1 : 0;
  for (var i = 1; i < parsed.length; i++) {
    var x = _vcrrSerieDeFila_(parsed[i].slice(off));
    if (!x) continue;
    var k = x.temporada + '|' + x.semana;
    if (!por[k]) por[k] = [];
    por[k].push(x);
  }
  return por;
}

/** Fila del archivo de restricciones -> serie { temporada, semana, clan, tag, nombre, capturas, estado, validos, notas, r: { A, F, B } } (vacío = Infinity en los máximos). */
function _vcrrSerieDeFila_(f) {
  if (!f || f.length < 9 + 24 + 8) return null;
  var num = function (v, vacio) { var s = String(v === undefined || v === null ? '' : v).trim(); return s === '' ? vacio : Number(s); };
  var x = { temporada: Number(f[0]), semana: Number(f[1]), clan: String(f[2]), tag: String(f[3]), nombre: String(f[4]),
    capturas: String(f[5]).split('|').map(function (v) { return v !== '-'; }), estado: String(f[6]), validos: String(f[7]), notas: String(f[8]), r: {} };
  var i = 9;
  ['A', 'F', 'B'].forEach(function (k) {
    var m = { lo: [], hi: [], il: [0, 0, 0, 0], ih: [4, 4, 4, 4] };
    for (var d = 0; d < 4; d++) { m.lo.push(num(f[i++], 0)); m.hi.push(num(f[i++], Infinity)); }
    x.r[k] = m;
  });
  for (var d2 = 0; d2 < 4; d2++) { x.r.A.il[d2] = num(f[i++], 0); x.r.A.ih[d2] = num(f[i++], 4); }
  return x;
}

// ----- Verificar CRR, registro de JSON verificados (listar, comparar, leer y guardar) -----

/** Encabezado de Cruce_CRR_JSON_Verificados.csv (el ID T_NN_S_NN lo agrega _encodeCSVInforme). Una fila por JSON. */
function _vcrrEncabezadoVerificados_() {
  return ['Temporada', 'Semana', 'Clan', 'Día', 'Archivo', 'Modificado (ms)', 'Tamaño (bytes)', 'Verificado', 'Corrida', 'Resultado', 'Series de la semana', 'Versión de reglas'];
}

/** Fila del registro de un JSON recién leído. a = elemento de _vcrrArchivosSemana_; series = cuántas series quedaron guardadas en esa semana. */
function _vcrrFilaVerificado_(t, s, a, marca, resultado, series) {
  return [t, s, a.clanKey, a.letra, a.nombre, a.modificado, a.tamano, Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss'), marca, resultado, series, VCRR_VERSION_REGLAS];
}

/** Huella de un JSON: cambia si cambia el clan, el día, el nombre, la fecha de modificación o el tamaño. */
function _vcrrHuella_(clanKey, letra, nombre, modificado, tamano) {
  return [clanKey, letra, nombre, Number(modificado), Number(tamano)].join('|');
}

/**
 * Función pura. ¿La semana ya está verificada y no cambió? reg = { huellas: [texto], series, version } del registro (o undefined si no hay);
 * archivos = los JSON que hay hoy en Drive; hayRestricciones = el archivo de restricciones ya tiene series de esa semana.
 * Sí solo si los JSON de hoy son exactamente los registrados (mismas huellas), la versión de reglas es la vigente y, cuando la semana dejó series,
 * esas series siguen en el archivo de restricciones.
 */
function _vcrrSemanaVerificada_(reg, archivos, hayRestricciones) {
  if (!reg || reg.version !== VCRR_VERSION_REGLAS) return false;
  if (reg.series > 0 && !hayRestricciones) return false;
  var hoy = archivos.map(function (a) { return _vcrrHuella_(a.clanKey, a.letra, a.nombre, a.modificado, a.tamano); }).sort();
  var antes = reg.huellas.slice().sort();
  if (hoy.length !== antes.length) return false;
  for (var i = 0; i < hoy.length; i++) { if (hoy[i] !== antes[i]) return false; }
  return true;
}

/** Lee el registro y devuelve { 'temporada|semana': { huellas, series, version } }. Una semana con filas de versiones distintas queda con version -1 (se relee). */
function _vcrrLeerVerificados_() {
  var por = {}, texto = _loadCSVFromDrive(VCRR_ARCHIVO_VERIFICADOS);
  if (!texto) return por;
  var parsed = _parseCSV(texto);
  if (!parsed || parsed.length < 2) return por;
  var off = String(parsed[0][0]).trim() === 'ID' ? 1 : 0;
  for (var i = 1; i < parsed.length; i++) {
    var f = parsed[i].slice(off);
    if (f.length < 12) continue;
    var k = Number(f[0]) + '|' + Number(f[1]);
    var version = Number(f[11]), series = Number(f[10]) || 0;
    if (!por[k]) por[k] = { huellas: [], series: series, version: version };
    else if (por[k].version !== version) por[k].version = -1;
    por[k].huellas.push(_vcrrHuella_(String(f[2]), String(f[3]), String(f[4]), f[5], f[6]));
  }
  return por;
}

/** Guarda el registro: quita las filas de las semanas releídas (semanasHechas) y agrega las nuevas; lo demás se conserva. */
function _vcrrGuardarVerificados_(filasNuevas, semanasHechas) {
  var enc = _vcrrEncabezadoVerificados_(), filas = [];
  var texto = _loadCSVFromDrive(VCRR_ARCHIVO_VERIFICADOS);
  if (texto) {
    var parsed = _parseCSV(texto);
    if (parsed && parsed.length > 1) {
      var off = String(parsed[0][0]).trim() === 'ID' ? 1 : 0;
      if (parsed[0].length - off === enc.length) {
        for (var i = 1; i < parsed.length; i++) {
          var f = parsed[i].slice(off);
          if (semanasHechas[Number(f[0]) * 1000 + Number(f[1])]) continue;
          filas.push(f);
        }
      }
    }
  }
  filasNuevas.forEach(function (f) { filas.push(f); });
  _saveCSVToDrive(VCRR_ARCHIVO_VERIFICADOS, _encodeCSVInforme([enc].concat(filas)));
}

// ----- Verificar CRR, paso 2: comparar contra el CSV y registrar hallazgos -----

/**
 * Paso 2. Compara cada semana de Cruce_CRR_Restricciones.csv contra Backup_Guerra.csv y agrega los hallazgos al CSV
 * «Cruce_CRR_vs_Backup <marca> (hallazgos).csv». Devuelve true al terminar todas las semanas; false si el presupuesto se agota.
 */
function _vcrrPaso2_(st, t0) {
  var bk = _vcrrLeerBackupGuerra_();
  if (!bk) { Logger.log('[VCRR] No se encontró Backup_Guerra.csv o está vacío; no se compara nada.'); return true; }
  var grupos = _excDiasAgrupar(bk.filas);
  var restr = _vcrrLeerRestricciones_();
  var claves = Object.keys(restr).sort(function (a, b) { var x = a.split('|'), y = b.split('|'); return (Number(x[0]) - Number(y[0])) || (Number(x[1]) - Number(y[1])); });
  if (!claves.length) { Logger.log('[VCRR] ' + VCRR_ARCHIVO_RESTRICCIONES + ' no tiene series: no hay nada que comparar.'); return true; }
  var previas = st.idx, hechas = 0, hallazgos = [], revision = [];
  while (st.idx < claves.length) {
    if (hechas > 0 && (Date.now() - t0) > VCRR_PRESUPUESTO_MS - 15000) break;
    (restr[claves[st.idx]] || []).forEach(function (x) {
      var g = grupos[[String(x.temporada), String(x.semana), x.tag, x.clan].join('|')] || null;
      if (x.estado === 'incoherente' || x.estado === 'json_anomalo') {
        hallazgos.push([x.temporada, x.semana, x.clan, x.tag, x.nombre, '', 'json_anomalo', x.estado, '', '', '', 'revisar', x.notas]);
        _vcrrSumar_(st, 'json_anomalo', 1);
      }
      var hs = _vcrrCompararSerie_(x, g);
      hs.forEach(function (h) { hallazgos.push(h); _vcrrSumar_(st, h[6], 1); });
      var menores = hs.filter(function (h) { return h[6] === 'csv_menor' || h[6] === 'fila_faltante'; });
      if (menores.length && (st.cont.revision || 0) + revision.length < VCRR_MAX_REVISION) {
        revision.push({ temporada: x.temporada, semana: x.semana, tag: x.tag, nombre: x.nombre, tipo: 'alarma',
          motivo: 'Backup_Guerra.csv tiene menos que CurrentRiverRace (o falta el día)', detalle: x.clan + ': ' + menores.slice(0, 4).map(function (h) { return h[5] + ' ' + h[7] + ' ' + h[6] + ' (CSV ' + h[8] + ', mínimo ' + h[9] + ')'; }).join('; ') });
      }
    });
    st.idx++; hechas++;
  }
  if (hallazgos.length) _vcrrGuardarHallazgos_(st.marca, hallazgos);
  if (revision.length) {   // se anota en cada tanda (el estado guardado en las propiedades del script no tiene espacio para esta lista)
    var rr = _registrarRevisionGuerra_(revision);
    _vcrrSumar_(st, 'revision', revision.length);
    Logger.log('[VCRR] Revision_Guerra.csv: ' + rr.nuevas + ' nuevas, ' + rr.actualizadas + ' actualizadas (tope ' + VCRR_MAX_REVISION + ' series por corrida).');
  }
  var completo = st.idx >= claves.length;
  if (!completo) {
    Logger.log('[VCRR]   semanas comparadas: acumulado ' + st.idx + ' de ' + claves.length + ' (' + Math.round(st.idx * 100 / claves.length) + ' %); en tandas anteriores: ' + previas + '; faltan ' + (claves.length - st.idx) + '.');
    Logger.log('[VCRR]   semanas comparadas: en esta tanda: ' + hechas + ' semanas.');
    _anotarProgresoPaso_('semanas comparadas: ' + st.idx + ' de ' + claves.length, st.idx);
  }
  return completo;
}

/**
 * Función pura. x = serie del archivo de restricciones; g = grupo del CSV (de _excDiasAgrupar) o null si el jugador no tiene filas ese clan y semana.
 * Devuelve filas de hallazgos [Temporada, Semana, Clan, Tag, Nombre, Día, Tipo, Campo, CSV, Mínimo JSON, Máximo posible, Severidad, Detalle]:
 *  - csv_menor: el CSV tiene menos que el piso del JSON (ataques de la semana, ataques del día, fame o barcos). Severidad 'error'.
 *  - csv_mayor_max: el CSV pasa del máximo posible. Severidad 'revisar' ('aviso' si el jugador estuvo en dos clanes esa semana).
 *  - fila_faltante: el JSON de ese clan y día muestra actividad y el CSV no tiene la fila del día. Severidad 'error'.
 *  - no_monotono: un acumulado del CSV baja de un día al siguiente.
 */
function _vcrrCompararSerie_(x, g) {
  var out = [], d;
  var base = function (dia, tipo, campo, csv, min, max, sev, det) {
    return [x.temporada, x.semana, x.clan, x.tag, x.nombre, VCRR_DIAS.charAt(dia), tipo, campo, csv, min, max === Infinity ? '' : max, sev, det || ''];
  };
  var campos = [['A', 'Ataques semana', GC.ATAQUES_SEM], ['F', 'Fame', GC.FAME], ['B', 'Barcos', GC.BARCOS]];
  var previo = { A: null, F: null, B: null };
  for (d = 0; d < 4; d++) {
    var fila = g && g.dias[d];
    if (!fila) {
      var actividad = x.capturas[d] && (x.r.A.lo[d] > 0 || x.r.F.lo[d] > 0 || x.r.B.lo[d] > 0 || x.r.A.il[d] > 0);
      if (actividad) out.push(base(d, 'fila_faltante', 'fila del día', '', 'A ' + x.r.A.lo[d] + ' / F ' + x.r.F.lo[d] + ' / B ' + x.r.B.lo[d], '', 'error', 'el JSON trae actividad este día y el CSV no tiene la fila'));
      continue;
    }
    campos.forEach(function (cm) {
      var k = cm[0], v = _excDiasNum(fila[cm[2] - 1]), m = x.r[k];
      if (x.validos.indexOf(k) >= 0) {
        if (v < m.lo[d]) out.push(base(d, 'csv_menor', cm[1], v, m.lo[d], m.hi[d], 'error', 'el CSV tiene menos que el piso del JSON'));
        else if (v > m.hi[d]) out.push(base(d, 'csv_mayor_max', cm[1], v, m.lo[d], m.hi[d], x.estado === 'multiclan' ? 'aviso' : 'revisar', 'el CSV pasa del máximo posible'));
      }
      if (previo[k] !== null && v < previo[k]) out.push(base(d, 'no_monotono', cm[1], v, previo[k], '', 'revisar', 'el acumulado baja respecto del día anterior del CSV'));
      previo[k] = v;
    });
    if (x.validos.indexOf('A') >= 0) {
      var hoy = _excDiasNum(fila[GC.ATAQUES_HOY - 1]);
      if (hoy < x.r.A.il[d]) out.push(base(d, 'csv_menor', 'Ataques del día', hoy, x.r.A.il[d], x.r.A.ih[d], 'error', 'el CSV tiene menos ataques del día que el piso del JSON'));
      else if (hoy > x.r.A.ih[d]) out.push(base(d, 'csv_mayor_max', 'Ataques del día', hoy, x.r.A.il[d], x.r.A.ih[d], x.estado === 'multiclan' ? 'aviso' : 'revisar', 'el CSV pasa del máximo posible del día'));
    }
  }
  return out;
}

/** Agrega las filas de hallazgos al CSV del informe de esta corrida (lo crea con su encabezado la primera vez; el ID lo agrega _encodeCSVInforme). */
function _vcrrGuardarHallazgos_(marca, hallazgos) {
  var nombre = 'Cruce_CRR_vs_Backup ' + marca + ' (hallazgos).csv';
  var enc = ['Temporada', 'Semana', 'Clan', 'Tag', 'Nombre', 'Día', 'Tipo', 'Campo', 'CSV', 'Mínimo JSON', 'Máximo posible', 'Severidad', 'Detalle'];
  var previo = _loadCSVFromDrive(nombre);
  var nuevo = _encodeCSVInforme([enc].concat(hallazgos));
  if (!previo) { _saveCSVToDrive(nombre, nuevo); return; }
  var corte = nuevo.indexOf('\n');
  _saveCSVToDrive(nombre, previo.replace(/\s+$/, '') + '\r\n' + nuevo.slice(corte + 1));
}

// ----- Verificar CRR, paso 3: escribir en el CSV (solo Aplicar) -----

/**
 * Paso 3 (solo Aplicar), de una sola vez: arma el plan con todas las semanas, hace el respaldo «Backup_Guerra ANTES de verificar CRR vs Backup <marca>.csv»,
 * crea las filas que faltan, sube al piso los acumulados que estén por debajo, vuelve a leer el CSV y verifica. Si el plan pasa de VCRR_MAX_FILAS_APLICAR
 * no escribe nada. Devuelve true si terminó (aunque haya decidido no escribir); false solo si no alcanzó el tiempo y debe reintentarse.
 */
function _vcrrPaso3_(st, t0) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[VCRR] Hay otro proceso escribiendo; se reintenta el paso en la tanda siguiente.'); return false; }
  try {
    var bk = _vcrrLeerBackupGuerra_();
    if (!bk) { Logger.log('[VCRR] No se encontró Backup_Guerra.csv o está vacío; no se escribe nada.'); return true; }
    var grupos = _excDiasAgrupar(bk.filas), restr = _vcrrLeerRestricciones_();
    var clanes = {};
    Object.keys(grupos).forEach(function (k) { clanes[_vcrrClanNorm_(grupos[k].clan)] = grupos[k].clan; });
    var casos = [], conflictos = [], nCrear = 0, nMod = 0;
    Object.keys(restr).forEach(function (k) {
      restr[k].forEach(function (x) {
        var g = grupos[[String(x.temporada), String(x.semana), x.tag, x.clan].join('|')] || null;
        var plan = _vcrrPlanSerie_(x, g, clanes);
        plan.conflictos.forEach(function (c) { conflictos.push(c); });
        var ops = plan.ops.filter(function (op) { return !op.sinCambio; });
        if (!ops.length) return;
        ops.forEach(function (op) { if (op.existe) nMod++; else nCrear++; });
        casos.push({ grupo: plan.grupo, ops: ops });
      });
    });
    if (nCrear + nMod === 0) { Logger.log('[VCRR] Nada que escribir: el CSV ya tiene lo que dicen los JSON (conflictos sin resolver: ' + conflictos.length + ').'); return true; }
    if (nCrear + nMod > VCRR_MAX_FILAS_APLICAR) {
      Logger.log('[VCRR] NO SE ESCRIBIÓ NADA: ' + (nCrear + nMod) + ' fila(s) por crear o modificar pasan el tope de ' + VCRR_MAX_FILAS_APLICAR + '. Revisa el CSV de hallazgos y sube el tope si corresponde.');
      return true;
    }
    var idxDe = new Map();
    for (var q = 0; q < bk.filas.length; q++) idxDe.set(bk.filas[q], q);
    casos.forEach(function (c) { c.ops.forEach(function (op) { if (op.existe) op.idxAntes = idxDe.get(op.fila); }); });
    var copiaAntes = bk.filas.map(function (r) { return r.slice(); });
    _saveCSVToDrive('Backup_Guerra ANTES de verificar CRR vs Backup ' + st.marca + '.csv', bk.texto);
    var res = _excDiasAplicarPlan(bk.filas, { casos: casos });
    _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([bk.encabezado].concat(bk.filas)));
    var despues = _loadCSVFromDrive('Backup_Guerra.csv');
    var parsedDespues = despues ? _parseCSV(despues) : null;
    var problemas = [];
    if (!parsedDespues || parsedDespues.length < 2) problemas.push('No se pudo releer Backup_Guerra.csv');
    else {
      var filasDespues = parsedDespues.slice(1);
      for (var b = 0; b < filasDespues.length; b++) { while (filasDespues[b].length < GUERRA_TOTAL_COLS) filasDespues[b].push(''); }
      problemas = _vcrrVerificarAplicado_(copiaAntes, filasDespues, casos, res.creadas);
    }
    st.cont.creadas = (st.cont.creadas || 0) + res.creadas;
    st.cont.modificadas = (st.cont.modificadas || 0) + res.modificadas;
    var detalle = [['Temporada', 'Semana', 'Clan', 'Tag', 'Nombre', 'Día', 'Acción', 'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana anterior', 'AtaquesSemana nueva', 'Fame anterior', 'Fame nueva', 'Barcos anterior', 'Barcos nuevo', 'Origen nuevo']];
    casos.forEach(function (c) {
      c.ops.forEach(function (op) {
        var an = op.ant;
        detalle.push([c.grupo.temporada, c.grupo.semana, c.grupo.clan, c.grupo.tag, c.grupo.nombre, VCRR_DIAS.charAt(op.dia), op.existe ? 'Modificar' : 'Crear',
          an ? an.hoy : '', op.nuevo.hoy, an ? an.sem : '', op.nuevo.sem, an ? an.fame : '', op.nuevo.fame, an ? an.barcos : '', op.nuevo.barcos, op.nuevo.origen]);
      });
    });
    conflictos.forEach(function (c) { detalle.push([c.temporada, c.semana, c.clan, c.tag, c.nombre, c.dia, 'SIN ESCRIBIR: ' + c.motivo, '', '', '', '', '', '', '', '', '']); });
    _saveCSVToDrive('Cruce_CRR_vs_Backup ' + st.marca + ' (aplicado).csv', _encodeCSVInforme(detalle));
    Logger.log('[VCRR] Escrito: ' + res.creadas + ' fila(s) creadas y ' + res.modificadas + ' modificadas; sin escribir por conflicto: ' + conflictos.length + '. ' +
      (problemas.length ? 'VERIFICACIÓN FALLÓ (' + problemas.length + '): ' + problemas.slice(0, 5).join('; ') + '. Restaurar con «Backup_Guerra ANTES de verificar CRR vs Backup ' + st.marca + '.csv».' : 'Verificación OK.'));
    return true;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Función pura. Arma las operaciones de escritura de una serie: crea el día que falta (si el JSON de ese clan y día trae actividad) y sube al piso
 * los acumulados que estén por debajo; nunca baja un valor y no toca los que pasan del máximo. clanes = { clave normalizada: nombre del clan en el CSV }.
 * Devuelve { grupo, ops, conflictos }. Las ops sirven para _excDiasAplicarPlan() (55_Reparar_DiasConExceso.gs).
 */
function _vcrrPlanSerie_(x, g, clanes) {
  var grupo = g || { temporada: String(x.temporada), semana: String(x.semana), tag: x.tag, clan: clanes[_vcrrClanNorm_(x.clan)] || x.clan, nombre: x.nombre, dias: {} };
  var ops = [], conflictos = [], prev = { a: 0, f: 0, b: 0 };
  var pideConflicto = function (d, motivo) { conflictos.push({ temporada: x.temporada, semana: x.semana, clan: grupo.clan, tag: x.tag, nombre: x.nombre, dia: VCRR_DIAS.charAt(d), motivo: motivo }); };
  var conocido = !!clanes[_vcrrClanNorm_(x.clan)];
  var usa = function (k) { return x.validos.indexOf(k) >= 0; };
  for (var d = 0; d < 4; d++) {
    var fila = g && g.dias[d];
    var A = x.r.A, F = x.r.F, B = x.r.B;
    if (!fila) {
      var actividad = x.capturas[d] && (A.lo[d] > 0 || F.lo[d] > 0 || B.lo[d] > 0 || A.il[d] > 0);
      if (!actividad) continue;
      if (!conocido) { pideConflicto(d, 'no se sabe cómo se escribe el nombre del clan en el CSV'); continue; }
      if (!usa('A') || !usa('F') || !usa('B')) { pideConflicto(d, 'el JSON de esa serie es incoherente en alguna métrica'); continue; }
      var sem = Math.max(A.lo[d], prev.a), fame = Math.max(F.lo[d], prev.f), barcos = Math.max(B.lo[d], prev.b);
      var hoy = sem - prev.a;
      if (sem > A.hi[d] || fame > F.hi[d] || barcos > B.hi[d] || hoy < A.il[d] || hoy > A.ih[d]) { pideConflicto(d, 'el mínimo no cabe con lo que ya tiene el CSV en los días vecinos'); continue; }
      ops.push({ dia: d, existe: false, sinCambio: false, ant: null, nuevo: { hoy: hoy, sem: sem, fame: fame, barcos: barcos, origen: VCRR_ORIGEN_CREADA } });
      prev = { a: sem, f: fame, b: barcos };
      continue;
    }
    var csv = { hoy: _excDiasNum(fila[GC.ATAQUES_HOY - 1]), sem: _excDiasNum(fila[GC.ATAQUES_SEM - 1]), fame: _excDiasNum(fila[GC.FAME - 1]), barcos: _excDiasNum(fila[GC.BARCOS - 1]) };
    var nSem = csv.sem, nFame = csv.fame, nBarcos = csv.barcos, nHoy = csv.hoy;
    if (usa('A') && nSem < A.lo[d]) { if (A.lo[d] <= A.hi[d]) nSem = A.lo[d]; }
    if (usa('F') && nFame < F.lo[d]) { if (F.lo[d] <= F.hi[d]) nFame = F.lo[d]; }
    if (usa('B') && nBarcos < B.lo[d]) { if (B.lo[d] <= B.hi[d]) nBarcos = B.lo[d]; }
    if (usa('A')) {
      if (nSem !== csv.sem) { var h = nSem - prev.a; if (h >= A.il[d] && h <= A.ih[d]) nHoy = h; }
      if (nHoy < A.il[d]) nHoy = A.il[d];
    }
    var cambio = nSem !== csv.sem || nFame !== csv.fame || nBarcos !== csv.barcos || nHoy !== csv.hoy;
    if (cambio) {
      ops.push({ dia: d, existe: true, fila: fila, sinCambio: false, ant: csv, nuevo: { hoy: nHoy, sem: nSem, fame: nFame, barcos: nBarcos, origen: VCRR_ORIGEN_SUBIDA } });
    }
    prev = { a: nSem, f: nFame, b: nBarcos };
  }
  return { grupo: grupo, ops: ops, conflictos: conflictos };
}

/**
 * Verifica, sobre las filas releídas de Drive, que: (1) el número de filas es el de antes más las creadas; (2) las filas que el plan no toca son idénticas;
 * (3) cada fila del plan quedó con los valores planeados. Devuelve la lista de problemas (vacía = todo bien).
 */
function _vcrrVerificarAplicado_(filasAntes, filasDespues, casos, creadasEsperadas) {
  var problemas = [];
  if (filasDespues.length !== filasAntes.length + creadasEsperadas) problemas.push('número de filas ' + filasDespues.length + ' en vez de ' + (filasAntes.length + creadasEsperadas));
  var tocadas = {};
  casos.forEach(function (c) { c.ops.forEach(function (op) { if (op.existe) tocadas[op.idxAntes] = true; }); });
  for (var i = 0; i < filasAntes.length && i < filasDespues.length; i++) {
    if (tocadas[i]) continue;
    if (filasAntes[i].join('\u0001') !== filasDespues[i].slice(0, filasAntes[i].length).join('\u0001')) { problemas.push('cambió una fila no planeada (línea ' + (i + 2) + ')'); if (problemas.length > 10) break; }
  }
  var grupos = _excDiasAgrupar(filasDespues);
  casos.forEach(function (c) {
    var g = c.grupo, gd = grupos[[g.temporada, g.semana, g.tag, g.clan].join('|')];
    var etq = 'T' + g.temporada + ' S' + g.semana + ' ' + g.tag + ' ' + g.clan + ': ';
    if (!gd) { problemas.push(etq + 'no se encuentra la serie'); return; }
    c.ops.forEach(function (op) {
      var f = gd.dias[op.dia];
      if (!f) { problemas.push(etq + 'falta la fila del día ' + VCRR_DIAS.charAt(op.dia)); return; }
      var v = { hoy: _excDiasNum(f[GC.ATAQUES_HOY - 1]), sem: _excDiasNum(f[GC.ATAQUES_SEM - 1]), fame: _excDiasNum(f[GC.FAME - 1]), barcos: _excDiasNum(f[GC.BARCOS - 1]) };
      if (v.hoy !== op.nuevo.hoy || v.sem !== op.nuevo.sem || v.fame !== op.nuevo.fame || v.barcos !== op.nuevo.barcos || String(f[GC.ORIGEN - 1]) !== op.nuevo.origen) problemas.push(etq + 'la fila del día ' + VCRR_DIAS.charAt(op.dia) + ' no quedó como se planeó');
    });
  });
  return problemas;
}

// ----- Rangos de un jugador para otras cadenas (corrección de guerra y cierre del día) -----

/**
 * Para la corrección de guerra (18_CorreccionGuerra.gs, _repartoRangosCrr_) y el cierre del día (56_CurrentRiverRace_Dias.gs, _crrAyerParaCierre_):
 * los rangos que dejan los JSON de CurrentRiverRace para UN jugador en UN clan y semana (el mismo cálculo de _vcrrRestriccionesSerie_, que es el que
 * usa la verificación de Backup_Guerra.csv). Devuelve la serie { temporada, semana, clanKey, tag, nombre, capturas, estado, notas, validos, r }, donde
 * r.A, r.F y r.B (ataques, fame y barcos) traen lo (piso) y hi (máximo posible) del acumulado al cierre de cada día y il e ih del aumento de cada día.
 * hi de la semana (domingo) es el máximo semanal: ya descuenta la merma (ataques perdidos) que muestran los JSON. Devuelve null si la semana no tiene
 * JSON, si el jugador no aparece en ese clan o si falla la lectura de Drive. Lee los JSON de la semana una sola vez por ejecución (caché en memoria).
 * Solo lee; no escribe nada. clanNombre = el nombre del clan tal como figura en la hoja o el CSV de guerra.
 */
function _vcrrRangosJugadorClan_(temporada, semana, tag, clanNombre) {
  try {
    return _vcrrCacheSemana_(temporada, semana)[_vcrrClanNorm_(clanNombre) + '|' + String(tag || '').trim()] || null;
  } catch (e) {
    Logger.log('[VCRR] No se pudieron calcular los rangos de T' + temporada + ' S' + semana + ' ' + tag + ': ' + e.message);
    return null;
  }
}

/** Mapa de la semana (con caché por ejecución): 'clanKey|tag' -> serie y '*|tag' -> lista de las series de ese jugador en todos los clanes. Lee los JSON una sola vez. */
function _vcrrCacheSemana_(temporada, semana) {
  var clave = Number(temporada) + '|' + Number(semana);
  if (!_VCRR_CACHE_RANGOS_[clave]) {
    var mapa = {};
    var archivos = _vcrrArchivosSemana_(temporada, semana);
    if (archivos.length) {
      var cap = _vcrrCapturasSemana_(temporada, semana, archivos);
      _vcrrSeriesDeSemana_(temporada, semana, cap.porClan).forEach(function (x) {
        mapa[x.clanKey + '|' + x.tag] = x;
        if (!mapa['*|' + x.tag]) mapa['*|' + x.tag] = [];
        mapa['*|' + x.tag].push(x);
      });
    }
    _VCRR_CACHE_RANGOS_[clave] = mapa;
  }
  return _VCRR_CACHE_RANGOS_[clave];
}

/** Las series de un jugador en todos los clanes de la semana (una por clan que tenga JSON suyos). [] si no hay. */
function _vcrrSeriesDeTag_(temporada, semana, tag) {
  try { return _vcrrCacheSemana_(temporada, semana)['*|' + String(tag || '').trim()] || []; }
  catch (e) { Logger.log('[VCRR] No se pudieron leer las series de T' + temporada + ' S' + semana + ' ' + tag + ': ' + e.message); return []; }
}

// ----- Suma de los clanes de un jugador y topes semanales (§PF302) -----

/** Piso conocido (campo 'lo' o 'il') de una métrica en el día d de OTRA serie del mismo jugador; 0 si esa métrica no es utilizable (un 0 siempre es un piso válido). */
function _vcrrPisoSerie_(serie, m, campo, d) {
  if (!serie || !serie.r || String(serie.validos || '').indexOf(m) < 0) return 0;
  var x = serie.r[m][campo][d];
  return (typeof x === 'number' && isFinite(x)) ? x : 0;
}

/**
 * Función pura. Los rangos de UNA serie (un jugador en un clan) ajustados con lo que ya muestran los JSON de sus OTROS clanes la misma semana, que se SUMAN:
 * los topes valen para el jugador, no para cada clan (4 ataques por día y 16 por semana; 4 barcos por día y 16 por semana; 900 medallas por día y 3600 por semana).
 * Así el máximo de este clan al cierre del día d no pasa del tope acumulado hasta ese día menos el piso que los otros clanes ya mostraban (en el domingo, el tope semanal),
 * y su aumento de ese día no pasa del tope del día menos lo que los otros ya habían hecho ese día como mínimo. Lo que los JSON de este clan dicen por sí solos
 * (su piso y su merma) no cambia: es la cuenta de ESE clan. Solo se ajustan las métricas utilizables (serie.validos).
 * Devuelve { r: {A,F,B ajustados (copia)}, conflicto, sumaOtras }. conflicto = '' si los rangos siguen siendo coherentes; si no, el texto de qué tope rompe la suma
 * de los JSON (caso del criterio 11: va a revisión manual). No modifica la serie.
 */
function _vcrrAjustarPorOtrosClanes_(serie, otras) {
  var copia = {}, d, sumaOtras = { A: [0, 0, 0, 0], F: [0, 0, 0, 0], B: [0, 0, 0, 0] };
  var validos = String((serie && serie.validos) || '');
  ['A', 'F', 'B'].forEach(function (m) {
    var x = serie.r[m];
    copia[m] = { lo: x.lo.slice(), hi: x.hi.slice(), il: x.il.slice(), ih: x.ih.slice() };
  });
  var topeDia = { A: VCRR_TOPE_ATAQUES_DIA, F: VCRR_TOPE_FAME_DIA, B: VCRR_TOPE_ATAQUES_DIA };
  var etiqueta = { A: 'ataques', F: 'medallas', B: 'barcos' };
  var topeSem = { A: VCRR_TOPE_ATAQUES_SEMANA, F: VCRR_TOPE_FAME_SEMANA, B: VCRR_TOPE_BARCOS_SEMANA };
  ['A', 'F', 'B'].forEach(function (m) {
    if (validos.indexOf(m) < 0) return;
    for (d = 0; d < 4; d++) {
      var oLo = 0, oIl = 0;
      (otras || []).forEach(function (o) { oLo += _vcrrPisoSerie_(o, m, 'lo', d); oIl += _vcrrPisoSerie_(o, m, 'il', d); });
      sumaOtras[m][d] = oLo;
      copia[m].hi[d] = Math.min(copia[m].hi[d], topeDia[m] * (d + 1) - oLo);
      copia[m].ih[d] = Math.min(copia[m].ih[d], topeDia[m] - oIl);
    }
  });
  // Lo que depende de los ataques del día (fame y barcos) se vuelve a acotar con los ataques ya ajustados, igual que en _vcrrRestriccionesSerie_.
  if (validos.indexOf('A') >= 0) {
    var lim = _vcrrFameLimitesPorAtaques_();
    for (d = 0; d < 4; d++) {
      var aih = Math.max(0, Math.min(4, copia.A.ih[d]));
      if (validos.indexOf('F') >= 0) copia.F.ih[d] = Math.min(copia.F.ih[d], lim.max[aih]);
      if (validos.indexOf('B') >= 0) { copia.B.ih[d] = Math.min(copia.B.ih[d], copia.A.ih[d]); copia.B.hi[d] = Math.min(copia.B.hi[d], copia.A.hi[d]); }
    }
  }
  var conflicto = '';
  ['A', 'F', 'B'].forEach(function (m) {
    if (validos.indexOf(m) < 0 || conflicto) return;
    if (!_vcrrPropagar_(copia[m])) {
      conflicto = 'los JSON de los clanes sumados no caben en el tope semanal de ' + topeSem[m] + ' ' + etiqueta[m] + ' (los otros clanes ya muestran ' + sumaOtras[m][3] +
        ' y este clan al menos ' + serie.r[m].lo[3] + ')';
    }
  });
  return { r: copia, conflicto: conflicto, sumaOtras: sumaOtras };
}

/**
 * Los rangos de UN jugador en UN clan y semana, ya sumados con sus otros clanes (§PF302). Para quien reparte la semana de un clan (18_CorreccionGuerra.gs,
 * _repartoRangosCrr_). Devuelve { serie, r, validos, multiclan, otras, conflicto } o null si esa semana no tiene JSON del jugador en ese clan. Con un solo clan,
 * r es el de la serie tal cual. conflicto != '' si los JSON de los clanes sumados rompen un tope semanal: eso no se reparte, va a revisión manual.
 */
function _vcrrRangosAjustadosJugadorClan_(temporada, semana, tag, clanNombre) {
  var serie = _vcrrRangosJugadorClan_(temporada, semana, tag, clanNombre);
  if (!serie) return null;
  var otras = _vcrrSeriesDeTag_(temporada, semana, tag).filter(function (x) { return x.clanKey !== serie.clanKey; });
  if (!otras.length) return { serie: serie, r: serie.r, validos: serie.validos, multiclan: false, otras: [], conflicto: '' };
  var aj = _vcrrAjustarPorOtrosClanes_(serie, otras);
  return { serie: serie, r: aj.r, validos: serie.validos, multiclan: true, otras: otras, conflicto: aj.conflicto };
}

/**
 * Función pura. series = las series de UN jugador en la semana, una por clan (salida de _vcrrSeriesDeSemana_ filtrada por tag). Suma los pisos que muestran los JSON
 * de todos sus clanes y los compara con los topes semanales (16 ataques, 16 barcos, 3600 medallas) ANTES de mirar los valores de RoyaleAPI. Devuelve
 * { clanes: { clanKey: { nombre, estado, estricto, A, B, F, conflicto } }, suma: {A,B,F}, topes, conflicto, multiclan }, con A, B y F = [mínimo, máximo] del total semanal
 * de ESE clan ya ajustado por los otros (null si la métrica no es utilizable en ese clan). conflicto = el primer tope que rompen los JSON sumados ('' si ninguno).
 */
function _vcrrResumenDeSeries_(series) {
  var out = { clanes: {}, suma: { A: 0, B: 0, F: 0 }, topes: { A: VCRR_TOPE_ATAQUES_SEMANA, B: VCRR_TOPE_BARCOS_SEMANA, F: VCRR_TOPE_FAME_SEMANA }, conflicto: '', multiclan: (series || []).length > 1 };
  var etiqueta = { A: 'ataques', F: 'medallas', B: 'barcos' };
  (series || []).forEach(function (s) {
    var otras = series.filter(function (x) { return x !== s; });
    var aj = _vcrrAjustarPorOtrosClanes_(s, otras);
    var v = String(s.validos || '');
    var fin = function (m) { return v.indexOf(m) >= 0 ? [aj.r[m].lo[3], aj.r[m].hi[3]] : null; };
    ['A', 'B', 'F'].forEach(function (m) { if (v.indexOf(m) >= 0) out.suma[m] += s.r[m].lo[3]; });
    out.clanes[s.clanKey] = { nombre: s.nombre, estado: s.estado, estricto: v.length === 3 && (s.estado === 'ok' || s.estado === 'multiclan'), A: fin('A'), B: fin('B'), F: fin('F'), conflicto: aj.conflicto };
    if (aj.conflicto && !out.conflicto) out.conflicto = aj.conflicto;
  });
  ['A', 'B', 'F'].forEach(function (m) {
    if (!out.conflicto && out.suma[m] > out.topes[m]) out.conflicto = 'los JSON de los clanes del jugador suman ' + out.suma[m] + ' ' + etiqueta[m] + ' y el tope semanal es ' + out.topes[m];
  });
  return out;
}

/** El resumen de un jugador y semana con los JSON de todos sus clanes (§PF302). null si no hay JSON suyos esa semana. */
function _vcrrResumenJugadorSemana_(temporada, semana, tag) {
  var series = _vcrrSeriesDeTag_(temporada, semana, tag);
  return series.length ? _vcrrResumenDeSeries_(series) : null;
}
