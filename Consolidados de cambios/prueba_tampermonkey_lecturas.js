// Prueba de la lectura de la página River Race en Tampermonkey (v3.41, §PF584 punto 13): leerLecturasPaginaRiverRace() y parsearParticipantesRace().
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
const html = `<table class="cw2_participant_flex_table sortable_participant"><tbody>
<tr class="player" data-href="/player/9CJY8RU20/battles"><td class="rank">49</td><td class="player_name"><div class="player_info"><a href="/player/9CJY8RU20/battles" class="player_name force_single_line_hidden">ZupeRey</a><div class="player_role">Member</div></div><div class="player_data"><div class="value_bg decks_used_today">3</div><div class="value_bg decks_used">11</div><div class="value_bg boat_attacks">0</div><div class="value_bg fame">2250</div></div></td></tr>
<tr class="player not_current_member" data-href="/player/2JRUP89PU/battles"><td class="rank">50</td><td class="player_name"><div class="player_info"><a href="/player/2JRUP89PU/battles" class="player_name force_single_line_hidden">Combatiente</a><div class="player_role">--</div></div><div class="player_data"><div class="value_bg decks_used_today">2</div><div class="value_bg decks_used">6</div><div class="value_bg boat_attacks">1</div><div class="value_bg fame">800</div></div></td></tr>
<tr class="player"><td>sin enlace</td></tr></tbody></table>`;
const dom = new JSDOM(html); global.document = dom.window.document;
const codigo = [bloque('function buscarTablaRiverRace'), bloque('function buscarTablaRace'), bloque('function leerLecturasPaginaRiverRace'), bloque('function parsearParticipantesRace')].join('\n');
const { leerLecturasPaginaRiverRace, parsearParticipantesRace } = new Function(codigo + '; return { leerLecturasPaginaRiverRace, parsearParticipantesRace };')();

const l = leerLecturasPaginaRiverRace('Grupo Terna', '#GCRG8L00');
assert.strictEqual(l.length, 2, 'la fila sin enlace se descarta');
assert.deepStrictEqual(l[0], { tag: '#9CJY8RU20', nombreWeb: 'ZupeRey', rol: 'Member', exMiembro: false, clan: 'Grupo Terna', clanTag: '#GCRG8L00', decksHoy: 3, ataquesSemana: 11, fameSemana: 2250, barcosSemana: 0 });
assert.deepStrictEqual(l[1], { tag: '#2JRUP89PU', nombreWeb: 'Combatiente', rol: '--', exMiembro: true, clan: 'Grupo Terna', clanTag: '#GCRG8L00', decksHoy: 2, ataquesSemana: 6, fameSemana: 800, barcosSemana: 1 });

const r = parsearParticipantesRace({ jugadorPorTag: { '#9CJY8RU20': { nombre: 'Zupe' } } }, 'Grupo Terna', '#GCRG8L00');
assert.strictEqual(r.registros.length, 2);
assert.strictEqual(r.registros[0].nombre, 'Zupe'); assert.strictEqual(r.registros[0].exMiembro, false); assert.strictEqual(r.registros[0].ataquesSemana, 11);
assert.strictEqual(r.registros[1].nombre, '', 'el campo nombre sigue como antes'); assert.strictEqual(r.registros[1].nombreWeb, 'Combatiente'); assert.strictEqual(r.registros[1].exMiembro, true);
// Lo que usa la comparación contra Guerra no cambia
assert.deepStrictEqual([r.registros[1].decksHoy, r.registros[1].fameSemana, r.registros[1].barcosSemana], [2, 800, 1]);
console.log('OK: prueba_tampermonkey_lecturas');
