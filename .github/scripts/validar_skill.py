#!/usr/bin/env python3
"""Valida el frontmatter de Claude/SKILL.md (la aplicación rechaza el archivo si el YAML está roto).

Uso: python3 -I .github/scripts/validar_skill.py [ruta]   (por defecto Claude/SKILL.md)
Sale con código 1 y deja un aviso ::error si algo falla (formato que entiende GitHub Actions).
"""
import re
import sys

import yaml

ruta = sys.argv[1] if len(sys.argv) > 1 else "Claude/SKILL.md"


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

print(f"OK: frontmatter válido (name={d['name']}, description={len(desc)} caracteres)")
