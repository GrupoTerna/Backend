// Prueba de las funciones puras de la parte 4 (opción A) del control de medallas (Base/src/60_Control_Medallas_API.gs, §PF584): _cmaMedallasDiaHoja_, _cmaFilasMedallasDia_ y _cmaMezclarFilasDia_.
// Uso, desde la raíz del repo: node "Consolidados de cambios/prueba_control_medallas_dia.js"
// Con Backup_Guerra.csv real de Datos descargados/CSV/Hojas/ comprueba que la suma de los días es igual a lo acumulado por los jugadores y que mezclar dos veces lo mismo no cambia nada.
// Como la carpeta no trae Control_Medallas_API.csv, usa de API de prueba la columna PointsEarned de Backup_Guerra_Logs.csv (que es de la hoja, no de la API): solo sirve para ver que las filas salen completas.
// Sale con código 1 si algo falla.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'Base', 'src', '60_Control_Medallas_API.gs'), 'utf8'));
const hojas = path.join(__dirname, '..', 'Datos descargados', 'CSV', 'Hojas');
function parseCSV(t) {   // mínimo: comillas dobles y saltos de línea dentro de comillas
  t = t.replace(/^\uFEFF/, ''); const filas = []; let f = [], c = '', q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { f.push(c); c = ''; }
    else if (ch === '\n') { f.push(c); filas.push(f); f = []; c = ''; } else if (ch !== '\r') c += ch; }
  if (c !== '' || f.length) { f.push(c); filas.push(f); } return filas;
}
const ENC = ['Temporada', 'Semana', 'Día', 'Etapa', 'Clan', 'Tag', 'Fame', 'Clan_Tag'];
const fila = (t, s, d, e, clan, tag, fame, ct) => [t, s, d, e, clan, tag, fame, ct];

// 1) Sintético
const sint = [ENC,
  fila(39, 2, 'J', 'Guerra', 'Uno', '#P1', 600, '#AAA'), fila(39, 2, 'V', 'Guerra', 'Uno', '#P1', 1100, '#AAA'), fila(39, 2, 'S', 'Guerra', 'Uno', '#P1', 1100, '#AAA'), fila(39, 2, 'D', 'Guerra', 'Uno', '#P1', 1600, '#AAA'),
  fila(39, 2, 'J', 'Guerra', 'Uno', '#P2', 500, '#AAA'), /* falta V */ fila(39, 2, 'S', 'Guerra', 'Uno', '#P2', 1200, '#AAA'),   // hueco: el delta de V cae en S
  fila(39, 2, 'J', 'Guerra', 'Uno', '#P3', 400, '#AAA'), fila(39, 2, 'V', 'Guerra', 'Uno', '#P3', 300, '#AAA'),                  // baja: anomalía
  fila(39, 2, 'J', 'Entrenamiento', 'Uno', '#P4', 999, '#AAA'),                                                                  // no es guerra
  fila(39, 2, 'M', 'Guerra', 'Uno', '#P4', 999, '#AAA'),                                                                         // día que no es J, V, S ni D
  fila(39, 2, 'J', 'Guerra', 'Uno', '#P5', 100, ''),                                                                              // sin Clan_Tag
  fila(39, 2, 'J', 'Guerra', 'Rival', '#P6', 700, '#RRR')];
const h = _cmaMedallasDiaHoja_(sint);
const g = h['#AAA|39|2'];
assert.deepStrictEqual(g.dias, [600 + 500 + 400, 500 + 0 + 0, 0 + 700 + 0, 500], 'J=1500, V=500 (P1; P2 sin fila; P3 baja a 0), S=700 (P2), D=500 (P1)');
assert.strictEqual(g.jugadores, 3); assert.strictEqual(g.diasSinFila, 1); assert.strictEqual(g.anomalias, 1); assert.strictEqual(g.nombre, 'Uno');
assert.ok(h['#RRR|39|2'], 'los rivales se calculan, pero no salen en las filas (solo Terna)');
assert.strictEqual(Object.keys(_cmaMedallasDiaHoja_([ENC])).length, 0);
assert.strictEqual(Object.keys(_cmaMedallasDiaHoja_([['x']])).length, 0, 'encabezado sin las columnas esperadas');

const api = { '#AAA|39|2': { J: 1500, V: 600 } };           // la API aún no tiene S ni D
const filas = _cmaFilasMedallasDia_(h, api, ['#aaa'], '2026-11-30 05:00:00');
assert.strictEqual(filas.length, 4); filas.forEach(r => assert.strictEqual(r.length, CMD_ENCABEZADOS.length));
assert.deepStrictEqual(filas.map(r => r[8]), ['cuadra', 'difiere', 'sin dato api', 'sin dato api']);
assert.strictEqual(filas[1][7], -100);                      // 500 - 600
assert.ok(filas.every(r => r[4] === '#AAA'), 'solo clanes Terna');

// 2) Mezclar
let m = _cmaMezclarFilasDia_([], filas); assert.ok(m.ok); assert.strictEqual(m.nuevas, 4); assert.deepStrictEqual(m.filas[0], CMD_ENCABEZADOS);
const guardado = m.filas.map(f => f.map(String));
const otra = filas.map(f => f.slice()); otra.forEach(r => { r[12] = '2026-12-07 05:00:00'; });
m = _cmaMezclarFilasDia_(guardado, otra); assert.strictEqual(m.nuevas + m.actualizadas, 0, 'solo cambia Capturado: no se reescribe');
const conD = _cmaFilasMedallasDia_(h, { '#AAA|39|2': { J: 1500, V: 600, S: 700, D: 500 } }, ['#aaa'], 'x');
m = _cmaMezclarFilasDia_(guardado, conD); assert.strictEqual(m.actualizadas, 2, 'S y D pasan de «sin dato api» a «cuadra»'); assert.strictEqual(m.nuevas, 0);
assert.deepStrictEqual(conD.map(r => r[8]), ['cuadra', 'difiere', 'cuadra', 'cuadra']);
assert.strictEqual(_cmaMezclarFilasDia_([['otra', 'cosa']], filas).ok, false);

// 3) Datos reales
const backup = parseCSV(fs.readFileSync(path.join(hojas, 'Backup_Guerra.csv'), 'utf8'));
const hr = _cmaMedallasDiaHoja_(backup);
const claves = Object.keys(hr);
assert.ok(claves.length > 50, 'hay grupos de clan y semana');
// invariante: sin anomalías, Σ de los 4 días = Σ de la fame final de cada jugador (la acumulada no se pierde)
const enc = backup[0]; const ix = n => enc.indexOf(n);
const maxPorSerie = {};
for (let i = 1; i < backup.length; i++) { const f = backup[i]; if (f[ix('Etapa')] !== 'Guerra' || 'JVSD'.indexOf(f[ix('Día')]) < 0 || !f[ix('Clan_Tag')]) continue;
  const k = f[ix('Clan_Tag')].toUpperCase() + '|' + Number(f[ix('Temporada')]) + '|' + Number(f[ix('Semana')]) + '|' + f[ix('Tag')].toUpperCase();
  maxPorSerie[k] = Math.max(maxPorSerie[k] || 0, Number(f[ix('Fame')]) || 0); }
const sumaMax = {}; for (const k in maxPorSerie) { const c = k.split('|').slice(0, 3).join('|'); sumaMax[c] = (sumaMax[c] || 0) + maxPorSerie[k]; }
let sinAnomalia = 0;
for (const c of claves) { const x = hr[c]; if (x.anomalias) continue; sinAnomalia++; assert.strictEqual(x.dias.reduce((a, b) => a + b, 0), sumaMax[c], 'invariante en ' + c); x.dias.forEach(v => assert.ok(v >= 0)); }
const ternaReal = ['#GCRG8L00', '#GYCU9YRG', '#GQQPPJGR'];
const filasReal = _cmaFilasMedallasDia_(hr, {}, ternaReal, 'x');
assert.ok(filasReal.length > 0); assert.ok(filasReal.every(r => r[8] === 'sin dato api'));
const dosVeces = _cmaMezclarFilasDia_(_cmaMezclarFilasDia_([], filasReal).filas.map(f => f.map(String)), filasReal); assert.strictEqual(dosVeces.nuevas + dosVeces.actualizadas, 0);

// 4) Con una «API» de prueba (PointsEarned de la hoja de logs): solo para ver que las filas salen completas y qué tan lejos queda cada día
const logs = parseCSV(fs.readFileSync(path.join(hojas, 'Backup_Guerra_Logs.csv'), 'utf8')); const le = logs[0]; const li = n => le.indexOf(n);
const apiProxy = {};
for (let i = 1; i < logs.length; i++) { const f = logs[i]; const l = f[li('Día')]; if ('JVSD'.indexOf(l) < 0) continue;
  const k = f[li('Tag')].toUpperCase() + '|' + Number(f[li('Temporada')]) + '|' + Number(f[li('Semana')]); (apiProxy[k] = apiProxy[k] || {})[l] = Number(f[li('PointsEarned')]) || 0; }
const fp = _cmaFilasMedallasDia_(hr, apiProxy, ternaReal, 'x');
const cnt = {}; fp.forEach(r => { cnt[r[8]] = (cnt[r[8]] || 0) + 1; });
const ej = hr['#GCRG8L00|38|2'];
console.log('OK:', claves.length, 'grupos clan-semana en la hoja (' + sinAnomalia + ' sin anomalías, todos con el invariante);', filasReal.length, 'filas de clanes Terna;', 'con API de prueba:', JSON.stringify(cnt));
if (ej) console.log('Ejemplo T38 S2 Grupo乂Terna™ (medallas de la hoja por día J, V, S, D):', ej.dias.join(', '), '| jugadores', ej.jugadores, '| días sin fila', ej.diasSinFila);
