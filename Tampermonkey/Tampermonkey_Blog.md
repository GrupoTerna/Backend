// ==UserScript==
// @name         Familia Terna - Links del blog de RoyaleAPI
// @namespace    familia-terna-blog-links
// @version      1.0
// @description  En royaleapi.com/blog pulsa «Show all…» hasta desplegar todas las entradas, junta el enlace, el título, la fecha, las etiquetas y la imagen de portada de cada una, y los descarga en un .txt y un .json (y los copia al portapapeles). No lee el contenido de las entradas: solo la lista, para que Claude abra después cada enlace.
// @match        https://royaleapi.com/blog
// @match        https://royaleapi.com/blog/
// @match        https://royaleapi.com/blog?*
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

// [→ Contexto_Base_Web.md §PF557] Script independiente de Tampermonkey.md (guerra): no comparte código ni datos con él.
(function () {
  'use strict';

  if (!/^\/blog\/?$/.test(location.pathname)) return;
  if (document.getElementById('ft-blog-panel')) return;

  const SELECTOR_BOTON = '.blog_home_more_all_button';
  const MAX_CLICS = 40;

  function esperar(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  function texto(el) {
    return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

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

  function extraer() {
    const mapa = new Map();
    document.querySelectorAll('a[href]').forEach(function (a) {
      const slug = slugDe(a);
      if (!slug) return;
      const img = a.querySelector('img');
      const titulo = texto(a.querySelector('h1,h2,h3,h4,.header')) ||
        (img ? (img.getAttribute('alt') || '').trim() : '');
      const metaTxt = texto(a.querySelector('.meta,time'));
      const etiquetas = Array.from(a.querySelectorAll('.blog_tag_label')).map(texto).filter(Boolean);
      const portada = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';

      const previo = mapa.get(slug) || { url: location.origin + '/blog/' + slug, titulo: '', fecha: '', fecha_texto: '', etiquetas: [], portada: '' };
      if (!previo.titulo && titulo) previo.titulo = titulo;
      if (!previo.fecha_texto && metaTxt) { previo.fecha_texto = metaTxt; previo.fecha = fechaIso(metaTxt); }
      if (!previo.etiquetas.length && etiquetas.length) previo.etiquetas = etiquetas;
      if (!previo.portada && portada) previo.portada = portada;
      mapa.set(slug, previo);
    });
    return Array.from(mapa.values());
  }

  async function desplegarTodo(estado) {
    let clics = 0;
    for (; clics < MAX_CLICS; clics++) {
      const b = botonVisible();
      if (!b) break;
      estado('Pulsando «Show all…» (' + (clics + 1) + ')…');
      b.scrollIntoView({ block: 'center' });
      b.click();
      await esperar(1200);
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

  function fechaLima() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
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

  function armarTxt(lista, hoy) {
    const l = [];
    l.push('# Blog de RoyaleAPI: ' + lista.length + ' entradas (extraído el ' + hoy + ', hora de Lima)');
    l.push('# Columnas separadas por tabulador: fecha\ttítulo\tenlace\tetiquetas\tportada');
    lista.forEach(function (e) {
      l.push([e.fecha || e.fecha_texto, e.titulo, e.url, e.etiquetas.join(', '), e.portada].join('\t'));
    });
    return l.join('\n') + '\n';
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
    'padding:10px 12px;border-radius:8px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.4);max-width:280px';
  const boton = document.createElement('button');
  boton.textContent = '📥 Extraer links del blog';
  boton.style.cssText = 'cursor:pointer;border:0;border-radius:6px;padding:8px 10px;background:#2185d0;color:#fff;font-weight:600;width:100%';
  const msg = document.createElement('div');
  msg.style.cssText = 'margin-top:6px;white-space:pre-wrap';
  panel.appendChild(boton);
  panel.appendChild(msg);
  document.body.appendChild(panel);

  function estado(t) { msg.textContent = t; }

  let corriendo = false;
  boton.addEventListener('click', async function () {
    if (corriendo) return;
    corriendo = true;
    boton.disabled = true;
    boton.style.opacity = '.6';
    try {
      if (!botonVisible()) estado('No veo el botón «Show all…»; reviso lo que ya está desplegado…');
      const clics = await desplegarTodo(estado);
      const lista = extraer();
      if (!lista.length) {
        estado('No encontré enlaces de entradas (/blog/<nombre>). Avísale a Claude para ajustar el script.');
        return;
      }
      const hoy = fechaLima();
      const txt = armarTxt(lista, hoy);
      descargar('blog_royaleapi_links_' + hoy + '.txt', txt, 'text/plain');
      descargar('blog_royaleapi_links_' + hoy + '.json',
        JSON.stringify({ extraido: hoy, zona: 'America/Lima', total: lista.length, entradas: lista }, null, 2),
        'application/json');
      const ok = copiar(txt);
      const fechas = lista.map(function (e) { return e.fecha; }).filter(Boolean).sort();
      const sinTitulo = lista.filter(function (e) { return !e.titulo; }).length;
      estado('Listo: ' + lista.length + ' entradas' +
        (fechas.length ? ' (de ' + fechas[0] + ' a ' + fechas[fechas.length - 1] + ')' : '') +
        '.\nBotón pulsado ' + clics + ' vez/veces. Se descargaron el .txt y el .json' +
        (ok ? ' y se copió la lista.' : '.') +
        (sinTitulo ? '\n' + sinTitulo + ' sin título (revisa el .txt).' : ''));
    } catch (err) {
      estado('Falló: ' + (err && err.message ? err.message : err));
    } finally {
      corriendo = false;
      boton.disabled = false;
      boton.style.opacity = '1';
    }
  });
})();
