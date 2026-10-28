// =============================================================================
// 09_ReadmeGenerador.gs
// Mantiene al día ReadMe_Generador.md (subcarpeta "Generador" de Drive) cada vez
// que se descarga o se sube el Generador.
//
// Solo reescribe el bloque que está entre estas dos marcas dentro del README:
//     <!-- AUTO:INICIO ... -->
//     <!-- AUTO:FIN -->
// El resto del README (el texto que escribes tú o una IA) no se toca, salvo la
// línea "_Última actualización: ..._". El bloque contiene lo que se desactualiza
// solo: las funciones que se ejecutan a mano (leídas de 01_Principal.gs) y la
// lista real de archivos del proyecto. Si hay un archivo que el texto manual
// no menciona, lo avisa dentro del bloque.
//
// Si ReadMe_Generador.md no existe en la subcarpeta, NO lo crea (para no
// generar duplicados): se omite y queda anotado en el log de ejecución.
// =============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: ninguna (todas las de este archivo las llama el Generador al descargar o subir)
//  Parte 2 — Funciones que no se corren a mano
//    - ReadMe del Generador: actualización (primero la función de entrada, luego sus ayudas en el orden en que se llaman)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var README_GENERADOR_NOMBRE_ = 'ReadMe_Generador.md';
var README_MARCA_INICIO_ = '<!-- AUTO:INICIO';
var README_MARCA_FIN_    = '<!-- AUTO:FIN -->';
var README_LINEA_INICIO_ = '<!-- AUTO:INICIO (lo escribe 09_ReadmeGenerador.gs en cada descarga/subida del Generador; no edites entre las marcas) -->';

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- ReadMe del Generador: actualización -----

/**
 * Actualiza ReadMe_Generador.md en Drive. NUNCA lanza error (una falla aquí no
 * debe romper la descarga/subida); lo deja en el log y devuelve { ok:false }.
 */
function _actualizarReadmeGenerador_() {
  try {
    var carpeta = _carpetaDeRespaldos_('Generador');
    var it = carpeta.getFilesByName(README_GENERADOR_NOMBRE_);
    if (!it.hasNext()) {
      console.log('[README] No existe ' + README_GENERADOR_NOMBRE_ + ' en la subcarpeta "Generador": se omite (no se crea para evitar duplicados).');
      return { ok: false, omitido: true };
    }
    var archivo = it.next();
    if (it.hasNext()) console.warn('[README] Hay más de un ' + README_GENERADOR_NOMBRE_ + ' en la carpeta; se actualiza solo el primero.');

    var archivos = _archivosDelProyecto_('Generador');
    var principal = archivos.filter(function(a) { return a.name === '01_Principal'; })[0];
    var textoActual = archivo.getBlob().getDataAsString('UTF-8');
    var fecha = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm');
    var nuevo = _readmeAplicarBloque_(textoActual, archivos, principal ? principal.source : '', fecha);

    archivo.setContent(nuevo);
    console.log('[README] ' + README_GENERADOR_NOMBRE_ + ' actualizado (' + fecha + ').');
    return { ok: true };
  } catch (e) {
    var msg = (e && e.message) ? e.message : String(e);
    console.error('[README] ' + msg);
    return { ok: false, error: msg };
  }
}

/**
 * Devuelve el texto del README con el bloque automático reemplazado (o añadido
 * al final si todavía no tiene marcas) y la línea de "Última actualización"
 * al día. Función pura: no toca Drive.
 * @param {string} texto     contenido actual del README
 * @param {Array}  archivos  archivos del proyecto ({name, type, source})
 * @param {string} fuente01  código de 01_Principal.gs
 * @param {string} fechaHora "dd/MM/yyyy HH:mm"
 */
function _readmeAplicarBloque_(texto, archivos, fuente01, fechaHora) {
  var i = texto.indexOf(README_MARCA_INICIO_);
  var j = texto.indexOf(README_MARCA_FIN_);
  var tieneMarcas = (i >= 0 && j > i);
  var manual = tieneMarcas
    ? texto.substring(0, i) + texto.substring(j + README_MARCA_FIN_.length)
    : texto;

  var b = [];
  b.push(README_LINEA_INICIO_);
  b.push('_Bloque actualizado el ' + fechaHora + ' (Lima)._');
  b.push('');
  b.push('### Funciones que se ejecutan manualmente (`01_Principal.gs`)');
  b.push('');
  var funciones = _readmeFuncionesManuales_(fuente01);
  var ordenGrupos = ['Subir (Base)', 'Subir (Generador)', 'Subir (Contactos_Secundario)', 'Descargar', 'Mantenimiento y otras'];
  ordenGrupos.forEach(function(g) {
    var del = funciones.filter(function(f) { return _readmeGrupo_(f.nombre) === g; });
    if (!del.length) return;
    b.push('**' + g + '**');
    b.push('');
    del.forEach(function(f) { b.push('- `' + f.nombre + '()`' + (f.desc ? ' — ' + f.desc : '')); });
    b.push('');
  });

  b.push('### Archivos actuales del proyecto');
  b.push('');
  b.push('| Archivo | Líneas | Funciones |');
  b.push('|---|---|---|');
  var sinMencion = [];
  archivos.slice().sort(function(a, c) { return a.name < c.name ? -1 : (a.name > c.name ? 1 : 0); })
    .forEach(function(a) {
      var etiqueta = a.name + (a.type === 'JSON' ? '.json' : (a.type === 'HTML' ? '.html' : '.gs'));
      var src = String(a.source || '');
      var nFn = (src.match(/^(?:async\s+)?function\s+[A-Za-z0-9_$]+\s*\(/gm) || []).length;
      b.push('| `' + etiqueta + '` | ' + (src.split('\n').length) + ' | ' + nFn + ' |');
      if (manual.indexOf(etiqueta) === -1) sinMencion.push(etiqueta);
    });
  b.push('');
  if (sinMencion.length) {
    b.push('> ⚠️ Este README todavía no describe: ' + sinMencion.map(function(n) { return '`' + n + '`'; }).join(', ') +
           '. Pide que se actualice la sección "Archivos del proyecto".');
    b.push('');
  }
  b.push(README_MARCA_FIN_);
  var bloque = b.join('\n');

  var resultado;
  if (tieneMarcas) {
    resultado = texto.substring(0, i) + bloque + texto.substring(j + README_MARCA_FIN_.length);
  } else {
    resultado = texto.replace(/\s*$/, '') + '\n\n' + bloque + '\n';
  }
  var dia = fechaHora.split(' ')[0];
  resultado = resultado.replace(/_Última actualización:[^\n]*_/, '_Última actualización: ' + dia + ' (Lima)_');
  return resultado;
}

/**
 * Funciones públicas (sin "_" al final) de un archivo, con la primera frase de
 * su comentario /** ... *\/ si lo tienen. Solo funciones al inicio de línea.
 */
function _readmeFuncionesManuales_(fuente) {
  var lineas = String(fuente || '').split('\n');
  var res = [];
  for (var i = 0; i < lineas.length; i++) {
    var m = /^function\s+([A-Za-z0-9]+)\s*\(/.exec(lineas[i]);
    if (!m) continue;
    var desc = '';
    var j = i - 1;
    if (j >= 0 && /\*\/\s*$/.test(lineas[j])) {
      var k = j;
      while (k >= 0 && !/\/\*\*/.test(lineas[k])) k--;
      if (k >= 0) {
        var texto = lineas.slice(k, j + 1).join('\n')
          .replace(/^\s*\/\*\*/, '').replace(/\*\/\s*$/, '')
          .split('\n')
          .map(function(l) { return l.replace(/^\s*\*\s?/, '').trim(); })
          .join(' ').replace(/\s+/g, ' ').trim();
        var corte = /\.\s/.exec(texto);
        desc = corte ? texto.substring(0, corte.index + 1) : texto;
        if (desc.length > 260) desc = desc.substring(0, 257) + '...';
      }
    }
    res.push({ nombre: m[1], desc: desc });
  }
  return res;
}

function _readmeGrupo_(nombre) {
  if (/^subirBase/.test(nombre))      return 'Subir (Base)';
  if (/^subirGenerador/.test(nombre)) return 'Subir (Generador)';
  if (/^subirContactos/.test(nombre)) return 'Subir (Contactos_Secundario)';
  if (/^descargar/.test(nombre))      return 'Descargar';
  return 'Mantenimiento y otras';
}
