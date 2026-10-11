// 37_Web_API.gs: API del sitio web público de la comunidad (grupoterna.github.io/Web); distinto del dashboard interno (38_Web_Endpoints.gs) y del bot (44_BotWhatsApp.gs), aunque reutiliza funciones de ambos. [→ Contexto_Base_Web.md §37B001]

// Este archivo SOLO define funciones; el enrutamiento (doGet/doPost) vive en 38_Web_Endpoints.gs. Alcance Fases 0-8 (lista de acciones web*: lectura pública, login, admin, torneos, registro/vetado) y decisiones de diseño: Fase 2 = visor de contenido de solo lectura (no hay webGuardarContenido), Fase 3 = sin endpoint de ganadores, Fase 4 = registro y vetado, Fase 5 = login Celular+Clave, Panel de permisos (19-sep-2026, solo PANEL_PERMISOS_CELULAR; Función 'Corregir autor'). Lista completa en el .md. [→ Contexto_Base_Web.md §37B002]

// REGLA DE TRABAJO: alertas/avisos de cada tanda se escriben primero en AVISOS ABIERTOS y se eliminan o actualizan al confirmarse. Contenido: AVISOS A1-A10 del estado 'Inactivo' solo para admins (28-sep-2026, Fase 5b tandas A-D: _webPerfilJugador, cofres/battlelog desde Drive, nomMulti/prestamo y clan rival solo admin, tag oculto en torneos) y AVISOS del fallback a CSV (24-sep-2026: _webLeerDirectorioComoDC, _webBuscarFilaInactivosPorTag, rawClash sin JSON). PENDIENTES abiertos: pruebas en Apps Script real (A1, A10, AVISO 1), frontend perfil.html (A2, A8) y torneos.html (A9), y decisiones por definir (A5 comparador, AVISOS 3-5). Detalle en el .md. [→ Contexto_Base_Web.md §37B003]

// ----- Variables y constantes -----

// FASE 6 — SEGURIDAD (15-sep-2026, B-35): los tokens viven en Script Properties (8: WEB_MEMBER_TOKEN, CONTACTOS_TOKEN, DASHBOARD_TOKEN, CORRECCION_GUERRA_TOKEN, HISTORIAL_GUERRA_TOKEN, NUEVOS_ROYALEAPI_TOKEN, VERIFICAR_RIVERRACE_TOKEN, CLAVE_ADMIN_PEPPER); desde 19-sep-2026 sin literales de respaldo, _scriptToken() corta con error si falta una. [→ Contexto_Base_Web.md §37B004]




// Token público de solo-lectura de las acciones web* de doGet; más débil que DASHBOARD_TOKEN y visible en el JS del repo público. ACTUALIZADO 28-sep-2026: estado 'Inactivo', esRivalTemporada/clanRivalDetectado y nomMulti/prestamo solo salen con sessionToken de admin. No reutilizar el token del dashboard ni el de contactos. [→ Contexto_Base_Web.md §37B005]
var WEB_MEMBER_TOKEN = _scriptToken('WEB_MEMBER_TOKEN');

// Duración de la sesión de admin en segundos; CacheService tiene tope duro de 21600 s (6 h) por entrada. [→ Contexto_Base_Web.md §37B006]
var WEB_SESSION_DURACION_SEG = 21600; // 6 horas

// ----- Funciones manuales / punto de entrada -----

// _hashClaveAdmin(clave, tag): FASE 6 (15-sep-2026, B-31) SHA-256 de la Clave con pimienta global + Tag como sal (evita una columna Clave_Salt y hashes iguales entre admins); devuelve hex minúscula de 64 caracteres. [→ Contexto_Base_Web.md §37B007]
var CLAVE_ADMIN_PEPPER = _scriptToken('CLAVE_ADMIN_PEPPER');

function _hashClaveAdmin(clave, tag) {
  var sal = cleanTag(tag) || 'SIN_TAG';
  var texto = CLAVE_ADMIN_PEPPER + ':' + sal + ':' + String(clave || '');
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = (bytes[i] < 0) ? bytes[i] + 256 : bytes[i];
    hex += (b < 16 ? '0' : '') + b.toString(16);
  }
  return hex;
}

// _guardarClaveHashAdmin(celularNorm, hash): escribe el hash en AC.CLAVE_HASH de TODAS las filas con ese Celular (una multicuenta comparte Clave); si la hoja no está disponible no hace nada y la migración queda para el próximo login. [→ Contexto_Base_Web.md §37B008]
function _guardarClaveHashAdmin(celularNorm, hash) {
  var ss = _getSs();
  var shAdm = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);
  if (!shAdm || shAdm.getLastRow() < 2) return;

  var lastRow = shAdm.getLastRow();
  var celulares = shAdm.getRange(2, AC.CELULAR, lastRow - 1, 1).getValues();
  for (var i = 0; i < celulares.length; i++) {
    if (soloDigitos(celulares[i][0]) === celularNorm) {
      shAdm.getRange(2 + i, AC.CLAVE_HASH).setValue(hash);
    }
  }
}


// _webBuscarAdminPorCelular(celularNorm): primera fila de Administradores con ese Celular (solo dígitos, ya normalizado); FIX 02-sep-2026: si la hoja no está disponible o está vacía (ej. Demoler + runAll en curso) cae a _webBuscarAdminPorCelularEnCSV(); con la hoja disponible el CSV nunca se consulta; devuelve {tag, nombre, nomMulti, funciones, clanesAdmin, clave, claveHash} o null. [→ Contexto_Base_Web.md §37B009]
function _webBuscarAdminPorCelular(celularNorm) {
  var ss = _getSs();
  var shAdm = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);

  if (!shAdm || shAdm.getLastRow() < 2) {
    Logger.log('[Web-Auth] Hoja Administradores no disponible (¿Demoler en curso, esperando a que ' +
               'runAll() la recree/repueble?). Verificando login contra Backup_Administradores.csv.');
    return _webBuscarAdminPorCelularEnCSV(celularNorm);
  }

  var lastRow = shAdm.getLastRow();
  var data = shAdm.getRange(2, 1, lastRow - 1, ADMINISTRADORES_TOTAL_COLS).getValues();
  for (var i = 0; i < data.length; i++) {
    if (soloDigitos(data[i][AC.CELULAR - 1]) === celularNorm) {
      return {
        tag:         String(data[i][AC.TAG - 1] || ''),
        nombre:      String(data[i][AC.NOMBRE - 1] || ''),
        nomMulti:    String(data[i][AC.NOM_MULTI - 1] || ''),
        funciones:   String(data[i][AC.FUNCIONES - 1] || ''),
        clanesAdmin: String(data[i][AC.CLANES_ADMIN - 1] || ''),
        clave:       String(data[i][AC.CLAVE - 1] || ''),
        // NUEVO 15-sep-2026 (B-31): '' mientras la hoja no tenga la columna 24 (Clave_Hash) o el Celular no haya migrado; _webAuthLogin() cae entonces a `clave`. [→ Contexto_Base_Web.md §37B010]
        claveHash:   String(data[i][AC.CLAVE_HASH - 1] || '')
      };
    }
  }
  return null;
}

// _webBuscarAdminPorCelularEnCSV(celularNorm): fallback de _webBuscarAdminPorCelular() sobre Backup_Administradores.csv (índices AC.*, mismo criterio, incluye multicuenta); null si no hay admin o el CSV aún no existe. [→ Contexto_Base_Web.md §37B011]
function _webBuscarAdminPorCelularEnCSV(celularNorm) {
  var csvText = _loadCSVFromDrive('Backup_Administradores.csv');
  if (!csvText) return null;

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) return null;

  for (var i = 1; i < parsed.length; i++) { // fila 0 = encabezado
    var fila = parsed[i];
    if (soloDigitos(fila[AC.CELULAR - 1]) === celularNorm) {
      return {
        tag:         String(fila[AC.TAG - 1] || ''),
        nombre:      String(fila[AC.NOMBRE - 1] || ''),
        nomMulti:    String(fila[AC.NOM_MULTI - 1] || ''),
        funciones:   String(fila[AC.FUNCIONES - 1] || ''),
        clanesAdmin: String(fila[AC.CLANES_ADMIN - 1] || ''),
        clave:       String(fila[AC.CLAVE - 1] || ''),
        claveHash:   String(fila[AC.CLAVE_HASH - 1] || '')
      };
    }
  }
  return null;
}

// _webAuthLogin(celular, clave): FASE 5 (26-ago-2026) valida Celular+Clave contra Administradores y guarda en CacheService una sesión con la identidad del admin (token UUID); FASE 6 (15-sep-2026, B-31): compara contra Clave_Hash si existe (única comparación para ese Celular) y, si no, contra la Clave en texto plano con migración perezosa (escribe el hash con _guardarClaveHashAdmin(); la columna Clave no se toca ni se vacía); devuelve {ok, token, admin, error}. [→ Contexto_Base_Web.md §37B012]
function _webAuthLogin(celular, clave) {
  var celularNorm = soloDigitos(celular);
  var claveIngresada = String(clave || '');
  if (!celularNorm || !claveIngresada) {
    return { ok: false, error: 'Celular y clave son obligatorios.' };
  }

  var admin = _webBuscarAdminPorCelular(celularNorm);
  if (!admin) {
    return { ok: false, error: 'Celular o clave incorrectos.' };
  }

  var credencialesOk;
  if (admin.claveHash) {
    credencialesOk = (_hashClaveAdmin(claveIngresada, admin.tag) === admin.claveHash);
  } else {
    credencialesOk = !!admin.clave && admin.clave === claveIngresada;
    if (credencialesOk) {
      // Migración perezosa del hash: si falla (hoja no disponible) no se corta el login y se reintenta en el siguiente. [→ Contexto_Base_Web.md §37B013]
      try {
        _guardarClaveHashAdmin(celularNorm, _hashClaveAdmin(claveIngresada, admin.tag));
      } catch (eMigra) {
        Logger.log('[Web-Auth] No se pudo migrar Clave_Hash para el Celular ' + celularNorm + ': ' + eMigra);
      }
    }
  }
  if (!credencialesOk) {
    return { ok: false, error: 'Celular o clave incorrectos.' };
  }

  var token = Utilities.getUuid();
  var sesion = {
    celular:     celularNorm,
    tag:         admin.tag,
    nombre:      admin.nombre,
    nomMulti:    admin.nomMulti,
    funciones:   admin.funciones,
    clanesAdmin: admin.clanesAdmin
  };
  CacheService.getScriptCache().put('WEBSESSION_' + token, JSON.stringify(sesion), WEB_SESSION_DURACION_SEG);
  return {
    ok: true,
    token: token,
    admin: {
      nombre:      admin.nombre,
      nomMulti:    admin.nomMulti,
      funciones:   admin.funciones,
      clanesAdmin: admin.clanesAdmin
    }
  };
}

// _webAuthValidar(token): true si el token sigue vigente; no renueva la expiración (dura WEB_SESSION_DURACION_SEG desde el login); desde FASE 5 el valor guardado es un JSON con la identidad, el chequeo es 'hay algo guardado'. [→ Contexto_Base_Web.md §37B014]
function _webAuthValidar(token) {
  if (!token) return false;
  return !!CacheService.getScriptCache().get('WEBSESSION_' + String(token));
}

// _webAuthLogout(token): FIX B-27 (18-sep-2026) borra 'WEBSESSION_'+token de CacheService para invalidar de verdad la sesión (antes 'Cerrar sesión' solo borraba el localStorage); idempotente, siempre ok:true; solo para el botón explícito 'Cerrar sesión'. [→ Contexto_Base_Web.md §37B015]
function _webAuthLogout(token) {
  if (token) {
    try {
      CacheService.getScriptCache().remove('WEBSESSION_' + String(token));
    } catch (e) {
      Logger.log('[Web-Auth] Error al cerrar sesión (se ignora, el token igual vencerá solo): ' + e.message);
    }
  }
  return { ok: true };
}

// _webAuthObtenerAdmin(token): identidad guardada en la sesión (celular, tag, nombre, nomMulti, funciones, clanesAdmin) o null si venció. [→ Contexto_Base_Web.md §37B016]
function _webAuthObtenerAdmin(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('WEBSESSION_' + String(token));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// _webAdminTieneFuncion(funcionesStr, funcionBuscada): FIX B-34 (18-sep-2026); separa Funciones por comas y compara por igualdad exacta (antes un indexOf dejaba pasar 'Sin Vetar' o 'Vetar temporal'). [→ Contexto_Base_Web.md §37B017]
function _webAdminTieneFuncion(funcionesStr, funcionBuscada) {
  var lista = String(funcionesStr || '').split(',');
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].trim() === funcionBuscada) return true;
  }
  return false;
}

// PANEL DE PERMISOS — SOLO PARA DIANA (19-sep-2026): backend de permisos.html (webAdminMisPermisos GET, webPermisosListar GET, webPermisosGuardar POST). Acceso por Celular de la Script Property PANEL_PERMISOS_CELULAR (sin Property, nadie entra); trabaja por Celular y escribe en todas las filas de la multicuenta; sin casillas se guarda '(ninguna)' (una celda vacía se rellena sola); valida contra WEB_FUNCIONES_ADMIN y categorías del índice; Cat_disp SÍ filtra categorías en bot y web (vacía = sin restricción); Vetar/Registrar/Corregir autor releen la hoja; cada guardado deja línea [Permisos]. Detalle en el .md. [→ Contexto_Base_Web.md §37B018]

// Nombre exacto de la Función que permite corregir el Autor de un ascenso/descenso (usada por _webAdminEditarAutorAscenso(), 24_Historial_Ascensos.gs). [→ Contexto_Base_Web.md §37B019]
var WEB_FUNCION_CORREGIR_AUTOR = 'Corregir autor';

// NUEVO 05-oct-2026: Función que permite pedir desde la web la actualización manual del roster y de guerra (runPendientesYMensajesManual); la usan _webAdminActualizarRoster()/_webAdminEstadoActualizacion() (41_Web_ActualizarRoster.gs); ACTIVA para todos los admin (migrarFuncionActualizarRosterATodosLosAdmins(), 47_Migraciones.gs); se desactiva por admin en permisos.html. [→ Contexto_Base_Web.md §37B020]
var WEB_FUNCION_ACTUALIZAR_ROSTER = 'Actualizar roster';

// Catálogo de Funciones del panel: `id` = texto exacto de la celda Funciones (y de _webAdminTieneFuncion()); etiqueta/descripcion solo para mostrar. Para sumar una: agregarla aquí y validarla en el endpoint. 'Corregir autor' no está en los valores por defecto de actualizarDropdownCatDisp() a propósito: Diana la da desde el panel. [→ Contexto_Base_Web.md §37B021]
var WEB_FUNCIONES_ADMIN = [
  {
    id: 'Vetar',
    etiqueta: 'Vetar miembros',
    descripcion: 'Vetar a un jugador desde el panel, solo en los clanes que el admin administra.'
  },
  {
    id: 'Registrar miembro nuevo',
    etiqueta: 'Registrar miembro nuevo',
    descripcion: 'Verificar un Tag y registrar un miembro nuevo desde el panel.'
  },
  {
    id: WEB_FUNCION_CORREGIR_AUTOR,
    etiqueta: 'Corregir autor de ascensos y descensos',
    descripcion: 'Cambiar quién figura como responsable (Autor) de un ascenso o descenso. Cada cambio queda anotado en el Comentario del registro, con quién lo hizo.'
  },
  {
    id: WEB_FUNCION_ACTUALIZAR_ROSTER,
    etiqueta: 'Actualizar roster y datos de guerra',
    descripcion: 'Pedir desde el panel la actualización manual del roster, de Pendientes y de los Mensajes de guerra (consulta la API de Clash Royale). No está disponible entre las 3:40 y las 5:00 a.m. (hora Lima) y hay un tiempo de espera entre una y otra.'
  }
];

// Texto guardado cuando un admin queda sin casillas ('(ninguna)'); una celda vacía se volvería a llenar sola. [→ Contexto_Base_Web.md §37B022]
var WEB_PERMISOS_SIN_NADA = '(ninguna)';

// Nombre de la Script Property con el Celular (solo dígitos) que puede usar el panel de permisos. [→ Contexto_Base_Web.md §37B023]
var WEB_PERMISOS_PROP_CELULAR = 'PANEL_PERMISOS_CELULAR';

var WEB_PERMISOS_MSG_HOJA_NO_DISPONIBLE = 'La hoja Administradores no está disponible ahora (¿se está reconstruyendo?). Intenta de nuevo en unos minutos.';

// _webPermisosParsearLista(texto): separa una celda Funciones/Cat_disp por comas, sin espacios sobrantes, repetidos ni '(ninguna)'. [→ Contexto_Base_Web.md §37B024]
function _webPermisosParsearLista(texto) {
  var partes = String(texto || '').split(',');
  var lista = [];
  for (var i = 0; i < partes.length; i++) {
    var p = partes[i].trim();
    if (p && p !== WEB_PERMISOS_SIN_NADA && lista.indexOf(p) === -1) lista.push(p);
  }
  return lista;
}

/** _webPermisosIdsFunciones(): los `id` de WEB_FUNCIONES_ADMIN, en orden. */
function _webPermisosIdsFunciones() {
  var ids = [];
  for (var i = 0; i < WEB_FUNCIONES_ADMIN.length; i++) ids.push(WEB_FUNCIONES_ADMIN[i].id);
  return ids;
}

// _webPermisosCelularAutorizado(): Celular (dígitos) de PANEL_PERMISOS_CELULAR, o '' si no existe o no se pudo leer. [→ Contexto_Base_Web.md §37B025]
function _webPermisosCelularAutorizado() {
  try {
    return soloDigitos(PropertiesService.getScriptProperties().getProperty(WEB_PERMISOS_PROP_CELULAR));
  } catch (e) {
    return '';
  }
}

// _webPermisosExigirAcceso(token): puerta de webPermisos*; {ok:true, admin} si hay sesión válida, el Celular coincide con PANEL_PERMISOS_CELULAR y sigue existiendo en Administradores; si no, {ok:false, error} sin dar pistas. [→ Contexto_Base_Web.md §37B026]
function _webPermisosExigirAcceso(token) {
  var msgSesion = 'Sesión inválida o vencida. Vuelve a iniciar sesión.';
  if (!_webAuthValidar(token)) return { ok: false, error: msgSesion };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin) return { ok: false, error: msgSesion };

  var autorizado = _webPermisosCelularAutorizado();
  if (!autorizado || soloDigitos(admin.celular) !== autorizado) {
    return { ok: false, error: 'No tienes acceso a esta sección.' };
  }
  if (!_webBuscarAdminPorCelular(admin.celular)) {
    return { ok: false, error: 'No tienes acceso a esta sección.' };
  }
  return { ok: true, admin: admin };
}

// _webAdminMisPermisos(token): cualquier admin con sesión; devuelve las Funciones del catálogo que tiene HOY (releídas de la hoja) y `panelPermisos` (true solo para el Celular del panel); el backend igual valida cada acción. [→ Contexto_Base_Web.md §37B027]
function _webAdminMisPermisos(token) {
  var msgSesion = 'Sesión inválida o vencida. Vuelve a iniciar sesión.';
  if (!_webAuthValidar(token)) return { ok: false, error: msgSesion };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin) return { ok: false, error: msgSesion };
  var fresco = _webBuscarAdminPorCelular(admin.celular);
  if (!fresco) return { ok: false, error: msgSesion };

  var ids = _webPermisosIdsFunciones();
  var propias = _webPermisosParsearLista(fresco.funciones);
  var funciones = [];
  for (var i = 0; i < ids.length; i++) {
    if (propias.indexOf(ids[i]) !== -1) funciones.push(ids[i]);
  }
  var autorizado = _webPermisosCelularAutorizado();
  return {
    ok: true,
    funciones: funciones,
    panelPermisos: !!autorizado && soloDigitos(admin.celular) === autorizado
  };
}

// _webPermisosLeerHoja(): hoja Administradores + filas hasta Clanes_Admin (Clave y Clave_Hash no se leen); FIX 24-sep-2026: usa _obtenerFilasConFallbackCSV() y devuelve `origen` ('sheet'|'csv'); con CSV `sh` es null y quien escribe debe rechazar el guardado; null solo si ni hoja ni CSV tienen datos. [→ Contexto_Base_Web.md §37B028]
function _webPermisosLeerHoja() {
  var ss = _getSs();
  var lectura = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.ADMINISTRADORES, 'Backup_Administradores.csv', AC.CLANES_ADMIN);
  if (lectura.origen === 'vacio') return null;
  return {
    sh:     lectura.origen === 'sheet' ? ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES) : null,
    data:   lectura.filas,
    origen: lectura.origen
  };
}

// _webPermisosCategoriasCatalogo(filas): categorías del índice de contenido + las que algún admin ya tenga en Cat_disp (para no borrarlas en silencio); omite nombres con coma. [→ Contexto_Base_Web.md §37B029]
function _webPermisosCategoriasCatalogo(filas) {
  var lista = [];
  var vistas = {};
  var agregar = function (c) {
    c = String(c || '').trim();
    if (!c || c === WEB_PERMISOS_SIN_NADA || c.indexOf(',') !== -1 || vistas[c]) return;
    vistas[c] = true;
    lista.push(c);
  };

  try {
    var indice = _getIndiceContenido();
    for (var i = 0; i < indice.length; i++) agregar(indice[i].categoria);
  } catch (e) {
    Logger.log('[Permisos] No se pudo leer el índice de contenido para el catálogo de categorías: ' + e.message);
  }
  for (var f = 0; f < filas.length; f++) {
    var propias = _webPermisosParsearLista(filas[f][AC.CAT_DISP - 1]);
    for (var p = 0; p < propias.length; p++) agregar(propias[p]);
  }
  return lista;
}

// _webPermisosClanesCatalogo(): catálogo de clanes Terna (orden de la hoja Clan) para Clanes_Admin (cierre de conexión 20-sep-2026, permisos.html); mismo texto que _getClanesAdminTexto() y que compara _webAdminVetar(); omite nombres con coma. [→ Contexto_Base_Web.md §37B030]
function _webPermisosClanesCatalogo() {
  var lista = [];
  try {
    var nombres = _getNombresClanesTernaOrdenados();
    for (var i = 0; i < nombres.length; i++) {
      var n = String(nombres[i] || '').trim();
      if (n && n.indexOf(',') === -1 && lista.indexOf(n) === -1) lista.push(n);
    }
  } catch (e) {
    Logger.log('[Permisos] No se pudo leer el catálogo de clanes: ' + e.message);
  }
  return lista;
}

// _webPermisosListar(token): solo Diana; devuelve catálogo (funciones, categorias, clanes) y un registro por administrador agrupado por Celular { id, nombre, celularFin, esTu, funciones, categorias, clanesAdmin, cuentas }; el marcador '(ninguna)' nunca sale al frontend. [→ Contexto_Base_Web.md §37B031]
function _webPermisosListar(token) {
  var acc = _webPermisosExigirAcceso(token);
  if (!acc.ok) return acc;

  var hoja = _webPermisosLeerHoja();
  if (!hoja) return { ok: false, error: WEB_PERMISOS_MSG_HOJA_NO_DISPONIBLE };

  var data = hoja.data;
  var idsFunciones = _webPermisosIdsFunciones();
  var celularPropio = soloDigitos(acc.admin.celular);
  var grupos = [];
  var porClave = {};

  for (var i = 0; i < data.length; i++) {
    var fila = data[i];
    var tag = String(fila[AC.TAG - 1] || '').trim();
    if (!tag) continue;
    var cel = soloDigitos(fila[AC.CELULAR - 1]);
    var clave = cel || ('tag:' + tag);

    var g = porClave[clave];
    if (!g) {
      // Los permisos del grupo son los de su PRIMERA fila (la que lee el login). [→ Contexto_Base_Web.md §37B032]
      var funcionesFila = _webPermisosParsearLista(fila[AC.FUNCIONES - 1]);
      var funcionesOk = [];
      for (var k = 0; k < idsFunciones.length; k++) {
        if (funcionesFila.indexOf(idsFunciones[k]) !== -1) funcionesOk.push(idsFunciones[k]);
      }
      g = porClave[clave] = {
        id:          tag,
        nombre:      '',
        celularFin:  cel ? cel.slice(-3) : '',
        esTu:        !!cel && cel === celularPropio,
        funciones:   funcionesOk,
        categorias:  _webPermisosParsearLista(fila[AC.CAT_DISP - 1]),
        clanesAdmin: _webPermisosParsearLista(fila[AC.CLANES_ADMIN - 1]).join(', '),
        cuentas:     []
      };
      grupos.push(g);
    }
    // Nom_Multi a veces está cargado solo en una de las cuentas del grupo.
    var nomMulti = String(fila[AC.NOM_MULTI - 1] || '').trim();
    if (nomMulti && !g.nombre) g.nombre = nomMulti;
    g.cuentas.push({
      tag:    tag,
      nombre: String(fila[AC.NOMBRE - 1] || '').trim(),
      clan:   String(fila[AC.CLAN - 1] || '').trim()
    });
  }
  for (var n = 0; n < grupos.length; n++) {
    if (!grupos[n].nombre) grupos[n].nombre = grupos[n].cuentas[0].nombre || grupos[n].id;
  }

  var catalogoFunciones = [];
  for (var c = 0; c < WEB_FUNCIONES_ADMIN.length; c++) {
    catalogoFunciones.push({
      id:          WEB_FUNCIONES_ADMIN[c].id,
      etiqueta:    WEB_FUNCIONES_ADMIN[c].etiqueta,
      descripcion: WEB_FUNCIONES_ADMIN[c].descripcion
    });
  }

  return {
    ok: true,
    funciones: catalogoFunciones,
    categorias: _webPermisosCategoriasCatalogo(data),
    clanes: _webPermisosClanesCatalogo(),
    admins: grupos
  };
}

// _webPermisosDepurarSeleccion(seleccion, catalogo): deja solo lo del catálogo, sin repetidos y en su orden; lo demás va en `desconocidos` (el llamador rechaza el guardado). [→ Contexto_Base_Web.md §37B033]
function _webPermisosDepurarSeleccion(seleccion, catalogo) {
  var pedidos = {};
  var desconocidos = [];
  for (var i = 0; i < seleccion.length; i++) {
    var s = String(seleccion[i] === null || seleccion[i] === undefined ? '' : seleccion[i]).trim();
    if (!s) continue;
    if (catalogo.indexOf(s) === -1) { desconocidos.push(s); continue; }
    pedidos[s] = true;
  }
  var lista = [];
  for (var k = 0; k < catalogo.length; k++) {
    if (pedidos[catalogo[k]]) lista.push(catalogo[k]);
  }
  return { lista: lista, desconocidos: desconocidos };
}

// _webPermisosGuardar(token, datos): solo Diana; datos = { id, funciones, categorias, clanesAdmin? } (id = Tag de _webPermisosListar()); guarda el estado COMPLETO y escribe en todas las filas con ese Celular; clanesAdmin opcional (ausente = no tocar; [] = '(ninguna)'; formato 'A, B'); si se manda, la respuesta trae `clanesAdmin`; devuelve cuentasActualizadas. [→ Contexto_Base_Web.md §37B034]
function _webPermisosGuardar(token, datos) {
  var acc = _webPermisosExigirAcceso(token);
  if (!acc.ok) return acc;

  if (!datos || !datos.id) return { ok: false, error: 'Falta identificar al administrador.' };
  if (!Array.isArray(datos.funciones) || !Array.isArray(datos.categorias)) {
    return { ok: false, error: 'Faltan las listas de funciones y categorías.' };
  }
  var tagBuscado = cleanTag(datos.id);
  if (!tagBuscado) return { ok: false, error: 'Falta identificar al administrador.' };

  var hoja = _webPermisosLeerHoja();
  if (!hoja) return { ok: false, error: WEB_PERMISOS_MSG_HOJA_NO_DISPONIBLE };
  // FIX 24-sep-2026: si los datos vinieron del CSV (hoja.sh null) se rechaza el guardado: el CSV nunca es destino de escritura y el cambio se perdería sin aviso. [→ Contexto_Base_Web.md §37B035]
  if (hoja.origen !== 'sheet') {
    return { ok: false, error: 'La hoja Administradores no está disponible en este momento (se está leyendo desde el respaldo). No se puede guardar; intenta de nuevo en un momento.' };
  }
  var data = hoja.data;

  var base = -1;
  for (var i = 0; i < data.length; i++) {
    if (cleanTag(data[i][AC.TAG - 1]) === tagBuscado) { base = i; break; }
  }
  if (base === -1) {
    return { ok: false, error: 'No encontré a ese administrador (puede que la hoja se haya actualizado). Recarga la lista e intenta de nuevo.' };
  }

  var selFunciones  = _webPermisosDepurarSeleccion(datos.funciones,  _webPermisosIdsFunciones());
  var selCategorias = _webPermisosDepurarSeleccion(datos.categorias, _webPermisosCategoriasCatalogo(data));
  var desconocidos = selFunciones.desconocidos.concat(selCategorias.desconocidos);

  // Clanes_Admin opcional: catálogo válido = clanes Terna + lo que el admin ya tiene en la celda. [→ Contexto_Base_Web.md §37B036]
  var cambiaClanes = (datos.clanesAdmin !== undefined && datos.clanesAdmin !== null);
  var selClanes = null;
  var clanesAntes = _webPermisosParsearLista(data[base][AC.CLANES_ADMIN - 1]);
  if (cambiaClanes) {
    if (!Array.isArray(datos.clanesAdmin)) {
      return { ok: false, error: 'La lista de clanes no tiene el formato correcto. Recarga la lista e intenta de nuevo.' };
    }
    var catalogoClanes = _webPermisosClanesCatalogo();
    for (var ca = 0; ca < clanesAntes.length; ca++) {
      if (catalogoClanes.indexOf(clanesAntes[ca]) === -1) catalogoClanes.push(clanesAntes[ca]);
    }
    selClanes = _webPermisosDepurarSeleccion(datos.clanesAdmin, catalogoClanes);
    desconocidos = desconocidos.concat(selClanes.desconocidos);
  }
  if (desconocidos.length) {
    return { ok: false, error: 'Hay valores que no reconozco (' + desconocidos.slice(0, 3).join(', ') + '). Recarga la lista e intenta de nuevo.' };
  }

  // Todas las filas del mismo Celular (multicuenta). Sin Celular, solo la fila.
  var cel = soloDigitos(data[base][AC.CELULAR - 1]);
  var filas = [];
  for (var j = 0; j < data.length; j++) {
    if (j === base || (cel && soloDigitos(data[j][AC.CELULAR - 1]) === cel)) filas.push(j);
  }

  var textoFunciones  = selFunciones.lista.length  ? selFunciones.lista.join(', ')  : WEB_PERMISOS_SIN_NADA;
  var textoCategorias = selCategorias.lista.length ? selCategorias.lista.join(', ') : WEB_PERMISOS_SIN_NADA;
  var textoClanes     = (cambiaClanes && selClanes.lista.length) ? selClanes.lista.join(', ') : WEB_PERMISOS_SIN_NADA;
  var funcionesAntes  = String(data[base][AC.FUNCIONES - 1] || '').trim();
  var categoriasAntes = _webPermisosParsearLista(data[base][AC.CAT_DISP - 1]).length;

  for (var f = 0; f < filas.length; f++) {
    var filaSheet = filas[f] + 2; // +2: encabezado (fila 1) + índice 0-based -> 1-based
    hoja.sh.getRange(filaSheet, AC.FUNCIONES).setValue(textoFunciones);
    hoja.sh.getRange(filaSheet, AC.CAT_DISP).setValue(textoCategorias);
    if (cambiaClanes) hoja.sh.getRange(filaSheet, AC.CLANES_ADMIN).setValue(textoClanes);
  }

  Logger.log('[Permisos] ' + (acc.admin.nombre || acc.admin.tag || 'Diana') + ' guardó los permisos de ' +
    String(data[base][AC.TAG - 1]) + ' (' + filas.length + ' cuenta(s) del mismo celular). ' +
    'Funciones: "' + (funcionesAntes || '(vacío)') + '" -> "' + textoFunciones + '". ' +
    'Cat_disp: ' + categoriasAntes + ' -> ' + selCategorias.lista.length + ' categoría(s).' +
    (cambiaClanes
      ? ' Clanes_Admin: \"' + (clanesAntes.join(', ') || WEB_PERMISOS_SIN_NADA) + '\" -> \"' + textoClanes + '\".'
      : ' Clanes_Admin: sin cambios.'));

  return {
    ok: true,
    id: String(data[base][AC.TAG - 1]).trim(),
    funciones: selFunciones.lista,
    categorias: selCategorias.lista,
    // Solo cuando se mandó el cambio: el frontend usa `clanesAdmin === undefined` para detectar un backend que no lo guardó. [→ Contexto_Base_Web.md §37B037]
    clanesAdmin: cambiaClanes ? selClanes.lista.join(', ') : undefined,
    cuentasActualizadas: filas.length
  };
}

// _webCacheado(key, ttlSeg, fn): FIX 30-ago-2026 (portal lento, cold-start de 1-3 s por llamada); envuelve funciones de solo lectura en CacheService.getScriptCache() por ttlSeg (60 s por defecto, igual que el sessionStorage de apiGet()); si CacheService falla (cuota, valor >100 KB, caché corrupta) ejecuta fn() sin caché sin romper el endpoint. [→ Contexto_Base_Web.md §37B038]
function _webCacheado(key, ttlSeg, fn) {
  var cache = CacheService.getScriptCache();
  try {
    var crudo = cache.get(key);
    if (crudo) return JSON.parse(crudo);
  } catch (e) {
    // Caché corrupta o no disponible: seguir sin caché. [→ Contexto_Base_Web.md §37B039]
  }

  var resultado = fn();

  try {
    cache.put(key, JSON.stringify(resultado), ttlSeg);
  } catch (e) {
    // Valor demasiado grande (>100 KB) o cuota excedida: el endpoint sigue, solo sin cachear. [→ Contexto_Base_Web.md §37B040]
  }

  return resultado;
}

// _webRoster(): miembros ACTIVOS agrupados por clan, vía _leerDirectorioFisicoComoDC() (misma fuente que el dashboard); sin celular, prefijo ni contacto (eso va por CONTACTOS_TOKEN); FIX 30-ago-2026: cacheada 60 s, la función original quedó como _webRosterCalcular() y _webRoster() es el wrapper que llama doGet. [→ Contexto_Base_Web.md §37B041]
function _webRoster() {
  return _webCacheado('web_roster_v1', 60, _webRosterCalcular);
}

function _webRosterCalcular() {
  // FIX 24-sep-2026: la lectura hoja-viva-o-Backup_Directorio.csv (con Vigencia/Fecha_ing como Date) pasó a _webLeerDirectorioComoDC(); mismo criterio que la búsqueda de perfil; comportamiento del roster sin cambios. [→ Contexto_Base_Web.md §37B042]
  var dataDir = _webLeerDirectorioComoDC().filas;
  var porClan = {}; // nombreClan -> [{tag,nombre,rango,vGuerra,torneos}]
  var arenaMemo = {};

  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    var clanNombre = String(fila[DC.CLAN - 1] || 'Sin clan');
    if (!porClan[clanNombre]) porClan[clanNombre] = [];
    var arenaKey = String(fila[DC.ARENA - 1]);
    if (!(arenaKey in arenaMemo)) arenaMemo[arenaKey] = _resolverArenaDesdeCatalogo(fila[DC.ARENA - 1]);
    porClan[clanNombre].push({
      tag:     String(fila[DC.TAG    - 1] || ''),
      nombre:  String(fila[DC.NOMBRE - 1] || ''),
      rango:   String(fila[DC.RANGO  - 1] || ''),
      vGuerra: Number(fila[DC.V_GUERRA - 1]) || 0,
      torneos: Number(fila[DC.TORNEOS  - 1]) || 0,
      // FIX 03-sep-2026: se expone Vigencia (DC.VIGENCIA) en webRoster, valor de celda tal cual (Date o ''); el frontend decide el formato. [→ Contexto_Base_Web.md §37B043]
      vigencia: fila[DC.VIGENCIA - 1] || '',
      // FIX 07-sep-2026: directorio.html pedía ranking en el clan, nivel (xp), nivel (cartas), antigüedad, copas y arena; se agregan con el mismo mapeo DC que _webPerfilExtendido(); fechaIngreso tal cual; ranking/copas en 0 si vacío (la tabla necesita valor consistente para ordenar). [→ Contexto_Base_Web.md §37B044]
      ranking:      Number(fila[DC.RANKING - 1]) || 0,
      nivelXp:      String(fila[DC.NIVEL   - 1] || ''),
      nivelCartas:  String(fila[DC.NIVEL2  - 1] || ''),
      copas:        Number(fila[DC.COPAS   - 1]) || 0,
      // FIX 27-sep-2026: la arena se resuelve con _resolverArenaDesdeCatalogo() (09_API_ClashRoyale.gs) contra Backup_Arena.csv: Nombre (español) si está, si no Name (inglés), si no el rawName; mismo criterio que _webPerfilExtendido(). [→ Contexto_Base_Web.md §37B045]
      arena:        arenaMemo[arenaKey],
      fechaIngreso: fila[DC.FECHA_ING - 1] || '',
      // FIX 09-sep-2026: 'Antigüedad' del Directorio es la antigüedad en el JUEGO en años (PC.ANTIGUEDAD de Players, badge YearsPlayed, vía DC.ANTIGUEDAD), no el tiempo en el clan; se manda tal cual ('' si la cuenta no se sincronizó). [→ Contexto_Base_Web.md §37B046]
      antiguedad:   fila[DC.ANTIGUEDAD - 1] === '' || fila[DC.ANTIGUEDAD - 1] === null || fila[DC.ANTIGUEDAD - 1] === undefined
                      ? ''
                      : Number(fila[DC.ANTIGUEDAD - 1]),
      // FIX 17-sep-2026: columna Perfil (íconos RoyaleAPI/CWStats) en directorio.html con _webUrlPerfilExterno() y los mismos campos royaleApi/cwStats que guerra.html; '' si la celda no tiene el link. [→ Contexto_Base_Web.md §37B047]
      royaleApi:    _webUrlPerfilExterno(fila[DC.ROYALE_API - 1], 'royaleapi.com', 'player'),
      cwStats:      _webUrlPerfilExterno(fila[DC.CW_STATS   - 1], 'cwstats.com',   'player')
    });
  }

  // Orden: clanes por CFG.TERNA_TAGS y, dentro de cada clan, por nombre. [→ Contexto_Base_Web.md §37B048]
  var nombresOrdenados = Object.keys(porClan).sort(function (a, b) {
    var tagA = _getClanTagByName(a), tagB = _getClanTagByName(b);
    var oA = CFG.TERNA_TAGS.indexOf(tagA), oB = CFG.TERNA_TAGS.indexOf(tagB);
    if (oA === -1) oA = 999;
    if (oB === -1) oB = 999;
    if (oA !== oB) return oA - oB;
    return a.localeCompare(b);
  });

  // FIX 28-ago-2026: dentro de cada clan, primero por Rango (líder > colíder > veterano > miembro, CFG.RANGO_ORDEN) y luego por nombre. [→ Contexto_Base_Web.md §37B049]
  function _ordenRango(rango) {
    var key = String(rango || '').toLowerCase().replace('í', 'i').replace('é', 'e');
    return CFG.RANGO_ORDEN[key] || 4;
  }

  var resultado = nombresOrdenados.map(function (nombreClan) {
    var miembros = porClan[nombreClan].slice().sort(function (a, b) {
      var rA = _ordenRango(a.rango), rB = _ordenRango(b.rango);
      if (rA !== rB) return rA - rB;
      return a.nombre.localeCompare(b.nombre);
    });
    return { nombre: nombreClan, miembros: miembros };
  });

  return { clanes: resultado };
}

// _webLeerDirectorioComoDC(): FIX 24-sep-2026; fuente única de filas de Directorio en formato DC (60 columnas) para la web: 1) hoja viva (+ Players + Links) vía _leerDirectorioFisicoComoDC(); 2) si falta, está vacía o lanza excepción (incluido _getSs()), Backup_Directorio.csv con _obtenerFilasConFallbackCSV(), reconstruyendo Vigencia/Fecha_ing con _parseSpanishDate(); no consulta Inactivos; devuelve {filas, origen: 'sheet'|'csv'|'vacio'}. [→ Contexto_Base_Web.md §37B050]
function _webLeerDirectorioComoDC() {
  var ss = null;
  try {
    ss = _getSs();
    var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
    if (shDir && shDir.getLastRow() >= 2) {
      var vivas = _leerDirectorioFisicoComoDC(ss);
      if (vivas && vivas.length) return { filas: vivas, origen: 'sheet' };
    }
  } catch (eHoja) {
    Logger.log('[WebAPI] _webLeerDirectorioComoDC: la hoja Directorio falló (' + eHoja.message + '); se intenta Backup_Directorio.csv.');
  }

  // ss puede ser null si _getSs() falló: _obtenerFilasConFallbackCSV() lo tolera y sigue al CSV. [→ Contexto_Base_Web.md §37B051]
  var lecturaDir = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
  if (lecturaDir.origen !== 'csv') return { filas: [], origen: 'vacio' };

  return { filas: lecturaDir.filas.map(_webFilaCsvConFechas), origen: 'csv' };
}

// _webFilaCsvConFechas(fila): copia una fila de Backup_Directorio.csv/Backup_Inactivos.csv (DC) reconvirtiendo Vigencia y Fecha_ing a Date con _parseSpanishDate() (24-sep-2026); la usan Directorio e Inactivos. [→ Contexto_Base_Web.md §37B052]
function _webFilaCsvConFechas(fila) {
  var f = fila.slice();
  var vig = _parseSpanishDate(f[DC.VIGENCIA - 1]);
  if (vig instanceof Date && !isNaN(vig.getTime())) f[DC.VIGENCIA - 1] = vig;
  var fIng = _parseSpanishDate(f[DC.FECHA_ING - 1]);
  if (fIng instanceof Date && !isNaN(fIng.getTime())) f[DC.FECHA_ING - 1] = fIng;
  return f;
}

// _webBuscarFilaInactivosPorTag(tagNorm): NUEVO 24-sep-2026; busca un Tag en Inactivos y devuelve fila DC de 60 columnas o null; solo si no está en Directorio. 1) hoja Inactivos (29 col., IC) convertida con _reconstruirExistingDesdeInactivos() + 31 columnas extra, buscadas primero en Backup_Inactivos.csv (_extraColsInactivosDesdeCsv()) y, si el tag aún no está, en ClanSystem_Backup_InactivosExtra.json (_cargarExtraColsInactivos()); 2) si la hoja falla o está vacía, Backup_Inactivos.csv en DC (se indexa con DC.*, la hoja con IC.*, sin mezclar); si la hoja se leyó bien y el Tag no está, NO se consulta el CSV. [→ Contexto_Base_Web.md §37B053]
function _webBuscarFilaInactivosPorTag(tagNorm) {
  var ss = null;
  var hojaLeida = false;
  try {
    ss = _getSs();
    var shInact = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
    if (shInact && shInact.getLastRow() >= 2) {
      var datos = shInact.getRange(2, 1, shInact.getLastRow() - 1, INACTIVOS_TOTAL_COLS).getValues();
      hojaLeida = true;
      for (var i = 0; i < datos.length; i++) {
        var tagFila = String(datos[i][IC.TAG - 1] || '').trim();
        if (!tagFila || cleanTag(tagFila) !== tagNorm) continue;
        var extra = null;
        try {
          extra = _extraColsInactivosDesdeCsv(tagNorm);
        } catch (eExtraCsv) {
          Logger.log('[WebAPI] _webBuscarFilaInactivosPorTag: Backup_Inactivos.csv falló para las columnas extra (' + eExtraCsv.message + '); se intenta el JSON.');
        }
        if (!extra) {
          try {
            var extraPorTag = _cargarExtraColsInactivos();
            extra = extraPorTag[tagFila] || extraPorTag['#' + tagNorm] || extraPorTag[tagNorm] || null;
          } catch (eExtra) {
            Logger.log('[WebAPI] _webBuscarFilaInactivosPorTag: no se pudo leer el snapshot de columnas extra (' + eExtra.message + '); la fila sale sin estadísticas.');
          }
        }
        return _reconstruirExistingDesdeInactivos(datos[i], extra);
      }
    }
  } catch (eHoja) {
    Logger.log('[WebAPI] _webBuscarFilaInactivosPorTag: la hoja Inactivos falló (' + eHoja.message + '); se intenta Backup_Inactivos.csv.');
    hojaLeida = false;
  }
  if (hojaLeida) return null;

  var lecturaInact = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.INACTIVOS, 'Backup_Inactivos.csv', DIR_TOTAL_COLS);
  if (lecturaInact.origen !== 'csv') return null;
  for (var j = 0; j < lecturaInact.filas.length; j++) {
    if (cleanTag(lecturaInact.filas[j][DC.TAG - 1]) === tagNorm) {
      Logger.log('[WebAPI] _webBuscarFilaInactivosPorTag: fila de ' + tagNorm + ' servida desde Backup_Inactivos.csv (Sheets no disponible).');
      return _webFilaCsvConFechas(lecturaInact.filas[j]);
    }
  }
  return null;
}

// _webBuscarFilaDirectorioPorTag(tagBuscado): normaliza el tag y busca primero en Directorio y luego en Inactivos; FIX 24-sep-2026: lee vía _webLeerDirectorioComoDC() (hoja, luego Backup_Directorio.csv, que puede estar algo desfasado) y busca también en Inactivos (devuelve el perfil con estado 'Inactivo'); devuelve fila DC o null. [→ Contexto_Base_Web.md §37B054]
function _webBuscarFilaDirectorioPorTag(tagBuscado) {
  var hallazgo = _webBuscarFilaDirectorioPorTagConOrigen(tagBuscado);
  return hallazgo ? hallazgo.fila : null;
}

// _webBuscarFilaDirectorioPorTagConOrigen(tagBuscado): NUEVO 28-sep-2026 (Fase 5b tanda A); misma búsqueda que la anterior (ahora un envoltorio) pero con origen: 'directorio' (incluye admins inactivos) o 'inactivos' (hoja o CSV); null si no está. [→ Contexto_Base_Web.md §37B055]
function _webBuscarFilaDirectorioPorTagConOrigen(tagBuscado) {
  var tagNorm = cleanTag(tagBuscado); // sin '#', mayúsculas — ver 04_Formato_Comun.gs
  if (!tagNorm) return null;
  var lectura = _webLeerDirectorioComoDC();
  var dataDir = lectura.filas;
  for (var i = 0; i < dataDir.length; i++) {
    if (cleanTag(dataDir[i][DC.TAG - 1]) === tagNorm) {
      if (lectura.origen === 'csv') Logger.log('[WebAPI] _webBuscarFilaDirectorioPorTag: fila de ' + tagNorm + ' servida desde Backup_Directorio.csv (Sheets no disponible).');
      return { fila: dataDir[i], origen: 'directorio' };
    }
  }
  var filaInactivos = _webBuscarFilaInactivosPorTag(tagNorm);
  return filaInactivos ? { fila: filaInactivos, origen: 'inactivos' } : null;
}

// AVISOS ABIERTOS — TROFEOS DE GUERRA vs V_GUERRA (27-sep-2026). AVISO 9 RESUELTO: la barra 'Trofeos guerra' de Requisitos usaba DC.V_GUERRA (victorias de guerra, un conteo) en vez de trofeos/fame; ahora recibe `fameSemana` (GC.FAME de la hoja Guerra) y el parámetro se renombró a trofeosGuerra; DC.V_GUERRA no se tocó. AVISO 10 VERIFICACIÓN ABIERTA: el perfil a veces muestra '4 ataques' con '0 trofeos' el mismo día; PENDIENTE capturar Tag, fecha y valores de ATAQUES_HOY/FAME de la hoja Guerra antes de volver a atacar. Detalle en el .md. [→ Contexto_Base_Web.md §37B056]

// _webProgresoRequisitos(clanNombre, ataquesSemana, trofeosGuerra, torneosTotal): compara ataques de la semana y trofeos de guerra contra CR_Lista (Ascensos y Descensos) de SU clan; FIX 27-sep-2026: tercer parámetro renombrado de vGuerra a trofeosGuerra (llamador pasa fameSemana); MIGRADO 14-sep-2026 a _getRequisitosCambioRangoBloqueCategoria() (par vigente de CR_Lista, sin respaldo a T_Requisitos desde 17-sep); `torneos` y `reaccion` eliminados; ataques pasa a ataquesMiembro/Veterano/Colider (perfil.html aún espera `ataques` plano); NUEVO 19-sep-2026: quinto parámetro ataquesExentos (4 por día opcional) que baja `requerido` y agrega `exentos`. Detalle en el .md. [→ Contexto_Base_Web.md §37B057]
function _webProgresoRequisitos(clanNombre, ataquesSemana, trofeosGuerra, torneosTotal, ataquesExentos) {
  var exentos = Math.max(0, Number(ataquesExentos) || 0);
  // Bloque de un requisito de Ataques ({qty, activo} de CR_Lista) con la exención aplicada.
  function bloqueAtaques(req) {
    var q = Number(req.qty);
    return {
      requerido: (exentos > 0 && isFinite(q) && q > 0) ? Math.max(0, q - exentos) : req.qty,
      activo:    req.activo,
      actual:    ataquesSemana,
      exentos:   exentos
    };
  }
  function bloqueParaCategoria(nombreCategoria) {
    var bloque = _getRequisitosCambioRangoBloqueCategoria(nombreCategoria);
    var deEsteClan = null;
    for (var i = 0; i < bloque.length; i++) {
      if (String(bloque[i].clan || '').trim() === String(clanNombre || '').trim()) {
        deEsteClan = bloque[i];
        break;
      }
    }
    if (!deEsteClan) return null;
    return {
      minTMiembro:     { requerido: deEsteClan.minTMiembro.qty,     activo: deEsteClan.minTMiembro.activo,     actual: trofeosGuerra },
      minTVeterano:    { requerido: deEsteClan.minT.qty,             activo: deEsteClan.minT.activo,             actual: trofeosGuerra },
      minTColider:     { requerido: deEsteClan.minTColider.qty,     activo: deEsteClan.minTColider.activo,     actual: trofeosGuerra },
      ataquesMiembro:  bloqueAtaques(deEsteClan.ataquesMiembro),
      ataquesVeterano: bloqueAtaques(deEsteClan.ataquesVeterano),
      ataquesColider:  bloqueAtaques(deEsteClan.ataquesColider),
      miembroActivo:   { activo: deEsteClan.miembroActivo.activo }
    };
  }

  return {
    ascensos:  bloqueParaCategoria('Ascensos'),
    descensos: bloqueParaCategoria('Descensos')
  };
}

// _webCaminoLeyendas(liga, trofeos, rango): versión estructurada de _formatearCaminoLeyendas() (44_BotWhatsApp.gs), misma regla en cascada (vacío = 0): Liga 0 -> null; sin trofeos -> {liga}; sin rango -> {liga, trofeos}; todos -> {liga, trofeos, rango}. [→ Contexto_Base_Web.md §37B058]
function _webCaminoLeyendas(liga, trofeos, rango) {
  var ligaNum = Number(liga) || 0;
  if (ligaNum === 0) return null;
  var resultado = { liga: liga };
  var trofeosNum = Number(trofeos) || 0;
  if (trofeosNum === 0) return resultado;
  resultado.trofeos = trofeos;
  var rangoNum = Number(rango) || 0;
  if (rangoNum === 0) return resultado;
  resultado.rango = rango;
  return resultado;
}

// _webUrlPerfilExterno(valorCelda, dominio, segmento): el campo de enlaces externos puede ser URL completa o solo el tag; mismo criterio que _respuestaInfoMi() (44_BotWhatsApp.gs). [→ Contexto_Base_Web.md §37B059]
function _webUrlPerfilExterno(valorCelda, dominio, segmento) {
  var v = String(valorCelda || '').trim();
  if (!v) return '';
  if (v.startsWith('http')) return v;
  return 'https://' + dominio + '/' + segmento + '/' + cleanTag(v);
}

// _webPerfilExtendido(fila): FASE 1.5 (24-ago-2026), paridad de jugadores.html con _respuestaInfoMi(); fila = array DC de 60 columnas; devuelve nivel, copas máx., arena, batallas, racha, Camino de leyendas, logros, coleccionables, donaciones, ranking y enlaces externos; campos numéricos vacíos/0 se omiten. [→ Contexto_Base_Web.md §37B060]
function _webPerfilExtendido(fila) {
  var ext = {
    nivelXp:      String(fila[DC.NIVEL      - 1] || ''),
    nivelCartas:  String(fila[DC.NIVEL2     - 1] || ''),
    copasMax:     Number(fila[DC.COPAS_MAX  - 1]) || 0,
    // FIX 27-sep-2026: la arena pasa por _resolverArenaDesdeCatalogo() (Backup_Arena.csv): Nombre en español, si no Name en inglés, si no el rawName. [→ Contexto_Base_Web.md §37B061]
    arena:        _resolverArenaDesdeCatalogo(fila[DC.ARENA - 1]),
    victorias:    Number(fila[DC.VICTORIAS  - 1]) || 0,
    derrotas:     Number(fila[DC.DERROTAS   - 1]) || 0,
    batallas:     Number(fila[DC.BATALLAS   - 1]) || 0,
    racha:        Number(fila[DC.RACHA      - 1]) || 0,
    caminoLeyendas: _webCaminoLeyendas(fila[DC.CL_LIGA - 1], fila[DC.CL_TROFEOS - 1], fila[DC.CL_RANGO - 1])
  };

  if (fila[DC.VICTORIAS_3C      - 1]) ext.victorias3Coronas   = Number(fila[DC.VICTORIAS_3C      - 1]) || 0;
  if (fila[DC.MAX_VIC_DESAFIOS  - 1]) ext.maxVictoriasDesafios = Number(fila[DC.MAX_VIC_DESAFIOS  - 1]) || 0;
  if (fila[DC.EMOTES            - 1]) ext.emotes               = Number(fila[DC.EMOTES            - 1]) || 0;
  if (fila[DC.BANNERS           - 1]) ext.banners              = Number(fila[DC.BANNERS           - 1]) || 0;
  if (fila[DC.CARTAS_DESAFIOS   - 1]) ext.cartasDesafios       = Number(fila[DC.CARTAS_DESAFIOS   - 1]) || 0;
  if (fila[DC.CARTAS_TORNEOS    - 1]) ext.cartasTorneos        = Number(fila[DC.CARTAS_TORNEOS    - 1]) || 0;
  // FIX 27-sep-2026: el pastel de donaciones había desaparecido para todos porque el guard truthy `if (fila[DC.DON_R - 1])` descartaba el valor real 0; se cambió a 'la celda tiene algo escrito' (las donaciones se resetean semanalmente para todo el clan, de ahí que fallara a todos a la vez); perfil.html exige donacionesRealizadas y donacionesRecibidas != null. [→ Contexto_Base_Web.md §37B062]
  if (fila[DC.DON_R - 1] !== '' && fila[DC.DON_R - 1] !== undefined && fila[DC.DON_R - 1] !== null) {
    ext.donacionesRecibidas = Number(fila[DC.DON_R - 1]) || 0;
  }
  if (fila[DC.DON_D - 1] !== '' && fila[DC.DON_D - 1] !== undefined && fila[DC.DON_D - 1] !== null) {
    ext.donacionesRealizadas = Number(fila[DC.DON_D - 1]) || 0;
  }
  if (fila[DC.RANKING           - 1]) ext.rankingClan          = Number(fila[DC.RANKING           - 1]) || 0;

  var royaleApi = _webUrlPerfilExterno(fila[DC.ROYALE_API - 1], 'royaleapi.com', 'player');
  if (royaleApi) ext.royaleApi = royaleApi;
  var cwStats = _webUrlPerfilExterno(fila[DC.CW_STATS - 1], 'cwstats.com', 'player');
  if (cwStats) ext.cwStats = cwStats;
  if (fila[DC.DECK   - 1]) ext.deck  = String(fila[DC.DECK   - 1]);
  if (fila[DC.DECK_2 - 1]) ext.deck2 = String(fila[DC.DECK_2 - 1]);

  // CONEXIÓN 11-sep-2026: campos que Directorio no trae y solo están en el JSON crudo de /players en Drive (ver _webDatosDriveJugador()). FIX 15-sep-2026: se renombra `ext.drive` a `ext.rawClash`, que es lo que perfil.html lee (rawClash(j) busca j.extendido.rawClash); por el desajuste no se mostraba ninguna sección que dependiera de rawClash; cada sección decide sola si mostrarse. [→ Contexto_Base_Web.md §37B063]
  var datosDrive = _webDatosDriveJugador(fila[DC.TAG - 1]);
  if (datosDrive) ext.rawClash = datosDrive;

  // 24-sep-2026: el badge de Camino de Leyendas sale primero del CSV nuevo (temporada actual); si no trae liga queda el valor de Directorio. [→ Contexto_Base_Web.md §37B064]
  try {
    var clNuevo = _webCaminoLeyendasCsv(fila[DC.TAG - 1]);
    if (clNuevo && clNuevo.actual && Number(clNuevo.actual.leagueNumber) > 0) {
      ext.caminoLeyendas = _webCaminoLeyendas(clNuevo.actual.leagueNumber, clNuevo.actual.trophies, clNuevo.actual.rank);
    }
  } catch (eCl) {
    Logger.log('[WebAPI] Camino de Leyendas desde CSV: ' + eCl.message);
  }

  return ext;
}

// _webDatosDriveJugador(tag): conecta el perfil web con la carpeta Drive "Players" (JSON crudo de /players, vía _cargarPlayerDesideDrive() de 09_API_ClashRoyale.gs) y con los CSV web; devuelve un objeto liviano con los MISMOS nombres del JSON de Supercell (rawClash) o null si ninguna fuente trae dato. FIX 15-sep-2026: campos con su nombre original + badges[]; FIX 17-sep-2026: achievements[], cards[], supportCards[], currentDeck[] y currentDeckSupportCards[] (currentDeck es el array CRUDO, no mazoActual), cada campo con su propio if; 21/23-sep-2026: nombreEs (cartas por ID desde Backup_Cards.csv, insignias por Name desde el catálogo Backup_Insignias.csv) y costoOro/cartasSiguienteNivel desde Backup_Cards_3.csv (AVISO 8); trophies, wins, donations, clan, arena, role, etc. no se traen porque ya llegan por Directorio. @param tag; @returns objeto o null. [→ Contexto_Base_Web.md §37B065]
function _webDatosDriveJugador(tag) {
  var tagConNumeral = '#' + cleanTag(tag);
  if (tagConNumeral === '#') return null;

  var datos = _cargarPlayerDesideDrive(tagConNumeral);
  // 24-sep-2026: Camino de Leyendas se lee primero de Backup_CaminoLeyendas.csv (33_CaminoLeyendas.gs); el JSON queda de respaldo. [→ Contexto_Base_Web.md §37B066]
  var clCsv = _webCaminoLeyendasCsv(tagConNumeral);
  // 24-sep-2026: los 5 contadores de la cabecera de estadísticas avanzadas (expLevel/kingTowerLevel/starPoints/expPoints/totalExpPoints) se leen primero de Backup_PerfilWeb.csv (36_PerfilWeb.gs); el JSON queda de respaldo. [→ Contexto_Base_Web.md §37B067]
  var pwCsv = _webPerfilWebCsv(tagConNumeral);
  // 24-sep-2026: progress{} (modos rotativos) se lee primero de Backup_ProgresoEventos.csv (35_ProgresoEventos); a diferencia de Camino de Leyendas/Perfil, el CSV pisa por completo (ver _webAplicarProgresoEventosCsv()); el JSON queda de respaldo. [→ Contexto_Base_Web.md §37B068]
  var peCsv = _webProgresoEventosCsv(tagConNumeral);
  // FIX 24-sep-2026 ("la web no debe depender del JSON"): un JSON ausente equivale a uno vacío y cartas, insignias y logros se arman desde sus CSV aunque no haya JSON (_webCartasCsvPrimero/_webBadgesCsvPrimero/_webLogrosCsvPrimero aceptan respaldo vacío); devuelve null solo si ninguna fuente trae dato. CORRECCIÓN: currentFavouriteCard ya no es solo JSON (_webCartaFavoritaCsvPrimero(), Backup_Cards_2.csv columna Favorita); _fecha y _clan siguen siendo puro JSON. Limitación: sin JSON ni CSV con Favorita no se manda currentFavouriteCard. Costo: un jugador sin JSON ni filas en los CSV chicos lee Cards_2/Insignias_2/Logros_2 antes de devolver null. [→ Contexto_Base_Web.md §37B069]
  if (!datos) datos = {};

  var extra = {};
  // FIX 21-sep-2026: el mapa ID -> nombreEs (Backup_Cards.csv) se arma una sola vez y solo si el JSON trae alguna de las 5 categorías de cartas. 24-sep-2026: las 4 listas de cartas salen primero de Backup_Cards_2.csv y el JSON queda de respaldo; los datos fijos salen de Backup_Cards.csv (39_CartasWeb.gs); si algo falla queda lo del JSON. [→ Contexto_Base_Web.md §37B070]
  var cartasCsv = null;
  try {
    cartasCsv = _webCartasCsvPrimero(tag, datos);
  } catch (eCartasCsv) {
    Logger.log('[WebAPI] _webDatosDriveJugador: listas de cartas desde CSV fallaron (' + eCartasCsv.message + '); se usa el JSON.');
  }
  var listaCartas = function (nombre) {
    if (cartasCsv && Array.isArray(cartasCsv[nombre])) return cartasCsv[nombre];
    return Array.isArray(datos[nombre]) ? datos[nombre] : [];
  };
  // FIX 24-sep-2026: cuál es la carta favorita se busca primero en Backup_Cards_2.csv (columna Favorita, _webCartaFavoritaCsvPrimero() en 39_CartasWeb.gs); datos.currentFavouriteCard del JSON es respaldo si ningún CSV la marca para este tag. [→ Contexto_Base_Web.md §37B071]
  var favoritaCsv = null;
  try {
    favoritaCsv = _webCartaFavoritaCsvPrimero(tag, datos);
  } catch (eFavCsv) {
    Logger.log('[WebAPI] _webDatosDriveJugador: carta favorita desde CSV falló (' + eFavCsv.message + '); se usa el JSON.');
  }
  var cartaFavoritaBase = favoritaCsv || datos.currentFavouriteCard || null;
  var hayCartasParaTraducir = !!cartaFavoritaBase ||
    listaCartas('cards').length || listaCartas('supportCards').length ||
    listaCartas('currentDeck').length || listaCartas('currentDeckSupportCards').length;
  var nombreCartaPorId = hayCartasParaTraducir ? _webMapaNombreCartaPorId() : {};
  var conNombreEs = function (o) { return _webConNombreEs(o, nombreCartaPorId); };
  // FIX 23-sep-2026 (AVISO 8): costos de subida de nivel de Backup_Cards_3.csv, leídos una sola vez y solo si el JSON trae alguna de las 4 listas que los llevan; si el CSV falla o está vacío se sigue sin ellos. [→ Contexto_Base_Web.md §37B072]
  var hayCartasConNivel = !!hayCartasParaTraducir;
  // Catálogo de datos fijos (Backup_Cards.csv), leído una vez por ejecución. [→ Contexto_Base_Web.md §37B073]
  var catalogoCartas = hayCartasConNivel ? _webCatalogoCartasPorId() : {};
  var costosSubida = null;
  if (hayCartasConNivel) {
    try {
      var cs = _construirCostosPorRareza(); // 31_Cards_Mazos.gs, sección E
      if (cs && cs.hayDatos) costosSubida = cs;
    } catch (eCostos) {
      Logger.log('[WebAPI] _webDatosDriveJugador: no se pudo leer Backup_Cards_3.csv (' + eCostos.message + ')');
    }
  }
  // AVISO 7 (24-sep-2026): count, level y evolutionLevel de cada carta salen primero de Backup_Cards_2.csv (por Tag + ID); lo que ese CSV no trae (fila vieja, tag no actualizado, CSV ilegible) queda como venga en el JSON; se lee una vez por jugador; level se manda CRUDO (nivel del CSV menos la diferencia de su rareza) porque perfil.html lo convierte con nivelAppAjustado(); ver _webConCards2Csv(). [→ Contexto_Base_Web.md §37B074]
  var cards2PorId = null;
  if (hayCartasConNivel) {
    try {
      cards2PorId = _webMapaCards2PorId(tag);
    } catch (eCards2) {
      Logger.log('[WebAPI] _webDatosDriveJugador: no se pudo leer Backup_Cards_2.csv (' + eCards2.message + '); se usa el JSON.');
    }
  }
  var conNombreYCosto = function (o) { return _webConCostoSubida(conNombreEs(_webConCards2Csv(_webCartaDesdeCatalogo(o, catalogoCartas), cards2PorId)), costosSubida); };
  // 24-sep-2026: la carta favorita pasa por el mismo cruce que cards[]/supportCards[]/currentDeck[]: nombreEs (Backup_Cards.csv), count/level/evolutionLevel/starLevel (Backup_Cards_2.csv por Tag+ID) y costoOro/cartasSiguienteNivel/costosNiveles (Backup_Cards_3.csv); la API no trae su nivel, pero se obtiene de Cards_2. [→ Contexto_Base_Web.md §37B075]
  if (cartaFavoritaBase) extra.currentFavouriteCard = conNombreYCosto(cartaFavoritaBase);
  // FIX 20-sep-2026: renderCaminoLeyendas() (perfil.html) lee rawClash(j).expLevel y kingTowerLevel (nivel de experiencia y de torre del rey) y no llegaban; se agregan con el criterio "si vino algo, se agrega"; expLevel también llega por Directorio (nivelXp) y no se pisa. 24-sep-2026: estas 5 asignaciones son el respaldo del JSON; Backup_PerfilWeb.csv las pisa al final (_webAplicarPerfilWebCsv(extra, pwCsv)). [→ Contexto_Base_Web.md §37B076]
  if (datos.expLevel                  != null) extra.expLevel                  = Number(datos.expLevel)                  || 0;
  if (datos.kingTowerLevel            != null) extra.kingTowerLevel            = Number(datos.kingTowerLevel)            || 0;
  if (datos.starPoints                != null) extra.starPoints                = Number(datos.starPoints)                || 0;
  if (datos.expPoints                 != null) extra.expPoints                 = Number(datos.expPoints)                 || 0;
  if (datos.totalExpPoints            != null) extra.totalExpPoints            = Number(datos.totalExpPoints)            || 0;
  // ACTUALIZADO 24-sep-2026: legacyTrophyRoadHighScore, current/last/bestPathOfLegendSeasonResult y leagueStatistics también son respaldo del JSON; Backup_CaminoLeyendas.csv (Ladder_Historico, Actual/Anterior/Mejor_* y las 9 columnas Liga_*) las pisa al final (_webAplicarCaminoLeyendasCsv(extra, clCsv), 33_CaminoLeyendas.gs); lo único que sigue siendo JSON puro es _fecha/_clan (metadata del snapshot). [→ Contexto_Base_Web.md §37B077]
  if (datos.legacyTrophyRoadHighScore != null) extra.legacyTrophyRoadHighScore = Number(datos.legacyTrophyRoadHighScore) || 0;
  if (datos.currentPathOfLegendSeasonResult) extra.currentPathOfLegendSeasonResult = datos.currentPathOfLegendSeasonResult;
  if (datos.lastPathOfLegendSeasonResult)    extra.lastPathOfLegendSeasonResult    = datos.lastPathOfLegendSeasonResult;
  if (datos.bestPathOfLegendSeasonResult)    extra.bestPathOfLegendSeasonResult    = datos.bestPathOfLegendSeasonResult;
  if (datos.leagueStatistics) extra.leagueStatistics = datos.leagueStatistics;
  // 24-sep-2026: progress del JSON es respaldo; si Backup_ProgresoEventos.csv trae algo para el jugador lo reemplaza por completo (_webAplicarProgresoEventosCsv(extra, peCsv)). [→ Contexto_Base_Web.md §37B078]
  if (datos.progress && Object.keys(datos.progress).length) extra.progress = datos.progress;
  // FIX 15-sep-2026: badges[] ya no está bloqueado (ver docblock). FIX 21-sep-2026: cada insignia lleva nombreEs si el catálogo Backup_Insignias.csv tiene traducción (CORRECCIÓN 23-sep-2026: antes se leía Backup_Insignias_2.csv). FIX 24-sep-2026: las insignias se arman primero desde Backup_Insignias_2.csv (Tag, Name, Progreso, Nivel) + catálogo (Nivel_max, Objetivo, Ícono por Name+Nivel); lo que el CSV no trae queda del JSON (_webBadgesCsvPrimero()). [→ Contexto_Base_Web.md §37B079]
  var badgesFinal = _webBadgesCsvPrimero(tag, Array.isArray(datos.badges) ? datos.badges : []);
  if (badgesFinal.length) {
    var nombreInsigniaPorName = _webMapaNombreInsigniaPorName();
    // FIX 27-sep-2026: se agrega el mapa por Name+Nivel (_webMapaNombreInsigniaPorNameYNivel()) para que cada insignia use la traducción de SU nivel y no siempre la del nivel 1. [→ Contexto_Base_Web.md §37B080]
    var nombreInsigniaPorNameYNivel = _webMapaNombreInsigniaPorNameYNivel();
    extra.badges = badgesFinal.map(function (b) { return _webConNombreInsigniaEs(b, nombreInsigniaPorName, nombreInsigniaPorNameYNivel); });
  }
  try {
    var badgesBloq = _webInsigniasBloqueadas(badgesFinal);
    if (badgesBloq.length) extra.badgesBloqueadas = badgesBloq;
  } catch (eBloqB) {
    Logger.log('[WebAPI] insignias por desbloquear: ' + eBloqB.message);
  }
  // FIX 17-sep-2026: achievements[], cards[], supportCards[], currentDeck[] y currentDeckSupportCards[] ya no están bloqueados (ver docblock), con el criterio "si vino algo, se agrega". 24-sep-2026: logros CSV primero (Backup_Logros_2.csv por Tag + catálogo Backup_Logros.csv para nombreEs, _webLogrosCsvPrimero() en 34_Logros.gs), JSON de respaldo; si algo del CSV falla se usa el JSON tal cual. [→ Contexto_Base_Web.md §37B081]
  try {
    var logrosFinal = _webLogrosCsvPrimero(tag, Array.isArray(datos.achievements) ? datos.achievements : []);
    if (logrosFinal.length) {
      var nombreLogroPorName = _webMapaNombreLogroPorName();
      extra.achievements = logrosFinal.map(function (a) { return _webConNombreLogroEs(a, nombreLogroPorName); });
    }
  } catch (eLogros) {
    Logger.log('[WebAPI] _webDatosDriveJugador: logros desde CSV falló (' + eLogros.message + '); se usa el JSON.');
    if (Array.isArray(datos.achievements) && datos.achievements.length) extra.achievements = datos.achievements;
  }
  if (listaCartas('cards').length) extra.cards = listaCartas('cards').map(conNombreYCosto);
  if (listaCartas('supportCards').length) extra.supportCards = listaCartas('supportCards').map(conNombreYCosto);
  if (listaCartas('currentDeck').length) extra.currentDeck = listaCartas('currentDeck').map(conNombreYCosto);
  if (listaCartas('currentDeckSupportCards').length) extra.currentDeckSupportCards = listaCartas('currentDeckSupportCards').map(conNombreYCosto);
  if (extra.cards) {
    try {
      var cartasBloq = _webCartasBloqueadas(extra.cards);
      if (cartasBloq.length) extra.cardsBloqueadas = cartasBloq;
    } catch (eBloqC) {
      Logger.log('[WebAPI] cartas por desbloquear: ' + eBloqC.message);
    }
  }
  // NUEVO 29-sep-2026: la colección de cartas de torre también tiene su sección "Por desbloquear": mismo criterio que cardsBloqueadas, con las cartas de torre del catálogo que el jugador no tiene en supportCards[] (perfil.html: pintarTorresBloqueadas()). [→ Contexto_Base_Web.md §37B082]
  if (extra.supportCards) {
    try {
      var torresBloq = _webCartasBloqueadas(extra.supportCards, true);
      if (torresBloq.length) extra.supportCardsBloqueadas = torresBloq;
    } catch (eBloqT) {
      Logger.log('[WebAPI] cartas de torre por desbloquear: ' + eBloqT.message);
    }
  }
  // _fecha/_clan los inyecta _guardarPlayerEnDrive() (09_API_ClashRoyale.gs) al guardar (metadata del snapshot, no de la API); se conservan con su nombre original porque renderSnapshotInfo() (perfil.html) los lee como rawClash(j)._fecha/_clan. [→ Contexto_Base_Web.md §37B083]
  if (datos._fecha) extra._fecha = datos._fecha;
  if (datos._clan)  extra._clan  = datos._clan;
  // FIX 27-sep-2026: perfil.html (renderMiembro(), FIX 26-sep-2026) esperaba rawClash(j).clan.tag (el campo clan estándar de la API, {tag,name,badgeId}, que sí viene en el JSON de Drive) pero nunca se copiaba a extra, así que solo se mostraba el clan sin tag; no es lo mismo que _clan (metadata del exportador, que ya no se pinta, FIX 23-sep-2026). [→ Contexto_Base_Web.md §37B084]
  if (datos.clan && datos.clan.tag) extra.clan = datos.clan;

  // Camino de Leyendas: temporada actual/anterior/mejor + ladder histórico del CSV pisan lo que vino del JSON (_webAplicarCaminoLeyendasCsv()). [→ Contexto_Base_Web.md §37B085]
  _webAplicarCaminoLeyendasCsv(extra, clCsv);
  // 24-sep-2026: los 5 contadores de la cabecera de estadísticas avanzadas del CSV pisan lo que vino del JSON (_webAplicarPerfilWebCsv(), 36_PerfilWeb.gs). [→ Contexto_Base_Web.md §37B086]
  _webAplicarPerfilWebCsv(extra, pwCsv);
  // 24-sep-2026: progress{} (modos rotativos) del CSV reemplaza por completo lo que vino del JSON (_webAplicarProgresoEventosCsv(), 35_ProgresoEventos). [→ Contexto_Base_Web.md §37B087]
  _webAplicarProgresoEventosCsv(extra, peCsv);

  return Object.keys(extra).length ? extra : null;
}

// _webInsigniasBloqueadas(badgesFinal): insignias del catálogo (Backup_Insignias.csv) que el jugador NO tiene, con los datos de su primer nivel (nombre en español e ícono); sale del catálogo, no depende de las filas de relleno de Backup_Insignias_2.csv. [→ Contexto_Base_Web.md §37B088]
function _webInsigniasBloqueadas(badgesFinal) {
  var tengo = {};
  (badgesFinal || []).forEach(function (b) { if (b && b.name) tengo[String(b.name).trim()] = true; });
  var filas = _leerInsigniasCSV().rows; // N°,Name,Nombre,Nivel,Nivel_max,Objetivo,Ícono
  var porName = {};
  for (var i = 0; i < filas.length; i++) {
    var nm = String(filas[i][1] || '').trim();
    if (!nm || tengo[nm]) continue;
    var lvl = Number(filas[i][3]) || 0;
    var o = porName[nm];
    if (!o) o = porName[nm] = { fila: null, lvl: 1e9 };
    if (lvl >= 1 && lvl < o.lvl) { o.fila = filas[i]; o.lvl = lvl; } // primer nivel disponible
  }
  var mapaPorName = _webMapaNombreInsigniaPorName();
  var salida = [];
  Object.keys(porName).sort().forEach(function (nm) {
    var f = porName[nm].fila;
    if (!f) return;
    var icono = String(f[6] || '').trim();
    var b = { name: nm, maxLevel: Number(f[4]) || 0 };
    var es = String(f[2] || '').trim() || mapaPorName[nm];
    if (es) b.nombreEs = es;
    if (icono) b.iconUrls = { large: icono };
    salida.push(b);
  });
  return salida;
}

// _webCartasBloqueadas(cartasDelJugador, soloTorres): cartas del catálogo (Backup_Cards.csv) que el jugador NO tiene; sin soloTorres (cards[]) omite las de torre (_esCartaTorre), con soloTorres = true (supportCards[], 29-sep-2026) solo las de torre; en ambos casos omite las sin ícono; cartasDelJugador nunca trae filas de relleno (Level 0) porque _webCartasCsvPrimero() cuenta Level >= 1; 07-oct-2026: cada carta lleva maxEvolutionLevel (número) cuando el catálogo lo tiene, para que perfil.html muestre el costo de monedas de héroe. [→ Contexto_Base_Web.md §37B089]
function _webCartasBloqueadas(cartasDelJugador, soloTorres) {
  var tengo = {};
  (cartasDelJugador || []).forEach(function (c) { if (c && c.id != null) tengo[String(c.id)] = true; });
  var filas = _leerCardsCSV().rows; // N°,ID,Name,Nombre,Maxlevel,MaxEvo,Rarity,Tipo,Elixircost,Carta,Héroe,Evolución
  var salida = [];
  for (var i = 0; i < filas.length; i++) {
    var id = String(filas[i][1] || '').trim();
    if (!id || tengo[id] || (!!soloTorres !== _esCartaTorre(id))) continue;
    var icono = String(filas[i][9] || '').trim();
    if (!icono) continue;
    var c = {
      id: Number(id),
      name: String(filas[i][2] || ''),
      rarity: String(filas[i][6] || ''),
      elixirCost: filas[i][8] !== '' ? Number(filas[i][8]) : null,
      iconUrls: { medium: icono }
    };
    var es = String(filas[i][3] || '').trim();
    if (es) c.nombreEs = es;
    // NUEVO 07-oct-2026 (costo de 200 monedas de héroe en perfil.html): MaxEvolutionLevel del catálogo (columna 5; vacío = solo base, 1 = base + evolución, 2 = base + héroe, 3 = base + evolución + héroe; los Campeones lo traen vacío); solo se agrega si es un número, para que la web distinga "sin dato" de "sin héroe". [→ Contexto_Base_Web.md §37B090]
    var mxEvo = String(filas[i][5] === undefined || filas[i][5] === null ? '' : filas[i][5]).trim();
    if (mxEvo !== '' && !isNaN(Number(mxEvo))) c.maxEvolutionLevel = Number(mxEvo);
    salida.push(c);
  }
  return salida;
}

// _webBadgesCsvPrimero(tag, badgesJson): AVISO 24-sep-2026 (CSV principal, JSON de respaldo); arma rawClash.badges: por cada insignia del jugador en Backup_Insignias_2.csv (1=Tag, 2=Name, 4=Progreso, 5=Nivel) toma level y progress, y con Name+Nivel completa maxLevel, target e iconUrls.large del catálogo Backup_Insignias.csv (1=Name, 3=Nivel, 4=Nivel_max, 5=Objetivo, 6=Ícono); lo que el CSV no trae queda como mande el JSON; las filas con Nivel=0 son relleno y se ignoran (si el JSON trae una insignia que el CSV solo tiene de relleno, queda la del JSON); las que solo están en el JSON pasan tal cual y las que solo están en el CSV se agregan al final; si algún CSV no se puede leer devuelve el JSON sin tocar; OJO: si el CSV es más viejo que el JSON, la web muestra el del CSV (es lo pedido). @param tag, badgesJson; @returns lista de copias (no muta el caché). [→ Contexto_Base_Web.md §37B091]
function _webBadgesCsvPrimero(tag, badgesJson) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return badgesJson;
  var filasJugador = [];
  var catalogo = {};
  try {
    var ins2 = _leerInsignias2CSV().rows;
    for (var i = 0; i < ins2.length; i++) {
      if (cleanTag(ins2[i][1]) !== tagLimpio || !String(ins2[i][2] || '').trim()) continue;
      // Nivel=0 explícito = fila de relleno (el jugador no tiene la insignia, AVISO 1 del 24-sep-2026 en 32_Insignias.gs): no es un dato real y no se muestra. [→ Contexto_Base_Web.md §37B092]
      if (String(ins2[i][5]).trim() !== '' && Number(ins2[i][5]) === 0) continue;
      filasJugador.push(ins2[i]);
    }
    if (!filasJugador.length) return badgesJson;
    var cat = _leerInsigniasCSV().rows;
    for (var c = 0; c < cat.length; c++) {
      var nm = String(cat[c][1] || '').trim();
      var lv = String(cat[c][3] || '').trim();
      if (nm && lv) catalogo[nm + '|' + lv] = cat[c];
    }
  } catch (e) {
    Logger.log('[WebAPI] _webBadgesCsvPrimero: no se pudo leer los CSV de insignias (' + e.message + '); se usa el JSON.');
    return badgesJson;
  }
  var num = function (v) {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    var n = Number(v);
    return isNaN(n) ? null : n;
  };
  var csvPorName = {};
  for (var f = 0; f < filasJugador.length; f++) csvPorName[String(filasJugador[f][2]).trim()] = filasJugador[f];

  var armar = function (baseObj, name, fila) {
    var b = {};
    if (baseObj) { for (var k in baseObj) { if (Object.prototype.hasOwnProperty.call(baseObj, k)) b[k] = baseObj[k]; } }
    b.name = name;
    var nivel = num(fila[5]);
    var prog  = num(fila[4]);
    if (nivel !== null) b.level = nivel;
    if (prog  !== null) b.progress = prog;
    var lvKey = nivel !== null ? String(nivel) : (b.level != null ? String(b.level) : '');
    var fc = lvKey ? catalogo[name + '|' + lvKey] : null;
    if (fc) {
      var mx  = num(fc[4]);
      var obj = num(fc[5]);
      var ico = String(fc[6] || '').trim();
      if (mx  !== null) b.maxLevel = mx;
      if (obj !== null) b.target = obj;
      if (ico) {
        var urls = {};
        var uOld = b.iconUrls || {};
        for (var u in uOld) { if (Object.prototype.hasOwnProperty.call(uOld, u)) urls[u] = uOld[u]; }
        urls.large = ico;
        b.iconUrls = urls;
      }
    }
    return b;
  };

  var salida = [];
  var vistos = {};
  for (var j = 0; j < badgesJson.length; j++) {
    var bj = badgesJson[j];
    var nj = bj && bj.name ? String(bj.name).trim() : '';
    if (nj && csvPorName[nj]) {
      salida.push(armar(bj, nj, csvPorName[nj]));
      vistos[nj] = true;
    } else {
      salida.push(bj);
    }
  }
  for (var f2 = 0; f2 < filasJugador.length; f2++) {
    var nf = String(filasJugador[f2][2]).trim();
    // Una fila del CSV sin Nivel ni Progreso y sin insignia equivalente en el JSON no tiene nada que mostrar: se omite en vez de mandar una insignia solo con nombre. [→ Contexto_Base_Web.md §37B093]
    if (!vistos[nf] && (num(filasJugador[f2][5]) !== null || num(filasJugador[f2][4]) !== null)) {
      salida.push(armar(null, nf, filasJugador[f2]));
      vistos[nf] = true;
    }
  }
  return salida;
}

// _webMapaCards2PorId(tag): AVISO 7 (24-sep-2026); arma { idCarta: { count, level, evo, star } } con las columnas de Backup_Cards_2.csv para UN jugador (0=N°, 1=Tag, 2=ID, 3=Level unificado, 4=EvolutionLevel, 5=Currentdeck, 6=Count, 7=StarLevel); cada campo es null si la celda está vacía (fila anterior a la columna Count) o no es número, para que la web caiga al JSON; las filas con Level vacío o 0 (relleno) no entran; lee el CSV completo una vez (miles de filas), igual que _webMazoActualDesdeCards2() y _webEstadisticasCartas(). @returns mapa, vacío si no hay datos. [→ Contexto_Base_Web.md §37B094]
function _webMapaCards2PorId(tag) {
  var mapa = {};
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return mapa;
  var num = function (v) {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    var n = Number(v);
    return isNaN(n) ? null : n;
  };
  var cards2 = _leerCards2CSV(); // headers: N°,Tag,ID,Level,EvolutionLevel,Currentdeck,Count
  for (var i = 0; i < cards2.rows.length; i++) {
    var row = cards2.rows[i];
    if (cleanTag(row[1]) !== tagLimpio) continue;
    var idC = String(row[2] || '').trim();
    if (!idC) continue;
    var cnt = num(row[6]);
    var lvl = num(row[3]);
    // Level vacío o 0 = fila de relleno (el jugador no tiene esa carta, con Count 0): no es un dato real, no se usa NINGUNO de sus campos y la web queda con lo que diga el JSON. [→ Contexto_Base_Web.md §37B095]
    if (lvl === null || lvl < 1) continue;
    var est = num(row[7]);
    mapa[idC] = {
      count: (cnt !== null && cnt >= 0) ? cnt : null,
      level: lvl,
      evo:   num(row[4]),
      star:  (est !== null && est >= 0) ? est : null
    };
  }
  return mapa;
}

// _webConCards2Csv(obj, cards2PorId): AVISO 7 (24-sep-2026); devuelve una COPIA de la carta con count, level y evolutionLevel de Backup_Cards_2.csv (ver _webMapaCards2PorId()), o el mismo obj si no hay nada que reemplazar (copia en vez de mutar por el caché compartido, igual que _webConNombreEs()); level: el CSV guarda el nivel UNIFICADO (JSON + diferencia de rareza, AVISO 14) y perfil.html parte del crudo y lo convierte con nivelAppAjustado(), así que se resta esa diferencia (_diferenciaNivelRareza(), 31_Cards_Mazos.gs); no se reemplaza si la rareza no tiene diferencia o si el resultado no cae entre 1 y el maxLevel del JSON (el catálogo cambió después de guardar la fila). [→ Contexto_Base_Web.md §37B096]
function _webConCards2Csv(obj, cards2PorId) {
  if (!obj || typeof obj !== 'object' || !cards2PorId) return obj;
  var reg = cards2PorId[String(obj.id)];
  if (!reg) return obj;
  var copia = null;
  var poner = function (campo, valor) {
    if (obj[campo] === valor) return;
    if (!copia) {
      copia = {};
      for (var k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) copia[k] = obj[k];
      }
    }
    copia[campo] = valor;
  };
  if (reg.count !== null) poner('count', reg.count);
  if (reg.evo !== null) poner('evolutionLevel', reg.evo);
  if (reg.star !== null) poner('starLevel', reg.star); // StarLevel (24-sep-2026), índice 7 de Backup_Cards_2.csv
  if (reg.level !== null) {
    var dif = _diferenciaNivelRareza(obj.rarity);
    if (dif !== null) {
      var crudo = reg.level - dif;
      var mx = Number(obj.maxLevel);
      if (crudo >= 1 && (!(mx >= 1) || crudo <= mx)) poner('level', crudo);
    }
  }
  return copia || obj;
}

// _webConCostoSubida(obj, costos): FIX 23-sep-2026 (AVISO 8); devuelve una COPIA de la carta cruda con costoOro y cartasSiguienteNivel (costo de subirla DESDE su nivel actual), o el mismo obj si no hay dato; busca en Backup_Cards_3.csv por (rareza, level crudo), misma numeración del JSON (ver sección E de 31_Cards_Mazos.gs); no agrega nada si no hay level, si ya está al máximo (costos vacíos) o si el CSV no tiene fila para esa rareza/nivel; siempre copia por el caché _DRIVE_CACHE_MEM compartido. @param obj, costos (resultado de _construirCostosPorRareza() o null). [→ Contexto_Base_Web.md §37B097]
function _webConCostoSubida(obj, costos) {
  if (!obj || typeof obj !== 'object' || !costos || !costos.hayDatos) return obj;
  var nivel = Number(obj.level);
  if (!(nivel >= 1)) return obj;
  var c = _costoSubirNivel(costos, obj.rarity, nivel); // 31_Cards_Mazos.gs
  if (!c || c.esMax || c.oro === null || c.cartas === null) return obj;
  var copia = {};
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) copia[k] = obj[k];
  }
  copia.costoOro = c.oro;
  copia.cartasSiguienteNivel = c.cartas;
  // 24-sep-2026: tabla de costos de TODOS los niveles que le faltan a la carta hasta el máximo (para el clic en una carta de perfil.html). [→ Contexto_Base_Web.md §37B098]
  var resto = _webCostosNivelesRestantes(obj, costos, nivel);
  if (resto) {
    copia.costosNiveles = resto.niveles;
    copia.costoTotal = resto.total;
    copia.costoCompleto = resto.completo;
  }
  return copia;
}

// _webCostosNivelesRestantes(obj, costos, nivel): 24-sep-2026; costo de CADA nivel que le falta a una carta hasta el máximo y total acumulado, con Backup_Cards_3.csv (Goldcost/Cardcost = costo de subir DESDE ese nivel, numeración del JSON); niveles: [{desde, hasta, oro, cartas}] en nivel de la app (JSON + diferencia de rareza, AVISO 14); total: {oro, cartas, niveles} solo con niveles con dato; completo: false si a algún nivel del tramo le falta su fila en Cards_3 (entonces total NO lo incluye y la web debe avisarlo); el tramo va hasta el maxLevel del JSON (si no viene, hasta el máximo declarado en Cards_3); devuelve null si no se puede convertir a nivel de la app o no hay tramo. @param obj, costos, nivel (>= 1). [→ Contexto_Base_Web.md §37B099]
function _webCostosNivelesRestantes(obj, costos, nivel) {
  var dif = _diferenciaNivelRareza(obj.rarity); // 31_Cards_Mazos.gs
  if (dif === null) return null;
  var tope = Number(obj.maxLevel);
  if (!(tope > nivel)) {
    var declarado = costos.maxNivel ? costos.maxNivel[String(obj.rarity || '').trim().toLowerCase()] : null;
    tope = Number(declarado);
  }
  if (!(tope > nivel)) return null;
  var niveles = [];
  var oroTotal = 0;
  var cartasTotal = 0;
  var completo = true;
  for (var k = nivel; k < tope; k++) {
    var ck = _costoSubirNivel(costos, obj.rarity, k);
    if (!ck || ck.esMax || ck.oro === null || ck.cartas === null) { completo = false; continue; }
    niveles.push({ desde: k + dif, hasta: k + 1 + dif, oro: ck.oro, cartas: ck.cartas });
    oroTotal += ck.oro;
    cartasTotal += ck.cartas;
  }
  if (!niveles.length) return null;
  return { niveles: niveles, total: { oro: oroTotal, cartas: cartasTotal, niveles: niveles.length }, completo: completo };
}

// _webMapaNombreCartaPorId(): FIX 21-sep-2026 (perfil.html, "PENDIENTE DE BACKEND": las traducciones locales son fallback, no fuente principal); arma una vez el mapa ID -> nombre en español desde Backup_Cards.csv (columna Nombre, índice 3, completada a mano), cruzando por ID (índice 1) y nunca por nombre; solo registra cartas con Nombre no vacío (sin traducción no se copia el inglés, para que perfil.html caiga a su diccionario local cards-es.js); si el CSV no se puede leer devuelve {}. @returns { '26000000': 'Caballero', ... } [→ Contexto_Base_Web.md §37B100]
function _webMapaNombreCartaPorId() {
  var mapa = {};
  try {
    var cards1 = _leerCardsCSV(); // headers: N°,ID,Name,Nombre,Maxlevel,MaxEvolutionLevel,Rarity,Tipo,Elixircost,Carta,Héroe,Evolución
    for (var i = 0; i < cards1.rows.length; i++) {
      var idC = String(cards1.rows[i][1] || '').trim();
      var es  = String(cards1.rows[i][3] || '').trim();
      if (idC && es) mapa[idC] = es;
    }
  } catch (e) {
    Logger.log('[WebAPI] _webMapaNombreCartaPorId: no se pudo leer Backup_Cards.csv (' + e.message + ')');
  }
  return mapa;
}

// _webConNombreEs(obj, mapaNombrePorId): FIX 21-sep-2026; devuelve una COPIA de la carta cruda con nombreEs, o el mismo obj si no hay traducción para su id; nunca reemplaza name; copia en vez de mutar porque _cargarPlayerDesideDrive() deja el JSON en _DRIVE_CACHE_MEM, compartido. [→ Contexto_Base_Web.md §37B101]
function _webConNombreEs(obj, mapaNombrePorId) {
  if (!obj || typeof obj !== 'object' || obj.id == null) return obj;
  var es = mapaNombrePorId[String(obj.id)];
  if (!es) return obj;
  var copia = {};
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) copia[k] = obj[k];
  }
  copia.nombreEs = es;
  return copia;
}

// _webMapaNombreInsigniaPorName(): FIX 21-sep-2026 (perfil.html, "PENDIENTE DE BACKEND"); CORRECCIÓN 23-sep-2026: la versión del 21-sep leía la columna Nombre de Backup_Insignias_2.csv (por Tag + Name), que solo se autocompletaba para "Mastery..." y que el usuario nunca escribe; ahora arma el mapa Name -> nombre en español desde el catálogo Backup_Insignias.csv (N°|Name|Nombre|Nivel|Nivel_max|Objetivo|Ícono) vía _construirMapaNombresCatalogo() (32_Insignias.gs): una fila por nivel, primer Nombre no vacío de cada insignia; ya no depende del Tag; una insignia sin Nombre no entra al mapa (perfil.html muestra el nombre crudo); si el CSV no se puede leer devuelve {}. @returns { 'YearsPlayed': 'Años jugando', ... } [→ Contexto_Base_Web.md §37B102]
function _webMapaNombreInsigniaPorName() {
  var mapa = {};
  try {
    var catalogo = _leerInsigniasCSV(); // headers: N°,Name,Nombre,Nivel,Nivel_max,Objetivo,Ícono
    mapa = _construirMapaNombresCatalogo(catalogo.rows);
  } catch (e) {
    Logger.log('[WebAPI] _webMapaNombreInsigniaPorName: no se pudo leer Backup_Insignias.csv (' + e.message + ')');
  }
  return mapa;
}

// _webMapaNombreInsigniaPorNameYNivel(): FIX 27-sep-2026 (bug reportado: en Insignias de perfil.html el ícono mostraba el nivel correcto pero el nombre quedaba pegado al de nivel 1, p. ej. "1 año jugando" en vez de "9 años jugando"); causa: Backup_Insignias.csv tiene una fila por nivel (Name se repite, Nombre cambia) y _webMapaNombreInsigniaPorName() colapsa a un solo Name -> Nombre (el primer Nombre no vacío, casi siempre el de Nivel=1); esa función no se tocó (la usan updateInsigniasSheet()/_resolverNombreInsignia() de 32_Insignias.gs para heredar la traducción al crear filas nuevas; uso intencional); este mapa distingue por nivel con clave compuesta Name|Nivel para que _webConNombreInsigniaEs() busque la fila exacta de b.level; si una fila no tiene Nivel o Nombre no entra. @returns { 'YearsPlayed|9': '9 años jugando', ... } [→ Contexto_Base_Web.md §37B103]
function _webMapaNombreInsigniaPorNameYNivel() {
  var mapa = {};
  try {
    var catalogo = _leerInsigniasCSV(); // headers: N°,Name,Nombre,Nivel,Nivel_max,Objetivo,Ícono
    var rows = catalogo.rows;
    for (var i = 0; i < rows.length; i++) {
      var nm    = String(rows[i][1] || '').trim(); // Name
      var es    = String(rows[i][2] || '').trim(); // Nombre
      var nivel = String(rows[i][3] || '').trim(); // Nivel
      if (nm && es && nivel) mapa[nm + '|' + nivel] = es;
    }
  } catch (e) {
    Logger.log('[WebAPI] _webMapaNombreInsigniaPorNameYNivel: no se pudo leer Backup_Insignias.csv (' + e.message + ')');
  }
  return mapa;
}

// _webConNombreInsigniaEs(b, mapaNombrePorName, mapaNombrePorNameYNivel): FIX 21-sep-2026; igual que _webConNombreEs() pero para insignias (se identifican por name, no por id); devuelve una COPIA con nombreEs o el mismo b si no hay traducción; nunca reemplaza name ni muta el original; FIX 27-sep-2026: busca primero por Name+Nivel exacto y solo si esa fila no tiene traducción (o la insignia no trae b.level) cae al mapa genérico por Name; mapaNombrePorNameYNivel es opcional (sin él el comportamiento es el de antes del 27-sep-2026). [→ Contexto_Base_Web.md §37B104]
function _webConNombreInsigniaEs(b, mapaNombrePorName, mapaNombrePorNameYNivel) {
  if (!b || typeof b !== 'object' || !b.name) return b;
  var es = null;
  if (mapaNombrePorNameYNivel && b.level != null) {
    es = mapaNombrePorNameYNivel[String(b.name) + '|' + String(b.level)] || null;
  }
  if (!es) es = mapaNombrePorName[String(b.name)];
  if (!es) return b;
  var copia = {};
  for (var k in b) {
    if (Object.prototype.hasOwnProperty.call(b, k)) copia[k] = b[k];
  }
  copia.nombreEs = es;
  return copia;
}

// _calcAtaquesMaxSemana(periodIndex): FIX 05-sep-2026 (Cara a cara: mostrar "/tope" junto a los ataques; ej. jueves 4/4, viernes 4/8, sábado 4/12, domingo 4/16); calcula el tope de ataques esperado a esta altura de la semana de guerra (4 por cada día de guerra ya transcurrido, incluyendo hoy) con el mismo criterio de esDiaGuerraIdx()/periodIdxToLetra() (01_Config_Global.gs) según periodIndex%7, sin recalcular por la fecha del calendario; CFG.DIA_LETRAS = ['L','M','X','J','V','S','D'], días de guerra J/V/S/D (índices 3-6, periodIndex%7 >= 3), número de día de guerra = (periodIndex%7) - 2 y tope = ese número x 4; en día de entrenamiento (L/M/X) devuelve 0 y el frontend no agrega "/tope" (extItemAtaques(), jugadores.html). @returns {number} [→ Contexto_Base_Web.md §37B105]
function _calcAtaquesMaxSemana(periodIndex) {
  if (!esDiaGuerraIdx(periodIndex)) return 0;
  var diaGuerraNum = (Number(periodIndex) % 7) - 2; // J=1, V=2, S=3, D=4
  return diaGuerraNum * 4;
}

// _webCartaAlTope(nivelApp, maxLevelJson, rarity, topeApp): FIX 23-sep-2026 (AVISO 15, punto 3); dice si una carta está en su nivel máximo sin escribir ningún 16 a mano; es la comparación level >= maxLevel del JSON que hace pintarColeccion() (perfil.html), calculada desde Backup_Cards_2.csv.Level (nivel del JSON + diferencia de rareza) y Backup_Cards.csv.Maxlevel (numeración del JSON): nivelApp >= maxLevelJson + diferencia <=> level >= maxLevel; si la rareza no está en el catálogo (AVISO 14) o el catálogo no trae Maxlevel para esa carta usa de respaldo topeApp (nivel máximo absoluto de _mapaDiferenciaNivelPorRareza(), 31_Cards_Mazos.gs). @param nivelApp (0 = no desbloqueada), maxLevelJson, rarity, topeApp (0 si no se pudo calcular); @returns {boolean} [→ Contexto_Base_Web.md §37B106]
function _webCartaAlTope(nivelApp, maxLevelJson, rarity, topeApp) {
  if (!(nivelApp > 0)) return false;
  var diff = _diferenciaNivelRareza(rarity); // 31_Cards_Mazos.gs
  if (diff !== null && maxLevelJson !== null && maxLevelJson >= 1) {
    return nivelApp >= maxLevelJson + diff;
  }
  return topeApp > 0 && nivelApp >= topeApp;
}

// _webMazoActualDesdeCards2(tag): FASE 10 (06-sep-2026, punto 10 del documento: mazo actual real); los botones "Sugerencias de mazo" de perfil.html (ext.deck/ext.deck2, generarUrlMazo()/generarUrlMazo2() de 31_Cards_Mazos.gs) arman una búsqueda en RoyaleAPI y nunca fueron el mazo puesto (se renombraron el 04-sep-2026 para dejarlo claro); esta función expone el mazo real: lee la marca Currentdeck='Sí' por (Tag, CardId) que 31_Cards_Mazos.gs persistió en Backup_Cards_2.csv desde pd.currentDeck (updateCards2Sheet()), sin llamar a la API en vivo, y la cruza con Backup_Cards.csv (Nombre en español e ícono), misma fuente que _webEstadisticasCartas(); FIX 23-sep-2026 (AVISO 15, punto 3): nivel es el nivel unificado de la app (Backup_Cards_2.csv.Level = JSON + diferencia de rareza, _nivelUnificadoDeCarta()), no el "normalizado 1-14 (16-Maxlevel+Level)" de la fórmula vieja (AVISO 11), y cada carta trae alTope (boolean) para el borde dorado y ocultar el "×N" en renderMazoActual() sin comparar con 16 (ver _webCartaAlTope()). @param tag; @returns {?{cartas:[{id,name,rarity,tipo,elixirCost,icon,nivel,alTope,evoLevel,hasEvolution,evolutionIcon,hasHero,heroIcon}], elixirPromedio}} o null si el jugador no tiene filas con Currentdeck='Sí' (el frontend no muestra la sección). [→ Contexto_Base_Web.md §37B107]
function _webMazoActualDesdeCards2(tag) {
  var tagClean = cleanTag(tag);
  if (!tagClean) return null;

  var cards2 = _leerCards2CSV(); // headers: N°,Tag,ID,Level,EvolutionLevel,Currentdeck,Count
  var filasDeck = [];
  for (var i = 0; i < cards2.rows.length; i++) {
    var row = cards2.rows[i];
    if (cleanTag(row[1]) !== tagClean) continue;
    if (String(row[5] || '').trim() !== 'Sí') continue;
    // FIX 24-sep-2026: la tropa de torre equipada también trae Currentdeck='Sí' pero no es una de las 8 cartas del mazo (sale aparte por currentDeckSupportCards); ver _esCartaTorre(), 31_Cards_Mazos.gs. [→ Contexto_Base_Web.md §37B108]
    if (_esCartaTorre(row[2])) continue;
    filasDeck.push(row);
  }
  if (!filasDeck.length) return null;

  // Catálogo ID -> nombre/rareza/coste/ícono, con el mismo parseo de columnas que _webEstadisticasCartas() para que las dos secciones no queden desalineadas si el CSV cambia de formato. [→ Contexto_Base_Web.md §37B109]
  var cards1 = _leerCardsCSV(); // headers: N°,ID,Name,Nombre,Maxlevel,MaxEvolutionLevel,Rarity,Tipo,Elixircost,Carta,Héroe,Evolución
  var infoPorId = {};
  for (var c = 0; c < cards1.rows.length; c++) {
    var idCat = String(cards1.rows[c][1] || '').trim();
    if (!idCat) continue;
    infoPorId[idCat] = {
      name:          String(cards1.rows[c][3] || cards1.rows[c][2] || ('Carta ' + idCat)),
      // FIX 23-sep-2026 (AVISO 15, punto 3): Maxlevel del catálogo (numeración del JSON de /players) para calcular alTope (ver _webCartaAlTope()). [→ Contexto_Base_Web.md §37B110]
      maxLevel:      (cards1.rows[c][4] !== '' && cards1.rows[c][4] !== null && cards1.rows[c][4] !== undefined && Number(cards1.rows[c][4]) >= 1) ? Number(cards1.rows[c][4]) : null,
      rarity:        String(cards1.rows[c][6] || ''),
      tipo:          String(cards1.rows[c][7] || ''),
      elixirCost:    cards1.rows[c][8] !== '' ? Number(cards1.rows[c][8]) : null,
      icon:          String(cards1.rows[c][9] || ''),
      heroIcon:      String(cards1.rows[c][10] || ''),
      evolutionIcon: String(cards1.rows[c][11] || '')
    };
  }

  // Tope de la app según el catálogo: nivel máximo absoluto (mayor Maxlevel de todas las rarezas), solo respaldo de _webCartaAlTope() para una carta sin Maxlevel; AVISO 14 (4ta tanda, 23-sep-2026): ahora es la misma fuente que _mapaDiferenciaNivelPorRareza() de 31_Cards_Mazos.gs (memoizado por ejecución) en vez de recalcularse a mano. [→ Contexto_Base_Web.md §37B111]
  var topeApp = _mapaDiferenciaNivelPorRareza().absoluto;

  var cartas = filasDeck.map(function (row) {
    var idCarta = String(row[2] || '').trim();
    var info = infoPorId[idCarta] || { name: 'Carta ' + idCarta, rarity: '', tipo: '', elixirCost: null, icon: '', heroIcon: '', evolutionIcon: '', maxLevel: null };
    var nivelCarta = Number(row[3]) || 0;
    var evoLevelCelda = row[4];
    return {
      id:            idCarta,
      name:          info.name,
      rarity:        info.rarity,
      tipo:          info.tipo,
      elixirCost:    info.elixirCost,
      icon:          info.icon,
      // Nivel unificado de la app (Backup_Cards_2.csv.Level = nivel del JSON + diferencia fija de la rareza, _nivelUnificadoDeCarta() en 31_Cards_Mazos.gs); hoy llega a 16 pero no se compara con 16 a mano. [→ Contexto_Base_Web.md §37B112]
      nivel:         nivelCarta,
      // FIX 23-sep-2026 (AVISO 15, punto 3): true si está en su nivel máximo (borde dorado y sin "×N" en perfil.html); ver _webCartaAlTope(). [→ Contexto_Base_Web.md §37B113]
      alTope:        _webCartaAlTope(nivelCarta, info.maxLevel, info.rarity, topeApp),
      evoLevel:      (evoLevelCelda !== '' && evoLevelCelda !== null && evoLevelCelda !== undefined) ? Number(evoLevelCelda) : 0,
      // FIX 07-oct-2026 (escala de EvolutionLevel): 1 = solo evolución, 2 = solo héroe, 3 = evolución y héroe; antes era "> 0" y contaba "solo héroe" (2) como evolución; evolución desbloqueada = 1 o 3. [→ Contexto_Base_Web.md §37B114]
      hasEvolution:  (evoLevelCelda !== '' && evoLevelCelda !== null && evoLevelCelda !== undefined) && (Number(evoLevelCelda) === 1 || Number(evoLevelCelda) === 3),
      evolutionIcon: info.evolutionIcon || null,
      // FIX 09-sep-2026 (perfil.html, renderMazoActual()): hasHero/heroIcon nunca llegaban a la respuesta final aunque info ya los traía de Backup_Cards.csv (evolutionIcon sí se mandaba); hasHero es "la carta TIENE variante Héroe en el catálogo" (como en _webEstadisticasCartas()), no si el jugador la desbloqueó (a diferencia de hasEvolution, que depende de evoLevel): el Héroe de un Campeón no tiene nivel de desbloqueo separado en Cards_2, así que se resuelve solo con el catálogo. [→ Contexto_Base_Web.md §37B115]
      hasHero:       !!info.heroIcon,
      heroIcon:      info.heroIcon || null
    };
  });

  // Orden por coste de elixir ascendente (empate: alfabético), criterio visual habitual de un mazo; currentDeck no trae un orden oficial que valga la pena conservar. [→ Contexto_Base_Web.md §37B116]
  cartas.sort(function (a, b) {
    var costA = (a.elixirCost === null) ? 99 : a.elixirCost;
    var costB = (b.elixirCost === null) ? 99 : b.elixirCost;
    if (costA !== costB) return costA - costB;
    return a.name.localeCompare(b.name);
  });

  var sumaCostos = 0, cartasConCosto = 0;
  cartas.forEach(function (c) {
    if (c.elixirCost !== null) { sumaCostos += c.elixirCost; cartasConCosto++; }
  });
  var elixirPromedio = cartasConCosto ? Math.round((sumaCostos / cartasConCosto) * 10) / 10 : null;

  return { cartas: cartas, elixirPromedio: elixirPromedio };
}

// _webPerfilJugador(tagBuscado, opciones): perfil público de un jugador: identidad + stats de guerra de la semana actual + progreso vs requisitos de ascenso/descenso de su clan + extendido (FASE 1.5, ver _webPerfilExtendido()); NO incluye celular ni datos de contacto (exclusivo del endpoint CONTACTOS_TOKEN). FASE 10 (06-sep-2026): incluye mazoActual (mazo real equipado, distinto de las Sugerencias de mazo ext.deck/ext.deck2). FIX 09-sep-2026: un Tag sin fila en Directorio se delega a _webPerfilJugadorSinRegistro() (perfil público de Supercell) en vez de devolver error (los comentarios de admin.html y _webAdminBuscarMiembroSugerencias() ya lo daban por hecho). FIX 23-sep-2026: jugador.guerraSemanaDias = {dias:string[4], ataques, puntaje, puntajeAcumulado, barcos (arrays de 4 con number|null)} | null, desglose diario J/V/S/D de la semana en curso (guerraSemana trae solo el acumulado). CAMBIO 28-sep-2026 (Fase 5b tanda A/A2): 2.º parámetro opcional opciones = {esAdmin}; sin esAdmin una cuenta de la hoja Inactivos o con Estado 'Inactivo' en Directorio responde como un Tag sin registro ('Sin registro con nosotros'); con esAdmin:true sale con estado 'Inactivo'. @param tagBuscado, opciones; @returns {{ok, error?, jugador?}} [→ Contexto_Base_Web.md §37B117]
function _webPerfilJugador(tagBuscado, opciones) {
  var hallazgo = _webBuscarFilaDirectorioPorTagConOrigen(tagBuscado);
  var fila = hallazgo ? hallazgo.fila : null;
  if (!fila) return _webPerfilJugadorSinRegistro(tagBuscado);
  // CAMBIO 28-sep-2026 (Fase 5b tanda A, decisión del usuario): una cuenta de la hoja Inactivos solo se ve como "Inactivo" con sesión de admin (opciones.esAdmin, ver doGet en 38_Web_Endpoints.gs); para el resto sale igual que un Tag sin registro. Ver AVISOS ABIERTOS (A1 a A4) al inicio del archivo. [→ Contexto_Base_Web.md §37B118]
  var esAdminPerfil = !!(opciones && opciones.esAdmin);
  // CAMBIO 28-sep-2026 (Fase 5b tanda A2, "todos los inactivos se ocultan para los no admin"): además de la hoja Inactivos se oculta cualquier fila con Estado 'Inactivo' (administradores inactivos, que viven en Directorio; ver _webAdminCuentasInactivas()), con el mismo criterio de texto (Estado con trim) y sin distinguir mayúsculas. [→ Contexto_Base_Web.md §37B119]
  var esInactivoPerfil = hallazgo.origen === 'inactivos'
    || String(fila[DC.ESTADO - 1] || '').trim().toLowerCase() === 'inactivo';
  if (esInactivoPerfil && !esAdminPerfil) {
    return _webPerfilJugadorSinRegistro(tagBuscado, { sinDatosDrive: true });
  }

  var tag         = String(fila[DC.TAG      - 1] || '');
  var nombre      = String(fila[DC.NOMBRE   - 1] || '');
  var clanNombre  = String(fila[DC.CLAN     - 1] || '');
  var rango       = String(fila[DC.RANGO    - 1] || '');
  var vGuerra     = Number(fila[DC.V_GUERRA - 1]) || 0;
  var torneos     = Number(fila[DC.TORNEOS  - 1]) || 0;
  var copas       = Number(fila[DC.COPAS    - 1]) || 0;
  var estado      = String(fila[DC.ESTADO   - 1] || '');

  // ---- Ataques de la semana en curso + historial de Ranking en el clan, ambos desde la hoja Guerra (una sola pasada) ----; FIX 04-sep-2026 (Ranking del clan de perfil.html): la gráfica esperaba ext.historialRanking = [{semana, ranking}, ...] y el backend solo mandaba ext.rankingClan (el actual); GC.RANKING existe fila por fila en Guerra (un valor por Tag y día, GUERRA_HEADERS en 17_GuerraSheet.gs) y como la hoja solo retiene la TEMPORADA ACTUAL (el resto se purga a Backup_Guerra.csv, _purgarTemporadasAnterioresGuerra()), el historial cubre los días ya jugados de la temporada en curso; ampliarlo a varias temporadas requeriría leer Backup_Guerra.csv y no vale la pena para una vista rápida. FIX 15-sep-2026 (barrido web->CSV): la lectura pasa por _obtenerFilasConFallbackCSV() (01_Config_Global.gs), mismo helper y Backup_Guerra.csv que _construirIngresosRecientesUnificado()/_webAportesRecientes(), para caer al respaldo si la hoja Guerra no está disponible; sigue sin ampliarse a varias temporadas porque el CSV normalmente contiene la misma temporada actual. [→ Contexto_Base_Web.md §37B120]
  var ctx = _getCtx();
  var ataquesSemana = 0, fameSemana = 0, barcosSemana = 0;
  var historialRanking = [];
  var diasGuerraSemana = {}; // 19-sep-2026: { offsetDia(0-3): {pIdx, clan} } de la semana en curso, para los exentos
  // FIX 23-sep-2026 (perfil.html, minigráficos "Ataques de la semana" y "Fame de la semana", eje X J/V/S/D): { offsetDia(0-3): {ataques, puntaje, barcos} } de la semana en curso, valor de CADA día suelto (no el acumulado ataquesSemana/fameSemana/barcosSemana); 'ataques' sale de GC.ATAQUES_HOY (GC.ATAQUES_SEM es acumulado); 'puntaje' (Fame) y 'barcos' de GC.FAME/GC.BARCOS, que fila por fila ya son el valor ganado ESE día (confirmado en guerra.html "Valores diarios", "Sem 1 Puntaje trae 500 400 700 600", y en _webHistorialGuerraComparador()); mismo filtro "esta semana" (ctx.temporada + ctx.sectionIndex) que diasGuerraSemana, por lo que el dato se ve congelado de lunes a miércoles hasta que empiece la guerra del jueves y ctx.sectionIndex avance. [→ Contexto_Base_Web.md §37B121]
  var guerraSemanaDiasVals = {};
  var ss = _getSs();
  var tz = Session.getScriptTimeZone() || 'America/Lima';
  var lecturaGuerraPerfil = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.GUERRA, 'Backup_Guerra.csv', GUERRA_TOTAL_COLS);
  var dataGuerra = lecturaGuerraPerfil.filas;
  if (dataGuerra.length) {
    for (var i = 0; i < dataGuerra.length; i++) {
      if (cleanTag(dataGuerra[i][GC.TAG - 1]) !== cleanTag(tag)) continue;

      // Ranking de ESE día puntual si la fila trae uno (0/vacío = sin dato, ej. día de entrenamiento); "semana" en formato fecha real dd/MM/yyyy como historialSemanal en otros endpoints (ver _webIngresosRecientes()), para que el orden alfabético del frontend (renderRankingChart(), perfil.html) coincida con el cronológico dentro de la temporada. [→ Contexto_Base_Web.md §37B122]
      var rankingDia = Number(dataGuerra[i][GC.RANKING - 1]) || 0;
      if (rankingDia > 0) {
        var fechaDia = dataGuerra[i][GC.FECHA - 1];
        var semanaTxt = (fechaDia instanceof Date && !isNaN(fechaDia.getTime()))
          ? Utilities.formatDate(fechaDia, tz, 'dd/MM/yyyy')
          : String(fechaDia || '');
        // FIX 09-sep-2026 (perfil.html, renderMetricaSemanal()/renderMetricasSemanales(): "solo se está mostrando evolución de ranking, falta ataques, puntaje y barcos"): el frontend ya esperaba 'ataques', 'puntaje' y 'barcos' en cada entrada de historialRanking (oculta la tarjeta si no llegan); se agregan con la misma fila/día que 'ranking' (GC.ATAQUES_SEM/GC.FAME/GC.BARCOS, point-in-time de ese día en vez de filtrados al periodIndex actual); 'puntaje' = Fame; un día de entrenamiento sin fila de guerra queda sin entrada (no se inventa un 0). [→ Contexto_Base_Web.md §37B123]
        historialRanking.push({
          semana:  semanaTxt,
          ranking: rankingDia,
          ataques: Number(dataGuerra[i][GC.ATAQUES_SEM - 1]) || 0,
          puntaje: Number(dataGuerra[i][GC.FAME - 1]) || 0,
          barcos:  Number(dataGuerra[i][GC.BARCOS - 1]) || 0
        });
      }

      // 19-sep-2026: se anotan los días de guerra de ESTA semana (temporada real + Semana en curso) para calcular más abajo los ataques exonerados por día opcional; mismo criterio que _getAtaquesYExentosSemanaActualPorTag() (28_Torneos_Docs.gs): un día es opcional cuando el clan ya había cruzado la meta al empezar ese día (_clanYaCruzoMetaEnPeriodo(), 22_ControlCalendario.gs). [→ Contexto_Base_Web.md §37B124]
      var pIdxFilaGuerra = Number(dataGuerra[i][GC.PERIOD_IDX - 1]) || 0;
      if (String(dataGuerra[i][GC.TEMPORADA - 1]) === String(ctx.temporada) &&
          ((Number(dataGuerra[i][GC.SEMANA - 1]) || 1) - 1) === ctx.sectionIndex &&
          esDiaGuerraIdx(pIdxFilaGuerra)) {
        var offsetDiaGuerraSem = (pIdxFilaGuerra % 7) - 3;
        diasGuerraSemana[offsetDiaGuerraSem] = {
          pIdx: pIdxFilaGuerra,
          clan: String(dataGuerra[i][GC.CLAN - 1] || '')
        };
        // FIX 23-sep-2026: ataques/fame/barcos DE ESE día puntual (ver guerraSemanaDiasVals más arriba); no confundir con ataquesSemana/fameSemana/barcosSemana, el acumulado de toda la semana hasta HOY. [→ Contexto_Base_Web.md §37B125]
        guerraSemanaDiasVals[offsetDiaGuerraSem] = {
          ataques: Number(dataGuerra[i][GC.ATAQUES_HOY - 1]) || 0,
          puntaje: Number(dataGuerra[i][GC.FAME        - 1]) || 0,
          barcos:  Number(dataGuerra[i][GC.BARCOS      - 1]) || 0
        };
      }

      if (Number(dataGuerra[i][GC.PERIOD_IDX - 1]) !== ctx.periodIndex) continue;
      // ATAQUES_SEM ya viene acumulado por el proceso de guerra (17_GuerraSheet.gs): se toma tal cual, sin volver a sumar por día. [→ Contexto_Base_Web.md §37B126]
      ataquesSemana = Number(dataGuerra[i][GC.ATAQUES_SEM - 1]) || 0;
      fameSemana    = Number(dataGuerra[i][GC.FAME        - 1]) || 0;
      barcosSemana  = Number(dataGuerra[i][GC.BARCOS      - 1]) || 0;
    }
  }

  // 19-sep-2026: ataques exonerados de ESTA semana = 4 por cada día opcional (el clan ya había cruzado la meta al empezar ese día); bajan lo EXIGIDO en _webProgresoRequisitos(); lo que hizo el jugador no se infla (12 ataques siguen siendo 12: se muestra 12/12, no 16/16); un día sin fila del jugador en Guerra no cuenta. [→ Contexto_Base_Web.md §37B127]
  var ataquesExentos = 0;
  for (var offDiaGuerra in diasGuerraSemana) {
    var diaGuerraSem = diasGuerraSemana[offDiaGuerra];
    if (_clanYaCruzoMetaEnPeriodo(diaGuerraSem.clan, diaGuerraSem.pIdx, String(ctx.temporada), true)) ataquesExentos += 4;
  }

  // FIX 27-sep-2026 (AVISO 9 RESUELTO, confirmado por el usuario): DC.V_GUERRA es "Victorias de guerra" (conteo de batallas ganadas), no trofeos/fame; la barra "Trofeos guerra" de Requisitos compara fameSemana (de GC.FAME, trofeo real de guerra acumulado hasta hoy en la semana en curso) en vez de vGuerra; ver AVISO 9 (37B056). [→ Contexto_Base_Web.md §37B128]
  var progreso = _webProgresoRequisitos(clanNombre, ataquesSemana, fameSemana, torneos, ataquesExentos);
  var extendido = _webPerfilExtendido(fila);
  if (historialRanking.length) extendido.historialRanking = historialRanking;

  // FIX 23-sep-2026 (perfil.html, minigráficos de ataques y Fame): arma guerraSemanaDias desde guerraSemanaDiasVals; null en un día = todavía no jugado (entrenamiento o día de guerra futuro de esta semana), el frontend lo pinta como hueco, no como 0; 'puntajeAcumulado' es la segunda serie pedida para el gráfico de Fame ("diario y acumulado semanal"): suma corriente de 'puntaje'; un día sin dato repite el acumulado del último día con dato (línea plana) y si ningún día anterior tuvo dato queda null. [→ Contexto_Base_Web.md §37B129]
  var DIAS_GUERRA_PERFIL = ['Jueves', 'Viernes', 'Sábado', 'Domingo'];
  var guerraSemanaDias = null;
  if (Object.keys(guerraSemanaDiasVals).length) {
    var acumFamePerfil = 0, huboFamePerfil = false;
    var puntajeAcumuladoPerfil = [0, 1, 2, 3].map(function (d) {
      var vDia = guerraSemanaDiasVals[d];
      if (vDia) { acumFamePerfil += vDia.puntaje; huboFamePerfil = true; }
      return huboFamePerfil ? acumFamePerfil : null;
    });
    guerraSemanaDias = {
      dias:             DIAS_GUERRA_PERFIL,
      ataques:          [0, 1, 2, 3].map(function (d) { return guerraSemanaDiasVals[d] ? guerraSemanaDiasVals[d].ataques : null; }),
      puntaje:          [0, 1, 2, 3].map(function (d) { return guerraSemanaDiasVals[d] ? guerraSemanaDiasVals[d].puntaje : null; }),
      puntajeAcumulado: puntajeAcumuladoPerfil,
      barcos:           [0, 1, 2, 3].map(function (d) { return guerraSemanaDiasVals[d] ? guerraSemanaDiasVals[d].barcos : null; })
    };
  }

  return {
    ok: true,
    jugador: {
      tag: tag, nombre: nombre, clan: clanNombre, rango: rango, estado: estado,
      vGuerra: vGuerra, torneos: torneos, copas: copas,
      // FIX 03-sep-2026 ("Vigencia [última conexión] debe mostrarse también en el perfil"): mismo criterio que el fix gemelo en _webRosterCalcular/_construirIngresosRecientesUnificado; la columna ya existía en Directorio (DC.VIGENCIA), solo faltaba exponerla. [→ Contexto_Base_Web.md §37B130]
      vigencia: fila[DC.VIGENCIA - 1] || '',
      // FIX 05-sep-2026 (Cara a cara, ver _calcAtaquesMaxSemana()): ataquesMax es el tope esperado de ataques a estas alturas de la semana de guerra (0 en día de entrenamiento, sin tope que mostrar). [→ Contexto_Base_Web.md §37B131]
      guerraSemana: { ataques: ataquesSemana, fame: fameSemana, barcos: barcosSemana, ataquesMax: _calcAtaquesMaxSemana(ctx.periodIndex) },
      // FIX 23-sep-2026: desglose diario J/V/S/D para los dos minigráficos nuevos de perfil.html (ver su construcción más arriba); null si esta semana todavía no tiene ningún día de guerra jugado (p. ej. entrenamiento del lunes), el frontend oculta esos cuadritos. [→ Contexto_Base_Web.md §37B132]
      guerraSemanaDias: guerraSemanaDias,
      progreso: progreso,
      extendido: extendido,
      // FASE 10 (06-sep-2026): null si todavía no hay datos de Cards_2 para este Tag; ver docblock de _webMazoActualDesdeCards2(). [→ Contexto_Base_Web.md §37B133]
      mazoActual: _webMazoActualDesdeCards2(tag)
    }
  };
}

// _webApiGetRapido(path): FIX 09-sep-2026 ("pedir su perfil al endpoint players, que sí funciona"): la ruta armada era correcta (clash-royale-proxy-2eyr.onrender.com/players/%23<TAG>, probada a mano); el error "Unexpected token '<', "<!DOCTYPE"..." venía de que _apiGet() (09_API_ClashRoyale.gs) reintenta hasta 3 veces con espera creciente (API_GET_MAX_INTENTOS/API_GET_ESPERA_BASE_MS, 07_...gs: 3 s, luego 6 s), pensado para procesos batch; el proxy (plan gratuito de Render) se duerme tras ~15 min sin tráfico y puede tardar 30-60 s en despertar, así que la suma de intentos y esperas puede superar el límite de respuesta de la URL /exec de la Web App (más corto que la cuota de 6 min del script); Google corta la conexión y devuelve su propia página HTML de error (el try/catch de doGet(), 11_...gs, ni llega a correr); por eso este helper, usado SOLO por los 2 endpoints interactivos de esta sección (_webPerfilJugadorSinRegistro() y _webAdminVerificarTag()), hace UN solo intento, sin reintentos ni esperas: si el proxy está dormido falla rápido y el admin ve el mensaje de error normal. @param path (ej. '/players/%23ABCD1234'); @returns objeto JSON parseado o null ante cualquier error. [→ Contexto_Base_Web.md §37B134]
function _webApiGetRapido(path) {
  try {
    var resp = UrlFetchApp.fetch(CFG.API_BASE + path, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { 'Accept': 'application/json' }
    });
    if (resp.getResponseCode() !== 200) return null;
    return JSON.parse(resp.getContentText());
  } catch (e) {
    Logger.log('[WebApiGetRapido] Falló ' + path + ': ' + e.message);
    return null;
  }
}

// _webPerfilJugadorSinRegistro(tagBuscado, opciones): FIX 09-sep-2026 (ver docblock de _webPerfilJugador()): a donde cae _webPerfilJugador() cuando el Tag no tiene fila en Directorio; consulta el perfil PÚBLICO de Supercell (mismo proxy que _webAdminVerificarTag()) para mostrar al menos nombre/clan de cualquier jugador; a propósito sin respaldo de RoyaleAPI (tampoco lo tiene ya _webAdminVerificarTag()): RoyaleAPI bloquea (Cloudflare) las llamadas server-side de Apps Script y solo se puede leer vía el script de Tampermonkey (navegador), ver Tampermonkey.md, y agregarlo sumaba segundos sin posibilidad real de encontrar nada; FIX 09-sep-2026 (mismo día): usaba _apiGet() (3 reintentos), lo que disparaba el error "<!DOCTYPE..." con el proxy dormido, ahora usa _webApiGetRapido() (un solo intento); todo lo que depende de datos internos (guerra, torneos, ascensos, mazo) vuelve en 0/null y renderMiembro() (admin.html) ya lo muestra vacío; sinRegistro:true deja distinguir este caso (hoy el frontend no lo usa). CAMBIO 28-sep-2026 (Fase 5b tanda A): 2.º parámetro opcional opciones = {sinDatosDrive}; si es true no se adjunta extendido.rawClash (lo usa _webPerfilJugador() para las cuentas de Inactivos que ve un no-admin). @param tagBuscado, opciones; @returns {{ok, error?, jugador?}} [→ Contexto_Base_Web.md §37B135]
function _webPerfilJugadorSinRegistro(tagBuscado, opciones) {
  var tagNorm = cleanTag(tagBuscado);
  if (!tagNorm) return { ok: false, error: 'Ingresa un Tag.' };

  var nombrePublico = null, clanPublico = '';

  // Única fuente: proxy de Supercell, un solo intento (ver _webApiGetRapido()). [→ Contexto_Base_Web.md §37B136]
  var datosApi = _webApiGetRapido('/players/' + encodeTag('#' + tagNorm));
  if (datosApi && datosApi.name) {
    nombrePublico = datosApi.name;
    clanPublico = (datosApi.clan && datosApi.clan.name) || '';
  }

  if (!nombrePublico) {
    return { ok: false, error: 'No encontré ese Tag ni en el Directorio ni en la API de Clash Royale. Verifica que esté bien escrito (incluyendo mayúsculas/minúsculas y los caracteres tras el #), o vuelve a intentar en unos segundos si el proxy se estaba reactivando.' };
  }

  // CONEXIÓN 11-sep-2026: mismo dato de Drive que recibe el flujo con Directorio (ver _webDatosDriveJugador() y su llamada en _webPerfilExtendido()); un jugador sin fila en Directorio igual puede tener snapshot guardado si alguna vez se le consultó /players. FIX 15-sep-2026: mismo renombre .drive -> .rawClash que en _webPerfilExtendido(). [→ Contexto_Base_Web.md §37B137]
  var extendidoSinRegistro = {};
  // CAMBIO 28-sep-2026 (Fase 5b tanda A): con opciones.sinDatosDrive (cuenta de Inactivos vista por un no-admin, ver _webPerfilJugador()) no se adjunta el snapshot de Drive, para que la respuesta no delate que la cuenta tuvo historial con la Familia. [→ Contexto_Base_Web.md §37B138]
  var datosDriveSinRegistro = (opciones && opciones.sinDatosDrive) ? null : _webDatosDriveJugador(tagNorm);
  if (datosDriveSinRegistro) extendidoSinRegistro.rawClash = datosDriveSinRegistro;

  return {
    ok: true,
    jugador: {
      tag: '#' + tagNorm, nombre: nombrePublico, clan: clanPublico, rango: '',
      estado: 'Sin registro con nosotros', vGuerra: 0, torneos: 0, copas: 0,
      vigencia: '',
      guerraSemana: { ataques: 0, fame: 0, barcos: 0, ataquesMax: 0 },
      // FIX 23-sep-2026: mismo campo nuevo que _webPerfilJugador() (guerraSemanaDias, ver ese docblock); acá null porque un Tag sin registro en Directorio nunca tiene filas propias en Guerra. [→ Contexto_Base_Web.md §37B139]
      guerraSemanaDias: null,
      progreso: { ascensos: null, descensos: null },
      extendido: extendidoSinRegistro,
      mazoActual: null,
      sinRegistro: true
    }
  };
}

// _webClanInfo(): FASE 0 (24-ago-2026): index.html tenía las 4 tarjetas de clanes hardcodeadas; reutiliza la MISMA hoja Clan y el MISMO cálculo de mínimo de trofeos de guerra semanal (_getMinGClanMaps(), 10_ClanSheet.gs) que _respuestaInfoClanPorTag() (44_BotWhatsApp.gs), para que la web nunca muestre un número de clan distinto al del bot; IMPORTANTE: recorre CFG.TERNA_TAGS (no ordena por nombre) para respetar el orden de la columna Orden de la hoja Clan (Grupo Terna, Terna 2, Terna 3, Mini Ternas), nunca alfabético; solo devuelve los 4 clanes Terna públicos: el clan vetado (CFG.VETADO_TAG) queda fuera a propósito; FIX 30-ago-2026 (lentitud del portal): cacheada 60 s vía _webCacheado() (ver _webRoster()); la función original quedó renombrada _webClanInfoCalcular(). @returns {{clanes: Array<Object>}} [→ Contexto_Base_Web.md §37B140]
function _webClanInfo() {
  return _webCacheado('web_clan_info_v1', 60, _webClanInfoCalcular);
}

function _webClanInfoCalcular() {
  var ss = _getSs();
  // FASE 15-sep-2026 (fallback web->CSV): antes, si la hoja Clan no estaba disponible o vacía devolvía { clanes: [] }; ahora _obtenerFilasConFallbackCSV() (01_Config_Global.gs) redirige a Backup_Clan.csv, que tiene las columnas en el mismo orden que CC (syncClanCSV(), 05_Backup_CSV.gs) y ya trae las URLs REALES de RoyaleAPI/CWStats (usa _extraerValoresConLinksReales(), que lee RichText), por lo que el bloque getRichTextValues() de más abajo solo corre cuando el origen es la hoja viva. [→ Contexto_Base_Web.md §37B141]
  var lectura = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.CLAN, 'Backup_Clan.csv', CC.CONDICION);
  if (lectura.origen === 'vacio') return { clanes: [] };
  // TANDA 15 (21-sep-2026): con origen 'csv' los números llegan como texto con separador de miles (Trofeos, Requerimiento, Copas y Donaciones tienen formato '#,##0' y el CSV se arma con getDisplayValues()): se leen con _numDesdeCeldaCSV_() (01_Config_Global.gs), no con Number(). [→ Contexto_Base_Web.md §37B142]

  var dataClan = lectura.filas;
  var minGPorTag = _getMinGClanMaps().byTag;

  // FIX 01-sep-2026 ("las celdas no están vacías, tendría que generar algo como https://royaleapi.com/player/..."): CC.ROYALE_API y CC.CW_STATS son texto enriquecido (makeLink() en 01_Config_Global.gs, usada por updateClanSheet()) con texto visible "Link" y la URL real solo en el enlace; getValues() solo trae "Link", así que se leen aparte con getRichTextValues() + getLinkUrl() para las 4 filas de Clan (mismo patrón que _leerLinksRichTextPorTag() de 12_Players_Links.gs); FASE 15-sep-2026: esta relectura solo corre si el origen fue la hoja viva; si vino del CSV (ya con la URL real en texto plano) royaleApiRT/cwStatsRT quedan null y el || de abajo cae al valor de la celda. [→ Contexto_Base_Web.md §37B143]
  var royaleApiRT = null, cwStatsRT = null;
  if (lectura.origen === 'sheet') {
    var shClan = ss.getSheetByName(CFG.SHEETS.CLAN);
    royaleApiRT = shClan.getRange(2, CC.ROYALE_API, shClan.getLastRow() - 1, 1).getRichTextValues();
    cwStatsRT   = shClan.getRange(2, CC.CW_STATS,   shClan.getLastRow() - 1, 1).getRichTextValues();
  }

  var clanes = CFG.TERNA_TAGS.map(function (tagBuscado) {
    for (var i = 0; i < dataClan.length; i++) {
      if (String(dataClan[i][CC.CLAN_TAG - 1]) !== tagBuscado) continue;
      var fila = dataClan[i];
      var minG = minGPorTag[tagBuscado];
      if (minG === undefined) minG = CFG.MIN_G_DEFAULT;

      // Preferir la URL real del enlace; si la celda no tiene enlace (alguien tipeó el tag a mano sin makeLink()), cae al texto de la celda como respaldo. [→ Contexto_Base_Web.md §37B144]
      var royaleApi = (royaleApiRT && royaleApiRT[i][0] && royaleApiRT[i][0].getLinkUrl()) || String(fila[CC.ROYALE_API - 1] || '').trim();
      if (royaleApi && !royaleApi.startsWith('http')) {
        royaleApi = 'https://royaleapi.com/clan/' + cleanTag(royaleApi);
      }

      // FIX 28-ago-2026 (botones RoyaleAPI/CWStats + gráfico "Copas" en la página Clanes): CC.CW_STATS y CC.COPAS ya se leían dentro del rango (CC.CONDICION=23) pero nunca se devolvían; se agregan sin tocar nada más; cwStats sigue el criterio de royaleApi (URL completa o solo el tag del clan). [→ Contexto_Base_Web.md §37B145]
      var cwStats = (cwStatsRT && cwStatsRT[i][0] && cwStatsRT[i][0].getLinkUrl()) || String(fila[CC.CW_STATS - 1] || '').trim();
      if (cwStats && !cwStats.startsWith('http')) {
        cwStats = 'https://cwstats.com/clan/' + cleanTag(cwStats);
      }

      return {
        clanTag:      tagBuscado,
        nombre:       String(fila[CC.NOMBRE        - 1] || ''),
        lider:        String(fila[CC.LIDER         - 1] || ''),
        miembros:     Number(fila[CC.MIEMBROS      - 1]) || 0,
        trofeos:      _numDesdeCeldaCSV_(fila[CC.TROFEOS       - 1]) || 0, // TANDA 15: tolera "5,432" del respaldo CSV
        copas:        _numDesdeCeldaCSV_(fila[CC.COPAS         - 1]) || 0, // TANDA 15
        minGSemanal:  minG,
        liga:         String(fila[CC.LIGA          - 1] || ''),
        requerimiento:_numDesdeCeldaCSV_(fila[CC.REQUERIMIENTO - 1]) || 0, // TANDA 15
        donaciones:   _numDesdeCeldaCSV_(fila[CC.DONACIONES    - 1]) || 0, // TANDA 15
        tipo:         String(fila[CC.TIPO          - 1] || ''),
        pais:         String(fila[CC.PAIS          - 1] || ''),
        descripcion:  String(fila[CC.DESCRIPCION   - 1] || ''),
        // NUEVO 16-sep-2026 (ícono real del clan desde el badgeId de Supercell): CC.BADGE_ID guarda el número crudo de /clans/{tag} (updateClanSheet(), 10_ClanSheet.gs) y se reenvía sin transformar, como pide el docblock de iconoBadgeClanHtml() (common.js, frontend), que lo resuelve a un ícono en el momento. [→ Contexto_Base_Web.md §37B146]
        badgeId:      Number(fila[CC.BADGE_ID      - 1]) || 0,
        royaleApi:    royaleApi,
        cwStats:      cwStats
      };
    }
    // Clan de CFG.TERNA_TAGS sin fila todavía en la hoja Clan (recién agregado, esperando la próxima updateClanSheet()): se devuelve un placeholder mínimo en vez de omitirlo, para que el frontend pinte la tarjeta (con guiones) en su posición. [→ Contexto_Base_Web.md §37B147]
    return { clanTag: tagBuscado, nombre: '', lider: '', miembros: 0, trofeos: 0, copas: 0,
             minGSemanal: CFG.MIN_G_DEFAULT, liga: '', requerimiento: 0,
             donaciones: 0, tipo: '', pais: '', descripcion: '', badgeId: 0, royaleApi: '', cwStats: '' };
  });

  return { clanes: clanes };
}

// _webTorneos(opciones): FASE 1 (24-ago-2026): listado público de los últimos torneos de T_Lista (id, fecha, clan organizador, link de la app) + ganadores del torneo MÁS RECIENTE, con la misma elegibilidad que actualizarDocGanadoresTorneo() (28_Torneos_Docs.gs: top 3 por Puesto en T_Asistencia, filtrado por el Ataques configurado por clan en T_Lista con exención por domingo opcional y trofeos >= Min_T de su clan), para que la web nunca difiera del doc "Ganadores (torneo)"; no expone Contraseña ni Link_JSON (uso interno del bot), solo Link_app; CAMBIO 28-sep-2026 (Fase 5b tanda D): el listado y los resultados siguen mostrando ex-miembros sin filtrar (registro histórico, confirmado por el usuario); _webGanadoresTorneoMasReciente() recibe opciones y agrega el campo tag a cada participante (top3 y participantes), que sale null si _webCuentaOcultaParaVisitante() lo oculta (criterio A5: Inactivos o Directorio Estado='Inactivo') salvo opciones.esAdmin; torneos.html lo usa para enlazar a perfil.html?tag=...; el Tag nunca se expone de forma incondicional. @param {{esAdmin?:boolean}=} opciones; @returns {{torneos: Array, ganadores: Object|null}} [→ Contexto_Base_Web.md §37B148]
function _webTorneos(opciones) {
  var ss = _getSs();
  // FIX 09-sep-2026 (Consolidado_Cambios_Pendientes_Torneos_Sorteos.md, sección 24): T_Lista tiene encabezado de 2 filas, así que los datos arrancan en la fila 3 (guard < 3, getRange(3, ...), - 2 filas); antes se leía desde la fila 2 y la primera fila real se saltaba; FASE 15-sep-2026 (fallback web->CSV): usa _obtenerFilasConFallbackCSV() con headerRowsHoja=2 y cae a Backup_T_Lista.csv (que ya trae 1 sola fila combinada) en vez de devolver { torneos: [], ganadores: null }; OJO: solo cubre el LISTADO; _webGanadoresTorneoMasReciente() y la cadena _getParticipantesFusionadosPorTorneo()/_aplicarResolucionesTorneo() (26_Torneos_Core.gs, lee T_Resoluciones) seguían sin fallback propio, pendiente como paso aparte. [→ Contexto_Base_Web.md §37B149]
  var lecturaTL = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_LISTA, 'Backup_T_Lista.csv', TL_TOTAL_COLS, 2);
  if (lecturaTL.origen === 'vacio') return { torneos: [], ganadores: null };

  var listaData = lecturaTL.filas;
  if (lecturaTL.origen === 'csv') {
    // Igual que en importarTListaDesdeCSV(): el CSV guarda Fecha como texto canónico ("dd/MM/yyyy..."), no como Date; hay que reconstruirla antes del filtro instanceof Date de más abajo o TODAS las filas del fallback se descartarían en silencio. [→ Contexto_Base_Web.md §37B150]
    listaData = listaData.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[TL.FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[TL.FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  var torneos = listaData
    .filter(function (f) { return f[TL.FECHA - 1] instanceof Date && f[TL.ID - 1]; })
    .map(function (f) {
      return {
        id:          f[TL.ID - 1],
        fecha:       f[TL.FECHA - 1].toISOString(),
        clan:        String(f[TL.CLAN - 1] || ''),
        organizador: String(f[TL.ORGANIZADOR - 1] || ''),
        linkApp:     String(f[TL.LINK_APP - 1] || '')
      };
    })
    .sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); })
    .slice(0, 10); // últimos 10 — listado + resultados sin sobrecargar la página

  return { torneos: torneos, ganadores: _webGanadoresTorneoMasReciente(ss, opciones) };
}

// _webGanadoresTorneoMasReciente(ss, opciones): helper de _webTorneos(); réplica exacta (solo lectura, JSON en vez de Google Doc) de actualizarDocGanadoresTorneo() (28_Torneos_Docs.gs): torneo de mayor Fecha de T_Lista, top 3 (fusionando Victorias/Puesto de todo el grupo de continuación, _getParticipantesFusionadosPorTorneo(), 26_Torneos_Core.gs, FASE 23), filtrado a quienes cumplen los requisitos de "calificado" (Ataques configurado por clan en T_Lista con exención por domingo opcional, FIX 19-sep-2026, antes 16 fijo; trofeos >= Min_T de su clan según la temporada de Extra!Mostrar); si nadie del top 3 real califica, top3 puede salir vacío (nunca se rellena con el 4.°/5.°); FASE 24 (02-sep-2026): top3 y lista completa reflejan las resoluciones vigentes de T_Resoluciones (_aplicarResolucionesTorneo()/_topNTrasResoluciones()): un descalificado sale del top3 pero sigue en participantes con descalificado:true, y "Empate - Reparto de premio" sale con premioRepartido:true; hasta entonces no se exponía el Tag (el panel admin usa _webAdminGanadoresTorneoDetalle() cuando necesita el Tag para registrar una resolución); CAMBIO 28-sep-2026 (Fase 5b tanda D): cada objeto de top3 y participantes trae tag condicional vía _webCuentaOcultaParaVisitante(p.tag, opciones) (null si la cuenta está oculta y opciones.esAdmin no es true; torneos.html lo usa para decidir link a perfil.html o texto plano; mismo patrón que _webTorneosJugador/_webHistorialGuerraComparador). @param {{esAdmin?:boolean}=} opciones; @returns {{idTorneo, fecha:string, top3:Array, participantes:Array}|null} (participantes = lista completa con Victorias > 0, sin el filtro de calificado) [→ Contexto_Base_Web.md §37B151]
function _webGanadoresTorneoMasReciente(ss, opciones) {
  // FASE 15-sep-2026 (fallback web->CSV): ya no se exige T_Asistencia como hoja viva (shTA.getLastRow() >= 2) antes de seguir; _getParticipantesFusionadosPorTorneo() (26_Torneos_Core.gs) cae sola a Backup_T_Asistencia.csv (y devuelve participantes vacíos si tampoco hay CSV, sin romper esta función); exigirla acá solo bloqueaba el camino antes de que ese fallback pudiera actuar. [→ Contexto_Base_Web.md §37B152]

  // FASE 15-sep-2026 (fallback web->CSV, continuación de _webTorneos()): T_Lista ya no se lee con shTL.getRange() directo sino con _obtenerFilasConFallbackCSV() (01_Config_Global.gs), headerRowsHoja=2 como en _webTorneos(); si T_Lista no está disponible o está vacía, cae a Backup_T_Lista.csv. [→ Contexto_Base_Web.md §37B153]
  var lecturaTL = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_LISTA, 'Backup_T_Lista.csv', TL_TOTAL_COLS, 2);
  if (lecturaTL.origen === 'vacio') return null;

  var listaData = lecturaTL.filas;
  if (lecturaTL.origen === 'csv') {
    // Igual que en _webTorneos(): el CSV guarda Fecha como texto canónico ("dd/MM/yyyy..."), no como Date; reconstruirla antes del filtro instanceof Date o todas las filas del fallback se descartarían en silencio. [→ Contexto_Base_Web.md §37B154]
    listaData = listaData.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[TL.FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[TL.FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  // FIX 13-sep-2026 (FASE 0 del plan de corrección Torneo/Sorteo): esta función quedó fuera del barrido original y calculaba "mayor Fecha" a mano sin consultar Extra!Torneo_Vigente_ID; ahora sigue el mismo criterio que _getConfigMasRecienteCategoria(). [→ Contexto_Base_Web.md §37B155]
  var idMasReciente = null, fechaMasReciente = null;
  var idVigenteExtraTorneo = _getIdVigenteExtra('Torneo');
  if (idVigenteExtraTorneo) {
    for (var i = 0; i < listaData.length; i++) {
      if (String(listaData[i][TL.ID - 1] || '') === idVigenteExtraTorneo) {
        idMasReciente = listaData[i][TL.ID - 1];
        fechaMasReciente = listaData[i][TL.FECHA - 1];
        break;
      }
    }
  }
  if (!idMasReciente) {
    for (var i = 0; i < listaData.length; i++) {
      var f = listaData[i][TL.FECHA - 1];
      if (f instanceof Date && (!fechaMasReciente || f > fechaMasReciente)) {
        fechaMasReciente = f;
        idMasReciente = listaData[i][TL.ID - 1];
      }
    }
  }
  if (!idMasReciente) return null;

  // FASE 23 (30/08/2026, Tag_Tor_2): mismo fusionado que actualizarDocGanadoresTorneo() (28_Torneos_Docs.gs): si el torneo más reciente pertenece a un grupo de continuación, se fusionan Victorias y Puesto de todo el grupo antes de tomar el top 3; FASE 24 (02-sep-2026): _getParticipantesFusionadosPorTorneo() ya aplica las resoluciones vigentes y _topNTrasResoluciones() arma el top 3 real (excluye descalificados, respeta el Puesto_Final de un desempate) en vez del slice(0,3) de antes. [→ Contexto_Base_Web.md §37B156]
  var participantesGrupo = _getParticipantesFusionadosPorTorneo(ss, idMasReciente).participantes;
  var top3 = _topNTrasResoluciones(participantesGrupo, 3);

  var ctxReal = _getCtx();
  var temporadaMostrar = _getTemporadaMostrarExtra(ss, ctxReal);
  var ctx = _clonarCtxParaTemporada(ctxReal, temporadaMostrar);
  var ataquesSemanaPorTag = _getAtaquesYExentosSemanaActualPorTag(ctx); // 19-sep-2026: { ataques, exentos }
  var trofeosPorTag = _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaMostrar, ctxReal);
  var minTPorTag = _getMinTClanMaps().byTag;
  // FIX 19-sep-2026: este endpoint había quedado fuera del cambio "el 16 fijo debe leer el Ataques configurado por clan en T_Lista" (actualizarDocGanadoresTorneo() ya usaba _ataquesMinTorneoPorNombreClan()/_cumpleAtaquesTorneoClan()); con Ataques en 16 coincidía, pero con otro valor configurado la web mostraba un top3 distinto al del documento real. [→ Contexto_Base_Web.md §37B157]
  var ataquesMinPorClan = _ataquesMinTorneoPorNombreClan();

  var top3Filtrado = top3.filter(function (p) {
    var tag = p.tag;
    var clanTag = p.clanTag;
    var trofeos = trofeosPorTag[tag] || 0;
    var minT = minTPorTag[clanTag] !== undefined ? minTPorTag[clanTag] : CFG.MIN_T_DEFAULT;
    return _cumpleAtaquesTorneoClan(ataquesSemanaPorTag[tag], ataquesMinPorClan, p.clan) && trofeos >= minT; // 19-sep-2026
  }).map(function (p) {
    return {
      puesto:          p.puesto,
      nombre:          p.nombre,
      clan:            p.clan,
      victorias:       p.victorias,
      premioRepartido: !!p.premioRepartido,
      // CAMBIO 28-sep-2026 (Fase 5b tanda D): tag condicional; ver el docblock de la función para el criterio completo. [→ Contexto_Base_Web.md §37B158]
      tag:             _webCuentaOcultaParaVisitante(p.tag, opciones) ? null : p.tag
    };
  });

  // FIX 02-sep-2026 (PDF de torneos: "mostrar los resultados de T_Control" y de todos los participantes con más de cero victorias, para incentivar la participación): además del top3 calificado (el que decide premio) se expone la lista COMPLETA de participantes de este torneo con Victorias > 0 (el dato que pinta T_Control, sin quienes no ganaron ninguna partida); Puesto ya viene recalculado por _getParticipantesFusionadosPorTorneo() (empates comparten puesto); CAMBIO 28-sep-2026 (Fase 5b tanda D): el Tag deja de excluirse sin condición y sale condicional, igual que en top3Filtrado. [→ Contexto_Base_Web.md §37B159]
  var participantes = participantesGrupo
    .filter(function (p) { return p.victorias > 0; })
    .map(function (p) {
      return {
        puesto:          p.puesto,
        nombre:          p.nombre,
        clan:            p.clan,
        victorias:       p.victorias,
        descalificado:   !!p.descalificado,
        premioRepartido: !!p.premioRepartido,
        tag:             _webCuentaOcultaParaVisitante(p.tag, opciones) ? null : p.tag
      };
    });

  return { idTorneo: idMasReciente, fecha: fechaMasReciente.toISOString(), top3: top3Filtrado, participantes: participantes };
}

// _webHistorialTorneos(opciones): FASE 9 (30-ago-2026, "salón de la fama" en torneos.html): top 3 por Puesto de CADA torneo de T_Lista; a propósito NO aplica el filtro de "calificado" de _webGanadoresTorneoMasReciente() (Ataques por clan + trofeos >= Min_T), porque se apoya en el acumulado de la SEMANA DE GUERRA ACTUAL (_getAtaquesSemanaActualPorTag()/_getTrofeosGuerraAcumuladosPorTagParaTemporada()) y para un torneo de hace semanas o meses daría resultados incorrectos sin avisar (Guerra no guarda un histórico indexable por fecha arbitraria), así que muestra el resultado real ya cerrado de T_Asistencia; tampoco filtra por Admin ni por Estado del Directorio (a diferencia de _webAscensosRecientes()): es un registro de torneos ya jugados y un ganador sigue siéndolo aunque hoy sea admin o ya no esté activo; FASE 23 (30/08/2026, Tag_Tor_2): un torneo de continuación no sale como entrada aparte, se fusiona con la RAÍZ de su grupo (_resolverGruposContinuacionTorneos(), 26_Torneos_Core.gs; mismo criterio que T_Control y Ganadores) con Victorias/Puesto sumados; FASE 24 (02-sep-2026): el top3 usa _topNTrasResoluciones() (excluye descalificados, respeta el Puesto_Final de un desempate); participantes sigue mostrando a los descalificados (descalificado:true) y ambos exponen premioRepartido:true cuando corresponde; lectura pública con el mismo WEB_MEMBER_TOKEN de solo lectura que webTorneos; CAMBIO 28-sep-2026 (Fase 5b tanda D): como en _webGanadoresTorneoMasReciente(), top3 y participantes traen tag condicional (_webCuentaOcultaParaVisitante(p.tag, opciones): null para Inactivos/Estado='Inactivo' salvo opciones.esAdmin); el salón de la fama sigue mostrando a ex-miembros sin ocultar nombre/clan/puesto, solo el Tag es condicional (torneos.html decide enlace o texto plano). @param {{esAdmin?:boolean}=} opciones; @returns {{historial: Array<{idTorneo, fecha:string, top3:Array, participantes:Array}>}} (participantes = lista completa de ese torneo con Victorias > 0) [→ Contexto_Base_Web.md §37B160]
function _webHistorialTorneos(opciones) {
  var ss = _getSs();
  // FASE 15-sep-2026 (fallback web->CSV, continuación de _webTorneos()/_webGanadoresTorneoMasReciente()): T_Lista se lee con _obtenerFilasConFallbackCSV() (01_Config_Global.gs), headerRowsHoja=2 (la hoja tiene 2 filas de encabezado fusionadas, el CSV ya trae 1 combinada), que cae a Backup_T_Lista.csv si la hoja no está disponible o está vacía; T_Asistencia no necesita un shTA propio acá: su fallback está un nivel más adentro, en _getParticipantesFusionadosPorTorneo() (26_Torneos_Core.gs), que cae sola a Backup_T_Asistencia.csv (o devuelve participantes vacíos sin romper esta función). [→ Contexto_Base_Web.md §37B161]
  var lecturaTL = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_LISTA, 'Backup_T_Lista.csv', TL_TOTAL_COLS, 2);
  if (lecturaTL.origen === 'vacio') return { historial: [] };

  var listaData = lecturaTL.filas;
  if (lecturaTL.origen === 'csv') {
    // Igual que en _webTorneos()/_webGanadoresTorneoMasReciente(): el CSV guarda Fecha como texto canónico, no como Date; reconstruirla antes del filtro instanceof Date o todo el historial quedaría vacío en silencio. [→ Contexto_Base_Web.md §37B162]
    listaData = listaData.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[TL.FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[TL.FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  var grupos = _resolverGruposContinuacionTorneos(ss);

  var historial = listaData
    .filter(function (f) { return f[TL.FECHA - 1] instanceof Date && f[TL.ID - 1]; })
    .filter(function (f) {
      var id = String(f[TL.ID - 1]);
      var raiz = grupos.raizPorId.hasOwnProperty(id) ? grupos.raizPorId[id] : id;
      return raiz === id; // las continuaciones se fusionan en su raíz, no salen como torneo aparte
    })
    .map(function (f) {
      var id = f[TL.ID - 1];
      var participantesGrupo = _getParticipantesFusionadosPorTorneo(ss, id).participantes;
      var top3 = _topNTrasResoluciones(participantesGrupo, 3).map(function (p) {
        return {
          puesto:          p.puesto,
          nombre:          p.nombre,
          clan:            p.clan,
          victorias:       p.victorias,
          premioRepartido: !!p.premioRepartido,
          // CAMBIO 28-sep-2026 (Fase 5b tanda D): tag condicional; ver el docblock de _webHistorialTorneos() para el criterio completo. [→ Contexto_Base_Web.md §37B163]
          tag:             _webCuentaOcultaParaVisitante(p.tag, opciones) ? null : p.tag
        };
      });
      // FIX 02-sep-2026 (PDF de torneos, puntos 12/13: "mostrar los resultados de T_Control" y de todos los participantes con más de cero victorias, no solo el top 3): mismo criterio que el FIX de _webGanadoresTorneoMasReciente(); se expone la lista completa de participantes de ESTE torneo con Victorias > 0 (el dato de T_Control), además del top3 del salón de la fama; CAMBIO 28-sep-2026 (Fase 5b tanda D): mismo tag condicional que en top3. [→ Contexto_Base_Web.md §37B164]
      var participantes = participantesGrupo
        .filter(function (p) { return p.victorias > 0; })
        .map(function (p) {
          return {
            puesto:          p.puesto,
            nombre:          p.nombre,
            clan:            p.clan,
            victorias:       p.victorias,
            descalificado:   !!p.descalificado,
            premioRepartido: !!p.premioRepartido,
            tag:             _webCuentaOcultaParaVisitante(p.tag, opciones) ? null : p.tag
          };
        });
      return {
        idTorneo: id,
        participantes: participantes,
        fecha:    f[TL.FECHA - 1].toISOString(),
        clan:     String(f[TL.CLAN - 1] || ''),
        top3:     top3
      };
    })
    .filter(function (t) { return t.top3.length > 0; }) // sin resultados registrados, no aporta al salón de la fama
    .sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); })
    .slice(0, 30); // últimos 30 torneos con ganadores — de sobra para un salón de la fama

  return { historial: historial };
}

// _webRankings(): FASE 10 (30-ago-2026, sección pública "Rankings"): top 10 de cuatro métricas ya calculadas en el Directorio, solo miembros con Estado = 'Activo' (misma fuente y criterio que _webRoster()): donadores (DC.DON_D, donaciones realizadas), racha (DC.RACHA, racha de guerra), torneos (DC.TORNEOS, el mismo campo que exponen _webRoster()/_webPerfilJugador()) y victorias3c (DC.VICTORIAS_3C, victorias con 3 coronas); cada lista excluye valores en 0/vacío (un top no debe mostrar ceros) y se recorta a 10; lectura pública con el mismo WEB_MEMBER_TOKEN de solo lectura que webRoster. @returns {{donadores, racha, torneos, victorias3c: Array<{tag,nombre,clan,valor}>}} [→ Contexto_Base_Web.md §37B165]
function _webRankings() {
  // FIX 24-sep-2026 (auditoría "fallback web->CSV, funciones web"): antes usaba _leerDirectorioFisicoComoDC(ss) directo, que no tiene fallback propio (devuelve [] en silencio si Directorio no está disponible); ahora usa _webLeerDirectorioComoDC() (más abajo en este archivo), que cae a Backup_Directorio.csv si la hoja falta, está vacía o falla, igual que _webRoster(). [→ Contexto_Base_Web.md §37B166]
  var dataDir = _webLeerDirectorioComoDC().filas;

  var activos = [];
  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    activos.push({
      tag:     String(fila[DC.TAG    - 1] || ''),
      nombre:  String(fila[DC.NOMBRE - 1] || ''),
      clan:    String(fila[DC.CLAN   - 1] || ''),
      donD:    Number(fila[DC.DON_D  - 1]) || 0,
      racha:   Number(fila[DC.RACHA  - 1]) || 0,
      torneos: Number(fila[DC.TORNEOS - 1]) || 0,
      v3c:     Number(fila[DC.VICTORIAS_3C - 1]) || 0
    });
  }

  function _webRankingsTopPor(campo) {
    return activos
      .filter(function (m) { return m[campo] > 0; })
      .sort(function (a, b) { return b[campo] - a[campo]; })
      .slice(0, 10)
      .map(function (m) { return { tag: m.tag, nombre: m.nombre, clan: m.clan, valor: m[campo] }; });
  }

  return {
    donadores:   _webRankingsTopPor('donD'),
    racha:       _webRankingsTopPor('racha'),
    torneos:     _webRankingsTopPor('torneos'),
    victorias3c: _webRankingsTopPor('v3c')
  };
}

// _webAniversarios(): FASE 10 (30-ago-2026, "Aniversarios en la Familia"): para cada miembro Activo con Fecha_Ing válida (la misma columna de _webIngresosRecientes()) calcula los días desde su ingreso y su PRÓXIMO hito en múltiplos de ~6 meses (182 días: 182, 364, 546...); si cae dentro de los próximos 14 días entra en la lista (sección rotativa "Próximos aniversarios" en Inicio/Comunidad); 182 días ≈ 6 meses es una aproximación deliberada (evita aritmética de meses calendario con casos límite de fin de mes) y hitoMeses es solo para mostrar ("6 meses", "1 año"...); lectura pública con el mismo WEB_MEMBER_TOKEN de solo lectura que webRoster; FIX 30-ago-2026 (lentitud del portal): cacheada 60 s vía _webCacheado() (ver _webRoster()); la función original quedó renombrada _webAniversariosCalcular(). @returns {{aniversarios: Array<{tag,nombre,clan,fechaIngTxt,hitoMeses,diasFaltantes}>}} [→ Contexto_Base_Web.md §37B167]
function _webAniversarios() {
  return _webCacheado('web_aniversarios_v1', 60, _webAniversariosCalcular);
}

function _webAniversariosCalcular() {
  // FIX 24-sep-2026 (auditoría "fallback web->CSV, funciones web"): mismo cambio que _webRankings(); _leerDirectorioFisicoComoDC(ss) directo no tiene fallback propio. [→ Contexto_Base_Web.md §37B168]
  var dataDir = _webLeerDirectorioComoDC().filas;
  var tz = Session.getScriptTimeZone() || 'America/Lima';
  var hoy = new Date();
  var MS_DIA = 86400000;
  var PACK_DIAS = 182; // ~6 meses

  var aniversarios = [];
  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    var fechaIng = fila[DC.FECHA_ING - 1];
    if (!(fechaIng instanceof Date) || isNaN(fechaIng.getTime())) continue;

    var diasTranscurridos = Math.floor((hoy - fechaIng) / MS_DIA);
    if (diasTranscurridos < PACK_DIAS) continue; // todavía no llega a su primer hito

    var proximoHito = (Math.floor(diasTranscurridos / PACK_DIAS) + 1) * PACK_DIAS;
    var diasFaltantes = proximoHito - diasTranscurridos;
    if (diasFaltantes > 14) continue;

    aniversarios.push({
      tag:           String(fila[DC.TAG    - 1] || ''),
      nombre:        String(fila[DC.NOMBRE - 1] || ''),
      clan:          String(fila[DC.CLAN   - 1] || ''),
      fechaIngTxt:   Utilities.formatDate(fechaIng, tz, 'dd/MM/yyyy'),
      hitoMeses:     (proximoHito / PACK_DIAS) * 6,
      diasFaltantes: diasFaltantes
    });
  }

  aniversarios.sort(function (a, b) { return a.diasFaltantes - b.diasFaltantes; });

  return { aniversarios: aniversarios };
}

// _webCompararJugadores(tag1, tag2, opciones): FASE 10 (30-ago-2026, comparador de jugadores): envuelve DOS llamadas a _webPerfilJugador() (la misma del buscador de jugadores.html) en un solo round-trip HTTP, sin duplicar lógica de perfil; si un Tag no existe igual se devuelve el lado encontrado más el mensaje de error del otro, para que el frontend muestre el que sí cargó; CAMBIO 28-sep-2026 (Fase 5b tanda A): tercer parámetro opcional opciones ({esAdmin:boolean}) que se pasa tal cual a _webPerfilJugador(). @returns {{a: Object|null, errorA?: string, b: Object|null, errorB?: string}} [→ Contexto_Base_Web.md §37B169]
function _webCompararJugadores(tag1, tag2, opciones) {
  var resultado = { a: null, b: null };

  var pa = _webPerfilJugador(tag1, opciones);
  if (pa.ok) resultado.a = pa.jugador; else resultado.errorA = pa.error;

  var pb = _webPerfilJugador(tag2, opciones);
  if (pb.ok) resultado.b = pb.jugador; else resultado.errorB = pb.error;

  return resultado;
}

// Ventana de historial de _webHistorialGuerraComparador(): ~6 meses (180 días), suficiente para una gráfica legible etiquetada por mes sin mandar años de historia diaria. [→ Contexto_Base_Web.md §37B170]
var LIMITE_DIAS_HISTORIAL_GUERRA_COMPARADOR = 180;

// _webHistorialGuerraComparador(tag1, tag2, opciones): FASE 25 (02-sep-2026, PDF de torneos, punto 9: "Cara a cara" con gráficas de desempeño de guerra, valores diarios y eje X etiquetado solo por mes): arma el historial DIARIO (AtaquesHoy + Fame de cada fecha, GC.ATAQUES_HOY/GC.FAME) de los dos Tags del comparador para jugadores.html, como gráfica de líneas con dos series (mismo patrón visual que "Ranking en el clan" de perfil.html, renderRankingChart()) y etiqueta de eje solo en los cambios de mes; fuentes con el mismo criterio de temporada actual + histórico que el docblock "HOJA vs CSV" de 17_GuerraSheet.gs: 1) Backup_Guerra.csv (vía _loadCSVFromDrive(), como _construirMapaSemanalPorTagDesdeSupercell() "más arriba en este archivo"; histórico completo de todas las temporadas, solo API de Supercell, sin overlay de Correcciones_Guerra.csv porque interesa el valor bruto de cada día) y 2) hoja Guerra (CFG.SHEETS.GUERRA), que solo conserva la temporada ACTUAL (el resto se purgó a Backup_Guerra.csv, _purgarTemporadasAnterioresGuerra()), se lee DESPUÉS del CSV y pisa fechas repetidas por ser la más fresca; Estado/Activo del Directorio: CAMBIO 28-sep-2026 (Fase 5b tanda A3): ya no es permisivo con cuentas inactivas: para un visitante una cuenta inactiva (hoja Inactivos o Estado 'Inactivo') devuelve arreglo vacío y con opciones.esAdmin sale el historial real; un Tag sin fila en Directorio/Inactivos responde como antes. @param tag1, tag2; @returns {{a: Array<{fecha:string, ataques:number, fame:number}>, b: igual}} con fecha ISO 'yyyy-MM-dd', un registro por día, orden ascendente, recortado a LIMITE_DIAS_HISTORIAL_GUERRA_COMPARADOR días; un Tag sin registros devuelve arreglo vacío (no es error) [→ Contexto_Base_Web.md §37B171]
function _webHistorialGuerraComparador(tag1, tag2, opciones) {
  var tagNorm1 = cleanTag(tag1);
  var tagNorm2 = cleanTag(tag2);
  // CAMBIO 28-sep-2026 (Fase 5b tanda A3, decisión del usuario): para un visitante el lado de una cuenta inactiva se trata como un Tag sin registros (arreglo vacío); con sesión de admin (opciones.esAdmin) sale el historial real; ver _webCuentaOcultaParaVisitante() y aviso A5. [→ Contexto_Base_Web.md §37B172]
  if (tagNorm1 && _webCuentaOcultaParaVisitante(tagNorm1, opciones)) tagNorm1 = '';
  if (tagNorm2 && _webCuentaOcultaParaVisitante(tagNorm2, opciones)) tagNorm2 = '';
  if (!tagNorm1 && !tagNorm2) return { a: [], b: [] };

  var porTag = {};
  if (tagNorm1) porTag[tagNorm1] = {};
  if (tagNorm2) porTag[tagNorm2] = {};

  var tz = Session.getScriptTimeZone() || 'America/Lima';

  // FIX 03-sep-2026 ("Cara a cara: las gráficas deben mostrar solo los días de guerra, no de entrenamiento; agregar también Ataques y Barcos, no solo Fame"): la hoja Guerra/Backup_Guerra.csv registra TODOS los días de la temporada, incluido entrenamiento (Ataques/Fame/Barcos quedan en 0 porque no se puede atacar) y esos ceros distorsionaban la línea; se agrega GC.ETAPA ('GUERRA' o 'ENTRENAMIENTO', el mismo texto de ctx.esDiaGuerra) al registro y se filtra por él antes de devolver el arreglo; también se captura GC.BARCOS para la tercera gráfica. [→ Contexto_Base_Web.md §37B173]
  function _registrar(tagCelda, fechaCelda, ataquesCelda, fameCelda, barcosCelda, etapaCelda, clanCelda, pIdxCelda, tempCelda) {
    var tagNorm = cleanTag(tagCelda);
    if (!tagNorm || !porTag.hasOwnProperty(tagNorm)) return;
    var fechaObj = (fechaCelda instanceof Date) ? fechaCelda : _parseSpanishDate(fechaCelda);
    if (!(fechaObj instanceof Date) || isNaN(fechaObj.getTime())) return;
    var claveFecha = Utilities.formatDate(fechaObj, tz, 'yyyy-MM-dd');
    // Última escritura gana: Backup_Guerra.csv se procesa primero y la hoja Guerra (más fresca) después, así que si la misma fecha está en las dos queda el valor de la hoja. [→ Contexto_Base_Web.md §37B174]
    porTag[tagNorm][claveFecha] = {
      fecha:   claveFecha,
      ataques: Number(ataquesCelda) || 0,
      fame:    Number(fameCelda) || 0,
      barcos:  Number(barcosCelda) || 0,
      esDiaGuerra: String(etapaCelda || '').trim().toUpperCase() === 'GUERRA',
      // NUEVO 05-oct-2026: datos para decidir si el día fue opcional (meta ya cruzada); no se mandan al frontend. [→ Contexto_Base_Web.md §37B175]
      clan: String(clanCelda || ''), pIdx: Number(pIdxCelda), temporada: tempCelda
    };
  }

  // 1) Backup_Guerra.csv — histórico completo de todas las temporadas. [→ Contexto_Base_Web.md §37B176]
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (csvText) {
    var parsed = _parseCSV(csvText);
    if (parsed && parsed.length > 1) {
      for (var i = 1; i < parsed.length; i++) {
        var f = parsed[i];
        _registrar(f[GC.TAG - 1], f[GC.FECHA - 1], f[GC.ATAQUES_HOY - 1], f[GC.FAME - 1], f[GC.BARCOS - 1], f[GC.ETAPA - 1], f[GC.CLAN - 1], f[GC.PERIOD_IDX - 1], f[GC.TEMPORADA - 1]);
      }
    }
  }

  // 2) Hoja Guerra — temporada actual, pisa el CSV si hay fecha repetida; FIX 24-sep-2026 (auditoría "fallback web->CSV, funciones web"): esta lectura de la hoja viva no tenía try/catch y, si Sheets lanzaba excepción (spreadsheet caído, cuota excedida), el endpoint devolvía error 500 en vez de servir el histórico ya cargado del CSV; ahora la falla se ignora en silencio (queda logueada) y el comparador se sirve solo con el CSV (algo desactualizado en los últimos días de la temporada actual, pero disponible); mismo criterio de try/catch que _webLeerDirectorioComoDC(). [→ Contexto_Base_Web.md §37B177]
  try {
    var ss = _getSs();
    var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
    if (shGuerra && shGuerra.getLastRow() >= 2) {
      var dataGuerra = shGuerra.getRange(2, 1, shGuerra.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
      for (var g = 0; g < dataGuerra.length; g++) {
        var fg = dataGuerra[g];
        _registrar(fg[GC.TAG - 1], fg[GC.FECHA - 1], fg[GC.ATAQUES_HOY - 1], fg[GC.FAME - 1], fg[GC.BARCOS - 1], fg[GC.ETAPA - 1], fg[GC.CLAN - 1], fg[GC.PERIOD_IDX - 1], fg[GC.TEMPORADA - 1]);
      }
    }
  } catch (eGuerraViva) {
    Logger.log('[WebAPI] _webHistorialGuerraComparador: la hoja Guerra falló (' + eGuerraViva.message + '); se usa solo Backup_Guerra.csv.');
  }

  var limiteFecha = new Date();
  limiteFecha.setDate(limiteFecha.getDate() - LIMITE_DIAS_HISTORIAL_GUERRA_COMPARADOR);
  var limiteClave = Utilities.formatDate(limiteFecha, tz, 'yyyy-MM-dd');

  function _aArregloOrdenado(tagNorm) {
    if (!tagNorm || !porTag[tagNorm]) return [];
    return Object.keys(porTag[tagNorm])
      .map(function (k) { return porTag[tagNorm][k]; })
      .filter(function (r) { return r.fecha >= limiteClave; })
      // FIX 03-sep-2026: solo días de guerra (ver el comentario junto a _registrar()); esDiaGuerra ya cumplió su propósito acá (decidir el filtro) y no se manda al frontend, porque cada registro que llega es por definición un día de guerra real. [→ Contexto_Base_Web.md §37B178]
      .filter(function (r) { return r.esDiaGuerra; })
      .map(function (r) {
        var o = { fecha: r.fecha, ataques: r.ataques, fame: r.fame, barcos: r.barcos };
        // NUEVO 05-oct-2026 (los días con meta ya cruzada se muestran como opcionales): campo ADITIVO opcional:true solo cuando el clan ya había cruzado la meta al empezar ese día; nunca el jueves (pIdx % 7 === 3, misma regla que _clanYaCruzoMetaEnPeriodo(), 22_ControlCalendario.gs) ni en semana de coliseo; sin dato de Guerra_Logs no se marca; ataques/fame/barcos no se alteran; usa _cruceMetaDesdeGuerraLogs_() (en memoria, Guerra_Logs leído una vez). [→ Contexto_Base_Web.md §37B179]
        try {
          // 07-oct-2026 (criterio unificado): viernes a domingo (pIdx % 7 > 3) se evalúan con Guerra_Logs; Supercell no confirma desde qué día se puede cruzar la meta. [→ Contexto_Base_Web.md §37B180]
          if (r.clan && isFinite(r.pIdx) && r.pIdx % 7 > 3 &&
              !_esPeriodoDeColiseo_(r.temporada, r.pIdx) &&
              _cruceMetaDesdeGuerraLogs_(r.clan, r.pIdx, r.temporada) === true) o.opcional = true;
        } catch (eOpc) { /* sin marca: lado conservador */ }
        return o;
      })
      .sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });
  }

  return { a: _aArregloOrdenado(tagNorm1), b: _aArregloOrdenado(tagNorm2) };
}

// _webEstadisticasCartas(): FASE 10 (30-ago-2026); Top 10 de cartas más usadas en el mazo actual de la Familia, a partir de Backup_Cards_2.csv (Currentdeck 'Sí') y Backup_Cards.csv; depende de PLAYERS_API_ENABLED: sin datos devuelve top10: [] y jugadoresConDatos: 0, que NO es un error y el frontend debe mostrar como estado vacío; solo cuenta Tags hoy Activos en Directorio; lectura pública con WEB_MEMBER_TOKEN; expone rarity, tipo, hasHero/heroIcon y hasEvolution/evolutionIcon (FIX 04-sep-2026); 'name' lee Nombre (español) y cae a Name y a 'Carta <ID>' (CORRECCIÓN 05-sep-2026); los índices de columna ya reflejan los corrimientos por las columnas Nombre y Tipo. @returns {{top10, jugadoresConDatos}} [→ Contexto_Base_Web.md §37B181]
function _webEstadisticasCartas() {
  // FIX 24-sep-2026 (auditoría fallback web->CSV): Directorio se lee con _webLeerDirectorioComoDC() (cae a Backup_Directorio.csv), mismo cambio que _webRankings(). [→ Contexto_Base_Web.md §37B182]
  var dataDir = _webLeerDirectorioComoDC().filas;
  var tagsActivos = {};
  for (var i = 0; i < dataDir.length; i++) {
    if (String(dataDir[i][DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    var t = cleanTag(dataDir[i][DC.TAG - 1]);
    if (t) tagsActivos[t] = true;
  }

  var cards2 = _leerCards2CSV(); // headers: N°,Tag,ID,Level,EvolutionLevel,Currentdeck,Count
  if (!cards2.rows.length) return { top10: [], jugadoresConDatos: 0 };

  var conteoPorId = {};
  var tagsConDatos = {};
  for (var r = 0; r < cards2.rows.length; r++) {
    var row = cards2.rows[r];
    var tagFila = cleanTag(row[1]);
    if (!tagFila || !tagsActivos[tagFila]) continue;
    tagsConDatos[tagFila] = true;
    var enDeck = String(row[5] || '').trim();
    if (enDeck !== 'Sí') continue;
    var idCarta = String(row[2] || '').trim();
    if (!idCarta) continue;
    // FIX 24-sep-2026 (cartas de torre en Backup_Cards_2.csv): la tropa de torre equipada no cuenta en este Top 10 (_esCartaTorre(), 31_Cards_Mazos.gs). [→ Contexto_Base_Web.md §37B183]
    if (_esCartaTorre(idCarta)) continue;
    conteoPorId[idCarta] = (conteoPorId[idCarta] || 0) + 1;
  }

  var idsTop = Object.keys(conteoPorId)
    .sort(function (a, b) { return conteoPorId[b] - conteoPorId[a]; })
    .slice(0, 10);

  if (!idsTop.length) return { top10: [], jugadoresConDatos: Object.keys(tagsConDatos).length };

  // Catálogo ID -> nombre/rareza/coste/ícono solo para los IDs que se muestran; FIX 04-sep-2026: el ícono sale de la columna Carta de Backup_Cards.csv (iconUrls.medium de Supercell), no de URLs de terceros. [→ Contexto_Base_Web.md §37B184]
  // headers de Backup_Cards.csv (columnas 1 a 11, de N° a Evolución). [→ Contexto_Base_Web.md §37B185]
  var cards1 = _leerCardsCSV();
  var infoPorId = {};
  for (var c = 0; c < cards1.rows.length; c++) {
    var idCat = String(cards1.rows[c][1] || '').trim();
    if (idsTop.indexOf(idCat) === -1) continue;
    infoPorId[idCat] = {
      name:          String(cards1.rows[c][3] || cards1.rows[c][2] || ('Carta ' + idCat)),
      rarity:        String(cards1.rows[c][6] || ''),
      tipo:          String(cards1.rows[c][7] || ''), // Tropa/Hechizo/Estructura (columna manual del usuario)
      elixirCost:    cards1.rows[c][8] !== '' ? Number(cards1.rows[c][8]) : null,
      icon:          String(cards1.rows[c][9] || ''),
      heroIcon:      String(cards1.rows[c][10] || ''),
      evolutionIcon: String(cards1.rows[c][11] || '')
    };
  }

  var top10 = idsTop.map(function (id) {
    var info = infoPorId[id] || { name: 'Carta ' + id, rarity: '', tipo: '', elixirCost: null, icon: '', heroIcon: '', evolutionIcon: '' };
    return {
      id:             id,
      name:           info.name,
      rarity:         info.rarity,
      tipo:           info.tipo,
      elixirCost:     info.elixirCost,
      icon:           info.icon,
      hasHero:        !!info.heroIcon,
      heroIcon:       info.heroIcon || null,
      hasEvolution:   !!info.evolutionIcon,
      evolutionIcon:  info.evolutionIcon || null,
      usos:           conteoPorId[id]
    };
  });

  return { top10: top10, jugadoresConDatos: Object.keys(tagsConDatos).length };
}

// _webAdminBuscarMiembro(token, tagBuscado): como _webPerfilJugador() pero exige sesión de admin y agrega los campos editables (prefijo, celular, nomMulti, prestamo) para precargar el formulario de gestión; FIX 09-sep-2026: `fila` puede ser null con perfil.ok true (jugador sin fila en Directorio, vía _webPerfilJugadorSinRegistro()); en ese caso los 4 campos salen vacíos. [→ Contexto_Base_Web.md §37B186]
function _webAdminBuscarMiembro(token, tagBuscado) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var perfil = _webPerfilJugador(tagBuscado, { esAdmin: true }); // sesión ya validada arriba (Fase 5b tanda A: el panel sigue viendo inactivos)
  if (!perfil.ok) return perfil;

  var fila = _webBuscarFilaDirectorioPorTag(tagBuscado);
  perfil.jugador.editable = fila ? {
    prefijo:  String(fila[DC.PREFIJO   - 1] || ''),
    celular:  String(fila[DC.CELULAR   - 1] || ''),
    nomMulti: String(fila[DC.NOM_MULTI - 1] || ''),
    prestamo: String(fila[DC.PRESTAMO  - 1] || '')
  } : { prefijo: '', celular: '', nomMulti: '', prestamo: '' };
  return perfil;
}

// _webAdminBuscarMiembroSugerencias(token, q): FIX 09-sep-2026; autocompletado del panel (admin.html, buscarSugerenciasMiembro()); busca por similitud (substring sin mayúsculas ni tildes) en Nombre, Nom_Multi y Tag sobre Directorio e Inactivos (activos o no, estén o no en un clan Terna); un Tag sin ningún registro solo se encuentra por Tag exacto con webAdminBuscarMiembro; no ordena (lo hace _ordenarSugerenciasMiembro() del frontend) ni filtra longitud mínima (2+ caracteres en el frontend); cualquier admin con sesión; FIX 24-sep-2026 (AVISO 6): cada hoja cae a su CSV (Backup_Directorio.csv / Backup_Inactivos.csv) con _obtenerFilasConFallbackCSV(). @returns {{ok, error?, resultados?:[{tag,nombre,nomMulti,clan,estado}]}} [→ Contexto_Base_Web.md §37B187]
function _webAdminBuscarMiembroSugerencias(token, q) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var texto = String(q || '').trim();
  if (texto.length < 2) return { ok: true, resultados: [] };

  // Mismo criterio de normalización (minúsculas, sin tildes) que ordenClanIndex()/_ordenRango(), para que "antonio" encuentre "Antonio" y "jose" encuentre "José". [→ Contexto_Base_Web.md §37B188]
  function _normalizar(v) {
    return String(v || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  var textoNorm = _normalizar(texto);

  // Límite defensivo de 40 sugerencias: alcanza para el dropdown y evita una respuesta enorme si `q` es muy genérico. [→ Contexto_Base_Web.md §37B189]
  var LIMITE_RESULTADOS = 40;

  var ss = _getSs();
  var resultados = [];
  var tagsYaAgregados = {}; // por si un tag apareciera en ambas hojas (no debería, ver diseño de _updateInactivos())

  // FIX 24-sep-2026 (AVISO 6): _procesarHoja() no tenía respaldo CSV y cortaba en silencio si la hoja no estaba disponible; ahora cae a su CSV con _obtenerFilasConFallbackCSV(); como Backup_Directorio.csv y Backup_Inactivos.csv se guardan en formato DC (60 columnas) y no IC (29), `nombreArchivoCsv` es parámetro y los 5 índices (Tag, Nombre, Nom_Multi, Clan, Estado) se resuelven con IC.* o DC.* según el origen. [→ Contexto_Base_Web.md §37B190]
  function _procesarHoja(nombreHoja, totalColsHoja, nombreArchivoCsv, estadoForzado) {
    if (resultados.length >= LIMITE_RESULTADOS) return;

    var sh = ss.getSheetByName(nombreHoja);
    var data, esCsv;
    if (sh && sh.getLastRow() >= 2) {
      data = sh.getRange(2, 1, sh.getLastRow() - 1, totalColsHoja).getValues();
      esCsv = false;
    } else {
      var lectura = _obtenerFilasConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, DIR_TOTAL_COLS);
      if (lectura.origen !== 'csv') return; // sin hoja y sin CSV: esta fuente no aporta nada
      data = lectura.filas;
      esCsv = true;
    }

    var idxTag      = (esCsv ? DC.TAG      : IC.TAG)      - 1;
    var idxNombre   = (esCsv ? DC.NOMBRE   : IC.NOMBRE)   - 1;
    var idxNomMulti = (esCsv ? DC.NOM_MULTI: IC.NOM_MULTI) - 1;
    var idxClan     = (esCsv ? DC.CLAN     : IC.CLAN)     - 1;
    var idxEstado   = (esCsv ? DC.ESTADO   : IC.ESTADO)   - 1;

    for (var i = 0; i < data.length; i++) {
      if (resultados.length >= LIMITE_RESULTADOS) return;
      var f = data[i];
      var tag = String(f[idxTag] || '').trim();
      if (!tag) continue;
      var tagKey = cleanTag(tag);
      if (tagsYaAgregados[tagKey]) continue;

      var nombre = String(f[idxNombre] || '');
      var nomMulti = String(f[idxNomMulti] || '');
      var coincide = _normalizar(nombre).indexOf(textoNorm) !== -1
        || _normalizar(nomMulti).indexOf(textoNorm) !== -1
        || _normalizar(tagKey).indexOf(textoNorm.replace(/#/g, '')) !== -1;
      if (!coincide) continue;

      tagsYaAgregados[tagKey] = true;
      resultados.push({
        tag:      tag,
        nombre:   nombre,
        nomMulti: nomMulti,
        clan:     String(f[idxClan] || ''),
        estado:   estadoForzado || (String(f[idxEstado] || '').trim() || 'Inactivo')
      });
    }
  }

  // 1) Directorio: cubre Activos y admins Inactivos; no se fuerza `estado`, se lee la celda de cada fila (de la hoja o del CSV). [→ Contexto_Base_Web.md §37B191]
  _procesarHoja(CFG.SHEETS.DIRECTORIO, DIR_SHEET_COLS, 'Backup_Directorio.csv', null);

  // 2) Inactivos: toda fila es una cuenta que salió de los 4 clanes; se fuerza 'Inactivo' sin depender de la celda Estado (hoja o CSV). [→ Contexto_Base_Web.md §37B192]
  _procesarHoja(CFG.SHEETS.INACTIVOS, INACTIVOS_TOTAL_COLS, 'Backup_Inactivos.csv', 'Inactivo');

  return { ok: true, resultados: resultados };
}

// _webAdminGuardarGestion(token, datos): datos = {tag, prefijo, celular, nomMulti, prestamo}; guarda los 4 campos de gestión reutilizando _guardarRegistroNuevoMiembro() (11_DirectorioSheet.gs), la misma función del flujo GESTION_PRESTAMO del bot (44_BotWhatsApp.gs), para que panel y bot escriban igual; requiere sesión de admin. [→ Contexto_Base_Web.md §37B193]
function _webAdminGuardarGestion(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!datos || !datos.tag) return { ok: false, error: 'Falta el Tag del jugador.' };
  return _guardarRegistroNuevoMiembro(datos);
}

// _webAdminVerificarTag(token, tag): FASE 4 web (arquitectura-web-familia-terna.md, Sección 7.4, Paso 1); verifica el Tag contra la API de Clash Royale antes de completar el registro; única fuente: proxy de Supercell con un solo intento (_webApiGetRapido(), no _apiGet() con 3 reintentos); FIX 09-sep-2026: se quitó el respaldo HTML contra royaleapi.com (Cloudflare devuelve 403 y solo agregaba demora; mismo criterio que _webPerfilJugadorSinRegistro()); requiere la Función "Registrar miembro nuevo". @returns {{ok, error?, fuente?, jugador?:{tag,nombre,clan}}} [→ Contexto_Base_Web.md §37B194]
function _webAdminVerificarTag(token, tag) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin || !_webAdminTieneFuncion(admin.funciones, 'Registrar miembro nuevo')) {
    return { ok: false, error: 'No tienes permiso para registrar miembros nuevos.' };
  }

  var tagNorm = cleanTag(tag);
  if (!tagNorm) return { ok: false, error: 'Ingresa un Tag.' };

  // Única fuente: proxy de Supercell, un solo intento (ver _webApiGetRapido()). [→ Contexto_Base_Web.md §37B195]
  var data = _webApiGetRapido('/players/' + encodeTag('#' + tagNorm));
  if (data && data.name) {
    return {
      ok: true,
      fuente: 'Supercell',
      jugador: {
        tag: '#' + tagNorm,
        nombre: data.name,
        clan: (data.clan && data.clan.name) || ''
      }
    };
  }

  return { ok: false, error: 'No encontré ese Tag en la API de Clash Royale. Verifica que esté bien escrito (incluyendo mayúsculas/minúsculas y los caracteres tras el #), o vuelve a intentar en unos segundos si el proxy se estaba reactivando.' };
}

// _webAdminRegistrarNuevo(token, datos): FASE 4 web (Sección 7.4, Paso 2); datos = {tag, prefijo, celular, nomMulti, prestamo}; reutiliza _guardarRegistroNuevoMiembro() igual que _webAdminGuardarGestion() y el bot; verificar el Tag (Paso 1) es cosa de _webAdminVerificarTag(); requiere la Función "Registrar miembro nuevo". [→ Contexto_Base_Web.md §37B196]
function _webAdminRegistrarNuevo(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  // FIX B-32 (auditoría backend, 18-sep-2026): las Funciones se copian a la sesión al hacer login y no se releen hasta 6 h; se releen acá con _webBuscarAdminPorCelular() para que quitar "Registrar miembro nuevo" surta efecto de inmediato (igual que _webAdminEditarAutorAscenso()). [→ Contexto_Base_Web.md §37B197]
  var adminFresco = _webBuscarAdminPorCelular(admin.celular);
  if (!adminFresco || !_webAdminTieneFuncion(adminFresco.funciones, 'Registrar miembro nuevo')) {
    return { ok: false, error: 'No tienes permiso para registrar miembros nuevos.' };
  }
  if (!datos || !datos.tag) return { ok: false, error: 'Falta el Tag del jugador.' };
  return _guardarRegistroNuevoMiembro(datos);
}

// _webAdminListaMiembrosClan(token, clan): NUEVO 18-sep-2026; conecta la acción webAdminListaMiembrosClan que admin.html llama desde el 14-sep-2026 (cargarMiembrosClanNM(), modo "Buscar en Directorio" de "Registrar miembro nuevo"); devuelve los miembros ACTIVOS de UN clan leídos con _leerDirectorioFisicoComoDC() (mismo criterio que _webRosterCalcular()), SIN reordenar, porque el usuario pidió el orden de la hoja Directorio y el frontend (_renderListaMiembrosClanNM()) solo filtra; cada miembro = {tag, nombre, rango ('Líder'|'Colíder'|'Veterano'|'Miembro', normalizado porque el <select> del panel compara por igualdad exacta), celular ('' si no tiene)}; exige sesión y la Función "Registrar miembro nuevo"; `clan` obligatorio y uno de los 4 de _getNombresClanesTernaOrdenados() (ignora mayúsculas, tildes y espacios repetidos); GET, solo lectura. @returns {{ok, error?, clan?, miembros?}} [→ Contexto_Base_Web.md §37B198]
function _webAdminListaMiembrosClan(token, clan) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin || !_webAdminTieneFuncion(admin.funciones, 'Registrar miembro nuevo')) {
    return { ok: false, error: 'No tienes permiso para registrar miembros nuevos.' };
  }

  // Mismo criterio de normalización (minúsculas, sin tildes) que _webAdminBuscarMiembroSugerencias(). [→ Contexto_Base_Web.md §37B199]
  function _normalizar(v) {
    return String(v || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  var clanNorm = _normalizar(clan);
  if (!clanNorm) return { ok: false, error: 'Falta el clan.' };

  var nombresFamilia = _getNombresClanesTernaOrdenados();
  var nombreClan = '';
  for (var n = 0; n < nombresFamilia.length; n++) {
    if (_normalizar(nombresFamilia[n]) === clanNorm) { nombreClan = String(nombresFamilia[n]); break; }
  }
  if (!nombreClan) return { ok: false, error: 'Ese clan no pertenece a la Familia.' };

  // FIX 24-sep-2026 (auditoría fallback web->CSV): antes leía Directorio directo y devolvía error duro si la hoja fallaba, dejando inutilizable "Registrar miembro nuevo"; ahora usa _webLeerDirectorioComoDC() (cae a Backup_Directorio.csv), igual que _webRoster()/_webRankings(). [→ Contexto_Base_Web.md §37B200]
  var dataDir = _webLeerDirectorioComoDC().filas;

  function _rangoCanonico(v) {
    var key = _normalizar(v).replace(/[\s-]/g, '');
    if (key === 'lider')    return 'Líder';
    if (key === 'colider')  return 'Colíder';
    if (key === 'veterano') return 'Veterano';
    if (key === 'miembro')  return 'Miembro';
    return String(v || '').trim();
  }

  var miembros = [];
  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    if (_normalizar(fila[DC.CLAN - 1]) !== clanNorm) continue;
    var tag = String(fila[DC.TAG - 1] || '').trim();
    if (!tag) continue;
    miembros.push({
      tag:     tag,
      nombre:  String(fila[DC.NOMBRE - 1] || ''),
      rango:   _rangoCanonico(fila[DC.RANGO - 1]),
      celular: String(fila[DC.CELULAR - 1] || '').trim()
    });
  }

  return { ok: true, clan: nombreClan, miembros: miembros };
}

// _webAdminNomMultisExistentes(token): FASE 4 web (Sección 7.4, Paso 2); lista de Nom_Multi ya usados para poblar el <select> del registro (el frontend agrega "Ninguna de las anteriores"); reutiliza _obtenerNomMultisDistintos() (11_DirectorioSheet.gs); cualquier admin con sesión, sin exigir la Función puntual (solo lectura). @returns {{ok, error?, nomMultis?}} [→ Contexto_Base_Web.md §37B201]
function _webAdminNomMultisExistentes(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  return { ok: true, nomMultis: _obtenerNomMultisDistintos() };
}

// _webAdminNomMultisAdmins(token): FIX 05-sep-2026 ("dar la opción de registrar al autor del torneo"); envuelve _obtenerNomMultisAdmins() (13_Inactivos_Vetados.gs), la misma lista del dropdown "Autor" de Vetados: solo Nom_Multi de personas con Admin='Sí'; puebla el selector "¿Quién organizó el torneo?" del panel. @returns {{ok, error?, nomMultis?}} [→ Contexto_Base_Web.md §37B202]
function _webAdminNomMultisAdmins(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  return { ok: true, nomMultis: _obtenerNomMultisAdmins() };
}

// _webAdminCuentasDeNomMulti(token, nomMulti): FIX 12-sep-2026; envuelve _obtenerCuentasDeNomMulti() (13_Inactivos_Vetados.gs), wrapper fino como _webAdminNomMultisAdmins(); puebla el segundo <select> ("¿Con cuál cuenta organizó?", admin.html, cargarCuentasDelAutor()/initCuentaOrgBox()) con cada cuenta y su Clan/ClanTag ya resueltos desde Directorio. @returns {{ok, error?, cuentas?:[{tag,nombre,clan,clanTag}]}} [→ Contexto_Base_Web.md §37B203]
function _webAdminCuentasDeNomMulti(token, nomMulti) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var nm = String(nomMulti || '').trim();
  if (!nm) return { ok: false, error: 'Falta el Nom_Multi.' };
  return { ok: true, cuentas: _obtenerCuentasDeNomMulti(nm) };
}

// _webBuscarFilaVetoPorTag(tagNorm): FASE 4 web (Sección 7.5, Paso 3); helper interno de _webAdminVetar(); a diferencia de _webBuscarFilaDirectorioPorTag() (solo lee una fila DC) devuelve la hoja y el número de fila para ESCRIBIR; busca primero en Directorio y luego en Inactivos (el vetado debe poder aplicarse a quien ya pasó a Inactivos); ambas hojas comparten el layout IC de 29 columnas (IC/DIR_SHEET_COLS/INACTIVOS_TOTAL_COLS, 11_DirectorioSheet.gs). @returns {?{sh, row (1-based, con encabezado), cols}} o null si el Tag no está en ninguna. [→ Contexto_Base_Web.md §37B204]
function _webBuscarFilaVetoPorTag(tagNorm) {
  var ss = _getSs();
  var candidatos = [
    { nombre: CFG.SHEETS.DIRECTORIO, cols: DIR_SHEET_COLS },
    { nombre: CFG.SHEETS.INACTIVOS,  cols: INACTIVOS_TOTAL_COLS }
  ];
  for (var h = 0; h < candidatos.length; h++) {
    var sh = ss.getSheetByName(candidatos[h].nombre);
    if (!sh || sh.getLastRow() < 2) continue;
    var lastRow = sh.getLastRow();
    var tags = sh.getRange(2, IC.TAG, lastRow - 1, 1).getValues();
    for (var i = 0; i < tags.length; i++) {
      if (cleanTag(tags[i][0]) === tagNorm) {
        return { sh: sh, row: i + 2, cols: candidatos[h].cols };
      }
    }
  }
  return null;
}

// _webAdminVetar(token, datos): FASE 4 web (Sección 7.5); datos = {tag, razon, comentario}; vetado de un solo sentido (no hay "desvetar" desde la web, ver 13_Inactivos_Vetados.gs); pasos: 1-2 sesión y Función "Vetar"; 3 buscar el Tag con _webBuscarFilaVetoPorTag(); 4-5 el Clan de esa fila debe estar en los Clanes_Admin del admin logueado (nunca se confía en un clan mandado por el cliente); 5b la Razón debe estar en CFG.RAZON_VALORES_VALIDOS; 6 escribir Vetado='Sí' y Razón; 7 _registrarVetadoConfirmado() (13_Inactivos_Vetados.gs); 8 upsert en Vetados con _upsertVetadoDesdeWeb(); 9 comentario automático con _webAgregarComentarioVeto(); requiere la Función "Vetar". [→ Contexto_Base_Web.md §37B205]
function _webAdminVetar(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  // FIX B-32 (auditoría backend, 18-sep-2026): como en _webAdminRegistrarNuevo(), se relee al admin por su Celular justo antes de vetar para no confiar en `funciones` ni `clanesAdmin` copiados a la sesión (hasta WEB_SESSION_DURACION_SEG de antigüedad); quitar "Vetar" o cambiar Clanes_Admin aplica de inmediato. [→ Contexto_Base_Web.md §37B206]
  var adminFresco = _webBuscarAdminPorCelular(admin.celular);
  if (!adminFresco || !_webAdminTieneFuncion(adminFresco.funciones, 'Vetar')) {
    return { ok: false, error: 'No tienes permiso para vetar.' };
  }
  if (!datos || !datos.tag) return { ok: false, error: 'Falta el Tag del jugador a vetar.' };

  var tagNorm = cleanTag(datos.tag);
  if (!tagNorm) return { ok: false, error: 'Tag inválido.' };

  // FIX 24-sep-2026 (confirmado con el usuario): _webBuscarFilaVetoPorTag() no tiene fallback a CSV (vetar escribe sobre la hoja viva); antes corría sin try/catch y, si Sheets fallaba, la excepción subía al catch genérico de doPost() ("Ocurrió un error interno"); ahora da un mensaje claro como el resto de funciones del archivo. [→ Contexto_Base_Web.md §37B207]
  var ubicacion;
  try {
    ubicacion = _webBuscarFilaVetoPorTag(tagNorm);
  } catch (errVeto) {
    return { ok: false, error: 'No pudimos conectar con la hoja de Directorio/Inactivos, intenta de nuevo en un momento.' };
  }
  if (!ubicacion) return { ok: false, error: 'No encontré ese Tag en Directorio ni en Inactivos.' };

  var clanDelTag = String(ubicacion.sh.getRange(ubicacion.row, IC.CLAN).getValue() || '').trim();
  var clanesAdminLista = String(adminFresco.clanesAdmin || '').split(',').map(function (c) { return c.trim(); });
  if (clanesAdminLista.indexOf(clanDelTag) === -1) {
    return { ok: false, error: 'No administras el clan "' + clanDelTag + '".' };
  }

  var razon = String((datos && datos.razon) || '').trim();
  if (!esRazonValida(razon)) return { ok: false, error: 'Selecciona una Razón válida.' };

  var tagConHash = String(ubicacion.sh.getRange(ubicacion.row, IC.TAG).getValue() || '').trim();

  ubicacion.sh.getRange(ubicacion.row, IC.VETADO).setValue('Sí');
  ubicacion.sh.getRange(ubicacion.row, IC.RAZON).setValue(razon);

  _registrarVetadoConfirmado(cleanTag(tagConHash));

  var filaOrigenIC = ubicacion.sh.getRange(ubicacion.row, 1, 1, ubicacion.cols).getValues()[0];
  var autor = admin.nomMulti || admin.nombre || '';
  var ahora = new Date();

  _upsertVetadoDesdeWeb(tagConHash, filaOrigenIC, razon, autor, 'Web', ahora);

  var comentario = String((datos && datos.comentario) || '').trim();
  _webAgregarComentarioVeto(filaOrigenIC, autor, ahora, razon, comentario);

  return { ok: true };
}

// _webMisCuentas(token): FIX 03-sep-2026 (punto 17, "mostrar primero la lista de cuentas del admin, por clan y rol, con desempeño/estadísticas"); mismo agrupamiento por clan (orden CFG.TERNA_TAGS primero, resto después) y orden por rango (CFG.RANGO_ORDEN) que el saludo del bot (_msgBienvenidaAdmin(), 44_BotWhatsApp.gs), pero leyendo _leerDirectorioFisicoComoDC() para sumar Copas/V.Guerra/Torneos/Vigencia por cuenta; una cuenta aparece si y solo si el bot también la reconocería para ese número (mismo campo que el login: Prefijo+Celular); NOTA: no incluye Ataques/Puntaje/Barcos de la semana, porque ese bloque de lectura de Guerra está repetido inline en _construirIngresosRecientesUnificado() y aún no es reutilizable. @returns {{ok, error?, nombreAdmin?, clanes?:[{nombre, cuentas}], fueraComunidad?}} [→ Contexto_Base_Web.md §37B208]
function _webMisCuentas(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin || !admin.celular) return { ok: false, error: 'No se pudo identificar la sesión.' };

  // FIX 24-sep-2026 (auditoría fallback web->CSV): mismo cambio que _webRankings(); antes leía Directorio directo, sin fallback a Backup_Directorio.csv. [→ Contexto_Base_Web.md §37B209]
  var dataDir = _webLeerDirectorioComoDC().filas;
  var telLimpio = soloDigitos(admin.celular);

  function _ordenRango(rango) {
    var key = String(rango || '').toLowerCase().replace('í', 'i').replace('é', 'e');
    return CFG.RANGO_ORDEN[key] || 4;
  }

  var porClan = {};   // claveClan -> { nombre, cuentas:[...] }
  var fueraComunidad = [];
  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    var prefijoCelda  = soloDigitos(fila[DC.PREFIJO - 1]);
    var celCelda      = soloDigitos(fila[DC.CELULAR - 1]);
    var completoCelda = prefijoCelda + celCelda;
    var coincide = (celCelda && celCelda === telLimpio) || (completoCelda && completoCelda === telLimpio);
    if (!coincide) continue;

    var clanTagFila  = String(fila[DC.CLAN_TAG - 1] || '').trim();
    var vetadoFila   = String(fila[DC.VETADO   - 1] || '').trim().toLowerCase();
    var esVetado     = (vetadoFila === 'sí' || vetadoFila === 'si') || (clanTagFila === CFG.VETADO_TAG);

    var cuenta = {
      tag:      String(fila[DC.TAG    - 1] || ''),
      nombre:   String(fila[DC.NOMBRE - 1] || ''),
      rango:    String(fila[DC.RANGO  - 1] || 'Miembro'),
      copas:    Number(fila[DC.COPAS    - 1]) || 0,
      vGuerra:  Number(fila[DC.V_GUERRA - 1]) || 0,
      torneos:  Number(fila[DC.TORNEOS  - 1]) || 0,
      vigencia: fila[DC.VIGENCIA - 1] || ''
    };

    if (esVetado) { fueraComunidad.push(cuenta); continue; }

    var clanNombre = String(fila[DC.CLAN - 1] || 'Sin clan');
    var claveClan  = clanTagFila || 'SIN_CLAN';
    if (!porClan[claveClan]) porClan[claveClan] = { nombre: clanNombre, cuentas: [] };
    porClan[claveClan].cuentas.push(cuenta);
  }

  var clavesYaUsadas = {};
  var clavesOrdenadas = [];
  for (var t = 0; t < CFG.TERNA_TAGS.length; t++) {
    if (porClan[CFG.TERNA_TAGS[t]]) { clavesOrdenadas.push(CFG.TERNA_TAGS[t]); clavesYaUsadas[CFG.TERNA_TAGS[t]] = true; }
  }
  for (var claveResto in porClan) {
    if (!clavesYaUsadas[claveResto]) clavesOrdenadas.push(claveResto);
  }

  var clanes = clavesOrdenadas.map(function (clave) {
    var info = porClan[clave];
    var cuentasOrd = info.cuentas.slice().sort(function (a, b) {
      var rA = _ordenRango(a.rango), rB = _ordenRango(b.rango);
      if (rA !== rB) return rA - rB;
      return a.nombre.localeCompare(b.nombre);
    });
    return { nombre: info.nombre, cuentas: cuentasOrd };
  });

  return {
    ok: true,
    nombreAdmin: admin.nomMulti || admin.nombre || 'Administrador',
    clanes: clanes,
    fueraComunidad: fueraComunidad
  };
}

// _webAdminCategorias(token): FASE 2 (24-ago-2026); visor de contenido de solo lectura; reutiliza _categoriasDisponibles(true) (44_BotWhatsApp.gs); historial de FIX: 30-ago-2026 se ocultan las categorías de FLUJO/ACCIÓN (Gestionar información de miembros, Torneos, Sorteos, Información sobre mí, Información sobre el clan) porque no tienen filas de Menú/Mensajes y el visor no tiene nada que mostrar (las tres primeras tienen sección propia en admin.html); 30-ago-2026 (2ª vuelta) WEB_SECCIONES_CONTENIDO agrupa por temática y la respuesta trae `secciones` y, por compatibilidad, `categorias` plano; 03-sep-2026 (punto 18) las 4 de "Mensajes automáticos" van en orden alfabético y el orden temático ['Bienvenida','Etiqueta de miembro','Día de guerra','Mensaje de Guerra'] queda SIN aplicar hasta que el usuario lo confirme; 03-sep-2026 (punto 20) WEB_ETIQUETAS_CONTENIDO mapea nombre real -> etiqueta del panel sin renombrar la categoría (solo 'Bienvenida' -> 'Bienvenida de miembros' estaba confirmado); 05-sep-2026 `disponibles` se arma con _leerCategoriasDeExtra() sin el filtro de día para poder alternar guerra/entrenamiento (la causa real del mensaje de entrenamiento "faltante" no era un problema de sync), y se suman las etiquetas 'Mensaje de Guerra' -> 'Mensaje de ataques pendientes' y 'Ascensos y descensos' -> 'Cambio de rango'. [→ Contexto_Base_Web.md §37B210]
var WEB_CATEGORIAS_SIN_CONTENIDO_PLANO = [
  'Gestionar información de miembros', 'Torneos', 'Sorteos',
  'Información sobre mí', 'Información sobre el clan'
];
var WEB_ETIQUETAS_CONTENIDO = {
  'Bienvenida':            'Bienvenida de miembros',
  'Mensaje de Guerra':     'Mensaje de ataques pendientes',
  'Ascensos y descensos':  'Cambio de rango'
};
// FIX 05-sep-2026: la agrupación temática real vive hardcodeada en admin.html (estructura curada con tarjetas: toggle Guerra/Entrenamiento/Mazos, toggle Participantes/Ganadores para Torneos y Sorteos); WEB_SECCIONES_CONTENIDO se mantiene solo por compatibilidad con `secciones` (el frontend actual ya no lo consume). [→ Contexto_Base_Web.md §37B211]
var WEB_SECCIONES_CONTENIDO = [
  { titulo: '💬 Guerra, entrenamiento y mazos', categorias: ['Día de guerra', 'Defensas de barcos', 'Mazos', 'Mensaje de Guerra'] },
  { titulo: '🏆 Torneos, sorteos y ascensos',   categorias: ['Participantes calificados (torneo)', 'Ganadores (torneo)', 'Participantes calificados (sorteo)', 'Ganadores (sorteo)', 'Ascensos y descensos'] },
  { titulo: '📨 Mensajes que no suelen enviarse', categorias: ['Bienvenida', 'iPhone', 'Etiqueta de miembro', 'Celular', 'Descripción'] }
];
function _webAdminCategorias(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var disponibles = _leerCategoriasDeExtra().filter(function (c) {
    return WEB_CATEGORIAS_SIN_CONTENIDO_PLANO.indexOf(c) === -1;
  });

  // NUEVO 19-sep-2026 ("cat_disp sí se debe usar"): la lista se filtra además por el Cat_disp del admin de la sesión, releído FRESCO de Administradores con _catDispDeTelefono() (44_BotWhatsApp.gs; ámbito global compartido entre .gs), nunca de lo copiado a la sesión; Cat_disp vacía o no disponible = sin restricción. [→ Contexto_Base_Web.md §37B212]
  var sesionAdmin = _webAuthObtenerAdmin(token);
  var catDisp = sesionAdmin ? _catDispDeTelefono(sesionAdmin.celular) : [];
  if (catDisp.length > 0) {
    disponibles = disponibles.filter(function (c) { return catDisp.indexOf(c) >= 0; });
  }

  var disponiblesSet = {};
  disponibles.forEach(function (c) { disponiblesSet[c] = true; });

  var mapeadas = {};
  var secciones = WEB_SECCIONES_CONTENIDO.map(function (s) {
    var cats = s.categorias.filter(function (c) {
      mapeadas[c] = true;
      return disponiblesSet[c];
    });
    return { titulo: s.titulo, categorias: cats };
  }).filter(function (s) { return s.categorias.length > 0; });

  var sinSeccion = disponibles.filter(function (c) { return !mapeadas[c]; });
  if (sinSeccion.length) secciones.push({ titulo: 'Otros', categorias: sinSeccion });

  // FIX 03-sep-2026 (punto 20): etiquetas bonitas para el panel en paralelo al nombre real, que sigue viajando en 'categorias'/'secciones' para no romper las llamadas de admin.html a _webAdminContenido(token, categoriaReal). [→ Contexto_Base_Web.md §37B213]
  var etiquetas = {};
  disponibles.forEach(function (c) { etiquetas[c] = WEB_ETIQUETAS_CONTENIDO[c] || c; });

  return { ok: true, categorias: disponibles, secciones: secciones, etiquetas: etiquetas };
}

// _webAdminContenido(token, categoria): FASE 2 (24-ago-2026); visor de solo lectura; reutiliza _obtenerOpcionesClanCategoria() (44_BotWhatsApp.gs) con el mismo orden de fuentes que el bot (FUENTES_CONTENIDO); NO usa _obtenerContenidoMenu()/_obtenerContenidoPlantilla() (30_Mensajes.gs) porque siguen apuntando a la hoja Plantillas, que ya no existe; DELIBERADAMENTE solo lectura: Menú y Mensajes se reconstruyen enteros en cada corrida, así que una edición manual se perdería (lo Estático se edita en los Google Docs de Plantillas en Drive); FIX 30-ago-2026 cacheada 60 s con _webCacheado() por categoría, sin el token en la clave (el contenido no depende del admin); NUEVO 19-sep-2026 valida también acá que la categoría esté en el Cat_disp del admin de la sesión; NUEVO 05-oct-2026 suma `elaboracion` = {aplica, generadosTs, generadosLima, cantidad, origen} (aplica solo para Mensaje de Guerra, Celular y Etiqueta de miembro, ver TIEMPOS_CATEGORIAS_MENSAJES_GENERADOS en 42_Web_TiemposActualizacion.gs), se lee fresca fuera de la caché de 60 s y puede ser null. @returns {{ok, error?, opciones?, elaboracion?}} [→ Contexto_Base_Web.md §37B214]
function _webAdminContenido(token, categoria) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!categoria) return { ok: false, error: 'Falta la categoría.' };

  var sesionAdmin = _webAuthObtenerAdmin(token);
  var catDisp = sesionAdmin ? _catDispDeTelefono(sesionAdmin.celular) : [];
  if (catDisp.length > 0 && catDisp.indexOf(categoria) === -1) {
    return { ok: false, error: 'No tienes acceso a esta categoría.' };
  }

  var opciones = _webCacheado('web_admin_contenido_v1_' + categoria, 60, function () {
    return _obtenerOpcionesClanCategoria(categoria);
  });

  // NUEVO 05-oct-2026: hora de elaboración de los mensajes generados; un fallo (o subir este archivo antes que el "51") deja elaboracion en null y no afecta a `opciones`. [→ Contexto_Base_Web.md §37B215]
  var elaboracion = null;
  try {
    elaboracion = _tiemposMensajesWeb_();
    elaboracion.aplica = _tiemposCategoriaEsGenerada_(categoria);
  } catch (eElab) {
    Logger.log('[WebContenido] No se pudo armar la hora de elaboracion: ' + eElab.message);
    elaboracion = null;
  }
  return { ok: true, opciones: opciones, elaboracion: elaboracion };
}

// _webAdminDocIdsValidos(): FIX 03-sep-2026; lista blanca de TODOS los docId que el backend le ofrece al panel (recorre cada categoría de _categoriasDisponibles(true) y junta el docId de cada opción de _obtenerOpcionesClanCategoria(), las mismas funciones de _webAdminCategorias/_webAdminContenido, así no se desalinea); _webAdminContenidoDocHtml() la exige antes de leer el Doc; cacheada 60 s con _webCacheado() (no depende del admin). @returns {Object} mapa {docId: true} [→ Contexto_Base_Web.md §37B216]
function _webAdminDocIdsValidos() {
  return _webCacheado('web_admin_docids_validos_v1', 60, function () {
    var mapa = {};
    _categoriasDisponibles(true).forEach(function (categoria) {
      (_obtenerOpcionesClanCategoria(categoria) || []).forEach(function (o) {
        if (o.docId) mapa[o.docId] = true;
      });
    });
    return mapa;
  });
}

// _webAdminContenidoDocHtml(token, docId): FIX 03-sep-2026; reemplaza el <iframe .../preview> del botón "Ver original" (siempre pagina con márgenes de impresión y no se puede estilar por ser docs.google.com) por el HTML del Doc, pedido con GET a .../export?format=html y pintado en un <div class="doc-original"> con CSS propio; DELIBERADAMENTE solo lectura (la web no debe modificar los Docs, que el backend reescribe en cada corrida): sin métodos de escritura de DocumentApp/DriveApp, solo getMimeType y el GET, con el mismo ScriptApp.getOAuthToken() que ya usa el proyecto (sin scopes nuevos); cierre de brecha: el docId debe estar en la lista blanca de _webAdminDocIdsValidos() y luego se confirma el MimeType; un docId ajeno devuelve el mismo error genérico que uno inexistente ("No se encontró el documento original"). @returns {{ok, error?, html?}} [→ Contexto_Base_Web.md §37B217]
function _webAdminContenidoDocHtml(token, docId) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  docId = String(docId || '').trim();
  if (!docId) return { ok: false, error: 'Falta el docId.' };
  if (!_webAdminDocIdsValidos()[docId]) {
    return { ok: false, error: 'No se encontró el documento original.' };
  }

  var archivo;
  try {
    archivo = DriveApp.getFileById(docId);
  } catch (err) {
    return { ok: false, error: 'No se encontró el documento original.' };
  }
  if (archivo.getMimeType() !== MimeType.GOOGLE_DOCS) {
    return { ok: false, error: 'El archivo original no es un Google Doc.' };
  }

  try {
    var url = 'https://docs.google.com/document/d/' + encodeURIComponent(docId) + '/export?format=html';
    var resp = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() !== 200) {
      return { ok: false, error: 'Google no devolvió el documento (código ' + resp.getResponseCode() + ').' };
    }
    var htmlCompleto = resp.getContentText();
    // El export de Google trae un <html> completo; solo interesa lo de adentro del <body>: el <head> (clases .cN con ancho/margen de página) y el tag <body> (padding/max-width inline) se descartan a propósito porque causan los márgenes; el panel aplica su CSS (.doc-original) sobre los párrafos/listas internos, que conservan su formato por estilo inline. [→ Contexto_Base_Web.md §37B218]
    var m = htmlCompleto.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    var cuerpo = m ? m[1] : htmlCompleto;
    // Defensa mínima antes de inyectar en el DOM del panel: el export de Google no trae <script>, pero se quita igual por las dudas. [→ Contexto_Base_Web.md §37B219]
    cuerpo = cuerpo.replace(/<script[\s\S]*?<\/script>/gi, '');
    return { ok: true, html: cuerpo };
  } catch (err) {
    Logger.log('[Web] Error interno leyendo el documento: ' + err.toString());
    return { ok: false, error: 'Error leyendo el documento. Intenta de nuevo en unos segundos.' };
  }
}

// _webAdminTorneosHoy(): FASE 3 (25-ago-2026, pedido del usuario — gestión de torneos). Envuelve TAL CUAL _listarTorneosDeHoy() (26_Torneos_Core.gs) — la MISMA lista que ve un admin al elegir "Modificar datos de torneo existente" por WhatsApp (solo… [→ Contexto_Base_Web.md §37B220]
function _webAdminTorneosHoy(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  return { ok: true, torneos: _listarTorneosDeHoy() };
}

// _webAdminSemanasRecientes(): FIX (11-sep-2026, pedido usuario — conectar el selector de semanas de admin.html a un backend real): devuelve las semanas (lunes a domingo) con su Temporada/Semana REALES (misma fuente que TL.TEMPORADA --… [→ Contexto_Base_Web.md §37B221]
function _webAdminSemanasRecientes(token, todasSemanasVigente) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var ctx = _getCtx();
  var temporadaAnterior = Number(ctx.temporada) - 1;
  var forzarTodasVigente = !!todasSemanasVigente &&
    String(todasSemanasVigente) !== 'false' && String(todasSemanasVigente) !== '0';

  var semanas = [];
  _agregarSemanasTemporadaAlSelectorRecientes(semanas, ctx, temporadaAnterior, false);
  _agregarSemanasTemporadaAlSelectorRecientes(semanas, ctx, ctx.temporada, forzarTodasVigente);
  semanas.reverse(); // de más reciente a más antigua, igual que antes

  return { ok: true, semanas: semanas };
}

// _agregarSemanasTemporadaAlSelectorRecientes(): Helper de _webAdminSemanasRecientes() (FIX 16-sep-2026, ver docblock de esa función arriba): agrega al array `semanas` (in-place, orden ascendente por semana) las entradas {lunesIso, domingoIso, temporada, semana} de UNA… [→ Contexto_Base_Web.md §37B222]
function _agregarSemanasTemporadaAlSelectorRecientes(semanas, ctx, temporada, forzarTodas) {
  var lista = forzarTodas
    ? _getTodasLasSemanasTemporada(temporada)
    : _getSemanasTemporada(ctx, temporada);
  for (var i = 0; i < lista.length; i++) {
    var rango = _getRangoFechasSemana(temporada, lista[i].sectionIndex);
    if (!rango) continue;
    semanas.push({
      lunesIso: Utilities.formatDate(rango.inicio, 'America/Lima', 'yyyy-MM-dd'),
      domingoIso: Utilities.formatDate(rango.fin, 'America/Lima', 'yyyy-MM-dd'),
      temporada: Number(temporada),
      semana: lista[i].sectionIndex + 1
    });
  }
}

// _getTodasLasSemanasTemporada(): NUEVO (16-sep-2026, pedido del usuario -- selector de semanas de CR_Lista, ver docblock de _webAdminSemanasRecientes() arriba): TODAS las semanas (1..4 o 1..5) de `temporada`, calculadas por CALENDARIO -- reusa TAL CUAL… [→ Contexto_Base_Web.md §37B223]
function _getTodasLasSemanasTemporada(temporada) {
  var numSemanas = _getSemanasDeTemporada(Number(temporada)) || 0;
  var semanas = [];
  for (var s = 0; s < numSemanas; s++) semanas.push({ sectionIndex: s });
  return semanas;
}

// _webAdminSemanasDeTemporada(): NUEVO (07-oct-2026, pedido del usuario -- selector de semanas de CR_Lista en admin.html): TODAS las semanas (4 o 5) de UNA temporada cualquiera, con su rango real lunes-domingo. Sirve para elegir semanas de cualquier temporada ya… [→ Contexto_Base_Web.md §37B224]
function _webAdminSemanasDeTemporada(token, temporada) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var t = Number(temporada);
  if (!isFinite(t) || t < 1 || Math.floor(t) !== t) return { ok: false, error: 'Temporada inválida.' };
  var ctx = _getCtx();
  if (t > Number(ctx.temporada)) return { ok: false, error: 'Esa temporada todavía no existe.' };

  var pl = primerLunesTemporada(CFG.REF_DEFAULT, t);
  if (!pl || isNaN(pl.getTime())) return { ok: true, semanas: [] };
  var numSemanas = _getSemanasDeTemporada(t) || 0;

  var semanas = [];
  for (var s = 0; s < numSemanas; s++) {
    var rango = _getRangoFechasSemana(t, s);
    if (!rango) continue;
    semanas.push({
      lunesIso: Utilities.formatDate(rango.inicio, 'America/Lima', 'yyyy-MM-dd'),
      domingoIso: Utilities.formatDate(rango.fin, 'America/Lima', 'yyyy-MM-dd'),
      temporada: t,
      semana: s + 1
    });
  }
  semanas.reverse(); // de más reciente a más antigua, igual que _webAdminSemanasRecientes()

  return { ok: true, semanas: semanas };
}

// _webAdminClanesFamilia(): NUEVO (12-sep-2026, pedido del usuario -- consolidado sección 5.1, "CLANES_REQUISITOS hardcodeado en admin.html porque no existe todavía un endpoint que los entregue"): endpoint de SOLO LECTURA que devuelve los 4 clanes de la… [→ Contexto_Base_Web.md §37B226]
function _webAdminClanesFamilia(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  return { ok: true, clanes: _getNombresClanesTernaOrdenados() };
}

// _webAdminRequisitosClanes(): NUEVO (12-sep-2026, pedido del usuario -- consolidado sección 5.1, "webAdminRequisitosClanes sigue sin existir"): endpoint de SOLO LECTURA que faltaba para que `cargarRequisitosPorClan()` (admin.html) pueda precargar el… [→ Contexto_Base_Web.md §37B225, §37B227]
function _webAdminRequisitosClanes(token, id) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var bloque = _getConfigMasRecienteCategoria('Torneo', id);
  if (id && !bloque.length) return { ok: false, error: 'No encontré el torneo ' + id + '.' };

  var requisitos = {};
  bloque.forEach(function (b) {
    requisitos[b.clan] = {
      minTrofeosGuerra: b.minT.qty,
      minAtaquesSemana: b.ataques.qty
    };
  });
  if (bloque.length) {
    requisitos.miembroActivo = bloque[0].miembroActivo.activo ? 'Sí' : 'No';
    requisitos.reaccion = bloque[0].reaccion.activo ? 'Sí' : 'No';
    requisitos.presenciaWhatsapp = bloque[0].whatsapp.activo ? 'Sí' : 'No';
    requisitos.barcos = bloque[0].barcos.activo ? String(bloque[0].barcos.qty) : '';
  }

  return { ok: true, requisitos: requisitos };
}

// _webAdminRequisitosClanesSorteo(): NUEVO (12-sep-2026, pedido del usuario -- consolidado sección 5.4, panel de Sorteos completo, backend): gemela de _webAdminRequisitosClanes() de arriba, mismo comportamiento exacto (mismo criterio de `id` opcional: puntual para… [→ Contexto_Base_Web.md §37B228, §37B229]
function _webAdminRequisitosClanesSorteo(token, id) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var bloque = _getConfigMasRecienteCategoria('Sorteo', id);
  if (id && !bloque.length) return { ok: false, error: 'No encontré el sorteo ' + id + '.' };

  var requisitos = {};
  bloque.forEach(function (b) {
    requisitos[b.clan] = {
      minTrofeosGuerra: b.minT.qty,
      minAtaquesSemana: b.ataques.qty,
      minTorneosJugados: b.torneos.qty
    };
  });
  if (bloque.length) {
    requisitos.delta = bloque[0].delta;
    requisitos.miembroActivo = bloque[0].miembroActivo.activo ? 'Sí' : 'No';
    requisitos.reaccion = bloque[0].reaccion.activo ? 'Sí' : 'No';
    requisitos.presenciaWhatsapp = bloque[0].whatsapp.activo ? 'Sí' : 'No';
    requisitos.barcos = bloque[0].barcos.activo ? String(bloque[0].barcos.qty) : '';
  }

  return { ok: true, requisitos: requisitos };
}

// _webAdminTorneoRegistrar(): FASE 3 (25-ago-2026, pedido del usuario — gestión de torneos). Envuelve _registrarTorneoDesdeBot(link, fecha, hora, tagTorneoPrincipal, organizadorInfo) (26_Torneos_Core.gs) — la MISMA función que usa el bot en el paso "Ingresar… [→ Contexto_Base_Web.md §37B230, §37B231]
function _webAdminTorneoRegistrar(token, link, fecha, hora, tagTorneoPrincipal, autor, semanas, requisitos, comentario, tagOrg, clanOrg, clanTagOrg) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!link) return { ok: false, error: 'Falta el link del torneo.' };
  if (!fecha || !hora) return { ok: false, error: 'Falta la fecha u hora del torneo.' };

  var admin = _webAuthObtenerAdmin(token) || {};
  var nomMultiSesion = String(admin.nomMulti || admin.nombre || '').trim();
  var nomMultiElegido = String(autor || '').trim();
  var nomMultiEfectivo = nomMultiElegido || nomMultiSesion;

  var organizadorInfo = null;
  if (nomMultiEfectivo) {
    organizadorInfo = _buscarInfoOrganizadorPorNomMulti(nomMultiEfectivo) ||
      { nombre: nomMultiEfectivo, tag: '#MANUAL', clan: '', clanTag: '' };
    var tagOrgTrim = String(tagOrg || '').trim();
    if (tagOrgTrim) {
      organizadorInfo.tag = tagOrgTrim;
      organizadorInfo.clan = String(clanOrg || '').trim();
      organizadorInfo.clanTag = String(clanTagOrg || '').trim();
    }
  }

  return _registrarTorneoDesdeBot(link, fecha, hora, tagTorneoPrincipal, organizadorInfo, semanas, requisitos, comentario);
}

// _webAdminTorneoPlanificarGuardar(): FIX (05-sep-2026, pedido usuario — "Planificar torneo"): envuelve _planificarTorneoDesdeBot() (26_Torneos_Core.gs) para el paso nuevo "Planificar torneo" del panel web (admin.html) — permite cargar Fecha + Premios de un torneo… [→ Contexto_Base_Web.md §37B232, §37B233]
function _webAdminTorneoPlanificarGuardar(token, fecha, hora, premios, tagTorneoPrincipal, autor, semanas, requisitos, comentario, tagOrg, clanOrg, clanTagOrg) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!fecha || !hora) return { ok: false, error: 'Falta la fecha u hora del torneo.' };
  if (!premios) return { ok: false, error: 'Agrega al menos un premio.' };

  var admin = _webAuthObtenerAdmin(token) || {};
  var nomMultiSesion = String(admin.nomMulti || admin.nombre || '').trim();
  var nomMultiElegido = String(autor || '').trim();
  var nomMultiEfectivo = nomMultiElegido || nomMultiSesion;

  var organizadorInfo = null;
  if (nomMultiEfectivo) {
    organizadorInfo = _buscarInfoOrganizadorPorNomMulti(nomMultiEfectivo) ||
      { nombre: nomMultiEfectivo, tag: '#MANUAL', clan: '', clanTag: '' };
    var tagOrgTrim = String(tagOrg || '').trim();
    if (tagOrgTrim) {
      organizadorInfo.tag = tagOrgTrim;
      organizadorInfo.clan = String(clanOrg || '').trim();
      organizadorInfo.clanTag = String(clanTagOrg || '').trim();
    }
  }

  return _planificarTorneoDesdeBot(fecha, hora, premios, tagTorneoPrincipal, organizadorInfo, semanas, requisitos, comentario);
}

// _webAdminTorneoModificar(): FASE 3 (25-ago-2026, pedido del usuario — gestión de torneos). Envuelve TAL CUAL _modificarFechaHoraTorneo(id, fecha, hora, tagTorneoPrincipal) (26_Torneos_Core.gs) — la MISMA función que usa el bot en el paso "Modificar datos de… [→ Contexto_Base_Web.md §37B234, §37B235, §37B236, §37B237, §37B238, §37B239, §37B240]
function _webAdminTorneoModificar(token, id, fecha, hora, tagTorneoPrincipal, semanas, comentario, requisitos, autor, premios, tagOrg, clanOrg, clanTagOrg, link) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!fecha || !hora) return { ok: false, error: 'Falta la fecha u hora nueva.' };

  var nomMultiElegido = String(autor || '').trim();
  var organizadorInfo = null;
  if (nomMultiElegido) {
    organizadorInfo = _buscarInfoOrganizadorPorNomMulti(nomMultiElegido) ||
      { nombre: nomMultiElegido, tag: '#MANUAL', clan: '', clanTag: '' };
    var tagOrgTrim = String(tagOrg || '').trim();
    if (tagOrgTrim) {
      organizadorInfo.tag = tagOrgTrim;
      organizadorInfo.clan = String(clanOrg || '').trim();
      organizadorInfo.clanTag = String(clanTagOrg || '').trim();
    }
  }

  var linkTrim = String(link || '').trim();
  var idTrim = String(id || '').trim();
  var esCentinelaLink = (idTrim === '__link__');
  var esModoLink = esCentinelaLink || !!linkTrim;
  if (esModoLink) {
    if (!linkTrim) return { ok: false, error: 'Pega el link del torneo.' };
    if (!esCentinelaLink && idTrim) {
      var ssMod = _getSs();
      var resultadoCorreccion = _corregirLinkTorneoYaRegistrado(ssMod, idTrim, linkTrim);
      if (!resultadoCorreccion.ok) return resultadoCorreccion;
      if (!resultadoCorreccion.sinLinkPrevio) {
        procesarTListaNuevasFilas(ssMod);
        regenerarTControlSheet(ssMod);
        return { ok: true, id: idTrim, corregido: true };
      }
    }
    return _registrarTorneoDesdeBot(linkTrim, fecha, hora, tagTorneoPrincipal, organizadorInfo, semanas, requisitos, comentario);
  }

  if (!id) return { ok: false, error: 'Falta el ID del torneo.' };

  if (nomMultiElegido) {
    var organizadorFuenteActual = _obtenerOrganizadorFuenteTLista(id);
    if (organizadorFuenteActual === 'API') {
      return { ok: false, error: 'El organizador de este torneo ya quedó registrado automáticamente y no se puede editar a mano. Si está mal, corrige el link del torneo.' };
    }
  }

  return _modificarFechaHoraTorneo(id, fecha, hora, tagTorneoPrincipal, semanas, comentario, requisitos, organizadorInfo, premios);
}

// _webAdminSorteosHoy(): NUEVO (12-sep-2026, pedido del usuario -- consolidado sección 5.4, panel de Sorteos completo, backend). Envuelve TAL CUAL _listarSorteosDeHoy() (26_Torneos_Core.gs) -- mismo patrón que _webAdminTorneosHoy() de arriba, pero para… [→ Contexto_Base_Web.md §37B241]
function _webAdminSorteosHoy(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  return { ok: true, sorteos: _listarSorteosDeHoy() };
}

// _webAdminSorteoRegistrar(): NUEVO (12-sep-2026, pedido del usuario -- consolidado sección 5.4, panel de Sorteos completo, backend). Envuelve _registrarSorteoDesdeBot() (26_Torneos_Core.gs) -- mismo patrón EXACTO que _webAdminTorneoRegistrar() de arriba… [→ Contexto_Base_Web.md §37B242]
function _webAdminSorteoRegistrar(token, fecha, hora, idSorteoPrincipal, autor, semanas, requisitos, comentario, tagOrg, clanOrg, clanTagOrg) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!fecha || !hora) return { ok: false, error: 'Falta la fecha u hora del sorteo.' };

  var admin = _webAuthObtenerAdmin(token) || {};
  var nomMultiSesion = String(admin.nomMulti || admin.nombre || '').trim();
  var nomMultiElegido = String(autor || '').trim();
  var nomMultiEfectivo = nomMultiElegido || nomMultiSesion;

  var organizadorInfo = null;
  if (nomMultiEfectivo) {
    organizadorInfo = _buscarInfoOrganizadorPorNomMulti(nomMultiEfectivo) ||
      { nombre: nomMultiEfectivo, tag: '#MANUAL', clan: '', clanTag: '' };
    var tagOrgTrim = String(tagOrg || '').trim();
    if (tagOrgTrim) {
      organizadorInfo.tag = tagOrgTrim;
      organizadorInfo.clan = String(clanOrg || '').trim();
      organizadorInfo.clanTag = String(clanTagOrg || '').trim();
    }
  }

  return _registrarSorteoDesdeBot(fecha, hora, idSorteoPrincipal, organizadorInfo, semanas, requisitos, comentario);
}

// _webAdminSorteoPlanificarGuardar(): NUEVO (12-sep-2026, pedido del usuario -- consolidado sección 5.4, panel de Sorteos completo, backend). Envuelve _planificarSorteoDesdeBot() (26_Torneos_Core.gs) -- mismo patrón EXACTO que _webAdminTorneoPlanificarGuardar() de… [→ Contexto_Base_Web.md §37B243]
function _webAdminSorteoPlanificarGuardar(token, fecha, hora, premios, idSorteoPrincipal, autor, semanas, requisitos, comentario, tagOrg, clanOrg, clanTagOrg) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!fecha || !hora) return { ok: false, error: 'Falta la fecha u hora del sorteo.' };
  if (!premios) return { ok: false, error: 'Agrega al menos un premio.' };

  var admin = _webAuthObtenerAdmin(token) || {};
  var nomMultiSesion = String(admin.nomMulti || admin.nombre || '').trim();
  var nomMultiElegido = String(autor || '').trim();
  var nomMultiEfectivo = nomMultiElegido || nomMultiSesion;

  var organizadorInfo = null;
  if (nomMultiEfectivo) {
    organizadorInfo = _buscarInfoOrganizadorPorNomMulti(nomMultiEfectivo) ||
      { nombre: nomMultiEfectivo, tag: '#MANUAL', clan: '', clanTag: '' };
    var tagOrgTrim = String(tagOrg || '').trim();
    if (tagOrgTrim) {
      organizadorInfo.tag = tagOrgTrim;
      organizadorInfo.clan = String(clanOrg || '').trim();
      organizadorInfo.clanTag = String(clanTagOrg || '').trim();
    }
  }

  return _planificarSorteoDesdeBot(fecha, hora, premios, idSorteoPrincipal, organizadorInfo, semanas, requisitos, comentario);
}

// _webAdminSorteoModificar(): NUEVO (12-sep-2026, pedido del usuario -- consolidado sección 5.4, panel de Sorteos completo, backend). Envuelve _modificarFechaHoraSorteo() (26_Torneos_Core.gs) -- mismo patrón que _webAdminTorneoModificar() de arriba (mismo… [→ Contexto_Base_Web.md §37B244]
function _webAdminSorteoModificar(token, id, fecha, hora, idSorteoPrincipal, semanas, comentario, requisitos, autor, premios, tagOrg, clanOrg, clanTagOrg) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!fecha || !hora) return { ok: false, error: 'Falta la fecha u hora nueva.' };
  if (!id) return { ok: false, error: 'Falta el ID del sorteo.' };

  var nomMultiElegido = String(autor || '').trim();
  var organizadorInfo = null;
  if (nomMultiElegido) {
    organizadorInfo = _buscarInfoOrganizadorPorNomMulti(nomMultiElegido) ||
      { nombre: nomMultiElegido, tag: '#MANUAL', clan: '', clanTag: '' };
    var tagOrgTrim = String(tagOrg || '').trim();
    if (tagOrgTrim) {
      organizadorInfo.tag = tagOrgTrim;
      organizadorInfo.clan = String(clanOrg || '').trim();
      organizadorInfo.clanTag = String(clanTagOrg || '').trim();
    }
  }

  return _modificarFechaHoraSorteo(id, fecha, hora, idSorteoPrincipal, semanas, comentario, requisitos, organizadorInfo, premios);
}

// _webAdminGanadoresTorneoDetalle(): FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y desempates de torneos). Versión de SOLO-ADMIN de _webGanadoresTorneoMasReciente() para la sección "Ganadores del torneo más reciente" del panel (admin.html): el… [→ Contexto_Base_Web.md §37B245]
function _webAdminGanadoresTorneoDetalle(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var ss = _getSs();
  // FASE (15-sep-2026, pedido del usuario -- fallback web->CSV, continuación de _webGanadoresTorneoMasReciente() más arriba en este archivo): T_Lista ya no se lee con shTL.getRange() directo -- se usa _obtenerFilasConFallbackCSV()… [→ Contexto_Base_Web.md §37B246]
  var lecturaTL = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_LISTA, 'Backup_T_Lista.csv', TL_TOTAL_COLS, 2);
  if (lecturaTL.origen === 'vacio') {
    return { ok: true, idTorneo: null, fecha: null, top3: [], participantes: [] };
  }

  var listaData = lecturaTL.filas;
  if (lecturaTL.origen === 'csv') {
    // Igual que en _webGanadoresTorneoMasReciente(): el CSV guarda Fecha como texto canónico, no como objeto Date -- hay que reconstruirla antes del filtro `instanceof Date` de más abajo. [→ Contexto_Base_Web.md §37B247]
    listaData = listaData.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[TL.FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[TL.FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  // FIX (13-sep-2026, pedido del usuario -- FASE 0 del plan de corrección Torneo/Sorteo): esta función quedó afuera del barrido original y seguía calculando "mayor Fecha" a mano, sin consultar Extra!Torneo_Vigente_ID. Mismo criterio… [→ Contexto_Base_Web.md §37B248]
  var idMasReciente = null, fechaMasReciente = null;
  var idVigenteExtraTorneo = _getIdVigenteExtra('Torneo');
  if (idVigenteExtraTorneo) {
    for (var i = 0; i < listaData.length; i++) {
      if (String(listaData[i][TL.ID - 1] || '') === idVigenteExtraTorneo) {
        idMasReciente = listaData[i][TL.ID - 1];
        fechaMasReciente = listaData[i][TL.FECHA - 1];
        break;
      }
    }
  }
  if (!idMasReciente) {
    for (var i = 0; i < listaData.length; i++) {
      var f = listaData[i][TL.FECHA - 1];
      if (f instanceof Date && (!fechaMasReciente || f > fechaMasReciente)) {
        fechaMasReciente = f;
        idMasReciente = listaData[i][TL.ID - 1];
      }
    }
  }
  if (!idMasReciente) return { ok: true, idTorneo: null, fecha: null, top3: [], participantes: [] };

  var resultado = _getParticipantesFusionadosPorTorneo(ss, idMasReciente);
  var celularPorTag = _webCelularPorTag(ss);
  // NUEVO (14-sep-2026, pedido del usuario -- cierre del CONTRATO PENDIENTE "Marcar visto en el grupo"): mismo criterio que celularPorTag arriba, una sola lectura de Grupo_Verificado para todo el listado en vez de una consulta por… [→ Contexto_Base_Web.md §37B249]
  var tagsVistosEnGrupo = _getTagsVistosEnGrupo();
  var mapear = function (p) { return _webMapearParticipanteAdminResolucion(p, celularPorTag, tagsVistosEnGrupo); };
  var top3 = _topNTrasResoluciones(resultado.participantes, 3).map(mapear);
  var participantes = resultado.participantes
    .filter(function (p) { return p.victorias > 0; })
    .map(mapear);

  return { ok: true, idTorneo: idMasReciente, fecha: fechaMasReciente.toISOString(), top3: top3, participantes: participantes };
}

// _webCelularPorTag(): Helper de _webAdminGanadoresTorneoDetalle() (FIX 09-sep-2026) — arma un mapa Tag (sin '#', mayúsculas) -> { prefijo, celular } leyendo Directorio + Inactivos UNA sola vez (mismas dos hojas físicas, formato IC de 29 columnas, que… [→ Contexto_Base_Web.md §37B250]
function _webCelularPorTag(ss) {
  var mapa = {};

  function _procesarHoja(nombreHoja, totalCols) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh || sh.getLastRow() < 2) return;
    var data = sh.getRange(2, 1, sh.getLastRow() - 1, totalCols).getValues();
    for (var i = 0; i < data.length; i++) {
      var f = data[i];
      var tag = String(f[IC.TAG - 1] || '').trim();
      if (!tag) continue;
      var celular = String(f[IC.CELULAR - 1] || '').trim();
      if (!celular) continue;
      mapa[cleanTag(tag)] = {
        prefijo: String(f[IC.PREFIJO - 1] || ''),
        celular: celular
      };
    }
  }

  _procesarHoja(CFG.SHEETS.DIRECTORIO, DIR_SHEET_COLS);
  _procesarHoja(CFG.SHEETS.INACTIVOS, INACTIVOS_TOTAL_COLS);

  return mapa;
}

// _webMapearParticipanteAdminResolucion(): Helper de _webAdminGanadoresTorneoDetalle() — proyecta un participante ya enriquecido por _aplicarResolucionesTorneo() (26_Torneos_Core.gs) al shape que consume admin.html, incluyendo el Tag (por eso vive en un endpoint de… [→ Contexto_Base_Web.md §37B251]
function _webMapearParticipanteAdminResolucion(p, celularPorTag, tagsVistosEnGrupo) {
  var resultado = {
    tag:              p.tag,
    nombre:           p.nombre,
    clan:             p.clan,
    victorias:        p.victorias,
    puesto:           p.puesto,
    puestoOriginal:   p.puestoOriginal,
    descalificado:    !!p.descalificado,
    premioRepartido:  !!p.premioRepartido,
    // NUEVO (15-sep-2026, pedido del usuario -- cuentas prestadas en torneos): los 3 campos que admin.html necesita para la pregunta "¿Quién jugó con esta cuenta?" (ver _bloquePrestamo() ahí). - nomMulti / prestamo: los propaga desde… [→ Contexto_Base_Web.md §37B252]
    nomMulti:         p.nomMulti || '',
    prestamo:         p.prestamo || '',
    cuentaPrestada:   !!p.cuentaPrestada,
    tipoResolucion:   p.tipoResolucion || null,
    motivoResolucion: p.motivoResolucion || ''
  };

  var info = celularPorTag && celularPorTag[cleanTag(p.tag)];
  if (info) {
    resultado.celular = info.celular;
    if (info.prefijo) resultado.prefijo = info.prefijo;
  }

  if (tagsVistosEnGrupo && tagsVistosEnGrupo[cleanTag(p.tag)]) {
    resultado.verificadoGrupo = true;
  }

  return resultado;
}

// _webAdminTorneoResolucionGuardar(): FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y desempates de torneos). Envuelve TAL CUAL _registrarResolucionTorneo(idTorneo, tag, tipoResolucion, puestoFinal, motivo, registradoPor) (26_Torneos_Core.gs) — mismo… [→ Contexto_Base_Web.md §37B253]
function _webAdminTorneoResolucionGuardar(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  datos = datos || {};
  if (!datos.idTorneo) return { ok: false, error: 'Falta el ID del torneo.' };

  var admin = _webAuthObtenerAdmin(token);
  var registradoPor = admin ? (admin.nombre || admin.tag || '') : '';

  return _registrarResolucionTorneo(datos.idTorneo, datos.tag, datos.tipoResolucion, datos.puestoFinal, datos.motivo, registradoPor);
}

// _webAdminMarcarVistoEnGrupo(): NUEVO (14-sep-2026, pedido del usuario -- cierre del CONTRATO PENDIENTE "Marcar visto en el grupo" dejado en admin.html el 08-sep-2026, ver docblock junto a _grupoVerificadoTags ahí). Envuelve TAL CUAL… [→ Contexto_Base_Web.md §37B254]
function _webAdminMarcarVistoEnGrupo(token, tag, nombre) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!tag) return { ok: false, error: 'Falta el Tag del ganador.' };

  var admin = _webAuthObtenerAdmin(token);
  var registradoPor = admin ? (admin.nombre || admin.tag || '') : '';

  return _marcarVistoEnGrupoVerificado(tag, nombre, registradoPor);
}

// _webIngresosRecientes(): FASE 6 (28-ago-2026, pedido del usuario): index.html reemplaza la sección "Torneos" por "Ingresos recientes" — lista pública de miembros que CALIFICAN COMO NUEVOS ahora mismo. No se reinventa ningún criterio de "reciente": se lee… [→ Contexto_Base_Web.md §37B255]
function _webIngresosRecientes(opciones) {
  // CAMBIO (28-sep-2026, Fase 5b tanda B, decisión del usuario: el aviso de clan rival es solo para admins): la caché de 60 s es UNA sola para todos y guarda la respuesta COMPLETA (con esRivalTemporada/clanRivalDetectado). Por eso el… [→ Contexto_Base_Web.md §37B256]
  var completa = _webCacheado('web_ingresos_recientes_v1', 60, _webIngresosRecientesCalcular);
  if (opciones && opciones.esAdmin === true) return completa;
  var copia = {};
  Object.keys(completa || {}).forEach(function (k) { copia[k] = completa[k]; });
  copia.ingresos = ((completa && completa.ingresos) || []).map(function (ing) {
    var limpio = {};
    Object.keys(ing).forEach(function (k) {
      if (k !== 'esRivalTemporada' && k !== 'clanRivalDetectado') limpio[k] = ing[k];
    });
    return limpio;
  });
  return copia;
}

// _construirIngresosRecientesUnificado(): FIX (01-sep-2026, pedido usuario — "haz que trabajen juntos, primero se usa la información de directorio, eso no es negociable en ambas. luego se verifica, si hay información de tampermonkey, se implementa, sino se queda con lo… [→ Contexto_Base_Web.md §37B257]
function _construirIngresosRecientesUnificado(dataDirPrefetch, ctxPrefetch, dataGuerraPrefetch, tDash) {
  var ss = _getSs();
  var ctx = ctxPrefetch || _getCtx();
  var tz = Session.getScriptTimeZone() || 'America/Lima';

  // PASO 1 (no negociable): universo de candidatos = Directorio ---- Mismo criterio que usaba _getDatosDashboard() (38_Web_Endpoints.gs) para su lista "nuevos": Activo, en un clan Terna vigente, y (V_Guerra vacío O FechaIngreso… [→ Contexto_Base_Web.md §37B258]
  var dataDir;
  if (dataDirPrefetch) {
    dataDir = dataDirPrefetch;
  } else {
    var shDirIngresos = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
    if (shDirIngresos && shDirIngresos.getLastRow() >= 2) {
      dataDir = _leerDirectorioFisicoComoDC(ss);
    } else {
      var lecturaDirIngresos = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
      if (lecturaDirIngresos.origen === 'csv') {
        // Mismo tratamiento de Fecha que _webRosterCalcular(): el CSV trae Vigencia/Fecha_ing como texto, no como objeto Date. [→ Contexto_Base_Web.md §37B259]
        dataDir = lecturaDirIngresos.filas.map(function (fila) {
          var f = fila.slice();
          var vig = _parseSpanishDate(f[DC.VIGENCIA - 1]);
          if (vig instanceof Date && !isNaN(vig.getTime())) f[DC.VIGENCIA - 1] = vig;
          var fIng = _parseSpanishDate(f[DC.FECHA_ING - 1]);
          if (fIng instanceof Date && !isNaN(fIng.getTime())) f[DC.FECHA_ING - 1] = fIng;
          return f;
        });
      } else {
        dataDir = [];
      }
    }
  }
  var hoy = new Date();
  var LIMITE_DIAS_NUEVO = 7;
  var candidatosBase = [];
  for (var k = 0; k < dataDir.length; k++) {
    var filaDir0 = dataDir[k];
    if (String(filaDir0[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;

    var clanTagDir0 = String(filaDir0[DC.CLAN_TAG - 1] || '').trim();
    if (CFG.TERNA_TAGS.indexOf(clanTagDir0) < 0) continue; // ya no está en un clan Terna

    var vGuerra0 = String(filaDir0[DC.V_GUERRA - 1] || '').trim();
    var fechaIng0 = filaDir0[DC.FECHA_ING - 1];
    var esReciente0 = false;
    if (fechaIng0 instanceof Date && !isNaN(fechaIng0.getTime())) {
      var diasDesdeIngreso0 = (hoy - fechaIng0) / 86400000;
      esReciente0 = diasDesdeIngreso0 >= 0 && diasDesdeIngreso0 <= LIMITE_DIAS_NUEVO;
    }
    if (vGuerra0 !== '' && !esReciente0) continue; // no califica como "reciente"

    var tagDir0 = String(filaDir0[DC.TAG - 1] || '').trim();
    if (!tagDir0) continue;

    candidatosBase.push({ tagLimpio: cleanTag(tagDir0), filaDir: filaDir0 });
  }

  if (!candidatosBase.length) return [];

  // ---- PASO 2 (enriquecimiento opcional): hoja "Nuevos" (Tampermonkey) ----
  var nuevosPorTag = {};
  var fechasGridNuevos = null, gridNuevosData = null, semanaActualDiasData = null, numBloquesReal = 0;
  var shNuevos = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (shNuevos && shNuevos.getLastRow() >= NUEVOS_FILA_DATOS_INICIO) {
    var numFilasN = shNuevos.getLastRow() - NUEVOS_FILA_DATOS_INICIO + 1;
    var dataNuevos = shNuevos.getRange(NUEVOS_FILA_DATOS_INICIO, 1, numFilasN, NC_TOTAL_FIJAS).getValues();

    // Mismo cálculo de ancho REAL de la cuadrícula que ya usa repararFormatoEncabezadosNuevos() (14_Nuevos_RoyaleAPI.gs) — la hoja "Nuevos" puede tener más de los 5 bloques originales. [→ Contexto_Base_Web.md §37B260]
    var lastColNuevos = shNuevos.getLastColumn();
    var anchoGridReal = Math.max(0, lastColNuevos - COL_INICIO_GRID_NUEVOS + 1);
    numBloquesReal = Math.max(GRID_NUM_BLOQUES_NUEVOS, Math.floor(anchoGridReal / GRID_BLOQUE_ANCHO_NUEVOS));
    var anchoGridNuevos = numBloquesReal * GRID_BLOQUE_ANCHO_NUEVOS;
    fechasGridNuevos = shNuevos.getRange(NUEVOS_FILA_FECHAS, COL_INICIO_GRID_NUEVOS, 1, anchoGridNuevos).getValues()[0];
    gridNuevosData = shNuevos.getRange(NUEVOS_FILA_DATOS_INICIO, COL_INICIO_GRID_NUEVOS, numFilasN, anchoGridNuevos).getValues();
    semanaActualDiasData = shNuevos.getRange(NUEVOS_FILA_DATOS_INICIO, COL_INICIO_SEMANA_ACTUAL_NUEVOS, numFilasN, SEMANA_ACTUAL_ANCHO_NUEVOS).getValues();

    for (var n = 0; n < dataNuevos.length; n++) {
      var tagN = cleanTag(String(dataNuevos[n][NC.TAG - 1] || ''));
      if (tagN && !nuevosPorTag.hasOwnProperty(tagN)) nuevosPorTag[tagN] = n; // índice de fila dentro del grid
    }
  }

  if (tDash) _dashTiempoMarca_(tDash, 'ingresos.nuevos');

  var DIAS_GUERRA_NUEVOS = ['Jueves', 'Viernes', 'Sábado', 'Domingo'];
  function _diaValorONull(v) { return (v === '' || v === null || v === undefined) ? null : (Number(v) || 0); }

  // Igual que _webUrlPerfilExterno(), pero con respaldo: si la celda de Directorio todavía no tiene el link guardado, se construye directo desde el Tag (mismo patrón que ya usaba _getDatosDashboard() antes de esta unificación) — así… [→ Contexto_Base_Web.md §37B261]
  function _urlPerfilConFallback(valorCelda, dominio, segmento, tagRaw) {
    var url = _webUrlPerfilExterno(valorCelda, dominio, segmento);
    if (url) return url;
    var tagSinHash = String(tagRaw || '').trim().replace('#', '');
    return tagSinHash ? ('https://' + dominio + '/' + segmento + '/' + tagSinHash) : '';
  }

  // Ataques/Puntaje/Barcos de la SEMANA ACTUAL por Tag (hoja Guerra) ---- Independiente de Tampermonkey: viene de la API de Supercell vía runGuerra()/runGuerraRapido() (17_GuerraSheet.gs). FASE 10 (09-sep-2026, pedido usuario… [→ Contexto_Base_Web.md §37B262]
  var guerraSemanaPorTag = {};
  var guerraDiasPorTag = {}; // 11-oct-2026: { Tag: { offsetDia(0-3): {ataques, puntaje, barcos} } } de la semana en curso, respaldo del desglose diario cuando el Tag no tiene fila en "Nuevos"
  var fechaMasRecientePorSemana = {}; // numSemana -> Date más reciente vista
  // 19-sep-2026 (pedido del usuario -- webGuerraEnVivo lento): si el caller ya leyó la hoja Guerra en esta misma ejecución (dataGuerraPrefetch), se reusa esa lectura en vez de volver a leer 9000+ filas. Solo lectura: este bloque… [→ Contexto_Base_Web.md §37B263]
  var dataGuerra = dataGuerraPrefetch || null;
  if (!dataGuerra) {
    var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
    if (shGuerra && shGuerra.getLastRow() >= 2) {
      dataGuerra = shGuerra.getRange(2, 1, shGuerra.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
    }
  }
  if (dataGuerra) {
    for (var g = 0; g < dataGuerra.length; g++) {
      if (String(dataGuerra[g][GC.TEMPORADA - 1] || '') === String(ctx.temporada)) {
        var numSemanaG = Number(dataGuerra[g][GC.SEMANA - 1]) || 0;
        var fechaFilaG = dataGuerra[g][GC.FECHA - 1];
        if (numSemanaG && fechaFilaG instanceof Date && !isNaN(fechaFilaG.getTime())) {
          if (!fechaMasRecientePorSemana[numSemanaG] || fechaFilaG > fechaMasRecientePorSemana[numSemanaG]) {
            fechaMasRecientePorSemana[numSemanaG] = fechaFilaG;
          }
        }
      }

      // FIX (11-oct-2026, pedido usuario — "YAHIR tiene ataques pero su cuadrícula aparece vacía"): el desglose diario J/V/S/D solo salía de la hoja "Nuevos" (Tampermonkey); un ingreso sin fila ahí (caso YAHIR, ingresó el sábado) quedaba con guerraSemanaDias = null aunque la hoja Guerra sí tenía sus ataques. Se guardan acá, por Tag, los valores de CADA día de guerra de la semana en curso, para usarlos de respaldo más abajo. Mismo criterio que _webPerfilJugador() (GC.ATAQUES_HOY / GC.FAME / GC.BARCOS por día). [→ Contexto_Base_Web.md §37B262B]
      var pIdxDiaG = Number(dataGuerra[g][GC.PERIOD_IDX - 1]) || 0;
      if (String(dataGuerra[g][GC.TEMPORADA - 1]) === String(ctx.temporada) &&
          ((Number(dataGuerra[g][GC.SEMANA - 1]) || 1) - 1) === ctx.sectionIndex &&
          esDiaGuerraIdx(pIdxDiaG)) {
        var tagDiaG = cleanTag(dataGuerra[g][GC.TAG - 1]);
        if (tagDiaG) {
          if (!guerraDiasPorTag[tagDiaG]) guerraDiasPorTag[tagDiaG] = {};
          guerraDiasPorTag[tagDiaG][(pIdxDiaG % 7) - 3] = {
            ataques: Number(dataGuerra[g][GC.ATAQUES_HOY - 1]) || 0,
            puntaje: Number(dataGuerra[g][GC.FAME        - 1]) || 0,
            barcos:  Number(dataGuerra[g][GC.BARCOS      - 1]) || 0
          };
        }
      }

      if (Number(dataGuerra[g][GC.PERIOD_IDX - 1]) !== ctx.periodIndex) continue;
      var tagG = cleanTag(dataGuerra[g][GC.TAG - 1]);
      if (!tagG) continue;
      guerraSemanaPorTag[tagG] = {
        ataques: Number(dataGuerra[g][GC.ATAQUES_SEM - 1]) || 0,
        puntaje: Number(dataGuerra[g][GC.FAME        - 1]) || 0,
        barcos:  Number(dataGuerra[g][GC.BARCOS      - 1]) || 0
      };
    }
  }

  if (tDash) _dashTiempoMarca_(tDash, 'ingresos.guerra');

  // FASE 7 (Parte A, punto 7 del documento — avisos de competencia en Ingresos recientes) — reusa _getRivalesYConflicto() (FASE 6, 15_DeteccionInfiltrados.gs) para marcar cuando un ingreso reciente estuvo antes en un clan rival de… [→ Contexto_Base_Web.md §37B264]
  var rivalesYConflictoIR = {};
  try {
    rivalesYConflictoIR = _getRivalesYConflicto(); // 15_DeteccionInfiltrados.gs
  } catch (eRivalesIR) {
    // Defensivo, mismo criterio que _getClanesRivalesTemporadaActual(): si currentriverrace no trae el campo esperado (cambio de API, proxy caído, etc.), esta fase simplemente no marca a nadie como rival en vez de romper toda la… [→ Contexto_Base_Web.md §37B265]
    Logger.log('[IngresosRecientes] _getRivalesYConflicto() falló, se omite el aviso de rival esta vez: ' + eRivalesIR.message);
  }
  var rivalesPorNombreIR = {};
  for (var tagRivalIR in rivalesYConflictoIR) {
    var infoRivalIR = rivalesYConflictoIR[tagRivalIR];
    var nombreNormIR = String((infoRivalIR && infoRivalIR.nombre) || '').trim().toUpperCase();
    if (nombreNormIR) rivalesPorNombreIR[nombreNormIR] = infoRivalIR;
  }

  if (tDash) _dashTiempoMarca_(tDash, 'ingresos.rivales');

  // Respaldo de historial: Control_2 (S1..S5, sin fecha real) — solo se usa para un candidato que NO tenga historial usable en "Nuevos". [→ Contexto_Base_Web.md §37B266]
  var historialPorTag = {};
  var shC2 = ss.getSheetByName('Control_2');
  if (shC2 && shC2.getLastRow() >= 4) {
    var numFilasC2 = shC2.getLastRow() - 3;
    var tagsC2   = shC2.getRange(4, CC2.TAG,  numFilasC2, 1).getValues();
    var clanesC2 = shC2.getRange(4, CC2.CLAN, numFilasC2, 1).getValues();
    var gridC2   = shC2.getRange(4, COL_INICIO_GRID2, numFilasC2, GRID_WIDTH2).getValues();
    for (var c2 = 0; c2 < numFilasC2; c2++) {
      var tagC2 = cleanTag(tagsC2[c2][0]);
      if (!tagC2) continue;
      var clanC2 = String(clanesC2[c2][0] || '');
      var semanas = [];
      for (var sem = 0; sem < 5; sem++) {
        var ataquesSem = gridC2[c2][OFF2.ATA + sem];
        if (ataquesSem === '' || ataquesSem === null) continue; // semana futura, en blanco
        // FIX (17-sep-2026, cierre de conexión pendiente — index.html, renderComparativaSemanal()/gráfica "Barcos por semana"): faltaba `barcos` acá. OFF2.BAR (23_Control2_GuerraSemanal.gs) ya existe y trae exactamente este dato por… [→ Contexto_Base_Web.md §37B267]
        semanas.push({
          semana:  'Semana ' + (sem + 1),
          clan:    clanC2,
          ataques: Number(ataquesSem) || 0,
          puntaje: Number(gridC2[c2][OFF2.PUN + sem]) || 0,
          barcos:  Number(gridC2[c2][OFF2.BAR + sem]) || 0
        });
      }
      historialPorTag[tagC2] = semanas;
    }
  }

  if (tDash) _dashTiempoMarca_(tDash, 'ingresos.control2');

  // ---- PASO 3: armar la lista final — base Directorio + enriquecimiento ----
  var lista = [];
  for (var i = 0; i < candidatosBase.length; i++) {
    var cand = candidatosBase[i];
    var filaDir = cand.filaDir;
    var tagLimpio = cand.tagLimpio;

    var fechaIng = filaDir[DC.FECHA_ING - 1];
    var fechaTxt = (fechaIng instanceof Date && !isNaN(fechaIng.getTime()))
      ? Utilities.formatDate(fechaIng, tz, 'dd/MM/yyyy') : '';
    var fechaIso = (fechaIng instanceof Date && !isNaN(fechaIng.getTime())) ? fechaIng.toISOString() : null;

    var historialFila = [];
    var guerraSemanaDiasFila = null;
    var fuenteHistorial = 'ninguna';

    var idxNuevos = nuevosPorTag.hasOwnProperty(tagLimpio) ? nuevosPorTag[tagLimpio] : -1;
    if (idxNuevos >= 0 && gridNuevosData) {
      // Sí hay fila en "Nuevos" para este candidato (Tampermonkey ya lo escaneó al menos una vez): se usa su historial y desglose diario. [→ Contexto_Base_Web.md §37B268]
      var filaGridNuevos = gridNuevosData[idxNuevos];
      for (var b = 0; b < numBloquesReal; b++) {
        var offBloque = b * GRID_BLOQUE_ANCHO_NUEVOS;
        var fechaBloque = fechasGridNuevos[offBloque];
        if (!(fechaBloque instanceof Date) || isNaN(fechaBloque.getTime())) continue; // bloque sin usar
        var ataquesBloque = filaGridNuevos[offBloque + OFFN.ATAQUES];
        if (ataquesBloque === '' || ataquesBloque === null || ataquesBloque === undefined) continue;
        // FIX (17-sep-2026, cierre de conexión pendiente — index.html, renderComparativaSemanal()/gráfica "Barcos por semana"): faltaba `barcos` acá. OFFN.BARCOS (14_Nuevos_RoyaleAPI.gs) ya existe y trae exactamente este dato por semana en… [→ Contexto_Base_Web.md §37B269]
        historialFila.push({
          semana:  Utilities.formatDate(fechaBloque, tz, 'dd/MM/yyyy'),
          clan:    String(filaGridNuevos[offBloque + OFFN.CLAN] || '').trim() || String(filaDir[DC.CLAN - 1] || ''),
          ataques: Number(ataquesBloque) || 0,
          puntaje: Number(filaGridNuevos[offBloque + OFFN.FAME]) || 0,
          barcos:  Number(filaGridNuevos[offBloque + OFFN.BARCOS]) || 0
        });
      }
      if (historialFila.length) fuenteHistorial = 'nuevos';

      var filaSemanaActualDias = semanaActualDiasData[idxNuevos];
      guerraSemanaDiasFila = {
        dias:     DIAS_GUERRA_NUEVOS,
        ataques:  [0, 1, 2, 3].map(function (d) { return _diaValorONull(filaSemanaActualDias[OFFSEM.ATA + d]); }),
        puntaje:  [0, 1, 2, 3].map(function (d) { return _diaValorONull(filaSemanaActualDias[OFFSEM.PUN + d]); }),
        barcos:   [0, 1, 2, 3].map(function (d) { return _diaValorONull(filaSemanaActualDias[OFFSEM.BAR + d]); })
      };
    }

    // FIX (11-oct-2026): sin fila en "Nuevos" (o con la fila sin ningún dato diario) el desglose diario se arma desde la hoja Guerra (guerraDiasPorTag); un día sin fila del jugador queda null (el frontend lo pinta "—", no 0). [→ Contexto_Base_Web.md §37B262B]
    var diasGuerraRespaldo = guerraDiasPorTag[tagLimpio];
    var sinDesgloseNuevos = !guerraSemanaDiasFila ||
      !['ataques', 'puntaje', 'barcos'].some(function (k) { return guerraSemanaDiasFila[k].some(function (v) { return v !== null; }); });
    if (sinDesgloseNuevos && diasGuerraRespaldo) {
      guerraSemanaDiasFila = {
        dias:     DIAS_GUERRA_NUEVOS,
        ataques:  [0, 1, 2, 3].map(function (d) { return diasGuerraRespaldo[d] ? diasGuerraRespaldo[d].ataques : null; }),
        puntaje:  [0, 1, 2, 3].map(function (d) { return diasGuerraRespaldo[d] ? diasGuerraRespaldo[d].puntaje : null; }),
        barcos:   [0, 1, 2, 3].map(function (d) { return diasGuerraRespaldo[d] ? diasGuerraRespaldo[d].barcos : null; })
      };
    }

    // Sin nada de "Nuevos" (todavía no escaneado por Tampermonkey, o sin bloques con fecha usable): se cae al respaldo de Control_2 si hay algo ahí. El candidato NUNCA desaparece por esto — sigue viniendo de Directorio (Paso 1), solo… [→ Contexto_Base_Web.md §37B270]
    if (!historialFila.length && historialPorTag[tagLimpio]) {
      historialFila = historialPorTag[tagLimpio];
      fuenteHistorial = 'control2';
    }

    // FASE 7 (Parte A): ¿alguna semana de historialFila lo tiene en un clan RIVAL en vez de en su clan Terna actual? Se recorre TODO el historial disponible (no solo la semana más antigua) porque un candidato puede tener bloques… [→ Contexto_Base_Web.md §37B271]
    var clanActualNombreNormIR = String(filaDir[DC.CLAN - 1] || '').trim().toUpperCase();
    var esRivalTemporadaIR = false;
    var clanRivalDetectadoIR = null;
    for (var hIR = 0; hIR < historialFila.length; hIR++) {
      var nombreHistNormIR = String(historialFila[hIR].clan || '').trim().toUpperCase();
      if (!nombreHistNormIR || nombreHistNormIR === clanActualNombreNormIR) continue;
      if (rivalesPorNombreIR.hasOwnProperty(nombreHistNormIR)) {
        esRivalTemporadaIR = true;
        clanRivalDetectadoIR = rivalesPorNombreIR[nombreHistNormIR];
        break;
      }
    }

    lista.push({
      tag:          String(filaDir[DC.TAG - 1] || '').trim(),
      nombre:       String(filaDir[DC.NOMBRE - 1] || ''),
      clan:         String(filaDir[DC.CLAN   - 1] || ''),
      fechaIngreso: fechaTxt,
      fechaIngresoISO: fechaIso,
      royaleApi:    _urlPerfilConFallback(filaDir[DC.ROYALE_API - 1], 'royaleapi.com', 'player', filaDir[DC.TAG - 1]),
      cwstats:      _urlPerfilConFallback(filaDir[DC.CW_STATS   - 1], 'cwstats.com',   'player', filaDir[DC.TAG - 1]),
      copas:            Number(filaDir[DC.COPAS      - 1]) || 0,
      victoriasGuerra:  Number(filaDir[DC.V_GUERRA    - 1]) || 0,
      diasInactivo:     Number(filaDir[DC.INACTIVIDAD - 1]) || 0,
      // FIX (07-sep-2026, pedido usuario — "en el bloque de ingresos recientes agrega V_Guerra, Nivel (xp)"): V_Guerra ya salía como victoriasGuerra (línea de arriba); nivelXp faltaba — directorio.html (nc-stats) ya lo esperaba pero esta… [→ Contexto_Base_Web.md §37B272]
      nivelXp:          String(filaDir[DC.NIVEL       - 1] || ''),
      // FIX (03-sep-2026, pedido usuario — "Vigencia [última conexión] debe mostrarse en Directorio/Ingresos recientes"): mismo criterio que el fix gemelo de _webRosterCalcular más arriba — la columna ya existía en Directorio… [→ Contexto_Base_Web.md §37B273]
      vigencia:         filaDir[DC.VIGENCIA - 1] || '',
      guerraSemana:     guerraSemanaPorTag[tagLimpio] || { ataques: 0, puntaje: 0, barcos: 0 },
      guerraSemanaDias: guerraSemanaDiasFila,
      historialSemanal: historialFila,
      fuenteHistorial:  fuenteHistorial,
      // FASE 7 (Parte A, punto 7 del documento): ver bloque "FASE 7 (Parte A)" más arriba en este mismo archivo para el detalle del cruce (por NOMBRE de clan, no por Tag) y su limitación conocida. [→ Contexto_Base_Web.md §37B274]
      esRivalTemporada: esRivalTemporadaIR,
      clanRivalDetectado: clanRivalDetectadoIR ? {
        nombre:  clanRivalDetectadoIR.nombre || '',
        fuente:  clanRivalDetectadoIR.fuente || '',
        motivo:  clanRivalDetectadoIR.motivo || ''
      } : null
    });
  }

  lista.sort(function (a, b) {
    var tagA = _getClanTagByName(a.clan), tagB = _getClanTagByName(b.clan);
    var oA = CFG.TERNA_TAGS.indexOf(tagA); if (oA === -1) oA = 999;
    var oB = CFG.TERNA_TAGS.indexOf(tagB); if (oB === -1) oB = 999;
    if (oA !== oB) return oA - oB;
    return a.nombre.localeCompare(b.nombre);
  });

  // FASE 10 (09-sep-2026): ver comentario junto a 'fechaMasRecientePorSemana' más arriba. Se ordena de más antigua a más reciente (mismo criterio de fecha real "dd/MM/yyyy" que ya usa historialSemanal cuando viene de "Nuevos") y se… [→ Contexto_Base_Web.md §37B275]
  lista.semanasGuerra = Object.keys(fechaMasRecientePorSemana)
    .map(Number)
    .sort(function (a, b) { return a - b; })
    .map(function (numSemana) { return Utilities.formatDate(fechaMasRecientePorSemana[numSemana], tz, 'dd/MM/yyyy'); });

  return lista;
}

function _webIngresosRecientesCalcular() {
  var lista = _construirIngresosRecientesUnificado();
  return { ingresos: lista, semanasGuerra: lista.semanasGuerra || [] };
}

// _webTorneosJugador(): FASE 7 (29-ago-2026, pedido del usuario — botón "Ver Torneos" del perfil en jugadores.html). A diferencia de _webTorneos() (que solo expone el Top 3 del torneo MÁS RECIENTE, sin indagar en ningún jugador puntual), esta función es… [→ Contexto_Base_Web.md §37B276]
function _webTorneosJugador(tagBuscado, opciones) {
  var tagNorm = cleanTag(tagBuscado);
  if (!tagNorm) return { ok: false, error: 'Falta el Tag del jugador.' };

  // CAMBIO (28-sep-2026, Fase 5b tanda A3, decisión del usuario: "sí" a que torneos responda vacío para inactivos): para un visitante, una cuenta inactiva responde igual que un Tag sin participaciones (ok:true, torneos:[]). Con… [→ Contexto_Base_Web.md §37B277]
  if (_webCuentaOcultaParaVisitante(tagNorm, opciones)) return { ok: true, torneos: [] };

  var ss = _getSs();
  var lecturaTA = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_ASISTENCIA, 'Backup_T_Asistencia.csv', TA_TOTAL_COLS);
  var taData = lecturaTA.filas;
  if (!taData.length) return { ok: true, torneos: [] };

  var tz = Session.getScriptTimeZone() || 'America/Lima';

  var torneos = taData
    .filter(function (f) { return cleanTag(f[TA.TAG - 1]) === tagNorm; })
    .map(function (f) {
      var fechaCelda = f[TA.FECHA - 1];
      var fechaTxt = (fechaCelda instanceof Date && !isNaN(fechaCelda.getTime()))
        ? Utilities.formatDate(fechaCelda, tz, 'dd/MM/yyyy') : '';
      return {
        idTorneo:  f[TA.ID - 1],
        fecha:     fechaTxt,
        fechaOrden: (fechaCelda instanceof Date) ? fechaCelda.getTime() : 0,
        puesto:    f[TA.PUESTO - 1],
        victorias: Number(f[TA.VICTORIAS - 1]) || 0,
        clan:      String(f[TA.CLAN - 1] || '')
      };
    })
    .sort(function (a, b) { return b.fechaOrden - a.fechaOrden; })
    .map(function (t) { delete t.fechaOrden; return t; });

  return { ok: true, torneos: torneos };
}

// _webCuentaOcultaParaVisitante(): NUEVO (28-sep-2026, Fase 5b tanda A3). true si el Tag es de una cuenta INACTIVA y quien pregunta NO es admin (opciones.esAdmin distinto de true). Mismo criterio exacto que _webPerfilJugador(): la cuenta está en la hoja Inactivos… [→ Contexto_Base_Web.md §37B278]
function _webCuentaOcultaParaVisitante(tagBuscado, opciones) {
  if (opciones && opciones.esAdmin === true) return false;
  try {
    var hallazgo = _webBuscarFilaDirectorioPorTagConOrigen(tagBuscado);
    if (!hallazgo || !hallazgo.fila) return false;
    return hallazgo.origen === 'inactivos'
      || String(hallazgo.fila[DC.ESTADO - 1] || '').trim().toLowerCase() === 'inactivo';
  } catch (eOculta) {
    Logger.log('[WebAPI] _webCuentaOcultaParaVisitante: la búsqueda falló (' + eOculta.message + '); se oculta por precaución.');
    return true;
  }
}

// _webOpcionesCofresBattlelog(): NUEVO (29-sep-2026, pedido de la usuaria). Arma las opciones que reciben _webCofresJugador() y _webBattlelogJugador() a partir de los parametros de la peticion (e.parameter, ver doGet en 38_Web_Endpoints.gs): - esAdmin: true si… [→ Contexto_Base_Web.md §37B279]
function _webOpcionesCofresBattlelog(parametros) {
  var p = parametros || {};
  var esAdmin = _webAuthValidar(p.sessionToken) === true;
  var pidioForzar = (String(p.forzar || '') === '1' || String(p.forzar || '').toLowerCase() === 'true');
  var forzar = false;
  if (esAdmin && pidioForzar) {
    try {
      forzar = _webPermisosExigirAcceso(p.sessionToken).ok === true;
    } catch (eForzar) {
      Logger.log('[WebAPI] _webOpcionesCofresBattlelog: no se pudo validar el permiso de forzar (' + eForzar.message + '); se ignora forzar.');
      forzar = false;
    }
  }
  return { esAdmin: esAdmin, forzar: forzar };
}

// _webPuedeVerCofresBattlelog(): NUEVO (29-sep-2026, pedido de la usuaria). Un admin (opciones.esAdmin true) puede consultar cofres y battlelog de CUALQUIER Tag, activo o inactivo. Un no admin solo puede consultar miembros ACTIVOS: fila en Directorio (no en… [→ Contexto_Base_Web.md §37B280]
function _webPuedeVerCofresBattlelog(tagNorm, opciones) {
  if (opciones && opciones.esAdmin === true) return true;
  try {
    var hallazgo = _webBuscarFilaDirectorioPorTagConOrigen(tagNorm);
    if (!hallazgo || !hallazgo.fila || hallazgo.origen !== 'directorio') return false;
    return String(hallazgo.fila[DC.ESTADO - 1] || '').trim().toLowerCase() === 'activo';
  } catch (ePuede) {
    Logger.log('[WebAPI] _webPuedeVerCofresBattlelog: la busqueda fallo (' + ePuede.message + '); se niega por precaucion.');
    return false;
  }
}

// Respuesta unica para "no puedes ver esto" (inactivo o Tag desconocido para un no admin): mismo texto que el estado del perfil, para no delatar la diferencia. [→ Contexto_Base_Web.md §37B281]
var WEB_MSG_SIN_REGISTRO_JSON = 'Sin registro con nosotros.';

// _webBuscarArchivoJsonJugador(): NUEVO (29-sep-2026). Busca en la carpeta de Drive (Battlelog o UpcomingChests) el archivo JSON de un Tag (nombre "dd-mm-yyyy HH.mm - Clan - #TAG.json", ver _buildBattlelogFilename(), 09_API_ClashRoyale.gs). Recuerda el id del… [→ Contexto_Base_Web.md §37B282]
function _webBuscarArchivoJsonJugador(folderId, tagNorm) {
  var tagConHash = '#' + tagNorm;
  var cache = null;
  var key = 'JSONJUG_' + folderId + '_' + tagNorm;
  try {
    cache = CacheService.getScriptCache();
    var idGuardado = cache.get(key);
    if (idGuardado) {
      try {
        var fCache = DriveApp.getFileById(idGuardado);
        if (!fCache.isTrashed() && fCache.getName().toUpperCase().indexOf('- ' + tagConHash + '.JSON') > -1) return fCache;
      } catch (eCache) { /* id viejo: se recorre la carpeta */ }
    }
  } catch (eCacheSvc) { cache = null; }

  var re = /-\s(#[0-9A-Z]+)\.json$/i;
  var archivos = DriveApp.getFolderById(folderId).getFiles();
  while (archivos.hasNext()) {
    var f = archivos.next();
    var m = re.exec(f.getName());
    if (m && m[1].toUpperCase() === tagConHash) {
      if (cache) { try { cache.put(key, f.getId(), 21600); } catch (ePut) {} }
      return f;
    }
  }
  return null;
}

// _webObtenerJsonJugadorDelDia(): NUEVO (29-sep-2026, pedido de la usuaria). Fuente unica de cofres y battlelog para la web: SIEMPRE se lee el JSON guardado en Drive. 1. Si el JSON de ese Tag ya se descargo HOY (dia calendario de Lima, segun la ultima… [→ Contexto_Base_Web.md §37B283]
function _webObtenerJsonJugadorDelDia(tipo, tagNorm, forzar) {
  var esCofres = (tipo === 'cofres');
  var folderId = esCofres ? DRIVE_FOLDER_ID_UPCOMINGCHESTS : DRIVE_FOLDER_ID_BATTLELOG;
  var msgFallo = esCofres
    ? 'No se pudo consultar la cola de cofres de ese jugador.'
    : 'No se pudo consultar el historial de batallas de ese jugador.';
  var tzLima = 'America/Lima';
  var hoy = Utilities.formatDate(new Date(), tzLima, 'yyyy-MM-dd');

  var archivo = null;
  try {
    archivo = _webBuscarArchivoJsonJugador(folderId, tagNorm);
  } catch (eBuscar) {
    Logger.log('[WebAPI] _webObtenerJsonJugadorDelDia(' + tipo + '): no se pudo buscar el archivo de ' + tagNorm + ' (' + eBuscar.message + ').');
  }
  var esDeHoy = !!archivo && Utilities.formatDate(archivo.getLastUpdated(), tzLima, 'yyyy-MM-dd') === hoy;

  var descargoAhora = false;
  var actualizacionFallida = false;

  if (!(archivo && esDeHoy && forzar !== true)) {
    var cache = null;
    var flagKey = 'JSONJUG_BUSY_' + tipo + '_' + tagNorm;
    try { cache = CacheService.getScriptCache(); } catch (eSvc) { cache = null; }

    if (cache && cache.get(flagKey)) {
      // Otra consulta ya esta descargando este mismo dato: no se duplica la llamada.
      if (!archivo) return { ok: false, error: 'Se esta descargando este dato en este momento. Vuelve a intentar en unos segundos.' };
    } else {
      if (cache) { try { cache.put(flagKey, '1', 60); } catch (ePutFlag) {} }
      var descargoOk = false;
      try {
        descargoOk = (esCofres ? descargarUpcomingChestsJugador('#' + tagNorm) : descargarBattlelogJugador('#' + tagNorm)) === true;
      } catch (eDesc) {
        Logger.log('[WebAPI] _webObtenerJsonJugadorDelDia(' + tipo + '): la descarga de ' + tagNorm + ' fallo (' + eDesc.message + ').');
      }
      if (cache) { try { cache.remove(flagKey); } catch (eRem) {} }

      if (descargoOk) {
        descargoAhora = true;
        try { archivo = _webBuscarArchivoJsonJugador(folderId, tagNorm); } catch (eRebuscar) { archivo = null; }
        esDeHoy = !!archivo;
      } else {
        actualizacionFallida = true;
      }
    }
  }

  if (!archivo) return { ok: false, error: msgFallo };

  var data;
  try {
    data = JSON.parse(archivo.getBlob().getDataAsString());
  } catch (eParse) {
    Logger.log('[WebAPI] _webObtenerJsonJugadorDelDia(' + tipo + '): el JSON guardado de ' + tagNorm + ' no se pudo leer (' + eParse.message + ').');
    return { ok: false, error: msgFallo };
  }
  var valido = esCofres ? (data && Array.isArray(data.items)) : Array.isArray(data);
  if (!valido) return { ok: false, error: msgFallo };

  return {
    ok: true,
    data: data,
    origen: descargoAhora ? 'api' : (esDeHoy ? 'drive_hoy' : 'drive_anterior'),
    fechaDescarga: Utilities.formatDate(archivo.getLastUpdated(), tzLima, 'dd/MM/yyyy HH:mm'),
    actualizacionFallida: actualizacionFallida
  };
}

// _webCofresJugador(): ACTUALIZADO (29-sep-2026, pedido de la usuaria): esta nota reemplaza los parrafos de mas abajo que dicen "EN VIVO", "llamada en vivo por click" y "NO guarda nada en Drive"; el resto (cruce con Backup_Cofres.csv, campos… [→ Contexto_Base_Web.md §37B284]
function _webCofresJugador(tagBuscado, opciones) {
  var tagNorm = cleanTag(tagBuscado);
  if (!tagNorm) return { ok: false, error: 'Falta el Tag del jugador.' };
  if (!_webPuedeVerCofresBattlelog(tagNorm, opciones)) {
    return { ok: false, error: WEB_MSG_SIN_REGISTRO_JSON, sinRegistro: true };
  }

  // CAMBIO (29-sep-2026): ya no se llama a la API en cada clic. La lectura y la descarga (una por Tag y por dia) viven en _webObtenerJsonJugadorDelDia(). El bug de 27-sep del '#' (encodeTag necesita el '#') queda resuelto porque… [→ Contexto_Base_Web.md §37B285]
  var lectura = _webObtenerJsonJugadorDelDia('cofres', tagNorm, !!(opciones && opciones.forzar === true));
  if (!lectura.ok) return { ok: false, error: lectura.error };
  var data = lectura.data;

  // Backup_Cofres.csv: se busca Name/Nombre/Link por NOMBRE de columna (no por posición fija) — así, si el usuario reordena columnas al editarlo a mano (como ya hizo al agregar "Link" después de "Nombre"), esto sigue encontrándolas… [→ Contexto_Base_Web.md §37B286]
  var csvCofres = _leerCofresCSV();
  var idxName   = csvCofres.headers.indexOf('Name');
  var idxNombre = csvCofres.headers.indexOf('Nombre');
  var idxLink   = csvCofres.headers.indexOf('Link');

  var porName = {};
  if (idxName > -1) {
    for (var i = 0; i < csvCofres.rows.length; i++) {
      var nameFila = String(csvCofres.rows[i][idxName] || '').trim();
      if (!nameFila) continue;
      porName[nameFila] = {
        nombre: (idxNombre > -1) ? String(csvCofres.rows[i][idxNombre] || '').trim() : '',
        link:   (idxLink   > -1) ? String(csvCofres.rows[i][idxLink]   || '').trim() : ''
      };
    }
  }

  var items = data.items.map(function (it) {
    var nameOriginal = String((it && it.name) || '');
    var match = porName[nameOriginal];
    return {
      index:  (it && it.index),
      name:   nameOriginal,
      nombre: (match && match.nombre) ? match.nombre : nameOriginal, // fallback al inglés
      link:   (match && match.link) ? match.link : ''
    };
  });

  return { ok: true, items: items, origen: lectura.origen, fechaDescarga: lectura.fechaDescarga, actualizacionFallida: lectura.actualizacionFallida };
}

// _obtenerArenaCompletaDesdeCatalogo(): NUEVO (27-sep-2026, pedido usuario -- "se debe procesar toda la información, haciendo pasar todos los datos disponibles en los csv", battlelog del perfil web). A diferencia de _resolverArenaDesdeCatalogo()… [→ Contexto_Base_Web.md §37B287]
function _obtenerArenaCompletaDesdeCatalogo(rawName) {
  var rawStr = String(rawName === undefined || rawName === null ? '' : rawName).trim();
  var vacio = { id: null, name: '', rawName: rawStr, nombre: '', nombre2: '' };
  if (!rawStr) return vacio;

  var csv = _leerArenaCSV(); // headers: N°, ID, Name, RawName, Nombre, Nombre_2
  for (var i = 0; i < csv.rows.length; i++) {
    if (String(csv.rows[i][3] || '').trim() === rawStr) {
      var idNum = Number(csv.rows[i][1]);
      return {
        id:      isNaN(idNum) ? null : idNum,
        name:    String(csv.rows[i][2] || '').trim(),
        rawName: rawStr,
        nombre:  String(csv.rows[i][4] || '').trim(),
        nombre2: String(csv.rows[i][5] || '').trim()
      };
    }
  }
  return vacio; // sin match -- el catálogo todavía no vio esta arena
}

// _obtenerModoCompletoDesdeCatalogo(): Mismo criterio que _obtenerArenaCompletaDesdeCatalogo() (justo arriba), pero contra Backup_Modo.csv (headers: N°, ID, Name, Nombre -- sin Nombre_2, ese catálogo no tiene segunda traducción). Solo lectura, no encola filas nuevas… [→ Contexto_Base_Web.md §37B288]
function _obtenerModoCompletoDesdeCatalogo(modoId) {
  var idStr = String(modoId === undefined || modoId === null ? '' : modoId).trim();
  var vacio = { id: null, name: '', nombre: '' };
  if (!idStr) return vacio;

  var csv = _leerModoCSV(); // headers: N°, ID, Name, Nombre
  for (var i = 0; i < csv.rows.length; i++) {
    if (String(csv.rows[i][1] || '').trim() === idStr) {
      return {
        id:     Number(csv.rows[i][1]),
        name:   String(csv.rows[i][2] || '').trim(),
        nombre: String(csv.rows[i][3] || '').trim()
      };
    }
  }
  return vacio; // sin match -- el catálogo todavía no vio este modo
}

// _webBattlelogJugador(): ACTUALIZADO (29-sep-2026, pedido de la usuaria): esta nota reemplaza lo que dice mas abajo sobre consultar "EN VIVO"; el resto (resumen por batalla, arena/modo, boatBattle, trophyChange) sigue vigente. Mismo criterio que… [→ Contexto_Base_Web.md §37B289]
function _webBattlelogJugador(tagBuscado, opciones) {
  var tagNorm = cleanTag(tagBuscado);
  if (!tagNorm) return { ok: false, error: 'Falta el Tag del jugador.' };
  if (!_webPuedeVerCofresBattlelog(tagNorm, opciones)) {
    return { ok: false, error: WEB_MSG_SIN_REGISTRO_JSON, sinRegistro: true };
  }

  // CAMBIO (29-sep-2026): lectura desde el JSON de Drive, con una descarga por Tag y por dia (ver _webObtenerJsonJugadorDelDia()). Sin llamadas en vivo por clic. [→ Contexto_Base_Web.md §37B290]
  var lectura = _webObtenerJsonJugadorDelDia('battlelog', tagNorm, !!(opciones && opciones.forzar === true));
  if (!lectura.ok) return { ok: false, error: lectura.error };
  var data = lectura.data;

  var tz = Session.getScriptTimeZone() || 'America/Lima';

  var batallas = data.map(function (b) {
    var miEquipo = (b && b.team && b.team[0]) || {};
    var rival    = (b && b.opponent && b.opponent[0]) || {};
    var esBoat   = (b && b.type === 'boatBattle');

    var fechaObj = _parseFechaApiSupercell(b && b.battleTime);
    var fechaTxt = fechaObj ? Utilities.formatDate(fechaObj, tz, 'dd/MM/yyyy HH:mm') : '';

    var resultado;
    if (esBoat) {
      resultado = (b && b.boatBattleWon) ? 'victoria' : 'derrota';
    } else {
      var miCrowns    = Number(miEquipo.crowns) || 0;
      var rivalCrowns = Number(rival.crowns) || 0;
      resultado = miCrowns > rivalCrowns ? 'victoria' : (miCrowns < rivalCrowns ? 'derrota' : 'empate');
    }

    // Catálogos completos (Backup_Arena.csv/Backup_Modo.csv) -- ver docblock.
    var arenaCat = _obtenerArenaCompletaDesdeCatalogo(b && b.arena && b.arena.rawName);
    var modoCat  = _obtenerModoCompletoDesdeCatalogo(b && b.gameMode && b.gameMode.id);

    // Mismo texto ya resuelto que la versión anterior (Nombre -> Name -> dato crudo), reutilizando los resolvers existentes -- no se duplica esa lógica de fallback acá, solo se manda además el detalle crudo. [→ Contexto_Base_Web.md §37B291]
    var arenaTxt = _resolverArenaDesdeCatalogo(b && b.arena && b.arena.rawName);
    var modoTxt  = _resolverModoDesdeCatalogo(b && b.gameMode && b.gameMode.id) ||
                    String((b && b.gameMode && b.gameMode.name) || '');

    // trophyChange: solo viene en pathOfLegend (Ranked 1v1) -- undefined en el resto de los tipos, se manda null explícito para que el frontend distinga "no aplica" de "0 trofeos". [→ Contexto_Base_Web.md §37B292]
    var trophyChangeRaw = miEquipo.trophyChange;
    var trophyChange = (trophyChangeRaw === undefined || trophyChangeRaw === null)
      ? null
      : Number(trophyChangeRaw);

    var fila = {
      fecha:       fechaTxt,
      fechaOrden:  fechaObj ? fechaObj.getTime() : 0,
      tipo:        String((b && b.type) || ''),
      modo:        modoCat,
      modoTxt:     modoTxt,
      arena:       arenaCat,
      arenaTxt:    arenaTxt,
      resultado:   resultado,
      miCorona:    esBoat ? null : (Number(miEquipo.crowns) || 0),
      rivalCorona: esBoat ? null : (Number(rival.crowns) || 0),
      trophyChange: trophyChange,
      // NUEVO (27-sep-2026, pedido usuario): nombre del jugador TAL COMO figuraba en esa batalla (puede haberse cambiado el nombre después). Archivo 37_Web_API.gs, función _webBattlelogJugador(): antes solo se mandaba miClan; perfil.html… [→ Contexto_Base_Web.md §37B293]
      miNombre:    String(miEquipo.name || ''),
      miClan:      (miEquipo.clan && miEquipo.clan.name) || '',
      rivalNombre: String(rival.name || ''),
      rivalClan:   (rival.clan && rival.clan.name) || '',
      eventTag:    String((b && b.eventTag) || ''),
      deckSelection: String((b && b.deckSelection) || '')
    };
    if (esBoat) {
      fila.barcoLado            = (b && b.boatBattleSide) || '';
      fila.barcoTorresNuevas    = Number(b && b.newTowersDestroyed) || 0;
      fila.barcoTorresRestantes = Number(b && b.remainingTowers) || 0;
    }
    return fila;
  });

  // La API ya entrega battleTime descendente (más reciente primero), pero se reordena explícito por si algún día no lo trae así -- mismo criterio defensivo que _webTorneosJugador() (arriba en este archivo). [→ Contexto_Base_Web.md §37B294]
  batallas.sort(function (a, b) { return b.fechaOrden - a.fechaOrden; });
  batallas.forEach(function (b) { delete b.fechaOrden; });

  return { ok: true, batallas: batallas, origen: lectura.origen, fechaDescarga: lectura.fechaDescarga, actualizacionFallida: lectura.actualizacionFallida };
}
// _webAscensosRecientes(): FASE 8 (30-ago-2026, pedido del usuario — sección pública de reconocimiento en Inicio/Comunidad). Lee la hoja Historial_A/D (CFG.SHEETS.ASCENSOS, ver updateAscensosSheet()/ASC en 13_Inactivos_Vetados.gs) y devuelve SOLO los… [→ Contexto_Base_Web.md §37B295]
function _webAscensosRecientes() {
  var ss = _getSs();
  // FASE (15-sep-2026, pedido del usuario -- fallback web->CSV, continuación de las funciones de Torneos más arriba en este archivo): Ascensos ya no se lee con shAsc.getRange() directo -- se usa _obtenerFilasConFallbackCSV()… [→ Contexto_Base_Web.md §37B296]
  var lecturaAsc = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.ASCENSOS, 'Backup_Historial_A-D.csv', ASCENSOS_TOTAL_COLS);
  if (lecturaAsc.origen === 'vacio') return { ascensos: [] };

  var dataAsc = lecturaAsc.filas;
  if (lecturaAsc.origen === 'csv') {
    // Igual que con T_Lista/T_Asistencia: el CSV guarda Fecha como texto canónico, no como objeto Date -- hay que reconstruirla antes del ordenamiento/formato de más abajo. [→ Contexto_Base_Web.md §37B297]
    dataAsc = dataAsc.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[ASC.FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[ASC.FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  // Tags de administradores VIGENTES (hoja Administradores) — cualquier ascenso/descenso de una de estas cuentas queda fuera del listado público, en cualquier fecha. FIX (24-sep-2026, pedido usuario -- AVISO 6, auditoría): esta… [→ Contexto_Base_Web.md §37B298]
  var tagsAdmin = {};
  var lecturaAdm = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.ADMINISTRADORES, 'Backup_Administradores.csv', ADMINISTRADORES_TOTAL_COLS);
  var dataAdmTags = lecturaAdm.filas;
  for (var a = 0; a < dataAdmTags.length; a++) {
    var tagAdm = cleanTag(dataAdmTags[a][AC.TAG - 1]);
    if (tagAdm) tagsAdmin[tagAdm] = true;
  }

  // Tags con Estado = 'Activo' VIGENTE en el Directorio (misma fuente y mismo criterio que usa _webRoster()) — ver FIX en el docblock: el Estado guardado en cada fila de Historial_A/D es el de ESE momento, no sirve para decidir si la… [→ Contexto_Base_Web.md §37B299]
  var tagsActivos = {};
  var dataDirAsc = _webLeerDirectorioComoDC().filas;
  for (var d = 0; d < dataDirAsc.length; d++) {
    if (String(dataDirAsc[d][DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    var tagDirAsc = cleanTag(dataDirAsc[d][DC.TAG - 1]);
    if (tagDirAsc) tagsActivos[tagDirAsc] = true;
  }

  var tz = Session.getScriptTimeZone() || 'America/Lima';

  var ascensos = dataAsc
    .filter(function (f) {
      if (String(f[ASC.TIPO - 1] || '').trim() !== 'Ascenso') return false; // nunca degradaciones
      var tagNorm = cleanTag(f[ASC.TAG - 1]);
      if (tagNorm && tagsAdmin[tagNorm]) return false; // nunca cambios de rango de admins
      if (!tagNorm || !tagsActivos[tagNorm]) return false; // solo cuentas HOY activas
      return true;
    })
    .map(function (f) {
      var fechaCelda = f[ASC.FECHA - 1];
      var fechaOk = fechaCelda instanceof Date && !isNaN(fechaCelda.getTime());
      return {
        tag:           String(f[ASC.TAG - 1] || ''),
        nombre:        String(f[ASC.NOMBRE - 1] || ''),
        clan:          String(f[ASC.CLAN - 1] || ''),
        rangoAnterior: String(f[ASC.RANGO - 1] || ''),
        rangoNuevo:    String(f[ASC.RANGO_2 - 1] || ''),
        fecha:         fechaOk ? fechaCelda.toISOString() : null,
        fechaTxt:      fechaOk ? Utilities.formatDate(fechaCelda, tz, 'dd/MM/yyyy') : '',
        _fechaOrden:   fechaOk ? fechaCelda.getTime() : 0
      };
    })
    .sort(function (a, b) { return b._fechaOrden - a._fechaOrden; })
    .map(function (r) { delete r._fechaOrden; return r; })
    .slice(0, 20); // últimos 20 ascensos — suficiente para una sección "recientes" sin sobrecargar

  return { ascensos: ascensos };
}

// _webAdminCuentasInactivas(): FASE 7 (29-ago-2026, pedido del usuario — tarjeta ADICIONAL a las 4 de clan en Inicio/Clanes, visible SOLO cuando hay un admin logueado en el navegador). Lista completa de la hoja Inactivos (13_Directorio_ Inactivos_Vetados.gs)… [→ Contexto_Base_Web.md §37B300]
function _webAdminCuentasInactivas(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var ss = _getSs();
  var cuentas = [];

  // FASE (15-sep-2026, pedido del usuario -- fallback web->CSV): Players ahora pasa por _obtenerMapaPorTagConFallbackCSV() (01_Config_Global.gs) en vez de _leerHojaComoMapaPorTag() directo. A diferencia de Directorio/ Inactivos… [→ Contexto_Base_Web.md §37B301]
  var lecturaPlayers = _obtenerMapaPorTagConFallbackCSV(ss, CFG.SHEETS.PLAYERS, 'Backup_Players.csv', PC.TAG - 1, PLAYERS_TOTAL_COLS);
  var playersPorTag = lecturaPlayers.mapa;

  function _statsPlayer(tag) {
    var fp = playersPorTag[String(tag || '').trim().toUpperCase()];
    if (!fp) return { nivelXp: '', copas: null };
    var nivel = fp[PC.NIVEL - 1];
    var copas = fp[PC.COPAS - 1];
    return {
      nivelXp: (nivel === '' || nivel === null || nivel === undefined) ? '' : String(nivel),
      // TANDA 15 (21-sep-2026): Backup_Players.csv trae Copas con separador de miles ("5,432", formato '#,##0' de la hoja); Number() daba NaN y la web mostraba las copas vacías cuando la hoja no estaba disponible. [→ Contexto_Base_Web.md §37B302]
      copas:   (copas === '' || copas === null || copas === undefined) ? null : (isNaN(_numDesdeCeldaCSV_(copas)) ? null : _numDesdeCeldaCSV_(copas))
    };
  }

  // 1) Administradores inactivos — viven en Directorio (Estado='Inactivo', Admin='Sí'), NUNCA en Inactivos (ver comentario arriba). FIX (05-sep-2026, pedido usuario — "sigue vacío [Inactivos (Admin) en el panel de admin]"): la… [→ Contexto_Base_Web.md §37B303]
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (shDir && shDir.getLastRow() >= 2) {
    var dataDir = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
    for (var i = 0; i < dataDir.length; i++) {
      var f = dataDir[i];
      var tagDir = String(f[IC.TAG - 1] || '').trim();
      if (!tagDir) continue;
      var esAdminDir = String(f[IC.ADMIN - 1] || '').trim().toLowerCase() === 'sí';
      var esInactivoDir = String(f[IC.ESTADO - 1] || '').trim() === 'Inactivo';
      if (esAdminDir && esInactivoDir) {
        var statsDir = _statsPlayer(tagDir);
        cuentas.push({
          tag:     String(f[IC.TAG      - 1] || ''),
          nombre:  String(f[IC.NOMBRE   - 1] || ''),
          clan:    String(f[IC.CLAN     - 1] || ''),
          esAdmin: true,
          nomMulti: String(f[IC.NOM_MULTI - 1] || ''),
          nivelXp:  statsDir.nivelXp,
          copas:    statsDir.copas
        });
      }
    }
  } else {
    var lecturaDirInact = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
    if (lecturaDirInact.origen === 'csv') {
      var dataDirCsv = lecturaDirInact.filas;
      for (var iC = 0; iC < dataDirCsv.length; iC++) {
        var fC = dataDirCsv[iC];
        var tagDirCsv = String(fC[DC.TAG - 1] || '').trim();
        if (!tagDirCsv) continue;
        var esAdminDirCsv = String(fC[DC.ADMIN - 1] || '').trim().toLowerCase() === 'sí';
        var esInactivoDirCsv = String(fC[DC.ESTADO - 1] || '').trim() === 'Inactivo';
        if (esAdminDirCsv && esInactivoDirCsv) {
          var statsDirCsv = _statsPlayer(tagDirCsv);
          cuentas.push({
            tag:     String(fC[DC.TAG      - 1] || ''),
            nombre:  String(fC[DC.NOMBRE   - 1] || ''),
            clan:    String(fC[DC.CLAN     - 1] || ''),
            esAdmin: true,
            nomMulti: String(fC[DC.NOM_MULTI - 1] || ''),
            nivelXp:  statsDirCsv.nivelXp,
            copas:    statsDirCsv.copas
          });
        }
      }
    }
  }

  // 2) Resto de cuentas inactivas (no-admin) — hoja Inactivos. Por diseño (_updateInactivos()) nunca contiene cuentas Admin='Sí'. FASE (15-sep-2026, pedido del usuario -- fallback web->CSV): mismo criterio que el bloque de Directorio… [→ Contexto_Base_Web.md §37B304]
  var sh = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (sh && sh.getLastRow() >= 2) {
    var data = sh.getRange(2, 1, sh.getLastRow() - 1, INACTIVOS_TOTAL_COLS).getValues();
    for (var r = 0; r < data.length; r++) {
      var fi = data[r];
      var tagInact = String(fi[IC.TAG - 1] || '').trim();
      if (!tagInact) continue;
      var statsInact = _statsPlayer(tagInact);
      cuentas.push({
        tag:     String(fi[IC.TAG      - 1] || ''),
        nombre:  String(fi[IC.NOMBRE   - 1] || ''),
        clan:    String(fi[IC.CLAN     - 1] || ''),
        esAdmin: false,
        nomMulti: String(fi[IC.NOM_MULTI - 1] || ''),
        nivelXp:  statsInact.nivelXp,
        copas:    statsInact.copas
      });
    }
  } else {
    var lecturaInactCsv = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.INACTIVOS, 'Backup_Inactivos.csv', DIR_TOTAL_COLS);
    if (lecturaInactCsv.origen === 'csv') {
      var dataInactCsv = lecturaInactCsv.filas;
      for (var rC = 0; rC < dataInactCsv.length; rC++) {
        var fiC = dataInactCsv[rC];
        var tagInactCsv = String(fiC[DC.TAG - 1] || '').trim();
        if (!tagInactCsv) continue;
        var statsInactCsv = _statsPlayer(tagInactCsv);
        cuentas.push({
          tag:     String(fiC[DC.TAG      - 1] || ''),
          nombre:  String(fiC[DC.NOMBRE   - 1] || ''),
          clan:    String(fiC[DC.CLAN     - 1] || ''),
          esAdmin: false,
          nomMulti: String(fiC[DC.NOM_MULTI - 1] || ''),
          nivelXp:  statsInactCsv.nivelXp,
          copas:    statsInactCsv.copas
        });
      }
    }
  }

  // FIX (20-sep-2026, cierre de conexión pendiente -- inactivos.js, _filaInactivoHtml()): el frontend ya pinta los botones "RoyaleAPI" y "CWStats" de cada cuenta inactiva si `c.royaleApi`/`c.cwstats` traen una URL válida, pero esta… [→ Contexto_Base_Web.md §37B305]
  for (var iLk = 0; iLk < cuentas.length; iLk++) {
    var tagLk = cuentas[iLk].tag;
    cuentas[iLk].royaleApi = _webUrlPerfilExterno(tagLk, 'royaleapi.com', 'player');
    cuentas[iLk].cwstats   = _webUrlPerfilExterno(tagLk, 'cwstats.com',   'player');
  }

  cuentas.sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });

  return { ok: true, cuentas: cuentas };
}

// _webAdminParticipacionHoyGuerra(): FASE 3 del plan de cambios web (punto 3 de cambios_web.docx): expone _getParticipacionHoyGuerra() (17_GuerraSheet.gs) al panel de admin — qué cuentas Activas de cada clan Terna ya reservaron sus 4 ataques hoy (AtaquesHoy > 0, ya… [→ Contexto_Base_Web.md §37B306]
function _webAdminParticipacionHoyGuerra(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var ctx = _getCtx();
  return _getParticipacionHoyGuerra(ctx);
}

// _webAdminOtrasCuentas(): FASE 7 (29-ago-2026, pedido del usuario — botón "Ver otras cuentas" del perfil en jugadores.html, visible SOLO para admins logueados). Dado el Tag de un jugador, busca su Celular (primero en Directorio activo; si no está ahí, en… [→ Contexto_Base_Web.md §37B307]
function _webAdminOtrasCuentas(token, tag) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var tagNorm = cleanTag(tag);
  if (!tagNorm) return { ok: false, error: 'Falta el Tag del jugador.' };

  var ss = _getSs();
  var shDirOtras = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var dataDir;
  if (shDirOtras && shDirOtras.getLastRow() >= 2) {
    dataDir = _leerDirectorioFisicoComoDC(ss);
  } else {
    var lecturaDirOtras = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
    dataDir = (lecturaDirOtras.origen === 'csv') ? lecturaDirOtras.filas : [];
  }

  var shInact = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  var dataInact, dataInactOrigen;
  if (shInact && shInact.getLastRow() >= 2) {
    dataInact = shInact.getRange(2, 1, shInact.getLastRow() - 1, INACTIVOS_TOTAL_COLS).getValues();
    dataInactOrigen = 'sheet';
  } else {
    var lecturaInactOtras = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.INACTIVOS, 'Backup_Inactivos.csv', DIR_TOTAL_COLS);
    dataInact = (lecturaInactOtras.origen === 'csv') ? lecturaInactOtras.filas : [];
    dataInactOrigen = lecturaInactOtras.origen;
  }
  // A partir de acá, dataInact puede venir en formato IC (29 cols, hoja viva) o DC (60 cols, CSV de respaldo) según dataInactOrigen -- los dos usos de abajo (búsqueda de Celular y recorrido final) ya distinguen ambos casos en vez de… [→ Contexto_Base_Web.md §37B308]

  // 1) Ubicar la fila del jugador consultado (Directorio primero, luego Inactivos) para sacar su Celular. [→ Contexto_Base_Web.md §37B309]
  var celularObjetivo = '';
  for (var i = 0; i < dataDir.length && !celularObjetivo; i++) {
    if (cleanTag(dataDir[i][DC.TAG - 1]) === tagNorm) {
      celularObjetivo = String(dataDir[i][DC.CELULAR - 1] || '').replace(/\D/g, '');
    }
  }
  var colInactTag     = (dataInactOrigen === 'csv') ? (DC.TAG     - 1) : (IC.TAG     - 1);
  var colInactCelular = (dataInactOrigen === 'csv') ? (DC.CELULAR - 1) : (IC.CELULAR - 1);
  if (!celularObjetivo) {
    for (var j = 0; j < dataInact.length && !celularObjetivo; j++) {
      if (cleanTag(dataInact[j][colInactTag]) === tagNorm) {
        celularObjetivo = String(dataInact[j][colInactCelular] || '').replace(/\D/g, '');
      }
    }
  }
  if (!celularObjetivo) return { ok: true, cuentas: [] };

  // 2) Recorrer Directorio + Inactivos buscando ese mismo Celular, excluyendo al propio Tag consultado y sin duplicar por Tag. [→ Contexto_Base_Web.md §37B310]
  var vistos = {};
  var cuentas = [];
  function agregarSiCoincide(tagFila, nombreFila, clanFila, celularFila) {
    var celLimpio = String(celularFila || '').replace(/\D/g, '');
    if (!celLimpio || celLimpio !== celularObjetivo) return;
    var tagLimpio = cleanTag(tagFila);
    if (!tagLimpio || tagLimpio === tagNorm || vistos[tagLimpio]) return;
    vistos[tagLimpio] = true;
    cuentas.push({ tag: String(tagFila || ''), nombre: String(nombreFila || ''), clan: String(clanFila || '') });
  }
  for (var k = 0; k < dataDir.length; k++) {
    agregarSiCoincide(dataDir[k][DC.TAG - 1], dataDir[k][DC.NOMBRE - 1], dataDir[k][DC.CLAN - 1], dataDir[k][DC.CELULAR - 1]);
  }
  var colInactNombre = (dataInactOrigen === 'csv') ? (DC.NOMBRE - 1) : (IC.NOMBRE - 1);
  var colInactClan   = (dataInactOrigen === 'csv') ? (DC.CLAN   - 1) : (IC.CLAN   - 1);
  for (var m = 0; m < dataInact.length; m++) {
    agregarSiCoincide(dataInact[m][colInactTag], dataInact[m][colInactNombre], dataInact[m][colInactClan], dataInact[m][colInactCelular]);
  }

  cuentas.sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
  return { ok: true, cuentas: cuentas };
}
// _webSorteoCalificados(): FASE 8 (30-ago-2026, pedido del usuario — la Ruleta de Sorteo del panel admin [sorteo.html] captaba participantes de forma 100% manual/genérica; este endpoint la autocompleta con los miembros que CALIFICAN según la fuente oficial… [→ Contexto_Base_Web.md §37B311]
function _webSorteoCalificados(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var bloque = _getConfigMasRecienteCategoria('Sorteo');
  if (bloque.length === 0) {
    return { ok: false, error: 'S_Lista no tiene ninguna fila con Clan asignado todavía. Agregá participantes a mano mientras tanto.' };
  }

  var ss = _getSs();
  var ctxReal = _getCtx();
  var temporadaActual = _getTemporadaMostrarExtra(ss, ctxReal);

  var necesitaTrofeos = bloque.some(function (b) { return b.minT.activo; });
  var necesitaAtaques = bloque.some(function (b) { return b.ataques.activo; });
  var necesitaTorneos = bloque.some(function (b) { return b.torneos.activo; });
  // FIX (12-sep-2026, pedido del usuario -- requisito "Barcos", calificación real): mismo criterio que necesitaTrofeos/necesitaAtaques/necesitaTorneos -- ver docblock de arriba para la semántica exacta. [→ Contexto_Base_Web.md §37B312]
  var necesitaBarcos  = bloque.some(function (b) { return b.barcos.activo; });
  var avisoReaccion   = bloque.some(function (b) { return b.reaccion.activo; });

  // Semanas (FIX 11-sep-2026, pedido del usuario): mismo valor para los 4 clanes de `bloque` (ver docblock de _getConfigMasRecienteCategoria(), 26_Torneos_Core.gs) -- se toma de cualquiera de sus elementos, igual que `idFila`. Si… [→ Contexto_Base_Web.md §37B313]
  var semanas = bloque[0].semanas || [];
  // FIX (12-sep-2026): se agrega necesitaBarcos -- Barcos también se promedia sobre las mismas semanas puntuales (ver `barcosProm`, mismo criterio que `ataquesProm`), así que también depende de que Semanas esté configurada. [→ Contexto_Base_Web.md §37B314]
  var necesitaSemanas = necesitaTrofeos || necesitaAtaques || necesitaTorneos || necesitaBarcos;
  if (necesitaSemanas && semanas.length === 0) {
    return { ok: false, error: 'Falta configurar "Semanas" en S_Lista para este sorteo (formato "T{temporada}_S{semana}", separadas por coma).' };
  }

  // Trofeos/Ataques/Barcos: PROMEDIO entre las semanas puntuales configuradas (ver _getTrofeosYAtaquesSemanalesPorTag(), 28_Torneos_Docs.gs). Ya NO se usa el acumulado de toda la temporada… [→ Contexto_Base_Web.md §37B315]
  var semanalPorTag = (necesitaTrofeos || necesitaAtaques || necesitaBarcos)
    ? _getTrofeosYAtaquesSemanalesPorTag(semanas, ctxReal)
    : {};
  // Torneos: CONTEO (no promedio) dentro de esas mismas semanas puntuales (ver _contarTorneosPorTagEnSemanas(), 28_Torneos_Docs.gs). [→ Contexto_Base_Web.md §37B316]
  var torneosPorTag = necesitaTorneos ? _contarTorneosPorTagEnSemanas(ss, semanas) : {};

  var reqPorClan = {};
  var ordenClanes = [];
  bloque.forEach(function (b) {
    reqPorClan[b.clan] = b;
    ordenClanes.push(b.clan);
  });

  // FIX (24-sep-2026, pedido usuario -- auditoría "fallback web->CSV, funciones web"): antes leía Directorio directo, sin fallback a Backup_Directorio.csv, aunque `ss` se sigue necesitando en esta misma función para otras lecturas… [→ Contexto_Base_Web.md §37B317]
  var dataDir = _webLeerDirectorioComoDC().filas;
  var porClan = {};
  ordenClanes.forEach(function (c) { porClan[c] = []; });

  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;

    var clan = String(fila[DC.CLAN - 1] || '').trim();
    var req = reqPorClan[clan];
    if (!req) continue; // clan sin fila de requisitos en "Sorteo": no participa

    var tag = String(fila[DC.TAG - 1] || '').trim();
    // Trofeos/Ataques/Barcos (FIX 11-sep-2026 y 12-sep-2026): promedio entre las semanas puntuales configuradas en SL.SEMANAS -- ver `semanalPorTag` arriba. [→ Contexto_Base_Web.md §37B318]
    var trofeos = (semanalPorTag[tag] && semanalPorTag[tag].trofeosProm) || 0;
    var ataques = (semanalPorTag[tag] && semanalPorTag[tag].ataquesProm) || 0;
    var barcosProm = (semanalPorTag[tag] && semanalPorTag[tag].barcosProm) || 0;
    if (req.minT.activo && trofeos < req.minT.qty) continue;
    // 19-sep-2026: SUMATORIA (no promedio) sobre las semanas evaluadas, con los domingos opcionales exonerados -- ver _ataquesCumplenRequisito(), 28_Torneos_Docs.gs. [→ Contexto_Base_Web.md §37B319]
    if (req.ataques.activo && !_ataquesCumplenRequisito(semanalPorTag[tag], req.ataques.qty)) continue;
    if (req.torneos.activo && (torneosPorTag[tag] || 0) < req.torneos.qty) continue;
    // FIX (12-sep-2026, pedido del usuario -- requisito "Barcos", tope MÁXIMO, no un mínimo como los de arriba): se descalifica a quien SUPERE el tope configurado (req.barcos.qty) -- un promedio IGUAL al tope no descalifica (ej. tope=0… [→ Contexto_Base_Web.md §37B320]
    if (req.barcos.activo && barcosProm > req.barcos.qty) continue;

    // Tickets (FASE 10-sep-2026, pedido del usuario, ver consolidado de pendientes sección 1 PASO 2): Min_S es la base (req.minT.qty, mismo valor usado como filtro arriba) y Delta (req.delta, único para los 4 clanes) es el escalón de… [→ Contexto_Base_Web.md §37B321]
    var minS = req.minT.qty;
    var delta = req.delta || 0;
    var tickets;
    if (trofeos < minS) {
      tickets = 0; // no debería pasar (ya se filtró arriba si minT.activo)
    } else if (delta <= 0) {
      tickets = 1;
    } else {
      tickets = 1 + Math.floor((trofeos - minS) / delta);
    }

    porClan[clan].push({
      tag:     tag,
      nombre:  String(fila[DC.NOMBRE - 1] || ''),
      puntaje: trofeos,
      tickets: tickets
    });
  }

  // Mismo orden de clanes que el resto del sitio (CFG.TERNA_TAGS), no el orden de filas de la hoja fuente (T_Lista/S_Lista). [→ Contexto_Base_Web.md §37B322]
  ordenClanes.sort(function (a, b) {
    var tagA = _getClanTagByName(a), tagB = _getClanTagByName(b);
    var oA = CFG.TERNA_TAGS.indexOf(tagA), oB = CFG.TERNA_TAGS.indexOf(tagB);
    if (oA === -1) oA = 999;
    if (oB === -1) oB = 999;
    return oA - oB;
  });

  var clanes = ordenClanes.map(function (c) {
    var lista = porClan[c].slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
    return { nombre: c, calificados: lista };
  });

  // idSorteo (FASE 10-sep-2026, consolidado sección 1, puntos 4 y 6): mismo valor para los 4 clanes de `bloque` (ver docblock de _getConfigMasRecienteCategoria(), 26_Torneos_Core.gs) -- se toma de cualquiera de sus elementos.… [→ Contexto_Base_Web.md §37B323]
  var idSorteo = bloque[0].idFila;

  return { ok: true, clanes: clanes, avisoReaccion: avisoReaccion, temporada: temporadaActual, idSorteo: idSorteo };
}

// _webAdminSorteoResolucionGuardar(): FASE (10-sep-2026, pedido del usuario -- ver consolidado de pendientes, sección 1, puntos 4 y 6 del "resumen de lo que falta construir"). Envuelve TAL CUAL _registrarResolucionSorteo(idSorteo, tag, nombre, premio, resultado… [→ Contexto_Base_Web.md §37B324]
function _webAdminSorteoResolucionGuardar(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  datos = datos || {};
  if (!datos.idSorteo) return { ok: false, error: 'Falta el ID del sorteo.' };

  var admin = _webAuthObtenerAdmin(token);
  var registradoPor = admin ? (admin.nombre || admin.tag || '') : '';

  return _registrarResolucionSorteo(
    datos.idSorteo, datos.tag, datos.nombre, datos.premio,
    datos.resultado, datos.razon, !!datos.permitirSinTag, registradoPor,
    datos.tickets
  );
}

// _webAdminSorteoActualizarDocGanadores(): FASE (12-sep-2026, pedido del usuario -- consolidado de pendientes, punto 1 "botón Exportar de sorteo.html"): hasta este cambio, el docx real "Ganadores (sorteo)" solo se actualizaba una vez al día, dentro de procesarSorteos() ->… [→ Contexto_Base_Web.md §37B325]
function _webAdminSorteoActualizarDocGanadores(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  try {
    actualizarDocGanadoresSorteo();
    return { ok: true };
  } catch (errDocGanSorteo) {
    Logger.log('[Web] Error interno actualizando el doc de ganadores: ' + errDocGanSorteo.toString());
    return { ok: false, error: 'No se pudo actualizar el documento de ganadores. Intenta de nuevo en unos segundos.' };
  }
}

// CR_Lista — Web: selector de registro + pantalla de propuestas (FASE 7, 13-sep-2026, pedido del usuario, plan de Cambio de Rango). Endpoints para que la administración: (1) vea el listado de pares Ascenso/Descenso ya cargados, (2)… [→ Contexto_Base_Web.md §37B326]

// Extra!Torneo_Vigente_ID / Sorteo_Vigente_ID -- selector web (FASE 0bis, 13-sep-2026, pedido del usuario -- "fase nueva y chica" que la propia Fase 0 del plan de corrección Torneo/Sorteo dejaba anotada para más adelante, ver ese… [→ Contexto_Base_Web.md §37B327]

// _webAdminVigenteListar(): Lista TODOS los registros de T_Lista ('Torneo') o S_Lista ('Sorteo'), del más reciente al más antiguo por Fecha, para poblar el selector de "cuál es el vigente" -- misma idea que _webCRListaListar() (justo abajo), pero para… [→ Contexto_Base_Web.md §37B328]
function _webAdminVigenteListar(token, categoria) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var esTorneo = (categoria === 'Torneo');
  if (!esTorneo && categoria !== 'Sorteo') return { ok: false, error: 'Categoría inválida (debe ser Torneo o Sorteo).' };

  var ss = _getSs();
  // FIX (24-sep-2026, pedido del usuario -- auditoría Sheet->CSV->JSON, Tanda 4 / T_Lista+S_Lista): esta función leía T_Lista/S_Lista con sh.getRange() directo, sin fallback. T_Lista ya tenía su respaldo armado y en uso en otras… [→ Contexto_Base_Web.md §37B329]
  var cols = esTorneo ? TL_TOTAL_COLS : SL_TOTAL_COLS;
  var nombreHoja = esTorneo ? CFG.SHEETS.T_LISTA : CFG.SHEETS.S_LISTA;
  var nombreCsv = esTorneo ? 'Backup_T_Lista.csv' : 'Backup_S_Lista.csv';
  var lectura = _obtenerFilasConFallbackCSV(ss, nombreHoja, nombreCsv, cols, 2);
  if (lectura.origen === 'vacio') return { ok: true, registros: [], vigenteActual: _getIdVigenteExtra(categoria) };

  var datos = lectura.filas;
  var tz = Session.getScriptTimeZone() || 'America/Lima';
  var COL_ID = esTorneo ? TL.ID : SL.ID;
  var COL_FECHA = esTorneo ? TL.FECHA : SL.FECHA;
  var COL_ORG = esTorneo ? TL.ORGANIZADOR : SL.ORGANIZADOR;

  if (lectura.origen === 'csv') {
    // Igual que _webAdminGanadoresTorneoDetalle()/_webTorneos(): el CSV guarda Fecha como texto canónico, no como objeto Date -- hay que reconstruirla antes del formateo de más abajo. [→ Contexto_Base_Web.md §37B330]
    datos = datos.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[COL_FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[COL_FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  var registros = datos
    .filter(function (f) { return String(f[COL_ID - 1] || '').trim(); })
    .map(function (f) {
      var fechaCelda = f[COL_FECHA - 1];
      var fechaOk = fechaCelda instanceof Date && !isNaN(fechaCelda.getTime());
      return {
        id: String(f[COL_ID - 1]).trim(),
        organizador: String(f[COL_ORG - 1] || '').trim(),
        fechaTxt: fechaOk ? Utilities.formatDate(fechaCelda, tz, 'dd/MM/yyyy') : 'sin fecha',
        _orden: fechaOk ? fechaCelda.getTime() : 0
      };
    });

  registros.sort(function (a, b) { return b._orden - a._orden; });
  registros.forEach(function (r) { delete r._orden; });

  return { ok: true, registros: registros, vigenteActual: _getIdVigenteExtra(categoria) };
}

// _webAdminVigenteGuardar(): Guarda (o limpia) el ID "vigente" de Torneo/Sorteo en Extra!Torneo_Vigente_ID / Sorteo_Vigente_ID (fila 2, columnas 20/21 -- ver _setupExtra(), 02_Setup_Hojas.gs). `id` vacío = limpiar la celda, con lo que… [→ Contexto_Base_Web.md §37B331]
function _webAdminVigenteGuardar(token, categoria, id) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (categoria !== 'Torneo' && categoria !== 'Sorteo') return { ok: false, error: 'Categoría inválida (debe ser Torneo o Sorteo).' };

  var ss = _getSs();
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!shExtra) return { ok: false, error: 'La hoja Extra no existe.' };

  var col = (categoria === 'Torneo') ? 20 : 21; // Torneo_Vigente_ID / Sorteo_Vigente_ID, ver _setupExtra()
  shExtra.getRange(2, col).setValue(String(id || '').trim());
  return { ok: true };
}

// _webAdminUltimoRegistroTorneoOSorteo(): NUEVO (16-sep-2026, pedido del usuario -- botones "↻ Precargar datos del último torneo/sorteo registrado" de admin.html, ver precargarUltimoRegistroTorneo()/precargarUltimoRegistroSorteo() ahí). Wrapper delgado de… [→ Contexto_Base_Web.md §37B332]
function _webAdminUltimoRegistroTorneoOSorteo(token, categoria) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (categoria !== 'Torneo' && categoria !== 'Sorteo') return { ok: false, error: 'Categoría inválida (debe ser Torneo o Sorteo).' };

  var registro = _getUltimoRegistroTorneoOSorteo(categoria);
  return { ok: true, registro: registro };
}

// _webCRListaListar(): Lista TODOS los pares Ascenso/Descenso ya cargados en CR_Lista, del más reciente al más antiguo por Fecha -- para poblar el selector de la pantalla de Cambio de Rango (elegir un par existente, ver propuestas, o editarlo). Recorre… [→ Contexto_Base_Web.md §37B333]
function _webCRListaListar(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var ss = _getSs();
  var lecturaCR = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.CR_LISTA, 'Backup_CR_Lista.csv', CR_TOTAL_COLS, 3);
  var datos = lecturaCR.filas;
  if (!datos.length) return { ok: true, pares: [] };

  var tz = Session.getScriptTimeZone() || 'America/Lima';

  // Set de IDs de Descenso presentes, para poder marcar `existeDescenso` sin tener que recorrer `datos` de nuevo por cada par encontrado. [→ Contexto_Base_Web.md §37B334]
  var idsDescenso = {};
  datos.forEach(function (f) {
    var idFila = String(f[CR.ID - 1] || '').trim();
    if (/^D_/.test(idFila)) idsDescenso[idFila] = true;
  });

  var pares = [];
  datos.forEach(function (f) {
    var idAscenso = String(f[CR.ID - 1] || '').trim();
    if (!/^A_/.test(idAscenso)) return; // solo Ascenso -- ver docblock de arriba

    var idDescenso = 'D_' + idAscenso.slice(2);
    // FASE (15-sep-2026, fallback web->CSV): mismo criterio que _webIngresosRecientes()/_webTorneos() en este archivo — Backup_CR_Lista.csv guarda Fecha como texto canónico, no como objeto Date, así que hace falta reconstruirla con… [→ Contexto_Base_Web.md §37B335]
    var fechaCelda = f[CR.FECHA - 1];
    var fechaObj = (fechaCelda instanceof Date) ? fechaCelda : _parseSpanishDate(fechaCelda);
    var fechaOk = fechaObj instanceof Date && !isNaN(fechaObj.getTime());

    pares.push({
      idAscenso:      idAscenso,
      idDescenso:     idDescenso,
      existeDescenso: !!idsDescenso[idDescenso],
      fechaIso:       fechaOk ? fechaObj.toISOString() : '',
      fechaTxt:       fechaOk ? Utilities.formatDate(fechaObj, tz, 'dd/MM/yyyy') : '',
      semanas:        String(f[CR.SEMANAS - 1] || '').trim(),
      organizador:    String(f[CR.ORGANIZADOR - 1] || '').trim(),
      _fechaOrden:    fechaOk ? fechaObj.getTime() : 0
    });
  });

  pares.sort(function (a, b) { return b._fechaOrden - a._fechaOrden; });
  pares.forEach(function (p) { delete p._fechaOrden; });

  return { ok: true, pares: pares };
}

// _webCRListaFilaPorId(): Wrapper de _getFilaCRListaPorId() (26_Torneos_Core.gs) para precargar UNA fila puntual (Ascenso o Descenso) en el panel -- ej. al abrir "Editar" sobre un par ya existente, o para mostrar el detalle de una sola mitad del par. Ver… [→ Contexto_Base_Web.md §37B336]
function _webCRListaFilaPorId(token, id) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!id) return { ok: false, error: 'Falta el ID de CR_Lista.' };

  var fila = _getFilaCRListaPorId(id);
  if (!fila) return { ok: false, error: 'No encontré ninguna fila de CR_Lista con ID ' + id + '.' };
  return { ok: true, fila: fila };
}

// _webCRListaPropuestas(): Wrapper de _calcularPropuestasCambioRango() (26_Torneos_Core.gs, Fase 4): calcula y devuelve la tabla de propuestas de un par SIN escribir nada en Historial_A/D -- pensado para que el admin revise antes de confirmar (ver… [→ Contexto_Base_Web.md §37B337]
function _webCRListaPropuestas(token, idAscenso, idDescenso) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!idAscenso || !idDescenso) return { ok: false, error: 'Falta elegir el par de Cambio de Rango (Ascenso/Descenso).' };

  return _calcularPropuestasCambioRango(idAscenso, idDescenso);
}

// _webCRListaGenerarPropuestas(): Botón "Generar propuestas" del panel: dispara la escritura real en Historial_A/D -- wrapper de _registrarPropuestasCRListaEnHistorial() (24_Historial_Ascensos.gs, Fase 5). El admin normalmente llama primero a… [→ Contexto_Base_Web.md §37B338]
function _webCRListaGenerarPropuestas(token, idAscenso, idDescenso) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  if (!idAscenso || !idDescenso) return { ok: false, error: 'Falta elegir el par de Cambio de Rango (Ascenso/Descenso).' };

  return _registrarPropuestasCRListaEnHistorial(idAscenso, idDescenso);
}

// _construirFilaCRLista(): Helper interno de _webCRListaGuardar() (justo abajo): arma UN array de CR_TOTAL_COLS elementos (formato CR.*, 26_Torneos_Core.gs) para una sola mitad del par (Ascenso o Descenso) a partir del payload recibido desde la web -- ver… [→ Contexto_Base_Web.md §37B339]
function _construirFilaCRLista(comunes, tipo, id, bloque) {
  var fila = new Array(CR_TOTAL_COLS).fill('');
  bloque = bloque || {};
  var porClan = bloque.porClan || [];

  fila[CR.NUM - 1]         = comunes.numFila;
  fila[CR.TEMPORADA - 1]   = comunes.temporada;
  fila[CR.SEMANAS - 1]     = comunes.semanas;
  fila[CR.FECHA - 1]       = comunes.fecha;
  // FIX (16-sep-2026, pedido del usuario -- "en CR_Lista columna hora se debe guardar el valor como (20:00:00) y el formato de visualización (8:00:00 p.m.)"): antes `comunes.hora` (el string "HH:mm" que manda la web) se escribía tal… [→ Contexto_Base_Web.md §37B340]
  fila[CR.HORA - 1]        = _horaStringADate(comunes.fecha, comunes.hora) || '';
  fila[CR.ID - 1]          = id;
  fila[CR.ORGANIZADOR - 1] = comunes.organizador;
  fila[CR.TAG_ORG - 1]     = comunes.tagOrg;
  fila[CR.CLAN - 1]        = comunes.clan;
  fila[CR.CLAN_TAG - 1]    = comunes.clanTag;
  fila[CR.TIPO - 1]        = tipo;

  CFG.TERNA_TAGS.forEach(function (tag, idx) {
    var bloqueClan = porClan[idx] || {};
    var minCR   = bloqueClan.minCR   || {};
    var ataques = bloqueClan.ataques || {};
    fila[CR_MIN_CR_COLS.MIEMBRO[idx]  - 1] = Number(minCR.miembro)    || 0;
    fila[CR_MIN_CR_COLS.VETERANO[idx] - 1] = Number(minCR.veterano)   || 0;
    fila[CR_MIN_CR_COLS.COLIDER[idx]  - 1] = Number(minCR.colider)    || 0;
    fila[CR_ATAQUES_COLS.MIEMBRO[idx]  - 1] = Number(ataques.miembro)  || 0;
    fila[CR_ATAQUES_COLS.VETERANO[idx] - 1] = Number(ataques.veterano) || 0;
    fila[CR_ATAQUES_COLS.COLIDER[idx]  - 1] = Number(ataques.colider)  || 0;
  });

  // Barcos: mismo criterio "0 es tope válido, vacío es 'sin configurar'" que _getFilaCRListaPorId() espera al leer (ver ese docblock) -- si el payload no trae el campo en absoluto (undefined), se deja la celda vacía en vez de forzar… [→ Contexto_Base_Web.md §37B341]
  if (bloque.barcos !== undefined && bloque.barcos !== null && bloque.barcos !== '') {
    fila[CR.BARCOS - 1] = Number(bloque.barcos) || 0;
  }
  fila[CR.MIEMBRO_ACTIVO - 1] = (bloque.miembroActivo === 'Sí') ? 'Sí' : 'No';
  fila[CR.WHATSAPP - 1]       = (bloque.whatsapp === 'Sí') ? 'Sí' : 'No';
  fila[CR.ESTADO - 1]         = String(bloque.estado || '').trim();
  fila[CR.COMENTARIO - 1]     = String(bloque.comentario || comunes.comentario || '').trim();

  return fila;
}

// _webCRListaGuardar(): Formulario único de registro/edición de una corrida de CR_Lista -- pensado para poder abrirse YA PRECARGADO con los valores del par más reciente (`_webCRListaListar()` + `_webCRListaFilaPorId()` para las dos mitades), editable en… [→ Contexto_Base_Web.md §37B342]
function _webCRListaGuardar(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  datos = datos || {};
  if (!datos.fecha) return { ok: false, error: 'Falta la fecha de la corrida.' };

  var fecha = new Date(datos.fecha + 'T00:00:00');
  if (isNaN(fecha.getTime())) return { ok: false, error: 'Fecha inválida.' };

  // Organizador -- mismo criterio EXACTO que _webAdminTorneoModificar() (más arriba en este archivo): '' = no resolver nada; con valor, se resuelve por Nom_Multi y se puede pisar con overrides manuales. [→ Contexto_Base_Web.md §37B343]
  var nomMultiElegido = String(datos.organizador || '').trim();
  var organizadorInfo = null;
  if (nomMultiElegido) {
    organizadorInfo = _buscarInfoOrganizadorPorNomMulti(nomMultiElegido) ||
      { nombre: nomMultiElegido, tag: '#MANUAL', clan: '', clanTag: '' };
    var tagOrgTrim = String(datos.tagOrg || '').trim();
    if (tagOrgTrim) {
      organizadorInfo.tag = tagOrgTrim;
      organizadorInfo.clan = String(datos.clanOrg || '').trim();
      organizadorInfo.clanTag = String(datos.clanTagOrg || '').trim();
    }
  }

  var ss = _getSs();
  // FASE (16-sep-2026, fallback web->CSV, escritura): ya NO se corta acá con "La hoja CR_Lista no existe" -- ni el MODO CREAR ni el MODO EDITAR (ambos más abajo) necesitan `sh` para arrancar: los dos caen a Backup_CR_Lista.csv cuando… [→ Contexto_Base_Web.md §37B344]
  var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);

  var semanas = String(datos.semanas || '').trim();
  var comentarioComun = String(datos.comentario || '').trim();

  var idExistente = String(datos.idExistente || '').trim();

  if (!idExistente) {
    // ----- MODO CREAR: par nuevo -----
    var idsNuevos = _generarParIdsCRLista(fecha, ss); // ya con fallback a CSV para el correlativo, ver su docblock
    var comunes = {
      fecha: fecha,
      hora: datos.hora || '',
      semanas: semanas,
      temporada: idsNuevos.temporada,
      organizador: organizadorInfo ? organizadorInfo.nombre : nomMultiElegido,
      tagOrg: organizadorInfo ? organizadorInfo.tag : '',
      clan: organizadorInfo ? organizadorInfo.clan : '',
      clanTag: organizadorInfo ? organizadorInfo.clanTag : '',
      comentario: comentarioComun
    };

    var filaAscenso  = _construirFilaCRLista(comunes, 'Ascenso',  idsNuevos.idAscenso,  datos.ascenso);
    var filaDescenso = _construirFilaCRLista(comunes, 'Descenso', idsNuevos.idDescenso, datos.descenso);

    if (sh) {
      // ----- Camino normal: la hoja está disponible -----
      var filaBaseSheet = Math.max(sh.getLastRow() + 1, 4);
      filaAscenso[CR.NUM - 1]  = filaBaseSheet - 3;   // N° = posición dentro de los datos (fila 4 = N°1)
      filaDescenso[CR.NUM - 1] = filaBaseSheet - 2;

      sh.getRange(filaBaseSheet, 1, 2, CR_TOTAL_COLS).setValues([filaAscenso, filaDescenso]);
      _setDateCell(sh, filaBaseSheet,     CR.FECHA, fecha, 'dd/MM/yyyy');
      _setDateCell(sh, filaBaseSheet + 1, CR.FECHA, fecha, 'dd/MM/yyyy');
      // FIX (16-sep-2026): número de formato de CR.HORA -- ver docblock de _horaStringADate() (26_Torneos_Core.gs) y de _construirFilaCRLista(), más arriba en este archivo. [→ Contexto_Base_Web.md §37B345]
      _trySetFmt(sh, filaBaseSheet,     CR.HORA, 'h:mm:ss AM/PM');
      _trySetFmt(sh, filaBaseSheet + 1, CR.HORA, 'h:mm:ss AM/PM');
      applyBorderCenter(sh.getRange(filaBaseSheet, 1, 2, CR_TOTAL_COLS));
      _aplicarDropdownTipoCRLista(ss); // reaplica sobre TODA la columna, ver su docblock
      _aplicarDropdownEstadoCRLista(ss); // idem, ver su docblock (02_Setup_Hojas.gs)
      // NUEVO (16-sep-2026, pedido del usuario -- "las filas se deben ordenar de más reciente a más antiguo según la columna Fecha"): ver _reordenarCRListaPorFecha() (26_Torneos_Core.gs). [→ Contexto_Base_Web.md §37B346]
      _reordenarCRListaPorFecha(ss);

      Logger.log('[CR_Lista] Par nuevo creado: ' + idsNuevos.idAscenso + ' / ' + idsNuevos.idDescenso + '.');
      return { ok: true, idAscenso: idsNuevos.idAscenso, idDescenso: idsNuevos.idDescenso };
    }

    // Fallback: la hoja no está disponible, se escribe en el CSV ----- Ver docblock de la función para el criterio completo. Backup_CR_Lista.csv debe existir de antes (ya sincronizado al menos una vez) -- si no, no hay encabezado de… [→ Contexto_Base_Web.md §37B347]
    var csvExistenteCrear = _loadCSVFromDrive('Backup_CR_Lista.csv');
    if (!csvExistenteCrear) {
      return { ok: false, error: 'La hoja CR_Lista no existe y tampoco hay un respaldo Backup_CR_Lista.csv del cual partir.' };
    }
    var parseadoCrear   = _parseCSV(csvExistenteCrear);
    var headerCrear      = (parseadoCrear && parseadoCrear[0]) || [];
    var filasCsvCrear     = (parseadoCrear && parseadoCrear.length > 1) ? parseadoCrear.slice(1) : [];

    var numFilaCsv = filasCsvCrear.length + 1; // mismo criterio que filaBaseSheet-3 de arriba, pero sobre las filas del CSV
    filaAscenso[CR.NUM - 1]  = numFilaCsv;
    filaDescenso[CR.NUM - 1] = numFilaCsv + 1;
    // Fecha se guarda como texto canónico en el CSV (nunca como objeto Date) -- mismo criterio que _extraerValoresConLinksReales() al sincronizar desde la hoja, así importarCRListaDesdeCSV()/ _webCRListaListar() la pueden reconstruir… [→ Contexto_Base_Web.md §37B348]
    filaAscenso[CR.FECHA - 1]  = _formatFechaCanonica(fecha);
    filaDescenso[CR.FECHA - 1] = _formatFechaCanonica(fecha);
    // Hora: mismo criterio que Fecha justo arriba -- se guarda como texto canónico "HH:mm:ss" (ver _formatHoraCanonica(), 26_Torneos_Core.gs) en vez del objeto Date que armó _construirFilaCRLista(), para que _getFilaCRListaPorId() la… [→ Contexto_Base_Web.md §37B349]
    filaAscenso[CR.HORA - 1]  = _formatHoraCanonica(filaAscenso[CR.HORA - 1]);
    filaDescenso[CR.HORA - 1] = _formatHoraCanonica(filaDescenso[CR.HORA - 1]);

    filasCsvCrear.push(filaAscenso, filaDescenso);
    _saveCSVToDrive('Backup_CR_Lista.csv', _encodeCSV([headerCrear].concat(filasCsvCrear)));

    Logger.log('[CR_Lista] Hoja no disponible -- par nuevo ' + idsNuevos.idAscenso + ' / ' + idsNuevos.idDescenso +
               ' guardado directo en Backup_CR_Lista.csv (se restaura a la hoja con importarCRListaDesdeCSV() cuando vuelva a estar disponible).');
    return { ok: true, idAscenso: idsNuevos.idAscenso, idDescenso: idsNuevos.idDescenso };
  }

  // MODO EDITAR: par existente ----- _getParCRListaPorId() (justo abajo) YA localiza el par aunque la hoja no esté disponible (fallback a Backup_CR_Lista.csv, ver su docblock en 26_Torneos_Core.gs). GUARDAR el cambio ahora también… [→ Contexto_Base_Web.md §37B350]
  var par = _getParCRListaPorId(idExistente);
  if (!par.ascenso && !par.descenso) {
    return { ok: false, error: 'No encontré el par de CR_Lista con ID ' + idExistente + '.' };
  }

  var idAscensoPar  = par.ascenso  ? par.ascenso.idFila  : idExistente.replace(/^D_/, 'A_');
  var idDescensoPar = par.descenso ? par.descenso.idFila : idExistente.replace(/^A_/, 'D_');

  if (sh) {
    // ----- Camino normal: la hoja está disponible -----
    var lastRow = sh.getLastRow();
    if (lastRow < 4) return { ok: false, error: 'CR_Lista está vacía, no hay nada que editar.' };
    var todosDatos = sh.getRange(4, 1, lastRow - 3, CR_TOTAL_COLS).getValues();

    var filaFisicaAscenso = -1, filaFisicaDescenso = -1, temporadaExistente = null;
    for (var i = 0; i < todosDatos.length; i++) {
      var idFila = String(todosDatos[i][CR.ID - 1] || '').trim();
      if (idFila === idAscensoPar)  { filaFisicaAscenso  = i + 4; temporadaExistente = todosDatos[i][CR.TEMPORADA - 1]; }
      if (idFila === idDescensoPar) { filaFisicaDescenso = i + 4; temporadaExistente = todosDatos[i][CR.TEMPORADA - 1]; }
    }

    var comunesEdit = {
      fecha: fecha,
      hora: datos.hora || '',
      semanas: semanas,
      temporada: temporadaExistente !== null ? temporadaExistente : _calcularTemporadaParaFecha(fecha),
      organizador: organizadorInfo ? organizadorInfo.nombre : nomMultiElegido,
      tagOrg: organizadorInfo ? organizadorInfo.tag : '',
      clan: organizadorInfo ? organizadorInfo.clan : '',
      clanTag: organizadorInfo ? organizadorInfo.clanTag : '',
      comentario: comentarioComun
    };

    if (filaFisicaAscenso > 0) {
      var filaAscensoEdit = _construirFilaCRLista(comunesEdit, 'Ascenso', idAscensoPar, datos.ascenso);
      filaAscensoEdit[CR.NUM - 1] = sh.getRange(filaFisicaAscenso, CR.NUM).getValue(); // N° no se toca
      sh.getRange(filaFisicaAscenso, 1, 1, CR_TOTAL_COLS).setValues([filaAscensoEdit]);
      _setDateCell(sh, filaFisicaAscenso, CR.FECHA, fecha, 'dd/MM/yyyy');
      _trySetFmt(sh, filaFisicaAscenso, CR.HORA, 'h:mm:ss AM/PM'); // ver docblock de _horaStringADate()
    }
    if (filaFisicaDescenso > 0) {
      var filaDescensoEdit = _construirFilaCRLista(comunesEdit, 'Descenso', idDescensoPar, datos.descenso);
      filaDescensoEdit[CR.NUM - 1] = sh.getRange(filaFisicaDescenso, CR.NUM).getValue();
      sh.getRange(filaFisicaDescenso, 1, 1, CR_TOTAL_COLS).setValues([filaDescensoEdit]);
      _setDateCell(sh, filaFisicaDescenso, CR.FECHA, fecha, 'dd/MM/yyyy');
      _trySetFmt(sh, filaFisicaDescenso, CR.HORA, 'h:mm:ss AM/PM');
    }

    // NUEVO (16-sep-2026, pedido del usuario): la Fecha pudo haber cambiado en esta edición -- se reordena la hoja por si esta corrida ahora corresponde en otra posición (ver _reordenarCRListaPorFecha(), 26_Torneos_Core.gs). [→ Contexto_Base_Web.md §37B351]
    _reordenarCRListaPorFecha(ss);

    Logger.log('[CR_Lista] Par ' + idAscensoPar + ' / ' + idDescensoPar + ' editado.');
    return { ok: true, idAscenso: idAscensoPar, idDescenso: idDescensoPar };
  }

  // Fallback: la hoja no está disponible, se edita directo en el CSV ----- Mismo criterio que el fallback del MODO CREAR (más arriba): Backup_CR_Lista.csv debe existir de antes (ya sincronizado al menos una vez) -- si no, no hay… [→ Contexto_Base_Web.md §37B352]
  var csvExistenteEditar = _loadCSVFromDrive('Backup_CR_Lista.csv');
  if (!csvExistenteEditar) {
    return { ok: false, error: 'La hoja CR_Lista no existe y tampoco hay un respaldo Backup_CR_Lista.csv del cual partir.' };
  }
  var parseadoEditar = _parseCSV(csvExistenteEditar);
  var headerEditar  = (parseadoEditar && parseadoEditar[0]) || [];
  var filasCsvEditar = (parseadoEditar && parseadoEditar.length > 1) ? parseadoEditar.slice(1) : [];

  var idxAscensoCsv = -1, idxDescensoCsv = -1, temporadaExistenteCsv = null;
  for (var j = 0; j < filasCsvEditar.length; j++) {
    var idFilaCsv = String(filasCsvEditar[j][CR.ID - 1] || '').trim();
    if (idFilaCsv === idAscensoPar)  { idxAscensoCsv  = j; temporadaExistenteCsv = filasCsvEditar[j][CR.TEMPORADA - 1]; }
    if (idFilaCsv === idDescensoPar) { idxDescensoCsv = j; temporadaExistenteCsv = filasCsvEditar[j][CR.TEMPORADA - 1]; }
  }
  if (idxAscensoCsv < 0 && idxDescensoCsv < 0) {
    return { ok: false, error: 'No encontré el par de CR_Lista con ID ' + idExistente + ' en el respaldo Backup_CR_Lista.csv.' };
  }

  var comunesEditCsv = {
    fecha: fecha,
    hora: datos.hora || '',
    semanas: semanas,
    temporada: (temporadaExistenteCsv !== null && temporadaExistenteCsv !== undefined && temporadaExistenteCsv !== '')
      ? Number(temporadaExistenteCsv) : _calcularTemporadaParaFecha(fecha),
    organizador: organizadorInfo ? organizadorInfo.nombre : nomMultiElegido,
    tagOrg: organizadorInfo ? organizadorInfo.tag : '',
    clan: organizadorInfo ? organizadorInfo.clan : '',
    clanTag: organizadorInfo ? organizadorInfo.clanTag : '',
    comentario: comentarioComun
  };

  if (idxAscensoCsv >= 0) {
    var filaAscensoEditCsv = _construirFilaCRLista(comunesEditCsv, 'Ascenso', idAscensoPar, datos.ascenso);
    filaAscensoEditCsv[CR.NUM - 1]   = filasCsvEditar[idxAscensoCsv][CR.NUM - 1]; // N° no se toca
    filaAscensoEditCsv[CR.FECHA - 1] = _formatFechaCanonica(fecha); // texto canónico, igual que MODO CREAR
    filaAscensoEditCsv[CR.HORA - 1]  = _formatHoraCanonica(filaAscensoEditCsv[CR.HORA - 1]); // idem, ver MODO CREAR
    filasCsvEditar[idxAscensoCsv] = filaAscensoEditCsv;
  }
  if (idxDescensoCsv >= 0) {
    var filaDescensoEditCsv = _construirFilaCRLista(comunesEditCsv, 'Descenso', idDescensoPar, datos.descenso);
    filaDescensoEditCsv[CR.NUM - 1]   = filasCsvEditar[idxDescensoCsv][CR.NUM - 1];
    filaDescensoEditCsv[CR.FECHA - 1] = _formatFechaCanonica(fecha);
    filaDescensoEditCsv[CR.HORA - 1]  = _formatHoraCanonica(filaDescensoEditCsv[CR.HORA - 1]);
    filasCsvEditar[idxDescensoCsv] = filaDescensoEditCsv;
  }

  _saveCSVToDrive('Backup_CR_Lista.csv', _encodeCSV([headerEditar].concat(filasCsvEditar)));

  Logger.log('[CR_Lista] Hoja no disponible -- par ' + idAscensoPar + ' / ' + idDescensoPar +
             ' editado directo en Backup_CR_Lista.csv (se restaura a la hoja con importarCRListaDesdeCSV() cuando vuelva a estar disponible).');
  return { ok: true, idAscenso: idAscensoPar, idDescenso: idDescensoPar };
}

// _webGuerraEnVivo(): FIX (30-ago-2026, pedido usuario — revisión de seguridad): endpoint PÚBLICO (gateado con WEB_MEMBER_TOKEN, ver doGet() en 38_Web_Endpoints.gs) para que guerra.html deje de depender de DASHBOARD_TOKEN — ese token está pensado para… [→ Contexto_Base_Web.md §37B353]
function _webGuerraEnVivo(opciones) {
  // CAMBIO (28-sep-2026, Fase 5b tanda C, decisión del usuario): nomMulti y prestamo de cada pendiente son solo para admins. La caché grande (WEB_GUERRA_VIVO_KEY) es UNA sola para todos y la llena también el bot… [→ Contexto_Base_Web.md §37B354]
  var completa = _webGuerraEnVivoCompleta_();
  if (opciones && opciones.esAdmin === true) return completa;
  return _webGuerraQuitarCamposAdmin_(completa);
}

// _webGuerraQuitarCamposAdmin_(): NUEVO (08-oct-2026): el recorte de nomMulti/prestamo que antes estaba dentro de _webGuerraEnVivo(), sacado a una función para que _publicarGuerraEstatico_() (39_Publicar_Guerra.gs) use EXACTAMENTE el mismo recorte. No cambia… [→ Contexto_Base_Web.md §37B355]
function _webGuerraQuitarCamposAdmin_(completa) {
  var copia = {};
  Object.keys(completa || {}).forEach(function (k) { copia[k] = completa[k]; });
  copia.pendientes = ((completa && completa.pendientes) || []).map(function (p) {
    var limpio = {};
    Object.keys(p).forEach(function (k) {
      if (k !== 'nomMulti' && k !== 'prestamo') limpio[k] = p[k];
    });
    return limpio;
  });
  return copia;
}

// _webGuerraEnVivoCompleta_(): Cuerpo original de _webGuerraEnVivo() (caché compartida + anti-estampida + _getDatosDashboard()), sin ningún recorte por rol. Solo la llama _webGuerraEnVivo(), que decide qué campos ve cada quien. Separada el 28-sep-2026 (Fase 5b… [→ Contexto_Base_Web.md §37B356]
function _webGuerraEnVivoCompleta_() {
  // 19-sep-2026 (pedido del usuario -- webGuerraEnVivo seguía lento): la salida completa se comparte entre TODOS los visitantes durante WEB_GUERRA_VIVO_TTL_SEG segundos. Antes cada visita (y cada auto-refresco de guerra.html) volvía… [→ Contexto_Base_Web.md §37B357]
  var t0Vivo = Date.now();
  var hit = _webCacheGrandeLeer_(WEB_GUERRA_VIVO_KEY);
  if (hit) {
    _diagGuerraVivo_('[WebGuerraEnVivo] caché HIT en ' + (Date.now() - t0Vivo) + 'ms');
    return hit;
  }

  var cache = CacheService.getScriptCache();
  var claveCalc = WEB_GUERRA_VIVO_KEY + '_calc';

  // Anti-estampida sin usar LockService: el bloqueo de script lo usan los procesos que escriben las hojas (runAll, sincronizaciones...) y no debe quedar retenido ~30 s por una simple lectura. Si otro visitante ya está recalculando… [→ Contexto_Base_Web.md §37B358]
  try {
    if (cache.get(claveCalc)) {
      _diagGuerraVivo_('[WebGuerraEnVivo] otro visitante está calculando; se espera su resultado');
      // 19-sep-2026 (registro real): el cálculo tarda 25-31 s y el tope anterior (12 x 2 s = 24 s) hacía que el segundo visitante se rindiera justo antes de que el primero terminara, y recalculara otros ~28 s (53 s en total). Ahora se… [→ Contexto_Base_Web.md §37B359]
      for (var i = 0; i < 60; i++) {
        Utilities.sleep(1000);
        hit = _webCacheGrandeLeer_(WEB_GUERRA_VIVO_KEY);
        if (hit) {
          _diagGuerraVivo_('[WebGuerraEnVivo] caché HIT tras esperar ' + (Date.now() - t0Vivo) + 'ms');
          return hit;
        }
        if (!cache.get(claveCalc)) break;
      }
    }
    cache.put(claveCalc, '1', 90); // 19-sep-2026: 60 -> 90 s, el cálculo real ronda los 30 s y puede alargarse con carga
  } catch (e) {
    // Caché no disponible: se sigue calculando sin coordinación.
  }

  try {
    _diagGuerraVivo_('[WebGuerraEnVivo] caché MISS, se calcula (esperó ' + (Date.now() - t0Vivo) + 'ms antes de calcular)');
    var datos = _getDatosDashboard();
    _webCacheGrandeGuardar_(WEB_GUERRA_VIVO_KEY, datos, WEB_GUERRA_VIVO_TTL_SEG);
    _diagGuerraVivo_('[WebGuerraEnVivo] listo, total desde que entró la petición=' + (Date.now() - t0Vivo) + 'ms');
    return datos;
  } finally {
    try { cache.remove(claveCalc); } catch (e2) { /* nada que hacer */ }
  }
}

var WEB_GUERRA_VIVO_KEY     = 'web_guerra_vivo_v1';
// 19-sep-2026: 120 -> 300 s. En el registro real, cada 3.er refresco (cada 60 s desde guerra.html) caía en una caché vencida y el visitante esperaba ~25 s. Los datos de guerra los actualiza el bot cada ~10 min (cada hora fuera de… [→ Contexto_Base_Web.md §37B360]
var WEB_GUERRA_VIVO_TTL_SEG = 300;

// NUEVO (19-sep-2026, pedido del usuario -- cada 5 min un visitante esperaba 11-18 s mientras se recalculaba el dashboard): el bot deja el caché de webGuerraEnVivo YA CALIENTE al terminar runGuerra() (ver 00_Main.gs), así el… [→ Contexto_Base_Web.md §37B361]
var WEB_GUERRA_VIVO_TTL_CALENTADO_VENTANA_SEG = 660;
var WEB_GUERRA_VIVO_TTL_CALENTADO_FUERA_SEG   = 7200;

// _calentarCacheGuerraEnVivo_(): Recalcula el dashboard (_getDatosDashboard(), el mismo que devuelve _webGuerraEnVivo() a los visitantes) y lo guarda en el MISMO caché (WEB_GUERRA_VIVO_KEY) con `ttlSeg` segundos de vida. Pensada para llamarse desde el bot… [→ Contexto_Base_Web.md §37B362]
function _calentarCacheGuerraEnVivo_(ttlSeg) {
  var t0 = Date.now();
  var ttl = Number(ttlSeg) || WEB_GUERRA_VIVO_TTL_SEG;
  var cache = CacheService.getScriptCache();
  var claveCalc = WEB_GUERRA_VIVO_KEY + '_calc';
  try { cache.put(claveCalc, '1', 90); } catch (e0) { /* sin coordinación: se calienta igual */ }
  try {
    var datos = _getDatosDashboard();
    var ok = _webCacheGrandeGuardar_(WEB_GUERRA_VIVO_KEY, datos, ttl);
    try { _publicarGuerraEstatico_(datos); } catch (ePub) { _diagGuerraVivo_('[GuerraEstatico] error inesperado (no afecta al bot): ' + ePub); } // NUEVO 08-oct-2026: copia pública en GitHub, ver 39_Publicar_Guerra.gs
    try { _publicarRosterEstatico_(); } catch (eRos) { _diagGuerraVivo_('[RosterEstatico] error inesperado (no afecta al bot): ' + eRos); }
    try { _publicarHomeEstatico_(); } catch (eHome) { _diagGuerraVivo_('[HomeEstatico] error inesperado (no afecta al bot): ' + eHome); }
    try { _publicarTorneosEstatico_(); } catch (eTor) { _diagGuerraVivo_('[TorneosEstatico] error inesperado (no afecta al bot): ' + eTor); }
    _diagGuerraVivo_('[WebGuerraEnVivo] caché CALENTADA por el bot en ' + (Date.now() - t0) + 'ms, TTL ' + ttl + ' s' + (ok ? '' : ' (NO se pudo guardar)'));
    return ok;
  } finally {
    try { cache.remove(claveCalc); } catch (e1) { /* nada que hacer */ }
  }
}

// calentarCacheGuerraEnVivo(): Atajo manual (ejecutar desde el editor de Apps Script) para calentar el caché con el TTL de la ventana de guerra y comprobar el resultado con verDiagnosticoGuerraVivo(). [→ Contexto_Base_Web.md §37B363]
function calentarCacheGuerraEnVivo() {
  _calentarCacheGuerraEnVivo_(WEB_GUERRA_VIVO_TTL_CALENTADO_VENTANA_SEG);
}

// _webCacheGrandeGuardar_(): CacheService admite máximo 100 KB por valor y la salida de _getDatosDashboard() (historial completo de temporadas) lo supera con holgura, por eso _webCacheado() no sirve aquí: fallaba en silencio y no cacheaba nada. Estas dos… [→ Contexto_Base_Web.md §37B364]
function _webCacheGrandeGuardar_(key, obj, ttlSeg) {
  try {
    var json = JSON.stringify(obj);
    var gz   = Utilities.gzip(Utilities.newBlob(json, 'application/json', 'datos.json'));
    var b64  = Utilities.base64Encode(gz.getBytes());
    var TROZO = 90000;
    var n = Math.ceil(b64.length / TROZO);
    var trozos = {};
    for (var i = 0; i < n; i++) trozos[key + '_' + i] = b64.substr(i * TROZO, TROZO);
    var cache = CacheService.getScriptCache();
    cache.putAll(trozos, ttlSeg);
    cache.put(key + '_n', String(n), ttlSeg);
    _diagGuerraVivo_('[WebGuerraEnVivo] caché guardada: JSON ' + json.length + ' car. -> gzip+base64 ' + b64.length + ' car. en ' + n + ' trozo(s), ' + ttlSeg + ' s.');
    return true;
  } catch (e) {
    _diagGuerraVivo_('[WebGuerraEnVivo] no se pudo guardar en caché (el endpoint sigue funcionando): ' + e);
    return false;
  }
}

function _webCacheGrandeLeer_(key) {
  try {
    var cache = CacheService.getScriptCache();
    var n = Number(cache.get(key + '_n'));
    if (!n || n < 1) return null;
    var claves = [];
    for (var i = 0; i < n; i++) claves.push(key + '_' + i);
    var got = cache.getAll(claves);
    var b64 = '';
    for (var j = 0; j < n; j++) {
      var parte = got[claves[j]];
      if (parte === null || parte === undefined) { _diagGuerraVivo_('[WebGuerraEnVivo] caché incompleta: falta el trozo ' + j + ' de ' + n); return null; } // trozo expirado o evicto: no usar
      b64 += parte;
    }
    var bytes = Utilities.base64Decode(b64);
    var json  = Utilities.ungzip(Utilities.newBlob(bytes, 'application/x-gzip', 'datos.gz')).getDataAsString('UTF-8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}