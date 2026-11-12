# Proposal

## Why

Un clic sobre un componente no lo dejaba seleccionado: el mismo clic llegaba al fondo del lienzo, que le quitaba la selección. Por eso Supr y R no hacían nada y un componente solo se podía eliminar desde su ficha. Pablo pidió que se borre con clic y Supr.

Al corregirlo quedaba a la mano seleccionar a la vez un componente y un cable, y que Supr borrara los dos.

## What Changes

- Un clic sobre un componente lo deja seleccionado: Supr lo elimina y R lo gira.
- El lienzo tiene seleccionado un componente o un cable, nunca los dos: Supr borra una sola cosa.
- Guion `scripts/recorrido/seleccion.js`, con mouse real.
- Decisiones de Pablo que cierran las abiertas de `docs/bloquino-prueba-con-el-kit.md`: «fijar pin» se queda, la ficha sigue abriéndose con clic derecho, y el curso adopta el botón y el DHT11 como están en Bloquino.

## Capabilities

### Modified Capabilities
- `interfaz/modo-alumno`: selección en el lienzo.

## Impact

- `components/simulator/SimulatorCanvas.tsx` (tres toques marcados `Bloquino:`).
- `scripts/recorrido/seleccion.js` y su README; `docs/bloquino-prueba-con-el-kit.md`.
- Las slides de las sesiones 4 y 8 viven en otro repositorio (`Curso_Arduino`) y se cambian allá.
