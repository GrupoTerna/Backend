# Backend — Grupo Terna

Repositorio del backend del sistema de Grupo Terna (Apps Script sobre Google Sheets y Drive), más el material que lo acompaña. El frontend vive en el repo `GrupoTerna/Web`.

**Si tienes una duda sobre cómo funciona el sistema, empieza por [`Contexto_Base_Web.md`](Contexto_Base_Web.md).** Es el archivo unificado con el funcionamiento (backend, frontend y Tampermonkey) y las decisiones tomadas o descartadas, cada una con su motivo. Pesa varios MB: no se lee entero, se busca con `grep` o con la búsqueda de GitHub (por ejemplo, `PLAYERS_API_ENABLED` o `§PF021`).

## Qué hay en cada carpeta

| Carpeta o archivo | Qué contiene | Cómo tratarlo |
|---|---|---|
| `Base/` | El código del backend: un `.gs` por archivo de Apps Script en `Base/src/`, y el consolidado de todos en `Base/respaldo/Base.gs`. | Leer y editar solo `Base/src/`. Para encontrar una función, mira `Base/INDICE_FUNCIONES.md` y abre solo el archivo que toque. |
| `Generador/` | El proyecto Generador (también Apps Script), que baja `Base` desde Apps Script y lo escribe en este repo. Su código está en `Generador/src/`. | Igual que `Base/`: se edita `Generador/src/`. |
| `Tampermonkey/Tampermonkey.md` | Respaldo del userscript de Tampermonkey. | El código real no vive aquí: se pega en el editor de la extensión. Este `.md` lo actualiza la usuaria a mano y puede estar desfasado. Lo que se edite aquí no llega al navegador. |
| `Consolidados de cambios/` | Los consolidados de cambios por aplicar. Puede haber varios, de distintas sesiones o IA. | Solo cambios por aplicar; se borran al aplicarse. El funcionamiento del sistema no va aquí: va a `Contexto_Base_Web.md`. Las reglas de todos los consolidados están en `Consolidados de cambios/Reglas_Consolidados.md`. |
| `Datos descargados/` | Evidencia que se baja del sistema: JSON de la API, CSV de Drive, exportaciones de Sheets a PDF, etc. Hoy solo tiene la subcarpeta `JSON/`. | Se usa para contrastar contra el código. El repo es público: no subir teléfonos ni otros datos personales. |
| `Claude/` | Skills y cualquier archivo que se cargue a Claude u otras IA: `SKILL.md` y `Plantilla_Token_GitHub.txt` (pasos y bloque de repositorios para dar acceso de escritura con un token temporal; solo marcadores, nunca un token real). | La skill no se instala sola: hay que subirla a mano a Claude. |
| `.github/workflows/` | Validación automática del Generador (`generador-ci.yml`). Solo valida; nunca hace commits. | No tocar sin motivo. |
| `Contexto_Base_Web.md` | Contexto y decisiones del sistema. | Se consulta para cualquier duda y se actualiza con lo que se compruebe o se descarte. |

## Archivos que no se editan a mano

Dentro de `Base/` y `Generador/`, el Generador escribe automáticamente `respaldo/`, `INDICE_FUNCIONES.md` y `LEEME_IA.md`. No se editan a mano y `respaldo/Base.gs` no se lee: repite `src/` y es larguísimo.

## Orden de lectura recomendado

1. `Contexto_Base_Web.md`, buscando por el tema que importe.
2. `Base/INDICE_FUNCIONES.md`, para ubicar la función y su archivo.
3. El archivo puntual de `Base/src/`.
4. Si hay evidencia, la carpeta `Datos descargados/`.

## Cómo llega un cambio del repo a Apps Script

El repo y Apps Script no se sincronizan solos en los dos sentidos. Apps Script escribe en GitHub con `descargarBase()`, y para traer `Base/src/` de GitHub a Apps Script se usa `subirBaseDesdeGithub()`. Antes de editar algo en el equipo, hay que hacer *Fetch* y *Pull* (el Generador también empuja a `main`). Antes de cualquier descarga desde Apps Script, hay que subir primero los cambios hechos en el repo con `subirBaseDesdeGithub()`, o la descarga los pisa.

## Clonar el repo

```
git clone https://github.com/GrupoTerna/Backend.git
```

El repo es público: se puede clonar sin credenciales. Para subir cambios hace falta un acceso con permiso de escritura; sin él, solo se puede leer. Si la sesión de Claude no puede añadir repos, se usa un token fine-grained temporal: ver `Claude/Plantilla_Token_GitHub.txt`. **Nunca se sube un token a este repo.**

## Otros repositorios

- `GrupoTerna/Web` (público): frontend en GitHub Pages.
- `GrupoTerna/Script` (privado): dos archivos, `package.json` y `server.js`, que se usan en Render. No se toca salvo que haga falta cambiar algo de Render.
