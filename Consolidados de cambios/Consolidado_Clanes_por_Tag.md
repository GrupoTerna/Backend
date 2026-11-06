> **Nota para la IA:** antes de trabajar con este documento, lee `Consolidados de cambios/Reglas_Consolidados.md` y consulta `Contexto_Base_Web.md` para cualquier duda de funcionamiento. Si eres Claude y la skill `/md` no fue invocada, invócala. El código vigente está en los repos de `GrupoTerna`; los archivos `.md` o `.zip` subidos al chat son copias que pueden estar desfasadas.

# Consolidado — Clanes por Tag (todo clan se compara por Tag; el nombre solo se muestra)

*Creado el 6-nov-2026 (pedido de la usuaria). Estado: **plan definido; ninguna tanda de código aplicada todavía** (la tanda 0 ya se hizo en §PF400 y §PF401). Sigue a §PF400 (aviso de clan rival confirmado por Tag) y §PF401 (la regla y el primer inventario). Se actualiza la tabla de «Estado» (sección 2) al cerrar cada tanda.*

## 0. Indicaciones de la usuaria (texto literal, 6-nov-2026; regla 12)

> toda comparación de clanes debe ser por tag, aunque solo se muestre el nombre, aplica para la web y el backend

> decide tú pero deja el plan definido en el repositorio primero, para que se pueda continuar en otras sesiones

*La segunda frase delega en Claude las decisiones del plan (orden, alcance y criterios de la sección 1). Las decisiones que afectan a datos guardados, o que cambian cómo se instala la skill, quedan en la sección 4 como «pendiente de definir o contestar» (regla 3), con la opción que se usa mientras la usuaria no conteste.*

## 1. Regla y criterios de diseño (decididos por Claude por delegación, 6-nov-2026)

1. **La clave de identidad de un clan es su Tag** (con «#», en mayúsculas). El nombre es un texto para mostrar: no sirve para decidir si dos clanes son el mismo, si un clan es Terna, rival o vetado, ni para agrupar, filtrar, ordenar o cruzar datos. Motivo: dos clanes pueden llamarse igual (los dos «Argentina» de §PF400) y un clan puede cambiar de nombre.
2. **El nombre solo se acepta como respaldo cuando falta el Tag** (datos anteriores a §PF253, filas sin enlace de clan). En ese caso el resultado queda **marcado como no confirmado por Tag** (como `confirmacion: 'nombre'` de §PF400) y nunca se usa para algo irreversible.
3. **Un solo resolvedor nombre → Tag.** Se usa `_mapaNombreClanATagTerna()` (`14_Nuevos_RoyaleAPI.gs`): lee la hoja Clan y, si está vacía, `CFG.CLAN_NOMBRES_FALLBACK`; **no depende de `CACHE_CLAN_DATA`** (que las consultas web no llenan). Ninguna tanda reimplementa la traducción. `_getClanTagByName()` (`38_Web_Endpoints.gs`), que sí depende de esa caché y devuelve `''` si está vacía, pasa a delegar en él (tanda 1). Se guarda el mapa en memoria durante la ejecución, porque los ordenamientos lo llaman muchas veces.
4. **Los objetos que el backend manda a la web llevan `clanTag` junto a `clan`.** El campo es **aditivo**: `clan` no se quita ni cambia (`clanTag` con «#» y mayúsculas; vacío si no es Terna o no se pudo resolver). Así el backend se puede publicar antes que la web y la web antigua sigue funcionando.
5. **La web usa `clanTag` para agrupar, filtrar y buscar, y `clan` solo para mostrar.** Si un objeto llega sin `clanTag` (respuesta de un backend antiguo o caché del navegador) cae al nombre como respaldo (criterio 2). Orden obligatorio: **backend primero, después web** (cada subida del backend exige `subirBaseDesdeGithub()` antes de publicar la web).
6. **Claves de datos guardados (hojas `Guerra`, `Control_2`, `Backup_Guerra.csv`, subcarpetas de Drive de cada clan): no se les agrega columna ni se renombran carpetas.** El nombre sigue siendo **clave de almacenamiento** (excepción aceptada y documentada), pero la lógica que lee esos datos se pregunta por Tag y traduce con el resolvedor del criterio 3 en un solo punto. Motivo: agregar una columna a esas hojas mueve los índices de cientos de referencias (`GC.*`, `CC2.*`), el CSV de respaldo y el Generador, y no se puede probar sin Apps Script real. Riesgo conocido en la sección 4 (P1).
7. **Cada tanda es chica** (regla 4): backend antes que web, un grupo de funciones por tanda, y cada una termina con su verificación y con lo que quedó sin probar (regla 8). Se sube a `main` apenas termina (skill 0.2) y el contexto se escribe al final de la tanda.
8. **Código nuevo:** ninguna comparación de clanes por nombre, aunque no figure en este inventario. Si un cambio ajeno a este plan necesita comparar clanes, lo hace por Tag desde el principio.

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
| 7 | Guardia contra comparaciones nuevas por nombre y regla en la skill | Pendiente | — |
| 8 | Cierre: pasar lo permanente al contexto y preguntar si se borra este consolidado | Pendiente | — |

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
- **Editar:** `30_Mensajes.gs` (`_clanCruzoMetaPorNombre()` pasa a `_clanCruzoMetaPorTag(tag)`; en el mensaje particular y el general, `clanesPend[].clan` debe traer también el Tag; el texto del mensaje sigue mostrando el nombre); `22_ControlCalendario.gs` (`_clanYaCruzoMetaEnPeriodo()`, `_cruceMetaDesdeGuerraLogs_()`, `_cruceMetaDesdeJsonDrive_()`, `_cruceMetaListarIndiceDrive_()`, `_cruceMetaDesdeCacheApi_()`: reciben el Tag y, **solo en el punto donde buscan la subcarpeta de Drive o el archivo por nombre** (criterio 6), traducen con `_resolverNombreClan(tag)`); llamadores en `37_Web_API.gs` (`_webDiasOpcionalesIngresoGuerra_()`, el cálculo de ataques exentos de `_webPerfilJugador`) y en `22_` (el recorrido que pasa `data[i][GC.CLAN - 1]`).
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
- **Cuidado.** En `Guerra` la columna Clan guarda el nombre (criterio 6): el grupo `g` y cada `o` deben traducirse con el resolvedor antes de comparar. Son funciones de reparación que modifican hojas: con la prueba en Node y el modo «solo informar» que ya tengan; no se corren en Apps Script desde aquí.
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

### Tanda 7 — Guardia contra comparaciones nuevas por nombre
- **Objetivo.** Que el problema no vuelva.
- **Crear:** `Consolidados de cambios/verificar_clanes_por_tag.py` (heurístico, como `verificar_idioma.py`: revisa las líneas agregadas respecto de `HEAD` o de `--base origin/main` y lista candidatas como `.clan ===`, `clanNombre ===`, `nombreClan ===`, `_getClanTagByName(`; hay que mirarlas a mano). Se corre antes de cada commit con código.
- **Skill.** Agregar a `Claude/SKILL.md` la regla de la sección 1, criterio 8, y subir el número de revisión (rev. 7, `python3 -I .github/scripts/validar_skill.py`). **Requiere que la usuaria reinstale la skill** (ver sección 4, P2).
- **Verificación.** El script detecta los casos conocidos del inventario y no marca el código ya migrado.

### Tanda 8 — Cierre
- Pasar a `Contexto_Base_Web.md` lo permanente (cómo quedó cada función, decisiones tomadas y descartadas con su motivo). Informar a la usuaria y **preguntar si se borra este consolidado** (`Reglas_Consolidados.md`, sección 1); no se borra sin un sí explícito.

## 4. Pendiente de definir o contestar (regla 3)

- **P1. Cambio de nombre de un clan.** `Guerra`, `Control_2`, `Backup_Guerra.csv` y las carpetas de Drive guardan el **nombre** (criterio 6). Si un clan Terna cambia de nombre, sus filas y su carpeta quedan con el nombre viejo y la traducción a Tag no las encuentra. *Mientras no se conteste:* no se migra el almacenamiento y se documenta el riesgo. *Pregunta para la usuaria:* ¿ha cambiado alguno de los cuatro clanes de nombre alguna vez, o es probable que lo haga? Si sí, habría que decidir una tabla de nombres anteriores por Tag (hoja nueva o columna en la hoja Clan).
- **P2. Regla en la skill.** La tanda 7 agrega la regla a la skill, y eso obliga a reinstalarla. *Mientras no se conteste:* se hace igual en la tanda 7 y se avisa; si la usuaria prefiere no reinstalarla, la regla queda solo en `Contexto_Base_Web.md` §PF401 y en este consolidado.
- **P3. Filas «Reconstruido» antiguas.** Algunas filas de `Backup_Guerra.csv` traen un Tag de clan en lugar del nombre (§PF355). El resolvedor de la tanda 1 debe aceptar un Tag recibido en lugar de un nombre y devolverlo tal cual. *Mientras no se conteste:* se asume que sí.
- **P4. `_getMinTPorNombreClan('Torneo')`.** El argumento parece ser una categoría, no un clan (tanda 4). Se confirma al leer la función; si no compara clanes, se saca del inventario.

## 5. Cómo continuar en otra sesión

1. Invocar la skill `/md`, adjuntar `Backend` y `Web` y comprobar que hay permiso de escritura (skill 0.1 y 0.7).
2. Leer este archivo completo, `Reglas_Consolidados.md`, `Contexto_Base_Web.md` §PF400 y §PF401, y la sección «Estado» (sección 2): la primera tanda con estado «Pendiente» es la siguiente.
3. Antes de editar, volver a ubicar el código con `grep` (los números de línea de arriba son del 6-nov-2026): `grep -rn -E "\.clan *(===|!==)|nombreClan *(===|!==)|_getClanTagByName|nombreClanATag|PorNombreClan" Base/src Web/*.html Web/assets`.
4. Hacer **una tanda**, verificarla, subirla a `main` en cuanto termine (skill 0.2) y actualizar la tabla de «Estado» de este archivo (su propio commit, con el commit de la tanda en la última columna).
5. Al final de la tanda, escribir en `Contexto_Base_Web.md` lo que cambió en el funcionamiento (una sección `PFxxx` nueva) y, si tocó `Web`, la viñeta del `CHANGELOG.md`. Recordar a la usuaria `subirBaseDesdeGithub()` (proyecto **Generador**, archivo `01_Principal.gs`) si cambió `Base/src/`.
6. Si algo de este plan resulta equivocado, se corrige aquí diciéndolo expresamente (regla 9) y no se sobrescribe en silencio.
