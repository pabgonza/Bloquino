# Tasks

Entorno: frontend con `npx vite` desde `frontend/` (http://localhost:5173/editor). Tests: `npx vitest run <archivo>` desde `frontend/`.

## 1. Guardado automático

- [x] 1.1 `bloquino/proyecto.ts`: guardar en `localStorage` 1 s después del último cambio y al salir de la página; estados guardado / guardando / error. Test vitest: un cambio se guarda tras la espera, `pagehide` guarda lo pendiente, un cambio que no altera el proyecto no guarda y `setItem` bloqueado da estado de error sin lanzar.
- [x] 1.2 Restaurar al abrir y asegurar `bloques.json` (programa de parpadeo exportado desde `blocks/archivo.ts`). Test vitest: guardar, cambiar el estado y restaurar deja el proyecto guardado (incluido el modo Texto); datos corruptos o inválidos dejan el proyecto inicial sin lanzar.
- [x] 1.3 `PaginaAlumno`: restaurar, arrancar el guardado y mostrar el indicador. Verificar en el navegador: agregar un LED, recargar y verlo; el indicador pasa por "Guardando…" y "Guardado"; en modo profe no se guarda ni se restaura. Medir el tamaño del proyecto guardado.
  - Verificado a 1366 × 768: agregar un servo pasa por "Guardando…" y "Guardado"; mover un componente y recargar de inmediato lo conserva; el modo Texto y el código escrito a mano vuelven tras recargar.
  - No se probó recargar con la simulación corriendo; el formato del proyecto no guarda ese estado, así que siempre vuelve detenida.
  - Modo profe: abre el espacio de Velxio, no el proyecto del alumno, y lo guardado no cambia; al volver a `?alumno` el proyecto sigue igual.
  - Tamaño: el proyecto inicial con un servo pesa unos 3 KB (el límite de `localStorage` ronda los 5 MB). No se midió con un proyecto de la sesión 10.
  - Al abrir la página el proyecto inicial se guarda una vez sin que el alumno haga nada: Velxio recalcula las posiciones de los cables al montar el lienzo.
  - El almacenamiento bloqueado se probó solo en vitest, no en un navegador en modo privado.

## 2. Archivo de proyecto

- [x] 2.1 Abrir `.bloquino` / `.vlx`: rechazo de archivos inválidos y de placas que no son UNO con mensajes en español, y modo Texto para proyectos sin bloques. Test vitest de los cuatro casos y de que el proyecto en curso queda intacto al rechazar.
- [x] 2.2 Descargar `.bloquino` con nombre elegido y recordado. Test vitest: lo descargado vuelve a abrirse igual y lo acepta `parseVlxFile` de Velxio.
- [x] 2.3 Proyecto nuevo: confirmación, borrar lo guardado y recargar. Test vitest: tras descartar, `pagehide` no vuelve a guardar.
- [x] 2.4 Botones Nuevo, Abrir y Descargar en la barra. Verificar en el navegador a 1366 × 768: ida y vuelta de un proyecto, cancelar las confirmaciones, archivo inválido y Nuevo.
  - Verificado: Descargar propone "mi-proyecto", genera `semaforo.bloquino` y recuerda el nombre; abrirlo tras cambiar el proyecto lo deja igual y pasa a ser el guardado; cancelar no cambia nada; un archivo cualquiera y un `.vlx` de ESP32 muestran su mensaje y no cambian nada; Nuevo cancelado no cambia nada y aceptado deja el UNO con el parpadeo.
  - La descarga se interceptó en la página (nombre y contenido del archivo); no se comprobó el archivo en la carpeta de descargas ni el selector de archivos del sistema.
  - La barra cabe a 1366 px: los botones principales terminan en el píxel 1354.

## 3. Cierre

- [x] 3.1 `openspec validate h4-autosave --strict`, tests de bloques y de la interfaz en verde.
