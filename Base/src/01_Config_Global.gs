// =============================================================================
// 01_Config_Global.gs
// Configuracion global (CFG), IDs de carpetas de Drive, y helpers genericos
// (fechas, texto, formato de celdas) usados por el resto del proyecto.
// ==============================================================================

// ----- Variables y constantes ---F--


// Configuración central del sistema de gestión de clanes - Familia Terna [→ Contexto_Base_Web.md §01B001]

// OBJETO CFG - Configuración central [→ Contexto_Base_Web.md §01B002]
var CFG = {
  // Tags de todos los clanes gestionados (incluyendo el clan vetado)
  CLAN_TAGS:  ['#GCRG8L00','#GYCU9YRG','#GQQPPJGR','#GG99LCJY','#RYYCRGVG'],

  // Tags de clanes "Terna" (excluye el clan vetado)
  TERNA_TAGS: ['#GCRG8L00','#GYCU9YRG','#GQQPPJGR','#GG99LCJY'],

  // Tag del clan vetado (solo seguimiento, no participa en guerra ni mensajes)
  VETADO_TAG: '#RYYCRGVG',

  // FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje): [→ Contexto_Base_Web.md §01B003]
  CLANES_CONFLICTO_MANUAL: [
    // { tag: '#XXXXXXXX', nombre: 'Nombre del clan', motivo: 'Ej: exmiembros vetados fundaron este clan' },
  ],

  // URL base del proxy de la API de Clash Royale
  API_BASE: 'https://clash-royale-proxy-2eyr.onrender.com',

  // Fecha de referencia: primer lunes de la Temporada 1 (04/05/2026). [→ Contexto_Base_Web.md §01B004]
  get REF_DEFAULT() {
    var props = PropertiesService.getScriptProperties();
    var guardado = props.getProperty('CFG_REF_ACTIVO'); // 'YYYY-MM-DD'
    if (guardado) {
      var p = guardado.split('-');
      return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }
    return new Date(2026, 4, 4); // valor original, solo como bootstrap
  },

  // Orden de rangos para clasificación (menor número = mayor jerarquía)
  RANGO_ORDEN: {'lider':1,'colider':2,'veterano':3,'miembro':4},

  // Prefijo telefónico internacional por defecto (Perú)
  PREFIJO_DEFAULT: '51',

  // Prefijo de nombre para iniciales del clan Terna
  PREFIJO_TERNA: 'G乂T',

  // Valores válidos para la columna "Razón" (motivo de veto). 'Sí'/'No' [→ Contexto_Base_Web.md §01B005]
  RAZON_VALORES_VALIDOS: ['NARANJA x','Vetado por clan','Incumplimiento de ataques','Conducta inapropiada','Inactividad prolongada','Solicitud propia'],

  // Datos del fundador (para lógica especial de multicuenta)
  FUNDADOR: {celular:'XXXXXXXXX', prefijo:'51', jugador:'Leder (Caandre)'},

  // ADMIN_FAMILIA - Respaldo de qué clan(es) administra cada admin. [→ Contexto_Base_Web.md §01B006]
  ADMIN_FAMILIA: [
    {nombre:'Diana',      celular:'XXXXXXXXX', prefijo:'51', clanes:'TODOS'},
    {nombre:'Sebas',      celular:'XXXXXXXXX', prefijo:'51', clanes:'TODOS'},
    {nombre:'Maikel',     celular:'XXXXXXXXX', prefijo:'51', clanes:'TODOS'},
    {nombre:'Micho',      celular:'XXXXXXXXX', prefijo:'51', clanes:'TODOS'},
    {nombre:'MasterNopi', celular:'XXXXXXXXX', prefijo:'51', clanes:'TODOS'},
    {nombre:'Leder',      celular:'XXXXXXXXX', prefijo:'51', clanes:'TODOS'},
    // Solo administran Grupo乂Terna™ (ClanTag #GCRG8L00 = CFG.TERNA_TAGS[0], [→ Contexto_Base_Web.md §01B007]
    {nombre:'Goncha',     celular:'XXXXXXXXX', prefijo:'51', clanes:['#GCRG8L00']},
    {nombre:'Massimo',    celular:'XXXXXXXXX', prefijo:'51', clanes:['#GCRG8L00']},
  ],

  // Nombre de respaldo por ClanTag, usado SOLO si todavía no hay cache de [→ Contexto_Base_Web.md §01B008]
  CLAN_NOMBRES_FALLBACK: {
    '#GCRG8L00': 'Grupo乂Terna™',
  },

  // Letras de días indexadas por (periodIndex % 7): L=0, M=1, X=2, J=3, V=4, S=5, D=6
  DIA_LETRAS: ['L','M','X','J','V','S','D'],

  // Nombre completo de cada día, indexado por su letra (ver DIA_LETRAS). [→ Contexto_Base_Web.md §01B009]
  DIA_NOMBRES: {
    L:'LUNES', M:'MARTES', X:'MIÉRCOLES', J:'JUEVES',
    V:'VIERNES', S:'SÁBADO', D:'DOMINGO',
  },

  // Nombres de todas las hojas del spreadsheet
  SHEETS: {
    EXTRA:'Extra',
    CLAN:'Clan',
    DIRECTORIO:'Directorio',
    GUERRA:'Guerra',
    GUERRA_LOGS:'Guerra_Logs',
    CONTROL:'Control',
    // FIX (06-ago-2026): Historial -> "Historial_I/S" (Ingresos/Salidas). [→ Contexto_Base_Web.md §01B010]
    HISTORIAL:'Historial_I/S',
    PENDIENTES:'Pendientes',
    CALENDARIO:'Calendario',
    CALENDARIO2:'Calendario_2',
    COMENTARIOS:'Comentarios',
    // FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú): [→ Contexto_Base_Web.md §01B011]
    ADMINISTRADORES:'Administradores',
    INACTIVOS:'Inactivos',
    VETADOS:'Vetados',
    MULTICUENTAS:'Multicuentas',
    // FIX (06-ago-2026): Ascensos -> "Historial_A/D" (Ascensos/Degradaciones). [→ Contexto_Base_Web.md §01B012]
    ASCENSOS:'Historial_A/D',
    MENSAJES:'Mensajes',
    INDICE:'Índice',
    CARDS:'Cards',
    CARDS_2:'Cards_2',
    T_LISTA:'T_Lista',
    // FASE (07-sep-2026, pedido del usuario): S_Lista es la hoja análoga a [→ Contexto_Base_Web.md §01B013]
    S_LISTA:'S_Lista',
    T_ASISTENCIA:'T_Asistencia',
    // NUEVO (09-sep-2026, pedido usuario): hoja análoga a T_Asistencia pero [→ Contexto_Base_Web.md §01B014]
    S_ASISTENCIA:'S_Asistencia',
    T_CONTROL:'T_Control',
    // FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y [→ Contexto_Base_Web.md §01B015]
    T_RESOLUCIONES:'T_Resoluciones',
    NUEVOS:'Nuevos',
    LINKS:'Links',
    PLAYERS:'Players',
    // Histórico de Guerra por jugador (20_HistorialGuerraJugador.gs) — hoja [→ Contexto_Base_Web.md §01B016]
    ALERTAS_HISTORIAL_GUERRA:'Alertas_HistorialGuerra',
    // FIX (07-sep-2026, reportado por el usuario -- "aparece una hoja nueva [→ Contexto_Base_Web.md §01B017]
    CONFLICTOS:'Conflictos',
    // NUEVO (13-sep-2026, pedido del usuario): CR_Lista es la hoja de [→ Contexto_Base_Web.md §01B018]
    CR_LISTA:'CR_Lista',
    // NUEVO (14-sep-2026, pedido del usuario -- cierre del CONTRATO [→ Contexto_Base_Web.md §01B019]
    GRUPO_VERIFICADO:'Grupo_Verificado',
  },

  // FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y [→ Contexto_Base_Web.md §01B020]
  TORNEOS_RESOLUCION_TIPOS: {
    DESCALIFICADO: 'Descalificado',
    REPARTO:       'Empate - Reparto de premio',
    REVANCHA:      'Empate - Partida de desempate',
    // NUEVO (15-sep-2026, pedido del usuario -- cuentas prestadas en [→ Contexto_Base_Web.md §01B021]
    PRESTAMO:      'Cuenta prestada'
  },

  // NUEVO (09-sep-2026, pedido usuario): los 2 valores válidos para la [→ Contexto_Base_Web.md §01B022]
  SORTEOS_RESULTADO_TIPOS: {
    CALIFICA:    'Califica',
    NO_CALIFICA: 'No califica'
  },

  // RESUELTO (10-sep-2026, definición exacta del usuario -- ver [→ Contexto_Base_Web.md §01B023]
  SORTEOS_RAZON_TIPOS: {
    NO_WHATSAPP:      'No está en el grupo de WhatsApp',
    NO_REACCION:      'No reaccionó a la publicación',
    NO_MIEMBRO_ACTIVO:'No se encuentra en el clan'
  },

  // Tabla de ligas ordenada de mayor a menor (para getLiga)
  LIGAS: [
    {min:5000,nombre:'Legendaria III'},{min:4000,nombre:'Legendaria II'},
    {min:3000,nombre:'Legendaria I'},  {min:2500,nombre:'Oro III'},
    {min:2000,nombre:'Oro II'},        {min:1500,nombre:'Oro I'},
    {min:1200,nombre:'Plata III'},     {min:900, nombre:'Plata II'},
    {min:600, nombre:'Plata I'},       {min:400, nombre:'Bronce III'},
    {min:200, nombre:'Bronce II'},     {min:0,   nombre:'Bronce I'},
  ],

  // Filas para la tabla de ligas en la hoja Extra (orden ASC para visualización)
  EXTRA_LIGAS_ROWS: [
    [0,'Bronce I'],[200,'Bronce II'],[400,'Bronce III'],
    [600,'Plata I'],[900,'Plata II'],[1200,'Plata III'],
    [1500,'Oro I'],[2000,'Oro II'],[2500,'Oro III'],
    [3000,'Legendaria I'],[4000,'Legendaria II'],[5000,'Legendaria III'],
  ],

  // Valores para el dropdown de Rangos en la hoja Extra
  EXTRA_RANGOS:  ['Líder','Colider','Veterano','Miembro'],

  // Valores para el dropdown de Alertas en la hoja Extra
  EXTRA_ALERTAS: ['Vetado','Reactivado','Pendiente','Candidato a expulsión'],

  // Categorías de referencia (orden canónico) para la hoja Extra — col Categoría (L). [→ Contexto_Base_Web.md §01B024]
  EXTRA_CATEGORIAS: [
  'Gestionar información de miembros','Torneos','Sorteos',
  'Participantes calificados (torneo)','Participantes calificados (sorteo)',
  'Ganadores (torneo)','Ganadores (sorteo)','Ascensos y descensos',
  'Información sobre mí','Información sobre el clan',
  'Bienvenida','Defensas de barcos','Día de guerra','Mensaje de Guerra',
  'Etiqueta de miembro','Celular','Descripción','Mazos','iPhone',
],

  // Orden de categorías EXCLUSIVO para la generación de mensajes diarios [→ Contexto_Base_Web.md §01B025]
  MENSAJES_ORDEN_CATEGORIAS: [
  'Defensas de barcos','Día de guerra','Mensaje de Guerra',
  'Etiqueta de miembro','Celular','Mazos','iPhone',
],

  // Subcategorías de referencia (orden canónico) para la hoja Extra — col Subcategoría (M)
  EXTRA_SUBCATEGORIAS: [
    'Terna','Vetado','Particular','Chat General',
    'Comunidad','Detectives','RoyaleAPI',
  ],

  // Opciones de Vigente para el dropdown de la hoja Índice (col N de Extra)
  EXTRA_VIGENTE: ['Sí','No'],

  // Opciones de Visibilidad para el dropdown de la hoja Índice (col O de Extra)
  EXTRA_VISIBILIDAD: ['Sí','No'],

  // Opciones de Tipo para el dropdown de la hoja Índice (col P de Extra). [→ Contexto_Base_Web.md §01B026]
  EXTRA_TIPO: ['Raíz','Secundario','Respaldo'],

  // Opciones de Edición para la columna Edición de la hoja Índice (col Q de Extra).
  EXTRA_EDICION: ['Editable','Solo Lectura'],

  // Orden canónico de las columnas de control, compartido por la hoja Extra [→ Contexto_Base_Web.md §01B027]
  INDICE_COLUMNAS: ['Vigente','Visibilidad','Tipo','Edición'],

  // Configuración inicial recomendada por hoja para la tabla Índice (se usa [→ Contexto_Base_Web.md §01B028]
  INDICE_DEFAULTS: {
    'Calendario':      { visibilidad: 'Sí', tipo: 'Raíz',       edicion: 'Editable'    },
    'Directorio':      { visibilidad: 'Sí', tipo: 'Raíz',       edicion: 'Editable'    },
    'Nuevos':          { visibilidad: 'Sí', tipo: 'Raíz',       edicion: 'Editable'    },
    'Control':         { visibilidad: 'Sí', tipo: 'Secundario', edicion: 'Solo Lectura'},
    'Mensajes':        { visibilidad: 'Sí', tipo: 'Secundario', edicion: 'Editable'    },
    'Historial_A/D':   { visibilidad: 'Sí', tipo: 'Secundario', edicion: 'Editable'    },
    'Pendientes':      { visibilidad: 'Sí', tipo: 'Secundario', edicion: 'Editable'    },
    'Administradores': { visibilidad: 'No', tipo: 'Raíz',       edicion: 'Editable'    },
    'Clan':            { visibilidad: 'No', tipo: 'Raíz',       edicion: 'Solo Lectura'},
    'Extra':           { visibilidad: 'No', tipo: 'Raíz',       edicion: 'Solo Lectura'},
    'Guerra':          { visibilidad: 'No', tipo: 'Raíz',       edicion: 'Solo Lectura'},
    'Guerra_Logs':     { visibilidad: 'No', tipo: 'Raíz',       edicion: 'Solo Lectura'},
    'Historial_I/S':   { visibilidad: 'No', tipo: 'Raíz',       edicion: 'Solo Lectura'},
    'Índice':          { visibilidad: 'No', tipo: 'Raíz',       edicion: 'Editable'    },
    'Inactivos':       { visibilidad: 'No', tipo: 'Secundario', edicion: 'Solo Lectura'},
    'Multicuentas':    { visibilidad: 'No', tipo: 'Secundario', edicion: 'Solo Lectura'},
    'Vetados':         { visibilidad: 'No', tipo: 'Secundario', edicion: 'Editable'    },
    'Calendario_2':    { visibilidad: 'No', tipo: 'Respaldo',   edicion: 'Solo Lectura'},
    'Comentarios':     { visibilidad: 'No', tipo: 'Respaldo',   edicion: 'Solo Lectura'},
  },

  // --- Control de ejecución (locks auto-expirables, ver 00_Main.gs) --- [→ Contexto_Base_Web.md §01B029]
  LOCK_MAX_DURACION_MS: 6 * 60 * 1000 + 30 * 1000, // 6m30s

  // Presupuesto de tiempo objetivo para cada "tanda" de runAll/runUpdate antes [→ Contexto_Base_Web.md §01B030]
  RUNALL_PRESUPUESTO_MS: 3 * 60 * 1000 + 30 * 1000,    // 3m30s
  RUNUPDATE_PRESUPUESTO_MS: 3 * 60 * 1000 + 30 * 1000, // 3m30s
  // FIX (06-ago-2026): runSyncCSV() ahora usa el mismo motor de tandas [→ Contexto_Base_Web.md §01B031]
  RUNSYNCCSV_PRESUPUESTO_MS: 3 * 60 * 1000 + 30 * 1000, // 3m30s
  // FIX (22-ago-2026): runGuerraRapido() se cancelaba por exceder el límite [→ Contexto_Base_Web.md §01B032]
  RUNGUERRARAPIDO_PRESUPUESTO_MS: 3 * 60 * 1000 + 30 * 1000, // 3m30s
  // NUEVO (09-sep-2026, pedido usuario -- "_continuarProcesarSorteos() / [→ Contexto_Base_Web.md §01B033]
  RUNSORTEOS_PRESUPUESTO_MS: 3 * 60 * 1000 + 30 * 1000, // 3m30s
  // Presupuesto interno SOLO para el bucle de /players dentro de [→ Contexto_Base_Web.md §01B034]
  PLAYERS_FETCH_BUDGET_MS: 3 * 60 * 1000 + 30 * 1000,  // 3m30s

  // Límite MÁXIMO de consultas a /players que se hacen en UNA sola tanda de [→ Contexto_Base_Web.md §01B035]
  PLAYERS_FETCH_MAX_POR_TANDA: 60,

  // NUEVO (27-sep-2026, pedido usuario -- "partelo en tandas... replica el [→ Contexto_Base_Web.md §01B036]
  BATTLELOGCHESTS_FETCH_BUDGET_MS: 3 * 60 * 1000 + 30 * 1000, // 3m30s

  // Tope adicional de cuántos jugadores como máximo se procesan (battlelog + [→ Contexto_Base_Web.md §01B037]
  BATTLELOGCHESTS_FETCH_MAX_POR_TANDA: 30,

  // FIX (07-sep-2026, pedido usuario -- "no se debe recurrir directamente a [→ Contexto_Base_Web.md §01B038]
  TORNEOS_REFETCH_BUDGET_MS: 60 * 1000, // 1m

  // Tope adicional de cuántas consultas a RoyaleAPI se hacen como máximo [→ Contexto_Base_Web.md §01B039]
  TORNEOS_REFETCH_MAX_POR_TANDA: 12,

  // FASE 21 (01/08/2026): edad máxima que se acepta para el archivo de [→ Contexto_Base_Web.md §01B040]
  PLAYERS_PROGRESO_MAX_EDAD_MS: 45 * 60 * 1000, // 45 min
  // FIX (06-ago-2026): mismo criterio que PLAYERS_PROGRESO_MAX_EDAD_MS, pero [→ Contexto_Base_Web.md §01B041]
  CLANES_PROGRESO_MAX_EDAD_MS: 45 * 60 * 1000, // 45 min
  // NUEVO (27-sep-2026): mismo criterio que PLAYERS_PROGRESO_MAX_EDAD_MS/ [→ Contexto_Base_Web.md §01B042]
  BATTLELOGCHESTS_PROGRESO_MAX_EDAD_MS: 45 * 60 * 1000, // 45 min

  // FIX (08-ago-2026): umbral corto exclusivo para runGuerra() (00_Main.gs). [→ Contexto_Base_Web.md §01B043]
  CLANES_PROGRESO_MAX_EDAD_MS_GUERRA: 4 * 60 * 1000, // 4 min

  // VENTANA DE GUERRA PROTEGIDA (05-oct-2026, pedido del usuario). Entre las 4:00 y las 4:59 a.m. de Lima [→ Contexto_Base_Web.md §01B044]
  VENTANA_GUERRA_INI_UTC_MIN: 9 * 60,
  VENTANA_GUERRA_FIN_UTC_MIN: 10 * 60,
  VENTANA_GUERRA_PRE_MARGEN_MIN: 20,
  VENTANA_GUERRA_BLOQUEAR_OTROS: true,
  // Dentro de la ventana el disparo es cada 5 min: el checkpoint de clanes solo se reutiliza si tiene menos
  // de 90 s, asi cada corrida pide /currentriverrace fresco a la API.
  CLANES_PROGRESO_MAX_EDAD_MS_GUERRA_VENTANA: 90 * 1000,
  // Si runGuerra() de la ventana tambien fusiona la hoja Guerra con Backup_Guerra.csv en cada corrida.
  RUNGUERRA_VENTANA_SYNC_CSV: true,

  // FIX (02-sep-2026, "corridas de runAll()/runUpdate() muriendo dentro del [→ Contexto_Base_Web.md §01B045]
  GUERRA_RESTORE_BUDGET_MS: 90 * 1000, // 1m30s

  // Filas por lote en _restaurarGuerraDesdeCSVSiVacia() (ver [→ Contexto_Base_Web.md §01B046]
  GUERRA_RESTORE_LOTE_FILAS: 500,

  // Presupuesto interno SOLO para el bucle de respaldarHojasDerivadasCSV() [→ Contexto_Base_Web.md §01B047]
  RESPALDO_DERIVADAS_BUDGET_MS: 60 * 1000, // 1m

  // FIX (16-ago-2026): presupuesto interno SOLO para el bucle de [→ Contexto_Base_Web.md §01B048]
  AUTOAJUSTE_ANCHO_BUDGET_MS: 60 * 1000, // 1m

  // FIX (17-ago-2026): presupuesto interno SOLO para el bucle de [→ Contexto_Base_Web.md §01B049]
  LIMPIAR_LINKS_BUDGET_MS: 60 * 1000, // 1m

  // FIX (02-sep-2026, pedido usuario — diagnóstico de timeouts en runAll()): [→ Contexto_Base_Web.md §01B050]
  ACUMULATIVOS_BUDGET_MS: 60 * 1000, // 1m

  // FIX (02-sep-2026): _limpiarLinksAccidentalesEnHoja(sh) — la versión [→ Contexto_Base_Web.md §01B051]
  GUERRA_LIMPIAR_LINKS_INTERVALO_MS: 55 * 60 * 1000, // 55m (≈1 vez/hora)

  // FIX (04-sep-2026): el throttle de arriba (1 vez/hora) reduce CUÁNTAS [→ Contexto_Base_Web.md §01B052]
  GUERRA_LIMPIAR_LINKS_MAX_ELAPSED_MS: 2 * 60 * 1000, // 2m

  // FIX (07-sep-2026): reemplaza el enfoque de _limpiarLinksAccidentalesEnHoja() [→ Contexto_Base_Web.md §01B053]
  GUERRA_LIMPIAR_LINKS_BUDGET_MS: 45 * 1000, // 45s

  // FIX (02-sep-2026): runGuerra() (00_Main.gs) es monolítica — a diferencia [→ Contexto_Base_Web.md §01B054]
  RUNGUERRA_SYNC_CSV_MARGEN_MIN_MS: 90 * 1000, // 1m30s de margen mínimo antes del límite duro

  // FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú): [→ Contexto_Base_Web.md §01B055]

  // Colores de fondo por letra de día (para formato condicional en Guerra) [→ Contexto_Base_Web.md §01B056]
  COLORES_DIA_GUERRA: {
    'L':'#c8e6c9','M':'#bbdefb','X':'#e1bee7',
    'J':'#ffe082','V':'#f8bbd0','S':'#b2ebf2','D':'#e0e0e0',
  },
  COLORES_DIA_GUERRA_LOGS: {
    'L':'#d7ecd8','M':'#cfe4f8','X':'#eaceee',
    'J':'#ffedb0','V':'#fbd3e0','S':'#c9eff3','D':'#e8e8e8',
  },

  // Colores del sistema
  COLORES: {
    HEADER_BG:'#000000', HEADER_FG:'#ffffff',
    VETADO_BG:'#ff0000', VETADO_FG:'#ffffff',
    INACTIVO_BG:'#f3f3f3',
    LIDER_BG:'#ffcce5',   COLIDER_BG:'#ccffcc',
    VETERANO_BG:'#ffffcc', MIEMBRO_BG:'#e5ccff',
    ATAQUE_4:'#b7e1cd', ATAQUE_1_3:'#fce8b2', ATAQUE_0:'#f4c7c3',
    BARCO_POS:'#f4c7c3',
    BARCO_CERO_BG:'#b7e1cd', BARCO_TOTAL_GRIS_BG:'#d9d9d9', BARCO_TOTAL_ROJO_BG:'#f4c7c3',
    // Azul "cumple" (totales de Ataques = 16 y totales de Puntaje >= Min_G del clan).
    CUMPLE_MING_BG:'#4a86e8', CUMPLE_MING_FG:'#ffffff',
    PUNTAJE_DIARIO_BG:'#d9d9d9',
    PUNTAJE_MEDIO_BG:'#ffe599',  // amarillo pastel: >=1600 y < Min_G
    PUNTAJE_BAJO_BG:'#f9cb9c',   // naranja pastel: < 1600
    CAL_SEM:['#e67c30','#0093d0','#8e24aa','#43a047','#d32f2f'],
    VETADO_CLAN_BG:'#ffe0b2', VETADO_OTRO_BG:'#b3e5fc',
    BORDE_GRIS:'#cccccc',
    TERNA_BG:'#c8e6c9', VETADO_CLAN_ROW_BG:'#ffcdd2',
    HIST_INGRESO_BG:'#dcedc8', HIST_REINGRESO_BG:'#fff9c4',
    HIST_SALIDA_BG:'#ffccbc',
    PEND_4_BG:'#f4c7c3', PEND_3_BG:'#fce8b2', PEND_1_BG:'#b7e1cd',
    // Paleta cíclica de colores pastel para agrupar visualmente las filas [→ Contexto_Base_Web.md §01B057]
    TA_ID_PALETTE:['#c8e6c9','#bbdefb','#ffe0b2','#e1bee7','#fff9c4',
                   '#ffccbc','#b2dfdb','#d1c4e9','#f0f4c3','#f8bbd0'],
  },

  // Colores pastel de fondo para la hoja Vetados, según columna "Razón". [→ Contexto_Base_Web.md §01B058]
  VETADOS_RAZON_BG: {
    'NARANJA x':                  '#ffe0b2', // naranja pastel
    'Vetado por clan':            '#b3e5fc', // azul pastel
    'Incumplimiento de ataques':  '#ffcdd2', // rosado pastel
    'Conducta inapropiada':       '#f8bbd0', // rosa fuerte pastel
    'Inactividad prolongada':     '#d7ccc8', // marrón pastel
    'Solicitud propia':           '#c8e6c9', // verde pastel
  },

  // CARDS_RARITY_BG — ELIMINADO (06-ago-2026). Era el mapa de colores para [→ Contexto_Base_Web.md §01B059]

  // Colores pastel de fondo para la hoja Ascensos, según columna "Tipo". [→ Contexto_Base_Web.md §01B060]
  ASCENSOS_TIPO_BG: {
    'Ascenso':        '#c8e6c9', // verde pastel
    'Degradación':    '#ffccbc', // rojo/naranja pastel
    'Expulsión':      '#ef9a9a', // rojo pastel más intenso (más grave que Degradación)
    'Elegible Admin': '#fff9c4', // amarillo pastel (requiere revisión humana)
    // 4-oct-2026 (Fase 14, aviso d de 26_Torneos_Core.gs): tipo nuevo 'Ascenso de clan' que [→ Contexto_Base_Web.md §01B061]
    'Ascenso de clan': '#b3e5fc', // azul pastel
  },

  // Mínimo de puntaje de guerra por defecto (usado en sorteo)
  MIN_G_DEFAULT: 2000,

  // Mínimo de puntaje de guerra por defecto para torneo — respaldo SOLO [→ Contexto_Base_Web.md §01B062]
  MIN_T_DEFAULT: 2000,

  // Colores pastel de fondo para la hoja Mensajes, según columna "Tipo". [→ Contexto_Base_Web.md §01B063]
  MENSAJES_TIPO_BG: {
    'Mensaje de Guerra':    '#ffcdd2', // rosado pastel
    'Defensas de barcos':   '#bbdefb', // azul pastel
    'Celular':              '#fff9c4', // amarillo pastel
    'Etiqueta de miembro':  '#e1bee7', // lila pastel
    'Información sobre el clan': '#c8e6c9', // verde pastel
    // Categorías "Estáticas" (Plantillas) que ahora también se replican en [→ Contexto_Base_Web.md §01B064]
    'Día de guerra':        '#ffe0b2', // naranja pastel
    'Bienvenida':           '#b2ebf2', // celeste pastel
    'Información sobre mí': '#f0f4c3', // verde lima pastel
    'Mazos':                '#d7ccc8', // taupe pastel
    'IPhone':                '#ffecb3', // ámbar pastel

    // Pedido usuario (ago-2026): Participantes/Ganadores de torneo y sorteo [→ Contexto_Base_Web.md §01B065]
    'Participantes calificados (torneo)': '#c5cae9', // índigo pastel
    'Participantes calificados (sorteo)': '#b3e5fc', // celeste pastel (distinto de Bienvenida)
    'Ganadores (torneo)':                 '#ffe082', // dorado pastel
    'Ganadores (sorteo)':                 '#dcedc8', // verde pistacho pastel

    // Pedido usuario (11/08/2026): "Ascensos y descensos" (categoría [→ Contexto_Base_Web.md §01B066]
    'Ascensos y descensos':               '#cfd8dc', // gris azulado pastel
  },

  // Fórmula del título combinado D1:P2 de la hoja Control. Usa SWITCH() [→ Contexto_Base_Web.md §01B067]
  CONTROL_TITULO_FORMULA:
    '="CONTROL DE GUERRA - TEMPORADA "&Extra!A2&" - SEMANA "&Extra!B2&' +
    '" - DÍA "&SWITCH(Extra!C2,"L","LUNES","M","MARTES","X","MIÉRCOLES",' +
    '"J","JUEVES","V","VIERNES","S","SÁBADO","D","DOMINGO")',

  // FIX (13-ago-2026, pedido usuario): fórmula del título dinámico D1:K2 de [→ Contexto_Base_Web.md §01B068]
  NUEVOS_TITULO_FORMULA:
    '="TEMPORADA "&Extra!A2&" - SEMANA "&Extra!B2&' +
    '" - DÍA "&SWITCH(Extra!C2,"L","LUNES","M","MARTES","X","MIÉRCOLES",' +
    '"J","JUEVES","V","VIERNES","S","SÁBADO","D","DOMINGO")',

  // Cuentas ocultas manualmente: se tratan como si NO existieran en ningún [→ Contexto_Base_Web.md §01B069]
  TAGS_OCULTOS: ['#JV2CCCP28'],
};

// INTERRUPTOR PLAYERS_API_ENABLED [→ Contexto_Base_Web.md §01B070]
var PLAYERS_API_ENABLED = 'partial';

// INTERRUPTOR BATTLELOGCHESTS_API_ENABLED [→ Contexto_Base_Web.md §01B071]
var BATTLELOGCHESTS_API_ENABLED = false;

// INTERRUPTOR SUPRIMIR_PLAYERS_TEMPORAL (Fase 1 del plan de cambios) [→ Contexto_Base_Web.md §01B072]
var SUPRIMIR_PLAYERS_TEMPORAL = false;

// IDs DE CARPETAS DRIVE [→ Contexto_Base_Web.md §01B073]
var DRIVE_FOLDER_ID_CSV  = '1rTp5gXQ0ydnkM3eg6wy2vfOrpUp9GOsR';

// Carpeta raíz donde se guardan los JSON de backup de API (clans, currentriverrace). [→ Contexto_Base_Web.md §01B074]
var DRIVE_FOLDER_ID_JSON = '1fe_z2gahCDeVrYEbG8B2ts-XDJzbNBu8';

// Carpeta donde se guardan los JSON de /players. Un archivo por jugador [→ Contexto_Base_Web.md §01B075]
var DRIVE_FOLDER_ID_PLAYERS = '1Kqmn7ExFr3cDER_DgKnHwHlWc9lLW9aF';

// Carpeta contenedora "RoyaleAPI" (dentro de "JSON", NO dentro de [→ Contexto_Base_Web.md §01B076]
var DRIVE_FOLDER_ID_ROYALEAPI = '1cLV0KJT5MD_ATVegpFeSuWxdNQZ7En0q';

// Histórico de Guerra por jugador (RoyaleAPI vía Tampermonkey — NO viene de la [→ Contexto_Base_Web.md §01B077]
var DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL = '1U11RBaJJLdqJST9wJF4z_ExcLE92TjO7';

// CSV consolidado (una fila por jugador+temporada+semana), equivalente [→ Contexto_Base_Web.md §01B078]
var DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL = '1T8PhxVVRZ-p7o2A_U6ARP-LsC3Zg7ObL';

// Nombre del archivo de progreso temporal de /players (ver 09_API_ClashRoyale.gs). [→ Contexto_Base_Web.md §01B079]
var PLAYERS_PROGRESS_FILE = 'Cache_Players_Progreso.json';

// FIX (06-ago-2026): checkpoint equivalente para clanes/currentriverrace, [→ Contexto_Base_Web.md §01B080]
var CLANES_PROGRESO_FILE = 'Cache_Clanes_Progreso.json';

// NUEVO (27-sep-2026): checkpoint equivalente para battlelog+upcomingchests, [→ Contexto_Base_Web.md §01B081]
var BATTLELOGCHESTS_PROGRESS_FILE = 'Cache_BattlelogChests_Progreso.json';

// Carpeta donde están los Google Docs de plantillas (sincronizados con la hoja
// Plantillas). Nombre en Drive: "Plantillas" (subcarpeta dentro de "Respaldo").
var DRIVE_FOLDER_ID_PLANTILLAS = '1BEOj3e-vv-NlQtoy6YzegpTTNAnjLzq8';

// Carpeta "Clans_Consulta_Temporal" (pedido del usuario, 26-sep-2026): NO es [→ Contexto_Base_Web.md §01B082]
var DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL = '1m_-dVpGp7WSPxQOXkZc_WGP4JTi-dY40';

// SUBCARPETAS DENTRO DE "Plantillas" (Mi unidad > Respaldo > Plantillas). [→ Contexto_Base_Web.md §01B083]
var DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS = '12ZSn_btY_lWfgDPSDq2Njih75hdc9zJE'; // FIX (02-ago-2026): tenía una "I" mayúscula en vez de "l" minúscula (posición 11) — confirmado contra el ID real de la carpeta.

// 2) "Otras" — ID: 1d6_wFdPE6SfRDN9rIc847vE6XVxZuq71 [→ Contexto_Base_Web.md §01B084]
var DRIVE_FOLDER_ID_PLANTILLAS_OTRAS = '1d6_wFdPE6SfRDN9rIc847vE6XVxZuq71'; // FIX (02-ago-2026): tenía una "l" minúscula en vez de "I" mayúscula (posición 18) — confirmado contra el ID real de la carpeta.

// 3) "Mazos" — ID: 1-NyyqZ-p9mwJ78Q28DLo0XkXxYIoRTbo [→ Contexto_Base_Web.md §01B085]
var DRIVE_FOLDER_ID_PLANTILLAS_MAZOS = '1-NyyqZ-p9mwJ78Q28DLo0XkXxYIoRTbo';

// 4) "Descripciones" — ID: 1Sm3c_O1MwSd29kX_n3PW1v0jjdyD0r8E [→ Contexto_Base_Web.md §01B086]
var DRIVE_FOLDER_ID_PLANTILLAS_DESCRIPCIONES = '1Sm3c_O1MwSd29kX_n3PW1v0jjdyD0r8E';

// 5) "Bienvenidas" — ID: 1z5Gs3lDn1lxjbKB4dSRLbN6kfdY66AhB [→ Contexto_Base_Web.md §01B087]
var DRIVE_FOLDER_ID_PLANTILLAS_BIENVENIDAS = '1z5Gs3lDn1lxjbKB4dSRLbN6kfdY66AhB'; // FIX (02-ago-2026): el ID guardado tenía 32 caracteres (le faltaba uno) en vez de los 33 normales — confirmado contra el ID real de la carpeta.

// Array de conveniencia con las 5 subcarpetas de arriba, para recorrerlas [→ Contexto_Base_Web.md §01B088]
var DRIVE_FOLDERS_PLANTILLAS_SUB = [
  DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS,
  DRIVE_FOLDER_ID_PLANTILLAS_OTRAS,
  DRIVE_FOLDER_ID_PLANTILLAS_MAZOS,
  DRIVE_FOLDER_ID_PLANTILLAS_DESCRIPCIONES,
  DRIVE_FOLDER_ID_PLANTILLAS_BIENVENIDAS
];

// Carpeta raíz. Nombre en Drive: "Respaldo" (padre de "CSV", "JSON" y [→ Contexto_Base_Web.md §01B089]
var DRIVE_FOLDER_ID_RESPALDO = '19loULqTkd70UyMHgAXOQUonscsFQvxqW';

// Nombre en Drive: "Torneos" (subcarpeta dentro de "JSON" > "Endpoints" [→ Contexto_Base_Web.md §01B090]
var DRIVE_FOLDER_ID_TORNEOS = '1wt3XswojFSeuxk8wEE9gPO-Hp5fyzFhq';

// Nombre en Drive: "Globales" (subcarpeta dentro de "Torneos", pedido del [→ Contexto_Base_Web.md §01B091]
var DRIVE_FOLDER_ID_TORNEOS_GLOBALES = '1gpyHZJd_aGwPLenhfcLFSgNpL8N_JfgS';

// Nombre en Drive: "Por búsqueda de nombre" (subcarpeta dentro de "Torneos", [→ Contexto_Base_Web.md §01B092]
var DRIVE_FOLDER_ID_TORNEOS_BUSQUEDA_NOMBRE = '1WQa8CF5baUm1dSlHNYvc3rb5BTw6mW45';

// REORGANIZACIÓN DE DRIVE (25-sep-2026, pedido del usuario): "JSON" > [→ Contexto_Base_Web.md §01B093]

// Carpeta contenedora "Endpoints" (dentro de "JSON"). Agrupa todas las
// subcarpetas de respaldo de API que antes colgaban directo de "JSON".
var DRIVE_FOLDER_ID_ENDPOINTS = '1KmICgkOyWGG3RldNIAat1GKEkgzLgJrj';

// Nombre en Drive: "Battlelog" (subcarpeta dentro de "Endpoints"). EN USO [→ Contexto_Base_Web.md §01B094]
var DRIVE_FOLDER_ID_BATTLELOG = '1VOVAImkIXHeJ0F8v8pGNIBqKBNapSjov';

// Backup_Arena.csv / Backup_Modo.csv (DRIVE_FOLDER_ID_CSV, carpeta "CSV") [→ Contexto_Base_Web.md §01B095]

// Nombre en Drive: "Cards" (subcarpeta dentro de "Endpoints"). Usada [→ Contexto_Base_Web.md §01B096]
var DRIVE_FOLDER_ID_CARDS = '1_Az5fMSg-fSOdr9oXnDvDmYOvd-T63ru';

// Carpeta contenedora "Clans" (subcarpeta dentro de "Endpoints"). Contiene 5 [→ Contexto_Base_Web.md §01B097]
var DRIVE_FOLDER_ID_CLANS = '1SwK0sRK4qegD6ru8UFqjIOEX-jw89Ioq';

// Carpeta contenedora "CurrentRiverRace" (subcarpeta dentro de "Endpoints"). [→ Contexto_Base_Web.md §01B098]
var DRIVE_FOLDER_ID_CURRENTRIVERRACE = '1xZr_GxHbuG_Y4gzPHZQxduhzkF8CeFPg';

// Nombre en Drive: "Locations" (subcarpeta dentro de "Endpoints"). En uso [→ Contexto_Base_Web.md §01B099]
var DRIVE_FOLDER_ID_LOCATIONS = '16lga9eqQZL79WX-tlC5xduh7PN-BIWQE';

// Carpeta contenedora "Ranking" (subcarpeta dentro de "Endpoints"). Sin
// lógica de fetch/guardado todavía; sus 4 subcarpetas están abajo.
var DRIVE_FOLDER_ID_RANKING = '1VBz-BQBZjIw7c5NRV0P03IOM3VvVy8q2';

// Nombre en Drive: "Copas" (subcarpeta dentro de "Ranking"). EN USO desde [→ Contexto_Base_Web.md §01B100]
var DRIVE_FOLDER_ID_RANKING_COPAS = '1Ytu7qnj4crKradvZVVxX62pqavQJyUgr';

// Nombre en Drive: "Guerra" (subcarpeta dentro de "Ranking"). EN USO desde [→ Contexto_Base_Web.md §01B101]
var DRIVE_FOLDER_ID_RANKING_GUERRA = '1yktY5yPtc-oFmfKTgChDS_Jlif6tMso2';

// Carpeta contenedora "Jugadores" (subcarpeta dentro de "Ranking"). Contiene [→ Contexto_Base_Web.md §01B102]
var DRIVE_FOLDER_ID_RANKING_JUGADORES = '1Apcb-E8Xlz7lKryKLWjNLgfTiwvIKwCb';

// Nombre en Drive: "Camino de leyendas" (subcarpeta dentro de "Ranking" > [→ Contexto_Base_Web.md §01B103]
var DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS = '1ro64eZUnfkEtEjIv72OV9urRMPla_e39';

// Nombre en Drive: "Global" (subcarpeta dentro de "Ranking" > "Jugadores", [→ Contexto_Base_Web.md §01B104]
var DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL = '1_DO5ZMCLP2HHSg4vxTS5Z-qr89q8EIl4';

// Nombre en Drive: "Seasons" (subcarpeta dentro de "Endpoints"). En uso [→ Contexto_Base_Web.md §01B105]
var DRIVE_FOLDER_ID_SEASONS = '1oIMkaJS6ElqXD9Z8xRA5jn0YVaz3l01d';

// Nombre en Drive: "UpcomingChests" (subcarpeta dentro de "Endpoints"). EN [→ Contexto_Base_Web.md §01B106]
var DRIVE_FOLDER_ID_UPCOMINGCHESTS = '1Tu4IBqisoj0j4caewVXAM74C603xs4Pt';

// Backup_Cofres.csv (DRIVE_FOLDER_ID_CSV, carpeta "CSV") [→ Contexto_Base_Web.md §01B107]

// RECURSOS GRÁFICOS (íconos/imágenes) -- REGISTRADO 27-sep-2026, pedido del [→ Contexto_Base_Web.md §01B108]

// Nombre en Drive: "Otros" (subcarpeta dentro de "JSON", NO dentro de [→ Contexto_Base_Web.md §01B109]
var DRIVE_FOLDER_ID_OTROS = '1Pn28g7L12W9xGtAJFEAoQZqhlz_sZxIO';

// RECONSTRUCCIÓN AUTOMÁTICA DE LOS 4 DOCS DE TORNEOS/SORTEOS [→ Contexto_Base_Web.md §01B110]
var _DOCS_TORNEOS_SORTEOS_RECONSTRUIBLES = null;

// Nombres de día y mes en español, usados SOLO por _formatFechaLargaEs() [→ Contexto_Base_Web.md §01B111]
var _DIAS_ES  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

var _MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio',
                 'agosto','septiembre','octubre','noviembre','diciembre'];

// ----- Funciones internas / helpers -----

// IV. HELPERS GLOBALES [→ Contexto_Base_Web.md §01B112]

// HELPERS DE CARPETA "Plantillas" Y SUS SUBCARPETAS [→ Contexto_Base_Web.md §01B113]

/**
 * _getCarpetasPlantillas() [→ Contexto_Base_Web.md §01B114]
 */
function _getCarpetasPlantillas() {
  var ids = [DRIVE_FOLDER_ID_PLANTILLAS].concat(DRIVE_FOLDERS_PLANTILLAS_SUB);
  var carpetas = [];
  for (var i = 0; i < ids.length; i++) {
    try {
      carpetas.push(DriveApp.getFolderById(ids[i]));
    } catch (e) {
      Logger.log('[Plantillas] No se pudo abrir la carpeta ' + ids[i] + ': ' + e.message);
    }
  }
  return carpetas;
}

// FIX (02-sep-2026, pedido usuario — corridas de RUNUPDATE muriendo "sin [→ Contexto_Base_Web.md §01B115]
var _CACHE_IDS_PLANTILLAS_MEMORIA_ = {};

// Prefijo de la clave en Script Properties (persiste ENTRE ejecuciones y [→ Contexto_Base_Web.md §01B116]
var PLANTILLAS_ID_CACHE_PREFIX_ = 'PLANTILLAS_ID_CACHE_';

/**
 * _buscarArchivoEnPlantillas(nombreArchivo, idArchivo) [→ Contexto_Base_Web.md §01B117]
 */
function _buscarArchivoEnPlantillas(nombreArchivo, idArchivo) {
  if (idArchivo) {
    try {
      var archivoPorId = DriveApp.getFileById(idArchivo);
      if (archivoPorId) return archivoPorId;
    } catch (e) {
      // ID inválido, archivo eliminado, o sin permiso: no se corta la
      // ejecución, simplemente se sigue con la búsqueda por nombre de abajo.
      Logger.log('[Plantillas] No se pudo abrir "' + nombreArchivo + '" por ID (' + idArchivo + '): ' + e.message + '. Se intenta por nombre.');
    }
  }

  var claveCache = PLANTILLAS_ID_CACHE_PREFIX_ + nombreArchivo;

  // 1. Caché en memoria de esta misma ejecución (la más rápida: ni siquiera
  //    toca Script Properties).
  if (_CACHE_IDS_PLANTILLAS_MEMORIA_[claveCache]) {
    try {
      var archivoPorMemoria = DriveApp.getFileById(_CACHE_IDS_PLANTILLAS_MEMORIA_[claveCache]);
      if (archivoPorMemoria) return archivoPorMemoria;
    } catch (eMem) {
      delete _CACHE_IDS_PLANTILLAS_MEMORIA_[claveCache]; // ya no sirve, se sigue abajo
    }
  }

  // 2. Caché persistente (Script Properties) de una corrida anterior.
  var props = PropertiesService.getScriptProperties();
  var idCacheado = props.getProperty(claveCache);
  if (idCacheado) {
    try {
      var archivoPorCache = DriveApp.getFileById(idCacheado);
      if (archivoPorCache) {
        _CACHE_IDS_PLANTILLAS_MEMORIA_[claveCache] = idCacheado;
        return archivoPorCache;
      }
    } catch (eCache) {
      // ID cacheado ya no sirve (archivo borrado o movido fuera de [→ Contexto_Base_Web.md §01B118]
      props.deleteProperty(claveCache);
    }
  }

  // 3. Recorrido normal de las 6 carpetas (el costoso). Si encuentra el [→ Contexto_Base_Web.md §01B119]
  var carpetas = _getCarpetasPlantillas();
  for (var i = 0; i < carpetas.length; i++) {
    var files = carpetas[i].getFilesByName(nombreArchivo);
    if (files.hasNext()) {
      var encontrado = files.next();
      props.setProperty(claveCache, encontrado.getId());
      _CACHE_IDS_PLANTILLAS_MEMORIA_[claveCache] = encontrado.getId();
      return encontrado;
    }
  }

  // FASE (08/08/2026 — Reconstrucción automática de docs borrados): si [→ Contexto_Base_Web.md §01B120]
  return _crearDocReconstruibleSiFalta(nombreArchivo);
}

/**
 * _getMapaDocsReconstruibles() [→ Contexto_Base_Web.md §01B121]
 */
function _getMapaDocsReconstruibles() {
  if (_DOCS_TORNEOS_SORTEOS_RECONSTRUIBLES) return _DOCS_TORNEOS_SORTEOS_RECONSTRUIBLES;
  var mapa = {};
  mapa[NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_SORTEO] = _construirContenidoDocParticipantesCalificadosSorteo;
  mapa[NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO] = _construirContenidoDocParticipantesCalificadosTorneo;
  mapa[NOMBRE_DOC_GANADORES_SORTEO] = _construirContenidoDocGanadoresSorteo;
  mapa[NOMBRE_DOC_GANADORES_TORNEO] = _construirContenidoDocGanadoresTorneo;
  mapa[NOMBRE_DOC_ASCENSOS_DESCENSOS] = _construirContenidoDocAscensosDescensos; // FASE (11/08/2026)
  // NUEVO (15-sep-2026, pedido del usuario -- ver 29_Docs_NoCalificados.gs). [→ Contexto_Base_Web.md §01B122]
  mapa[NOMBRE_DOC_NO_CALIFICADOS_TORNEO] = _construirContenidoDocNoCalificadosTorneo;
  mapa[NOMBRE_DOC_NO_CALIFICADOS_SORTEO] = _construirContenidoDocNoCalificadosSorteo;
  mapa[NOMBRE_DOC_CAMBIO_RANGO] = _construirContenidoDocCambioRango;
  _DOCS_TORNEOS_SORTEOS_RECONSTRUIBLES = mapa;
  return mapa;
}

/**
 * _getMapaCarpetaDestinoDocsReconstruibles() [→ Contexto_Base_Web.md §01B123]
 */
function _getMapaCarpetaDestinoDocsReconstruibles() {
  var mapa = {};
  mapa[NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_SORTEO] = DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS;
  mapa[NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO] = DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS;
  mapa[NOMBRE_DOC_GANADORES_SORTEO] = DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS;
  mapa[NOMBRE_DOC_GANADORES_TORNEO] = DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS;
  mapa[NOMBRE_DOC_ASCENSOS_DESCENSOS] = DRIVE_FOLDER_ID_PLANTILLAS_OTRAS;
  // NUEVO (15-sep-2026): "se deben generar en la misma carpeta de sus [→ Contexto_Base_Web.md §01B124]
  mapa[NOMBRE_DOC_NO_CALIFICADOS_TORNEO] = DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS;
  mapa[NOMBRE_DOC_NO_CALIFICADOS_SORTEO] = DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS;
  mapa[NOMBRE_DOC_CAMBIO_RANGO] = DRIVE_FOLDER_ID_PLANTILLAS_OTRAS;
  return mapa;
}

/**
 * _crearDocReconstruibleSiFalta(nombreArchivo) [→ Contexto_Base_Web.md §01B125]
 */
function _crearDocReconstruibleSiFalta(nombreArchivo) {
  var mapa = _getMapaDocsReconstruibles();
  var fnConstructora = mapa[nombreArchivo];
  if (typeof fnConstructora !== 'function') return null;

  try {
    var doc = DocumentApp.create(nombreArchivo);
    var body = doc.getBody();
    body.clear(); // DocumentApp.create() deja un párrafo vacío por defecto
    fnConstructora(body);
    doc.saveAndClose();

    var archivo = DriveApp.getFileById(doc.getId());
    try {
      var mapaCarpetas = _getMapaCarpetaDestinoDocsReconstruibles();
      var idCarpetaDestino = mapaCarpetas[nombreArchivo] || DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS;
      var carpetaDestino = DriveApp.getFolderById(idCarpetaDestino);
      carpetaDestino.addFile(archivo);
      // DocumentApp.create() lo crea en la raíz de "Mi unidad"; lo sacamos [→ Contexto_Base_Web.md §01B126]
      var raiz = DriveApp.getRootFolder();
      raiz.removeFile(archivo);
    } catch (eMover) {
      Logger.log('[ReconstruirDocs] "' + nombreArchivo + '" se creó pero no se pudo mover a su carpeta de Plantillas: ' + eMover.message + '. Queda en la raíz de Mi unidad; se puede mover a mano sin problema, _buscarArchivoEnPlantillas() lo sigue encontrando la próxima vez por nombre si se lo deja dentro de "Plantillas" o alguna de sus 5 subcarpetas.');
    }

    Logger.log('[ReconstruirDocs] AVISO: "' + nombreArchivo + '" no existía (borrado o ID inválido) y fue RECREADO desde cero. Nuevo ID de Drive: ' + archivo.getId() + ' — URL: ' + doc.getUrl() + '. Si se quiere recuperar la búsqueda rápida por ID, actualizar la constante DOC_ID_* correspondiente con este ID nuevo.');
    // FIX (02-sep-2026): cachea el ID nuevo igual que el recorrido normal de [→ Contexto_Base_Web.md §01B127]
    var claveCacheRecreado = PLANTILLAS_ID_CACHE_PREFIX_ + nombreArchivo;
    PropertiesService.getScriptProperties().setProperty(claveCacheRecreado, archivo.getId());
    _CACHE_IDS_PLANTILLAS_MEMORIA_[claveCacheRecreado] = archivo.getId();
    return archivo;
  } catch (eCrear) {
    Logger.log('[ReconstruirDocs] Error al recrear "' + nombreArchivo + '": ' + eCrear.message);
    return null;
  }
}

// HELPER DE ENLACES - makeLink() [→ Contexto_Base_Web.md §01B128]
/**
 * Crea un enlace de texto enriquecido (RichTextValue) para Google Sheets.
 */
function makeLink(textoMostrar, url) {
  if (!textoMostrar || !url) {
    return SpreadsheetApp.newRichTextValue().setText('').build();
  }
  return SpreadsheetApp.newRichTextValue()
    .setText(textoMostrar)
    .setLinkUrl(0, textoMostrar.length, url)
    .build();
}

// HELPERS DE FECHA Y TIEMPO [→ Contexto_Base_Web.md §01B129]

function lastSeenToDate(ls) {
  if (!ls) return null;
  try {
    var c = String(ls).replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\.\d+)?Z$/,
      '$1-$2-$3T$4:$5:$6Z'
    );
    var d = new Date(c);
    return isNaN(d.getTime()) ? null : d;
  } catch(e) { return null; }
}

function diasInactividad(ls) {
  var d = lastSeenToDate(ls);
  if (!d) return 999;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function dateKey(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  return String(d.getDate()).padStart(2,'0') + '/' +
         String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

/**
 * _formatFechaLargaEs(fecha) [→ Contexto_Base_Web.md §01B130]
 */
function _formatFechaLargaEs(fecha) {
  var TZ = 'America/Lima';
  // 'u' = número ISO de día de semana (1=lunes ... 7=domingo); %7 lo alinea
  // con _DIAS_ES (0=domingo ... 6=sábado).
  var diaSemana = parseInt(Utilities.formatDate(fecha, TZ, 'u'), 10) % 7;
  var dia    = parseInt(Utilities.formatDate(fecha, TZ, 'd'), 10);
  var mesIdx = parseInt(Utilities.formatDate(fecha, TZ, 'M'), 10) - 1;
  var anio   = Utilities.formatDate(fecha, TZ, 'yyyy');
  var hora24 = parseInt(Utilities.formatDate(fecha, TZ, 'H'), 10);
  var min    = Utilities.formatDate(fecha, TZ, 'mm');
  var seg    = Utilities.formatDate(fecha, TZ, 'ss');

  var hora12 = hora24 % 12;
  if (hora12 === 0) hora12 = 12;
  var ampm = hora24 < 12 ? 'a.m.' : 'p.m.';

  return _DIAS_ES[diaSemana] + ', ' + dia + ' de ' + _MESES_ES[mesIdx] + ', ' +
         anio + ' ' + hora12 + ':' + min + ':' + seg + ' ' + ampm;
}

function _setDateCell(sh, row, col, dateVal, fmt) {
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    sh.getRange(row, col).setValue(dateVal);
    _trySetFmt(sh, row, col, fmt);
  } else {
    sh.getRange(row, col).setValue('');
  }
}

// HELPERS DE TEMPORADA Y PERIODINDEX [→ Contexto_Base_Web.md §01B131]

function periodIdxToLetra(periodIndex) {
  return CFG.DIA_LETRAS[periodIndex % 7] || 'L';
}

/**
 * diaLetraANombre(letra) [→ Contexto_Base_Web.md §01B132]
 */
function diaLetraANombre(letra) {
  var l = String(letra || '').trim().toUpperCase();
  return CFG.DIA_NOMBRES[l] || l;
}

function periodIdxToSectionIndex(periodIndex) {
  return Math.floor(Math.max(0, Number(periodIndex) || 0) / 7);
}

function esDiaGuerraIdx(periodIndex) {
  return (periodIndex % 7) >= 3;
}

/**
 * _getMesEfectivo(periodIndex) [→ Contexto_Base_Web.md §01B133]
 */
function _getMesEfectivo(periodIndex, cacheValido) {
  var props = PropertiesService.getScriptProperties();
  var guardado = props.getProperty('CTX_MES_EFECTIVO');

  var mesEfectivo;
  if (guardado) {
    var partes = guardado.split('-');
    mesEfectivo = { anio: Number(partes[0]), mes: Number(partes[1]) };
  } else {
    mesEfectivo = _calcularMesEfectivoRealDeHoy();
  }

  // Sin caché válido de clanes, el periodIndex recibido es un 0 por [→ Contexto_Base_Web.md §01B134]
  if (!cacheValido) {
    return mesEfectivo;
  }

  var lastPeriodStr = props.getProperty('CTX_LAST_PERIOD_INDEX');
  var lastPeriod = (lastPeriodStr !== null && lastPeriodStr !== '') ? Number(lastPeriodStr) : null;
  var pIdx = Number(periodIndex) || 0;

  // Reinicio de temporada detectado: el periodIndex de la API volvió a un [→ Contexto_Base_Web.md §01B135]
  if (lastPeriod !== null && pIdx < lastPeriod && pIdx <= 6 && lastPeriod >= 20) {
    mesEfectivo.mes++;
    if (mesEfectivo.mes > 11) { mesEfectivo.mes = 0; mesEfectivo.anio++; }
  }

  // GUARDIÁN ANTI-DRIFT — el mes efectivo NUNCA debería quedar más de 1 mes [→ Contexto_Base_Web.md §01B136]
  var mesReal = _calcularMesEfectivoRealDeHoy();
  var diffMeses = (mesEfectivo.anio - mesReal.anio) * 12 + (mesEfectivo.mes - mesReal.mes);

  if (diffMeses > 1) {
    Logger.log('[_getMesEfectivo] CORRECCIÓN AUTOMÁTICA: mes efectivo guardado (' +
      mesEfectivo.anio + '-' + (mesEfectivo.mes + 1) + ') estaba ' + diffMeses +
      ' mes(es) adelantado de la fecha real. Se reinicia a ' +
      mesReal.anio + '-' + (mesReal.mes + 1) + '.');
    mesEfectivo = mesReal;
    // Limpiar los contadores de detección de saltos para que la corrida
    // siguiente no se bloquee comparando contra el estado corrupto previo.
    props.deleteProperty('CTX_ULTIMO_PERIODINDEX_OK');
    props.deleteProperty('CTX_ULTIMO_TS_OK');
    lastPeriod = null;
  }

  props.setProperty('CTX_LAST_PERIOD_INDEX', String(pIdx));
  props.setProperty('CTX_MES_EFECTIVO', mesEfectivo.anio + '-' + mesEfectivo.mes);

  return mesEfectivo;
}

/**
 * Calcula el "mes efectivo" que correspondería HOY según la fecha real del [→ Contexto_Base_Web.md §01B137]
 */
function _calcularMesEfectivoRealDeHoy() {
  var hoy  = new Date();
  var anio = hoy.getFullYear();
  var mes  = hoy.getMonth();
  var primerLunesHoyMes = primerLunesDelMes(anio, mes);
  if (hoy < primerLunesHoyMes) {
    mes--;
    if (mes < 0) { mes = 11; anio--; }
  }
  return { anio: anio, mes: mes };
}

/**
 * calcTemporadaDesdeMesEfectivo(ref, mesEfectivo) [→ Contexto_Base_Web.md §01B138]
 */
function calcTemporadaDesdeMesEfectivo(ref, mesEfectivo) {
  if (!ref || isNaN(ref.getTime())) return 1;
  return (mesEfectivo.anio - ref.getFullYear()) * 12
       + (mesEfectivo.mes - ref.getMonth()) + 1;
}

function primerLunesDelMes(anio, mes) {
  var d = new Date(anio, mes, 1);
  var dow = d.getDay();
  var off = (dow === 1) ? 0 : (dow === 0) ? 1 : (8 - dow);
  d.setDate(1 + off);
  return d;
}

function lunesEnMes(anio, mes) {
  var pl = primerLunesDelMes(anio, mes);
  var ultimoDia = new Date(anio, mes + 1, 0).getDate();
  var count = 0;
  for (var d = pl.getDate(); d <= ultimoDia; d += 7) count++;
  return count;
}

function primerLunesTemporada(ref, temporada) {
  var anio = ref.getFullYear();
  var mes  = ref.getMonth() + (temporada - 1);
  while (mes > 11) { mes -= 12; anio++; }
  return primerLunesDelMes(anio, mes);
}

function calcDiaGuerraIdx(ref, temporada, periodIndex) {
  var pl = primerLunesTemporada(ref, temporada);
  if (!pl || isNaN(pl.getTime())) return null;
  var d = new Date(pl.getTime());
  d.setDate(d.getDate() + (Number(periodIndex) || 0));
  return d;
}

// HELPERS DE CLAN Y API [→ Contexto_Base_Web.md §01B139]

// HELPER DE TELÉFONOS [→ Contexto_Base_Web.md §01B140]
function soloDigitos(v) {
  return String(v || '').replace(/\D/g, '');
}

/**
 * _getClanesAdminTexto(prefijo, celular) [→ Contexto_Base_Web.md §01B141]
 */
function _getClanesAdminTexto(prefijo, celular) {
  var tel = soloDigitos(prefijo) + soloDigitos(celular);
  if (!tel) return '';
  for (var i = 0; i < CFG.ADMIN_FAMILIA.length; i++) {
    var a = CFG.ADMIN_FAMILIA[i];
    var telA = soloDigitos(a.prefijo) + soloDigitos(a.celular);
    if (telA && telA === tel) {
      if (a.clanes === 'TODOS') return _getNombresClanesTernaOrdenados().join(', ');
      var nombres = [];
      for (var j = 0; j < a.clanes.length; j++) nombres.push(_resolverNombreClan(a.clanes[j]));
      return nombres.join(', ');
    }
  }
  return '';
}

/**
 * _getNombresClanesTernaOrdenados() [→ Contexto_Base_Web.md §01B142]
 */
function _getNombresClanesTernaOrdenados() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (sh && sh.getLastRow() >= 2) {
    var data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues(); // Orden, ClanTag, Nombre
    var nombres = [];
    for (var i = 0; i < data.length; i++) {
      var tag = String(data[i][1] || '').trim();
      var nombre = String(data[i][2] || '').trim();
      if (nombre && CFG.TERNA_TAGS.indexOf(tag) >= 0) nombres.push(nombre);
    }
    if (nombres.length > 0) return nombres;
  }
  // Fallback: hoja Clan sin datos todavía
  return CFG.TERNA_TAGS.map(_resolverNombreClan);
}

/**
 * _resolverNombreClan(clanTag) [→ Contexto_Base_Web.md §01B143]
 */
function _resolverNombreClan(clanTag) {
  try {
    var cache = _getClanCache(clanTag);
    if (cache && cache.info && cache.info.name) return cache.info.name;
  } catch (e) {}
  return CFG.CLAN_NOMBRES_FALLBACK[clanTag] || clanTag;
}

/**
 * esRazonValida(v) [→ Contexto_Base_Web.md §01B144]
 */
function esRazonValida(v) {
  return CFG.RAZON_VALORES_VALIDOS.indexOf(String(v || '').trim()) >= 0;
}

/**
 * esTagOculto(tag) [→ Contexto_Base_Web.md §01B145]
 */
function esTagOculto(tag) {
  var t = String(tag || '').trim().toUpperCase();
  if (!t) return false;
  if (t.charAt(0) !== '#') t = '#' + t;
  for (var i = 0; i < CFG.TAGS_OCULTOS.length; i++) {
    if (String(CFG.TAGS_OCULTOS[i]).toUpperCase() === t) return true;
  }
  return false;
}

/**
 * _ocultarFilasTagsOcultos(sh, colTag) [→ Contexto_Base_Web.md §01B146]
 */
function _ocultarFilasTagsOcultos(sh, colTag) {
  if (!sh) return;
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  var listaActual = (CFG.TAGS_OCULTOS || []).map(function(t) { return String(t).toUpperCase(); });

  var props        = PropertiesService.getScriptProperties();
  var claveProp     = 'TAGS_OCULTOS_APLICADOS__' + sh.getName();
  var listaAnterior = (props.getProperty(claveProp) || '').split(',').filter(function(t) { return t; });

  // Tags que estaban ocultos en la corrida anterior pero ya no lo están —
  // hay que deshacer su ocultamiento.
  var tagsAQuitar = listaAnterior.filter(function(t) { return listaActual.indexOf(t) < 0; });

  var tags = sh.getRange(2, colTag, lastRow - 1, 1).getValues();

  for (var i = 0; i < tags.length; i++) {
    if (esTagOculto(tags[i][0])) {
      try { sh.hideRows(i + 2); } catch (e) {}
    }
  }

  if (tagsAQuitar.length > 0) {
    for (var j = 0; j < tags.length; j++) {
      var tagFila = String(tags[j][0] || '').trim().toUpperCase();
      if (tagFila && tagFila.charAt(0) !== '#') tagFila = '#' + tagFila;
      if (tagsAQuitar.indexOf(tagFila) >= 0) {
        try { sh.showRows(j + 2); } catch (e) {}
      }
    }
  }

  props.setProperty(claveProp, listaActual.join(','));
}

/**
 * encodeTag(tag) [→ Contexto_Base_Web.md §01B147]
 */
function encodeTag(tag) {
  var t = String(tag || '').trim();
  while (t.indexOf('%2523') >= 0) t = t.replace('%2523', '#');
  while (t.indexOf('%23') >= 0)   t = t.replace('%23', '#');
  return t.replace('#', '%23');
}

function cleanTag(tag) {
  return String(tag || '').replace('#','').toUpperCase();
}

function mapRol(r) {
  return {leader:'Líder', coLeader:'Colíder', elder:'Veterano', member:'Miembro'}[r] || 'Miembro';
}

function getLiga(t) {
  var n = Number(t) || 0;
  for (var i = 0; i < CFG.LIGAS.length; i++)
    if (n >= CFG.LIGAS[i].min) return CFG.LIGAS[i].nombre;
  return 'Bronce I';
}

function getClanLeader(ml) {
  if (!ml) return '';
  for (var i = 0; i < ml.length; i++) if (ml[i].role === 'leader') return ml[i].name;
  return '';
}

function getClanLeaderTag(ml) {
  if (!ml) return '';
  for (var i = 0; i < ml.length; i++) if (ml[i].role === 'leader') return ml[i].tag || '';
  return '';
}

function colLetter(n) {
  var s = '';
  while (n > 0) {
    s = String.fromCharCode(64 + (n % 26 || 26)) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// HELPERS DE FORMATO Y LAYOUT [→ Contexto_Base_Web.md §01B148]

function applyBorderCenter(range) {
  range.setBorder(true, true, true, true, true, true,
    CFG.COLORES.BORDE_GRIS, SpreadsheetApp.BorderStyle.SOLID)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}

function applyHeaderStyle(sh, numCols) {
  var r = sh.getRange(1, 1, 1, numCols);
  r.setBackground(CFG.COLORES.HEADER_BG)
   .setFontColor(CFG.COLORES.HEADER_FG)
   .setFontWeight('bold')
   .setHorizontalAlignment('center')
   .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
  sh.setFrozenRows(1);
}

function _trySetFmt(sh, row, col, fmt) {
  try { sh.getRange(row, col).setNumberFormat(fmt); } catch(e) {}
}

function _tryCondFmt(sh, rules) {
  try { sh.setConditionalFormatRules(rules); } catch(e) {}
}

function _clearBg(range) {
  try { range.setBackground(null); } catch(e) {
    try { range.setBackground('white'); } catch(e2) {}
  }
}

// HELPERS DE DRIVE Y SPREADSHEET [→ Contexto_Base_Web.md §01B149]

function _getCsvFolder() {
  try { return DriveApp.getFolderById(DRIVE_FOLDER_ID_CSV); }
  catch(e) {
    var folders = DriveApp.getFoldersByName('CSV');
    return folders.hasNext() ? folders.next() : DriveApp.createFolder('CSV');
  }
}

function _getSs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss !== null) return ss;
  var id = PropertiesService.getScriptProperties().getProperty('HOJA_ACTIVA_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch(e) {} }
  throw new Error('No se encontró hoja activa ni ID de respaldo en Properties.');
}

function _desactivarGridlines(sh) {
  try { sh.setHiddenGridlines(true); } catch(e) {}
}

// FALLBACK GENÉRICO SHEET -> CSV [→ Contexto_Base_Web.md §01B150]

/**
 * _armarHeaderIdx(headers) [→ Contexto_Base_Web.md §01B151]
 */
function _armarHeaderIdx(headers) {
  var idx = {};
  for (var c = 0; c < headers.length; c++) {
    idx[String(headers[c] || '').trim()] = c;
  }
  return idx;
}

/**
 * _obtenerFilasConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, totalCols, headerRowsHoja) [→ Contexto_Base_Web.md §01B152]
 */
function _obtenerFilasConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, totalCols, headerRowsHoja) {
  headerRowsHoja = headerRowsHoja || 1;
  // 1) Intentar la hoja primero: sigue siendo la fuente de verdad habitual.
  try {
    var sh = ss.getSheetByName(nombreHoja);
    if (sh && sh.getLastRow() >= headerRowsHoja + 1) {
      var numCols = totalCols || Math.max(sh.getLastColumn(), 1);
      var headers;
      if (headerRowsHoja === 2) {
        headers = _combinarHeaderDosFilas(sh, numCols);
      } else if (headerRowsHoja === 3) {
        headers = _combinarHeaderTresFilas(sh, numCols);
      } else {
        headers = sh.getRange(1, 1, 1, numCols).getValues()[0];
      }
      var primeraFilaDatos = headerRowsHoja + 1;
      var filas = sh.getRange(primeraFilaDatos, 1, sh.getLastRow() - headerRowsHoja, numCols).getValues();
      return {
        filas: filas,
        headers: headers,
        headerIdx: _armarHeaderIdx(headers),
        origen: 'sheet'
      };
    }
  } catch (e) {
    // Sheet no disponible (spreadsheet caído, hoja protegida/corrupta, [→ Contexto_Base_Web.md §01B153]
    Logger.log('[FallbackCSV] No se pudo leer la hoja "' + nombreHoja + '": ' + e);
  }

  // 2) Hoja no encontrada, vacía, o la lectura falló -> redirigir al CSV.
  if (!nombreArchivoCsv) {
    return { filas: [], headers: [], headerIdx: {}, origen: 'vacio' };
  }

  var csvText = _loadCSVFromDrive(nombreArchivoCsv);
  if (!csvText) {
    Logger.log('[FallbackCSV] "' + nombreHoja + '" sin datos en la hoja y sin CSV de respaldo (' + nombreArchivoCsv + ').');
    return { filas: [], headers: [], headerIdx: {}, origen: 'vacio' };
  }

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) {
    return { filas: [], headers: (parsed && parsed[0]) || [], headerIdx: {}, origen: 'vacio' };
  }

  var csvHeaders = parsed[0];
  var csvFilas   = parsed.slice(1);
  if (totalCols) {
    csvFilas = csvFilas.map(function(r) {
      var nueva = r.slice(0, totalCols);
      while (nueva.length < totalCols) nueva.push('');
      return nueva;
    });
  }

  Logger.log('[FallbackCSV] "' + nombreHoja + '" no disponible o vacía: se usó el respaldo ' +
             nombreArchivoCsv + ' (' + csvFilas.length + ' filas).');

  return {
    filas: csvFilas,
    headers: csvHeaders,
    headerIdx: _armarHeaderIdx(csvHeaders),
    origen: 'csv'
  };
}

/**
 * _obtenerMapaPorTagConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, tagColIdx, totalCols) [→ Contexto_Base_Web.md §01B154]
 */
function _obtenerMapaPorTagConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, tagColIdx, totalCols) {
  var resultado = _obtenerFilasConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, totalCols);
  var mapa = {};
  for (var i = 0; i < resultado.filas.length; i++) {
    var tag = String(resultado.filas[i][tagColIdx] || '').trim().toUpperCase();
    if (tag) mapa[tag] = resultado.filas[i];
  }
  return { mapa: mapa, origen: resultado.origen };
}

/**
 * _numDesdeCeldaCSV_(v) [→ Contexto_Base_Web.md §01B155]
 */
function _numDesdeCeldaCSV_(v) {
  if (typeof v === 'number') return v;
  if (v === '' || v === null || v === undefined) return NaN;
  var t = String(v).replace(/\u00a0/g, ' ').trim();
  if (t === '') return NaN;
  if (/^-?\d{1,3}([.,' ]\d{3})+$/.test(t)) t = t.replace(/[.,' ]/g, '');
  return Number(t);
}
// se trae _scriptToken desde 37_Web_API
function _scriptToken(nombrePropiedad) {
  var v = PropertiesService.getScriptProperties().getProperty(nombrePropiedad);
  if (!v) {
    // Corta temprano y con mensaje claro: sin literal de respaldo, un [→ Contexto_Base_Web.md §01B156]
    throw new Error('Falta la Property "' + nombrePropiedad + '" en Propiedades del script. ' +
      'Créala en Configuración del proyecto ▸ Propiedades del script.');
  }
  return v;
}

/**
 * guardarTokensEnScriptProperties() [→ Contexto_Base_Web.md §01B157]
 */
function guardarTokensEnScriptProperties() {
  var props = PropertiesService.getScriptProperties();
  var nombres = [
    'WEB_MEMBER_TOKEN', 'CONTACTOS_TOKEN', 'DASHBOARD_TOKEN',
    'CORRECCION_GUERRA_TOKEN', 'HISTORIAL_GUERRA_TOKEN',
    'NUEVOS_ROYALEAPI_TOKEN', 'VERIFICAR_RIVERRACE_TOKEN', 'CLAVE_ADMIN_PEPPER'
  ];
  var yaExistian = [], fallaron = [];
  for (var i = 0; i < nombres.length; i++) {
    var nombre = nombres[i];
    if (props.getProperty(nombre)) { yaExistian.push(nombre); continue; }
    // Ya no hay literal de respaldo en el código: sin Property, no hay
    // valor que copiar. Hay que crearla a mano en Script Properties.
    fallaron.push(nombre + ' (sin Property y sin literal de respaldo en el código)');
  }
  Logger.log('[Tokens] Ya existían (' + yaExistian.length + '): ' + (yaExistian.join(', ') || '—'));
  if (fallaron.length) Logger.log('[Tokens] Faltan por crear a mano: ' + fallaron.join('; '));
}