# Proposal

## Why

Para probar la interfaz módulo por módulo, y para documentar, hacen falta proyectos listos que usen cada componente y cada bloque. Hoy solo existen los programas de referencia de los tests, sin circuito. Pablo pidió además que los circuitos queden con los cables ordenados: enredados cuesta seguir el camino.

## What Changes

- **Doce ejemplos** `.bloquino` en `frontend/public/ejemplos/`, uno por tema, que se abren con «Abrir». Entre todos usan cada bloque de la paleta y cada componente del kit.
- **Cables ordenados**: sin cruces ni cables montados, con un color por señal.
- **Test** que abre cada ejemplo, comprueba que sus bloques generan su sketch, que compila, la cobertura de bloques y componentes y el orden de los cables.
- **Guion con mouse real** que simula cada ejemplo y repite lo que haría el alumno.
- **Documento** `docs/bloquino-ejemplos.md` con la tabla de ejemplos y una captura de cada uno.

## Capabilities

### New Capabilities
- `proyecto/ejemplos`: conjunto de proyectos de ejemplo y cómo se mantienen al día.

## Impact

- `frontend/public/ejemplos/` (queda servida por la imagen de la sala en `/ejemplos/`), `docs/ejemplos/` (capturas, 1,1 MB).
- `frontend/src/__tests__/bloquino-ejemplos.test.ts`, `scripts/recorrido/ejemplos.js`.
- Sin cambios en la página: no hay menú de ejemplos.
