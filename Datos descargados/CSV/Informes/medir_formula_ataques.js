// Medición sobre Backup_Guerra.csv real: _repartirSemanaConjunto_ con y sin la fórmula de ataques (§PF488). Uso (desde esta carpeta): node medir_formula_ataques.js
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '../../../Base/src/18_CorreccionGuerra.gs'), 'utf8');
const srcGS = fs.readFileSync(require('path').join(__dirname, '../../../Base/src/17_GuerraSheet.gs'), 'utf8');
function extraer(nombre) {
  const i = src.indexOf('function ' + nombre + '(');
  let d = 0; const j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) {
    if (src[k] == '{') d++;
    else if (src[k] == '}') { d--; if (!d) return src.slice(i, k + 1); }
  }
}
const consts = src.match(/var FAME_[A-Z_]+ = [^;]+;|var FAME_DUELO_RESULTADOS = \[[\s\S]*?\];/g).join('\n');
const gcBloque = srcGS.match(/var GC = \{[\s\S]*?\n\};/)[0];
const code = consts + '\nvar _FAME_CATALOGO_DIA_CACHE_=null;\n' + gcBloque +
  '\nvar Logger={log(){}};\nfunction _repartoRangosCrr_(){return null;}\nfunction _repartoRestriccionesCrr_(){return null;}\n' +
  ['_fameDescomposicionesDia_', '_fameCatalogoDia_', '_repartirSemanaConjunto_', '_repartoAcumuladoPorFormula_', '_diagnosticoRangosPorDia_'].map(extraer).join('\n') +
  '\nreturn {rep:_repartirSemanaConjunto_,GC:GC};';
const M = new Function(code)();
const GC = M.GC;
function parse(t) { const rows = []; let r = [], c = '', q = false; for (let i = 0; i < t.length; i++) { const ch = t[i]; if (q) { if (ch == '"') { if (t[i + 1] == '"') { c += '"'; i++ } else q = false } else c += ch } else if (ch == '"') q = true; else if (ch == ',') { r.push(c); c = '' } else if (ch == '\n') { r.push(c.replace(/\r$/, '')); rows.push(r); r = []; c = '' } else c += ch } if (c || r.length) { r.push(c); rows.push(r) } return rows }
const R = parse(fs.readFileSync(require('path').join(__dirname, '../Hojas/Backup_Guerra.csv'), 'utf8').replace(/^﻿/, ''));
R.shift();
const OFF = { J: 0, V: 1, S: 2, D: 3 };
const g = new Map();
let filasGuerra = 0;
R.forEach(f => {
  if (f[GC.ETAPA - 1] !== 'Guerra') return;
  const off = OFF[f[GC.DIA - 1]];
  if (off === undefined) return;
  filasGuerra++;
  const k = [f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.CLAN - 1]].join('|');
  if (!g.has(k)) g.set(k, {});
  g.get(k)[off] = f;
});
const NUMCOLS = [GC.ATAQUES_HOY, GC.ATAQUES_SEM, GC.FAME, GC.BARCOS].map(x => x - 1);
const nums = f => f.map((v, i) => NUMCOLS.includes(i) ? (Number(v) || 0) : v);
const iH = GC.ATAQUES_HOY - 1, iS = GC.ATAQUES_SEM - 1, iF = GC.FAME - 1, iB = GC.BARCOS - 1;
let total = 0, aplicada = 0, sinSol = 0, sinDatos = 0, cambian = 0, okAntes = 0, okAhora = 0, pierde = 0, ganaSol = 0, violaciones = 0;
const ejemplos = [];
const sinSolucionEj = [];
for (const [k, m] of g) {
  total++;
  const offs = Object.keys(m).map(Number).sort((a, b) => a - b);
  const idx = {}; offs.forEach((o, i) => idx[o] = i);
  const mkFilas = () => offs.map(o => nums(m[o].slice()));
  const f0 = mkFilas(); const last = f0[f0.length - 1];
  const v = { ataquesSemana: last[iS], fame: last[iF], barcos: last[iB] };
  const fA = mkFilas(), fB = mkFilas();
  const rA = M.rep(fA, idx, v);                                  // con fórmula
  const rB = M.rep(fB, idx, Object.assign({}, v, { sinFormulaAtaques: true })); // como antes
  if (rB.ok) okAntes++;
  if (rA.ok) okAhora++;
  if (rB.ok && !rA.ok) pierde++;
  if (!rB.ok && rA.ok) ganaSol++;
  if (rA.formula === 'aplicada') aplicada++; else if (rA.formula === 'sin solucion') { sinSol++; sinSolucionEj.push(k + ' dias=' + offs); } else sinDatos++;
  if (rA.ok) { fA.forEach(x => { if (x[iH] > 4) violaciones++; }); const l2 = fA[fA.length - 1]; if (l2[iS] !== v.ataquesSemana || l2[iF] !== v.fame || l2[iB] !== v.barcos) violaciones++; }
  if (rA.ok && rB.ok && JSON.stringify(fA) !== JSON.stringify(fB)) {
    cambian++;
    if (ejemplos.length < 20) ejemplos.push(k + ' dias=' + offs + ' | antes AtaquesHoy=' + fB.map(x => x[iH]) + ' | con fórmula=' + fA.map(x => x[iH]) + ' | formula=' + rA.formula);
  }
}
console.log({ filasGuerra, series: total, okSinFormula: okAntes, okConFormula: okAhora, seriesConFormulaAplicada: aplicada, formulaSinSolucion: sinSol, formulaSinDatos: sinDatos, cambianDeResultado: cambian, pierdenSolucion: pierde, gananSolucion: ganaSol, violaciones });
console.log(ejemplos.join('\n'));
console.log('--- formula sin solucion ---');console.log(sinSolucionEj.join('\n'));
