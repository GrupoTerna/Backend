// ==UserScript==
// @name         Familia Terna - Links del archivo de noticias de Clash Royale (Supercell)
// @namespace    familia-terna-supercell-links
// @version      1.0
// @description  En supercell.com/en/games/clashroyale/blog recorre las páginas del archivo («Next» una por una), junta de cada artículo el enlace, el título, la fecha y la categoría, y abre solo los que todavía no están en su lista de «leídos» para validar que cargan completos y tomar el resumen y la portada. Un artículo cuenta como leído solo si cargó bien y tiene título y fecha; los que fallan se reintentan la próxima vez. Descarga solo lo nuevo en un .txt y un .json (y lo copia). La lista se guarda en Tampermonkey. No guarda el contenido de los artículos: Claude abre después cada enlace.
// @match        https://supercell.com/en/games/clashroyale/blog/
// @match        https://supercell.com/en/games/clashroyale/blog/page/*
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==

// [→ Contexto_Base_Web.md §PF557] Script independiente de Tampermonkey.md (guerra) y de Tampermonkey_Blog.md (RoyaleAPI): no comparten código ni datos.
(function () {
  'use strict';

  if (!/^\/en\/games\/clashroyale\/blog\/(page\/\d+\/?)?$/.test(location.pathname)) return;
  if (document.getElementById('ft-sc-panel')) return;

  const ORIGEN = location.origin;
  const BASE = '/en/games/clashroyale/blog/';
  const CLAVE_LEIDAS = 'ft_supercell_leidas_v1';
  const CLAVE_FALLIDAS = 'ft_supercell_fallidas_v1';
  const MAX_PAGINAS = 300;
  const PAUSA_PAGINA_MS = 600;
  const PAUSA_ARTICULO_MS = 800;
  const MESES = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

  function esperar(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
  function texto(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }

  // ---- Almacenamiento (Tampermonkey; si no hubiera, localStorage) ----
  function leer(clave) {
    let crudo = '';
    try { crudo = (typeof GM_getValue === 'function') ? GM_getValue(clave, '') : (localStorage.getItem(clave) || ''); } catch (e) { crudo = ''; }
    if (!crudo) return {};
    try { const o = typeof crudo === 'string' ? JSON.parse(crudo) : crudo; return (o && typeof o === 'object') ? o : {}; } catch (e) { return {}; }
  }
  function guardar(clave, obj) {
    const s = JSON.stringify(obj);
    try { if (typeof GM_setValue === 'function') GM_setValue(clave, s); else localStorage.setItem(clave, s); } catch (e) { /* nada */ }
  }
  function borrar(clave) {
    try { if (typeof GM_deleteValue === 'function') GM_deleteValue(clave); else localStorage.removeItem(clave); } catch (e) { /* nada */ }
  }

  // ---- Páginas del archivo ----
  function fechaDe(txt) {
    const m = (txt || '').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/);
    if (!m) return '';
    const mes = MESES[m[2].toLowerCase()];
    if (!mes) return '';
    const p = function (n) { return String(n).padStart(2, '0'); };
    return m[3] + '-' + p(mes) + '-' + p(Number(m[1]));
  }

  // Los nombres de clase de Supercell llevan un sufijo que cambia (archivedArticles_titleLink__bKzNW):
  // se buscan por data-test-id / data-test-class y por el comienzo de la clase.
  function filasDe(raiz) {
    let filas = Array.from(raiz.querySelectorAll('[data-test-class="archived-article"]'));
    if (!filas.length) filas = Array.from(raiz.querySelectorAll('[class*="archivedArticles_articleContainer"]'));
    return filas;
  }

  function itemDeFila(fila) {
    const a = fila.querySelector('a[class*="archivedArticles_titleLink"]') ||
      Array.from(fila.querySelectorAll('a[href]')).find(function (x) { return /\/clashroyale\/blog\//.test(x.getAttribute('href') || ''); });
    if (!a) return null;
    let u;
    try { u = new URL(a.getAttribute('href'), ORIGEN); } catch (e) { return null; }
    const ruta = u.pathname.replace(/\/+$/, '');
    const img = fila.querySelector('img');
    return {
      clave: ruta,
      url: u.origin + u.pathname,
      titulo: texto(a),
      fecha: fechaDe(texto(fila.querySelector('[data-test-id="publish-date-text"]'))),
      fecha_texto: texto(fila.querySelector('[data-test-id="publish-date-text"]')),
      categoria: texto(fila.querySelector('[data-test-id="category-text"]')),
      portada: img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : ''
    };
  }

  function siguienteDe(raiz) {
    const a = raiz.querySelector('a[class*="pagination_next"]') ||
      Array.from(raiz.querySelectorAll('a[href*="/blog/page/"]')).find(function (x) { return /^next$/i.test(texto(x)); });
    if (!a) return '';
    try { return new URL(a.getAttribute('href'), ORIGEN).pathname; } catch (e) { return ''; }
  }

  async function traerHtml(ruta) {
    let resp;
    try { resp = await fetch(ORIGEN + ruta, { credentials: 'same-origin', headers: { 'Accept': 'text/html' } }); }
    catch (err) { return { ok: false, tipo: 'red', motivo: 'sin conexión (' + (err && err.message ? err.message : err) + ')' }; }
    if (resp.status === 403 || resp.status === 429 || resp.status === 503) return { ok: false, tipo: 'bloqueo', motivo: 'HTTP ' + resp.status };
    if (!resp.ok) return { ok: false, tipo: 'http', motivo: 'HTTP ' + resp.status };
    let html;
    try { html = await resp.text(); } catch (err) { return { ok: false, tipo: 'incompleto', motivo: 'no se pudo leer la respuesta' }; }
    if (!/<\/html>\s*$/i.test(html.trim())) return { ok: false, tipo: 'incompleto', motivo: 'el HTML llegó cortado' };
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (/just a moment|attention required/i.test(doc.title || '')) return { ok: false, tipo: 'bloqueo', motivo: 'página de verificación' };
    return { ok: true, doc: doc };
  }

  // Recorre el archivo página por página. Con «completo» falso se detiene en la primera página
  // cuyos artículos ya estaban todos leídos (el archivo va de lo más nuevo a lo más viejo).
  async function recorrerArchivo(leidas, completo, estado, parar) {
    const todos = new Map();
    const problemas = [];
    let ruta = BASE, n = 0;
    while (ruta && n < MAX_PAGINAS && !parar()) {
      n++;
      estado('Recorriendo el archivo: página ' + n + '… (' + todos.size + ' artículos vistos)');
      let raiz;
      if (n === 1 && location.pathname === BASE) {
        raiz = document;
      } else {
        const r = await traerHtml(ruta);
        if (!r.ok) { problemas.push({ url: ORIGEN + ruta, tipo: r.tipo, motivo: 'página ' + n + ': ' + r.motivo }); break; }
        raiz = r.doc;
      }
      const items = filasDe(raiz).map(itemDeFila).filter(Boolean);
      if (!items.length) {
        problemas.push({ url: ORIGEN + ruta, tipo: 'incompleto', motivo: 'página ' + n + ': no trae artículos en el HTML (¿se cargan con JavaScript?)' });
        break;
      }
      items.forEach(function (it) { if (!todos.has(it.clave)) todos.set(it.clave, it); });
      const todosConocidos = items.every(function (it) { return leidas[it.clave]; });
      if (!completo && todosConocidos) break;
      ruta = siguienteDe(raiz);
      if (ruta) await esperar(PAUSA_PAGINA_MS);
    }
    return { items: Array.from(todos.values()), paginas: n, problemas: problemas };
  }

  // ---- Lectura de un artículo ----
  function metaContenido(doc, sel) {
    const m = doc.querySelector(sel);
    return m ? (m.getAttribute('content') || '').trim() : '';
  }

  // «Leído» = respondió 200, el HTML terminó en </html>, no es la verificación y tiene título.
  // El título y la fecha del archivo son los de referencia; el de la página se guarda si difiere.
  async function leerArticulo(it) {
    const r = await traerHtml(it.url.replace(ORIGEN, ''));
    if (!r.ok) return r;
    const doc = r.doc;
    const tituloPagina = texto(doc.querySelector('h1')) || metaContenido(doc, 'meta[property="og:title"]') ||
      (doc.title || '').replace(/\s*[|\-–]\s*Supercell.*$/i, '').trim();
    if (!tituloPagina) return { ok: false, tipo: 'incompleto', motivo: 'la página no tiene título' };
    if (!it.titulo || !it.fecha) return { ok: false, tipo: 'incompleto', motivo: 'el archivo no trae ' + (!it.titulo ? 'título' : 'fecha') };
    return {
      ok: true,
      datos: {
        url: it.url,
        titulo: it.titulo,
        titulo_pagina: tituloPagina !== it.titulo ? tituloPagina : '',
        fecha: it.fecha,
        fecha_texto: it.fecha_texto,
        categoria: it.categoria,
        resumen: metaContenido(doc, 'meta[property="og:description"]') || metaContenido(doc, 'meta[name="description"]'),
        portada: metaContenido(doc, 'meta[property="og:image"]') || it.portada || ''
      }
    };
  }

  // ---- Salida ----
  function marcaLima() {
    try {
      const partes = {};
      new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value; });
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
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function ordenar(lista) { return lista.slice().sort(function (a, b) { return (b.fecha || '').localeCompare(a.fecha || ''); }); }
  function limpio(t) { return (t || '').replace(/\s+/g, ' '); }

  function armarTxt(titulo, lista, problemas, marca) {
    const l = [];
    l.push('# ' + titulo + ': ' + lista.length + ' artículos (extraído el ' + marca.fecha + ' ' + marca.hora.slice(0, 2) + ':' + marca.hora.slice(2) + ', hora de Lima)');
    l.push('# Columnas separadas por tabulador: fecha\tcategoría\ttítulo\tenlace\tresumen\tportada');
    ordenar(lista).forEach(function (e) {
      l.push([e.fecha, e.categoria, e.titulo, e.url, limpio(e.resumen), e.portada].join('\t'));
    });
    (problemas || []).forEach(function (p) { l.push('# NO LEÍDO (se reintenta la próxima vez): ' + p.url + ' — ' + p.motivo); });
    return l.join('\n') + '\n';
  }

  function copiar(txt) {
    try { if (typeof GM_setClipboard === 'function') { GM_setClipboard(txt, 'text'); return true; } } catch (e) { /* sigue */ }
    try { if (navigator.clipboard) { navigator.clipboard.writeText(txt); return true; } } catch (e) { /* nada */ }
    return false;
  }

  function entregar(prefijo, titulo, lista, problemas, extra) {
    const marca = marcaLima();
    const base = 'supercell_clashroyale_' + prefijo + '_' + marca.fecha + '_' + marca.hora;
    const txt = armarTxt(titulo, lista, problemas, marca);
    descargar(base + '.txt', txt, 'text/plain');
    descargar(base + '.json', JSON.stringify(Object.assign(
      { extraido: marca.fecha + ' ' + marca.hora, zona: 'America/Lima', total: lista.length, articulos: ordenar(lista), no_leidos: problemas || [] }, extra || {}), null, 2), 'application/json');
    return copiar(txt);
  }

  // ---- Panel ----
  const panel = document.createElement('div');
  panel.id = 'ft-sc-panel';
  panel.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99999;background:#1b1c1d;color:#fff;padding:10px 12px;border-radius:8px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.4);max-width:300px';
  function crearBoton(rotulo, fondo) {
    const b = document.createElement('button');
    b.textContent = rotulo;
    b.style.cssText = 'cursor:pointer;border:0;border-radius:6px;padding:7px 10px;background:' + fondo + ';color:#fff;font-weight:600;width:100%;margin-top:5px';
    return b;
  }
  const contador = document.createElement('div');
  contador.style.cssText = 'font-weight:600';
  const bNuevos = crearBoton('📥 Buscar artículos nuevos', '#e0457b');
  const bCompleto = crearBoton('🔄 Recorrer todo el archivo', '#7a3b9c');
  const bTodo = crearBoton('📄 Descargar todos los guardados', '#555');
  const bParar = crearBoton('⏹ Detener', '#b03030');
  bParar.style.display = 'none';
  const bOlvidar = crearBoton('🗑 Olvidar la lista de leídos', '#444');
  bOlvidar.style.fontWeight = '400';
  const msg = document.createElement('div');
  msg.style.cssText = 'margin-top:6px;white-space:pre-wrap';
  [contador, bNuevos, bCompleto, bTodo, bParar, bOlvidar, msg].forEach(function (x) { panel.appendChild(x); });
  document.body.appendChild(panel);

  function estado(t) { msg.textContent = t; }
  function refrescar() { contador.textContent = 'Leídos guardados: ' + Object.keys(leer(CLAVE_LEIDAS)).length; }
  refrescar();

  let corriendo = false, detener = false;
  function bloquear(si) {
    corriendo = si;
    [bNuevos, bCompleto, bTodo, bOlvidar].forEach(function (b) { b.disabled = si; b.style.opacity = si ? '.6' : '1'; });
    bParar.style.display = si ? 'block' : 'none';
  }
  bParar.addEventListener('click', function () { detener = true; estado('Deteniendo después del paso en curso…'); });

  bTodo.addEventListener('click', function () {
    const o = leer(CLAVE_LEIDAS);
    const lista = Object.keys(o).map(function (k) { return o[k]; });
    if (!lista.length) { estado('Todavía no hay artículos leídos guardados.'); return; }
    const ok = entregar('todos', 'Archivo de noticias de Clash Royale (Supercell), todos los leídos guardados', lista, [], {});
    estado('Descargados los ' + lista.length + ' guardados' + (ok ? ' y copiada la lista.' : '.'));
  });

  bOlvidar.addEventListener('click', function () {
    const n = Object.keys(leer(CLAVE_LEIDAS)).length;
    if (!n) { estado('La lista ya está vacía.'); return; }
    if (!window.confirm('¿Borrar la lista de ' + n + ' artículos leídos? La próxima corrida volverá a leerlos todos.')) return;
    borrar(CLAVE_LEIDAS); borrar(CLAVE_FALLIDAS); refrescar(); estado('Lista borrada.');
  });

  async function correr(completo) {
    if (corriendo) return;
    detener = false;
    bloquear(true);
    try {
      const leidas = leer(CLAVE_LEIDAS);
      const fallidas = leer(CLAVE_FALLIDAS);
      const rec = await recorrerArchivo(leidas, completo, estado, function () { return detener; });

      // Cola: lo nuevo del archivo + lo que falló antes (aunque ya no aparezca en las páginas recorridas).
      const cola = new Map();
      rec.items.forEach(function (it) { if (!leidas[it.clave]) cola.set(it.clave, it); });
      Object.keys(fallidas).forEach(function (k) { if (!leidas[k] && !cola.has(k)) cola.set(k, fallidas[k]); });
      const pendientes = Array.from(cola.values());

      const nuevos = [];
      const errores = rec.problemas.slice();
      let bloqueado = rec.problemas.some(function (p) { return p.tipo === 'bloqueo'; });
      for (let i = 0; i < pendientes.length && !bloqueado && !detener; i++) {
        const it = pendientes[i];
        estado('Leyendo ' + (i + 1) + ' de ' + pendientes.length + ': ' + (it.titulo || it.url) +
          '\nLeídos bien: ' + nuevos.length + ' · con error: ' + (errores.length - rec.problemas.length));
        const r = await leerArticulo(it);
        if (r.ok) {
          leidas[it.clave] = Object.assign({}, r.datos, { leido_el: marcaLima().fecha });
          delete fallidas[it.clave];
          guardar(CLAVE_LEIDAS, leidas); guardar(CLAVE_FALLIDAS, fallidas);
          nuevos.push(r.datos);
        } else {
          fallidas[it.clave] = it; guardar(CLAVE_FALLIDAS, fallidas);
          errores.push({ url: it.url, tipo: r.tipo, motivo: r.motivo });
          if (r.tipo === 'bloqueo') bloqueado = true;
        }
        await esperar(PAUSA_ARTICULO_MS + Math.floor(Math.random() * 400));
      }

      refrescar();
      const intentados = nuevos.length + (errores.length - rec.problemas.length);
      const sinIntentar = pendientes.length - intentados;
      let ok = false;
      if (nuevos.length || errores.length) {
        ok = entregar('nuevos', 'Archivo de noticias de Clash Royale (Supercell), artículos nuevos', nuevos, errores,
          { paginas_recorridas: rec.paginas, articulos_vistos: rec.items.length });
      }
      if (!nuevos.length && !errores.length) {
        estado('No hay artículos nuevos (recorrí ' + rec.paginas + ' página' + (rec.paginas === 1 ? '' : 's') + ' y vi ' + rec.items.length + ').');
        return;
      }
      estado((bloqueado ? 'Se detuvo: el sitio pidió verificación. Resuélvela en esta pestaña (recarga) y vuelve a pulsar; lo ya leído está guardado.\n' : '') +
        (detener ? 'Detenido por ti. Lo ya leído está guardado.\n' : '') +
        'Listo: ' + nuevos.length + ' artículos nuevos leídos bien' +
        (errores.length ? ', ' + errores.length + ' con error (se reintentan la próxima vez)' : '') +
        (sinIntentar > 0 ? ', ' + sinIntentar + ' sin intentar' : '') +
        '.\nRecorrí ' + rec.paginas + ' página' + (rec.paginas === 1 ? '' : 's') + ' y vi ' + rec.items.length + ' artículos.' +
        '\nSe descargaron el .txt y el .json con lo nuevo' + (ok ? ' y se copió la lista.' : '.'));
    } catch (err) {
      estado('Falló: ' + (err && err.message ? err.message : err));
    } finally {
      bloquear(false);
    }
  }

  bNuevos.addEventListener('click', function () { correr(false); });
  bCompleto.addEventListener('click', function () { correr(true); });
})();
