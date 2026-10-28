#!/usr/bin/env python3
"""
verificar_idioma.py — busca voseo y léxico rioplatense (Argentina/Uruguay) en lo que se va a subir.
Regla de la skill `md` (sección «Idioma»): español de Perú, tuteo, nunca voseo.

Uso (desde la raíz del repo, antes del commit):
  python3 -I "Consolidados de cambios/verificar_idioma.py"            # líneas AGREGADAS respecto de HEAD (staged y sin staged)
  python3 -I "Consolidados de cambios/verificar_idioma.py" --base origin/main   # líneas agregadas respecto de otra referencia
  python3 -I "Consolidados de cambios/verificar_idioma.py" ruta1 ruta2          # archivos completos

Salida: una línea por coincidencia («archivo:línea: texto») y código de salida 1 si hay alguna.
Son CANDIDATAS: las coincidencias hay que revisarlas a mano (por ejemplo «estás» o «das» son tuteo válido).
Los archivos generados (carpetas «respaldo») y «Datos descargados» se omiten.
"""
import re
import subprocess
import sys

# Léxico y formas voseantes inequívocas
LEXICO = re.compile(
    r"\b(acá|che|dale|laburo|laburar|laburás|plata|pibe|pibes|boludo|boluda|vos|sos|"
    r"podés|tenés|querés|sabés|hacés|decís|venís|ponés|sentís|mirás|usás|"
    r"vení|mirá|usá|poné|tené|decí|seguí|andá|salí|fijate|"
    r"decime|decile|avisame|mandame|pasame|dame)\b", re.I)

# Imperativo voseante con pronombre, escrito sin tilde: «agregalo», «dejalo», «revisalo», «fijate».
# El tuteo lleva tilde («agrégalo»), así que no coincide.
PRONOMBRE = re.compile(
    r"\b(agrega|deja|revisa|usa|mira|fija|avisa|corre|abre|cierra|sube|baja|copia|pega|guarda|"
    r"borra|quita|manda|pasa|prueba|vuelve|vuelca|marca|cambia|elimina|ejecuta|corrige|"
    r"anota|pon|ten|di|ve)(lo|la|los|las|me|te|se|nos)\b", re.I)

# Palabras en -ás/-és/-ís con tilde final: voseo si es un verbo (podés, tenés), pero muchas son válidas.
TERMINA_TILDE = re.compile(r"\b[a-záéíóúñ]+(ás|és|ís)\b", re.I)
VALIDAS = {
    "más", "además", "jamás", "atrás", "detrás", "quizás", "demás", "compás", "estás", "habrás",
    "después", "través", "través", "interés", "intereses", "inglés", "francés", "portugués", "japonés",
    "revés", "cortés", "mes", "país", "maíz", "raíz", "anís", "tamarís", "avís", "frangís",
    "estás", "serás", "irás", "harás", "podrás", "tendrás", "verás", "darás", "dirás", "sabrás",
    "tampoco", "apenas", "ananás", "guaraní", "marroquí", "israelí", "iraquí", "alí", "tú",
    "bisabuelés", "cafés", "sofás", "papás", "mamás", "jerséis",
}
FUTURO = re.compile(r"\b[a-záéíóúñ]+(arás|erás|irás|rás)\b", re.I)  # futuro de «tú»: tuteo

OMITIR = ("/respaldo/", "Datos descargados/")


def lineas_agregadas(base):
    """Devuelve [(archivo, nro_linea, texto)] de las líneas agregadas respecto de `base`."""
    sal = subprocess.run(["git", "diff", base, "-U0", "--no-color"], capture_output=True, text=True, check=True).stdout
    res, archivo, nro = [], None, 0
    for ln in sal.splitlines():
        if ln.startswith("+++ "):
            archivo = ln[6:] if ln.startswith("+++ b/") else None
        elif ln.startswith("@@"):
            m = re.search(r"\+(\d+)", ln)
            nro = int(m.group(1)) - 1 if m else 0
        elif ln.startswith("+") and not ln.startswith("+++"):
            nro += 1
            if archivo:
                res.append((archivo, nro, ln[1:]))
    return res


def lineas_de_archivos(rutas):
    res = []
    for r in rutas:
        with open(r, encoding="utf-8", errors="replace") as f:
            for i, ln in enumerate(f, 1):
                res.append((r, i, ln.rstrip("\n")))
    return res


def revisar(texto):
    hallazgos = []
    for m in LEXICO.finditer(texto):
        hallazgos.append(m.group(0))
    for m in PRONOMBRE.finditer(texto):
        hallazgos.append(m.group(0))
    for m in TERMINA_TILDE.finditer(texto):
        p = m.group(0).lower()
        if p in VALIDAS or FUTURO.fullmatch(p) or p.endswith("ías") or p.endswith("íes"):
            continue
        hallazgos.append(m.group(0))
    return hallazgos


def main(argv):
    base, rutas, i = "HEAD", [], 0
    while i < len(argv):
        if argv[i] == "--base" and i + 1 < len(argv):
            base = argv[i + 1]
            i += 2
        else:
            rutas.append(argv[i])
            i += 1
    lineas = lineas_de_archivos(rutas) if rutas else lineas_agregadas(base)
    hay = False
    for archivo, nro, texto in lineas:
        if any(o in "/" + archivo for o in OMITIR):
            continue
        h = revisar(texto)
        if h:
            hay = True
            print("%s:%d: [%s] %s" % (archivo, nro, ", ".join(sorted(set(h), key=str.lower)), texto.strip()[:160]))
    if hay:
        print("\nHay candidatas de voseo o léxico rioplatense: revisarlas a mano (regla «Idioma» de la skill).")
        return 1
    print("OK: sin voseo ni léxico rioplatense en lo revisado.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
