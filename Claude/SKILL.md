---
name: md
description: >-
  Trabajo con el ecosistema de código del clan: backend Apps Script (Base y Generador),
  frontend Web, script de Tampermonkey y consolidados de fases. El código vive en los repos
  de GitHub GrupoTerna (Backend, Web, Script) y los cambios se suben directo a main. Usar al
  leer, corregir o ampliar esos archivos, o al editar el contexto, los consolidados o esta
  skill. Responde en español de Perú.
---

# Skill: `md` — lectura, corrección y consolidados de fases de proyectos en .md/.zip

**Versión de esta skill: 27-oct-2026 (commit en `Claude/SKILL.md` del repo `Backend`).** Si la copia instalada muestra una fecha anterior, hay que reinstalarla desde ese archivo. Al editar la skill, se actualiza esta fecha.

## Idioma

Responder siempre en **español de Perú**. Evitar modismos, léxico o entonación de español de Argentina u otras variantes regionales.

**La regla vale también para todo lo que se escribe en los archivos, no solo para el chat** (desde el 18-oct-2026; `Contexto_Base_Web.md §PF106`): textos visibles de HTML y JS (botones, avisos, errores), comentarios, `CHANGELOG.md`, contexto, consolidados y esta skill. Claude tiende a caer en español rioplatense (Argentina o Uruguay) y, escrito en el código o la interfaz, lo lee todo el clan peruano.

- **Tuteo, nunca voseo:** «gira», «usa», «agrega», «vuelve», «revisa», «inténtalo», «puedes», «tienes», «quieres», «sigue», «marca», «abre». Nada de «girá», «usá», «agregá», «podés», «tenés», «querés», «seguí», «sos», «vos».
- **Imperativo con pronombre: también tuteo y con la tilde que corresponde** («agrégalo», «déjalo», «revísalo»). Las formas voseantes («agregalo», «dejalo», «revisalo», «fijate», «avisame») **no llevan tilde**, así que una búsqueda solo por vocales acentuadas **no las encuentra**.
- **Léxico:** «aquí» en vez de «acá» en textos nuevos; sin «che», «dale», «laburo», «plata» (por dinero), «pibe», «boludo» ni similares.
- **Antes de entregar un archivo con texto nuevo**, buscar en él formas terminadas en `-ás`, `-és`, `-ís`, imperativos con tilde final (`-á`, `-é`, `-í`), verbo + `lo/la/los/las/me/te/se` sin tilde, y el léxico anterior. Ojo con falsos positivos como `'activate'` de `sw.js`. **Se automatiza con `python3 -I "Consolidados de cambios/verificar_idioma.py"` (desde la raíz del repo, antes del commit): revisa solo las líneas agregadas respecto de `HEAD` (o de `--base origin/main`) y lista las candidatas; hay que mirarlas a mano, porque formas como «estás» son tuteo válido. Con rutas como argumento revisa archivos completos.**
- **Si una frase ya existente tiene voseo y no es parte del pedido, se avisa** en lugar de dejarla; si es un texto de interfaz, se corrige en la misma tanda y se anota en el `CHANGELOG.md`.

---

# 0. Repositorios, entrega por GitHub y reglas nuevas (actualizado el 10-oct-2026; tiene precedencia sobre lo que contradiga más abajo)

> **Entrega de archivos:** los archivos modificados se **suben directo a GitHub** y se da la lista de archivos tocados; solo se entregan como archivo descargable si el usuario lo pide expresamente (nunca como bloque de código en el chat). Esto manda sobre cualquier mención de «archivo descargable» en el resto de la skill. **Sigue vigente todo lo demás:** archivo completo, sin parches, nombre exacto, solo los archivos realmente modificados, sin comillas inversas en los `.gs`, español de Perú.

## 0.1 Los tres repositorios (GitHub, `GrupoTerna`)

- **`GrupoTerna/Backend`** (público). Carpetas: `Base/` y `Generador/` (cada una con `src/` = los `.gs` individuales, que son **lo único que Claude edita**; y `respaldo/`, `INDICE_FUNCIONES.md`, `Indice_<Nombre>.md`, `LEEME_IA.md` = archivos **generados por Apps Script** al descargar, que **Claude nunca edita**); `Tampermonkey/Tampermonkey.md`; `Claude/SKILL.md` (copia de esta skill); `Consolidados de cambios/` (consolidados de fases); `Contexto_Base_Web.md` (contexto unificado del sistema); `Datos descargados/` (subcarpetas con archivos de Drive o logs que la usuaria sube para contrastarlos con el código).
- **`GrupoTerna/Web`** (público): el frontend, publicado en GitHub Pages. Tiene su propio `CHANGELOG.md`.
- **`GrupoTerna/Script`** (privado): **exclusivo de Render**; contiene solo `package.json` y `server.js`. **No se usa**, salvo que (1) haya que modificar algo relacionado con Render, (2) haya que modificar necesariamente uno de esos dos archivos o (3) falte agregar un archivo al repo para Render. Claude **no lo toca por iniciativa propia**, y **avisa antes de subir** porque un push puede redesplegar el servidor. No tiene README todavía.
- Cada repo se adjunta a la sesión por separado y **con permiso de escritura** para poder subir; sin eso solo se puede leer (si falta, ver 0.7). El repo `Backend` figura a veces como `backend`: GitHub redirige.

## 0.2 Entrega: se sube directo a GitHub

- Para modificar o crear un archivo de los repos, Claude lo edita en el clon del repo y **lo sube directamente a `main`**, en commits pequeños y con mensaje claro. Antes de subir trae lo remoto (`fetch` y `rebase`), porque el Generador también empuja a `main`.
- **Cada cambio se sube a GitHub en cuanto se termina, sin esperar al final de la tanda (regla de la usuaria, 24-oct-2026).** Las tandas suelen ser largas: la sesión local avanza bastante, pero se agota antes de enviar y al repositorio no llega ningún avance. Por eso, **apenas termina un cambio** (un archivo o un grupo de archivos que van juntos), Claude lo verifica, hace `fetch` y `rebase`, hace el commit y el push, y **recién entonces sigue con los otros cambios de la misma tanda**; nunca acumula varios cambios terminados para subirlos todos juntos al final. **El contexto (`Contexto_Base_Web.md`, y con él el `CHANGELOG.md` o el consolidado que corresponda) sí se edita al final de la tanda**, una sola vez y con todo lo de la tanda, y se sube en su propio commit; esa es la única excepción. Si la sesión se corta a mitad, lo ya subido queda en `main` y el contexto pendiente se rehace en la sesión siguiente a partir de los commits.
- **No genera el archivo para descargar ni usa la herramienta de enviar archivos, a menos que la usuaria lo pida expresamente.** Si ya se envió un archivo una vez y la aplicación vuelve a mostrar su tarjeta, no es porque Claude lo haya enviado de nuevo: no debe afirmar de dónde viene la tarjeta si no lo sabe.
- **Al terminar cada tanda da la lista de archivos modificados o creados** (ruta, estado «modificado» o «creado» y commit), y si subió cambios a un repo que la usuaria tiene en GitHub Desktop, añade «Pendiente de pull en GitHub Desktop: <repo> (commit xxxxxxx)». Claude no ve el equipo de la usuaria; solo sabe lo que él subió.
- Si no se puede subir (por permiso o por error), lo dice y pregunta; no sustituye la subida por un archivo descargable sin avisar. Si el motivo es que la sesión no tiene permiso de escritura, ver 0.7.
- Los repos `Backend` y `Web` son **públicos**: nunca se escriben tokens, claves ni datos personales en el código ni en los documentos.
- **Fechas de lo que se escribe (20-oct-2026):** son las de Lima (UTC-5), no la hora UTC del commit ni la del contenedor; entre las 19:00 y las 23:59 de Lima, la fecha UTC ya es la del día siguiente. Detalle en `Consolidados de cambios/Reglas_Consolidados.md`, sección 6.

## 0.3 Cómo se sincronizan Apps Script y GitHub (verificado en `Generador/src/01_Principal.gs` y `08_GitHub.gs`; evita pisar cambios)

- **Apps Script → GitHub:** `descargarBase()` y las funciones `subirBase…` desde zip, txt, gs o md terminan escribiendo en un solo commit todo `Base/src/`, `respaldo/`, `INDICE_FUNCIONES.md`, `Indice_Base.md` o `Indice_Generador.md` y `LEEME_IA.md`; `descargarGenerador()` hace lo mismo con `Generador/`. Si detecta posibles secretos en el código, bloquea la subida.
- **GitHub → Apps Script, para `Base` y para `Generador`** (ver `Contexto_Base_Web.md` PF074). `subirBaseDesdeGithub()` (y `subirBaseDesdeGithubForzado()`, sin la salvaguarda de «src/ incompleta») deja el proyecto de Apps Script **exactamente igual a `Base/src/`; lo que no esté en GitHub se elimina del proyecto.** Antes guarda en Drive `Base_antes_de_GitHub.zip`. **`subirGeneradorDesdeGithub()` (y `subirGeneradorDesdeGithubForzado()`) hace lo mismo con `Generador/src/`** (usan `_githubTraerAProyectoApps_()` de `08_GitHub.gs`), guarda antes `Generador_antes_de_GitHub.zip` y se detiene si `src/` trae menos de la mitad de los `.gs` o si no trae `_githubTraerAProyectoApps_` (el Generador quedaría sin poder volver a traer GitHub). **Ojo con el nombre:** «subir» significa subir a Apps Script; **no existe** `descargarGeneradorDesdeGithub()`. Se autoreemplaza: la primera corrida real (14-oct-2026) funcionó y dejó el código nuevo activo.
- **Aviso de «pull pendiente» (desde el 21-oct-2026, `08_GitHub.gs`):** antes de escribir en GitHub, `_githubSincronizar_` compara el último commit que el Generador trajo o escribió (propiedades `GITHUB_ULTIMO_COMMIT_Base` y `GITHUB_ULTIMO_COMMIT_Generador`) con el de `main`. Si cambió algo dentro de `Base/` (o `Generador/`) que no trajo, **bloquea** y dice qué hacer: `subirBaseDesdeGithub()` / `subirGeneradorDesdeGithub()` para traerlo, o `descargarBaseForzado()` / `descargarGeneradorForzado()` para pisarlo. Los commits que solo tocan el contexto, los consolidados o la otra carpeta no bloquean (`GITHUB_AVISO_SOLO_CARPETA_`). La primera vez, sin referencia, no bloquea. Detalle y pendientes: `Contexto_Base_Web.md §PF150`. **Esto no sustituye el recordatorio de abajo:** el aviso solo evita el pisado, no trae nada. **Comprobación justo antes del commit de cierre (desde el 25-oct-2026, `08_GitHub.gs`, `_githubCommitArchivos_` con el parámetro `guardia`; `Contexto_Base_Web.md §PF273`):** entre la revisión de arriba y el commit final pasan unos segundos, y un cambio subido a `<Nombre>/` en ese tramo se pisaba. Ahora, si `main` se movió y lo nuevo toca `<Nombre>/` (o no se puede comparar), no se escribe nada y el registro dice «COMMIT NO ESCRITO». En `subirBaseDesdeGithub()` y `subirGeneradorDesdeGithub()` (y las forzadas) **se trae lo nuevo y se reintenta**, hasta 3 intentos en total; el respaldo `<Nombre>_antes_de_GitHub.zip` se hace solo en el primero. Si tras el tercero la rama sigue moviéndose, no escriben el commit de cierre y hay que volver a correr la función. En las descargas y en `subir…DesdeZip/Txt/Gs/Md` solo se bloquea, sin reintentar. Con las `…Forzado` no hay guardia. **Claude no sube a `<Nombre>/src/` mientras corre una de estas funciones**, aunque la guardia ya evite el pisado.
- **`Indice_Base.md` e `Indice_Generador.md` (desde el 21-oct-2026, `02_Backstage.gs`, `_guardarIndiceArchivos_`):** en cada descarga o subida el Generador los reemplaza en la carpeta de respaldos de Drive de cada proyecto y en GitHub (`Base/Indice_Base.md`, `Generador/Indice_Generador.md`). Traen una tabla con N.º automático, nombre del archivo y estado respecto de la tanda anterior (permanece igual, modificado, creado o eliminado; «modificado» solo para los que no se crearon ni eliminaron en esa tanda). Claude **no los edita** (son generados) y los puede leer para saber qué cambió en la última tanda; en GitHub solo se reescriben cuando cambió el código, así que el estado que muestran es el de la última tanda con cambios. Detalle: `Contexto_Base_Web.md §PF151`.
- **Riesgo que Claude debe prevenir:** si Claude sube un cambio a `Base/src/` y, antes de correr `subirBaseDesdeGithub()`, la usuaria corre `descargarBase()` u otra función `subirBase…`, **el estado viejo de Apps Script se escribe encima del cambio en GitHub**. Por eso, **cada vez que Claude cambie algo en `Base/src/`, debe recordar al final de la tanda: «corre `subirBaseDesdeGithub()` antes de cualquier descarga»**. **Con `Generador/src/` pasa lo mismo:** debe recordar «corre `subirGeneradorDesdeGithub()` antes de correr `descargarGenerador()`»; ya no hay que pasar los archivos a mano. Solo se pasan a mano si esa función falla.

- **Estado de prueba de estas piezas:** si funcionan o siguen sin probarse en Apps Script real se registra en «Abiertos» del contexto (`§PF150`, `§PF151`, `§PF273`), no aquí.

## 0.4 El archivo de contexto: `Contexto_Base_Web.md`

- Es **el archivo unificado que concentra toda la lógica de funcionamiento del sistema**: backend, frontend y Tampermonkey. Va ahí **el funcionamiento** y **la información que sirva para tomar decisiones futuras y prevenir errores**; también **las decisiones sobre fallos**: cuando una decisión salió mal y se tomó otra para corregirla, pero por defecto se sugeriría la primera, se deja escrito **por qué no se debe hacer, que ya se probó y no funcionó**, y la evidencia, para evitar decisiones equivocadas o que no corresponden con la evidencia.
- **Desde el 17-oct-2026 el contexto está en dos archivos (corrección de lo anterior, regla 9: antes era uno solo).** `Contexto_Base_Web.md` (≈1 MB) es lo vigente y lo que se lee siempre: cabecera, mapa de secciones PF, equivalencias de nombres `.gs`, **«Mapa de bloques por .gs»**, abiertos, registro del traslado, plan de fases y las 96 secciones PF. `Contexto_Base_Web_Detalle.md` (≈3,3 MB) guarda los bloques «Detalle (texto original, sin cambios)» de cada `.gs`; **no se carga entero**: se busca ahí el bloque `§Bxxx` que cite un `.gs` (el «Mapa de bloques por .gs» dice en qué archivo está cada uno). Los comentarios de los `.gs` siguen citando `Contexto_Base_Web.md §Bxxx`; se resuelven con ese mapa. Para mover bloques entre los dos archivos y comprobar que todo resuelve: `Consolidados de cambios/mover_bloques.py` y `verificar_contexto.py` (correr el verificador antes y después de tocar el contexto).
- **No va ahí** el estado, los pendientes ni el historial de cambios: eso se queda en el consolidado de fases o en el `CHANGELOG.md`.
- Los `.gs`, `.html` y demás quedan con código y, a lo más, una línea corta que remite al contexto (por ejemplo `[→ Contexto_Base_Web.md §Bxxx]`). Así no se pierde nada cuando se suben solo archivos específicos.
- Cuando se contraste un pendiente contra el código, **el registro de la contrastación queda en `Contexto_Base_Web.md`** (qué se verificó, contra qué archivo y versión, en qué fecha y qué se encontró), y en el consolidado se marca lo ya hecho.
- **En curso (desde el 11-oct-2026, por tandas, de lo más reciente a lo más antiguo; `PF025` en adelante):** se migra al contexto lo de funcionamiento que aún está en los archivos del frontend y en el `CHANGELOG.md` del repo `Web`. Primero se mueve y después se recorta. El `CHANGELOG.md` **conserva el historial de cambios como checklist corto, ordenado por fecha**; solo sale de él el funcionamiento y lo que sirva para decidir y prevenir errores. **Dónde se registra cada cambio nuevo** (código por repo, funcionamiento al contexto, historial al `CHANGELOG.md`): `Consolidados de cambios/Reglas_Consolidados.md`, sección 6.

- **Cómo editar el contexto sin fallar (receta, 27-oct-2026).** El archivo pesa más de 2 MB y una herramienta de reemplazo exacto falla si el texto buscado no coincide por completo (tildes, comillas, un salto de línea): la edición se pierde sin dejar rastro y el archivo queda como estaba. Pasos: (1) ubicar el lugar con `grep -n "PFnnn" Contexto_Base_Web.md` y leer esas líneas con `sed -n`, **sin escribir de memoria** el texto a reemplazar; (2) editar con un script de Python que busque con `s.index(...)` un fragmento corto y único y compruebe con `assert` que aparece **una sola vez**; para agregar un punto a una sección PF, insertarlo justo después del punto anterior; (3) correr `Consolidados de cambios/verificar_contexto.py` (debe decir «OK»); (4) recién entonces hacer el commit. Si el `assert` falla, se vuelve a ubicar el texto en vez de insistir con otra variante. La fila de «Abiertos» que ya se resolvió se **quita** (no se deja tachada) y su resultado va como punto de la sección PF.

## 0.5 Consolidados de fases y carpeta `Datos descargados`

- **Todo consolidado de fases se guarda en `Consolidados de cambios/` del repo `Backend`** y se actualiza ahí, no se entrega para descargar. **Sus reglas están en `Consolidados de cambios/Reglas_Consolidados.md`: léelas ahí.**
- **`Datos descargados/`** tiene subcarpetas con archivos de Drive o logs que la usuaria sube para que Claude contraste los JSON, CSV u otros archivos (la evidencia) contra el código. **Regla urgente:** si en un archivo de esa carpeta Claude **ve teléfonos o celulares**, lo trata como urgente: **avisa de inmediato que se quite el archivo del repo, o pide autorización para eliminarlo**, y no copia ese contenido. El repo es público.
- **Si el archivo de datos más reciente no está en GitHub, o la copia de `Datos descargados/` es más vieja, se busca en Drive** (regla dictada por la usuaria el 18-oct-2026). Cuando haga falta un archivo de datos (por ejemplo `Backup_Guerra.csv` o `Correcciones_Guerra.csv`), Claude lo busca con el conector de Google Drive y compara su fecha de modificación y su tamaño con la copia del repo **antes** de trabajar con la copia vieja. **Si el conector no está habilitado, le pide a la usuaria que lo habilite y no sigue sin el dato.** Lo que lea de Drive se trata igual que lo de `Datos descargados/`: si trae teléfonos o celulares, no copia ese contenido y avisa de inmediato; y no copia a los repos (que son públicos) lo que lee de Drive por iniciativa propia. **Límite práctico:** el conector entrega el contenido al chat, no al contenedor donde corren los scripts, así que un CSV grande (el de guerra pasa de 1,9 MB) no cabe; en ese caso Claude lo dice y le pide a la usuaria que suba el archivo al chat o que reemplace el de `Datos descargados/`. *(Esto último se deduce de cómo trabaja el conector; no se probó la descarga.)*

## 0.6 Archivos subidos frente a los repos

- **Qué lugar ocupan `Base.md`, `Web-main.zip`, `Tampermonkey.md` y `Generador.md` frente a los repos.** Provisional, **no confirmado por la usuaria**: la fuente del código actual es el repo; si la usuaria sube alguno de esos archivos, se lee como instantánea y, si difiere del repo, se avisa antes de editar.
- Lo que estaba pendiente sobre README, piezas del Generador y contraste de pendientes **está en `Contexto_Base_Web.md`, sección «Abiertos»** (el estado no se guarda en la skill).

## 0.7 Si la sesión no puede escribir en GitHub: sugerir un token fine-grained (definido el 11-oct-2026)

- Cuando Claude **no tiene el comando de añadir repositorios**, o los repos llegan **sin permiso de escritura**, lo dice y **sugiere generar un token fine-grained** (permisos mínimos, vida corta) en lugar de seguir sin poder subir. Como la usuaria suele borrar los chats, el token se guarda **temporalmente** en un `.txt`, se adjunta al chat y se borra y revoca al terminar.
- La plantilla con los pasos y el bloque de repositorios está en **`Claude/Plantilla_Token_GitHub.txt`** del repo `Backend` (público; solo trae marcadores, nunca un token). Claude la lee de `https://raw.githubusercontent.com/GrupoTerna/Backend/main/Claude/Plantilla_Token_GitHub.txt` y **se la entrega a la usuaria para descargar**; esta es una excepción a 0.2 porque es lo que ella necesita para poder seguir. Si Claude no logra leerla, le dice a la usuaria que la descargue de GitHub. No se copia aquí su contenido, para que viva en un solo lugar.
- **El token nunca se sube a un repo ni se escribe en commits, documentos o respuestas** (los repos son públicos). Claude lo lee del archivo adjunto sin mostrarlo; la usuaria lo borra y lo revoca después.

## 0.8 Al pedir que se ejecute una función de Apps Script: decir en qué archivo y en qué proyecto está (dictada por la usuaria el 25-oct-2026)

*Esta sección no reemplaza ni corrige nada anterior; añade una regla.*

- **Cada vez que Claude le pida a la usuaria que ejecute una función en Apps Script** (incluidos los recordatorios de 0.3: `subirBaseDesdeGithub()`, `subirGeneradorDesdeGithub()`, `descargarBase()`, `descargarGenerador()`, etc.), **dice en qué archivo `.gs` está la función y en qué proyecto: `Base` o `Generador`**, para que ella sepa qué editor de Apps Script abrir. Formato: «corre `subirBaseDesdeGithub()` (proyecto **Generador**, archivo `01_Principal.gs`)».
- **Se verifica, no se dice de memoria.** Antes de nombrar el archivo, buscar la función en el clon actualizado: `grep -rn --include=*.gs -E "function +nombre\b" Base/src Generador/src`. El `INDICE_FUNCIONES.md` de cada carpeta sirve para orientarse, pero es generado y puede ir por detrás de lo último que se subió. Se da el nombre **actual** del archivo (los `.gs` se han renumerado; ver «Equivalencias de nombres de archivo `.gs`» en `Contexto_Base_Web.md`).
- **El nombre de la función no dice el proyecto.** Por ejemplo, `subirBaseDesdeGithub()` y `descargarBase()` trabajan sobre `Base`, pero están en el **Generador** (`01_Principal.gs`); `agregarIdCorreccionesGuerraCSV()` sí está en **Base** (`18_CorreccionGuerra.gs`).
- Si la función existe en los dos proyectos, se indican ambos. Si no se encuentra en ninguno (nombre mal escrito, o función que aún no está subida), Claude lo dice y no inventa el archivo. Si la función la creó o la movió Claude en esa tanda, indica el archivo donde la dejó.

## 0.9 Dónde ubicar el código en los `.gs` (dictada por la usuaria el 27-oct-2026)

*Esta sección no reemplaza ni corrige nada anterior; añade una regla.*

- **Cuándo aplica:** al **crear un archivo `.gs` nuevo** o una **sección o función nueva dentro de un archivo existente**, en cualquiera de los tres proyectos de Apps Script (`Base`, `Generador` y `Contactos_Secundario`). El código nuevo se ubica con estos tres criterios, **en este orden de prioridad**:
  1. **Manual o no manual.** Primero las funciones que la usuaria **corre a mano** desde el editor de Apps Script; después las que **no se ejecutan a mano** (las llaman otras funciones, un activador, la web con `doGet`/`doPost` o la continuación por tandas, y las ayudas internas). Si una función sirve de las dos formas, va con las manuales cuando está pensada para correrse desde el editor, y su comentario lo dice.
  2. **Por temática.** Dentro de cada grupo, las funciones del mismo tema van juntas (por ejemplo, por hoja o por proceso), con un encabezado de comentario que nombra el tema. Las ayudas de una función quedan en el mismo tema, en la parte de las no manuales.
  3. **Por orden de ejecución.** Dentro de cada tema, en el orden en que se espera ejecutarlas (por ejemplo, detectar, luego iniciar, luego reanudar; y los pasos de una cadena en el orden de su lista).
- **Pareja principal–continuación (prioridad sobre los tres criterios, añadida el 27-oct-2026).** Toda función que tenga una función de continuación (`_continuarX`) va **seguida, justo después, por su continuación**: `runAll()` y luego `_continuarRunAll()`; `runReenumerarTemporadas()` y luego `_continuarReenumerarTemporadas()`. La pareja se queda junta y **se ubica según la función principal**, aunque la continuación no sea manual. La continuación se identifica por el **nombre del handler que la cadena le pasa a `_ejecutarPorTandas()` como cuarto argumento** (el que programa el disparador de continuación), no por parecido de nombres: `runSorteos()` pasa `'_continuarRunSorteos'`, `runUpdate()` pasa `'_continuarRunUpdate'`, `runReenumerarTemporadas()` pasa `'_continuarRunReenumerarTemporadas'`. Para una función nueva, se busca en su cuerpo (o en la que arranca la cadena) cuál es ese cuarto argumento.
- **Excepción: `Base/src/00_Main.gs` (el archivo 0) no se reordena.** Ya tiene primero las funciones manuales, con la temática como segundo criterio, y **dentro del grupo manual un orden puesto a mano por seguridad**: primero lo menos costoso de equivocarse. Ejemplo dictado por la usuaria: `cancelarEjecucion()` va antes que `demolerTodoElSpreadsheet()`, porque si se corre por error la primera función precargada en el editor, una cancelación se arregla reanudando y una demolición cuesta mucho más. Al agregar código a ese archivo se respeta esa estructura y ese orden de seguridad; no se aplica el reordenamiento del pendiente de abajo.
- **Las constantes y variables globales** (`var`) quedan arriba del archivo, antes de las funciones. Al comienzo del archivo se deja un comentario con el índice del orden (partes y temas).
- **Al reordenar un archivo existente no se cambia el código de ninguna función.** Antes de subir se comprueba: (a) que cada función quedó **idéntica y una sola vez**, (b) que se conservan las referencias `§` a `Contexto_Base_Web.md` de los comentarios, y (c) la sintaxis (`node --check` sobre una copia `.js`). Si el orden de ejecución es una **deducción** de Claude y no algo confirmado por la usuaria, se anota en el contexto.
- **Los rangos de líneas** de la tabla «Mapa de bloques por .gs» de `Contexto_Base_Web.md` quedan desactualizados al reordenar; los ids `§Bxxx` de los comentarios siguen resolviendo. Se deja constancia en el contexto, pero no se rehacen los rangos.
- **Cómo se aplica este orden a los `.gs` que ya existen** (el avance y lo que falta están en el pendiente `PF285` de «Abiertos» de `Contexto_Base_Web.md`): **por partes pequeñas, ejecutables dentro de una sesión gratuita** (un archivo por parte; si es muy grande, un tramo). **Al terminar cada parte se verifica, se hace el commit y el push a `main` y solo entonces se sigue con la siguiente**, como pide 0.2: la sesión puede cortarse y lo que no se subió se pierde, así que **nunca se acumulan varias partes sin subir, aunque se pueda hacer más trabajo**. **Un commit por cada parte de trabajo** (nunca una sola subida para varias partes); el contexto y el `CHANGELOG.md` se editan **una sola vez por tanda**, al final, en su propio commit (0.2). No hace falta detenerse a informar después de cada parte. El avance queda en los mensajes de commit (empiezan con «Orden de archivo:») y el pendiente del contexto se actualiza al final de la tanda; si la sesión se corta, se retoma con `git log` y la lista de archivos hechos. Después de reordenar un archivo de `Base/src/` hay que recordar «corre `subirBaseDesdeGithub()` antes de cualquier descarga» (0.3), y análogamente para `Generador/src/` y para `Contactos_Secundario/src/` (`subirContactosDesdeGithub()`, proyecto **Generador**, archivo `01_Principal.gs`).

## 0.10 Registro (log) de las cadenas por tandas: pasos con nombre y detalle de avance (dictada por la usuaria el 27-oct-2026)

*Esta sección no reemplaza ni corrige nada anterior; fija como regla lo programado en `Contexto_Base_Web.md §PF269` y `§PF283`, para que el registro se lea siempre igual.*

- **Cuándo aplica:** a toda cadena que use `_ejecutarPorTandas()` (`00_Main.gs`) y a toda cadena nueva: hoy `RUNALL`, `RUNGUERRARAPIDO`, `RUNSORTEOS`, `RUNUPDATE`, `RUNSYNCCSV`, `REENUM` y la de Actualizar roster.
- **1) Los pasos llevan nombre.** Cada cadena tiene `PASOS_<CADENA>` y un `NOMBRES_PASOS_<CADENA>` **en el mismo orden**, que se pasa como **quinto argumento** de `_ejecutarPorTandas()`. Cada texto dice **qué hace el paso y qué resultado se espera al terminarlo** («objeto: acción → resultado»). Si se agrega, quita o mueve un paso, se hace lo mismo con su texto. El registro lo muestra como «Ejecutando paso N/M: <texto>».
- **2) Detalle de información de cada paso.** Todo paso que pueda quedar incompleto (devolver `false`) **anota su avance** con `_anotarProgresoPaso_(texto, acumulado)` justo antes de devolver `false`, y lo escribe en el registro con el mismo patrón que `_reenumProgreso_()` (`47_Migraciones.gs`): una línea con el **acumulado de un total**, el porcentaje, lo hecho **en tandas anteriores** y **lo que falta**; y otra línea con lo hecho **en esta tanda**. La unidad es el objeto que se cuenta (filas, archivos, carpetas, hojas, jugadores…). Los pasos de una sola escritura, donde el avance es 0 o todo, lo dicen en esa forma.
- **3) Lo que agrega el motor** (no se duplica en los pasos): `ESTADO al empezar` (paso POR EMPEZAR o EN CURSO y en qué tanda va), `AVANZÓ`, `SIN AVANCE` o `RETROCEDIÓ` respecto de la tanda anterior, `Paso N/M COMPLETO tras k tandas` y, al cortar por presupuesto de tiempo, `Queda: paso N+1/M POR EMPEZAR`.
- **4) Los textos que se imprimen no llevan pistas para quien lee el código (dictada por la usuaria el 27-oct-2026).** Todo texto que llega al registro, a una hoja o a la interfaz (nombres de pasos, avisos, errores) dice solo lo que le sirve a quien lo lee ahí. Un ejemplo, un nombre de función o una referencia puesta para que Claude ubique el código **no se imprime**: va en un comentario del código o en el contexto. Caso real: el aviso de paso incompleto decía «(presupuesto interno agotado, ej. /players)» y salía también en pasos sin relación con `/players` (`Contexto_Base_Web.md §PF285`, punto 10). Antes de entregar un texto nuevo o tocado, se relee pensando en el paso que más veces lo va a mostrar.
- **Un paso que devuelve `false` sin anotar su avance** hace que el registro diga «este paso no informa su avance interno»; al crear o tocar un paso, se evita ese caso.

## Objetivo

Este proyecto tiene un ecosistema de fuentes de código recurrentes que el usuario sube en distintos momentos, no necesariamente juntas. Por el momento son estas cuatro (puede ampliarse si el usuario incorpora más adelante):

1. **`Base.md`** — consolidado del **backend en Google Apps Script**. Contiene el código completo de múltiples archivos `.gs` (normalmente alrededor de 38), concatenados dentro de un único archivo. El hecho de que la extensión sea `.md` **no significa que deba tratarse como texto libre ni ignorarse**: es, en la práctica, el conjunto real de archivos `.gs` del proyecto.

   `Base` puede descargarse en 4 formatos distintos — `.md`, `.gs`, `.zip` o `.txt` — y los cuatro son igual de válidos como fuente. El usuario suele usar `.md` por comodidad, pero puede subir cualquiera de los otros tres. Aplicar las mismas reglas de esta skill sin importar el formato en que llegue.

   **Caso particular del formato `.zip`:** cuando `Base` se descarga como `.zip`, viene con cada archivo `.gs` por separado **y además** puede incluir un archivo consolidado (típicamente `Script consolidado.gs` o similar) que reúne el código de todos los demás en uno solo, generado automáticamente como respaldo. **Ese consolidado dentro del zip debe ignorarse por completo**: no leerlo, no editarlo, no gastar tokens en él. Es redundante porque su contenido es idéntico a la suma de los demás `.gs` del zip. Esta regla de ignorar el consolidado aplica **únicamente cuando se tiene la versión `.zip` con los archivos `.gs` separados** — cuando la fuente es directamente `Base.md` (o `.txt`), no hay tal consolidado adicional que ignorar, porque el propio `Base.md` ya es el consolidado y es la fuente que sí se debe leer.
2. **`Web-main.zip`** — el **frontend en JavaScript**, descargado directamente del repositorio público de GitHub [GrupoTerna/Web](https://github.com/GrupoTerna/Web). Es el resultado de descargar el repo como zip (de ahí el sufijo `-main`).
3. **`Tampermonkey.md`** — el **script de Tampermonkey**. Tampermonkey no permite subir archivos, así que el usuario usa `.md` únicamente como formato de conveniencia para poder descargar y compartir el código. Esto **no lo convierte en texto libre ni en algo ignorable**: es el código real del script.
4. **`Generador.md`** (o `.gs`/`.zip`/`.txt`) — es el **proyecto Apps Script que genera y sincroniza `Base`**. No es parte del backend de `Base` en sí, sino la herramienta que lo produce. Ver sección "El Generador" más abajo para el detalle de qué es y cuándo se necesita.

La skill debe trabajar sobre el contenido real de estos archivos y modificar **únicamente los archivos puntuales que haga falta**, nunca carpetas, zips ni el consolidado completo. Esos archivos se suben directo a GitHub y se da la lista de archivos tocados (sección 0.2).

## El Generador

`Generador` es un proyecto de Apps Script **independiente y separado de `Base`**, aunque relacionado con él. Es la herramienta que el usuario usa para descargar, subir y sincronizar `Base`. Si en la conversación se menciona "el Generador" sin más contexto, se refiere a este proyecto.

Puntos clave a tener en cuenta:

- El Generador tiene un **Google Sheet/proyecto de Google propio** asociado, y sus propias funciones (`descargarBase`, `subirBaseDesdeZip`, `subirBaseDesdeTxt`, `subirBaseDesdeGs`, `subirBaseDesdeMd`, `descargarGenerador`, `subirGeneradorDesde...`, `eliminarTodosLosArchivosDeBase`, entre otras).
- El Generador puede **descargar `Base` en los 4 formatos a la vez** (`.zip`, `.gs`, `.txt`, `.md`), y también puede **subir cualquiera de esos 4 formatos de vuelta**, sincronizando automáticamente los otros tres.
- El Generador también puede **crear un Google Sheet nuevo desde cero con todo el código de `Base.md`** (o de cualquiera de sus otros formatos), es decir, reconstruir el proyecto de `Base` de la nada a partir del consolidado.
- El propio Generador **también existe en los mismos 4 formatos** (`Generador.md`, `.gs`, `.zip`, `.txt`) y **también está en constante cambio**, igual que `Base.md`, `Web-main.zip` y `Tampermonkey.md`. Se le aplican exactamente las mismas reglas de esta skill: no ignorarlo por ser `.md`, no confundirlo con el portapapeles, no entregar el proyecto completo al modificarlo (solo los archivos puntuales editados), y no dejar comillas inversas ni restos de formato al extraer un `.gs` de `Generador.md`.
- El Generador **también puede traer el mismo "Script consolidado.gs" redundante** cuando se descarga en `.zip` junto con sus `.gs` sueltos; se ignora exactamente por la misma razón explicada en la sección 1bis para `Base`.
- Solo es necesario leer o tocar `Generador.md` cuando el pedido del usuario tenga que ver con el propio Generador (su lógica de descarga/subida/sincronización, o crear un Sheet nuevo desde cero), no cuando el pedido es sobre el código de negocio que vive dentro de `Base`.

## Estos archivos cambian constantemente

`Base.md`, `Web-main.zip`, `Tampermonkey.md` y `Generador.md` están en **constante cambio**: el usuario los vuelve a subir con frecuencia porque el proyecto avanza entre conversación y conversación.

- Nunca asumir que el contenido de estos archivos es el mismo que en una sesión, mensaje o adjunto anterior.
- Cada vez que el usuario suba uno de estos archivos, leerlo de nuevo por completo como si fuera la primera vez, sin apoyarse en memoria de versiones previas.
- Si en la misma conversación se subió antes una versión de alguno de estos archivos y luego se sube una nueva, la nueva versión reemplaza por completo a la anterior como fuente de verdad.

## Consolidados de fases de un plan: uso temporal

Además de las cuatro fuentes anteriores, el usuario suele generar y subir consolidados de cambios por fases (por ejemplo `Consolidado_Cambios_Pendientes_Guerra.md` u otros nombres similares que agrupan un plan de trabajo en varias fases o puntos).

Las reglas de los consolidados (que son temporales y se borran al aplicarse, cómo se compactan, qué referencias llevan, la nota de autoinvocación y las reglas de trabajo 1 a 12) están en **`Consolidados de cambios/Reglas_Consolidados.md`** del repo `Backend`. Búscalas ahí. Todo consolidado se guarda en esa carpeta (sección 0.5) y se lee del archivo, nunca del texto pegado en el chat; no es una fuente permanente del ecosistema.

---

# 1. Fuente de verdad: archivos subidos, nunca el portapapeles

Cuando exista un archivo adjunto llamado `Base.md`, `Web-main.zip`, `Tampermonkey.md` o `Generador.md` (o cualquiera de sus formatos alternativos):

- Abrirlo y leerlo completo, cada uno con su propia lectura (no asumir contenido, verificar archivo por archivo).
- Identificar todos los archivos reales contenidos en él (`.gs` en el caso de `Base` y `Generador`, archivos JS/HTML/CSS del frontend en el caso de `Web-main.zip`, el script en el caso de `Tampermonkey.md`).
- Reconstruir correctamente cada archivo antes de modificarlo.
- Utilizar el contenido del archivo subido como la versión actual del proyecto, sin importar que la extensión sea `.md`, `.zip`, `.gs` o `.txt`.

El texto pegado directamente en el chat **NO sustituye a ningún archivo subido**.

El usuario puede pegar conversaciones, logs, errores, código antiguo, instrucciones o contenido del portapapeles en el chat **en el mismo mensaje en que sube un archivo `.md`**. Esto es una fuente frecuente de error: nunca asumir que el texto pegado en el chat es el contenido del archivo `.md` adjunto, ni mezclar ambos. Son dos cosas distintas:

- **El archivo adjunto** (`Base.md`, `Web-main.zip`, `Tampermonkey.md`, `Generador.md`) → se abre y se lee su contenido real desde el archivo mismo.
- **El texto pegado en el chat** → son instrucciones, contexto, errores o logs del usuario, y se trata como tal.

Antes de responder, si el usuario adjuntó un archivo y también escribió/pegó texto en el mismo mensaje, verificar explícitamente cuál es el contenido de cada uno por separado, sin dar por hecho que coinciden.

## Regla fundamental

**Si `Base.md`, `Web-main.zip`, `Tampermonkey.md` o `Generador.md` están disponibles, el código actual se obtiene de esos archivos, no del texto pegado en el chat.** *(Desde el 10-oct-2026 el código también está en los repos de GitHub, ver sección 0.1; qué manda cuando difieren un archivo subido y el repo está pendiente de confirmar, ver sección 0.6.)*

**Nunca ignorar `Base.md`, `Tampermonkey.md` o `Generador.md` por el hecho de tener extensión `.md`.** Los tres son consolidados de código real (backend Apps Script, script de Tampermonkey, y el proyecto Generador respectivamente), no notas ni documentación libre. Si el propio archivo indica que es un consolidado de archivos `.gs` o el código de un script, se trata como tal.

Nunca confundir una conversación copiada, ni el contenido del portapapeles, con el contenido real de estos archivos.

## Archivos md adicionales: consolidados por fases de un plan

El usuario puede subir también otros archivos `.md` que sean **consolidados por fases de un plan de cambios** (no necesariamente `Base.md`, `Web-main.zip`, `Tampermonkey.md` o `Generador.md`). Estos también deben abrirse y leerse íntegramente como fuente real, aplicando la misma regla: el contenido del archivo se lee del archivo, nunca se asume a partir del texto pegado en el chat en el mismo mensaje. Recordar que, a diferencia de las cuatro fuentes recurrentes, estos consolidados de fases son de uso temporal (ver más arriba).

---

# 1bis. Caso especial: `Base` o `Generador` en formato `.zip` con "Script consolidado.gs"

Cuando el usuario suba `Base` o `Generador` como `.zip` (en vez de `.md`, `.gs` o `.txt`):

- El zip trae cada archivo `.gs` por separado (por ejemplo `01_Principal.gs`, `02_Backstage.gs`, etc.).
- Además puede incluir un archivo consolidado (generado automáticamente, típicamente `Script consolidado.gs`) que reúne el código de todos los `.gs` en uno solo, a modo de respaldo legible.

**Regla:** si dentro del zip existen los archivos `.gs` por separado, **ignorar por completo el consolidado** (no abrirlo, no leerlo, no editarlo, no gastar tokens en él). Trabajar directamente sobre los archivos `.gs` individuales del zip, que son la fuente real.

Esta regla **no aplica** cuando la fuente es el `.md` o `.txt` de `Base`/`Generador` (formato consolidado sin los `.gs` sueltos): en ese caso no hay redundancia que ignorar, porque el propio archivo `.md`/`.txt` es la única fuente disponible y sí debe leerse completo, tal como indica la sección 1.

---

# 2. Formato de los archivos dentro de Base.md

Los archivos están identificados mediante nombres que incluyen un número de orden y el nombre del archivo.

Ejemplos:

- `01_Main.gs`
- `02_Config.gs`
- `03_Utils.gs`
- `04_Setup.gs`

El prefijo numérico forma parte del **nombre real del archivo**.

Por lo tanto:

- `01_Main.gs` es un archivo distinto de `Main.gs`.
- `04_Setup.gs` es un archivo distinto de `Setup.gs`.
- El número inicial nunca debe eliminarse.
- El número inicial nunca debe modificarse.
- El nombre completo debe conservarse exactamente.

La numeración puede no ser consecutiva y no se debe asumir que siempre existen exactamente 24 archivos.

---

# 2bis. Reordenamiento o reagrupación del proyecto completo (distinto de renombrar un archivo)

Las reglas 2, 3 y 9 (no cambiar la numeración, conservar el nombre exacto) se refieren a **ediciones puntuales**: cuando se modifica un archivo por un bug o una fase concreta, ese archivo conserva su nombre y su número tal cual estaban.

Aparte de eso existe una operación distinta: **reordenar o reagrupar el proyecto completo**, es decir, renumerar varios (o todos) los archivos `.gs` de `Base` o `Generador` a la vez para que la numeración vuelva a reflejar un agrupamiento por temática. Esto:

- Es una operación deliberada y explícita, que se hace solo cuando el usuario la pide (por ejemplo "reordena los archivos por tema" o "ya hay varios nuevos sueltos, hay que reagrupar"), nunca como efecto secundario de una edición puntual.
- Ya ocurrió antes en este proyecto, y puede volver a ser necesaria: con el tiempo se agregan archivos `.gs` nuevos que quedan con el siguiente número disponible en vez de ubicarse junto a los archivos de su misma temática, así que el agrupamiento por tema se va perdiendo otra vez hasta la próxima reorganización.
- Cuando se hace, cambia el nombre (el prefijo numérico) de potencialmente muchos archivos a la vez, por lo que cualquier referencia histórica que solo mencione un número (por ejemplo "el archivo 17") puede quedar desactualizada después de un reordenamiento. Ver la sección "Referencias en el changelog: archivo + función, no solo el número" (dentro de la sección 16) para cómo evitar ese problema al documentar cambios.
- Al ejecutar un reordenamiento, entregar la tabla completa de equivalencia (nombre anterior → nombre nuevo) además de los archivos renombrados, para que el usuario pueda actualizar cualquier referencia externa (por ejemplo en un consolidado de fases vigente) que use los nombres anteriores.

---

# 3. Regla absoluta de nombres de archivo

Cuando se descargue, modifique o vuelva a entregar un archivo:

**Debe utilizar exactamente el mismo nombre que tenía originalmente.**

Ejemplo:

Si el archivo original es:

`04_Setup.gs`

el archivo corregido debe entregarse como:

`04_Setup.gs`

No utilizar:

- `Setup.gs`
- `04_Setup_fixed.gs`
- `04_Setup_v2.gs`
- `04_Setup_CORREGIDO.gs`
- `04_Setup_final.gs`
- `04_Setup_new.gs`

No agregar prefijos ni sufijos.

No cambiar mayúsculas/minúsculas.

No cambiar la numeración.

No traducir el nombre.

No eliminar la extensión `.gs`.

## Regla de identidad

**El nombre del archivo es parte de la identidad del archivo y debe preservarse exactamente.**

---

# 4. Archivos nuevos

Si es necesario crear un archivo `.gs` completamente nuevo:

- utilizar un nombre que no exista previamente;
- no duplicar un archivo existente con otro nombre;
- no crear una copia con sufijos como `_new`, `_copy`, `_fixed`, `_v2` o similares;
- conservar la lógica de numeración existente cuando sea necesario determinar el nombre del nuevo archivo.

Si el usuario no ha autorizado la creación de un archivo nuevo y la corrección puede hacerse modificando archivos existentes, preferir modificar los archivos existentes.

---

# 5. Prohibición de confundir archivos

Nunca hacer algo como:

`01_Main.gs` → `Main.gs`

ni:

`04_Setup.gs` → `Setup.gs`

Los prefijos numéricos no son etiquetas decorativas. Son parte del nombre real.

---

# 6. No entregar parches, ni carpetas, ni zips completos

La skill **NO debe entregar parches como resultado final**.

No entregar:

- diffs;
- `git diff`;
- bloques con `+` y `-`;
- fragmentos de funciones;
- fragmentos de archivos;
- instrucciones para reemplazar manualmente código;
- "busca esta línea y cambia...";
- "reemplaza esta función...";
- snippets incompletos;
- fixes que requieran copiar y pegar manualmente.

El resultado debe ser el archivo completo corregido.

## Regla adicional: nunca devolver el proyecto completo

Sin importar cuántos archivos contenga `Base.md` o `Web-main.zip`, **nunca** entregar:

- una carpeta completa;
- un `.zip` con todo el proyecto o con todo el frontend;
- el archivo `Base.md` completo reescrito;
- todos los archivos del proyecto cuando solo algunos fueron modificados.

Modificar y subir **exclusivamente** los archivos puntuales que hayan sido efectivamente editados, salvo que el usuario pida explícitamente el proyecto completo. Se suben a GitHub (sección 0.2); solo se entregan para descargar si el usuario lo pide expresamente.

---

# 7. Archivos modificados: siempre como archivos reales

Los archivos modificados **se suben directo a GitHub** (sección 0.2). Si el usuario pide el archivo para descargar, se entrega como **archivo real descargable y abrible** (con la herramienta de enviar archivos), nunca solo como bloque de código dentro del chat: el usuario debe poder descargarlo, abrirlo, copiarlo y reemplazar el archivo correspondiente en su proyecto. Esto importa sobre todo en archivos largos.

**Archivo modificado = archivo real (subido a GitHub; descargable solo si se pide), nunca un bloque de código en el chat.**

---

# 8. Contenido completo de los archivos modificados

Cada archivo modificado debe contener:

- todo el código original que deba conservarse;
- todas las funciones existentes no afectadas;
- todas las correcciones solicitadas;
- todas las modificaciones necesarias para resolver el problema.

No devolver únicamente las líneas modificadas.

No eliminar código simplemente para reducir el tamaño de la respuesta.

---

# 8bis. Prohibido dejar comillas inversas o comentarios de bloque de código dentro de los .gs

`Base.md` contiene cada archivo `.gs` delimitado visualmente con comillas inversas triples, normalmente así:

```javascript
... código del archivo ...
```

Estas comillas inversas (y la palabra `javascript` que suele acompañarlas) **son parte del formato de presentación de `Base.md`, no son código real**. Apps Script no las reconoce, y si quedan pegadas dentro de un `.gs` entregado, el archivo queda mal formado y el usuario no puede guardarlo en el editor de Apps Script.

Antes de entregar cualquier archivo `.gs` extraído o modificado a partir de `Base.md`, verificar y eliminar:

- comillas inversas triples ```` ``` ```` al inicio o al final del archivo, o en cualquier punto intermedio;
- la etiqueta de lenguaje que suele acompañarlas (```` ```javascript ````, ```` ```js ````, ```` ```html ````, etc.);
- cualquier comentario o marca residual de formato tipo Markdown o HTML que no sea código Apps Script válido (por ejemplo restos de bloques `<!-- -->`, encabezados `#`, o separadores `---` que se hayan colado al copiar el archivo).

El archivo `.gs` final debe contener **únicamente código Apps Script válido**, exactamente como si se hubiera escrito directamente en el editor de Apps Script, sin ningún rastro del formato usado en `Base.md` para separar archivos.

## Regla absoluta

**Un archivo `.gs` entregado nunca debe empezar ni terminar con \`\`\`, ni contener esa secuencia en ningún punto intermedio.**

Si al extraer un archivo de `Base.md` quedan dudas sobre dónde empieza o termina el código real (por ejemplo, límites de bloque mal cerrados), revisar el `Base.md` completo alrededor de ese archivo para ubicar el bloque correcto, en vez de copiar de forma literal e insegura.

---

# 9. Conservación exacta de nombres

Antes de entregar un archivo modificado, verificar:

- nombre;
- numeración;
- extensión;
- mayúsculas/minúsculas.

Ejemplo:

Original:

`04_Setup.gs`

Resultado obligatorio:

`04_Setup.gs`

---

# 10. Flujo obligatorio

## Paso 1 — Detectar archivos fuente

Comprobar si existe algún archivo adjunto llamado `Base.md`, `Web-main.zip`, `Tampermonkey.md`, u otro `.md` que sea un consolidado (por ejemplo, fases de un plan de cambios).

## Paso 2 — Abrir cada archivo fuente por separado

Leer el contenido completo de cada uno, sin mezclarlo con el texto pegado en el chat en el mismo mensaje.

## Paso 3 — Identificar archivos

- En `Base.md`: localizar todos los `.gs` y sus límites.
- En `Web-main.zip`: localizar los archivos JS/HTML/CSS del frontend y sus límites.
- En `Tampermonkey.md`: identificar que es el script completo de Tampermonkey.

## Paso 4 — Registrar nombres

Crear una lista interna de los nombres exactos de los archivos.

Por ejemplo:

- `01_Main.gs`
- `02_Config.gs`
- `03_Utils.gs`
- `04_Setup.gs`

Estos nombres deben utilizarse posteriormente sin modificaciones.

## Paso 5 — Analizar el proyecto

Comprender las relaciones entre los archivos que sean relevantes para el problema.

## Paso 6 — Analizar la solicitud

Utilizar las instrucciones actuales del usuario junto con los errores, logs y demás contexto.

## Paso 7 — Ignorar falsas fuentes de código

Si el chat contiene una conversación copiada, fragmentos antiguos o supuestos fixes, no utilizarlos como sustituto del código actual de `Base.md`.

## Paso 8 — Modificar

Realizar las correcciones directamente sobre los archivos extraídos de `Base.md`.

## Paso 9 — Verificar

Comprobar:

- sintaxis razonable;
- integridad del archivo;
- funciones conservadas;
- ausencia de duplicaciones accidentales;
- coherencia con los demás `.gs`;
- nombre exacto del archivo;
- **ausencia total de comillas inversas, etiquetas de lenguaje o restos de formato Markdown/HTML dentro del `.gs`** (ver sección 8bis).

## Paso 10 — Modificar los archivos en el repo

Se editan físicamente solo los archivos individuales modificados (`.gs`, `.js`, `.md`, etc., según corresponda) en el clon del repo.

Cada archivo debe conservar exactamente su nombre original. Nunca generar un `.zip` ni una carpeta con el proyecto completo.

## Paso 11 — Subir a GitHub y avisar

Subir directo a `main` únicamente los archivos puntuales que hayan sido modificados, salvo que el usuario solicite explícitamente todos los archivos o el proyecto completo. Después dar **la lista de archivos modificados o creados** con su commit, y los recordatorios de la sección 0.3 (por ejemplo correr `subirBaseDesdeGithub()` antes de cualquier descarga). **No se entrega el archivo para descargar salvo pedido expreso.**

---

# 11. Qué hacer cuando el usuario pega una conversación

El usuario puede pegar algo como:

> Usuario: tengo este error...
>
> ChatGPT: prueba este fix...
>
> ```javascript
> function ejemplo() {
>   ...
> }
> ```

Esto **no significa que ese código sea el contenido actual del proyecto**.

Si `Base.md` está disponible:

- `Base.md` contiene la versión actual.
- La conversación pegada contiene contexto.
- El código de la conversación puede utilizarse como referencia si resulta útil.
- Nunca debe reemplazar automáticamente el código de `Base.md`.

---

# 12. Si existe conflicto

Si el código de una conversación pegada contradice el código de `Base.md`:

**usar `Base.md` como código base.**

El usuario puede indicar explícitamente que desea incorporar una modificación proveniente de la conversación; en ese caso, aplicar esa modificación sobre el código actual de `Base.md`, no reemplazar el archivo completo por el fragmento pegado.

---

# 13. Prioridad de información

Cuando exista conflicto entre fuentes:

1. `Base.md` — código actual.
2. Instrucciones actuales explícitas del usuario.
3. Errores y logs actuales.
4. Código o fixes de conversaciones anteriores pegadas en el chat.
5. Suposiciones.

---

# 14. No inventar archivos

No crear archivos `.gs` adicionales simplemente porque una conversación anterior mencione otro archivo.

Primero comprobar los archivos existentes en `Base.md`.

Si realmente se necesita un archivo nuevo:

- verificar que no exista;
- utilizar un nombre nuevo;
- evitar duplicados;
- respetar la convención de numeración del proyecto.

---

# 15. Resultado final esperado

Los archivos corregidos **se suben a GitHub, uno por uno** (nunca como carpeta o zip) y el usuario recibe la lista de archivos tocados; solo se entregan para descargar si los pide. Los ejemplos de abajo sirven para saber **qué archivos** se tocan y con qué nombre.

Ejemplo (backend, desde `Base.md`):

- `01_Main.gs`
- `04_Setup.gs`
- `17_Triggers.gs`

Ejemplo (frontend, desde `Web-main.zip`):

- `main.js`
- `utils.js`

Ejemplo (Tampermonkey):

- `Tampermonkey.md` (o el nombre que tenga el script)

Si esos son los únicos archivos modificados en cada caso, entregar esos archivos completos, sin agrupar en zip ni carpeta.

No entregar:

- `01_Main_fixed.gs`
- `04_Setup_v2.gs`
- `17_Triggers_CORREGIDO.gs`
- `Web-main_fixed.zip`
- `Web-main.zip` completo cuando solo se modificaron uno o dos archivos

No entregar los archivos como bloques de código en el chat. Tampoco se entregan para descargar si el usuario no lo pidió.

---
# 16. Cambios incrementales y continuidad entre sesiones

Los cambios se entregan en tandas chicas e incrementales, para evitar que la sesión se corte sin haber devuelto los archivos. **Cada cambio se sube a GitHub apenas se termina y se continúa con los demás de la misma tanda; el contexto se edita al final de la tanda** (sección 0.2).

No debe perderse información entre una conversación y la siguiente:

- Como el trabajo avanza entre sesiones y el chat se borra antes de empezar una nueva, se busca no perder el contexto de una conversación a otra. Nada se debe perder de un chat a otro.
- Si el usuario explica el comportamiento de algo o da alguna confirmación, eso se documenta de inmediato en el lugar que corresponda según dónde sea relevante la información: el plan de fases vigente, `Base.md`, `Web-main` o, si es funcionamiento del sistema o una decisión que sirva para prevenir errores, `Contexto_Base_Web.md` (ver sección 0.4). No debe quedar solo dicho en el chat.

- **Buscar primero en el contexto lo de guerra (regla 13 de `Consolidados de cambios/Reglas_Consolidados.md`, 24-oct-2026).** Antes de preguntar o suponer algo sobre `currentriverrace`, `periodLogs`, `periodPoints`, `pointsEarned`, `periodIndex`, barcos, cruce de meta, coliseo o correcciones de guerra, hacer `grep -n` de esas palabras en `Contexto_Base_Web.md` y `Contexto_Base_Web_Detalle.md` (sobre todo el bloque `17B004`, «DOCUMENTACIÓN DEL FUNCIONAMIENTO DE LA GUERRA», y §PF185, §PF183, §PF139, §PF160, §PF198). La usuaria ya lo explicó y lo verificó con datos; no se le vuelve a pedir. Sirve también para contrastar hipótesis de las correcciones de guerra.
- **Buscar lo ya escrito antes de suponer, y cruzar todas las fuentes antes de decir «no es concluyente» (regla 14 de `Consolidados de cambios/Reglas_Consolidados.md`, 25-oct-2026; amplía la 13).** Vale para cualquier tema, no solo guerra. Antes de suponer cómo funciona algo, buscar en el contexto, el código, los consolidados y `Datos descargados/`; lo que ya está documentado y validado se usa y se cita, no se vuelve a preguntar. Ante una falla, no responder «no es concluyente» mirando una sola fuente: revisar las fuentes pertinentes y responder con la lista de lo revisado, lo que no se pudo mirar y lo que falta. Para guerra, el mapa de las fuentes (los JSON guardados tal cual son los más confiables; hoja y CSV de guerra son una sola cadena; cuál consultar según la pregunta) está en `Contexto_Base_Web.md §PF239`. La regla vive en un solo lugar: léela ahí.
- **Contrastar con los datos disponibles antes de suponer o ignorar (regla de la usuaria, 23-oct-2026).** Ante una hipótesis o una duda sobre el funcionamiento del juego o de los datos, primero se busca y se contrasta con los archivos que ya hay (`Datos descargados/` del repo `Backend`: JSON, CSV; y Drive si el conector está disponible); no se supone ni se descarta sin mirar. Si los datos necesarios están en Drive y Claude no puede verlos, le dice a la usuaria que los descargue de Drive y los suba a GitHub, y no continúa sobre una suposición.

## Referencias en el changelog: archivo + función, no solo el número

La regla (indicar el nombre exacto del archivo y la función o bloque editado en toda entrada de historial) está en `Consolidados de cambios/Reglas_Consolidados.md`, sección 5.

## Reglas de los consolidados: un solo archivo

Las reglas de trabajo de los consolidados (ciclo de vida, reglas 1 a 14, nota de autoinvocación, compactación y referencias en los historiales) **no están en esta skill**. Están en **`Consolidados de cambios/Reglas_Consolidados.md`** del repo `Backend`: léelas ahí antes de crear, leer o editar un consolidado, y no las copies aquí ni dentro de un consolidado. Una regla propia de un consolidado concreto va en ese consolidado.

**Dónde se registra cada cambio nuevo** (código del frontend a `Web`, de Apps Script y Tampermonkey a `Backend`, funcionamiento al contexto, historial al `CHANGELOG.md`) y el formato del `CHANGELOG.md`: sección 6 del mismo archivo. **Al terminar de aplicar un consolidado, Claude informa y pregunta si se borra** (sección 1); no lo borra sin un sí explícito.

Esas mismas reglas rigen al editar esta skill. Regla propia de la skill: cuando se modifica, se actualiza el `SKILL.md` completo y se sube a `Claude/SKILL.md` del repo `Backend`; la skill que usa la aplicación es la instalada, así que la usuaria debe volver a instalarla desde ese archivo (Claude solo entrega el archivo para descargar si ella lo pide, o si la cuenta no puede escribir en GitHub).

**Antes de subir la skill se valida el frontmatter** (el bloque `---` del inicio). Desde la raíz del repo: `python3 -c "import yaml; t=open('Claude/SKILL.md',encoding='utf-8').read(); d=yaml.safe_load(t.split('---')[1]); assert d['name']=='md' and d['description']; print('OK', len(d['description']))"`. Debe imprimir «OK» y el largo del `description`, que se mantiene por debajo de 1024 caracteres. El `description` va **siempre en bloque `>-`**, con sangría de 2 espacios y sin comillas: una sola comilla sobrante lo rompe y la aplicación rechaza el archivo con «malformed YAML frontmatter». Si el comando falla, no se sube.

# 17. Regla de oro

**`Base.md` = código actual del backend (Apps Script). `Web-main.zip` = código actual del frontend (JS, repo GrupoTerna/Web). `Tampermonkey.md` = código actual del script de Tampermonkey. `Generador.md` = código actual del proyecto que genera y sincroniza `Base`.**

**Ninguno de estos cuatro se ignora ni se reinterpreta por tener extensión `.md` o `.zip`: son código real, no texto libre.**

**El chat = instrucciones y contexto. El texto pegado en el chat nunca sustituye el contenido de un archivo adjunto, aunque se peguen en el mismo mensaje.**

**Los nombres `01_Main.gs`, `04_Setup.gs`, etc. son nombres reales y deben conservarse exactamente.**

**Archivo modificado = archivo completo.**

**Archivo modificado = archivo individual subido a GitHub** (descargable solo si el usuario lo pide expresamente; ver sección 0.2).

**Nunca entregar un parche como sustituto del archivo completo.**

**Nunca entregar una carpeta ni un zip completo: solo los archivos puntuales modificados.**

**Ningún `.gs` entregado debe contener comillas inversas, etiquetas de lenguaje ni restos de formato Markdown/HTML: solo código Apps Script válido.**

**Responder siempre en español de Perú.**