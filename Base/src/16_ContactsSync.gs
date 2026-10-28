// ==============================================================================
// 16_ContactsSync.gs
// Sincronizacion del Directorio con Google Contacts.
// ==============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): este archivo no tiene constantes ni variables globales y tiene una sola función; por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Sincronización del Directorio con Google Contacts
//  Parte 2 — Funciones que no se corren a mano: ninguna
// Al reordenar no se cambió el código de ninguna función.

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Sincronización del Directorio con Google Contacts -----

// 16_ContactsSync.gs [→ Contexto_Base_Web.md §16B001]

function SincronizarContactosNube() {
  Logger.log('[ContactsSync] Iniciando Sincronización de Contactos...');
  var startTime = Date.now();
  var MAX_TIME = 200000; // ~3.3 min

  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) {
    Logger.log('[ContactsSync] Directorio vacío o no existe.');
    return;
  }

  // 1. Mapeo DINÁMICO de columnas según la Fila 1
  var headers = shDir.getRange(1, 1, 1, shDir.getLastColumn()).getValues()[0];

  function buscarColumna(nombreCabecera) {
    var idx = headers.findIndex(function(h) {
      return String(h).trim().toLowerCase() === nombreCabecera.toLowerCase();
    });
    if (idx === -1) {
      Logger.log('[ContactsSync] ADVERTENCIA: No se encontró la columna "' + nombreCabecera + '"');
    }
    return idx;
  }

  var C = {
    TAG: buscarColumna('Tag'),
    NOMBRE: buscarColumna('Nombre'),
    JUGADOR: buscarColumna('Jugador'),
    NOM_MULTI: buscarColumna('Nom_Multi'),
    RANGO: buscarColumna('Rango'),
    CLAN: buscarColumna('Clan'),
    PREFIJO: buscarColumna('Prefijo'),
    CELULAR: buscarColumna('Celular'),
    ESTADO: buscarColumna('Estado')
  };

  // Columna con el TAG del clan (ej. "#GCRG8L00"), para el sufijo (C-1,2,3...). [→ Contexto_Base_Web.md §16B002]
  C.CLAN_TAG = buscarColumna('ClanTag');
  if (C.CLAN_TAG === -1) C.CLAN_TAG = buscarColumna('Clan Tag');

  Logger.log('[ContactsSync] Índices mapeados -> CELULAR: ' + C.CELULAR + ', ESTADO: ' + C.ESTADO + ', JUGADOR: ' + C.JUGADOR);

  if (C.CELULAR === -1 || C.ESTADO === -1 || C.JUGADOR === -1) {
    Logger.log('[ContactsSync] Error: Faltan columnas críticas en el Directorio. Abortando.');
    return;
  }

  // 2. Leer todos los datos de la tabla
  var data = shDir.getRange(2, 1, shDir.getLastRow() - 1, headers.length).getValues();
  Logger.log('[ContactsSync] Total filas leídas del Directorio: ' + data.length);

  // 3. Agrupar por teléfono (solo activos)
  var grupos = {};
  var contActivos = 0;
  var contConTelefono = 0;

  for (var i = 0; i < data.length; i++) {
    var f = data[i];
    var estadoCelda = String(f[C.ESTADO] || '').trim().toUpperCase();

    if (estadoCelda !== 'ACTIVO') continue;
    contActivos++;

    // Limpieza de caracteres vacíos u ocultos
    var pref = String(f[C.PREFIJO] || '').replace(/\D/g, '');
    var cel  = String(f[C.CELULAR] || '').replace(/\D/g, '');

    if (!cel || cel === '0' || cel === '') continue;
    contConTelefono++;

    if (!pref) {
      if (cel.length > 9) pref = '';
      else pref = (typeof CFG !== 'undefined' && CFG.PREFIJO_DEFAULT) ? CFG.PREFIJO_DEFAULT : '51';
    }

    var phone = '+' + pref + cel;

    if (!grupos[phone]) {
      grupos[phone] = {
        phone: phone,
        listaJugadores: [], // Aquí acumularemos los textos únicos de la columna Jugador
        nomMulti: String(f[C.NOM_MULTI] || '').trim(),
        nombres: [],
        clan: String(f[C.CLAN] || 'Sin Clan').trim(),
        // NUEVO: acumula TODOS los tags de clan distintos que aparecen en [→ Contexto_Base_Web.md §16B003]
        clanTagsTodos: [],
        rango: String(f[C.RANGO] || '').trim(),
        tags: [],
        // Excepción del fundador: mismo chequeo que _calcJugador() en [→ Contexto_Base_Web.md §16B004]
        esFundador: false
      };
    }
    var g = grupos[phone];
    if (_getFundadorCelular_() && cel === _getFundadorCelular_()) g.esFundador = true;

    // FUENTE DE VERDAD: Extrae y acumula de manera única la celda de la columna Jugador
    var jugadorTexto = String(f[C.JUGADOR] || '').trim();
    if (jugadorTexto && g.listaJugadores.indexOf(jugadorTexto) < 0) {
      g.listaJugadores.push(jugadorTexto);
    }

    var nom = String(f[C.NOMBRE] || '').trim();
    if (nom && g.nombres.indexOf(nom) < 0) g.nombres.push(nom);

    var tag = String(f[C.TAG] || '').trim();
    if (tag && g.tags.indexOf(tag) < 0) g.tags.push(tag);

    var clanTagFila = (C.CLAN_TAG !== -1) ? String(f[C.CLAN_TAG] || '').trim() : '';
    if (clanTagFila && g.clanTagsTodos.indexOf(clanTagFila) < 0) g.clanTagsTodos.push(clanTagFila);
  }

  Logger.log('[ContactsSync] Resumen de lectura: ' + contActivos + ' activos encontrados, ' + contConTelefono + ' con teléfono válido.');

  var totalAgrupados = Object.keys(grupos).length;
  Logger.log('[ContactsSync] Total números de teléfono únicos a procesar: ' + totalAgrupados);

  if (totalAgrupados === 0) {
    Logger.log('[ContactsSync] No hay contactos para sincronizar. Terminando temprano.');
    return;
  }

  // 3.5. Códigos de clan para el sufijo "(C-1,2,3...)" del nombre. [→ Contexto_Base_Web.md §16B005]
  function normalizarClanTag(tag) {
    return String(tag || '')
      .replace(/#/g, '')
      .trim()
      .toUpperCase();
  }

  var FIJOS_CLAN_CODIGO = {};
  FIJOS_CLAN_CODIGO[normalizarClanTag('#GCRG8L00')] = 1;
  FIJOS_CLAN_CODIGO[normalizarClanTag('#GYCU9YRG')] = 2;
  FIJOS_CLAN_CODIGO[normalizarClanTag('#GQQPPJGR')] = 3;
  FIJOS_CLAN_CODIGO[normalizarClanTag('#GG99LCJY')] = 4;

  function obtenerMapaCodigosClan(clanesNormalizadosEncontrados) {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty('CLAN_CODIGOS_MAP');
    var mapa = raw ? JSON.parse(raw) : {};

    // Sembrar los 4 códigos fijos si todavía no estaban guardados.
    for (var key in FIJOS_CLAN_CODIGO) {
      if (!(key in mapa)) mapa[key] = FIJOS_CLAN_CODIGO[key];
    }

    var usados = {};
    for (var k in mapa) usados[mapa[k]] = true;
    var siguienteLibre = 1;
    function proximoCodigoLibre() {
      while (usados[siguienteLibre]) siguienteLibre++;
      return siguienteLibre;
    }

    var huboNuevo = false;
    clanesNormalizadosEncontrados.forEach(function(clanNorm) {
      if (clanNorm && !(clanNorm in mapa)) {
        var nuevoCodigo = proximoCodigoLibre();
        mapa[clanNorm] = nuevoCodigo;
        usados[nuevoCodigo] = true;
        huboNuevo = true;
        Logger.log('[ContactsSync] Clan nuevo detectado (tag: ' + clanNorm + '), se le asignó el código C-' + nuevoCodigo + ' de forma permanente.');
      }
    });

    if (huboNuevo || !raw) {
      props.setProperty('CLAN_CODIGOS_MAP', JSON.stringify(mapa));
    }
    return mapa;
  }

  // Recolectar, normalizados, todos los tags de clan distintos vistos en
  // esta ejecución (excluyendo vacíos: teléfonos sin clan no llevan código).
  var clanesVistosNormalizados = {};
  for (var phoneKey in grupos) {
    grupos[phoneKey].clanTagsTodos.forEach(function(tagClan) {
      if (tagClan) clanesVistosNormalizados[normalizarClanTag(tagClan)] = true;
    });
  }
  var mapaCodigosClan = obtenerMapaCodigosClan(Object.keys(clanesVistosNormalizados));

  // 4. Cache de Etiquetas (ContactGroups)
  var groupMap = {};
  try {
    var groupsResponse = People.ContactGroups.list();
    var contactGroups = groupsResponse.contactGroups || [];
    for (var i = 0; i < contactGroups.length; i++) {
      groupMap[contactGroups[i].name] = contactGroups[i].resourceName;
    }
  } catch(e) {
    Logger.log('[ContactsSync] Error al listar grupos: ' + e.message);
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

  // 5. Leer contactos existentes en Google Contacts
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
    Logger.log('[ContactsSync] Error leyendo conexiones: ' + e.message);
  }

  Logger.log('[ContactsSync] Contactos existentes identificados en la nube: ' + Object.keys(existingContacts).length);

  // 6. Crear o Actualizar Contactos
  var creados = 0;
  var actualizados = 0;

  // Acumuladores para el resumen amigable del final. NOTA: "resumen.creados" [→ Contexto_Base_Web.md §16B006]
  var resumen = { creados: [], actualizados: [], fallidos: [] };

  for (var phone in grupos) {
    if (Date.now() - startTime > MAX_TIME) {
      Logger.log('[ContactsSync] Tiempo máximo alcanzado. Saliendo limpiamente.');
      return;
    }

    var g = grupos[phone];

    // DEFINICIÓN DEL NOMBRE: Usa estrictamente los datos de la columna Jugador. [→ Contexto_Base_Web.md §16B007]
    var contactName = g.esFundador
      ? CFG.FUNDADOR.jugador
      : (g.listaJugadores.length > 0 ? g.listaJugadores.join(' / ') : g.nombres.join(' / '));

    // Sufijo "(C-1,2,3...)": un número por cada clan distinto (por tag) en el [→ Contexto_Base_Web.md §16B008]
    var codigosDelTelefono = [];
    g.clanTagsTodos.forEach(function(tagClan) {
      if (!tagClan) return;
      var num = mapaCodigosClan[normalizarClanTag(tagClan)];
      if (num && codigosDelTelefono.indexOf(num) < 0) codigosDelTelefono.push(num);
    });
    codigosDelTelefono.sort(function(a, b) { return a - b; });
    if (codigosDelTelefono.length > 0) {
      contactName = contactName + ' (C-' + codigosDelTelefono.join(',') + ')';
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
        // NOTA: ya NO se borra "existingContacts[phone]" aquí. Antes se hacía [→ Contexto_Base_Web.md §16B009]
      } else {
        People.People.createContact(personObj);
        creados++;
        resumen.creados.push({ nombre: contactName, clan: g.clan });
      }
    } catch(e) {
      // Detecta cualquier variante de error de cuota, no solo '429': la API [→ Contexto_Base_Web.md §16B010]
      var msg = String(e.message || '');
      var esErrorDeCuota = /429|quota exceeded|resource_exhausted/i.test(msg);

      if (esErrorDeCuota) {
        var reintentoOk = false;
        // Backoff exponencial: 2s, 4s, 8s. Suficiente para que la cuota "por
        // minuto" se libere sin consumir todo el presupuesto de MAX_TIME.
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
              // Explicación en lenguaje simple, pensada para alguien sin [→ Contexto_Base_Web.md §16B011]
              Logger.log('[ContactsSync] No se pudo sincronizar el contacto "' + contactName +
                '" tras 3 intentos. Motivo: Google limita cuántos contactos se pueden crear o ' +
                'actualizar por minuto (una "cuota" de escritura), y ese límite se alcanzó durante ' +
                'esta ejecución. Esto NO significa que el jugador se haya perdido ni que su contacto ' +
                'se vaya a borrar: simplemente esta actualización puntual no se aplicó ahora, y debería ' +
                'corregirse sola en la próxima sincronización.');
              resumen.fallidos.push({ nombre: contactName, clan: g.clan, motivo: 'cuota' });
            }
          }
        }
      } else {
        Logger.log('[ContactsSync] No se pudo sincronizar el contacto "' + contactName +
          '". Motivo: ' + msg + '. Esto no fue un problema de cuota: puede deberse a datos con un ' +
          'formato que Google Contacts no acepta (por ejemplo, un número de teléfono raro) o a un ' +
          'problema temporal del servicio de Google. El jugador tampoco se borra por esto.');
        resumen.fallidos.push({ nombre: contactName, clan: g.clan, motivo: 'otro' });
      }
    }

    // Pausa proactiva entre escrituras (create/update cuentan como "critical [→ Contexto_Base_Web.md §16B012]
    Utilities.sleep(350);
  }

  Logger.log('[ContactsSync] Procesados -> Creados: ' + creados + ', Actualizados: ' + actualizados);

  // 7. Eliminar contactos de jugadores obsoletos [→ Contexto_Base_Web.md §16B013]
  var orphanPhones = [];
  for (var ePhone in existingContacts) {
    if (!grupos[ePhone]) orphanPhones.push(ePhone);
  }

  var eliminados = 0;
  var resumenEliminados = []; // {nombre, clan}, para el resumen final por clan

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
      resumenEliminados.push({ nombre: nombreOrfano, clan: clanOrfano });
    } catch(e) {}
  }

  if (eliminados > 0) {
    Logger.log('[ContactsSync] Eliminados (inactivos antiguos): ' + eliminados);
  }

  // 8. Resumen amigable, agrupado por clan: qué se agregó y qué se eliminó. [→ Contexto_Base_Web.md §16B014]
  function agruparPorClan(lista) {
    var mapa = {};
    var orden = [];
    for (var idx = 0; idx < lista.length; idx++) {
      var item = lista[idx];
      var clanKey = (item.clan && item.clan.trim() && item.clan.trim() !== 'Sin Clan')
        ? item.clan.trim()
        : '__SIN_CLAN__';
      if (!mapa[clanKey]) {
        mapa[clanKey] = [];
        orden.push(clanKey);
      }
      mapa[clanKey].push(item.nombre);
    }
    return { mapa: mapa, orden: orden };
  }

  var aGrp = agruparPorClan(resumen.creados);
  var eGrp = agruparPorClan(resumenEliminados);

  // Unión de clanes reales (sin duplicar), en orden alfabético para que el
  // resumen sea fácil de leer y predecible ejecución tras ejecución.
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

  // 9. Explicación final, en lenguaje simple, si hubo fallos de sincronización
  if (resumen.fallidos.length > 0) {
    Logger.log('--- Por qué algunos contactos no se pudieron sincronizar ---');
    Logger.log('Hubo ' + resumen.fallidos.length + ' contacto(s) que no se pudieron guardar en Google Contacts ' +
      'en esta ejecución: ' + resumen.fallidos.map(function(f){ return f.nombre; }).join(', ') + '.');
    Logger.log('La causa más común es la cuota de Google: la cuenta solo puede crear o modificar una ' +
      'cierta cantidad de contactos por minuto, y con muchos jugadores sincronizándose de una vez es ' +
      'normal alcanzar ese límite en algún punto del proceso.');
    Logger.log('Estos jugadores NO se eliminan ni se pierden por este motivo: solo quedaron pendientes de ' +
      'actualizar y se corrigen solos en la próxima sincronización automática.');
  }

  Logger.log('[ContactsSync] Sincronización completada en ' + (Date.now() - startTime) + ' ms.');
}
