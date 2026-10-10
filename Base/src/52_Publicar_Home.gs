/**
 * 52_Publicar_Home.gs  (NUEVO 08-oct-2026)
 *
 * Gemelo de 50_Publicar_Guerra.gs / 51_Publicar_Roster.gs para index.html: publica en un solo archivo
 * (home.json, rama `data` del repo de GitHub) las respuestas públicas que la portada pedía por
 * separado a Apps Script:
 *   clanInfo           <- _webClanInfo()            (webClanInfo)
 *   aniversarios       <- _webAniversarios()        (webAniversarios)
 *   rankings           <- _webRankings()            (webRankings)
 *   estadisticasCartas <- _webEstadisticasCartas()  (webEstadisticasCartas)

 *   ascensos           <- _webAscensosRecientes()   (webAscensosRecientes, para comunidad.html; NUEVO 08-oct-2026)
 * más `_publicadoEn` (ISO). Todas son lecturas públicas con WEB_MEMBER_TOKEN, sin sesión de admin ni
 * campos de admin, así que el archivo contiene lo mismo que ya ve cualquier visitante.
 *
 * El top semanal de la portada sale de guerra.json (50_Publicar_Guerra.gs); no se duplica aquí.
 *
 * Cada sección se calcula en su propio try/catch: si una falla, home.json se publica sin esa clave y
 * la página que la use (index.html, comunidad.html) le pide solo esa a Apps Script. Si fallan todas, no se publica (no se pisa el archivo
 * anterior). Misma configuración (GITHUB_TOKEN, GITHUB_REPO, GITHUB_RAMA_DATOS) y mismo helper
 * _ghPublicarArchivo_() que guerra y roster: conserva los demás archivos de la rama.
 *
 * CUÁNDO: la llama _calentarCacheGuerraEnVivo_() (37_Web_API.gs) tras guerra y roster. Nunca lanza error.
 * Si nada cambió se omite, salvo que pasen HOME_ESTATICO_REPUBLICAR_MIN minutos (index.html descarta el
 * archivo si tiene más de 3 h).
 */
var HOME_ESTATICO_ARCHIVO = 'home.json';
var HOME_ESTATICO_REPUBLICAR_MIN = 50;

function _publicarHomeEstatico_() {
  var t0 = Date.now();
  try {
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('GITHUB_TOKEN');
    var repo = props.getProperty('GITHUB_REPO');
    if (!token || !repo) {
      _diagGuerraVivo_('[HomeEstatico] sin GITHUB_TOKEN/GITHUB_REPO en las propiedades del script: no se publica');
      return false;
    }
    var rama = props.getProperty('GITHUB_RAMA_DATOS') || 'data';

    var home = {};
    var fallas = [];
    [
      ['clanInfo', _webClanInfo],
      ['aniversarios', _webAniversarios],
      ['rankings', _webRankings],
      ['estadisticasCartas', _webEstadisticasCartas],
      ['ascensos', _webAscensosRecientes]
    ].forEach(function (par) {
      try { home[par[0]] = par[1](); } catch (e) { fallas.push(par[0]); _diagGuerraVivo_('[HomeEstatico] falló ' + par[0] + ': ' + e); }
    });
    if (!Object.keys(home).length) {
      _diagGuerraVivo_('[HomeEstatico] no se pudo calcular ninguna sección; no se publica');
      return false;
    }

    var jsonBase = JSON.stringify(home);
    var hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, jsonBase, Utilities.Charset.UTF_8));
    var hashPrevio = props.getProperty('HOME_ESTATICO_HASH');
    var msPrevio = Number(props.getProperty('HOME_ESTATICO_MS')) || 0;
    if (hash === hashPrevio && (Date.now() - msPrevio) < HOME_ESTATICO_REPUBLICAR_MIN * 60000) {
      _diagGuerraVivo_('[HomeEstatico] sin cambios desde la última publicación; se omite');
      return true;
    }

    home._publicadoEn = new Date().toISOString();
    var b64 = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(home), 'application/json').getBytes());

    var res = _ghPublicarArchivo_(token, repo, rama, HOME_ESTATICO_ARCHIVO, b64, 'home ' + home._publicadoEn);
    if (!res.ok) {
      _diagGuerraVivo_('[HomeEstatico] falló el paso ' + res.paso + ': HTTP ' + res.r.code + ' ' + String(res.r.text || '').substr(0, 300));
      return false;
    }

    props.setProperty('HOME_ESTATICO_HASH', hash);
    props.setProperty('HOME_ESTATICO_MS', String(Date.now()));
    _diagGuerraVivo_('[HomeEstatico] publicado en ' + repo + '@' + rama + '/' + HOME_ESTATICO_ARCHIVO + ' (' + Math.round(b64.length * 0.75 / 1024) + ' KB' + (fallas.length ? ', SIN: ' + fallas.join(', ') : '') + ') en ' + (Date.now() - t0) + 'ms');
    return true;
  } catch (e) {
    _diagGuerraVivo_('[HomeEstatico] error al publicar (el bot sigue igual): ' + e);
    return false;
  }
}

/**
 * publicarHomeEstatico()
 * Atajo manual (ejecutar desde el editor): publica ya home.json. El resultado queda en
 * verDiagnosticoGuerraVivo() y en el log.
 */
function publicarHomeEstatico() {
  PropertiesService.getScriptProperties().deleteProperty('HOME_ESTATICO_HASH'); // fuerza publicar aunque no haya cambios
  var ok = _publicarHomeEstatico_();
  Logger.log('[HomeEstatico] ' + (ok ? 'OK' : 'NO se publicó, mira verDiagnosticoGuerraVivo()'));
}