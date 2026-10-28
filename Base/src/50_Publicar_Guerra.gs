/**
 * 50_Publicar_Guerra.gs  (NUEVO 08-oct-2026)
 *
 * Publica la respuesta PÚBLICA de webGuerraEnVivo como archivo estático (guerra.json) en una rama
 * propia (`data`) del repo de GitHub, para que guerra.html lo lea desde raw.githubusercontent.com en
 * vez de pedir ~920 KB a Apps Script (15-35 s y 404 del redirect 'echo'; ver testTamanioGuerraEnVivo()
 * en 38_Web_Endpoints.gs). Apps Script queda como respaldo en guerra.html.
 *
 * QUÉ SE PUBLICA: _getDatosDashboard() con el MISMO recorte que ve un visitante
 * (_webGuerraQuitarCamposAdmin_(): sin nomMulti ni prestamo en los pendientes) más el campo
 * `_publicadoEn` (ISO). Es el mismo contenido que ya sirve webGuerraEnVivo sin sesión; ahora además
 * queda abierto en un repo público, sin token, y los buscadores pueden indexarlo.
 *
 * CÓMO SE PUBLICA: API de datos de Git (blob -> tree -> commit SIN padre -> ref con force). Cada
 * publicación REEMPLAZA la rama por un único commit, así el repo no acumula una copia de ~900 KB por
 * cada corrida del bot (con la API de contenidos serían miles de commits al año).
 * CAMBIO 08-oct-2026: la rama `data` ahora la comparten varios archivos (guerra.json, roster.json, ver
 * 51_Publicar_Roster.gs). El árbol nuevo se construye con base_tree = árbol del commit actual, así
 * publicar un archivo NO borra los demás; todo pasa por _ghPublicarArchivos_() bajo un LockService. guerra.json, guerra_ctx.json (solo ctx, para perfil.html) y guerra_top.json (top semanal: solo la semana por defecto, para index.html) salen en el mismo commit.
 * No uses una rama que tenga otras cosas que no sean estos JSON: el commit sigue sin padre.
 *
 * CONFIGURACIÓN (Apps Script -> Configuración del proyecto -> Propiedades del script):
 *   GITHUB_TOKEN      token fine-grained, SOLO este repo, permiso "Contents: Read and write".
 *   GITHUB_REPO       'usuario/repo' (ej. 'GrupoTerna/Web'). El repo debe ser público.
 *   GITHUB_RAMA_DATOS (opcional) por defecto 'data'.
 * Sin GITHUB_TOKEN o GITHUB_REPO no hace nada (el bot sigue igual).
 *
 * CUÁNDO: la llama _calentarCacheGuerraEnVivo_() (37_Web_API.gs) tras guardar la caché. Nunca lanza
 * error. Si los datos no cambiaron respecto a la última publicación, se omite, salvo que hayan pasado
 * GUERRA_ESTATICO_REPUBLICAR_MIN minutos (para que `_publicadoEn` no envejezca: guerra.html descarta
 * el archivo si tiene más de 3 h).
 */

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Guerra estático: publicar ahora
//  Parte 2 — Funciones que no se corren a mano
//    - Guerra estático: armar y publicar
//    - Publicar archivos en la rama de datos (ayudas comunes con roster, home y torneos)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var GUERRA_ESTATICO_ARCHIVO = 'guerra.json';

var GUERRA_TOP_ESTATICO_ARCHIVO = 'guerra_top.json'; // NUEVO 08-oct-2026: solo lo que usa el top semanal de index.html, recortado (ver _guerraTopRecortado_)

var GUERRA_CTX_ESTATICO_ARCHIVO = 'guerra_ctx.json'; // NUEVO 08-oct-2026: solo {ctx, _publicadoEn} (~1 KB) para perfil.html, que de guerra solo necesita ctx

var GUERRA_ESTATICO_REPUBLICAR_MIN = 50;

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Guerra estático: publicar ahora -----

/**
 * publicarGuerraEstatico()
 * Atajo manual (ejecutar desde el editor): publica ya el archivo, sin esperar al bot. Úsalo la primera
 * vez para comprobar el token y el repo; el resultado queda en verDiagnosticoGuerraVivo() y en el log.
 */
function publicarGuerraEstatico() {
  var datos = _webGuerraEnVivoCompleta_();
  PropertiesService.getScriptProperties().deleteProperty('GUERRA_ESTATICO_HASH'); // fuerza publicar aunque no haya cambios
  var ok = _publicarGuerraEstatico_(datos);
  Logger.log('[GuerraEstatico] ' + (ok ? 'OK' : 'NO se publicó, mira verDiagnosticoGuerraVivo()'));
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Guerra estático: armar y publicar -----

function _publicarGuerraEstatico_(datos) {
  var t0 = Date.now();
  try {
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('GITHUB_TOKEN');
    var repo = props.getProperty('GITHUB_REPO');
    if (!token || !repo) {
      _diagGuerraVivo_('[GuerraEstatico] sin GITHUB_TOKEN/GITHUB_REPO en las propiedades del script: no se publica');
      return false;
    }
    var rama = props.getProperty('GITHUB_RAMA_DATOS') || 'data';

    var publica = _webGuerraQuitarCamposAdmin_(datos);
    var jsonBase = JSON.stringify(publica);
    // PF073: el hash se calcula SIN el bloque `tiempos` (generadoTs/generadoLima se arman con Date.now() en cada cálculo y api.* cambia en cada consulta del bot); con él, el hash nunca coincidía y la rama «sin cambios» no se alcanzaba. La republicación forzada cada GUERRA_ESTATICO_REPUBLICAR_MIN min mantiene la hora fresca. [→ Contexto_Base_Web.md §PF073]
    var publicaParaHash = {};
    Object.keys(publica).forEach(function (kH) { if (kH !== 'tiempos') publicaParaHash[kH] = publica[kH]; });
    var hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(publicaParaHash), Utilities.Charset.UTF_8));
    var hashPrevio = props.getProperty('GUERRA_ESTATICO_HASH');
    var msPrevio = Number(props.getProperty('GUERRA_ESTATICO_MS')) || 0;
    if (hash === hashPrevio && (Date.now() - msPrevio) < GUERRA_ESTATICO_REPUBLICAR_MIN * 60000) {
      _diagGuerraVivo_('[GuerraEstatico] sin cambios desde la última publicación; se omite');
      return true;
    }

    var copia = {};
    Object.keys(publica).forEach(function (k) { copia[k] = publica[k]; });
    copia._publicadoEn = new Date().toISOString();
    var b64 = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(copia), 'application/json').getBytes());

    var ctxCopia = { ctx: publica.ctx || {}, _publicadoEn: copia._publicadoEn };
    var b64Ctx = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(ctxCopia), 'application/json').getBytes());
    var topCopia = _guerraTopRecortado_(publica);
    topCopia._publicadoEn = copia._publicadoEn;
    var b64Top = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(topCopia), 'application/json').getBytes());
    var res = _ghPublicarArchivos_(token, repo, rama, [
      { path: GUERRA_ESTATICO_ARCHIVO, b64: b64 },
      { path: GUERRA_CTX_ESTATICO_ARCHIVO, b64: b64Ctx },
      { path: GUERRA_TOP_ESTATICO_ARCHIVO, b64: b64Top }
    ], 'guerra ' + copia._publicadoEn);
    if (!res.ok) return _guerraEstaticoFallo_(res.paso, res.r);

    props.setProperty('GUERRA_ESTATICO_HASH', hash);
    props.setProperty('GUERRA_ESTATICO_MS', String(Date.now()));
    _diagGuerraVivo_('[GuerraEstatico] publicado en ' + repo + '@' + rama + '/' + GUERRA_ESTATICO_ARCHIVO + ' (' + Math.round(b64.length * 0.75 / 1024) + ' KB; guerra_top.json ' + Math.round(b64Top.length * 0.75 / 1024) + ' KB) en ' + (Date.now() - t0) + 'ms');
    return true;
  } catch (e) {
    _diagGuerraVivo_('[GuerraEstatico] error al publicar (el bot sigue igual): ' + e);
    return false;
  }
}

/**
 * _guerraTopRecortado_(publica)
 * Arma el contenido de guerra_top.json para el top semanal de index.html (cargarTopSemana()):
 * valoresDiariosSelectores completo (etiquetas de semanas) y valoresDiariosPorSemana REDUCIDO a UNA semana: la semana por
 * defecto (selectores.porDefecto), que es la que index.html usa para ataques, puntaje y barcos.
 * CAMBIO 08-oct-2026: antes se incluía además la semana más reciente con algún barco > 0 (index.html retrocedía hasta ella para el
 * top de barcos y mostraba, p. ej., la S3 de la temporada pasada). Ya no: barcos sale de la misma semana que ataques y puntaje.
 * Si cambias cómo cargarTopSemana() elige la semana, cambia también esta función.
 */
function _guerraTopRecortado_(publica) {
  var sel = (publica && publica.valoresDiariosSelectores) || null;
  var porSemana = (publica && publica.valoresDiariosPorSemana) || {};
  var def = sel && sel.porDefecto;
  var reducido = {};
  if (def && porSemana[def.temporada] && porSemana[def.temporada][def.sectionIndex] !== undefined) {
    reducido[def.temporada] = {};
    reducido[def.temporada][def.sectionIndex] = porSemana[def.temporada][def.sectionIndex];
  }
  return { valoresDiariosSelectores: sel, valoresDiariosPorSemana: reducido };
}

function _guerraEstaticoFallo_(paso, r) {
  _diagGuerraVivo_('[GuerraEstatico] falló el paso ' + paso + ': HTTP ' + r.code + ' ' + String(r.text || '').substr(0, 300));
  return false;
}

// ----- Publicar archivos en la rama de datos (ayudas comunes con roster, home y torneos) -----

/**
 * _ghPublicarArchivo_(token, repo, rama, archivo, b64, mensaje)
 * Envoltorio de _ghPublicarArchivos_() para un solo archivo (lo usa 51_Publicar_Roster.gs).
 */
function _ghPublicarArchivo_(token, repo, rama, archivo, b64, mensaje) {
  return _ghPublicarArchivos_(token, repo, rama, [{ path: archivo, b64: b64 }], mensaje);
}

/**
 * _ghPublicarArchivos_(token, repo, rama, archivos, mensaje)
 * NUEVO 08-oct-2026. Publica uno o varios archivos ({path, b64}) en UN solo commit sin padre, conservando
 * los demás archivos de la rama (tree con base_tree = árbol del commit actual). Bajo
 * LockService.getScriptLock() para que dos publicaciones simultáneas (guerra y roster) no se pisen:
 * sin el lock, la que termine última reescribiría la rama con el árbol viejo y perdería el archivo de la otra.
 * @returns {{ok:boolean, paso?:string, r?:Object}}
 */
function _ghPublicarArchivos_(token, repo, rama, archivos, mensaje) {
  var lock = LockService.getScriptLock();
  var tieneLock = false;
  try { lock.waitLock(30000); tieneLock = true; } catch (eLock) { return { ok: false, paso: 'lock', r: { code: 0, text: String(eLock) } }; }
  try {
    var base = '/repos/' + repo + '/git';
    var baseTree = null;
    var existe = _ghFetch_(token, 'get', base + '/ref/heads/' + rama);
    if (existe.code === 200) {
      var c = _ghFetch_(token, 'get', base + '/commits/' + existe.body.object.sha);
      if (c.code !== 200) return { ok: false, paso: 'commit (leer)', r: c };
      baseTree = c.body.tree.sha;
    } else if (existe.code !== 404) {
      return { ok: false, paso: 'ref (leer)', r: existe };
    }

    var entradas = [];
    var r;
    for (var i = 0; i < archivos.length; i++) {
      r = _ghFetch_(token, 'post', base + '/blobs', { content: archivos[i].b64, encoding: 'base64' });
      if (r.code !== 201) return { ok: false, paso: 'blob ' + archivos[i].path, r: r };
      entradas.push({ path: archivos[i].path, mode: '100644', type: 'blob', sha: r.body.sha });
    }

    var cuerpoTree = { tree: entradas };
    if (baseTree) cuerpoTree.base_tree = baseTree;
    r = _ghFetch_(token, 'post', base + '/trees', cuerpoTree);
    if (r.code !== 201) return { ok: false, paso: 'tree', r: r };

    r = _ghFetch_(token, 'post', base + '/commits', { message: mensaje, tree: r.body.sha, parents: [] });
    if (r.code !== 201) return { ok: false, paso: 'commit', r: r };
    var shaCommit = r.body.sha;

    if (existe.code === 200) {
      r = _ghFetch_(token, 'patch', base + '/refs/heads/' + rama, { sha: shaCommit, force: true });
      if (r.code !== 200) return { ok: false, paso: 'ref (actualizar)', r: r };
    } else {
      r = _ghFetch_(token, 'post', base + '/refs', { ref: 'refs/heads/' + rama, sha: shaCommit });
      if (r.code !== 201) return { ok: false, paso: 'ref (crear)', r: r };
    }
    return { ok: true };
  } finally {
    if (tieneLock) { try { lock.releaseLock(); } catch (eRel) { /* nada que hacer */ } }
  }
}

function _ghFetch_(token, metodo, ruta, cuerpo) {
  var opt = {
    method: metodo,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'terna-apps-script'
    }
  };
  if (cuerpo) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(cuerpo); }
  var resp = UrlFetchApp.fetch('https://api.github.com' + ruta, opt);
  var texto = resp.getContentText();
  var obj = null;
  try { obj = JSON.parse(texto); } catch (e) { /* respuesta no JSON */ }
  return { code: resp.getResponseCode(), body: obj, text: texto };
}
