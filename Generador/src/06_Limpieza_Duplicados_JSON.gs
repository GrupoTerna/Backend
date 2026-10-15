// =============================================================================
// 06_Limpieza_Duplicados_JSON.gs
// Limpieza de respaldos JSON duplicados o con periodIndex incorrecto en las
// carpetas donde opera el organizador (04_Organizador_JSON.gs).
//
// Depende de CARPETA_JSON_RAIZ_ID_, CARPETAS_CLAN_ y _archivosDeCarpetaClan_,
// definidos en 04_Organizador_JSON.gs (debe estar en el mismo proyecto de
// Apps Script). _archivosDeCarpetaClan_ es lo que permite que el análisis
// vea tanto los archivos sueltos como los ya organizados en subcarpetas
// por endpoint (CurrentRiverRace, Clans).
//
// PROBLEMA QUE RESUELVE
// ----------------------------------------------------------------------------
// 1) El nombre de archivo ("<fecha hora> - <clan> - <endpoint>.json") puede
//    traer una fecha/hora FICTICIA (bug de la fuente que genera el nombre).
//    Por eso NUNCA se usa el nombre para decidir identidad, solo para
//    agrupar los archivos que pertenecen a una misma captura (comparten
//    idéntico prefijo "fecha hora - clan").
//
// 2) La identidad real de una captura es la terna (temporada, sectionIndex,
//    periodIndex). El número de temporada NO viene en el nombre ni en el
//    JSON, pero se puede CALCULAR: Clash Royale reinicia temporada el
//    primer lunes de cada mes, y ese primer lunes tiene un número de
//    temporada conocido (ver ancla en _temporadaDeFecha_ más abajo). Con
//    eso, la temporada de cualquier captura sale directo de su fecha REAL
//    de creación en Drive (getDateCreated, nunca el nombre del archivo,
//    que puede traer una fecha ficticia). No depende de leer ninguna otra
//    captura ni del orden en que quedaron guardadas, así que es correcta
//    aunque falten archivos en el historial de un clan. sectionIndex y
//    periodIndex SÍ vienen del contenido de currentriverrace.json (ver
//    punto 3), así que solo se pueden leer directamente de una captura
//    que tenga ese archivo.
//
// 2b) No todas las capturas tienen su propio currentriverrace.json con el
//    MISMO string de fecha-hora: si la fuente hace la llamada a la API de
//    currentriverrace y la de clan por separado, pueden quedar con
//    timestamps distintos (segundos u horas de diferencia) y no agruparse
//    en la misma captura. Para esos casos (típicamente "clans.json"
//    sueltos), se les PRESTA la identidad (sectionIndex/periodIndex) de
//    la captura con currentriverrace.json más cercana en el tiempo real,
//    siempre que esté dentro de un margen razonable (PAREO_TOLERANCIA_MS_,
//    6 horas por defecto). Si no hay ninguna ancla lo bastante cerca,
//    se dejan sin resolver (intactas) en vez de adivinar mal. Estas
//    capturas "prestadas" se marcan con esAncla=false y jamás compiten en
//    la limpieza de duplicados (punto 4): solo se comparan por tamaño las
//    que sí tienen su propio currentriverrace.json legible.
//
// 3) Dentro de UN MISMO currentriverrace.json, "periodIndex" aparece varias
//    veces: una vez a nivel superior del documento, y luego otras veces más
//    adentro (p. ej. dentro de cada entrada de "periodLogs", que numera algo
//    distinto). La mención correcta es SIEMPRE LA PRIMERA que aparece en el
//    archivo (en el orden en que está escrita en el JSON); las que aparecen
//    después, más adentro del documento, se ignoran por completo.
//
// 4) Puede haber varias capturas (varios archivos) válidas de la misma
//    (temporada, sectionIndex, periodIndex) real —por reintentos o
//    ejecuciones repetidas—. De esas, solo se conserva la MÁS COMPLETA
//    (mayor tamaño de currentriverrace.json) y se descartan las demás.
//
// Por seguridad, los archivos descartados se mandan a la papelera de Drive
// (setTrashed), nunca se borran de forma permanente. Corre primero en modo
// simulación (LIMPIEZA_DRY_RUN_ = true) y revisa el log antes de aplicar.
// =============================================================================

/** @const {boolean} true = solo reporta en el log, no borra nada. */
var LIMPIEZA_DRY_RUN_ = true;

/**
 * Punto de entrada manual. Revisa la carpeta raíz de JSON y cada carpeta de
 * clan, y limpia duplicados / periodIndex incorrectos según las reglas
 * descritas arriba.
 */
function limpiarDuplicadosJSON() {
  console.log('════════════════════════════════════════════');
  console.log(LIMPIEZA_DRY_RUN_
    ? 'MODO SIMULACIÓN — no se borrará nada, solo se reporta.'
    : 'MODO REAL — los archivos descartados se enviarán a la papelera.');
  console.log('════════════════════════════════════════════');

  // Cache persistente (07_Cache_Periodos_JSON.gs), compartido con
  // migrarFormatoJSON(): evita releer el contenido de currentriverrace.json
  // que ya se leyó antes, en esta ejecución o en una anterior.
  var cache = _cache_cargar_();
  console.log('Cache de periodos cargado: ' + Object.keys(cache).length + ' archivos ya leídos anteriormente.');

  _limpiarCarpeta_(DriveApp.getFolderById(CARPETA_JSON_RAIZ_ID_), '[RAÍZ / sin organizar]', cache);

  Object.keys(CARPETAS_CLAN_).forEach(function(clave) {
    // PF074: se pasa la CLAVE del clan (no una carpeta) para ver juntas las carpetas del esquema actual y la vieja.
    _limpiarCarpeta_(clave, clave, cache);
  });

  _cache_guardar_(cache);

  console.log('════════════════════════════════════════════');
  console.log(LIMPIEZA_DRY_RUN_
    ? 'Fin de la simulación. Si el reporte se ve correcto, cambia LIMPIEZA_DRY_RUN_ a false y vuelve a ejecutar.'
    : 'Limpieza aplicada.');
}

/**
 * Procesa una carpeta: usa _analizarCarpetaJSON_ para resolver identidad y
 * temporada de cada captura, y descarta los duplicados menos completos de
 * cada (temporada, sectionIndex, periodIndex).
 * @param {Folder} carpeta
 * @param {string} etiqueta Nombre descriptivo para el log.
 * @param {Object=} cache Cache de periodos (07_Cache_Periodos_JSON.gs).
 */
function _limpiarCarpeta_(carpeta, etiqueta, cache) { // PF074: `carpeta` puede ser una Folder (raiz) o la clave de un clan (string)
  console.log('── ' + etiqueta + ' ──');

  var analisis = _analizarCarpetaJSON_(carpeta, cache);
  console.log('  ' + _textoCorteDiario_(analisis.corteDiario)); // PF080
  var resueltas = analisis.resueltas;
  var enRevision = {};
  analisis.aRevision.forEach(function(r) { enRevision[r.clave] = r.motivo; });
  var sinResolver = analisis.sinResolver.filter(function(c) { return !enRevision[c]; });

  if (sinResolver.length) {
    console.log('  Sin currentriverrace.json legible, se dejan intactas (' + sinResolver.length + '):');
    sinResolver.forEach(function(c) { console.log('    · ' + c); });
  }
  if (analisis.aRevision.length) {
    console.log('  A revisión (no se sabe el día de juego), se dejan intactas (' + analisis.aRevision.length + '):');
    analisis.aRevision.forEach(function(r) { console.log('    · ' + r.clave + ' → ' + r.motivo); });
  }

  if (resueltas.length === 0) {
    console.log('  Nada que procesar.');
    return;
  }

  for (var i = 1; i < resueltas.length; i++) {
    if (resueltas[i].temporada !== resueltas[i - 1].temporada) {
      console.log('  · Cambio de temporada → temporada ' + resueltas[i].temporada +
        ' | fecha real: ' + resueltas[i].real + ' | nombre: "' + resueltas[i].clave + '"');
    }
  }

  // --- Única regla de descarte: por cada (temporada, sectionIndex, periodIndex)
  //     real -leído como la PRIMERA mención de periodIndex dentro de cada
  //     archivo, ignorando las menciones posteriores como las de
  //     periodLogs- quedarse solo con la captura más completa.
  //
  //     Esta comparación SOLO aplica entre capturas con su propio
  //     currentriverrace.json legible (esAncla=true): son las únicas para
  //     las que "tamaño del currentriverrace.json" significa algo. Las
  //     capturas con identidad PRESTADA (p. ej. un clans.json huérfano que
  //     tomó prestada la identidad de la ancla más cercana en el tiempo,
  //     ver Paso B de _analizarCarpetaJSON_) comparten (temporada,
  //     sección, periodo) con esa ancla sin ser la misma captura, así que
  //     NUNCA se comparan/descartan por esta regla: siempre se conservan. ---
  var porPeriodo = {};
  var aConservar = [];

  resueltas.forEach(function(item) {
    if (!item.esAncla) {
      aConservar.push(item);
      return;
    }
    var k = 'T' + item.temporada + '-' + item.sectionIndex + '-' + item.periodIndex;
    if (!porPeriodo[k]) porPeriodo[k] = [];
    porPeriodo[k].push(item);
  });

  var descartadas = [];

  Object.keys(porPeriodo).forEach(function(k) {
    var grupo = porPeriodo[k];
    grupo.sort(function(a, b) { return b.tamano - a.tamano; }); // mayor tamaño primero
    aConservar.push(grupo[0]);
    grupo.slice(1).forEach(function(item) {
      item.motivo = 'duplicado del mismo periodo (' + k + '), no es el más completo (' + item.tamano + ' bytes vs ' + grupo[0].tamano + ' bytes)';
      descartadas.push(item);
    });
  });

  // --- Reporte ---
  console.log('  Temporada más reciente: ' + resueltas[resueltas.length - 1].temporada + ' | Períodos detectados: ' + Object.keys(porPeriodo).length + ' | capturas totales leídas: ' + resueltas.length);

  aConservar.forEach(function(item) {
    console.log('  ✔ CONSERVA  temporada ' + item.temporada + ' / sección ' + item.sectionIndex + ' / periodo ' + item.periodIndex +
      ' | fecha real: ' + item.real + ' | nombre: "' + item.clave + '"' +
      (item.esAncla ? ' | tamaño: ' + item.tamano + ' bytes' : ' | identidad prestada de la captura más cercana en el tiempo'));
  });

  var archivosAfectados = 0;

  descartadas.forEach(function(item) {
    var endpoints = Object.keys(item.archivos);
    console.log('  ✘ ' + (LIMPIEZA_DRY_RUN_ ? 'SE BORRARÍA' : 'BORRADA') +
      '  temporada ' + item.temporada + ' / sección ' + item.sectionIndex + ' / periodo ' + item.periodIndex +
      ' | fecha real: ' + item.real + ' | nombre: "' + item.clave + '"' +
      ' | archivos: ' + endpoints.join(', ') +
      ' | motivo: ' + item.motivo);

    archivosAfectados += endpoints.length;

    if (!LIMPIEZA_DRY_RUN_) {
      endpoints.forEach(function(endpoint) {
        item.archivos[endpoint].setTrashed(true);
      });
    }
  });

  console.log('  Total de archivos ' + (LIMPIEZA_DRY_RUN_ ? 'a enviar a la papelera' : 'enviados a la papelera') + ': ' + archivosAfectados);
}

/**
 * Analiza una carpeta y devuelve, para cada "captura" (grupo de archivos
 * que comparten el mismo prefijo "<fecha hora> - <clan>" en el nombre, sin
 * contar un posible tag "T-.. S-.. P.I-.." si ya lo traen de una ejecución
 * anterior), su identidad real: sectionIndex y periodIndex (primera
 * mención dentro del currentriverrace.json del grupo, ver _leerPeriodo_) y
 * la temporada, inferida recorriendo las capturas en orden real de
 * creación en Drive (getDateCreated, nunca el nombre) y detectando cada
 * retroceso de periodIndex como el inicio de una temporada nueva.
 *
 * No modifica ni borra nada, es de solo lectura. La usan tanto
 * migrarFormatoJSON() (05_Migrador_Formato.gs, para renombrar) como
 * limpiarDuplicadosJSON() (para decidir qué conservar), así ambas
 * coinciden siempre en la misma identidad para una misma captura.
 *
 * @param {Folder} carpeta
 * @param {Object=} cache Cache opcional de periodos ya leídos, indexado por
 *   ID de archivo (ver 07_Cache_Periodos_JSON.gs). Si un currentriverrace.json
 *   ya está en el cache, NO se vuelve a descargar/leer su contenido: se usa
 *   directamente el sectionIndex/periodIndex guardado. Los archivos leídos
 *   por primera vez se agregan al cache (mutando el objeto in-place) para
 *   que quien llamó a esta función pueda persistirlo después. Si se omite,
 *   se usa un cache vacío de un solo uso (comportamiento anterior, sin
 *   ahorro entre llamadas).
 * @return {{resueltas: Array<Object>, sinResolver: Array<string>, aRevision: Array<{clave:string, motivo:string}>, corteDiario: ?Object}}
 *   Cada elemento de "resueltas" trae: clave, real, sectionIndex,
 *   periodIndex, temporada, archivos ({endpoint: File}), tamano (bytes del
 *   currentriverrace.json), esAncla, cortes (PF077). Ordenado por fecha real
 *   ascendente. "aRevision" (PF077) lista, con su motivo, las capturas sin
 *   currentriverrace.json propio cuyo dia de juego no se pudo fijar (ventana
 *   04:00-05:00); tambien figuran en "sinResolver" y quedan sin etiquetar.
 */
function _analizarCarpetaJSON_(carpeta, cache) { // PF074: `carpeta` puede ser una Folder (raiz) o la clave de un clan (string)
  cache = cache || {};
  // _archivosDeCarpetaClan_ (04_Organizador_JSON.gs) trae tanto los
  // archivos sueltos directamente en "carpeta" como los que ya están
  // organizados dentro de sus subcarpetas de endpoint (CurrentRiverRace,
  // Clans). En la carpeta raíz (sin esas subcarpetas) simplemente no
  // encuentra ninguna y se comporta igual que antes.
  var archivos = (typeof carpeta === 'string') ? _archivosDeClan_(carpeta) : _archivosDeCarpetaClan_(carpeta);
  var capturas = {}; // claveCaptura -> { archivos: {endpoint: File}, realCreado: Date }

  archivos.forEach(function(f) {
    var nombre = f.getName();
    if (!/\.json$/i.test(nombre)) return;

    var partes = nombre.split(' - ');
    if (partes.length < 3) return; // formato no reconocido, se deja intacto

    var fechaHoraPura = _quitarTagExistente_(partes[0].trim());
    var claveCaptura = fechaHoraPura + ' - ' + partes[1].trim();
    var endpoint = partes.slice(2).join(' - ').replace(/\.json$/i, '').toLowerCase();

    if (!capturas[claveCaptura]) {
      capturas[claveCaptura] = { archivos: {}, realCreado: f.getDateCreated() };
    }
    capturas[claveCaptura].archivos[endpoint] = f;
    if (f.getDateCreated() < capturas[claveCaptura].realCreado) {
      capturas[claveCaptura].realCreado = f.getDateCreated();
    }
  });

  // --- Paso A: resolver identidad PROPIA (desde su currentriverrace.json)
  // de cada captura que sí lo tenga y se pueda leer. Estas son las
  // "anclas": los únicos puntos con sectionIndex/periodIndex confiables.
  var claves = Object.keys(capturas);
  var anclas = []; // { real: Date, sectionIndex, periodIndex }

  claves.forEach(function(clave) {
    var grupo = capturas[clave];
    var archivoRiverRace = grupo.archivos['currentriverrace'];
    if (!archivoRiverRace) return;

    var fileId = archivoRiverRace.getId();
    var cacheado = cache[fileId];

    if (cacheado) {
      // Ya se leyó este archivo antes (en esta ejecución o en una
      // anterior): nos ahorramos la descarga/parseo del contenido.
      grupo.idPeriodo = { sectionIndex: cacheado.s, periodIndex: cacheado.p };
      grupo.tamano = cacheado.t;
    } else {
      var idPeriodo = _leerPeriodo_(archivoRiverRace);
      if (idPeriodo) {
        grupo.idPeriodo = idPeriodo;
        grupo.tamano = archivoRiverRace.getSize();
        cache[fileId] = { s: idPeriodo.sectionIndex, p: idPeriodo.periodIndex, t: grupo.tamano };
      }
    }

    if (grupo.idPeriodo) {
      anclas.push({ real: grupo.realCreado, sectionIndex: grupo.idPeriodo.sectionIndex, periodIndex: grupo.idPeriodo.periodIndex });
    }
  });

  anclas.sort(function(a, b) { return a.real - b.real; });

  // PF080: hora real del corte diario de ESTE clan, medida con sus propias anclas (null si no hay datos suficientes).
  var corteDiario = _estimarCorteDiario_(anclas);

  // --- Paso B: a las capturas SIN currentriverrace.json propio y legible
  // (p. ej. un "clans.json" cuya llamada a la API quedó con un timestamp
  // unos segundos/minutos distinto al de su currentriverrace.json
  // hermano, y por eso no cayeron en la MISMA captura del paso anterior),
  // prestarles la identidad de la ancla más cercana en el tiempo real
  // (mismo clan), siempre que esté dentro de un margen razonable
  // (PAREO_TOLERANCIA_MS_). Así igual se etiquetan, en vez de quedar
  // huérfanas para siempre. Se marcan con esAncla=false para que
  // _limpiarCarpeta_ NUNCA las compare/descarte como si fueran
  // duplicados de la ancla de la que tomaron prestada la identidad
  // (comparten (temporada,sección,periodo) mas no son la misma captura).
  // PF077 (14-oct-2026): el periodIndex prestado ya NO se copia tal cual: se corre segun los cortes de las 04:00 (Lima)
  // que separan la fecha del archivo de la de la ancla (_ajustarPeriodoPrestado_). Si el archivo o la ancla caen en la
  // ventana 04:00-05:00, donde no se sabe el dia, queda SIN etiquetar y se lista aparte en "aRevision".
  var resueltas = [];
  var sinResolver = [];
  var aRevision = []; // { clave, motivo }; tambien estan en sinResolver, para que quien no lo lea los trate como intactos

  claves.forEach(function(clave) {
    var grupo = capturas[clave];
    var esAncla = !!grupo.idPeriodo;
    var idPeriodo = grupo.idPeriodo;
    var tamano = grupo.tamano;
    var cortes = 0;
    var temporadaDelDia = null;

    if (!idPeriodo && anclas.length) {
      var prestada = _anclaMasCercana_(anclas, grupo.realCreado);
      if (prestada && Math.abs(prestada.real.getTime() - grupo.realCreado.getTime()) <= PAREO_TOLERANCIA_MS_) {
        var ajuste = _ajustarPeriodoPrestado_(prestada, grupo.realCreado, (corteDiario && corteDiario.ok) ? corteDiario : null);
        if (ajuste.revision) {
          aRevision.push({ clave: clave, motivo: ajuste.revision });
        } else {
          idPeriodo = { sectionIndex: ajuste.sectionIndex, periodIndex: ajuste.periodIndex };
          cortes = ajuste.cortes;
          temporadaDelDia = ajuste.temporada;
        }
      }
    }

    if (!idPeriodo) {
      sinResolver.push(clave);
      return;
    }

    resueltas.push({
      clave: clave,
      real: grupo.realCreado,
      sectionIndex: idPeriodo.sectionIndex,
      periodIndex: idPeriodo.periodIndex,
      archivos: grupo.archivos,
      tamano: tamano,
      esAncla: esAncla, // false = identidad prestada de otra captura cercana
      cortes: cortes, // PF077: dias que se corrio el periodIndex prestado (-1, 0 o +1); 0 en las anclas
      temporadaDelDia: temporadaDelDia // PF077: temporada del DIA DE JUEGO si se corrio el periodIndex; null si no
    });
  });

  // Orden por fecha REAL de creación en Drive (no el nombre, que puede
  // traer una fecha ficticia): solo para dejar el resultado ordenado
  // cronológicamente, ya no hace falta para calcular la temporada.
  resueltas.sort(function(a, b) { return a.real - b.real; });

  resueltas.forEach(function(item) {
    // PF077: si el periodIndex se corrio un dia, la temporada sale del dia de juego (04:00 Lima), no de la fecha de
    // calendario: asi un clans.json de la madrugada del primer lunes sigue en la temporada que termina.
    item.temporada = (item.temporadaDelDia != null) ? item.temporadaDelDia : _temporadaDeFecha_(item.real);
  });

  return { resueltas: resueltas, sinResolver: sinResolver, aRevision: aRevision, corteDiario: corteDiario };
}

/** @const {number} Margen máximo para prestar identidad a una captura sin
 *  currentriverrace.json propio, en ms. Si la ancla más cercana en el
 *  tiempo real queda más lejos que esto, se prefiere dejarla sin resolver
 *  (ver Paso B en _analizarCarpetaJSON_) antes que adivinar mal. */
var PAREO_TOLERANCIA_MS_ = 6 * 60 * 60 * 1000; // 6 horas

/**
 * Busca, dentro de una lista de anclas ordenada por fecha, la más cercana
 * en el tiempo real a "fecha" (puede quedar antes o después).
 * @param {Array<{real:Date}>} anclas
 * @param {Date} fecha
 * @return {?Object}
 */
function _anclaMasCercana_(anclas, fecha) {
  var mejor = null;
  var mejorDiferencia = Infinity;
  for (var i = 0; i < anclas.length; i++) {
    var diferencia = Math.abs(anclas[i].real.getTime() - fecha.getTime());
    if (diferencia < mejorDiferencia) {
      mejorDiferencia = diferencia;
      mejor = anclas[i];
    }
  }
  return mejor;
}

/** @return {string} PF080: linea de log con el corte diario medido (o por que se uso la ventana 04:00-05:00). */
function _textoCorteDiario_(c) {
  if (!c) return 'Corte diario: sin pares de anclas seguidas, se usa la ventana 04:00-05:00.';
  if (!c.ok) return 'Corte diario: no se pudo medir (' + c.motivo + '), se usa la ventana 04:00-05:00.';
  return 'Corte diario medido: ' + _fmtHoraH_(c.desdeH) + '-' + _fmtHoraH_(c.hastaH) + ' (Lima), con ' + c.coinciden + ' de ' + c.pares + ' pares de anclas.';
}

/** @const {number} PF080: minimo de pares de anclas consecutivas (p -> p+1) para dar por medido el corte diario. */
var CORTE_MIN_PARES_ = 3;

/** @const {number} PF080: fraccion minima de esos pares que debe coincidir en el rango medido (tolera anclas raras). */
var CORTE_MIN_FRACCION_ = 0.9;

/** @return {string} Hora decimal (0-24) como "HH:MM". */
function _fmtHoraH_(h) {
  var min = Math.round(h * 60);
  var hh = Math.floor(min / 60) % 24, mm = min % 60;
  return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
}

/** @return {number} Hora de Lima de un instante, decimal en [0, 24). */
function _horaLimaDecimal_(fecha) {
  var d = new Date(fecha.getTime() - VERIF_LIMA_OFFSET_H_ * 3600 * 1000);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3600000;
}

/**
 * PF080: true si la hora de Lima de "fecha" cae estrictamente dentro de (corte.desdeH, corte.hastaH), o, sin "corte",
 * dentro de la ventana fija [04:00, 05:00) (_verif_enVentanaCambio_). Los extremos del rango medido son las horas de las
 * propias anclas que lo fijan, y esas anclas ya traen su periodIndex: no se las marca como dudosas.
 * @param {Date} fecha
 * @param {?{desdeH:number, hastaH:number}} corte
 * @return {boolean}
 */
function _enVentanaCorte_(fecha, corte) {
  if (!corte) return _verif_enVentanaCambio_(fecha);
  var h = _horaLimaDecimal_(fecha);
  return h > corte.desdeH && h < corte.hastaH;
}

/**
 * PF080 (regla nueva, decidida por la usuaria el 14-oct-2026): mide la hora REAL del corte diario de un clan en lugar de
 * suponer la ventana 04:00-05:00. Usa solo las anclas (currentriverrace.json con periodIndex propio, ordenadas por fecha
 * de creacion):
 *  - Dos anclas seguidas con periodIndex p y p+1 (y la semana que corresponde), a menos de 24 h una de otra, dicen que el
 *    corte ocurrio entre sus dos horas de Lima. Cada par es un intervalo de hora del dia donde puede estar el corte.
 *  - Dos anclas seguidas con el MISMO periodIndex dicen que el corte NO esta entre sus dos horas (a menos de 24 h).
 *  - El corte es una hora fija del dia: se toma el rango que coincide en mas intervalos (se tolera una minoria de anclas
 *    raras, como la T-05 con periodIndex 7 en un domingo) y se le recortan los bordes con los pares "sin corte".
 * Las horas se miden desde el mediodia de Lima para que un corte de madrugada no cruce el cambio de dia; un par cuyo
 * intervalo cruza ese punto se omite (no informa).
 * Funcion pura (no toca Drive). Devuelve null si no hay ningun par utilizable.
 * @param {Array<{real:Date, sectionIndex:number, periodIndex:number}>} anclas Ordenadas por fecha ascendente.
 * @return {?{ok:boolean, desdeH:number, hastaH:number, pares:number, coinciden:number, motivo:string}}
 *   ok = true si hay al menos CORTE_MIN_PARES_ pares y coinciden CORTE_MIN_FRACCION_ de ellos; desdeH/hastaH en horas de
 *   Lima (decimal). Si ok es false, "motivo" dice por que y el llamador usa la ventana fija 04:00-05:00.
 */
function _estimarCorteDiario_(anclas) {
  var intervalos = []; // [ini, fin] en horas desde el mediodia de Lima
  var exclusiones = [];
  var unDia = 24 * 3600 * 1000;
  var desdeNoon = function(fecha) { return (_horaLimaDecimal_(fecha) - 12 + 24) % 24; };

  for (var i = 1; i < anclas.length; i++) {
    var a = anclas[i - 1], b = anclas[i];
    var dt = b.real.getTime() - a.real.getTime();
    if (dt <= 0 || dt >= unDia) continue;
    var ia = desdeNoon(a.real), ib = desdeNoon(b.real);
    if (ib < ia) continue; // cruza el mediodia de Lima: no informa
    var mismaSemana = (b.sectionIndex === a.sectionIndex + Math.floor(b.periodIndex / 7) - Math.floor(a.periodIndex / 7));
    if (b.periodIndex === a.periodIndex + 1 && mismaSemana) {
      intervalos.push([ia, ib]);
    } else if (b.periodIndex === a.periodIndex && b.sectionIndex === a.sectionIndex) {
      exclusiones.push([ia, ib]);
    }
  }

  if (!intervalos.length) return null;

  // Rango de mayor coincidencia (barrido de extremos).
  var eventos = [];
  intervalos.forEach(function(iv) { eventos.push([iv[0], 1]); eventos.push([iv[1], -1]); });
  eventos.sort(function(x, y) { return x[0] - y[0] || y[1] - x[1]; }); // a igual hora, primero las entradas
  var cuenta = 0, mejor = 0, lo = null, hi = null;
  for (var e = 0; e < eventos.length; e++) {
    cuenta += eventos[e][1];
    if (cuenta > mejor) {
      mejor = cuenta; lo = eventos[e][0];
      hi = (e + 1 < eventos.length) ? eventos[e + 1][0] : lo;
    }
  }

  // Bordes: un par "sin corte" que tapa el principio o el final del rango lo acorta.
  exclusiones.forEach(function(x) {
    if (x[0] <= lo && x[1] > lo && x[1] < hi) lo = x[1];
    else if (x[1] >= hi && x[0] < hi && x[0] > lo) hi = x[0];
  });

  var res = { ok: false, desdeH: (lo + 12) % 24, hastaH: (hi + 12) % 24, pares: intervalos.length, coinciden: mejor, motivo: '' };
  if (intervalos.length < CORTE_MIN_PARES_) {
    res.motivo = 'solo ' + intervalos.length + ' par(es) de anclas seguidas (se piden ' + CORTE_MIN_PARES_ + ')';
  } else if (mejor < CORTE_MIN_FRACCION_ * intervalos.length) {
    res.motivo = 'los pares no coinciden: ' + mejor + ' de ' + intervalos.length;
  } else if (!(hi > lo)) {
    res.motivo = 'el rango medido quedo vacio';
  } else {
    res.ok = true;
  }
  return res;
}

/**
 * PF077: numero de DIA DE JUEGO de un instante: dias enteros desde 1970 contados en hora de Lima con el cambio de dia
 * a las 04:00. Dos instantes con el mismo numero estan en el mismo dia de juego; la resta de dos numeros es la cantidad
 * de cortes de las 04:00 que los separan. Usa las constantes de 10_Verificar_PeriodIndex_JSON.gs (Lima = UTC-5, corte 04:00).
 * @param {Date} fecha
 * @return {number}
 */
function _diaJuegoNum_(fecha, corteH) {
  var c = (corteH == null) ? VERIF_CAMBIO_DESDE_H_ : corteH; // PF080: hora de corte opcional (por defecto 04:00)
  return Math.floor((fecha.getTime() - (VERIF_LIMA_OFFSET_H_ + c) * 3600 * 1000) / 86400000);
}

/**
 * PF077: fecha de calendario (UTC, solo para leer anio/mes/dia/dia de semana) del DIA DE JUEGO de un instante.
 * @param {Date} fecha
 * @return {Date}
 */
function _diaJuegoFecha_(fecha, corteH) {
  var c = (corteH == null) ? VERIF_CAMBIO_DESDE_H_ : corteH; // PF080
  return new Date(fecha.getTime() - (VERIF_LIMA_OFFSET_H_ + c) * 3600 * 1000);
}

/** @return {boolean} true si el dia de juego de "fecha" es el primer lunes de su mes, o sea el dia 0 de una temporada. */
function _esInicioDeTemporada_(fecha, corteH) {
  var d = _diaJuegoFecha_(fecha, corteH);
  return d.getUTCDay() === 1 && d.getUTCDate() === _primerLunesDia_(d.getUTCFullYear(), d.getUTCMonth());
}

/**
 * PF077: corre el (sectionIndex, periodIndex) de una ancla al dia de juego de otro archivo (un clans.json, que no trae
 * periodIndex propio). Cuenta los cortes de las 04:00 (Lima) entre ambas fechas: 0 = mismo dia, se copia; +1 / -1 = se suma
 * o resta un dia. Como el prestamo es de 6 horas como maximo (PAREO_TOLERANCIA_MS_), no puede haber mas de un corte.
 *  - Si el archivo o la ancla cayeron entre las 04:00 y las 05:00 no se sabe en que dia estaba el servidor: se devuelve
 *    {revision} y el archivo queda sin etiquetar para que lo revise la usuaria.
 *  - La semana (sectionIndex) sube o baja cuando el nuevo periodIndex cruza un multiplo de 7.
 *  - Si el dia nuevo es el primer dia de una temporada (primer lunes del mes), el periodIndex es 0 y la semana 0; si es
 *    el ultimo de la anterior, el largo de esa temporada sale del calendario (del primer lunes anterior a este).
 * Funcion pura (no toca Drive): se puede probar fuera de Apps Script.
 * @param {{real:Date, sectionIndex:number, periodIndex:number}} ancla
 * @param {Date} fecha Fecha de creacion del archivo que toma prestado.
 * @return {{sectionIndex:number, periodIndex:number, cortes:number, temporada:?number}|{revision:string}}
 */
function _ajustarPeriodoPrestado_(ancla, fecha, corte) {
  // PF080: "corte" ({desdeH, hastaH}, horas de Lima) es la hora real del cambio de dia estimada con las anclas del clan
  // (_estimarCorteDiario_). Si es null se usa la ventana fija 04:00-05:00 de siempre. Fuera de la ventana el dia de juego
  // es el mismo con cualquier hora de corte entre desdeH y hastaH (los extremos quedan a cada lado del punto medio).
  var cH = corte ? (corte.desdeH + corte.hastaH) / 2 : VERIF_CAMBIO_DESDE_H_;
  var ventana = corte ? ('entre las ' + _fmtHoraH_(corte.desdeH) + ' y las ' + _fmtHoraH_(corte.hastaH)) : 'entre las 04:00 y las 05:00';
  if (_enVentanaCorte_(fecha, corte)) {
    return { revision: 'creado ' + ventana + ' (Lima): no se sabe en que dia de juego estaba el servidor' };
  }
  if (_enVentanaCorte_(ancla.real, corte)) {
    return { revision: 'la captura de la que tomaria el periodIndex se guardo ' + ventana + ' (Lima): no se sabe en que dia de juego estaba' };
  }

  var cortes = _diaJuegoNum_(fecha, cH) - _diaJuegoNum_(ancla.real, cH);
  var s = ancla.sectionIndex;
  var p = ancla.periodIndex;

  if (cortes === 0) {
    return { sectionIndex: s, periodIndex: p, cortes: 0, temporada: null };
  }
  if (Math.abs(cortes) > 1) {
    return { revision: 'hay ' + Math.abs(cortes) + ' cortes de las 04:00 entre el archivo y la captura de la que tomaria el periodIndex' };
  }

  var nuevoP, nuevoS;
  if (cortes === 1) {
    if (_esInicioDeTemporada_(fecha, cH)) {
      nuevoP = 0; nuevoS = 0; // primer dia de la temporada nueva
    } else {
      nuevoP = p + 1;
      nuevoS = s + Math.floor(nuevoP / 7) - Math.floor(p / 7);
    }
  } else { // cortes === -1
    if (_esInicioDeTemporada_(ancla.real, cH)) {
      // El archivo es del ultimo dia de la temporada anterior: su largo sale del calendario.
      var d = _diaJuegoFecha_(ancla.real, cH);
      var anio = d.getUTCFullYear(), mes0 = d.getUTCMonth();
      var anioAnt = mes0 === 0 ? anio - 1 : anio, mesAnt0 = mes0 === 0 ? 11 : mes0 - 1;
      var largo = Math.round((Date.UTC(anio, mes0, _primerLunesDia_(anio, mes0)) -
        Date.UTC(anioAnt, mesAnt0, _primerLunesDia_(anioAnt, mesAnt0))) / 86400000);
      nuevoP = largo - 1;
      nuevoS = Math.floor(nuevoP / 7);
    } else if (p === 0) {
      return { revision: 'la captura de la que tomaria el periodIndex dice periodIndex 0 pero su dia de juego no es un primer lunes: no cuadra con el calendario' };
    } else {
      nuevoP = p - 1;
      nuevoS = s + Math.floor(nuevoP / 7) - Math.floor(p / 7);
    }
  }

  // Temporada del DIA DE JUEGO del archivo (no la de la fecha de calendario).
  var temporada = _temporadaDeFecha_(new Date(fecha.getTime() - cH * 3600 * 1000));
  return { sectionIndex: nuevoS, periodIndex: nuevoP, cortes: cortes, temporada: temporada };
}

/**
 * Calcula el número de temporada de Clash Royale al que pertenece una
 * fecha, usando la regla de calendario real: la temporada reinicia el
 * PRIMER LUNES de cada mes (hora America/Lima) y el número de temporada
 * sube en 1 cada vez que reinicia.
 *
 * Ancla usada: la Temporada 1 (numeración interna propia, no la de
 * Supercell) comenzó el lunes 4 de mayo de 2026 — primer lunes de mayo
 * 2026 —. A partir de esa ancla se cuentan meses hacia adelante o hacia
 * atrás para cualquier otra fecha (mayo=1, junio=2, julio=3, …), así que
 * esto funciona igual para archivos históricos ya existentes que para
 * archivos nuevos: no hace falta borrar nada ni reiniciar ningún contador.
 *
 * Precisión: al día (no a la hora exacta del reinicio). Una captura
 * tomada en las pocas horas alrededor del instante exacto del reinicio
 * podría, en un caso límite, calcularse con la temporada equivocada; en
 * la práctica esto no afecta capturas tomadas durante el resto del día.
 *
 * Si alguna vez cambia el día de reinicio (deja de ser el primer lunes) o
 * se quiere correr la numeración interna por cualquier motivo, hay que
 * actualizar la constante MIG_TEMPORADA_ANCLA_ con un nuevo par
 * fecha/temporada conocido; el resto del cálculo no cambia.
 *
 * @param {Date} fechaReal
 * @return {number}
 */
function _temporadaDeFecha_(fechaReal) {
  var partes = Utilities.formatDate(fechaReal, 'America/Lima', 'yyyy-MM-dd').split('-');
  var anio = parseInt(partes[0], 10);
  var mes0 = parseInt(partes[1], 10) - 1; // 0 = enero
  var dia  = parseInt(partes[2], 10);

  var diaPrimerLunes = _primerLunesDia_(anio, mes0);
  if (dia < diaPrimerLunes) {
    // Todavía no llegó el reinicio de este mes calendario: la captura
    // pertenece a la ventana de temporada del mes anterior.
    mes0 -= 1;
    if (mes0 < 0) { mes0 = 11; anio -= 1; }
  }

  var mesesDesdeAncla = (anio - MIG_TEMPORADA_ANCLA_.anio) * 12 + (mes0 - MIG_TEMPORADA_ANCLA_.mes0);
  return MIG_TEMPORADA_ANCLA_.temporada + mesesDesdeAncla;
}

/** @const Ancla: Temporada 1 (numeración interna) = primer lunes de mayo de 2026. */
var MIG_TEMPORADA_ANCLA_ = { temporada: 1, anio: 2026, mes0: 4 };

/**
 * Día del mes (1-31) en que cae el primer lunes de un mes dado. Cálculo de
 * calendario puro (no depende de zona horaria real: el día de la semana
 * del día 1 de un mes es el mismo en cualquier zona horaria mientras no
 * se cruce medianoche UTC de forma ambigua, por eso se puede usar
 * Date.UTC de forma segura solo para esta cuenta de día-de-semana).
 * @param {number} anio
 * @param {number} mes0 0 = enero … 11 = diciembre
 * @return {number}
 */
function _primerLunesDia_(anio, mes0) {
  var diaSemanaDel1 = new Date(Date.UTC(anio, mes0, 1)).getUTCDay(); // 0=domingo … 6=sábado
  var offset = (8 - diaSemanaDel1) % 7;
  return 1 + offset;
}

/**
 * Quita un tag "T-<n> S-<n> P.I-<n> " o "T-<n> S-<n> P.I-<n>-<letra> "
 * existente al inicio de un segmento de nombre, si lo trae (para poder
 * re-analizar/re-etiquetar archivos que ya pasaron por migrarFormatoJSON()
 * en una ejecución anterior sin apilar tags ni romper el agrupamiento por
 * captura). La letra opcional es la del día de guerra (L M X J V S D, ver
 * _letraDiaGuerra_ en 05_Migrador_Formato.gs). [→ Contexto_Base_Web.md §PF074]
 * @param {string} segmento
 * @return {string}
 */
function _quitarTagExistente_(segmento) {
  return segmento.replace(/^T-\d+\s+S-\d+\s+P\.I-\d+(?:-[LMXJVSD])?\s+/, '');
}

/**
 * Lee sectionIndex y periodIndex de un currentriverrace.json tomando la
 * PRIMERA mención de cada campo en el orden en que aparece escrito en el
 * archivo (no un campo fijo de nivel superior por nombre de propiedad,
 * porque "periodIndex" vuelve a aparecer más adentro del documento, p. ej.
 * dentro de cada entrada de "periodLogs", y esas menciones posteriores
 * deben ignorarse).
 * @param {File} archivo
 * @return {?{sectionIndex:number, periodIndex:number}} null si no se pudo leer.
 */
function _leerPeriodo_(archivo) {
  try {
    var texto = archivo.getBlob().getDataAsString();
    JSON.parse(texto); // valida que sea JSON antes de confiar en el texto crudo

    var periodIndex = _primeraMencionNumerica_(texto, 'periodIndex');
    var sectionIndex = _primeraMencionNumerica_(texto, 'sectionIndex');

    if (periodIndex === null || sectionIndex === null) return null;
    return { sectionIndex: sectionIndex, periodIndex: periodIndex };
  } catch (e) {
    return null;
  }
}

/**
 * Busca la primera aparición de "<clave>": <numero> en un texto JSON crudo,
 * en el orden en que está escrito el archivo, ignorando las que aparezcan
 * después.
 * @param {string} texto
 * @param {string} clave
 * @return {?number} null si no se encontró ninguna mención.
 */
function _primeraMencionNumerica_(texto, clave) {
  var patron = new RegExp('"' + clave + '"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)');
  var m = patron.exec(texto);
  if (!m) return null;
  return Number(m[1]);
}