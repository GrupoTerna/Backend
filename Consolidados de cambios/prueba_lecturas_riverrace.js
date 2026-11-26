// Prueba de las lecturas de la página River Race de RoyaleAPI (Base/src/60_Control_Medallas_API.gs, §PF584 punto 13): _clrFilasLectura_ y _clrMezclarFilas_.
// Uso, desde la raíz del repo: node "Consolidados de cambios/prueba_lecturas_riverrace.js"
// Comprueba el formato de las filas (activos y ex-miembros), que un envío sin `exMiembro` (Tampermonkey viejo) deja la columna vacía, la clave y la regla de no pisar con
// una lectura más temprana, y que repetir una lectura no reescribe. Sale con código 1 si algo falla.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'Base', 'src', '60_Control_Medallas_API.gs'), 'utf8'));

const act = { tag: '#9cjy8ru20', nombre: '', nombreWeb: 'ZupeRey', rol: 'Member', exMiembro: false, clan: 'Grupo Terna', clanTag: 'gcrg8l00', decksHoy: 4, ataquesSemana: 12, fameSemana: 2250, barcosSemana: 0 };
const ex  = { tag: '#2JRUP89PU', nombreWeb: 'Combatiente', rol: '--', exMiembro: true, clan: 'Grupo Terna', clanTag: '#GCRG8L00', decksHoy: 2, ataquesSemana: 6, fameSemana: 800, barcosSemana: 1 };
const viejo = { tag: '#AAA', clan: 'Otro', clanTag: '#GYCU9YRG', decksHoy: 0, fameSemana: 100, barcosSemana: 0 };   // sin exMiembro ni rol (script anterior a v3.41)

// 1) Formato
const f = _clrFilasLectura_([act, ex, viejo, { tag: '', fameSemana: 5 }, { tag: '#BBB', fameSemana: 'x' }, null], 39, 3, 1, '2026-11-26 20:00:00');
assert.strictEqual(f.filas.length, 3); assert.strictEqual(f.omitidos, 3); assert.strictEqual(f.exMiembros, 1);
f.filas.forEach(r => assert.strictEqual(r.length, CLR_ENCABEZADOS.length));
assert.deepStrictEqual(f.filas[0], [39, 3, 'V', 'Grupo Terna', '#GCRG8L00', '#9CJY8RU20', 'ZupeRey', 'Member', 'No', 4, 12, 2250, 0, '2026-11-26 20:00:00']);
assert.strictEqual(f.filas[1][6], 'Combatiente'); assert.strictEqual(f.filas[1][7], '', '«--» es sin rol'); assert.strictEqual(f.filas[1][8], 'Sí');
assert.strictEqual(f.filas[2][8], '', 'sin el campo, ExMiembro queda vacío y no «No»'); assert.strictEqual(f.filas[2][10], '', 'sin AtaquesSemana, queda vacío');
assert.strictEqual(_clrFilasLectura_([act], 39, 3, 4, 'x').filas.length, 0, 'offDia fuera de 0 a 3: no hay día de guerra');
assert.strictEqual(_clrFilasLectura_(null, 39, 3, 0, 'x').filas.length, 0);

// 2) Mezcla
let m = _clrMezclarFilas_([], f.filas);
assert.strictEqual(m.ok, true); assert.strictEqual(m.nuevas, 3); assert.strictEqual(m.filas.length, 4);
const guardada = m.filas.map(r => r.map(String));
assert.strictEqual(_clrMezclarFilas_(guardada, _clrFilasLectura_([act, ex, viejo], 39, 3, 1, '2026-11-26 21:00:00').filas).nuevas + 0, 0);
let r2 = _clrMezclarFilas_(guardada, _clrFilasLectura_([act, ex, viejo], 39, 3, 1, '2026-11-26 21:00:00').filas);
assert.strictEqual(r2.nuevas + r2.actualizadas, 0, 'la misma lectura más tarde no reescribe (Capturado no cuenta)');
// Una lectura más completa del mismo día reemplaza; una más temprana no pisa
const mas = Object.assign({}, ex, { fameSemana: 1000, ataquesSemana: 8, decksHoy: 4 });
let r3 = _clrMezclarFilas_(guardada, _clrFilasLectura_([mas], 39, 3, 1, '2026-11-26 23:00:00').filas);
assert.strictEqual(r3.actualizadas, 1); assert.strictEqual(String(r3.filas.find(r => r[5] === '#2JRUP89PU')[11]), '1000');
const menos = Object.assign({}, ex, { fameSemana: 500 });
let r4 = _clrMezclarFilas_(r3.filas.map(r => r.map(String)), _clrFilasLectura_([menos], 39, 3, 1, '2026-11-26 18:00:00').filas);
assert.strictEqual(r4.nuevas + r4.actualizadas, 0, 'una lectura con menos fama no pisa a la más completa');
// Otro día, otra semana u otro clan = otra fila
assert.strictEqual(_clrMezclarFilas_(guardada, _clrFilasLectura_([ex], 39, 3, 2, 'x').filas).nuevas, 1, 'otro día');
assert.strictEqual(_clrMezclarFilas_(guardada, _clrFilasLectura_([ex], 39, 4, 1, 'x').filas).nuevas, 1, 'otra semana');
assert.strictEqual(_clrMezclarFilas_(guardada, _clrFilasLectura_([Object.assign({}, ex, { clanTag: '#OTRO' })], 39, 3, 1, 'x').filas).nuevas, 1, 'otro clan');
// Encabezado distinto: no se toca
assert.strictEqual(_clrMezclarFilas_([['A', 'B']], f.filas).ok, false);

// 3) Ex-miembros en cero no se guardan; los activos en cero sí
const exCero = { tag: '#ZZZ', exMiembro: true, clanTag: '#GCRG8L00', decksHoy: 0, ataquesSemana: 0, fameSemana: 0, barcosSemana: 0 };
const actCero = Object.assign({}, exCero, { tag: '#YYY', exMiembro: false });
const fz = _clrFilasLectura_([exCero, actCero, ex], 39, 3, 0, 'x');
assert.strictEqual(fz.ceros, 1); assert.strictEqual(fz.filas.length, 2); assert.strictEqual(fz.exMiembros, 1);
assert.ok(fz.filas.some(r => r[5] === '#YYY'), 'el activo en cero se guarda');
assert.strictEqual(_clrFilasLectura_([Object.assign({}, exCero, { barcosSemana: 1 })], 39, 3, 0, 'x').filas.length, 1, 'con un solo barco ya no es cero');

// 4) Día de la página
assert.strictEqual(_clrDiaDePagina_([{ diaPagina: 3 }, { diaPagina: '3' }, {}]), 3);
assert.strictEqual(_clrDiaDePagina_([{ diaPagina: 3 }, { diaPagina: 5 }]), null, 'si no coinciden, no se confía');
assert.strictEqual(_clrDiaDePagina_([{}, { diaPagina: null }]), null);
assert.strictEqual(_clrDiaDePagina_([{ diaPagina: 9 }]), null); assert.strictEqual(_clrDiaDePagina_([{ diaPagina: 2.5 }]), null); assert.strictEqual(_clrDiaDePagina_(null), null);
let d = _clrResolverDia_(3, 1, false);
assert.strictEqual(d.offDia, null); assert.ok(d.motivo.indexOf('entrenamiento') >= 0, 'Day 3 = miércoles: no se guarda');
d = _clrResolverDia_(5, 1, false); assert.strictEqual(d.offDia, 1); assert.strictEqual(d.aviso, '', 'Day 5 = viernes (V), igual que el backend');
d = _clrResolverDia_(5, 0, false); assert.strictEqual(d.offDia, 1); assert.ok(d.aviso.indexOf('V') >= 0 && d.aviso.indexOf('J') >= 0, 'no coinciden: manda la página y se avisa');
d = _clrResolverDia_(4, 0, true); assert.strictEqual(d.offDia, 0, 'dentro de la ventana, si la página dice el día, se guarda');
d = _clrResolverDia_(7, NaN, false); assert.strictEqual(d.offDia, 3, 'Day 7 = domingo (D)');
d = _clrResolverDia_(null, 2, false); assert.strictEqual(d.offDia, 2); assert.strictEqual(d.fuente, 'backend');
d = _clrResolverDia_(null, 2, true); assert.strictEqual(d.offDia, null); assert.ok(d.motivo.indexOf('ventana') >= 0);
d = _clrResolverDia_(undefined, -1, false); assert.strictEqual(d.offDia, null); assert.strictEqual(d.motivo, 'no es día de guerra');
console.log('OK: prueba_lecturas_riverrace');
