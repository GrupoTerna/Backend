> **Nota para la IA:** antes de trabajar con este documento, lee `Consolidados de cambios/Reglas_Consolidados.md` y consulta `Contexto_Base_Web.md` para cualquier duda de funcionamiento. Si eres Claude y la skill `/md` no fue invocada, invócala. El código vigente está en los repos de `GrupoTerna`; los archivos `.md` o `.zip` subidos al chat son copias que pueden estar desfasadas.

# Consolidado — Mini historial, «Ingresos recientes» e historial de guerra del perfil

*Creado el 22-oct-2026 (pedido de la usuaria). Estado: **tanda 1 aplicada; tandas 2 a 6 por aplicar** (ver «Estado» al final). El 22-oct-2026 se añadió la tanda 6 (`guerra.html`) y se guardaron las respuestas de la usuaria (sección 3b). Sigue a §PF169 (mini historial en el Directorio) y §PF172 (WhatsApp junto al 📈).*

## 0. Indicaciones de la usuaria (texto literal, 22-oct-2026; regla 12)

> no edites código aún, primero guarda todas estas indicaciones en el repositorio y divídelo en tandas, cuando eso ya esté listo puedes empezar a codificar lo más sencillo a más complicado. en el minihistorial, sombrea intercalado entre semanas y en la cabecera añade la información de cabecera de perfil (nivel de rey, nivel de xp, nivel de colección, victorias de guerra, copas, vigencia) y falta añadir el clan actual. todos los encabezados de la tabla se deben centrar, se debe añadir una columna de numeración automática (N°), otra de temporada y otra de semana. la columna día debe quedar como J, V, S, D. se debe agregar la columna Fecha a la derecha de numeración automática, debe mostrarse como 22/10/2026. los encabezados serían N° Fecha Temporada Semana Día Ataques Barcos Medallas con letras verdes para 4 ataques, letras amarillas para 2 y 3 ataques y rojas para 0 ataques, toda la fila comparte el color de letra. en ingresos recientes se debe agregar una pastilla que permita ocultar a los que tienen número registrado. a la derecha del ícono de wsp en ingresos recientes se debe agregar el ícono del mini historial.. el botón de historial de guerra en el perfil muestra 0 ataques mientras que el mini historial sí muestra el valor real de 4 ataques. no se debe mostrar con el selector así porque limitando a una semana solo se puede ver 4 filas. muevelo a una sección en perfil, así como batallas más recientes o cofres que tienen su sección independiente y se muestra solo a pedido. haz que muestre una cantidad razonable de filas al tocar esa pastilla y ponle la pastilla de "Ver más", revisa si está usando la misma fuente que el mini historial.

### 0b. Indicaciones adicionales de la usuaria (texto literal, 22-oct-2026; regla 12)

> añade a las tandas que en guerra.html se resalte o sombree la semana o día actual (columna). te confirmo que los íconos de wsp se ven bien, el tamaño está bien y la psoición también

*Confirmación (sobre §PF172, que no está cambiada por esta tanda):* los íconos de WhatsApp se ven bien en tamaño y posición, vistos por la usuaria el 22-oct-2026. Eso cierra la parte «SIN PROBAR en navegador real» de §PF172 solo en lo visual; lo que dependía de Apps Script (`_webAdminTagsConWsp()`) no queda confirmado por esta frase.

## 1. Hallazgos de la lectura del código (22-oct-2026, solo lectura; sin cambios)

- **Respuesta a «revisa si está usando la misma fuente»: NO.** El mini historial (`assets/js/features/mini-historial.js`) pide `webHistorialGuerraComparador` (`_webHistorialGuerraComparador()`, `37_Web_API.gs`): historial **diario**, público, últimos ~180 días, armado con `Backup_Guerra.csv` + la hoja Guerra y con `fame` y `barcos` acumulados que `guerraAValoresDiarios()` (`util.js`) convierte en valores del día. El botón «📜 Historial de guerra» del perfil (`perfil.html`, `verHistorialGuerra()`) pide `webHistorialGuerraJugador` (`_webHistorialGuerraJugador()`, `20_HistorialGuerraJugador.gs`): registros **semanales** (una fila por temporada interna y semana, de `_cargarHistorialGuerraIndividual()`), solo admin, con columnas Fecha, Temporada, Semana, Clan, Ataques, Medallas, Barcos y Comentario. Son dos cálculos distintos; es la causa más probable de que uno muestre 0 y el otro 4. **Causa exacta sin verificar** (hace falta el caso real de la usuaria: qué jugador y qué semana, y si la semana estaba sin cerrar).
- La tabla del perfil se limita a una semana con tres `<select>` (año, temporada, semana), por eso solo ve 4 filas. Es la parte que la usuaria pide quitar.
- El comparador **no manda hoy** `temporada`, `semana` ni `clan` por día: el backend los lee en `_registrar()` (`temp`, `pIdx`, `clan`) pero los usa solo para marcar `opcional` y no los incluye en la respuesta (`{fecha, ataques, fame, barcos, opcional?}`). Para las columnas Temporada y Semana hay que añadirlos al backend (campos **aditivos**).
- La cabecera del mini historial (`histAbrir()`) hoy solo muestra el nombre y el Tag. Los datos de cabecera de perfil (nivel de torre del rey, XP, copas, victorias de guerra, vigencia) vienen de `webPerfilJugador` (`perfil.html`, `raw.expLevel`, `j.extendido.nivelXp`, `j.vigencia`); el roster público trae `copas`, `victoriasGuerra`, `nivelXp`, `vigencia` y clan, pero no está confirmado que traiga nivel de rey ni de colección.
- `tieneWsp` solo existe con sesión de admin (§PF165, §PF171, §PF172), así que la pastilla de «ocultar con número» solo puede ser para admins.
- El 📈 se pinta con `botonHistJugador()` y el WhatsApp ya va a su izquierda (§PF172); en las tarjetas de «Ingresos recientes» (`nuevoCardHtml()`, `directorio.html`) el WhatsApp es `.ico-wsp` y aún no lleva el 📈.

## 2. Tandas (de lo más sencillo a lo más complicado)

**Orden de ejecución propuesto (22-oct-2026):** 1 (hecha) → 2 → **6** (`guerra.html`, solo `Web`, parecida en tamaño a la 2; se numera 6 para no renumerar las tandas ya citadas) → 3 → 4 → 5.

Orden pedido por la usuaria. Cada tanda debe poder terminarse en una sesión (regla 6) y cerrar con pruebas y verificación (regla 8). `Contexto_Base_Web.md` se actualiza al terminar cada una (nueva sección `PFxxx`, regla 6 de `Reglas_Consolidados.md`).

### Tanda 1 — Aspecto de la tabla del mini historial (solo `Web`; sencilla)
- **Leer y editar:** `assets/js/features/mini-historial.js` (`histPintar()`; `histFechaCorta()`), `assets/styles.css` (`.hist-tabla`, `.hist-cero`, `.hist-hoy`), pruebas `test/mini-historial-dom.test.js` y `test/guerra-historial-valores-diarios.test.js`; `sw.js`.
- **Cambios:** (a) todos los encabezados centrados; (b) columna **N°** automática a la izquierda; (c) columna **Fecha** a su derecha, como `22/10/2026`; (d) la columna **Día** pasa a una sola letra **J, V, S, D**; (e) orden de encabezados de esta tanda: **N° · Fecha · Día · Ataques · Barcos · Medallas** (Temporada y Semana llegan en la tanda 3); (f) **color de letra de toda la fila** según los ataques: verde con 4, amarillo con 2 y 3, rojo con 0 (el 1 quedó sin color propio hasta que la usuaria respondiera P1). **Corrección del 22-oct-2026 (regla 9):** la usuaria respondió que **con 1 ataque también es amarillo**; la regla final es verde con 4, **amarillo con 1, 2 y 3**, rojo con 0 (ajuste en el código: ver «Estado»); (g) **sombreado alternado entre semanas** (las filas de una misma semana comparten fondo y la semana siguiente lleva otro); sin el dato de semana del backend, la semana se agrupa por el lunes que la contiene, igual que `lunesSemanaHistorialGuerra()` de `perfil.html`.
- **Cuidar:** contraste de color (WCAG, mínimo 4,5:1) sobre el fondo oscuro y sobre el sombreado; que el sombreado de «día en curso» (`.hist-hoy`) y el de semanas se distingan; que el color no sea la única señal (el número ya está). Medir con `scripts/medicion-accesibilidad/` si es posible.

### Tanda 2 — «Ingresos recientes» (solo `Web`; sencilla)
- **Leer y editar:** `directorio.html` (`nuevoCardHtml()`, `.ico-wsp`, barra de filtros de la sección y `nuevosCount`), `assets/js/features/mini-historial.js`, `assets/styles.css`; `test/directorio-ingreso-wsp-dom.test.js`; `sw.js`.
- **Cambios:** (a) el ícono del mini historial (📈) **a la derecha** del ícono de WhatsApp en cada tarjeta, abriendo la misma ventana (sirve también para cuentas sin WhatsApp: el 📈 va siempre, el WhatsApp solo si hay celular y sesión de admin); (b) una **pastilla** que oculta a los que tienen número registrado, solo para admins (sin sesión no existe, porque `tieneWsp` no llega).
- **Cuidar:** que el contador `nuevosCount` y las gráficas que usan la lista (la leyenda «Jugadores incluidos en las gráficas») sigan coherentes al ocultar; ver P4.

### Tanda 3 — Columnas Temporada y Semana (backend aditivo + `Web`)
- **Leer y editar:** `Base/src/37_Web_API.gs` (`_webHistorialGuerraComparador()`, `_registrar()` y el armado de `o`), `mini-historial.js`, `Contexto_Base_Web.md` (§37B174 a §37B176 en `Contexto_Base_Web_Detalle.md`); pruebas.
- **Cambios:** el comparador manda por día `temporada`, `semana` y `clan` (aditivos; ningún consumidor actual se rompe: `directorio.html` comparador de gráficas, `guerra.html`). La tabla pasa a **N° · Fecha · Temporada · Semana · Día · Ataques · Barcos · Medallas**. Con esto el sombreado por semana (tanda 1) usa la semana real.
- **Depende de:** P2 (qué número es «Temporada» y qué es «Semana»).
- **Recordatorio al cerrar:** correr `subirBaseDesdeGithub()` antes de cualquier descarga.

### Tanda 4 — Cabecera del mini historial con los datos del perfil (backend + `Web`)
- **Leer y editar:** `mini-historial.js` (`histAbrir()`, `histPintar()`), la fuente de datos que se decida en P3 (`37_Web_API.gs`, `_webPerfilJugador()` o el comparador), `assets/styles.css`; pruebas.
- **Cambios:** en la cabecera de la ventana: **nivel de torre del rey, nivel de XP, nivel de colección, victorias de guerra, copas, vigencia y el clan actual**.
- **Depende de:** P3 (de dónde salen los datos y si son visibles para el público o solo para admins).

### Tanda 5 — «Historial de guerra» del perfil como sección propia, a pedido (`Web`; la más compleja)
- **Leer y editar:** `perfil.html` (`#btnVerHistorialGuerra`, `#mHistorialGuerraWrap`, `verHistorialGuerra()`, `construirSelectoresHistorialGuerra()`, `pintarSelectoresHistorialGuerra()`, `filasFiltradasHistorialGuerra()`, `pintarTablaHistorialGuerraFiltrada()`; el patrón de las tarjetas «Batallas más recientes» y «Ciclo de cofres», `.pf-panel-datos.pf-cinta`), `mini-historial.js` (extraer el armado de la tabla a una función compartida), `Contexto_Base_Web.md` (§PF168 y las secciones del perfil), pruebas de `perfil-historial-guerra-rango-semana`.
- **Cambios:** (a) quitar de la cabecera del perfil el botón «📜 Historial de guerra» y los tres `<select>`; (b) crear una **tarjeta propia** («Historial de guerra») con su pastilla «Ver historial de guerra», que carga **a pedido**, como Batallas y Cofres; (c) usar **la misma fuente y el mismo armado de tabla que el mini historial** (una sola función compartida), así los números coinciden; (d) mostrar una **cantidad razonable de filas** al abrir y una pastilla **«Ver más»**; (e) resolver el 0 contra 4 del perfil comprobando el caso real.
- **Depende de:** tandas 1, 3 y 4 (la tabla y la cabecera compartidas) y de P5 a P8.
- **Cuidar:** `webHistorialGuerraJugador` tiene el campo `comentario` y `cerrada` que el comparador no trae; si se deja de usar, anotar qué se pierde (P5).

### Tanda 6 — `guerra.html`: resaltar la columna del día o de la semana actual (solo `Web`; sencilla a media; pedida el 22-oct-2026)
- **Leer y editar:** `guerra.html` (cuadrículas **Valores diarios** y **Valores semanales**: `celdasMegacategoria()`, `celdasSemanas()`, `filaSubEncabezadosMega()`, `filaSubEncabezadosSemanas()`; el contexto de render que ya trae `ctx.diaLetra` y `ctx.esDiaGuerra`; el rótulo «HOY» de los botones Jue–Dom como referencia visual), `assets/styles.css` (`.ai-cell*`, `.ai-grp-*`), pruebas de `guerra` que construyen esas tablas, `sw.js` y `Contexto_Base_Web.md`.
- **Cambios (pedido literal: «se resalte o sombree la semana o día actual (columna)»):** (a) en **Valores diarios**, la columna del día en curso (J, V, S o D) con un sombreado en el encabezado y en las celdas de las tres megacategorías (Ataques, Puntaje, Barcos); (b) en **Valores semanales**, la columna de la semana en curso, también en las tres megacategorías.
- **Cuidar:** que el sombreado **no tape** los colores de celda (verde, amarillo, rojo y «opcional») ni la marca de «fila resaltada: estuvo y tiene algún 0»; que el filtro y el orden por columna (`data-col`) sigan igual; que el color no sea la única señal (añadir `aria-current` y un `title` en el encabezado); contraste mínimo 4,5:1 (WCAG); y que el estilo sea coherente con el rótulo «HOY» ya existente en la misma página.
- **Depende de:** P9 a P11 (abajo). **Fuente del dato:** no hace falta backend si el día y la semana vigentes ya llegan al render; se confirma al leer el código al empezar la tanda (si faltara el dato de la semana en curso, se anota como pendiente de backend y no se inventa).

## 3. Preguntas pendientes de definir o contestar (regla 3)

- **P1 (tanda 1).** ¿Qué color lleva una fila con **1 ataque**? La usuaria dijo verde (4), amarillo (2 y 3) y rojo (0); el 1 no se mencionó. *Mientras no se responda, queda sin color propio (texto normal).*
- **P1b (tanda 1).** ¿Los colores y el sombreado por semana valen también para la **tabla de comparación lado a lado** («Comparar con»), que tiene dos jugadores por fila? *Por defecto solo se aplica a la tabla de un jugador.*
- **P2 (tanda 3).** ¿Qué es la columna «Temporada»: el número de temporada interna (`temporadaInterna`), el de RoyaleAPI (`temporadaRoyaleAPI`) o el mes y año como en los selectores del perfil (§PF168)? ¿Y «Semana»: el número de semana de la temporada (S1, S2…) o el rango de fechas (05 OCT – 11 OCT)?
- **P3 (tanda 4).** ¿De dónde salen los datos de la cabecera? Opciones: (A) ampliar el comparador con un bloque `cabecera` (respuesta más pesada, pública); (B) pedir `webPerfilJugador` al abrir la ventana (más lento); (C) usar solo lo que ya trae el roster. Y: ¿la cabecera es pública o solo para admins? (la vigencia y los niveles hoy se ven en el perfil público.)
- **P4 (tanda 2).** Al ocultar con la pastilla a quienes tienen número, ¿se actualizan también el contador y las gráficas, o solo se esconden las tarjetas?
- **P5 (tanda 5).** ¿La nueva sección del perfil sigue siendo **solo admin** (como hoy el botón) o la ve todo el público (como el mini historial)? ¿Se pierden sin problema `comentario` y `cerrada` del historial semanal?
- **P6 (tanda 5).** ¿Cuántas filas al abrir y cuántas más por cada «Ver más»? *Propuesta: 28 al abrir (7 semanas de 4 días, igual que `HIST_FILAS_INICIALES` del mini historial) y 28 más por clic.* Hoy el mini historial usa el botón «Ver todos (n)»: ¿se cambia también a «Ver más» para que sean iguales?
- **P7 (tanda 5).** ¿En qué lugar del perfil va la tarjeta? *Propuesta: justo después de «Batallas más recientes» y antes de «Ciclo de cofres».* ¿Lleva una cinta de imagen propia?
- **P8 (tanda 5).** Para resolver el 0 contra 4: ¿qué jugador y qué día/semana mostraba 0 en el perfil y 4 en el mini historial?

### 3b. Respuestas de la usuaria del 22-oct-2026 (regla 12) y lo que sigue abierto

Lo que la usuaria respondió (texto literal entre comillas) y cómo lo leí:

- **P1 — RESPONDIDA:** «con un ataque también es amarillo». Regla final: verde 4, amarillo 1 a 3, rojo 0.
- **P2 — RESPONDIDA:** «temporada es el número interno. semana es solo S1 porque se está mostrando valores diarios». Leo: **Temporada = número de temporada interna** (`temporadaInterna`); **Semana = etiqueta corta S1, S2…** (no el rango de fechas). *Lectura de la frase «solo S1» (a confirmar en la tanda 3):* entiendo que se muestra «S1», «S2»… y no el rango, porque la tabla es diaria. Si quiso decir otra cosa, se corrige.
- **P3 — RESPONDIDA a medias:** «revisa en perfil.html, es pública». La cabecera es **pública**, y los datos se toman de lo que ya muestra `perfil.html` (`webPerfilJugador`: `raw.expLevel`, `j.extendido.nivelXp`, `j.vigencia`, etc.). **Queda abierto cuál de las opciones A, B o C se usa** (ver P3 arriba) y de dónde sale el nivel de colección; se decide al empezar la tanda 4, después de leer `perfil.html`.
- **P4 — RESPONDIDA:** «sí». Al ocultar con la pastilla se actualizan también el contador y las gráficas.
- **P5 — RESPONDIDA a medias:** «es solo para admins». La sección nueva del perfil es **solo admin**. **Sigue abierto** si se pueden perder `comentario` y `cerrada` del historial semanal (la usuaria no lo contestó; regla 2: se vuelve a preguntar antes de la tanda 5).
- **P6 — RESPONDIDA:** «sí». 28 filas al abrir y 28 más por «Ver más», y el mini historial cambia también «Ver todos» por «Ver más».
- **P7 — RESPONDIDA a medias:** «sí». La tarjeta va después de «Batallas más recientes» y antes de «Ciclo de cofres». **Sigue abierto** si lleva una cinta de imagen propia.
- **P8 — RESPONDIDA:** «#2GG8PJ8GC». Es el jugador del caso 0 contra 4. **Falta** el día o la semana exacta que mostraba 0; se revisa con los datos de ese jugador al empezar la tanda 5.
- **P1b — SIN RESPONDER:** si los colores y el sombreado valen también para la tabla de comparación lado a lado. Se vuelve a preguntar (regla 2). Mientras tanto, solo la tabla de un jugador.

**Preguntas nuevas de la tanda 6 (pendientes de definir o contestar):**

- **P9.** Fuera de día de guerra (lunes a miércoles, entrenamiento), la página muestra «los valores de la última guerra jugada». ¿En **Valores diarios** se resalta entonces **ninguna** columna, o la **última jugada** (el domingo)? *Por defecto: ninguna.*
- **P10.** En **Valores semanales**, ¿«semana actual» es la **semana de guerra en curso** (la última columna, solo cuando la temporada elegida es la vigente)? ¿Y si esa semana aún no tiene datos (por ejemplo, un jueves antes de que cargue la guerra), se resalta igual o no? *Por defecto: se resalta solo si la temporada elegida es la vigente y la columna existe.*
- **P11.** ¿Qué estilo: **fondo tenue** en toda la columna (encabezado y celdas), **borde** a los lados, o ambos? *Propuesta: fondo tenue en toda la columna y una marca en el encabezado, sin cambiar el color de los números.* ¿Aplica solo a Valores diarios y Valores semanales, o también a otra tabla con columnas J, V, S, D?

## 4. Estado

- 22-oct-2026: indicaciones guardadas y dividido en tandas.
- 22-oct-2026: **tanda 1 aplicada** (`Web`, `sw.js` v143, §PF173): N°, Fecha, Día J/V/S/D, colores por ataques, sombreado por semana y encabezados centrados en la tabla de un jugador. Pendiente de probar en navegador real. Quedan abiertas P1 (color del 1 ataque) y P1b (tabla de comparación); un día opcional con 0 ataques no se pinta de rojo (decisión mía, por confirmar).
- 22-oct-2026: la usuaria respondió P1 a P8 (sección 3b) y añadió la **tanda 6** (`guerra.html`: resaltar la columna del día o la semana actual). Confirmó que los **íconos de WhatsApp** se ven bien en tamaño y posición (§PF172).
- Tandas 2 a 6: por aplicar. Abiertas: P1b, P3 (opción A, B o C), P5 (`comentario` y `cerrada`), P7 (cinta), P8 (día exacto) y P9 a P11.
- Al terminar todas las tandas: pasar el funcionamiento y las decisiones a `Contexto_Base_Web.md`, informar y **preguntar si se borra** este consolidado (regla 1; no se borra sin un sí explícito).
