# Contactos_Secundario

Respaldo del proyecto de Apps Script de la **cuenta secundaria** que copia los contactos de Clash Royale desde el Web App de `Base` (cuenta principal) a los contactos de la secundaria.

- Código: `src/Sincronizador_Correo_Secundario.gs` (función `SincronizarDesdeWebAPI()`).
- Origen de los datos: endpoint de contactos de `Base/src/38_Web_Endpoints.gs` (`doGet` sin `?dashboard`, que devuelve `_generarJsonContactos()`).
- Requiere habilitar **People API** en Servicios del proyecto secundario.

## Claves: no van en el código

Este repo es público. La URL del Web App y el token **no se escriben en el archivo**. Se leen de las Propiedades del script del proyecto secundario (Configuración del proyecto > Propiedades del script):

| Propiedad | Qué contiene |
|---|---|
| `URL_CONTACTOS_BASE` | URL del Web App terminada en `/exec`, sin `?token=` |
| `CONTACTOS_TOKEN` | Mismo valor que la propiedad `CONTACTOS_TOKEN` del proyecto `Base` |

Si el Web App responde `{"error":"No autorizado"}`, el valor de `CONTACTOS_TOKEN` del secundario no coincide con el de `Base` (o cambió). Se corrige copiando de nuevo el valor desde `Base`.

## Notas

- Este proyecto **no lo sincroniza el Generador**: el código se copia aquí a mano. Al cambiar el script en Apps Script, hay que actualizar este archivo (sin pegar la URL ni el token).
- Antes de subir una versión nueva, comprobar que el archivo no contenga `?token=` con un valor, ni una URL `script.google.com/macros/s/...`, ni teléfonos.
