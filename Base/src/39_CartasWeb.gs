// ==============================================================================
// 39_CartasWeb.gs
// lectura CSV-primero de TODOS los
// datos de cartas de perfil.html, con el JSON de Drive solo como respaldo.
// ==============================================================================

// NUEVO 24-sep-2026: lectura CSV-primero de todos los datos de cartas (Cards, Cards_2, Cards_3); JSON solo de respaldo. CORRECCIÓN 24-sep-2026: la carta favorita ahora también sale de Cards_2. [→ Contexto_Base_Web.md §39B001]
// ==============================================================================

var _CW_CATALOGO_MEMO = null; // memo por ejecución (una consulta web = una ejecución)

// Backup_Cards.csv como { id: {name, nombre, maxLevel, ...} } (columnas por índice); {} si no se puede leer. [→ Contexto_Base_Web.md §39B002]
function _webCatalogoCartasPorId() {
  if (_CW_CATALOGO_MEMO) return _CW_CATALOGO_MEMO;
  var mapa = {};
  var num = function (v) {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    var n = Number(String(v).trim());
    return isNaN(n) ? null : n;
  };
  try {
    var rows = _leerCardsCSV().rows;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var id = String(r[1] || '').trim();
      if (!id) continue;
      mapa[id] = {
        name:     String(r[2] || '').trim(),
        nombre:   String(r[3] || '').trim(),
        maxLevel: num(r[4]),
        maxEvo:   num(r[5]),
        rarity:   String(r[6] || '').trim(),
        tipo:     String(r[7] || '').trim(),
        elixir:   num(r[8]),
        icon:     String(r[9] || '').trim(),
        heroIcon: String(r[10] || '').trim(),
        evoIcon:  String(r[11] || '').trim()
      };
    }
  } catch (e) {
    Logger.log('[WebAPI] _webCatalogoCartasPorId: no se pudo leer Backup_Cards.csv (' + e.message + '); se usa el JSON.');
    return {};
  }
  _CW_CATALOGO_MEMO = mapa;
  return mapa;
}

// Copia de la carta con los datos fijos del catálogo pisando al JSON cuando el CSV trae el dato. [→ Contexto_Base_Web.md §39B003]
function _webCartaDesdeCatalogo(obj, catalogo) {
  if (!obj || typeof obj !== 'object' || obj.id == null || !catalogo) return obj;
  var c = catalogo[String(obj.id)];
  if (!c) return obj;
  var out = {};
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  if (c.name)            out.name = c.name;
  if (c.maxLevel !== null) out.maxLevel = c.maxLevel;
  if (c.maxEvo   !== null) out.maxEvolutionLevel = c.maxEvo;
  if (c.rarity)          out.rarity = c.rarity.toLowerCase(); // el JSON manda "common"; el CSV "Common"
  if (c.elixir   !== null) out.elixirCost = c.elixir;
  if (c.tipo)            out.tipo = c.tipo;
  if (c.icon || c.heroIcon || c.evoIcon) {
    var urls = {};
    var base = obj.iconUrls;
    if (base && typeof base === 'object') {
      for (var u in base) if (Object.prototype.hasOwnProperty.call(base, u)) urls[u] = base[u];
    }
    if (c.icon)     urls.medium = c.icon;
    if (c.heroIcon) urls.heroMedium = c.heroIcon;
    if (c.evoIcon)  urls.evolutionMedium = c.evoIcon;
    out.iconUrls = urls;
  }
  return out;
}

// Arma cards/supportCards/currentDeck/currentDeckSupportCards con Cards_2 como fuente de membresía; null si el tag no tiene cartas. [→ Contexto_Base_Web.md §39B004]
function _webCartasCsvPrimero(tag, datos) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return null;

  var poseidas = [];          // ids (en orden del CSV) con Level >= 1
  var enMazo = [], enMazoTorre = [];
  var visto = {};
  var rows = _leerCards2CSV().rows;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (cleanTag(r[1]) !== tagLimpio) continue;
    var id = String(r[2] || '').trim();
    if (!id || visto[id]) continue;
    visto[id] = true;
    var lvl = Number(String(r[3] === undefined ? '' : r[3]).trim());
    var deck = String(r[5] || '').trim() === 'Sí';
    var torre = _esCartaTorre(id);
    if (lvl >= 1) poseidas.push(id);
    if (deck) (torre ? enMazoTorre : enMazo).push(id);
  }
  if (poseidas.length === 0 && enMazo.length === 0 && enMazoTorre.length === 0) return null;

  var lista = function (n) { return (datos && Array.isArray(datos[n])) ? datos[n] : []; };
  var porId = {};
  var indexar = function (arr) {
    for (var a = 0; a < arr.length; a++) {
      if (arr[a] && arr[a].id != null && !porId[String(arr[a].id)]) porId[String(arr[a].id)] = arr[a];
    }
  };
  indexar(lista('cards')); indexar(lista('supportCards'));
  indexar(lista('currentDeck')); indexar(lista('currentDeckSupportCards'));

  var objeto = function (id) { return porId[id] || { id: Number(id) }; };

  // Unión: primero el orden del JSON, luego lo que solo trae el CSV.
  var union = function (json, idsCsv) {
    var out = [], usados = {};
    for (var a = 0; a < json.length; a++) {
      var id = json[a] && json[a].id != null ? String(json[a].id) : '';
      if (!id || usados[id]) continue;
      usados[id] = true; out.push(json[a]);
    }
    for (var b = 0; b < idsCsv.length; b++) {
      if (usados[idsCsv[b]]) continue;
      usados[idsCsv[b]] = true; out.push(objeto(idsCsv[b]));
    }
    return out;
  };
  // El CSV manda la MEMBRESÍA; el JSON solo aporta el orden.
  var soloCsv = function (json, idsCsv) {
    if (idsCsv.length === 0) return json;
    var out = [], usados = {}, enCsv = {};
    for (var c = 0; c < idsCsv.length; c++) enCsv[idsCsv[c]] = true;
    for (var a = 0; a < json.length; a++) {
      var id = json[a] && json[a].id != null ? String(json[a].id) : '';
      if (!id || !enCsv[id] || usados[id]) continue;
      usados[id] = true; out.push(json[a]);
    }
    for (var b = 0; b < idsCsv.length; b++) {
      if (usados[idsCsv[b]]) continue;
      usados[idsCsv[b]] = true; out.push(objeto(idsCsv[b]));
    }
    return out;
  };

  var poseidasNormales = [], poseidasTorre = [];
  for (var p = 0; p < poseidas.length; p++) (_esCartaTorre(poseidas[p]) ? poseidasTorre : poseidasNormales).push(poseidas[p]);

  return {
    cards:                   union(lista('cards'), poseidasNormales),
    supportCards:            union(lista('supportCards'), poseidasTorre),
    currentDeck:             soloCsv(lista('currentDeck'), enMazo),
    currentDeckSupportCards: soloCsv(lista('currentDeckSupportCards'), enMazoTorre)
  };
}

// NUEVO 24-sep-2026: carta favorita desde la marca Favorita='Sí' de Backup_Cards_2.csv; null si no hay marca (cae a currentFavouriteCard del JSON). [→ Contexto_Base_Web.md §39B005]
function _webCartaFavoritaCsvPrimero(tag, datos) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return null;

  var idFav = null;
  try {
    var rows = _leerCards2CSV().rows; // headers: N°,Tag,ID,Level,EvolutionLevel,Currentdeck,Count,StarLevel,Favorita
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (cleanTag(r[1]) !== tagLimpio) continue;
      if (String(r[8] || '').trim() === 'Sí') { idFav = String(r[2] || '').trim(); break; }
    }
  } catch (e) {
    Logger.log('[WebAPI] _webCartaFavoritaCsvPrimero: no se pudo leer Backup_Cards_2.csv (' + e.message + '); se usa el JSON.');
    return null;
  }
  if (!idFav) return null;

  var lista = function (n) { return (datos && Array.isArray(datos[n])) ? datos[n] : []; };
  var porId = {};
  var indexar = function (arr) {
    for (var a = 0; a < arr.length; a++) {
      if (arr[a] && arr[a].id != null && !porId[String(arr[a].id)]) porId[String(arr[a].id)] = arr[a];
    }
  };
  indexar(lista('cards')); indexar(lista('supportCards'));
  indexar(lista('currentDeck')); indexar(lista('currentDeckSupportCards'));

  return porId[idFav] || { id: Number(idFav) };
}