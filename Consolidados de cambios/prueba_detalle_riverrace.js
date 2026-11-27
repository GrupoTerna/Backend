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

// 5) Informe de defensas, API contra web (_defensasInformeFuentes_, §PF585 punto 13). Valores reales de Grupo乂Terna™ y la famila royal, temporada 39, semana 2 y 3.
const encApi = ['Temporada', 'Semana', 'Día', 'Clan', 'Tag', 'PointsEarned', 'ProgressStartOfDay', 'ProgressEndOfDay', 'EndOfDayRank', 'ProgressEarned', 'NumOfDefensesRemaining', 'ProgressEarnedFromDefenses', 'Estado'];
const ra = (t, s, d, clan, tag, pts, ini, fin, rango, puesto, n, p, estado) => [t, s, d, clan, tag, pts, ini, fin, rango, puesto, n, p, estado];
const encWeb = CDL_ENCABEZADOS.slice();
const rw = (t, s, d, tag, clan, puesto, fame, premioPuesto, premioDef, n, total) => [t, s, d, tag, clan, puesto, fame, premioPuesto, premioDef, n, total, 'x'];
const apiOk = [encApi,
  ra(39, 2, 'J', 'Grupo乂Terna™', '#GCRG8L00', 32050, 0, 3435, 0, 3000, 15, 435, 'Leído'),
  ra(39, 2, 'V', 'Grupo乂Terna™', '#GCRG8L00', 26250, 3435, 4358, 3, 600, 13, 323, 'Leído'),
  ra(39, 3, 'D', 'Grupo乂Terna™', '#GCRG8L00', 0, 10034, 10034, -1, 0, 0, 0, 'Leído'),            // ya cruzó: -1 en la API y 0 en la web
  ra(39, 3, 'D', 'la famila royal', '#YQUUCQQ0', 27150, 0, 1365, 2, 1000, 13, 365, 'Leído'),
  ra(39, 4, 'D', 'Rival', '#AAA', 5000, 0, 0, 0, 0, '', '', 'Estimado')];                           // domingo provisional: sin defensas
const webOk = [encWeb,
  rw(39, 2, 'J', '#GCRG8L00', 'Grupo乂Terna™', 1, 32050, 3000, 435, 15, 3435),
  rw(39, 2, 'V', '#GCRG8L00', 'Grupo乂Terna™', 4, 26250, 600, 323, 13, 923),
  rw(39, 3, 'D', '#GCRG8L00', 'Grupo乂Terna™', 0, 0, 0, 0, 0, 0),
  rw(39, 3, 'D', '#YQUUCQQ0', 'la famila royal', 3, 27150, 1000, 365, 13, 1365)];
let inf = _defensasInformeFuentes_(apiOk, webOk);
assert.strictEqual(inf.ok, true);
assert.deepStrictEqual([inf.api.filas, inf.api.validos, inf.api.invalidos, inf.api.vacios, inf.api.provisionales], [5, 4, 0, 1, 1]);
assert.deepStrictEqual([inf.web.filas, inf.web.validos, inf.web.invalidos, inf.web.totalesNoSuman], [4, 4, 0, 0]);
assert.deepStrictEqual([inf.cruce.comparables, inf.cruce.coinciden, inf.cruce.difieren, inf.cruce.sinFilaApi, inf.cruce.apiSinDato], [4, 4, 0, 0, 0]);
assert.deepStrictEqual(inf.identidad, { cumple: 4, tope: 0, falla: 0 }, 'las 4 filas leídas cumplen; la provisional «Estimado» no se mira');
assert.deepStrictEqual(inf.detalle, [], 'sin diferencias no hay líneas de detalle');
// Un clan que ya cruzó (avance 10000 al inicio y al fin, 0 de premios) cumple la identidad; el que llega a 10000 con premios de más queda como tope
const apiTope2 = [encApi, ra(39, 3, 'D', 'X', '#GCRG8L00', 0, 9000, 10000, -1, 600, 0, 0, 'Leído')];
assert.deepStrictEqual(_defensasInformeFuentes_(apiTope2, [encWeb]).identidad, { cumple: 0, tope: 1, falla: 0 }, 'avance topado en 10000');
const apiFalla = [encApi, ra(39, 3, 'S', 'X', '#GCRG8L00', 0, 1000, 5000, 1, 600, 14, 376, 'Leído')];
const fa = _defensasInformeFuentes_(apiFalla, [encWeb]);
assert.deepStrictEqual(fa.identidad, { cumple: 0, tope: 0, falla: 1 }); assert.ok(/Identidad del avance, T39 S3 S X/.test(fa.detalle[0]));
// Diferencias entre fuentes: se cuentan por campo y se listan; la API no se corrige
const webMal = [encWeb, rw(39, 2, 'J', '#GCRG8L00', 'Grupo乂Terna™', 2, 32000, 1800, 376, 14, 2176)];
inf = _defensasInformeFuentes_(apiOk, webMal);
assert.deepStrictEqual([inf.cruce.comparables, inf.cruce.coinciden, inf.cruce.difieren], [1, 0, 1]);
assert.deepStrictEqual(inf.diferencias, { defensas: 1, premioDefensas: 1, fama: 1, premioPuesto: 1, puesto: 1 });
assert.ok(inf.detalle.some(l => /^Difieren, T39 S2 J Grupo乂Terna™ \(#GCRG8L00\): defensas \(API 15, web 14\)/.test(l)));
// Pares incoherentes en cada fuente, total de la web que no suma, fila sin API y API provisional o sin dato
const apiMala = [encApi, ra(39, 2, 'J', 'A', '#AAA', 100, 0, 1, 0, 600, 14, 380, 'Leído')];
assert.deepStrictEqual([_defensasInformeFuentes_(apiMala, [encWeb]).api.invalidos, _defensasInformeFuentes_(apiMala, [encWeb]).api.validos], [1, 0]);
const webMala = [encWeb, rw(39, 2, 'J', '#BBB', 'B', 3, 100, 1000, 330, 13, 1330), rw(39, 2, 'V', '#CCC', 'C', 3, 100, 1000, 276, 12, 9999), rw(39, 4, 'D', '#AAA', 'A', 1, 1, 1, 1, 1, 2)];
inf = _defensasInformeFuentes_([encApi, ra(39, 4, 'D', 'A', '#AAA', 1, 0, 0, 0, 0, '', '', 'Estimado')], webMala);
assert.deepStrictEqual([inf.web.invalidos, inf.web.totalesNoSuman, inf.cruce.sinFilaApi, inf.cruce.apiSinDato, inf.cruce.comparables], [2, 1, 2, 1, 0]);
// La comparación no depende de mayúsculas del Tag ni de espacios, ni de un BOM en el encabezado
const encBom = encWeb.slice(); encBom[0] = '\uFEFF' + encBom[0];
assert.strictEqual(_defensasInformeFuentes_(apiOk, [encBom, rw(' 39', '2 ', 'j', '#gcrg8l00 ', 'x', 1, 32050, 3000, 435, 15, 3435)]).cruce.coinciden, 1);
// Faltan columnas: no se inventa nada
const sinCol = _defensasInformeFuentes_([['Temporada']], webOk); assert.strictEqual(sinCol.ok, false); assert.ok(/Faltan columnas/.test(sinCol.error));
assert.strictEqual(_defensasInformeFuentes_(null, null).ok, false);
// El detalle se limita a 20 líneas y se cuenta lo que no se lista
const muchasW = [encWeb].concat(Array.from({ length: 25 }, (_, i) => rw(39, 1, 'J', '#M' + i, 'M', 1, 1, 3000, 330, 14, 3330)));
const lim = _defensasInformeFuentes_([encApi], muchasW); assert.strictEqual(lim.detalle.length, 20); assert.strictEqual(lim.detalleOmitido, 5);
assert.strictEqual(_defensasNumero_(''), null); assert.strictEqual(_defensasNumero_(' 12 '), 12); assert.strictEqual(_defensasNumero_('x'), null); assert.strictEqual(_defensasNumero_(null), null);

// 6) Avisos del cruce de la meta (_defensasAnomaliasCruce_, §PF585 punto 14). Valores reales de Grupo乂Terna™, T39 semana 3: cruza el sábado (10000) y el domingo queda en 0 y -1.
const encCr = ['Temporada', 'Semana', 'Día', 'Clan', 'Tag', 'PointsEarned', 'ProgressStartOfDay', 'ProgressEndOfDay', 'EndOfDayRank', 'ProgressEarned', 'NumOfDefensesRemaining', 'ProgressEarnedFromDefenses', 'Estado'];
const rc = (s, d, pts, ini, fin, rango, pue, n, p, estado = 'Leído', tag = '#GCRG8L00') => [39, s, d, 'Grupo乂Terna™', tag, pts, ini, fin, rango, pue, n, p, estado];
const real = [encCr, rc(3, 'J', 31050, 0, 3435, 0, 3000, 15, 435), rc(3, 'V', 31750, 3435, 6758, 0, 3000, 13, 323), rc(3, 'S', 31350, 6758, 10000, 0, 3000, 12, 276), rc(3, 'D', 0, 10034, 10034, -1, 0, 0, 0)];
let cr = _defensasAnomaliasCruce_(real);
assert.deepStrictEqual([cr.ok, cr.series, cr.cruces, cr.posteriores, cr.domingosEn0, cr.domingosEn0SinCruce], [true, 1, 1, 0, 1, 0], 'el caso real no da ninguna anomalía');
assert.deepStrictEqual(cr.detalle, []);
// Actividad después del cruce: el domingo trae puntos y defensas
cr = _defensasAnomaliasCruce_([encCr, ...real.slice(1, 4), rc(3, 'D', 500, 10000, 10000, 2, 600, 12, 276)]);
assert.strictEqual(cr.posteriores, 1); assert.ok(/^Después del cruce, T39 S3 Grupo乂Terna™ \(#GCRG8L00\) D: puntos 500/.test(cr.detalle[0])); assert.strictEqual(cr.domingosEn0, 0);
// Un puesto distinto de -1 después del cruce también cuenta, aunque lo demás esté en 0
assert.strictEqual(_defensasAnomaliasCruce_([encCr, ...real.slice(1, 4), rc(3, 'D', 0, 10000, 10000, 1, 0, 0, 0)]).posteriores, 1);
// Domingo en 0 sin ningún día que llegue a 10000: sospecha de captura a medias
cr = _defensasAnomaliasCruce_([encCr, rc(2, 'J', 30000, 0, 3000, 0, 3000, 15, 435), rc(2, 'D', 0, 3000, 3000, -1, 0, 0, 0)]);
assert.deepStrictEqual([cr.cruces, cr.domingosEn0, cr.domingosEn0SinCruce], [0, 1, 1]); assert.ok(/^Domingo en 0 sin cruce que lo explique, T39 S2/.test(cr.detalle[0]));
// Un domingo con el avance propio en 10000 o más (aunque falten los días previos del log) lo explica un cruce real
cr = _defensasAnomaliasCruce_([encCr, rc(1, 'D', 0, 10208, 10208, -1, 0, 0, 0, 'Leído', '#Q02LPPQV')]);
assert.deepStrictEqual([cr.cruces, cr.domingosEn0, cr.domingosEn0SinCruce], [1, 1, 0]);
// El día «Estimado» no se mira, un clan que no cruza no tiene anomalías y las series se separan por Tag y semana
cr = _defensasAnomaliasCruce_([encCr, ...real.slice(1, 4), rc(3, 'D', 500, 10000, 10000, 2, 600, 12, 276, 'Estimado'), rc(3, 'J', 100, 0, 100, 3, 400, 15, 435, 'Leído', '#OTRO'), rc(3, 'V', 100, 100, 200, 3, 400, 15, 435, 'Leído', '#OTRO')]);
assert.deepStrictEqual([cr.series, cr.cruces, cr.posteriores, cr.domingosEn0], [2, 1, 0, 0]);
// Días fuera de J a D, filas vacías y valores faltantes no rompen; faltan columnas: se avisa
assert.strictEqual(_defensasAnomaliasCruce_([encCr, null, ['', ''], rc(3, 'L', 1, 0, 1, 1, 1, 1, 1)]).series, 0);
const sc = _defensasAnomaliasCruce_([['Temporada']]); assert.strictEqual(sc.ok, false); assert.ok(/Faltan columnas/.test(sc.error)); assert.strictEqual(_defensasAnomaliasCruce_(null).ok, false);
// El detalle se limita a 10 líneas
const muchos = [encCr]; for (let i = 0; i < 12; i++) muchos.push(rc(2, 'J', 1, 0, 1, 0, 0, 0, 0, 'Leído', '#X' + i), rc(2, 'D', 0, 1, 1, -1, 0, 0, 0, 'Leído', '#X' + i));
cr = _defensasAnomaliasCruce_(muchos); assert.strictEqual(cr.domingosEn0SinCruce, 12); assert.strictEqual(cr.detalle.length, 10);

console.log('OK: prueba_detalle_riverrace');
