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
 *   verificarCrrVsBackupRevertirInforme() / verificarCrrVsBackupRevertirAplicar() -> §PF446: devuelven a su valor anterior las filas que «Aplicar» subió y que dejaron un día imposible.
 *   verificarCrrVsBackupOlvidarVerificados() -> vacía el registro de JSON verificados: la próxima corrida vuelve a leer todos los JSON.
 *   descartarFilasClanEquivocadoInforme()  -> (§PF339) SOLO INFORMA qué filas de VCRR_FILAS_DESCARTAR se quitarían de Backup_Guerra.csv.
 *   descartarFilasClanEquivocadoAplicar()  -> (§PF339) QUITA esas filas (clan equivocado, decisión de la usuaria), con respaldo previo y verificación. Es la única función del módulo que borra filas.
 * REGISTRO DE JSON VERIFICADOS (Cruce_CRR_JSON_Verificados.csv): por cada JSON leído guarda clan, semana, día, nombre, fecha de modificación,
 * tamaño, cuándo se verificó y su resultado (ok o el motivo del descarte). La corrida siguiente lista los archivos de cada semana (sin leerlos) y
 * solo vuelve a leer las semanas cuyos JSON cambiaron, son nuevos o faltan, o si cambió VCRR_VERSION_REGLAS: sigue desde donde se quedó.
 * Se programa sola: cada tanda tiene su presupuesto de tiempo y, si no alcanza, deja el avance guardado y programa su continuación.
 * Los pasos son: (1) leer los JSON individuales de RoyaleAPI y guardar sus totales cerrados (caché incremental), (2) leer los JSON de CurrentRiverRace, calcular restricciones y cruzar las series anómalas
 * con RoyaleAPI, (3) comparar contra el CSV y registrar lo que no coincide, (4) escribir (solo Aplicar).
 * SERIES CONFIRMADAS A MANO (VCRR_SERIES_CONFIRMADAS, §PF331): la usuaria fija a mano una serie (jugador, clan y semana) cuando comprobó el total en RoyaleAPI y las capturas se contradicen; el cruce la respeta y no la lista como «SIN RESOLVER».
 * El ID de las filas de los informes es el de siempre (T_NN_S_NN_#TAG, lo agrega _encodeCSVInforme); el clan va en su propia columna.
 */

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 30-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Verificar CurrentRiverRace contra Backup_Guerra.csv: informe, aplicar, reinicio y olvidar verificados (cada principal seguida de su continuación)
//    - Descartar filas de un clan equivocado en Backup_Guerra.csv: informe y aplicar (§PF339; se corren ANTES de verificarCrrVsBackupAplicar)
//  Parte 2 — Funciones que no se corren a mano
//    - Verificar CRR: motor por tandas (estado, presupuesto y continuación)
//    - Verificar CRR, paso 1: totales cerrados de RoyaleAPI por jugador (§PF320)
//    - Verificar CRR, paso 2: capturas de Drive y restricciones por jugador (con el cruce contra RoyaleAPI)
//    - Verificar CRR, archivo de restricciones (leer y guardar)
//    - Verificar CRR, registro de JSON verificados (listar, comparar, leer y guardar)
//    - Verificar CRR, paso 3: comparar contra el CSV y registrar hallazgos
//    - Verificar CRR, paso 4: escribir en el CSV (solo Aplicar)
//    - Descartar filas de un clan equivocado (motor, plan, hoja Guerra y verificación)
//    - Rangos de un jugador para otras cadenas (corrección de guerra y cierre del día)
// Dentro de cada tema, en el orden en que se espera ejecutarlas.

var VCRR_PRESUPUESTO_MS = 3 * 60 * 1000 + 30 * 1000;   // tanda: pasado este tiempo no se empieza otra semana ni otro paso (la plataforma corta a los 6 min)
var VCRR_RESERVA_SEMANA_MS = 45 * 1000;                // tiempo que debe sobrar para EMPEZAR una semana nueva (leer unos 20 JSON y guardar lo hecho)
var VCRR_MAX_FILAS_APLICAR = 2500;                     // tope de filas a crear + modificar en una escritura (si se pasa, no se escribe nada)
var VCRR_MAX_REVISION = 600;                           // tope de series que se anotan en Revision_Guerra.csv por corrida completa (todas las tandas). §PF318: era 400 y dejaba fuera 129 de 504 jugador-semana
var VCRR_MOTIVO_REVISION = 'Backup_Guerra.csv tiene menos que CurrentRiverRace (o falta el día)';   // §PF318: el motivo lleva además « — <clan>» (la clave de Revision_Guerra.csv no trae el clan)
var VCRR_ESTADO_PROP = 'VCRR_ESTADO';                  // propiedad del script con el avance (JSON)
var VCRR_ARCHIVO_RESTRICCIONES = 'Cruce_CRR_Restricciones.csv';   // el prefijo «Cruce_» lo manda a CSV/Informes (_csvSubcarpetaDe_)
var VCRR_ARCHIVO_RAPI = 'Cruce_CRR_RoyaleAPI.csv';                // caché de los totales cerrados de RoyaleAPI (log y perfil) leídos de sus JSON individuales (§PF320)
var VCRR_ARCHIVO_VERIFICADOS = 'Cruce_CRR_JSON_Verificados.csv';   // registro de los JSON ya verificados (mismo prefijo)
var VCRR_VERSION_REGLAS = 9;                           // súbela cuando cambie el cálculo de _vcrrRestriccionesSerie_, el cruce con RoyaleAPI (§PF320, 5), la lista VCRR_SERIES_CONFIRMADAS (§PF331, 6; §PF332, 7; §PF339, 9) o qué capturas se descartan (§PF333, 8): invalida el registro y se releen todos los JSON
var VCRR_CLAN_VETADO_KEY = 'naranja x';                 // §PF335: clave (en minúsculas) del clan vetado (CFG.VETADO_TAG) en _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_; sus JSON viejos no se listan ni se leen mientras CFG.VETADO_API_ACTIVO sea false
var VCRR_ORIGEN_CREADA = 'Reconstruido - CurrentRiverRace (mínimo)';
var VCRR_ORIGEN_SUBIDA = 'Corregido - CurrentRiverRace (mínimo)';
var VCRR_DIAS = 'JVSD';                                // desplazamiento 0..3 = jueves a domingo
var _vcrrFameLimites_ = null;                          // caché de _vcrrFameLimitesPorAtaques_()
var _VCRR_CACHE_RAPI_ = null;                          // caché por ejecución del índice de RoyaleAPI (_vcrrIndiceRapiDeDrive_)
var _VCRR_CACHE_TAGCLAN_ = {};                         // caché por ejecución de _vcrrTagDeClan_(): nombre de clan -> Tag del clan ('' si no se resuelve) (§PF445 punto 12)
var _VCRR_CACHE_RANGOS_ = {};                        // caché por ejecución de _vcrrRangosJugadorClan_(): 'temporada|semana' -> { 'clanKey|tag': serie, '*|tag': [series del jugador en todos los clanes] }
// Topes de un jugador en la semana SUMANDO todos sus clanes (los 4 Terna y el externo; Contexto_Base_Web.md §PF160 criterio 4 y §PF302).
var VCRR_TOPE_ATAQUES_DIA = 4, VCRR_TOPE_ATAQUES_SEMANA = 16, VCRR_TOPE_BARCOS_SEMANA = 16, VCRR_TOPE_FAME_DIA = 900, VCRR_TOPE_FAME_SEMANA = 3600;

// JSON que se sabe anómalos aunque sigan en su carpeta: claves 'temporada|semana|clan en minúsculas|letra del día', por ejemplo '23|1|grupoxterna™3|V'.
// Un JSON movido a la carpeta Anomalías no hace falta anotarlo aquí: esa carpeta no se lee.
// OJO con la reenumeración de temporadas (47_Migraciones.gs): estas claves llevan la temporada y NO se ajustan solas; si hay entradas, súmales el mismo delta (REENUM_DELTA_MESES) después de reenumerar.
var VCRR_ANOMALIAS = [];

// Series CONFIRMADAS A MANO por la usuaria (§PF331; 1-nov-2026): casos en que las capturas del JSON se contradicen y ella comprobó el total en RoyaleAPI.
// Cada entrada fija la serie de UN jugador en UN clan y UNA semana: temporada, semana, tag, clanKey (la clave de _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_, en minúsculas),
// nombre (solo para leer la lista) y, por métrica, A (ataques), F (fame) y B (barcos): un arreglo de 4 acumulados al cierre de J, V, S y D (cada día exacto) o un número
// (solo el total del domingo; los días quedan entre 0 y ese total). nota = de dónde sale lo confirmado. El cruce respeta la entrada: la serie queda en estado 'confirmada', con esos
// rangos y sin pasar por RoyaleAPI, así que deja de salir en «SIN RESOLVER». Una entrada sin serie esa semana (no hay JSON de ese jugador y clan) no hace nada.
// Si cambias o agregas una entrada, sube VCRR_VERSION_REGLAS: así se vuelven a calcular las semanas ya verificadas.
var VCRR_SERIES_CONFIRMADAS = [
  { temporada: 22, semana: 1, tag: '#22C090RVJ', clanKey: 'grupoxterna\u21222', nombre: 'MC-->WiLL', A: [0, 4, 7, 11], F: [0, 700, 1000, 1700], B: 0,
    nota: 'la usuaria comprobó en el perfil de RoyaleAPI (133-1) 11 ataques y 1700 medallas; ya no hay logs diarios, así que aceptó la distribución de Backup_Guerra.csv: ataques 0, 4, 3 y 4; medallas 0, 700, 300 y 700 (estimada, no verificable)' },
  { temporada: 22, semana: 5, tag: '#80QCQ9R9Y', clanKey: 'grupoxterna\u21223', nombre: 'JEQ', A: [4, 8, 12, 16], F: [500, 1100, 1700, 2300], B: 0,
    nota: 'la usuaria vio el registro 133-5 (2026-07-06) con 16 ataques y 2300 medallas, que coincide con 4 ataques por día y fame diaria de 500, 600, 600 y 600' },
  // §PF339 (2-nov-2026): series en CEROS de un clan que la usuaria DESCARTÓ (§PF337) y cuyo JSON sí trae actividad. Sin ellas, «Aplicar» volvería a crear las filas que descartarFilasClanEquivocadoAplicar() quita.
  { temporada: 22, semana: 3, tag: '#2C982888C', clanKey: 'grupo乂terna™', nombre: 'M.SEBAS', A: [0, 0, 0, 0], F: [0, 0, 0, 0], B: 0,
    nota: 'decisión de la usuaria (§PF337): en T22 S3 se conserva ™2 (RoyaleAPI: 8 ataques y 1400 medallas) y se descarta Terna, aunque el JSON de Terna traiga capturas' },
  { temporada: 23, semana: 2, tag: '#LRQ8YJRCU', clanKey: 'grupoxterna™2', nombre: 'PEDRI', A: [0, 0, 0, 0], F: [0, 0, 0, 0], B: 0,
    nota: 'decisión de la usuaria (§PF337): en T23 S2 se conserva ™3 (RoyaleAPI: 8 ataques y 1000 medallas) y se descarta ™2, cuyo JSON solo trae una captura del sábado' }
];

// Filas de Backup_Guerra.csv que se DESCARTAN por ser de un clan equivocado (§PF339; 2-nov-2026, pedido de la usuaria: «los casos similares a los cuatro de §PF337 deben eliminar las filas
// con datos erróneos del csv, debe ser una función nueva»). «Aplicar» nunca baja ni mueve filas, así que estas no se quitan solas: las quita descartarFilasClanEquivocadoAplicar().
// Cada entrada: temporada, semana, tag, clanKey (la clave de _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_, en minúsculas), nombre (solo para leer la lista), dias (letras J, V, S y D de
// los días de guerra cuya fila se quita), valores [AtaquesHoy, AtaquesSemana, Fame] que debe tener esa fila (si cambió desde la decisión, NO se quita), conserva (clan donde sí quedan los ataques) y
// nota (de dónde sale la decisión). Si cambias o agregas una entrada, no hace falta subir VCRR_VERSION_REGLAS: esta lista no entra en el cálculo de los rangos.
// Orden de uso: (1) descartarFilasClanEquivocadoInforme() para ver qué quitaría; (2) descartarFilasClanEquivocadoAplicar(); (3) verificarCrrVsBackupAplicar(), que vuelve a crear con el piso del JSON
// la fila correcta del clan que se conserva (y la del mismo día en el clan descartado, con los valores del JSON, cuando el JSON de ese clan trae acumulado ese día).
var VCRR_FILAS_DESCARTAR = [
  // --- Las cuatro decisiones de la usuaria de §PF337 (PEDRI T23 S2 no tiene filas de ™2 en el CSV: solo se bloquea con la serie en ceros de arriba) ---
  { temporada: 22, semana: 3, tag: '#2C982888C', clanKey: 'grupo乂terna™', nombre: 'M.SEBAS', dias: 'D', valores: [4, 8, 1400], conserva: 'GrupoXTerna™2',
    nota: '§PF337: el 8 y el 1400 del domingo de Terna son el acumulado de ™2' },
  { temporada: 22, semana: 3, tag: '#QRQULCCV8', clanKey: 'grupo乂terna™', nombre: 'Maikel', dias: 'D', valores: [4, 16, 3200], conserva: 'GrupoXTerna™2',
    nota: '§PF337: ™2 ya tiene 16 ataques y 2800 medallas día por día, como RoyaleAPI; la fila de Terna (3200) no coincide con nada' },
  { temporada: 22, semana: 3, tag: '#U8G029GUQ', clanKey: 'grupoxterna™2', nombre: 'Reyper', dias: 'D', valores: [0, 4, 600], conserva: 'GrupoXTerna™3',
    nota: '§PF337: en RoyaleAPI solo llega a 400 medallas y la fila de ™2 indica 600' },
  { temporada: 22, semana: 3, tag: '#U8G029GUQ', clanKey: 'mini乂ternas™', nombre: 'Reyper', dias: 'D', valores: [4, 4, 400], conserva: 'GrupoXTerna™3',
    nota: '§PF337: el domingo exacto de ™3 en el JSON es 4 / 4 / 400, igual que esta fila de Mini (clan equivocado); las filas en cero de Mini de jueves a sábado no se tocan' },
  // --- Casos similares, con el total por clan del Log de RoyaleAPI (Tampermonkey v3.18, corrida del 2-nov-2026) y el tope de 4 ataques por día ---
  { temporada: 24, semana: 2, tag: '#JVVG9YUG0', clanKey: 'grupo乂terna™', nombre: 'Fiorela', dias: 'S', valores: [4, 4, 400], conserva: 'GrupoXTerna™2',
    nota: 'Log: Terna 2 y ™2 4 ataques; el 4 del sábado es de ™2' },
  { temporada: 24, semana: 3, tag: '#UJY0PGPUV', clanKey: 'mini乂ternas™', nombre: 'кυякү', dias: 'V', valores: [4, 4, 500], conserva: 'GrupoXTerna™3',
    nota: 'Log: Mini 0 ataques (Terna 4 y ™3 4); si el viernes es de ™3 o de Terna sigue sin resolver, pero no es de Mini' },
  { temporada: 24, semana: 5, tag: '#P8Y0CQ9VR', clanKey: 'grupoxterna™2', nombre: 'SKYSER', dias: 'S', valores: [4, 8, 1300], conserva: 'Grupo乂Terna™',
    nota: 'Log: Terna 8 y ™2 8 ataques; ™2 llegó a 8 el viernes, así que el 4 del sábado es de Terna' },
  { temporada: 25, semana: 1, tag: '#U8G029GUQ', clanKey: 'grupoxterna™3', nombre: 'Reyper', dias: 'S', valores: [4, 4, 700], conserva: 'GrupoXTerna™2',
    nota: 'Log: ™2 7 y ™3 4 ataques; ™3 llegó a 4 el viernes, así que el 4 del sábado es de ™2' },
  { temporada: 25, semana: 1, tag: '#VUVC9P8VL', clanKey: 'grupoxterna™3', nombre: 'Percape', dias: 'S', valores: [4, 4, 600], conserva: 'GrupoXTerna™2',
    nota: 'Log: ™2 4 y ™3 0 ataques; el 4 del sábado es de ™2' }
];
var VCRR_MAX_FILAS_DESCARTAR = 30;                     // tope de filas que una corrida puede quitar de Backup_Guerra.csv (si se pasa, no se quita nada)
var VCRR_REVERTIR_MARCA = '2026-11-11 10.13.05';       // §PF446: marca de la corrida de «Aplicar» cuyo respaldo previo («Backup_Guerra ANTES de verificar CRR vs Backup <marca>.csv») usa la reversión
var VCRR_MAX_FILAS_REVERTIR = 150;                       // §PF446: tope de filas que una reversión puede modificar (si se pasa, no se escribe nada; la corrida del 11-nov dejó 84)

var VCRR_PASOS_NOMBRES_INFORME = [
  'RoyaleAPI: leer los JSON individuales (log y perfil cerrados) de cada jugador y guardar sus totales semanales → Cruce_CRR_RoyaleAPI.csv',
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

// ----- Descartar filas de un clan equivocado en Backup_Guerra.csv (§PF339) -----

/**
 * Solo informa (no toca Backup_Guerra.csv): lista qué filas de VCRR_FILAS_DESCARTAR quitaría descartarFilasClanEquivocadoAplicar() y cuáles no (porque ya no están, porque cambiaron
 * o porque la hoja Guerra todavía las tiene). Deja el detalle en «Cruce_CRR_vs_Backup <fecha> (descarte, informe).csv».
 */
function descartarFilasClanEquivocadoInforme() { _vcrrDescartarFilas_(false); }

/**
 * Quita de Backup_Guerra.csv las filas de VCRR_FILAS_DESCARTAR (decisión de la usuaria: son de un clan equivocado). Es la única función del módulo que BORRA filas; «Aplicar» nunca lo hace.
 * Respaldo previo («Backup_Guerra ANTES de descartar filas de clan equivocado <fecha>.csv»), verificación al releer y nada se quita si algo no cuadra. No renumera la columna N°: la
 * próxima sincronización de la hoja Guerra lo hace. Después de correrla, corre verificarCrrVsBackupAplicar() para que cree con el piso del JSON las filas correctas de los clanes que se conservan.
 */
function descartarFilasClanEquivocadoAplicar() { _vcrrDescartarFilas_(true); }

// ----- Revertir lo que «Aplicar» subió y dejó un día imposible (§PF446) -----

/**
 * Solo informa (no toca Backup_Guerra.csv): con el respaldo previo de la corrida de «Aplicar» que indica VCRR_REVERTIR_MARCA, lista las filas que «Aplicar» subió al piso del JSON y que dejaron
 * «Imposible» un día que antes no lo era (la misma prueba que ahora hace «Aplicar» antes de escribir). Deja el detalle en «Cruce_CRR_vs_Backup <fecha> (revertir, informe).csv».
 */
function verificarCrrVsBackupRevertirInforme() { _vcrrRevertirSubidas_(false); }

/**
 * Devuelve a su valor anterior (ataques del día, ataques de la semana, fame, barcos y origen) las filas que lista verificarCrrVsBackupRevertirInforme(), tomándolos del respaldo previo de «Aplicar».
 * No toca las demás filas: las que agregó runGuerra después de «Aplicar» se conservan. Respaldo previo («Backup_Guerra ANTES de revertir CRR vs Backup <fecha>.csv»), verificación al releer y nada
 * se escribe si pasa de VCRR_MAX_FILAS_REVERTIR. Después de correrla, corre generarGuerraDesglose() para comprobar que los «Imposible» bajan.
 */
function verificarCrrVsBackupRevertirAplicar() { _vcrrRevertirSubidas_(true); }

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
  var pasos = [_vcrrPasoRapi_, _vcrrPaso1_, _vcrrPaso2_, _vcrrPaso3_].slice(0, pasosNombres.length);

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
      ', CSV mayor que el máximo ' + (c.csv_mayor_max || 0) + ', filas que faltan ' + (c.fila_faltante || 0) + ', acumulado que baja ' + (c.no_monotono || 0) + ', series con JSON anómalo ' + (c.json_anomalo || 0) +
      ' (estimadas con RoyaleAPI ' + (c.estimadas_rapi || 0) + ', sin resolver ' + (c.sin_resolver_rapi || 0) + ', confirmadas a mano ' + (c.confirmadas || 0) + '). JSON de RoyaleAPI leídos de nuevo: ' + (c.rapiLeidos || 0) + '. ' +
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

// ----- Verificar CRR, paso 1: totales cerrados de RoyaleAPI por jugador (§PF320) -----

/** Encabezado de Cruce_CRR_RoyaleAPI.csv (el ID T_NN_S_NN_#TAG lo agrega _encodeCSVInforme). Una fila por total cerrado (fuente log o perfil) y una fila «archivo» por JSON ya leído. */
function _vcrrEncabezadoRapi_() { return ['Temporada', 'Semana', 'Clan', 'Tag', 'Fuente', 'Ataques', 'Fame', 'Barcos', 'Archivo', 'Modificado (ms)']; }

/**
 * Función pura. Un JSON individual de RoyaleAPI (datos = { tag, registros: [...] }) -> filas del caché: una fila «archivo» (marca que ya se leyó, aunque no traiga
 * nada útil) y una por cada registro CERRADO de fuente log (total de ESE clan) o perfil (total de todos los clanes del jugador, con el clan que mostraba el perfil).
 * Los riverrace son instantáneas abiertas: no se guardan. El clan va normalizado (_vcrrClanNorm_) para que coincida con la clave de clan de los JSON de CurrentRiverRace.
 */
function _vcrrFilasRapiDeArchivo_(nombre, modificado, datos, tagNombre) {
  var tag = String((datos && datos.tag) || tagNombre || '').trim().toUpperCase();
  var filas = [['', '', '', tag, 'archivo', '', '', '', nombre, modificado]];
  ((datos && datos.registros) || []).forEach(function (x) {
    if (!x || x.externa === true || !x.cerrada || (x.fuente !== 'log' && x.fuente !== 'perfil')) return; // §PF340: la fila de un clan externo no es el perfil Terna del jugador ni sirve de techo
    var t = Number(x.temporadaInterna), s = Number(x.semana), a = Number(x.ataques), f = Number(x.fame);
    if (!(t > 0) || !(s > 0) || !isFinite(a) || !isFinite(f)) return;
    var b = (x.barcos === null || x.barcos === undefined || x.barcos === '') ? '' : Number(x.barcos);
    if (b !== '' && !isFinite(b)) b = '';
    filas.push([t, s, _vcrrClanNorm_(_cdjNormalizarClan_(x.clan)), tag, x.fuente, a, f, b, nombre, modificado]);
  });
  return filas;
}

/**
 * Función pura. filas = filas del caché (sin encabezado ni ID) -> { 'temporada|semana': { 'TAG': { porClan: { clanKey: {A,F,B} }, perfil: {A,F,B,clanKey} | null } } }.
 * Un total que se contradice dentro de la misma fuente (mismo jugador, semana y clan con valores distintos) se descarta: no se usa para resolver nada. Si el perfil trae
 * el mismo valor con clanes distintos, queda con clanKey '' (no se sabe de qué clan es). barcos null = RoyaleAPI no lo trae.
 */
function _vcrrIndiceRapi_(filas) {
  var tmp = {}, orden = [];
  (filas || []).forEach(function (f) {
    var fuente = String(f[4]);
    if (fuente !== 'log' && fuente !== 'perfil') return;
    var t = Number(f[0]), s = Number(f[1]);
    if (!(t > 0) || !(s > 0)) return;
    var clan = String(f[2]), tag = String(f[3]).trim().toUpperCase();
    var v = { A: Number(f[5]), F: Number(f[6]), B: (f[7] === '' || f[7] === undefined || f[7] === null) ? null : Number(f[7]), clanKey: clan, malo: false };
    var k = t + '|' + s + '|' + tag + '|' + fuente + '|' + (fuente === 'log' ? clan : '');
    var previo = tmp[k];
    if (!previo) { tmp[k] = v; orden.push(k); return; }
    if (previo.A !== v.A || previo.F !== v.F || previo.B !== v.B) previo.malo = true;
    else if (previo.clanKey !== v.clanKey) previo.clanKey = '';
  });
  var out = {};
  orden.forEach(function (k) {
    var v = tmp[k];
    if (v.malo) return;
    var p = k.split('|'), ks = p[0] + '|' + p[1], tag = p[2], fuente = p[3];
    if (!out[ks]) out[ks] = {};
    if (!out[ks][tag]) out[ks][tag] = { porClan: {}, perfil: null };
    if (fuente === 'log') out[ks][tag].porClan[v.clanKey] = { A: v.A, F: v.F, B: v.B };
    else out[ks][tag].perfil = { A: v.A, F: v.F, B: v.B, clanKey: v.clanKey };
  });
  return out;
}

/** Función pura. Huella corta de lo que RoyaleAPI trae de una semana (el valor de _vcrrIndiceRapi_ para esa semana); '' si no trae nada. Si cambia, la semana se vuelve a calcular. */
function _vcrrFirmaRapi_(rapiSemana) {
  if (!rapiSemana) return '';
  var partes = [];
  Object.keys(rapiSemana).sort().forEach(function (tag) {
    var e = rapiSemana[tag];
    Object.keys(e.porClan).sort().forEach(function (ck) { var v = e.porClan[ck]; partes.push(tag + '|' + ck + '|' + v.A + '/' + v.F + '/' + v.B); });
    if (e.perfil) partes.push(tag + '|P|' + e.perfil.clanKey + '|' + e.perfil.A + '/' + e.perfil.F + '/' + e.perfil.B);
  });
  if (!partes.length) return '';
  var txt = partes.join(';'), h = 5381;
  for (var i = 0; i < txt.length; i++) h = ((h * 33) ^ txt.charCodeAt(i)) >>> 0;
  return partes.length + '-' + h.toString(36);
}

/** Lee Cruce_CRR_RoyaleAPI.csv y devuelve sus filas de datos (sin encabezado ni ID); [] si no existe. */
function _vcrrLeerFilasRapi_() {
  var texto = _loadCSVFromDrive(VCRR_ARCHIVO_RAPI);
  if (!texto) return [];
  var parsed = _parseCSV(texto);
  if (!parsed || parsed.length < 2) return [];
  var off = String(parsed[0][0]).trim() === 'ID' ? 1 : 0;
  if (parsed[0].length - off !== _vcrrEncabezadoRapi_().length) return [];   // otro formato: se rehace
  return parsed.slice(1).map(function (f) { return f.slice(off); });
}

/** El índice de RoyaleAPI para las semanas de la corrida (lee el caché una sola vez por ejecución). */
function _vcrrIndiceRapiDeDrive_() {
  if (!_VCRR_CACHE_RAPI_) _VCRR_CACHE_RAPI_ = _vcrrIndiceRapi_(_vcrrLeerFilasRapi_());
  return _VCRR_CACHE_RAPI_;
}

/**
 * Paso 1 (RoyaleAPI). Lista los JSON individuales de RoyaleAPI (carpeta DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL) SIN leerlos, compara cada uno (nombre y fecha de
 * modificación) con Cruce_CRR_RoyaleAPI.csv y lee solo los nuevos o cambiados; lo que ya no existe se quita del caché. Devuelve true cuando el caché quedó al día; false
 * si el presupuesto se agotó (lo leído ya quedó guardado y la tanda siguiente sigue con los pendientes).
 */
function _vcrrPasoRapi_(st, t0) {
  _VCRR_CACHE_RAPI_ = null;
  var carpeta = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
  var reTag = /-\s(#[0-9A-Z]+)\.json$/i;
  var lista = [], it = carpeta.getFiles();
  while (it.hasNext()) {
    var f = it.next(), m = reTag.exec(f.getName());
    if (m) lista.push({ file: f, nombre: f.getName(), tag: m[1].toUpperCase(), mod: f.getLastUpdated().getTime() });
  }
  var previas = _vcrrLeerFilasRapi_(), vistos = {}, vigentes = {};
  previas.forEach(function (f) { if (f[4] === 'archivo') vistos[f[8] + '|' + f[9]] = true; });
  lista.forEach(function (a) { vigentes[a.nombre + '|' + a.mod] = true; });
  var filas = previas.filter(function (f) { return vigentes[f[8] + '|' + f[9]]; });
  var quitadas = previas.length - filas.length;
  var pendientes = lista.filter(function (a) { return !vistos[a.nombre + '|' + a.mod]; });
  var leidos = 0, errores = 0;
  for (var i = 0; i < pendientes.length; i++) {
    if (leidos > 0 && (Date.now() - t0) > VCRR_PRESUPUESTO_MS - VCRR_RESERVA_SEMANA_MS) break;
    var a = pendientes[i];
    try { filas = filas.concat(_vcrrFilasRapiDeArchivo_(a.nombre, a.mod, JSON.parse(a.file.getBlob().getDataAsString('UTF-8')), a.tag)); }
    catch (e) { errores++; filas.push(['', '', '', a.tag, 'archivo', '', '', '', a.nombre, a.mod]); Logger.log('[VCRR] No se pudo leer ' + a.nombre + ' de RoyaleAPI (' + e.message + '); se vuelve a intentar solo si el archivo cambia.'); }
    leidos++;
  }
  if (leidos > 0 || quitadas > 0 || !previas.length) {
    _saveCSVToDrive(VCRR_ARCHIVO_RAPI, _encodeCSVInforme([_vcrrEncabezadoRapi_()].concat(filas)));
  }
  _vcrrSumar_(st, 'rapiLeidos', leidos);
  var completo = leidos >= pendientes.length;
  Logger.log('[VCRR]   RoyaleAPI: ' + lista.length + ' JSON individuales; ya en el caché ' + (lista.length - pendientes.length) + ', leídos en esta tanda ' + leidos + (errores ? ' (' + errores + ' con error)' : '') + (quitadas ? ', quitadas ' + quitadas + ' filas de archivos que ya no están' : '') + '.');
  if (!completo) _logProgresoPaso_('VCRR', 'JSON de RoyaleAPI leídos', lista.length - pendientes.length, leidos, lista.length, 'archivos');
  return completo;
}

// ----- Verificar CRR, paso 2: capturas de Drive y restricciones por jugador -----

/**
 * Paso 2. Recorre las semanas que tiene Backup_Guerra.csv (de la más vieja a la más nueva). De cada una lista sus JSON de CurrentRiverRace sin leerlos
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
  var rapiIdx = _vcrrIndiceRapiDeDrive_();   // §PF320: totales cerrados de RoyaleAPI (los dejó el paso 1)
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
    var rapiSemana = rapiIdx[clave] || {}, firmaRapi = _vcrrFirmaRapi_(rapiSemana);
    if (_vcrrSemanaVerificada_(verificados[clave], archivos, !!conSeries[clave], firmaRapi)) {
      _vcrrSumar_(st, 'semanasOmitidas', 1); omitidas++; st.idx++; continue;
    }
    var cap = _vcrrCapturasSemana_(t, s, archivos);
    cap.avisos.forEach(function (a) { Logger.log('[VCRR] T' + t + ' S' + s + ': JSON descartado (' + a + ').'); _vcrrSumar_(st, 'jsonDescartados', 1); });
    var series = _vcrrSeriesDeSemana_(t, s, cap.porClan, rapiSemana), guardadas = 0;
    series.forEach(function (x) {
      if (!clanes[x.clanKey]) { _vcrrSumar_(st, 'sinClanEnCsv', 1); return; }   // clan que Backup_Guerra.csv no tiene (p. ej. NARANJA x): no se compara
      x.clan = clanes[x.clanKey];
      filasNuevas.push(x); guardadas++;
      _vcrrSumar_(st, 'series', 1);
      if (x.estado !== 'ok') _vcrrSumar_(st, 'anomalas', 1);
      if (x.estimada) _vcrrSumar_(st, 'rapiEstimadas', 1);
      if (x.confirmada) _vcrrSumar_(st, 'confirmadas', 1);
      if (x.sinResolver) _vcrrSumar_(st, 'rapiSinResolver', 1);
    });
    archivos.forEach(function (a) {
      var aviso = cap.avisos.filter(function (m) { return m.indexOf(a.nombre + ':') === 0; })[0];
      regNuevo.push(_vcrrFilaVerificado_(t, s, a, st.marca, aviso ? 'descartado: ' + aviso.slice(a.nombre.length + 2) : 'ok', guardadas, firmaRapi));
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
 * §PF335: no lista la carpeta del clan vetado (VCRR_CLAN_VETADO_KEY) mientras CFG.VETADO_API_ACTIVO sea false (§PF334): Backup_Guerra.csv no tiene ese clan,
 * así que sus series se descartaban como «sinClanEnCsv» después de leer y calcular todo. Con la opción activa se lista como antes.
 */
function _vcrrArchivosSemana_(temporada, semana) {
  var lista = [];
  var nT = 'T-' + _pad2_(temporada), nS = 'S-' + _pad2_(semana);
  Object.keys(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_).forEach(function (k) {
    if (k === VCRR_CLAN_VETADO_KEY && !CFG.VETADO_API_ACTIVO) return;   // §PF335
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
 * dia = { archivo, hora, conDatos, jugadores: { tag: { nombre, fame, usados, hoy, barcos } } } o null. Si hay dos archivos del mismo clan y día se queda con el de hora
 * más tardía. Descarta (y avisa) los JSON anómalos: lista VCRR_ANOMALIAS, archivo ilegible, periodIndex o semana que no coinciden con el nombre, y la captura del domingo
 * completamente en blanco cuando las anteriores del clan traen datos (§PF333).
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
    // §PF333: ¿la captura trae algún dato? Fame del clan y fame, ataques y barcos de cada jugador, todo en 0 = captura en blanco (T24 S5, GrupoXTerna™3 y Mini乂Ternas™).
    var conDatos = (Number(d.clan && d.clan.fame) || 0) > 0 || part.some(function (j) {
      return j && ((Number(j.fame) || 0) > 0 || (Number(j.decksUsed) || 0) > 0 || (Number(j.decksUsedToday) || 0) > 0 || (Number(j.boatAttacks) || 0) > 0);
    });
    porClan[a.clanKey][p.off] = { archivo: a.nombre, hora: hora, jugadores: jugadores, conDatos: conDatos };
  });
  // §PF333: la captura del DOMINGO completamente en blanco se descarta cuando alguna captura anterior de ese clan en la semana (jueves a sábado) sí trae datos: los acumulados
  // de la semana no pueden volver a 0, así que esa captura es del reinicio y no de la guerra, y dejaba «incoherente» a todo el que ya había atacado. Si ninguna otra captura
  // del clan trae datos (clan realmente inactivo, o solo existe la del domingo) se conserva: ahí el 0 sí restringe lo que dice el Backup. Un domingo con 0 ataques de un
  // jugador suelto no entra aquí (la captura trae datos de otros): sigue siendo válido.
  Object.keys(porClan).forEach(function (ck) {
    var dias = porClan[ck], dom = dias[3];
    if (!dom || dom.conDatos) return;
    var previoConDatos = [0, 1, 2].some(function (k) { return dias[k] && dias[k].conDatos; });
    if (!previoConDatos) return;
    avisos.push(dom.archivo + ': captura del domingo en blanco (sin fame ni ataques en ningún participante) con datos en los días anteriores; no se usa (§PF333)');
    dias[3] = null;
    dias.domingoDescartado = true;   // propiedad del arreglo: _vcrrSeriesDeSemana_() deja a los jugadores con datos de este clan como candidatos al cruce con RoyaleAPI (el domingo exacto)
  });
  return { porClan: porClan, avisos: avisos };
}

/**
 * Función pura. porClan = salida de _vcrrCapturasDeArchivos_. Devuelve una serie por (clan, jugador) con sus restricciones:
 * { temporada, semana, clanKey, tag, nombre, capturas: [bool x4], estado, notas, validos, r }. estado = 'ok', 'multiclan' (el jugador
 * aparece en dos clanes de la misma semana: se compara cada clan por separado y el «mayor que el máximo» queda como aviso), 'json_anomalo'
 * (alguna captura se descartó) o 'incoherente' (las capturas no caben juntas: no se usa la métrica que se contradice).
 */
function _vcrrSeriesDeSemana_(temporada, semana, porClan, rapiSemana) {
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
      if (r.anomalas.length) { estado = 'json_anomalo'; r.anomalas.forEach(function (m) { notas.push('captura ' + VCRR_DIAS.charAt(m.dia) + ' anómala pero usada: ' + m.motivo); }); }
      if (r.validos.length < 3) estado = 'incoherente';
      if (Object.keys(clanesDeTag[tag]).length > 1 && estado === 'ok') estado = 'multiclan';
      // §PF333: en un clan cuyo domingo en blanco se descartó, el jugador que ya tenía datos de jueves a sábado queda candidato al cruce con RoyaleAPI aunque su serie salga 'ok':
      // sin eso perdería el domingo exacto que el total de RoyaleAPI le fijaba (§PF320). Si el cruce no lo resuelve, no se lista como «SIN RESOLVER»: la serie ya es utilizable.
      var domingoDescartado = !!porClan[ck].domingoDescartado && caps.some(function (c) { return c && (c.usados > 0 || c.fame > 0 || c.barcos > 0); });
      series.push({ temporada: Number(temporada), semana: Number(semana), clanKey: ck, tag: tag, nombre: nombre,
        capturas: caps.map(function (c) { return !!c; }), estado: estado, notas: notas.join('; '), validos: r.validos, r: r, capsDatos: caps, domingoDescartado: domingoDescartado });
    });
  });
  // §PF331: las series confirmadas a mano por la usuaria se fijan antes del cruce, que ya no las trata como candidatas.
  _vcrrAplicarConfirmadas_(series, VCRR_SERIES_CONFIRMADAS);
  // §PF320: las series anómalas se cruzan con RoyaleAPI (por clan, luego la suma del jugador, luego el perfil). rapiSemana = { 'TAG': { porClan: { clanKey: {A,F,B} }, perfil: {A,F,B,clanKey} } } o null.
  // rapiSemana undefined = no se cargó RoyaleAPI (no se cruza nada); null o {} = se cargó y esa semana no tiene datos (las anómalas quedan «sin resolver»).
  if (rapiSemana !== undefined) {
    var porTag = {};
    series.forEach(function (x) { (porTag[x.tag] = porTag[x.tag] || []).push(x); });
    Object.keys(porTag).forEach(function (tag) { _vcrrCruzarRoyaleApi_(porTag[tag], (rapiSemana && rapiSemana[String(tag).toUpperCase()]) || null); });
  }
  return series;
}

/**
 * Función pura (§PF320). Cruza con RoyaleAPI las series ANÓMALAS de UN jugador en UNA semana (series = las de todos sus clanes, de _vcrrSeriesDeSemana_, con capsDatos).
 * Orden (pedido de la usuaria, 1-nov-2026): (1) los valores de cada clan en el JSON deben ser posibles (eso ya lo dice serie.validos); (2) la suma de los clanes del jugador en cada
 * día debe seguir siendo posible (_vcrrResumenDeSeries_); (3) el total semanal de ese clan según RoyaleAPI fija el acumulado del domingo, y la suma de los clanes del JSON debe ser
 * menor o igual que el perfil de RoyaleAPI (el jugador pudo atacar en un clan externo, que el JSON no ve).
 * rapi = { porClan: { clanKey: {A,F,B} }, perfil: {A,F,B,clanKey} } (solo valores cerrados) o null. Candidata = estado json_anomalo o incoherente, o con métricas sin usar.
 * Lo que se resuelve SIGUE siendo anomalía (estado json_anomalo) pero queda con los rangos estrechados por RoyaleAPI y la nota «estimado con RoyaleAPI»; lo que no, queda con
 * serie.sinResolver = motivo (y «SIN RESOLVER: motivo» en las notas). Modifica las series. Devuelve { resueltas, sinResolver: [{ clanKey, tag, nombre, motivo }] }.
 */
function _vcrrCruzarRoyaleApi_(series, rapi) {
  var salida = { resueltas: 0, sinResolver: [] };
  var candidatas = (series || []).filter(function (x) { return x.estado === 'json_anomalo' || x.estado === 'incoherente' || String(x.validos || '').length < 3 || x.domingoDescartado; });
  if (!candidatas.length) return salida;
  // §PF333: candidata solo por tener el domingo en blanco descartado (su serie ya es utilizable): si no se resuelve, se queda como estaba y no se anota ni se lista.
  candidatas.forEach(function (x) { x.soloDomingoDescartado = !!x.domingoDescartado && (x.estado === 'ok' || x.estado === 'multiclan') && String(x.validos || '').length === 3; });
  var guardar = function (x, motivo) {
    if (x.soloDomingoDescartado) return;
    x.sinResolver = motivo;
    x.notas = (x.notas ? x.notas + '; ' : '') + 'SIN RESOLVER: ' + motivo;
    salida.sinResolver.push({ clanKey: x.clanKey, tag: x.tag, nombre: x.nombre, motivo: motivo });
  };
  var respaldos = [];
  candidatas.forEach(function (x) {
    var fin = null, origen = '', soloPerfil = false;
    if (rapi && rapi.porClan && rapi.porClan[x.clanKey]) { fin = rapi.porClan[x.clanKey]; origen = 'log'; }
    else if (rapi && rapi.perfil && series.length === 1 && rapi.perfil.clanKey === x.clanKey) { fin = rapi.perfil; origen = 'perfil'; }
    else if (rapi && rapi.perfil) soloPerfil = true;
    if (!rapi || (!fin && !soloPerfil)) { guardar(x, 'RoyaleAPI no trae el total cerrado de ese jugador en esa semana'); return; }
    if (soloPerfil) {
      // El perfil es el total de todos los clanes: solo da un techo para este (perfil menos lo que ya muestran los otros clanes), no el valor.
      guardar(x, 'RoyaleAPI solo trae el perfil (total de ' + series.length + ' clanes), que no fija el valor de este clan');
      return;
    }
    var intentos = [{ final: fin }, { final: fin, ignorar: [3] }], r2 = null, usoIgnorar = false;
    for (var i = 0; i < intentos.length && !r2; i++) {
      var cand = _vcrrRestriccionesSerie_(x.capsDatos || [null, null, null, null], intentos[i]);
      if (cand.validos === 'AFB') { r2 = cand; usoIgnorar = i === 1; }
    }
    if (!r2) { guardar(x, 'el total de RoyaleAPI (' + origen + ': ' + fin.A + ' ataques, ' + fin.F + ' medallas, ' + fin.B + ' barcos) no cabe con las capturas del JSON'); return; }
    respaldos.push({ x: x, antes: { r: x.r, validos: x.validos, estado: x.estado, notas: x.notas }, origen: origen, usoIgnorar: usoIgnorar });
    x.r = { A: r2.A, F: r2.F, B: r2.B }; x.validos = r2.validos;
    x.estado = 'json_anomalo';
    x.estimada = true;
    x.notas = (x.notas ? x.notas + '; ' : '') + 'estimado con RoyaleAPI (' + origen + (usoIgnorar ? ', sin la captura D' : '') + '): ' + _vcrrTextoEstimado_(x.r);
  });
  if (!respaldos.length) return salida;
  var revertir = function (motivo) {
    respaldos.forEach(function (b) {
      b.x.r = b.antes.r; b.x.validos = b.antes.validos; b.x.estado = b.antes.estado; b.x.notas = b.antes.notas; b.x.estimada = false;
      guardar(b.x, motivo);
    });
    respaldos = [];
  };
  // (2) y (3): la suma de los clanes del jugador debe seguir siendo posible y no pasar del perfil de RoyaleAPI.
  var resumen = _vcrrResumenDeSeries_(series);
  if (resumen.conflicto) { revertir('al sumar los clanes del jugador con el valor de RoyaleAPI: ' + resumen.conflicto); return salida; }
  if (rapi && rapi.perfil) {
    var suma = { A: 0, F: 0, B: 0 };
    series.forEach(function (x) { if (String(x.validos || '') === 'AFB') ['A', 'F', 'B'].forEach(function (m) { suma[m] += x.r[m].lo[3]; }); });
    var pasa = ['A', 'F', 'B'].filter(function (m) { return typeof rapi.perfil[m] === 'number' && suma[m] > rapi.perfil[m]; });
    if (pasa.length) { revertir('la suma de los clanes del JSON (' + suma.A + ' ataques, ' + suma.F + ' medallas, ' + suma.B + ' barcos) supera al perfil de RoyaleAPI (' + rapi.perfil.A + ', ' + rapi.perfil.F + ', ' + rapi.perfil.B + ')'); return salida; }
  }
  salida.resueltas = respaldos.length;
  return salida;
}

/** Texto corto de los acumulados al cierre de J|V|S|D de una serie ya estimada: «ataques 4|8|12|16, medallas …». Un rango se escribe «a-b» y un máximo sin techo «a+». */
function _vcrrTextoEstimado_(r) {
  var etiquetas = { A: 'ataques', F: 'medallas', B: 'barcos' };
  return ['A', 'F', 'B'].map(function (m) {
    var v = [];
    for (var d = 0; d < 4; d++) { var lo = r[m].lo[d], hi = r[m].hi[d]; v.push(lo === hi ? String(lo) : (hi === Infinity ? lo + '+' : lo + '-' + hi)); }
    return etiquetas[m] + ' ' + v.join('|');
  }).join(', ');
}

/**
 * Función pura (§PF331). Aplica a las series las confirmaciones a mano (VCRR_SERIES_CONFIRMADAS). series = las de _vcrrSeriesDeSemana_; confirmadas = la lista.
 * Cada serie que coincide en temporada, semana, tag y clanKey queda con estado 'confirmada', validos 'AFB', confirmada = true y los rangos de la entrada (acumulados al cierre
 * de J, V, S y D; el aumento de ataques de cada día sale por diferencia). Una entrada con valores imposibles (no suben, un día con más de 4 ataques, más de 16 ataques, más barcos
 * que ataques, fame de un día sobre 900 o de la semana sobre 3600) NO se aplica: la serie queda como estaba y su nota dice por qué. Si una captura del JSON trae más que lo
 * confirmado, se anota (no bloquea: manda la confirmación). Quita de las notas el «SIN RESOLVER» anterior. Modifica las series. Devuelve { aplicadas, invalidas: [{ tag, motivo }] }.
 */
function _vcrrAplicarConfirmadas_(series, confirmadas) {
  var salida = { aplicadas: 0, invalidas: [] };
  (confirmadas || []).forEach(function (c) {
    var x = (series || []).filter(function (s) {
      return Number(s.temporada) === Number(c.temporada) && Number(s.semana) === Number(c.semana) && String(s.tag).toUpperCase() === String(c.tag).toUpperCase() && s.clanKey === c.clanKey;
    })[0];
    if (!x) return;
    var r = _vcrrRangosDeConfirmada_(c);
    if (r.motivo) {
      salida.invalidas.push({ tag: c.tag, motivo: r.motivo });
      x.notas = (x.notas ? x.notas + '; ' : '') + 'confirmación a mano ignorada: ' + r.motivo;
      return;
    }
    var conflictos = [];
    (x.capsDatos || []).forEach(function (cap, d) {
      if (!cap) return;
      if (cap.usados > r.A.hi[d]) conflictos.push(VCRR_DIAS.charAt(d) + ' ataques ' + cap.usados);
      if (cap.fame > r.F.hi[d]) conflictos.push(VCRR_DIAS.charAt(d) + ' fame ' + cap.fame);
      if (cap.barcos > r.B.hi[d]) conflictos.push(VCRR_DIAS.charAt(d) + ' barcos ' + cap.barcos);
    });
    var antes = String(x.notas || '').replace(/;?\s*SIN RESOLVER:.*$/, '').trim();
    var estadoAntes = x.estado;
    x.r = r; x.validos = 'AFB'; x.estado = 'confirmada'; x.confirmada = true; x.estimada = false;
    delete x.sinResolver;
    x.notas = 'confirmada a mano (§PF331): ' + _vcrrTextoEstimado_(x.r) + (c.nota ? ' — ' + c.nota : '') +
      (conflictos.length ? '; ojo, el JSON trae más que lo confirmado (' + conflictos.join(', ') + ')' : '') +
      '; antes: ' + estadoAntes + (antes ? ' (' + antes + ')' : '');
    salida.aplicadas++;
  });
  return salida;
}

/**
 * Función pura (§PF331). De una entrada de VCRR_SERIES_CONFIRMADAS arma { A, F, B } con { lo, hi, il, ih } por métrica (el mismo formato de _vcrrRestriccionesSerie_)
 * o { motivo } si los valores son imposibles. Un arreglo de 4 = acumulado exacto al cierre de cada día; un número = total del domingo (los días van de 0 a ese total).
 */
function _vcrrRangosDeConfirmada_(c) {
  var topes = { A: VCRR_TOPE_ATAQUES_DIA, F: VCRR_TOPE_FAME_DIA, B: VCRR_TOPE_ATAQUES_DIA };
  var maxSem = { A: VCRR_TOPE_ATAQUES_SEMANA, F: VCRR_TOPE_FAME_SEMANA, B: VCRR_TOPE_BARCOS_SEMANA };
  var etq = { A: 'ataques', F: 'fame', B: 'barcos' };
  var out = {}, motivo = '', d;
  ['A', 'F', 'B'].forEach(function (k) {
    if (motivo) return;
    var v = c[k], lo, hi, il, ih;
    var esNum = function (n) { return typeof n === 'number' && isFinite(n) && n >= 0 && Math.floor(n) === n; };
    if (esNum(v)) {
      if (v > maxSem[k]) { motivo = etq[k] + ' ' + v + ' pasa del máximo semanal ' + maxSem[k]; return; }
      lo = [0, 0, 0, v]; hi = [v, v, v, v]; il = [0, 0, 0, 0]; ih = [topes[k], topes[k], topes[k], topes[k]];
    } else if (Object.prototype.toString.call(v) === '[object Array]' && v.length === 4 && v.every(esNum)) {
      lo = v.slice(); hi = v.slice(); il = []; ih = [];
      for (d = 0; d < 4; d++) {
        var dia = v[d] - (d > 0 ? v[d - 1] : 0);
        if (dia < 0) { motivo = etq[k] + ' baja de un día a otro'; return; }
        if (dia > topes[k]) { motivo = etq[k] + ' ' + VCRR_DIAS.charAt(d) + ': ' + dia + ' en un día (máximo ' + topes[k] + ')'; return; }
        il.push(dia); ih.push(dia);
      }
      if (v[3] > maxSem[k]) { motivo = etq[k] + ' ' + v[3] + ' pasa del máximo semanal ' + maxSem[k]; return; }
    } else { motivo = etq[k] + ' debe ser un número o un arreglo de 4 acumulados (J, V, S, D)'; return; }
    out[k] = { lo: lo, hi: hi, il: il, ih: ih };
  });
  if (motivo) return { motivo: motivo };
  // Los barcos son ataques: no pueden pasar de los ataques acumulados (con A exacto, día por día; con A solo en total, el del domingo).
  for (d = 0; d < 4; d++) {
    if (out.B.lo[d] > out.A.hi[d]) return { motivo: 'barcos ' + out.B.lo[d] + ' mayor que los ataques ' + out.A.hi[d] + ' (' + VCRR_DIAS.charAt(d) + ')' };
    out.B.hi[d] = Math.min(out.B.hi[d], out.A.hi[d]);
    out.B.ih[d] = Math.min(out.B.ih[d], out.A.ih[d]);
  }
  return out;
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
 * extra (opcional, §PF320) = { final: {A,F,B}, finalMax: {A,F,B}, ignorar: [días 0..3] }: el total semanal de RoyaleAPI (exacto o solo techo) y los días cuya captura no se usa
 *  (por ejemplo la del domingo en blanco). Sin extra el cálculo es el de siempre.
 * descartadas = capturas con números imposibles (no restringen). anomalas = capturas con un fallo conocido del JSON que SÍ restringen (domingo con decksUsedToday 0 y más de 12 ataques: se toma como acumulado final; decksUsedToday mayor que 4: se toma como 4 si los acumulados lo admiten). validos = letras de las métricas utilizables.
 */
function _vcrrRestriccionesSerie_(caps, extra) {
  extra = extra || {};
  var INF = Infinity, notas = [], descartadas = [], anomalas = [], d;
  var A = { lo: [0, 0, 0, 0], hi: [4, 8, 12, 16], il: [0, 0, 0, 0], ih: [4, 4, 4, 4] };
  var F = { lo: [0, 0, 0, 0], hi: [INF, INF, INF, INF], il: [0, 0, 0, 0], ih: [900, 900, 900, 900] };
  var B = { lo: [0, 0, 0, 0], hi: [INF, INF, INF, INF], il: [0, 0, 0, 0], ih: [4, 4, 4, 4] };
  var ok = [];
  for (d = 0; d < 4; d++) {
    var c = caps[d];
    if (!c || (extra.ignorar && extra.ignorar.indexOf(d) >= 0)) continue;
    var motivo = '';
    // Fallo conocido del JSON: la captura del domingo trae decksUsedToday 0 aunque ya sumó más de 12 ataques (debía ser 4: 16/0 en vez de 16/4). Se reporta como
    // anomalía pero la captura SÍ se usa como acumulado final: el valor del día sale por diferencia con el cierre del sábado (16 - 12 = 4).
    var finDeSemana = d === 3 && c.hoy === 0 && c.usados > 4 * d && c.usados <= 4 * (d + 1) && c.fame >= 0 && c.barcos >= 0 && c.barcos <= c.usados;
    // Otro fallo del JSON (1-nov-2026, la usuaria): decksUsedToday mayor que 4 (T22 S5, SKYSER: 10/6). Se toma como 4 ataques ese día y se anota como anomalía, pero SOLO si los
    // acumulados lo admiten (se comprueba después del bucle): usados - hoy ya no es el inicio del día, así que esa captura entra solo como piso del acumulado.
    var hoyExcedido = !finDeSemana && c.hoy > 4 && c.hoy <= c.usados && c.usados <= 4 * (d + 1) && c.fame >= 0 && c.barcos >= 0 && c.barcos <= c.usados;
    if (hoyExcedido) anomalas.push({ dia: d, excedido: true, motivo: 'decksUsedToday ' + c.hoy + ' (imposible, el máximo es 4): se toma como 4 ataques ese día' });
    else if (finDeSemana) anomalas.push({ dia: d, motivo: 'decksUsedToday 0 con decksUsed ' + c.usados + ' (fallo del JSON): se usa como acumulado final y los ataques del día salen por diferencia' });
    else if (c.hoy < 0 || c.hoy > 4) motivo = 'decksUsedToday ' + c.hoy + ' fuera de 0 a 4';
    else if (c.hoy > c.usados) motivo = 'decksUsedToday ' + c.hoy + ' mayor que decksUsed ' + c.usados;
    else if (c.usados > 4 * (d + 1)) motivo = 'decksUsed ' + c.usados + ' no cabe en ' + (d + 1) + ' día(s)';
    else if (c.usados - c.hoy > 4 * d) motivo = 'el inicio del día (' + (c.usados - c.hoy) + ') no cabe en ' + d + ' día(s) anteriores';
    else if (d === 0 && c.usados !== c.hoy) motivo = 'el jueves debe empezar en 0 ataques y empieza en ' + (c.usados - c.hoy);
    else if (c.fame < 0 || c.barcos < 0) motivo = 'fame o barcos negativos';
    else if (c.barcos > c.usados) motivo = 'boatAttacks ' + c.barcos + ' mayor que decksUsed ' + c.usados;
    if (motivo) { descartadas.push({ dia: d, motivo: motivo }); continue; }
    ok[d] = true;
    var inicio = c.usados - c.hoy;
    var sinInicio = finDeSemana || hoyExcedido;
    if (!hoyExcedido) A.il[d] = Math.max(A.il[d], c.hoy);
    A.lo[d] = Math.max(A.lo[d], c.usados);
    if (d > 0 && !sinInicio) { A.lo[d - 1] = Math.max(A.lo[d - 1], inicio); A.hi[d - 1] = Math.min(A.hi[d - 1], inicio); }
    F.lo[d] = Math.max(F.lo[d], c.fame); B.lo[d] = Math.max(B.lo[d], c.barcos);
    if (d > 0) {
      F.hi[d - 1] = Math.min(F.hi[d - 1], c.fame); B.hi[d - 1] = Math.min(B.hi[d - 1], c.barcos);
      if (c.hoy === 0 && !sinInicio) { F.lo[d - 1] = Math.max(F.lo[d - 1], c.fame); B.lo[d - 1] = Math.max(B.lo[d - 1], c.barcos); }
    }
    if (c.hoy === 4) { F.hi[d] = Math.min(F.hi[d], c.fame); B.hi[d] = Math.min(B.hi[d], c.barcos); }
  }
  // §PF320: el total semanal de RoyaleAPI fija el acumulado al cierre del domingo (final = valor exacto; finalMax = solo el techo). Se aplica antes de propagar.
  ['A', 'F', 'B'].forEach(function (m) {
    var M = m === 'A' ? A : (m === 'F' ? F : B);
    var v = extra.final && extra.final[m], vmax = extra.finalMax && extra.finalMax[m];
    if (typeof v === 'number' && isFinite(v) && v >= 0) { M.lo[3] = Math.max(M.lo[3], v); M.hi[3] = Math.min(M.hi[3], v); }
    if (typeof vmax === 'number' && isFinite(vmax)) M.hi[3] = Math.min(M.hi[3], vmax);
  });
  // decksUsedToday > 4: se fuerza «4 ataques ese día» y se comprueba con los acumulados de las demás capturas; si no caben, no se fuerza (y se anota).
  var excedidas = anomalas.filter(function (m) { return m.excedido; });
  if (excedidas.length) {
    var A0 = JSON.parse(JSON.stringify(A));
    excedidas.forEach(function (m) { A.il[m.dia] = Math.max(A.il[m.dia], 4); });
    if (_vcrrPropagar_(A)) {
      excedidas.forEach(function (m) { m.motivo += '; los acumulados de ataques lo admiten'; });
    } else {
      A.lo = A0.lo; A.hi = A0.hi; A.il = A0.il; A.ih = A0.ih;
      excedidas.forEach(function (m) { m.motivo += '; los acumulados de ataques NO admiten 4 ese día, no se fuerza'; });
    }
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
  return { A: A, F: F, B: B, validos: validos, notas: notas, descartadas: descartadas, anomalas: anomalas };
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
    // §PF316 (31-oct-2026): un piso que supera a su techo ya no se arregla (los pisos solo suben y los techos solo bajan), así que se corta aquí.
    // Antes se seguía hasta 16 vueltas y, con capturas que no caben juntas, cada vuelta empujaba los pisos más arriba: salían cifras de miles de millones
    // en Cruce_CRR_Restricciones.csv (24 series «incoherente»; el filtro de teléfonos de la copia a GitHub las tomaba por números de teléfono). El resultado (true o false) no cambia.
    for (var k0 = 0; k0 < 4; k0++) { if (m.lo[k0] > m.hi[k0] || m.il[k0] > m.ih[k0]) return false; }
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
  return ['Temporada', 'Semana', 'Clan', 'Día', 'Archivo', 'Modificado (ms)', 'Tamaño (bytes)', 'Verificado', 'Corrida', 'Resultado', 'Series de la semana', 'Versión de reglas', 'Huella RoyaleAPI'];
}

/** Fila del registro de un JSON recién leído. a = elemento de _vcrrArchivosSemana_; series = cuántas series quedaron guardadas en esa semana. */
function _vcrrFilaVerificado_(t, s, a, marca, resultado, series, firmaRapi) {
  return [t, s, a.clanKey, a.letra, a.nombre, a.modificado, a.tamano, Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss'), marca, resultado, series, VCRR_VERSION_REGLAS, firmaRapi || ''];
}

/** Huella de un JSON: cambia si cambia el clan, el día, el nombre, la fecha de modificación o el tamaño. */
function _vcrrHuella_(clanKey, letra, nombre, modificado, tamano) {
  return [clanKey, letra, nombre, Number(modificado), Number(tamano)].join('|');
}

/**
 * Función pura. ¿La semana ya está verificada y no cambió? reg = { huellas: [texto], series, version, firmaRapi } del registro (o undefined si no hay);
 * archivos = los JSON que hay hoy en Drive; hayRestricciones = el archivo de restricciones ya tiene series de esa semana; firmaRapi = huella de lo que RoyaleAPI trae hoy de la semana
 * (_vcrrFirmaRapi_): si cambió desde que se verificó, la semana se vuelve a calcular porque el cruce de sus series anómalas pudo cambiar.
 * Sí solo si los JSON de hoy son exactamente los registrados (mismas huellas), la versión de reglas es la vigente y, cuando la semana dejó series,
 * esas series siguen en el archivo de restricciones.
 */
function _vcrrSemanaVerificada_(reg, archivos, hayRestricciones, firmaRapi) {
  if (!reg || reg.version !== VCRR_VERSION_REGLAS) return false;
  if (String(reg.firmaRapi || '') !== String(firmaRapi || '')) return false;   // §PF320: RoyaleAPI trae algo distinto de esa semana desde la última vez
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
    if (!por[k]) por[k] = { huellas: [], series: series, version: version, firmaRapi: String(f[12] === undefined ? '' : f[12]) };
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

// ----- Verificar CRR, paso 3: comparar contra el CSV y registrar hallazgos -----

/**
 * _vcrrTagDeClan_(nombre) — §PF445 punto 12 (10-nov-2026). Tag del clan que corresponde a un nombre, con la MISMA traducción que usa _excDiasAgrupar() para las filas sin Clan_Tag
 * (_clanTagDeFilaORespaldo_ con el Tag vacío, en mayúsculas). '' si no se resuelve (clan externo o nombre desconocido). Caché por ejecución en _VCRR_CACHE_TAGCLAN_.
 */
function _vcrrTagDeClan_(nombre) {
  var k = String(nombre === undefined || nombre === null ? '' : nombre);
  if (!Object.prototype.hasOwnProperty.call(_VCRR_CACHE_TAGCLAN_, k)) _VCRR_CACHE_TAGCLAN_[k] = String(_clanTagDeFilaORespaldo_('', k) || '').trim().toUpperCase();
  return _VCRR_CACHE_TAGCLAN_[k];
}

/**
 * _vcrrClaveGrupoSerie_(x) — §PF445 punto 12. La clave que _excDiasAgrupar() (55_Reparar_DiasConExceso.gs) da al grupo de una serie del archivo de restricciones:
 * temporada|semana|tag del jugador|Tag del clan (o el nombre del clan si no tiene Tag). Desde §PF422 (6-nov-2026) los grupos se agrupan por el Tag del clan y no por su nombre;
 * buscarlos por nombre solo encuentra los de clan sin Tag. Es la misma forma de _excDiasClaveGrupo_(g).
 */
function _vcrrClaveGrupoSerie_(x) {
  return [String(x.temporada), String(x.semana), x.tag, _vcrrTagDeClan_(x.clan) || x.clan].join('|');
}

/**
 * Paso 3. Compara cada semana de Cruce_CRR_Restricciones.csv contra Backup_Guerra.csv y agrega los hallazgos al CSV
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
  if (st.idx === 0) {
    _vcrrLimpiarRevisionAntigua_();   // §PF318: una sola vez por corrida, en la primera tanda del paso 3
    _vcrrListarSinResolver_(restr, claves);
  }
  while (st.idx < claves.length) {
    if (hechas > 0 && (Date.now() - t0) > VCRR_PRESUPUESTO_MS - 15000) break;
    (restr[claves[st.idx]] || []).forEach(function (x) {
      var g = grupos[_vcrrClaveGrupoSerie_(x)] || null;   // §PF445 punto 12: por el Tag del clan, como _excDiasAgrupar()
      if (x.estado === 'incoherente' || x.estado === 'json_anomalo') {
        // §PF320: una anómala que RoyaleAPI resolvió sigue siendo anomalía, pero va con severidad 'estimado' (los rangos ya son los estimados); la que no, 'revisar'.
        var sinRes = /SIN RESOLVER:/.test(x.notas), estimada = !sinRes && /estimado con RoyaleAPI/.test(x.notas);
        hallazgos.push([x.temporada, x.semana, x.clan, x.tag, x.nombre, '', 'json_anomalo', x.estado, '', '', '', estimada ? 'estimado' : 'revisar', x.notas]);
        _vcrrSumar_(st, 'json_anomalo', 1);
        if (estimada) _vcrrSumar_(st, 'estimadas_rapi', 1);
        if (sinRes) _vcrrSumar_(st, 'sin_resolver_rapi', 1);
      }
      var hs = _vcrrCompararSerie_(x, g);
      hs.forEach(function (h) { hallazgos.push(h); _vcrrSumar_(st, h[6], 1); });
      var menores = hs.filter(function (h) { return h[6] === 'csv_menor' || h[6] === 'fila_faltante'; });
      if (menores.length && (st.cont.revision || 0) + revision.length < VCRR_MAX_REVISION) {
        revision.push({ temporada: x.temporada, semana: x.semana, tag: x.tag, nombre: x.nombre, tipo: 'alarma',
          motivo: VCRR_MOTIVO_REVISION + ' — ' + x.clan, detalle: x.clan + ': ' + menores.slice(0, 4).map(function (h) { return h[5] + ' ' + h[7] + ' ' + h[6] + ' (CSV ' + h[8] + ', mínimo ' + h[9] + ')'; }).join('; '),
          estado: 'Pendiente' }); // §PF316: igual que las contradicciones de §PF313, para poder filtrar lo que espera revisión
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
 * Escribe en el registro las series anómalas que RoyaleAPI no pudo resolver (las que dicen «SIN RESOLVER: motivo» en las notas), para decidir qué hacer con ellas (§PF320).
 * Se llama una vez por corrida, al empezar el paso 3. Muestra hasta 60 y dice cuántas hay.
 */
function _vcrrListarSinResolver_(restr, claves) {
  var lista = [];
  claves.forEach(function (k) {
    (restr[k] || []).forEach(function (x) { var m = /SIN RESOLVER: (.*)$/.exec(String(x.notas || '')); if (m) lista.push({ x: x, motivo: m[1] }); });
  });
  Logger.log('[VCRR] Series anómalas que RoyaleAPI no resolvió: ' + lista.length + (lista.length > 60 ? ' (se listan las primeras 60)' : '') + '.');
  lista.slice(0, 60).forEach(function (e) {
    Logger.log('[VCRR]   T' + e.x.temporada + ' S' + e.x.semana + ' ' + e.x.nombre + ' (' + e.x.clan + ') ' + e.x.tag + ' [' + e.x.estado + ' ' + (e.x.validos || '-') + ']: ' + e.motivo);
  });
}

/**
 * _vcrrLimpiarRevisionAntigua_() — §PF318 (31-oct-2026). Quita de Revision_Guerra.csv las filas que este módulo escribió con el motivo anterior (sin el clan: compartían clave
 * los jugadores con hallazgos en dos clanes la misma semana) y que siguen con Estado vacío, es decir, nadie las tocó. Las vuelve a escribir el paso 2 con «Pendiente» y el clan en el motivo.
 * Una fila con Estado escrito, o con otro motivo, no se toca. Sin filas de ese motivo no hace nada, así que no daña si se repite. Devuelve cuántas quitó.
 */
function _vcrrLimpiarRevisionAntigua_() {
  try {
    var texto = _loadCSVFromDrive(REVISION_GUERRA_CSV);
    if (!texto) return 0;
    var parsed = _parseCSV(texto);
    if (!parsed || parsed.length < 2) return 0;
    var ncol = REVISION_GUERRA_ENCABEZADO.length, quitadas = 0, filas = [];
    for (var i = 1; i < parsed.length; i++) {
      var f = parsed[i].slice(0, ncol);
      while (f.length < ncol) f.push('');
      if (String(f[7]) === VCRR_MOTIVO_REVISION && String(f[9]).trim() === '') { quitadas++; continue; }
      filas.push(f);
    }
    if (!quitadas) return 0;
    for (var n = 0; n < filas.length; n++) filas[n][0] = n + 1;
    _saveCSVToDrive(REVISION_GUERRA_CSV, _encodeCSV([REVISION_GUERRA_ENCABEZADO].concat(filas)));
    Logger.log('[VCRR] Revision_Guerra.csv: se quitaron ' + quitadas + ' fila(s) del motivo anterior sin revisar; se reescriben con el clan en el motivo y Estado «Pendiente».');
    return quitadas;
  } catch (e) {
    Logger.log('[VCRR] AVISO: no se pudo limpiar Revision_Guerra.csv (' + (e.message || e) + '). Se sigue; puede quedar alguna fila duplicada.');
    return 0;
  }
}

/**
 * Función pura. x = serie del archivo de restricciones; g = grupo del CSV (de _excDiasAgrupar) o null si el jugador no tiene filas ese clan y semana.
 * Devuelve filas de hallazgos [Temporada, Semana, Clan, Tag, Nombre, Día, Tipo, Campo, CSV, Mínimo JSON, Máximo posible, Severidad, Detalle]:
 *  - csv_menor: el CSV tiene menos que el piso del JSON (ataques de la semana, ataques del día, fame o barcos). Severidad 'error'.
 *  - csv_mayor_max: el CSV pasa del máximo posible. Severidad 'revisar' ('aviso' si el jugador estuvo en dos clanes esa semana).
 *  - fila_faltante: el JSON de ese clan y día muestra actividad nueva (más que lo acumulado el día anterior, o ataques propios) y el CSV no tiene la fila del día. Severidad 'error'. Desde §PF445 punto 14 un arrastre puro no cuenta.
 *  - no_monotono: un acumulado del CSV baja de un día al siguiente.
 */
function _vcrrCompararSerie_(x, g) {
  var out = [], d;
  var base = function (dia, tipo, campo, csv, min, max, sev, det) {
    return [x.temporada, x.semana, x.clan, x.tag, x.nombre, VCRR_DIAS.charAt(dia), tipo, campo, csv, min, max === Infinity ? '' : max, sev, det || ''];
  };
  var campos = [['A', 'Ataques semana', GC.ATAQUES_SEM], ['F', 'Fame', GC.FAME], ['B', 'Barcos', GC.BARCOS]];
  var previo = { A: null, F: null, B: null };
  var acum = { a: 0, f: 0, b: 0 };   // §PF445 punto 14: acumulado visto hasta el día anterior (filas del CSV o mínimos del JSON de los días sin fila), para no marcar un arrastre puro como fila faltante
  for (d = 0; d < 4; d++) {
    var fila = g && g.dias[d];
    if (!fila) {
      var actividad = x.capturas[d] && (x.r.A.lo[d] > 0 || x.r.F.lo[d] > 0 || x.r.B.lo[d] > 0 || x.r.A.il[d] > 0);
      if (actividad && _vcrrEsArrastre_(x, d, acum)) actividad = false;
      if (actividad) acum = { a: Math.max(acum.a, x.r.A.lo[d]), f: Math.max(acum.f, x.r.F.lo[d]), b: Math.max(acum.b, x.r.B.lo[d]) };
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
      var kl = k.toLowerCase();
      if (v > acum[kl]) acum[kl] = v;
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

// ----- Verificar CRR, paso 4: escribir en el CSV (solo Aplicar) -----

/**
 * Paso 4 (solo Aplicar), de una sola vez: arma el plan con todas las semanas, hace el respaldo «Backup_Guerra ANTES de verificar CRR vs Backup <marca>.csv»,
 * crea las filas que faltan, sube al piso los acumulados que estén por debajo, vuelve a leer el CSV y verifica. Si el plan pasa de VCRR_MAX_FILAS_APLICAR
 * no escribe nada. Devuelve true si terminó (aunque haya decidido no escribir); false solo si no alcanzó el tiempo y debe reintentarse.
 */
function _vcrrPaso3_(st, t0) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[VCRR] Hay otro proceso escribiendo; se reintenta el paso en la tanda siguiente.'); return false; }
  try {
    var bk = _vcrrLeerBackupGuerra_();
    if (!bk) { Logger.log('[VCRR] No se encontró Backup_Guerra.csv o está vacío; no se escribe nada.'); return true; }
    var grupos = _excDiasAgrupar(bk.filas), restr = _vcrrLeerRestricciones_(), indiceJugador = _vcrrIndiceGruposPorJugador_(grupos);   // §PF446: indiceJugador sirve para saber qué días tiene fila el jugador en otro clan
    var clanes = {};
    Object.keys(grupos).forEach(function (k) { clanes[_vcrrClanNorm_(grupos[k].clan)] = grupos[k].clan; });
    var casos = [], conflictos = [], nCrear = 0, nMod = 0;
    Object.keys(restr).forEach(function (k) {
      restr[k].forEach(function (x) {
        var g = grupos[_vcrrClaveGrupoSerie_(x)] || null;   // §PF445 punto 12: por el Tag del clan, como _excDiasAgrupar()
        var plan = _vcrrPlanSerie_(x, g, clanes, _vcrrDiasEnOtroClan_(indiceJugador, x));
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
 * _vcrrEsArrastre_(x, d, prev) — §PF445 punto 14. Función pura. True si el día d (0 = jueves a 3 = domingo) de la serie x, que no tiene fila en el CSV, no agrega ningún dato:
 * el mínimo del JSON de ataques, fame y barcos no pasa de lo acumulado el día anterior (prev = { a, f, b }) y el JSON no exige ataques propios ese día (il = 0).
 * Una fila así solo repetiría el acumulado con AtaquesHoy en 0. «Actividad» se decide por el acumulado del JSON, así que sin esta prueba cualquier jugador con algo acumulado
 * parecería tener un día faltante.
 */
function _vcrrEsArrastre_(x, d, prev) {
  return x.r.A.il[d] === 0 && x.r.A.lo[d] <= prev.a && x.r.F.lo[d] <= prev.f && x.r.B.lo[d] <= prev.b;
}

/**
 * _vcrrIndiceGruposPorJugador_(grupos) — §PF446. Función pura. Agrupa los grupos de _excDiasAgrupar() por jugador y semana: { 'temporada|semana|tag': [grupos de cada clan] }.
 */
function _vcrrIndiceGruposPorJugador_(grupos) {
  var idx = {};
  Object.keys(grupos).forEach(function (k) {
    var g = grupos[k], c = [g.temporada, g.semana, g.tag].join('|');
    if (!idx[c]) idx[c] = [];
    idx[c].push(g);
  });
  return idx;
}

/**
 * _vcrrDiasEnOtroClan_(indice, x) — §PF446. Función pura. 4 booleanos (jueves a domingo): true si el jugador de la serie x tiene fila ese día en OTRO clan esa semana. Es el mismo dato que usa el desglose
 * (enOtroClan en _gdsValoresHojaDeClan_): un día así no es un hueco de este clan. indice sale de _vcrrIndiceGruposPorJugador_(). clavePropia (opcional) = la clave _excDiasClaveGrupo_ del grupo de la serie,
 * cuando ya se tiene; sin ella se calcula con _vcrrClaveGrupoSerie_(x).
 */
function _vcrrDiasEnOtroClan_(indice, x, clavePropia) {
  var out = [false, false, false, false], propia = clavePropia || _vcrrClaveGrupoSerie_(x);
  (indice[[String(x.temporada), String(x.semana), x.tag].join('|')] || []).forEach(function (g2) {
    if (_excDiasClaveGrupo_(g2) === propia) return;
    for (var d = 0; d < 4; d++) { if (g2.dias[d]) out[d] = true; }
  });
  return out;
}

/**
 * _vcrrDiasImposibles_(dias, otro) — §PF446. Función pura. dias = arreglo de 4 con { hoy, sem, fame, barcos } (jueves a domingo; null si el día no tiene fila); otro = 4 booleanos de _vcrrDiasEnOtroClan_()
 * (opcional). Devuelve 4 booleanos: true si el día queda «Imposible» con la misma regla del desglose (_gdsValoresHojaDeClan_, _gdsCombinacionesDelDia_ y _gdsVariosDiasCabe_, 18_CorreccionGuerra.gs):
 * la base de cada día es la última fila anterior; los ataques del día son AtaquesHoy, o la diferencia de AtaquesSemana si AtaquesHoy es 0 y esa diferencia cabe en 4 ataques por día cubierto;
 * la fame y los barcos son la diferencia de acumulados, nunca negativa. Una fila que cubre varios días (faltan las filas de en medio, y no por estar el jugador en otro clan) se evalúa como la suma de
 * esos días. Un día sin ataques calculables (domingo) no se evalúa y da false.
 */
function _vcrrDiasImposibles_(dias, otro) {
  var out = [false, false, false, false], ataques = [null, null, null, null], prev = null, enOtro = otro || [];
  for (var d = 0; d < 4; d++) {
    var r = dias[d];
    if (!r) continue;
    var sp = 1;
    for (var q = (prev ? prev.o : -1) + 1; q < d; q++) { if (enOtro[q] !== true) sp++; }
    var contados = 0;
    for (var c = 0; c < d; c++) contados += (ataques[c] === null ? 0 : ataques[c]);
    var semBase = prev ? prev.sem : 0;
    var dif = semBase < contados ? null : r.sem - semBase;
    var difValida = dif !== null && dif >= 0 && dif <= FAME_MAZOS_POR_DIA * sp;
    var a;
    if (sp > 1) a = (difValida && dif >= r.hoy) ? dif : null;
    else if (r.hoy !== 0) a = r.hoy;
    else if (difValida) a = dif;
    else a = (d === 3) ? null : 0;
    ataques[d] = a;
    var fame = Math.max(0, r.fame - (prev ? prev.fame : 0)), barcos = Math.max(0, r.barcos - (prev ? prev.barcos : 0));
    prev = { o: d, sem: r.sem, fame: r.fame, barcos: r.barcos };
    if (a === null) continue;
    if (sp > 1) { out[d] = _gdsVariosDiasCabe_(a, fame, barcos, d, sp) !== true; continue; }
    var comb = _gdsCombinacionesDelDia_(a, fame, barcos, d === 3);
    out[d] = !(comb && comb.length);   // null (dato no válido, como más barcos que ataques) o lista vacía = imposible
  }
  return out;
}

/**
 * _vcrrDiasQueFallan_(g, ops, otro) — §PF446. Función pura. Compara los días «imposibles» de la serie como está en el CSV con los que quedarían al aplicar las ops. Si un día pasa de posible a imposible,
 * devuelve los días con op que lo causan: el propio día y el último día anterior con fila, porque su acumulado es la base de la fame y los barcos de ese día. Cada elemento es { dia, motivo };
 * la lista queda vacía si ninguna op deja un día imposible. Un día que ya era imposible en el CSV no cuenta: no lo causa «Aplicar».
 */
function _vcrrDiasQueFallan_(g, ops, otro) {
  var lee = function (f) {
    return f ? { hoy: _excDiasNum(f[GC.ATAQUES_HOY - 1]), sem: _excDiasNum(f[GC.ATAQUES_SEM - 1]), fame: _excDiasNum(f[GC.FAME - 1]), barcos: _excDiasNum(f[GC.BARCOS - 1]) } : null;
  };
  var antes = [], despues = [], conOp = {};
  for (var d = 0; d < 4; d++) {
    var r = lee(g && g.dias[d]);
    antes.push(r);
    despues.push(r ? { hoy: r.hoy, sem: r.sem, fame: r.fame, barcos: r.barcos } : null);
  }
  ops.forEach(function (op) {
    conOp[op.dia] = true;
    despues[op.dia] = { hoy: op.nuevo.hoy, sem: op.nuevo.sem, fame: op.nuevo.fame, barcos: op.nuevo.barcos };
  });
  var imAntes = _vcrrDiasImposibles_(antes, otro), imDespues = _vcrrDiasImposibles_(despues, otro);
  for (var m = 0; m < 4; m++) {
    if (!imDespues[m] || imAntes[m]) continue;
    var base = -1;
    for (var k = m - 1; k >= 0; k--) { if (despues[k]) { base = k; break; } }
    var motivo = 'escribir el mínimo del JSON dejaría imposible el día ' + VCRR_DIAS.charAt(m) + ' (sus ataques no cuadran con la fame o los barcos del CSV)';
    var salida = [];
    if (conOp[m]) salida.push({ dia: m, motivo: motivo });
    if (base >= 0 && conOp[base]) salida.push({ dia: base, motivo: motivo });
    if (salida.length) return salida;
  }
  return [];
}

/**
 * _vcrrOpsSerie_(x, g, grupo, clanes, bloq) — §PF446. Función pura. Es el recorrido de los cuatro días que antes estaba dentro de _vcrrPlanSerie_: crea el día que falta y sube al piso los acumulados
 * que estén por debajo. bloq = { índice de día: motivo } son los días que no se escriben (quedan como conflicto y el día siguiente parte de lo que tiene el CSV). Devuelve { ops, conflictos }.
 */
function _vcrrOpsSerie_(x, g, grupo, clanes, bloq) {
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
      // §PF445 punto 14: un día sin fila cuyo mínimo no pasa de lo acumulado el día anterior y sin ataques propios es un arrastre puro (el JSON trae el acumulado, no una acción de ese día): no se crea, ya que no agrega dato y en una serie multiclan podría inventar un día en un clan que el jugador ya dejó.
      if (_vcrrEsArrastre_(x, d, prev)) continue;
      if (!conocido) { pideConflicto(d, 'no se sabe cómo se escribe el nombre del clan en el CSV'); continue; }
      if (!usa('A') || !usa('F') || !usa('B')) { pideConflicto(d, 'el JSON de esa serie es incoherente en alguna métrica'); continue; }
      var sem = Math.max(A.lo[d], prev.a), fame = Math.max(F.lo[d], prev.f), barcos = Math.max(B.lo[d], prev.b);
      var hoy = sem - prev.a;
      if (sem > A.hi[d] || fame > F.hi[d] || barcos > B.hi[d] || hoy < A.il[d] || hoy > A.ih[d]) { pideConflicto(d, 'el mínimo no cabe con lo que ya tiene el CSV en los días vecinos'); continue; }
      if (bloq[d]) { pideConflicto(d, bloq[d]); continue; }   // §PF446: día bloqueado por dejar un vecino imposible; prev no cambia
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
    if (cambio && bloq[d]) {   // §PF446: día bloqueado; se queda lo que tiene el CSV y el día siguiente parte de ahí
      pideConflicto(d, bloq[d]);
      nSem = csv.sem; nFame = csv.fame; nBarcos = csv.barcos; nHoy = csv.hoy; cambio = false;
    }
    if (cambio) {
      ops.push({ dia: d, existe: true, fila: fila, sinCambio: false, ant: csv, nuevo: { hoy: nHoy, sem: nSem, fame: nFame, barcos: nBarcos, origen: VCRR_ORIGEN_SUBIDA } });
    }
    prev = { a: nSem, f: nFame, b: nBarcos };
  }
  return { ops: ops, conflictos: conflictos };
}

/**
 * Función pura. Arma las operaciones de escritura de una serie: crea el día que falta (si el JSON de ese clan y día trae actividad) y sube al piso
 * los acumulados que estén por debajo; nunca baja un valor y no toca los que pasan del máximo. clanes = { clave normalizada: nombre del clan en el CSV }.
 * Devuelve { grupo, ops, conflictos }. Las ops sirven para _excDiasAplicarPlan() (55_Reparar_DiasConExceso.gs). otro (opcional) = días con fila del jugador en otro clan (_vcrrDiasEnOtroClan_).
 * §PF336: si la serie está estimada solo con el perfil de RoyaleAPI, no devuelve ops: sus escrituras pasan a conflictos.
 * §PF446: una op que dejaría un día «Imposible» que antes no lo era (por ejemplo, subir la fame del jueves y dejar el viernes con 100 de fame y 4 ataques) no se escribe: pasa a conflictos.
 */
function _vcrrPlanSerie_(x, g, clanes, otro) {
  var grupo = g || { temporada: String(x.temporada), semana: String(x.semana), tag: x.tag, clan: clanes[_vcrrClanNorm_(x.clan)] || x.clan, clanTag: _vcrrTagDeClan_(clanes[_vcrrClanNorm_(x.clan)] || x.clan), nombre: x.nombre, dias: {} };   // §PF445 punto 12: clanTag para que la fila creada lleve el Clan_Tag y la verificación encuentre el grupo por su clave
  var pideConflicto = function (d, motivo) { conflictos.push({ temporada: x.temporada, semana: x.semana, clan: grupo.clan, tag: x.tag, nombre: x.nombre, dia: VCRR_DIAS.charAt(d), motivo: motivo }); };
  // §PF446: se arma el plan y se comprueba con la misma regla del desglose que ninguna op deje un día «Imposible» que antes no lo era. Si lo deja, los días culpables se bloquean (pasan a
  // conflictos, «SIN ESCRIBIR») y se vuelve a armar. Cada vuelta bloquea al menos un día con op, así que termina; el tope de 8 vueltas es solo una red de seguridad.
  var bloq = {}, plan = _vcrrOpsSerie_(x, g, grupo, clanes, bloq);
  for (var vuelta = 0; vuelta < 8; vuelta++) {
    var fallan = _vcrrDiasQueFallan_(g, plan.ops, otro);
    if (!fallan.length) break;
    fallan.forEach(function (f) { bloq[f.dia] = f.motivo; });
    plan = _vcrrOpsSerie_(x, g, grupo, clanes, bloq);
  }
  var ops = plan.ops, conflictos = plan.conflictos;
  // §PF336: una serie estimada solo con el PERFIL de RoyaleAPI (no con el log del clan) no se escribe: el perfil suma todos los clanes del jugador y puede incluir
  // ataques en un clan externo, así que su valor es una inferencia. Lo que habría escrito queda como conflicto («SIN ESCRIBIR») para revisarlo a mano.
  // Las estimadas con el log del clan y las confirmadas a mano se escriben como siempre.
  if (ops.length && /estimado con RoyaleAPI \(perfil/.test(String(x.notas || ''))) {
    ops.forEach(function (op) { pideConflicto(op.dia, 'serie estimada con el perfil de RoyaleAPI (no con el log del clan): revisar a mano'); });
    ops = [];
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
    var g = c.grupo, gd = grupos[_excDiasClaveGrupo_(g)];   // §PF445 punto 12: la clave por Tag del clan (el grupo sintético de _vcrrPlanSerie_ lleva su clanTag)
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

// ----- Descartar filas de un clan equivocado en Backup_Guerra.csv (§PF339) -----

/**
 * Motor de descartarFilasClanEquivocadoInforme() y descartarFilasClanEquivocadoAplicar(). aplicar = false solo informa. Con aplicar = true: respaldo previo, quita las filas,
 * relee Backup_Guerra.csv de Drive y verifica; si la verificación falla lo dice con el nombre del respaldo para restaurar. Si no se puede leer la hoja Guerra no quita nada
 * (la próxima sincronización volvería a copiar al CSV las filas que la hoja todavía tenga). Detalle en «Cruce_CRR_vs_Backup <fecha> (descarte, informe|aplicado).csv».
 */
function _vcrrDescartarFilas_(aplicar) {
  var nombreFn = aplicar ? 'descartarFilasClanEquivocadoAplicar' : 'descartarFilasClanEquivocadoInforme';
  if (!_adquirirLockEjecucion(nombreFn)) return;
  var lock = LockService.getScriptLock(), conLock = false;
  try {
    if (aplicar) {
      if (!lock.tryLock(30000)) { Logger.log('[VCRR descarte] Hay otro proceso escribiendo; vuelve a correr ' + nombreFn + '() en un momento. No se quitó nada.'); return; }
      conLock = true;
    }
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var bk = _vcrrLeerBackupGuerra_();
    if (!bk) { Logger.log('[VCRR descarte] No se encontró Backup_Guerra.csv o está vacío; no se quita nada.'); return; }
    var idsHoja = _vcrrIdsHojaGuerra_();
    if (idsHoja === null) {
      if (aplicar) { Logger.log('[VCRR descarte] No se pudo leer la hoja Guerra: no se quita nada, porque la sincronización volvería a copiar al CSV las filas que la hoja tenga. Vuelve a intentarlo.'); return; }
      Logger.log('[VCRR descarte] OJO: no se pudo leer la hoja Guerra; este informe no avisa si la hoja todavía tiene alguna de las filas.');
      idsHoja = {};
    }
    var plan = _vcrrPlanDescartar_(bk.filas, VCRR_FILAS_DESCARTAR, idsHoja);
    var nQuitar = plan.quitar.length;
    var sinQuitar = plan.avisos.filter(function (a) { return a.tipo === 'conflicto'; }).length;
    var yaQuitadas = plan.avisos.length - sinQuitar;
    var detalle = [['Temporada', 'Semana', 'Clan', 'Tag', 'Nombre', 'Día', 'Acción', 'AtaquesHoy', 'AtaquesSemana', 'Fame', 'Origen', 'Se conserva', 'Nota']];
    plan.quitar.forEach(function (q) {
      var r = q.fila;
      detalle.push([r[GC.TEMPORADA - 1], r[GC.SEMANA - 1], r[GC.CLAN - 1], q.entrada.tag, q.entrada.nombre, VCRR_DIAS.charAt(q.dia), aplicar ? 'Quitar' : 'Quitaría',
        r[GC.ATAQUES_HOY - 1], r[GC.ATAQUES_SEM - 1], r[GC.FAME - 1], r[GC.ORIGEN - 1], q.entrada.conserva || '', q.entrada.nota || '']);
    });
    plan.avisos.forEach(function (a) {
      var e = a.entrada;
      detalle.push([e.temporada, e.semana, e.clanKey, e.tag, e.nombre, e.dias, (a.tipo === 'conflicto' ? 'SIN QUITAR: ' : 'Nada que quitar: ') + a.motivo, '', '', '', '', e.conserva || '', e.nota || '']);
    });
    var problemas = [];
    if (aplicar && nQuitar > VCRR_MAX_FILAS_DESCARTAR) {
      Logger.log('[VCRR descarte] NO SE QUITÓ NADA: ' + nQuitar + ' fila(s) por quitar pasan el tope de ' + VCRR_MAX_FILAS_DESCARTAR + ' (VCRR_MAX_FILAS_DESCARTAR). Revisa VCRR_FILAS_DESCARTAR.');
      return;
    }
    if (aplicar && nQuitar > 0) {
      var quitarIdx = {};
      plan.quitar.forEach(function (q) { quitarIdx[q.idx] = true; });
      var copiaAntes = bk.filas.map(function (r) { return r.slice(); });
      var restantes = bk.filas.filter(function (r, i) { return !quitarIdx[i]; });
      _saveCSVToDrive('Backup_Guerra ANTES de descartar filas de clan equivocado ' + marca + '.csv', bk.texto);
      _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([bk.encabezado].concat(restantes)));
      var despues = _loadCSVFromDrive('Backup_Guerra.csv');
      var parsedDespues = despues ? _parseCSV(despues) : null;
      if (!parsedDespues || parsedDespues.length < 2) problemas.push('No se pudo releer Backup_Guerra.csv');
      else {
        var filasDespues = parsedDespues.slice(1);
        for (var b = 0; b < filasDespues.length; b++) { while (filasDespues[b].length < GUERRA_TOTAL_COLS) filasDespues[b].push(''); }
        problemas = _vcrrVerificarDescarte_(copiaAntes, filasDespues, plan, idsHoja);
      }
    }
    if (detalle.length > 1) _saveCSVToDrive('Cruce_CRR_vs_Backup ' + marca + ' (descarte, ' + (aplicar ? 'aplicado' : 'informe') + ').csv', _encodeCSVInforme(detalle));
    Logger.log('[VCRR descarte] ' + (aplicar ? 'Quitadas' : 'Se quitarían') + ' ' + nQuitar + ' fila(s) de ' + VCRR_FILAS_DESCARTAR.length + ' entrada(s); ya quitadas o ausentes: ' + yaQuitadas + '; sin quitar por conflicto: ' + sinQuitar + '. ' +
      (problemas.length ? 'VERIFICACIÓN FALLÓ (' + problemas.length + '): ' + problemas.slice(0, 5).join('; ') + '. Restaurar con «Backup_Guerra ANTES de descartar filas de clan equivocado ' + marca + '.csv».'
        : (aplicar && nQuitar > 0 ? 'Verificación OK. Ahora corre verificarCrrVsBackupAplicar() para crear con el piso del JSON las filas correctas.' : '')));
    plan.avisos.forEach(function (a) {
      if (a.tipo === 'conflicto') Logger.log('[VCRR descarte] SIN QUITAR T' + a.entrada.temporada + ' S' + a.entrada.semana + ' ' + a.entrada.nombre + ' ' + a.entrada.tag + ': ' + a.motivo);
    });
  } finally {
    if (conLock) lock.releaseLock();
    _liberarLockEjecucion();
  }
}

/**
 * Función pura. De las filas de Backup_Guerra.csv y la lista VCRR_FILAS_DESCARTAR arma qué filas se quitan: { quitar: [{ idx, fila, dia, entrada }], avisos: [{ tipo, entrada, motivo }] }.
 * Cada entrada es TODO O NADA: si una de sus filas no cuadra no se quita ninguna de esa entrada y queda un aviso de tipo 'conflicto'. No se quita la fila si: (1) hay más filas que días
 * pedidos (se esperaba una por día), (2) sus valores [AtaquesHoy, AtaquesSemana, Fame] no son los de la entrada (cambió desde la decisión), o (3) la hoja Guerra todavía la tiene (idsHoja =
 * { id de _idFilaGuerraCSV: true }): la próxima sincronización la volvería a copiar al CSV. Una entrada sin filas deja un aviso 'ausente' (ya se quitó o nunca estuvo). Solo mira filas de la etapa Guerra.
 */
function _vcrrPlanDescartar_(filas, lista, idsHoja) {
  var quitar = [], avisos = [];
  (lista || []).forEach(function (e) {
    var dias = String(e.dias || '');
    var halladas = [];
    for (var i = 0; i < filas.length; i++) {
      var r = filas[i];
      if (String(r[GC.ETAPA - 1]) !== 'Guerra') continue;
      if (Number(r[GC.TEMPORADA - 1]) !== Number(e.temporada) || Number(r[GC.SEMANA - 1]) !== Number(e.semana)) continue;
      if (String(r[GC.TAG - 1]).trim().toUpperCase() !== String(e.tag).toUpperCase()) continue;
      if (_vcrrClanNorm_(r[GC.CLAN - 1]) !== e.clanKey) continue;
      var off = (_excDiasNum(r[GC.PERIOD_IDX - 1]) % 7) - 3;
      if (off < 0 || off > 3 || dias.indexOf(VCRR_DIAS.charAt(off)) < 0) continue;
      halladas.push({ idx: i, fila: r, dia: off, entrada: e });
    }
    if (!halladas.length) { avisos.push({ tipo: 'ausente', entrada: e, motivo: 'no hay filas de ese clan en los días ' + dias + ' (ya se quitaron o nunca estuvieron)' }); return; }
    var motivo = '';
    if (halladas.length > dias.length) motivo = 'hay ' + halladas.length + ' filas y se esperaba una por día (' + dias + ')';
    for (var h = 0; h < halladas.length && !motivo; h++) {
      var f = halladas[h].fila, letra = VCRR_DIAS.charAt(halladas[h].dia);
      var v = [_excDiasNum(f[GC.ATAQUES_HOY - 1]), _excDiasNum(f[GC.ATAQUES_SEM - 1]), _excDiasNum(f[GC.FAME - 1])];
      if (e.valores && (v[0] !== e.valores[0] || v[1] !== e.valores[1] || v[2] !== e.valores[2])) motivo = 'la fila del día ' + letra + ' tiene ' + v.join('/') + ' y se esperaba ' + e.valores.join('/') + ' (cambió desde la decisión)';
      else if (idsHoja && idsHoja[_idFilaGuerraCSV(f)]) motivo = 'la hoja Guerra todavía tiene la fila del día ' + letra + ': se volvería a copiar al CSV en la próxima sincronización';
    }
    if (motivo) { avisos.push({ tipo: 'conflicto', entrada: e, motivo: motivo }); return; }
    halladas.forEach(function (x) { quitar.push(x); });
  });
  return { quitar: quitar, avisos: avisos };
}

/** IDs (_idFilaGuerraCSV) de las filas que tiene ahora la hoja Guerra: { id: true }. {} si la hoja no existe o está vacía; null si falla la lectura. Solo lee. */
function _vcrrIdsHojaGuerra_() {
  try {
    var sh = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
    var ids = {};
    if (!sh || sh.getLastRow() < 2) return ids;
    var datos = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
    for (var i = 0; i < datos.length; i++) { var id = _idFilaGuerraCSV(datos[i]); if (id) ids[id] = true; }
    return ids;
  } catch (e) {
    Logger.log('[VCRR descarte] No se pudo leer la hoja Guerra: ' + e.message);
    return null;
  }
}

/**
 * Verifica, sobre las filas releídas de Drive, que: (1) quedaron exactamente las filas de antes menos las quitadas; (2) todas las demás son idénticas y en el mismo orden;
 * (3) ninguna entrada que se aplicó sigue teniendo filas por quitar. Devuelve la lista de problemas (vacía = todo bien).
 */
function _vcrrVerificarDescarte_(filasAntes, filasDespues, plan, idsHoja) {
  var problemas = [];
  var quitado = {};
  plan.quitar.forEach(function (q) { quitado[q.idx] = true; });
  var esperadas = filasAntes.filter(function (r, i) { return !quitado[i]; });
  if (filasDespues.length !== esperadas.length) problemas.push('número de filas ' + filasDespues.length + ' en vez de ' + esperadas.length);
  for (var i = 0; i < esperadas.length && i < filasDespues.length; i++) {
    if (esperadas[i].join('\u0001') !== filasDespues[i].slice(0, esperadas[i].length).join('\u0001')) { problemas.push('cambió una fila no planeada (fila ' + (i + 1) + ' tras quitar)'); if (problemas.length > 10) break; }
  }
  var aplicadas = [];
  plan.quitar.forEach(function (q) { if (aplicadas.indexOf(q.entrada) < 0) aplicadas.push(q.entrada); });
  var otra = _vcrrPlanDescartar_(filasDespues, aplicadas, idsHoja);
  if (otra.quitar.length) problemas.push('siguen ' + otra.quitar.length + ' fila(s) por quitar');
  return problemas;
}

// ----- Revertir lo que «Aplicar» subió y dejó un día imposible (§PF446): motor -----

/**
 * _vcrrPlanRevertir_(filasAntes, filasAhora) — §PF446. Función pura. filasAntes = Backup_Guerra.csv antes de «Aplicar» (el respaldo previo); filasAhora = el de ahora (sin encabezado, con GUERRA_TOTAL_COLS columnas).
 * Toma como operaciones de «Aplicar» las filas de filasAhora con origen VCRR_ORIGEN_SUBIDA cuyos valores cambiaron respecto del respaldo (y las de origen VCRR_ORIGEN_CREADA que el respaldo no tiene),
 * y con _vcrrDiasQueFallan_ saca las que dejan imposible un día que antes no lo era, repitiendo hasta que no quede ninguna. Devuelve { casos, avisos }: casos = [{ grupo, ops }] con las filas que se devuelven
 * a su valor del respaldo (ops en el formato de _excDiasAplicarPlan(): fila, existe true, ant = lo de ahora, nuevo = lo del respaldo); avisos = [{ grupo, dia, motivo }] para lo que no se puede revertir aquí
 * (una fila creada por «Aplicar»: esta función no borra filas).
 */
function _vcrrPlanRevertir_(filasAntes, filasAhora) {
  var gAntes = _excDiasAgrupar(filasAntes), gAhora = _excDiasAgrupar(filasAhora), indiceAntes = _vcrrIndiceGruposPorJugador_(gAntes);
  var valores = function (f) { return { hoy: _excDiasNum(f[GC.ATAQUES_HOY - 1]), sem: _excDiasNum(f[GC.ATAQUES_SEM - 1]), fame: _excDiasNum(f[GC.FAME - 1]), barcos: _excDiasNum(f[GC.BARCOS - 1]) }; };
  var casos = [], avisos = [];
  Object.keys(gAhora).forEach(function (k) {
    var gh = gAhora[k], ga = gAntes[k] || { dias: {} }, ops = [];
    for (var d = 0; d < 4; d++) {
      var fh = gh.dias[d], fa = ga.dias[d];
      if (!fh) continue;
      var origen = String(fh[GC.ORIGEN - 1]);
      if (fa && origen === VCRR_ORIGEN_SUBIDA) {
        var vh = valores(fh), va = valores(fa);
        if (vh.hoy !== va.hoy || vh.sem !== va.sem || vh.fame !== va.fame || vh.barcos !== va.barcos) ops.push({ dia: d, existe: true, fila: fh, filaAntes: fa, nuevo: vh });
      } else if (!fa && origen === VCRR_ORIGEN_CREADA) {
        ops.push({ dia: d, existe: false, fila: fh, filaAntes: null, nuevo: valores(fh) });
      }
    }
    if (!ops.length) return;
    var otro = _vcrrDiasEnOtroClan_(indiceAntes, { temporada: gh.temporada, semana: gh.semana, tag: gh.tag, clan: gh.clan }, k);
    var devolver = [];
    for (var vuelta = 0; vuelta < 8 && ops.length; vuelta++) {
      var fallan = _vcrrDiasQueFallan_(ga, ops, otro), malos = {};
      if (!fallan.length) break;
      fallan.forEach(function (f) { malos[f.dia] = f.motivo; });
      ops.forEach(function (o) { if (malos[o.dia] !== undefined) { o.motivo = malos[o.dia]; devolver.push(o); } });
      ops = ops.filter(function (o) { return malos[o.dia] === undefined; });
    }
    var opsCaso = [];
    devolver.forEach(function (o) {
      if (!o.existe) { avisos.push({ grupo: gh, dia: o.dia, motivo: 'fila creada por «Aplicar» que deja imposible el día ' + VCRR_DIAS.charAt(o.dia) + ' del vecino; esta función no borra filas, revisar a mano' }); return; }
      var an = valores(o.filaAntes);
      opsCaso.push({ dia: o.dia, existe: true, fila: o.fila, sinCambio: false, ant: o.nuevo, nuevo: { hoy: an.hoy, sem: an.sem, fame: an.fame, barcos: an.barcos, origen: String(o.filaAntes[GC.ORIGEN - 1]) }, motivo: o.motivo });
    });
    if (opsCaso.length) casos.push({ grupo: gh, ops: opsCaso });
  });
  return { casos: casos, avisos: avisos };
}

/**
 * Motor de verificarCrrVsBackupRevertirInforme() y verificarCrrVsBackupRevertirAplicar() (§PF446). aplicar = false solo informa. Con aplicar = true: respaldo previo, devuelve las filas a su valor
 * del respaldo de «Aplicar» con _excDiasAplicarPlan(), relee Backup_Guerra.csv de Drive y verifica con _vcrrVerificarAplicado_; si la verificación falla lo dice con el nombre del respaldo para restaurar.
 */
function _vcrrRevertirSubidas_(aplicar) {
  var nombreFn = aplicar ? 'verificarCrrVsBackupRevertirAplicar' : 'verificarCrrVsBackupRevertirInforme';
  if (!_adquirirLockEjecucion(nombreFn)) return;
  var lock = LockService.getScriptLock(), conLock = false;
  try {
    if (aplicar) {
      if (!lock.tryLock(30000)) { Logger.log('[VCRR revertir] Hay otro proceso escribiendo; vuelve a correr ' + nombreFn + '() en un momento. No se tocó nada.'); return; }
      conLock = true;
    }
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var nombreAntes = 'Backup_Guerra ANTES de verificar CRR vs Backup ' + VCRR_REVERTIR_MARCA + '.csv';
    var bk = _vcrrLeerBackupGuerra_();
    if (!bk) { Logger.log('[VCRR revertir] No se encontró Backup_Guerra.csv o está vacío; no se toca nada.'); return; }
    var textoAntes = _loadCSVFromDrive(nombreAntes);
    var parsedAntes = textoAntes ? _parseCSV(textoAntes) : null;
    if (!parsedAntes || parsedAntes.length < 2) { Logger.log('[VCRR revertir] No se encontró «' + nombreAntes + '» en Drive o está vacío; no se toca nada. Revisa VCRR_REVERTIR_MARCA.'); return; }
    var filasAntes = parsedAntes.slice(1);
    for (var a = 0; a < filasAntes.length; a++) { while (filasAntes[a].length < GUERRA_TOTAL_COLS) filasAntes[a].push(''); }
    var plan = _vcrrPlanRevertir_(filasAntes, bk.filas);
    var nOps = 0;
    plan.casos.forEach(function (c) { nOps += c.ops.length; });
    var detalle = [['Temporada', 'Semana', 'Clan', 'Tag', 'Nombre', 'Día', 'Acción', 'AtaquesHoy ahora', 'AtaquesHoy anterior', 'AtaquesSemana ahora', 'AtaquesSemana anterior', 'Fame ahora', 'Fame anterior', 'Barcos ahora', 'Barcos anterior', 'Origen anterior', 'Motivo']];
    plan.casos.forEach(function (c) {
      c.ops.forEach(function (op) {
        detalle.push([c.grupo.temporada, c.grupo.semana, c.grupo.clan, c.grupo.tag, c.grupo.nombre, VCRR_DIAS.charAt(op.dia), aplicar ? 'Revertir' : 'Revertiría',
          op.ant.hoy, op.nuevo.hoy, op.ant.sem, op.nuevo.sem, op.ant.fame, op.nuevo.fame, op.ant.barcos, op.nuevo.barcos, op.nuevo.origen, op.motivo]);
      });
    });
    plan.avisos.forEach(function (v) { detalle.push([v.grupo.temporada, v.grupo.semana, v.grupo.clan, v.grupo.tag, v.grupo.nombre, VCRR_DIAS.charAt(v.dia), 'SIN REVERTIR', '', '', '', '', '', '', '', '', '', v.motivo]); });
    var problemas = [];
    if (aplicar && nOps > VCRR_MAX_FILAS_REVERTIR) {
      Logger.log('[VCRR revertir] NO SE ESCRIBIÓ NADA: ' + nOps + ' fila(s) por revertir pasan el tope de ' + VCRR_MAX_FILAS_REVERTIR + ' (VCRR_MAX_FILAS_REVERTIR). Corre verificarCrrVsBackupRevertirInforme() y revisa el detalle.');
      return;
    }
    if (aplicar && nOps > 0) {
      var idxDe = new Map();
      for (var q = 0; q < bk.filas.length; q++) idxDe.set(bk.filas[q], q);
      plan.casos.forEach(function (c) { c.ops.forEach(function (op) { op.idxAntes = idxDe.get(op.fila); }); });
      var copiaAntes = bk.filas.map(function (r) { return r.slice(); });
      _saveCSVToDrive('Backup_Guerra ANTES de revertir CRR vs Backup ' + marca + '.csv', bk.texto);
      _excDiasAplicarPlan(bk.filas, { casos: plan.casos });
      _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([bk.encabezado].concat(bk.filas)));
      var despues = _loadCSVFromDrive('Backup_Guerra.csv');
      var parsedDespues = despues ? _parseCSV(despues) : null;
      if (!parsedDespues || parsedDespues.length < 2) problemas.push('No se pudo releer Backup_Guerra.csv');
      else {
        var filasDespues = parsedDespues.slice(1);
        for (var b = 0; b < filasDespues.length; b++) { while (filasDespues[b].length < GUERRA_TOTAL_COLS) filasDespues[b].push(''); }
        problemas = _vcrrVerificarAplicado_(copiaAntes, filasDespues, plan.casos, 0);
      }
    }
    if (detalle.length > 1) _saveCSVToDrive('Cruce_CRR_vs_Backup ' + marca + ' (revertir, ' + (aplicar ? 'aplicado' : 'informe') + ').csv', _encodeCSVInforme(detalle));
    Logger.log('[VCRR revertir] ' + (aplicar ? 'Revertidas' : 'Se revertirían') + ' ' + nOps + ' fila(s) de ' + plan.casos.length + ' serie(s); sin revertir: ' + plan.avisos.length + '. ' +
      (problemas.length ? 'VERIFICACIÓN FALLÓ (' + problemas.length + '): ' + problemas.slice(0, 5).join('; ') + '. Restaurar con «Backup_Guerra ANTES de revertir CRR vs Backup ' + marca + '.csv».'
        : (aplicar && nOps > 0 ? 'Verificación OK. Ahora corre generarGuerraDesglose() para comprobar que los «Imposible» bajan.' : '')));
    plan.avisos.forEach(function (v) { Logger.log('[VCRR revertir] SIN REVERTIR T' + v.grupo.temporada + ' S' + v.grupo.semana + ' ' + v.grupo.nombre + ' ' + v.grupo.tag + ': ' + v.motivo); });
  } finally {
    if (conLock) lock.releaseLock();
    _liberarLockEjecucion();
  }
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

/**
 * Los totales cerrados de RoyaleAPI de UNA semana, para cruzarlos con las series anómalas fuera de la verificación (§PF320, decisión (a): las demás cadenas usan también el cruce).
 * Lee Cruce_CRR_RoyaleAPI.csv una sola vez por ejecución (_vcrrIndiceRapiDeDrive_). Devuelve undefined si ese caché no existe, está vacío o falla la lectura: entonces no se cruza
 * nada y las series quedan como antes (solo con los JSON de CurrentRiverRace). Si el caché existe pero la semana no tiene datos, devuelve {} (las anómalas quedan «SIN RESOLVER», solo como nota).
 * No lo actualiza: lo refresca el paso de RoyaleAPI de verificarCrrVsBackupInforme().
 */
function _vcrrRapiSemanaParaCache_(temporada, semana) {
  try {
    var idx = _vcrrIndiceRapiDeDrive_();
    if (!idx || !Object.keys(idx).length) return undefined;
    return idx[Number(temporada) + '|' + Number(semana)] || {};
  } catch (e) {
    Logger.log('[VCRR] No se pudo leer el caché de RoyaleAPI para T' + temporada + ' S' + semana + ' (' + e.message + '); las series se calculan sin el cruce.');
    return undefined;
  }
}

/** Mapa de la semana (con caché por ejecución): 'clanKey|tag' -> serie y '*|tag' -> lista de las series de ese jugador en todos los clanes. Lee los JSON una sola vez. Las series anómalas van ya cruzadas con RoyaleAPI (§PF320) cuando su caché existe. */
function _vcrrCacheSemana_(temporada, semana) {
  var clave = Number(temporada) + '|' + Number(semana);
  if (!_VCRR_CACHE_RANGOS_[clave]) {
    var mapa = {};
    var archivos = _vcrrArchivosSemana_(temporada, semana);
    if (archivos.length) {
      var cap = _vcrrCapturasSemana_(temporada, semana, archivos);
      _vcrrSeriesDeSemana_(temporada, semana, cap.porClan, _vcrrRapiSemanaParaCache_(temporada, semana)).forEach(function (x) {
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
    out.clanes[s.clanKey] = { nombre: s.nombre, estado: s.estado, estricto: v.length === 3 && (s.estado === 'ok' || s.estado === 'multiclan' || s.estado === 'confirmada'), A: fin('A'), B: fin('B'), F: fin('F'), conflicto: aj.conflicto };
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
