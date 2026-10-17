/**
 * 53_Publicar_Torneos.gs  (NUEVO 08-oct-2026)
 *
 * Gemelo de 50_Publicar_Guerra.gs / 51_Publicar_Roster.gs / 52_Publicar_Home.gs para torneos.html: publica en un
 * solo archivo (torneos.json, rama `data` del repo de GitHub) las dos respuestas que la página pedía por separado a
 * Apps Script:
 *   torneos   <- _webTorneos({ esAdmin: false })           (webTorneos: listado + ganadores del más reciente)
 *   historial <- _webHistorialTorneos({ esAdmin: false })  (webHistorialTorneos: top 3 y participantes de cada torneo)
 * más `_publicadoEn` (ISO).
 *
 * VERSIÓN DE VISITANTE: se calcula con esAdmin:false, igual que un visitante sin sesión, así que el Tag de los
 * participantes ocultos (ex-miembros, aviso A9) sale null y el archivo no contiene nada que un visitante no vea ya.
 * torneos.html, si hay un admin con sesión, NO usa este archivo: sigue pidiendo a Apps Script con su sessionToken.
 *
 * Cada sección se calcula en su propio try/catch: si una falla, torneos.json se publica sin esa clave y la página le
 * pide solo esa a Apps Script. Si fallan las dos, no se publica (no se pisa el archivo anterior). Misma configuración
 * (GITHUB_TOKEN, GITHUB_REPO, GITHUB_RAMA_DATOS) y mismo helper _ghPublicarArchivo_() que los demás: conserva los
 * archivos de la rama.
 *
 * NO SE PUBLICA linkApp: cada torneo del listado trae el enlace de inscripción con su contraseña (joinTournament?id=..&pass=..),
 * y torneos.html no lo usa (las inscripciones se comparten solo en los grupos de WhatsApp). Se quita de cada torneo antes de
 * publicar, para que ese enlace no quede en un repo público e indexable.
 *
 * CUÁNDO: la llama _calentarCacheGuerraEnVivo_() (37_Web_API.gs) tras guerra, roster y home. Nunca lanza error.
 * CAMBIO 08-oct-2026 (primera corrida manual: calcular las dos respuestas tardó ~4 min, demasiado para sumarlo a cada ciclo
 * del bot, que tiene el límite de 6 min de Apps Script): desde el bot, las respuestas se CALCULAN como máximo cada
 * TORNEOS_ESTATICO_CALCULAR_CADA_MIN minutos (los torneos cambian poco); en medio, el ciclo lo omite al instante.
 * publicarTorneosEstatico() (manual) siempre calcula. Con 90 min y ciclos de ~1 h, el archivo se renueva cada ~2 h, por debajo
 * de las 3 h que torneos.html tolera. Si nada cambió se omite, salvo que pasen TORNEOS_ESTATICO_REPUBLICAR_MIN minutos.
 * Un torneo nuevo o un resultado cambiado se ve en la web en el siguiente cálculo (hasta ~2 h) más ~5 min de caché de
 * GitHub; para verlo antes, ejecutar publicarTorneosEstatico() a mano.
 * CAMBIO 17-oct-2026 (PF091, decisión B; el runGuerra() de las 12:43 murió a los 360 s mientras calculaba torneos): desde el bot, si a la
 * ejecución le quedan menos de TORNEOS_ESTATICO_MIN_RESTANTE_MS (250 s) antes de CFG.PLATAFORMA_LIMITE_EJECUCION_MS, no calcula ni marca
 * TORNEOS_ESTATICO_CALC_MS (reintenta en el siguiente ciclo). Consecuencia esperada: en una corrida horaria larga casi nunca alcanzará, y
 * torneos.json se renovará sobre todo con publicarTorneosEstatico() a mano. [→ Contexto_Base_Web.md §PF091]
 */
var TORNEOS_ESTATICO_ARCHIVO = 'torneos.json';
var TORNEOS_ESTATICO_REPUBLICAR_MIN = 50;
var TORNEOS_ESTATICO_CALCULAR_CADA_MIN = 90;
// 17-oct-2026 (PF091, decisión B): desde el bot no se calcula si a la ejecución le quedan menos de esto antes del límite de la plataforma
// (CFG.PLATAFORMA_LIMITE_EJECUCION_MS). Estimación (calcular las dos secciones tardó ~4 min en la primera corrida manual); no medida con exactitud.
var TORNEOS_ESTATICO_MIN_RESTANTE_MS = 250 * 1000;
// Marca de inicio de la ejecución: el código global se evalúa al arrancar cada ejecución de Apps Script.
var TORNEOS_ESTATICO_EJEC_INICIO_MS_ = Date.now();

function _publicarTorneosEstatico_(forzar) {
  var t0 = Date.now();
  try {
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('GITHUB_TOKEN');
    var repo = props.getProperty('GITHUB_REPO');
    if (!token || !repo) {
      _diagGuerraVivo_('[TorneosEstatico] sin GITHUB_TOKEN/GITHUB_REPO en las propiedades del script: no se publica');
      return false;
    }
    var rama = props.getProperty('GITHUB_RAMA_DATOS') || 'data';

    // Límite de frecuencia del CÁLCULO (lo caro). Se marca al empezar, no al terminar: así, si una corrida muriera por tiempo,
    // el siguiente ciclo del bot no la repite de inmediato.
    var msCalcPrevio = Number(props.getProperty('TORNEOS_ESTATICO_CALC_MS')) || 0;
    if (!forzar && (Date.now() - msCalcPrevio) < TORNEOS_ESTATICO_CALCULAR_CADA_MIN * 60000) {
      _diagGuerraVivo_('[TorneosEstatico] se calculó hace menos de ' + TORNEOS_ESTATICO_CALCULAR_CADA_MIN + ' min; se omite en este ciclo');
      return true;
    }
    // Decisión B (17-oct-2026): sin tiempo suficiente no se calcula NI se marca TORNEOS_ESTATICO_CALC_MS, para que el siguiente ciclo reintente.
    // La corrida manual (forzar) no se limita: es la forma de renovar torneos.json cuando el bot no alcanza.
    if (!forzar) {
      var restanteMs = CFG.PLATAFORMA_LIMITE_EJECUCION_MS - (Date.now() - TORNEOS_ESTATICO_EJEC_INICIO_MS_);
      if (restanteMs < TORNEOS_ESTATICO_MIN_RESTANTE_MS) {
        _diagGuerraVivo_('[TorneosEstatico] OMITIDO: quedan ' + Math.round(restanteMs / 1000) + ' s de la ejecución y se piden ' + Math.round(TORNEOS_ESTATICO_MIN_RESTANTE_MS / 1000) + ' s; se reintenta en el siguiente ciclo');
        return false;
      }
    }
    props.setProperty('TORNEOS_ESTATICO_CALC_MS', String(Date.now()));

    var datos = {};
    var fallas = [];
    [
      ['torneos', function () { return _webTorneos({ esAdmin: false }); }],
      ['historial', function () { return _webHistorialTorneos({ esAdmin: false }); }]
    ].forEach(function (par) {
      var tSec = Date.now();
      try {
        var r = par[1]();
        if (!r) throw new Error('respuesta vacía');
        if (r.error) throw new Error(r.error);
        datos[par[0]] = r;
        _diagGuerraVivo_('[TorneosEstatico] ' + par[0] + ' calculado en ' + (Date.now() - tSec) + 'ms');
      } catch (e) { fallas.push(par[0]); _diagGuerraVivo_('[TorneosEstatico] falló ' + par[0] + ' tras ' + (Date.now() - tSec) + 'ms: ' + e); }
    });
    // Sin enlaces de inscripción (con contraseña) en el archivo público: ver docblock.
    if (datos.torneos && Array.isArray(datos.torneos.torneos)) {
      datos.torneos.torneos = datos.torneos.torneos.map(function (t) {
        var copia = {};
        Object.keys(t || {}).forEach(function (k) { if (k !== 'linkApp') copia[k] = t[k]; });
        return copia;
      });
    }
    if (!Object.keys(datos).length) {
      _diagGuerraVivo_('[TorneosEstatico] no se pudo calcular ninguna sección; no se publica');
      return false;
    }

    var jsonBase = JSON.stringify(datos);
    var hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, jsonBase, Utilities.Charset.UTF_8));
    var hashPrevio = props.getProperty('TORNEOS_ESTATICO_HASH');
    var msPrevio = Number(props.getProperty('TORNEOS_ESTATICO_MS')) || 0;
    if (hash === hashPrevio && (Date.now() - msPrevio) < TORNEOS_ESTATICO_REPUBLICAR_MIN * 60000) {
      _diagGuerraVivo_('[TorneosEstatico] sin cambios desde la última publicación; se omite');
      return true;
    }

    datos._publicadoEn = new Date().toISOString();
    var b64 = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(datos), 'application/json').getBytes());

    var res = _ghPublicarArchivo_(token, repo, rama, TORNEOS_ESTATICO_ARCHIVO, b64, 'torneos ' + datos._publicadoEn);
    if (!res.ok) {
      _diagGuerraVivo_('[TorneosEstatico] falló el paso ' + res.paso + ': HTTP ' + res.r.code + ' ' + String(res.r.text || '').substr(0, 300));
      return false;
    }

    props.setProperty('TORNEOS_ESTATICO_HASH', hash);
    props.setProperty('TORNEOS_ESTATICO_MS', String(Date.now()));
    _diagGuerraVivo_('[TorneosEstatico] publicado en ' + repo + '@' + rama + '/' + TORNEOS_ESTATICO_ARCHIVO + ' (' + Math.round(b64.length * 0.75 / 1024) + ' KB' + (fallas.length ? ', SIN: ' + fallas.join(', ') : '') + ') en ' + (Date.now() - t0) + 'ms');
    return true;
  } catch (e) {
    _diagGuerraVivo_('[TorneosEstatico] error al publicar (el bot sigue igual): ' + e);
    return false;
  }
}

/**
 * publicarTorneosEstatico()
 * Atajo manual (ejecutar desde el editor): publica ya torneos.json. El resultado queda en
 * verDiagnosticoGuerraVivo() y en el log. Útil justo después de registrar o corregir un torneo.
 */
function publicarTorneosEstatico() {
  PropertiesService.getScriptProperties().deleteProperty('TORNEOS_ESTATICO_HASH'); // fuerza publicar aunque no haya cambios
  var ok = _publicarTorneosEstatico_(true); // true: calcula aunque se haya calculado hace poco
  Logger.log('[TorneosEstatico] ' + (ok ? 'OK' : 'NO se publicó, mira verDiagnosticoGuerraVivo()'));
}