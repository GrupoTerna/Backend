// Prueba del cierre del domingo con la captura del lunes (Base/src/60_Control_Medallas_API.gs, §PF584, hueco del domingo): _cmaCierreSemana_ y _cmaFilasDeCierre_.
// Uso, desde la raíz del repo: node "Consolidados de cambios/prueba_control_medallas_cierre.js"
// Comprueba casos sintéticos, que el lunes, martes y miércoles caen en la misma clave y no reescriben, que con las filas de J, V y S la parte 3 pasa de
// `respaldo` a `cuadra`, y recorre las capturas reales de Datos descargados/JSON/Endpoints/CurrentRiverRace/. Sale con código 1 si algo falla.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'Base', 'src', '60_Control_Medallas_API.gs'), 'utf8'));
const raiz = path.join(__dirname, '..', 'Datos descargados', 'JSON', 'Endpoints', 'CurrentRiverRace');
function* walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) yield* walk(p); else if (e.name.endsWith('.json')) yield p; } }

// 1) Sintético: lunes de la semana 1 (sectionIndex 1, periodIndex 7); la semana cerrada es la 0 (días 3 a 6)
const log = (d, a, b) => ({ periodIndex: d, items: [{ clan: { tag: '#AAA' }, pointsEarned: a }, { clan: { tag: '#BBB' }, pointsEarned: b }] });
const lunes = { periodType: 'training', periodIndex: 7, sectionIndex: 1,
  clans: [{ tag: '#AAA', name: 'Uno', participants: [] }, { tag: '#bbb', name: 'Rival', participants: [] }],
  periodLogs: [log(3, 500, 400), log(4, 700, 500), log(5, 650, 450), log(6, 900, 600)] };
const c = _cmaCierreSemana_(lunes);
assert.strictEqual(c.length, 2);
assert.strictEqual(c[0].estado, 'cierre'); assert.strictEqual(c[0].sumaPointsEarned, 2750); assert.strictEqual(c[0].diasConDato, 4);
assert.strictEqual(c[0].sectionIndex, 0, 'la semana cerrada es la anterior a la de la captura'); assert.strictEqual(c[0].periodIndex, 7);
const filas = _cmaFilasDeCierre_(c, 3, ['#aaa'], '2026-11-30 05:00:00');
assert.strictEqual(filas.length, 2); assert.strictEqual(filas[0].length, CMA_ENCABEZADOS.length);
assert.strictEqual(filas[0][3], 'L'); assert.strictEqual(filas[0][6], 'Terna'); assert.strictEqual(filas[1][6], 'Rival');
assert.strictEqual(filas[0][15], 'J:500|V:700|S:650|D:900'); assert.strictEqual(filas[0][14], 'cierre');
assert.strictEqual(filas[0][8], ''); assert.strictEqual(filas[0][9], ''); assert.strictEqual(filas[0][13], '');

// No aplica: guerra, coliseo, primera semana de la temporada, o periodIndex fuera de lunes a miércoles
for (const t of ['warDay', 'colosseum']) assert.strictEqual(_cmaCierreSemana_(Object.assign({}, lunes, { periodType: t })).length, 0);
assert.strictEqual(_cmaCierreSemana_(Object.assign({}, lunes, { periodIndex: 2, sectionIndex: 0 })).length, 0, 'sectionIndex 0: no hay semana anterior');
assert.strictEqual(_cmaCierreSemana_(Object.assign({}, lunes, { periodIndex: 10 })).length, 0, 'jueves no es entrenamiento');
assert.strictEqual(_cmaCierreSemana_(null).length, 0);
// Falta un día: no se inventa
const incompleto = Object.assign({}, lunes, { periodLogs: [log(3, 500, 400), log(4, 700, 500), log(6, 900, 600)] });
const ci = _cmaCierreSemana_(incompleto); assert.strictEqual(ci[0].estado, 'sin dato'); assert.strictEqual(ci[0].diasConDato, 3);

// 2) Lunes, martes y miércoles: misma clave, y la segunda captura no reescribe
const guardada = _cmaMezclarFilas_([], filas).filas.map(f => f.map(String));
for (const pi of [8, 9]) {
  const otra = _cmaFilasDeCierre_(_cmaCierreSemana_(Object.assign({}, lunes, { periodIndex: pi })), 3, ['#aaa'], '2026-12-01 05:00:00');
  assert.strictEqual(otra[0][2], 7, 'la clave usa el periodIndex del lunes');
  const m = _cmaMezclarFilas_(guardada, otra); assert.strictEqual(m.nuevas + m.actualizadas, 0, 'martes y miércoles no deben reescribir');
}
// El lunes salió incompleto y el martes completo: la fila se completa
const guardadaInc = _cmaMezclarFilas_([], _cmaFilasDeCierre_(ci, 3, ['#aaa'], 'x')).filas.map(f => f.map(String));
let m = _cmaMezclarFilas_(guardadaInc, filas); assert.strictEqual(m.actualizadas, 2);
// ...y uno incompleto no pisa a uno completo
m = _cmaMezclarFilas_(guardada, _cmaFilasDeCierre_(ci, 3, ['#aaa'], 'x')); assert.strictEqual(m.actualizadas, 0);

// 3) De punta a punta: J, V y S de los días de guerra + el cierre del lunes -> la parte 3 pasa de `respaldo` a `cuadra`
const guerra = { periodType: 'warDay', periodIndex: 5, sectionIndex: 0, clans: [{ tag: '#AAA', name: 'Uno', periodPoints: 0, participants: [{ fame: 1850 }] }],
  periodLogs: [log(3, 500, 400), log(4, 700, 500)] };
const filasGuerra = _cmaFilasDeControl_(_cmaControlClanes_(guerra), 3, ['#aaa'], 'x');
const web = [{ clanNombre: 'Uno', temporada: 3, semana: 1, sumaFame: 2750, ataques: 100, jugadores: 40, filasPerfil: 0 }];
const sinCierre = _cmaFilasRespaldoWeb_(web, { Uno: '#AAA' }, _cmaDiasApiPorSemana_([CMA_ENCABEZADOS].concat(filasGuerra.map(f => f.map(String)))), 'x');
assert.strictEqual(sinCierre.filas[0][11], 'respaldo', 'sin el cierre, el domingo es respaldo');
const todas = [CMA_ENCABEZADOS].concat(filasGuerra, filas).map(f => f.map(String));
const conCierre = _cmaFilasRespaldoWeb_(web, { Uno: '#AAA' }, _cmaDiasApiPorSemana_(todas), 'x');
assert.strictEqual(conCierre.filas[0][11], 'cuadra', 'con el cierre, la web solo comprueba'); assert.strictEqual(conCierre.filas[0][8], 4);
const web2 = [Object.assign({}, web[0], { sumaFame: 2800 })];
assert.strictEqual(_cmaFilasRespaldoWeb_(web2, { Uno: '#AAA' }, _cmaDiasApiPorSemana_(todas), 'x').filas[0][11], 'difiere');

// 4) Todas las capturas reales
let capturas = 0, entrenamiento = 0, conCierreReal = 0, sinDato = 0, aplica = 0, noAplica = 0; const claves = new Set(); const sinDatoLista = [];
for (const f of walk(raiz)) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8')); capturas++;
  const cs = _cmaCierreSemana_(j);
  if (j.periodType === 'training') {
    entrenamiento++;
    if (cs.length) aplica++; else noAplica++;
  } else assert.strictEqual(cs.length, 0, 'solo el entrenamiento aporta cierre: ' + f);
  const fl = _cmaFilasDeCierre_(cs, 0, [], 'x');
  for (const r of fl) {
    assert.strictEqual(r.length, CMA_ENCABEZADOS.length); claves.add(r[5] + '|' + r[2]);
    if (r[14] === 'cierre') conCierreReal++; else { sinDato++; sinDatoLista.push(path.basename(f).slice(0, 60) + ' ' + r[4]); }
  }
  const dos = _cmaMezclarFilas_(_cmaMezclarFilas_([], fl).filas, fl); assert.strictEqual(dos.nuevas + dos.actualizadas, 0);
}
console.log('OK:', capturas, 'capturas;', entrenamiento, 'de entrenamiento (' + aplica + ' con cierre posible, ' + noAplica + ' sin semana anterior);', conCierreReal, 'filas `cierre` (4 días),', sinDato, 'filas `sin dato`,', claves.size, 'claves distintas (clan, lunes).');
if (sinDatoLista.length) console.log('Sin dato (primeras 8):', sinDatoLista.slice(0, 8));
