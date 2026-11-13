# Proposal

## Why

Una espera larga no se puede cortar. En la prueba de Pablo, un bloque propio
`latido (segundos)` espera `segundos` entre cada parpadeo y otro programa sube
`espera` con un botón; el programa principal pasa a la alarma cuando
`espera > 3`. El botón responde al tiro, pero la alarma tarda hasta terminar
la vuelta del latido: 7,7 s en la simulación. Scratch se comporta igual. Se
evaluaron tres salidas (esperar de a poco con los bloques de hoy, «detener
otros programas» de Scratch y un bloque de espera con condición) y Pablo eligió
la tercera, tras ver un prototipo que reaccionó en ~0,4 s.

## What Changes

- Bloque nuevo en Control, debajo de `esperar hasta que`:
  **`esperar [n] segundos o hasta que <condición>`**. Termina cuando pasan los
  segundos o cuando se cumple la condición, lo que ocurra primero.
- Con varios programas cede el turno mientras espera, como `esperar`.
- Los sketches que no lo usan no cambian.
- Un ejemplo nuevo con el programa de Pablo (latido, botón y alarma) y su
  prueba con mouse real.

Diferencia con Scratch: no tiene este bloque (solo `esperar` y `esperar hasta
que`). Se acepta: es la forma más simple de que un programa reaccione en medio
de una espera, y sirve en otros proyectos del curso («espera 10 s o hasta que
aprieten el botón»).

Fuera: `detener otros programas` y mensajes entre programas.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `bloques/catalogo-base`: «Bloques de control» suma el bloque nuevo.
- `bloques/scripts-paralelos`: «Cesión de turno» lo incluye entre los bloques
  que ceden el turno.

## Impact

- `frontend/src/blocks/catalogo/control.ts`, `generador/bloques.ts` e
  `i18n/locales/es/bloques.json` (hay un prototipo sin commit).
- Tests del generador y de compilación; ejemplo en `frontend/public/ejemplos/`
  (lo exige `bloquino-ejemplos.test.ts`); `scripts/recorrido/ejemplos.js`.
