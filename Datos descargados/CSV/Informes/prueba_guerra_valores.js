// Prueba (solo lectura) de §PF437 F3, estado «Valores» (§PF546 punto 12): _gdsSemanaValoresOk_, _gdsPerfilFamePorSemana_, el plan de la columna y el cruce con los datos reales de «Datos descargados». Uso: node prueba_guerra_valores.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '../../..');
const ctx = vm.createContext({ console, Logger: { log() {} }, Utilities: {}, SpreadsheetApp: {}, DriveApp: {}, PropertiesService: {}, CacheService: {}, LockService: {}, UrlFetchApp: {}, ScriptApp: {}, Session: {}, HtmlService: {}, ContentService: {} });
for (const f of ['01_Config_Global.gs', '05_Backup_CSV.gs', '06_Battlelogs_Siembra.gs', '17_GuerraSheet.gs', '18_CorreccionGuerra.gs']) vm.runInContext(fs.readFileSync(path.join(raiz, 'Base/src', f), 'utf8'), ctx);
let ok = 0, fail = 0;
const t = (n, c) => { c ? ok++ : (fail++, console.log('FALLA', n)); };
const V = 'Valores', B = 'Valores + Battlelog';
const d = (fuente, consistencia, fame) => ({ fuente, consistencia, fame });

// _gdsSemanaValoresOk_
t('semana con todos los días Único y fame igual al perfil', ctx._gdsSemanaValoresOk_([d('Único', '', 250), d('Único', '', 450)], 700) === true);
t('Battlelog con «Coincide» cuenta', ctx._gdsSemanaValoresOk_([d('Battlelog', 'Coincide', 250), d('Único', '', 450)], 700) === true);
t('Battlelog sin «Coincide» no cuenta', ctx._gdsSemanaValoresOk_([d('Battlelog', '', 250)], 250) === false && ctx._gdsSemanaValoresOk_([d('Battlelog', 'Fame distinta', 250)], 250) === false);
t('un día Posible rompe la semana', ctx._gdsSemanaValoresOk_([d('Único', '', 250), d('Posible', '', 450)], 700) === false);
for (const fu of ['Varios días', 'Imposible', 'Sin dato', 'Battlelog parcial', 'Contradicción battlelog', ''])
  t('fuente no válida: ' + fu, ctx._gdsSemanaValoresOk_([d(fu, '', 250)], 250) === false);
t('Único con «Backup contradicho por JSON» no cuenta', ctx._gdsSemanaValoresOk_([d('Único', 'Backup contradicho por JSON', 250)], 250) === false);
t('fame distinta del perfil', ctx._gdsSemanaValoresOk_([d('Único', '', 250)], 300) === false);
t('sin total de perfil', ctx._gdsSemanaValoresOk_([d('Único', '', 250)], undefined) === false && ctx._gdsSemanaValoresOk_([d('Único', '', 250)], null) === false && ctx._gdsSemanaValoresOk_([d('Único', '', 250)], NaN) === false);
t('día sin fame (null) no cuenta', ctx._gdsSemanaValoresOk_([d('Único', '', null)], 0) === false);
t('sin días no cuenta', ctx._gdsSemanaValoresOk_([], 0) === false && ctx._gdsSemanaValoresOk_(null, 0) === false);
t('semana de 0 con perfil 0 y días Único', ctx._gdsSemanaValoresOk_([d('Único', '', 0)], 0) === true);

// _gdsPerfilFamePorSemana_
const E = (clanTag, fame, origen, clanPerfil) => ({ clanTag, fame, origenPerfil: origen, clanPerfil: clanPerfil || '' });
const mapa = {
  '27|2||#AAA': E('', 700, 'perfil', ctx.CFG.TERNA_TAGS[0]),
  '27|2|#GCRG8L00|#AAA': E('#GCRG8L00', 650),
  '27|3||#BBB': E('', 900, 'perfil', '#EXTERNO1'),
  '27|4||#CCC': E('', 500, 'desconocido', ''),
  '-47|1||#DDD': E('', 2989, 'perfil', ''),
  '27|5||eee': E('', 100, 'perfil', '')
};
const pf = ctx._gdsPerfilFamePorSemana_(mapa);
t('perfil de un jugador: clave temporada|semana|TAG', pf['27|2|#AAA'] === 700);
t('la fila de un clan no es perfil', Object.keys(pf).every(k => !/GCRG8L00/.test(k)));
t('perfil de clan externo no cuenta', pf['27|3|#BBB'] === undefined);
t('origen distinto de «perfil» no cuenta', pf['27|4|#CCC'] === undefined);
t('temporada negativa y clan del perfil vacío cuentan', pf['-47|1|#DDD'] === 2989);
t('el tag se normaliza', pf['27|5|#EEE'] === 100);
t('mapa vacío o nulo', Object.keys(ctx._gdsPerfilFamePorSemana_({})).length === 0 && Object.keys(ctx._gdsPerfilFamePorSemana_(null)).length === 0);

// plan de la hoja: «Valores» como texto propio
const fila = (comp) => { const f = new Array(ctx.GUERRA_TOTAL_COLS).fill(''); f[ctx.GC.ETAPA - 1] = 'Guerra'; f[ctx.GC.TAG - 1] = '#T'; f[ctx.GC.CLAN_TAG - 1] = '#A'; f[ctx.GC.TEMPORADA - 1] = '27'; f[ctx.GC.SEMANA - 1] = '2'; f[ctx.GC.PERIOD_IDX - 1] = '3'; f[ctx.GC.ATAQUES_HOY - 1] = 2; f[ctx.GC.ATAQUES_SEM - 1] = 2; f[ctx.GC.FAME - 1] = 450; f[ctx.GC.BARCOS - 1] = 0; f[ctx.GC.COMPROBADA - 1] = comp; return f; };
const f0 = fila('');
const clave = ctx._gdsClaveFilaGuerra_(f0, {}), firma = ctx._gdsFirmaValoresGuerra_(f0);
let p = ctx._gdsPlanComprobadasGuerra_([{ clave, estado: V, firma }], [fila('')], {});
t('pone «Valores»', p.columna[0] === V && p.puestas === 1 && p.ajenas === 0);
p = ctx._gdsPlanComprobadasGuerra_([{ clave, estado: V, firma }], [fila(V)], {});
t('«Valores» ya puesto queda igual y no es texto ajeno', p.columna[0] === V && p.igual === 1 && p.ajenas === 0 && p.puestas === 0);
p = ctx._gdsPlanComprobadasGuerra_([{ clave, estado: '', firma }], [fila(V)], {});
t('«Valores» sin marca se quita', p.columna[0] === '' && p.quitadas === 1);
p = ctx._gdsPlanComprobadasGuerra_([{ clave, estado: V, firma: '9|9|9|9' }], [fila(V)], {});
t('valores distintos a los del backup: se quita', p.columna[0] === '' && p.noCoinciden === 1 && p.quitadas === 1);
p = ctx._gdsPlanComprobadasGuerra_([{ clave, estado: B, firma }], [fila(V)], {});
t('«Valores» pasa a «Valores + Battlelog» si el día se comprueba con battlelog', p.columna[0] === B && p.puestas === 1);
p = ctx._gdsPlanComprobadasGuerra_([{ clave, estado: V, firma }], [fila('Otro texto')], {});
t('un texto ajeno no se toca', p.columna[0] === 'Otro texto' && p.ajenas === 1);

// Datos reales
const dir = path.join(raiz, 'Datos descargados/CSV');
const hojas = path.join(dir, 'Hojas/Backup_Guerra.csv'), corr = path.join(dir, 'Tampermonkey/Correcciones_Guerra.csv'), bl = path.join(dir, 'Jugador/Backup_Battlelogs.csv');
if (fs.existsSync(hojas) && fs.existsSync(corr)) {
  const g = ctx._parseCSV(fs.readFileSync(hojas, 'utf8'));
  const filas = []; for (let i = 1; i < g.length; i++) { const f = g[i].slice(0, ctx.GUERRA_TOTAL_COLS); while (f.length < ctx.GUERRA_TOTAL_COLS) f.push(''); filas.push(f); }
  const porTag = {};
  if (fs.existsSync(bl)) { const b = ctx._parseCSV(fs.readFileSync(bl, 'utf8')); for (let i = 1; i < b.length; i++) { const tg = ctx._blgNormalizarTag_(b[i][ctx.BLG_COL.TAG]); if (!tg) continue; (porTag[tg] = porTag[tg] || []).push(b[i]); } }
  const perfil = ctx._gdsPerfilFamePorSemana_(ctx._cgwLeerOverlayDeTexto_(fs.readFileSync(corr, 'utf8')));
  console.log('Totales de perfil utilizables:', Object.keys(perfil).length);
  t('datos reales: hay totales de perfil', Object.keys(perfil).length > 5000);
  const base = { ternaTags: ctx.CFG.TERNA_TAGS.slice(), tagPorNombre: {}, battlelogPorTag: porTag, capturasPorTag: {} };
  const sin = ctx._gdsConstruirFilas_(filas, base);
  const con = ctx._gdsConstruirFilas_(filas, Object.assign({}, base, { perfilFamePorSemana: perfil }));
  t('sin la opción no se marca ninguna semana «Valores» (compatibilidad)', sin.cuenta.comprobadasValores === 0 && sin.cuenta.semanasValores === 0 && sin.marcas.every(m => m.estado !== V));
  t('con la opción se marca alguna semana', con.cuenta.semanasValores > 0 && con.cuenta.comprobadasValores > 0);
  t('«Valores + Battlelog» no cambia (mismos días que sin la opción)', con.marcas.filter(m => m.estado === B).length === sin.marcas.filter(m => m.estado === B).length);
  t('las marcas son las mismas filas, en el mismo orden', con.marcas.length === sin.marcas.length && con.filas.length === sin.filas.length);
  const col = {}; ctx.GDS_HEADERS.forEach((h, i) => col[h] = i);
  let celdasV = 0, celdasB = 0, hayOtro = 0;
  for (const f of con.filas) for (const dd of ['J', 'V', 'S', 'D']) { const x = f[col[dd + ' Comprobada']]; if (x === V) celdasV++; else if (x === B) celdasB++; else if (x !== '') hayOtro++; }
  t('el CSV lleva «Valores» en tantos días como la cuenta (' + celdasV + ')', celdasV === con.cuenta.comprobadasValores && hayOtro === 0);
  t('el CSV lleva «Valores + Battlelog» en tantos días como las marcas', celdasB === con.marcas.filter(m => m.estado === B).length);
  // Verificación independiente: cada semana marcada «Valores» suma la fame del perfil y sus días son Único o Battlelog
  const porSemana = {};
  for (const f of con.filas) {
    const k = [Number(f[col['Temporada']]), Number(f[col['Semana']]), ctx._blgNormalizarTag_(f[col['Tag']])].join('|');
    const s = porSemana[k] = porSemana[k] || { fame: 0, dias: 0, valores: 0, ok: true };
    for (const dd of ['J', 'V', 'S', 'D']) {
      const fu = f[col[dd + ' FuenteDesglose']], fa = f[col['Medallas ' + dd]], cm = f[col[dd + ' Comprobada']];
      if (fu === '' && fa === '') continue;
      s.dias++; s.fame += Number(fa) || 0;
      if (cm === V) s.valores++;
      if (!(fu === 'Único' || fu === 'Battlelog')) s.ok = false;
    }
  }
  let semV = 0, malas = 0;
  for (const k of Object.keys(porSemana)) { const s = porSemana[k]; if (!s.valores) continue; semV++; if (!(s.ok && s.fame === perfil[k])) malas++; }
  t('las semanas con «Valores» son las de la cuenta (' + semV + ')', semV === con.cuenta.semanasValores || semV <= con.cuenta.semanasValores);
  t('ninguna semana «Valores» incumple el criterio (suma = perfil, días Único o Battlelog); malas=' + malas, malas === 0);
  console.log('Con datos reales: semanas «Valores»', con.cuenta.semanasValores, '| días «Valores»', con.cuenta.comprobadasValores, '| días «Valores + Battlelog»', con.marcas.filter(m => m.estado === B).length, '| días con datos', con.cuenta.diasSalida);
}
console.log(ok + ' ok, ' + fail + ' fallas');
process.exit(fail ? 1 : 0);
