// Medición (solo lectura) del criterio 13 de §PF160 con las capturas crudas de CurrentRiverRace/Capturas_Continuas (§PF426): qué trae la API alrededor del cambio de
// periodIndex (clanes enteros con 4 ataques y la fame del día anterior). No escribe nada. Uso (desde esta carpeta): node medir_criterio13_capturas.js
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '../../JSON/Endpoints/CurrentRiverRace/Capturas_Continuas');
const caps = [];
for (const f of fs.readdirSync(DIR)) {
  const m = f.match(/^Captura (\d{4}-\d{2}-\d{2}) (\d{2})\.(\d{2})\.(\d{2}) P\.I-(\d+) (\w+) - (.*) - currentriverrace\.json$/);
  if (!m) continue;
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const ps = (d.clan && d.clan.participants) || [];
  // Solo los jugadores con alguna actividad semanal o diaria entran en el denominador del "clan entero" (los que no juegan no cuentan)
  const activos = ps.filter(p => p.decksUsed > 0 || p.decksUsedToday > 0 || p.fame > 0);
  caps.push({
    fecha: m[1], hora: m[2] + ':' + m[3] + ':' + m[4], t: m[1] + ' ' + m[2] + ':' + m[3] + ':' + m[4], pI: Number(m[5]), tipo: m[6], clan: m[7],
    pIdxJson: d.periodIndex, n: ps.length, activos: activos.length,
    hoy: ps.reduce((a, p) => a + (p.decksUsedToday || 0), 0),
    con4: ps.filter(p => p.decksUsedToday === 4).length,
    con1a3: ps.filter(p => p.decksUsedToday >= 1 && p.decksUsedToday <= 3).length,
    semana: ps.reduce((a, p) => a + (p.decksUsed || 0), 0),
    fameClan: d.clan.fame, periodPoints: d.clan.periodPoints,
    sumaFameJug: ps.reduce((a, p) => a + (p.fame || 0), 0),
    ps: ps,
  });
}
caps.sort((a, b) => a.clan < b.clan ? -1 : a.clan > b.clan ? 1 : (a.t < b.t ? -1 : 1));
const clanes = [...new Set(caps.map(c => c.clan))];
let hayDifJson = caps.filter(c => c.pIdxJson !== c.pI).length;
console.log('capturas:', caps.length, '| con periodIndex del nombre distinto del JSON:', hayDifJson);
clanes.forEach(cl => {
  const lista = caps.filter(c => c.clan === cl);
  console.log('\n=== ' + cl + ' (' + lista.length + ' capturas) ===');
  const dias = [...new Set(lista.map(c => c.fecha))];
  dias.forEach(dia => {
    const delDia = lista.filter(c => c.fecha === dia);
    const pIs = [...new Set(delDia.map(c => c.pI))];
    console.log(dia + '  periodIndex vistos: ' + pIs.join(', ') + '  (' + delDia[0].hora + ' a ' + delDia[delDia.length - 1].hora + ')');
    pIs.forEach(pi => {
      const g = delDia.filter(c => c.pI === pi);
      const mostrar = g.length <= 4 ? g : [g[0], g[1], g[2], g[g.length - 1]];
      mostrar.forEach(c => console.log('   pI ' + c.pI + ' ' + c.tipo.padEnd(8) + c.hora + '  hoy=' + String(c.hoy).padStart(3) + '  con4=' + String(c.con4).padStart(2) + '/' + c.activos + '  con1-3=' + String(c.con1a3).padStart(2) + '  semana=' + String(c.semana).padStart(3) + '  fameClan=' + c.fameClan + '  periodPoints=' + c.periodPoints));
      if (g.length > 4) console.log('   ... (' + g.length + ' capturas con pI ' + pi + ')');
    });
  });
});
