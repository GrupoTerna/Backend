# Índice de funciones — Generador

Generado automáticamente por el Generador. No editar a mano.
Código real: `Generador/src/`. Total: 193 nombres en 11 archivos .gs.

## Por archivo

- **01_Principal.gs** (16 funciones): descargarBase, subirBaseDesdeZip, subirBaseDesdeTxt, subirBaseDesdeGs, subirBaseDesdeMd, subirBaseDesdeGithub, subirBaseDesdeGithubForzado, descargarGenerador, subirGeneradorDesdeZip, subirGeneradorDesdeTxt, subirGeneradorDesdeGs, subirGeneradorDesdeMd, subirGeneradorDesdeGithub, subirGeneradorDesdeGithubForzado, probarConexionGithub, eliminarTodosLosArchivosDeBase
- **02_Backstage.gs** (15 funciones): _carpetaDeRespaldos_, _conAviso_, _registrarLogGenerador, obtenerSpreadsheetPorNombreEnCarpeta_, consolidarCodigoDesdeZip, _extraerArchivosDeTexto, _generarMarkdownLegible_, _extraerArchivosDeMarkdown_, nombreBaseDesdeArchivo_, _descargarProyectoAArchivos, _subirArchivosAProyecto, actualizarScriptDeHoja, _eliminarTodosLosArchivosDeProyecto, obtenerArchivosProyecto_, crearProyectoVinculado_
- **03_RoyaleAPI_Torneos.gs** (2 funciones): obtenerJSON_viaProxy, tryAlternativeProxy
- **04_Organizador_JSON.gs** (11 funciones): organizarArchivosJSON, _organizarJSON_procesarRaiz_, _carpetaHijaOCrear_, _archivosDeCarpetaClan_, _carpetaDestinoJSON_, _carpetaViejaDeClan_, _archivosRecursivo_, _archivosDeClan_, _carpetaSemanaJSON_, _organizarJSON_tiempoAgotado_, _organizarJSON_borrarTriggersPendientes_
- **05_Migrador_Formato.gs** (22 funciones): migrarFormatoJSON, _mig_ejecutarMigracion_, migrarFormatoJSON_reiniciarEstado, _mig_etiquetarCarpetaClan, _mig_yaEstaEnCarpeta_, _mig_estaBajoCarpeta_, _migrarCarpetaPlayers, _mig_nombrePlayerPorCreacion_, _mig_renombrarSeguro, _letraDiaGuerra_, _pad2_, _mig_fechaHoraStr, _mig_soloHora, _mig_horaLima, _mig_tiempoAgotado_, _mig_estadoInicial_, _mig_guardarEstado_, _mig_borrarEstado_, _mig_pausarYContinuar_, _mig_programarContinuacion_, _mig_borrarTriggersPendientes_, _mig_finalizar_
- **06_Limpieza_Duplicados_JSON.gs** (19 funciones): limpiarDuplicadosJSON, _limpiarCarpeta_, _analizarCarpetaJSON_, _anclaMasCercana_, _textoCorteDiario_, _fmtHoraH_, _horaLimaDecimal_, _enVentanaCorte_, _estimarCorteDiario_, _diaJuegoNum_, _diaJuegoFecha_, _esInicioDeTemporada_, _diaJuegoAnclaEnVentana_, _ajustarPeriodoPrestado_, _temporadaDeFecha_, _primerLunesDia_, _quitarTagExistente_, _leerPeriodo_, _primeraMencionNumerica_
- **07_Cache_Periodos_JSON.gs** (3 funciones): _cache_cargar_, _cache_guardar_, reiniciarCachePeriodosJSON
- **08_GitHub.gs** (16 funciones): _githubToken_, _ghReq_, _ghRespuesta_, _ghJson_, _scriptIdDeProyecto_, _extDeTipo_, _archivosDelProyecto_, _githubRevisarSecretos_, _githubGenerarIndice_, _githubGenerarLeeme_, _githubCommitArchivos_, _githubSincronizar_, _githubTraerAProyectoApps_, _githubProbar_, subirEvidenciaT05AGithub, _githubSubirArchivosDeDrive_
- **09_ReadmeGenerador.gs** (4 funciones): _readmeFuncionesManuales_, _readmeGrupo_, _readmeAplicarBloque_, _actualizarReadmeGenerador_
- **10_Verificar_PeriodIndex_JSON.gs** (7 funciones): _verif_esExcepcionFecha_, verificarPeriodIndexJSON, _verif_periodoDeArchivo_, _verif_indiceDiaLima_, _verif_enVentanaCambio_, _verif_comparar_, _verif_imprimirResumen_
- **11_Imagenes_API.gs** (19 funciones): imagenesApiProbar, imagenesApiCartasAGithub, imagenesApiInsigniasAGithub, imagenesApiAGithub, carpetasApiJuntoAFankit, imagenesApiReintentarNoDisponibles, _imgApiEjecutar_, _imgApiLeerNoDisponibles_, _imgApiGuardarNoDisponibles_, _imgApiArchivoUrls_, imagenesApiEscanearJsonPlayers, imagenesApiReiniciarEscaneoJson, _imgApiRecolectarUrls_, _imgApiToken_, _imgApiReq_, _imgApiJson_, _imgApiContexto_, _imgApiCarpetasApiFaltantes_, _imgApiCommit_

## Nombres repetidos (en Apps Script el último que carga pisa a los demás)

Ninguno.

## Orden alfabético

| Nombre | Tipo | Archivo | Línea | Ref. contexto |
|---|---|---|---|---|
| `_actualizarReadmeGenerador_` | función | 09_ReadmeGenerador.gs | 133 |  |
| `_ajustarPeriodoPrestado_` | función | 06_Limpieza_Duplicados_JSON.gs | 611 |  |
| `_analizarCarpetaJSON_` | función | 06_Limpieza_Duplicados_JSON.gs | 247 |  |
| `_anclaMasCercana_` | función | 06_Limpieza_Duplicados_JSON.gs | 426 |  |
| `_archivosDeCarpetaClan_` | función | 04_Organizador_JSON.gs | 233 |  |
| `_archivosDeClan_` | función | 04_Organizador_JSON.gs | 321 |  |
| `_archivosDelProyecto_` | función | 08_GitHub.gs | 106 |  |
| `_archivosRecursivo_` | función | 04_Organizador_JSON.gs | 300 |  |
| `_cache_cargar_` | función | 07_Cache_Periodos_JSON.gs | 33 |  |
| `_cache_guardar_` | función | 07_Cache_Periodos_JSON.gs | 54 |  |
| `_CARPETA_VIEJA_AVISADA_` | global | 04_Organizador_JSON.gs | 270 |  |
| `_carpetaDeRespaldos_` | función | 02_Backstage.gs | 26 |  |
| `_carpetaDestinoJSON_` | función | 04_Organizador_JSON.gs | 263 |  |
| `_carpetaHijaOCrear_` | función | 04_Organizador_JSON.gs | 215 |  |
| `_carpetaSemanaJSON_` | función | 04_Organizador_JSON.gs | 356 |  |
| `_carpetaViejaDeClan_` | función | 04_Organizador_JSON.gs | 279 |  |
| `_conAviso_` | función | 02_Backstage.gs | 103 |  |
| `_descargarProyectoAArchivos` | función | 02_Backstage.gs | 287 |  |
| `_diaJuegoAnclaEnVentana_` | función | 06_Limpieza_Duplicados_JSON.gs | 587 |  |
| `_diaJuegoFecha_` | función | 06_Limpieza_Duplicados_JSON.gs | 567 |  |
| `_diaJuegoNum_` | función | 06_Limpieza_Duplicados_JSON.gs | 557 |  |
| `_eliminarTodosLosArchivosDeProyecto` | función | 02_Backstage.gs | 555 |  |
| `_enVentanaCorte_` | función | 06_Limpieza_Duplicados_JSON.gs | 473 |  |
| `_esInicioDeTemporada_` | función | 06_Limpieza_Duplicados_JSON.gs | 573 |  |
| `_estimarCorteDiario_` | función | 06_Limpieza_Duplicados_JSON.gs | 496 |  |
| `_extDeTipo_` | función | 08_GitHub.gs | 101 |  |
| `_extraerArchivosDeMarkdown_` | función | 02_Backstage.gs | 242 |  |
| `_extraerArchivosDeTexto` | función | 02_Backstage.gs | 184 |  |
| `_fmtHoraH_` | función | 06_Limpieza_Duplicados_JSON.gs | 453 |  |
| `_generarMarkdownLegible_` | función | 02_Backstage.gs | 220 |  |
| `_ghJson_` | función | 08_GitHub.gs | 81 |  |
| `_ghReq_` | función | 08_GitHub.gs | 51 |  |
| `_ghRespuesta_` | función | 08_GitHub.gs | 70 |  |
| `_githubCommitArchivos_` | función | 08_GitHub.gs | 256 |  |
| `_githubGenerarIndice_` | función | 08_GitHub.gs | 144 |  |
| `_githubGenerarLeeme_` | función | 08_GitHub.gs | 213 |  |
| `_githubProbar_` | función | 08_GitHub.gs | 533 |  |
| `_githubRevisarSecretos_` | función | 08_GitHub.gs | 120 |  |
| `_githubSincronizar_` | función | 08_GitHub.gs | 325 |  |
| `_githubSubirArchivosDeDrive_` | función | 08_GitHub.gs | 576 |  |
| `_githubToken_` | función | 08_GitHub.gs | 46 |  |
| `_githubTraerAProyectoApps_` | función | 08_GitHub.gs | 401 | Contexto_Base_Web.md: pendiente de registrar el comportamiento real al autoreemplazarse |
| `_horaLimaDecimal_` | función | 06_Limpieza_Duplicados_JSON.gs | 460 |  |
| `_imgApiArchivoUrls_` | función | 11_Imagenes_API.gs | 285 |  |
| `_imgApiCarpetasApiFaltantes_` | función | 11_Imagenes_API.gs | 458 |  |
| `_imgApiCommit_` | función | 11_Imagenes_API.gs | 482 |  |
| `_imgApiContexto_` | función | 11_Imagenes_API.gs | 438 |  |
| `_imgApiEjecutar_` | función | 11_Imagenes_API.gs | 146 |  |
| `_imgApiGuardarNoDisponibles_` | función | 11_Imagenes_API.gs | 272 |  |
| `_imgApiJson_` | función | 11_Imagenes_API.gs | 425 |  |
| `_imgApiLeerNoDisponibles_` | función | 11_Imagenes_API.gs | 260 |  |
| `_imgApiRecolectarUrls_` | función | 11_Imagenes_API.gs | 358 |  |
| `_imgApiReq_` | función | 11_Imagenes_API.gs | 407 |  |
| `_imgApiToken_` | función | 11_Imagenes_API.gs | 402 |  |
| `_leerPeriodo_` | función | 06_Limpieza_Duplicados_JSON.gs | 762 |  |
| `_letraDiaGuerra_` | función | 05_Migrador_Formato.gs | 453 |  |
| `_limpiarCarpeta_` | función | 06_Limpieza_Duplicados_JSON.gs | 109 |  |
| `_mig_borrarEstado_` | función | 05_Migrador_Formato.gs | 498 |  |
| `_mig_borrarTriggersPendientes_` | función | 05_Migrador_Formato.gs | 524 |  |
| `_mig_ejecutarMigracion_` | función | 05_Migrador_Formato.gs | 107 |  |
| `_mig_estaBajoCarpeta_` | función | 05_Migrador_Formato.gs | 329 |  |
| `_mig_estadoInicial_` | función | 05_Migrador_Formato.gs | 485 |  |
| `_mig_etiquetarCarpetaClan` | función | 05_Migrador_Formato.gs | 224 |  |
| `_mig_fechaHoraStr` | función | 05_Migrador_Formato.gs | 464 |  |
| `_mig_finalizar_` | función | 05_Migrador_Formato.gs | 533 |  |
| `_mig_guardarEstado_` | función | 05_Migrador_Formato.gs | 494 |  |
| `_mig_horaLima` | función | 05_Migrador_Formato.gs | 472 |  |
| `_mig_nombrePlayerPorCreacion_` | función | 05_Migrador_Formato.gs | 408 |  |
| `_mig_pausarYContinuar_` | función | 05_Migrador_Formato.gs | 503 |  |
| `_mig_programarContinuacion_` | función | 05_Migrador_Formato.gs | 516 |  |
| `_mig_renombrarSeguro` | función | 05_Migrador_Formato.gs | 425 |  |
| `_mig_soloHora` | función | 05_Migrador_Formato.gs | 468 |  |
| `_mig_tiempoAgotado_` | función | 05_Migrador_Formato.gs | 481 |  |
| `_mig_yaEstaEnCarpeta_` | función | 05_Migrador_Formato.gs | 317 |  |
| `_migrarCarpetaPlayers` | función | 05_Migrador_Formato.gs | 359 |  |
| `_organizarJSON_borrarTriggersPendientes_` | función | 04_Organizador_JSON.gs | 372 |  |
| `_organizarJSON_procesarRaiz_` | función | 04_Organizador_JSON.gs | 157 |  |
| `_organizarJSON_tiempoAgotado_` | función | 04_Organizador_JSON.gs | 368 |  |
| `_pad2_` | función | 05_Migrador_Formato.gs | 459 |  |
| `_primeraMencionNumerica_` | función | 06_Limpieza_Duplicados_JSON.gs | 785 |  |
| `_primerLunesDia_` | función | 06_Limpieza_Duplicados_JSON.gs | 732 |  |
| `_quitarTagExistente_` | función | 06_Limpieza_Duplicados_JSON.gs | 748 | Contexto_Base_Web.md §PF074 |
| `_readmeAplicarBloque_` | función | 09_ReadmeGenerador.gs | 71 |  |
| `_readmeFuncionesManuales_` | función | 09_ReadmeGenerador.gs | 28 |  |
| `_readmeGrupo_` | función | 09_ReadmeGenerador.gs | 55 |  |
| `_registrarLogGenerador` | función | 02_Backstage.gs | 112 |  |
| `_scriptIdDeProyecto_` | función | 08_GitHub.gs | 90 |  |
| `_SEMANA_MEM_` | global | 04_Organizador_JSON.gs | 348 |  |
| `_subirArchivosAProyecto` | función | 02_Backstage.gs | 381 |  |
| `_temporadaDeFecha_` | función | 06_Limpieza_Duplicados_JSON.gs | 701 |  |
| `_textoCorteDiario_` | función | 06_Limpieza_Duplicados_JSON.gs | 440 |  |
| `_verif_comparar_` | función | 10_Verificar_PeriodIndex_JSON.gs | 188 |  |
| `_verif_enVentanaCambio_` | función | 10_Verificar_PeriodIndex_JSON.gs | 169 |  |
| `_verif_esExcepcionFecha_` | función | 10_Verificar_PeriodIndex_JSON.gs | 60 |  |
| `_verif_imprimirResumen_` | función | 10_Verificar_PeriodIndex_JSON.gs | 266 |  |
| `_verif_indiceDiaLima_` | función | 10_Verificar_PeriodIndex_JSON.gs | 163 |  |
| `_verif_periodoDeArchivo_` | función | 10_Verificar_PeriodIndex_JSON.gs | 143 |  |
| `actualizarScriptDeHoja` | función | 02_Backstage.gs | 459 |  |
| `AVISO_ANTI_CARPETAS_` | global | 02_Backstage.gs | 65 |  |
| `CACHE_PERIODOS_NOMBRE_` | global | 07_Cache_Periodos_JSON.gs | 24 |  |
| `CARPETA_BASE_ID` | global | 02_Backstage.gs | 8 |  |
| `CARPETA_GENERADOR_ID` | global | 02_Backstage.gs | 7 |  |
| `CARPETA_JSON_RAIZ_ID_` | global | 04_Organizador_JSON.gs | 21 |  |
| `CARPETA_PLAYERS_ID_` | global | 04_Organizador_JSON.gs | 66 |  |
| `CARPETAS_CLAN_` | global | 04_Organizador_JSON.gs | 31 |  |
| `CARPETAS_CLAN_POR_ENDPOINT_` | global | 04_Organizador_JSON.gs | 48 | Contexto_Base_Web.md §PF074 |
| `CARPETAS_JSON_POR_ENDPOINT_` | global | 04_Organizador_JSON.gs | 76 |  |
| `carpetasApiJuntoAFankit` | función | 11_Imagenes_API.gs | 111 |  |
| `consolidarCodigoDesdeZip` | función | 02_Backstage.gs | 153 |  |
| `CORTE_MIN_FRACCION_` | global | 06_Limpieza_Duplicados_JSON.gs | 450 |  |
| `CORTE_MIN_PARES_` | global | 06_Limpieza_Duplicados_JSON.gs | 447 |  |
| `CREAR_O_ACTUALIZAR_HOJA_SISTEMA` | global | 02_Backstage.gs | 15 |  |
| `crearProyectoVinculado_` | función | 02_Backstage.gs | 616 |  |
| `descargarBase` | función | 01_Principal.gs | 15 |  |
| `descargarGenerador` | función | 01_Principal.gs | 81 |  |
| `eliminarTodosLosArchivosDeBase` | función | 01_Principal.gs | 153 |  |
| `EVIDENCIA_T05_CARPETA_GITHUB_` | global | 08_GitHub.gs | 549 |  |
| `EVIDENCIA_T05_NOMBRES_` | global | 08_GitHub.gs | 550 |  |
| `GITHUB_BORRAR_FORMATOS_ANTIGUOS_` | global | 08_GitHub.gs | 24 |  |
| `GITHUB_BRANCH_` | global | 08_GitHub.gs | 20 |  |
| `GITHUB_OWNER_` | global | 08_GitHub.gs | 18 |  |
| `GITHUB_PATRONES_SECRETOS_` | global | 08_GitHub.gs | 27 |  |
| `GITHUB_REGEX_ID_DRIVE_` | global | 08_GitHub.gs | 40 |  |
| `GITHUB_REPO_` | global | 08_GitHub.gs | 19 |  |
| `imagenesApiAGithub` | función | 11_Imagenes_API.gs | 106 |  |
| `imagenesApiCartasAGithub` | función | 11_Imagenes_API.gs | 98 |  |
| `imagenesApiEscanearJsonPlayers` | función | 11_Imagenes_API.gs | 300 |  |
| `imagenesApiInsigniasAGithub` | función | 11_Imagenes_API.gs | 102 |  |
| `imagenesApiProbar` | función | 11_Imagenes_API.gs | 94 |  |
| `imagenesApiReiniciarEscaneoJson` | función | 11_Imagenes_API.gs | 348 |  |
| `imagenesApiReintentarNoDisponibles` | función | 11_Imagenes_API.gs | 131 |  |
| `IMGAPI_ARCHIVO_404_` | global | 11_Imagenes_API.gs | 73 |  |
| `IMGAPI_ARCHIVO_URLS_` | global | 11_Imagenes_API.gs | 69 |  |
| `IMGAPI_BRANCH_` | global | 11_Imagenes_API.gs | 52 |  |
| `IMGAPI_CATEGORIAS_` | global | 11_Imagenes_API.gs | 76 |  |
| `IMGAPI_CSV_CARTAS_` | global | 11_Imagenes_API.gs | 65 |  |
| `IMGAPI_CSV_INSIGNIAS_` | global | 11_Imagenes_API.gs | 66 |  |
| `IMGAPI_DESTINOS_` | global | 11_Imagenes_API.gs | 58 |  |
| `IMGAPI_ESCANEO_MS_` | global | 11_Imagenes_API.gs | 74 |  |
| `IMGAPI_LOTE_` | global | 11_Imagenes_API.gs | 88 |  |
| `IMGAPI_MAX_ARCHIVOS_` | global | 11_Imagenes_API.gs | 85 |  |
| `IMGAPI_MAX_BYTES_` | global | 11_Imagenes_API.gs | 86 |  |
| `IMGAPI_MAX_MS_` | global | 11_Imagenes_API.gs | 87 |  |
| `IMGAPI_PROP_ESCANEO_` | global | 11_Imagenes_API.gs | 70 |  |
| `IMGAPI_REGEX_URL_` | global | 11_Imagenes_API.gs | 56 |  |
| `IMGAPI_REPO_` | global | 11_Imagenes_API.gs | 51 |  |
| `LETRAS_DIA_GUERRA_` | global | 05_Migrador_Formato.gs | 441 |  |
| `limpiarDuplicadosJSON` | función | 06_Limpieza_Duplicados_JSON.gs | 73 |  |
| `LIMPIEZA_DRY_RUN_` | global | 06_Limpieza_Duplicados_JSON.gs | 66 |  |
| `MANIFIESTO_CANONICO_` | global | 02_Backstage.gs | 33 |  |
| `MIG_LIMITE_MS_` | global | 05_Migrador_Formato.gs | 65 |  |
| `MIG_PROP_ESTADO_` | global | 05_Migrador_Formato.gs | 68 |  |
| `MIG_TEMPORADA_ANCLA_` | global | 06_Limpieza_Duplicados_JSON.gs | 720 |  |
| `MIG_TRIGGER_HANDLER_` | global | 05_Migrador_Formato.gs | 71 |  |
| `migrarFormatoJSON` | función | 05_Migrador_Formato.gs | 90 |  |
| `migrarFormatoJSON_reiniciarEstado` | función | 05_Migrador_Formato.gs | 195 |  |
| `NOMBRE_HOJA_BASE` | global | 02_Backstage.gs | 9 |  |
| `nombreBaseDesdeArchivo_` | función | 02_Backstage.gs | 271 |  |
| `obtenerArchivosProyecto_` | función | 02_Backstage.gs | 601 |  |
| `obtenerJSON_viaProxy` | función | 03_RoyaleAPI_Torneos.gs | 4 |  |
| `obtenerSpreadsheetPorNombreEnCarpeta_` | función | 02_Backstage.gs | 140 |  |
| `ORGANIZAR_LIMITE_MS_` | global | 04_Organizador_JSON.gs | 82 |  |
| `ORGANIZAR_PROP_ESTADO_` | global | 04_Organizador_JSON.gs | 85 |  |
| `ORGANIZAR_TRIGGER_HANDLER_` | global | 04_Organizador_JSON.gs | 88 |  |
| `organizarArchivosJSON` | función | 04_Organizador_JSON.gs | 100 |  |
| `PAREO_TOLERANCIA_MS_` | global | 06_Limpieza_Duplicados_JSON.gs | 417 |  |
| `probarConexionGithub` | función | 01_Principal.gs | 144 |  |
| `README_GENERADOR_NOMBRE_` | global | 09_ReadmeGenerador.gs | 19 |  |
| `README_LINEA_INICIO_` | global | 09_ReadmeGenerador.gs | 22 |  |
| `README_MARCA_FIN_` | global | 09_ReadmeGenerador.gs | 21 |  |
| `README_MARCA_INICIO_` | global | 09_ReadmeGenerador.gs | 20 |  |
| `reiniciarCachePeriodosJSON` | función | 07_Cache_Periodos_JSON.gs | 77 |  |
| `subirBaseDesdeGithub` | función | 01_Principal.gs | 66 |  |
| `subirBaseDesdeGithubForzado` | función | 01_Principal.gs | 71 |  |
| `subirBaseDesdeGs` | función | 01_Principal.gs | 46 |  |
| `subirBaseDesdeMd` | función | 01_Principal.gs | 53 |  |
| `subirBaseDesdeTxt` | función | 01_Principal.gs | 39 |  |
| `subirBaseDesdeZip` | función | 01_Principal.gs | 32 |  |
| `subirEvidenciaT05AGithub` | función | 08_GitHub.gs | 562 |  |
| `subirGeneradorDesdeGithub` | función | 01_Principal.gs | 129 | Contexto_Base_Web.md: pendiente de registrar el comportamiento real al autoreemplazarse |
| `subirGeneradorDesdeGithubForzado` | función | 01_Principal.gs | 134 |  |
| `subirGeneradorDesdeGs` | función | 01_Principal.gs | 108 |  |
| `subirGeneradorDesdeMd` | función | 01_Principal.gs | 115 |  |
| `subirGeneradorDesdeTxt` | función | 01_Principal.gs | 101 |  |
| `subirGeneradorDesdeZip` | función | 01_Principal.gs | 94 |  |
| `tryAlternativeProxy` | función | 03_RoyaleAPI_Torneos.gs | 22 |  |
| `VERIF_CAMBIO_DESDE_H_` | global | 10_Verificar_PeriodIndex_JSON.gs | 40 |  |
| `VERIF_CAMBIO_HASTA_H_` | global | 10_Verificar_PeriodIndex_JSON.gs | 43 |  |
| `VERIF_EXCEPCIONES_FECHA_` | global | 10_Verificar_PeriodIndex_JSON.gs | 57 | Contexto_Base_Web.md §PF080 |
| `VERIF_LIMA_OFFSET_H_` | global | 10_Verificar_PeriodIndex_JSON.gs | 37 |  |
| `VERIF_MAX_LINEAS_LOG_` | global | 10_Verificar_PeriodIndex_JSON.gs | 66 |  |
| `VERIF_REGEX_TAG_` | global | 10_Verificar_PeriodIndex_JSON.gs | 46 |  |
| `verificarPeriodIndexJSON` | función | 10_Verificar_PeriodIndex_JSON.gs | 77 |  |
