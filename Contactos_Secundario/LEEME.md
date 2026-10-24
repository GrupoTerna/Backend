# Contactos_Secundario

Respaldo del proyecto de Apps Script de la **cuenta secundaria** que copia los contactos de Clash Royale desde el Web App de `Base` (cuenta principal) a los contactos de la secundaria.

- Código: `src/Código.gs` (función `SincronizarDesdeWebAPI()`) y `src/appsscript.json` (servicio People). Son los archivos reales del proyecto, escritos por el Generador.
- Origen de los datos: endpoint de contactos de `Base/src/38_Web_Endpoints.gs` (`doGet` sin `?dashboard`, que devuelve `_generarJsonContactos()`).
- Requiere habilitar **People API** en Servicios del proyecto secundario.

## Claves: no van en el código

Este repo es público. La URL del Web App y el token **no se escriben en el archivo**. Se leen de las Propiedades del script del proyecto secundario (Configuración del proyecto > Propiedades del script):

| Propiedad | Qué contiene |
|---|---|
| `URL_CONTACTOS_BASE` | URL del Web App terminada en `/exec`, sin `?token=` |
| `CONTACTOS_TOKEN` | Mismo valor que la propiedad `CONTACTOS_TOKEN` del proyecto `Base` |

Si el Web App responde `{"error":"No autorizado"}`, el valor de `CONTACTOS_TOKEN` del secundario no coincide con el de `Base` (o cambió). Se corrige copiando de nuevo el valor desde `Base`.

## Cómo se sincroniza (desde el 23-oct-2026)

Lo mantiene el Generador, igual que `Base` y `Generador`. `src/`, `respaldo/`, `INDICE_FUNCIONES.md`, `Indice_Contactos_Secundario.md` y `LEEME_IA.md` los **genera el Generador: no se editan a mano**. Este `LEEME.md` sí es manual.

| Función del Generador | Qué hace |
|---|---|
| `descargarContactos()` / `descargarContactosForzado()` | Apps Script -> Drive y GitHub |
| `subirContactosDesdeGithub()` / `subirContactosDesdeGithubForzado()` | GitHub -> Apps Script (deja el proyecto igual a `src/`) |
| `subirContactosDesdeZip()`, `...Txt()`, `...Gs()`, `...Md()` | Drive -> Apps Script |

Requisitos en el Generador: propiedad `SCRIPT_ID_CONTACTOS_SECUNDARIO` (el ID no va en el código) y el proyecto secundario compartido con la cuenta del Generador como editor.

## Notas

- Si cambias el script en Apps Script, corre `descargarContactos()` para actualizar GitHub. Si cambias `src/` en GitHub, corre `subirContactosDesdeGithub()` antes de cualquier descarga, o la descarga pisará el cambio.
- El Generador bloquea la subida si detecta secretos conocidos, pero no reconoce una URL de Web App. Nunca pegues en el código la URL del Web App ni el token: van en las Propiedades del script.
