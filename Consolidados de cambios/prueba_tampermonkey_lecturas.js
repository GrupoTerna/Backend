// Prueba de la lectura de la página River Race en Tampermonkey (v3.41 a v3.43, §PF584 puntos 13 y 15): leerLecturasPaginaRiverRace(), parsearParticipantesRace(),
// leerDiaPaginaRiverRace(), parsearClanesDetalleRiverRace() y expandirDetalleRiverRace() (el bloque `Detail`, que solo aparece después del clic).
// Necesita jsdom (no está en el repo): npm i jsdom --prefix /tmp/jt y luego NODE_PATH=/tmp/jt/node_modules node "Consolidados de cambios/prueba_tampermonkey_lecturas.js"
// Usa las dos filas reales que dio la usuaria (activo y `not_current_member`). Sale con código 1 si algo falla.
const fs = require('fs'), path = require('path'), assert = require('assert');
const { JSDOM } = require('jsdom');
const src = fs.readFileSync(path.join(__dirname, '..', 'Tampermonkey', 'Tampermonkey.md'), 'utf8');
function bloque(inicio) {   // texto de una función completa a partir de su cabecera, por conteo de llaves
  const i = src.indexOf(inicio); assert.ok(i >= 0, 'no se encontró ' + inicio);
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (d === 0) return src.slice(i, k + 1); } }
}
// Línea de tiempo real de la página (miércoles, «Day 3»), tal como la dio la usuaria
const linea = (activo, dia) => `<div class="cw2__period"><div class="timeline"><ul>` + [0,1,2,3,4,5,6].map(i => `<li><div class="text_top  "></div><div class="dot ${i === activo ? 'active' : (i < activo ? 'training_past' : '')}"></div><div class="text">${i === activo ? `<div class="day">Day ${dia}</div>` : ''}</div></li>`).join('') + `</ul></div></div>`;
const html = linea(2, 3) + `<table class="cw2_participant_flex_table sortable_participant"><tbody>
<tr class="player" data-href="/player/9CJY8RU20/battles"><td class="rank">49</td><td class="player_name"><div class="player_info"><a href="/player/9CJY8RU20/battles" class="player_name force_single_line_hidden">ZupeRey</a><div class="player_role">Member</div></div><div class="player_data"><div class="value_bg decks_used_today">3</div><div class="value_bg decks_used">11</div><div class="value_bg boat_attacks">0</div><div class="value_bg fame">2250</div></div></td></tr>
<tr class="player not_current_member" data-href="/player/2JRUP89PU/battles"><td class="rank">50</td><td class="player_name"><div class="player_info"><a href="/player/2JRUP89PU/battles" class="player_name force_single_line_hidden">Combatiente</a><div class="player_role">--</div></div><div class="player_data"><div class="value_bg decks_used_today">2</div><div class="value_bg decks_used">6</div><div class="value_bg boat_attacks">1</div><div class="value_bg fame">800</div></div></td></tr>
<tr class="player"><td>sin enlace</td></tr></tbody></table>`;
const dom = new JSDOM(html); global.document = dom.window.document;
const codigo = [bloque('function buscarTablaRiverRace'), bloque('function buscarTablaRace'), bloque('function leerDiaPaginaRiverRace'), bloque('function leerLecturasPaginaRiverRace'), bloque('function parsearParticipantesRace'), bloque('function parsearClanesDetalleRiverRace'), bloque('async function expandirDetalleRiverRace')].join('\n');
const esperarStub = (cond, ms) => new Promise(res => { let t = 0; const iv = setInterval(() => { const r = cond(); if (r) { clearInterval(iv); res(r); } else if ((t += 20) >= ms) { clearInterval(iv); res(null); } }, 20); });
const { leerLecturasPaginaRiverRace, parsearParticipantesRace, leerDiaPaginaRiverRace, parsearClanesDetalleRiverRace, expandirDetalleRiverRace } =
  new Function('esperar', 'DETALLE_WAIT_MS', codigo + '; return { leerLecturasPaginaRiverRace, parsearParticipantesRace, leerDiaPaginaRiverRace, parsearClanesDetalleRiverRace, expandirDetalleRiverRace };')(esperarStub, 600);

assert.strictEqual(leerDiaPaginaRiverRace(), 3, 'Day 3 de la línea de tiempo');
assert.strictEqual(new JSDOM(linea(5, 6)).window.document.querySelector('.day').textContent, 'Day 6');
const docAnterior = global.document; global.document = new JSDOM(linea(5, 6)).window.document; assert.strictEqual(leerDiaPaginaRiverRace(), 6); global.document = new JSDOM('<p>sin línea</p>').window.document; assert.strictEqual(leerDiaPaginaRiverRace(), null); global.document = docAnterior;
const l = leerLecturasPaginaRiverRace('Grupo Terna', '#GCRG8L00');
assert.strictEqual(l.length, 2, 'la fila sin enlace se descarta');
assert.deepStrictEqual(l[0], { tag: '#9CJY8RU20', nombreWeb: 'ZupeRey', rol: 'Member', exMiembro: false, clan: 'Grupo Terna', clanTag: '#GCRG8L00', decksHoy: 3, ataquesSemana: 11, fameSemana: 2250, barcosSemana: 0, diaPagina: 3 });
assert.deepStrictEqual(l[1], { tag: '#2JRUP89PU', nombreWeb: 'Combatiente', rol: '--', exMiembro: true, clan: 'Grupo Terna', clanTag: '#GCRG8L00', decksHoy: 2, ataquesSemana: 6, fameSemana: 800, barcosSemana: 1, diaPagina: 3 });

const r = parsearParticipantesRace({ jugadorPorTag: { '#9CJY8RU20': { nombre: 'Zupe' } } }, 'Grupo Terna', '#GCRG8L00');
assert.strictEqual(r.registros.length, 2);
assert.strictEqual(r.registros[0].nombre, 'Zupe'); assert.strictEqual(r.registros[0].exMiembro, false); assert.strictEqual(r.registros[0].ataquesSemana, 11);
assert.strictEqual(r.registros[0].diaPagina, 3, 'la fase race también manda el día de la página');
assert.strictEqual(r.registros[1].nombre, '', 'el campo nombre sigue como antes'); assert.strictEqual(r.registros[1].nombreWeb, 'Combatiente'); assert.strictEqual(r.registros[1].exMiembro, true);
// Lo que usa la comparación contra Guerra no cambia
assert.deepStrictEqual([r.registros[1].decksHoy, r.registros[1].fameSemana, r.registros[1].barcosSemana], [2, 800, 1]);

// ---- v3.43: bloque `Detail` por clan y día (estructura real que dio la usuaria; valores de la temporada 39) ----
const item = (w, d, rank, pm, pf, dm, dc, fin, inicio) => `<div class="period_log_items${inicio ? ' period_start' : ''}"><div class="week"><span class="i18n_duration_short uppercase">w</span>\n ${w}\n</div><div class="day"><span class="i18n_duration_short uppercase">d</span>\n ${d}\n</div><div class="rank">\n ${rank}\n</div><div class="progress points">\n + ${pm}\n (${pf})\n</div><div class="progress defenses">\n + ${dm}\n (${dc})\n</div><div class="progress end">\n = ${fin}\n</div></div>`;
const cabecera = '<div class="period_log_items header"><div class="week"><i class="mini fitted calendar icon"></i></div><div class="day"><i class="mini fitted calendar icon"></i></div><div class="rank"><i class="mini fitted trophy icon"></i></div><div class="progress"></div></div>';
const clan = (tag, nombre, activo, filas) => `<a href="/clan/${tag}/war/race" class="clan row${activo ? ' active_clan' : ''}"><div class="summary"><div class="clan name item"><div class="badge item"><img class="ui mini image" src="x"></div><div class="name item">\n ${nombre}\n</div></div><div class="boat value item">0</div><div class="medal value item">0</div><div class="trophy value item">4136</div></div><div class="outline cw2__standing_outline"><div class="item value decks_used_today">11 / 200</div></div>${cabecera}${filas}</a>`;
const standings = '<div class="cw2__race_clan_standings"><div class="header row"><div class="summary"><div class="clan name item">Clan</div></div></div>' +
  clan('P2UUVJCY', 'Adulti ITALIA', false, item(1, 1, 3, 1000, 28100, 376, 14, 1376, true)) +
  clan('GCRG8L00', 'Grupo乂Terna™', true, item(1, 1, 1, 3000, 30750, 435, 15, 3435, true) + item(1, 2, 4, 600, 26300, 323, 13, 923) + item(3, 4, 0, 0, 0, 0, 0, 0)) + '</div>';
const checkbox = '<div class="ui slider checkbox war_timeline_detail_checkbox"><input type="checkbox" name="timeline_detail" class="hidden"><label>Detail</label></div>';

global.document = new JSDOM(standings).window.document;
const det = parsearClanesDetalleRiverRace();
assert.strictEqual(det.length, 4, 'la fila header no cuenta: 1 de Adulti y 3 de Terna');
assert.deepStrictEqual(det[0], { clanTag: '#P2UUVJCY', clan: 'Adulti ITALIA', semana: 1, dia: 1, puesto: 3, premioPuesto: 1000, fameDia: 28100, premioDefensas: 376, defensasEnPie: 14, total: 1376 });
assert.deepStrictEqual(det[1], { clanTag: '#GCRG8L00', clan: 'Grupo乂Terna™', semana: 1, dia: 1, puesto: 1, premioPuesto: 3000, fameDia: 30750, premioDefensas: 435, defensasEnPie: 15, total: 3435 });
assert.deepStrictEqual([det[3].semana, det[3].dia, det[3].puesto, det[3].fameDia, det[3].defensasEnPie], [3, 4, 0, 0, 0], 'el domingo sin dato se lee como ceros; el backend lo omite');

(async () => {
  // v3.44: casilla sin marcar con las filas ya en el HTML (ocultas): se pulsa igual, una sola vez, para que quede activa
  global.document = new JSDOM(standings + checkbox).window.document;
  let clics = 0; global.document.querySelector('.war_timeline_detail_checkbox label').addEventListener('click', () => clics++);
  assert.strictEqual((await expandirDetalleRiverRace()).length, 4); assert.strictEqual(clics, 1, 'casilla apagada: se pulsa aunque las filas ya estén');
  assert.strictEqual(detalleModoUltimo, 'pulsado');
  // Casilla ya marcada: no se pulsa (pulsar otra vez la apagaría)
  global.document = new JSDOM(standings + checkbox.replace('class="hidden"', 'class="hidden" checked')).window.document;
  clics = 0; global.document.querySelector('.war_timeline_detail_checkbox label').addEventListener('click', () => clics++);
  assert.strictEqual((await expandirDetalleRiverRace()).length, 4); assert.strictEqual(clics, 0, 'casilla ya activa: no se pulsa'); assert.strictEqual(detalleModoUltimo, 'ya activa');
  // Sin `input` y con las filas ya visibles: criterio anterior, no se pulsa
  global.document = new JSDOM(standings + '<div class="war_timeline_detail_checkbox"><label>Detail</label></div>').window.document;
  clics = 0; global.document.querySelector('.war_timeline_detail_checkbox label').addEventListener('click', () => clics++);
  assert.strictEqual((await expandirDetalleRiverRace()).length, 4); assert.strictEqual(clics, 0); assert.strictEqual(detalleModoUltimo, 'filas ya visibles');
  // Las filas aparecen solo después del clic (lo que dice la usuaria)
  const dom2 = new JSDOM('<div id="raiz">' + checkbox + '<div id="hueco"></div></div>'); global.document = dom2.window.document;
  global.document.querySelector('.war_timeline_detail_checkbox').addEventListener('click', () => setTimeout(() => { global.document.getElementById('hueco').innerHTML = standings; }, 60));
  const tras = await expandirDetalleRiverRace();
  assert.strictEqual(tras.length, 4, 'después del clic aparecen y se leen'); assert.strictEqual(tras[1].fameDia, 30750);
  // Sin la casilla, o si el clic no trae las filas a tiempo: [] y la lectura sigue
  global.document = new JSDOM('<p>sin casilla</p>').window.document; assert.deepStrictEqual(await expandirDetalleRiverRace(), []);
  global.document = new JSDOM(checkbox).window.document; assert.deepStrictEqual(await expandirDetalleRiverRace(), [], 'el clic no trae nada: no cuelga, devuelve []');
  console.log('OK: prueba_tampermonkey_lecturas');
})().catch(e => { console.error(e); process.exit(1); });
