# Tasks

## 1. Datos

- [x] 1.1 Tamaños en el repo por grupo (archivos versionados) y en la página compilada (`frontend/dist` y chunks atribuidos con un mapa de fuentes de prueba). Verificar: la suma de los grupos cuadra con el total de `frontend/dist` (99 MB) y del repo, con la diferencia anotada.
- [x] 1.2 Grafo de imports desde `frontend/src/main.tsx`: alcanzable desde Bloquino, solo desde Velxio o no alcanzable; archivos de `public/` buscados por nombre. Verificar: `frontend/src/blocks/` y `frontend/src/bloquino/` salen como alcanzables y `vscode-extension/` como no alcanzable.
- [x] 1.3 Backend y raíz: rutas que llama la página y rutas expuestas sin uso; `docker/`, `test/`, `.github/`, `docs/` y archivos sueltos de la raíz. Verificar: cada `include_router` de `backend/app/main.py` aparece en el inventario con su uso.

## 2. Prueba de lo «Futuro»

- [x] 2.1 En `/editor?profe`, circuito mínimo con fuente de poder, baterías, generador de señales, voltímetro, amperímetro y osciloscopio; anotar si funcionan, con captura. Verificar: cada pieza tiene «funciona», «funciona a medias» o «no funciona» con su captura en `docs/inventario-velxio/`.
- [x] 2.2 Placas Nano, Mega y ESP32 en modo profe: aparecen, compilan y simulan un parpadeo. Verificar: resultado y captura por placa.

## 3. Documento

- [x] 3.1 `docs/inventario-velxio.md` con resumen, tabla de grupos (clase propuesta, motivo y columna «Destino» vacía para Pablo) y una sección por grupo «Futuro». Verificar: todo grupo de la tabla de la propuesta aparece, y ninguna carpeta de primer nivel del repo queda sin grupo.

## Workflow follow-up

- Pablo completa la columna «Destino».
- Con el inventario aprobado: `/opsx:update inventario-velxio` para la fase 2 (quitar `skip_specs`, specs, diseño y tareas de la limpieza).
