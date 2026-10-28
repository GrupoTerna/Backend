/*
AVISO PARA CUALQUIER IA O PERSONA QUE EDITE ESTE PROYECTO:
1) NO metas los archivos dentro de una carpeta al armar el ZIP. Cada
   archivo .gs debe quedar SUELTO en la raíz del .zip.
   Correcto:   01_Principal.gs
   Incorrecto: Base/01_Principal.gs  (esto pega el nombre de la carpeta
   al del archivo y crea un duplicado en vez de actualizar el original).
2) Al subir de vuelta, usa el MISMO nombre exacto de archivo que bajaste,
   sin prefijos ni sufijos. Si agregas un archivo nuevo, dale un nombre
   distinto; nunca dupliques uno existente con otro nombre.
3) NO leas, edites, generes ni actualices "Script consolidado.gs". Ese
   archivo es un respaldo generado 100% automáticamente por las propias
   funciones del Generador (_descargarProyectoAArchivos) cada vez que se
   sube o descarga cualquier formato. Cualquier IA o persona que edite
   este proyecto debe ignorarlo por completo: no es código fuente real,
   es solo un resumen legible; editarlo a mano no tiene efecto (se
   sobrescribe automáticamente) y leerlo para entender el código es
   redundante, ya que su contenido es idéntico a la suma de los demás
   archivos .gs del proyecto.
4) Cuando una IA edite este proyecto a pedido del usuario, NO debe
   reempaquetar ni entregar el .zip completo del proyecto por defecto.
   Debe entregar el CONTENIDO COMPLETO (no fragmentos ni parches) de
   cada archivo NUMERADO que haya modificado (01_Principal.gs,
   02_Backstage.gs, etc.), listo para copiar/pegar y reemplazar el
   archivo entero en el editor; y el manifiesto "appsscript.json"
   completo también, solo si ese archivo cambió. Nunca entregar
   "Script consolidado.gs" ni este mismo LEEME como parte de una
   edición (ver punto 3). Esto ahorra tokens y tiempo frente a
   regenerar y comprimir todos los archivos cada vez, incluidos los
   que no cambiaron. Solo generar el .zip completo si el usuario lo
   pide explícitamente.
5) Los archivos modificados (punto 4) se deben ENTREGAR COMO ARCHIVO
   DESCARGABLE/ABRIBLE, nunca pegados como bloque de código dentro del
   chat. Un archivo real se puede abrir, copiar y guardar directamente;
   un bloque de código en el chat obliga a seleccionar y copiar a mano,
   y es más difícil de manejar en archivos largos.
*/

/* CÓDIGO CONSOLIDADO GENERADO EL 28/10/2026 17:34:41 */



// --- ARCHIVO: Código.gs ---
// =============================================================================
// Sincronizador_Correo_Secundario.gs
// Se ejecuta en la cuenta secundaria para jalar y guardar los contactos.
// Requiere habilitar People API en Servicios de este proyecto secundario.
//
// MODIFICACIÓN: Agrupa por número telefónico usando estrictamente el formato
// acumulado de la columna "Jugador" enviado por la Web App, garantizando la
// consistencia y la eliminación en cascada si un contacto deja de ser enviado.
//
// MODIFICACIÓN (corrección de borrado incorrecto de contactos activos):
// Tenía el mismo bug que existía en el sincronizador de la cuenta principal:
// si la actualización de un contacto fallaba por cuota y el reintento tenía
// éxito, la entrada nunca se sacaba de "existingContacts", así que el paso
// de limpieza (6) la trataba como huérfana y la borraba, aunque el contacto
// siguiera activo. Ahora qué se borra se decide SOLO comparando el teléfono
// contra "grupos" (los contactos que mandó la Web App en esta ejecución),
// nunca contra si la escritura tuvo éxito o falló. También se amplio la
// detección de errores de cuota (antes solo buscaba el texto '429' literal,
// y Google a veces no lo incluye) y los reintentos, igual que en el
// sincronizador principal.
//
// MODIFICACIÓN (23-oct-2026, hora de Lima): la URL del Web App y el token ya
// NO van escritos en el código (el repo Backend es público). Se leen de las
// Propiedades del script de este proyecto secundario:
//   - URL_CONTACTOS_BASE : URL del Web App terminada en /exec, sin "?token=".
//   - CONTACTOS_TOKEN    : mismo valor que la propiedad CONTACTOS_TOKEN del
//                          proyecto Base (Web App: 38_Web_Endpoints.gs, doGet).
// Motivo: desde sep-2026 el token de Base vive solo en sus Propiedades del
// script; un token escrito aquí dejó de coincidir y el Web App respondía
// {"error":"No autorizado"}. Ver LEEME.md de esta carpeta.
//
// MODIFICACIÓN (25-oct-2026, hora de Lima; pedido de la usuaria): el registro ahora
// tiene el mismo nivel de detalle que SincronizarContactosNube() de Base
// (16_ContactsSync.gs): al final lista, AGRUPADO POR CLAN, quiénes se agregaron y
// quiénes se eliminaron (con el clan que traía su biografía), y explica en lenguaje
// simple los contactos que no se pudieron guardar (cuota u otro motivo). También
// muestra el resumen si la corrida se corta por tiempo (en ese caso NO se borra nada).
// Ver Contexto_Base_Web.md §PF277.
// =============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): este archivo no tiene constantes ni variables globales; por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Sincronización de contactos desde el Web App (SincronizarDesdeWebAPI)
//  Parte 2 — Funciones que no se corren a mano
//    - Sincronización de contactos: ayudas (en el orden en que las llama SincronizarDesdeWebAPI: URL del Web App, resumen por clan y su agrupación)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Sincronización de contactos desde el Web App -----

function SincronizarDesdeWebAPI() {
  Logger.log('[SecundarioSync] Iniciando descarga de contactos desde el Web App...');
  var startTime = Date.now();
  var MAX_TIME = 200000; // ~3.3 min

  // 1. Obtener los datos mediante UrlFetchApp desde tu Web App
  var response = UrlFetchApp.fetch(_urlContactos_(), { muteHttpExceptions: true });
  var contactosAPI = [];

  try {
    contactosAPI = JSON.parse(response.getContentText());
  } catch(e) {
    Logger.log('[SecundarioSync] Error crítico al parsear el JSON recibido: ' + e.message);
    return;
  }

  if (contactosAPI.error) {
    Logger.log('[SecundarioSync] El Web App devolvió un error: ' + contactosAPI.error);
    return;
  }

  Logger.log('Contactos recibidos de la API: ' + contactosAPI.length);

  if (contactosAPI.length === 0) {
    Logger.log('[SecundarioSync] No hay datos para procesar. Finalizando.');
    return;
  }

  // 2. Mapear e indexar acumulando por teléfono (Garantiza consistencia multi-cuenta)
  var grupos = {};
  for (var i = 0; i < contactosAPI.length; i++) {
    var c = contactosAPI[i];

    var phone = String(c.telefono_completo || c.phone || '').replace(/[^\d+]/g, '');
    if (!phone) continue;

    // Prioridad absoluta a la columna 'jugador' que envía tu Web App principal
    var jugadorTexto = String(c.jugador || c.nombre || 'Sin Nombre').trim();
    var tagItem = String(c.tag || c.tag_jugador || '').trim();
    // FIX (sufijo C-1,2,3,4): la Web App (38_Web_Endpoints.gs,
    // _generarJsonContactos()) manda codigo_clan, el mismo número que usa la
    // cuenta principal (16_ContactsSync.gs) para el sufijo "(C-1,2,3...)".
    // Puede venir null/undefined si el clan todavía no tiene código asignado.
    var codigoClanItem = (c.codigo_clan !== undefined && c.codigo_clan !== null) ? Number(c.codigo_clan) : null;

    if (!grupos[phone]) {
      grupos[phone] = {
        phone: phone,
        listaJugadores: [],
        clan: String(c.clan || 'Sin Clan').trim(),
        rango: String(c.rango || c.rango_puest || 'Miembro').trim(),
        tags: [],
        // FIX (sufijo C-1,2,3,4): un código por cada clan distinto en el
        // que este teléfono tiene cuentas, mismo criterio que
        // "codigosDelTelefono" en SincronizarContactosNube() (principal).
        codigosClan: []
      };
    }

    var g = grupos[phone];
    // Acumulamos de manera única para evitar nombres duplicados en la cadena
    if (jugadorTexto && g.listaJugadores.indexOf(jugadorTexto) < 0) g.listaJugadores.push(jugadorTexto);
    if (tagItem && g.tags.indexOf(tagItem) < 0) g.tags.push(tagItem);
    if (codigoClanItem !== null && g.codigosClan.indexOf(codigoClanItem) < 0) g.codigosClan.push(codigoClanItem);
  }

  Logger.log('[SecundarioSync] Total números de teléfono únicos a procesar: ' + Object.keys(grupos).length);

  // 3. Caché de Etiquetas (ContactGroups) en el Correo Secundario
  var groupMap = {};
  try {
    var groupsResponse = People.ContactGroups.list();
    var contactGroups = groupsResponse.contactGroups || [];
    for (var i = 0; i < contactGroups.length; i++) {
      groupMap[contactGroups[i].name] = contactGroups[i].resourceName;
    }
  } catch(e) {
    Logger.log('[SecundarioSync] Error al listar grupos: ' + e.message);
  }

  function getOrCreateGroup(clanName) {
    if (groupMap[clanName]) return groupMap[clanName];
    try {
      var newGroup = People.ContactGroups.create({
        contactGroup: { name: clanName }
      });
      groupMap[clanName] = newGroup.resourceName;
      return newGroup.resourceName;
    } catch(e) {
      if (e.message && e.message.indexOf('409') !== -1) {
        Utilities.sleep(500);
        var grps = People.ContactGroups.list().contactGroups || [];
        for (var k = 0; k < grps.length; k++) {
          if (grps[k].name === clanName) {
            groupMap[clanName] = grps[k].resourceName;
            return grps[k].resourceName;
          }
        }
      }
      return null;
    }
  }

  // 4. Leer contactos que ya existen en este Correo Secundario
  var existingContacts = {};
  var requestParams = {
    personFields: 'names,phoneNumbers,biographies,memberships',
    pageSize: 1000
  };

  try {
    var pageToken = null;
    do {
      if (pageToken) requestParams.pageToken = pageToken;
      var connResponse = People.People.Connections.list('people/me', requestParams);
      var connections = connResponse.connections || [];

      for (var i = 0; i < connections.length; i++) {
        var person = connections[i];
        var bio = (person.biographies && person.biographies.length > 0) ? person.biographies[0].value : '';
        if (bio.indexOf('[CLASH ROYALE DATA]') !== -1) {
          if (person.phoneNumbers && person.phoneNumbers.length > 0) {
            var ph = person.phoneNumbers[0].canonicalForm || person.phoneNumbers[0].value;
            ph = String(ph).replace(/[^\d+]/g, '');
            existingContacts[ph] = person;
          }
        }
      }
      pageToken = connResponse.nextPageToken;
    } while (pageToken);
  } catch(e) {
    Logger.log('[SecundarioSync] Error leyendo conexiones existentes: ' + e.message);
  }

  Logger.log('[SecundarioSync] Contactos CR previos en cuenta secundaria: ' + Object.keys(existingContacts).length);

  // 5. Crear o Actualizar en la cuenta secundaria
  var creados = 0;
  var actualizados = 0;
  // Acumuladores para el resumen por clan del final (mismo esquema que Base).
  var resumen = { creados: [], actualizados: [], eliminados: [], fallidos: [], noEliminados: [] };

  for (var phone in grupos) {
    if (Date.now() - startTime > MAX_TIME) {
      Logger.log('[SecundarioSync] Tiempo límite alcanzado. Guardando lo avanzado. No se elimina ningún contacto en esta ejecución.');
      Logger.log('[SecundarioSync] Procesados -> Creados: ' + creados + ', Actualizados: ' + actualizados);
      _logResumenSecundario_(resumen);
      Logger.log('[SecundarioSync] Sincronización incompleta (por tiempo) tras ' + (Date.now() - startTime) + ' ms.');
      return;
    }

    var g = grupos[phone];
    // El nombre unificado usando la columna Jugador
    var contactName = g.listaJugadores.join(' / ');

    // FIX (sufijo C-1,2,3,4, pedido de la usuaria): mismo criterio que
    // SincronizarContactosNube() (16_ContactsSync.gs): un número por cada
    // clan distinto en el que este teléfono tiene cuentas, en orden
    // ascendente. Si ningun registro de este teléfono trajo codigo_clan
    // (Web App desactualizada, o el clan aún no tiene código asignado en la
    // cuenta principal), no se agrega sufijo, igual que antes.
    if (g.codigosClan.length > 0) {
      var codigosOrdenados = g.codigosClan.slice().sort(function(a, b) { return a - b; });
      contactName = contactName + ' (C-' + codigosOrdenados.join(',') + ')';
    }

    var bioText = '[CLASH ROYALE DATA]\nTEL: ' + phone + '\nTAGS: ' + g.tags.join(', ') + '\nCLAN: ' + g.clan + '\nRANGO: ' + g.rango;
    var clanGroupRes = getOrCreateGroup(g.clan);

    var personObj = {
      names: [{ givenName: contactName }],
      phoneNumbers: [{ value: phone }],
      biographies: [{ value: bioText }]
    };

    if (clanGroupRes) {
      personObj.memberships = [{ contactGroupMembership: { contactGroupResourceName: clanGroupRes } }];
    }

    try {
      if (existingContacts[phone]) {
        var resourceName = existingContacts[phone].resourceName;
        var etag = existingContacts[phone].etag;
        personObj.etag = etag;
        People.People.updateContact(personObj, resourceName, { updatePersonFields: 'names,phoneNumbers,biographies,memberships' });
        actualizados++;
        resumen.actualizados.push({ nombre: contactName, clan: g.clan });
        // NOTA: ya NO se borra "existingContacts[phone]" aquí a propósito.
        // Antes se hacía para poder detectar huérfanos más adelante, pero
        // eso es justo lo que causaba que un fallo de escritura terminara
        // borrando contactos que seguian activos. Ahora el paso 6 decide
        // que borrar comparando directamente contra "grupos" (la lista real
        // de contactos que mandó la Web App), así que esta linea ya no hace
        // falta.
      } else {
        People.People.createContact(personObj);
        creados++;
        resumen.creados.push({ nombre: contactName, clan: g.clan });
      }
    } catch(e) {
      // Detecta cualquier variante de error de cuota, no solo '429' literal:
      // la API de People a veces devuelve el mensaje como "Quota exceeded
      // for quota metric 'Critical write requests...'" sin el código 429.
      var msg = String(e.message || '');
      var esErrorDeCuota = /429|quota exceeded|resource_exhausted/i.test(msg);

      if (esErrorDeCuota) {
        var reintentoOk = false;
        // Backoff exponencial: 2s, 4s, 8s (igual que en el sincronizador
        // principal), en vez de un único reintento de 1s.
        for (var intento = 1; intento <= 3 && !reintentoOk; intento++) {
          Utilities.sleep(2000 * intento);
          try {
            if (existingContacts[phone]) {
              People.People.updateContact(personObj, existingContacts[phone].resourceName, { updatePersonFields: 'names,phoneNumbers,biographies,memberships' });
              actualizados++;
              resumen.actualizados.push({ nombre: contactName, clan: g.clan });
            } else {
              People.People.createContact(personObj);
              creados++;
              resumen.creados.push({ nombre: contactName, clan: g.clan });
            }
            reintentoOk = true;
          } catch(e2) {
            msg = String(e2.message || '');
            if (intento === 3) {
              Logger.log('[SecundarioSync] No se pudo sincronizar el contacto "' + contactName +
                '" tras 3 intentos. Motivo: Google limita cuántos contactos se pueden crear o ' +
                'actualizar por minuto (cuota de escritura), y ese límite se alcanzó. Esto NO ' +
                'significa que el jugador se haya perdido: solo quedó pendiente de actualizar y ' +
                'debería corregirse solo en la próxima sincronización. No se elimina por este motivo.');
              resumen.fallidos.push({ nombre: contactName, clan: g.clan, motivo: 'cuota' });
            }
          }
        }
      } else {
        Logger.log('[SecundarioSync] No se pudo sincronizar el contacto "' + contactName + '". Motivo: ' + msg +
          '. No fue un problema de cuota: puede ser un dato con formato inválido o un problema ' +
          'temporal de Google. Tampoco se elimina por este motivo.');
        resumen.fallidos.push({ nombre: contactName, clan: g.clan, motivo: 'otro' });
      }
    }
  }

  Logger.log('[SecundarioSync] Procesados -> Creados: ' + creados + ', Actualizados: ' + actualizados);

  // 6. Limpieza: cualquier contacto obsoleto o eliminado en la principal se purga aquí
  //
  // Un contacto se considera obsoleto (y se borra) SOLO cuando su teléfono ya
  // NO esta en "grupos", es decir, la Web App ya no lo mandó en esta
  // ejecución. Esto es independiente de si la escritura de ese contacto tuvo
  // éxito o falló más arriba: un fallo temporal de cuota nunca provoca un
  // borrado, porque el teléfono sigue en "grupos" y nunca se considera huérfano.
  var orphanPhones = [];
  for (var ePhone in existingContacts) {
    if (!grupos[ePhone]) orphanPhones.push(ePhone);
  }

  var eliminados = 0;
  for (var oi = 0; oi < orphanPhones.length; oi++) {
    var orphanPhone = orphanPhones[oi];
    var personOrfano = existingContacts[orphanPhone];
    var nombreOrfano = (personOrfano.names && personOrfano.names[0] &&
      (personOrfano.names[0].displayName || personOrfano.names[0].givenName)) || orphanPhone;
    var bioOrfano = (personOrfano.biographies && personOrfano.biographies[0]) ? personOrfano.biographies[0].value : '';
    var clanMatch = bioOrfano.match(/CLAN:\s*(.+)/);
    var clanOrfano = clanMatch ? clanMatch[1].trim() : '';

    try {
      People.People.deleteContact(personOrfano.resourceName);
      eliminados++;
      resumen.eliminados.push({ nombre: nombreOrfano, clan: clanOrfano });
    } catch(e) {
      resumen.noEliminados.push(nombreOrfano + (clanOrfano ? ' (' + clanOrfano + ')' : ''));
    }
  }

  if (eliminados > 0) {
    Logger.log('[SecundarioSync] Eliminados (inactivos antiguos): ' + eliminados);
  }

  // Resumen amigable, agrupado por clan: qué se agregó y qué se eliminó (igual que Base).
  _logResumenSecundario_(resumen);

  Logger.log('[SecundarioSync] Resultados -> Creados: ' + creados + ', Actualizados: ' + actualizados + ', Eliminados obsoletos: ' + eliminados);
  Logger.log('[SecundarioSync] Sincronización completada en ' + (Date.now() - startTime) + ' ms.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Sincronización de contactos: ayudas -----

// _urlContactos_(): arma la URL del Web App con el token, ambos desde las
// Propiedades del script. Corta con un mensaje claro si falta alguna.
function _urlContactos_() {
  var p = PropertiesService.getScriptProperties();
  var base = p.getProperty('URL_CONTACTOS_BASE');
  var token = p.getProperty('CONTACTOS_TOKEN');
  if (!base || !token) {
    throw new Error('Faltan URL_CONTACTOS_BASE o CONTACTOS_TOKEN en Propiedades del script ' +
      '(Configuración del proyecto > Propiedades del script).');
  }
  return base + '?token=' + encodeURIComponent(token);
}

// _logResumenSecundario_(resumen): escribe el resumen por clan (agregados y eliminados) y, si hubo fallos, su explicación.
// resumen = { creados: [{nombre, clan}], eliminados: [{nombre, clan}], fallidos: [{nombre, clan, motivo}], noEliminados: [..] }
function _logResumenSecundario_(resumen) {
  var aGrp = _agruparPorClanSec_(resumen.creados);
  var eGrp = _agruparPorClanSec_(resumen.eliminados);

  // Unión de clanes reales (sin duplicar), en orden alfabético.
  var clanesReales = [];
  var vistos = {};
  [aGrp.orden, eGrp.orden].forEach(function(orden) {
    orden.forEach(function(c) {
      if (c !== '__SIN_CLAN__' && !vistos[c]) {
        vistos[c] = true;
        clanesReales.push(c);
      }
    });
  });
  clanesReales.sort();

  var agSinClan = aGrp.mapa['__SIN_CLAN__'] || [];
  var elSinClan = eGrp.mapa['__SIN_CLAN__'] || [];

  Logger.log('--- Resumen de cambios por clan ---');
  if (clanesReales.length === 0 && agSinClan.length === 0 && elSinClan.length === 0) {
    Logger.log('No hubo contactos agregados ni eliminados en esta ejecución.');
  } else {
    clanesReales.forEach(function(clan) {
      var ag = aGrp.mapa[clan] || [];
      var el = eGrp.mapa[clan] || [];
      if (ag.length > 0) Logger.log('[' + clan + '] Agregados: ' + ag.join(', '));
      if (el.length > 0) Logger.log('[' + clan + '] Eliminados: ' + el.join(', '));
    });
    if (agSinClan.length > 0) Logger.log('[Sin clan identificado] Agregados: ' + agSinClan.join(', '));
    if (elSinClan.length > 0) Logger.log('[Sin clan identificado] Eliminados: ' + elSinClan.join(', '));
  }

  if (resumen.noEliminados && resumen.noEliminados.length > 0) {
    Logger.log('--- Contactos obsoletos que NO se pudieron eliminar ---');
    Logger.log('Google no dejó borrar ' + resumen.noEliminados.length + ' contacto(s) que ya no vienen de la Web App: ' +
      resumen.noEliminados.join(', ') + '. Siguen en la cuenta; se reintenta en la próxima sincronización.');
  }

  if (resumen.fallidos.length > 0) {
    Logger.log('--- Por qué algunos contactos no se pudieron sincronizar ---');
    Logger.log('Hubo ' + resumen.fallidos.length + ' contacto(s) que no se pudieron guardar en Google Contacts ' +
      'en esta ejecución: ' + resumen.fallidos.map(function(f) { return f.nombre; }).join(', ') + '.');
    var porCuota = resumen.fallidos.filter(function(f) { return f.motivo === 'cuota'; }).length;
    var porOtro = resumen.fallidos.length - porCuota;
    if (porCuota > 0) {
      Logger.log(porCuota + ' por la cuota de Google: la cuenta solo puede crear o modificar una cierta cantidad de ' +
        'contactos por minuto, y con muchos jugadores sincronizándose de una vez es normal alcanzar ese límite.');
    }
    if (porOtro > 0) {
      Logger.log(porOtro + ' por otro motivo (no fue la cuota): puede ser un dato con formato que Google Contacts no acepta, ' +
        'o un problema temporal de Google. El motivo exacto está en la línea «No se pudo sincronizar el contacto» de más arriba.');
    }
    Logger.log('Estos jugadores NO se eliminan ni se pierden por este motivo: solo quedaron pendientes de ' +
      'actualizar y se corrigen solos en la próxima sincronización.');
  }
}

// _agruparPorClanSec_(lista): agrupa [{nombre, clan}] por clan. Sin clan o 'Sin Clan' van a '__SIN_CLAN__'.
function _agruparPorClanSec_(lista) {
  var mapa = {};
  var orden = [];
  for (var idx = 0; idx < lista.length; idx++) {
    var item = lista[idx];
    var clanKey = (item.clan && String(item.clan).trim() && String(item.clan).trim() !== 'Sin Clan')
      ? String(item.clan).trim()
      : '__SIN_CLAN__';
    if (!mapa[clanKey]) {
      mapa[clanKey] = [];
      orden.push(clanKey);
    }
    mapa[clanKey].push(item.nombre);
  }
  return { mapa: mapa, orden: orden };
}


