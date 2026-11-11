// Prueba (solo lectura) del formato ancho de Guerra_Desglose.csv, §PF442. Uso: node prueba_guerra_desglose_ancho.js [base.json]
// Carga 01, 05, 06, 17 y 18 de Base/src en un contexto de node y usa los datos reales de «Datos descargados».
// Con base.json (las filas por día de la versión anterior, mismas entradas) compara día por día; sin él solo hace las pruebas de forma.
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '../../..');
const ctx = vm.createContext({ console, Logger: { log() {} }, Utilities: {}, SpreadsheetApp: {}, DriveApp: {}, PropertiesService: {}, CacheService: {}, LockService: {}, UrlFetchApp: {}, ScriptApp: {}, Session: {}, HtmlService: {}, ContentService: {} });
for (const f of ['01_Config_Global.gs', '05_Backup_CSV.gs', '06_Battlelogs_Siembra.gs', '17_GuerraSheet.gs', '18_CorreccionGuerra.gs']) vm.runInContext(fs.readFileSync(path.join(raiz, 'Base/src', f), 'utf8'), ctx, { filename: f });
let ok = 0, fail = 0;
function t(n, c) { c ? ok++ : (fail++, console.log('FALLA', n)); }
const H = ctx.GDS_HEADERS, col = {}; H.forEach((h, i) => col[h] = i);

// --- forma de la cabecera
t('100 columnas', H.length === 100);
t('sin duplicados en la cabecera', new Set(H).size === H.length);
t('solo el domingo lleva Sin Medallas', H.filter(h => /Sin Medallas/.test(h)).join() === 'D Sin Medallas');
t('N° es la primera columna', H[0] === 'N°');
const bloque = ['Duelo 250', 'Duelo 100', 'PvP 200', 'PvP 100', 'Barcos 125', 'Barcos 75'];
t('orden del bloque de J', bloque.every((b, i) => H[7 + i] === 'J ' + b) && H[13] === 'J Total');
t('orden del bloque de D', bloque.every((b, i) => H[7 + 3 * 7 + i] === 'D ' + b) && H[34] === 'D Sin Medallas' && H[35] === 'D Total');
t('Total Ataques y Tipo de día', H[36] === 'Total Ataques' && H[37] === 'Tipo de día');
t('Barcos y Medallas por día', H.slice(38, 48).join() === 'Barcos J,Barcos V,Barcos S,Barcos D,Barcos Total,Medallas J,Medallas V,Medallas S,Medallas D,Medallas Total');

// --- _gdsFilaSemana_ con casos a mano
const dia = (ataques, fame, barcos, v, fuente) => ({ valores: Object.assign({ duelo250: '', duelo100: '', pvp200: '', pvp100: '', barco125: '', barco75: '', sinFame: '' }, v), ataques, barcos, fame, fuente, combinaciones: '', consistencia: '', diaGuerra: '05/09/2026', periodIndex: 3, origen: 'Original', ataquesAcum: ataques, barcosAcum: barcos, fameAcum: fame, cobertura: { estado: 'sin-dato', archivo: '', descargaMs: null, inicioMs: null } });
const cab = { temporada: '22', semana: '1', clanTag: '#A', clan: 'C', tag: '#T', nombre: 'N' };
let f1 = ctx._gdsFilaSemana_(cab, [dia(4, 900, 0, { duelo250: 2, pvp200: 1, pvp100: 1, barco125: 0, barco75: 0, duelo100: 0, sinFame: 0 }, 'Único'), null, null, null]);
t('largo de la fila', f1.length === H.length);
t('día con valores', f1[col['J Duelo 250']] === 2 && f1[col['J PvP 200']] === 1 && f1[col['J Total']] === 4);
t('día sin fila: vacío, no 0', f1[col['V Total']] === '' && f1[col['V Duelo 250']] === '' && f1[col['Barcos V']] === '' && f1[col['Medallas V']] === '' && f1[col['V Origen']] === '');
t('totales con un solo día', f1[col['Total Ataques']] === 4 && f1[col['Medallas Total']] === 900 && f1[col['Barcos Total']] === 0);
t('domingo sin dato: tipo vacío', f1[col['Tipo de día']] === '');
const f2 = ctx._gdsFilaSemana_(cab, [dia(4, 900, 0, {}, 'Posible'), dia(4, 800, 0, {}, 'Posible'), dia(4, 700, 0, {}, 'Posible'), dia(4, 0, 0, { sinFame: 4 }, 'Único')]);
t('domingo con cruce', f2[col['Tipo de día']] === 'Domingo con cruce' && f2[col['D Sin Medallas']] === 4 && f2[col['D Total']] === 4);
t('totales de 4 días', f2[col['Total Ataques']] === 16 && f2[col['Medallas Total']] === 2400);
t('reparto posible: celdas vacías pero Total del día lleno', f2[col['J Duelo 250']] === '' && f2[col['J Total']] === 4);
const f3 = ctx._gdsFilaSemana_(cab, [null, null, null, dia(4, 900, 0, { duelo250: 0, sinFame: 0 }, 'Único')]);
t('día normal', f3[col['Tipo de día']] === 'Día normal' && f3[col['D Sin Medallas']] === 0);

// --- sin medallas solo el domingo
t('jueves con 4 ataques y fame 0: sin reparto', ctx._gdsCombinacionesDelDia_(4, 0, 0, false).length === 0);
t('domingo con 4 ataques y fame 0: sin medallas 4', ctx._gdsCombinacionesDelDia_(4, 0, 0, true).length === 1 && ctx._gdsCombinacionesDelDia_(4, 0, 0, true)[0].sinFame === 4);
t('jueves sin ataques: todo ceros', ctx._gdsCombinacionesDelDia_(0, 0, 0, false).length === 1);
t('sin el dato de día vale lo de antes', ctx._gdsCombinacionesDelDia_(4, 0, 0).length === 1);
t('el caché distingue domingo de jueves', ctx._gdsCombinacionesDelDia_(4, 0, 0, false).length === 0 && ctx._gdsCombinacionesDelDia_(4, 0, 0, true).length === 1);
t('fuente Imposible en jueves', ctx._gdsDesgloseDelDia_({ ataques: 4, fame: 0, barcos: 0 }, null, false, false).fuente === 'Imposible');

// --- datos reales
const d = require('fs').existsSync(raiz + '/Datos descargados/CSV/Hojas/Backup_Guerra.csv');
if (d) {
  const g = ctx._parseCSV(fs.readFileSync(raiz + '/Datos descargados/CSV/Hojas/Backup_Guerra.csv', 'utf8'));
  const filas = []; for (let i = 1; i < g.length; i++) { const f = g[i].slice(0, ctx.GUERRA_TOTAL_COLS); while (f.length < ctx.GUERRA_TOTAL_COLS) f.push(''); filas.push(f); }
  const b = ctx._parseCSV(fs.readFileSync(raiz + '/Datos descargados/CSV/Jugador/Backup_Battlelogs.csv', 'utf8'));
  const porTag = {}; for (let i = 1; i < b.length; i++) { const tg = ctx._blgNormalizarTag_(b[i][ctx.BLG_COL.TAG]); if (!tg) continue; (porTag[tg] = porTag[tg] || []).push(b[i]); }
  const r = ctx._gdsConstruirFilas_(filas, { ternaTags: ctx.CFG.TERNA_TAGS.slice(), tagPorNombre: {}, battlelogPorTag: porTag, capturasPorTag: {} });
  t('construye', r.ok);
  t('todas las filas tienen el largo de la cabecera', r.filas.every(f => f.length === H.length));
  const claves = new Set(r.filas.map(f => [f[col['Temporada']], f[col['Semana']], f[col['Tag']], f[col['ClanTag']]].join('|')));
  t('una fila por jugador, semana y clan (sin repetidas)', claves.size === r.filas.length);
  t('filasSalida = filas', r.cuenta.filasSalida === r.filas.length);
  t('semanas de jugador <= filas', r.cuenta.semanasJugador <= r.filas.length);
  const n = ctx; r.filas.forEach((f, i) => f[0] = i + 1);
  const csv = ctx._encodeCSV([H].concat(r.filas)); const vuelta = ctx._parseCSV(csv);
  t('el CSV se codifica y se vuelve a leer con el mismo número de columnas', vuelta.length === r.filas.length + 1 && vuelta.every(f => f.length === H.length));
  console.log('filas anchas:', r.filas.length, '| días con datos:', r.cuenta.diasSalida, '| por fuente:', JSON.stringify(r.cuenta.porFuente));
  const tipos = {}; r.filas.forEach(f => tipos[f[col['Tipo de día']] || '(vacío)'] = (tipos[f[col['Tipo de día']] || '(vacío)'] || 0) + 1); console.log('Tipo de día:', JSON.stringify(tipos));

  const baseArg = process.argv[2];
  if (baseArg && fs.existsSync(baseArg)) {
    const viejas = JSON.parse(fs.readFileSync(baseArg, 'utf8'));
    const nuevas = {}; r.filas.forEach(f => nuevas[[f[col['Temporada']], f[col['Semana']], f[col['Tag']], f[col['ClanTag']]].join('|')] = f);
    const dias = ['J', 'V', 'S', 'D'], camposV = ['Duelo 250', 'Duelo 100', 'PvP 200', 'PvP 100', 'Barcos 125', 'Barcos 75'];
    let dif = 0, difEsperadas = 0, comparados = 0; const ejemplos = [];
    viejas.forEach(v => {
      const f = nuevas[[v[1], v[2], v[8], v[6]].join('|')]; if (!f) { dif++; return; }
      const dd = v[3]; comparados++;
      const eq = (a, b2) => String(a) === String(b2);
      let malo = false;
      camposV.forEach((c, i) => { if (!eq(f[col[dd + ' ' + c]], v[17 + i])) malo = true; });
      if (dd === 'D' && !eq(f[col['D Sin Medallas']], v[23])) malo = true;
      if (!eq(f[col[dd + ' Total']], v[14]) || !eq(f[col['Barcos ' + dd]], v[15]) || !eq(f[col['Medallas ' + dd]], v[16])) malo = true;
      ['DiaGuerra:4', 'PeriodIndex:5', 'Origen:10', 'AtaquesAcum:11', 'BarcosAcum:12', 'FameAcum:13', 'CoberturaLog:27', 'BattlelogArchivo:28', 'BattlelogDescargado:29', 'BattlelogDesde:30'].forEach(p => { const [nm, ix] = p.split(':'); if (!eq(f[col[dd + ' ' + nm]], v[+ix])) malo = true; });
      const fuenteNueva = f[col[dd + ' FuenteDesglose']];
      if (!eq(fuenteNueva, v[24])) {
        // única diferencia admitida: jueves a sábado con ataques y fame 0 sin battlelog (antes «Único» con sin fame, ahora «Imposible»)
        if (dd !== 'D' && v[24] === 'Único' && fuenteNueva === 'Imposible' && Number(v[14]) > 0 && Number(v[16]) === 0) { difEsperadas++; return; }
        malo = true;
      }
      if (!eq(f[col[dd + ' ConsistenciaValores']], v[26])) malo = true;
      const combV = String(v[25]).replace(/sin fame/g, 'sin medallas');
      if (!eq(f[col[dd + ' Combinaciones']], combV)) malo = true;
      if (malo) { dif++; if (ejemplos.length < 3) ejemplos.push(v.slice(0, 5).join('/') + ' ' + v[8]); }
    });
    console.log('comparadas con la versión anterior:', comparados, '| diferencias esperadas (J-S con fame 0):', difEsperadas, '| diferencias no esperadas:', dif, ejemplos.join(' ; '));
    t('ninguna diferencia no esperada con la versión anterior', dif === 0);
    t('todas las filas viejas tienen su fila ancha', comparados === viejas.length);
  }
}
console.log(ok + ' ok, ' + fail + ' fallas');
process.exit(fail ? 1 : 0);
