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

**Versión de esta skill: 28-oct-2026, rev. 3.** Cada cambio de `SKILL.md` sube el número de revisión (el workflow `skill-ci.yml` lo exige). Al empezar la tanda, después de clonar, Claude compara esta línea con la de `Claude/SKILL.md` del repo; si difieren, avisa a la usuaria que hay que reinstalar la skill desde ese archivo y toma el repo como referencia.

## Idioma

Responder siempre en **español de Perú**. Evitar modismos, léxico o entonación de español de Argentina u otras variantes regionales.

**La regla vale también para todo lo que se escribe en los archivos, no solo para el chat** (desde el 18-oct-2026; `Contexto_Base_Web.md §PF106`): textos visibles de HTML y JS (botones, avisos, errores), comentarios, `CHANGELOG.md`, contexto, consolidados y esta skill. Claude tiende a caer en español rioplatense (Argentina o Uruguay) y, escrito en el código o la interfaz, lo lee todo el clan peruano.

- **Tuteo, nunca voseo:** «gira», «usa», «agrega», «vuelve», «revisa», «inténtalo», «puedes», «tienes», «quieres», «sigue», «marca», «abre». Nada de «girá», «usá», «agregá», «podés», «tenés», «querés», «seguí», «sos», «vos».
- **Imperativo con pronombre: también tuteo y con la tilde que corresponde** («agrégalo», «déjalo», «revísalo»). Las formas voseantes («agregalo», «dejalo», «revisalo», «fijate», «avisame») **no llevan tilde**, así que una búsqueda solo por vocales acentuadas **no las encuentra**.
- **Léxico:** «aquí» en vez de «acá» en textos nuevos; sin «che», «dale», «laburo», «plata» (por dinero), «pibe», «boludo» ni similares. «Recién» como adverbio de pasado inmediato es de uso normal en Perú y no se cambia.
- **Antes de entregar un archivo con texto nuevo**, buscar en él formas terminadas en `-ás`, `-és`, `-ís`, imperativos con tilde final (`-á`, `-é`, `-í`), verbo + `lo/la/los/las/me/te/se` sin tilde, y el léxico anterior. Ojo con falsos positivos como `'activate'` de `sw.js`. **Se automatiza con `python3 -I "Consolidados de cambios/verificar_idioma.py"` (desde la raíz del repo, antes del commit): revisa solo las líneas agregadas respecto de `HEAD` (o de `--base origin/main`) y lista las candidatas; hay que mirarlas a mano, porque formas como «estás» son tuteo válido. Con rutas como argumento revisa archivos completos.**
- **Si una frase ya existente tiene voseo y no es parte del pedido, se avisa** en lugar de dejarla; si es un texto de interfaz, se corrige en la misma tanda y se anota en el `CHANGELOG.md`.

---

# 0. Repositorios, entrega por GitHub y reglas de trabajo (esta sección manda sobre lo que contradiga más abajo)

## 0.1 Los tres repositorios (GitHub, `GrupoTerna`)

- **`GrupoTerna/Backend`** (público). Carpetas: `Base/`, `Generador/` y `Contactos_Secundario/` (cada una con `src/` = los `.gs` individuales, que son **lo único que Claude edita**; y `respaldo/`, `INDICE_FUNCIONES.md`, `Indice_<Nombre>.md`, `LEEME_IA.md` = archivos **generados por Apps Script** al descargar, que **Claude nunca edita**); `Tampermonkey/Tampermonkey.md`; `Claude/SKILL.md` (copia de esta skill); `Consolidados de cambios/` (consolidados de fases); `Contexto_Base_Web.md` (contexto unificado del sistema); `Datos descargados/` (subcarpetas con archivos de Drive o logs que la usuaria sube para contrastarlos con el código).
- **`GrupoTerna/Web`** (público): el frontend, publicado en GitHub Pages. Tiene su propio `CHANGELOG.md`.
- **`GrupoTerna/Script`** (privado): **exclusivo de Render**; contiene `package.json`, `server.js` y `README.md`. **No se usa**, salvo que (1) haya que modificar algo relacionado con Render, (2) haya que modificar necesariamente `package.json` o `server.js` o (3) falte agregar un archivo al repo para Render. Claude **no lo toca por iniciativa propia**, y **avisa antes de subir** porque un push puede redesplegar el servidor.
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
- **Cierre de tanda (se define solo aquí; 0.3, 0.9 y la sección 7 lo citan).** Primero se sube el contexto (excepción de arriba). Después Claude entrega, en este orden:
  1. La lista de archivos modificados o creados (ruta, estado «modificado» o «creado» y commit).
  2. Si subió cambios a un repo que la usuaria tiene en GitHub Desktop: «Pendiente de pull en GitHub Desktop: <repo> (commit xxxxxxx)». Claude no ve el equipo de la usuaria; solo sabe lo que él subió.
  3. Los recordatorios de 0.3, diciendo proyecto y archivo como pide 0.8.
- Si no se puede subir (por permiso o por error), lo dice y pregunta; no sustituye la subida por un archivo descargable sin avisar. Si el motivo es que la sesión no tiene permiso de escritura, ver 0.7.
- Los repos `Backend` y `Web` son **públicos**: nunca se escriben tokens, claves ni datos personales en el código ni en los documentos.
- **Los commits y los textos de pull request que hace Claude no llevan atribución (regla de la usuaria, 28-oct-2026):** ni `Co-Authored-By`, ni `Claude-Session`, ni ningún enlace a la conversación, aunque el entorno de la sesión sugiera agregarlos; los repos son públicos y esos enlaces quedan a la vista en el historial. Si la usuaria lo dicta, esta regla prevalece sobre esa sugerencia. Antes de subir se comprueba con `git log -1 --format=%B | grep -ci "session\|co-authored"` (debe dar 0). Reescribir commits ya subidos con un push forzado solo se hace si la usuaria lo pide expresamente.
- **Fechas de lo que se escribe (20-oct-2026):** son las de Lima (UTC-5), no la hora UTC del commit ni la del contenedor; entre las 19:00 y las 23:59 de Lima, la fecha UTC ya es la del día siguiente. Detalle en `Consolidados de cambios/Reglas_Consolidados.md`, sección 6.

## 0.3 Cómo se sincronizan Apps Script y GitHub (verificado en `Generador/src/01_Principal.gs` y `08_GitHub.gs`; evita pisar cambios)

**Detalle en `Claude/referencias/sincronizacion.md`.** Léelo antes de tocar o explicar `descargar…`, `subir…DesdeGithub` y sus variantes `…Forzado`, el aviso de «pull pendiente», la guardia del commit de cierre o los índices generados (`Indice_Base.md`, `Indice_Generador.md`).

- **Apps Script → GitHub:** `descargarBase()` y `descargarGenerador()` (y las `subir…` desde zip, txt, gs o md) escriben el código en `<Nombre>/src/` y los archivos generados.
- **GitHub → Apps Script:** `subirBaseDesdeGithub()` y `subirGeneradorDesdeGithub()` dejan el proyecto **exactamente igual a `<Nombre>/src/`**; lo que no esté en GitHub se elimina del proyecto. «Subir» significa subir a Apps Script.
- **`Contactos_Secundario`** es un tercer proyecto de Apps Script (el de la **cuenta secundaria**) que el Generador maneja igual, con las mismas salvaguardas: `descargarContactos()` (Apps Script → GitHub) y `subirContactosDesdeGithub()` (GitHub → Apps Script, deja el proyecto igual a `Contactos_Secundario/src/`). Como las de `Base`, **están en el Generador** (`01_Principal.gs`). Detalle y requisitos en `Claude/referencias/sincronizacion.md`.
- **Claude no sube a `<Nombre>/src/` mientras corre una de estas funciones.**
- **Riesgo que Claude debe prevenir:** si Claude sube un cambio a `Base/src/` y, antes de correr `subirBaseDesdeGithub()`, la usuaria corre `descargarBase()` u otra función `subirBase…`, **el estado viejo de Apps Script se escribe encima del cambio en GitHub**. Por eso, en el cierre de tanda (0.2) Claude recuerda, con proyecto y archivo (0.8):
  1. Si cambió algo en `Base/src/`: **«corre `subirBaseDesdeGithub()` antes de cualquier descarga»**.
  2. Si cambió algo en `Generador/src/`: **«corre `subirGeneradorDesdeGithub()` antes de correr `descargarGenerador()`»**. Ya no hay que pasar los archivos a mano; solo se pasan a mano si esa función falla.
  3. Si cambió algo en `Contactos_Secundario/src/`: **«corre `subirContactosDesdeGithub()` antes de correr `descargarContactos()`»** (proyecto **Generador**, archivo `01_Principal.gs`).

## 0.4 El archivo de contexto: `Contexto_Base_Web.md`

- Es **el archivo unificado que concentra toda la lógica de funcionamiento del sistema**: backend, frontend y Tampermonkey. Va ahí **el funcionamiento** y **la información que sirva para tomar decisiones futuras y prevenir errores**; también **las decisiones sobre fallos**: cuando una decisión salió mal y se tomó otra para corregirla, pero por defecto se sugeriría la primera, se deja escrito **por qué no se debe hacer, que ya se probó y no funcionó**, y la evidencia, para evitar decisiones equivocadas o que no corresponden con la evidencia.
- **El contexto está en dos archivos.** `Contexto_Base_Web.md` es lo vigente y lo que se lee siempre: cabecera, mapa de secciones PF, equivalencias de nombres `.gs`, **«Mapa de bloques por .gs»**, abiertos, registro del traslado, plan de fases y las secciones PF. `Contexto_Base_Web_Detalle.md` guarda los bloques «Detalle (texto original, sin cambios)» de cada `.gs`; **no se carga entero**: se busca ahí el bloque `§Bxxx` que cite un `.gs` (el «Mapa de bloques por .gs» dice en qué archivo está cada uno). Los comentarios de los `.gs` siguen citando `Contexto_Base_Web.md §Bxxx`; se resuelven con ese mapa. Para mover bloques entre los dos archivos y comprobar que todo resuelve: `Consolidados de cambios/mover_bloques.py` y `verificar_contexto.py` (correr el verificador antes y después de tocar el contexto).
- **No va ahí** el estado, los pendientes ni el historial de cambios: eso se queda en el consolidado de fases o en el `CHANGELOG.md`.
- Los `.gs`, `.html` y demás quedan con código y, a lo más, una línea corta que remite al contexto (por ejemplo `[→ Contexto_Base_Web.md §Bxxx]`). Así no se pierde nada cuando se suben solo archivos específicos.
- Cuando se contraste un pendiente contra el código, **el registro de la contrastación queda en `Contexto_Base_Web.md`** (qué se verificó, contra qué archivo y versión, en qué fecha y qué se encontró), y en el consolidado se marca lo ya hecho.
- **Migración al contexto del funcionamiento que está en `Web` y en su `CHANGELOG.md`:** primero se mueve y después se recorta. El `CHANGELOG.md` **conserva el historial de cambios como checklist corto, ordenado por fecha**; solo sale de él el funcionamiento y lo que sirva para decidir y prevenir errores. **Dónde se registra cada cambio nuevo** (código por repo, funcionamiento al contexto, historial al `CHANGELOG.md`): `Consolidados de cambios/Reglas_Consolidados.md`, sección 6. Cómo va la migración se lleva en el contexto (párrafo «Frontend — traslado desde `CHANGELOG.md` de `Web`»), no aquí.

- **Cómo editar el contexto sin fallar.** El archivo pesa más de 2 MB y una herramienta de reemplazo exacto falla en silencio si el texto buscado no coincide por completo. **Receta completa en `Claude/referencias/editar_contexto.md`: léela antes de editar el contexto.** En resumen: ubicar con `grep -n`, editar con un script de Python con `assert` de coincidencia única, y correr `Consolidados de cambios/verificar_contexto.py` (debe decir «OK») antes del commit.

## 0.5 Consolidados de fases y carpeta `Datos descargados`

- **Todo consolidado de fases se guarda en `Consolidados de cambios/` del repo `Backend`** y se actualiza ahí, no se entrega para descargar. **Sus reglas están en `Consolidados de cambios/Reglas_Consolidados.md`: léelas ahí.**
- **`Datos descargados/`** tiene subcarpetas con archivos de Drive o logs que la usuaria sube para que Claude contraste los JSON, CSV u otros archivos (la evidencia) contra el código. **Regla urgente:** si en un archivo de esa carpeta Claude **ve teléfonos o celulares**, lo trata como urgente: **avisa de inmediato que se quite el archivo del repo, o pide autorización para eliminarlo**, y no copia ese contenido. El repo es público.
- **Si el archivo de datos más reciente no está en GitHub, o la copia de `Datos descargados/` es más vieja, se busca en Drive** (regla de la usuaria, 18-oct-2026). **Procedimiento en `Claude/referencias/datos_drive.md`: léelo antes de trabajar con una copia que pueda estar vieja.** En resumen: buscar con el conector de Drive, comparar fecha y tamaño con la copia del repo **antes** de usar la vieja, y no seguir sin el dato; lo leído de Drive no se copia a los repos, y si trae teléfonos o celulares se avisa de inmediato.

## 0.6 La fuente del código es el repositorio

- **La fuente del código es el repo** (sección 1; la usuaria lo trae después a Apps Script con el Generador, 0.3). Los archivos `Base.md`, `Web-main.zip`, `Tampermonkey.md` y `Generador.md`, que antes se subían al chat, ya no se usan como fuente.
- Si la usuaria sube al chat alguno de esos archivos u otro con código, se lee como instantánea y, si difiere del repo, se avisa antes de editar.
- El estado y los pendientes (README, piezas del Generador, contraste de pendientes) **viven en `Contexto_Base_Web.md`, sección «Abiertos»**, no en la skill.

## 0.7 Si la sesión no puede escribir en GitHub: sugerir un token fine-grained (definido el 11-oct-2026)

- **Primero se intenta añadir el repo con la herramienta de la sesión, con acceso de escritura.** Suele bastar y entonces **no hace falta ningún token**. Solo si esa herramienta no existe, o el repo llega **sin permiso de escritura**, Claude lo dice y **sugiere generar un token fine-grained** (permisos mínimos, vida corta) en lugar de seguir sin poder subir. Como la usuaria suele borrar los chats, el token se guarda **temporalmente** en un `.txt`, se adjunta al chat y se borra y revoca al terminar.
- **Un token pegado o adjuntado queda escrito en la conversación.** Si la usuaria pega o adjunta uno y el repo ya se pudo añadir sin él, Claude no lo usa y le recuerda que lo revoque en GitHub.
- La plantilla con los pasos y el bloque de repositorios está en **`Claude/Plantilla_Token_GitHub.txt`** del repo `Backend` (público; solo trae marcadores, nunca un token). Claude la lee de `https://raw.githubusercontent.com/GrupoTerna/Backend/main/Claude/Plantilla_Token_GitHub.txt` y **se la entrega a la usuaria para descargar**; esta es una excepción a 0.2 porque es lo que ella necesita para poder seguir. Si Claude no logra leerla, le dice a la usuaria que la descargue de GitHub. No se copia aquí su contenido, para que viva en un solo lugar.
- **El token nunca se sube a un repo ni se escribe en commits, documentos o respuestas** (los repos son públicos). Claude lo lee del archivo adjunto sin mostrarlo; la usuaria lo borra y lo revoca después.

## 0.8 Al pedir que se ejecute una función de Apps Script: decir en qué archivo y en qué proyecto está (dictada por la usuaria el 25-oct-2026)

- **Cada vez que Claude le pida a la usuaria que ejecute una función en Apps Script** (incluidos los recordatorios de 0.3: `subirBaseDesdeGithub()`, `subirGeneradorDesdeGithub()`, `descargarBase()`, `descargarGenerador()`, etc.), **dice en qué archivo `.gs` está la función y en qué proyecto: `Base` o `Generador`**, para que ella sepa qué editor de Apps Script abrir. Formato: «corre `subirBaseDesdeGithub()` (proyecto **Generador**, archivo `01_Principal.gs`)».
- **Se verifica, no se dice de memoria.** Antes de nombrar el archivo, buscar la función en el clon actualizado: `grep -rn --include=*.gs -E "function +nombre\b" Base/src Generador/src`. El `INDICE_FUNCIONES.md` de cada carpeta sirve para orientarse, pero es generado y puede ir por detrás de lo último que se subió. Se da el nombre **actual** del archivo (los `.gs` se han renumerado; ver «Equivalencias de nombres de archivo `.gs`» en `Contexto_Base_Web.md`).
- **El nombre de la función no dice el proyecto.** Por ejemplo, `subirBaseDesdeGithub()` y `descargarBase()` trabajan sobre `Base`, pero están en el **Generador** (`01_Principal.gs`); `agregarIdCorreccionesGuerraCSV()` sí está en **Base** (`18_CorreccionGuerra.gs`).
- Si la función existe en los dos proyectos, se indican ambos. Si no se encuentra en ninguno (nombre mal escrito, o función que aún no está subida), Claude lo dice y no inventa el archivo. Si la función la creó o la movió Claude en esa tanda, indica el archivo donde la dejó.

## 0.9 Dónde ubicar el código en los `.gs` (dictada por la usuaria el 27-oct-2026)

**Detalle en `Claude/referencias/orden_codigo_gs.md`.** Léelo antes de crear un `.gs` nuevo, de agregar una sección o función nueva, o de reordenar un archivo existente, en `Base`, `Generador` o `Contactos_Secundario`. En resumen, el código nuevo se ubica por (1) manual o no manual, (2) temática y (3) orden de ejecución, con cada función seguida de su continuación; `Base/src/00_Main.gs` tiene una excepción.

## 0.10 Registro (log) de las cadenas por tandas: pasos con nombre y detalle de avance (dictada por la usuaria el 27-oct-2026)

**Detalle en `Claude/referencias/registro_cadenas.md`.** Léelo antes de crear o tocar una cadena que use `_ejecutarPorTandas()` (`00_Main.gs`), sus pasos, sus nombres de paso o cualquier texto que se imprima en el registro, en una hoja o en la interfaz.

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
- **Texto pegado en el chat y archivos adjuntos:** nunca sustituyen a un archivo del repo. Qué hacer con cada uno: sección 8 y 0.6.
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

1. **Traer el repo actualizado** (clonar si hace falta; `fetch` y `rebase`) y comprobar la versión de la skill (línea «Versión» del inicio).
2. **Ubicar** los archivos que importan con `ls` y `grep`. Si hay que pedirle a la usuaria que ejecute una función, se verifica en qué proyecto y archivo está (0.8).
3. **Leer el archivo real** y las funciones relacionadas, sin apoyarse en la memoria ni en código pegado en el chat.
4. **Analizar la solicitud** con las instrucciones actuales, los errores y los logs, y buscar primero lo ya escrito en el contexto (sección 9).
5. **Editar** en el clon solo los archivos necesarios (secciones 3 a 6; 0.9 para ubicar código nuevo).
6. **Verificar:** sintaxis (`node --check` sobre una copia `.js` para los `.gs`), integridad del archivo, funciones conservadas, ausencia de duplicados, coherencia con los demás archivos, nombre exacto, ausencia de restos de formato (sección 6) e idioma (`verificar_idioma.py`; ver «Idioma»).
7. **Subir** a `main` apenas termina el cambio, en un commit pequeño (0.2).
8. **Cerrar la tanda** según 0.2 (contexto, lista de archivos, pendiente de GitHub Desktop y recordatorios de 0.3).

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

Los cambios se entregan en tandas chicas e incrementales, para evitar que la sesión se corte sin haber devuelto los archivos. La subida de cada cambio y la excepción del contexto están en 0.2.

No debe perderse información entre una conversación y la siguiente.

**Detalle en `Claude/referencias/continuidad_sesiones.md`.** Léelo antes de preguntar, suponer o descartar algo sobre el funcionamiento del juego o de los datos, y cuando la usuaria explique o confirme un comportamiento. En resumen:

- Lo que la usuaria explique o confirme se documenta **de inmediato** en el lugar que corresponde (plan de fases, código o `Contexto_Base_Web.md`, 0.4); no queda solo en el chat.
- **Se busca lo ya escrito antes de preguntar o suponer**, y se cruzan todas las fuentes antes de decir «no es concluyente» (reglas 13 y 14 de `Consolidados de cambios/Reglas_Consolidados.md`).
- **Se contrasta con los datos disponibles** (`Datos descargados/` y Drive) antes de suponer o ignorar; si los datos están en Drive y Claude no los ve, se le pide a la usuaria que los suba a GitHub y no se sigue sobre una suposición.

## Referencias en el changelog: archivo + función, no solo el número

La regla (indicar el nombre exacto del archivo y la función o bloque editado en toda entrada de historial) está en `Consolidados de cambios/Reglas_Consolidados.md`, sección 5.

## Reglas de los consolidados: un solo archivo

Las reglas de trabajo de los consolidados (ciclo de vida, reglas 1 a 14, nota de autoinvocación, compactación y referencias en los historiales) **no están en esta skill**. Están en **`Consolidados de cambios/Reglas_Consolidados.md`** del repo `Backend`: léelas ahí antes de crear, leer o editar un consolidado, y no las copies aquí ni dentro de un consolidado. Una regla propia de un consolidado concreto va en ese consolidado.

**Dónde se registra cada cambio nuevo** (código del frontend a `Web`, de Apps Script y Tampermonkey a `Backend`, funcionamiento al contexto, historial al `CHANGELOG.md`) y el formato del `CHANGELOG.md`: sección 6 del mismo archivo. **Al terminar de aplicar un consolidado, Claude informa y pregunta si se borra** (`Reglas_Consolidados.md`, sección 1); no lo borra sin un sí explícito.

Esas mismas reglas rigen al editar esta skill. Regla propia de la skill: cuando se modifica, se actualiza el `SKILL.md` completo y se sube a `Claude/SKILL.md` del repo `Backend`; la skill que usa la aplicación es la instalada, así que la usuaria debe volver a instalarla desde ese archivo (Claude solo entrega el archivo para descargar si ella lo pide, o si la cuenta no puede escribir en GitHub).

**Antes de subir la skill se valida el frontmatter** (el bloque `---` del inicio). Desde la raíz del repo: `python3 -I .github/scripts/validar_skill.py`. Debe imprimir «OK»; si falla, no se sube. El workflow `.github/workflows/skill-ci.yml` repite la validación en GitHub en cada cambio de `Claude/SKILL.md` y avisa si el YAML se rompió, pero llega después del push: no sustituye la validación previa. El `description` va **siempre en bloque `>-`**, con sangría de 2 espacios y sin comillas, y por debajo de 1024 caracteres: una sola comilla sobrante lo rompe y la aplicación rechaza el archivo con «malformed YAML frontmatter».

---

# 10. Regla de oro

**El código actual está en `main` de los repos de GitHub: Claude lo lee y lo edita ahí (sección 1). El chat da instrucciones y contexto, nunca sustituye un archivo del repo (sección 8). Se conservan los nombres reales (sección 3), se entrega el archivo completo y puntual, sin parches (sección 5), y un `.gs` solo contiene código Apps Script válido (sección 6).**
