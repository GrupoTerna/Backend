// Prueba del registro por clan y día de la página River Race (`Detail`; Base/src/60_Control_Medallas_API.gs, §PF584 punto 15): _cdlFilasClanes_ y _cdlMezclarFilas_.
// Uso, desde la raíz del repo: node "Consolidados de cambios/prueba_detalle_riverrace.js"
// Usa valores reales del HTML que dio la usuaria (25-nov-2026, temporada 39, semanas 1 a 3). Comprueba el formato de las filas, que se omite lo que no trae dato y lo de semana
// futura, la clave, que un 0 no pisa una fama ya guardada y que repetir una lectura no reescribe. También confirma con los puntos de defensa reales cuántas defensas caen y en qué orden.
// Sale con código 1 si algo falla.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'Base', 'src', '60_Control_Medallas_API.gs'), 'utf8'));

const c = (clanTag, clan, semana, dia, puesto, premioPuesto, fameDia, premioDefensas, defensasEnPie, total) => ({ clanTag, clan, semana, dia, puesto, premioPuesto, fameDia, premioDefensas, defensasEnPie, total });
const terna = [c('#GCRG8L00', 'Grupo乂Terna™', 1, 1, 1, 3000, 30750, 435, 15, 3435), c('#GCRG8L00', 'Grupo乂Terna™', 1, 2, 4, 600, 26300, 323, 13, 923),
  c('#GCRG8L00', 'Grupo乂Terna™', 1, 3, 4, 600, 27700, 233, 11, 833), c('#GCRG8L00', 'Grupo乂Terna™', 1, 4, 1, 3000, 31500, 192, 10, 3192)];
const vacio = c('#GCRG8L00', 'Grupo乂Terna™', 3, 4, 0, 0, 0, 0, 0, 0);          // el domingo de la semana 3, todavía sin dato en la web
const adulti = c('#P2UUVJCY', 'Adulti ITALIA', 1, 1, 3, 1000, 28100, 376, 14, 1376);

// 1) Formato
const f = _cdlFilasClanes_([...terna, vacio, adulti, c('', 'x', 1, 1, 1, 1, 1, 1, 1, 1), c('#AAA', 'x', 1, 5, 1, 1, 1, 1, 1, 1), c('#AAA', 'x', 0, 1, 1, 1, 1, 1, 1, 1),
  c('#AAA', 'x', 4, 1, 1, 400, 20000, 0, 0, 400), c('#AAA', 'x', 1, 1, 'z', 1, 1, 1, 1, 1), null], 39, 3, '2026-11-25 20:00:00');
assert.strictEqual(f.filas.length, 5, '4 de Terna y 1 de Adulti');
assert.strictEqual(f.sinDato, 1, 'el domingo sin dato'); assert.strictEqual(f.futuras, 1, 'la semana 4 todavía no existe'); assert.strictEqual(f.omitidos, 5);
f.filas.forEach(r => assert.strictEqual(r.length, CDL_ENCABEZADOS.length));
assert.deepStrictEqual(f.filas[0], [39, 1, 'J', '#GCRG8L00', 'Grupo乂Terna™', 1, 30750, 3000, 435, 15, 3435, '2026-11-25 20:00:00']);
assert.deepStrictEqual(f.filas[3].slice(2, 3).concat(f.filas[3].slice(6, 7)), ['D', 31500]);
assert.strictEqual(f.filas[4][3], '#P2UUVJCY');
assert.strictEqual(_cdlFilasClanes_([terna[0]], 39, null, 'x').filas.length, 1, 'sin semana máxima no se descarta nada por futura');
assert.strictEqual(_cdlFilasClanes_(null, 39, 3, 'x').filas.length, 0);
// El tag sin # se normaliza
assert.strictEqual(_cdlFilasClanes_([c('gcrg8l00', 'T', 1, 1, 1, 3000, 1, 435, 15, 3435)], 39, 3, 'x').filas[0][3], '#GCRG8L00');

// 2) Mezcla
let m = _cdlMezclarFilas_([], f.filas);
assert.strictEqual(m.ok, true); assert.strictEqual(m.nuevas, 5); assert.strictEqual(m.filas.length, 6);
const guardada = m.filas.map(r => r.map(String));
const igual = _cdlMezclarFilas_(guardada, _cdlFilasClanes_([...terna, adulti], 39, 3, '2026-11-26 09:00:00').filas);
assert.strictEqual(igual.nuevas + igual.actualizadas, 0, 'la misma lectura más tarde no reescribe (Capturado no cuenta)');
// Un día que la web dejó en 0 no pisa la fama guardada, pero un valor distinto de 0 sí la corrige
const en0 = Object.assign({}, terna[0], { puesto: 0, premioPuesto: 0, fameDia: 0, total: 435 });
assert.strictEqual(_cdlMezclarFilas_(guardada, [[39, 1, 'J', '#GCRG8L00', 'Grupo乂Terna™', 0, 0, 0, 435, 15, 435, 'x']]).actualizadas, 0, 'un 0 no pisa una fama ya guardada');
const corr = _cdlMezclarFilas_(guardada, _cdlFilasClanes_([Object.assign({}, terna[0], { fameDia: 30800 })], 39, 3, 'x').filas);
assert.strictEqual(corr.actualizadas, 1); assert.strictEqual(String(corr.filas.find(r => r[3] === '#GCRG8L00' && r[2] === 'J')[6]), '30800');
// Un día que estaba sin guardar (fila nueva) entra; otra semana, otro clan y otra temporada son otras filas
assert.strictEqual(_cdlMezclarFilas_(guardada, _cdlFilasClanes_([c('#GCRG8L00', 'T', 2, 1, 1, 3000, 32050, 435, 15, 3435)], 39, 3, 'x').filas).nuevas, 1);
assert.strictEqual(_cdlMezclarFilas_(guardada, _cdlFilasClanes_([terna[0]], 40, 3, 'x').filas).nuevas, 1, 'otra temporada');
assert.strictEqual(_cdlMezclarFilas_([['A', 'B']], f.filas).ok, false, 'encabezado distinto: no se toca');

// 3) Los puntos de defensa reales (dato de la usuaria): 59, 53, 47, 43, 41, 37, 31, 29, 23, 19, 17, 13, 11, 7, 5 suman 435 (las 15 en pie)
const P = [59, 53, 47, 43, 41, 37, 31, 29, 23, 19, 17, 13, 11, 7, 5];
assert.strictEqual(P.reduce((a, b) => a + b, 0), 435);
// En los valores reales de Grupo Terna (435/15, 323/13, 233/11, 192/10) lo que queda en pie es siempre lo de menos puntos: las más altas caen primero
for (const r of terna) assert.strictEqual(r.premioDefensas, P.slice(15 - r.defensasEnPie).reduce((a, b) => a + b, 0), r.clan + ' d' + r.dia);
// 4) Validación de defensas (§PF585): _defensasEvaluarPar_ y _defensasTablaSumas_
assert.deepStrictEqual(DEF_PUNTOS_PUESTO, P, 'la constante es la lista de la usuaria');
// La tabla de sumas coincide con la fuerza bruta (todas las combinaciones de 15 puestos: 32768)
const bruta = Array.from({ length: 16 }, () => new Set());
for (let m = 0; m < (1 << 15); m++) { let n = 0, sum = 0; for (let i = 0; i < 15; i++) if (m & (1 << i)) { n++; sum += P[i]; } bruta[n].add(sum); }
const tabla = _defensasTablaSumas_();
for (let n = 0; n <= 15; n++) assert.deepStrictEqual(Object.keys(tabla[n]).map(Number).sort((a, b) => a - b), [...bruta[n]].sort((a, b) => a - b), 'n=' + n);
// Casos de los datos reales y límites
for (const [n, pts] of [[15, 435], [14, 376], [14, 424], [14, 428], [13, 323], [13, 365], [11, 233], [10, 192], [0, 0], [2, 112], [1, 59]]) assert.strictEqual(_defensasEvaluarPar_(n, pts).valido, true, n + ' (' + pts + ')');
let e = _defensasEvaluarPar_(14, 377); assert.deepStrictEqual([e.valido, e.min, e.max, e.motivo], [false, 376, 430, 'no es suma de n puestos distintos']);
assert.strictEqual(_defensasEvaluarPar_(14, 435).motivo, 'fuera de rango'); assert.strictEqual(_defensasEvaluarPar_(14, 375).motivo, 'fuera de rango');
assert.strictEqual(_defensasEvaluarPar_(0, 5).valido, false); assert.strictEqual(_defensasEvaluarPar_(15, 434).valido, false);
assert.strictEqual(_defensasEvaluarPar_(16, 435).motivo, 'cantidad fuera de 0 a 15'); assert.strictEqual(_defensasEvaluarPar_(-1, 0).motivo, 'cantidad fuera de 0 a 15');
assert.strictEqual(_defensasEvaluarPar_(null, 435).motivo, 'sin dato'); assert.strictEqual(_defensasEvaluarPar_(14, '').motivo, 'sin dato'); assert.strictEqual(_defensasEvaluarPar_(undefined, undefined).motivo, 'sin dato');
assert.strictEqual(_defensasEvaluarPar_('x', 1).motivo, 'no numérico'); assert.strictEqual(_defensasEvaluarPar_(1.5, 59).motivo, 'no numérico');
assert.strictEqual(_defensasEvaluarPar_('14', '376').valido, true, 'acepta números como texto (vienen de un CSV)');
// En _cdlFilasClanes_: los datos reales no dan incoherencias; una fila mala se cuenta pero SE GUARDA igual
const sin = _cdlFilasClanes_([...terna, vacio, adulti], 39, 3, 'x'); assert.strictEqual(sin.incoherentes, 0); assert.deepStrictEqual(sin.incoherentesDetalle, []);
const mala = _cdlFilasClanes_([terna[0], c('#GCRG8L00', 'Grupo乂Terna™', 1, 2, 4, 600, 26300, 330, 13, 930)], 39, 3, 'x');
assert.strictEqual(mala.filas.length, 2, 'la incoherente no se descarta'); assert.strictEqual(mala.incoherentes, 1);
assert.strictEqual(mala.incoherentesDetalle[0], '#GCRG8L00 S1 V: 330 (13) no es suma de n puestos distintos');
const muchas = _cdlFilasClanes_(Array.from({ length: 8 }, (_, i) => c('#GCRG8L00', 'T', 1, 1 + (i % 4), 1, 3000, 1000 + i, 434, 14, 3434 + i)).map((x, i) => Object.assign(x, { semana: 1 + Math.floor(i / 4) })), 39, 9, 'x');
assert.strictEqual(muchas.incoherentes, 8); assert.strictEqual(muchas.incoherentesDetalle.length, 5, 'el detalle se limita a 5');

console.log('OK: prueba_detalle_riverrace');
