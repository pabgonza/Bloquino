# Design

Este diseño cubre la fase 1 (inventario). La fase 2 (limpieza) se diseña con el inventario aprobado; entonces se quita `skip_specs` y se escriben sus deltas.

## Context

Ver proposal.md, Why. Decisión vigente (2026-11-16): lo «Sale» se borra solo como archivos o carpetas enteras, lo «Futuro» queda oculto. La página compilada (`frontend/dist`) pesa 99 MB.

## Goals / Non-Goals

**Goals**
- Una fila por grupo de piezas con datos medidos, no estimados: tamaño en el repo, tamaño en la página compilada, quién lo usa y de qué depende.
- Una clase propuesta (Usa, Futuro, Sale) con su motivo, para que Pablo decida.
- Para lo «Futuro»: si hoy funciona dentro de Bloquino y qué le falta para entrar a la paleta.

**Non-Goals**
- Borrar, mover u ocultar nada.
- Decidir por Pablo: la columna «Destino» queda para él.

## Decisions

### 1. Grupos, no archivos
El inventario agrupa por función (simulación eléctrica, ESP32, galería de ejemplos…), porque la fase 2 borra por grupo. Cada grupo lista sus carpetas y archivos principales.

### 2. «Quién lo usa» se mide con el grafo de imports
Un script de una sola vez (en el scratchpad, no en el repo) recorre los imports desde `frontend/src/main.tsx` y separa:
- **Alcanzable desde lo de Bloquino**: lo que importan `frontend/src/blocks/` y `frontend/src/bloquino/`, directa o indirectamente.
- **Alcanzable solo desde Velxio**: entra a la página, pero por rutas o paneles que el alumno no ve.
- **No alcanzable**: no entra a la página (tests, scripts, extensión de VS Code).

Los archivos de `frontend/public/` no tienen imports: se buscan por nombre en el código.

### 3. Tamaño en la página
Se mide sobre `frontend/dist` (lo que copia la imagen de la sala y empaqueta h10): carpetas de `public/` copiadas tal cual y chunks de `dist/assets/`. Un chunk se atribuye a un grupo por los módulos que trae, según el mapa de fuentes de una compilación de prueba (`vite build --sourcemap` en una carpeta de salida temporal, que no toca `frontend/dist`).

### 4. Backend y raíz
Rutas de `backend/app/main.py`: cuáles llama la página (búsqueda de `/api/...` en `frontend/src`) y cuáles quedan expuestas sin uso. Raíz, `docker/`, `test/`, `.github/`, `docs/`: por revisión directa.

### 5. Prueba de lo «Futuro» en modo profe
Para cada pieza «Futuro» con componente visible (fuente de poder, baterías, generador de señales, voltímetro, amperímetro, osciloscopio, Nano, Mega, ESP32) se arma en `/editor?profe` un circuito mínimo y se anota si funciona, con una captura. Se hace con Playwright sobre el servidor de desarrollo.

### 6. Formato del documento
`docs/inventario-velxio.md`: resumen con totales por clase, tabla de grupos (Grupo, Qué es, Repo MB, Página MB, Lo usa, Depende de, Clase propuesta, Motivo, Destino) y una sección por grupo «Futuro» con el resultado de la prueba y qué falta.

## Risks / Trade-offs

- [El grafo de imports por expresiones regulares no ve imports dinámicos armados con variables] → se buscan además `import(` y nombres de archivo en el código; lo dudoso se marca.
- [Una pieza «Sale» puede estar referida desde un archivo grande de Velxio] → se anota en «Depende de» y la fase 2 quita solo el import.
- [La prueba en modo profe depende del backend de desarrollo] → si no está arriba, se marca «sin probar», no se adivina.
