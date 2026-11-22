// ==UserScript==
// @name         Familia Terna - Links del blog de RoyaleAPI
// @namespace    familia-terna-blog-links
// @version      2.3
// @description  En royaleapi.com/blog pulsa «Show all…» hasta desplegar todas las entradas y abre solo las que todavía no están en su lista de «leídas»: de cada una toma el enlace, el título, la fecha real, el tiempo de lectura, el resumen de una frase, las etiquetas y la portada, y la da por leída solo si cargó completa y con fecha. Descarga solo lo nuevo en un .txt y un .json (y lo copia). Las leídas se guardan en Tampermonkey; las que fallan se reintentan en la siguiente corrida. No guarda el contenido de las entradas: Claude abre después cada enlace.
// @match        https://royaleapi.com/blog
// @match        https://royaleapi.com/blog/
// @match        https://royaleapi.com/blog?*
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==

// [→ Contexto_Base_Web.md §PF557] Script independiente de Tampermonkey.md (guerra): no comparte código ni datos con él.
(function () {
  'use strict';

  if (!/^\/blog\/?$/.test(location.pathname)) return;
  if (document.getElementById('ft-blog-panel')) return;

  const SELECTOR_BOTON = '.blog_home_more_all_button';
  const MAX_CLICS = 40;
  const CLAVE = 'ft_blog_leidas_v1';
  const PAUSA_MS = 800; // entre una entrada y la siguiente, para no parecer un robot
  const SEL_ETIQUETAS = '.blog_tag_label, .ui.tag.label';

  function esperar(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  function texto(el) {
    return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  // ---- Lista de leídas (se guarda en Tampermonkey; si no hubiera, en localStorage) ----
  function cargarLeidas() {
    let crudo = '';
    try {
      crudo = (typeof GM_getValue === 'function') ? GM_getValue(CLAVE, '') : (localStorage.getItem(CLAVE) || '');
    } catch (e) { crudo = ''; }
    if (!crudo) return {};
    try {
      const o = typeof crudo === 'string' ? JSON.parse(crudo) : crudo;
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }

  function guardarLeidas(obj) {
    const s = JSON.stringify(obj);
    try {
      if (typeof GM_setValue === 'function') GM_setValue(CLAVE, s); else localStorage.setItem(CLAVE, s);
    } catch (e) { /* si no se puede guardar, la corrida sigue pero lo avisa el panel */ }
  }

  function borrarLeidas() {
    try {
      if (typeof GM_deleteValue === 'function') GM_deleteValue(CLAVE); else localStorage.removeItem(CLAVE);
    } catch (e) { /* nada */ }
  }

  // Etiquetas de una tarjeta o de una entrada, sin repetir (las tarjetas pequeñas pueden usar otra clase que la principal).
  function listaEtiquetas(raiz) {
    const vistas = new Set();
    Array.from(raiz.querySelectorAll(SEL_ETIQUETAS)).map(texto).filter(Boolean).forEach(function (t) { vistas.add(t); });
    return Array.from(vistas);
  }

  // ---- Índice del blog ----
  function botonVisible() {
    const b = document.querySelector(SELECTOR_BOTON);
    if (!b || !b.isConnected || b.hidden) return null;
    const st = window.getComputedStyle(b);
    if (st.display === 'none' || st.visibility === 'hidden') return null;
    return b;
  }

  // Enlaces de entradas: /blog/<slug> (sin más tramos, sin ?filtros ni #anclas).
  function slugDe(a) {
    let u;
    try { u = new URL(a.getAttribute('href') || '', location.origin); } catch (e) { return null; }
    if (u.origin !== location.origin) return null;
    const m = u.pathname.match(/^\/blog\/([^\/]+)\/?$/);
    return m ? m[1] : null;
  }

  function contarEnlaces() {
    const s = new Set();
    document.querySelectorAll('a[href]').forEach(function (a) {
      const sl = slugDe(a);
      if (sl) s.add(sl);
    });
    return s.size;
  }

  function fechaIso(txt) {
    const t = Date.parse(txt);
    if (isNaN(t)) return '';
    const d = new Date(t);
    const p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  // Del índice solo hacen falta los enlaces; título, etiquetas y portada son respaldo.
  function extraerIndice() {
    const mapa = new Map();
    document.querySelectorAll('a[href]').forEach(function (a) {
      const slug = slugDe(a);
      if (!slug) return;
      const img = a.querySelector('img');
      const titulo = texto(a.querySelector('h1,h2,h3,h4,.header')) ||
        (img ? (img.getAttribute('alt') || '').trim() : '');
      const etiquetas = listaEtiquetas(a);
      const portada = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
      const previo = mapa.get(slug) || { slug: slug, url: location.origin + '/blog/' + slug, titulo: '', etiquetas: [], portada: '' };
      if (!previo.titulo && titulo) previo.titulo = titulo;
      if (!previo.etiquetas.length && etiquetas.length) previo.etiquetas = etiquetas;
      if (!previo.portada && portada) previo.portada = portada;
      mapa.set(slug, previo);
    });
    return Array.from(mapa.values());
  }

  async function desplegarTodo(estado) {
    let clics = 0, sinCrecer = 0;
    for (; clics < MAX_CLICS; clics++) {
      const b = botonVisible();
      if (!b) break;
      const antes = contarEnlaces();
      estado('Pulsando «Show all…» (' + (clics + 1) + ')…');
      b.scrollIntoView({ block: 'center' });
      b.click();
      await esperar(1500);
      // Si el botón sigue a la vista pero ya no aparecen entradas, se deja de pulsar (dos veces seguidas).
      if (contarEnlaces() === antes) { if (++sinCrecer >= 2) { clics++; break; } } else sinCrecer = 0;
    }
    // Espera a que el número de enlaces deje de crecer (carga diferida).
    let anterior = -1, iguales = 0;
    for (let i = 0; i < 30 && iguales < 3; i++) {
      window.scrollTo(0, document.body.scrollHeight);
      await esperar(700);
      const n = contarEnlaces();
      estado('Esperando que cargue todo… ' + n + ' enlaces');
      if (n === anterior) iguales++; else { iguales = 0; anterior = n; }
    }
    window.scrollTo(0, 0);
    return clics;
  }

  // ---- Lectura de una entrada ----
  function metaContenido(doc, selector) {
    const m = doc.querySelector(selector);
    return m ? (m.getAttribute('content') || '').trim() : '';
  }

  function palabras(t) {
    return (t || '').toLowerCase().replace(/[^a-z0-9áéíóúñ#]+/g, ' ').trim().split(' ').filter(Boolean);
  }

  // Parecido entre dos títulos (0 a 1): «WIP Balance Changes for December…» vs «WIP Balance Changes - December…».
  function parecido(a, b) {
    const A = new Set(palabras(a)), B = new Set(palabras(b));
    if (!A.size || !B.size) return 0;
    let c = 0;
    A.forEach(function (w) { if (B.has(w)) c++; });
    return c / (A.size + B.size - c);
  }

  // En la entrada el título va en un enlace <a href="/blog?id=…">; respaldo: h1, og:title y <title>.
  // Si hay varios enlaces así (p. ej. entradas relacionadas), gana el que más se parece al título de la pestaña.
  function tituloDeEntrada(doc) {
    const og = metaContenido(doc, 'meta[property="og:title"]');
    const pestana = (doc.title || '').replace(/\s*[|\-–]\s*RoyaleAPI.*$/i, '').trim();
    const referencia = og || pestana;
    const enlaces = Array.from(doc.querySelectorAll('a[href^="/blog?id="], a[href*="/blog?id="]'))
      .map(texto).filter(Boolean);
    if (enlaces.length) {
      if (!referencia || enlaces.length === 1) return enlaces[0];
      let mejor = enlaces[0], mejorP = -1;
      enlaces.forEach(function (t) {
        const p = parecido(t, referencia);
        if (p > mejorP) { mejorP = p; mejor = t; }
      });
      return mejor;
    }
    return texto(doc.querySelector('h1')) || og || pestana;
  }

  // Devuelve { ok:true, datos } o { ok:false, tipo, motivo }.
  // «Completa y sin errores» = respondió 200, el HTML llegó entero, tiene título y tiene fecha.
  async function leerEntrada(e) {
    let resp, html;
    try {
      resp = await fetch(e.url, { credentials: 'same-origin', headers: { 'Accept': 'text/html' } });
    } catch (err) {
      return { ok: false, tipo: 'red', motivo: 'sin conexión (' + (err && err.message ? err.message : err) + ')' };
    }
    if (resp.status === 403 || resp.status === 429 || resp.status === 503) {
      return { ok: false, tipo: 'bloqueo', motivo: 'HTTP ' + resp.status + ' (¿verificación de Cloudflare?)' };
    }
    if (!resp.ok) return { ok: false, tipo: 'http', motivo: 'HTTP ' + resp.status };
    try { html = await resp.text(); } catch (err) {
      return { ok: false, tipo: 'incompleto', motivo: 'no se pudo leer la respuesta' };
    }
    if (!/<\/html>\s*$/i.test(html.trim())) return { ok: false, tipo: 'incompleto', motivo: 'el HTML llegó cortado' };

    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (/just a moment|attention required/i.test(doc.title || '')) {
      return { ok: false, tipo: 'bloqueo', motivo: 'página de verificación de Cloudflare' };
    }

    const titulo = tituloDeEntrada(doc);
    if (!titulo) return { ok: false, tipo: 'incompleto', motivo: 'sin título' };

    const info = texto(doc.querySelector('.meta_info'));
    const fm = info.match(/([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})/);
    let fecha = fm ? fechaIso(fm[0]) : '';
    let fechaTexto = fm ? fm[0] : '';
    if (!fecha) {
      const pub = metaContenido(doc, 'meta[property="article:published_time"]');
      const dt = doc.querySelector('time[datetime]');
      const cand = pub || (dt ? dt.getAttribute('datetime') : '') || '';
      if (/^\d{4}-\d{2}-\d{2}/.test(cand)) { fecha = cand.slice(0, 10); fechaTexto = cand; }
    }
    if (!fecha) return { ok: false, tipo: 'incompleto', motivo: 'sin fecha (no encontré .meta_info con la fecha)' };

    const lm = info.match(/(\d+)\s*min\s*read/i);
    const etiquetas = listaEtiquetas(doc);
    return {
      ok: true,
      datos: {
        url: e.url,
        titulo: titulo,
        titulo_indice: (e.titulo && e.titulo !== titulo) ? e.titulo : '',
        fecha: fecha,
        fecha_texto: fechaTexto,
        lectura_min: lm ? Number(lm[1]) : null,
        resumen: metaContenido(doc, 'meta[property="og:description"]') || metaContenido(doc, 'meta[name="description"]'),
        etiquetas: etiquetas.length ? etiquetas : e.etiquetas,
        portada: metaContenido(doc, 'meta[property="og:image"]') || e.portada || ''
      }
    };
  }

  // ---- Salida ----
  function marcaLima() {
    try {
      const partes = {};
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value; });
      return { fecha: partes.year + '-' + partes.month + '-' + partes.day, hora: partes.hour + partes.minute };
    } catch (err) {
      const iso = new Date().toISOString();
      return { fecha: iso.slice(0, 10), hora: iso.slice(11, 13) + iso.slice(14, 16) };
    }
  }

  function descargar(nombre, contenido, tipo) {
    const blob = new Blob([contenido], { type: tipo + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function ordenar(lista) {
    return lista.slice().sort(function (a, b) { return (b.fecha || '').localeCompare(a.fecha || ''); });
  }

  function armarTxt(titulo, lista, errores, marca) {
    const l = [];
    l.push('# ' + titulo + ': ' + lista.length + ' entradas (extraído el ' + marca.fecha + ' ' + marca.hora.slice(0, 2) + ':' + marca.hora.slice(2) + ', hora de Lima)');
    l.push('# Columnas separadas por tabulador: fecha\ttítulo\tenlace\tminutos de lectura\tetiquetas\tportada\tresumen');
    ordenar(lista).forEach(function (e) {
      l.push([e.fecha, e.titulo, e.url, e.lectura_min == null ? '' : e.lectura_min, (e.etiquetas || []).join(', '), e.portada, (e.resumen || '').replace(/\s+/g, ' ')].join('\t'));
    });
    (errores || []).forEach(function (er) {
      l.push('# NO LEÍDA (se reintenta la próxima vez): ' + er.url + ' — ' + er.motivo);
    });
    return l.join('\n') + '\n';
  }

  function entregar(prefijo, titulo, lista, errores, extraJson) {
    const marca = marcaLima();
    const txt = armarTxt(titulo, lista, errores, marca);
    const base = 'blog_royaleapi_' + prefijo + '_' + marca.fecha + '_' + marca.hora;
    descargar(base + '.txt', txt, 'text/plain');
    descargar(base + '.json', JSON.stringify(Object.assign(
      { extraido: marca.fecha + ' ' + marca.hora, zona: 'America/Lima', total: lista.length, entradas: ordenar(lista), no_leidas: errores || [] },
      extraJson || {}), null, 2), 'application/json');
    return copiar(txt);
  }

  function copiar(txt) {
    try {
      if (typeof GM_setClipboard === 'function') { GM_setClipboard(txt, 'text'); return true; }
    } catch (e) { /* sigue con la alternativa */ }
    try {
      if (navigator.clipboard) { navigator.clipboard.writeText(txt); return true; }
    } catch (e) { /* sin portapapeles */ }
    return false;
  }

  // ---- Panel ----
  const panel = document.createElement('div');
  panel.id = 'ft-blog-panel';
  panel.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99999;background:#1b1c1d;color:#fff;' +
    'padding:10px 12px;border-radius:8px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.4);max-width:300px';

  function crearBoton(rotulo, fondo) {
    const b = document.createElement('button');
    b.textContent = rotulo;
    b.style.cssText = 'cursor:pointer;border:0;border-radius:6px;padding:7px 10px;background:' + fondo +
      ';color:#fff;font-weight:600;width:100%;margin-top:5px';
    return b;
  }

  const contador = document.createElement('div');
  contador.style.cssText = 'font-weight:600';
  const bNuevas = crearBoton('📥 Buscar entradas nuevas', '#2185d0');
  const bTodo = crearBoton('📄 Descargar todas las guardadas', '#555');
  const bParar = crearBoton('⏹ Detener', '#b03030');
  bParar.style.display = 'none';
  const bOlvidar = crearBoton('🗑 Olvidar la lista de leídas', '#444');
  bOlvidar.style.fontWeight = '400';
  const msg = document.createElement('div');
  msg.style.cssText = 'margin-top:6px;white-space:pre-wrap';
  [contador, bNuevas, bTodo, bParar, bOlvidar, msg].forEach(function (x) { panel.appendChild(x); });
  document.body.appendChild(panel);

  function estado(t) { msg.textContent = t; }
  function refrescarContador() {
    contador.textContent = 'Leídas guardadas: ' + Object.keys(cargarLeidas()).length;
  }
  refrescarContador();

  let corriendo = false;
  let detener = false;

  function bloquear(si) {
    corriendo = si;
    [bNuevas, bTodo, bOlvidar].forEach(function (b) { b.disabled = si; b.style.opacity = si ? '.6' : '1'; });
    bParar.style.display = si ? 'block' : 'none';
  }

  bParar.addEventListener('click', function () { detener = true; estado('Deteniendo después de la entrada en curso…'); });

  bTodo.addEventListener('click', function () {
    const lista = Object.keys(cargarLeidas()).map(function (k) { return cargarLeidas()[k]; });
    if (!lista.length) { estado('Todavía no hay entradas leídas guardadas.'); return; }
    const ok = entregar('todas', 'Blog de RoyaleAPI, todas las leídas guardadas', lista, [], {});
    estado('Descargadas las ' + lista.length + ' guardadas' + (ok ? ' y copiada la lista.' : '.'));
  });

  bOlvidar.addEventListener('click', function () {
    const n = Object.keys(cargarLeidas()).length;
    if (!n) { estado('La lista ya está vacía.'); return; }
    if (!window.confirm('¿Borrar la lista de ' + n + ' entradas leídas? La próxima corrida volverá a leerlas todas.')) return;
    borrarLeidas();
    refrescarContador();
    estado('Lista borrada.');
  });

  bNuevas.addEventListener('click', async function () {
    if (corriendo) return;
    detener = false;
    bloquear(true);
    try {
      if (!botonVisible()) estado('No veo el botón «Show all…»; reviso lo que ya está desplegado…');
      const clics = await desplegarTodo(estado);
      const indice = extraerIndice();
      if (!indice.length) {
        estado('No encontré enlaces de entradas (/blog/<nombre>). Avísale a Claude para ajustar el script.');
        return;
      }
      const leidas = cargarLeidas();
      const pendientes = indice.filter(function (e) { return !leidas[e.slug]; });
      if (!pendientes.length) {
        estado('No hay entradas nuevas: las ' + indice.length + ' del blog ya están leídas.');
        return;
      }

      const nuevas = [];
      const errores = [];
      let bloqueada = false;
      for (let i = 0; i < pendientes.length; i++) {
        if (detener) break;
        const e = pendientes[i];
        estado('Leyendo ' + (i + 1) + ' de ' + pendientes.length + ': ' + (e.titulo || e.slug) +
          '\nLeídas bien: ' + nuevas.length + ' · con error: ' + errores.length);
        const r = await leerEntrada(e);
        if (r.ok) {
          leidas[e.slug] = Object.assign({}, r.datos, { leido_el: marcaLima().fecha });
          guardarLeidas(leidas); // se guarda una por una: si se corta, no se pierde lo avanzado
          nuevas.push(r.datos);
        } else {
          errores.push({ url: e.url, tipo: r.tipo, motivo: r.motivo });
          if (r.tipo === 'bloqueo') { bloqueada = true; break; }
        }
        await esperar(PAUSA_MS + Math.floor(Math.random() * 400));
      }

      refrescarContador();
      const faltan = pendientes.length - nuevas.length - errores.length;
      let ok = false;
      if (nuevas.length || errores.length) {
        ok = entregar('nuevas', 'Blog de RoyaleAPI, entradas nuevas', nuevas, errores,
          { entradas_en_el_blog: indice.length, ya_leidas_antes: indice.length - pendientes.length });
      }
      estado((bloqueada ? 'Se detuvo: el sitio pidió verificación. Resuélvela en esta pestaña (recarga) y vuelve a pulsar; lo ya leído está guardado.\n' : '') +
        (detener ? 'Detenido por ti. Lo ya leído está guardado.\n' : '') +
        'Listo: ' + nuevas.length + ' entradas nuevas leídas bien' +
        (errores.length ? ', ' + errores.length + ' con error (se reintentan la próxima vez)' : '') +
        (faltan > 0 ? ', ' + faltan + ' sin intentar' : '') +
        '.\nEl blog tiene ' + indice.length + ' (' + (indice.length - pendientes.length) + ' ya estaban leídas).' +
        '\nBotón «Show all…» pulsado ' + clics + ' vez/veces.' +
        (ok ? '\nSe descargaron el .txt y el .json con lo nuevo y se copió la lista.' : (nuevas.length || errores.length ? '\nSe descargaron el .txt y el .json con lo nuevo.' : '')));
    } catch (err) {
      estado('Falló: ' + (err && err.message ? err.message : err));
    } finally {
      bloquear(false);
    }
  });
})();
