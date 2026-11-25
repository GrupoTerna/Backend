// Prueba de las funciones puras de la parte 3 del control de medallas (Base/src/60_Control_Medallas_API.gs, §PF584):
// _cmaNombreClanWeb_, _cmaTotalesSemanaWeb_, _cmaDiasApiPorSemana_, _cmaFilasRespaldoWeb_ y _cmaMezclarFilasWeb_.
// Uso, desde la raíz del repo: node "Consolidados de cambios/prueba_control_medallas_web.js"
// Con HistorialGuerra_Grupal.csv y las capturas reales de la API (Datos descargados/) comprueba que, en las semanas con el Log web completo, la suma de
// fama de la web es igual a Σ pointsEarned de la API de jueves a domingo; que el domingo calculado (web − J − V − S) es el domingo real de la API; y que el
// coliseo, que la API no trae, queda con el total semanal de la web. Sale con código 1 si algo falla.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'Base', 'src', '60_Control_Medallas_API.gs'), 'utf8'));
const datos = path.join(__dirname, '..', 'Datos descargados');
function* walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) yield* walk(p); else if (e.name.endsWith('.json')) yield p; } }
// Lector de CSV con campos entre comillas y saltos de línea dentro (como el historial, que a veces pega una fecha en una segunda línea del nombre del clan).
function parseCSV(t) {
  const filas = []; let fila = [], campo = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c; }
    else if (c === '"') q = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = ''; }
    else campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

// 1) Casos sintéticos
assert.strictEqual(_cmaNombreClanWeb_('GrupoXTerna™2\n                2026-08-03'), 'GrupoXTerna™2');
assert.strictEqual(_cmaNombreClanWeb_(null), '');
const ENC = ['Tag', 'Nombre', 'TemporadaInterna', 'TemporadaRoyaleAPI', 'Semana', 'Clan', 'Ataques', 'Fame', 'Barcos', 'Fuente', 'Cerrada', 'Alerta'];
const h = (tag, temp, sem, clan, atq, fame, fuente, cerrada) => [tag, 'n', String(temp), String(temp + 99), String(sem), clan, String(atq), String(fame), '0', fuente, cerrada, 'false'];
const historial = [ENC,
  h('#P1', 38, 1, 'Uno', 4, 1000, 'log', 'true'), h('#P2', 38, 1, 'Uno', 4, 800, 'log', 'true'),
  h('#P1', 38, 2, 'Uno', 4, 500, 'log', 'true'),                       // mismo jugador, otra semana: no es repetida
  h('#P1', 38, 3, 'Uno', 4, 700, 'log', 'true'), h('#P9', 38, 3, 'Uno', 2, 300, 'perfil', 'true'),   // log parcial: hay filas perfil
  h('#P1', 38, 4, 'Uno', 4, 900, 'riverrace', 'false'),               // semana en curso: no cuenta
  h('#P1', 38, 5, 'Otro clan', 4, 100, 'log', 'true')];
const tot = _cmaTotalesSemanaWeb_(historial);
assert.deepStrictEqual(tot.map(x => [x.clanNombre, x.temporada, x.semana, x.sumaFame, x.jugadores, x.filasPerfil]),
  [['Uno', 38, 1, 1800, 2, 0], ['Uno', 38, 2, 500, 1, 0], ['Uno', 38, 3, 700, 1, 1], ['Otro clan', 38, 5, 100, 1, 0]]);
assert.deepStrictEqual(_cmaTotalesSemanaWeb_([]), []);
assert.deepStrictEqual(_cmaTotalesSemanaWeb_([['otra', 'cosa']]), []);

const ctrl = [CMA_ENCABEZADOS,
  [38, 0, 3, 'J', 'Uno', '#UNO', 'Terna', 'api', 0, 0, 0, 1, 0, '', 'sin dato', '', 'x'],
  [38, 0, 5, 'S', 'Uno', '#UNO', 'Terna', 'api', 0, 0, 0, 3, 2, 0, 'sin dato', 'J:500|V:700', 'x'],
  [38, 0, 6, 'D', 'Uno', '#UNO', 'Terna', 'api', 0, 0, 0, 4, 3, 0, 'cuadra', 'J:500|V:700|S:400', 'x'],
  [38, 0, 6, 'D', 'Rival', '#RIV', 'Rival', 'api', 0, 0, 0, 4, 3, 0, 'cuadra', 'J:1|V:1|S:1', 'x']].map(f => f.map(String));
const dias = _cmaDiasApiPorSemana_(ctrl);
assert.deepStrictEqual(dias, { '#UNO|38|1': { J: 500, V: 700, S: 400 } });   // el rival no entra; semana = SectionIndex + 1
const r = _cmaFilasRespaldoWeb_(tot, { 'Uno': '#UNO' }, dias, 'ahora');
assert.deepStrictEqual(r.sinTag, ['Otro clan']);
assert.strictEqual(r.filas.length, 3);
const [s1, s2, s3] = r.filas;
assert.strictEqual(s1.length, CMW_ENCABEZADOS.length);
assert.strictEqual(s1[11], 'respaldo'); assert.strictEqual(s1[12], 200);   // 1800 − (500 + 700 + 400)
assert.strictEqual(s1[8], 3); assert.strictEqual(s1[13], 'J:500|V:700|S:400');
assert.strictEqual(s2[11], 'respaldo'); assert.strictEqual(s2[12], '');    // sin días de la API: solo el total semanal (coliseo)
assert.strictEqual(s2[9], '');
assert.strictEqual(s3[11], 'incompleto'); assert.strictEqual(s3[12], '');   // hay filas perfil: el total no se usa
// con los 4 días: compara
const d4 = { '#UNO|38|1': { J: 500, V: 700, S: 400, D: 200 } };
assert.strictEqual(_cmaFilasRespaldoWeb_(tot, { 'Uno': '#UNO' }, d4, 'x').filas[0][11], 'cuadra');
const d4b = { '#UNO|38|1': { J: 500, V: 700, S: 400, D: 250 } };
const dif = _cmaFilasRespaldoWeb_(tot, { 'Uno': '#UNO' }, d4b, 'x').filas[0];
assert.strictEqual(dif[11], 'difiere'); assert.strictEqual(dif[10], -50);
// el domingo calculado no puede ser negativo
const neg = _cmaFilasRespaldoWeb_(tot, { 'Uno': '#UNO' }, { '#UNO|38|1': { J: 1000, V: 700, S: 400 } }, 'x').filas[0];
assert.strictEqual(neg[11], 'difiere'); assert.strictEqual(neg[12], ''); assert.strictEqual(neg[10], -300);

// 2) Mezclar: archivo nuevo, repetir, cambio, y fila con menos días de la API
let m = _cmaMezclarFilasWeb_([], r.filas);
assert.ok(m.ok); assert.strictEqual(m.nuevas, 3); assert.deepStrictEqual(m.filas[0], CMW_ENCABEZADOS);
const guardado = m.filas.map(f => f.map(String));
const otra = r.filas.map(f => f.slice()); otra[0][14] = 'otra hora';
m = _cmaMezclarFilasWeb_(guardado, otra); assert.strictEqual(m.nuevas + m.actualizadas, 0, 'una corrida sin novedades no debe reescribir');
m = _cmaMezclarFilasWeb_(guardado, _cmaFilasRespaldoWeb_(tot, { 'Uno': '#UNO' }, d4, 'x').filas); assert.strictEqual(m.actualizadas, 1);
const menos = _cmaFilasRespaldoWeb_(tot, { 'Uno': '#UNO' }, { '#UNO|38|1': { J: 500 } }, 'x').filas;
m = _cmaMezclarFilasWeb_(guardado, menos); assert.strictEqual(m.actualizadas, 0, 'menos días de la API con el mismo total web no pisa');
assert.strictEqual(_cmaMezclarFilasWeb_([['otra', 'cosa']], r.filas).ok, false);

// 3) Datos reales
const NOMBRE_A_TAG = { 'Grupo乂Terna™': '#GCRG8L00', 'GrupoXTerna™2': '#GYCU9YRG', 'GrupoXTerna™3': '#GQQPPJGR', 'Mini乂Ternas™': '#GG99LCJY' };
const CARPETA_A_TAG = { 'Grupo乂Terna™': '#GCRG8L00', 'GrupoXTerna™2': '#GYCU9YRG', 'GrupoXTerna™3': '#GQQPPJGR', 'Mini乂Ternas™': '#GG99LCJY' };
const real = parseCSV(fs.readFileSync(path.join(datos, 'CSV', 'Tampermonkey', 'HistorialGuerra_Grupal.csv'), 'utf8'));
const totales = _cmaTotalesSemanaWeb_(real);
// Días de la API: de cada captura, los pointsEarned de periodLogs por clan Terna. La carpeta T-0n equivale a la temporada interna n + 32 (T-04 = 36).
const raiz = path.join(datos, 'JSON', 'Endpoints', 'CurrentRiverRace');
const apiCompleta = {};
for (const [carpeta, tag] of Object.entries(CARPETA_A_TAG)) {
  const dirClan = path.join(raiz, carpeta); if (!fs.existsSync(dirClan)) continue;
  for (const f of walk(dirClan)) {
    const t = Number(/T-(\d+)/.exec(f)[1]); const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const p of j.periodLogs || []) for (const it of p.items || []) if (it.clan.tag === tag) {
      const off = (p.periodIndex % 7) - 3; if (off < 0 || off > 3) continue;
      const k = tag + '|' + (t + 32) + '|' + (Math.floor(p.periodIndex / 7) + 1);
      (apiCompleta[k] = apiCompleta[k] || {})['JVSD'[off]] = it.pointsEarned;
    }
  }
}
// 3a) La API con los días que tenga: en toda semana con los 4 días y el Log web completo, la web es igual a la API
const A = _cmaFilasRespaldoWeb_(totales, NOMBRE_A_TAG, apiCompleta, 'x');
assert.deepStrictEqual(A.sinTag, []);
const cont = {}; A.filas.forEach(f => cont[f[11]] = (cont[f[11]] || 0) + 1);
assert.strictEqual(cont.difiere || 0, 0, 'la web debe cuadrar con la API en toda semana completa: ' + JSON.stringify(A.filas.filter(f => f[11] === 'difiere')));
assert.ok(cont.cuadra >= 28, 'se esperaban al menos 28 semanas que cuadran, salieron ' + cont.cuadra);
// 3b) Sin el domingo: el domingo calculado es el domingo real de la API en cada semana que cuadra
const sinD = {}; for (const [k, v] of Object.entries(apiCompleta)) { const c = Object.assign({}, v); delete c.D; sinD[k] = c; }
const B = _cmaFilasRespaldoWeb_(totales, NOMBRE_A_TAG, sinD, 'x');
let domingos = 0;
A.filas.forEach((fa, i) => {
  if (fa[11] !== 'cuadra') return;
  const fb = B.filas[i];
  assert.strictEqual(fb[11], 'respaldo');
  assert.strictEqual(fb[12], apiCompleta[fa[3] + '|' + fa[0] + '|' + fa[1]].D, 'domingo T' + fa[0] + ' S' + fa[1] + ' ' + fa[2]);
  domingos++;
});
// 3c) Sin nada de la API (coliseo): solo el total semanal de la web, sin reparto por día
const C = _cmaFilasRespaldoWeb_(totales, NOMBRE_A_TAG, {}, 'x');
C.filas.forEach(f => { if (f[11] === 'respaldo') { assert.strictEqual(f[12], ''); assert.strictEqual(f[8], 0); } });
const tot3 = (temp, sem, clan) => C.filas.find(f => f[0] === temp && f[1] === sem && f[2] === clan);
assert.strictEqual(tot3(36, 5, 'Grupo乂Terna™')[5], 119500);   // coliseo, T-04 S-05
assert.strictEqual(tot3(37, 4, 'Grupo乂Terna™')[5], 111750);   // coliseo, T-05 S-04
assert.strictEqual(tot3(38, 4, 'Grupo乂Terna™')[5], 120950);   // coliseo, T-06 S-04
// la mezcla de todo lo real es estable
const mz = _cmaMezclarFilasWeb_(_cmaMezclarFilasWeb_([], A.filas).filas.map(f => f.map(String)), A.filas);
assert.strictEqual(mz.nuevas + mz.actualizadas, 0);
console.log('OK:', totales.length, 'clan-semanas con Log cerrado;', 'con la API completa:', JSON.stringify(cont) + ';', domingos, 'domingos calculados que coinciden con el real de la API;', 'coliseo 36-5, 37-4 y 38-4 con el total de la web.');
