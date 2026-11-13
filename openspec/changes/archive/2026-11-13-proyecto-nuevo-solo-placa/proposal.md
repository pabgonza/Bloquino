# Proposal

## Why

El proyecto nuevo de la página de alumno parte con el LED y la resistencia de
ejemplo que Velxio pone en el pin 13. En la prueba del 2026-11-13 esa
resistencia quedó dibujada encima de la placa, y el alumno los tiene que borrar
antes de armar lo de la sesión. Pablo decidió que el proyecto nuevo parta solo
con la placa (era una decisión abierta de `docs/bloquino-prueba-con-el-kit.md`).

## What Changes

- Sin proyecto guardado (primera vez, «Nuevo» o un guardado ilegible), la página
  de alumno queda con el Arduino UNO y el programa de parpadeo, sin otros
  componentes ni cables. El parpadeo se ve en el LED de la placa.
- Velxio encuadraba el lienzo solo si había componentes: la placa sola quedaba
  en la esquina superior izquierda, y al agregar el primer componente la vista
  saltaba. Ahora encuadra al montar el lienzo aunque esté solo la placa, y no
  al pasar de 0 a 1 componente (abrir un archivo vuelve a montar el lienzo, así
  que sigue encuadrando).
- Capturas que mostraban el proyecto nuevo: `docs/guia-de-la-clase/img/nuevo.jpg`
  y la slide de la sesión 2 del curso (`bq-nuevo.jpg`).
- La decisión queda en `docs/decisiones.md` del proyecto.

## Capabilities

### Modified Capabilities
- `interfaz/distribucion`: el proyecto nuevo tiene solo la placa.

## Impact

- `frontend/src/bloquino/proyecto.ts` (`restaurar`) y su test;
  `SimulatorCanvas.tsx` (cuándo encuadra, con comentario `Bloquino:`).
