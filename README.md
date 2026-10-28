# Backend — Grupo Terna

Repositorio del backend del sistema de Grupo Terna (Apps Script sobre Google Sheets y Drive), más el material que lo acompaña. El frontend vive en el repo `GrupoTerna/Web`.

**Si tienes una duda sobre cómo funciona el sistema, empieza por [`Contexto_Base_Web.md`](Contexto_Base_Web.md).** Es el archivo unificado con el funcionamiento (backend, frontend y Tampermonkey) y las decisiones tomadas o descartadas, cada una con su motivo. Pesa más de 1 MB (hoy unos 1,3 MB): no se lee entero, se busca con `grep` o con la búsqueda de GitHub (por ejemplo, `PLAYERS_API_ENABLED` o `§PF021`). Desde el 17-oct-2026 el contexto está en dos archivos: `Contexto_Base_Web.md` (lo vigente: mapa de secciones, abiertos y secciones `PFxxx`) y [`Contexto_Base_Web_Detalle.md`](Contexto_Base_Web_Detalle.md) (el detalle histórico de cada `.gs`, de más de 3 MB, que solo se consulta buscando el bloque `§NNBxxx` que cite un comentario; el «Mapa de bloques por `.gs`» del primero dice dónde está cada uno).

## Qué hay en cada carpeta

| Carpeta o archivo | Qué contiene | Cómo tratarlo |
|---|---|---|
| `Base/` | El código del backend: un `.gs` por archivo de Apps Script en `Base/src/`, y el consolidado de todos en `Base/respaldo/Base.gs`. | Leer y editar solo `Base/src/`. Para encontrar una función, mira `Base/INDICE_FUNCIONES.md` y abre solo el archivo que toque. |
| `Generador/` | El proyecto Generador (también Apps Script): baja `Base` desde Apps Script y lo escribe en este repo, y también trae `Base/src/` y `Generador/src/` de GitHub de vuelta a Apps Script. Su código está en `Generador/src/`. | Igual que `Base/`: se edita `Generador/src/`. |
| `Tampermonkey/Tampermonkey.md` | Respaldo del userscript de Tampermonkey. | El código real no vive aquí: se pega en el editor de la extensión. Este `.md` lo actualiza la usuaria a mano y puede estar desfasado. Lo que se edite aquí no llega al navegador. |
| `Consolidados de cambios/` | Los consolidados de cambios por aplicar (hoy, `Consolidado_Plan_de_Fases.md`; puede haber varios, de distintas sesiones o IA), las reglas que valen para todos (`Reglas_Consolidados.md`) y dos scripts de Python para mantener el contexto: `verificar_contexto.py` y `mover_bloques.py`. | Un consolidado solo trae cambios por aplicar y se borra al aplicarse, previa confirmación de la usuaria. El funcionamiento del sistema no va aquí: va a `Contexto_Base_Web.md`. Las reglas están en `Reglas_Consolidados.md`: léelas antes de crear, leer o editar un consolidado. |
| `Datos descargados/` | Evidencia que se baja del sistema: JSON de la API, CSV de Drive, exportaciones de Sheets a PDF, etc. Hoy tiene las subcarpetas `CSV/` (`Background`, `Hojas`, `Informes`, `Jugador`, `Tampermonkey`), `JSON/` (`Anomalías`, `Endpoints`, `Guerra`, `Otros`, `RoyaleAPI`) y `Otros formatos/`. | Se usa para contrastar contra el código. El repo es público: no subir teléfonos ni otros datos personales; si aparece un archivo con teléfonos o celulares, se avisa de inmediato para quitarlo. |
| `Claude/` | Skills y cualquier archivo que se cargue a Claude u otras IA: `SKILL.md` y `Plantilla_Token_GitHub.txt` (pasos y bloque de repositorios para dar acceso de escritura con un token temporal; solo marcadores, nunca un token real). | La skill no se instala sola: hay que subirla a mano a Claude. |
| `.github/workflows/` | Validación automática del Generador (`generador-ci.yml`). Solo valida; nunca hace commits. | No tocar sin motivo. |
| `Contexto_Base_Web.md` y `Contexto_Base_Web_Detalle.md` | Contexto y decisiones del sistema; el segundo guarda el detalle histórico por `.gs`. | Se consultan para cualquier duda. Se actualiza `Contexto_Base_Web.md` con lo que se compruebe o se descarte; el de detalle no se edita (las correcciones van en una sección `PFxxx` del principal). Tras tocar el contexto, corre `python3 "Consolidados de cambios/verificar_contexto.py"`: debe terminar en «OK». |

## Archivos que no se editan a mano

Dentro de `Base/` y `Generador/`, el Generador escribe automáticamente `respaldo/`, `INDICE_FUNCIONES.md` y `LEEME_IA.md`. No se editan a mano y `respaldo/Base.gs` no se lee: repite `src/` y es larguísimo.

## Orden de lectura recomendado

1. `Contexto_Base_Web.md`, buscando por el tema que importe (y, si cita un bloque `§NNBxxx`, el detalle en `Contexto_Base_Web_Detalle.md`).
2. `Base/INDICE_FUNCIONES.md`, para ubicar la función y su archivo.
3. El archivo puntual de `Base/src/`.
4. Si hay evidencia, la carpeta `Datos descargados/`.
5. Si el trabajo parte de un consolidado, antes de tocarlo `Consolidados de cambios/Reglas_Consolidados.md`.

## Cómo llega un cambio del repo a Apps Script

El repo y Apps Script no se sincronizan solos en los dos sentidos. Apps Script escribe en GitHub con `descargarBase()`, y para traer `Base/src/` de GitHub a Apps Script se usa `subirBaseDesdeGithub()`. Antes de editar algo en el equipo, hay que hacer *Fetch* y *Pull* (el Generador también empuja a `main`). Antes de cualquier descarga desde Apps Script, hay que subir primero los cambios hechos en el repo con `subirBaseDesdeGithub()`, o la descarga los pisa. Con el Generador pasa lo mismo: `subirGeneradorDesdeGithub()` antes de `descargarGenerador()`. Ojo con el nombre: «subir» significa subir a Apps Script; las variantes `…Forzado()` omiten la salvaguarda de «`src/` incompleta».

## Dónde se registra cada cambio

- **Código:** el del frontend va al repo `Web`; el de Apps Script a `Base/src/` o `Generador/src/` de este repo; el de Tampermonkey a `Tampermonkey/Tampermonkey.md`. Todo directo a `main`, en commits pequeños y con mensaje claro.
- **Funcionamiento y decisiones** (cómo funciona algo, por qué se decidió, qué se probó y se descartó, qué quedó sin probar): `Contexto_Base_Web.md`, en el mismo momento del cambio.
- **Historial de lo hecho en el frontend:** `CHANGELOG.md` del repo `Web`. Este repo no tiene `CHANGELOG.md`: su historial son los mensajes de commit, los bloques `AVISOS ABIERTOS` de los `.gs` y el contexto.
- **Fechas:** las que se escriben en documentos e historiales son las de Lima (UTC-5), no la hora UTC del commit; entre las 19:00 y las 23:59 de Lima, la fecha UTC ya es la del día siguiente.
- El detalle completo está en la sección 6 de `Consolidados de cambios/Reglas_Consolidados.md`.

## Clonar el repo

```
git clone https://github.com/GrupoTerna/Backend.git
```

El repo es público: se puede clonar sin credenciales. Para subir cambios hace falta un acceso con permiso de escritura; sin él, solo se puede leer. Si la sesión de Claude no puede añadir repos, se usa un token fine-grained temporal: ver `Claude/Plantilla_Token_GitHub.txt`. **Nunca se sube un token a este repo.**

## Otros repositorios

- `GrupoTerna/Web` (público): frontend en GitHub Pages. Tiene su propio `README.md` y su `CHANGELOG.md` (checklist corto de lo hecho, por fecha y archivo).
- `GrupoTerna/Script` (privado): el proxy de Clash Royale que se usa en Render (`package.json` y `server.js`), con su propio `README.md`. No se toca salvo que haga falta cambiar algo de Render, y se avisa antes de subir porque un push puede redesplegar el servidor.
