// Prueba (solo lectura) de repararClanVacioGuerraInforme/Aplicar, §PF449. Uso: node prueba_clan_vacio_guerra.js
// Carga 01, 05 y 17 de Base/src en un contexto de node, con Drive simulado en memoria, y usa el Backup_Guerra.csv real de «Datos descargados».
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '../../..');
let drive = {}, guardados = [], horaLock = true;
const ctx = vm.createContext({
  console, Logger: { log(m) { ctx.__log = m; } }, Utilities: { formatDate: () => '2026-11-13 18.00.00' }, SpreadsheetApp: {}, DriveApp: {}, PropertiesService: {}, CacheService: {},
  LockService: { getScriptLock: () => ({ tryLock: () => horaLock, releaseLock() {} }) }, UrlFetchApp: {}, ScriptApp: {}, Session: { getScriptTimeZone: () => 'America/Lima' }, HtmlService: {}, ContentService: {}
});
for (const f of ['01_Config_Global.gs', '05_Backup_CSV.gs', '17_GuerraSheet.gs']) vm.runInContext(fs.readFileSync(path.join(raiz, 'Base/src', f), 'utf8'), ctx, { filename: f });
ctx._loadCSVFromDrive = (n) => drive[n] === undefined ? '' : drive[n];
ctx._saveCSVToDrive = (n, c) => { drive[n] = c; guardados.push(n); };
let ok = 0, fail = 0;
function t(n, c) { c ? ok++ : (fail++, console.log('FALLA', n)); }
const GC = ctx.GC, N = ctx.GUERRA_TOTAL_COLS;
const ENC = ['N°', 'Fecha', 'DiaGuerra', 'Etapa', 'Temporada', 'Temporada_2', 'Semana', 'Día', 'PeriodIndex', 'Clan', 'Tag', 'Nombre', 'AtaquesHoy', 'AtaquesSemana', 'Merma_AtaquesHoy', 'Merma_AtaquesSemana', 'Barcos', 'Fame', 'Copas', 'Ranking', 'Donaciones_r', 'Donaciones_d', 'Origen', 'Clan_Tag'];
t('el encabezado de la prueba tiene las columnas del código', ENC.length === N && ENC[GC.CLAN - 1] === 'Clan' && ENC[GC.NOMBRE - 1] === 'Nombre' && ENC[GC.CLAN_TAG - 1] === 'Clan_Tag');
const NOMBRES = ctx.CFG.CLAN_NOMBRES_FALLBACK;
const TAGCLAN = Object.keys(NOMBRES)[0], NOMCLAN = NOMBRES[TAGCLAN];
let nSeq = 1;
function fila(o) {
  const f = new Array(N).fill('');
  const base = { n: nSeq++, fecha: '05/06/2026 00:00:00', temp: '22', sem: '1', pi: '4', clan: '', tag: '#AAA', nombre: '', ataquesHoy: '0', ataquesSem: '0', barcos: '0', fame: '0', origen: 'Reconstruido', clanTag: '' };
  const x = Object.assign(base, o); if (x.nombre === '') x.nombre = x.tag;
  f[GC.NUM - 1] = String(x.n); f[GC.FECHA - 1] = x.fecha; f[GC.TEMPORADA - 1] = x.temp; f[GC.SEMANA - 1] = x.sem; f[GC.PERIOD_IDX - 1] = x.pi;
  f[GC.CLAN - 1] = x.clan; f[GC.TAG - 1] = x.tag; f[GC.NOMBRE - 1] = x.nombre; f[GC.ATAQUES_HOY - 1] = x.ataquesHoy; f[GC.ATAQUES_SEM - 1] = x.ataquesSem;
  f[GC.BARCOS - 1] = x.barcos; f[GC.FAME - 1] = x.fame; f[GC.ORIGEN - 1] = x.origen; f[GC.CLAN_TAG - 1] = x.clanTag;
  return f;
}
const copia = (a) => JSON.parse(JSON.stringify(a));

// ---------- casos a mano
{
  const filas = [
    fila({ n: 1, clan: NOMCLAN, tag: '#AAA', nombre: 'Ana', origen: 'Original', fame: '800', ataquesHoy: '4', ataquesSem: '4', clanTag: TAGCLAN }),                    // 0 fila completa
    fila({ n: 2, clan: '', tag: '#AAA', fame: '800', ataquesHoy: '4', ataquesSem: '4' }),                                                                        // 1 duplicada exacta -> Borrar
    fila({ n: 3, clan: NOMCLAN, tag: '#BBB', nombre: 'Beto', origen: 'Original', fame: '500', ataquesHoy: '2', ataquesSem: '2' }),                               // 2 fila completa
    fila({ n: 4, clan: '', tag: '#BBB', fame: '0', ataquesHoy: '0' }),                                                                                           // 3 difiere (0 contra 500) -> DISTINTA
    fila({ n: 5, clan: NOMCLAN, tag: '#CCC', nombre: 'Cesar', origen: 'Original', pi: '5' }),                                                                    // 4 otro periodo del jugador
    fila({ n: 6, clan: '', tag: '#CCC', pi: '4', clanTag: TAGCLAN }),                                                                                            // 5 Clan_Tag, sin hermana en su periodo -> Clan + Nombre
    fila({ n: 7, clan: '', tag: '#DDD', pi: '4', clanTag: '#NOEXISTE1' }),                                                                                       // 6 Clan_Tag sin nombre -> SIN NOMBRE DE CLAN, y su nombre
    fila({ n: 8, clan: NOMCLAN, tag: '#DDD', nombre: 'Dora', origen: 'Original', pi: '3' }),                                                                     // 7
    fila({ n: 9, clan: NOMCLAN, tag: '#EEE', nombre: 'Eva', origen: 'Original', pi: '3' }),                                                                      // 8
    fila({ n: 10, clan: NOMCLAN, tag: '#EEE', nombre: 'Eva2', origen: 'Original', pi: '2' }),                                                                    // 9 segundo nombre
    fila({ n: 11, clan: '', tag: '#EEE', pi: '4' }),                                                                                                             // 10 varios nombres -> no se toca
    fila({ n: 12, clan: '', tag: '#FFF', pi: '4' }),                                                                                                             // 11 sin otra fila -> sin fuente
    fila({ n: 13, clan: NOMCLAN, tag: '#GGG', nombre: 'Gus', origen: 'Original', fame: '100' }),                                                                 // 12
    fila({ n: 14, clan: '', tag: '#GGG', fame: '100', origen: 'Original' }),                                                                                     // 13 igual pero no reconstruida -> no se borra
    fila({ n: 15, clan: NOMCLAN, tag: '#HHH', nombre: 'Hugo', origen: 'Original', clanTag: TAGCLAN }),                                                           // 14
    fila({ n: 16, clan: '', tag: '#HHH', clanTag: Object.keys(NOMBRES)[1] || '#OTRO2' }),                                                                        // 15 los dos traen Tag y no coinciden -> DISTINTA
  ];
  const antes = copia(filas);
  const p = ctx._clanVacioPlanGuerra_(filas, ENC, NOMBRES);
  t('el plan no modifica las filas de entrada', JSON.stringify(filas) === JSON.stringify(antes));
  t('borra solo la duplicada exacta', Object.keys(p.borrar).join() === '1' && p.borrar[1] === '1');
  t('DISTINTA por valor distinto (0 contra 500)', p.detalle.some(d => d[0].indexOf('DISTINTA') === 0 && d[1] === 3));
  t('DISTINTA por Tag de clan distinto', Object.keys(NOMBRES).length < 2 || p.detalle.some(d => d[0].indexOf('DISTINTA') === 0 && d[1] === 15));
  t('no reconstruida con hermana: no se borra', p.detalle.some(d => d[0].indexOf('NO RECONSTRUIDA') === 0 && d[1] === 13) && !p.borrar[13]);
  t('completa el clan desde su Clan_Tag', p.clanCambios.length === 1 && p.clanCambios[0].idx === 5 && p.clanCambios[0].nombre === NOMCLAN);
  t('Clan_Tag sin nombre de clan: no se toca el clan', p.detalle.some(d => d[0].indexOf('SIN NOMBRE DE CLAN') === 0 && d[1] === 6) && !p.clanCambios.some(c => c.idx === 6));
  const nom = {}; p.nombreCambios.forEach(c => nom[c.idx] = c.nombre);
  t('nombre del jugador con un solo nombre', nom[5] === 'Cesar' && nom[6] === 'Dora');
  t('varios nombres: no se toca', nom[10] === undefined && p.detalle.some(d => d[0].indexOf('VARIOS NOMBRES') === 0 && d[1] === 10) && p.resumen.nombreVarios === 1);
  t('sin otra fila: no se inventa el nombre', nom[11] === undefined && p.resumen.nombreSinFuente >= 1);
  t('las filas con conflicto no reciben nombre', nom[3] === undefined && nom[13] === undefined && nom[15] === undefined);
  t('cuentas del resumen', p.resumen.vacias === 8 && p.resumen.borrar === 1 && p.resumen.distinta === 2 && p.resumen.noReconstruida === 1);
  // aplicar a mano y repetir: idempotente
  const f2 = copia(filas);
  p.clanCambios.forEach(c => f2[c.idx][GC.CLAN - 1] = c.nombre); p.nombreCambios.forEach(c => f2[c.idx][GC.NOMBRE - 1] = c.nombre);
  const quedan = f2.filter((f, i) => !p.borrar[i]);
  const p2 = ctx._clanVacioPlanGuerra_(quedan, ENC, NOMBRES);
  t('segunda corrida: nada que borrar ni completar', Object.keys(p2.borrar).length === 0 && p2.clanCambios.length === 0 && p2.nombreCambios.length === 0);
  const claves = new Set(quedan.filter(f => f[GC.TAG - 1]).map(f => ctx._idFilaGuerraCSV(f)));
  t('ninguna clave de fila repetida tras aplicar', claves.size === quedan.length);
  // choque de clave: completar el clan repetiria una fila -> DUPLICADA
  const filasD = [
    fila({ n: 1, clan: NOMCLAN, tag: '#ZZZ', nombre: 'Zoe', origen: 'Original', pi: '4', fame: '900' }),
    fila({ n: 2, clan: '', tag: '#ZZZ', pi: '4', fame: '900', origen: 'Original', clanTag: TAGCLAN })
  ];
  const pd = ctx._clanVacioPlanGuerra_(filasD, ENC, NOMBRES);
  t('hermana no reconstruida y con Clan_Tag: queda quieta', pd.clanCambios.length === 0 && pd.nombreCambios.length === 0 && Object.keys(pd.borrar).length === 0);
}

// ---------- datos reales
const rutaReal = raiz + '/Datos descargados/CSV/Hojas/Backup_Guerra.csv';
if (fs.existsSync(rutaReal)) {
  const textoReal = fs.readFileSync(rutaReal, 'utf8');
  const parsed = ctx._parseCSV(textoReal), enc = parsed[0], filas = parsed.slice(1);
  filas.forEach(f => { while (f.length < N) f.push(''); });
  t('cabecera real igual a la del código', enc.slice(0, N).join('|') === ENC.join('|'));
  const antes = JSON.stringify(filas);
  const p = ctx._clanVacioPlanGuerra_(filas, enc, NOMBRES), rs = p.resumen;
  t('el plan no modifica el CSV real en memoria', JSON.stringify(filas) === antes);
  const vacias = filas.filter(f => !f[GC.CLAN - 1].trim());
  t('cuenta las filas con Clan vacío', rs.vacias === vacias.length && rs.vacias === 3920);
  console.log('Real:', JSON.stringify(rs));
  // invariantes de seguridad
  const idxBorrar = Object.keys(p.borrar).map(Number);
  t('lo que se borra es Reconstruido, sin clan y con una fila completa del mismo jugador y periodo', idxBorrar.every(i => {
    const f = filas[i]; if (f[GC.CLAN - 1].trim() || f[GC.ORIGEN - 1] !== 'Reconstruido') return false;
    return filas.some((g, j) => j !== i && g[GC.CLAN - 1].trim() && g[GC.TAG - 1] === f[GC.TAG - 1] && g[GC.TEMPORADA - 1] === f[GC.TEMPORADA - 1] && g[GC.SEMANA - 1] === f[GC.SEMANA - 1] && g[GC.PERIOD_IDX - 1] === f[GC.PERIOD_IDX - 1]);
  }));
  t('las 4 filas del aviso (N° 14540 a 14543) se borran', [14540, 14541, 14542, 14543].every(n => idxBorrar.some(i => filas[i][0] === String(n))));
  t('cada clan completado coincide con el nombre de su Clan_Tag', p.clanCambios.every(c => NOMBRES[filas[c.idx][GC.CLAN_TAG - 1].trim().toUpperCase()] === c.nombre));
  t('ninguna fila completada es una fila borrada', p.clanCambios.concat(p.nombreCambios).every(c => !p.borrar[c.idx]));
  const nomPorTag = {}; filas.forEach(f => { const tg = f[GC.TAG - 1].trim().toUpperCase(), nm = f[GC.NOMBRE - 1].trim(); if (nm && nm.toUpperCase() !== tg) (nomPorTag[tg] = nomPorTag[tg] || new Set()).add(nm); });
  t('cada nombre completado es el único nombre de ese jugador en el backup', p.nombreCambios.every(c => { const s = nomPorTag[filas[c.idx][GC.TAG - 1].trim().toUpperCase()]; return s && s.size === 1 && s.has(c.nombre); }));
  t('solo se completan filas cuyo Nombre era igual al Tag', p.nombreCambios.every(c => filas[c.idx][GC.NOMBRE - 1].trim().toUpperCase() === filas[c.idx][GC.TAG - 1].trim().toUpperCase()));
  // aplicar en memoria y comparar celda por celda
  const f2 = JSON.parse(antes);
  p.clanCambios.forEach(c => f2[c.idx][GC.CLAN - 1] = c.nombre); p.nombreCambios.forEach(c => f2[c.idx][GC.NOMBRE - 1] = c.nombre);
  const quedan = f2.filter((f, i) => !p.borrar[i]);
  t('el número de filas baja exactamente en lo borrado', quedan.length === filas.length - idxBorrar.length);
  let celdasDistintas = {}; let k = 0;
  filas.forEach((f, i) => { if (p.borrar[i]) return; const g = quedan[k++]; f.forEach((v, c) => { if (v !== g[c]) celdasDistintas[ENC[c]] = (celdasDistintas[ENC[c]] || 0) + 1; }); });
  t('solo cambian las columnas Clan y Nombre', Object.keys(celdasDistintas).sort().join() === 'Clan,Nombre');
  t('celdas cambiadas = lo planeado', celdasDistintas.Clan === p.clanCambios.length && celdasDistintas.Nombre === p.nombreCambios.length);
  const ids = new Set(quedan.map(f => ctx._idFilaGuerraCSV(f)));
  t('después de aplicar no hay IDs de fila repetidos que antes no estuvieran', ids.size >= new Set(filas.map(f => ctx._idFilaGuerraCSV(f))).size - idxBorrar.length - 0);
  const p2 = ctx._clanVacioPlanGuerra_(quedan, enc, NOMBRES);
  t('segunda corrida sobre el resultado: 0 borrar, 0 clan, 0 nombre', Object.keys(p2.borrar).length === 0 && p2.clanCambios.length === 0 && p2.nombreCambios.length === 0);
  t('las filas que siguen sin clan son las no confirmadas', p2.resumen.vacias === rs.siguenSinClan);

  // ---------- el envoltorio completo con Drive simulado
  drive = { 'Backup_Guerra.csv': textoReal }; guardados = []; horaLock = true;
  ctx.repararClanVacioGuerraInforme();
  t('informe: no escribe el CSV', drive['Backup_Guerra.csv'] === textoReal && guardados.length === 1 && /\(informe\)\.csv$/.test(guardados[0]));
  t('informe: lo dice el log', /SOLO INFORMAR/.test(ctx.__log) && /A borrar: 9/.test(ctx.__log));
  const informe = drive[guardados[0]];
  t('informe: trae las líneas de resumen y las filas a borrar', /Resumen: a borrar/.test(informe) && (informe.match(/,Borrar,/g) || []).length === 9);
  guardados = [];
  ctx.repararClanVacioGuerraAplicar();
  t('aplicar: guarda informe, respaldo y CSV (en ese orden)', guardados.length === 3 && /\(aplicado\)\.csv$/.test(guardados[0]) && /^Backup_Guerra ANTES de reparar clan vacio /.test(guardados[1]) && guardados[2] === 'Backup_Guerra.csv');
  t('aplicar: el respaldo es idéntico al original', drive[guardados[1]] === textoReal);
  const nuevo = ctx._parseCSV(drive['Backup_Guerra.csv']);
  t('aplicar: el CSV nuevo tiene lo mismo que el cálculo en memoria', nuevo.length - 1 === quedan.length && nuevo.slice(1).every((f, i) => { while (f.length < N) f.push(''); return f.join('\u0001') === quedan[i].join('\u0001'); }));
  guardados = [];
  ctx.repararClanVacioGuerraAplicar();
  t('segunda aplicación: no escribe CSV ni respaldo', !guardados.includes('Backup_Guerra.csv') && guardados.every(n => !/ANTES/.test(n)));
  // tope: si el plan lo supera no escribe nada
  drive = { 'Backup_Guerra.csv': textoReal }; guardados = [];
  const ant = ctx.GC; // el tope se prueba con un CSV con 51 duplicadas
  const dups = []; for (let i = 0; i < 51; i++) { dups.push(fila({ n: 1000 + 2 * i, clan: NOMCLAN, tag: '#T' + i, nombre: 'J' + i, origen: 'Original', pi: '4' })); dups.push(fila({ n: 1001 + 2 * i, clan: '', tag: '#T' + i, pi: '4' })); }
  drive = { 'Backup_Guerra.csv': ctx._encodeCSV([ENC].concat(dups)) }; const txt0 = drive['Backup_Guerra.csv'];
  ctx.repararClanVacioGuerraAplicar();
  t('tope de 50 borrados: no escribe nada', drive['Backup_Guerra.csv'] === txt0 && !guardados.some(n => /ANTES/.test(n)) && /NO SE ESCRIBIO NADA/.test(ctx.__log));
  // orden de columnas viejo: no toca nada
  const viejo = ctx._encodeCSV([ENC.slice(0, N - 1)].concat(filas.slice(0, 5).map(f => f.slice(0, N - 1)))); drive = { 'Backup_Guerra.csv': viejo }; guardados = [];
  ctx.repararClanVacioGuerraAplicar();
  t('encabezado viejo: no toca nada', guardados.length === 0 && /no tiene el orden actual/.test(ctx.__log));
  // candado ocupado
  drive = { 'Backup_Guerra.csv': textoReal }; guardados = []; horaLock = false;
  ctx.repararClanVacioGuerraAplicar(); horaLock = true;
  t('candado ocupado: no hace nada', guardados.length === 0 && /otra ejecucion en curso/.test(ctx.__log));
} else console.log('Sin Backup_Guerra.csv en Datos descargados: se omiten las pruebas con datos reales.');

console.log(ok + ' casos bien, ' + fail + ' fallas.');
process.exit(fail ? 1 : 0);
