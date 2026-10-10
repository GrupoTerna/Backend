# Índice de funciones — Generador

Generado automáticamente por el Generador. No editar a mano.
Código real: `Generador/src/`. Total: 107 nombres en 8 archivos .gs.

## Por archivo

- **01_Principal.gs** (14 funciones): descargarBase, subirBaseDesdeZip, subirBaseDesdeTxt, subirBaseDesdeGs, subirBaseDesdeMd, subirBaseDesdeGithub, subirBaseDesdeGithubForzado, descargarGenerador, subirGeneradorDesdeZip, subirGeneradorDesdeTxt, subirGeneradorDesdeGs, subirGeneradorDesdeMd, probarConexionGithub, eliminarTodosLosArchivosDeBase
- **02_Backstage.gs** (15 funciones): _carpetaDeRespaldos_, _conAviso_, _registrarLogGenerador, obtenerSpreadsheetPorNombreEnCarpeta_, consolidarCodigoDesdeZip, _extraerArchivosDeTexto, _generarMarkdownLegible_, _extraerArchivosDeMarkdown_, nombreBaseDesdeArchivo_, _descargarProyectoAArchivos, _subirArchivosAProyecto, actualizarScriptDeHoja, _eliminarTodosLosArchivosDeProyecto, obtenerArchivosProyecto_, crearProyectoVinculado_
- **03_RoyaleAPI_Torneos.gs** (2 funciones): obtenerJSON_viaProxy, tryAlternativeProxy
- **04_Organizador_JSON.gs** (6 funciones): organizarArchivosJSON, _organizarJSON_procesarRaiz_, _carpetaHijaOCrear_, _archivosDeCarpetaClan_, _organizarJSON_tiempoAgotado_, _organizarJSON_borrarTriggersPendientes_
- **05_Migrador_Formato.gs** (18 funciones): migrarFormatoJSON, migrarFormatoJSON_reiniciarEstado, _mig_etiquetarCarpetaClan, _mig_yaEstaEnCarpeta_, _migrarCarpetaPlayers, _mig_renombrarSeguro, _pad2_, _mig_fechaHoraStr, _mig_soloHora, _mig_horaLima, _mig_tiempoAgotado_, _mig_estadoInicial_, _mig_guardarEstado_, _mig_borrarEstado_, _mig_pausarYContinuar_, _mig_programarContinuacion_, _mig_borrarTriggersPendientes_, _mig_finalizar_
- **06_Limpieza_Duplicados_JSON.gs** (9 funciones): limpiarDuplicadosJSON, _limpiarCarpeta_, _analizarCarpetaJSON_, _anclaMasCercana_, _temporadaDeFecha_, _primerLunesDia_, _quitarTagExistente_, _leerPeriodo_, _primeraMencionNumerica_
- **07_Cache_Periodos_JSON.gs** (3 funciones): _cache_cargar_, _cache_guardar_, reiniciarCachePeriodosJSON
- **08_GitHub.gs** (14 funciones): _githubToken_, _ghReq_, _ghRespuesta_, _ghJson_, _scriptIdDeProyecto_, _extDeTipo_, _archivosDelProyecto_, _githubRevisarSecretos_, _githubGenerarIndice_, _githubGenerarLeeme_, _githubCommitArchivos_, _githubSincronizar_, _githubTraerAProyectoApps_, _githubProbar_

## Nombres repetidos (en Apps Script el último que carga pisa a los demás)

Ninguno.

## Orden alfabético

| Nombre | Tipo | Archivo | Línea | Ref. contexto |
|---|---|---|---|---|
| `_analizarCarpetaJSON_` | función | 06_Limpieza_Duplicados_JSON.gs | 231 |  |
| `_anclaMasCercana_` | función | 06_Limpieza_Duplicados_JSON.gs | 364 |  |
| `_archivosDeCarpetaClan_` | función | 04_Organizador_JSON.gs | 202 |  |
| `_archivosDelProyecto_` | función | 08_GitHub.gs | 105 |  |
| `_cache_cargar_` | función | 07_Cache_Periodos_JSON.gs | 33 |  |
| `_cache_guardar_` | función | 07_Cache_Periodos_JSON.gs | 54 |  |
| `_carpetaDeRespaldos_` | función | 02_Backstage.gs | 26 |  |
| `_carpetaHijaOCrear_` | función | 04_Organizador_JSON.gs | 184 |  |
| `_conAviso_` | función | 02_Backstage.gs | 103 |  |
| `_descargarProyectoAArchivos` | función | 02_Backstage.gs | 287 |  |
| `_eliminarTodosLosArchivosDeProyecto` | función | 02_Backstage.gs | 555 |  |
| `_extDeTipo_` | función | 08_GitHub.gs | 100 |  |
| `_extraerArchivosDeMarkdown_` | función | 02_Backstage.gs | 242 |  |
| `_extraerArchivosDeTexto` | función | 02_Backstage.gs | 184 |  |
| `_generarMarkdownLegible_` | función | 02_Backstage.gs | 220 |  |
| `_ghJson_` | función | 08_GitHub.gs | 80 |  |
| `_ghReq_` | función | 08_GitHub.gs | 50 |  |
| `_ghRespuesta_` | función | 08_GitHub.gs | 69 |  |
| `_githubCommitArchivos_` | función | 08_GitHub.gs | 249 |  |
| `_githubGenerarIndice_` | función | 08_GitHub.gs | 143 |  |
| `_githubGenerarLeeme_` | función | 08_GitHub.gs | 212 |  |
| `_githubProbar_` | función | 08_GitHub.gs | 478 |  |
| `_githubRevisarSecretos_` | función | 08_GitHub.gs | 119 |  |
| `_githubSincronizar_` | función | 08_GitHub.gs | 303 |  |
| `_githubToken_` | función | 08_GitHub.gs | 45 |  |
| `_githubTraerAProyectoApps_` | función | 08_GitHub.gs | 366 |  |
| `_leerPeriodo_` | función | 06_Limpieza_Duplicados_JSON.gs | 462 |  |
| `_limpiarCarpeta_` | función | 06_Limpieza_Duplicados_JSON.gs | 109 |  |
| `_mig_borrarEstado_` | función | 05_Migrador_Formato.gs | 377 |  |
| `_mig_borrarTriggersPendientes_` | función | 05_Migrador_Formato.gs | 403 |  |
| `_mig_estadoInicial_` | función | 05_Migrador_Formato.gs | 364 |  |
| `_mig_etiquetarCarpetaClan` | función | 05_Migrador_Formato.gs | 197 |  |
| `_mig_fechaHoraStr` | función | 05_Migrador_Formato.gs | 343 |  |
| `_mig_finalizar_` | función | 05_Migrador_Formato.gs | 412 |  |
| `_mig_guardarEstado_` | función | 05_Migrador_Formato.gs | 373 |  |
| `_mig_horaLima` | función | 05_Migrador_Formato.gs | 351 |  |
| `_mig_pausarYContinuar_` | función | 05_Migrador_Formato.gs | 382 |  |
| `_mig_programarContinuacion_` | función | 05_Migrador_Formato.gs | 395 |  |
| `_mig_renombrarSeguro` | función | 05_Migrador_Formato.gs | 322 |  |
| `_mig_soloHora` | función | 05_Migrador_Formato.gs | 347 |  |
| `_mig_tiempoAgotado_` | función | 05_Migrador_Formato.gs | 360 |  |
| `_mig_yaEstaEnCarpeta_` | función | 05_Migrador_Formato.gs | 263 |  |
| `_migrarCarpetaPlayers` | función | 05_Migrador_Formato.gs | 271 |  |
| `_organizarJSON_borrarTriggersPendientes_` | función | 04_Organizador_JSON.gs | 229 |  |
| `_organizarJSON_procesarRaiz_` | función | 04_Organizador_JSON.gs | 127 |  |
| `_organizarJSON_tiempoAgotado_` | función | 04_Organizador_JSON.gs | 225 |  |
| `_pad2_` | función | 05_Migrador_Formato.gs | 338 |  |
| `_primeraMencionNumerica_` | función | 06_Limpieza_Duplicados_JSON.gs | 485 |  |
| `_primerLunesDia_` | función | 06_Limpieza_Duplicados_JSON.gs | 434 |  |
| `_quitarTagExistente_` | función | 06_Limpieza_Duplicados_JSON.gs | 448 |  |
| `_registrarLogGenerador` | función | 02_Backstage.gs | 112 |  |
| `_scriptIdDeProyecto_` | función | 08_GitHub.gs | 89 |  |
| `_subirArchivosAProyecto` | función | 02_Backstage.gs | 381 |  |
| `_temporadaDeFecha_` | función | 06_Limpieza_Duplicados_JSON.gs | 403 |  |
| `actualizarScriptDeHoja` | función | 02_Backstage.gs | 459 |  |
| `AVISO_ANTI_CARPETAS_` | global | 02_Backstage.gs | 65 |  |
| `CACHE_PERIODOS_NOMBRE_` | global | 07_Cache_Periodos_JSON.gs | 24 |  |
| `CARPETA_BASE_ID` | global | 02_Backstage.gs | 8 |  |
| `CARPETA_GENERADOR_ID` | global | 02_Backstage.gs | 7 |  |
| `CARPETA_JSON_RAIZ_ID_` | global | 04_Organizador_JSON.gs | 21 |  |
| `CARPETA_PLAYERS_ID_` | global | 04_Organizador_JSON.gs | 36 |  |
| `CARPETAS_CLAN_` | global | 04_Organizador_JSON.gs | 27 |  |
| `CARPETAS_JSON_POR_ENDPOINT_` | global | 04_Organizador_JSON.gs | 46 |  |
| `consolidarCodigoDesdeZip` | función | 02_Backstage.gs | 153 |  |
| `CREAR_O_ACTUALIZAR_HOJA_SISTEMA` | global | 02_Backstage.gs | 15 |  |
| `crearProyectoVinculado_` | función | 02_Backstage.gs | 616 |  |
| `descargarBase` | función | 01_Principal.gs | 14 |  |
| `descargarGenerador` | función | 01_Principal.gs | 80 |  |
| `eliminarTodosLosArchivosDeBase` | función | 01_Principal.gs | 135 |  |
| `GITHUB_BORRAR_FORMATOS_ANTIGUOS_` | global | 08_GitHub.gs | 23 |  |
| `GITHUB_BRANCH_` | global | 08_GitHub.gs | 19 |  |
| `GITHUB_OWNER_` | global | 08_GitHub.gs | 17 |  |
| `GITHUB_PATRONES_SECRETOS_` | global | 08_GitHub.gs | 26 |  |
| `GITHUB_REGEX_ID_DRIVE_` | global | 08_GitHub.gs | 39 |  |
| `GITHUB_REPO_` | global | 08_GitHub.gs | 18 |  |
| `limpiarDuplicadosJSON` | función | 06_Limpieza_Duplicados_JSON.gs | 73 |  |
| `LIMPIEZA_DRY_RUN_` | global | 06_Limpieza_Duplicados_JSON.gs | 66 |  |
| `MANIFIESTO_CANONICO_` | global | 02_Backstage.gs | 33 |  |
| `MIG_LIMITE_MS_` | global | 05_Migrador_Formato.gs | 62 |  |
| `MIG_PROP_ESTADO_` | global | 05_Migrador_Formato.gs | 65 |  |
| `MIG_TEMPORADA_ANCLA_` | global | 06_Limpieza_Duplicados_JSON.gs | 422 |  |
| `MIG_TRIGGER_HANDLER_` | global | 05_Migrador_Formato.gs | 68 |  |
| `migrarFormatoJSON` | función | 05_Migrador_Formato.gs | 87 |  |
| `migrarFormatoJSON_reiniciarEstado` | función | 05_Migrador_Formato.gs | 170 |  |
| `NOMBRE_HOJA_BASE` | global | 02_Backstage.gs | 9 |  |
| `nombreBaseDesdeArchivo_` | función | 02_Backstage.gs | 271 |  |
| `obtenerArchivosProyecto_` | función | 02_Backstage.gs | 601 |  |
| `obtenerJSON_viaProxy` | función | 03_RoyaleAPI_Torneos.gs | 4 |  |
| `obtenerSpreadsheetPorNombreEnCarpeta_` | función | 02_Backstage.gs | 140 |  |
| `ORGANIZAR_LIMITE_MS_` | global | 04_Organizador_JSON.gs | 52 |  |
| `ORGANIZAR_PROP_ESTADO_` | global | 04_Organizador_JSON.gs | 55 |  |
| `ORGANIZAR_TRIGGER_HANDLER_` | global | 04_Organizador_JSON.gs | 58 |  |
| `organizarArchivosJSON` | función | 04_Organizador_JSON.gs | 70 |  |
| `PAREO_TOLERANCIA_MS_` | global | 06_Limpieza_Duplicados_JSON.gs | 355 |  |
| `probarConexionGithub` | función | 01_Principal.gs | 126 |  |
| `reiniciarCachePeriodosJSON` | función | 07_Cache_Periodos_JSON.gs | 77 |  |
| `subirBaseDesdeGithub` | función | 01_Principal.gs | 65 |  |
| `subirBaseDesdeGithubForzado` | función | 01_Principal.gs | 70 |  |
| `subirBaseDesdeGs` | función | 01_Principal.gs | 45 |  |
| `subirBaseDesdeMd` | función | 01_Principal.gs | 52 |  |
| `subirBaseDesdeTxt` | función | 01_Principal.gs | 38 |  |
| `subirBaseDesdeZip` | función | 01_Principal.gs | 31 |  |
| `subirGeneradorDesdeGs` | función | 01_Principal.gs | 107 |  |
| `subirGeneradorDesdeMd` | función | 01_Principal.gs | 114 |  |
| `subirGeneradorDesdeTxt` | función | 01_Principal.gs | 100 |  |
| `subirGeneradorDesdeZip` | función | 01_Principal.gs | 93 |  |
| `tryAlternativeProxy` | función | 03_RoyaleAPI_Torneos.gs | 22 |  |
