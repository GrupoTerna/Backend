# Cómo editar `Contexto_Base_Web.md` sin fallar (receta)

> Detalle movido el 27-oct-2026 desde `Claude/SKILL.md` §0.4, que dice cuándo leerlo.

- **Cómo editar el contexto sin fallar (receta).** El archivo pesa más de 2 MB y una herramienta de reemplazo exacto falla si el texto buscado no coincide por completo (tildes, comillas, un salto de línea): la edición se pierde sin dejar rastro y el archivo queda como estaba. Pasos:
  1. Ubicar el lugar con `grep -n "PFnnn" Contexto_Base_Web.md` y leer esas líneas con `sed -n`, **sin escribir de memoria** el texto a reemplazar.
  2. Editar con un script de Python que busque con `s.index(...)` un fragmento corto y único y compruebe con `assert` que aparece **una sola vez**; para agregar un punto a una sección PF, insertarlo justo después del punto anterior.
  3. Correr `Consolidados de cambios/verificar_contexto.py` (debe decir «OK»).
  4. Recién entonces hacer el commit.
  - Si el `assert` falla, se vuelve a ubicar el texto en vez de insistir con otra variante.
  - La fila de «Abiertos» que ya se resolvió se **quita** (no se deja tachada) y su resultado va como punto de la sección PF.
