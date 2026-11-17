#!/usr/bin/env python3
"""
verificar_clanes_por_tag.py — busca comparaciones de clanes por NOMBRE en lo que se va a subir.
Regla del plan «Clanes por Tag» (Consolidado_Clanes_por_Tag.md, sección 1, criterios 1 y 8): todo clan se
compara por Tag; el nombre solo se muestra. Código nuevo: ninguna comparación de clanes por nombre.

Uso (desde la raíz del repo, antes del commit; en el repo Web también sirve, copiando el script o con rutas):
  python3 -I "Consolidados de cambios/verificar_clanes_por_tag.py"                       # líneas AGREGADAS respecto de HEAD
  python3 -I "Consolidados de cambios/verificar_clanes_por_tag.py" --base origin/main    # respecto de otra referencia
  python3 -I "Consolidados de cambios/verificar_clanes_por_tag.py" ruta1 ruta2           # archivos completos
  python3 -I "Consolidados de cambios/verificar_clanes_por_tag.py" --resumen ruta1 ...   # solo cuenta por archivo y por tipo

Qué marca (son CANDIDATAS; hay que mirarlas a mano):
  [comparacion]  un identificador de clan por nombre (`.clan`, `clan`, `clanNombre`, `nombreClan`, `GC.CLAN`…)
                 comparado con `===`, `!==`, `==` o `!=`, cuando ningún lado nombra un Tag ni es vacío/null/undefined.
  [orden]        `localeCompare` sobre un nombre de clan.
  [clave]        un objeto o mapa indexado por el nombre de clan (`mapa[clan]`, `porClan[c.clan]`).
                 Las columnas con constante en mayúsculas (`fila[GC.CLAN]`) NO se marcan: es leer una celda.
  [resolvedor]   uso nuevo de `_getClanTagByName(` o `_normalizarNombreClan_(` (traducen nombre a Tag o normalizan
                 el nombre: en código nuevo hay que partir del Tag).

Cuando la comparación por nombre es correcta a propósito (texto de pantalla, dato externo sin Tag, respaldo
declarado), se deja en la MISMA línea un comentario con el motivo: `// clan-por-nombre-ok: <motivo>` y la línea
deja de marcarse. Los comentarios puros, las pruebas (`/test/`), los archivos generados (`respaldo`) y
`Datos descargados` se omiten.

Salida: una línea por coincidencia («archivo:línea: [tipo] texto») y código de salida 1 si hay alguna.
Es heurístico, como `verificar_idioma.py`: no sustituye la lectura del cambio.
"""
import re
import subprocess
import sys

EXTENSIONES = (".gs", ".js", ".html")
OMITIR = ("/respaldo/", "Datos descargados/", "/test/", "/node_modules/", "/scripts/medicion-accesibilidad/")
MARCA_OK = "clan-por-nombre-ok"

# Identificadores que guardan el NOMBRE de un clan. `\b` al final evita `clanTag`, `clanTagPorClan`, `CLAN_TAG`.
_MIN = r"(?:clan|clanNombre|nombreClan|clanName|nomClan|miClan|clanActual|clanOrigen|clanDestino|clanRival|nombreDelClan)"
CLAN_ID = re.compile(
    r"(?:[A-Za-z_$][\w$]*\.)?\b" + _MIN + r"\b"           # clan, x.clan, x.clanNombre…
    r"|\b[A-Z][A-Z0-9]*\.(?:CLAN|CLAN_NOMBRE|NOMBRE_CLAN)\b"  # GC.CLAN, CC2.CLAN… (columnas por nombre)
)
OPERADOR = re.compile(r"(===|!==|==|!=)")
# Lados que no son una comparación de nombres: vacío, null, undefined, números, booleanos, longitudes.
VACIO = re.compile(r"^\s*(?:''|\"\"|``|null|undefined|0|1|-1|true|false|NaN)\s*$|\.length\b|\btypeof\b", re.I)
# Separadores que cierran un operando cuando están al mismo nivel de paréntesis que el operador.
SEPARADORES = ("&&", "||", "?", ";", ",", "{", "}", ":")
PALABRAS_CORTE = re.compile(r"\b(?:return|if|while|var|let|const)\b")
LOCALE = re.compile(r"\blocaleCompare\b")
CLAVE = re.compile(r"\[\s*(?:[A-Za-z_$][\w$]*\.)?\b" + _MIN + r"\b\s*\]")
RESOLVEDOR = re.compile(r"\b(_getClanTagByName|_normalizarNombreClan_)\s*\(")
DEFINICION = re.compile(r"\bfunction\s+(_getClanTagByName|_normalizarNombreClan_)\b")
TAG = re.compile(r"tag", re.I)


def _lado_der(texto, pos):
    """Operando a la derecha del operador: hasta un separador del mismo nivel o un `)` que lo cierra."""
    prof, i = 0, pos
    while i < len(texto):
        c = texto[i]
        if c in "([":
            prof += 1
        elif c in ")]":
            if prof == 0:
                break
            prof -= 1
        elif prof == 0 and (texto.startswith(SEPARADORES, i) and not texto.startswith("::", i)):
            break
        i += 1
    return texto[pos:i]


def _lado_izq(texto, pos):
    """Operando a la izquierda del operador: hasta un separador del mismo nivel o un `(` que lo abre."""
    prof, i = 0, pos - 1
    while i >= 0:
        c = texto[i]
        if c in ")]":
            prof += 1
        elif c in "([":
            if prof == 0:
                break
            prof -= 1
        elif prof == 0 and c in "&|?;,{}:":
            break
        i -= 1
    tramo = texto[i + 1:pos]
    m = None
    for m in PALABRAS_CORTE.finditer(tramo):
        pass
    return tramo[m.end():] if m else tramo


def _es_comentario(texto):
    t = texto.strip()
    return t.startswith(("//", "/*", "*", "<!--"))


CADENA = re.compile(r"'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"")


def _sin_cadenas(texto):
    """Vacía el contenido de los textos entre comillas ('=== ' no es una comparación); deja '' y "" tal cual."""
    return CADENA.sub(lambda m: m.group(0)[0] * 2 if len(m.group(0)) == 2 else m.group(0)[0] + "x" + m.group(0)[0], texto)


def _quitar_comentario_final(texto):
    """Quita un comentario `// ...` al final de la línea (sin tocar `://` de una URL)."""
    m = re.search(r"(?<!:)//", texto)
    return texto[:m.start()] if m else texto


def revisar(texto):
    """Devuelve la lista de tipos marcados en una línea de código."""
    if MARCA_OK in texto or _es_comentario(texto):
        return []
    codigo = _quitar_comentario_final(_sin_cadenas(texto))
    tipos = []
    # [comparacion]
    for op in OPERADOR.finditer(codigo):
        izq, der = _lado_izq(codigo, op.start()), _lado_der(codigo, op.end())
        if not (CLAN_ID.search(izq) or CLAN_ID.search(der)):
            continue
        if TAG.search(izq) or TAG.search(der):
            continue
        if VACIO.search(izq) or VACIO.search(der):
            continue
        tipos.append("comparacion")
        break
    # [orden]
    if LOCALE.search(codigo) and CLAN_ID.search(codigo):
        tipos.append("orden")
    # [clave]
    if CLAVE.search(codigo):
        tipos.append("clave")
    # [resolvedor]: se marca el uso, no la definición
    if RESOLVEDOR.search(codigo) and not DEFINICION.search(codigo):
        tipos.append("resolvedor")
    return tipos


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


def main(argv):
    base, rutas, resumen, i = "HEAD", [], False, 0
    while i < len(argv):
        if argv[i] == "--base" and i + 1 < len(argv):
            base = argv[i + 1]
            i += 2
        elif argv[i] == "--resumen":
            resumen = True
            i += 1
        else:
            rutas.append(argv[i])
            i += 1
    lineas = lineas_de_archivos(rutas) if rutas else lineas_agregadas(base)
    hallazgos = []
    for archivo, nro, texto in lineas:
        ruta = "/" + archivo
        if not archivo.endswith(EXTENSIONES) or any(o in ruta for o in OMITIR):
            continue
        tipos = revisar(texto)
        if tipos:
            hallazgos.append((archivo, nro, tipos, texto))
    if resumen:
        por_archivo, por_tipo = {}, {}
        for archivo, _n, tipos, _t in hallazgos:
            por_archivo[archivo] = por_archivo.get(archivo, 0) + 1
            for t in tipos:
                por_tipo[t] = por_tipo.get(t, 0) + 1
        for a, c in sorted(por_archivo.items(), key=lambda x: (-x[1], x[0])):
            print("%4d  %s" % (c, a))
        print("\nPor tipo: " + ", ".join("%s %d" % (t, c) for t, c in sorted(por_tipo.items())) +
              " (líneas con candidatas: %d)" % len(hallazgos))
        return 1 if hallazgos else 0
    for archivo, nro, tipos, texto in hallazgos:
        print("%s:%d: [%s] %s" % (archivo, nro, ", ".join(tipos), texto.strip()[:160]))
    if hallazgos:
        print("\nHay candidatas de comparación de clanes por nombre: revisarlas a mano. Si el nombre es correcto a "
              "propósito, comentar en la misma línea `// %s: <motivo>`. Regla: Consolidado_Clanes_por_Tag.md, "
              "sección 1, criterios 1 y 8." % MARCA_OK)
        return 1
    print("OK: sin comparaciones de clanes por nombre en lo revisado.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
