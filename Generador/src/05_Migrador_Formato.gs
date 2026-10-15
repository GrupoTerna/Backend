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

/** @const {number} Presupuesto de tiempo por ejecución, en ms.
 *  Deja margen bajo el límite real de Apps Script (~6 min en cuentas
 *  gratuitas/Gmail normales). Si el proyecto es de Google Workspace con
 *  límite de 30 min, se puede subir con confianza (p. ej. a 25 min). */
var MIG_LIMITE_MS_ = 5 * 60 * 1000;

/** @const {string} Clave en PropertiesService para el estado de la migración. */
var MIG_PROP_ESTADO_ = 'MIG_FORMATO_ESTADO_V1';

/** @const {string} Nombre del handler que se re-programa como trigger. */
var MIG_TRIGGER_HANDLER_ = 'migrarFormatoJSON';

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
 * Paso 3: normaliza los nombres de la carpeta de players usando la fecha
 *         real de creación de CADA archivo (getDateCreated), no la hora
 *         de la corrida actual; esos archivos no llevan tag, porque no
 *         tienen sectionIndex/periodIndex propio.
 */
function migrarFormatoJSON() {
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

      var clanCompleto = _mig_etiquetarCarpetaClan(clave, estado.resumen, cache, inicio); // PF074: recibe la CLAVE del clan

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
    _migrarCarpetaPlayers(estado.resumen);
    estado.fase = 'hecho';
  }

  _mig_finalizar_(estado, cache);
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
 * @return {boolean} true si se terminó de etiquetar toda la carpeta,
 *   false si se cortó por presupuesto de tiempo (la carpeta se debe
 *   reintentar completa la próxima vez; es rápido porque el análisis ya
 *   quedó en el cache y mover/renombrar un archivo ya correcto no hace nada).
 */
function _mig_etiquetarCarpetaClan(clanClave, resumen, cache, inicio) {
  // PF074 (14-oct-2026): recibe la CLAVE del clan y analiza juntas sus carpetas del esquema ACTUAL (endpoint -> clan) y
  // la vieja. Los archivos que ya estan en la carpeta actual del endpoint NO se mueven; los que siguen en la carpeta
  // vieja del clan se renombran en su sitio y se cuentan (resumen.enCarpetaVieja): moverlos es una decision pendiente.
  var carpeta  = { getName: function() { return clanClave; } }; // solo para los mensajes del log
  var analisis = _analizarCarpetaJSON_(clanClave, cache);
  console.log('    [' + clanClave + '] ' + _textoCorteDiario_(analisis.corteDiario)); // PF080

  var enRevision = {}; // PF077: clans.json que caen en la ventana 04:00-05:00 (o piden una captura que cae ahi)
  analisis.aRevision.forEach(function(r) { enRevision[r.clave] = r.motivo; });
  analisis.sinResolver.forEach(function(clave) {
    resumen.ignorados.push('[' + carpeta.getName() + '] ' + clave + (enRevision[clave]
      ? ' [A REVISAR: ' + enRevision[clave] + '; no se renombró]'
      : ' [sin currentriverrace.json legible, no se pudo etiquetar]'));
  });

  for (var i = 0; i < analisis.resueltas.length; i++) {
    if (inicio && _mig_tiempoAgotado_(inicio)) {
      console.log('    (presupuesto de tiempo alcanzado dentro de "' + carpeta.getName() + '"; se retoma esta misma carpeta en la próxima ejecución)');
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
      if (idCarpetaActual && !_mig_estaBajoCarpeta_(archivo, idCarpetaActual)) {
        resumen.enCarpetaVieja = (resumen.enCarpetaVieja || 0) + 1;
      } else if (idCarpetaActual) {
        // PF074 (tanda 4): lo que ya esta en la carpeta actual del endpoint va a su carpeta de temporada y semana
        // (T-xx / S-xx, misma temporada y semana que el tag). Si ya esta ahi, no se mueve.
        var carpetaSemana = _carpetaSemanaJSON_(clanClave, endpointKey, item.temporada, item.sectionIndex);
        if (carpetaSemana && !_mig_yaEstaEnCarpeta_(archivo, carpetaSemana)) {
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

function _migrarCarpetaPlayers(resumen) {
  var carpeta  = DriveApp.getFolderById(CARPETA_PLAYERS_ID_);
  var archivos = carpeta.getFiles();

  while (archivos.hasNext()) {
    var archivo = archivos.next();
    var nombre  = archivo.getName();

    if (nombre.slice(-5).toLowerCase() !== '.json') continue;

    var contenido, obj;
    try {
      contenido = archivo.getBlob().getDataAsString('UTF-8');
      obj       = JSON.parse(contenido);
    } catch(e) {
      resumen.ignorados.push(nombre + ' [players — no se pudo leer/parsear JSON]');
      continue;
    }

    var playerTag = (obj.tag || nombre.replace('.json', '')).trim();
    var clanName  = (obj.clan && obj.clan.name) ? obj.clan.name : 'Sin clan';

    // Fecha real de creación de ESTE archivo (getDateCreated), no la hora
    // compartida de la corrida actual: así cada player conserva su propia
    // fecha de captura en vez de que todos queden re-fechados con el
    // instante en que se ejecutó migrarFormatoJSON() (mismo bug que se
    // corrigió en _mig_etiquetarCarpetaClan, ver 05_Migrador_Formato.gs).
    var fechaHora = _mig_fechaHoraStr(archivo.getDateCreated());

    var nombreNuevo = fechaHora + ' - ' + clanName + ' - ' + playerTag + '.json';

    if (nombre === nombreNuevo) continue;

    _mig_renombrarSeguro(archivo, nombreNuevo, resumen);
    resumen.renombrados++;
    console.log('    [player] ' + nombre + '\n       → ' + nombreNuevo);
  }
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

/** @const {string} Letras del día de la semana, índice 0 = lunes … 6 = domingo (L M X J V S D). */
var LETRAS_DIA_GUERRA_ = 'LMXJVSD';

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

function _mig_fechaHoraStr(d) {
  return Utilities.formatDate(d, 'America/Lima', 'dd-MM-yyyy HH.mm');
}

function _mig_soloHora(d) {
  return Utilities.formatDate(d, 'America/Lima', 'HH.mm');
}

function _mig_horaLima(d) {
  return Utilities.formatDate(d, 'America/Lima', 'dd/MM/yyyy HH:mm:ss') + ' (Lima)';
}

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
  console.log('   (también se puede ejecutar migrarFormatoJSON() manualmente para continuar antes)');
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