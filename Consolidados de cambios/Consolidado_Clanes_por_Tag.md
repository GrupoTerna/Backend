> **Nota para la IA:** antes de trabajar con este documento, lee `Consolidados de cambios/Reglas_Consolidados.md` y consulta `Contexto_Base_Web.md` para cualquier duda de funcionamiento. Si eres Claude y la skill `/md` no fue invocada, invócala. El código vigente está en los repos de `GrupoTerna`; los archivos `.md` o `.zip` subidos al chat son copias que pueden estar desfasadas.

# Consolidado — Clanes por Tag (todo clan se compara por Tag; el nombre solo se muestra)

*Creado el 6-nov-2026 (pedido de la usuaria). Estado: **plan definido y ampliado el 6-nov-2026 con las respuestas de la usuaria (sección 0, tercer bloque); ninguna tanda de código aplicada todavía** (la tanda 0 ya se hizo en §PF400 y §PF401). Sigue a §PF400 (aviso de clan rival confirmado por Tag) y §PF401 (la regla y el primer inventario). Se actualiza la tabla de «Estado» (sección 2) al cerrar cada tanda.*

## 0. Indicaciones de la usuaria (texto literal, 6-nov-2026; regla 12)

> toda comparación de clanes debe ser por tag, aunque solo se muestre el nombre, aplica para la web y el backend

> decide tú pero deja el plan definido en el repositorio primero, para que se pueda continuar en otras sesiones

*La segunda frase delega en Claude las decisiones del plan (orden, alcance y criterios de la sección 1). Las decisiones que afectan a datos guardados, o que cambian cómo se instala la skill, quedan en la sección 4 como «pendiente de definir o contestar» (regla 3), con la opción que se usa mientras la usuaria no conteste.*

**Respuesta de la usuaria a las preguntas P1 a P3 (texto literal, 6-nov-2026; regla 12):**

> actualmente es imposible cambiar el nombre de un clan para un usuario, incluso el lider. creo que solo puede hacerlo supercell si detecta que el nombre infringe las normas de la comunidad. nuestros clanes nunca han cambiado de nombre pero debemos anticiparnos por si se permite en el futuro. en los archivos que se hayan creado con el nombre del clan, se debe agregar el clantag y el nombre debe ser actualizable. en las carpetas también se debe agregar el clantag, "Clan - Clantag". no hay problema si hay que reinstalar una skill, solo avísame para hacerlo. sobre el punto 3 no sé, prefieron que revises los archivos, los datos faltantes suelen deberse a una mala forma de haber guardado datos en etapas tempranas, o que se haya guardado información incompleta

*Efecto: **se cancela la excepción del criterio 6 anterior** (el nombre ya no será solo clave de almacenamiento). Ahora todo archivo, hoja o carpeta que se creó con el nombre del clan guarda también el Tag, y el nombre pasa a ser un dato que se puede actualizar (criterios 6, 9 y 10 de la sección 1). La respuesta a P2 es un sí: la skill se reinstala (la IA avisa a la usuaria cuando suba la nueva revisión).*

## 1. Regla y criterios de diseño (decididos por Claude por delegación, 6-nov-2026)

1. **La clave de identidad de un clan es su Tag** (con «#», en mayúsculas). El nombre es un texto para mostrar: no sirve para decidir si dos clanes son el mismo, si un clan es Terna, rival o vetado, ni para agrupar, filtrar, ordenar o cruzar datos. Motivo: dos clanes pueden llamarse igual (los dos «Argentina» de §PF400) y un clan puede cambiar de nombre.
2. **El nombre solo se acepta como respaldo cuando falta el Tag** (datos anteriores a §PF253, filas sin enlace de clan). En ese caso el resultado queda **marcado como no confirmado por Tag** (como `confirmacion: 'nombre'` de §PF400) y nunca se usa para algo irreversible.
3. **Un solo resolvedor nombre → Tag.** Se usa `_mapaNombreClanATagTerna()` (`14_Nuevos_RoyaleAPI.gs`): lee la hoja Clan y, si está vacía, `CFG.CLAN_NOMBRES_FALLBACK`; **no depende de `CACHE_CLAN_DATA`** (que las consultas web no llenan). Ninguna tanda reimplementa la traducción. `_getClanTagByName()` (`38_Web_Endpoints.gs`), que sí depende de esa caché y devuelve `''` si está vacía, pasa a delegar en él (tanda 1). Se guarda el mapa en memoria durante la ejecución, porque los ordenamientos lo llaman muchas veces.
4. **Los objetos que el backend manda a la web llevan `clanTag` junto a `clan`.** El campo es **aditivo**: `clan` no se quita ni cambia (`clanTag` con «#» y mayúsculas; vacío si no es Terna o no se pudo resolver). Así el backend se puede publicar antes que la web y la web antigua sigue funcionando.
5. **La web usa `clanTag` para agrupar, filtrar y buscar, y `clan` solo para mostrar.** Si un objeto llega sin `clanTag` (respuesta de un backend antiguo o caché del navegador) cae al nombre como respaldo (criterio 2). Orden obligatorio: **backend primero, después web** (cada subida del backend exige `subirBaseDesdeGithub()` antes de publicar la web).
6. **Datos guardados (hojas, CSV y carpetas de Drive que se crearon con el nombre del clan): llevan el Tag y el nombre se puede actualizar** (decisión de la usuaria, 6-nov-2026). Hoy un clan cambia de nombre solo si Supercell lo obliga por infringir las normas, y ninguno de los cuatro lo ha hecho; se hace ahora por anticipación.
   - **Hojas y CSV:** se agrega una columna `Clan_Tag` **al final** de cada hoja que guarda solo el nombre (no junto a `Clan`), para que no se muevan los índices de cientos de referencias (`GC.*`, `CC2.*`, `MC.*`, `VC.*`, `NC.*`, `AHG.*`), del CSV de respaldo y del Generador. Antes de escribirla en cada hoja, la tanda 7 comprueba que ningún `getRange` o `getLastColumn` del código dé por hecho el ancho actual.
   - **Carpetas de Drive:** el nombre pasa a ser `Nombre - #TAG` (ejemplo: `Grupo乂Terna™ - #GCRG8L00`). Los mapas `_SUBCARPETAS_CLAN_*` de `09_API_ClashRoyale.gs` ya apuntan por **ID** de carpeta, así que renombrar la carpeta en Drive no rompe nada; lo que cambia es la **clave** del mapa: pasa del nombre normalizado al Tag.
   - **La clave de identidad es siempre el Tag; el nombre de la hoja o de la carpeta es solo texto.** La lógica de lectura pregunta por `Clan_Tag` y usa el nombre únicamente si la fila antigua no tiene Tag (criterio 2).
   - Riesgos conocidos en la sección 4 (P1, P5 y P6).
7. **Cada tanda es chica** (regla 4): backend antes que web, un grupo de funciones por tanda, y cada una termina con su verificación y con lo que quedó sin probar (regla 8). Se sube a `main` apenas termina (skill 0.2) y el contexto se escribe al final de la tanda.
8. **Código nuevo:** ninguna comparación de clanes por nombre, aunque no figure en este inventario. Si un cambio ajeno a este plan necesita comparar clanes, lo hace por Tag desde el principio.
9. **El nombre es actualizable.** El nombre vigente de un clan sale de la hoja Clan (que se llena con la API de Clash Royale, que devuelve el nombre actual de cada Tag). Cuando la hoja Clan detecta que el nombre de un Tag cambió, una sola función (`_sincronizarNombreClan_`, tanda 10) actualiza ese nombre en las columnas `Clan` de las demás hojas, en el CSV de respaldo y en el nombre de la carpeta de Drive (`setName` sobre el ID de la carpeta), y deja el cambio anotado en un registro. Nunca se reescribe nada por nombre: se busca siempre por `Clan_Tag`.
10. **Filas históricas sin Tag.** Se completan con un **informe primero y aplicación después** (mismo patrón que §PF355: copia de respaldo antes de escribir, tope de filas por corrida, orden de columnas exigido, y solo se toca lo que el informe marcó como seguro). Una fila cuyo clan no se puede confirmar con una fuente que lo pruebe **queda con `Clan_Tag` vacío y marcada**, no se adivina (tanda 8; hallazgos en P3).

## 2. Estado

| Tanda | Qué | Estado | Commit |
|---|---|---|---|
| 0 | Aviso «Estuvo en un clan rival» confirmado por Tag (`15_`, `37_`, `directorio.html`); `_migrarNuevosAHistorico()` y lista de miembros por clan por Tag | **Hecha** (6-nov-2026), sin probar en Apps Script real | `3e7f202`, `2aaa39f`, `bcd22f0` |
| 1 | Backend: resolvedor único con memoria y `_getClanTagByName()` que delega en él | Pendiente | — |
| 2 | Backend: `clanTag` aditivo en las respuestas web (2a, 2b, 2c) | Pendiente | — |
| 3 | Backend: cruce de meta y mensajes por Tag | Pendiente | — |
| 4 | Backend: mínimos y ataques por clan de torneos y sorteos por Tag | Pendiente | — |
| 5 | Backend: reparación de días y reconstrucción por semana (otros clanes del jugador) por Tag | Pendiente | — |
| 6 | Web: agrupar, filtrar y buscar por `clanTag` (6a a 6d) | Pendiente | — |
| 7 | Backend: columna `Clan_Tag` al final de `Guerra`, `Control_2`, `Vetados`, `Nuevos`, `Mensajes`, la hoja de alertas del historial de guerra y `Backup_Guerra.csv`; las filas nuevas ya la llenan | Pendiente | — |
| 8 | Backend: completar `Clan_Tag` en las filas históricas (informe primero, aplicación después; las dudosas quedan marcadas) | Pendiente | — |
| 9 | Backend: carpetas de Drive `Nombre - #TAG` y mapas `_SUBCARPETAS_CLAN_*` con clave Tag | Pendiente | — |
| 10 | Backend: nombre actualizable (`_sincronizarNombreClan_`) | Pendiente | — |
| 11 | Guardia contra comparaciones nuevas por nombre y regla en la skill (**la usuaria debe reinstalar la skill**) | Pendiente | — |
| 12 | Cierre: pasar lo permanente al contexto y preguntar si se borra este consolidado | Pendiente | — |

## 3. Tandas

**Cómo leer cada tanda:** «Ver» = solo se lee para entender; «Editar» = se modifica. Los números de línea son del 6-nov-2026 y se mueven: se ubica por nombre de función con `grep -n`.

### Tanda 1 — Resolvedor único (backend)
- **Objetivo.** Un solo punto nombre → Tag que sirva a las tandas siguientes.
- **Editar:** `14_Nuevos_RoyaleAPI.gs` (`_mapaNombreClanATagTerna()`: guardar el mapa en una variable global por ejecución); `38_Web_Endpoints.gs` (`_getClanTagByName()`: delegar en el mapa, sin usar `CACHE_CLAN_DATA`). **Ver:** `01_Config_Global.gs` (`_resolverNombreClan()`, `CFG.CLAN_NOMBRES_FALLBACK`), `48_Herramientas_Debug.gs` (mide `_getClanTagByName()`; actualizar su texto si cambia el costo).
- **Cuidado.** Hoy `_getClanTagByName()` compara con `info.name` exacto; el mapa usa minúsculas y espacios recortados. Hay que conservar que devuelva `''` cuando el nombre no es de un clan Terna (los ordenamientos mandan al final lo que no encuentran).
- **Verificación.** `node --check` de los dos archivos; prueba en Node con datos simulados (nombre exacto, con otras mayúsculas, inexistente, hoja Clan vacía con respaldo); sin comillas triples; `verificar_idioma.py`. **Sin probar en Apps Script real.**

### Tanda 2 — `clanTag` aditivo en las respuestas web (backend)
- **Objetivo.** Que cada objeto con `clan` (nombre) lleve también `clanTag`, para que la web deje de depender del nombre.
- **De dónde sale el Tag.** De la columna de la propia fila cuando existe (`DC.CLAN_TAG` en Directorio, `IC.CLAN_TAG` en Inactivos/Vetados, `TL.CLAN_TAG` y `SL.CLAN_TAG` en torneos y sorteos, `CC.CLAN_TAG` en la hoja Clan); si la hoja no la tiene (`Guerra` y `Control_2` guardan solo el nombre), del resolvedor de la tanda 1.
- **Editar:** `37_Web_API.gs` y `38_Web_Endpoints.gs`. Puntos de partida (buscar `clan:` en los literales de objeto):
  - **2a, Directorio y jugadores:** `_webRankings`, `_webAniversariosCalcular`, `_webAscensosRecientes`, el roster (`_webRosterCalcular`), «Ingresos recientes» (`_webIngresosRecientes()`, tanto `lista` como `historialSemanal`), `_webPermisosListar`, el bloque de estadísticas de jugador (`_statsPlayer`) y `_generarJsonContactos` (`38_`).
  - **2b, Guerra, torneos y sorteos:** `_webPerfilJugador` (filas de guerra por día: `clan` de `GC.CLAN`), `_webTorneosJugador`, `_webTorneos`, `_webHistorialTorneos`, `_webSorteoCalificados`, `_webMapearParticipanteAdminResolucion`, y los literales de torneo y sorteo que arman `organizadorInfo` (`clan` y `clanTag` ya conviven en ellos).
  - **2c, Dashboard:** `_getDatosDashboardCalcular_` (`38_`).
  - **Ver:** `11_DirectorioSheet.gs`, `13_Inactivos_Vetados.gs`, `26_Torneos_Core.gs`, `17_GuerraSheet.gs` (definiciones de columnas).
- **Cuidado.** Las respuestas públicas (sin sesión de admin) pasan por filtros que quitan campos (`37_Web_API.gs`, bloque de la caché de 60 s de Ingresos recientes): `clanTag` de un clan Terna no es un dato sensible, pero hay que comprobar que el filtro no lo quite ni lo deje pasar por error en objetos de clanes externos.
- **Verificación.** `node --check`; prueba en Node del armado de un objeto de cada tipo; revisar que ningún campo existente cambie de nombre ni de valor. **Sin probar en Apps Script real.**
- **Orden.** 2a, 2b y 2c son commits separados. La web no cambia en esta tanda.

### Tanda 3 — Cruce de meta y mensajes por Tag (backend)
- **Objetivo.** Que «¿este clan ya cruzó la meta?» se pregunte por Tag.
- **Editar:** `30_Mensajes.gs` (`_clanCruzoMetaPorNombre()` pasa a `_clanCruzoMetaPorTag(tag)`; en el mensaje particular y el general, `clanesPend[].clan` debe traer también el Tag; el texto del mensaje sigue mostrando el nombre); `22_ControlCalendario.gs` (`_clanYaCruzoMetaEnPeriodo()`, `_cruceMetaDesdeGuerraLogs_()`, `_cruceMetaDesdeJsonDrive_()`, `_cruceMetaListarIndiceDrive_()`, `_cruceMetaDesdeCacheApi_()`: reciben el Tag y, **solo en el punto donde buscan la subcarpeta de Drive o el archivo por nombre**, traducen con `_resolverNombreClan(tag)`; es una solución **interina** hasta la tanda 9, que cambia las carpetas a clave Tag y deja de necesitarla); llamadores en `37_Web_API.gs` (`_webDiasOpcionalesIngresoGuerra_()`, el cálculo de ataques exentos de `_webPerfilJugador`) y en `22_` (el recorrido que pasa `data[i][GC.CLAN - 1]`).
- **Ver:** `Contexto_Base_Web_Detalle.md` bloque `17B004`, §PF185, §PF144 y §PF225 (regla 13: no volver a preguntar lo del cruce de meta), `17_GuerraSheet.gs`.
- **Cuidado.** `_clanYaCruzoMetaEnPeriodo()` ya acepta un Tag en el campo del nombre para las filas «Reconstruido» antiguas (§PF355); esa traducción debe seguir funcionando. La clave de memoria `_CRUCE_META_RES_MEMO` usa hoy el nombre normalizado: pasa a usar el Tag.
- **Verificación.** `node --check`; prueba en Node de `_clanCruzoMetaPorTag` con un caché simulado (clan que cruzó, que no, en coliseo, Tag inexistente); mensaje de ejemplo igual al de antes. **Sin probar en Apps Script real.**

### Tanda 4 — Mínimos y ataques por clan (backend)
- **Objetivo.** `_getMinTPorNombreClan()`, `_ataquesMinTorneoPorNombreClan()` y `_cumpleAtaquesTorneoClan()` devuelven y consultan mapas por Tag.
- **Editar:** `27_Torneos_Sorteos_Requisitos.gs` (`_getMinTPorNombreClan()`), `28_Torneos_Docs.gs` (`_ataquesMinTorneoPorNombreClan()`, `_cumpleAtaquesTorneoClan()` y sus dos llamadores), `29_Docs_NoCalificados.gs` (llamadas de las líneas ~76 y ~95), `26_Torneos_Core.gs` (línea ~4216), `37_Web_API.gs` (línea ~3361). **Ver:** `10_ClanSheet.gs` (`CC.CLAN_TAG`), `26_Torneos_Core.gs` (`TL`, `SL`).
- **Cuidado.** `_getMinTPorNombreClan('Torneo')` recibe el nombre de una **categoría** («Torneo»), no de un clan: confirmar al leerla si esa función realmente compara clanes antes de renombrarla; si no, queda fuera de la regla.
- **Verificación.** `node --check`; prueba en Node con datos simulados de T_Lista; documento de ganadores igual al de antes. **Sin probar en Apps Script real.**

### Tanda 5 — Reparación de días y reconstrucción por semana (backend)
- **Objetivo.** «Los otros clanes del jugador esa semana» se decide por Tag.
- **Editar:** `55_Reparar_DiasConExceso.gs` (`o.clan !== g.clan`, línea ~563) y `57_ReconstruirSemanaPorDias.gs` (línea ~478). **Ver:** `56_CurrentRiverRace_Dias.gs` (`_crrCapturasDeClan_()`, `x.clan === tag`: **ya compara por Tag**, comprobado el 6-nov-2026; no se toca).
- **Cuidado.** Hasta que la tanda 7 agregue `Clan_Tag` a `Guerra`, esa hoja guarda solo el nombre: el grupo `g` y cada `o` deben traducirse con el resolvedor antes de comparar (interino; después de la tanda 7 se compara `Clan_Tag` directamente). Son funciones de reparación que modifican hojas: con la prueba en Node y el modo «solo informar» que ya tengan; no se corren en Apps Script desde aquí.
- **Verificación.** `node --check`; prueba en Node con un jugador en dos clanes la misma semana; el resultado del plan de reparación no cambia para los datos de ejemplo. **Sin probar en Apps Script real.**

### Tanda 6 — Web: agrupar, filtrar y buscar por `clanTag`
- **Requisito.** Tandas 1 y 2 subidas y publicadas en Apps Script (`subirBaseDesdeGithub()`); verificar con una respuesta real que `clanTag` llega.
- **Objetivo.** Las claves de agrupación, filtro y búsqueda usan `clanTag`; los textos siguen mostrando `clan`. Con respaldo al nombre si falta `clanTag` (criterio 5).
- **Una sub-tanda por archivo** (cada una con `sw.js` nuevo si el archivo está en `CORE_ASSETS`, y pruebas en `test/` con jsdom):
  - **6a `guerra.html`:** pestañas por clan y `card.dataset.clan` (línea ~732), `cuposPorClanGuerra.find(x => x.clan === …)` (~1645), y el resto de usos de `.clan` (83 en el archivo; los 6 de `clanTag` ya existentes se revisan primero).
  - **6b `directorio.html`:** `m.clan !== clanPrevio` (~2609), `ingresosGrupos.find(g => g.clan === clan)` (~3007 y ~3147), filtros por clan.
  - **6c `mensajes.html`, `sorteo.html`, `torneos.html`:** comparación `o.clan !== (o.etiqueta || '')` (`mensajes.html` ~569) y `clanNombre === SIN_CLAN_LABEL` (`sorteo.html` ~1122), más los agrupados por clan.
  - **6d `noticias.html`, `index.html`, `perfil.html`, `clan.html`, `comunidad.html`, `permisos.html`, `admin.html`:** revisar cada uso; `admin.html` ya usa `clanTag` en 40 sitios y se audita, no se reescribe.
- **Verificación.** Suite completa (`npm ci` primero; sin `jsdom` fallan 86 pruebas por el entorno); prueba nueva por archivo con dos clanes de **igual nombre y distinto Tag** (no se confunden) y con objetos sin `clanTag` (caen al nombre). **Sin ver en navegador real.**
- **Registro.** Una viñeta de `CHANGELOG.md` por archivo y su fila en «Abiertos» hasta que la usuaria lo vea publicado.

### Tanda 7 — Columna `Clan_Tag` en hojas y CSV (backend)
- **Objetivo.** Que toda hoja que guarda el nombre del clan guarde también su Tag, sin mover ninguna columna existente (criterio 6).
- **Primero, inventario confirmado (sin editar).** Con `grep -n -E "\bCLAN *:" Base/src/*.gs` y el contexto, confirmar la lista. Hojas que hoy guardan solo el nombre (6-nov-2026): `Guerra` (`GC.CLAN`, `17_GuerraSheet.gs`; ojo, `GC.TAG` es el Tag del **jugador**), `Control_2` (`CC2.CLAN`, `23_Control2_GuerraSemanal.gs`), `Vetados` (`VC.CLAN`, `11_DirectorioSheet.gs`), `Nuevos` (`NC.CLAN`, `14_Nuevos_RoyaleAPI.gs`), `Mensajes` (`MC.CLAN`, `30_Mensajes.gs`), la hoja de alertas del historial de guerra (`AHG.CLAN`, `20_HistorialGuerraJugador.gs`) y `Backup_Guerra.csv` (espejo de `Guerra`). **Ya traen el Tag del clan y no se tocan:** `Directorio`, `Inactivos`, `Historial` (`CLAN_TAG`), `Torneos`, `Sorteos` y sus listas (`TL`, `SL`), `Backup_Guerra_Logs.csv` (columna `Tag`: es el del clan), la hoja Clan.
- **Editar** (un archivo por commit): la definición de columnas de cada hoja (`GC`, `CC2`, `VC`, `NC`, `MC`, `AHG`), la función que crea o restaura la hoja y la que escribe las filas nuevas (para que escriban `Clan_Tag` con el resolvedor de la tanda 1), y en `17_GuerraSheet.gs` el respaldo CSV (`Backup_Guerra.csv`), `_repararClanConTagGuerra_` y `_borrarDuplicadasClanConTagGuerra_` (exigen el orden actual de columnas: ajustar el chequeo para aceptar la columna nueva al final). **Ver:** `Generador/src/` (cómo descarga y sube las hojas y los CSV; el Generador no debe romperse con una columna más).
- **Cuidado.** (1) Las hojas ya existentes necesitan una función que agregue la columna al final sin tocar nada más; que sea idempotente y con modo «solo informar». (2) Todo código que lea la fila completa con un ancho fijo (`getRange(fila, 1, 1, N)`) debe seguir leyendo bien. (3) `Backup_Guerra.csv` y la hoja `Guerra` deben quedar con el mismo orden de columnas.
- **Verificación.** `node --check`; prueba en Node de la creación de columna y de la escritura de una fila nueva; prueba de que `Backup_Guerra.csv` real (copia de `Datos descargados`) se lee igual con la columna añadida. **Sin probar en Apps Script real.**

### Tanda 8 — Completar `Clan_Tag` en filas históricas (backend)
- **Objetivo.** Llenar `Clan_Tag` donde el clan se puede confirmar, y dejar marcado lo demás (criterio 10). **No se adivina.**
- **Qué hay que completar (6-nov-2026, copia de `Backup_Guerra.csv` del 5-nov-2026, 39 747 filas):** 35 827 filas traen el nombre del clan y se completan con el mapa nombre → Tag (hoja Clan, `CFG.CLAN_NOMBRES_FALLBACK` y, para clanes externos como `PERUVIANOS SJL`, el Tag que ya consta en `Directorio`, `Inactivos` e `Historial`). Las **3920 filas con `Clan` vacío** son el caso difícil (P3).
- **Editar:** una función de informe y otra de aplicación, en `17_GuerraSheet.gs`, con el patrón de §PF355 (`repararClanConTagGuerraInforme()` / `…Aplicar()`): exige el orden de columnas, toma el candado de script, escribe en Drive el informe y una copia `ANTES de…` del CSV completo, y tiene tope de filas por corrida. Para `Control_2` y las demás hojas, el mismo patrón con el nombre → Tag.
- **Regla para las 3920 filas vacías.** Se toman por **jugador y semana**, no por jugador solo: un jugador que figura en un único clan en todas las fuentes pudo haber estado antes en otro clan que esas fuentes no recogen. Se **confirma** el clan solo cuando **otra fila del mismo jugador y el mismo día** (temporada, semana y `PeriodIndex`) trae clan (4 filas hoy) o cuando una fuente con **fecha** (`Historial`, `Inactivos` con `Fecha_lim`) cubre ese día. Son **«probables»**, y se listan aparte en el informe sin aplicarse, las filas cuyo jugador tiene en la misma temporada y semana otras filas con un único clan (216 filas hoy): no son prueba, porque un jugador puede jugar en dos clanes la misma semana (239 combinaciones jugador-semana del CSV lo hacen). El resto queda con `Clan_Tag` vacío y la nota `sin clan (reconstruida sin Directorio)` en el informe. Las 122 filas vacías con ataques y las 147 con fame mayor que 0 van **primero** en el informe, porque son las que sí afectan estadísticas.
- **Verificación.** Prueba en Node con el CSV real y Drive simulado, como en §PF355: el número de filas no cambia, solo cambia la columna `Clan_Tag` y solo en las filas del informe. La usuaria revisa el informe de Drive antes de aplicar. **Sin probar en Apps Script real.**

### Tanda 9 — Carpetas de Drive `Nombre - #TAG` y mapas con clave Tag (backend)
- **Objetivo.** Que ningún lugar busque carpetas de clan por nombre, y que las carpetas se llamen `Nombre - #TAG`.
- **Editar:** `09_API_ClashRoyale.gs` (`_SUBCARPETAS_CLAN_`, `_SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_`, `_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_`: la clave pasa del nombre normalizado al Tag en mayúsculas; `_getCarpetaParaClan()`, `_getSubcarpetaEndpoint_()` y `_normalizarNombreClan_()` reciben un Tag o, como respaldo, un nombre que se traduce con el resolvedor); los usos de esas tres variables en `17_GuerraSheet.gs` (líneas ~1394, ~1547, ~3499, ~3672, ~4459), `56_CurrentRiverRace_Dias.gs` (~112) y `59_Verificar_CRR_vs_Backup.gs` (`VCRR_CLAN_VETADO_KEY = 'naranja x'`, `_crrSubcarpeta_`, ~512); `15_DeteccionInfiltrados.gs` (`CLANES_EXTERNOS_CARPETA`); `47_Migraciones.gs` (~1527) y `20_HistorialGuerraJugador.gs` (`'Grupal'`) solo si resulta que buscan carpetas de clan por nombre.
- **Renombrar en Drive.** Una función manual con modo «solo informar» y otro «aplicar» recorre los mapas, abre cada carpeta **por ID** y la renombra a `Nombre - #TAG` con `setName`; guarda en Drive el informe con el nombre antiguo y el nuevo. El código nuevo busca por ID, así que el orden entre subir el código y renombrar no rompe nada; igual se renombra después de subir. Las carpetas de clanes externos que se creen de ahí en adelante nacen con ese nombre.
- **Cuidado.** Hay lógica que lee los nombres de las carpetas de Drive para otra cosa (por ejemplo, los scripts del Generador o Tampermonkey): buscar `getName()` sobre carpetas antes de renombrar. Una carpeta con `#` en el nombre es válida en Drive.
- **Verificación.** `node --check`; prueba en Node con un Drive simulado de las cuatro carpetas más NARANJA x: renombrar no cambia el ID, la búsqueda por Tag encuentra la misma carpeta y la búsqueda por nombre antiguo (respaldo) también. **Sin probar en Apps Script real.**

### Tanda 10 — Nombre actualizable (backend)
- **Objetivo.** Si Supercell cambia el nombre de un clan, el sistema lo detecta y lo actualiza en todos los sitios sin perder datos (criterio 9).
- **Crear/Editar:** `_sincronizarNombreClan_()` en el archivo de la hoja Clan (`10_ClanSheet.gs`), llamada desde donde la hoja Clan se refresca con la API; actualiza la columna `Clan` de cada hoja del inventario de la tanda 7 **por `Clan_Tag`**, el CSV de respaldo y el nombre de la carpeta de Drive. Debe ser idempotente, con un tope de filas por corrida y un registro (una línea por cambio de nombre) en Drive.
- **Cuidado.** No debe reescribir los nombres de **clanes externos** en filas históricas (esos nombres son lo que se vio en su momento): se actualiza solo el nombre de los cuatro clanes Terna y del vetado. `CFG.CLAN_NOMBRES_FALLBACK` (`01_Config_Global.gs`) es una constante: si cambia un nombre hay que actualizarla; la tanda deja escrito dónde se actualiza.
- **Verificación.** Prueba en Node con datos simulados: cambio de nombre de un Tag → cambian todas las filas de ese Tag y la carpeta; las filas de otros clanes no cambian; segunda corrida sin cambios. **Sin probar en Apps Script real.**

### Tanda 11 — Guardia contra comparaciones nuevas por nombre
- **Objetivo.** Que el problema no vuelva.
- **Crear:** `Consolidados de cambios/verificar_clanes_por_tag.py` (heurístico, como `verificar_idioma.py`: revisa las líneas agregadas respecto de `HEAD` o de `--base origin/main` y lista candidatas como `.clan ===`, `clanNombre ===`, `nombreClan ===`, `_getClanTagByName(`; hay que mirarlas a mano). Se corre antes de cada commit con código.
- **Skill.** Agregar a `Claude/SKILL.md` la regla de la sección 1, criterio 8, y subir el número de revisión (rev. 7, `python3 -I .github/scripts/validar_skill.py`). **Requiere que la usuaria reinstale la skill** (P2 ya está contestada: sí, se reinstala; **al subir la revisión 7 la IA le avisa a la usuaria que debe reinstalarla**).
- **Verificación.** El script detecta los casos conocidos del inventario y no marca el código ya migrado.

### Tanda 12 — Cierre
- Pasar a `Contexto_Base_Web.md` lo permanente (cómo quedó cada función, decisiones tomadas y descartadas con su motivo). Informar a la usuaria y **preguntar si se borra este consolidado** (`Reglas_Consolidados.md`, sección 1); no se borra sin un sí explícito.

## 4. Pendiente de definir o contestar (regla 3)

- **P1. Cambio de nombre de un clan — CONTESTADA (6-nov-2026).** Hoy no se puede cambiar el nombre de un clan (ni el líder); solo Supercell lo cambia si infringe las normas, y ninguno de los cuatro ha cambiado. Decisión de la usuaria: anticiparse. Los archivos y carpetas llevan el Tag y el nombre es actualizable (criterios 6 y 9; tandas 7 a 10).
- **P2. Regla en la skill — CONTESTADA (6-nov-2026).** Sí; la usuaria reinstala la skill y pide que se le avise. La tanda 11 sube la revisión 7 y **la IA le avisa en el mismo cierre de tanda** que debe reinstalarla.
- **P3. Filas «Reconstruido» antiguas y filas con clan vacío — REVISADA, falta decidir cómo aplicar (6-nov-2026).** La usuaria pidió revisar los archivos y dijo que lo faltante suele deberse a datos mal guardados al inicio. Lo que se vio en `Datos descargados` (copia de `Backup_Guerra.csv` del 5-nov-2026):
  - **El Tag en lugar del nombre (§PF355) ya está resuelto:** 0 filas con tag en `Clan` desde el 4-nov-2026. El resolvedor sigue aceptando un Tag donde espera un nombre (por si reaparece).
  - **3920 filas de 39 747 tienen `Clan` vacío.** Las 3920 son `Origen` «Reconstruido» y **en todas el campo `Nombre` es igual al `Tag` del jugador**: la reconstrucción no encontró al jugador en el Directorio (`_buscarDatosJugadorParaReconstruccion()`, `18_CorreccionGuerra.gs`), así que no pudo poner ni su nombre ni su clan. Se concentran en las etapas tempranas: **T22 (3316 filas), T23 (452)** y el resto en T1 a T21 y T25 S3 (4 filas, N° 14540 a 14543, las del §PF355 punto 7c). Son 368 jugadores distintos.
  - **Hay datos reales entre ellas:** 122 filas vacías tienen ataques y 147 tienen fame mayor que 0 (el resto son ceros de la reconstrucción).
  - **Cuánto se puede recuperar:** con el mapa nombre → Tag y las columnas `ClanTag` de `Directorio`, `Inactivos` e `Historial`, **292 jugadores (2788 filas) figuran en un solo clan**, 8 jugadores (156 filas) en más de uno y 68 jugadores (976 filas) en ninguna fuente. **Que un jugador figure en un solo clan no prueba su clan de esa semana** (pudo estar antes en otro clan que no consta); por eso la regla de la tanda 8 es más estricta (criterio 10). Se confirman hoy solo 4 filas (otra fila del mismo jugador y el mismo día con clan); otras 216 son «probables» (otras filas del mismo jugador, temporada y semana con un único clan), pero un jugador puede jugar en dos clanes la misma semana, así que no se aplican sin tu visto bueno.
  - **Pregunta para la usuaria:** ¿aceptas que las filas que no se puedan confirmar queden con `Clan_Tag` vacío y marcadas («sin clan»), en lugar de asignarles el clan más probable? ¿Y las 216 «probables» se aplican o también quedan marcadas? *Mientras no se conteste:* se dejan vacías y marcadas, incluidas las «probables» (no se adivina).
- **P4. `_getMinTPorNombreClan('Torneo')`.** El argumento parece ser una categoría, no un clan (tanda 4). Se confirma al leer la función; si no compara clanes, se saca del inventario.
- **P5. `Backup_Inactivos.csv`: 1000 de 1211 filas sin `Clan` ni `ClanTag`** (N° 1 en adelante, todas con `Estado` «Inactivo»; copia del 18-oct-2026, así que puede estar vieja: antes de usarla se compara con Drive, skill 0.5). Es el mismo tipo de dato incompleto de las etapas tempranas. No bloquea ninguna tanda; se decide en la tanda 8 si se intenta completar desde `Historial` o se deja marcado. *Mientras no se conteste:* se deja marcado.
- **P6. Hojas con orden de columnas fijo.** Agregar `Clan_Tag` al final es lo menos riesgoso, pero queda lejos de `Clan`. Si la usuaria prefiere la columna junto a `Clan` (como en `Directorio`), cambia el costo: se moverían todos los índices posteriores y habría que migrar cada hoja con cuidado. *Mientras no se conteste:* al final.

## 5. Cómo continuar en otra sesión

1. Invocar la skill `/md`, adjuntar `Backend` y `Web` y comprobar que hay permiso de escritura (skill 0.1 y 0.7).
2. Leer este archivo completo, `Reglas_Consolidados.md`, `Contexto_Base_Web.md` §PF400 y §PF401, y la sección «Estado» (sección 2): la primera tanda con estado «Pendiente» es la siguiente. Si llegas a la tanda 11, recuerda que **hay que avisar a la usuaria para que reinstale la skill**.
3. Antes de editar, volver a ubicar el código con `grep` (los números de línea de arriba son del 6-nov-2026): `grep -rn -E "\.clan *(===|!==)|nombreClan *(===|!==)|_getClanTagByName|nombreClanATag|PorNombreClan" Base/src Web/*.html Web/assets`.
4. Hacer **una tanda**, verificarla, subirla a `main` en cuanto termine (skill 0.2) y actualizar la tabla de «Estado» de este archivo (su propio commit, con el commit de la tanda en la última columna).
5. Al final de la tanda, escribir en `Contexto_Base_Web.md` lo que cambió en el funcionamiento (una sección `PFxxx` nueva) y, si tocó `Web`, la viñeta del `CHANGELOG.md`. Recordar a la usuaria `subirBaseDesdeGithub()` (proyecto **Generador**, archivo `01_Principal.gs`) si cambió `Base/src/`.
6. Si algo de este plan resulta equivocado, se corrige aquí diciéndolo expresamente (regla 9) y no se sobrescribe en silencio.
