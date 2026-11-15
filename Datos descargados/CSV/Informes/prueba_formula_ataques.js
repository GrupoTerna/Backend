// Prueba de la fórmula de ataques en _repartirSemanaConjunto_() (18_CorreccionGuerra.gs, §PF488). Uso (desde esta carpeta): node prueba_formula_ataques.js
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '../../../Base/src/18_CorreccionGuerra.gs'), 'utf8');
function extraer(nombre) {
  const i = src.indexOf('function ' + nombre + '(');
  let d = 0; const j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) {
    if (src[k] == '{') d++;
    else if (src[k] == '}') { d--; if (!d) return src.slice(i, k + 1); }
  }
}
const consts = src.match(/var FAME_[A-Z_]+ = [^;]+;|var FAME_DUELO_RESULTADOS = \[[\s\S]*?\];/g).join('\n');
const code = consts +
  '\nvar _FAME_CATALOGO_DIA_CACHE_=null;\nvar GC={NUM:1,FECHA:2,TEMPORADA:3,SEMANA:4,DIA:5,PERIOD_IDX:6,DIA_GUERRA:7,ETAPA:8,CLAN:9,TAG:10,NOMBRE:11,ATAQUES_HOY:12,ATAQUES_SEM:13,FAME:14,BARCOS:15,ORIGEN:20};' +
  '\nvar LOGS=[];var Logger={log(m){LOGS.push(m);}};var STUB={rng:null};' +
  '\nfunction _repartoRangosCrr_(){return STUB.rng;}\nfunction _repartoRestriccionesCrr_(){return null;}\n' +
  ['_fameDescomposicionesDia_', '_fameCatalogoDia_', '_repartirSemanaConjunto_', '_repartoAcumuladoPorFormula_'].map(extraer).join('\n') +
  '\nreturn {rep:_repartirSemanaConjunto_,cat:_fameCatalogoDia_,formula:_repartoAcumuladoPorFormula_,STUB:STUB,LOGS:LOGS};';
const M = new Function(code)();
let ok = 0, fail = 0;
function t(n, c) { c ? ok++ : (fail++, console.log('FALLA', n)); }
const mk = (h, s, f, b) => { const r = new Array(20).fill(''); r[11] = h; r[12] = s; r[13] = f; r[14] = b; return r; };
const cat = M.cat();

// ---- Regresión: los 8 casos de prueba_reparto_conjunto.js deben seguir igual ----
t('catalogo 77', cat.length === 77);
let filas = [mk(2, 2, 300, 0), mk(2, 4, 500, 0)];
let r = M.rep(filas, { 0: 0, 1: 1 }, { ataquesSemana: 4, fame: 500, barcos: 0 });
t('R1 ya bien sin cambio', r.ok && !r.huboCambio);
filas = [mk(4, 4, 1700, 0)];
r = M.rep(filas, { 3: 0 }, { ataquesSemana: 4, fame: 1700, barcos: 0 });
t('R2 sin combinacion no toca', !r.ok && filas[0][13] === 1700 && filas[0][11] === 4);
filas = [mk(0, 0, 0, 0), mk(0, 0, 0, 0), mk(0, 0, 0, 0), mk(0, 0, 0, 0)];
r = M.rep(filas, { 0: 0, 1: 1, 2: 2, 3: 3 }, { ataquesSemana: 16, fame: 3600, barcos: 0 });
t('R3 3600 en 4 dias', r.ok && filas.every(f => f[11] === 4) && filas[3][13] === 3600);
const antes = JSON.stringify(filas);
r = M.rep(filas, { 0: 0, 1: 1, 2: 2, 3: 3 }, { ataquesSemana: 16, fame: 3600, barcos: 0 });
t('R3b idempotente', r.ok && !r.huboCambio && JSON.stringify(filas) === antes);
filas = [mk(0, 0, 0, 0), mk(0, 0, 0, 0), mk(0, 0, 0, 0), mk(0, 0, 0, 0)];
r = M.rep(filas, { 0: 0, 1: 1, 2: 2, 3: 3 }, { ataquesSemana: 17, fame: 3000, barcos: 0 });
t('R4 17 ataques no', !r.ok);
filas = [mk(0, 0, 0, 0)]; r = M.rep(filas, { 3: 0 }, { ataquesSemana: 4, fame: 400, barcos: 4 });
t('R5 4 barcos 400', r.ok && filas[0][11] === 4 && filas[0][14] === 4 && filas[0][13] === 400);
filas = [mk(0, 0, 0, 0)]; r = M.rep(filas, { 3: 0 }, { ataquesSemana: 4, fame: 600, barcos: 4 }); t('R5b 4 barcos 600 no', !r.ok);
filas = [mk(2, 2, 200, 2)]; r = M.rep(filas, { 3: 0 }, { ataquesSemana: 2, fame: 200, barcos: null });
t('R6 barcos null', r.ok && filas[0][14] === 2);
filas = [mk(1, 1, 200, 1)]; r = M.rep(filas, { 3: 0 }, { ataquesSemana: 2, fame: 200, barcos: 2 });
t('R7 2 ataques 2 barcos 200', r.ok && filas[0][11] === 2 && filas[0][14] === 2);
filas = [mk(4, 4, 900, 0), mk(0, 4, 900, 0), mk(1, 5, 1100, 0)];
r = M.rep(filas, { 0: 0, 1: 1, 2: 2 }, { ataquesSemana: 5, fame: 1100, barcos: 0 });
t('R8 dias buenos intactos', r.ok && filas[0][11] === 4 && filas[0][13] === 900 && filas[2][11] === 1 && filas[2][13] === 1100);

// ---- Pares (jueves, viernes) del catálogo con 0 barcos y 4 ataques en total, agrupados por fame total ----
const pares = {};
for (const a of cat) for (const b of cat) {
  if (a.j !== 0 || b.j !== 0 || a.h + b.h !== 4) continue;
  const F = a.k + b.k;
  (pares[F] = pares[F] || []).push([a.h, b.h]);
}
const tiene = (F, h1) => (pares[F] || []).some(p => p[0] === h1);

// ---- N1: la fórmula decide entre dos repartos posibles ----
// Verdad: jueves 3, viernes 1. Fila del jueves atrasada (H=2, S=2). Fila del viernes: S=4, H=1 -> acumulado al inicio del viernes = 3.
let Fdisc = null;
for (const F of Object.keys(pares).map(Number)) if (tiene(F, 3) && tiene(F, 2)) { Fdisc = F; break; }
t('N0 existe una fame con repartos (3,1) y (2,2)', Fdisc !== null);
if (Fdisc !== null) {
  const mkF = () => [mk(2, 2, 0, 0), mk(1, 4, Fdisc, 0)];
  let f1 = mkF();
  M.LOGS.length = 0;
  r = M.rep(f1, { 0: 0, 1: 1 }, { ataquesSemana: 4, fame: Fdisc, barcos: 0 });
  t('N1 con fórmula: jueves 3 y viernes 1', r.ok && r.formula === 'aplicada' && f1[0][11] === 3 && f1[1][11] === 1 && f1[1][12] === 4 && f1[0][12] === 3);
  let f2 = mkF();
  const r2 = M.rep(f2, { 0: 0, 1: 1 }, { ataquesSemana: 4, fame: Fdisc, barcos: 0, sinFormulaAtaques: true });
  console.log('   (informativo) sin fórmula el reparto es jueves', f2[0][11], 'viernes', f2[1][11], '| con fórmula jueves', f1[0][11], 'viernes', f1[1][11], '| fame', Fdisc);
  t('N1b sin fórmula resuelve y no informa fórmula', r2.ok && r2.formula === 'sin datos');
}

// ---- N2: la fórmula contradice los totales -> se reparte como siempre y avisa ----
// Fila del viernes: S=2, H=1 -> el jueves tendría 1 ataque; hay una fame que solo admite (2,2) y no (1,3).
let Fsolo22 = null;
for (const F of Object.keys(pares).map(Number)) if (tiene(F, 2) && !tiene(F, 1)) { Fsolo22 = F; break; }
t('N2-0 existe una fame que solo admite jueves 2', Fsolo22 !== null);
if (Fsolo22 !== null) {
  const f3 = [mk(1, 1, 0, 0), mk(1, 2, Fsolo22, 0)];
  M.LOGS.length = 0;
  r = M.rep(f3, { 0: 0, 1: 1 }, { ataquesSemana: 4, fame: Fsolo22, barcos: 0 });
  t('N2 sin solución con fórmula: sigue resolviendo como antes', r.ok && r.formula === 'sin solucion' && f3[0][11] + f3[1][11] === 4 && f3[1][12] === 4);
  t('N2b deja aviso en el registro', M.LOGS.some(m => m.indexOf('fórmula de ataques') >= 0));
}

// ---- N3: casos donde la fórmula no se usa ----
const F31 = Fdisc !== null ? Fdisc : 0;
let fa = [mk(2, 2, 0, 0), mk(1, 4, 0, 0)];
r = M.rep(fa, { 1: 0, 2: 1 }, { ataquesSemana: 4, fame: 500, barcos: 0 });
t('N3a serie que no arranca el jueves: sin datos', r.formula === 'sin datos' || r.ok === false);
t('N3a helper devuelve null', M.formula([mk(2, 2, 0, 0), mk(1, 4, 0, 0)], { 1: 0, 2: 1 }, [1, 2], 4) === null);
t('N3b hueco (jueves y domingo): null', M.formula([mk(2, 2, 0, 0), mk(1, 4, 0, 0)], { 0: 0, 3: 1 }, [0, 3], 4) === null);
t('N3c un solo día: null', M.formula([mk(2, 2, 0, 0)], { 0: 0 }, [0], 4) === null);
t('N3d celdas vacías en la fila siguiente: null', M.formula([mk(2, 2, 0, 0), mk('', '', 0, 0)], { 0: 0, 1: 1 }, [0, 1], 4) === null);
t('N3e acumulado mayor que el total: null', M.formula([mk(2, 2, 0, 0), mk(0, 6, 0, 0)], { 0: 0, 1: 1 }, [0, 1], 4) === null);
t('N3f acumulado que baja: null', M.formula([mk(0, 0, 0, 0), mk(1, 3, 0, 0), mk(0, 1, 0, 0)], { 0: 0, 1: 1, 2: 2 }, [0, 1, 2], 4) === null);
t('N3g no entero: null', M.formula([mk(0, 0, 0, 0), mk(0.5, 2, 0, 0)], { 0: 0, 1: 1 }, [0, 1], 4) === null);
const g = M.formula([mk(0, 0, 0, 0), mk(1, 4, 0, 0), mk(1, 5, 0, 0)], { 0: 0, 1: 1, 2: 2 }, [0, 1, 2], 5);
t('N3h tres días: jueves 3, viernes 4, sábado sin dato', g && g[0].a[0] === 3 && g[1].a[0] === 4 && g[2] === null);
const g2 = M.formula([mk(0, 0, 0, 0), mk(1, 4, 0, 0), mk(0, 0, 0, 0)], { 0: 0, 1: 1, 3: 2 }, [0, 1, 3], 5);
t('N3i hueco entre viernes y domingo: solo el jueves', g2 && g2[0].a[0] === 3 && g2[1] === null && g2[2] === null);

// ---- N4: combinación con los rangos de CurrentRiverRace ----
if (Fdisc !== null) {
  const dias = [{ h: null, j: null, k: null }, { h: null, j: null, k: null }];
  M.STUB.rng = { etiqueta: 'prueba', estricto: false, dias: dias, acum: [{ a: [0, 4] }, { a: [4, 4] }] };
  let f4 = [mk(2, 2, 0, 0), mk(1, 4, Fdisc, 0)];
  r = M.rep(f4, { 0: 0, 1: 1 }, { ataquesSemana: 4, fame: Fdisc, barcos: 0 });
  t('N4a rangos + fórmula: jueves 3', r.ok && r.crr === 'rangos' && r.formula === 'aplicada' && f4[0][11] === 3 && f4[1][11] === 1);
  // rango del jueves incompatible con la fórmula (0 a 2): se usa solo el rango y se avisa
  M.STUB.rng = { etiqueta: 'prueba', estricto: false, dias: dias, acum: [{ a: [0, 2] }, { a: [4, 4] }] };
  M.LOGS.length = 0;
  f4 = [mk(2, 2, 0, 0), mk(1, 4, Fdisc, 0)];
  r = M.rep(f4, { 0: 0, 1: 1 }, { ataquesSemana: 4, fame: Fdisc, barcos: 0 });
  t('N4b rango contradice la fórmula: gana el rango, fórmula sin solución', r.ok && r.crr === 'rangos' && r.formula === 'sin solucion' && f4[0][11] <= 2);
  // rango estricto sin solución: sigue siendo conflicto aunque la fórmula exista
  M.STUB.rng = { etiqueta: 'prueba', estricto: true, dias: dias, acum: [{ a: [4, 4] }, { a: [0, 1] }] };
  f4 = [mk(2, 2, 0, 0), mk(1, 4, Fdisc, 0)];
  r = M.rep(f4, { 0: 0, 1: 1 }, { ataquesSemana: 4, fame: Fdisc, barcos: 0 });
  t('N4c rango estricto imposible: conflicto, no escribe', r.ok === false && r.crr === 'conflicto' && f4[0][11] === 2 && f4[1][11] === 1);
  M.STUB.rng = null;
}

// ---- N5: semana completa de 4 días ----
// Verdad: jue 4, vie 4, sáb 4, dom 4 (3600 de fame). Filas con H atrasados pero S-H exactos: vie (H=1,S=5), sáb (H=2,S=10), dom (H=1,S=13).
let f5 = [mk(0, 0, 0, 0), mk(1, 5, 0, 0), mk(2, 10, 0, 0), mk(1, 13, 0, 0)];
r = M.rep(f5, { 0: 0, 1: 1, 2: 2, 3: 3 }, { ataquesSemana: 16, fame: 3600, barcos: 0 });
t('N5 cuatro días: todos a 4 con fórmula', r.ok && r.formula === 'aplicada' && f5.every(f => f[11] === 4) && f5[3][12] === 16);
console.log('ok', ok, 'fallas', fail);
process.exit(fail ? 1 : 0);
