#!/usr/bin/env python3
"""Valida el frontmatter de Claude/SKILL.md (la aplicación rechaza el archivo si el YAML está roto).

Uso: python3 -I .github/scripts/validar_skill.py [ruta] [--base <commit>]   (por defecto Claude/SKILL.md)
Revisa: frontmatter, línea de versión («Versión de esta skill: <fecha>, rev. N»), que los archivos
citados (Claude/, .github/, Consolidados de cambios/) existan y, con --base, que la revisión haya
subido si el contenido cambió respecto de ese commit.
Sale con código 1 y deja un aviso ::error si algo falla (formato que entiende GitHub Actions).
"""
import os
import re
import subprocess
import sys

import yaml

args = sys.argv[1:]
base = None
if "--base" in args:
    i = args.index("--base")
    base = args[i + 1] if i + 1 < len(args) else None
    del args[i:i + 2]
ruta = args[0] if args else "Claude/SKILL.md"


def fallar(msg):
    print(f"::error file={ruta}::{msg}")
    sys.exit(1)


try:
    texto = open(ruta, encoding="utf-8").read()
except OSError as e:
    fallar(f"No se pudo leer el archivo: {e}")

m = re.match(r"---\n(.*?)\n---\n", texto, re.S)
if not m:
    fallar("No empieza con un bloque de frontmatter delimitado por '---'.")

try:
    d = yaml.safe_load(m.group(1))
except yaml.YAMLError as e:
    fallar(f"YAML del frontmatter roto: {e}")

if not isinstance(d, dict):
    fallar("El frontmatter no es un mapa de claves.")
if d.get("name") != "md":
    fallar(f"name debe ser 'md' (es {d.get('name')!r}).")
desc = d.get("description")
if not isinstance(desc, str) or not desc.strip():
    fallar("Falta description o está vacía.")
if len(desc) >= 1024:
    fallar(f"description mide {len(desc)} caracteres; debe ser menor que 1024.")
if "<" in desc or ">" in desc:
    fallar("description no puede llevar corchetes angulares.")

RE_VERSION = re.compile(r"\*\*Versión de esta skill: (\d{1,2}-[a-z]{3}-\d{4}), rev\. (\d+)\.?\*\*")
mv = RE_VERSION.search(texto)
if not mv:
    fallar("Falta la línea «**Versión de esta skill: <d-mmm-aaaa>, rev. N.**».")
rev = int(mv.group(2))

# Archivos citados que deben existir (relativos a la raíz del repo, que es el padre de Claude/)
raiz = os.path.dirname(os.path.dirname(os.path.abspath(ruta)))
citados = set(re.findall(r"`((?:Claude|\.github|Consolidados de cambios)/[^`\s*<>]*[^`\s*<>/]\.(?:md|py|txt|js|yml))`", texto))
faltan = sorted(c for c in citados if not os.path.exists(os.path.join(raiz, c)))
if faltan:
    fallar("La skill cita archivos que no existen: " + ", ".join(faltan))

# Con --base: si cambió el contenido, la revisión debe subir
if base and not set(base) <= {"0"}:
    r = subprocess.run(["git", "show", f"{base}:Claude/SKILL.md"], capture_output=True, text=True)
    if r.returncode == 0:
        viejo = r.stdout
        mo = RE_VERSION.search(viejo)
        sin_version = lambda t: RE_VERSION.sub("", t)
        if sin_version(viejo) != sin_version(texto):
            if mo and rev <= int(mo.group(2)):
                fallar(f"Cambió SKILL.md pero la revisión no subió (antes {'rev. ' + mo.group(2) if mo else 'sin revisión'}, ahora rev. {rev}).")
            print(f"Revisión: rev. {rev}" + ("" if mo else " (primera versión con número de revisión)") + ".")
    else:
        print("Sin versión anterior de la skill para comparar; se omite la revisión de rev.")

print(f"OK: frontmatter válido (name={d['name']}, description={len(desc)} caracteres)")
