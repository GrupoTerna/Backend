---
name: md
description: >-
  Trabajo con el ecosistema de código del clan: backend Apps Script (Base y Generador),
  frontend Web, script de Tampermonkey y consolidados de fases. El código vive en los repos
  de GitHub GrupoTerna (Backend, Web, Script) y los cambios se suben directo a main. Usar al
  leer, corregir o ampliar esos archivos, o al editar el contexto, los consolidados o esta
  skill. Responde en español de Perú.
---

# Skill: `md` — código del clan en GitHub: lectura, corrección y consolidados de fases

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

# 0. Repositorios, entrega por GitHub y reglas de trabajo (esta sección manda sobre lo que contradiga más abajo)

## 0.1 Los tres repositorios (GitHub, `GrupoTerna`)

- **`GrupoTerna/Backend`** (público). Carpetas: `Base/`, `Generador/` y `Contactos_Secundario/` (cada una con `src/` = los `.gs` individuales, que son **lo único que Claude edita**; y `respaldo/`, `INDICE_FUNCIONES.md`, `Indice_<Nombre>.md`, `LEEME_IA.md` = archivos **generados por Apps Script** al descargar, que **Claude nunca edita**); `Tampermonkey/Tampermonkey.md`; `Claude/SKILL.md` (copia de esta skill); `Consolidados de cambios/` (consolidados de fases); `Contexto_Base_Web.md` (contexto unificado del sistema); `Datos descargados/` (subcarpetas con archivos de Drive o logs que la usuaria sube para contrastarlos con el código).
- **`GrupoTerna/Web`** (público): el frontend, publicado en GitHub Pages. Tiene su propio `CHANGELOG.md`.
- **`GrupoTerna/Script`** (privado): **exclusivo de Render**; contiene solo `package.json` y `server.js`. **No se usa**, salvo que (1) haya que modificar algo relacionado con Render, (2) haya que modificar necesariamente uno de esos dos archivos o (3) falte agregar un archivo al repo para Render. Claude **no lo toca por iniciativa propia**, y **avisa antes de subir** porque un push puede redesplegar el servidor. No tiene README todavía.
- Cada repo se adjunta a la sesión por separado y **con permiso de escritura** para poder subir; sin eso solo se puede leer (si falta, ver 0.7). El repo `Backend` figura a veces como `backend`: GitHub redirige.

## 0.2 Entrega: se sube directo a GitHub

- Para modificar o crear un archivo de los repos, Claude lo edita en el clon del repo y **lo sube directamente a `main`**, en commits pequeños y con mensaje claro. Antes de subir trae lo remoto (`fetch` y `rebase`), porque el Generador también empuja a `main`.
- **Cada cambio se sube a GitHub en cuanto se termina, sin esperar al final de la tanda (regla de la usuaria, 24-oct-2026).** Las tandas suelen ser largas: la sesión local avanza bastante, pero se agota antes de enviar y al repositorio no llega ningún avance. Por eso, apenas termina un cambio (un archivo o un grupo de archivos que van juntos), Claude:
  1. Lo verifica.
  2. Hace `fetch` y `rebase`.
  3. Hace el commit y el push.
  4. **Recién entonces** sigue con los otros cambios de la misma tanda; nunca acumula varios cambios terminados para subirlos todos juntos al final.
- **Única excepción: el contexto.** `Contexto_Base_Web.md` (y con él el `CHANGELOG.md` o el consolidado que corresponda) se edita **al final de la tanda**, una sola vez y con todo lo de la tanda, y se sube en su propio commit. Si la sesión se corta a mitad, lo ya subido queda en `main` y el contexto pendiente se rehace en la sesión siguiente a partir de los commits.
- **No genera el archivo para descargar ni usa la herramienta de enviar archivos, a menos que la usuaria lo pida expresamente.** Si ya se envió un archivo una vez y la aplicación vuelve a mostrar su tarjeta, no es porque Claude lo haya enviado de nuevo: no debe afirmar de dónde viene la tarjeta si no lo sabe.
- **Al terminar cada tanda da la lista de archivos modificados o creados** (ruta, estado «modificado» o «creado» y commit), y si subió cambios a un repo que la usuaria tiene en GitHub Desktop, añade «Pendiente de pull en GitHub Desktop: <repo> (commit xxxxxxx)». Claude no ve el equipo de la usuaria; solo sabe lo que él subió.
- Si no se puede subir (por permiso o por error), lo dice y pregunta; no sustituye la subida por un archivo descargable sin avisar. Si el motivo es que la sesión no tiene permiso de escritura, ver 0.7.
- Los repos `Backend` y `Web` son **públicos**: nunca se escriben tokens, claves ni datos personales en el código ni en los documentos.
- **Fechas de lo que se escribe (20-oct-2026):** son las de Lima (UTC-5), no la hora UTC del commit ni la del contenedor; entre las 19:00 y las 23:59 de Lima, la fecha UTC ya es la del día siguiente. Detalle en `Consolidados de cambios/Reglas_Consolidados.md`, sección 6.

## 0.3 Cómo se sincronizan Apps Script y GitHub (verificado en `Generador/src/01_Principal.gs` y `08_GitHub.gs`; evita pisar cambios)

- **Apps Script → GitHub:** `descargarBase()` y las funciones `subirBase…` desde zip, txt, gs o md terminan escribiendo en un solo commit todo `Base/src/`, `respaldo/`, `INDICE_FUNCIONES.md`, `Indice_Base.md` o `Indice_Generador.md` y `LEEME_IA.md`; `descargarGenerador()` hace lo mismo con `Generador/`. Si detecta posibles secretos en el código, bloquea la subida.
- **GitHub → Apps Script, para `Base` y para `Generador`** (ver `Contexto_Base_Web.md` PF074):
  - `subirBaseDesdeGithub()` (y `subirBaseDesdeGithubForzado()`, sin la salvaguarda de «src/ incompleta») deja el proyecto de Apps Script **exactamente igual a `Base/src/`; lo que no esté en GitHub se elimina del proyecto.** Antes guarda en Drive `Base_antes_de_GitHub.zip`.
  - **`subirGeneradorDesdeGithub()` (y `subirGeneradorDesdeGithubForzado()`) hace lo mismo con `Generador/src/`** (usan `_githubTraerAProyectoApps_()` de `08_GitHub.gs`) y guarda antes `Generador_antes_de_GitHub.zip`. Se detiene si `src/` trae menos de la mitad de los `.gs` o si no trae `_githubTraerAProyectoApps_` (el Generador quedaría sin poder volver a traer GitHub). Se autoreemplaza.
  - **Ojo con el nombre:** «subir» significa subir a Apps Script; **no existe** `descargarGeneradorDesdeGithub()`.
- **Aviso de «pull pendiente» (desde el 21-oct-2026, `08_GitHub.gs`; detalle y pendientes: `Contexto_Base_Web.md §PF150`):**
  - Antes de escribir en GitHub, `_githubSincronizar_` compara el último commit que el Generador trajo o escribió (propiedades `GITHUB_ULTIMO_COMMIT_Base` y `GITHUB_ULTIMO_COMMIT_Generador`) con el de `main`.
  - Si cambió algo dentro de `Base/` (o `Generador/`) que no trajo, **bloquea** y dice qué hacer: `subirBaseDesdeGithub()` / `subirGeneradorDesdeGithub()` para traerlo, o `descargarBaseForzado()` / `descargarGeneradorForzado()` para pisarlo.
  - No bloquean los commits que solo tocan el contexto, los consolidados o la otra carpeta (`GITHUB_AVISO_SOLO_CARPETA_`), ni la primera vez, sin referencia.
  - **Esto no sustituye el recordatorio de más abajo:** el aviso solo evita el pisado, no trae nada.
- **Comprobación justo antes del commit de cierre (desde el 25-oct-2026, `08_GitHub.gs`, `_githubCommitArchivos_` con el parámetro `guardia`; `Contexto_Base_Web.md §PF273`):**
  - Entre la revisión de arriba y el commit final pasan unos segundos, y un cambio subido a `<Nombre>/` en ese tramo se pisaba. Ahora, si `main` se movió y lo nuevo toca `<Nombre>/` (o no se puede comparar), no se escribe nada y el registro dice «COMMIT NO ESCRITO».
  - En `subirBaseDesdeGithub()` y `subirGeneradorDesdeGithub()` (y las forzadas) **se trae lo nuevo y se reintenta**, hasta 3 intentos en total; el respaldo `<Nombre>_antes_de_GitHub.zip` se hace solo en el primero. Si tras el tercero la rama sigue moviéndose, no escriben el commit de cierre y hay que volver a correr la función.
  - En las descargas y en `subir…DesdeZip/Txt/Gs/Md` solo se bloquea, sin reintentar.
  - **Las funciones `…Forzado` no son todas iguales (verificado en `01_Principal.gs` y `08_GitHub.gs`):** `descargarBaseForzado()`, `descargarGeneradorForzado()` y `descargarContactosForzado()` (Apps Script → GitHub) **no tienen guardia ni aviso de «pull pendiente»**: escriben aunque GitHub tenga cambios que no se trajeron, y esos cambios se pierden (quedan solo en el historial de git). `subirBaseDesdeGithubForzado()` y `subirGeneradorDesdeGithubForzado()` (GitHub → Apps Script) solo saltan las salvaguardas de «src/ incompleta» y, en el Generador, la de la función de bajada; **la guardia y los reintentos de arriba siguen funcionando** igual que en las normales.
  - **Claude no sube a `<Nombre>/src/` mientras corre una de estas funciones**, aunque la guardia ya evite el pisado.
- **`Indice_Base.md` e `Indice_Generador.md` (desde el 21-oct-2026, `02_Backstage.gs`, `_guardarIndiceArchivos_`):** en cada descarga o subida el Generador los reemplaza en la carpeta de respaldos de Drive de cada proyecto y en GitHub (`Base/Indice_Base.md`, `Generador/Indice_Generador.md`). Traen una tabla con N.º automático, nombre del archivo y estado respecto de la tanda anterior (permanece igual, modificado, creado o eliminado; «modificado» solo para los que no se crearon ni eliminaron en esa tanda). Claude **no los edita** (son generados) y los puede leer para saber qué cambió en la última tanda; en GitHub solo se reescriben cuando cambió el código, así que el estado que muestran es el de la última tanda con cambios. Detalle: `Contexto_Base_Web.md §PF151`.
- **Riesgo que Claude debe prevenir:** si Claude sube un cambio a `Base/src/` y, antes de correr `subirBaseDesdeGithub()`, la usuaria corre `descargarBase()` u otra función `subirBase…`, **el estado viejo de Apps Script se escribe encima del cambio en GitHub**. Por eso, al final de la tanda Claude recuerda (diciendo proyecto y archivo, como pide 0.8):
  1. Si cambió algo en `Base/src/`: **«corre `subirBaseDesdeGithub()` antes de cualquier descarga»**.
  2. Si cambió algo en `Generador/src/`: **«corre `subirGeneradorDesdeGithub()` antes de correr `descargarGenerador()`»**. Ya no hay que pasar los archivos a mano; solo se pasan a mano si esa función falla.

- **Estado de prueba de estas piezas:** si funcionan o siguen sin probarse en Apps Script real se registra en «Abiertos» del contexto (`§PF150`, `§PF151`, `§PF273`), no aquí.

## 0.4 El archivo de contexto: `Contexto_Base_Web.md`

- Es **el archivo unificado que concentra toda la lógica de funcionamiento del sistema**: backend, frontend y Tampermonkey. Va ahí **el funcionamiento** y **la información que sirva para tomar decisiones futuras y prevenir errores**; también **las decisiones sobre fallos**: cuando una decisión salió mal y se tomó otra para corregirla, pero por defecto se sugeriría la primera, se deja escrito **por qué no se debe hacer, que ya se probó y no funcionó**, y la evidencia, para evitar decisiones equivocadas o que no corresponden con la evidencia.
- **El contexto está en dos archivos.** `Contexto_Base_Web.md` es lo vigente y lo que se lee siempre: cabecera, mapa de secciones PF, equivalencias de nombres `.gs`, **«Mapa de bloques por .gs»**, abiertos, registro del traslado, plan de fases y las secciones PF. `Contexto_Base_Web_Detalle.md` guarda los bloques «Detalle (texto original, sin cambios)» de cada `.gs`; **no se carga entero**: se busca ahí el bloque `§Bxxx` que cite un `.gs` (el «Mapa de bloques por .gs» dice en qué archivo está cada uno). Los comentarios de los `.gs` siguen citando `Contexto_Base_Web.md §Bxxx`; se resuelven con ese mapa. Para mover bloques entre los dos archivos y comprobar que todo resuelve: `Consolidados de cambios/mover_bloques.py` y `verificar_contexto.py` (correr el verificador antes y después de tocar el contexto).
- **No va ahí** el estado, los pendientes ni el historial de cambios: eso se queda en el consolidado de fases o en el `CHANGELOG.md`.
- Los `.gs`, `.html` y demás quedan con código y, a lo más, una línea corta que remite al contexto (por ejemplo `[→ Contexto_Base_Web.md §Bxxx]`). Así no se pierde nada cuando se suben solo archivos específicos.
- Cuando se contraste un pendiente contra el código, **el registro de la contrastación queda en `Contexto_Base_Web.md`** (qué se verificó, contra qué archivo y versión, en qué fecha y qué se encontró), y en el consolidado se marca lo ya hecho.
- **En curso (desde el 11-oct-2026, por tandas, de lo más reciente a lo más antiguo; `PF025` en adelante):** se migra al contexto lo de funcionamiento que aún está en los archivos del frontend y en el `CHANGELOG.md` del repo `Web`. Primero se mueve y después se recorta. El `CHANGELOG.md` **conserva el historial de cambios como checklist corto, ordenado por fecha**; solo sale de él el funcionamiento y lo que sirva para decidir y prevenir errores. **Dónde se registra cada cambio nuevo** (código por repo, funcionamiento al contexto, historial al `CHANGELOG.md`): `Consolidados de cambios/Reglas_Consolidados.md`, sección 6.

- **Cómo editar el contexto sin fallar (receta).** El archivo pesa más de 2 MB y una herramienta de reemplazo exacto falla si el texto buscado no coincide por completo (tildes, comillas, un salto de línea): la edición se pierde sin dejar rastro y el archivo queda como estaba. Pasos:
  1. Ubicar el lugar con `grep -n "PFnnn" Contexto_Base_Web.md` y leer esas líneas con `sed -n`, **sin escribir de memoria** el texto a reemplazar.
  2. Editar con un script de Python que busque con `s.index(...)` un fragmento corto y único y compruebe con `assert` que aparece **una sola vez**; para agregar un punto a una sección PF, insertarlo justo después del punto anterior.
  3. Correr `Consolidados de cambios/verificar_contexto.py` (debe decir «OK»).
  4. Recién entonces hacer el commit.
  - Si el `assert` falla, se vuelve a ubicar el texto en vez de insistir con otra variante.
  - La fila de «Abiertos» que ya se resolvió se **quita** (no se deja tachada) y su resultado va como punto de la sección PF.

## 0.5 Consolidados de fases y carpeta `Datos descargados`

- **Todo consolidado de fases se guarda en `Consolidados de cambios/` del repo `Backend`** y se actualiza ahí, no se entrega para descargar. **Sus reglas están en `Consolidados de cambios/Reglas_Consolidados.md`: léelas ahí.**
- **`Datos descargados/`** tiene subcarpetas con archivos de Drive o logs que la usuaria sube para que Claude contraste los JSON, CSV u otros archivos (la evidencia) contra el código. **Regla urgente:** si en un archivo de esa carpeta Claude **ve teléfonos o celulares**, lo trata como urgente: **avisa de inmediato que se quite el archivo del repo, o pide autorización para eliminarlo**, y no copia ese contenido. El repo es público.
- **Si el archivo de datos más reciente no está en GitHub, o la copia de `Datos descargados/` es más vieja, se busca en Drive** (regla dictada por la usuaria el 18-oct-2026). Cuando haga falta un archivo de datos (por ejemplo `Backup_Guerra.csv` o `Correcciones_Guerra.csv`), Claude lo busca con el conector de Google Drive y compara su fecha de modificación y su tamaño con la copia del repo **antes** de trabajar con la copia vieja. **Si el conector no está habilitado, le pide a la usuaria que lo habilite y no sigue sin el dato.** Lo que lea de Drive se trata igual que lo de `Datos descargados/`: si trae teléfonos o celulares, no copia ese contenido y avisa de inmediato; y no copia a los repos (que son públicos) lo que lee de Drive por iniciativa propia. **Límite práctico:** el conector entrega el contenido al chat, no al contenedor donde corren los scripts, así que un CSV grande (el de guerra pasa de 1,9 MB) no cabe; en ese caso Claude lo dice y le pide a la usuaria que suba el archivo al chat o que reemplace el de `Datos descargados/`. *(Esto último se deduce de cómo trabaja el conector; no se probó la descarga.)*

## 0.6 La fuente del código es el repositorio

- **La fuente del código es el repo** (confirmado por la usuaria): el código está en GitHub, Claude lo lee y lo edita ahí, y la usuaria lo trae después a Apps Script con el Generador (0.3). Los archivos `Base.md`, `Web-main.zip`, `Tampermonkey.md` y `Generador.md`, que antes se subían al chat, ya no se usan como fuente.
- Si la usuaria sube al chat alguno de esos archivos u otro con código, se lee como instantánea y, si difiere del repo, se avisa antes de editar.
- Lo que estaba pendiente sobre README, piezas del Generador y contraste de pendientes **está en `Contexto_Base_Web.md`, sección «Abiertos»** (el estado no se guarda en la skill).

## 0.7 Si la sesión no puede escribir en GitHub: sugerir un token fine-grained (definido el 11-oct-2026)

- Cuando Claude **no tiene el comando de añadir repositorios**, o los repos llegan **sin permiso de escritura**, lo dice y **sugiere generar un token fine-grained** (permisos mínimos, vida corta) en lugar de seguir sin poder subir. Como la usuaria suele borrar los chats, el token se guarda **temporalmente** en un `.txt`, se adjunta al chat y se borra y revoca al terminar.
- La plantilla con los pasos y el bloque de repositorios está en **`Claude/Plantilla_Token_GitHub.txt`** del repo `Backend` (público; solo trae marcadores, nunca un token). Claude la lee de `https://raw.githubusercontent.com/GrupoTerna/Backend/main/Claude/Plantilla_Token_GitHub.txt` y **se la entrega a la usuaria para descargar**; esta es una excepción a 0.2 porque es lo que ella necesita para poder seguir. Si Claude no logra leerla, le dice a la usuaria que la descargue de GitHub. No se copia aquí su contenido, para que viva en un solo lugar.
- **El token nunca se sube a un repo ni se escribe en commits, documentos o respuestas** (los repos son públicos). Claude lo lee del archivo adjunto sin mostrarlo; la usuaria lo borra y lo revoca después.

## 0.8 Al pedir que se ejecute una función de Apps Script: decir en qué archivo y en qué proyecto está (dictada por la usuaria el 25-oct-2026)

- **Cada vez que Claude le pida a la usuaria que ejecute una función en Apps Script** (incluidos los recordatorios de 0.3: `subirBaseDesdeGithub()`, `subirGeneradorDesdeGithub()`, `descargarBase()`, `descargarGenerador()`, etc.), **dice en qué archivo `.gs` está la función y en qué proyecto: `Base` o `Generador`**, para que ella sepa qué editor de Apps Script abrir. Formato: «corre `subirBaseDesdeGithub()` (proyecto **Generador**, archivo `01_Principal.gs`)».
- **Se verifica, no se dice de memoria.** Antes de nombrar el archivo, buscar la función en el clon actualizado: `grep -rn --include=*.gs -E "function +nombre\b" Base/src Generador/src`. El `INDICE_FUNCIONES.md` de cada carpeta sirve para orientarse, pero es generado y puede ir por detrás de lo último que se subió. Se da el nombre **actual** del archivo (los `.gs` se han renumerado; ver «Equivalencias de nombres de archivo `.gs`» en `Contexto_Base_Web.md`).
- **El nombre de la función no dice el proyecto.** Por ejemplo, `subirBaseDesdeGithub()` y `descargarBase()` trabajan sobre `Base`, pero están en el **Generador** (`01_Principal.gs`); `agregarIdCorreccionesGuerraCSV()` sí está en **Base** (`18_CorreccionGuerra.gs`).
- Si la función existe en los dos proyectos, se indican ambos. Si no se encuentra en ninguno (nombre mal escrito, o función que aún no está subida), Claude lo dice y no inventa el archivo. Si la función la creó o la movió Claude en esa tanda, indica el archivo donde la dejó.

## 0.9 Dónde ubicar el código en los `.gs` (dictada por la usuaria el 27-oct-2026)

- **Cuándo aplica:** al **crear un archivo `.gs` nuevo** o una **sección o función nueva dentro de un archivo existente**, en cualquiera de los tres proyectos de Apps Script (`Base`, `Generador` y `Contactos_Secundario`). El código nuevo se ubica con estos tres criterios, **en este orden de prioridad**:
  1. **Manual o no manual.** Primero las funciones que la usuaria **corre a mano** desde el editor de Apps Script; después las que **no se ejecutan a mano** (las llaman otras funciones, un activador, la web con `doGet`/`doPost` o la continuación por tandas, y las ayudas internas). Si una función sirve de las dos formas, va con las manuales cuando está pensada para correrse desde el editor, y su comentario lo dice.
  2. **Por temática.** Dentro de cada grupo, las funciones del mismo tema van juntas (por ejemplo, por hoja o por proceso), con un encabezado de comentario que nombra el tema. Las ayudas de una función quedan en el mismo tema, en la parte de las no manuales.
  3. **Por orden de ejecución.** Dentro de cada tema, en el orden en que se espera ejecutarlas (por ejemplo, detectar, luego iniciar, luego reanudar; y los pasos de una cadena en el orden de su lista).
- **Pareja principal–continuación (prioridad sobre los tres criterios, añadida el 27-oct-2026).** Toda función que tenga una función de continuación (`_continuarX`) va **seguida, justo después, por su continuación**: `runAll()` y luego `_continuarRunAll()`; `runReenumerarTemporadas()` y luego `_continuarReenumerarTemporadas()`. La pareja se queda junta y **se ubica según la función principal**, aunque la continuación no sea manual. La continuación se identifica por el **nombre del handler que la cadena le pasa a `_ejecutarPorTandas()` como cuarto argumento** (el que programa el disparador de continuación), no por parecido de nombres: `runSorteos()` pasa `'_continuarRunSorteos'`, `runUpdate()` pasa `'_continuarRunUpdate'`, `runReenumerarTemporadas()` pasa `'_continuarRunReenumerarTemporadas'`. Para una función nueva, se busca en su cuerpo (o en la que arranca la cadena) cuál es ese cuarto argumento.
- **Excepción: `Base/src/00_Main.gs` (el archivo 0) no se reordena.** Ya tiene primero las funciones manuales, con la temática como segundo criterio, y **dentro del grupo manual un orden puesto a mano por seguridad**: primero lo menos costoso de equivocarse. Ejemplo dictado por la usuaria: `cancelarEjecucion()` va antes que `demolerTodoElSpreadsheet()`, porque si se corre por error la primera función precargada en el editor, una cancelación se arregla reanudando y una demolición cuesta mucho más. Al agregar código a ese archivo se respeta esa estructura y ese orden de seguridad; no se aplica el reordenamiento del pendiente de abajo.
- **Las constantes y variables globales** (`var`) quedan arriba del archivo, antes de las funciones. Al comienzo del archivo se deja un comentario con el índice del orden (partes y temas).
- **Al reordenar un archivo existente no se cambia el código de ninguna función.** Antes de subir se comprueba: (a) que cada función quedó **idéntica y una sola vez**, (b) que se conservan las referencias `§` a `Contexto_Base_Web.md` de los comentarios, y (c) la sintaxis (`node --check` sobre una copia `.js`). Si el orden de ejecución es una **deducción** de Claude y no algo confirmado por la usuaria, se anota en el contexto.
- **Los rangos de líneas** de la tabla «Mapa de bloques por .gs» de `Contexto_Base_Web.md` quedan desactualizados al reordenar; los ids `§Bxxx` de los comentarios siguen resolviendo. Se deja constancia en el contexto, pero no se rehacen los rangos.
- **Cómo se aplica este orden a los `.gs` que ya existen** (el avance y lo que falta están en el pendiente `PF285` de «Abiertos» de `Contexto_Base_Web.md`):
  1. **Por partes pequeñas, ejecutables dentro de una sesión gratuita:** un archivo por parte; si es muy grande, un tramo.
  2. **Al terminar cada parte** se verifica, se hace el commit y el push a `main` y solo entonces se sigue con la siguiente, como pide 0.2: la sesión puede cortarse y lo que no se subió se pierde, así que **nunca se acumulan varias partes sin subir, aunque se pueda hacer más trabajo**.
  3. **Un commit por cada parte de trabajo** (nunca una sola subida para varias partes).
  4. El contexto y el `CHANGELOG.md` se editan **una sola vez por tanda**, al final, en su propio commit (0.2). No hace falta detenerse a informar después de cada parte.
  5. El avance queda en los mensajes de commit (empiezan con «Orden de archivo:») y el pendiente del contexto se actualiza al final de la tanda; si la sesión se corta, se retoma con `git log` y la lista de archivos hechos.
  6. Después de reordenar un archivo de `Base/src/` hay que recordar «corre `subirBaseDesdeGithub()` antes de cualquier descarga» (0.3), y análogamente para `Generador/src/` y para `Contactos_Secundario/src/` (`subirContactosDesdeGithub()`, proyecto **Generador**, archivo `01_Principal.gs`).

## 0.10 Registro (log) de las cadenas por tandas: pasos con nombre y detalle de avance (dictada por la usuaria el 27-oct-2026)

*Fija como regla lo programado en `Contexto_Base_Web.md §PF269` y `§PF283`, para que el registro se lea siempre igual.*

- **Cuándo aplica:** a toda cadena que use `_ejecutarPorTandas()` (`00_Main.gs`) y a toda cadena nueva: hoy `RUNALL`, `RUNGUERRARAPIDO`, `RUNSORTEOS`, `RUNUPDATE`, `RUNSYNCCSV`, `REENUM` y la de Actualizar roster.
- **1) Los pasos llevan nombre.** Cada cadena tiene `PASOS_<CADENA>` y un `NOMBRES_PASOS_<CADENA>` **en el mismo orden**, que se pasa como **quinto argumento** de `_ejecutarPorTandas()`. Cada texto dice **qué hace el paso y qué resultado se espera al terminarlo** («objeto: acción → resultado»). Si se agrega, quita o mueve un paso, se hace lo mismo con su texto. El registro lo muestra como «Ejecutando paso N/M: <texto>».
- **2) Detalle de información de cada paso.** Todo paso que pueda quedar incompleto (devolver `false`) **anota su avance** con `_anotarProgresoPaso_(texto, acumulado)` justo antes de devolver `false`, y lo escribe en el registro con el mismo patrón que `_reenumProgreso_()` (`47_Migraciones.gs`): una línea con el **acumulado de un total**, el porcentaje, lo hecho **en tandas anteriores** y **lo que falta**; y otra línea con lo hecho **en esta tanda**. La unidad es el objeto que se cuenta (filas, archivos, carpetas, hojas, jugadores…). Los pasos de una sola escritura, donde el avance es 0 o todo, lo dicen en esa forma.
- **3) Lo que agrega el motor** (no se duplica en los pasos): `ESTADO al empezar` (paso POR EMPEZAR o EN CURSO y en qué tanda va), `AVANZÓ`, `SIN AVANCE` o `RETROCEDIÓ` respecto de la tanda anterior, `Paso N/M COMPLETO tras k tandas` y, al cortar por presupuesto de tiempo, `Queda: paso N+1/M POR EMPEZAR`.
- **4) Los textos que se imprimen no llevan pistas para quien lee el código (dictada por la usuaria el 27-oct-2026).** Todo texto que llega al registro, a una hoja o a la interfaz (nombres de pasos, avisos, errores) dice solo lo que le sirve a quien lo lee ahí. Un ejemplo, un nombre de función o una referencia puesta para que Claude ubique el código **no se imprime**: va en un comentario del código o en el contexto. Caso real: el aviso de paso incompleto decía «(presupuesto interno agotado, ej. /players)» y salía también en pasos sin relación con `/players` (`Contexto_Base_Web.md §PF285`, punto 10). Antes de entregar un texto nuevo o tocado, se relee pensando en el paso que más veces lo va a mostrar.
- **Un paso que devuelve `false` sin anotar su avance** hace que el registro diga «este paso no informa su avance interno»; al crear o tocar un paso, se evita ese caso.

## Objetivo

Este proyecto trabaja sobre el código del clan, que vive en los repositorios de GitHub `GrupoTerna` (0.1). Claude lee y edita **los archivos del repo**, no copias subidas al chat. Lo que hay en el repo:

- **Backend de Apps Script:** `Base/src/`, `Generador/src/` y `Contactos_Secundario/src/` (los `.gs`), en el repo `Backend`.
- **Script de Tampermonkey:** `Tampermonkey/Tampermonkey.md`. Tampermonkey no permite subir archivos, así que se usa `.md` como formato de conveniencia; **es el código real del script**, no texto libre, y no se ignora por la extensión.
- **Frontend:** el repo `Web`.
- **Render:** el repo `Script`, solo en los casos de 0.1.
- **Contexto y consolidados:** `Contexto_Base_Web.md` y `Consolidados de cambios/` (0.4 y 0.5).

Claude modifica **únicamente los archivos puntuales que haga falta**, nunca carpetas, zips ni «el proyecto completo». Los sube directo a GitHub y da la lista de los tocados (0.2); la usuaria los trae después a Apps Script con el Generador (0.3).

## El Generador

`Generador` es un proyecto de Apps Script **independiente de `Base`** (su código está en `Generador/src/`). Es la herramienta con la que la usuaria sincroniza los proyectos de Apps Script con GitHub (0.3): descarga su código a GitHub y lo trae de vuelta. Si en la conversación se menciona «el Generador» sin más contexto, se refiere a este proyecto.

Se le aplican las mismas reglas que a `Base`: se edita en el repo, archivo por archivo. Solo hace falta leer o tocar `Generador/src/` cuando el pedido tenga que ver con el propio Generador (su lógica de descarga, subida y sincronización), no cuando es sobre el código de negocio de `Base`.

---

# 1. Fuente de verdad: el repositorio

- **El código actual es lo que está en `main`.** Al empezar la tanda Claude trae lo último (clona o hace `git pull`) y trabaja sobre ese clon. Los repos cambian constantemente (el Generador también empuja a `main`): no se apoya en la memoria de versiones o sesiones anteriores, y ante la duda vuelve a leer el archivo real.
- **El texto pegado en el chat** (conversaciones, logs, errores, código antiguo) son instrucciones y contexto; **nunca sustituye a un archivo del repo**, aunque se pegue en el mismo mensaje que un adjunto. Si hay adjunto y texto, se verifica cada uno por separado.
- **Los archivos adjuntos** con código se leen como instantánea; si difieren del repo, se avisa antes de editar (0.6).
- **Consolidados de fases:** son de uso temporal; se guardan y se leen en `Consolidados de cambios/` del repo (0.5), nunca desde el texto pegado. Sus reglas (ciclo de vida, compactación, referencias, nota de autoinvocación y reglas de trabajo 1 a 14) están en `Consolidados de cambios/Reglas_Consolidados.md`.

---

# 2. Reordenamiento o reagrupación del proyecto completo (distinto de renombrar un archivo)

Las reglas de nombres (sección 3) se refieren a **ediciones puntuales**: cuando se modifica un archivo por un bug o una fase concreta, ese archivo conserva su nombre y su número tal cual estaban.

Aparte existe una operación distinta: **reordenar o reagrupar el proyecto completo**, es decir, renumerar varios (o todos) los archivos `.gs` de un proyecto a la vez para que la numeración vuelva a reflejar un agrupamiento por temática. Esto:

- Es una operación deliberada y explícita, que se hace solo cuando la usuaria la pide (por ejemplo «reordena los archivos por tema» o «ya hay varios nuevos sueltos, hay que reagrupar»), nunca como efecto secundario de una edición puntual.
- Puede volver a ser necesaria: con el tiempo se agregan archivos `.gs` nuevos que quedan con el siguiente número disponible en vez de ubicarse junto a los de su temática, y el agrupamiento se va perdiendo.
- Cambia el prefijo numérico de potencialmente muchos archivos a la vez, así que cualquier referencia que solo mencione un número (por ejemplo «el archivo 17») puede quedar desactualizada. Para evitarlo al documentar cambios, ver la sección 9 («Referencias en el changelog»).
- Al ejecutarlo, se actualiza la tabla «Equivalencias de nombres de archivo `.gs`» de `Contexto_Base_Web.md` (nombre anterior → nombre nuevo) y se la muestra al final de la tanda, para que la usuaria pueda actualizar cualquier referencia externa (por ejemplo en un consolidado vigente).

No confundir con el orden **dentro** de un archivo (0.9), que no cambia nombres.

---

# 3. Nombres de archivo

**El nombre del archivo es parte de su identidad y se conserva exactamente.** Antes de subir un archivo modificado se verifica el nombre, la numeración, la extensión y las mayúsculas y minúsculas.

- El prefijo numérico es parte del nombre real: `01_Principal.gs` es otro archivo que `Principal.gs`. Nunca se elimina ni se modifica.
- No se agregan prefijos ni sufijos (`_fixed`, `_v2`, `_CORREGIDO`, `_final`, `_new`, `_copy`), no se traduce el nombre, no se cambia mayúsculas ni minúsculas y no se quita la extensión `.gs`.
- La numeración puede no ser consecutiva; no se asume cuántos archivos hay.

---

# 4. Archivos nuevos

Si hace falta un archivo completamente nuevo:

- Primero se comprueba en el repo (`ls`, `grep`) que no existe; no se crean archivos porque una conversación mencione otro.
- Se usa un nombre nuevo que siga la convención de numeración del proyecto; sin duplicados ni copias con sufijos.
- El código nuevo se ubica según 0.9.
- Si la usuaria no autorizó un archivo nuevo y la corrección puede hacerse en archivos existentes, se prefieren los existentes.

---

# 5. Cómo se edita: el archivo real, completo, sin parches

- Se edita **el archivo real en el clon del repo** y se sube (0.2). No se entregan parches, diffs, fragmentos ni instrucciones del tipo «busca esta línea y cambia…»: la usuaria no copia ni pega nada, porque lo trae con el Generador.
- El archivo debe quedar **completo**: con todo el código original que deba conservarse, todas las funciones no afectadas y todas las correcciones pedidas. No se elimina código para acortar.
- Se tocan y se suben **solo los archivos puntuales** que hicieron falta; nunca una carpeta, un zip ni el proyecto completo, salvo que la usuaria lo pida expresamente.
- Solo se entrega un archivo para descargar si la usuaria lo pide (0.2), y nunca como bloque de código en el chat.

---

# 6. Un `.gs` solo contiene código Apps Script válido

Un `.gs` nunca debe empezar ni terminar con comillas inversas triples, ni contenerlas en ningún punto. Tampoco debe llevar etiquetas de lenguaje (`javascript`, `js`, `html`) ni restos de formato Markdown o HTML (encabezados `#`, separadores `---`, bloques `<!-- -->`). Apps Script no los reconoce y la usuaria no podría guardar el archivo en el editor.

Antes del commit se busca la secuencia de tres comillas inversas con ``grep -n -F '```' archivo.gs``; no debe haber resultados.

---

# 7. Flujo de trabajo

1. **Traer el repo actualizado** (clonar si hace falta; `fetch` y `rebase`).
2. **Ubicar** los archivos que importan con `ls` y `grep`. Si hay que pedirle a la usuaria que ejecute una función, se verifica en qué proyecto y archivo está (0.8).
3. **Leer el archivo real** y las funciones relacionadas, sin apoyarse en la memoria ni en código pegado en el chat.
4. **Analizar la solicitud** con las instrucciones actuales, los errores y los logs, y buscar primero lo ya escrito en el contexto (sección 9).
5. **Editar** en el clon solo los archivos necesarios (secciones 3 a 6; 0.9 para ubicar código nuevo).
6. **Verificar:** sintaxis (`node --check` sobre una copia `.js` para los `.gs`), integridad del archivo, funciones conservadas, ausencia de duplicados, coherencia con los demás archivos, nombre exacto, ausencia de restos de formato (sección 6) e idioma (`verificar_idioma.py`; ver «Idioma»).
7. **Subir** a `main` apenas termina el cambio, en un commit pequeño (0.2).
8. **Al terminar la tanda:** lista de archivos modificados o creados con su commit (0.2), recordatorios de 0.3 (diciendo proyecto y archivo, como pide 0.8) y, al final, el contexto (0.4).

---

# 8. Texto pegado en el chat y conflictos entre fuentes

La usuaria puede pegar conversaciones con otras IAs, logs, errores, código antiguo o supuestos fixes. Eso es **contexto, no el código actual**:

- El código de una conversación pegada puede servir de referencia, pero **nunca reemplaza automáticamente** el del repo. Si lo contradice, manda el repo.
- Si la usuaria pide expresamente incorporar una modificación de la conversación, se aplica sobre el código actual del repo, no se reemplaza el archivo por el fragmento pegado.
- No se crean archivos ni se asumen fixes porque una conversación anterior los mencione.

**Prioridad cuando hay conflicto entre fuentes:**

1. El repo (`main` actualizado).
2. Las instrucciones actuales y explícitas de la usuaria.
3. Los errores y logs actuales.
4. El código o los fixes de conversaciones pegadas.
5. Suposiciones.

---

# 9. Cambios incrementales y continuidad entre sesiones

Los cambios se entregan en tandas chicas e incrementales, para evitar que la sesión se corte sin haber devuelto los archivos. **Cada cambio se sube a GitHub apenas se termina y se continúa con los demás de la misma tanda; el contexto se edita al final de la tanda** (0.2).

No debe perderse información entre una conversación y la siguiente:

- Como el trabajo avanza entre sesiones y el chat se borra antes de empezar una nueva, nada se debe perder de un chat a otro.
- Si la usuaria explica el comportamiento de algo o da alguna confirmación, eso se documenta de inmediato en el lugar que corresponda: el plan de fases vigente, el código del repo o, si es funcionamiento del sistema o una decisión que sirva para prevenir errores, `Contexto_Base_Web.md` (0.4). No debe quedar solo dicho en el chat.
- **Buscar primero en el contexto lo de guerra (regla 13 de `Consolidados de cambios/Reglas_Consolidados.md`, 24-oct-2026).** Antes de preguntar o suponer algo sobre `currentriverrace`, `periodLogs`, `periodPoints`, `pointsEarned`, `periodIndex`, barcos, cruce de meta, coliseo o correcciones de guerra, hacer `grep -n` de esas palabras en `Contexto_Base_Web.md` y `Contexto_Base_Web_Detalle.md` (sobre todo el bloque `17B004`, «DOCUMENTACIÓN DEL FUNCIONAMIENTO DE LA GUERRA», y §PF185, §PF183, §PF139, §PF160, §PF198). La usuaria ya lo explicó y lo verificó con datos; no se le vuelve a pedir. Sirve también para contrastar hipótesis de las correcciones de guerra.
- **Buscar lo ya escrito antes de suponer, y cruzar todas las fuentes antes de decir «no es concluyente» (regla 14 de `Consolidados de cambios/Reglas_Consolidados.md`, 25-oct-2026; amplía la 13).** Vale para cualquier tema, no solo guerra. Antes de suponer cómo funciona algo, buscar en el contexto, el código, los consolidados y `Datos descargados/`; lo que ya está documentado y validado se usa y se cita, no se vuelve a preguntar. Ante una falla, no responder «no es concluyente» mirando una sola fuente: revisar las fuentes pertinentes y responder con la lista de lo revisado, lo que no se pudo mirar y lo que falta. Para guerra, el mapa de las fuentes (los JSON guardados tal cual son los más confiables; hoja y CSV de guerra son una sola cadena; cuál consultar según la pregunta) está en `Contexto_Base_Web.md §PF239`. La regla vive en un solo lugar: léela ahí.
- **Contrastar con los datos disponibles antes de suponer o ignorar (regla de la usuaria, 23-oct-2026).** Ante una hipótesis o una duda sobre el funcionamiento del juego o de los datos, primero se busca y se contrasta con los archivos que ya hay (`Datos descargados/` del repo `Backend`: JSON, CSV; y Drive si el conector está disponible); no se supone ni se descarta sin mirar. Si los datos necesarios están en Drive y Claude no puede verlos, le dice a la usuaria que los descargue de Drive y los suba a GitHub, y no continúa sobre una suposición.

## Referencias en el changelog: archivo + función, no solo el número

La regla (indicar el nombre exacto del archivo y la función o bloque editado en toda entrada de historial) está en `Consolidados de cambios/Reglas_Consolidados.md`, sección 5.

## Reglas de los consolidados: un solo archivo

Las reglas de trabajo de los consolidados (ciclo de vida, reglas 1 a 14, nota de autoinvocación, compactación y referencias en los historiales) **no están en esta skill**. Están en **`Consolidados de cambios/Reglas_Consolidados.md`** del repo `Backend`: léelas ahí antes de crear, leer o editar un consolidado, y no las copies aquí ni dentro de un consolidado. Una regla propia de un consolidado concreto va en ese consolidado.

**Dónde se registra cada cambio nuevo** (código del frontend a `Web`, de Apps Script y Tampermonkey a `Backend`, funcionamiento al contexto, historial al `CHANGELOG.md`) y el formato del `CHANGELOG.md`: sección 6 del mismo archivo. **Al terminar de aplicar un consolidado, Claude informa y pregunta si se borra** (`Reglas_Consolidados.md`, sección 1); no lo borra sin un sí explícito.

Esas mismas reglas rigen al editar esta skill. Regla propia de la skill: cuando se modifica, se actualiza el `SKILL.md` completo y se sube a `Claude/SKILL.md` del repo `Backend`; la skill que usa la aplicación es la instalada, así que la usuaria debe volver a instalarla desde ese archivo (Claude solo entrega el archivo para descargar si ella lo pide, o si la cuenta no puede escribir en GitHub).

**Antes de subir la skill se valida el frontmatter** (el bloque `---` del inicio). Desde la raíz del repo: `python3 -c "import yaml; t=open('Claude/SKILL.md',encoding='utf-8').read(); d=yaml.safe_load(t.split('---')[1]); assert d['name']=='md' and d['description']; print('OK', len(d['description']))"`. Debe imprimir «OK» y el largo del `description`, que se mantiene por debajo de 1024 caracteres. El `description` va **siempre en bloque `>-`**, con sangría de 2 espacios y sin comillas: una sola comilla sobrante lo rompe y la aplicación rechaza el archivo con «malformed YAML frontmatter». Si el comando falla, no se sube.

---

# 10. Regla de oro

**El código actual está en los repos de GitHub (`main`): Claude lo lee y lo edita ahí.**

**El chat = instrucciones y contexto. El texto pegado en el chat nunca sustituye un archivo del repo, aunque se pegue junto con un adjunto.**

**Los nombres reales (`01_Principal.gs`, `04_Setup.gs`, etc.) se conservan exactamente.**

**Archivo modificado = archivo completo, editado en el repo y subido a GitHub** (descargable solo si la usuaria lo pide; ver 0.2).

**Nunca un parche como sustituto del archivo completo, ni una carpeta ni un zip: solo los archivos puntuales modificados.**

**Ningún `.gs` debe contener comillas inversas, etiquetas de lenguaje ni restos de formato Markdown o HTML: solo código Apps Script válido.**
