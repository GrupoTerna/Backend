// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Roster estático: publicar ahora
//  Parte 2 — Funciones que no se corren a mano
//    - Roster estático: armar y publicar
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

/**
 * 51_Publicar_Roster.gs  (NUEVO 08-oct-2026)
 *
 * Gemelo de 50_Publicar_Guerra.gs para directorio.html: publica la respuesta de webRoster
 * (_webRosterCalcular(): miembros ACTIVOS por clan, sin celular ni contacto) como roster.json en la
 * misma rama `data` del repo de GitHub. directorio.html lo lee desde raw.githubusercontent.com y cae a
 * Apps Script (webRoster) si el archivo no existe, falla o tiene más de 3 h.
 *
 * QUÉ SE PUBLICA: exactamente lo que ya devuelve webRoster a cualquier visitante (no tiene campos
 * de admin) más `_publicadoEn` (ISO). Queda abierto en un repo público, sin token.
 *
 * CONFIGURACIÓN: las mismas propiedades del script que guerra (GITHUB_TOKEN, GITHUB_REPO,
 * GITHUB_RAMA_DATOS opcional). Sin token o repo no hace nada.
 *
 * CUÁNDO: la llama _calentarCacheGuerraEnVivo_() (37_Web_API.gs) justo después de publicar guerra,
 * o sea al ritmo del bot. Nunca lanza error. Si el roster no cambió, se omite salvo que hayan
 * pasado ROSTER_ESTATICO_REPUBLICAR_MIN minutos (para que `_publicadoEn` no envejezca).
 *
 * La publicación pasa por _ghPublicarArchivo_() (50_Publicar_Guerra.gs): conserva guerra.json en la
 * rama y usa un lock para no pisarse con la publicación de guerra.
 */
var ROSTER_ESTATICO_ARCHIVO = 'roster.json';

var ROSTER_ESTATICO_REPUBLICAR_MIN = 50;

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Roster estático: publicar ahora -----

/**
 * publicarRosterEstatico()
 * Atajo manual (ejecutar desde el editor): publica ya roster.json. Úsalo la primera vez; el resultado
 * queda en verDiagnosticoGuerraVivo() y en el log. Después ejecuta publicarGuerraEstatico() y comprueba
 * que en la rama `data` aparezcan los DOS archivos.
 */
function publicarRosterEstatico() {
  PropertiesService.getScriptProperties().deleteProperty('ROSTER_ESTATICO_HASH'); // fuerza publicar aunque no haya cambios
  var ok = _publicarRosterEstatico_();
  Logger.log('[RosterEstatico] ' + (ok ? 'OK' : 'NO se publicó, mira verDiagnosticoGuerraVivo()'));
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Roster estático: armar y publicar -----

function _publicarRosterEstatico_() {
  var t0 = Date.now();
  try {
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('GITHUB_TOKEN');
    var repo = props.getProperty('GITHUB_REPO');
    if (!token || !repo) {
      _diagGuerraVivo_('[RosterEstatico] sin GITHUB_TOKEN/GITHUB_REPO en las propiedades del script: no se publica');
      return false;
    }
    var rama = props.getProperty('GITHUB_RAMA_DATOS') || 'data';

    var roster = _webRosterCalcular();
    if (!roster || !roster.clanes || !roster.clanes.length) {
      // Directorio vacío o ilegible: no se pisa un archivo bueno con uno vacío.
      _diagGuerraVivo_('[RosterEstatico] roster vacío; no se publica para no pisar el archivo anterior');
      return false;
    }
    var jsonBase = JSON.stringify(roster);
    var hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, jsonBase, Utilities.Charset.UTF_8));
    var hashPrevio = props.getProperty('ROSTER_ESTATICO_HASH');
    var msPrevio = Number(props.getProperty('ROSTER_ESTATICO_MS')) || 0;
    if (hash === hashPrevio && (Date.now() - msPrevio) < ROSTER_ESTATICO_REPUBLICAR_MIN * 60000) {
      _diagGuerraVivo_('[RosterEstatico] sin cambios desde la última publicación; se omite');
      return true;
    }

    var copia = {};
    Object.keys(roster).forEach(function (k) { copia[k] = roster[k]; });
    copia._publicadoEn = new Date().toISOString();
    var b64 = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(copia), 'application/json').getBytes());

    var res = _ghPublicarArchivo_(token, repo, rama, ROSTER_ESTATICO_ARCHIVO, b64, 'roster ' + copia._publicadoEn);
    if (!res.ok) {
      _diagGuerraVivo_('[RosterEstatico] falló el paso ' + res.paso + ': HTTP ' + res.r.code + ' ' + String(res.r.text || '').substr(0, 300));
      return false;
    }

    props.setProperty('ROSTER_ESTATICO_HASH', hash);
    props.setProperty('ROSTER_ESTATICO_MS', String(Date.now()));
    _diagGuerraVivo_('[RosterEstatico] publicado en ' + repo + '@' + rama + '/' + ROSTER_ESTATICO_ARCHIVO + ' (' + Math.round(b64.length * 0.75 / 1024) + ' KB) en ' + (Date.now() - t0) + 'ms');
    return true;
  } catch (e) {
    _diagGuerraVivo_('[RosterEstatico] error al publicar (el bot sigue igual): ' + e);
    return false;
  }
}
