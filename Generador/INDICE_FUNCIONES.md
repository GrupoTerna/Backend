# Índice de funciones — Generador

Generado automáticamente por el Generador. No editar a mano.
Código real: `Generador/src/`. Total: 276 nombres en 12 archivos .gs.

## Por archivo

- **01_Principal.gs** (26 funciones): subirBaseDesdeGithub, subirBaseDesdeGithubForzado, subirBaseDesdeZip, subirBaseDesdeTxt, subirBaseDesdeGs, subirBaseDesdeMd, subirGeneradorDesdeGithub, subirGeneradorDesdeGithubForzado, subirGeneradorDesdeZip, subirGeneradorDesdeTxt, subirGeneradorDesdeGs, subirGeneradorDesdeMd, subirContactosDesdeGithub, subirContactosDesdeGithubForzado, subirContactosDesdeZip, subirContactosDesdeTxt, subirContactosDesdeGs, subirContactosDesdeMd, descargarBase, descargarBaseForzado, descargarGenerador, descargarGeneradorForzado, descargarContactos, descargarContactosForzado, probarConexionGithub, eliminarTodosLosArchivosDeBase
- **02_Backstage.gs** (18 funciones): _subirArchivosAProyecto, consolidarCodigoDesdeZip, nombreBaseDesdeArchivo_, _extraerArchivosDeMarkdown_, _extraerArchivosDeTexto, actualizarScriptDeHoja, crearProyectoVinculado_, obtenerArchivosProyecto_, _descargarProyectoAArchivos, _generarMarkdownLegible_, _guardarIndiceArchivos_, _generarIndiceArchivos_, _huellaArchivo_, _eliminarTodosLosArchivosDeProyecto, _carpetaDeRespaldos_, obtenerSpreadsheetPorNombreEnCarpeta_, _conAviso_, _registrarLogGenerador
- **03_RoyaleAPI_Torneos.gs** (2 funciones): obtenerJSON_viaProxy, tryAlternativeProxy
- **04_Organizador_JSON.gs** (11 funciones): organizarArchivosJSON, _organizarJSON_procesarRaiz_, _organizarJSON_tiempoAgotado_, _carpetaDestinoJSON_, _carpetaViejaDeClan_, _organizarJSON_borrarTriggersPendientes_, _carpetaHijaOCrear_, _archivosDeCarpetaClan_, _archivosRecursivo_, _archivosDeClan_, _carpetaSemanaJSON_
- **05_Migrador_Formato.gs** (22 funciones): migrarFormatoJSON, migrarFormatoJSON_reiniciarEstado, _mig_ejecutarMigracion_, _mig_etiquetarCarpetaClan, _mig_yaEstaEnCarpeta_, _mig_estaBajoCarpeta_, _migrarCarpetaPlayers, _mig_nombrePlayerPorCreacion_, _mig_renombrarSeguro, _mig_fechaHoraStr, _mig_soloHora, _mig_horaLima, _letraDiaGuerra_, _pad2_, _mig_tiempoAgotado_, _mig_estadoInicial_, _mig_guardarEstado_, _mig_borrarEstado_, _mig_pausarYContinuar_, _mig_programarContinuacion_, _mig_borrarTriggersPendientes_, _mig_finalizar_
- **06_Limpieza_Duplicados_JSON.gs** (19 funciones): limpiarDuplicadosJSON, _limpiarCarpeta_, _analizarCarpetaJSON_, _quitarTagExistente_, _leerPeriodo_, _primeraMencionNumerica_, _estimarCorteDiario_, _horaLimaDecimal_, _anclaMasCercana_, _ajustarPeriodoPrestado_, _fmtHoraH_, _enVentanaCorte_, _diaJuegoAnclaEnVentana_, _diaJuegoNum_, _esInicioDeTemporada_, _diaJuegoFecha_, _textoCorteDiario_, _primerLunesDia_, _temporadaDeFecha_
- **07_Cache_Periodos_JSON.gs** (3 funciones): reiniciarCachePeriodosJSON, _cache_cargar_, _cache_guardar_
- **08_GitHub.gs** (25 funciones): subirEvidenciaT05AGithub, _githubTraerAProyectoApps_, _githubTraerAProyectoAppsUnaVez_, _githubSincronizar_, _githubCabezaRemota_, _githubLeerUltimoCommit_, _githubRevisarPullPendiente_, _githubRevisarSecretos_, _githubGenerarIndice_, _githubGenerarLeeme_, _githubCommitArchivos_, _githubCambiosEnCarpeta_, _githubFuncionesDeAccion_, _githubGuardarUltimoCommit_, _githubProbar_, _githubSubirArchivosDeDrive_, _githubToken_, _ghReq_, _ghRespuesta_, _ghJson_, _ghEsLimiteDeGithub_, _ghJsonReintento_, _archivosDelProyecto_, _scriptIdDeProyecto_, _extDeTipo_
- **09_ReadmeGenerador.gs** (4 funciones): _actualizarReadmeGenerador_, _readmeAplicarBloque_, _readmeFuncionesManuales_, _readmeGrupo_
- **10_Verificar_PeriodIndex_JSON.gs** (7 funciones): verificarPeriodIndexJSON, _verif_periodoDeArchivo_, _verif_comparar_, _verif_indiceDiaLima_, _verif_enVentanaCambio_, _verif_esExcepcionFecha_, _verif_imprimirResumen_
- **11_Imagenes_API.gs** (39 funciones): imagenesApiReiniciarEscaneoJson, imagenesApiEscanearJsonPlayers, imagenesApiProbar, imagenesApiCartasAGithub, imagenesApiInsigniasAGithub, imagenesApiAGithub, carpetasApiJuntoAFankit, imagenesApiReintentarNoDisponibles, _imgApiEjecutar_, _imgApiRecolectarUrls_, _imgApiTiposInsignias_, _imgApiArchivoMasReciente_, _imgApiNormalizarCabecera_, _imgApiDestinoInsignia_, _imgApiLeerNoDisponibles_, _imgApiGuardarNoDisponibles_, _imgApiRecortarPng_, _imgApiAU8_, _imgApiLeeU32_, _imgApiInflate_, _imgApiHuffman_, _imgApiQuitarFiltros_, _imgApiRectanguloVisible_, _imgApiFiltrarRecorte_, _imgApiFiltrarFila_, _imgApiZlib_, _imgApiDeflateAlmacenado_, _imgApiAdler32_, _imgApiTrozoPng_, _imgApiCrc32_, _imgApiAConSigno_, _imgApiContexto_, _imgApiCarpetasApiFaltantes_, _imgApiCommit_, _imgApiToken_, _imgApiReq_, _imgApiJson_, _imgApiArchivoUrls_, _imgApiArchivoTipos_
- **12_Datos_Drive_GitHub.gs** (12 funciones): subirDatosDriveAGithub, subirDatosDriveAGithubForzado, revisarDatosDriveAGithubSinSubir, subirDatosDriveAGithubAuto, subirDatosDriveAGithubContinuar, instalarActivadorDatosDriveGithub, quitarActivadorDatosDriveGithub, _datosDriveAGithub_, _datosGhListarCandidatos_, _datosGhBuscarTelefonos_, _datosGhLineasPorCarpeta_, _datosGhQuitarActivadores_

## Nombres repetidos (en Apps Script el último que carga pisa a los demás)

Ninguno.

## Orden alfabético

| Nombre | Tipo | Archivo | Línea | Ref. contexto |
|---|---|---|---|---|
| `_actualizarReadmeGenerador_` | función | 09_ReadmeGenerador.gs | 40 |  |
| `_ajustarPeriodoPrestado_` | función | 06_Limpieza_Duplicados_JSON.gs | 620 |  |
| `_analizarCarpetaJSON_` | función | 06_Limpieza_Duplicados_JSON.gs | 284 |  |
| `_anclaMasCercana_` | función | 06_Limpieza_Duplicados_JSON.gs | 592 |  |
| `_archivosDeCarpetaClan_` | función | 04_Organizador_JSON.gs | 305 |  |
| `_archivosDeClan_` | función | 04_Organizador_JSON.gs | 355 |  |
| `_archivosDelProyecto_` | función | 08_GitHub.gs | 942 |  |
| `_archivosRecursivo_` | función | 04_Organizador_JSON.gs | 334 |  |
| `_cache_cargar_` | función | 07_Cache_Periodos_JSON.gs | 71 |  |
| `_cache_guardar_` | función | 07_Cache_Periodos_JSON.gs | 92 |  |
| `_CARPETA_VIEJA_AVISADA_` | global | 04_Organizador_JSON.gs | 98 |  |
| `_carpetaDeRespaldos_` | función | 02_Backstage.gs | 686 |  |
| `_carpetaDestinoJSON_` | función | 04_Organizador_JSON.gs | 242 |  |
| `_carpetaHijaOCrear_` | función | 04_Organizador_JSON.gs | 287 |  |
| `_carpetaSemanaJSON_` | función | 04_Organizador_JSON.gs | 387 |  |
| `_carpetaViejaDeClan_` | función | 04_Organizador_JSON.gs | 255 |  |
| `_conAviso_` | función | 02_Backstage.gs | 703 |  |
| `_datosDriveAGithub_` | función | 12_Datos_Drive_GitHub.gs | 156 |  |
| `_datosGhBuscarTelefonos_` | función | 12_Datos_Drive_GitHub.gs | 331 |  |
| `_datosGhLineasPorCarpeta_` | función | 12_Datos_Drive_GitHub.gs | 359 |  |
| `_datosGhListarCandidatos_` | función | 12_Datos_Drive_GitHub.gs | 291 |  |
| `_datosGhQuitarActivadores_` | función | 12_Datos_Drive_GitHub.gs | 378 |  |
| `_descargarProyectoAArchivos` | función | 02_Backstage.gs | 416 |  |
| `_diaJuegoAnclaEnVentana_` | función | 06_Limpieza_Duplicados_JSON.gs | 714 |  |
| `_diaJuegoFecha_` | función | 06_Limpieza_Duplicados_JSON.gs | 746 |  |
| `_diaJuegoNum_` | función | 06_Limpieza_Duplicados_JSON.gs | 730 |  |
| `_eliminarTodosLosArchivosDeProyecto` | función | 02_Backstage.gs | 629 |  |
| `_enVentanaCorte_` | función | 06_Limpieza_Duplicados_JSON.gs | 699 |  |
| `_esInicioDeTemporada_` | función | 06_Limpieza_Duplicados_JSON.gs | 736 |  |
| `_estimarCorteDiario_` | función | 06_Limpieza_Duplicados_JSON.gs | 525 |  |
| `_extDeTipo_` | función | 08_GitHub.gs | 968 |  |
| `_extraerArchivosDeMarkdown_` | función | 02_Backstage.gs | 236 |  |
| `_extraerArchivosDeTexto` | función | 02_Backstage.gs | 265 |  |
| `_fmtHoraH_` | función | 06_Limpieza_Duplicados_JSON.gs | 685 |  |
| `_generarIndiceArchivos_` | función | 02_Backstage.gs | 560 |  |
| `_generarMarkdownLegible_` | función | 02_Backstage.gs | 527 |  |
| `_ghEsLimiteDeGithub_` | función | 08_GitHub.gs | 922 |  |
| `_ghJson_` | función | 08_GitHub.gs | 915 |  |
| `_ghJsonReintento_` | función | 08_GitHub.gs | 927 |  |
| `_ghReq_` | función | 08_GitHub.gs | 885 |  |
| `_ghRespuesta_` | función | 08_GitHub.gs | 904 |  |
| `_githubCabezaRemota_` | función | 08_GitHub.gs | 421 |  |
| `_githubCambiosEnCarpeta_` | función | 08_GitHub.gs | 748 | Contexto_Base_Web.md §PF273 |
| `_githubCommitArchivos_` | función | 08_GitHub.gs | 634 | Contexto_Base_Web.md §PF273 |
| `_githubFuncionesDeAccion_` | función | 08_GitHub.gs | 773 |  |
| `_githubGenerarIndice_` | función | 08_GitHub.gs | 513 |  |
| `_githubGenerarLeeme_` | función | 08_GitHub.gs | 582 |  |
| `_githubGuardarUltimoCommit_` | función | 08_GitHub.gs | 782 |  |
| `_githubLeerUltimoCommit_` | función | 08_GitHub.gs | 425 |  |
| `_githubProbar_` | función | 08_GitHub.gs | 790 |  |
| `_githubRevisarPullPendiente_` | función | 08_GitHub.gs | 436 |  |
| `_githubRevisarSecretos_` | función | 08_GitHub.gs | 491 |  |
| `_githubSincronizar_` | función | 08_GitHub.gs | 310 |  |
| `_githubSubirArchivosDeDrive_` | función | 08_GitHub.gs | 809 |  |
| `_githubToken_` | función | 08_GitHub.gs | 880 |  |
| `_githubTraerAProyectoApps_` | función | 08_GitHub.gs | 125 | Contexto_Base_Web.md §PF273 |
| `_githubTraerAProyectoAppsUnaVez_` | función | 08_GitHub.gs | 163 | Contexto_Base_Web.md: pendiente de registrar el comportamiento real al autoreemplazarse |
| `_guardarIndiceArchivos_` | función | 02_Backstage.gs | 545 |  |
| `_horaLimaDecimal_` | función | 06_Limpieza_Duplicados_JSON.gs | 580 |  |
| `_huellaArchivo_` | función | 02_Backstage.gs | 611 |  |
| `_IMGAPI_DIST_BASE_` | global | 11_Imagenes_API.gs | 157 |  |
| `_IMGAPI_DIST_EXTRA_` | global | 11_Imagenes_API.gs | 158 |  |
| `_IMGAPI_LONG_BASE_` | global | 11_Imagenes_API.gs | 155 |  |
| `_IMGAPI_LONG_EXTRA_` | global | 11_Imagenes_API.gs | 156 |  |
| `_IMGAPI_ORDEN_CL_` | global | 11_Imagenes_API.gs | 159 |  |
| `_IMGAPI_TABLA_CRC_` | global | 11_Imagenes_API.gs | 154 |  |
| `_imgApiAConSigno_` | función | 11_Imagenes_API.gs | 977 |  |
| `_imgApiAdler32_` | función | 11_Imagenes_API.gs | 940 |  |
| `_imgApiArchivoMasReciente_` | función | 11_Imagenes_API.gs | 547 |  |
| `_imgApiArchivoTipos_` | función | 11_Imagenes_API.gs | 1113 |  |
| `_imgApiArchivoUrls_` | función | 11_Imagenes_API.gs | 1103 |  |
| `_imgApiAU8_` | función | 11_Imagenes_API.gs | 664 |  |
| `_imgApiCarpetasApiFaltantes_` | función | 11_Imagenes_API.gs | 1006 |  |
| `_imgApiCommit_` | función | 11_Imagenes_API.gs | 1030 |  |
| `_imgApiContexto_` | función | 11_Imagenes_API.gs | 986 |  |
| `_imgApiCrc32_` | función | 11_Imagenes_API.gs | 962 |  |
| `_imgApiDeflateAlmacenado_` | función | 11_Imagenes_API.gs | 927 |  |
| `_imgApiDestinoInsignia_` | función | 11_Imagenes_API.gs | 561 |  |
| `_imgApiEjecutar_` | función | 11_Imagenes_API.gs | 305 |  |
| `_imgApiFiltrarFila_` | función | 11_Imagenes_API.gs | 867 |  |
| `_imgApiFiltrarRecorte_` | función | 11_Imagenes_API.gs | 842 |  |
| `_imgApiGuardarNoDisponibles_` | función | 11_Imagenes_API.gs | 580 |  |
| `_imgApiHuffman_` | función | 11_Imagenes_API.gs | 776 |  |
| `_imgApiInflate_` | función | 11_Imagenes_API.gs | 676 |  |
| `_imgApiJson_` | función | 11_Imagenes_API.gs | 1088 |  |
| `_imgApiLeerNoDisponibles_` | función | 11_Imagenes_API.gs | 568 |  |
| `_imgApiLeeU32_` | función | 11_Imagenes_API.gs | 670 |  |
| `_imgApiNormalizarCabecera_` | función | 11_Imagenes_API.gs | 556 |  |
| `_imgApiQuitarFiltros_` | función | 11_Imagenes_API.gs | 791 |  |
| `_imgApiRecolectarUrls_` | función | 11_Imagenes_API.gs | 436 |  |
| `_imgApiRecortarPng_` | función | 11_Imagenes_API.gs | 597 |  |
| `_imgApiRectanguloVisible_` | función | 11_Imagenes_API.gs | 825 |  |
| `_imgApiReq_` | función | 11_Imagenes_API.gs | 1070 |  |
| `_imgApiTiposInsignias_` | función | 11_Imagenes_API.gs | 502 |  |
| `_imgApiToken_` | función | 11_Imagenes_API.gs | 1065 |  |
| `_imgApiTrozoPng_` | función | 11_Imagenes_API.gs | 951 |  |
| `_imgApiZlib_` | función | 11_Imagenes_API.gs | 899 |  |
| `_leerPeriodo_` | función | 06_Limpieza_Duplicados_JSON.gs | 476 |  |
| `_letraDiaGuerra_` | función | 05_Migrador_Formato.gs | 488 |  |
| `_limpiarCarpeta_` | función | 06_Limpieza_Duplicados_JSON.gs | 146 |  |
| `_mig_borrarEstado_` | función | 05_Migrador_Formato.gs | 522 |  |
| `_mig_borrarTriggersPendientes_` | función | 05_Migrador_Formato.gs | 548 |  |
| `_mig_ejecutarMigracion_` | función | 05_Migrador_Formato.gs | 144 |  |
| `_mig_estaBajoCarpeta_` | función | 05_Migrador_Formato.gs | 353 |  |
| `_mig_estadoInicial_` | función | 05_Migrador_Formato.gs | 509 |  |
| `_mig_etiquetarCarpetaClan` | función | 05_Migrador_Formato.gs | 248 |  |
| `_mig_fechaHoraStr` | función | 05_Migrador_Formato.gs | 466 |  |
| `_mig_finalizar_` | función | 05_Migrador_Formato.gs | 557 |  |
| `_mig_guardarEstado_` | función | 05_Migrador_Formato.gs | 518 |  |
| `_mig_horaLima` | función | 05_Migrador_Formato.gs | 474 |  |
| `_mig_nombrePlayerPorCreacion_` | función | 05_Migrador_Formato.gs | 432 |  |
| `_mig_pausarYContinuar_` | función | 05_Migrador_Formato.gs | 527 |  |
| `_mig_programarContinuacion_` | función | 05_Migrador_Formato.gs | 540 |  |
| `_mig_renombrarSeguro` | función | 05_Migrador_Formato.gs | 449 |  |
| `_mig_soloHora` | función | 05_Migrador_Formato.gs | 470 |  |
| `_mig_tiempoAgotado_` | función | 05_Migrador_Formato.gs | 505 |  |
| `_mig_yaEstaEnCarpeta_` | función | 05_Migrador_Formato.gs | 341 |  |
| `_migrarCarpetaPlayers` | función | 05_Migrador_Formato.gs | 383 |  |
| `_organizarJSON_borrarTriggersPendientes_` | función | 04_Organizador_JSON.gs | 270 |  |
| `_organizarJSON_procesarRaiz_` | función | 04_Organizador_JSON.gs | 182 |  |
| `_organizarJSON_tiempoAgotado_` | función | 04_Organizador_JSON.gs | 231 |  |
| `_pad2_` | función | 05_Migrador_Formato.gs | 494 |  |
| `_primeraMencionNumerica_` | función | 06_Limpieza_Duplicados_JSON.gs | 499 |  |
| `_primerLunesDia_` | función | 06_Limpieza_Duplicados_JSON.gs | 770 |  |
| `_quitarTagExistente_` | función | 06_Limpieza_Duplicados_JSON.gs | 460 | Contexto_Base_Web.md §PF074 |
| `_readmeAplicarBloque_` | función | 09_ReadmeGenerador.gs | 76 |  |
| `_readmeFuncionesManuales_` | función | 09_ReadmeGenerador.gs | 138 |  |
| `_readmeGrupo_` | función | 09_ReadmeGenerador.gs | 165 |  |
| `_registrarLogGenerador` | función | 02_Backstage.gs | 708 |  |
| `_scriptIdDeProyecto_` | función | 08_GitHub.gs | 948 |  |
| `_SEMANA_MEM_` | global | 04_Organizador_JSON.gs | 101 |  |
| `_subirArchivosAProyecto` | función | 02_Backstage.gs | 118 |  |
| `_temporadaDeFecha_` | función | 06_Limpieza_Duplicados_JSON.gs | 802 |  |
| `_textoCorteDiario_` | función | 06_Limpieza_Duplicados_JSON.gs | 752 |  |
| `_verif_comparar_` | función | 10_Verificar_PeriodIndex_JSON.gs | 182 |  |
| `_verif_enVentanaCambio_` | función | 10_Verificar_PeriodIndex_JSON.gs | 273 |  |
| `_verif_esExcepcionFecha_` | función | 10_Verificar_PeriodIndex_JSON.gs | 279 |  |
| `_verif_imprimirResumen_` | función | 10_Verificar_PeriodIndex_JSON.gs | 285 |  |
| `_verif_indiceDiaLima_` | función | 10_Verificar_PeriodIndex_JSON.gs | 267 |  |
| `_verif_periodoDeArchivo_` | función | 10_Verificar_PeriodIndex_JSON.gs | 156 |  |
| `actualizarScriptDeHoja` | función | 02_Backstage.gs | 292 |  |
| `AVISO_ANTI_CARPETAS_` | global | 02_Backstage.gs | 62 |  |
| `CACHE_PERIODOS_NOMBRE_` | global | 07_Cache_Periodos_JSON.gs | 31 |  |
| `CARPETA_BASE_ID` | global | 02_Backstage.gs | 18 |  |
| `CARPETA_GENERADOR_ID` | global | 02_Backstage.gs | 17 |  |
| `CARPETA_JSON_RAIZ_ID_` | global | 04_Organizador_JSON.gs | 28 |  |
| `CARPETA_PLAYERS_ID_` | global | 04_Organizador_JSON.gs | 73 |  |
| `CARPETAS_CLAN_` | global | 04_Organizador_JSON.gs | 38 |  |
| `CARPETAS_CLAN_POR_ENDPOINT_` | global | 04_Organizador_JSON.gs | 55 | Contexto_Base_Web.md §PF074 |
| `CARPETAS_JSON_POR_ENDPOINT_` | global | 04_Organizador_JSON.gs | 83 |  |
| `carpetasApiJuntoAFankit` | función | 11_Imagenes_API.gs | 266 |  |
| `consolidarCodigoDesdeZip` | función | 02_Backstage.gs | 192 |  |
| `CORTE_MIN_FRACCION_` | global | 06_Limpieza_Duplicados_JSON.gs | 88 |  |
| `CORTE_MIN_PARES_` | global | 06_Limpieza_Duplicados_JSON.gs | 85 |  |
| `CREAR_O_ACTUALIZAR_HOJA_SISTEMA` | global | 02_Backstage.gs | 28 |  |
| `crearProyectoVinculado_` | función | 02_Backstage.gs | 381 |  |
| `DATOS_GH_CARPETA_HOJAS_` | global | 12_Datos_Drive_GitHub.gs | 59 |  |
| `DATOS_GH_CARPETA_INDIVIDUAL_` | global | 12_Datos_Drive_GitHub.gs | 61 |  |
| `DATOS_GH_CARPETA_INFORMES_` | global | 12_Datos_Drive_GitHub.gs | 60 |  |
| `DATOS_GH_CARPETA_SEASONS_` | global | 12_Datos_Drive_GitHub.gs | 62 |  |
| `DATOS_GH_CARPETA_TAMPERMONKEY_` | global | 12_Datos_Drive_GitHub.gs | 58 |  |
| `DATOS_GH_FUENTES_` | global | 12_Datos_Drive_GitHub.gs | 64 |  |
| `DATOS_GH_HANDLER_AUTO_` | global | 12_Datos_Drive_GitHub.gs | 89 |  |
| `DATOS_GH_HANDLER_SEGUIR_` | global | 12_Datos_Drive_GitHub.gs | 90 |  |
| `DATOS_GH_LOTE_BYTES_` | global | 12_Datos_Drive_GitHub.gs | 91 |  |
| `DATOS_GH_PREFIJO_ESTADO_` | global | 12_Datos_Drive_GitHub.gs | 88 |  |
| `DATOS_GH_TIEMPO_MAX_MS_` | global | 12_Datos_Drive_GitHub.gs | 92 |  |
| `descargarBase` | función | 01_Principal.gs | 192 |  |
| `descargarBaseForzado` | función | 01_Principal.gs | 202 |  |
| `descargarContactos` | función | 01_Principal.gs | 230 |  |
| `descargarContactosForzado` | función | 01_Principal.gs | 236 |  |
| `descargarGenerador` | función | 01_Principal.gs | 211 |  |
| `descargarGeneradorForzado` | función | 01_Principal.gs | 221 |  |
| `eliminarTodosLosArchivosDeBase` | función | 01_Principal.gs | 258 |  |
| `EVIDENCIA_T05_CARPETA_GITHUB_` | global | 08_GitHub.gs | 83 | Contexto_Base_Web.md §PF080 |
| `EVIDENCIA_T05_NOMBRES_` | global | 08_GitHub.gs | 84 |  |
| `GITHUB_AVISO_SOLO_CARPETA_` | global | 08_GitHub.gs | 73 |  |
| `GITHUB_BORRAR_FORMATOS_ANTIGUOS_` | global | 08_GitHub.gs | 40 |  |
| `GITHUB_BRANCH_` | global | 08_GitHub.gs | 36 |  |
| `GITHUB_ENTRADAS_BLOB_MAX_` | global | 08_GitHub.gs | 59 |  |
| `GITHUB_INTENTOS_TRAER_` | global | 08_GitHub.gs | 79 | Contexto_Base_Web.md §PF273 |
| `GITHUB_OWNER_` | global | 08_GitHub.gs | 34 |  |
| `GITHUB_PATRONES_SECRETOS_` | global | 08_GitHub.gs | 43 |  |
| `GITHUB_PROP_ULTIMO_COMMIT_` | global | 08_GitHub.gs | 68 |  |
| `GITHUB_REGEX_ID_DRIVE_` | global | 08_GitHub.gs | 56 |  |
| `GITHUB_REPO_` | global | 08_GitHub.gs | 35 |  |
| `imagenesApiAGithub` | función | 11_Imagenes_API.gs | 259 |  |
| `imagenesApiCartasAGithub` | función | 11_Imagenes_API.gs | 251 |  |
| `imagenesApiEscanearJsonPlayers` | función | 11_Imagenes_API.gs | 179 |  |
| `imagenesApiInsigniasAGithub` | función | 11_Imagenes_API.gs | 255 |  |
| `imagenesApiProbar` | función | 11_Imagenes_API.gs | 247 |  |
| `imagenesApiReiniciarEscaneoJson` | función | 11_Imagenes_API.gs | 168 |  |
| `imagenesApiReintentarNoDisponibles` | función | 11_Imagenes_API.gs | 288 |  |
| `IMGAPI_ALFA_MIN_` | global | 11_Imagenes_API.gs | 153 |  |
| `IMGAPI_ARCHIVO_404_` | global | 11_Imagenes_API.gs | 118 |  |
| `IMGAPI_ARCHIVO_TIPOS_` | global | 11_Imagenes_API.gs | 104 |  |
| `IMGAPI_ARCHIVO_URLS_` | global | 11_Imagenes_API.gs | 114 |  |
| `IMGAPI_BRANCH_` | global | 11_Imagenes_API.gs | 88 |  |
| `IMGAPI_CATEGORIAS_` | global | 11_Imagenes_API.gs | 121 |  |
| `IMGAPI_CSV_CARTAS_` | global | 11_Imagenes_API.gs | 110 |  |
| `IMGAPI_CSV_INSIGNIAS_` | global | 11_Imagenes_API.gs | 111 |  |
| `IMGAPI_DESTINO_INSIGNIAS_` | global | 11_Imagenes_API.gs | 102 |  |
| `IMGAPI_DESTINO_MAESTRIAS_` | global | 11_Imagenes_API.gs | 101 |  |
| `IMGAPI_DESTINOS_` | global | 11_Imagenes_API.gs | 94 |  |
| `IMGAPI_ESCANEO_MS_` | global | 11_Imagenes_API.gs | 119 |  |
| `IMGAPI_LOTE_` | global | 11_Imagenes_API.gs | 133 |  |
| `IMGAPI_MAX_ARCHIVOS_` | global | 11_Imagenes_API.gs | 130 |  |
| `IMGAPI_MAX_BYTES_` | global | 11_Imagenes_API.gs | 131 |  |
| `IMGAPI_MAX_MS_` | global | 11_Imagenes_API.gs | 132 |  |
| `IMGAPI_PREFIJO_MAESTRIA_` | global | 11_Imagenes_API.gs | 103 |  |
| `IMGAPI_PROP_ESCANEO_` | global | 11_Imagenes_API.gs | 115 |  |
| `IMGAPI_REGEX_INSIGNIA_` | global | 11_Imagenes_API.gs | 108 |  |
| `IMGAPI_REGEX_URL_` | global | 11_Imagenes_API.gs | 92 |  |
| `IMGAPI_REPO_` | global | 11_Imagenes_API.gs | 87 |  |
| `INDICE_ARCHIVOS_RE_HUELLAS_` | global | 02_Backstage.gs | 110 |  |
| `instalarActivadorDatosDriveGithub` | función | 12_Datos_Drive_GitHub.gs | 137 |  |
| `LETRAS_DIA_GUERRA_` | global | 05_Migrador_Formato.gs | 83 |  |
| `limpiarDuplicadosJSON` | función | 06_Limpieza_Duplicados_JSON.gs | 104 |  |
| `LIMPIEZA_DRY_RUN_` | global | 06_Limpieza_Duplicados_JSON.gs | 76 |  |
| `MANIFIESTO_CANONICO_` | global | 02_Backstage.gs | 30 |  |
| `MIG_LIMITE_MS_` | global | 05_Migrador_Formato.gs | 74 |  |
| `MIG_PROP_ESTADO_` | global | 05_Migrador_Formato.gs | 77 |  |
| `MIG_TEMPORADA_ANCLA_` | global | 06_Limpieza_Duplicados_JSON.gs | 91 |  |
| `MIG_TRIGGER_HANDLER_` | global | 05_Migrador_Formato.gs | 80 |  |
| `migrarFormatoJSON` | función | 05_Migrador_Formato.gs | 108 |  |
| `migrarFormatoJSON_reiniciarEstado` | función | 05_Migrador_Formato.gs | 131 |  |
| `NOMBRE_HOJA_BASE` | global | 02_Backstage.gs | 19 |  |
| `nombreBaseDesdeArchivo_` | función | 02_Backstage.gs | 223 |  |
| `obtenerArchivosProyecto_` | función | 02_Backstage.gs | 399 |  |
| `obtenerJSON_viaProxy` | función | 03_RoyaleAPI_Torneos.gs | 17 |  |
| `obtenerSpreadsheetPorNombreEnCarpeta_` | función | 02_Backstage.gs | 693 |  |
| `ORGANIZAR_LIMITE_MS_` | global | 04_Organizador_JSON.gs | 89 |  |
| `ORGANIZAR_PROP_ESTADO_` | global | 04_Organizador_JSON.gs | 92 |  |
| `ORGANIZAR_TRIGGER_HANDLER_` | global | 04_Organizador_JSON.gs | 95 |  |
| `organizarArchivosJSON` | función | 04_Organizador_JSON.gs | 119 |  |
| `PAREO_TOLERANCIA_MS_` | global | 06_Limpieza_Duplicados_JSON.gs | 82 |  |
| `probarConexionGithub` | función | 01_Principal.gs | 249 |  |
| `quitarActivadorDatosDriveGithub` | función | 12_Datos_Drive_GitHub.gs | 145 |  |
| `README_GENERADOR_NOMBRE_` | global | 09_ReadmeGenerador.gs | 25 |  |
| `README_LINEA_INICIO_` | global | 09_ReadmeGenerador.gs | 28 |  |
| `README_MARCA_FIN_` | global | 09_ReadmeGenerador.gs | 27 |  |
| `README_MARCA_INICIO_` | global | 09_ReadmeGenerador.gs | 26 |  |
| `reiniciarCachePeriodosJSON` | función | 07_Cache_Periodos_JSON.gs | 45 |  |
| `revisarDatosDriveAGithubSinSubir` | función | 12_Datos_Drive_GitHub.gs | 111 |  |
| `subirBaseDesdeGithub` | función | 01_Principal.gs | 42 |  |
| `subirBaseDesdeGithubForzado` | función | 01_Principal.gs | 47 |  |
| `subirBaseDesdeGs` | función | 01_Principal.gs | 66 |  |
| `subirBaseDesdeMd` | función | 01_Principal.gs | 73 |  |
| `subirBaseDesdeTxt` | función | 01_Principal.gs | 59 |  |
| `subirBaseDesdeZip` | función | 01_Principal.gs | 52 |  |
| `subirContactosDesdeGithub` | función | 01_Principal.gs | 144 |  |
| `subirContactosDesdeGithubForzado` | función | 01_Principal.gs | 149 |  |
| `subirContactosDesdeGs` | función | 01_Principal.gs | 168 |  |
| `subirContactosDesdeMd` | función | 01_Principal.gs | 175 |  |
| `subirContactosDesdeTxt` | función | 01_Principal.gs | 161 |  |
| `subirContactosDesdeZip` | función | 01_Principal.gs | 154 |  |
| `subirDatosDriveAGithub` | función | 12_Datos_Drive_GitHub.gs | 101 |  |
| `subirDatosDriveAGithubAuto` | función | 12_Datos_Drive_GitHub.gs | 116 |  |
| `subirDatosDriveAGithubContinuar` | función | 12_Datos_Drive_GitHub.gs | 125 |  |
| `subirDatosDriveAGithubForzado` | función | 12_Datos_Drive_GitHub.gs | 106 |  |
| `subirEvidenciaT05AGithub` | función | 08_GitHub.gs | 102 |  |
| `subirGeneradorDesdeGithub` | función | 01_Principal.gs | 93 | Contexto_Base_Web.md: pendiente de registrar el comportamiento real al autoreemplazarse |
| `subirGeneradorDesdeGithubForzado` | función | 01_Principal.gs | 98 |  |
| `subirGeneradorDesdeGs` | función | 01_Principal.gs | 117 |  |
| `subirGeneradorDesdeMd` | función | 01_Principal.gs | 124 |  |
| `subirGeneradorDesdeTxt` | función | 01_Principal.gs | 110 |  |
| `subirGeneradorDesdeZip` | función | 01_Principal.gs | 103 |  |
| `tryAlternativeProxy` | función | 03_RoyaleAPI_Torneos.gs | 41 |  |
| `VALLA_MD_` | global | 02_Backstage.gs | 22 |  |
| `VERIF_CAMBIO_DESDE_H_` | global | 10_Verificar_PeriodIndex_JSON.gs | 47 |  |
| `VERIF_CAMBIO_HASTA_H_` | global | 10_Verificar_PeriodIndex_JSON.gs | 50 |  |
| `VERIF_EXCEPCIONES_FECHA_` | global | 10_Verificar_PeriodIndex_JSON.gs | 64 | Contexto_Base_Web.md §PF080 |
| `VERIF_LIMA_OFFSET_H_` | global | 10_Verificar_PeriodIndex_JSON.gs | 44 |  |
| `VERIF_MAX_LINEAS_LOG_` | global | 10_Verificar_PeriodIndex_JSON.gs | 67 |  |
| `VERIF_REGEX_TAG_` | global | 10_Verificar_PeriodIndex_JSON.gs | 53 |  |
| `verificarPeriodIndexJSON` | función | 10_Verificar_PeriodIndex_JSON.gs | 84 |  |
