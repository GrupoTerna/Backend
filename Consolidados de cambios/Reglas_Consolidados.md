# Reglas de los consolidados de cambios

**Este es el único lugar donde viven las reglas de los consolidados.** Valen para cualquier IA (Claude u otra) que cree, lea o edite un consolidado de esta carpeta. No se repiten en la skill ni dentro de cada consolidado: si se copiaran, al editar un archivo el otro quedaría desfasado. Una regla **propia de un consolidado concreto** va dentro de ese consolidado; el resto va aquí.

*Origen:* las reglas 1 a 12 salieron de la sección 0 del `Consolidado_Plan_de_Fases.md` y de la skill `/md`, y se unificaron el 11-oct-2026; la sección 6 (dónde va cada cosa) se añadió ese mismo día. Los números de las reglas se conservan porque los consolidados ya los citan («regla 9», «regla 11»).

## 1. Qué es un consolidado y cuánto vive

- Reúne cambios **por aplicar**, normalmente sugeridos en una sesión. La usuaria a veces le pide a una IA cualquiera su opinión para mejorar el sistema, así que puede haber varios consolidados, de distinto origen, en `Consolidados de cambios/`.
- **Es temporal: se borra en cuanto se termina de aplicar** (dicho por la usuaria el 11-oct-2026; `Contexto_Base_Web.md` ya lo decía para el plan de fases). Por eso el **funcionamiento del sistema** no se queda en el consolidado: va a `Contexto_Base_Web.md`.
- **Antes de borrarlo**, pasar a `Contexto_Base_Web.md` el funcionamiento y las decisiones tomadas y descartadas, cada una con su motivo. No se conservan el estado, los pendientes, «archivos a subir» ni la «confianza».
- **Borrado (definido por la usuaria el 11-oct-2026):** cuando la IA termina de aplicar los cambios que pide el consolidado (cada punto aplicado, o descartado por decisión de la usuaria), **lo informa y pregunta si debe borrarlo**. Lo pregunta aunque la respuesta suela ser que sí, por precaución, y **no lo borra sin un sí explícito**. Antes de preguntar comprueba que el funcionamiento y las decisiones ya pasaron a `Contexto_Base_Web.md`; si algo quedó sin aplicar o pendiente de definir, no pregunta por el borrado: lista lo que falta. Con el sí, lo borra en un commit propio y da la lista de archivos (regla 5); con un no, el consolidado se queda.
- Si la usuaria dice que ya se aplicó o que ya no hace falta, se deja de usar como referencia.
- No es una fuente permanente del sistema. El código vigente es el de los repos; el funcionamiento, `Contexto_Base_Web.md`.
- Se lee **del archivo**, nunca a partir de texto pegado en el chat. Se guarda y se actualiza en esta carpeta, y no se entrega para descargar salvo pedido expreso.

## 2. Reglas de trabajo (1 a 12)

Las reglas 1 a 7 las dictó la usuaria. Las 8 a 11 se extrajeron de prácticas que ya seguía. La 12 la dictó el 23-sep-2026.

1. **Leer las reglas y el contexto antes de trabajar, sin excepción.** Si la IA es Claude, invocar siempre la skill `/md`; cualquier otra IA lee este archivo y `Contexto_Base_Web.md`. Como respaldo, cada consolidado lleva una nota de autoinvocación (sección 3). *(Adaptada el 11-oct-2026 para que valga para cualquier IA; antes solo nombraba `/md`.)*
2. **No asumir, no omitir, no descartar nada.** Ante cualquier duda, se pregunta. Si el usuario no responde algo, se vuelve a preguntar, y si hace falta se generan más preguntas y se explica de forma más detallada la pregunta.
3. **Ninguna advertencia o sugerencia se queda solo en el chat.** El usuario no programa y puede no entender el detalle técnico, así que toda alerta, advertencia o sugerencia se guarda directo en el consolidado (o en el `.gs` correspondiente, ver regla 10) marcada como **«pendiente de definir o contestar»**, junto con el contexto de los datos o confirmaciones que el usuario ya haya dado sobre ese tema, para poder tomar la decisión cuando corresponda.
4. **Cambios chicos e incrementales.** Nunca abarcar de más en una sola tanda.
5. **Nunca se entregan parches.** Cada archivo modificado queda **completo**, con su nombre exacto, y se sube **directo a GitHub** (no se entrega para descargar salvo pedido expreso; se da la lista de archivos modificados o creados con su commit). Se toca **solo el archivo o los archivos que realmente se hayan modificado** en esa tanda: nunca el proyecto completo, nunca una carpeta ni un zip. **Si la IA no puede escribir en GitHub** (sin permiso de escritura en el repo), entrega el archivo completo para descargar. *(Corrección del 10-oct-2026, regla 9: antes decía «completo y listo para descargar». La excepción sin permiso de escritura la dictó la usuaria.)*
6. **Cada fase debe poder completarse dentro de una sola sesión gratuita.** Si una fase resulta demasiado grande al empezarla, se debe avisar y partirla en sub-fases en vez de forzarla en una sola sesión.
7. **Indicar en cada fase qué archivos `.gs` (o qué otra fuente) hay que leer o subir**, y si es para **ver información** o para **editar**.
8. **Ningún cambio se hace «a ciegas».** Cada fase debe cerrar con una verificación revisable (diff visual, prueba funcional, comparación antes/después, etc.) antes de pasar a la siguiente, e indicar explícitamente qué se pudo verificar y qué quedó sin probar (por ejemplo, «no se probó en navegador real» o «no se pudo probar en Apps Script real»).
9. **Los errores de sesiones anteriores se marcan como corrección, nunca se sobrescriben en silencio.** Si un diagnóstico, una cifra o una recomendación de una sesión anterior resulta incorrecta, la entrada nueva empieza señalándolo explícitamente (por ejemplo, «Corrección a lo dicho antes: ...»), para que el usuario pueda seguir el cambio de criterio sin tener que comparar versiones a mano.
10. **Las advertencias que deban vivir en el código (no solo en el consolidado) van en un bloque `AVISOS ABIERTOS` / `VERIFICACIONES ABIERTAS`** dentro del `.gs` correspondiente, siguiendo el mismo formato que el proyecto ya usa como referencia. Desde la reorganización de `Base.md` (8-oct-2026), el `.gs` deja una línea que lo menciona y la explicación completa vive en `Contexto_Base_Web.md` (`[→ Contexto_Base_Web.md §Bxxx]`).
11. **Toda sección que reemplace o tenga precedencia sobre una sección o punto anterior debe decirlo en su primera línea**, indicando exactamente qué secciones o puntos reemplaza y cuáles no toca (por ejemplo, «Esta sección reemplaza el punto 6 de la sección 5; el resto de la sección 5 sigue vigente»). Es distinto de la regla 9 (correcciones a diagnósticos o cifras erróneas): la regla 11 aplica cuando una sección queda obsoleta por datos o decisiones más nuevas, no porque la anterior estuviera mal.
12. **Ningún detalle mencionado en el chat sobre el plan, el código o los datos se queda solo en la conversación** *(dictada por la usuaria el 23-sep-2026; actualizada el 11-oct-2026, corrección según la regla 9: antes nombraba el `CHANGELOG.md` de `Web` como destino del funcionamiento del frontend)*. Todo dato, decisión, corrección o aclaración se guarda por escrito. El destino se decide según a qué afecte, no por defecto en un solo lugar (la tabla completa está en la sección 6):
    - Si afecta a una fase, pregunta o al estado del plan → en el consolidado (la fase, la sección de preguntas o el historial).
    - Si afecta a la lógica o al comportamiento del backend → en el bloque `AVISOS ABIERTOS` / `VERIFICACIONES ABIERTAS` del `.gs` (regla 10), con la explicación completa en `Contexto_Base_Web.md`.
    - Si explica **cómo funciona el sistema**, o es una hipótesis comprobada o descartada → en `Contexto_Base_Web.md`, con su motivo y la evidencia.
    - Si afecta al frontend → el código, en el repo `GrupoTerna/Web`; el funcionamiento y las decisiones, en `Contexto_Base_Web.md`; qué se hizo, en el `CHANGELOG.md` de `Web`. Mientras `Web` no esté disponible en la sesión, se anota en el consolidado, marcado según la regla 3, hasta poder trasladarlo.
    - Un mismo detalle puede necesitar guardarse en más de un lugar: no es una elección excluyente.

## 3. Nota de autoinvocación

Todo consolidado nuevo o reescrito lleva, en sus primerísimas líneas y antes de cualquier otro contenido, una nota como esta (para que la regla 1 no dependa de la memoria de la usuaria):

> **Nota para la IA:** antes de trabajar con este documento, lee `Consolidados de cambios/Reglas_Consolidados.md` y consulta `Contexto_Base_Web.md` para cualquier duda de funcionamiento. Si eres Claude y la skill `/md` no fue invocada, invócala. El código vigente está en los repos de `GrupoTerna`; los archivos `.md` o `.zip` subidos al chat son copias que pueden estar desfasadas.

Los consolidados que ya traen la nota antigua (que solo nombra la skill `/md`) la conservan hasta que se reescriban.

## 4. Compactación cuando el consolidado crece demasiado

- Cuando supere aproximadamente 500-600 líneas, o cuando la usuaria lo pida («compacta el plan», «resume el consolidado»), ofrecer o generar una versión **compactada**.
- Conserva, por cada fase o punto, únicamente su **estado vigente** (con las correcciones y reemplazos ya incorporados) y la **fecha de la última verificación**. No debe hacer falta leer el historial para saber qué es cierto hoy.
- El historial de correcciones y reemplazos no se descarta: se mueve a una sección aparte al final (`## Historial de correcciones`), con qué decía antes, qué lo corrigió o reemplazó y cuándo.
- La nota de autoinvocación se conserva igual.
- Compactar es reorganizar, no reescribir: no se cambia el significado de ningún punto ni se descarta información, solo se reordena entre «estado vigente» e «historial».
- Si el consolidado está por borrarse (sección 1), no se compacta: se pasa lo que importa a `Contexto_Base_Web.md`.

## 5. Referencias en los historiales: archivo + función, no solo el número

Los `.gs` pueden reordenarse o renumerarse (ya pasó: ver §PF019 de `Contexto_Base_Web.md`), así que un número de archivo no es una referencia confiable. Toda entrada de historial que documente un cambio (un bloque `AVISOS ABIERTOS`, la sección «Historial de cambios» de un consolidado o el «Historial de correcciones» de la compactación) indica como mínimo:
- el **nombre exacto del archivo** en el momento de la edición;
- la **función o bloque específico** que se editó;
- un **contexto breve** de qué cambió y por qué (una o dos líneas).

El formato del `CHANGELOG.md` del repo `Web` (lista corta de lo hecho, ordenada por fecha) quedó confirmado por la usuaria el 11-oct-2026; está en la sección 6.

## 6. Cómo se registra un cambio nuevo: dónde va cada cosa

Las secciones anteriores dicen cómo se trabaja un consolidado. Esta dice dónde se guarda cada cosa al hacer un **cambio nuevo**, para que la IA no tenga que adivinar. Confirmado por la usuaria el 11-oct-2026.

| Qué es | Dónde va |
|---|---|
| Código del frontend (HTML, JS, CSS, `sw.js`, pruebas y CI de Web) | Repo **`GrupoTerna/Web`**, directo a `main` (regla 5). |
| Código de Apps Script de `Base` | Repo **`GrupoTerna/Backend`**, en `Base/src/`. Se recuerda correr `subirBaseDesdeGithub()` antes de cualquier descarga (skill, 0.3). |
| Código de Apps Script del `Generador` | Repo `Backend`, en `Generador/src/`. La usuaria lo pasa a Apps Script a mano. |
| Script de Tampermonkey | Repo `Backend`, `Tampermonkey/Tampermonkey.md` (es una copia: la usuaria lo pega en la extensión). |
| Archivos de Render (`package.json`, `server.js`) | Repo `GrupoTerna/Script`, solo si hace falta; se avisa antes de subir (skill, 0.1). |
| Cómo funciona algo, por qué se decidió, qué se probó y se descartó (con su evidencia), qué quedó sin probar | **`Contexto_Base_Web.md`**: la sección del archivo o una `PFxxx` nueva. Se escribe en el mismo momento del cambio. |
| Qué se hizo en el frontend (historial) | **`CHANGELOG.md` de `Web`**, como checklist (formato de abajo). |
| Pendientes, advertencias y preguntas | El consolidado, marcados «pendiente de definir o contestar» (regla 3). Los del frontend que ya no dependen de un consolidado van a la sección «Abiertos» del `CHANGELOG.md`. Los que deben vivir en el código, en `AVISOS ABIERTOS` (regla 10). |
| Archivos de evidencia (JSON, CSV, registros) | `Datos descargados/` del repo `Backend`, sin teléfonos ni datos personales. |

**Formato del `CHANGELOG.md` de `Web`** (checklist, ordenado **por fecha** —la más reciente arriba— y, **dentro de cada fecha, por archivo** —de la A a la Z, según el primer archivo que nombra la viñeta—; las entradas de un mismo archivo van juntas, una después de otra, sin fundirlas en una sola; las viñetas que no empiezan por un archivo van al final de esa fecha). Orden de decisión: **fecha > archivo**. Un cambio que toca varios archivos sigue siendo **una** viñeta y va bajo su primer archivo. Las viñetas sin fecha conocida van en la sección final «Sin fecha en el comentario original», con el mismo criterio de archivo. Nada de secciones por archivo aparte del orden por fecha (la sección «guerra.html» que existía se repartió por fecha el 17-oct-2026):
- **Una viñeta por cambio**, aunque toque varios archivos. Lleva: título corto, versión de `sw.js` si aplica, cada archivo con la función o bloque tocado (regla 5, sección anterior), una línea de qué cambió y el enlace `→ §PFxxx` al contexto.
- **No lleva:** cómo funciona hoy, por qué se decidió, alternativas descartadas ni pruebas. Eso va al contexto, y lo que se probó y se descartó se deja escrito allí.
- **Los pendientes no viven en la viñeta.** Van en la sección «Abiertos» al inicio del archivo, que se actualiza; al cumplirse, se borra la línea y queda la viñeta del cambio.
- Si un cambio corrige un diagnóstico o una entrada anterior, la viñeta empieza señalándolo (regla 9).
- Los `.html` y `.js` pueden dejar una línea corta que remita al contexto (`[→ Contexto_Base_Web.md §PFxxx]`), no el historial.
- **Dónde va una entrada nueva (fecha > archivo):**
  1. Busca la sección `## DD-mmm-AAAA` de la fecha del cambio (meses: ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic). Si no existe, créala en su lugar, entre la fecha posterior y la anterior (la más reciente arriba). El encabezado puede llevar una aclaración entre paréntesis, por ejemplo `## 28-sep-2026 (Fase 5b, tandas D, C, B y A)`.
  2. Dentro de la fecha, **la viñeta empieza por su archivo principal entre comillas invertidas**: `- **`perfil.html` · Título corto.** …`. El verificador lee ese primer archivo, así que no se antepone nada antes (ni «Backend», ni la versión de `sw.js`; esas van después).
  3. Inserta la viñeta **junto a las demás del mismo archivo** (después de la última de ese archivo en esa fecha). Si el archivo aún no tiene entradas esa fecha, ábrele su lugar en orden alfabético (A-Z, sin distinguir mayúsculas; `assets/styles.css` ordena por su ruta completa). Las entradas de un mismo archivo van una después de otra; **no se funden en una sola viñeta** ni se meten en una sección por archivo.
  4. Un cambio que toca varios archivos sigue siendo una sola viñeta, bajo su primer archivo. Si lo principal no es un archivo (una decisión, una corrección de un diagnóstico, una medición), la viñeta empieza por texto en negrita sin archivo y va **al final de esa fecha**.
  5. Un cambio que abarca dos fechas se pone bajo la más reciente y la otra se anota en el título (por ejemplo «(04 y 05-sep)»).
  6. Lo que no tiene fecha conocida va en la sección final «Sin fecha en el comentario original», con el mismo criterio de archivo.
  7. Las secciones «Abiertos» (al inicio) y «Sin fecha…» (al final) son las únicas que no son una fecha. **No se crean secciones por archivo ni por tema.** Al trasladar texto largo del historial, cada entrada corta se reparte en la fecha que le corresponde.
- **Al escribir en `Contexto_Base_Web.md`:** (a) toda sección `### PFxxx` nueva lleva el **siguiente número libre** (nunca se reutiliza uno; el último vigente es el mayor de la tabla) y **su fila en «Mapa de secciones PF»** (arriba del archivo); (b) si el cambio renombra o renumera un `.gs`, se añade su fila a «Equivalencias de nombres de archivo `.gs`»; (c) la línea de cada tanda de traslado va en «Registro del traslado», no en la cabecera; (d) todo pendiente nuevo («pendiente de definir o contestar», regla 3) lleva su fila en «Abiertos del contexto», y al cerrarlo se cambia su estado ahí; (e) si una sección PF reemplaza o corrige a otra, la nueva lo dice en su primera línea y no se deja la corrección enterrada en medio de otra sección.
- **Verificación obligatoria al añadir viñetas:** corre `npm run check-changelog` (o `node scripts/verificar-changelog.js`) en el repo `Web`; falla si una fecha está fuera de orden, si hay secciones que no son fecha, si las entradas de un archivo no están juntas, si los archivos no van de la A a la Z o si las entradas sin archivo no quedan al final de su fecha. No dar por terminada la tanda con el verificador en rojo.

**Orden al terminar una tanda de cambios:**
1. Subir el código al repo que corresponda.
2. Escribir en el contexto el funcionamiento, las decisiones y lo probado.
3. Añadir la viñeta al `CHANGELOG.md` (si es frontend) en su fecha y archivo, correr `npm run check-changelog` y actualizar «Abiertos».
4. Marcar lo hecho en el consolidado del que salió el cambio, si lo hay.
5. Dar la lista de archivos modificados o creados (con su commit) y los recordatorios que apliquen: pull en GitHub Desktop, `subirBaseDesdeGithub()`, pasar el `Generador` a mano.
6. Si con esto el consolidado queda aplicado por completo, informarlo y preguntar si se borra (sección 1).

*Pendiente de definir:* el repo `Backend` no tiene `CHANGELOG.md`. Hoy su historial es el de git (mensajes de commit claros), los `AVISOS ABIERTOS` del `.gs` y el contexto. Falta que la usuaria diga si quiere uno.

## 7. Reglas propias de un consolidado

Si un consolidado necesita una regla que solo vale para él (por ejemplo, en qué archivos `.gs` ya existe el bloque `AVISOS ABIERTOS`), se escribe dentro de ese consolidado, con un nombre que no choque con la numeración de aquí (P1, P2…). Si resulta valer para todos, se mueve a este archivo.

## 8. Al editar este archivo

Estas mismas reglas rigen al editarlo, y también al editar la skill `/md`: cambios chicos, sin asumir ni omitir nada, cualquier cambio de criterio marcado como corrección (regla 9), y antes de guardar se revisa que la regla nueva no contradiga ni duplique otra. Una regla se escribe en un solo lugar.

## 9. Contexto en dos archivos: `Contexto_Base_Web.md` (vigente) y `Contexto_Base_Web_Detalle.md` (detalle por `.gs`)

*Por qué.* `Contexto_Base_Web.md` llegó a 4,26 MB, el 79 % en bloques históricos «Detalle (texto original, sin cambios)» que casi nunca hace falta leer entera. Desde el 17-oct-2026 esos bloques se pasan, **por partes**, a `Contexto_Base_Web_Detalle.md` (decisión de la usuaria). El archivo principal queda con lo que sí se lee siempre: cabecera, «Mapa de secciones PF», «Equivalencias», «Mapa de bloques por `.gs`», «Abiertos del contexto», «Registro del traslado», el plan de fases y las secciones `PFxxx`.

**9.1 Qué va en cada archivo.**
- **`Contexto_Base_Web.md`:** todo lo que no es un bloque por `.gs`, y **todas las secciones `### PFxxx`, siempre**. Una sección PF nunca va al archivo de detalle, aunque hoy esté físicamente dentro del rango de un bloque (como las `PF074` en adelante, que están después del bloque de `37_Web_API.gs`).
- **`Contexto_Base_Web_Detalle.md`:** los bloques de cada `.gs` (`# Archivo NN_Nombre.gs`, con su «Índice de bloques movidos» y su «Detalle»), copiados **tal cual, sin cambiar una coma**. Es histórico: puede no coincidir con el código de hoy y **no se edita**; si algo de ahí quedó desactualizado, se corrige con una sección PF o una nota «Estado posterior (regla 9)» en la sección PF que corresponda, no tocando el bloque.
- **«Mapa de bloques por `.gs`»** (en el principal) dice en qué archivo está cada bloque. Es la única fuente de verdad de la ubicación.

**9.2 Cómo se resuelve una referencia `[→ Contexto_Base_Web.md §…]` de un `.gs` o de un texto.** `§PFxxx` está siempre en `Contexto_Base_Web.md`. `§NNBxxx` (o `§Bxxx`, de `00_Main.gs`): el prefijo `NN` se busca en el «Mapa de bloques por `.gs`» y el bloque está en el archivo que ella indique. **No se reescriben los comentarios de los `.gs`** (`Base/src` se pisa en cada «Descarga Base» desde Apps Script, así que el cambio se perdería y el código en vivo seguiría con el nombre viejo). Tampoco se reescriben las citas `§NNBxxx` dentro de los textos de las secciones PF.

**9.3 Cómo se pasa una parte (siempre en este orden, todo en **un solo commit** del repo `Backend`).**
1. `git pull --rebase` justo antes de empezar y `python3 "Consolidados de cambios/verificar_contexto.py"`: debe dar «OK» **antes** de mover nada. Si no da OK, se arregla eso primero y se anota.
2. La unidad es el bloque completo de un `.gs` (desde su `# Archivo NN_…` hasta justo antes del siguiente `# Archivo`, o desde `## 00_Main.gs — resumen rápido` en el caso de `00_Main.gs`). **Nunca se parte un bloque.** Una parte agrupa `.gs` contiguos hasta unos 500 KB.
3. Se **copian** los bloques, sin modificarlos, al final de `Contexto_Base_Web_Detalle.md` (se crea con su cabecera si no existe; quedan en el orden en que estaban en el principal) y se comprueba que lo copiado es **idéntico byte a byte** a lo que había.
   Pasos 1 a 6 los hace `python3 "Consolidados de cambios/mover_bloques.py" --parte N archivo1.gs archivo2.gs …` (verifica antes y después, se niega a mover un bloque que contenga secciones PF y no usa `git`); los pasos 1 a 6 se hacen a mano solo en las partes 7 y 8.
4. Se borran del principal y se cambia en el «Mapa de bloques por `.gs`» la columna «Dónde está su bloque» de esos archivos.
5. Se corre `verificar_contexto.py`: debe dar «OK» (mismos IDs de bloque, ninguno repetido ni perdido, mapa coherente, **todas las referencias de los `.gs` siguen resolviendo**).
6. Se añade una línea a «Registro del traslado» (parte, archivos, tamaño que salió del principal) y se marca la parte en el plan de abajo.
7. `git pull --rebase` otra vez, y se sube de inmediato. (Si hay otra sesión escribiendo en el mismo archivo —el 17-oct-2026 la usuaria confirmó que no había ninguna—, cuanto menos tiempo pase entre mover y subir, menos choques.)

**9.4 Qué no se hace.** No se mezclan en el mismo commit el traslado de una parte y otros cambios de contenido. No se renumeran IDs. No se borra un bloque del principal sin haberlo verificado en el detalle. No se deja un bloque en los dos archivos (el verificador lo marca como error). No se mueve nada si hay otra sesión con cambios sin subir sobre esos bloques (se pregunta).

**9.5 Bloques nuevos o ampliados.** Si un cambio de código crea un bloque nuevo para un `.gs` ya movido, el bloque va en `Contexto_Base_Web_Detalle.md`, en el «Índice de bloques movidos» de ese archivo, con el siguiente ID libre de su prefijo. Las decisiones y el funcionamiento de ese cambio van, como siempre, en una sección PF del principal.

**9.6 Plan de partes** (se marca cada una al terminarla, en este mismo cuadro y en el registro):

| Parte | `.gs` | Tamaño aprox. | Estado |
|---|---|---|---|
| 1 | `01` a `08` | 468 KB | **Hecha el 17-oct-2026** |
| 2 | `09` a `14` | 495 KB | **Hecha el 17-oct-2026** |
| 3 | `15` a `19` | 523 KB | **Hecha el 17-oct-2026** |
| 4 | `20` a `25` y `27` a `30` | 412 KB | Pendiente |
| 5 | `26_Torneos_Core.gs` | 386 KB | Pendiente |
| 6 | `31` a `36`, `39`, `42`, `48`, `49`, `40`, `41`, `43`, `45`, `46`, `44`, `47` y `38_Web_Endpoints.gs` | 437 KB | Pendiente |
| 7 | `00_Main.gs` (sección «resumen rápido», índice y detalle, dentro de la primera sección del principal) | por medir | Pendiente |
| 8 | `37_Web_API.gs`: solo su resumen, su «Índice de bloques movidos» y su «Detalle»; **las secciones PF que están después se quedan** | unos 600 KB de bloques | Pendiente |

Las partes 7 y 8 piden cuidado extra: los bloques no coinciden con un `# Archivo` contiguo. Antes de empezarlas se fija el límite exacto y se anota aquí.
