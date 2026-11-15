// Prueba (solo lectura) de §PF437 F3 y F4: columna «Comprobada» de Guerra_Desglose.csv y aviso de filas comprobadas. Uso: node prueba_guerra_comprobada.js
// Carga 01, 05, 06, 17 y 18 de Base/src en un contexto de node (como prueba_guerra_desglose_ancho.js) y usa los datos reales de «Datos descargados».
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '../../..');
const ctx = vm.createContext({ console, Logger: { log() {} }, Utilities: {}, SpreadsheetApp: {}, DriveApp: {}, PropertiesService: {}, CacheService: {}, LockService: {}, UrlFetchApp: {}, ScriptApp: {}, Session: {}, HtmlService: {}, ContentService: {} });
for (const f of ['01_Config_Global.gs', '05_Backup_CSV.gs', '06_Battlelogs_Siembra.gs', '17_GuerraSheet.gs', '18_CorreccionGuerra.gs']) vm.runInContext(fs.readFileSync(path.join(raiz, 'Base/src', f), 'utf8'), ctx);
let ok = 0, fail = 0;
const t = (n, c) => { c ? ok++ : (fail++, console.log('FALLA', n)); };
const B = 'Valores + Battlelog';

// F3: estado de un día
t('Battlelog + Coincide', ctx._gdsComprobadaDia_('Battlelog', 'Coincide') === B);
t('Battlelog sin consistencia', ctx._gdsComprobadaDia_('Battlelog', '') === '');
t('Battlelog con fame distinta', ctx._gdsComprobadaDia_('Battlelog', 'Fame distinta') === '');
t('Battlelog con backup contradicho', ctx._gdsComprobadaDia_('Battlelog', 'Coincide; Backup contradicho por JSON') === '');
for (const fu of ['Battlelog parcial', 'Contradicción battlelog', 'Único', 'Posible', 'Imposible', 'Sin dato', 'Varios días', ''])
  t('sin battlelog exacto no se comprueba: ' + fu, ctx._gdsComprobadaDia_(fu, 'Coincide') === '');

// F3: fila ancha
const H = ctx.GDS_HEADERS, col = {}; H.forEach((h, i) => col[h] = i);
const dia = (fuente, consistencia) => ({ valores: { duelo250: 1, duelo100: 0, pvp200: 0, pvp100: 0, barco125: 0, barco75: 0, sinFame: 0 }, ataques: 1, barcos: 0, fame: 250, fuente, combinaciones: '', consistencia, diaGuerra: '05/09/2026', periodIndex: 3, origen: 'Original', ataquesAcum: 1, barcosAcum: 0, fameAcum: 250, cobertura: { estado: 'completa', archivo: 'a.json', descargaMs: null, inicioMs: null } });
const fila = ctx._gdsFilaSemana_({ temporada: '22', semana: '1', clanTag: '#A', clan: 'C', tag: '#T', nombre: 'N' }, [dia('Battlelog', 'Coincide'), dia('Único', ''), null, dia('Battlelog', 'Fame distinta')]);
t('largo de fila', fila.length === H.length);
t('J comprobado', fila[col['J Comprobada']] === B);
t('V (sin battlelog) vacío', fila[col['V Comprobada']] === '');
t('S sin fila vacío', fila[col['S Comprobada']] === '');
t('D con fame distinta vacío', fila[col['D Comprobada']] === '');
t('las columnas anteriores no se movieron (J Duelo 250 sigue en 7, D BattlelogDesde en 99)', col['J Duelo 250'] === 7 && col['D BattlelogDesde'] === 99);

// F4: índice y aviso
const enc = (rows) => rows.map(r => r.join(','));
const head = ['Temporada', 'Semana', 'ClanTag', 'Tag', 'J Comprobada', 'V Comprobada', 'S Comprobada', 'D Comprobada'];
const parsed = [head, ['22', '1', '#A', '#T', B, '', '', B], ['22', '1', '#B', '#T', '', '', '', ''], ['22', '2', '#A', 't', '', B, '', ''], ['23', '1', '#a', '#T', B, B, B, B]];
const ind = ctx._gdsIndiceComprobadas_(parsed);
t('el índice solo guarda filas con algún día comprobado', Object.keys(ind).length === 3);
t('tag sin # y minúsculas se normaliza', !!ind['22|2|#T|#A']);
const r1 = ctx._gdsDiasComprobadosTocados_(ind, 22, 1, '#T', '#A', 0, 3);
t('semana completa: J y D', r1.length === 2 && r1[0].dia === 'J' && r1[1].dia === 'D' && r1[0].estado === B);
t('hasta el viernes: solo J', ctx._gdsDiasComprobadosTocados_(ind, 22, 1, '#T', '#A', 0, 1).length === 1);
t('solo el sábado: nada', ctx._gdsDiasComprobadosTocados_(ind, 22, 1, '#T', '#A', 2, 2).length === 0);
t('otro clan sin comprobados: nada', ctx._gdsDiasComprobadosTocados_(ind, 22, 1, '#T', '#B', 0, 3).length === 0);
t('sin clanTag se miran todos los clanes', ctx._gdsDiasComprobadosTocados_(ind, 22, 1, '#T', '', 0, 3).length === 2);
t('otra semana, otro jugador: nada', ctx._gdsDiasComprobadosTocados_(ind, 22, 5, '#T', '', 0, 3).length === 0 && ctx._gdsDiasComprobadosTocados_(ind, 22, 1, '#X', '', 0, 3).length === 0);
t('índice nulo: nada', ctx._gdsDiasComprobadosTocados_(null, 22, 1, '#T', '', 0, 3).length === 0);
t('CSV viejo sin columnas Comprobada: {}', Object.keys(ctx._gdsIndiceComprobadas_([['Temporada', 'Semana', 'ClanTag', 'Tag'], ['1', '1', '#A', '#T']])).length === 0);
t('CSV vacío o nulo: {}', Object.keys(ctx._gdsIndiceComprobadas_([])).length === 0 && Object.keys(ctx._gdsIndiceComprobadas_(null)).length === 0);

// Con los datos reales: construir filas y comprobar que la columna coincide con FuenteDesglose + ConsistenciaValores
const dir = path.join(raiz, 'Datos descargados/CSV');
const hojas = path.join(dir, 'Hojas/Backup_Guerra.csv');
if (fs.existsSync(hojas)) {
  const g = ctx._parseCSV(fs.readFileSync(hojas, 'utf8'));
  const filas = []; for (let i = 1; i < g.length; i++) { const f = g[i].slice(0, ctx.GUERRA_TOTAL_COLS); while (f.length < ctx.GUERRA_TOTAL_COLS) f.push(''); filas.push(f); }
  const bl = path.join(dir, 'Jugador/Backup_Battlelogs.csv');
  const porTag = {};
  if (fs.existsSync(bl)) { const b = ctx._parseCSV(fs.readFileSync(bl, 'utf8')); for (let i = 1; i < b.length; i++) { const tg = ctx._blgNormalizarTag_(b[i][ctx.BLG_COL.TAG]); if (!tg) continue; (porTag[tg] = porTag[tg] || []).push(b[i]); } }
  t('datos reales: se cargó el battlelog', Object.keys(porTag).length > 0);
  const r = ctx._gdsConstruirFilas_(filas, { ternaTags: ctx.CFG.TERNA_TAGS.slice(), tagPorNombre: {}, battlelogPorTag: porTag, capturasPorTag: {} });
  let n = 0, comp = 0, incoherentes = 0;
  for (const f of r.filas) for (const d of ['J', 'V', 'S', 'D']) {
    n++; const v = f[col[d + ' Comprobada']];
    const esperado = (f[col[d + ' FuenteDesglose']] === 'Battlelog' && f[col[d + ' ConsistenciaValores']] === 'Coincide') ? B : '';
    if (v === B) comp++;
    if (v !== esperado) incoherentes++;
  }
  t('datos reales: la columna sigue a FuenteDesglose y ConsistenciaValores en todos los días', incoherentes === 0);
  t('datos reales: cuenta.comprobadas coincide con las celdas llenas (' + comp + ')', r.cuenta.comprobadas === comp);
  t('datos reales: todas las filas tienen 104 columnas', r.filas.every(f => f.length === 104));
  console.log('filas: ' + r.filas.length + ' | días (4 por fila): ' + n + ' | comprobados «' + B + '»: ' + comp);
  // ida y vuelta por CSV y por el índice de F4
  const csv = ctx._encodeCSV([H].concat(r.filas.map((f, i) => { const c = f.slice(); c[0] = i + 1; return c; })));
  const idx = ctx._gdsIndiceComprobadas_(ctx._parseCSV(csv));
  t('datos reales: el índice de F4 trae tantas semanas como filas con algún día comprobado', Object.keys(idx).length === r.filas.filter(f => ['J', 'V', 'S', 'D'].some(d => f[col[d + ' Comprobada']])).length);
} else console.log('(sin Backup_Guerra.csv en Datos descargados: se omiten las pruebas con datos reales)');
console.log(ok + ' ok, ' + fail + ' fallas');
process.exit(fail ? 1 : 0);
