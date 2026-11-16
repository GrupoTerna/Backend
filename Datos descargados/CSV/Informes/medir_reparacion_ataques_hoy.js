// Medición (solo lectura) de _calcularReparacionAtaquesHoy_ (17_GuerraSheet.gs) sobre Backup_Guerra.csv: qué marca hoy y qué cambiaría.
// Sirve para decidir el punto (4) de §PF160 (¿se conserva o se retira?). No escribe nada. Uso (desde esta carpeta): node medir_reparacion_ataques_hoy.js
const fs = require('fs');
const path = require('path');
const srcGS = fs.readFileSync(path.join(__dirname, '../../../Base/src/17_GuerraSheet.gs'), 'utf8');
const srcCfg = fs.readFileSync(path.join(__dirname, '../../../Base/src/01_Config_Global.gs'), 'utf8');
function extraer(src, nombre) {
  const i = src.indexOf('function ' + nombre + '(');
  let d = 0; const j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) {
    if (src[k] == '{') d++;
    else if (src[k] == '}') { d--; if (!d) return src.slice(i, k + 1); }
  }
}
const gcBloque = srcGS.match(/var GC = \{[\s\S]*?\n\};/)[0];
const code = gcBloque + '\n' + extraer(srcCfg, 'esDiaGuerraIdx') + '\n' + extraer(srcGS, '_origenGuerraEs_') + '\n' +
  extraer(srcGS, '_calcularReparacionAtaquesHoy_') + '\nreturn {calc:_calcularReparacionAtaquesHoy_,GC:GC};';
const M = new Function(code)();
const GC = M.GC;
function parse(t) { const rows = []; let r = [], c = '', q = false; for (let i = 0; i < t.length; i++) { const ch = t[i]; if (q) { if (ch == '"') { if (t[i + 1] == '"') { c += '"'; i++ } else q = false } else c += ch } else if (ch == '"') q = true; else if (ch == ',') { r.push(c); c = '' } else if (ch == '\n') { r.push(c.replace(/\r$/, '')); rows.push(r); r = []; c = '' } else c += ch } if (c || r.length) { r.push(c); rows.push(r) } return rows }
const filas = parse(fs.readFileSync(path.join(__dirname, '../Hojas/Backup_Guerra.csv'), 'utf8').replace(/^﻿/, ''));
filas.shift();
const res = M.calc(filas);
const iH = GC.ATAQUES_HOY - 1, iS = GC.ATAQUES_SEM - 1, iO = GC.ORIGEN - 1;
const motivos = {};
res.sinResolver.forEach(x => { motivos[x.motivo] = (motivos[x.motivo] || 0) + 1; });
// Para cada cambio propuesto: ¿la baja deja a esa fila coherente con la fórmula (AtaquesSemana − AtaquesHoy de la fila siguiente = acumulado previo)?
let cambiosCoherentes = 0, cambiosIncoherentes = 0;
const porClave = new Map();
filas.forEach((f, i) => { const k = [f[GC.TAG - 1], f[GC.CLAN - 1], f[GC.TEMPORADA - 1], f[GC.SEMANA - 1]].join('|'); if (!porClave.has(k)) porClave.set(k, []); porClave.get(k).push(i); });
const ej = [];
res.cambios.forEach(c => {
  const f = filas[c.idx];
  const k = [f[GC.TAG - 1], f[GC.CLAN - 1], f[GC.TEMPORADA - 1], f[GC.SEMANA - 1]].join('|');
  const grupo = porClave.get(k).filter(i => esDia(filas[i])).sort((a, b) => Number(filas[a][GC.PERIOD_IDX - 1]) - Number(filas[b][GC.PERIOD_IDX - 1]));
  const pos = grupo.indexOf(c.idx);
  const sig = grupo[pos + 1];
  let coh = null;
  if (sig !== undefined && Number(filas[sig][GC.PERIOD_IDX - 1]) === Number(f[GC.PERIOD_IDX - 1]) + 1) {
    const inicioSig = Number(filas[sig][iS]) - Number(filas[sig][iH]);   // acumulado al cierre de este día según la fórmula
    const antes = pos > 0 ? Number(filas[grupo[pos - 1]][iS]) : 0;
    coh = (inicioSig - antes) === c.nuevo ? 'nuevo=fórmula' : ((inicioSig - antes) === c.anterior ? 'anterior=fórmula' : 'ninguno');
  }
  if (coh === 'nuevo=fórmula') cambiosCoherentes++; else if (coh) cambiosIncoherentes++;
  if (ej.length < 10) ej.push(k + ' pIdx=' + f[GC.PERIOD_IDX - 1] + ' origen=' + f[iO] + ' AtaquesHoy ' + c.anterior + ' -> ' + c.nuevo + ' (suma ' + c.sumaAntes + ', total ' + c.total + ') fórmula: ' + coh);
});
function esDia(f) { const p = Number(f[GC.PERIOD_IDX - 1]); return !isNaN(p) && (p % 7) >= 3; }
console.log({ filas: filas.length, gruposConExceso: res.gruposConExceso, cambiosPropuestos: res.cambios.length, sinResolver: res.sinResolver.length, motivosSinResolver: motivos, cambiosQueLaFormulaConfirma: cambiosCoherentes, cambiosQueLaFormulaNoConfirma: cambiosIncoherentes });
console.log(ej.join('\n'));
