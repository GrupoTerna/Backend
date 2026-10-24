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
// =============================================================================

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
  var fallidos = [];

  for (var phone in grupos) {
    if (Date.now() - startTime > MAX_TIME) {
      Logger.log('[SecundarioSync] Tiempo límite alcanzado. Guardando lo avanzado.');
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
            } else {
              People.People.createContact(personObj);
              creados++;
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
              fallidos.push(contactName);
            }
          }
        }
      } else {
        Logger.log('[SecundarioSync] No se pudo sincronizar el contacto "' + contactName + '". Motivo: ' + msg +
          '. No fue un problema de cuota: puede ser un dato con formato inválido o un problema ' +
          'temporal de Google. Tampoco se elimina por este motivo.');
        fallidos.push(contactName);
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
    try {
      People.People.deleteContact(existingContacts[orphanPhones[oi]].resourceName);
      eliminados++;
    } catch(e) {}
  }

  if (fallidos.length > 0) {
    Logger.log('[SecundarioSync] ' + fallidos.length + ' contacto(s) no se pudieron sincronizar en esta ' +
      'ejecución (ver detalle arriba). No fueron eliminados: ' + fallidos.join(', ') + '.');
  }

  Logger.log('[SecundarioSync] Proceso terminado con éxito.');
  Logger.log('[SecundarioSync] Resultados -> Creados: ' + creados + ', Actualizados: ' + actualizados + ', Eliminados obsoletos: ' + eliminados);
}
