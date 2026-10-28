#!/usr/bin/env node
// Valida un proyecto de Apps Script guardado en este repo (Base, Contactos_Secundario...).
// Uso: node .github/scripts/validar_proyecto_gs.js <Carpeta>      (desde la raíz del repo)
// Revisa: sintaxis de cada .gs, appsscript.json, funciones repetidas entre archivos,
// posibles secretos y estructura mínima. Deja avisos ::error (formato de GitHub Actions).
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const proyecto = process.argv[2];
if (!proyecto) { console.log("::error::Falta el nombre de la carpeta del proyecto"); process.exit(1); }
const src = path.join(proyecto, "src");
let fallos = 0;
const error = (archivo, msg) => { console.log(`::error file=${archivo}::${msg}`); fallos++; };

if (!fs.existsSync(src)) { error(src, "No existe la carpeta src"); process.exit(1); }
const gs = fs.readdirSync(src).filter(n => n.endsWith(".gs")).sort();
if (!gs.length) error(src, "No hay ningún .gs");

// 1) Sintaxis (se compila como script, sin ejecutarlo)
for (const f of gs) {
  const ruta = path.join(src, f);
  const txt = fs.readFileSync(ruta, "utf8");
  if (txt.includes("```")) error(ruta, "Contiene comillas inversas triples (resto de Markdown)");
  try { new vm.Script(txt, { filename: ruta }); }
  catch (e) { error(ruta, "Error de sintaxis: " + String(e.message).split("\n")[0]); }
}
console.log(`Sintaxis revisada en ${gs.length} archivos .gs.`);

// 2) appsscript.json
try {
  const j = JSON.parse(fs.readFileSync(path.join(src, "appsscript.json"), "utf8"));
  if (j.runtimeVersion !== "V8") error(path.join(src, "appsscript.json"), "runtimeVersion debe ser V8");
  if (!j.timeZone) error(path.join(src, "appsscript.json"), "Falta timeZone");
  else console.log(`appsscript.json OK (${j.timeZone})`);
} catch (e) { error(path.join(src, "appsscript.json"), "No es un JSON válido o no existe: " + e.message); }

// 3) Funciones repetidas entre archivos (en Apps Script gana la última y el error es silencioso)
const vistos = {};
for (const f of gs) {
  const txt = fs.readFileSync(path.join(src, f), "utf8");
  for (const m of txt.matchAll(/^function\s+([A-Za-z0-9_$]+)\s*\(/gm)) (vistos[m[1]] = vistos[m[1]] || []).push(f);
}
for (const [n, a] of Object.entries(vistos).filter(([, a]) => a.length > 1)) error(src, `Función repetida ${n} en ${a.join(", ")}`);
console.log(`Funciones revisadas: ${Object.keys(vistos).length} nombres.`);

// 4) Posibles secretos (el repo es público)
const patrones = [/ghp_[A-Za-z0-9]{36}/, /github_pat_[A-Za-z0-9_]{50,}/, /AIza[0-9A-Za-z_-]{35}/, /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}/];
const recorrer = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
  const r = path.join(d, e.name);
  return e.isDirectory() ? recorrer(r) : [r];
});
for (const r of recorrer(proyecto).filter(r => /\.(gs|json|md)$/.test(r))) {
  const txt = fs.readFileSync(r, "utf8");
  if (patrones.some(p => p.test(txt))) error(r, "Posible token o clave en el repositorio");
}
console.log("Búsqueda de secretos terminada.");

// 5) Estructura mínima
for (const p of [path.join(proyecto, "LEEME_IA.md"), path.join(proyecto, "INDICE_FUNCIONES.md")]) {
  if (!fs.existsSync(p)) error(p, "Falta el archivo generado");
}

if (fallos) { console.log(`${fallos} problema(s) en ${proyecto}.`); process.exit(1); }
console.log(`OK: ${proyecto} sin problemas.`);
