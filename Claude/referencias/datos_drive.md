# Datos más recientes: cuándo y cómo se busca en Drive

> Detalle movido el 27-oct-2026 desde `Claude/SKILL.md` §0.5, que dice cuándo leerlo.

- **Si el archivo de datos más reciente no está en GitHub, o la copia de `Datos descargados/` es más vieja, se busca en Drive** (regla dictada por la usuaria el 18-oct-2026). Por ejemplo, para `Backup_Guerra.csv` o `Correcciones_Guerra.csv`:
  1. Buscar el archivo con el conector de Google Drive.
  2. Comparar su fecha de modificación y su tamaño con la copia del repo **antes** de trabajar con la copia vieja.
  3. Si el conector no está habilitado, pedirle a la usuaria que lo habilite y no seguir sin el dato.
  4. Si el archivo es grande (el CSV de guerra pasa de 1,9 MB), no cabe: el conector entrega el contenido al chat, no al contenedor donde corren los scripts. Claude lo dice y le pide a la usuaria que suba el archivo al chat o que reemplace el de `Datos descargados/`. *(Se deduce de cómo trabaja el conector; la descarga no se probó.)*
  5. Lo leído de Drive se trata como lo de `Datos descargados/`: si trae teléfonos o celulares, no se copia y se avisa de inmediato; y no se copia a los repos (públicos) por iniciativa propia.
