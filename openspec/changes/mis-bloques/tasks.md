# Tasks

## 1. Bloques y paleta

- [x] 1.1 Probar en Blockly 13.4 `setDragStrategy` para que arrastrar un `ab_entrada` fijo del sombrero cree y arrastre una copia (Zelos). Verifica: prueba a mano en `/editor?alumno`; si falla, anotar en `design.md` y usar el respaldo (entradas en la paleta).
- [x] 1.2 `blocks/catalogo/misBloques.ts`: `ab_definir`, `ab_mi_bloque` y `ab_entrada` con `extraState` y forma armada desde las partes; textos en `i18n/locales/es/bloques.json`. Verifica: test que crea, guarda y vuelve a cargar los tres (JSON del área de trabajo).
- [x] 1.3 Categoría «Mis bloques» (`#FF6680`, entre Variables y Avanzado) con callback `MIS_BLOQUES`: botón «Crear un bloque» y un uso por definición. Verifica: test de la paleta con 0 y 2 definiciones.
- [x] 1.4 `disableOrphans`: lo que cuelga de `ab_definir` no está suelto; un uso suelto sí. Verifica: test con un bloque en una definición y un uso suelto.

## 2. Diálogo, edición y borrado

- [x] 2.1 `blocks/misBloques/Dialogo.tsx`: nombre, filas de entradas y rótulos (renombrar, quitar), botones de agregar número, texto, sí/no y rótulo, vista previa de Blockly, validación (vacío, repetido, entradas repetidas). Al aceptar, la definición aparece a la vista. Verifica: test de la validación y recorrido con mouse.
- [x] 2.2 «Editar» en el menú de la definición y de los usos: abre el diálogo con lo actual y, en un grupo de eventos, actualiza definición, usos y entradas por `id` (conserva lo encajado). Verifica: test de agregar y renombrar una entrada con usos; Ctrl+Z deshace todo.
- [x] 2.3 Borrar una definición con usos: se repone y avisa con `Blockly.dialog.alert`; sin usos se borra y sale de la paleta. Verifica: test con y sin usos.
- [x] 2.4 Recursión: los usos que cierran un ciclo quedan deshabilitados con aviso. Verifica: test directo e indirecto (A usa B, B usa A).

## 3. Generación

- [x] 3.1 Modo clásico: definiciones como funciones (`float`/`String`/`bool`), usos como llamadas, `ab_entrada` dentro (parámetro) y fuera (0, `""`, `false`), nombres limpios y sin choques (`setup`, `tone`, variables). Las definiciones no cuentan como scripts ni para el tope de 8. Verifica: tests en `bloques-mis-bloques.test.ts` con el código esperado y un programa de referencia en `__tests__/fixtures/bloques/`.
- [x] 3.2 Modo corrutinas: expansión en el lugar con comentario, entradas en `static` del script, pila de expansión para entradas y prefijo de contadores. Verifica: tests de dos scripts con el mismo bloque y de `repetir` dentro de `repetir`.
- [x] 3.3 `lcd()` y `display()` aceptan como raíz una definición usada. Verifica: test con `escribir en pantalla` dentro de un bloque propio.
- [x] 3.4 Compilación y comportamiento en el AVR emulado (clásico y corrutinas: parpadear 3 veces, dos ritmos a la vez). Verifica: `RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-mis-bloques`.

## 4. Ejemplo, recorrido y cierre

- [x] 4.1 Ejemplo `14-mis-bloques.bloquino` (LED RGB con `color (r) (g) (b)` y `parpadear (veces)`), armado en la página; fila en `docs/bloquino-ejemplos.md` y captura con `scripts/recorrido/ejemplos.js`. Verifica: `npx vitest run src/__tests__/bloquino-ejemplos.test.ts`.
- [x] 4.2 Recorrido `scripts/recorrido/mis-bloques.js` con mouse real: crear con el diálogo, arrastrar entradas, usar, editar, deshacer, borrar con y sin usos, recursión, simular, recargar. Verifica: todos los pasos dan lo esperado; línea en `scripts/recorrido/README.md`.
- [x] 4.3 Cierre: tipos (`npx tsc … | grep bloquino/`), `npx vitest run src/__tests__/bloquino- src/__tests__/bloques-`, recorridos `bloques`, `variables`, `s9` y `grupo`, ítem en `docs/bloquino-prueba-con-el-kit.md`, decisión al final de `../docs/decisiones.md` y `.\scripts\sala.ps1 --build`.

## Workflow follow-up

- Archivar con `node <memoria>/sync-specs.mjs . mis-bloques` y `openspec validate --specs --strict`.
- Decidir con Pablo si la sesión 9 de `Curso_Arduino` pasa a usar `color (r) (g) (b)`.
