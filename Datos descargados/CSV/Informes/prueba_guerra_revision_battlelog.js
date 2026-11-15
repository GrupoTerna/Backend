// Prueba (solo lectura) de §PF480: los días donde el battlelog contradice la hoja Guerra se anotan para Revision_Guerra.csv. Uso: node prueba_guerra_revision_battlelog.js
// Carga 01, 05, 06, 17 y 18 de Base/src en un contexto de node (Drive simulado en memoria) y usa los datos reales de «Datos descargados».
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '../../..');
const memoria = {};   // «Drive»: nombre -> texto
const ctx = vm.createContext({ console, Logger: { log() {} }, Utilities: { formatDate: () => '2026-11-15 12:00:00' }, SpreadsheetApp: {}, DriveApp: {}, PropertiesService: {}, CacheService: {}, LockService: {}, UrlFetchApp: {}, ScriptApp: {}, Session: { getScriptTimeZone: () => 'GMT-5' }, HtmlService: {}, ContentService: {} });
for (const f of ['01_Config_Global.gs', '05_Backup_CSV.gs', '06_Battlelogs_Siembra.gs', '17_GuerraSheet.gs', '18_CorreccionGuerra.gs']) vm.runInContext(fs.readFileSync(path.join(raiz, 'Base/src', f), 'utf8'), ctx, { filename: f });
vm.runInContext('_loadCSVFromDrive = function (n) { return __mem[n] || ""; }; _saveCSVToDrive = function (n, t) { __mem[n] = t; };', Object.assign(ctx, { __mem: memoria }));
let ok = 0, fail = 0;
function t(n, c) { c ? ok++ : (fail++, console.log('FALLA', n)); }

const g = ctx._parseCSV(fs.readFileSync(raiz + '/Datos descargados/CSV/Hojas/Backup_Guerra.csv', 'utf8'));
const filas = []; for (let i = 1; i < g.length; i++) { const f = g[i].slice(0, ctx.GUERRA_TOTAL_COLS); while (f.length < ctx.GUERRA_TOTAL_COLS) f.push(''); filas.push(f); }
const b = ctx._parseCSV(fs.readFileSync(raiz + '/Datos descargados/CSV/Jugador/Backup_Battlelogs.csv', 'utf8'));
const porTag = {}; for (let i = 1; i < b.length; i++) { const tg = ctx._blgNormalizarTag_(b[i][ctx.BLG_COL.TAG]); if (!tg) continue; (porTag[tg] = porTag[tg] || []).push(b[i]); }
const H = ctx.GDS_HEADERS, col = {}; H.forEach((h, i) => col[h] = i);
const opc = () => ({ ternaTags: ctx.CFG.TERNA_TAGS.slice(), tagPorNombre: {}, battlelogPorTag: porTag, capturasPorTag: {} });
const r = ctx._gdsConstruirFilas_(filas, opc());
t('construye con los datos reales', r.ok && Array.isArray(r.cuenta.revisiones));
console.log('  con los datos reales de hoy: ' + r.cuenta.revisiones.length + ' entrada(s) (las 7 contradicciones del 9-nov ya no están en Backup_Guerra.csv)');

// --- Escenario sintético: se toma un jugador-semana real con al menos 2 días con ataques y se simula el battlelog con _blgResumirBatallasJugador_.
let elegido = null;
for (const fw of r.filas) {
  const dias = ['J', 'V', 'S', 'D'].filter(d => typeof fw[col[d + ' Total']] === 'number' && fw[col[d + ' Total']] > 0);
  if (dias.length >= 2) { elegido = { fw, dias }; break; }
}
t('hay un jugador-semana con 2 días con ataques', !!elegido);
const tagEl = elegido.fw[col['Tag']], clanTagEl = elegido.fw[col['ClanTag']];
const [d1, d2] = elegido.dias;
const A1 = elegido.fw[col[d1 + ' Total']], A2 = elegido.fw[col[d2 + ' Total']];
const idxDia = { J: 0, V: 1, S: 2, D: 3 };
ctx.__orig = ctx._blgResumirBatallasJugador_;
ctx._blgResumirBatallasJugador_ = function (bat, tag) {
  const porDia = [0, 1, 2, 3].map(() => ctx._blgBucketVacio_());
  // d1: el log trae 3 mazos MÁS que los ataques de la hoja -> contradicción
  Object.assign(porDia[idxDia[d1]], { batallas: 1, mazosMin: A1 + 3, mazosMax: A1 + 3, pvp200: A1 + 3, desgloseExacto: true });
  // d2: log exacto con tantos mazos como ataques, todos PvP perdidos (100 c/u): la fame casi nunca coincide con la de la hoja
  Object.assign(porDia[idxDia[d2]], { batallas: 1, mazosMin: A2, mazosMax: A2, pvp100: A2, desgloseExacto: true });
  const por = {}; por[clanTagEl] = porDia;
  return { ok: true, porClanDia: por, ambiguas: [] };
};
ctx._blgDecidirAmbiguas_ = function () { return { ok: true, decisiones: [] }; };
const porTag2 = {}; porTag2[ctx._blgNormalizarTag_(tagEl)] = [['x']];   // basta con que exista alguna fila de battlelog del jugador
const rs = ctx._gdsConstruirFilas_(filas, Object.assign(opc(), { battlelogPorTag: porTag2 }));
t('construye con el battlelog simulado', rs.ok);
const mias = rs.cuenta.revisiones.filter(e => e.tag === tagEl && String(e.temporada) === String(elegido.fw[col['Temporada']]) && String(e.semana) === String(elegido.fw[col['Semana']]) && e.motivo.indexOf(clanTagEl) >= 0);   // el simulador vale para todas las semanas del jugador: se mira solo la elegida
const mas = mias.filter(e => /^Battlelog con más mazos/.test(e.motivo));
const otra = mias.filter(e => /^Battlelog con otra fame o barcos/.test(e.motivo));
t('el día con 3 mazos de más genera 1 «más mazos»', mas.length === 1 && mas[0].motivo.indexOf('día ' + d1) >= 0 && mas[0].detalle.indexOf('al menos ' + (A1 + 3) + ' mazo') >= 0 && mas[0].detalle.indexOf('tiene ' + A1 + ' ataque') >= 0);
const fameHoja = elegido.fw[col['Medallas ' + d2]], barcosHoja = elegido.fw[col['Barcos ' + d2]];
const distinta = (100 * A2 !== fameHoja) || (0 !== barcosHoja);
t('el día exacto con otra fame genera 1 «otra fame o barcos» (o ninguna si coincide por azar)', distinta ? (otra.length === 1 && otra[0].motivo.indexOf('día ' + d2) >= 0 && otra[0].detalle.indexOf('sería ' + 100 * A2) >= 0) : otra.length === 0);
t('las entradas del jugador son solo de esos dos días', mias.length === mas.length + otra.length && mias.length <= 2);
t('forma de cada entrada', mias.every(e => e.temporada !== '' && e.semana !== '' && /^#/.test(e.tag) && e.tipo === 'Contradicción' && e.estado === 'Pendiente' && e.detalle.length > 20 && /día [JVSD], clan #/.test(e.motivo)));
const rev = rs.cuenta.revisiones;
const claves = rev.map(e => [e.temporada, e.semana, e.tag, e.tipo, e.motivo].join('|'));
t('sin claves repetidas (el motivo lleva día y clan)', new Set(claves).size === claves.length);
console.log('  entradas del escenario: ' + mias.length + ' (más mazos ' + mas.length + ', otra fame o barcos ' + otra.length + ')');
ctx._blgResumirBatallasJugador_ = ctx.__orig;

// Registro con Drive simulado: primera corrida agrega, segunda no cambia nada, una entrada con detalle nuevo actualiza.
const r1 = ctx._registrarRevisionGuerra_(rev);
t('primera corrida: todas nuevas', r1.nuevas === rev.length && r1.actualizadas === 0);
const csv1 = memoria['Revision_Guerra.csv'];
const p1 = ctx._parseCSV(csv1);
t('el archivo tiene encabezado y una fila por entrada', p1.length === rev.length + 1 && p1[0].join() === ctx.REVISION_GUERRA_ENCABEZADO.join());
const r2 = ctx._registrarRevisionGuerra_(rev);
t('segunda corrida: nada cambia y no reescribe', r2.nuevas === 0 && r2.actualizadas === 0 && r2.sinCambio === rev.length && memoria['Revision_Guerra.csv'] === csv1);
if (rev.length) {
  const copia = rev.map(e => Object.assign({}, e)); copia[0].detalle += ' (distinto)';
  const r3 = ctx._registrarRevisionGuerra_(copia);
  t('un detalle distinto actualiza solo esa fila', r3.actualizadas === 1 && r3.nuevas === 0);
}
// Una fila ya existente de otro tipo no se toca.
memoria['Revision_Guerra.csv'] = ctx._encodeCSV([ctx.REVISION_GUERRA_ENCABEZADO, ['1', '2026-11-01 10:00:00', '24', '5', '#ZZZ', 'X', 'Otro', 'motivo previo', 'detalle previo', 'Resuelto']]);
const r4 = ctx._registrarRevisionGuerra_(rev);
const p4 = ctx._parseCSV(memoria['Revision_Guerra.csv']);
t('lo que ya había se conserva', p4[1][6] === 'Otro' && p4[1][9] === 'Resuelto' && p4.length === rev.length + 2);
console.log(fail ? 'FALLARON ' + fail + ' de ' + (ok + fail) : 'OK: ' + ok + ' comprobaciones');
process.exit(fail ? 1 : 0);
