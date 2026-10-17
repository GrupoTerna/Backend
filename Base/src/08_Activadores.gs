// ==============================================================================
// 08_Activadores.gs
// TODOS los activadores (triggers) del proyecto en un solo archivo, con una sola funcion para activarlos
// (activarTodosLosActivadores) y una sola para desactivarlos (desactivarTodosLosActivadores).
// Cada activador lleva su propio horario en ACTIVADORES_CONFIG.
// ==============================================================================

// EXCEPCIONES (torneo en vivo, continuaciones de tandas) y AVISOS ABIERTOS 1-8 (frecuencias, cuota diaria, colisiones, UptimeRobot) [→ Contexto_Base_Web.md §08B001]

// Tipos admitidos: [→ Contexto_Base_Web.md §08B002]
var ACTIVADORES_CONFIG = [
  // ---- Captura de guerra (la unica que consulta la API a diario) ---- [→ Contexto_Base_Web.md §08B003]
  { handler: 'runGuerra',                    tipo: 'minutos', cada: 5,  activo: true },

  // ---- Versiones PROGRAMADAS (leen el checkpoint que deja runGuerra; no llaman a la API) ----
  { handler: 'runPendientesYMensajesProgramado', tipo: 'minutos', cada: 5,  activo: true },  // ver AVISOS 1, 6 y 7
  { handler: 'runGuerraRapidoProgramado',    tipo: 'horas',   cada: 2,  activo: true },  // ver AVISOS 2 y 6

  // ---- Mantenimiento diario (horas conservadas de installTriggers()) ----
  { handler: 'runUpdateProgramado',          tipo: 'diario',  hora: 12, activo: true },  // 17-oct-2026 (PF091): antes 'runUpdate'; lee el checkpoint, sin /clans ni /currentriverrace
  { handler: 'runResaltarDia',               tipo: 'diario',  hora: 5,  activo: true },
  { handler: 'runFormato',                   tipo: 'diario',  hora: 11, activo: true },
  { handler: 'runSyncCSV',                   tipo: 'diario',  hora: 7,  activo: true },
  { handler: 'runSincronizarContactos',      tipo: 'diario',  hora: 13, activo: true },

  // ---- Utilitarios ----
  { handler: 'onEditTrigger',                tipo: 'edicion',             activo: true },
  { handler: 'pingProxyRender',              tipo: 'minutos', cada: 10, activo: false },  // redundante con UptimeRobot (AVISO 8b); el respaldo lo hace 45_Vigilante_UptimeRobot.gs solo si UptimeRobot falla

  // ---- Antes de instalacion manual (ver AVISO 3) ----
  { handler: 'descargarCards',               tipo: 'semanal', dia: 1, hora: 5, activo: true },
  { handler: 'resolverAlertasHistorialGuerra', tipo: 'diario', hora: 6, activo: true },
  { handler: '_autogenerarParCRListaSiCorrespondeInicioTemporada', tipo: 'diario', hora: 6, activo: true }
];

// Nombres que NO deben tener activador y que, si alguno sigue instalado, se retira al activar/desactivar. Desde el 17-oct-2026
// son las versiones MANUALES (sin sufijo); los activadores usan las versiones ...Programado (antes eran disparadores de versiones
// anteriores del proyecto). [-> Contexto_Base_Web.md §PF091]
var ACTIVADORES_HANDLERS_LEGADOS_ = ['runGuerraRapido', 'runPendientesYMensajes', 'runUpdate'];

/**
 * activarTodosLosActivadores() [→ Contexto_Base_Web.md §08B004]
 */
function activarTodosLosActivadores() {
  var retirados = _retirarActivadoresAdministrados_();
  var creados = [], omitidos = [];
  for (var i = 0; i < ACTIVADORES_CONFIG.length; i++) {
    var c = ACTIVADORES_CONFIG[i];
    if (c.activo === false) { omitidos.push(c.handler); continue; }
    _crearActivador_(c);
    creados.push(c.handler + ' (' + _describirActivador_(c) + ')');
  }
  Logger.log('[Activadores] Retirados antes de instalar: ' + retirados + '. Instalados: ' + creados.length +
    ' -> ' + creados.join(' | ') +
    (omitidos.length ? '. Omitidos (activo:false): ' + omitidos.join(', ') : '') +
    '. El torneo en vivo y las continuaciones automaticas no se tocaron.');
}

/**
 * desactivarTodosLosActivadores() [→ Contexto_Base_Web.md §08B005]
 */
function desactivarTodosLosActivadores() {
  var retirados = _retirarActivadoresAdministrados_();
  var quedan = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
  Logger.log('[Activadores] Retirados: ' + retirados + '. Siguen instalados (no administrados aqui): ' +
    (quedan.length ? quedan.join(', ') : 'ninguno') + '.');
}

// Helpers internos [→ Contexto_Base_Web.md §08B006]

/** Borra los activadores cuyo handler esta en ACTIVADORES_CONFIG o en los legados. Devuelve cuantos borro. */
function _retirarActivadoresAdministrados_() {
  var handlers = ACTIVADORES_HANDLERS_LEGADOS_.slice();
  for (var i = 0; i < ACTIVADORES_CONFIG.length; i++) handlers.push(ACTIVADORES_CONFIG[i].handler);
  var triggers = ScriptApp.getProjectTriggers();
  var borrados = 0;
  for (var j = 0; j < triggers.length; j++) {
    if (handlers.indexOf(triggers[j].getHandlerFunction()) >= 0) {
      ScriptApp.deleteTrigger(triggers[j]);
      borrados++;
    }
  }
  return borrados;
}

var _ACTIVADORES_DIAS_ = null;

/** Crea un activador segun su entrada de ACTIVADORES_CONFIG. */
function _crearActivador_(c) {
  var b = ScriptApp.newTrigger(c.handler);
  switch (c.tipo) {
    case 'minutos': b.timeBased().everyMinutes(c.cada).create(); break;
    case 'horas':   b.timeBased().everyHours(c.cada).create(); break;
    case 'diario':  b.timeBased().everyDays(1).atHour(c.hora).create(); break;
    case 'semanal':
      if (!_ACTIVADORES_DIAS_) {
        _ACTIVADORES_DIAS_ = [null, ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY,
          ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY, ScriptApp.WeekDay.SATURDAY, ScriptApp.WeekDay.SUNDAY];
      }
      b.timeBased().onWeekDay(_ACTIVADORES_DIAS_[c.dia] || ScriptApp.WeekDay.MONDAY).atHour(c.hora).create();
      break;
    case 'edicion': b.forSpreadsheet(_getSs()).onEdit().create(); break;
    default: throw new Error('[Activadores] Tipo de activador desconocido para ' + c.handler + ': ' + c.tipo);
  }
}

/** Texto corto del horario de un activador, para el log. */
function _describirActivador_(c) {
  switch (c.tipo) {
    case 'minutos': return 'cada ' + c.cada + ' min';
    case 'horas':   return 'cada ' + c.cada + ' h';
    case 'diario':  return 'diario, hora ' + c.hora;
    case 'semanal': return 'semanal, dia ' + c.dia + ', hora ' + c.hora;
    case 'edicion': return 'al editar la hoja';
    default:        return c.tipo;
  }
}