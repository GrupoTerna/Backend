# Continuidad entre sesiones: documentar, buscar y contrastar antes de suponer

> Detalle movido el 27-oct-2026 desde `Claude/SKILL.md` §9, que dice cuándo leerlo.

*No debe perderse información entre una conversación y la siguiente:*

- Como el trabajo avanza entre sesiones y el chat se borra antes de empezar una nueva, nada se debe perder de un chat a otro.
- Si la usuaria explica el comportamiento de algo o da alguna confirmación, eso se documenta de inmediato en el lugar que corresponda: el plan de fases vigente, el código del repo o, si es funcionamiento del sistema o una decisión que sirva para prevenir errores, `Contexto_Base_Web.md` (0.4). No debe quedar solo dicho en el chat.
- **Buscar lo ya escrito antes de preguntar o suponer, y cruzar todas las fuentes antes de decir «no es concluyente»** (reglas 13 y 14 de `Consolidados de cambios/Reglas_Consolidados.md`; la lista de palabras de guerra para buscar y el mapa de fuentes están ahí y en `Contexto_Base_Web.md §PF239`). Vale para cualquier tema, no solo guerra: lo documentado y validado se usa y se cita, no se vuelve a preguntar.
- **Contrastar con los datos disponibles antes de suponer o ignorar (regla de la usuaria, 23-oct-2026).** Ante una hipótesis o una duda sobre el funcionamiento del juego o de los datos, primero se busca y se contrasta con los archivos que ya hay (`Datos descargados/` del repo `Backend`: JSON, CSV; y Drive si el conector está disponible); no se supone ni se descarta sin mirar. Si los datos necesarios están en Drive y Claude no puede verlos, le dice a la usuaria que los descargue de Drive y los suba a GitHub, y no continúa sobre una suposición.
