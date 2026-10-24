// ==============================================================================
// 58_Docs_Administracion.gs
// Actualiza solo, en los Google Docs de plantillas (Bienvenida y Descripción), el bloque «Líder / Colíderes / Veteranos / Otros administradores / Otros colíderes» con los datos reales de Directorio. [→ Contexto_Base_Web.md §PF186, §PF187 y §PF188]
// ==============================================================================

// ----- Variables y constantes -----

// Categorías (en minúsculas, sin tilde) de los Docs que llevan el bloque de administración. [→ Contexto_Base_Web.md §PF186]
var ADMIN_DOC_CATEGORIAS = ['bienvenida', 'descripcion'];

// Nombres de respaldo de los clanes oficiales (tag -> nombre tal como se escribe en los Docs de Plantillas), por si ni la API ni la hoja Clan dan el nombre. [→ Contexto_Base_Web.md §PF187]
var ADMIN_DOC_NOMBRES_RESPALDO = {
  '#GCRG8L00': 'Grupo乂Terna™',
  '#GYCU9YRG': 'GrupoXTerna™2',
  '#GQQPPJGR': 'GrupoXTerna™3',
  '#GG99LCJY': 'Mini乂Ternas™'
};

// PF189 (24-oct-2026, pedido de la usuaria): cuentas que se muestran para estas personas cuando no tienen ninguna cuenta presente en el clan del Doc (se ubica a la persona por su celular, a partir de la fila de Directorio de ese tag). Si Directorio no trae el tag, se usa el nombre indicado. [→ Contexto_Base_Web.md §PF189]
var ADMIN_DOC_CUENTAS_PREFERIDAS = {
  '#2GG8PJ8GC': 'chistris',
  '#V20GJRC9Y': 'caandre',
  '#QRQULCCV8': 'ᴳ乂ᵀ ⚜️ Maikel'
};

// Caché en memoria (solo vive durante esta ejecución) del equipo leído de Directorio, para no releer la hoja por cada Doc. [→ Contexto_Base_Web.md §PF186]
var _adminDocEquipoCache_ = null;

// ----- Punto de entrada (lo llama _leerEntradasEstaticasDrive en 43_Menu_Dinamico.gs) -----

// _adminDocActualizar_(doc, categoria, clanNombre): si el Doc es de Bienvenida o Descripción, reescribe su bloque de administración; solo toca el Doc si algo cambió. [→ Contexto_Base_Web.md §PF186]
function _adminDocActualizar_(doc, categoria, clanNombre) {
  var cat = _adminDocNorm_(categoria);
  if (ADMIN_DOC_CATEGORIAS.indexOf(cat) < 0) return false;

  var equipo = _adminDocLeerEquipo_();
  if (!equipo) return false;

  var body = doc.getBody();
  var tag = _adminDocTagDeClan_(equipo, clanNombre);
  var cambio = false;
  if (tag) {
    cambio = _adminDocAplicarClan_(body, equipo, tag, clanNombre);
  } else if (cat === 'descripcion') {
    cambio = _adminDocAplicarFamilia_(body, equipo, clanNombre);
  } else {
    // PF187: antes un Doc de Bienvenida de un clan que no se reconocía por su nombre se saltaba sin dejar rastro.
    Logger.log('[AdminDoc] No se reconoció el clan "' + clanNombre + '" para su Doc de ' + categoria + ': no se tocó.');
  }
  if (cambio) {
    Logger.log('[AdminDoc] Actualizado el bloque de administración de "' + categoria + ' - ' + clanNombre + '".');
  }
  return cambio;
}

// ----- Lectura de datos (Directorio) -----

// _adminDocNorm_(s): minúsculas, sin tildes, sin espacios ni símbolos, para comparar nombres. [→ Contexto_Base_Web.md §PF186]
function _adminDocNorm_(s) {
  return String(s || '').toLowerCase()
    .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i').replace(/[óò]/g, 'o').replace(/[úù]/g, 'u')
    .replace(/[\s™®©]/g, '');
}

// _adminDocLeerEquipo_(): lee Directorio una vez y arma, por clan oficial, los líderes y colíderes reales, y la lista de administradores reales (Admin = Sí). Devuelve null si no hay datos confiables. [→ Contexto_Base_Web.md §PF186]
function _adminDocLeerEquipo_() {
  if (_adminDocEquipoCache_) return _adminDocEquipoCache_;
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) {
    Logger.log('[AdminDoc] Directorio sin datos: no se toca ningún Doc.');
    return null;
  }
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  var copasPorTag = _adminDocCopasPorTag_(ss); // PF189: copas actuales de cada cuenta (hoja Players)
  var cuentaPorTag = {}; // PF189: tag -> cuenta (cualquier estado), para ubicar las cuentas preferidas

  var porClan = {};   // tag -> { nombre, lideres: [cuenta], colideres: [cuenta] }
  var personas = {};  // clave de persona (celular o tag) -> { cuentas: [cuenta], admin: bool }
  var nombresClan = {}; // nombre normalizado -> tag
  var nombresPorTag = {}; // tag -> [todos los nombres conocidos del clan]
  // PF187 (23-oct-2026): el nombre ya no sale solo del caché de la API (que en la sincronización venía vacío y dejaba sin reconocer a los clanes 2, 3 y Mini): se suman la hoja Clan y los nombres de respaldo. [→ Contexto_Base_Web.md §PF187]
  var nombresHojaClan = _adminDocNombresDeHojaClan_(ss);
  for (var t = 0; t < CFG.TERNA_TAGS.length; t++) {
    var tg = CFG.TERNA_TAGS[t];
    porClan[tg] = { nombre: _resolverNombreClan(tg), lideres: [], colideres: [], veteranos: [] };
    var conocidos = [porClan[tg].nombre, nombresHojaClan[tg], ADMIN_DOC_NOMBRES_RESPALDO[tg]];
    nombresPorTag[tg] = [];
    for (var nc = 0; nc < conocidos.length; nc++) {
      var nomC = String(conocidos[nc] || '').trim();
      if (!nomC || nomC === tg) continue; // _resolverNombreClan devuelve el propio tag cuando no encuentra el nombre
      nombresPorTag[tg].push(nomC);
      var claveC = _adminDocNorm_(nomC);
      if (!nombresClan[claveC]) nombresClan[claveC] = tg;
    }
    if (nombresPorTag[tg].length > 0) porClan[tg].nombre = nombresPorTag[tg][0];
  }

  for (var i = 0; i < data.length; i++) {
    var f = data[i];
    var tagClan = String(f[IC.CLAN_TAG - 1] || '').trim();
    var estado = String(f[IC.ESTADO - 1] || '').trim();
    var vet = String(f[IC.VETADO - 1] || '').trim().toLowerCase();
    var esVetado = (vet === 'sí' || vet === 'si') || tagClan === CFG.VETADO_TAG;
    var nombre = String(f[IC.NOMBRE - 1] || '').trim();
    if (!nombre || esVetado) continue;

    var rango = _adminDocNorm_(f[IC.RANGO - 1]);
    var esAdmin = String(f[IC.ADMIN - 1] || '').trim() === 'Sí';
    // Persona = mismo celular (prefijo + número); sin celular, la cuenta cuenta como una persona sola.
    var cel = soloDigitos(f[IC.PREFIJO - 1]) + soloDigitos(f[IC.CELULAR - 1]);
    var clavePersona = cel || ('tag:' + String(f[IC.TAG - 1] || '').trim());
    var cuenta = {
      persona: clavePersona,
      nombre: nombre,
      tag: String(f[IC.TAG - 1] || '').trim(),
      clanTag: tagClan,
      rango: rango,
      activo: estado === 'Activo',
      copas: copasPorTag[String(f[IC.TAG - 1] || '').trim()] || 0
    };
    if (cuenta.tag) cuentaPorTag[cuenta.tag] = cuenta;

    if (!personas[clavePersona]) personas[clavePersona] = { cuentas: [], admin: false };
    personas[clavePersona].cuentas.push(cuenta);
    if (esAdmin) personas[clavePersona].admin = true;

    if (cuenta.activo && porClan[tagClan]) {
      if (rango === 'lider') porClan[tagClan].lideres.push(cuenta);
      else if (rango === 'colider') porClan[tagClan].colideres.push(cuenta);
      else if (rango === 'veterano') porClan[tagClan].veteranos.push(cuenta); // PF188: se usa para la lista «Veteranos» (solo los administradores)
    }
  }

  var hayLider = false;
  for (var tt in porClan) if (porClan[tt].lideres.length > 0) hayLider = true;
  if (!hayLider) {
    Logger.log('[AdminDoc] Directorio no trae ningún líder activo en los clanes oficiales: se asume dato incompleto y no se toca ningún Doc.');
    return null;
  }

  // PF189: persona (por celular) -> cuenta que se muestra si no tiene ninguna cuenta presente en el clan.
  var preferidas = {};
  for (var tp in ADMIN_DOC_CUENTAS_PREFERIDAS) {
    var cp = cuentaPorTag[tp];
    if (cp) {
      preferidas[cp.persona] = cp;
    } else {
      Logger.log('[AdminDoc] La cuenta indicada ' + tp + ' (' + ADMIN_DOC_CUENTAS_PREFERIDAS[tp] + ') no está en Directorio: no se puede ubicar a su persona por celular.');
    }
  }

  _adminDocEquipoCache_ = { porClan: porClan, personas: personas, nombresClan: nombresClan, nombresPorTag: nombresPorTag, preferidas: preferidas };
  return _adminDocEquipoCache_;
}

// _adminDocCopasPorTag_(ss): tag -> copas actuales según la hoja Players ({} si no se puede leer; entonces todas cuentan 0 y desempata el nombre). [→ Contexto_Base_Web.md §PF189]
function _adminDocCopasPorTag_(ss) {
  var res = {};
  try {
    var sh = ss.getSheetByName(CFG.SHEETS.PLAYERS);
    if (!sh || sh.getLastRow() < 2) return res;
    var datos = sh.getRange(2, 1, sh.getLastRow() - 1, PC.COPAS).getValues();
    for (var i = 0; i < datos.length; i++) {
      var tg = String(datos[i][PC.TAG - 1] || '').trim();
      if (tg) res[tg] = Number(datos[i][PC.COPAS - 1]) || 0;
    }
  } catch (e) {
    Logger.log('[AdminDoc] No se pudieron leer las copas de la hoja Players: ' + e.message);
  }
  return res;
}

// _adminDocNombresDeHojaClan_(ss): tag -> nombre del clan según la hoja Clan ({} si la hoja no existe o está vacía). [→ Contexto_Base_Web.md §PF187]
function _adminDocNombresDeHojaClan_(ss) {
  var res = {};
  try {
    var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
    if (!sh || sh.getLastRow() < 2) return res;
    var datos = sh.getRange(2, 1, sh.getLastRow() - 1, CC.NOMBRE).getValues();
    for (var i = 0; i < datos.length; i++) {
      var tg = String(datos[i][CC.CLAN_TAG - 1] || '').trim();
      var nm = String(datos[i][CC.NOMBRE - 1] || '').trim();
      if (tg && nm && !res[tg]) res[tg] = nm;
    }
  } catch (e) {
    Logger.log('[AdminDoc] No se pudo leer los nombres de la hoja Clan: ' + e.message);
  }
  return res;
}

// _adminDocClaveAlfa_(s): solo letras, números y 乂, en minúsculas y sin tildes; sirve para comparar nombres de clan aunque cambien los símbolos o los espacios. [→ Contexto_Base_Web.md §PF187]
function _adminDocClaveAlfa_(s) {
  return _adminDocNorm_(s).replace(/[^a-z0-9乂]/g, '');
}

// _adminDocTagDeClan_(equipo, clanNombre): tag del clan oficial cuyo nombre coincide con el del Doc, o '' si es un Doc de toda la familia. Si el nombre no coincide exacto, se prueba por «mini» o por el número final (por ejemplo «…Terna™2»), y solo se acepta si hay un único clan que encaje. [→ Contexto_Base_Web.md §PF187]
function _adminDocTagDeClan_(equipo, clanNombre) {
  var exacto = equipo.nombresClan[_adminDocNorm_(clanNombre)];
  if (exacto) return exacto;

  var clave = _adminDocClaveAlfa_(clanNombre);
  if (clave.indexOf('terna') < 0) return ''; // no parece un clan Terna (por ejemplo «Familia Terna» sí lo parece, pero se descarta abajo)
  var esMini = clave.indexOf('mini') >= 0;
  var mDig = clave.match(/(\d)$/);
  if (!esMini && !mDig) return '';

  var candidatos = [];
  for (var tg in equipo.nombresPorTag) {
    var nombres = equipo.nombresPorTag[tg];
    for (var i = 0; i < nombres.length; i++) {
      var cn = _adminDocClaveAlfa_(nombres[i]);
      var encaja = esMini ? (cn.indexOf('mini') >= 0) : (cn.indexOf('mini') < 0 && new RegExp(mDig[1] + '$').test(cn));
      if (encaja) { candidatos.push(tg); break; }
    }
  }
  return candidatos.length === 1 ? candidatos[0] : '';
}

// _adminDocOrdenNombres_(cuentas): nombres únicos ordenados sin distinguir mayúsculas. [→ Contexto_Base_Web.md §PF186]
function _adminDocOrdenNombres_(cuentas) {
  var vistos = {}, lista = [];
  for (var i = 0; i < cuentas.length; i++) {
    var n = cuentas[i].nombre;
    if (!vistos[n]) { vistos[n] = true; lista.push(n); }
  }
  lista.sort(function(a, b) { return a.toLowerCase().localeCompare(b.toLowerCase(), 'es'); });
  return lista;
}

// _adminDocMejorPorCopas_(cuentas): primero el criterio de mayor rango (líder, colíder, veterano, miembro) y, entre las cuentas de ese rango, la que tenga más copas; si siguen empatadas, la de nombre menor. [→ Contexto_Base_Web.md §PF190]
function _adminDocMejorPorCopas_(cuentas) {
  var orden = { lider: 1, colider: 2, veterano: 3, miembro: 4 };
  var mejor = null;
  for (var i = 0; i < cuentas.length; i++) {
    var c = cuentas[i];
    if (!mejor) { mejor = c; continue; }
    var oc = orden[c.rango] || 5, om = orden[mejor.rango] || 5;
    if (oc < om) { mejor = c; continue; }
    if (oc > om) continue;
    var cc = c.copas || 0, cm = mejor.copas || 0;
    if (cc > cm || (cc === cm && c.nombre.toLowerCase() < mejor.nombre.toLowerCase())) mejor = c;
  }
  return mejor;
}

// _adminDocCuentaAMostrar_(equipo, personaKey, tagClan): la única cuenta que se muestra de una persona. 1.º entre las cuentas activas presentes en ese clan (con tagClan vacío, en cualquiera de los clanes oficiales), la de mayor rango y, entre las de ese rango, la de más copas; 2.º si no tiene ninguna, la cuenta indicada para esa persona (ADMIN_DOC_CUENTAS_PREFERIDAS); 3.º si tampoco, su cuenta principal (la de mayor rango). Devuelve null si no hay nada que mostrar. [→ Contexto_Base_Web.md §PF189]
function _adminDocCuentaAMostrar_(equipo, personaKey, tagClan) {
  var p = equipo.personas[personaKey];
  if (!p) return null;
  var presentes = [];
  for (var i = 0; i < p.cuentas.length; i++) {
    var c = p.cuentas[i];
    if (!c.activo) continue;
    if (tagClan ? c.clanTag === tagClan : !!equipo.porClan[c.clanTag]) presentes.push(c);
  }
  if (presentes.length > 0) return _adminDocMejorPorCopas_(presentes);
  if (equipo.preferidas && equipo.preferidas[personaKey]) return equipo.preferidas[personaKey];
  return _adminDocCuentaPrincipal_(p);
}

// _adminDocLineas_(cuentas, equipo, tagClan): una línea por persona (mismo celular), con una sola cuenta (ver _adminDocCuentaAMostrar_). Las líneas salen ordenadas sin distinguir mayúsculas. [→ Contexto_Base_Web.md §PF189]
function _adminDocLineas_(cuentas, equipo, tagClan) {
  var vistos = {}, lineas = [];
  for (var i = 0; i < cuentas.length; i++) {
    var c = cuentas[i];
    var k = c.persona || ('tag:' + c.tag);
    if (vistos[k]) continue;
    vistos[k] = true;
    var mostrar = _adminDocCuentaAMostrar_(equipo, k, tagClan) || c;
    lineas.push(mostrar.nombre);
  }
  lineas.sort(function(a, b) { return a.toLowerCase().localeCompare(b.toLowerCase(), 'es'); });
  return lineas;
}

// _adminDocPersonaTieneCuenta_(persona, tagClan, rangos): true si alguna cuenta activa de la persona tiene uno de esos rangos en ese clan. [→ Contexto_Base_Web.md §PF186]
function _adminDocPersonaTieneCuenta_(persona, tagClan, rangos) {
  for (var i = 0; i < persona.cuentas.length; i++) {
    var c = persona.cuentas[i];
    if (c.activo && c.clanTag === tagClan && rangos.indexOf(c.rango) >= 0) return true;
  }
  return false;
}

// _adminDocAdminsExtra_(equipo, tagClan): una cuenta de cada administrador real (Admin = Sí) que NO es líder, colíder ni veterano de ese clan. [→ Contexto_Base_Web.md §PF186]
function _adminDocAdminsExtra_(equipo, tagClan) {
  var extra = [];
  for (var k in equipo.personas) {
    var p = equipo.personas[k];
    if (!p.admin) continue;
    if (_adminDocPersonaTieneCuenta_(p, tagClan, ['lider', 'colider', 'veterano'])) continue; // PF188: los veteranos admin ya salen en «Veteranos»
    var mostrar = _adminDocCuentaAMostrar_(equipo, k, tagClan);
    if (mostrar) extra.push({ persona: k, nombre: mostrar.nombre, tag: mostrar.tag }); // PF189: la cuenta final se vuelve a elegir en _adminDocLineas_
  }
  return extra;
}

// _adminDocCuentaPrincipal_(persona): la cuenta activa de mayor rango (líder, colíder, veterano, miembro); desempata por nombre. [→ Contexto_Base_Web.md §PF186]
function _adminDocCuentaPrincipal_(persona) {
  var orden = { lider: 1, colider: 2, veterano: 3, miembro: 4 };
  var mejor = null;
  for (var i = 0; i < persona.cuentas.length; i++) {
    var c = persona.cuentas[i];
    if (!c.activo) continue;
    var o = orden[c.rango] || 5;
    var om = mejor ? (orden[mejor.rango] || 5) : 99;
    if (!mejor || o < om || (o === om && c.nombre.toLowerCase() < mejor.nombre.toLowerCase())) mejor = c;
  }
  return mejor;
}

// ----- Edición de Docs de un clan (bloque Líder: / Colíderes: / Administradores:) -----

// Quita viñetas y espacios del inicio de una línea de nombre para comparar. [→ Contexto_Base_Web.md §PF186]
function _adminDocQuitarVineta_(s) {
  return String(s || '').replace(/^[\s▫▪•️\-–]+/, '').replace(/\s+/g, ' ').trim();
}

// _adminDocEncabezado_(texto): 'lider', 'colideres', 'administradores' o '' según el texto de un párrafo. [→ Contexto_Base_Web.md §PF186]
function _adminDocEncabezado_(texto) {
  // Se ignoran los emojis o símbolos que haya antes de la primera letra (por ejemplo «🔹 Colíderes:»).
  var t = _adminDocNorm_(texto).replace(/^[^a-z]+/, '').replace(/:$/, '');
  if (t === 'lider') return 'lider';
  if (t === 'colideres') return 'colideres';
  // PF188: «Administradores:» (nombre anterior) y «Otros administradores:» son el mismo grupo; al reescribir se deja el título nuevo.
  if (t === 'administradores' || t === 'otrosadministradores') return 'otrosadministradores';
  if (t === 'veteranos') return 'veteranos';
  if (t === 'otroscolideres') return 'otroscolideres';
  return '';
}

// _adminDocAplicarClan_(body, equipo, tag, clanNombre): reescribe los grupos del Doc de un clan; devuelve true si cambió algo. [→ Contexto_Base_Web.md §PF186]
function _adminDocAplicarClan_(body, equipo, tag, clanNombre) {
  var clan = equipo.porClan[tag];
  var lideres = _adminDocLineas_(clan.lideres, equipo, tag);
  if (lideres.length === 0) {
    Logger.log('[AdminDoc] "' + clanNombre + '" no tiene líder activo en Directorio: no se toca su Doc.');
    return false;
  }
  // PF187 (23-oct-2026, pedido de la usuaria): en «Administración del clan» van solo el líder y los colíderes que son administradores (Admin = Sí en Directorio, por persona); los demás colíderes van en un bloque aparte, «Otros colíderes», para que no parezcan administradores. [→ Contexto_Base_Web.md §PF187]
  var colAdmin = [], colOtros = [];
  for (var i = 0; i < clan.colideres.length; i++) {
    var cu = clan.colideres[i];
    var per = equipo.personas[cu.persona];
    if (per && per.admin) colAdmin.push(cu); else colOtros.push(cu);
  }
  var colideres = _adminDocLineas_(colAdmin, equipo, tag);
  if (colideres.length === 0) colideres = ['Sin colíderes administradores por el momento'];
  // PF188 (24-oct-2026, pedido de la usuaria): los veteranos que son administradores van en su propia lista «Veteranos»; «Otros administradores» queda para los admins que no son líder, colíder ni veterano de este clan.
  var vetAdmin = [];
  for (var v = 0; v < clan.veteranos.length; v++) {
    var cv = clan.veteranos[v];
    var pv = equipo.personas[cv.persona];
    if (pv && pv.admin) vetAdmin.push(cv);
  }
  var veteranos = _adminDocLineas_(vetAdmin, equipo, tag);
  var admins = _adminDocLineas_(_adminDocAdminsExtra_(equipo, tag), equipo, tag);
  var otros = _adminDocLineas_(colOtros, equipo, tag);

  // Orden del bloque: Líder, Colíderes, Veteranos, Otros administradores, Otros colíderes. Cada grupo nuevo se coloca tras el último de los anteriores que exista en el Doc. [→ Contexto_Base_Web.md §PF188]
  var cambio = false;
  cambio = _adminDocGrupo_(body, 'lider', lideres, null, 'Líder:') || cambio;
  cambio = _adminDocGrupo_(body, 'colideres', colideres, null, 'Colíderes:') || cambio;
  cambio = _adminDocGrupo_(body, 'veteranos', veteranos, 'colideres', 'Veteranos:') || cambio;
  var anclaAdm = _adminDocBuscarGrupo_(body, 'veteranos') ? 'veteranos' : 'colideres';
  cambio = _adminDocGrupo_(body, 'otrosadministradores', admins, anclaAdm, 'Otros administradores:') || cambio;
  var anclaOtros = _adminDocBuscarGrupo_(body, 'otrosadministradores') ? 'otrosadministradores' : anclaAdm;
  cambio = _adminDocGrupo_(body, 'otroscolideres', otros, anclaOtros, 'Otros colíderes:') || cambio;
  return cambio;
}

// _adminDocBuscarGrupo_(body, clave): ubica en el cuerpo el párrafo encabezado del grupo y las líneas de nombre (con «▫») que le siguen. Devuelve {iEnc, nombres:[{i, par}]} o null. [→ Contexto_Base_Web.md §PF186]
function _adminDocBuscarGrupo_(body, clave) {
  var n = body.getNumChildren();
  for (var i = 0; i < n; i++) {
    var el = body.getChild(i);
    if (el.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    if (_adminDocEncabezado_(el.asParagraph().getText()) !== clave) continue;
    var nombres = [];
    for (var j = i + 1; j < n; j++) {
      var h = body.getChild(j);
      if (h.getType() !== DocumentApp.ElementType.PARAGRAPH) break;
      var tx = h.asParagraph().getText();
      if (/^\s*[▫▪]/.test(tx)) { nombres.push({ i: j, par: h.asParagraph() }); continue; }
      if (tx.trim() === '') continue; // renglón en blanco entre nombres
      break;
    }
    return { iEnc: i, nombres: nombres };
  }
  return null;
}

// _adminDocPrefijo_(texto): los espacios (sangría) que hay al inicio de un párrafo, o '' si no tiene. [→ Contexto_Base_Web.md §PF187]
function _adminDocPrefijo_(texto) {
  var m = String(texto || '').match(/^[ \t ]*/);
  return m ? m[0] : '';
}

// _adminDocPrefEncabezados_(body, textoPorDefecto): sangría del encabezado «Colíderes:» (o, si no está, el de «Líder:»), que es la que deben tener todos los encabezados del bloque; si no hay ninguno, la del texto dado. [→ Contexto_Base_Web.md §PF188]
function _adminDocPrefEncabezados_(body, textoPorDefecto) {
  var claves = ['colideres', 'lider'];
  for (var c = 0; c < claves.length; c++) {
    var g = _adminDocBuscarGrupo_(body, claves[c]);
    if (g) return _adminDocPrefijo_(body.getChild(g.iEnc).asParagraph().getText());
  }
  return _adminDocPrefijo_(textoPorDefecto);
}

// _adminDocSetTexto_(par, texto): cambia el texto de un párrafo conservando el formato (negrita, tamaño, color…) del primer carácter que no sea espacio; así la sangría no hace perder la negrita que la usuaria haya puesto a mano. [→ Contexto_Base_Web.md §PF189]
function _adminDocSetTexto_(par, texto) {
  var t = par.editAsText();
  var previo = t.getText();
  var viejo = previo.length;
  var idx = 0;
  while (idx < viejo - 1 && /\s/.test(previo.charAt(idx))) idx++;
  var atributos = viejo > 0 ? t.getAttributes(idx) : null;
  t.insertText(0, texto);
  if (viejo > 0) t.deleteText(texto.length, texto.length + viejo - 1);
  if (atributos && texto.length > 0) t.setAttributes(0, texto.length - 1, atributos);
}

// _adminDocGrupo_(body, clave, nombres, despuesDe, titulo): deja el grupo con exactamente esos nombres. Si no existe y hay nombres, lo crea después del grupo «despuesDe» con el encabezado «titulo»; si existe y no hay nombres, lo quita. Devuelve true si cambió algo. [→ Contexto_Base_Web.md §PF186]
function _adminDocGrupo_(body, clave, nombres, despuesDe, titulo) {
  var g = _adminDocBuscarGrupo_(body, clave);

  if (!g) {
    if (nombres.length === 0) return false;
    var ref = _adminDocBuscarGrupo_(body, despuesDe);
    if (!ref || ref.nombres.length === 0) return false; // sin dónde anclar: no se inventa estructura
    var ultimo = ref.nombres[ref.nombres.length - 1];
    var plantillaEnc = body.getChild(ref.iEnc).asParagraph().copy();
    var plantillaNom = ultimo.par.copy();
    var pos = ultimo.i + 1;
    // Renglón en blanco antes del encabezado, igual que entre los otros grupos si lo hay.
    var previo = ref.iEnc > 0 ? body.getChild(ref.iEnc - 1) : null;
    var hayBlanco = !!previo && previo.getType() === DocumentApp.ElementType.PARAGRAPH &&
      previo.asParagraph().getText().trim() === '';
    if (hayBlanco) { body.insertParagraph(pos++, '').setAttributes(plantillaEnc.getAttributes()); }
    // La sangría (espacios al inicio) se copia de las líneas modelo, para que el grupo nuevo quede alineado con los demás. [→ Contexto_Base_Web.md §PF187]
    var prefEnc = _adminDocPrefEncabezados_(body, plantillaEnc.getText()); // PF188: todos los encabezados toman la sangría del de «Colíderes:»
    var prefNom = _adminDocPrefijo_(plantillaNom.getText());
    var enc = body.insertParagraph(pos++, plantillaEnc);
    _adminDocSetTexto_(enc, prefEnc + (titulo || 'Administradores:'));
    for (var a = 0; a < nombres.length; a++) {
      var np = body.insertParagraph(pos++, plantillaNom.copy());
      _adminDocSetTexto_(np, prefNom + '▫️ ' + nombres[a]);
    }
    return true;
  }

  // PF188: en los grupos que maneja este archivo (no en «Líder:» ni «Colíderes:», que pueden traer un emoji propio) se deja el título exacto y la misma sangría que «Colíderes:»; así «Administradores:» pasa a «Otros administradores:» y queda alineado.
  var cambioTitulo = false;
  if (nombres.length > 0 && titulo && (clave === 'veteranos' || clave === 'otrosadministradores' || clave === 'otroscolideres')) {
    var parEnc = body.getChild(g.iEnc).asParagraph();
    var tituloDeseado = _adminDocPrefEncabezados_(body, parEnc.getText()) + titulo;
    if (parEnc.getText() !== tituloDeseado) { _adminDocSetTexto_(parEnc, tituloDeseado); cambioTitulo = true; }
  }

  var actuales = g.nombres.map(function(x) { return _adminDocQuitarVineta_(x.par.getText()); });
  var nuevos = nombres.map(function(x) { return x.replace(/\s+/g, ' ').trim(); });
  if (actuales.join('\u0001') === nuevos.join('\u0001')) return cambioTitulo;

  // Quitar el grupo si ya no hay nadie que mostrar (solo se da con «Veteranos», «Otros administradores» y «Otros colíderes»).
  if (nombres.length === 0) {
    for (var q = g.nombres.length - 1; q >= 0; q--) body.removeChild(body.getChild(g.nombres[q].i));
    body.removeChild(body.getChild(g.iEnc));
    return true;
  }

  if (g.nombres.length === 0) return cambioTitulo; // el grupo no trae ninguna línea modelo: no se inventa formato

  // ¿Hay renglones en blanco entre las líneas de nombre? Se repite el mismo patrón.
  var primero = g.nombres[0], ultimoN = g.nombres[g.nombres.length - 1];
  var conBlancos = (ultimoN.i - primero.i + 1) > g.nombres.length;
  var plantilla = primero.par.copy();
  var prefN = _adminDocPrefijo_(primero.par.getText()); // sangría de la línea modelo (PF187)
  var plantillaBlanco = null;
  if (conBlancos) {
    for (var b = primero.i + 1; b < ultimoN.i; b++) {
      var hb = body.getChild(b);
      if (hb.getType() === DocumentApp.ElementType.PARAGRAPH && hb.asParagraph().getText().trim() === '') { plantillaBlanco = hb.asParagraph().copy(); break; }
    }
  }

  // Se borran todas las líneas salvo la primera (de atrás hacia delante) y se reescribe.
  for (var r = ultimoN.i; r > primero.i; r--) body.removeChild(body.getChild(r));
  _adminDocSetTexto_(primero.par, prefN + '▫️ ' + nombres[0]);
  var pos2 = primero.i + 1;
  for (var k = 1; k < nombres.length; k++) {
    if (plantillaBlanco) body.insertParagraph(pos2++, plantillaBlanco.copy());
    var nl = body.insertParagraph(pos2++, plantilla.copy());
    _adminDocSetTexto_(nl, prefN + '▫️ ' + nombres[k]);
  }
  return true;
}

// ----- Edición del Doc de toda la familia (Descripción - Comunidad) -----

// _adminDocAplicarFamilia_(body, equipo, clanNombre): en el Doc de la comunidad actualiza «Líder:» de cada clan (se ubica por su #TAG) y la lista «Colíderes:» (colíderes de la familia que no son líderes de ningún clan). Devuelve true si cambió algo. [→ Contexto_Base_Web.md §PF186]
function _adminDocAplicarFamilia_(body, equipo, clanNombre) {
  var cambio = false;
  var n = body.getNumChildren();
  var tagActual = '';
  for (var i = 0; i < n; i++) {
    var el = body.getChild(i);
    if (el.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var par = el.asParagraph();
    var tx = par.getText();

    // Línea del clan: trae su #TAG (por ejemplo «Grupo乂Terna™ #GCRG8L00»).
    var mTag = tx.match(/#[0-9A-Z]{6,10}/);
    if (mTag && equipo.porClan[mTag[0]]) { tagActual = mTag[0]; continue; }

    // Línea «Líder: nombre» del clan que se acaba de ver.
    var mLid = tx.match(/^(\s*L[ií]der:\s*)/);
    if (mLid && tagActual) {
      var lideres = _adminDocLineas_(equipo.porClan[tagActual].lideres, equipo, tagActual);
      if (lideres.length > 0) {
        var nuevo = lideres.join(' / ');
        var actual = tx.substring(mLid[1].length).replace(/\s+/g, ' ').trim();
        if (actual !== nuevo) {
          var t = par.editAsText();
          var largo = tx.length;
          t.insertText(mLid[1].length, nuevo);
          if (largo > mLid[1].length) t.deleteText(mLid[1].length + nuevo.length, mLid[1].length + nuevo.length + (largo - mLid[1].length) - 1);
          cambio = true;
        }
      }
      tagActual = '';
    }
  }

  // Colíderes de toda la familia: personas con cuenta activa de colíder en algún clan oficial y sin ser líder de ninguno.
  var colideres = [];
  for (var k in equipo.personas) {
    var p = equipo.personas[k];
    var esColider = false, esLider = false;
    for (var tg in equipo.porClan) {
      if (_adminDocPersonaTieneCuenta_(p, tg, ['colider'])) esColider = true;
      if (_adminDocPersonaTieneCuenta_(p, tg, ['lider'])) esLider = true;
    }
    if (!esColider || esLider) continue;
    for (var c = 0; c < p.cuentas.length; c++) {
      var cu = p.cuentas[c];
      if (cu.activo && cu.rango === 'colider' && equipo.porClan[cu.clanTag]) colideres.push(cu);
    }
  }
  var nombres = _adminDocLineas_(colideres, equipo, '');
  if (nombres.length === 0) nombres = ['Sin colíderes por el momento'];
  cambio = _adminDocGrupo_(body, 'colideres', nombres, null) || cambio;

  if (cambio) Logger.log('[AdminDoc] Doc de la familia "' + clanNombre + '" actualizado.');
  return cambio;
}
