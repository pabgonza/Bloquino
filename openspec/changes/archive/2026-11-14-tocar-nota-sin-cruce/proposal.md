# Proposal

## Why

En la placa real, una nota que sigue a otra a veces suena rara. En la prueba
de Pablo con el saludo de la rockola (do 0,2 s, mi 0,2 s, sol 0,4 s), el sol
sonaba mal y, puesto primero, bien; una espera de 0,05 s entre el mi y el sol
lo arregló. `tocar nota` genera `tone(pin, nota, ms)` y una espera de `ms`: la
nota anterior se apaga sola desde la interrupción del Timer2 casi en el mismo
instante en que el programa llama al `tone()` siguiente, y ese cruce deja el
temporizador mal configurado para la nota nueva. El simulador no tiene el
cruce y suena bien.

## What Changes

- `tocar nota [nota] por [n] segundos en pin [p]` genera
  `tone(p, nota);`, la espera de `n` segundos y `noTone(p);`. La nota la apaga
  el programa antes de seguir, sin silencio audible entre notas.
- Los ejemplos que usan el bloque traen su sketch regenerado.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `bloques/catalogo-base`: «Bloques de sonido» cambia el código generado de
  `tocar nota`.

## Impact

- `frontend/src/blocks/generador/bloques.ts`; tests del generador y fixtures.
- `frontend/public/ejemplos/*.bloquino` que usan `tocar nota`.
- C++ de «Ver el código» del curso (`Curso_Arduino`, `slides/assets/codigo.js`),
  regenerado con `herramientas/bloques`.
