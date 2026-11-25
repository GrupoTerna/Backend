// Prueba de las funciones puras de la parte 2 del control de medallas (Base/src/60_Control_Medallas_API.gs, §PF584): _cmaFilasDeControl_ y _cmaMezclarFilas_.
// Uso, desde la raíz del repo: node "Consolidados de cambios/prueba_control_medallas_guardado.js"
// Con las capturas reales de Datos descargados/JSON/Endpoints/CurrentRiverRace/ comprueba que las filas salen completas, que mezclar dos veces lo mismo no
// cambia nada y que una fila con menos días con dato no pisa a una más completa. Sale con código 1 si algo falla.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'Base', 'src', '60_Control_Medallas_API.gs'), 'utf8'));
const raiz = path.join(__dirname, '..', 'Datos descargados', 'JSON', 'Endpoints', 'CurrentRiverRace');
function* walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) yield* walk(p); else if (e.name.endsWith('.json')) yield p; } }

// 1) Casos sintéticos
const rr = { periodType: 'warDay', periodIndex: 5, sectionIndex: 0,
  clans: [
    { tag: '#AAA', name: 'Uno', periodPoints: 100, fame: 1300, participants: [{ fame: 700 }, { fame: 600 }] },
    { tag: '#BBB', name: 'Rival', periodPoints: 0, fame: 950, participants: [{ fame: 950 }] }],
  periodLogs: [{ periodIndex: 3, items: [{ clan: { tag: '#AAA' }, pointsEarned: 500 }, { clan: { tag: '#BBB' }, pointsEarned: 400 }] },
               { periodIndex: 4, items: [{ clan: { tag: '#AAA' }, pointsEarned: 700 }, { clan: { tag: '#BBB' }, pointsEarned: 500 }] }] };
const ctl = _cmaControlClanes_(rr);
const filas = _cmaFilasDeControl_(ctl, 3, ['#aaa'], '2026-11-24 10:00:00');
assert.strictEqual(filas.length, 2);
assert.strictEqual(filas[0].length, CMA_ENCABEZADOS.length);
assert.strictEqual(filas[0][6], 'Terna'); assert.strictEqual(filas[1][6], 'Rival');
assert.strictEqual(filas[0][3], 'S');                 // periodIndex 5 = sábado
assert.strictEqual(filas[0][15], 'J:500|V:700');
assert.strictEqual(filas[0][14], 'cuadra');           // 1300 - 100 - 1200 = 0
assert.strictEqual(filas[1][14], 'difiere');          // 950 - 0 - 900 = 50
assert.strictEqual(filas[1][13], 50);

// entrenamiento y coliseo no se guardan
assert.strictEqual(_cmaFilasDeControl_(_cmaControlClanes_({ periodType: 'training', periodIndex: 2, sectionIndex: 0, clans: rr.clans }), 3, [], 'x').length, 0);
assert.strictEqual(_cmaFilasDeControl_(_cmaControlClanes_({ periodType: 'colosseum', periodIndex: 5, sectionIndex: 0, clans: rr.clans }), 3, [], 'x').length, 0);

// 2) Mezclar: archivo nuevo, repetir, cambio, y fila con menos días con dato
let m = _cmaMezclarFilas_([], filas);
assert.ok(m.ok); assert.strictEqual(m.nuevas, 2); assert.strictEqual(m.filas.length, 3);
assert.deepStrictEqual(m.filas[0], CMA_ENCABEZADOS);
const guardado = m.filas.map(f => f.map(String));   // lo que vuelve de _parseCSV: todo texto
const otra = filas.map(f => f.slice()); otra[0][16] = '2026-11-24 11:00:00';   // solo cambia Capturado
m = _cmaMezclarFilas_(guardado, otra);
assert.strictEqual(m.nuevas + m.actualizadas, 0, 'una corrida que no cambia nada no debe reescribir');
const cambiada = filas.map(f => f.slice()); cambiada[1][10] = 1000; cambiada[1][13] = -50; cambiada[1][14] = 'difiere';
m = _cmaMezclarFilas_(guardado, cambiada); assert.strictEqual(m.actualizadas, 1);
const menos = filas.map(f => f.slice()); menos[0][12] = 1; menos[0][14] = 'sin dato'; menos[0][13] = '';
m = _cmaMezclarFilas_(guardado, menos); assert.strictEqual(m.actualizadas, 0, 'menos días con dato no pisa a una fila más completa');
const mas = filas.map(f => f.slice()); mas[0][12] = 3; mas[0][14] = 'difiere';
m = _cmaMezclarFilas_(guardado, mas); assert.strictEqual(m.actualizadas, 1);
// encabezado distinto: no se toca
const ajeno = [['otra', 'cosa']]; m = _cmaMezclarFilas_(ajeno, filas); assert.strictEqual(m.ok, false);

// 3) Todas las capturas reales
let capturas = 0, filasTotal = 0, difieren = 0; const claves = new Set();
for (const f of walk(raiz)) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8')); capturas++;
  const fs2 = _cmaFilasDeControl_(_cmaControlClanes_(j), 0, [], 'x');
  for (const r of fs2) { assert.strictEqual(r.length, CMA_ENCABEZADOS.length); filasTotal++; if (r[14] === 'difiere') difieren++; claves.add(r[5] + '|' + r[0] + '|' + r[2]); }
  const dos = _cmaMezclarFilas_(_cmaMezclarFilas_([], fs2).filas, fs2); assert.strictEqual(dos.nuevas + dos.actualizadas, 0);
}
console.log('OK:', capturas, 'capturas,', filasTotal, 'filas de control,', difieren, 'difieren,', claves.size, 'claves distintas (clan, temporada, día).');
