# Reglas de los consolidados de cambios

**Este es el único lugar donde viven las reglas de los consolidados.** Valen para cualquier IA (Claude u otra) que cree, lea o edite un consolidado de esta carpeta. No se repiten en la skill ni dentro de cada consolidado: si se copiaran, al editar un archivo el otro quedaría desfasado. Una regla **propia de un consolidado concreto** va dentro de ese consolidado; el resto va aquí.

*Origen:* las reglas 1 a 12 salieron de la sección 0 del `Consolidado_Plan_de_Fases.md` y de la skill `/md`, y se unificaron el 11-oct-2026. Los números se conservan porque los consolidados ya los citan («regla 9», «regla 11»).

## 1. Qué es un consolidado y cuánto vive

- Reúne cambios **por aplicar**, normalmente sugeridos en una sesión. La usuaria a veces le pide a una IA cualquiera su opinión para mejorar el sistema, así que puede haber varios consolidados, de distinto origen, en `Consolidados de cambios/`.
- **Es temporal: se borra en cuanto se termina de aplicar** (dicho por la usuaria el 11-oct-2026; `Contexto_Base_Web.md` ya lo decía para el plan de fases). Por eso el **funcionamiento del sistema** no se queda en el consolidado: va a `Contexto_Base_Web.md`.
- **Antes de borrarlo**, pasar a `Contexto_Base_Web.md` el funcionamiento y las decisiones tomadas y descartadas, cada una con su motivo. No se conservan el estado, los pendientes, «archivos a subir» ni la «confianza».
- **Pendiente de definir (regla 2):** quién lo borra y cuándo se considera «terminado de aplicar». Mientras no se defina, la IA **no borra** un consolidado sin confirmación explícita de la usuaria.
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
12. **Ningún detalle mencionado en el chat sobre el plan, el código o los datos se queda solo en la conversación** *(dictada por la usuaria el 23-sep-2026)*. Todo dato, decisión, corrección o aclaración se guarda por escrito. El destino se decide según a qué afecte, no por defecto en un solo lugar:
    - Si afecta a una fase, pregunta o al estado del plan → en el consolidado (la fase, la sección de preguntas o el historial).
    - Si afecta a la lógica o al comportamiento del backend → en el bloque `AVISOS ABIERTOS` / `VERIFICACIONES ABIERTAS` del `.gs` (regla 10).
    - Si afecta al frontend → en el archivo del repo `GrupoTerna/Web` que corresponda, o en el consolidado mientras ese repo no esté disponible en la sesión.
    - Un mismo detalle puede necesitar guardarse en más de un lugar: no es una elección excluyente.
    - **Pendiente de actualizar (11-oct-2026, por confirmar):** la usuaria dijo que lo que explica cómo funciona el sistema, y toda hipótesis comprobada o descartada con su motivo, se escribe en `Contexto_Base_Web.md`. Esa regla se suma a los destinos de arriba; falta que confirme cómo quedan junto a ellos y cómo será el `CHANGELOG.md` de `Web` (ver la sección 5).

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

*Pendiente de definir:* el formato del `CHANGELOG.md` del repo `Web`. La usuaria piensa que, después de pasar al contexto lo que explica cómo funciona el sistema, debería quedar como una lista de lo que se ha hecho; falta confirmarlo.

## 6. Reglas propias de un consolidado

Si un consolidado necesita una regla que solo vale para él (por ejemplo, en qué archivos `.gs` ya existe el bloque `AVISOS ABIERTOS`), se escribe dentro de ese consolidado, con un nombre que no choque con la numeración de aquí (P1, P2…). Si resulta valer para todos, se mueve a este archivo.

## 7. Al editar este archivo

Estas mismas reglas rigen al editarlo, y también al editar la skill `/md`: cambios chicos, sin asumir ni omitir nada, cualquier cambio de criterio marcado como corrección (regla 9), y antes de guardar se revisa que la regla nueva no contradiga ni duplique otra. Una regla se escribe en un solo lugar.
