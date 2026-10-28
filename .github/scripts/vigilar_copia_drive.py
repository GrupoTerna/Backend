#!/usr/bin/env python3
"""Vigila que la copia automática de Drive a GitHub (Generador/src/12_Datos_Drive_GitHub.gs) siga al día.

La copia hace un commit en `Datos descargados/` con el mensaje
«Datos descargados: copia automática desde Drive - <fecha> (Lima) - N archivos».
El activador diario corre entre las 5:15 y las 5:45 (Lima); solo sube lo que cambió en Drive.

Uso: python3 -I .github/scripts/vigilar_copia_drive.py --repo GrupoTerna/Backend [--umbral-horas 30]
     [--ahora 2026-10-29T20:00:00Z]   (solo para pruebas)
Necesita `gh` con GH_TOKEN. Escribe `estado=ok|vieja|error` en $GITHUB_OUTPUT (si existe) y sale con
0 (al día), 1 (más vieja que el umbral) o 2 (no se pudo consultar GitHub).
"""
import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone

ap = argparse.ArgumentParser()
ap.add_argument("--repo", required=True)
ap.add_argument("--umbral-horas", type=float, default=30)
ap.add_argument("--ahora")
a = ap.parse_args()

RE_MSG = re.compile(r"^Datos descargados: copia automática desde Drive - (.+?) \(Lima\) - (\d+) archivos")
LIMA = timezone(timedelta(hours=-5))


def salida(estado, detalle=""):
    ruta = os.environ.get("GITHUB_OUTPUT")
    if ruta:
        with open(ruta, "a", encoding="utf-8") as f:
            f.write(f"estado={estado}\n")
            if detalle:
                f.write(f"detalle={detalle}\n")


def parse(ts):
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


r = subprocess.run(
    ["gh", "api", "-X", "GET", f"repos/{a.repo}/commits", "-f", "path=Datos descargados", "-f", "per_page=100"],
    capture_output=True, text=True)
if r.returncode != 0:
    print(f"::error::No se pudo consultar GitHub: {r.stderr.strip()[:300]}")
    salida("error")
    sys.exit(2)

commits = json.loads(r.stdout)
copias = [(parse(c["commit"]["committer"]["date"]), c["commit"]["message"].split("\n")[0], c["sha"][:7])
          for c in commits if RE_MSG.match(c["commit"]["message"])]
ahora = parse(a.ahora) if a.ahora else datetime.now(timezone.utc)

if not copias:
    msg = (f"No hay ninguna copia automática entre los últimos {len(commits)} commits de «Datos descargados/». "
           "Revisa el activador del Generador (instalarActivadorDatosDriveGithub) y su registro de ejecución.")
    print(f"::error::{msg}")
    salida("vieja", msg)
    sys.exit(1)

ultima, mensaje, sha = copias[0]
horas = (ahora - ultima).total_seconds() / 3600
lima = ultima.astimezone(LIMA).strftime("%d/%m/%Y %H:%M")
print(f"Última copia automática: {lima} (Lima), commit {sha}, hace {horas:.1f} h (umbral {a.umbral_horas:g} h).")
print(f"Mensaje: {mensaje}")
print(f"Copias automáticas en los últimos {len(commits)} commits de la carpeta: {len(copias)}.")

if horas > a.umbral_horas:
    msg = (f"La última copia automática de Drive a GitHub fue el {lima} (Lima), hace {horas:.0f} h "
           f"(umbral {a.umbral_horas:g} h). Pasos: (1) mirar el registro de ejecución de `subirDatosDriveAGithubAuto` en el "
           "proyecto Generador; (2) comprobar que el activador existe (`instalarActivadorDatosDriveGithub()`); "
           "(3) ver si GitHub frenó las escrituras (`rate limit`) o si el token del Generador venció; "
           "(4) correr `subirDatosDriveAGithub()` a mano para recuperar el atraso.")
    print(f"::error::{msg}")
    salida("vieja", msg)
    sys.exit(1)

salida("ok")
print("OK: la copia está al día.")
