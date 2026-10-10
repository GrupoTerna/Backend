---
name: md
description: "Lectura de Base.md (backend Apps Script), Web-main.zip (frontend JS del repo GrupoTerna/Web), Tampermonkey.md (script de Tampermonkey) y Generador.md (proyecto que genera/sincroniza Base)"
---

# Skill: `md` — lectura, corrección y consolidados de fases de proyectos en .md/.zip

## Idioma

Responder siempre en **español de Perú**. Evitar modismos, léxico o entonación de español de Argentina u otras variantes regionales.

## Objetivo

Este proyecto tiene un ecosistema de fuentes de código recurrentes que el usuario sube en distintos momentos, no necesariamente juntas. Por el momento son estas cuatro (puede ampliarse si el usuario incorpora más adelante):

1. **`Base.md`** — consolidado del **backend en Google Apps Script**. Contiene el código completo de múltiples archivos `.gs` (normalmente alrededor de 38), concatenados dentro de un único archivo. El hecho de que la extensión sea `.md` **no significa que deba tratarse como texto libre ni ignorarse**: es, en la práctica, el conjunto real de archivos `.gs` del proyecto.

   `Base` puede descargarse en 4 formatos distintos — `.md`, `.gs`, `.zip` o `.txt` — y los cuatro son igual de válidos como fuente. El usuario suele usar `.md` por comodidad, pero puede subir cualquiera de los otros tres. Aplicar las mismas reglas de esta skill sin importar el formato en que llegue.

   **Caso particular del formato `.zip`:** cuando `Base` se descarga como `.zip`, viene con cada archivo `.gs` por separado **y además** puede incluir un archivo consolidado (típicamente `Script consolidado.gs` o similar) que reúne el código de todos los demás en uno solo, generado automáticamente como respaldo. **Ese consolidado dentro del zip debe ignorarse por completo**: no leerlo, no editarlo, no gastar tokens en él. Es redundante porque su contenido es idéntico a la suma de los demás `.gs` del zip. Esta regla de ignorar el consolidado aplica **únicamente cuando se tiene la versión `.zip` con los archivos `.gs` separados** — cuando la fuente es directamente `Base.md` (o `.txt`), no hay tal consolidado adicional que ignorar, porque el propio `Base.md` ya es el consolidado y es la fuente que sí se debe leer.
2. **`Web-main.zip`** — el **frontend en JavaScript**, descargado directamente del repositorio público de GitHub [GrupoTerna/Web](https://github.com/GrupoTerna/Web). Es el resultado de descargar el repo como zip (de ahí el sufijo `-main`).
3. **`Tampermonkey.md`** — el **script de Tampermonkey**. Tampermonkey no permite subir archivos, así que el usuario usa `.md` únicamente como formato de conveniencia para poder descargar y compartir el código. Esto **no lo convierte en texto libre ni en algo ignorable**: es el código real del script.
4. **`Generador.md`** (o `.gs`/`.zip`/`.txt`) — es el **proyecto Apps Script que genera y sincroniza `Base`**. No es parte del backend de `Base` en sí, sino la herramienta que lo produce. Ver sección "El Generador" más abajo para el detalle de qué es y cuándo se necesita.

La skill debe trabajar sobre el contenido real de estos archivos y devolver **únicamente los archivos puntuales que hayan sido modificados**, listos para descargar — nunca carpetas, zips ni el consolidado completo.

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

- Estos consolidados de fases son **temporales por naturaleza**: se usan mientras se van aplicando los cambios que describen, y se descartan en cuanto esos cambios quedan aplicados.
- No deben tratarse como una fuente permanente del ecosistema (a diferencia de `Base`, `Web-main`, `Tampermonkey` y `Generador`, que sí son recurrentes y estables).
- Mientras estén vigentes en la conversación, se leen igual que cualquier `.md` (ver "Archivos md adicionales" más abajo): nunca se asume su contenido a partir del portapapeles.
- Si el usuario indica que un consolidado de fases ya fue aplicado o que ya no es necesario, dejar de usarlo como referencia para nuevas modificaciones.

### Compactación cuando el consolidado crece demasiado

Un consolidado de fases acumula, sesión tras sesión, capas de correcciones sobre correcciones (ver regla 9) y de reemplazos entre secciones (ver regla 11). Esto lo hace cada vez más largo y cada vez más caro de leer completo solo para saber qué sigue vigente hoy.

- Cuando el consolidado supere aproximadamente 500-600 líneas, o cuando el usuario lo pida explícitamente ("compacta el plan", "resume el consolidado", etc.), ofrecer o generar una versión **compactada**.
- La versión compactada conserva, por cada fase o punto, únicamente su **estado vigente** (ya incorporadas las correcciones y reemplazos aplicables) junto con la **fecha de la última verificación**. No debe hacer falta leer el historial para saber qué es cierto hoy.
- El historial de correcciones y reemplazos no se descarta: se mueve a una sección aparte al final, tipo `## Historial de correcciones` (changelog), donde queda la trazabilidad completa (qué decía antes, qué lo corrigió o reemplazó, y cuándo) sin estorbar la lectura del estado actual.
- La nota de autoinvocación (ver "El consolidado debe poder invocar la skill por sí solo", sección 16) se conserva igual en la versión compactada.
- Compactar es una reorganización, no una reescritura de contenido: no se cambia el significado de ningún punto ni se descarta información al compactar, solo se reordena entre "estado vigente" e "historial".

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

**Si `Base.md`, `Web-main.zip`, `Tampermonkey.md` o `Generador.md` están disponibles, el código actual se obtiene de esos archivos, no del texto pegado en el chat.**

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

Entregar **exclusivamente** los archivos puntuales que hayan sido efectivamente editados, cada uno como archivo individual descargable, salvo que el usuario pida explícitamente el proyecto completo.

---

# 7. Archivos modificados: siempre como archivos reales

Todo archivo `.gs` modificado debe entregarse como **archivo real descargable y abrible**.

Nunca entregar un archivo modificado únicamente como bloque de código dentro del chat.

El usuario debe poder:

1. descargar el archivo;
2. abrirlo;
3. copiarlo directamente;
4. guardarlo;
5. reemplazar el archivo correspondiente en su proyecto.

Esto es especialmente importante para archivos largos.

## Regla absoluta

**Archivo modificado = archivo descargable.**

No sustituir el archivo descargable por un bloque de código Markdown.

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

## Paso 10 — Crear archivos descargables

Generar físicamente solo los archivos individuales modificados (`.gs`, `.js`, `.md`, etc., según corresponda).

Cada archivo debe conservar exactamente su nombre original. Nunca generar un `.zip` ni una carpeta con el proyecto completo.

## Paso 11 — Entregar

Entregar únicamente los archivos puntuales que hayan sido modificados, salvo que el usuario solicite explícitamente todos los archivos o el proyecto completo.

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

El usuario debe recibir los archivos corregidos directamente como archivos descargables, uno por uno, nunca como carpeta o zip.

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

No entregar los archivos como bloques de código en el chat.

---
# 16. Cambios incrementales y continuidad entre sesiones

Los cambios se entregan en tandas chicas e incrementales, para evitar que la sesión se corte sin haber devuelto los archivos.

No debe perderse información entre una conversación y la siguiente:

- Como el trabajo avanza entre sesiones y el chat se borra antes de empezar una nueva, se busca no perder el contexto de una conversación a otra. Nada se debe perder de un chat a otro.
- Si el usuario explica el comportamiento de algo o da alguna confirmación, eso se documenta de inmediato en el lugar que corresponda según dónde sea relevante la información: el plan de fases vigente, `Base.md` o `Web-main`. No debe quedar solo dicho en el chat.

## Referencias en el changelog: archivo + función, no solo el número

Como los archivos `.gs` pueden reordenarse o reagruparse como proyecto completo (ver sección 2bis), un número de archivo por sí solo no es una referencia confiable en el tiempo: el archivo que hoy es `17_GuerraSheet.gs` puede tener otro número después de un reordenamiento, aunque su contenido y su función no hayan cambiado.

Por eso, toda entrada de changelog o historial que documente un cambio — ya sea el bloque `AVISOS ABIERTOS`/`VERIFICACIONES ABIERTAS` dentro de un `.gs`, la sección "Historial de cambios" de un consolidado de fases, o la sección "Historial de correcciones" que deja la compactación (ver "Consolidados de fases de un plan: uso temporal") — debe indicar, como mínimo:

- el **nombre exacto del archivo** en el momento de la edición;
- la **función o bloque específico** que se editó dentro de ese archivo (no solo "se modificó el archivo");
- un **contexto breve** de qué cambió y por qué (una o dos líneas alcanza; no hace falta repetir la fase completa si ya está documentada en otro lado del mismo consolidado).

Esto permite que, si el proyecto se reordena más adelante, alguien pueda seguir ubicando el cambio por la función y el contexto aunque el número del archivo ya no coincida con el que aparece en el changelog.

## Reglas de trabajo del plan, incluidas en cada consolidado de fases

Cuando el usuario pida generar un consolidado de fases, se le agregan estas reglas, tal como están escritas a continuación bajo el título "Reglas de trabajo de este plan". Las reglas 1 a 7 fueron dictadas explícitamente por el usuario; las reglas 8 a 11 se extrajeron de prácticas que el usuario ya venía siguiendo de forma consistente en consolidados de fases anteriores (aunque nunca las había escrito como regla explícita), así que se incorporan también como reglas fijas del plan:

> ### Reglas de trabajo de este plan (van también para cada fase futura)
>
> Estas reglas aplican a **todas** las fases de este plan, no solo a la primera:
>
> 1. **Invocar siempre `/md`** al empezar cualquier sesión de este proyecto, sin excepción. Como respaldo por si el usuario olvida escribir `/md` en el chat, el propio consolidado trae una nota de autoinvocación al inicio (ver "El consolidado debe poder invocar la skill por sí solo", más abajo).
> 2. **No asumir, no omitir, no descartar nada.** Ante cualquier duda, se pregunta. Si el usuario no responde algo, se vuelve a preguntar, y si hace falta se generan más preguntas y se explica de forma más detallada la pregunta.
> 3. **Ninguna advertencia o sugerencia se queda solo en el chat.** El usuario no programa y puede no entender el detalle técnico, así que toda alerta, advertencia o sugerencia se guarda directo en este consolidado (o en el `.gs` correspondiente, ver punto 5) marcada como **"pendiente de definir o contestar"**, junto con el contexto de los datos o confirmaciones que el usuario ya haya dado sobre ese tema, para poder tomar la decisión cuando corresponda.
> 4. **Cambios chicos e incrementales.** Nunca abarcar de más en una sola tanda.
> 5. **Nunca se entregan parches.** Cada archivo modificado se entrega **completo y listo para descargar**, con su nombre exacto, y se entrega **solo el archivo o los archivos que realmente se hayan modificado** en esa tanda — nunca el proyecto completo, nunca una carpeta ni un zip.
> 6. **Cada fase debe poder completarse dentro de una sola sesión gratuita de Claude.** Si una fase resulta demasiado grande al empezarla, se debe avisar y partirla en sub-fases en vez de forzarla en una sola sesión.
> 7. **Indicar en cada fase qué archivos `.gs` (o qué otra fuente) hay que subir**, y si es para **ver información** o para **editar**.
> 8. **Ningún cambio se hace "a ciegas".** Cada fase debe cerrar con una verificación revisable (diff visual, prueba funcional, comparación antes/después, etc.) antes de pasar a la siguiente, e indicar explícitamente qué se pudo verificar y qué quedó sin probar (por ejemplo, "no se probó en navegador real" o "no se pudo probar en Apps Script real").
> 9. **Los errores de sesiones anteriores se marcan como corrección, nunca se sobrescriben en silencio.** Si un diagnóstico, una cifra o una recomendación de una sesión anterior resulta incorrecta, la entrada nueva empieza señalándolo explícitamente (por ejemplo, "Corrección a lo dicho antes: ..."), para que el usuario pueda seguir el cambio de criterio sin tener que comparar versiones a mano.
> 10. **Las advertencias que deban vivir en el código (no solo en este consolidado) van en un bloque `AVISOS ABIERTOS` / `VERIFICACIONES ABIERTAS`** dentro del `.gs` correspondiente, siguiendo el mismo formato que el proyecto ya usa como referencia.
> 11. **Toda sección que reemplace o tenga precedencia sobre una sección o punto anterior debe decirlo en su primera línea**, indicando exactamente qué secciones o puntos reemplaza y cuáles no toca (por ejemplo, "Esta sección reemplaza el punto 6 de la sección 5; el resto de la sección 5 sigue vigente"). Esto es distinto de la regla 9 (correcciones a diagnósticos o cifras erróneas): la regla 11 aplica cuando una sección queda obsoleta por datos o decisiones más nuevas, no porque la anterior estuviera mal.

## El consolidado debe poder invocar la skill por sí solo

El usuario puede olvidar escribir `/md` en el chat al subir un consolidado de fases. Para que la regla 1 no dependa de la memoria del usuario, **todo consolidado de fases que esta skill genere o edite debe llevar, en sus primerísimas líneas, antes de cualquier otro contenido**, una nota de autoinvocación como esta:

> **Nota para Claude:** este documento pertenece al proyecto de la skill `/md`. Si esta skill no fue invocada explícitamente en el chat, invócala de todas formas al leer este documento y aplica todas sus reglas (`Base.md`/`Web-main.zip`/`Tampermonkey.md`/`Generador.md` como fuente real y no como texto libre, nunca parches, archivos completos con su nombre exacto, cambios chicos e incrementales, etc.) — esto sirve como respaldo por si el usuario olvidó escribir `/md` en el mensaje.

Esta nota va siempre, en todo consolidado de fases nuevo o reescrito, sin que el usuario tenga que pedirla cada vez.

## Estas mismas reglas también rigen para esta skill

Las reglas 1 a 11 de arriba no son exclusivas de los consolidados de fases que se generan para `Base`, `Web-main`, `Tampermonkey` o `Generador`: aplican igual cuando lo que se modifica es esta propia skill (`SKILL.md` de `md`), porque también es un archivo que evoluciona entre sesiones. En concreto:

- Los cambios a esta skill también se entregan chicos e incrementales, nunca todo de una vez.
- No se asume ni se omite nada sobre cómo debe quedar una regla; ante la duda, se pregunta.
- Toda decisión, aclaración o confirmación que el usuario dé sobre el comportamiento de la skill se documenta directamente en este archivo, no solo en el chat.
- Al modificar esta skill nunca se entrega un parche ni un fragmento: se entrega el `SKILL.md` completo y actualizado, listo para reemplazar al anterior.
- No se pierde contexto entre sesiones: si algo queda pendiente de definir sobre el comportamiento de la skill, debe quedar anotado en este mismo archivo, no solo mencionado y olvidado.
- Ningún cambio a esta skill se hace a ciegas: antes de entregar el `SKILL.md` modificado, se revisa que la regla nueva o corregida no contradiga ni duplique otra ya existente en el archivo.
- Si una regla anterior de esta skill resultaba incompleta o equivocada, el cambio se marca como corrección explícita (no se reescribe en silencio como si siempre hubiera dicho eso).
# 17. Regla de oro

**`Base.md` = código actual del backend (Apps Script). `Web-main.zip` = código actual del frontend (JS, repo GrupoTerna/Web). `Tampermonkey.md` = código actual del script de Tampermonkey. `Generador.md` = código actual del proyecto que genera y sincroniza `Base`.**

**Ninguno de estos cuatro se ignora ni se reinterpreta por tener extensión `.md` o `.zip`: son código real, no texto libre.**

**El chat = instrucciones y contexto. El texto pegado en el chat nunca sustituye el contenido de un archivo adjunto, aunque se peguen en el mismo mensaje.**

**Los nombres `01_Main.gs`, `04_Setup.gs`, etc. son nombres reales y deben conservarse exactamente.**

**Archivo modificado = archivo completo.**

**Archivo modificado = archivo descargable individual.**

**Nunca entregar un parche como sustituto del archivo completo.**

**Nunca entregar una carpeta ni un zip completo: solo los archivos puntuales modificados.**

**Ningún `.gs` entregado debe contener comillas inversas, etiquetas de lenguaje ni restos de formato Markdown/HTML: solo código Apps Script válido.**

**Responder siempre en español de Perú.**